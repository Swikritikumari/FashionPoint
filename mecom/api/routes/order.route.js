import express from 'express';
import { cancelMyOrderItem, createOrder, getMyOrders } from '../controllers/order.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();
router.post('/', verifyToken, createOrder);
router.get('/mine', verifyToken, getMyOrders);
router.patch('/:orderId/items/:itemId/cancel', verifyToken, cancelMyOrderItem);
export default router;
