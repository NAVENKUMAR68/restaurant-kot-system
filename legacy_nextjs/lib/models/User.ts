import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            select: false, // Don't return password by default
        },
        role: {
            type: String,
            enum: ['admin', 'kitchen', 'customer'],
            default: 'customer',
        },
    },
    {
        timestamps: true,
    }
);

const User = models.User || model('User', UserSchema);

export default User;
