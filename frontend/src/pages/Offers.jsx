import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, GiftIcon } from '@heroicons/react/24/outline';

export default function Offers() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, edit: null });
    const [form, setForm] = useState({ title: '', description: '', discount: '', validFrom: '', validTill: '' });

    const load = () => {
        api.get('/offers').then(r => setOffers(r.data.data)).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setForm({ title: '', description: '', discount: '', validFrom: '', validTill: '' });
        setModal({ open: true, edit: null });
    };
    const openEdit = (o) => {
        setForm({ title: o.title, description: o.description || '', discount: o.discount, validFrom: o.validFrom || '', validTill: o.validTill });
        setModal({ open: true, edit: o });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...form, discount: parseFloat(form.discount), validFrom: form.validFrom || null };
        try {
            if (modal.edit) {
                await api.put(`/offers/${modal.edit.id}`, payload);
                toast.success('Offer updated');
            } else {
                await api.post('/offers', payload);
                toast.success('Offer created & emails sent!');
            }
            setModal({ open: false, edit: null });
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this offer?')) return;
        try { await api.delete(`/offers/${id}`); toast.success('Deleted'); load(); } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="page-title">Offers & Promotions</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1 font-medium">Create and manage promotional offers</p>
                </div>
                <button onClick={openCreate} className="btn-primary shadow-sm hover:shadow-md"><PlusIcon className="w-5 h-5" /> Create Offer</button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <div key={i} className="card p-6 animate-pulse"><div className="h-6 bg-gray-200/60 rounded-lg w-1/2 mb-4" /><div className="h-4 bg-gray-200/60 rounded-lg w-3/4" /></div>)}
                </div>
            ) : offers.length === 0 ? (
                <div className="card p-16 text-center border-dashed border-2">
                    <GiftIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">No offers yet</h3>
                    <p className="text-[var(--color-text-secondary)] mb-6">Create your first promotional offer to boost sales!</p>
                    <button onClick={openCreate} className="btn-secondary"><PlusIcon className="w-5 h-5" /> Create Offer</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map(offer => (
                        <div key={offer.id} className={`card p-6 hover:-translate-y-1 transition-transform duration-300 ${offer.expired ? 'opacity-60 bg-gray-50' : ''}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] truncate">{offer.title}</h3>
                                    <p className="text-sm font-medium text-[var(--color-text-secondary)] mt-1 line-clamp-2">{offer.description || 'No description provided'}</p>
                                </div>
                                <div className="flex-shrink-0">
                                    <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-lg font-extrabold px-3 py-1.5 rounded-xl shadow-sm">
                                        {parseFloat(offer.discount)}%
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-2">
                                {offer.validFrom && (
                                    <p className="text-xs font-semibold text-[var(--color-text-secondary)]">From: <span className="text-[var(--color-text-primary)]">{offer.validFrom}</span></p>
                                )}
                                <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Expires: <span className="text-[var(--color-text-primary)]">{offer.validTill}</span></p>
                                <div className="flex items-center gap-2 pt-1">
                                    {offer.expired ? <span className="badge-danger">Expired</span> : offer.active ? <span className="badge-success">Active</span> : <span className="badge-warning">Inactive</span>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[var(--color-border-color)]">
                                <button onClick={() => openEdit(offer)} className="flex-1 flex justify-center p-2.5 rounded-xl hover:bg-primary-50 text-[var(--color-text-secondary)] hover:text-primary-600 transition-colors font-semibold text-sm gap-2">
                                    <PencilIcon className="w-4 h-4" /> Edit
                                </button>
                                <button onClick={() => handleDelete(offer.id)} className="flex-1 flex justify-center p-2.5 rounded-xl hover:bg-red-50 text-[var(--color-text-secondary)] hover:text-red-600 transition-colors font-semibold text-sm gap-2">
                                    <TrashIcon className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={modal.open} onClose={() => setModal({ open: false, edit: null })} title={modal.edit ? 'Edit Offer' : 'Create Offer'}>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div><label className="label-text">Offer Title</label><input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
                    <div><label className="label-text">Description</label><textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div><label className="label-text">Discount (%)</label><input type="number" min="0.01" max="100" step="0.01" className="input-field" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} required /></div>
                        <div><label className="label-text">Valid From</label><input type="date" className="input-field" value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })} /></div>
                        <div><label className="label-text">Valid Till</label><input type="date" className="input-field" value={form.validTill} onChange={e => setForm({ ...form, validTill: e.target.value })} required /></div>
                    </div>
                    {!modal.edit && <div className="bg-primary-50 border border-primary-100 text-primary-700 p-4 rounded-2xl text-sm font-medium">📧 Creating an offer will automatically send email notifications to all your store customers.</div>}
                    <div className="flex justify-end gap-4 pt-4 border-t border-[var(--color-border-color)]">
                        <button type="button" onClick={() => setModal({ open: false, edit: null })} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">{modal.edit ? 'Save Changes' : 'Create & Notify'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
