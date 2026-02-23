import mongoose, { Schema, model, models } from 'mongoose';

const OrderSchema = new Schema(
    {
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [
            {
                menuItemId: {
                    type: Schema.Types.ObjectId,
                    ref: 'MenuItem',
                    required: true,
                },
                name: String,
                price: Number,
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
            },
        ],
        status: {
            type: String,
            enum: [
                'pending',
                'accepted',
                'preparing',
                'ready',
                'completed',
                'cancelled',
            ],
            default: 'pending',
        },
        estimatedPrepMinutes: {
            type: Number,
            default: 0,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        acceptedAt: Date,
        completedAt: Date,
        timeoutAt: Date,
    },
    {
        timestamps: true,
    }
);

const Order = models.Order || model('Order', OrderSchema);

export default Order;
