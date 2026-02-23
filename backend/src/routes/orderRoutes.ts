import express from 'express';
import { createOrder, getOrders, getMyOrders, updateOrderStatus, payByCustomer } from '../controllers/orderController';

const router = express.Router();

router.post('/', createOrder);
router.post('/pay-bill', payByCustomer);
router.get('/', getOrders);
router.get('/mine', getMyOrders);
router.put('/:id', updateOrderStatus);

export default router;

