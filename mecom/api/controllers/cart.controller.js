import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import { errorHandler } from '../utils/error.js';
import { getProductSizes } from '../utils/productSizes.js';

export const addToCart = async (req, res, next) => {
    const { productId, quantity } = req.body;
    try {
        const product = await Product.findById(productId).populate('categoryId', 'name');
        if (!product) {
            return next(errorHandler(404, 'Product not found!'));
        }
        const availableSizes = getProductSizes(product);
        const size = String(req.body.size || '').trim().toUpperCase();
        if (availableSizes.length && !availableSizes.includes(size)) {
            return next(errorHandler(400, 'Please select a valid size for this product'));
        }

        // Check user already has this product in the cart
        const userId = req.user.id;
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, cartItems: [] });
        }

        const itemIndex = cart.cartItems.findIndex((item) => item.productId.toString() === productId && (item.size || '') === size);
        if (itemIndex > -1) {
            cart.cartItems[itemIndex].quantity += quantity;
        } else {
            // Product does not exist in cart, add new item
            cart.cartItems.push({ productId, quantity, size });
        }
        
        await cart.save();
        res.status(200).json(cart);

    } catch (error) {
        next(error)
    }
};

export const getCartItems = async (req, res, next) => {
    try {
        const {userId} = req.params;

        if (req.user.id !== req.params.userId) {
            return next(errorHandler(403, 'You are not allowed to see cart!'))
        }
        
        const cart = await Cart.findOne({ userId }).populate({
            path: 'cartItems.productId',
            populate: { path: 'categoryId', select: 'name' }
        });

        if (!cart) {
            return res.status(200).json([]);
        }

        res.status(200).json(cart.cartItems.map((item) => ({
            ...item.toObject(),
            productId: item.productId ? { ...item.productId.toObject(), sizes: getProductSizes(item.productId) } : null
        })))

    } catch (error) {
        next(error)
    }
};

export const deleteCartItem = async (req, res, next) => {
    try {

        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return next(errorHandler(404, 'Cart not found!'));
        }

        const itemIndex = cart.cartItems.findIndex(item => item._id.toString() === req.params.cartItemId);
        if (itemIndex === -1) {
            return next(errorHandler(404, 'Item not found in cart!'));
        }

        // syntax: splice(startIndex, deleteCount);  This is used in array to remove, replacing, adding element
        cart.cartItems.splice(itemIndex, 1);  

        await cart.save();
        res.status(200).json('Item Deleted from cart!');

    } catch (error) {
        next(error)
    }
};

export const updateQuantity = async (req, res, next) => {
    try {

        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return next(errorHandler(404, 'Cart not found!'));
        }

        const cartItem = cart.cartItems.find(item => item._id.toString() === req.params.cartItemId);
        if (!cartItem) {
            return next(errorHandler(404, 'Cart item not found!'));
        }

        cartItem.quantity = req.body.quantity;
        await cart.save();

        res.status(200).json('Quantity updated successfully');

      } catch (error) {
        next(error);
      }
}

export const updateCartItemSize = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id }).populate({
            path: 'cartItems.productId',
            populate: { path: 'categoryId', select: 'name' }
        });
        if (!cart) return next(errorHandler(404, 'Cart not found!'));

        const cartItem = cart.cartItems.find((item) => item._id.toString() === req.params.cartItemId);
        if (!cartItem) return next(errorHandler(404, 'Cart item not found!'));

        const availableSizes = getProductSizes(cartItem.productId);
        const size = String(req.body.size || '').trim().toUpperCase();
        if (!availableSizes.length || !availableSizes.includes(size)) {
            return next(errorHandler(400, 'Please select a valid size for this product'));
        }

        cartItem.size = size;
        await cart.save();
        res.status(200).json({ cartItemId: cartItem._id, size: cartItem.size });
    } catch (error) {
        next(error);
    }
};
