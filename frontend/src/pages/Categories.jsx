import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, TagIcon } from '@heroicons/react/24/outline';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState({ open: false, edit: null });
    const [form, setForm] = useState({ name: '', description: '' });

    const load = () => {
        const url = search ? `/categories?search=${search}` : '/categories';
        api.get(url).then(r => setCategories(r.data.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [search]);

    const openCreate = () => { setForm({ name: '', description: '' }); setModal({ open: true, edit: null }); };
    const openEdit = (cat) => { setForm({ name: cat.name, description: cat.description || '' }); setModal({ open: true, edit: cat }); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modal.edit) {
                await api.put(`/categories/${modal.edit.id}`, form);
                toast.success('Category updated');
            } else {
                await api.post('/categories', form);
                toast.success('Category created');
            }
            setModal({ open: false, edit: null });
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this category?')) return;
        try {
            await api.delete(`/categories/${id}`);
            toast.success('Category deleted');
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="page-title">Categories</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1 font-medium">Manage your product categories</p>
                </div>
                <button onClick={openCreate} className="btn-primary shadow-sm hover:shadow-md">
                    <PlusIcon className="w-5 h-5" /> Add Category
                </button>
            </div>

            <div className="relative max-w-md">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input className="input-field pl-12" placeholder="Search categories..."
                    value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {loading ? (
                <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="card p-5 animate-pulse"><div className="h-6 bg-gray-200/60 rounded-lg w-1/3" /></div>)}</div>
            ) : categories.length === 0 ? (
                <div className="card p-16 text-center border-dashed border-2">
                    <TagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">No categories found</h3>
                    <p className="text-[var(--color-text-secondary)] mb-6">Create your first category to start organizing products.</p>
                    <button onClick={openCreate} className="btn-secondary"><PlusIcon className="w-5 h-5" /> Add Category</button>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--color-surface-50)] border-b border-[var(--color-border-color)]">
                                <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider hidden sm:table-cell">Description</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border-color)]">
                            {categories.map(cat => (
                                <tr key={cat.id} className="hover:bg-[var(--color-surface-50)] transition-colors duration-200">
                                    <td className="px-6 py-4 font-bold text-[var(--color-text-primary)]">{cat.name}</td>
                                    <td className="px-6 py-4 text-[var(--color-text-secondary)] text-sm hidden sm:table-cell">{cat.description || '—'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(cat)} className="p-2 rounded-xl hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors"><PencilIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={modal.open} onClose={() => setModal({ open: false, edit: null })} title={modal.edit ? 'Edit Category' : 'New Category'}>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="label-text">Name</label>
                        <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div>
                        <label className="label-text">Description</label>
                        <textarea className="input-field" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t border-[var(--color-border-color)]">
                        <button type="button" onClick={() => setModal({ open: false, edit: null })} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">{modal.edit ? 'Save Changes' : 'Create Category'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
