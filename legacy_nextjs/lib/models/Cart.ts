import mongoose, { Schema, model, models } from 'mongoose';

const CartSchema = new Schema(
    {
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // One active cart per user usually
        },
        items: [
            {
                menuItemId: {
                    type: Schema.Types.ObjectId,
                    ref: 'MenuItem',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
            },
        ],
        total: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Cart = models.Cart || model('Cart', CartSchema);

export default Cart;
