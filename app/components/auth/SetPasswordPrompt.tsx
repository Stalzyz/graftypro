
"use client";

import { useState, useEffect } from "react";
import { Lock, X, ShieldCheck, Loader2 } from "lucide-react";

export function SetPasswordPrompt() {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const check = async () => {
            try {
                const res = await fetch("/api/auth/me");
                const data = await res.json();
                if (data.user && !data.user.hasPassword) {
                    setShow(true);
                }
            } catch (e) { }
        };
        check();
    }, []);

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/password/set", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setShow(false), 3000);
            }
        } catch (e) { }
        setLoading(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-10 duration-500">
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl border border-white/10 max-w-[320px] relative overflow-hidden group">
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#27954D]/20 blur-[60px] rounded-full pointer-events-none" />

                <button
                    onClick={() => setShow(false)}
                    className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>

                {!success ? (
                    <div className="space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#27954D]">
                            <Lock size={24} />
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-black text-lg tracking-tight">Harden Your Identity</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                You're using passwordless access. Set a permanent passkey for extra security.
                            </p>
                        </div>

                        <form onSubmit={handleSetPassword} className="space-y-4">
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="New Passkey"
                                className="w-full bg-white/5 border-transparent focus:bg-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none transition-all placeholder:text-slate-600 focus:ring-4 focus:ring-[#27954D]/10"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#27954D] text-white py-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-green-900/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin inline mr-2" /> : "Secure Account"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="py-8 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mx-auto">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="font-black text-lg tracking-tight">Identity Secured</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your permanent passcode has been registered.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
