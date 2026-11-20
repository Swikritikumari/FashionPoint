import mongoose from 'mongoose';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import { errorHandler } from '../utils/error.js';
import { getProductSizes } from '../utils/productSizes.js';

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    res.status(200).json(orders.map((order) => ({
      ...order,
      status: order.status || 'placed',
      paymentStatus: order.paymentStatus || 'pending',
      items: (order.items || []).map((item) => ({ ...item, status: item.status || 'placed' }))
    })));
  } catch (error) {
    next(error);
  }
};

export const cancelMyOrderItem = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, userId: req.user.id });
    if (!order) return next(errorHandler(404, 'Order not found'));

    const item = order.items.id(req.params.itemId);
    if (!item) return next(errorHandler(404, 'Ordered product not found'));
    if (item.status === 'cancelled') {
      return res.status(200).json({ orderId: order._id, itemId: item._id, itemStatus: item.status, status: order.status });
    }
    if (order.status !== 'placed') {
      return next(errorHandler(400, 'This order can no longer be cancelled'));
    }
    if (order.paymentStatus === 'paid') {
      return next(errorHandler(400, 'Paid orders cannot be cancelled here'));
    }

    item.status = 'cancelled';
    if (order.items.every((orderItem) => orderItem.status === 'cancelled')) {
      order.status = 'cancelled';
    }
    await order.save();
    res.status(200).json({ orderId: order._id, itemId: item._id, itemStatus: item.status, status: order.status });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { productId, shipping } = req.body;
    const selectedSize = String(req.body.size || '').trim().toUpperCase();
    const allowedPaymentMethods = ['cash_on_delivery', 'upi', 'pay_later'];
    const allowedUpiPlatforms = ['phonepe', 'google_pay', 'paytm', 'bhim', 'amazon_pay', 'other'];
    const paymentMethod = req.body.paymentMethod || 'cash_on_delivery';
    const upiPlatform = req.body.upiPlatform;
    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return next(errorHandler(400, 'Please select a valid payment method'));
    }
    if (paymentMethod === 'upi' && !allowedUpiPlatforms.includes(upiPlatform)) {
      return next(errorHandler(400, 'Please select a UPI app'));
    }
    if (!mongoose.isValidObjectId(productId)) return next(errorHandler(400, 'A valid product is required'));
    const requiredFields = ['fullName', 'phone', 'address', 'city', 'state', 'postalCode'];
    if (!shipping || requiredFields.some((field) => !String(shipping[field] || '').trim())) {
      return next(errorHandler(400, 'Please complete all delivery details'));
    }
    const phone = String(shipping.phone).trim();
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      return next(errorHandler(400, 'Enter a valid phone number with country code'));
    }
    const product = await Product.findById(productId).populate('categoryId', 'name');
    if (!product) return next(errorHandler(404, 'Product not found'));
    const availableSizes = getProductSizes(product);
    if (availableSizes.length && !availableSizes.includes(selectedSize)) {
      return next(errorHandler(400, 'Please select a valid size for this product'));
    }

    const unitPrice = Number(product.offer ? product.discountPrice : product.regularPrice);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) return next(errorHandler(400, 'Product price is invalid'));
    const orderFields = {
      userId: req.user.id,
      items: [{ productId: product._id, name: product.name, imageUrl: product.imageUrls?.[0] || '', size: selectedSize, quantity: 1, unitPrice }],
      total: unitPrice,
      paymentMethod,
      ...(paymentMethod === 'upi' ? { upiPlatform } : {}),
      paymentStatus: 'pending',
      shipping: Object.fromEntries(requiredFields.map((field) => [field, String(field === 'phone' ? phone : shipping[field]).trim()]))
    };

    const order = await Order.create(orderFields);
    res.status(201).json({ orderId: order._id, total: order.total, status: order.status, paymentMethod: order.paymentMethod, upiPlatform: order.upiPlatform, paymentStatus: order.paymentStatus });
  } catch (error) {
    next(error);
  }
};
