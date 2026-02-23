'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'sonner';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Clock, ChefHat, Bell } from 'lucide-react';

interface Order {
    _id: string;
    items: { name: string; quantity: number }[];
    status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    totalPrice: number;
    createdAt: string;
    updatedAt: string;
}

export default function KitchenView() {
    const { socket } = useSocket();
    const [orders, setOrders] = useState<Order[]>([]);
    const [audioEnabled, setAudioEnabled] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('new-order', (order: Order) => {
            setOrders(prev => [order, ...prev]);
            toast.info(`New Order! #${order._id.slice(-4)}`);
            playNotificationSound();
        });

        socket.on('order-status-updated', (updatedOrder: Order) => {
            setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
        });

        return () => {
            socket.off('new-order');
            socket.off('order-status-updated');
        };
    }, [socket, audioEnabled]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders?status=active'); // We might want all active orders
            const data = await res.json();
            // Filter out completed/cancelled if desired, or keep them to show history
            const active = data.filter((o: Order) => !['completed', 'cancelled'].includes(o.status));
            setOrders(active);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        }
    };

    const updateStatus = async (orderId: string, status: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) throw new Error('Failed to update status');

            toast.success(`Order marked as ${status}`);
        } catch (error) {
            toast.error('Error updating status');
        }
    };

    const playNotificationSound = () => {
        if (!audioEnabled) return;
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
            gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    const filteredOrders = (status: string) => orders.filter(o => o.status === status);

    const OrderCard = ({ order }: { order: Order }) => (
        <Card className="bg-slate-900 border-slate-800 mb-4 animate-in fade-in zoom-in duration-300">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-white flex items-center gap-2">
                            <span className="text-blue-400">#{order._id.slice(-4)}</span>
                            <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                                {new Date(order.createdAt).toLocaleTimeString()}
                            </Badge>
                        </CardTitle>
                    </div>
                    <Badge className={
                        order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            order.status === 'preparing' ? 'bg-purple-500/20 text-purple-400' :
                                order.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                                    'bg-slate-700'
                    }>
                        {order.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                            <span className="text-slate-300">{item.name}</span>
                            <span className="font-bold text-white">x{item.quantity}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2">
                {order.status === 'pending' && (
                    <Button size="sm" onClick={() => updateStatus(order._id, 'accepted')} className="bg-blue-600 hover:bg-blue-700">
                        Accept
                    </Button>
                )}
                {order.status === 'accepted' && (
                    <Button size="sm" onClick={() => updateStatus(order._id, 'preparing')} className="bg-purple-600 hover:bg-purple-700">
                        Start Prep
                    </Button>
                )}
                {order.status === 'preparing' && (
                    <Button size="sm" onClick={() => updateStatus(order._id, 'ready')} className="bg-orange-600 hover:bg-orange-700">
                        Ready
                    </Button>
                )}
                {order.status === 'ready' && (
                    <Button size="sm" onClick={() => updateStatus(order._id, 'completed')} className="bg-green-600 hover:bg-green-700">
                        Complete
                    </Button>
                )}
            </CardFooter>
        </Card>
    );

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                    <ChefHat className="h-8 w-8 text-orange-500" />
                    Kitchen Display
                </h2>
                <Button
                    variant={audioEnabled ? "default" : "outline"}
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className="gap-2"
                >
                    <Bell className={audioEnabled ? "fill-white" : ""} />
                    {audioEnabled ? "Sound On" : "Enable Sound"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
                {/* Pending & Accepted Column */}
                <div className="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-800 p-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        Incoming / Accepted
                        <Badge className="ml-auto bg-slate-800 text-slate-300">{filteredOrders('pending').length + filteredOrders('accepted').length}</Badge>
                    </h3>
                    <ScrollArea className="flex-1 pr-4">
                        {filteredOrders('pending').map(order => <OrderCard key={order._id} order={order} />)}
                        {filteredOrders('accepted').map(order => <OrderCard key={order._id} order={order} />)}
                    </ScrollArea>
                </div>

                {/* Preparing Column */}
                <div className="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-800 p-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <ChefHat className="h-4 w-4 text-purple-500" />
                        Preparing
                        <Badge className="ml-auto bg-slate-800 text-slate-300">{filteredOrders('preparing').length}</Badge>
                    </h3>
                    <ScrollArea className="flex-1 pr-4">
                        {filteredOrders('preparing').map(order => <OrderCard key={order._id} order={order} />)}
                    </ScrollArea>
                </div>

                {/* Ready Column */}
                <div className="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-800 p-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Ready to Serve
                        <Badge className="ml-auto bg-slate-800 text-slate-300">{filteredOrders('ready').length}</Badge>
                    </h3>
                    <ScrollArea className="flex-1 pr-4">
                        {filteredOrders('ready').map(order => <OrderCard key={order._id} order={order} />)}
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
