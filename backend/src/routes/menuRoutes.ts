import express from 'express';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuController';

const router = express.Router();

// Public route to view menu
router.get('/', getMenuItems);

// Protected routes (TODO: Add middleware for Admin only)
router.post('/', createMenuItem);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);

export default router;
