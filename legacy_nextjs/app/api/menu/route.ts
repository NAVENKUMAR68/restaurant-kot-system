import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MenuItem from '@/lib/models/MenuItem';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        await connectDB();
        const items = await MenuItem.find({ isDeleted: false });
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to fetch menu items' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        await connectDB();

        const newItem = await MenuItem.create(body);
        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to create menu item' },
            { status: 500 }
        );
    }
}
