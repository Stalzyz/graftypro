"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShieldCheck,
    Mail,
    Lock,
    ArrowRight,
    Loader2,
    AlertCircle,
    Check
} from 'lucide-react';
import Link from 'next/link';

export default function PartnerForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch("/api/reseller/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({ email }),
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to process request");

            setStep(2);
            setSuccess("If the email is active, an OTP has been dispatched.");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch("/api/reseller/auth/forgot-password", {
                method: "PUT",
                body: JSON.stringify({ email, otp, newPassword }),
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to reset password");

            setSuccess("Password updated securely.");
            setStep(3);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 selection:bg-blue-500/30">
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                {/* Logo */}
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#27954D] to-[#042F94] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/10 mb-6">
                        <ShieldCheck className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">Vault Recovery</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">White-Label Infrastructure</p>
                </div>

                {/* Card */}
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-100 transition-all duration-500"></div>

                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-6 relative z-10">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-shake">
                                    <AlertCircle size={18} /> {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Work Email</label>
                                <div className="relative group/input">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" size={18} />
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="partner@yourbrand.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#27954D] transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Request Secure OTP <ArrowRight size={18} /></>}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-6 relative z-10">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-shake">
                                    <AlertCircle size={18} /> {error}
                                </div>
                            )}

                            {success && (
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3">
                                    <Check size={18} /> {success}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Authorization Code</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    placeholder="000000"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl text-center tracking-[1em] py-4 text-xl font-black text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">New Secure Password</label>
                                <div className="relative group/input">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#042F94] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#27954D] transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Reset Security Key <ShieldCheck size={18} /></>}
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 relative z-10 text-center py-6">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-6 shadow-inner">
                                <Check size={40} />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-widest text-slate-900 italic">Access Restored</h2>
                            <p className="text-xs text-slate-500 font-bold">Your partner security key has been updated.</p>

                            <Link href="/partner/login" className="w-full bg-slate-900 text-white py-4 mt-8 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-95 inline-flex">
                                Return to Login
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step !== 3 && (
                    <div className="text-center">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                            Remembered it? <Link href="/partner/login" className="text-slate-900 hover:text-[#042F94] transition-colors underline decoration-slate-300 underline-offset-4">Sign in</Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
