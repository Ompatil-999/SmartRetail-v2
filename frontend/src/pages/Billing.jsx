import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import InvoiceView from '../components/InvoiceView';
import { MagnifyingGlassIcon, PlusIcon, MinusIcon, ShoppingCartIcon, XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline';

export default function Billing() {
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [billDiscount, setBillDiscount] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [lastBill, setLastBill] = useState(null);
    const [taxRate, setTaxRate] = useState(18);
    const [showInvoice, setShowInvoice] = useState(false);

    // Inline new customer
    const [showNewCustomer, setShowNewCustomer] = useState(false);
    const [newCust, setNewCust] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        api.get('/products').then(r => setProducts(r.data.data)).catch(() => { });
        api.get('/customers').then(r => setCustomers(r.data.data)).catch(() => { });
        api.get('/store').then(r => setTaxRate(parseFloat(r.data.data.defaultTaxRate))).catch(() => { });
    }, []);

    const searchResults = search.trim()
        ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode && p.barcode.includes(search)))
        : products;

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(i => i.productId === product.id);
            if (existing) {
                if (existing.quantity >= product.stockQty) { toast.error('No more stock available'); return prev; }
                return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            if (product.stockQty <= 0) { toast.error('Out of stock'); return prev; }
            return [...prev, { productId: product.id, name: product.name, price: parseFloat(product.price), quantity: 1, discount: 0, maxStock: product.stockQty, imageUrl: product.imageUrl }];
        });
    };

    const updateQty = (productId, delta) => {
        setCart(prev => prev.map(i => {
            if (i.productId !== productId) return i;
            const newQty = i.quantity + delta;
            if (newQty <= 0) return i;
            if (newQty > i.maxStock) { toast.error('Exceeds stock'); return i; }
            return { ...i, quantity: newQty };
        }));
    };

    const updateItemDiscount = (productId, discount) => {
        setCart(prev => prev.map(i => i.productId === productId ? { ...i, discount: parseFloat(discount) || 0 } : i));
    };

    const removeFromCart = (productId) => setCart(prev => prev.filter(i => i.productId !== productId));

    // Calculations: Subtotal → Item Discount → Bill Discount → GST → Total
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const totalItemDiscount = cart.reduce((sum, i) => sum + (i.discount || 0), 0);
    const billDiscountPercent = parseFloat(billDiscount) || 0;
    const afterItemDiscount = Math.max(subtotal - totalItemDiscount, 0);
    const billDiscountAmount = +(afterItemDiscount * billDiscountPercent / 100).toFixed(2);
    const taxableAmount = Math.max(afterItemDiscount - billDiscountAmount, 0);
    const gstAmount = +(taxableAmount * taxRate / 100).toFixed(2);
    const totalAmount = +(taxableAmount + gstAmount).toFixed(2);

    const handleCreateCustomer = async () => {
        if (!newCust.name.trim()) { toast.error('Customer name required'); return; }
        try {
            const res = await api.post('/customers', newCust);
            const created = res.data.data;
            setCustomers(prev => [...prev, created]);
            setCustomerId(String(created.id));
            setNewCust({ name: '', email: '', phone: '' });
            setShowNewCustomer(false);
            toast.success('Customer created & selected');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create customer');
        }
    };

    const handleSubmit = async () => {
        if (cart.length === 0) { toast.error('Cart is empty'); return; }
        setSubmitting(true);
        try {
            const payload = {
                customerId: customerId || null,
                billDiscountPercentage: billDiscountPercent,
                items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, discount: i.discount || 0 }))
            };
            const res = await api.post('/bills', payload);
            setLastBill(res.data.data);
            setShowInvoice(true);
            setCart([]);
            setBillDiscount('');
            setCustomerId('');
            setSearch('');
            toast.success('Bill generated successfully!');
            // Refresh product stock
            api.get('/products').then(r => setProducts(r.data.data)).catch(() => { });
            api.get('/customers').then(r => setCustomers(r.data.data)).catch(() => { });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Billing failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-title">Billing</h1>
                <p className="text-[var(--color-text-secondary)] mt-1 font-medium">Create invoices and manage transactions</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                {/* Left: Product Search */}
                <div className="xl:col-span-3 space-y-4">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input className="input-field pl-12 text-base" placeholder="Search products by name or barcode..."
                            value={search} onChange={e => setSearch(e.target.value)} autoFocus />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-1 custom-scrollbar">
                        {searchResults.map(p => (
                            <button key={p.id} onClick={() => addToCart(p)} disabled={p.stockQty <= 0}
                                className="card p-4 text-left hover:border-primary-300 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group">
                                <div className="flex gap-4 items-start">
                                    {p.imageUrl ? (
                                        <img src={`http://localhost:8080${p.imageUrl}`} alt={p.name}
                                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-[var(--color-border-color)] shadow-sm" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-xl bg-[var(--color-surface-50)] flex items-center justify-center flex-shrink-0 border border-[var(--color-border-color)]">
                                            <span className="text-gray-400 text-xl">📦</span>
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-[var(--color-text-primary)] text-sm truncate group-hover:text-primary-600 transition-colors">{p.name}</p>
                                        {p.barcode && <p className="text-xs text-[var(--color-text-secondary)] font-mono mt-1">{p.barcode}</p>}
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-sm font-extrabold text-primary-600">₹{p.price}</p>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${p.stockQty <= (p.lowStockThreshold || 10) ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                                                Stock: {p.stockQty}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                        {searchResults.length === 0 && (
                            <div className="col-span-full text-center py-16 text-[var(--color-text-secondary)] font-medium">No products found</div>
                        )}
                    </div>
                </div>

                {/* Right: Cart */}
                <div className="xl:col-span-2">
                    <div className="card sticky top-24 overflow-hidden border border-[var(--color-border-color)] shadow-xl shadow-black/5">
                        <div className="px-6 py-5 border-b border-[var(--color-border-color)] bg-[var(--color-surface-50)] flex items-center gap-3">
                            <ShoppingCartIcon className="w-6 h-6 text-primary-600" />
                            <h2 className="font-bold text-[var(--color-text-primary)] text-lg">Current Order</h2>
                            <span className="ml-auto bg-primary-100 text-primary-800 text-xs font-bold px-2.5 py-1 rounded-lg">{cart.length} items</span>
                        </div>

                        {cart.length === 0 ? (
                            <div className="p-12 text-center text-[var(--color-text-secondary)]">
                                <ShoppingCartIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p className="font-medium">Select products to start billing</p>
                            </div>
                        ) : (
                            <div className="max-h-[300px] overflow-y-auto divide-y divide-[var(--color-border-color)] custom-scrollbar">
                                {cart.map(item => (
                                    <div key={item.productId} className="px-6 py-4 hover:bg-[var(--color-surface-50)] transition-colors">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-sm text-[var(--color-text-primary)] truncate">{item.name}</p>
                                                <p className="text-xs font-medium text-[var(--color-text-secondary)] mt-1">₹{item.price} × {item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-sm text-[var(--color-text-primary)] whitespace-nowrap">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-3 mt-3">
                                            <div className="flex items-center border border-[var(--color-border-color)] bg-white rounded-xl shadow-sm">
                                                <button onClick={() => updateQty(item.productId, -1)} className="p-2 hover:bg-gray-50 transition rounded-l-xl">
                                                    <MinusIcon className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                                </button>
                                                <span className="px-3 text-sm font-bold min-w-[2.5rem] text-center text-[var(--color-text-primary)]">{item.quantity}</span>
                                                <button onClick={() => updateQty(item.productId, 1)} className="p-2 hover:bg-gray-50 transition rounded-r-xl">
                                                    <PlusIcon className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                                </button>
                                            </div>
                                            <input type="number" min="0" step="0.01" placeholder="Disc ₹"
                                                className="w-24 text-xs font-medium px-3 py-2 border border-[var(--color-border-color)] rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                                value={item.discount || ''} onChange={e => updateItemDiscount(item.productId, e.target.value)} />
                                            <button onClick={() => removeFromCart(item.productId)} className="p-2 hover:bg-red-50 rounded-xl transition ml-auto group">
                                                <XMarkIcon className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Customer Selection + Inline Create */}
                        <div className="px-6 py-5 border-t border-[var(--color-border-color)] space-y-4 bg-white">
                            <div className="flex items-center gap-3">
                                <select className="input-field text-sm font-medium flex-1 bg-[var(--color-surface-50)]" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                                    <option value="">Walk-in Customer</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.email ? `(${c.email})` : c.phone ? `(${c.phone})` : ''}</option>)}
                                </select>
                                <button onClick={() => setShowNewCustomer(!showNewCustomer)}
                                    className="p-3 border border-[var(--color-border-color)] rounded-xl hover:bg-primary-50 hover:border-primary-200 transition-colors shadow-sm"
                                    title="Add new customer">
                                    <UserPlusIcon className="w-5 h-5 text-primary-600" />
                                </button>
                            </div>

                            {/* Inline New Customer Form */}
                            {showNewCustomer && (
                                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 space-y-3 shadow-sm">
                                    <p className="text-sm font-bold text-primary-800">Quick Add Customer</p>
                                    <input className="input-field text-sm bg-white" placeholder="Name *" value={newCust.name}
                                        onChange={e => setNewCust({ ...newCust, name: e.target.value })} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input className="input-field text-sm bg-white" placeholder="Email" value={newCust.email}
                                            onChange={e => setNewCust({ ...newCust, email: e.target.value })} />
                                        <input className="input-field text-sm bg-white" placeholder="Phone" value={newCust.phone}
                                            onChange={e => setNewCust({ ...newCust, phone: e.target.value })} />
                                    </div>
                                    <div className="flex gap-3 pt-1">
                                        <button onClick={handleCreateCustomer}
                                            className="btn-primary text-xs py-2 px-4 shadow-sm">Create & Select</button>
                                        <button onClick={() => { setShowNewCustomer(false); setNewCust({ name: '', email: '', phone: '' }); }}
                                            className="text-xs font-semibold text-[var(--color-text-secondary)] hover:text-gray-900 transition-colors">Cancel</button>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <label className="text-sm font-bold text-[var(--color-text-secondary)] whitespace-nowrap">Bill Discount (%):</label>
                                <input type="number" min="0" max="100" step="0.01" className="input-field text-sm font-bold bg-[var(--color-surface-50)]" placeholder="0.00"
                                    value={billDiscount} onChange={e => setBillDiscount(e.target.value)} />
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="px-6 py-5 border-t border-[var(--color-border-color)] bg-[var(--color-surface-50)] space-y-2.5 text-sm font-medium">
                            <div className="flex justify-between text-[var(--color-text-secondary)]"><span>Subtotal</span><span className="font-bold text-[var(--color-text-primary)]">₹{subtotal.toFixed(2)}</span></div>
                            {totalItemDiscount > 0 && <div className="flex justify-between text-accent-600"><span>Item Discounts</span><span className="font-bold">-₹{totalItemDiscount.toFixed(2)}</span></div>}
                            {billDiscountPercent > 0 && <div className="flex justify-between text-accent-600"><span>Bill Discount ({billDiscountPercent}%)</span><span className="font-bold">-₹{billDiscountAmount.toFixed(2)}</span></div>}
                            <div className="flex justify-between text-[var(--color-text-secondary)]"><span>GST ({taxRate}%)</span><span className="font-bold text-[var(--color-text-primary)]">₹{gstAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between text-xl font-extrabold text-[var(--color-text-primary)] pt-3 mt-3 border-t border-[var(--color-border-color)]">
                                <span>Total</span><span className="text-primary-600">₹{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="p-5 bg-white border-t border-[var(--color-border-color)]">
                            <button onClick={handleSubmit} disabled={cart.length === 0 || submitting}
                                className="btn-primary w-full justify-center text-lg py-3.5 shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:shadow-none">
                                {submitting ? <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" /> : 'Generate Invoice'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice View Modal */}
            {showInvoice && lastBill && (
                <InvoiceView bill={lastBill} onClose={() => setShowInvoice(false)} />
            )}

            {/* Last Bill Summary (compact) */}
            {lastBill && !showInvoice && (
                <div className="card p-5 border-l-4 border-l-primary-500 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-[var(--color-text-primary)] text-sm">Last Invoice Generated: <span className="text-primary-600">{lastBill.billNumber}</span></h3>
                        <p className="text-sm font-medium text-[var(--color-text-secondary)] mt-1">Total: ₹{parseFloat(lastBill.totalAmount).toFixed(2)} • {lastBill.items?.length} items</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={() => setShowInvoice(true)}
                            className="flex-1 sm:flex-none text-center px-4 py-2 text-sm font-bold text-primary-700 bg-primary-50 border border-primary-100 hover:bg-primary-100 rounded-xl transition-colors shadow-sm">
                            View Invoice
                        </button>
                        <button onClick={() => setLastBill(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <XMarkIcon className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
