import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CheckCircle2, Banknote, CreditCard, Home, ClipboardList, Zap } from 'lucide-react';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

export default function ThankYou() {
    const location = useLocation();
    const navigate = useNavigate();
    const order = location.state?.order;
    const paymentMethod = location.state?.paymentMethod as 'cash' | 'online' | undefined;
    const paymentId = location.state?.paymentId as string | undefined;

    const [show, setShow] = useState(false);

    useEffect(() => {
        setTimeout(() => setShow(true), 100);
        if (!order) {
            // If no order info, redirect home
            setTimeout(() => navigate('/customer'), 3000);
        }
    }, []);

    const items: OrderItem[] = order?.items || [];
    const total = order?.totalAmount || 0;
    const orderId = order?._id?.slice(-6).toUpperCase() || '------';
    const tableNum = order?.tableNumber;

    return (
        <div className="relative min-h-screen bg-[#040810] flex items-center justify-center p-4 overflow-hidden">
            {/* Background effects */}
            <div className="orb w-[600px] h-[600px] bg-green-500/8 -top-40 -left-40" style={{ animationDelay: '0s' }} />
            <div className="orb w-[400px] h-[400px] bg-cyan-500/8 bottom-0 right-0" style={{ animationDelay: '2s' }} />
            <div className="absolute inset-0 grid-bg opacity-30" />

            {/* Success ring pulse */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full border border-green-500/10 animate-ping-once" style={{ animationDuration: '1.5s' }} />
            </div>

            <div className={`relative z-10 w-full max-w-md transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {/* Glow ring */}
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-green-500/20 to-cyan-500/20 blur-xl" />

                <div className="relative glass-card rounded-2xl p-6 sm:p-8">
                    {/* Header */}
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl animate-glow-pulse" />
                            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
                                <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-green-400" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">Order Confirmed!</h1>
                            <p className="text-[12px] sm:text-sm text-white/40 mt-1">Your food is being prepared with care</p>
                        </div>
                    </div>

                    {/* Order details card */}
                    <div className="rounded-xl bg-white/5 border border-white/5 p-4 mb-5 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white/40">Order ID</span>
                            <span className="font-mono font-bold text-white">#{orderId}</span>
                        </div>
                        {tableNum && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/40">Table</span>
                                <span className="font-bold text-white">T-{tableNum}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white/40">Payment</span>
                            <span className={`flex items-center gap-1.5 font-semibold ${paymentMethod === 'online' ? 'text-cyan-400' : 'text-amber-400'}`}>
                                {paymentMethod === 'online' ? <CreditCard className="h-3.5 w-3.5" /> : <Banknote className="h-3.5 w-3.5" />}
                                {paymentMethod === 'online' ? 'Paid Online' : 'Cash'}
                            </span>
                        </div>
                        {paymentId && (
                            <div className="flex items-center justify-between text-sm pt-1 border-t border-white/5 mt-1">
                                <span className="text-white/40">Payment ID</span>
                                <span className="font-mono text-[10px] text-white/30 truncate max-w-[150px]">{paymentId}</span>
                            </div>
                        )}
                    </div>

                    {/* Items */}
                    {items.length > 0 && (
                        <div className="mb-6">
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4">Your Selection</p>
                            <div className="space-y-3">
                                {items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-5 w-5 items-center justify-center rounded bg-white/5 border border-white/10 text-[10px] font-bold text-cyan-400">
                                                {item.quantity}
                                            </span>
                                            <span className="text-white/80 font-medium">{item.name}</span>
                                        </div>
                                        <span className="text-white/40 font-mono">₹{(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 border-t border-white/10 pt-4 flex justify-between items-center">
                                <span className="text-sm font-medium text-white/50">Total Paid</span>
                                <span className="neon-text-cyan text-xl font-black">₹{total}</span>
                            </div>
                        </div>
                    )}

                    {/* Payment message */}
                    {paymentMethod === 'cash' && (
                        <div className="mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs sm:text-sm text-amber-200/70 flex items-start gap-3">
                            <Banknote className="h-5 w-5 text-amber-400 shrink-0" />
                            <p>Please pay <span className="font-bold text-amber-400">₹{total}</span> at the counter when collecting your order.</p>
                        </div>
                    )}
                    {paymentMethod === 'online' && (
                        <div className="mb-6 rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-xs sm:text-sm text-green-200/70 flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                            <p>Payment confirmed! Your order <span className="font-bold text-green-400">#{orderId}</span> is being prepared.</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col xs:flex-row gap-3">
                        <button
                            onClick={() => navigate('/customer', { state: { tab: 'orders' } })}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
                        >
                            <ClipboardList className="h-4 w-4" /> TRACK ORDER
                        </button>
                        <button
                            onClick={() => navigate('/customer')}
                            className="btn-neon flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black active:scale-[0.98]"
                        >
                            <Home className="h-4 w-4" /> BACK TO MENU
                        </button>
                    </div>

                    {/* Footer branding */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-white/15">
                        <Zap className="h-3 w-3 text-cyan-500/50" />
                        <span className="text-xs">Powered by Smart KOT</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
