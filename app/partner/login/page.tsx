
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShieldCheck,
    Mail,
    Lock,
    ArrowRight,
    Loader2,
    AlertCircle
} from 'lucide-react';

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
        <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-cyan-500/30">
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                {/* Logo */}
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/20 mb-6">
                        <ShieldCheck className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">Partner Access</h1>
                    <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">White-Label Infrastructure</p>
                </div>

                {/* Card */}
                <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-cyan-500/10 transition-all"></div>

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-shake">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Work Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="partner@yourbrand.com"
                                    className="w-full bg-black border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Secure Password</label>
                                <a href="#" className="text-[10px] font-black uppercase text-cyan-500 hover:text-cyan-400 transition-colors">Forgot?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-black border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-cyan-400 transition-all shadow-xl shadow-white/5 active:scale-95 disabled:opacity-50 disabled:scale-100"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <>Enter Console <ArrowRight size={18} /></>}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
                        Not a partner? <a href="/reseller-program" className="text-white hover:text-cyan-400 transition-colors underline decoration-zinc-800 underline-offset-4">Apply Now</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
