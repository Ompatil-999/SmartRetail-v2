import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    HomeIcon, TagIcon, CubeIcon, UsersIcon, ShoppingCartIcon,
    GiftIcon, Cog6ToothIcon, ArrowRightStartOnRectangleIcon,
    Bars3Icon, XMarkIcon, BuildingStorefrontIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';

const navItems = [
    { path: '/', icon: HomeIcon, label: 'Dashboard' },
    { path: '/categories', icon: TagIcon, label: 'Categories' },
    { path: '/products', icon: CubeIcon, label: 'Products' },
    { path: '/customers', icon: UsersIcon, label: 'Customers' },
    { path: '/billing', icon: ShoppingCartIcon, label: 'Billing' },
    { path: '/transactions', icon: ArrowPathIcon, label: 'Transactions' },
    { path: '/offers', icon: GiftIcon, label: 'Offers' },
    { path: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
];

export default function Layout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const Sidebar = ({ mobile = false }) => (
        <div className={`flex flex-col h-full bg-[#222831] border-r border-[#222831] shadow-xl ${mobile ? 'w-72' : collapsed ? 'w-20' : 'w-64'} transition-all duration-300`}>
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <BuildingStorefrontIcon className="w-6 h-6 text-white" />
                </div>
                {(!collapsed || mobile) && (
                    <div className="overflow-hidden">
                        <h1 className="text-xl font-bold text-white tracking-wide truncate">SmartRetail</h1>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                {navItems.map(({ path, icon: Icon, label }) => (
                    <NavLink key={path} to={path} end={path === '/'}
                        onClick={() => mobile && setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${isActive ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        <Icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-300 ${collapsed && !mobile ? 'mx-auto' : ''}`} />
                        {(!collapsed || mobile) && <span className="truncate">{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom */}
            <div className="p-4 border-t border-white/10">
                <button onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300">
                    <ArrowRightStartOnRectangleIcon className={`w-5 h-5 flex-shrink-0 ${collapsed && !mobile ? 'mx-auto' : ''}`} />
                    {(!collapsed || mobile) && <span>Log out</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#F5F7FA] font-sans">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block flex-shrink-0 z-20">
                <Sidebar />
            </div>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <div className="relative h-full shadow-2xl">
                        <Sidebar mobile />
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 z-10">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-4 lg:px-8 shadow-sm">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                                <Bars3Icon className="w-6 h-6 text-gray-600" />
                            </button>
                            <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex p-2.5 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                                <Bars3Icon className="w-6 h-6 text-gray-600" />
                            </button>
                            <div className="hidden sm:block">
                                <h2 className="text-xl font-bold text-gray-800 tracking-tight">Dashboard Overview</h2>
                                <p className="text-sm text-gray-500 font-medium">Welcome back, {user?.ownerName}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900">{user?.storeName}</p>
                                <p className="text-xs font-medium text-gray-500">Administrator</p>
                            </div>
                            <div className="w-11 h-11 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 font-bold text-lg border border-primary-100 shadow-sm">
                                {user?.ownerName?.charAt(0)?.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
