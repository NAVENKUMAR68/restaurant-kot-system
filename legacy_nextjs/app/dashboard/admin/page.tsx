'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Users as UsersIcon, ChefHat } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

export default function AdminOverview() {
    const { socket } = useSocket();
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        activeOrders: 0,
        pendingOrders: 0,
    });

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('new-order', () => fetchStats());
        socket.on('order-status-updated', () => fetchStats());
        return () => {
            socket.off('new-order');
            socket.off('order-status-updated');
        };
    }, [socket]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/orders'); // Fetch all for admin
            const orders = await res.json();

            const totalRevenue = orders.reduce((acc: number, order: any) =>
                order.status !== 'cancelled' ? acc + order.totalPrice : acc, 0
            );

            const active = orders.filter((o: any) =>
                !['completed', 'cancelled'].includes(o.status)
            ).length;

            const pending = orders.filter((o: any) => o.status === 'pending').length;

            setStats({
                totalOrders: orders.length,
                totalRevenue,
                activeOrders: active,
                pendingOrders: pending
            });
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-slate-500">Lifetime revenue</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">Total Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.totalOrders}</div>
                        <p className="text-xs text-slate-500">All time orders</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">Active Orders</CardTitle>
                        <ChefHat className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.activeOrders}</div>
                        <p className="text-xs text-slate-500">Currently in kitchen</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">Pending Actions</CardTitle>
                        <UsersIcon className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.pendingOrders}</div>
                        <p className="text-xs text-slate-500">Orders waiting acceptance</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
