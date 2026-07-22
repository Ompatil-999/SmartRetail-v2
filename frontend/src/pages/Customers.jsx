import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, EyeIcon, UserGroupIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState({ open: false, edit: null });
    const [historyModal, setHistoryModal] = useState({ open: false, customer: null, bills: [] });
    const [form, setForm] = useState({ name: '', email: '', phone: '' });

    const load = () => {
        const url = search ? `/customers?search=${search}` : '/customers';
        api.get(url).then(r => setCustomers(r.data.data)).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [search]);

    const openCreate = () => { setForm({ name: '', email: '', phone: '' }); setModal({ open: true, edit: null }); };
    const openEdit = (c) => { setForm({ name: c.name, email: c.email || '', phone: c.phone || '' }); setModal({ open: true, edit: c }); };

    const viewHistory = async (customer) => {
        try {
            const res = await api.get(`/customers/${customer.id}/bills`);
            setHistoryModal({ open: true, customer, bills: res.data.data });
        } catch { toast.error('Failed to load bills'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modal.edit) {
                await api.put(`/customers/${modal.edit.id}`, form);
                toast.success('Customer updated');
            } else {
                await api.post('/customers', form);
                toast.success('Customer created');
            }
            setModal({ open: false, edit: null });
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this customer?')) return;
        try { await api.delete(`/customers/${id}`); toast.success('Deleted'); load(); } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="page-title">Customers</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1 font-medium">Manage your customer database</p>
                </div>
                <button onClick={openCreate} className="btn-primary shadow-sm hover:shadow-md"><PlusIcon className="w-5 h-5" /> Add Customer</button>
            </div>

            <div className="relative max-w-md">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input className="input-field pl-12" placeholder="Search customers by name, phone or email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {loading ? (
                <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="card p-5 animate-pulse"><div className="h-6 bg-gray-200/60 rounded-lg w-1/3" /></div>)}</div>
            ) : customers.length === 0 ? (
                <div className="card p-16 text-center border-dashed border-2">
                    <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">No customers found</h3>
                    <p className="text-[var(--color-text-secondary)] mb-6">Start building your customer base by adding a new customer.</p>
                    <button onClick={openCreate} className="btn-secondary"><PlusIcon className="w-5 h-5" /> Add Customer</button>
                </div>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--color-surface-50)] border-b border-[var(--color-border-color)]">
                                <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider hidden sm:table-cell">Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider hidden md:table-cell">Phone</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border-color)]">
                            {customers.map(c => (
                                <tr key={c.id} className="hover:bg-[var(--color-surface-50)] transition-colors duration-200">
                                    <td className="px-6 py-4 font-bold text-[var(--color-text-primary)]">{c.name}</td>
                                    <td className="px-6 py-4 text-[var(--color-text-secondary)] text-sm hidden sm:table-cell">{c.email || '—'}</td>
                                    <td className="px-6 py-4 text-[var(--color-text-secondary)] text-sm hidden md:table-cell">{c.phone || '—'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => viewHistory(c)} className="p-2 rounded-xl hover:bg-violet-50 text-gray-400 hover:text-violet-600 transition-colors" title="View Purchase History"><EyeIcon className="w-5 h-5" /></button>
                                            <button onClick={() => openEdit(c)} className="p-2 rounded-xl hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors"><PencilIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(c.id)} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={modal.open} onClose={() => setModal({ open: false, edit: null })} title={modal.edit ? 'Edit Customer' : 'New Customer'}>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div><label className="label-text">Full Name</label><input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div><label className="label-text">Email Address</label><input type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                        <div><label className="label-text">Phone Number</label><input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t border-[var(--color-border-color)]">
                        <button type="button" onClick={() => setModal({ open: false, edit: null })} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">{modal.edit ? 'Save Changes' : 'Create Customer'}</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={historyModal.open} onClose={() => setHistoryModal({ open: false, customer: null, bills: [] })} title={`Purchase History — ${historyModal.customer?.name || ''}`} size="lg">
                {historyModal.bills.length === 0 ? (
                    <div className="text-center py-12">
                        <ShoppingCartIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-[var(--color-text-secondary)] font-medium">No purchase history found for this customer.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {historyModal.bills.map(bill => (
                            <div key={bill.id} className="border border-[var(--color-border-color)] rounded-2xl p-5 hover:border-primary-200 hover:shadow-sm transition-all duration-200 bg-white">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                    <div>
                                        <p className="font-bold text-[var(--color-text-primary)] text-lg">{bill.billNumber}</p>
                                        <p className="text-sm font-medium text-[var(--color-text-secondary)]">{new Date(bill.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary-600 text-xl">₹{parseFloat(bill.totalAmount).toLocaleString('en-IN')}</p>
                                        <div className="text-sm font-medium text-[var(--color-text-secondary)]">{bill.items?.length || 0} items purchased</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </div>
    );
}
