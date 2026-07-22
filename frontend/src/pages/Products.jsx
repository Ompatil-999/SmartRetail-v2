import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, PhotoIcon, ArrowUpTrayIcon, CubeIcon } from '@heroicons/react/24/outline';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState({ open: false, edit: null });
    const [form, setForm] = useState({ name: '', description: '', price: '', barcode: '', stockQty: '', lowStockThreshold: '10', categoryId: '' });
    const [uploading, setUploading] = useState(null);
    const fileInputRef = useRef(null);

    const load = () => {
        const url = search ? `/products?search=${search}` : '/products';
        api.get(url).then(r => setProducts(r.data.data)).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [search]);
    useEffect(() => { api.get('/categories').then(r => setCategories(r.data.data)).catch(() => { }); }, []);

    const openCreate = () => {
        setForm({ name: '', description: '', price: '', barcode: '', stockQty: '', lowStockThreshold: '10', categoryId: '' });
        setModal({ open: true, edit: null });
    };
    const openEdit = (p) => {
        setForm({
            name: p.name, description: p.description || '', price: p.price,
            barcode: p.barcode || '', stockQty: p.stockQty, lowStockThreshold: p.lowStockThreshold || '10',
            categoryId: p.categoryId || ''
        });
        setModal({ open: true, edit: p });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...form, price: parseFloat(form.price), stockQty: parseInt(form.stockQty), lowStockThreshold: parseInt(form.lowStockThreshold) || 10, categoryId: form.categoryId || null };
        try {
            if (modal.edit) {
                await api.put(`/products/${modal.edit.id}`, payload);
                toast.success('Product updated');
            } else {
                await api.post('/products', payload);
                toast.success('Product created');
            }
            setModal({ open: false, edit: null });
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;
        try { await api.delete(`/products/${id}`); toast.success('Deleted'); load(); } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleImageUpload = async (productId, file) => {
        if (!file) return;
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.type)) { toast.error('Only JPG, PNG, WebP allowed'); return; }
        if (file.size > 2 * 1024 * 1024) { toast.error('Max 2MB file size'); return; }

        setUploading(productId);
        const formData = new FormData();
        formData.append('file', file);
        try {
            await api.post(`/products/${productId}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Image uploaded');
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(null);
        }
    };

    const triggerUpload = (productId) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/png,image/webp';
        input.onchange = (e) => handleImageUpload(productId, e.target.files[0]);
        input.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="page-title">Products</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1 font-medium">Manage inventory and product catalog</p>
                </div>
                <button onClick={openCreate} className="btn-primary shadow-sm hover:shadow-md"><PlusIcon className="w-5 h-5" /> Add Product</button>
            </div>

            <div className="relative max-w-md">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input className="input-field pl-12" placeholder="Search by name or barcode..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {loading ? (
                <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="card p-5 animate-pulse"><div className="h-6 bg-gray-200/60 rounded-lg w-1/2" /></div>)}</div>
            ) : products.length === 0 ? (
                <div className="card p-16 text-center border-dashed border-2">
                    <CubeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">No products found</h3>
                    <p className="text-[var(--color-text-secondary)] mb-6">Get started by adding your first product.</p>
                    <button onClick={openCreate} className="btn-secondary"><PlusIcon className="w-5 h-5" /> Add Product</button>
                </div>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--color-surface-50)] border-b border-[var(--color-border-color)]">
                                <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider hidden md:table-cell">Barcode</th>
                                <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider hidden sm:table-cell">Category</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Price</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Stock</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border-color)]">
                            {products.map(p => (
                                <tr key={p.id} className="hover:bg-[var(--color-surface-50)] transition-colors duration-200">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {p.imageUrl ? (
                                                <img src={`http://localhost:8080${p.imageUrl}`} alt={p.name}
                                                    className="w-12 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0 shadow-sm" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                                                    <PhotoIcon className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-[var(--color-text-primary)]">{p.name}</p>
                                                {p.description && <p className="text-xs text-[var(--color-text-secondary)] mt-1 truncate max-w-[200px]">{p.description}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)] font-mono hidden md:table-cell">{p.barcode || '—'}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-[var(--color-text-secondary)] hidden sm:table-cell">
                                        {p.categoryName ? <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs">{p.categoryName}</span> : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-[var(--color-text-primary)]">₹{parseFloat(p.price).toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={p.lowStock ? 'badge-danger' : 'badge-success'}>{p.stockQty}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => triggerUpload(p.id)} disabled={uploading === p.id}
                                                className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="Upload image">
                                                {uploading === p.id
                                                    ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                                                    : <ArrowUpTrayIcon className="w-5 h-5" />}
                                            </button>
                                            <button onClick={() => openEdit(p)} className="p-2 rounded-xl hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors"><PencilIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(p.id)} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={modal.open} onClose={() => setModal({ open: false, edit: null })} title={modal.edit ? 'Edit Product' : 'New Product'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div><label className="label-text">Name</label><input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                        <div><label className="label-text">Barcode</label><input className="input-field" value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} /></div>
                        <div><label className="label-text">Price (₹)</label><input type="number" step="0.01" min="0.01" className="input-field" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></div>
                        <div><label className="label-text">Stock Qty</label><input type="number" min="0" className="input-field" value={form.stockQty} onChange={e => setForm({ ...form, stockQty: e.target.value })} required /></div>
                        <div><label className="label-text">Low Stock Threshold</label><input type="number" min="0" className="input-field" value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })} /></div>
                        <div>
                            <label className="label-text">Category</label>
                            <select className="input-field bg-white" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                                <option value="">No category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div><label className="label-text">Description</label><textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                    <div className="flex justify-end gap-4 pt-4 border-t border-[var(--color-border-color)]">
                        <button type="button" onClick={() => setModal({ open: false, edit: null })} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">{modal.edit ? 'Save Changes' : 'Create Product'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
