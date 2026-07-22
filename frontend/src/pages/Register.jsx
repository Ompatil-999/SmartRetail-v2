import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';

export default function Register() {
    const [form, setForm] = useState({ ownerName: '', email: '', password: '', storeName: '', gstNumber: '' });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(form);
            toast.success('Store registered successfully!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-50)] p-4 relative overflow-hidden py-12">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary-500/5 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-xl">
                <div className="bg-white rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-[var(--color-border-color)] p-8 sm:p-10">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                            <BuildingStorefrontIcon className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">Create Your Store</h1>
                        <p className="text-[var(--color-text-secondary)] mt-2 font-medium">Get started with SmartRetail in seconds</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="label-text">Owner Name</label>
                                <input className="input-field" placeholder="John Doe"
                                    value={form.ownerName} onChange={e => update('ownerName', e.target.value)} required />
                            </div>
                            <div>
                                <label className="label-text">Store Name</label>
                                <input className="input-field" placeholder="My Retail Store"
                                    value={form.storeName} onChange={e => update('storeName', e.target.value)} required />
                            </div>
                        </div>
                        <div>
                            <label className="label-text">Email Address</label>
                            <input type="email" className="input-field" placeholder="owner@example.com"
                                value={form.email} onChange={e => update('email', e.target.value)} required />
                        </div>
                        <div>
                            <label className="label-text">Password</label>
                            <input type="password" className="input-field" placeholder="Min 6 characters"
                                value={form.password} onChange={e => update('password', e.target.value)} required minLength={6} />
                        </div>
                        <div>
                            <label className="label-text">GST Number <span className="text-[var(--color-text-secondary)] font-normal text-xs ml-1">(optional)</span></label>
                            <input className="input-field" placeholder="29ABCDE1234F1Z5"
                                value={form.gstNumber} onChange={e => update('gstNumber', e.target.value)} />
                        </div>
                        <button type="submit" disabled={loading}
                            className="btn-primary w-full justify-center text-lg py-3.5 mt-4 disabled:opacity-70 disabled:cursor-not-allowed">
                            {loading ? <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" /> : 'Create Store Account'}
                        </button>
                    </form>

                    <p className="text-center text-[var(--color-text-secondary)] mt-8 font-medium">
                        Already have a store?{' '}
                        <Link to="/login" className="text-primary-600 font-bold hover:text-primary-700 transition-colors">Sign in here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
