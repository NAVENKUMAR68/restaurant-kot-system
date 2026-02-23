import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import { socket } from '@/utils/socket';
import { Loader2, ChefHat, Clock, CheckCircle, XCircle, PackageCheck, Volume2, VolumeX } from 'lucide-react';

interface OrderItem {
    menuItem: string;
    name: string;
    price: number;
    quantity: number;
}

interface Order {
    _id: string;
    customer: string;
    items: OrderItem[];
    totalAmount: number;
    tableNumber?: number;
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    createdAt: string;
}

function useTimer(createdAt: string) {
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        const start = new Date(createdAt).getTime();
        const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [createdAt]);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

const COLUMNS = [
    { key: 'pending', label: 'Pending', accent: '#f59e0b', glow: 'rgba(245,158,11,0.15)', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
    { key: 'preparing', label: 'Preparing', accent: '#00e5ff', glow: 'rgba(0,229,255,0.15)', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5' },
    { key: 'ready', label: 'Ready', accent: '#22c55e', glow: 'rgba(34,197,94,0.15)', border: 'border-green-500/20', bg: 'bg-green-500/5' },
] as const;

const STATUS_CONFIG = {
    pending: { label: 'Pending', cls: 'status-pending', next: 'preparing', nextLabel: 'Start Cooking', Icon: Clock },
    preparing: { label: 'Preparing', cls: 'status-preparing', next: 'ready', nextLabel: 'Mark Ready', Icon: ChefHat },
    ready: { label: 'Ready!', cls: 'status-ready', next: 'completed', nextLabel: 'Complete', Icon: PackageCheck },
    completed: { label: 'Completed', cls: 'status-completed', next: null, nextLabel: null, Icon: CheckCircle },
    cancelled: { label: 'Cancelled', cls: 'status-cancelled', next: null, nextLabel: null, Icon: XCircle },
};

function OrderCard({ order, onUpdate, updating }: { order: Order; onUpdate: (id: string, status: string) => void; updating: string | null }) {
    const elapsed = useTimer(order.createdAt);
    const cfg = STATUS_CONFIG[order.status];
    const StatusIcon = cfg.Icon;
    const isUpdating = updating === order._id;
    const isUrgent = parseInt(elapsed.split(':')[0]) >= 10;

    return (
        <div className={`glass-card rounded-xl p-3 sm:p-4 flex flex-col gap-3 animate-slide-up ${isUrgent ? 'border-red-500/30' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                    {order.tableNumber && (
                        <span className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-white shrink-0">
                            T{order.tableNumber}
                        </span>
                    )}
                    <span className="font-mono text-[10px] text-white/30 truncate">#{order._id.slice(-6).toUpperCase()}</span>
                </div>
                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold shrink-0 ${cfg.cls}`}>
                    <StatusIcon className="h-3 w-3" /> {cfg.label}
                </span>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-1.5 ${isUrgent ? 'text-red-400' : 'text-white/30'}`}>
                <Clock className="h-3 w-3" />
                <span className="text-xs font-mono">{elapsed}</span>
                {isUrgent && <span className="text-[9px] sm:text-[10px] text-red-400 animate-pulse font-bold tracking-tight">• URGENT</span>}
            </div>

            {/* Items */}
            <div className="space-y-1.5 border-t border-white/5 pt-3">
                {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs sm:text-sm">
                        <span className="text-white/70 line-clamp-1">{item.name}</span>
                        <span className="font-bold text-white ml-2">×{item.quantity}</span>
                    </div>
                ))}
                <div className="flex justify-between text-[10px] text-white/30 pt-1.5 border-t border-white/5">
                    <span>Total</span>
                    <span>₹{order.totalAmount}</span>
                </div>
            </div>

            {/* Actions */}
            {cfg.next && (
                <div className="flex gap-2 mt-1">
                    <button
                        disabled={isUpdating}
                        onClick={() => onUpdate(order._id, cfg.next!)}
                        className="btn-neon flex-1 rounded-lg py-2.5 text-[11px] font-bold disabled:opacity-40 uppercase tracking-wide"
                    >
                        {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : cfg.nextLabel}
                    </button>
                    <button
                        disabled={isUpdating}
                        onClick={() => onUpdate(order._id, 'cancelled')}
                        className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:border-red-500/40 disabled:opacity-40 transition-all flex items-center justify-center"
                    >
                        <XCircle className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default function Kitchen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const playPing = () => {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) { }
    };

    useEffect(() => {
        fetchOrders();
        socket.connect();

        socket.on('new-order', (order: Order) => {
            setOrders(prev => [order, ...prev]);
            playPing();
        });

        socket.on('order-status-updated', (updated: Order) => {
            setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
        });

        return () => {
            socket.disconnect();
            socket.off('new-order');
            socket.off('order-status-updated');
        };
    }, [soundEnabled]);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        setUpdating(orderId);
        try {
            await api.put(`/orders/${orderId}`, { status: newStatus });
        } catch (err) {
            console.error('Failed to update order:', err);
        } finally {
            setUpdating(null);
        }
    };

    const totalActive = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#040810]">
                <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
                    <div className="absolute inset-0 rounded-full border-t-2 border-amber-500 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#040810]">
            <Navbar />
            <main className="container mx-auto max-w-7xl p-4 lg:p-6">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 shrink-0">
                            <ChefHat className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white sm:text-xl">Kitchen Queue</h1>
                            <p className="text-[10px] sm:text-xs text-white/30">Real-time order management</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setSoundEnabled(s => !s)}
                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all flex-1 sm:flex-none justify-center ${soundEnabled
                                ? 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400'
                                : 'border-white/10 bg-white/5 text-white/30'
                                }`}
                        >
                            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                            {soundEnabled ? 'On' : 'Off'}
                        </button>
                        <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 flex-1 sm:flex-none justify-center">
                            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-sm font-semibold text-amber-300 whitespace-nowrap">{totalActive} Active</span>
                        </div>
                    </div>
                </div>

                {/* Kanban Columns */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {COLUMNS.map(col => {
                        const colOrders = orders.filter(o => o.status === col.key);
                        return (
                            <div key={col.key} className={`rounded-xl border ${col.border} ${col.bg} p-4`}>
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-sm font-semibold" style={{ color: col.accent }}>{col.label}</h2>
                                    <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white/60" style={{ background: col.glow }}>
                                        {colOrders.length}
                                    </span>
                                </div>
                                {colOrders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-white/15">
                                        <ChefHat className="h-8 w-8 mb-2" />
                                        <p className="text-xs">No orders</p>
                                    </div>
                                ) : (
                                    <div className="kanban-col">
                                        {colOrders.map(order => (
                                            <OrderCard key={order._id} order={order} onUpdate={updateStatus} updating={updating} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
