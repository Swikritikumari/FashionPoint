import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import { errorHandler } from "../utils/error.js";

export const test = (req, res) => {
    res.json({message: 'Api is working'})
};

export const deleteUser = async (req, res, next) => {
    if ( req.user.id !== req.params.userId && !res.user.isAdmin) {
        return next(errorHandler(401, 'You are not allowed to delete this account'));
    }
    try {
        await User.findByIdAndDelete(req.params.userId);
        res.clearCookie('access_token').status(200).json('User has been deleted');
    } catch (error) {
        next(error)
    }
}

export const getWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist');
        if (!user) return next(errorHandler(404, 'User not found'));
        res.status(200).json(user.wishlist.filter(Boolean));
    } catch (error) {
        next(error);
    }
};

export const toggleWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;
        if (!productId) return next(errorHandler(400, 'Product is required'));

        const product = await Product.findById(productId);
        if (!product) return next(errorHandler(404, 'Product not found'));

        const user = await User.findById(req.user.id);
        if (!user) return next(errorHandler(404, 'User not found'));
        const existingIndex = user.wishlist.findIndex((id) => id.toString() === productId);
        const isWishlisted = existingIndex === -1;
        if (isWishlisted) user.wishlist.push(product._id);
        else user.wishlist.splice(existingIndex, 1);
        await user.save();
        res.status(200).json({ isWishlisted });
    } catch (error) {
        next(error);
    }
};

export const getShippingAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('shippingAddress');
        if (!user) return next(errorHandler(404, 'User not found'));
        res.status(200).json(user.shippingAddress || {});
    } catch (error) {
        next(error);
    }
};

export const saveShippingAddress = async (req, res, next) => {
    try {
        const fields = ['fullName', 'phone', 'address', 'city', 'state', 'postalCode'];
        const shippingAddress = Object.fromEntries(fields.filter((field) => field !== 'phone').map((field) => [field, String(req.body[field] || '').trim()]));
        const phoneNumber = String(req.body.phoneNumber || '').replace(/\D/g, '');
        if (fields.filter((field) => field !== 'phone').some((field) => !shippingAddress[field])) {
            return next(errorHandler(400, 'Please complete all address fields'));
        }
        if (!/^\d{10}$/.test(phoneNumber)) {
            return next(errorHandler(400, 'Enter exactly 10 digits for your phone number'));
        }
        shippingAddress.phone = `+91${phoneNumber}`;

        const user = await User.findById(req.user.id);
        if (!user) return next(errorHandler(404, 'User not found'));
        user.shippingAddress = shippingAddress;
        await user.save();
        res.status(200).json(user.shippingAddress);
    } catch (error) {
        next(error);
    }
};
