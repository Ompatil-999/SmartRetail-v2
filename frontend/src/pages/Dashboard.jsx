import { useState, useEffect } from 'react';
import api from '../services/api';
import { CubeIcon, UsersIcon, ShoppingCartIcon, CurrencyDollarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/store/dashboard').then(res => setData(res.data.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const Skeleton = () => (
        <div className="card p-6 animate-pulse">
            <div className="h-4 bg-gray-200/60 rounded-lg w-24 mb-4" />
            <div className="h-8 bg-gray-200/60 rounded-lg w-16" />
        </div>
    );

    if (loading) return (
        <div className="space-y-6">
            <div className="h-8 bg-gray-200/60 rounded-xl w-48 animate-pulse mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => <Skeleton key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-80 bg-gray-200/60 rounded-3xl animate-pulse" />
                <div className="h-80 bg-gray-200/60 rounded-3xl animate-pulse" />
            </div>
        </div>
    );

    const stats = [
        { label: 'Total Products', value: data?.totalProducts || 0, icon: CubeIcon, bg: 'bg-primary-50', text: 'text-primary-600' },
        { label: 'Total Customers', value: data?.totalCustomers || 0, icon: UsersIcon, bg: 'bg-emerald-50', text: 'text-emerald-600' },
        { label: 'Total Bills', value: data?.totalBills || 0, icon: ShoppingCartIcon, bg: 'bg-violet-50', text: 'text-violet-600' },
        { label: 'Total Revenue', value: `₹${(data?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: CurrencyDollarIcon, bg: 'bg-amber-50', text: 'text-amber-600' },
        { label: 'Low Stock Items', value: data?.lowStockProducts || 0, icon: ExclamationTriangleIcon, bg: 'bg-red-50', text: 'text-red-600' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="text-[var(--color-text-secondary)] mt-2 font-medium">Welcome back! Here's your store overview.</p>
                </div>
                <Link to="/billing" className="btn-primary flex items-center justify-center gap-2 py-3 px-6 rounded-2xl shadow-lg shadow-indigo-200">
                    <ShoppingCartIcon className="w-5 h-5" />
                    New Transaction
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {stats.map(({ label, value, icon: Icon, bg, text }) => (
                    <div key={label} className="card p-6 group hover:border-[var(--color-primary)] transition-all duration-300">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2">{label}</p>
                                <p className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">{value}</p>
                            </div>
                            <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                                <Icon className={`w-6 h-6 ${text}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts & Trends Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Trend Chart */}
                <div className="lg:col-span-2 card p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Sales Trend</h2>
                            <p className="text-sm text-[var(--color-text-secondary)] font-medium">Revenue over the last 7 days</p>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.salesTrend || []}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500}}
                                    dy={10}
                                    tickFormatter={(str) => {
                                        const date = new Date(str);
                                        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                                    }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500}}
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                    formatter={(value) => [`₹${value}`, 'Revenue']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="total" 
                                    stroke="var(--color-primary)" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorTotal)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="card p-8">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">Top Selling Products</h2>
                    <div className="space-y-6">
                        {data?.topSellingProducts?.length > 0 ? (
                            data.topSellingProducts.map((product, idx) => (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-[var(--color-surface-50)] rounded-xl flex items-center justify-center text-sm font-bold text-[var(--color-primary)]">
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">{product.name}</p>
                                            <p className="text-xs text-[var(--color-text-secondary)] font-medium">{product.quantitySold} units sold</p>
                                        </div>
                                    </div>
                                    <div className="h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-[var(--color-primary)] rounded-full" 
                                            style={{ width: `${Math.max(10, 100 - (idx * 20))}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-sm text-[var(--color-text-secondary)] font-medium">No sales data yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card p-8">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Inventory', href: '/products', style: 'bg-primary-50 text-primary-700 hover:bg-primary-500 hover:text-white border border-primary-100 hover:border-primary-500' },
                        { label: 'Customer DB', href: '/customers', style: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white border border-emerald-100 hover:border-emerald-500' },
                        { label: 'Reports', href: '/transactions', style: 'bg-violet-50 text-violet-700 hover:bg-violet-500 hover:text-white border border-violet-100 hover:border-violet-500' },
                        { label: 'Settings', href: '/settings', style: 'bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white border border-amber-100 hover:border-amber-500' },
                    ].map(({ label, href, style }) => (
                        <Link key={label} to={href}
                            className={`${style} text-sm font-semibold py-4 px-6 rounded-2xl text-center transition-all duration-300 shadow-sm hover:shadow-md`}>
                            {label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
