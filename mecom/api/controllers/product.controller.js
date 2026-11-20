import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import { errorHandler } from "../utils/error.js";
import { getProductSizes } from '../utils/productSizes.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

export const uploadProductImage = async (req, res, next) => {
    try {
        if (!req.user.isAdmin) return next(errorHandler(403, 'Only admins can upload product images'));

        const match = String(req.body.imageData || '').match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/);
        if (!match) return next(errorHandler(400, 'Upload a JPEG, PNG, or WebP image'));

        const [, mimeType, encodedImage] = match;
        const imageBuffer = Buffer.from(encodedImage, 'base64');
        if (!imageBuffer.length || imageBuffer.length > 2 * 1024 * 1024) {
            return next(errorHandler(413, 'Image must be smaller than 2 MB'));
        }

        const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
        const fileName = `${randomUUID()}.${extensions[mimeType]}`;
        const uploadDirectory = path.join(process.cwd(), 'client', 'uploads');
        await mkdir(uploadDirectory, { recursive: true });
        await writeFile(path.join(uploadDirectory, fileName), imageBuffer, { flag: 'wx' });

        res.status(201).json({ url: `/uploads/${fileName}` });
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(errorHandler(403, 'You are not allowed to create a product'));
    }
    try {
        const category = await Category.findById(req.body.categoryId).select('name');
        const newProduct = new Product({
            ...req.body,
            sizes: getProductSizes({ ...req.body, categoryId: category }),
            userId: req.user.id
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);

    } catch (error) {
        next(error)
    }
};

export const getAllProducts = async (req, res, next) => {
    try {
        const getProducts = await Product.find().populate('categoryId', 'name');
        res.status(200).json(getProducts.map((product) => ({ ...product.toObject(), ratings: undefined, sizes: getProductSizes(product) })));
    } catch (error) {
        next(error)
    }
};

export const deleteProduct = async (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(errorHandler(403, 'You are not allowed to delete this product'))
    }
    const product = await Product.findById(req.params.productId);
    if (!product) {
        return next(errorHandler(404, 'Product not found'))
    }
    try {
        await Product.findByIdAndDelete(req.params.productId);
        res.status(200).json('The product has been deleted!')
    } catch (error) {
        next(error)
    }
};

export const editProduct = async (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(errorHandler(403, 'You are not allowed to delete this product'))
    }
    const product = await Product.findById(req.params.productId);
    if (!product) {
        return next(errorHandler(404, 'Product not found'))
    }
    try {
        const category = await Category.findById(req.body.categoryId || product.categoryId).select('name');
        const updatedProduct = await Product.findByIdAndUpdate(req.params.productId, {
            ...req.body,
            sizes: getProductSizes({ ...product.toObject(), ...req.body, sizes: [], categoryId: category }),
        }, { new: true });
        res.status(200).json(updatedProduct)
    } catch (error) {
        next(error)
    }
};

export const getProduct = async (req, res, next) => {
    try {
        const getProduct = await Product.findById(req.params.productId).populate('categoryId', 'name');
        if (!getProduct) return next(errorHandler(404, 'Product not found'));
        const productData = getProduct.toObject();
        const ratings = productData.ratings || [];
        res.status(200).json({
            ...productData,
            ratings: undefined,
            ratingAverage: ratings.length ? ratings.reduce((total, rating) => total + rating.value, 0) / ratings.length : 0,
            ratingCount: ratings.length,
            userRating: req.user ? ratings.find((rating) => String(rating.userId) === String(req.user.id))?.value || 0 : 0,
            sizes: getProductSizes(getProduct)
        });
    } catch (error) {
        next(error)
    }
    
};

export const rateProduct = async (req, res, next) => {
    const value = Number(req.body.rating);
    if (!Number.isInteger(value) || value < 1 || value > 5) {
        return next(errorHandler(400, 'Rating must be a whole number from 1 to 5'));
    }
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) return next(errorHandler(404, 'Product not found'));
        const existingRating = product.ratings.find((rating) => String(rating.userId) === String(req.user.id));
        if (existingRating) existingRating.value = value;
        else product.ratings.push({ userId: req.user.id, value });
        await product.save();
        const ratings = product.ratings;
        res.status(200).json({
            userRating: value,
            ratingCount: ratings.length,
            ratingAverage: ratings.reduce((total, rating) => total + rating.value, 0) / ratings.length
        });
    } catch (error) {
        next(error);
    }
};

export const getProductsByCategory = async (req, res, next) => {
    try {
        const categoryId = req.params.categoryId;

        const category = await Category.findById(categoryId);
        if (!category) {
            return next(errorHandler(404,'Category not found' ));
        }
        
        const products = await Product.find({ categoryId: categoryId }).select('name description regularPrice discountPrice offer trending imageUrls sizes categoryId');

        res.status(200).json({ category, products: products.map((product) => ({ ...product.toObject(), sizes: getProductSizes({ ...product.toObject(), categoryId: category }) })) });
    } catch (error) {
        next(error);
    }
};
