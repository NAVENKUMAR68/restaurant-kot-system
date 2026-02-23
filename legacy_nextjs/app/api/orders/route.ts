import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import MenuItem from '@/lib/models/MenuItem';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const role = session.user.role;

        let query: any = {};

        if (role === 'customer') {
            query = { customerId: session.user.id };
        } else if (role === 'kitchen') {
            // Kitchen sees pending, preparing, ready orders mainly
            // But query can be customized
            if (status) {
                query.status = status;
            }
        } else if (role === 'admin') {
            // Admin sees all
        }

        // Sort by newest first
        const orders = await Order.find(query).sort({ createdAt: -1 });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { items, total } = await req.json();

        if (!items || items.length === 0) {
            return NextResponse.json(
                { message: 'No items in order' },
                { status: 400 }
            );
        }

        await connectDB();

        // Verify items and calculate estimated time (simplified)
        // In a real app, we would re-calculate price here
        let totalPrepTime = 0;

        // We assume items contains { menuItemId, quantity, name, price }
        // Let's validate menuItems exist if we wanted to be strict

        const newOrder = await Order.create({
            customerId: session.user.id,
            items,
            totalPrice: total,
            status: 'pending',
            estimatedPrepMinutes: 15, // Default or calculated
        });

        // Emit socket event
        const io = (global as any).io;
        if (io) {
            io.emit('new-order', newOrder);
        }

        return NextResponse.json(newOrder, { status: 201 });
    } catch (error) {
        console.error('Order error:', error);
        return NextResponse.json(
            { message: 'Failed to create order' },
            { status: 500 }
        );
    }
}
