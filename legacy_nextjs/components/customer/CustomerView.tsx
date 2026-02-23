'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Clock } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from '@/components/ui/sheet';

interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
}

interface CartItem extends MenuItem {
    quantity: number;
}

interface Order {
    _id: string;
    items: { name: string; quantity: number; price: number }[];
    status: string;
    totalPrice: number;
    createdAt: string;
}

export default function CustomerView() {
    const { data: session } = useSession();
    const { socket } = useSocket();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [isOrdering, setIsOrdering] = useState(false);

    useEffect(() => {
        fetchMenu();
        fetchOrders();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('order-status-updated', (updatedOrder: Order) => {
            // Check if this order belongs to current user (API/Socket should filter, but here checking client side for demo)
            // Actually 'order-status-updated' typically broadcasts to everyone or room
            // For this demo, let's refresh orders if we see an update
            // Optimization: Check ID
            setActiveOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
            toast.info(`Order status updated: ${updatedOrder.status}`);
        });

        return () => {
            socket.off('order-status-updated');
        };
    }, [socket]);

    const fetchMenu = async () => {
        try {
            const res = await fetch('/api/menu');
            const data = await res.json();
            setMenuItems(data);
        } catch (error) {
            toast.error('Failed to load menu');
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            setActiveOrders(data);
        } catch (error) {
            console.error(error);
        }
    };

    const addToCart = (item: MenuItem) => {
        setCart((prev) => {
            const existing = prev.find((i) => i._id === item._id);
            if (existing) {
                return prev.map((i) =>
                    i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
        toast.success('Added to cart');
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i._id !== itemId));
    }

    const placeOrder = async () => {
        if (cart.length === 0) return;
        setIsOrdering(true);

        try {
            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const items = cart.map(i => ({
                menuItemId: i._id,
                name: i.name,
                price: i.price,
                quantity: i.quantity
            }));

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items, total }),
            });

            if (!res.ok) throw new Error('Order failed');

            const order = await res.json();
            setCart([]);
            setActiveOrders((prev) => [order, ...prev]);
            toast.success('Order placed successfully');
        } catch (error) {
            toast.error('Failed to place order');
        } finally {
            setIsOrdering(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'accepted': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            case 'preparing': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
            case 'ready': return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 'completed': return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Menu</h2>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button className="relative bg-blue-600 hover:bg-blue-700">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Cart
                            {cart.length > 0 && (
                                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center text-white">
                                    {cart.reduce((a, b) => a + b.quantity, 0)}
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="bg-slate-900 border-slate-800 text-white">
                        <SheetHeader>
                            <SheetTitle className="text-white">Your Cart</SheetTitle>
                            <SheetDescription className="text-slate-400">
                                Review your items before ordering
                            </SheetDescription>
                        </SheetHeader>
                        <div className="mt-8 flex-1 overflow-auto">
                            {cart.length === 0 ? (
                                <p className="text-slate-500 text-center">Cart is empty</p>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item._id} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-slate-400">${item.price} x {item.quantity}</p>
                                            </div>
                                            <Button variant="destructive" size="sm" onClick={() => removeFromCart(item._id)}>Remove</Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <SheetFooter className="mt-8">
                            <div className="w-full space-y-4">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <Button onClick={placeOrder} disabled={cart.length === 0 || isOrdering} className="w-full bg-green-600 hover:bg-green-700">
                                    {isOrdering ? 'Placing Order...' : 'Place Order'}
                                </Button>
                            </div>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((item) => (
                    <Card key={item._id} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden hover:border-slate-700 transition-all">
                        <div className="h-48 bg-slate-800 relative">
                            {/* Image placeholder */}
                            <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-800">
                                <span className="text-xs">Image: {item.image}</span>
                            </div>
                        </div>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-white">{item.name}</CardTitle>
                                    <p className="text-sm text-slate-400 mt-1">{item.category}</p>
                                </div>
                                <span className="text-lg font-bold text-green-400">${item.price}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-400 text-sm line-clamp-2">{item.description}</p>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => addToCart(item)} className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">
                                Add to Cart
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold text-white mb-6">Active Orders</h2>
                <div className="grid gap-4">
                    {activeOrders.map(order => (
                        <Card key={order._id} className="bg-slate-900/30 border-slate-800">
                            <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-slate-800">
                                        <Clock className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Order #{order._id.slice(-6)}</p>
                                        <p className="text-sm text-slate-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                <div className="flex-1 px-4">
                                    <div className="flex flex-wrap gap-2">
                                        {order.items.map((i, idx) => (
                                            <Badge key={idx} variant="outline" className="border-slate-700 text-slate-300">
                                                {i.quantity}x {i.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-white">${order.totalPrice.toFixed(2)}</span>
                                    <Badge className={`px-3 py-1 border ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {activeOrders.length === 0 && (
                        <p className="text-slate-500">No active orders</p>
                    )}
                </div>
            </div>
        </div>
    );
}
