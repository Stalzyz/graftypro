
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Logo } from "../../../components/ui/Logo";

export default function PartnerLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch("/api/reseller/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Login failed");

            router.push("/partner/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="flex flex-col items-center">
                    <div className="mb-6">
                        <Logo size={50} brandName="Grafty" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Partner Access</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Partner Network Infrastructure</p>
                </div>

                {/* Card */}
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    id="email" type="email" required
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="partner@yourbrand.com"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 outline-none focus:border-[#27954D] focus:ring-4 focus:ring-green-500/10 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Password</label>
                                <a href="/partner/forgot-password" className="text-[10px] font-black uppercase text-[#042F94] hover:underline">Forgot?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    id="password" type="password" required
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 outline-none focus:border-[#27954D] focus:ring-4 focus:ring-green-500/10 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#27954D] transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <>Enter Console <ArrowRight size={18} /></>}
                        </button>
                    </form>
                </div>

                <div className="text-center">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                        Not a partner? <a href="/reseller-register" className="text-slate-900 hover:text-[#27954D] transition-colors underline underline-offset-4">Apply Now</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
