import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User';
import { MenuItem } from './models/MenuItem';

dotenv.config();

const menuItems = [
    {
        name: 'Paneer Butter Masala',
        description: 'Rich and creamy curry with cottage cheese',
        price: 250,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=300&auto=format&fit=crop'
    },
    {
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice cooked with tender chicken',
        price: 350,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=300&auto=format&fit=crop'
    },
    {
        name: 'Veg Spring Rolls',
        description: 'Crispy rolls filled with fresh vegetables',
        price: 180,
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1544025162-d7669d5fa212?q=80&w=300&auto=format&fit=crop'
    },
    {
        name: 'Chocolate Brownie',
        description: 'Fudgy brownie with walnuts',
        price: 150,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=300&auto=format&fit=crop'
    }
];

const users = [
    {
        name: 'Admin User',
        email: 'admin@smartkot.com',
        password: 'password123',
        role: 'admin'
    },
    {
        name: 'Kitchen Staff',
        email: 'kitchen@smartkot.com',
        password: 'password123',
        role: 'kitchen'
    },
    {
        name: 'Customer Demo',
        email: 'customer@smartkot.com',
        password: 'password123',
        role: 'customer'
    }
];

const seedDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-kot';
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for seeding');

        // Clear existing users? Maybe check if they exist first.
        // For now, let's just check if admin exists.

        for (const userData of users) {
            const existingUser = await User.findOne({ email: userData.email });
            if (!existingUser) {
                const hashedPassword = await bcrypt.hash(userData.password, 12);
                await User.create({ ...userData, password: hashedPassword });
                console.log(`Created user: ${userData.email} (${userData.role})`);
            } else {
                console.log(`User already exists: ${userData.email}`);
            }
        }

        // Seed Menu Items
        for (const itemData of menuItems) {
            const existingItem = await MenuItem.findOne({ name: itemData.name });
            if (!existingItem) {
                await MenuItem.create(itemData);
                console.log(`Created menu item: ${itemData.name}`);
            } else {
                console.log(`Menu item already exists: ${itemData.name}`);
            }
        }

        console.log('Seeding complete');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedDB();
