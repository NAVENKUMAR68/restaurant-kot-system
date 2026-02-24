import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Zap, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const ROLE_CONFIG = {
    customer: { label: 'Customer', color: 'neon-text-cyan', bg: 'bg-cyan-500/10 border-cyan-500/30' },
    kitchen: { label: 'Kitchen', color: 'neon-text-amber', bg: 'bg-amber-500/10 border-amber-500/30' },
    admin: { label: 'Admin', color: 'neon-text-violet', bg: 'bg-violet-500/10 border-violet-500/30' },
};

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const role = user?.role as keyof typeof ROLE_CONFIG | undefined;
    const roleConfig = role ? ROLE_CONFIG[role] : null;

    const navLinks = (
        <>
            {(!user || user.role === 'customer') && (
                <>
                    <Link
                        to="/customer"
                        className="text-white/60 hover:text-cyan-400 transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Menu
                    </Link>
                    <button
                        onClick={() => {
                            navigate('/customer', { state: { tab: 'orders' } });
                            setIsMenuOpen(false);
                        }}
                        className="text-white/60 hover:text-cyan-400 transition-colors duration-200 text-left"
                    >
                        My Orders
                    </button>
                </>
            )}
            {user?.role === 'kitchen' && (
                <Link
                    to="/kitchen"
                    className="text-white/60 hover:text-amber-400 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                >
                    Orders Queue
                </Link>
            )}
            {user?.role === 'admin' && (
                <Link
                    to="/admin"
                    className="text-white/60 hover:text-violet-400 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                >
                    Dashboard
                </Link>
            )}
        </>
    );

    return (
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#080d1a]/80 backdrop-blur-xl">
            {/* Subtle top gradient line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group shrink-0">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 group-hover:border-cyan-500/60 transition-all duration-300">
                        <Zap className="h-4 w-4 text-cyan-400 group-hover:text-cyan-300" />
                        <div className="absolute inset-0 rounded-lg bg-cyan-500/5 blur-sm group-hover:bg-cyan-500/15 transition-all duration-300" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">
                        <span className="neon-text-cyan">Smart</span>
                        <span className="text-white/90"> KOT</span>
                    </span>
                </Link>

                {/* Desktop Nav links */}
                <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {navLinks}
                </div>

                {/* Right section */}
                <div className="flex items-center gap-2 md:gap-3">
                    {/* Live clock */}
                    <div className="hidden lg:flex items-center gap-1.5 text-[10px] md:text-xs text-white/30 font-mono">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>

                    {/* Staff Badge (Only for Kitchen/Admin) */}
                    {user && roleConfig && (
                        <div className={`hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] md:text-xs font-medium border ${roleConfig.bg}`}>
                            <UserIcon className={`h-3 w-3 ${roleConfig.color}`} />
                            <span className="text-white/80 line-clamp-1 max-w-[80px] md:max-w-none">{user.name}</span>
                            <span className={`${roleConfig.color} font-semibold shrink-0`}>• {roleConfig.label}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={user ? handleLogout : () => navigate('/login')}
                            className={`flex items-center transition-all duration-200 h-8 md:h-9 px-2 md:px-3 rounded-lg border border-transparent ${user
                                ? 'text-white/50 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20'
                                : 'text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/20'
                                }`}
                        >
                            <LogOut className={`mr-1.5 h-3.5 w-3.5 ${!user && 'rotate-180'}`} />
                            <span className="text-xs font-bold">{user ? 'Logout' : 'Staff Login'}</span>
                        </Button>

                        {/* Mobile menu toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden text-white/50 hover:text-cyan-400 flex items-center justify-center"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile menu drawer */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-white/5 bg-[#080d1a]/95 backdrop-blur-2xl animate-in slide-in-from-top duration-300">
                    <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                        <div className="flex flex-col gap-3 text-sm font-medium">
                            {navLinks}
                        </div>

                        <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                            {user ? (
                                roleConfig && (
                                    <div className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium border ${roleConfig.bg}`}>
                                        <div className="flex items-center gap-2">
                                            <UserIcon className={`h-3 w-3 ${roleConfig.color}`} />
                                            <span className="text-white/80">{user.name}</span>
                                        </div>
                                        <span className={`${roleConfig.color} font-semibold uppercase tracking-wider text-[10px]`}>{roleConfig.label}</span>
                                    </div>
                                )
                            ) : (
                                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border bg-white/5 border-white/10">
                                    <UserIcon className="h-3 w-3 text-white/40" />
                                    <span className="text-white/40">Guest User</span>
                                </div>
                            )}
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={user ? handleLogout : () => navigate('/login')}
                                className={`w-full justify-start h-10 border ${user
                                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                                    : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/20'
                                    }`}
                            >
                                <LogOut className={`mr-2 h-4 w-4 ${!user && 'rotate-180'}`} />
                                {user ? 'Logout' : 'Login Staff'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
