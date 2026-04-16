import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { MenuItem } from '../models/MenuItem';
import { User } from '../models/User';
import { cacheGet, cacheSet, cacheInvalidate, CACHE_KEYS } from '../lib/cache';

export const getMenuItems = async (req: Request, res: Response) => {
    try {
        const cached = cacheGet(CACHE_KEYS.MENU);
        if (cached) return res.status(200).json(cached);

        const items = await MenuItem.find();
        cacheSet(CACHE_KEYS.MENU, items);
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu', error });
    }
};

export const createMenuItem = async (req: Request, res: Response) => {
    try {
        const newItem = new MenuItem(req.body);
        await newItem.save();
        cacheInvalidate(CACHE_KEYS.MENU);
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: 'Error creating menu item', error });
    }
};

export const updateMenuItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedItem = await MenuItem.findByIdAndUpdate(id, req.body, { new: true });
        cacheInvalidate(CACHE_KEYS.MENU);
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Error updating menu item', error });
    }
};

export const seedMenu = async (req: Request, res: Response) => {
    try {
        // Seed Menu Items
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

        for (const item of menuItems) {
            await MenuItem.findOneAndUpdate({ name: item.name }, item, { new: true, upsert: true });
        }

        // Seed Users
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
            }
        ];

        for (const userData of users) {
            const existingUser = await User.findOne({ email: userData.email });
            if (!existingUser) {
                const hashedPassword = await bcrypt.hash(userData.password, 12);
                await User.create({ ...userData, password: hashedPassword });
            }
        }

        cacheInvalidate(CACHE_KEYS.MENU);
        res.status(200).json({ message: 'Menu and Users seeded successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error seeding database', error });
    }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await MenuItem.findByIdAndDelete(id);
        cacheInvalidate(CACHE_KEYS.MENU);
        res.status(200).json({ message: 'Menu item deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting menu item', error });
    }
};
