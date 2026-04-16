import express from 'express';
import { createOrder, getOrders, getMyOrders, updateOrderStatus, cancelOrder, payByCustomer } from '../controllers/orderController';

const router = express.Router();

router.post('/', createOrder);
router.post('/pay-bill', payByCustomer);
router.get('/', getOrders);
router.get('/mine', getMyOrders);
router.patch('/:id/status', updateOrderStatus);
router.delete('/:id', cancelOrder);

export default router;

