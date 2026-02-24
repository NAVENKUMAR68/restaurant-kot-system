import { Request, Response } from 'express';
import { MenuItem } from '../models/MenuItem';

export const getMenuItems = async (req: Request, res: Response) => {
    try {
        const items = await MenuItem.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu', error });
    }
};

export const createMenuItem = async (req: Request, res: Response) => {
    try {
        const newItem = new MenuItem(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: 'Error creating menu item', error });
    }
};

export const updateMenuItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedItem = await MenuItem.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Error updating menu item', error });
    }
};

export const seedMenu = async (req: Request, res: Response) => {
    try {
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
            await MenuItem.findOneAndUpdate({ name: item.name }, item, { upsocert: true, new: true, upsert: true });
        }
        res.status(200).json({ message: 'Menu seeded successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error seeding menu', error });
    }
};
