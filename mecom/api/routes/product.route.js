import express from 'express';
import { createProduct, getAllProducts, deleteProduct, editProduct, getProduct, getProductsByCategory, uploadProductImage, rateProduct } from '../controllers/product.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const optionalToken = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) return next();
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (!err) req.user = user;
        next();
    });
};

router.post('/create', verifyToken, createProduct);
router.post('/upload-image', verifyToken, uploadProductImage);
router.get('/getProducts', getAllProducts);
router.post('/:productId/rating', verifyToken, rateProduct);
router.delete('/deleteProduct/:userId/:productId', verifyToken, deleteProduct);
router.put('/editProduct/:userId/:productId', verifyToken, editProduct )
router.get('/:productId', optionalToken, getProduct);
router.get('/productByCategory/:categoryId', getProductsByCategory);

export default router;
