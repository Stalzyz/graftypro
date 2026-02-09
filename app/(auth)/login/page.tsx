"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-sm text-gray-500 font-medium">Please enter your details to sign in.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-2xl text-xs font-medium flex items-center gap-2 animate-shake">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {/* Google Auth Button */}
                <button
                    type="button"
                    onClick={() => window.location.href = "/api/auth/google/mock"}
                    className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-all font-sans"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                    Continue with Google {process.env.NODE_ENV === "development" ? "(Mock)" : ""}
                </button>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase font-bold">Or login with email</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#27954D] transition-colors" size={18} />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-[#27954D]/30 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium outline-none transition-all shadow-inner focus:ring-4 focus:ring-[#27954D]/5"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
                        <a href="#" className="text-[10px] font-bold text-[#042f94] hover:underline uppercase tracking-tight">Forgot password?</a>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#27954D] transition-colors" size={18} />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-[#27954D]/30 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium outline-none transition-all shadow-inner focus:ring-4 focus:ring-[#27954D]/5"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#27954D] to-[#042f94] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-green-200 disabled:opacity-50 disabled:scale-100"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign In"}
                    {!loading && <ArrowRight size={18} />}
                </button>
            </form>

            <div className="pt-4 text-center">
                <p className="text-gray-500 text-sm font-medium">
                    New to Wabot?{" "}
                    <Link href="/register" className="text-[#042f94] font-bold hover:underline">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
}
