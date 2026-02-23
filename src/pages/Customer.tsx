import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { ShoppingCart, Plus, Minus, Loader2, Search, UtensilsCrossed, CreditCard, Banknote, X, CheckCircle2, ClipboardList, Clock, ChefHat, PackageCheck, AlertCircle, Info } from 'lucide-react';
import { socket } from '@/utils/socket';

// Razorpay window type declaration
declare global {
    interface Window {
        Razorpay: any;
    }
}

/** Dynamically loads the Razorpay checkout script */
const loadRazorpayScript = (): Promise<boolean> =>
    new Promise((resolve) => {
        if (typeof window.Razorpay !== 'undefined') {
            resolve(true);
            return;
        }
        if (document.getElementById('razorpay-script')) {
            // Script is loading, wait for it
            const interval = setInterval(() => {
                if (typeof window.Razorpay !== 'undefined') {
                    clearInterval(interval);
                    resolve(true);
                }
            }, 100);
            return;
        }
        const script = document.createElement('script');
        script.id = 'razorpay-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    isAvailable: boolean;
}

interface Order {
    _id: string;
    items: { name: string; quantity: number; price: number }[];
    totalAmount: number;
    tableNumber: number;
    paymentMethod: 'cash' | 'online' | 'pending';
    status: string;
    createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; icon: any; cls: string }> = {
    pending: { label: 'Pending', icon: Clock, cls: 'status-pending' },
    preparing: { label: 'Preparing', icon: ChefHat, cls: 'status-preparing' },
    ready: { label: 'Ready!', icon: PackageCheck, cls: 'status-ready' },
    completed: { label: 'Completed', icon: CheckCircle2, cls: 'status-completed' },
    cancelled: { label: 'Cancelled', icon: X, cls: 'status-cancelled' },
};

export default function Customer() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [ordering, setOrdering] = useState(false);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [tableNumber] = useState<number>(1);
    const [guestId, setGuestId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('menu');
    const [myOrders, setMyOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Payment modal state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    const { user } = useAuthStore();
    const { items, addItem, updateQuantity, total, clearCart } = useCartStore();

    useEffect(() => {
        fetchMenu();
        socket.connect();

        // Handle navigation state for active tab
        const navState = window.history.state?.usr;
        if (navState?.tab === 'orders') {
            setActiveTab('orders');
        }

        // Guest ID initialization
        let gid = localStorage.getItem('guest_id');
        if (!gid) {
            gid = 'guest_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('guest_id', gid);
        }
        setGuestId(gid);

        socket.on('order-status-updated', (order: Order) => {
            setMyOrders(prev =>
                prev.map(o => o._id === order._id ? { ...o, ...order } : o)
            );
            fetchMyOrders();
        });

        return () => {
            socket.disconnect();
            socket.off('order-status-updated');
        };
    }, []);

    const fetchMenu = async () => {
        try {
            const res = await api.get('/menu');
            setMenuItems(res.data);
        } catch (error) {
            console.error('Failed to fetch menu:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyOrders = async () => {
        const identifier = user?.id || localStorage.getItem('guest_id');
        if (!identifier) return;
        setOrdersLoading(true);
        try {
            const res = await api.get(`/orders/mine?customerId=${identifier}`);
            setMyOrders(res.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'orders') fetchMyOrders();
    }, [activeTab]);

    const categories = ['All', ...Array.from(new Set(menuItems.map(i => i.category).filter(Boolean)))];

    const filtered = menuItems.filter(item => {
        if (!item.isAvailable) return false;
        const matchCat = activeCategory === 'All' || item.category === activeCategory;
        const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.description?.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    const handleSendToKitchen = async () => {
        if (items.length === 0) return;
        setOrdering(true);
        try {
            const orderData = {
                customer: user?.id || guestId,
                items: items.map(item => ({
                    menuItem: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
                totalAmount: total,
                tableNumber,
                paymentMethod: 'pending', // Set to pending for pay-at-end
            };
            await api.post('/orders', orderData);
            clearCart();
            // Refresh orders list
            fetchMyOrders();
            // Switch to orders tab to show progress
            setActiveTab('orders');
        } catch (error) {
            console.error('Failed to send order to kitchen:', error);
            alert('Failed to send order to kitchen. Please try again.');
        } finally {
            setOrdering(false);
        }
    };

    /** Handle final payment for all unpaid orders */
    const handleFinalPayment = (method: 'cash' | 'online') => {
        setPaymentError(null);
        if (method === 'cash') {
            handleCashBillPay();
        } else {
            handleOnlineBillPay();
        }
    };

    const handleCashBillPay = async () => {
        setOrdering(true);
        try {
            await api.post('/orders/pay-bill', {
                customerId: user?.id || guestId,
                paymentMethod: 'cash'
            });
            setShowPaymentModal(false);
            fetchMyOrders();
            alert('Cash payment request sent! Please settle at the counter.');
        } catch (error) {
            console.error('Failed to pay bill:', error);
            setPaymentError('Failed to process payment. Please try again.');
        } finally {
            setOrdering(false);
        }
    };

    const handleOnlineBillPay = useCallback(async () => {
        setOrdering(true);
        setPaymentError(null);
        try {
            const sdkLoaded = await loadRazorpayScript();
            if (!sdkLoaded || !window.Razorpay) {
                setPaymentError('Failed to load payment gateway.');
                setOrdering(false);
                return;
            }

            const unpaidTotal = myOrders
                .filter(o => o.paymentMethod === 'pending' && o.status !== 'cancelled')
                .reduce((sum, o) => sum + o.totalAmount, 0);

            const { data } = await api.post('/payment/create-order', {
                amount: unpaidTotal,
                receipt: `bill_${Date.now()}`,
            });

            const options = {
                key: data.key_id,
                amount: data.amount,
                currency: data.currency,
                name: 'Smart KOT',
                description: `Final Bill Payment — Table ${tableNumber}`,
                order_id: data.id,
                theme: { color: '#06b6d4' },
                handler: async (response: any) => {
                    try {
                        await api.post('/orders/pay-bill', {
                            customerId: user?.id || guestId,
                            paymentMethod: 'online',
                            paymentId: response.razorpay_payment_id
                        });
                        setShowPaymentModal(false);
                        fetchMyOrders();
                        alert('Bill paid successfully online!');
                    } catch {
                        setPaymentError('Payment succeeded but verification failed. Please contact staff.');
                    } finally {
                        setOrdering(false);
                    }
                },
                modal: { ondismiss: () => setOrdering(false) }
            };
            new window.Razorpay(options).open();
        } catch (error) {
            console.error('Online bill pay error:', error);
            setPaymentError('Could not initiate payment.');
            setOrdering(false);
        }
    }, [myOrders, guestId, user, tableNumber]);

    /** Redefine checkout modal trigger for aggregated bill */
    const triggerBillPayment = () => {
        const unpaidCount = myOrders.filter(o => o.paymentMethod === 'pending' && o.status !== 'cancelled').length;
        if (unpaidCount === 0) return;
        setShowPaymentModal(true);
    };


    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#040810]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative h-12 w-12">
                        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
                        <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin" />
                    </div>
                    <p className="text-sm text-white/40">Loading menu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#040810]">
            <Navbar />

            <main className="container mx-auto max-w-7xl p-4 lg:p-6">
                {/* Tabs */}
                <div className="mb-6 flex items-center gap-1 rounded-xl bg-white/5 border border-white/5 p-1 w-full sm:w-fit overflow-x-auto no-scrollbar shrink-0">
                    {[
                        { key: 'menu', label: 'Menu', icon: UtensilsCrossed },
                        { key: 'orders', label: 'My Orders', icon: ClipboardList },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 flex-1 sm:flex-none whitespace-nowrap ${activeTab === tab.key
                                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                                : 'text-white/40 hover:text-white/70'
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ============ MENU TAB ============ */}
                {activeTab === 'menu' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left: Menu */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                <input
                                    type="text"
                                    placeholder="Search dishes..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="input-futuristic w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                                />
                            </div>

                            {/* Category chips */}
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 border whitespace-nowrap ${activeCategory === cat
                                            ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                                            : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20 hover:text-white/70'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Menu grid */}
                            {filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-white/20">
                                    <UtensilsCrossed className="h-12 w-12 mb-3" />
                                    <p>No items found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 xl:grid-cols-3">
                                    {filtered.map((item) => {
                                        const inCart = items.find(i => i.id === item._id);
                                        return (
                                            <div key={item._id} className="glass-card-hover rounded-xl overflow-hidden flex flex-col group">
                                                {item.image && (
                                                    <div className="aspect-[16/10] overflow-hidden relative">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            onError={e => (e.currentTarget.style.display = 'none')}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-[#080d1a] via-transparent to-transparent opacity-60" />
                                                    </div>
                                                )}
                                                <div className="p-3 sm:p-4 flex flex-col flex-1">
                                                    <div className="flex justify-between items-start gap-2 mb-1">
                                                        <h3 className="font-semibold text-white text-sm sm:text-base leading-tight group-hover:text-cyan-400 transition-colors uppercase tracking-wide">{item.name}</h3>
                                                    </div>
                                                    {item.description && (
                                                        <p className="text-[11px] text-white/40 line-clamp-2 mb-3 h-8">{item.description}</p>
                                                    )}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="neon-text-cyan font-bold text-base">₹{item.price}</span>
                                                        {item.category && (
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                                                {item.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-auto">
                                                        {inCart ? (
                                                            <div className="flex items-center justify-between bg-white/5 rounded-lg p-1 border border-white/10">
                                                                <button
                                                                    onClick={() => updateQuantity(item._id, inCart.quantity - 1)}
                                                                    className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-white/60 hover:text-red-400 transition-all active:scale-95"
                                                                >
                                                                    <Minus className="h-3.5 w-3.5" />
                                                                </button>
                                                                <span className="text-sm font-bold text-white px-2">{inCart.quantity}</span>
                                                                <button
                                                                    onClick={() => addItem({ id: item._id, name: item.name, price: item.price })}
                                                                    className="flex h-8 w-8 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all active:scale-95"
                                                                >
                                                                    <Plus className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => addItem({ id: item._id, name: item.name, price: item.price })}
                                                                className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/15 hover:border-cyan-500/40 transition-all duration-300 active:scale-[0.98]"
                                                            >
                                                                <Plus className="h-4 w-4" /> ADD TO CART
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Right: Cart */}
                        <div id="cart-section">
                            <div className="sticky top-20 glass-card rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-5">
                                    <ShoppingCart className="h-5 w-5 text-cyan-400" />
                                    <h2 className="font-semibold text-white">Your Cart</h2>
                                    {items.length > 0 && (
                                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-black">
                                            {items.reduce((s, i) => s + i.quantity, 0)}
                                        </span>
                                    )}
                                </div>

                                {items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-white/20">
                                        <ShoppingCart className="h-10 w-10 mb-3" />
                                        <p className="text-sm">Your cart is empty</p>
                                        <p className="text-xs mt-1">Add items from the menu</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {items.map(item => (
                                            <div key={item.id} className="flex items-center justify-between gap-3 border-b border-white/5 pb-3 last:border-0">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">{item.name}</p>
                                                    <p className="text-xs text-white/30">₹{item.price} × {item.quantity}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/50 hover:border-red-500/30 hover:text-red-400 text-xs transition-all"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-4 text-center text-sm text-white">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="flex h-6 w-6 items-center justify-center rounded-md border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/15 text-xs transition-all"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                                            <span className="text-sm text-white/50">Total</span>
                                            <span className="text-xl font-bold neon-text-cyan">₹{total}</span>
                                        </div>

                                        <button
                                            onClick={handleSendToKitchen}
                                            disabled={items.length === 0 || ordering}
                                            className="btn-neon w-full rounded-xl py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {ordering ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <ChefHat className="h-4 w-4" /> Send to Kitchen
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ============ MY ORDERS TAB ============ */}
                {activeTab === 'orders' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white">Your Orders</h2>
                            <button
                                onClick={fetchMyOrders}
                                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                            >
                                <Loader2 className={`h-3 w-3 ${ordersLoading ? 'animate-spin' : ''}`} />
                                Refresh Status
                            </button>
                        </div>

                        {/* Bill Summary Card */}
                        {myOrders.some(o => o.paymentMethod === 'pending' && o.status !== 'cancelled') && (
                            <div className="glass-card rounded-xl p-5 border-cyan-500/20 bg-cyan-500/5 animate-pulse-subtle">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Total Unpaid Balance</p>
                                        <p className="text-2xl font-black text-white">
                                            ₹{myOrders.filter(o => o.paymentMethod === 'pending' && o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={triggerBillPayment}
                                        className="btn-neon px-6 py-2.5 rounded-lg text-xs font-bold"
                                    >
                                        PAY FINAL BILL
                                    </button>
                                </div>
                                <p className="text-[10px] text-white/40 flex items-center gap-1">
                                    <Info className="h-3 w-3" /> All orders sent to kitchen are included here.
                                </p>
                            </div>
                        )}

                        {ordersLoading ? (
                            <div className="flex justify-center py-16">
                                <div className="relative h-8 w-8">
                                    <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin" />
                                </div>
                            </div>
                        ) : myOrders.length === 0 ? (
                            <div className="glass-card rounded-xl p-12 flex flex-col items-center text-white/20">
                                <ClipboardList className="h-12 w-12 mb-3" />
                                <p>No orders yet</p>
                                <p className="text-xs mt-1">Place an order from the menu tab</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {myOrders.map(order => {
                                    const st = STATUS_MAP[order.status] || STATUS_MAP['pending'];
                                    const StatusIcon = st.icon;
                                    return (
                                        <div key={order._id} className="glass-card rounded-xl p-4 animate-fade-in">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-xs text-white/40">#{order._id.slice(-6).toUpperCase()}</span>
                                                    <span className="text-xs text-white/30">Table {order.tableNumber}</span>
                                                </div>
                                                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>
                                                    <StatusIcon className="h-3 w-3" /> {st.label}
                                                </span>
                                            </div>
                                            <div className="space-y-1 mb-3">
                                                {order.items.map((it, i) => (
                                                    <div key={i} className="flex justify-between text-sm">
                                                        <span className="text-white/60">{it.name}</span>
                                                        <span className="text-white/40">×{it.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                                <span className="text-xs text-white/30">
                                                    {order.paymentMethod === 'cash' ? (
                                                        <span className="flex items-center gap-1">
                                                            <Banknote className="h-3 w-3" /> Cash
                                                        </span>
                                                    ) : order.paymentMethod === 'online' ? (
                                                        <span className="flex items-center gap-1">
                                                            <CreditCard className="h-3 w-3" /> Paid Online
                                                        </span>
                                                    ) : 'Payment pending'}
                                                </span>
                                                <span className="font-bold text-white">₹{order.totalAmount}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* ===== PAYMENT METHOD MODAL ===== */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !ordering && setShowPaymentModal(false)} />
                    <div className="relative z-10 w-full max-w-sm glass-card rounded-2xl p-6 animate-scale-in">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-semibold text-white">Choose Payment</h3>
                            <button onClick={() => !ordering && setShowPaymentModal(false)} className="text-white/30 hover:text-white/70">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mb-5 rounded-xl bg-white/5 border border-white/5 p-3">
                            <p className="text-xs text-white/40 mb-2">Order Summary</p>
                            {items.map(it => (
                                <div key={it.id} className="flex justify-between text-sm text-white/70 py-0.5">
                                    <span>{it.name} ×{it.quantity}</span>
                                    <span>₹{it.price * it.quantity}</span>
                                </div>
                            ))}
                            <div className="border-t border-white/10 mt-2 pt-2 flex justify-between font-bold">
                                <span className="text-white">Total</span>
                                <span className="neon-text-cyan">₹{total}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleFinalPayment('cash')}
                                disabled={ordering}
                                className="flex flex-col items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/8 p-4 hover:bg-amber-500/15 hover:border-amber-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Banknote className="h-7 w-7 text-amber-400" />
                                <span className="text-sm font-semibold text-amber-300">Cash</span>
                                <span className="text-[10px] text-white/30">Pay at counter</span>
                            </button>
                            <button
                                onClick={() => handleFinalPayment('online')}
                                disabled={ordering}
                                className="flex flex-col items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/8 p-4 hover:bg-cyan-500/15 hover:border-cyan-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CreditCard className="h-7 w-7 text-cyan-400" />
                                <span className="text-sm font-semibold text-cyan-300">Pay Online</span>
                                <span className="text-[10px] text-white/30">UPI · Card · Netbanking</span>
                            </button>
                        </div>
                        {ordering && (
                            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/40">
                                <Loader2 className="h-4 w-4 animate-spin" /> Opening payment gateway...
                            </div>
                        )}
                        {paymentError && (
                            <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/8 p-3 text-xs text-red-400">
                                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                <span>{paymentError}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Floating Cart Button for Mobile */}
            <div className="lg:hidden fixed bottom-6 right-6 z-40">
                {items.length > 0 && activeTab === 'menu' && (
                    <button
                        onClick={() => document.getElementById('cart-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex items-center gap-2 rounded-full bg-cyan-500 p-4 font-bold text-black shadow-lg shadow-cyan-500/40 animate-bounce active:scale-95 transition-all"
                    >
                        <ShoppingCart className="h-6 w-6" />
                        <span className="text-sm">₹{total}</span>
                    </button>
                )}
            </div>
        </div>
    );
}
