import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { io } from '../index';

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { items, totalAmount, customer, tableNumber, paymentMethod } = req.body;

        const newOrder = new Order({
            customer,
            items,
            totalAmount,
            tableNumber: tableNumber || 1,
            paymentMethod: paymentMethod || 'pending',
            status: 'pending'
        });

        const savedOrder = await newOrder.save();
        io.emit('new-order', savedOrder);
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error });
    }
};

export const getOrders = async (req: Request, res: Response) => {
    try {
        const { status, customerId } = req.query;
        const filter: any = {};

        if (status) {
            const statuses = (status as string).split(',');
            filter.status = statuses.length > 1 ? { $in: statuses } : statuses[0];
        }
        if (customerId) filter.customer = customerId;

        const orders = await Order.find(filter).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};

export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const customerId = req.query.customerId as string;
        if (!customerId) return res.status(400).json({ message: 'customerId required' });
        const orders = await Order.find({ customer: customerId }).sort({ createdAt: -1 }).limit(20);
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your orders', error });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, paymentMethod } = req.body;

        const updateData: any = { updatedAt: new Date() };
        if (status) updateData.status = status;
        if (paymentMethod) updateData.paymentMethod = paymentMethod;

        const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        io.emit('order-status-updated', updatedOrder);
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error updating order', error });
    }
};

export const payByCustomer = async (req: Request, res: Response) => {
    try {
        const { customerId, paymentMethod, paymentId } = req.body;
        if (!customerId) return res.status(400).json({ message: 'customerId required' });

        const updateData: any = {
            paymentMethod: paymentMethod || 'cash',
            updatedAt: new Date()
        };
        if (paymentId) updateData.paymentId = paymentId;

        // Update all orders for this customer that are currently 'pending' payment
        const result = await Order.updateMany(
            { customer: customerId, paymentMethod: 'pending' },
            { $set: updateData }
        );

        // Fetch the updated orders to emit status updates if needed
        const updatedOrders = await Order.find({ customer: customerId, paymentId: updateData.paymentId });
        updatedOrders.forEach(order => {
            io.emit('order-status-updated', order);
        });

        res.status(200).json({ message: 'Bill paid successfully', count: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ message: 'Error paying bill', error });
    }
};
