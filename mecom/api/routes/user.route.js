import express from 'express';
import { test, deleteUser, getWishlist, toggleWishlist, getShippingAddress, saveShippingAddress } from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/test', test);
router.delete('/deleteUser/:userId', verifyToken, deleteUser);
router.get('/wishlist', verifyToken, getWishlist);
router.post('/wishlist', verifyToken, toggleWishlist);
router.get('/address', verifyToken, getShippingAddress);
router.put('/address', verifyToken, saveShippingAddress);

export default router;
