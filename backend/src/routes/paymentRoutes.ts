import express, { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Order } from '../models/Order';
import { io } from '../index';

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * POST /api/payment/create-order
 * Creates a Razorpay order — frontend opens the payment modal using this
 */
router.post('/create-order', async (req: Request, res: Response) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects paise (1 INR = 100 paise)
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.status(200).json({
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key_id: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error: any) {
        console.error('Razorpay create-order error:', error);
        res.status(500).json({ message: 'Failed to create payment order', error: error.message });
    }
});

/**
 * POST /api/payment/verify
 * Verifies Razorpay payment signature and then creates the restaurant order
 * This is the critical security step — prevents fake payment confirmations
 */
router.post('/verify', async (req: Request, res: Response) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            // Restaurant order data
            customer,
            items,
            totalAmount,
            tableNumber,
        } = req.body;

        // --- Signature Verification ---
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Payment verification failed — invalid signature' });
        }

        // --- Create Restaurant Order (only after verified payment) ---
        const newOrder = new Order({
            customer,
            items,
            totalAmount,
            tableNumber: tableNumber || 1,
            paymentMethod: 'online',
            paymentId: razorpay_payment_id,
            status: 'pending',
        });

        const savedOrder = await newOrder.save();
        io.emit('new-order', savedOrder);

        res.status(201).json({
            success: true,
            order: savedOrder,
            paymentId: razorpay_payment_id,
        });
    } catch (error: any) {
        console.error('Payment verify error:', error);
        res.status(500).json({ message: 'Payment verification error', error: error.message });
    }
});

export default router;
