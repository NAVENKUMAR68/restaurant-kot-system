import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { SignOutButton } from '@/components/SignOutButton';
import {
    LayoutDashboard,
    UtensilsCrossed,
    Users,
    ShoppingBag,
    ChefHat,
    Menu,
    ClipboardList,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/login');
    }

    const role = session.user.role;

    const getNavItems = () => {
        switch (role) {
            case 'admin':
                return [
                    {
                        title: 'Overview',
                        href: '/dashboard/admin',
                        icon: LayoutDashboard,
                    },
                    {
                        title: 'Menu Management',
                        href: '/dashboard/admin/menu',
                        icon: Menu,
                    },
                    {
                        title: 'Orders',
                        href: '/dashboard/admin/orders',
                        icon: ClipboardList,
                    },
                    {
                        title: 'Users',
                        href: '/dashboard/admin/users',
                        icon: Users,
                    },
                ];
            case 'kitchen':
                return [
                    {
                        title: 'Kitchen Display',
                        href: '/dashboard/kitchen',
                        icon: ChefHat,
                    },
                ];
            case 'customer':
                return [
                    {
                        title: 'Menu',
                        href: '/dashboard/customer',
                        icon: UtensilsCrossed,
                    },
                    {
                        title: 'My Orders',
                        href: '/dashboard/customer/orders',
                        icon: ShoppingBag,
                    },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems();

    return (
        <div className="flex h-screen bg-slate-950">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-600/20">
                            <ChefHat className="h-6 w-6 text-blue-500" />
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-tight">
                            Smart KOT
                        </h1>
                    </div>
                    <div className="mt-4 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <p className="text-sm font-medium text-white truncate">
                            {session.user.name}
                        </p>
                        <p className="text-xs text-slate-400 capitalize">{role}</p>
                    </div>
                </div>

                <ScrollArea className="flex-1 px-4 py-4">
                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </ScrollArea>

                <div className="p-4 border-t border-slate-800">
                    <SignOutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
                <div className="flex-1 overflow-auto p-4 md:p-8">
                    {/* Mobile Header could go here */}
                    {children}
                </div>
            </main>
        </div>
    );
}
