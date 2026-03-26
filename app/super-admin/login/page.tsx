"use client";
import { useState } from "react";
import { Lock, AlertCircle } from "lucide-react";
import { Logo } from "../../../components/ui/Logo";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/super-admin/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Hard redirect so browser fully picks up the new cookie
                window.location.href = "/super-admin/dashboard";
            } else {
                const errorMsg = data.details
                    ? `${data.error}: ${data.details}`
                    : (data.error || "Invalid credentials");
                setError(errorMsg);
            }
        } catch (err: any) {
            setError("Network error — please try again");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-6 super-admin-theme relative overflow-hidden bg-slate-50">
            {/* Elegant Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#27954D]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#042f94]/5 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md animate-fade-in relative z-10">
                <div className="bg-white border border-slate-200 p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50">
                    <div className="flex flex-col items-center mb-12">
                        <div className="mb-10">
                            <Logo size={64} variant="color" />
                        </div>
                        <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">Console Access</h1>
                        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.25em] mt-3">Super Admin Authentication</p>
                    </div>

                    {error && (
                        <div className="mb-10 p-5 bg-red-50/50 border border-red-100 rounded-[1.5rem] flex items-center gap-4 text-red-600 text-[11px] font-semibold animate-shake">
                            <AlertCircle size={18} strokeWidth={2.5} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-1 block">Administrator Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-[#27954D]/30 outline-none transition-all font-medium text-sm text-slate-700"
                                placeholder="admin@grafty.ai"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-1 block">Security Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-[#27954D]/30 outline-none transition-all font-medium text-sm text-slate-700"
                                placeholder="••••••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-[#27954D] hover:bg-[#042f94] shadow-lg shadow-[#27954D]/10 text-white font-bold rounded-2xl transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-3 active:scale-95 text-sm"
                        >
                            {loading ? "Verifying..." : "Authorize Session"}
                        </button>
                    </form>
                </div>

                <p className="mt-12 text-center text-[9px] text-slate-500 font-bold uppercase tracking-[0.4em]">
                    Grafty Enterprise Portal
                </p>
            </div>
        </div>
    );
}

