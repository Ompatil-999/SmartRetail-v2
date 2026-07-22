import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-50)] p-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary-500/5 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-[var(--color-border-color)] p-8 sm:p-10">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                            <BuildingStorefrontIcon className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">Welcome Back</h1>
                        <p className="text-[var(--color-text-secondary)] mt-2 font-medium">Sign in to your store dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="label-text">Email Address</label>
                            <input type="email" className="input-field" placeholder="owner@example.com"
                                value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="label-text mb-0">Password</label>
                                <Link to="/forgot-password" title="Forgot Password?" className="text-sm font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <input type="password" title="Enter Password" id="password_input" className="input-field" placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" disabled={loading}
                            className="btn-primary w-full justify-center text-lg py-3.5 mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
                            {loading ? <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" /> : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-[var(--color-text-secondary)] mt-8 font-medium">
                        Don't have a store?{' '}
                        <Link to="/register" className="text-primary-600 font-bold hover:text-primary-700 transition-colors">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
