import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['kitchen', 'admin'].includes(session.user.role)) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { status } = await req.json();
        const { id } = params;

        await connectDB();

        const updateData: any = { status };
        if (status === 'accepted') {
            updateData.acceptedAt = new Date();
        } else if (status === 'completed') {
            updateData.completedAt = new Date();
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedOrder) {
            return NextResponse.json(
                { message: 'Order not found' },
                { status: 404 }
            );
        }

        // Emit socket event
        const io = (global as any).io;
        if (io) {
            io.emit('order-status-updated', updatedOrder);
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to update order' },
            { status: 500 }
        );
    }
}
