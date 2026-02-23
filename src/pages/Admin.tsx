import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ShoppingBag, DollarSign, ChefHat, TrendingUp,
    Plus, Pencil, Trash2, Loader2, X, Check, BarChart2, LayoutGrid, Image as ImgIcon, ToggleLeft, ToggleRight,
    QrCode, Download, ExternalLink, Info
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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
    status: string;
    totalAmount: number;
    createdAt: string;
    tableNumber?: number;
}

const EMPTY_ITEM = { name: '', description: '', price: 0, category: '', image: '', isAvailable: true };

function StatCard({ label, value, sub, Icon, accentColor }: { label: string; value: any; sub?: string; Icon: any; accentColor: string }) {
    return (
        <div className="glass-card rounded-xl p-5 flex flex-col gap-3 group hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider">{label}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border group-hover:scale-110 transition-transform duration-300" style={{ borderColor: `${accentColor}30`, background: `${accentColor}10` }}>
                    <Icon className="h-4 w-4" style={{ color: accentColor }} />
                </div>
            </div>
            <div>
                <p className="text-2xl font-bold text-white group-hover:neon-text-cyan transition-colors duration-300" style={{ '--neon-color': accentColor } as any}>{value}</p>
                {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// Simple bar chart using CSS
function RevenueChart({ orders }: { orders: Order[] }) {
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
    });
    const data = days.map(day => {
        const dayStr = day.toDateString();
        const rev = orders
            .filter(o => o.status === 'completed' && new Date(o.createdAt).toDateString() === dayStr)
            .reduce((s, o) => s + o.totalAmount, 0);
        return { label: day.toLocaleDateString('en', { weekday: 'short' }), value: rev };
    });
    const max = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="glass-card rounded-xl p-5 hover:shadow-[0_0_25px_rgba(6,182,212,0.05)] transition-shadow duration-300">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" /> Revenue (Last 7 Days)
            </h3>
            <div className="flex items-end gap-2 h-36">
                {data.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group/bar h-full justify-end">
                        <div className="relative w-full group/val">
                            {d.value > 0 && (
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    ₹{d.value}
                                </div>
                            )}
                            <div className="w-full rounded-t-md transition-all duration-500 group-hover/bar:brightness-125" style={{
                                height: `${(d.value / max) * 100}%`,
                                minHeight: d.value > 0 ? '4px' : '2px',
                                background: d.value > 0 ? 'linear-gradient(180deg, #00e5ff, rgba(0,229,255,0.3))' : 'rgba(255,255,255,0.05)',
                                boxShadow: d.value > 0 ? '0 0 8px rgba(0,229,255,0.3)' : 'none',
                            }} />
                        </div>
                        <span className="text-[10px] text-white/30 group-hover/bar:text-cyan-400 transition-colors uppercase font-bold tracking-tighter">{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const STATUS_STYLE: Record<string, string> = {
    completed: 'status-completed',
    pending: 'status-pending',
    preparing: 'status-preparing',
    ready: 'status-ready',
    cancelled: 'status-cancelled',
};

export default function Admin() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'analytics' | 'qr'>('overview');
    const [baseUrl, setBaseUrl] = useState(window.location.origin);

    // Menu form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(EMPTY_ITEM);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([api.get('/menu'), api.get('/orders')])
            .then(([menuRes, ordersRes]) => {
                setMenuItems(menuRes.data);
                setOrders(ordersRes.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const totalRevenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.totalAmount, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    const openCreate = () => { setForm(EMPTY_ITEM); setEditingId(null); setShowForm(true); };
    const openEdit = (item: MenuItem) => {
        setForm({ name: item.name, description: item.description, price: item.price, category: item.category, image: item.image, isAvailable: item.isAvailable });
        setEditingId(item._id);
        setShowForm(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editingId) {
                const res = await api.put(`/menu/${editingId}`, form);
                setMenuItems(prev => prev.map(m => m._id === editingId ? res.data : m));
            } else {
                const res = await api.post('/menu', form);
                setMenuItems(prev => [...prev, res.data]);
            }
            setShowForm(false);
        } catch (err) {
            console.error('Save failed:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this menu item?')) return;
        setDeletingId(id);
        try {
            await api.delete(`/menu/${id}`);
            setMenuItems(prev => prev.filter(m => m._id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleAvailability = async (item: MenuItem) => {
        setTogglingId(item._id);
        try {
            const res = await api.put(`/menu/${item._id}`, { ...item, isAvailable: !item.isAvailable });
            setMenuItems(prev => prev.map(m => m._id === item._id ? res.data : m));
        } catch (err) {
            console.error('Toggle failed:', err);
        } finally {
            setTogglingId(null);
        }
    };

    const TABS = [
        { key: 'overview', label: 'Overview', icon: LayoutGrid },
        { key: 'analytics', label: 'Analytics', icon: BarChart2 },
        { key: 'menu', label: 'Menu Mgmt', icon: ChefHat },
        { key: 'qr', label: 'QR Generator', icon: QrCode },
    ] as const;

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#040810]">
            <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
                <div className="absolute inset-0 rounded-full border-t-2 border-violet-500 animate-spin" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#040810]">
            <Navbar />
            <main className="container mx-auto max-w-7xl p-4 lg:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                        <p className="text-xs text-white/30">Manage your restaurant</p>
                    </div>
                    <div className="flex gap-1 rounded-xl bg-white/5 border border-white/5 p-1 overflow-x-auto no-scrollbar shrink-0">
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.key
                                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                                    : 'text-white/40 hover:text-white/70'
                                    }`}
                            >
                                <tab.icon className="h-3.5 w-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Total Revenue" value={`₹${totalRevenue}`} sub="Completed orders" Icon={DollarSign} accentColor="#00e5ff" />
                    <StatCard label="Total Orders" value={orders.length} sub="All time" Icon={ShoppingBag} accentColor="#a855f7" />
                    <StatCard label="Pending" value={pendingOrders} sub="Awaiting kitchen" Icon={ChefHat} accentColor="#f59e0b" />
                    <StatCard label="Completed" value={completedOrders} sub="All time" Icon={Check} accentColor="#22c55e" />
                </div>

                {/* ===== OVERVIEW TAB ===== */}
                {activeTab === 'overview' && (
                    <div className="glass-card rounded-xl overflow-hidden">
                        <div className="p-5 border-b border-white/5">
                            <h2 className="font-semibold text-white">Recent Orders</h2>
                        </div>
                        {orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-white/20">
                                <ShoppingBag className="h-10 w-10 mb-2" />
                                <p className="text-sm">No orders yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-sm min-w-[700px]">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="px-5 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">Order ID</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">Table</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">Status</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">Amount</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.slice(0, 15).map(order => (
                                            <tr key={order._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                                <td className="px-5 py-3 font-mono text-xs text-white/50">#{order._id.slice(-6).toUpperCase()}</td>
                                                <td className="px-5 py-3 text-white/60">{order.tableNumber ? `T${order.tableNumber}` : '—'}</td>
                                                <td className="px-5 py-3">
                                                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[order.status] || 'status-pending'}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 font-semibold text-white">₹{order.totalAmount}</td>
                                                <td className="px-5 py-3 text-white/30 text-xs">{new Date(order.createdAt).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== ANALYTICS TAB ===== */}
                {activeTab === 'analytics' && (
                    <div className="space-y-4">
                        <RevenueChart orders={orders} />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Order status breakdown */}
                            <div className="glass-card rounded-xl p-5">
                                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                    <ShoppingBag className="h-4 w-4 text-violet-400" /> Order Status Breakdown
                                </h3>
                                <div className="space-y-3">
                                    {['pending', 'preparing', 'ready', 'completed', 'cancelled'].map(st => {
                                        const count = orders.filter(o => o.status === st).length;
                                        const pct = orders.length > 0 ? (count / orders.length) * 100 : 0;
                                        return (
                                            <div key={st}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="capitalize text-white/50">{st}</span>
                                                    <span className="text-white/30">{count}</span>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                    <div className="h-full rounded-full transition-all duration-700" style={{
                                                        width: `${pct}%`,
                                                        background: st === 'completed' ? '#22c55e' : st === 'pending' ? '#f59e0b' : st === 'preparing' ? '#00e5ff' : st === 'ready' ? '#22c55e' : '#ef4444',
                                                    }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            {/* Top items */}
                            <div className="glass-card rounded-xl p-5">
                                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-cyan-400" /> Recent Items
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-white/30 font-medium uppercase tracking-wider pb-1 border-b border-white/5">
                                        <span>Item</span>
                                        <span>Price / Available</span>
                                    </div>
                                    {menuItems.slice(0, 6).map(item => (
                                        <div key={item._id} className="flex items-center justify-between text-sm py-1">
                                            <span className="text-white/70 truncate max-w-[50%]">{item.name}</span>
                                            <span className="text-white/40 text-xs text-right whitespace-nowrap">₹{item.price} · {item.isAvailable ? '✓' : '✗'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== MENU MANAGEMENT TAB ===== */}
                {activeTab === 'menu' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button
                                onClick={openCreate}
                                className="btn-neon flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold w-full sm:w-auto justify-center"
                            >
                                <Plus className="h-4 w-4" /> Add Item
                            </button>
                        </div>

                        {/* Form */}
                        {showForm && (
                            <div className="glass-card rounded-xl p-5 border border-violet-500/20 animate-slide-up">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-white">{editingId ? 'Edit' : 'New'} Menu Item</h3>
                                    <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white/70">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-white/40 uppercase tracking-wider">Name</Label>
                                        <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Item name" className="input-futuristic border-0 bg-transparent text-sm active:ring-0 focus:ring-0" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-white/40 uppercase tracking-wider">Category</Label>
                                        <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Starters" className="input-futuristic border-0 bg-transparent text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-white/40 uppercase tracking-wider">Price (₹)</Label>
                                        <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="input-futuristic border-0 bg-transparent text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-white/40 uppercase tracking-wider">Image URL</Label>
                                        <Input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." className="input-futuristic border-0 bg-transparent text-sm" />
                                    </div>
                                    <div className="sm:col-span-2 space-y-1">
                                        <Label className="text-xs text-white/40 uppercase tracking-wider">Description</Label>
                                        <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description" className="input-futuristic border-0 bg-transparent text-sm" />
                                    </div>
                                    {/* Image preview */}
                                    {form.image && (
                                        <div className="sm:col-span-2">
                                            <Label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1"><ImgIcon className="h-3 w-3" /> Preview</Label>
                                            <img src={form.image} alt="preview" className="h-24 w-40 rounded-lg object-cover border border-white/10" onError={e => (e.currentTarget.style.display = 'none')} />
                                        </div>
                                    )}
                                    <div className="sm:col-span-2 flex items-center gap-3">
                                        <span className="text-xs text-white/40 uppercase tracking-wider">Available</span>
                                        <button
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, isAvailable: !f.isAvailable }))}
                                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            {form.isAvailable ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7 text-white/20" />}
                                        </button>
                                        <span className="text-sm text-white/50">{form.isAvailable ? 'Available' : 'Unavailable'}</span>
                                    </div>
                                    <div className="sm:col-span-2 flex flex-col xs:flex-row gap-2 justify-end pt-2">
                                        <Button variant="outline" onClick={() => setShowForm(false)} className="border-white/10 text-white/50 hover:text-white hover:bg-white/5 flex-1 xs:flex-none">
                                            <X className="mr-2 h-4 w-4" /> Cancel
                                        </Button>
                                        <button onClick={handleSave} disabled={saving} className="btn-neon flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 justify-center flex-1 xs:flex-none">
                                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                            {editingId ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Table */}
                        <div className="glass-card rounded-xl overflow-hidden">
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-sm min-w-[650px]">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="px-5 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">Item</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">Category</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">Price</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">Available</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {menuItems.map(item => (
                                            <tr key={item._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {item.image && (
                                                            <img src={item.image} alt={item.name} className="h-8 w-8 md:h-9 md:w-9 rounded-lg object-cover border border-white/10" onError={e => (e.currentTarget.style.display = 'none')} />
                                                        )}
                                                        <span className="font-medium text-white">{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-white/40 text-xs">{item.category}</td>
                                                <td className="px-5 py-3 font-semibold neon-text-cyan">₹{item.price}</td>
                                                <td className="px-5 py-3">
                                                    <button
                                                        onClick={() => handleToggleAvailability(item)}
                                                        disabled={togglingId === item._id}
                                                        className={`transition-colors ${item.isAvailable ? 'text-green-400 hover:text-green-300' : 'text-white/20 hover:text-white/40'}`}
                                                    >
                                                        {togglingId === item._id ? (
                                                            <Loader2 className="h-5 w-5 animate-spin" />
                                                        ) : item.isAvailable ? (
                                                            <ToggleRight className="h-6 w-6" />
                                                        ) : (
                                                            <ToggleLeft className="h-6 w-6" />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => openEdit(item)} className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/50 hover:border-cyan-500/30 hover:text-cyan-400 transition-all">
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item._id)}
                                                            disabled={deletingId === item._id}
                                                            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/50 hover:border-red-500/30 hover:text-red-400 transition-all disabled:opacity-40"
                                                        >
                                                            {deletingId === item._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== QR GENERATOR TAB ===== */}
                {activeTab === 'qr' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
                        <div className="glass-card rounded-xl p-6 space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <QrCode className="h-5 w-5 text-cyan-400" /> QR Settings
                                </h3>
                                <p className="text-xs text-white/30">Configure your customer-facing URL to generate QR codes.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-white/40 uppercase tracking-wider">Base Application URL</Label>
                                    <div className="relative">
                                        <Input
                                            value={baseUrl}
                                            onChange={(e) => setBaseUrl(e.target.value)}
                                            placeholder="https://your-app.vercel.app"
                                            className="input-futuristic pr-10"
                                        />
                                        <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                    </div>
                                    <p className="text-[10px] text-white/20">The QR code will automatically point to {baseUrl}/customer</p>
                                </div>

                                <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-3 space-y-2">
                                    <div className="flex items-center gap-2 text-amber-500">
                                        <Info className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Deployment Tip</span>
                                    </div>
                                    <p className="text-[11px] text-amber-200/60 leading-relaxed">
                                        Once you deploy to Vercel, paste your live link here to generate the final QR codes for your tables.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center gap-6 text-center">
                            <div className="bg-white p-4 rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.05)] border border-white/10 group relative transition-transform duration-500 hover:scale-[1.02]">
                                <QRCodeSVG
                                    id="qr-code-svg"
                                    value={`${baseUrl}/customer`}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center pointer-events-none">
                                    <div className="bg-cyan-500 text-black text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
                                        Table 1 Access
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 w-full">
                                <button
                                    onClick={() => {
                                        const svg = document.getElementById('qr-code-svg');
                                        if (!svg) return;
                                        const svgData = new XMLSerializer().serializeToString(svg);
                                        const canvas = document.createElement('canvas');
                                        const ctx = canvas.getContext('2d');
                                        const img = new Image();
                                        img.onload = () => {
                                            canvas.width = img.width;
                                            canvas.height = img.height;
                                            ctx?.drawImage(img, 0, 0);
                                            const pngFile = canvas.toDataURL('image/png');
                                            const downloadLink = document.createElement('a');
                                            downloadLink.download = `SmartKOT_Table1_QR.png`;
                                            downloadLink.href = `${pngFile}`;
                                            downloadLink.click();
                                        };
                                        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                                    }}
                                    className="btn-neon w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold"
                                >
                                    <Download className="h-4 w-4" /> Download QR Code (PNG)
                                </button>
                                <p className="text-[10px] text-white/20">High-resolution PNG ready for printing.</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
