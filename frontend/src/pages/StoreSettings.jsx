import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { BuildingStorefrontIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function StoreSettings() {
    const { updateUser } = useAuth();
    const [form, setForm] = useState({ storeName: '', gstNumber: '', defaultTaxRate: '', address: '', phone: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get('/store').then(r => {
            const s = r.data.data;
            setForm({ storeName: s.storeName || '', gstNumber: s.gstNumber || '', defaultTaxRate: s.defaultTaxRate || '', address: s.address || '', phone: s.phone || '' });
        }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/store', { ...form, defaultTaxRate: parseFloat(form.defaultTaxRate) || 18 });
            updateUser({ storeName: form.storeName });
            toast.success('Store settings saved');
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
        finally { setSaving(false); }
    };

    if (loading) return (
        <div className="space-y-6 max-w-3xl">
            <div className="h-8 bg-gray-200/60 rounded-lg w-48 animate-pulse" />
            <div className="card p-8 space-y-6">
                {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-200/60 rounded-xl animate-pulse" />)}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-[var(--color-border-color)]">
                    <BuildingStorefrontIcon className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                    <h1 className="page-title">Store Settings</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1 font-medium">Manage your store profile and core configuration</p>
                </div>
            </div>

            <div className="card p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="pb-4 border-b border-[var(--color-border-color)] mb-6">
                        <h2 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                            <Cog6ToothIcon className="w-5 h-5 text-gray-400" /> General Information
                        </h2>
                    </div>

                    <div>
                        <label className="label-text">Store Name</label>
                        <input className="input-field" placeholder="Enter your business name" value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })} required />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="label-text">GST Number</label>
                            <input className="input-field font-mono text-sm" placeholder="Optional" value={form.gstNumber} onChange={e => setForm({ ...form, gstNumber: e.target.value })} />
                        </div>
                        <div>
                            <label className="label-text">Default Tax Rate (%)</label>
                            <input type="number" step="0.01" min="0" max="100" className="input-field" placeholder="18" value={form.defaultTaxRate} onChange={e => setForm({ ...form, defaultTaxRate: e.target.value })} />
                        </div>
                    </div>
                    
                    <div>
                        <label className="label-text">Business Address</label>
                        <textarea className="input-field" rows={3} placeholder="Full address of the store" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                    </div>
                    
                    <div>
                        <label className="label-text">Contact Phone</label>
                        <input className="input-field" placeholder="Customer support or store phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    
                    <div className="pt-6 mt-6 border-t border-[var(--color-border-color)] flex justify-end">
                        <button type="submit" disabled={saving} className="btn-primary px-8 py-3 shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:shadow-none">
                            {saving ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Saving...
                                </span>
                            ) : 'Save Configuration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
