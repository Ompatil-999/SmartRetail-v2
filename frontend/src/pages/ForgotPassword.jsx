import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { KeyIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSubmitted(true);
            toast.success('Reset link sent if account exists');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
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
                            <KeyIcon className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight text-center">Forgot Password?</h1>
                        <p className="text-[var(--color-text-secondary)] mt-2 font-medium text-center">No worries, we'll send you reset instructions.</p>
                    </div>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="label-text">Email Address</label>
                                <input type="email" id="forgot_email_input" className="input-field" placeholder="owner@example.com"
                                    value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <button type="submit" disabled={loading}
                                className="btn-primary w-full justify-center text-lg py-3.5 mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                {loading ? <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" /> : 'Reset Password'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-5 rounded-2xl text-sm leading-relaxed font-medium">
                                If an account exists for <span className="font-bold">{email}</span>, you will receive a password reset link shortly.
                            </div>
                            <p className="text-sm text-[var(--color-text-secondary)] font-medium">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>
                        </div>
                    )}

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
