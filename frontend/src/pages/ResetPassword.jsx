import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (password.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, newPassword: password });
            toast.success('Password successfully reset');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid or expired token');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-50)] p-4">
                <div className="bg-white rounded-3xl shadow-lg border border-[var(--color-border-color)] p-8 sm:p-10 max-w-md w-full text-center">
                    <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Missing Token</h2>
                    <p className="text-[var(--color-text-secondary)] mt-3 font-medium">A valid reset token is required to access this page.</p>
                    <Link to="/login" className="mt-6 inline-block text-primary-600 font-bold hover:text-primary-700 transition-colors">Back to Login</Link>
                </div>
            </div>
        );
    }

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
                            <ShieldCheckIcon className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">Set New Password</h1>
                        <p className="text-[var(--color-text-secondary)] mt-2 font-medium text-center">Please enter your new strong password below.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="label-text">New Password</label>
                            <input type="password" id="new_password_input" className="input-field" placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                        </div>
                        <div>
                            <label className="label-text">Confirm Password</label>
                            <input type="password" id="confirm_password_input" className="input-field" placeholder="••••••••"
                                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
                        </div>
                        <button type="submit" disabled={loading}
                            className="btn-primary w-full justify-center text-lg py-3.5 mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
                            {loading ? <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" /> : 'Update Password'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-[var(--color-border-color)]">
                        <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                            <ArrowLeftIcon className="w-4 h-4" />
                            Back to sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
