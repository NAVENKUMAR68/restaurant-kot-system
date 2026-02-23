'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Order {
    _id: string;
    customerId: string;
    items: { name: string; quantity: number }[];
    status: string;
    totalPrice: number;
    createdAt: string;
}

export default function AdminOrders() {
    const { socket } = useSocket();
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('new-order', (o: Order) => setOrders(prev => [o, ...prev]));
        socket.on('order-status-updated', (updated: Order) => {
            setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
        });
        return () => {
            socket.off('new-order');
            socket.off('order-status-updated');
        };
    }, [socket]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders'); // Admin gets all
            const data = await res.json();
            setOrders(data);
        } catch (error) {
            toast.error("Failed to fetch orders");
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error();
            toast.success("Order updated");
        } catch (e) {
            toast.error("Update failed");
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Order Management</h2>
            <div className="rounded-md border border-slate-800">
                <Table>
                    <TableHeader className="bg-slate-900">
                        <TableRow className="border-slate-800 hover:bg-slate-900">
                            <TableHead className="text-slate-400">Order ID</TableHead>
                            <TableHead className="text-slate-400">Date</TableHead>
                            <TableHead className="text-slate-400">Items</TableHead>
                            <TableHead className="text-slate-400">Total</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order._id} className="border-slate-800 hover:bg-slate-900/50">
                                <TableCell className="font-mono text-slate-300">
                                    {order._id.slice(-6)}
                                </TableCell>
                                <TableCell className="text-slate-300">
                                    {new Date(order.createdAt).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-slate-300">
                                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                </TableCell>
                                <TableCell className="text-slate-300">
                                    ${order.totalPrice.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="border-slate-700 text-slate-300 capitalize">
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="destructive" onClick={() => updateStatus(order._id, 'cancelled')}>Cancel</Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
