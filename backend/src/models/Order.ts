import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
    customer: { type: String, required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    tableNumber: { type: Number, default: 1 },
    paymentMethod: {
        type: String,
        enum: ['cash', 'online', 'pending'],
        default: 'pending'
    },
    paymentId: { type: String, default: null }, // Razorpay payment ID
    status: {
        type: String,
        enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Order = mongoose.model('Order', orderSchema);
