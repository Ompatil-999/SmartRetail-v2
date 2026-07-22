import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
    MagnifyingGlassIcon, 
    CalendarIcon, 
    FunnelIcon, 
    ArrowPathIcon,
    EyeIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import InvoiceView from '../components/InvoiceView';

export default function Transactions() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBill, setSelectedBill] = useState(null);
    const [search, setSearch] = useState('');
    
    const currentYear = new Date().getFullYear();
    const [filter, setFilter] = useState({ 
        month: (new Date().getMonth() + 1).toString(), 
        year: currentYear.toString() 
    });

    const months = [
        { value: '', label: 'All Months' },
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
        years.push(i.toString());
    }

    const fetchBills = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter.month) params.month = filter.month;
            if (filter.year) params.year = filter.year;
            const res = await api.get('/bills', { params });
            setBills(res.data.data);
        } catch (err) {
            toast.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, [filter]);

    const filteredBills = bills.filter(b => 
        b.billNumber.toLowerCase().includes(search.toLowerCase()) ||
        (b.customerName && b.customerName.toLowerCase().includes(search.toLowerCase()))
    );

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const totalRevenue = filteredBills.reduce((sum, b) => sum + parseFloat(b.totalAmount), 0);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Transactions</h1>
                    <p className="text-[var(--color-text-secondary)] mt-2 font-medium">View and filter your store sales history</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-[var(--color-border-color)] shadow-sm">
                    <div className="flex items-center gap-2 px-4 py-2 border-r border-[var(--color-border-color)]">
                        <CalendarIcon className="w-5 h-5 text-[var(--color-text-secondary)]" />
                        <select 
                            className="bg-transparent text-sm font-bold text-[var(--color-text-primary)] focus:outline-none cursor-pointer"
                            value={filter.month}
                            onChange={e => setFilter({ ...filter, month: e.target.value })}
                        >
                            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2">
                        <select 
                            className="bg-transparent text-sm font-bold text-[var(--color-text-primary)] focus:outline-none cursor-pointer"
                            value={filter.year}
                            onChange={e => setFilter({ ...filter, year: e.target.value })}
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <button onClick={fetchBills} className="p-2.5 ml-1 bg-[var(--color-surface-50)] hover:bg-gray-100 rounded-xl transition-colors" title="Refresh">
                        <ArrowPathIcon className={`w-5 h-5 text-[var(--color-text-secondary)] ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="card p-6 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] text-white shadow-lg shadow-primary-500/20 border-none">
                    <p className="text-white/80 text-sm font-semibold mb-2">Total Period Revenue</p>
                    <p className="text-4xl font-bold tracking-tight">₹{totalRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="card p-6">
                    <p className="text-[var(--color-text-secondary)] text-sm font-semibold mb-2">Total Transactions</p>
                    <p className="text-4xl font-bold text-[var(--color-text-primary)] tracking-tight">{filteredBills.length}</p>
                </div>
                <div className="card p-6">
                    <p className="text-[var(--color-text-secondary)] text-sm font-semibold mb-2">Average Order Value</p>
                    <p className="text-4xl font-bold text-[var(--color-text-primary)] tracking-tight">₹{filteredBills.length ? (totalRevenue / filteredBills.length).toFixed(2) : '0.00'}</p>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="p-6 border-b border-[var(--color-border-color)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            className="input-field pl-12" 
                            placeholder="Search by bill number or customer..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] bg-[var(--color-surface-50)] px-4 py-2.5 rounded-xl border border-[var(--color-border-color)]">
                        <FunnelIcon className="w-4 h-4" />
                        <span>Showing {filteredBills.length} results</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[var(--color-surface-50)] text-[var(--color-text-secondary)] text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Bill Number</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4 text-right">Items</th>
                                <th className="px-6 py-4 text-right">Total Amount</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border-color)]">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-5"><div className="h-5 bg-gray-200/60 rounded-md" /></td>
                                    </tr>
                                ))
                            ) : filteredBills.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center text-[var(--color-text-secondary)] text-lg font-medium">No transactions found for the selected period</td>
                                </tr>
                            ) : (
                                filteredBills.map(bill => (
                                    <tr key={bill.id} className="hover:bg-[var(--color-surface-50)] transition-colors duration-200">
                                        <td className="px-6 py-4 font-mono text-sm font-bold text-primary-600">{bill.billNumber}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-[var(--color-text-secondary)]">{formatDate(bill.createdAt)}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-[var(--color-text-primary)]">{bill.customerName || 'Walk-in'}</div>
                                            {bill.customerPhone && <div className="text-xs font-medium text-[var(--color-text-secondary)] mt-0.5">{bill.customerPhone}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-[var(--color-text-secondary)] text-right">{bill.items?.length || 0}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-base font-bold text-[var(--color-text-primary)]">₹{parseFloat(bill.totalAmount).toLocaleString('en-IN')}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => setSelectedBill(bill)}
                                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                                                title="View Invoice"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedBill && (
                <InvoiceView bill={selectedBill} onClose={() => setSelectedBill(null)} />
            )}
        </div>
    );
}
