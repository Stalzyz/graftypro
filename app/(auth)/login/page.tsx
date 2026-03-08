"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, ArrowRight, Star } from "lucide-react";
import { Logo } from "../../../components/ui/Logo";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [formData, setFormData] = useState({ email: "", password: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                router.push(data.redirect || "/dashboard");
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white font-sans">

            {/* LEFT SIDE: Brand & Value Prop */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] relative flex-col justify-between p-12 xl:p-20 overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#25D366] rounded-full blur-[180px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#042F94] rounded-full blur-[180px] opacity-20 -translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <Logo variant="light" size={40} showText={true} href="/" />
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.15] tracking-tight mb-8">
                        Welcome back to <br />
                        the <span className="text-[#4ade80]">future of support</span>.
                    </h1>
                    <p className="text-slate-300 text-lg leading-relaxed max-w-md">
                        Log in to access your AI agents, manage campaigns, and track real-time revenue analytics.
                    </p>
                </div>

                <div className="relative z-10 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 mt-10">
                    <div className="flex gap-1 text-[#fbbf24] mb-3">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <p className="text-slate-200 text-lg leading-relaxed font-medium mb-4">
                        "Grafty is the single most important tool in our tech stack. It's reliable, fast, and the AI capabilities are ahead of the curve."
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white">JD</div>
                        <div>
                            <p className="font-bold text-white text-sm">Jane Doe</p>
                            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">CEO at GrowthBox</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center overflow-y-auto h-screen bg-[#FAFAFA]">

                {/* Mobile Logo */}
                <div className="lg:hidden p-6 pb-0">
                    <Logo size={40} showText={true} href="/" />
                </div>

                <div className="w-full max-w-[480px] mx-auto p-6 sm:p-10 lg:p-12 my-auto">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
                        <p className="text-slate-500 text-base">Sign in to your Grafty workspace</p>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-1 gap-4 mb-8">
                        <Link href="/api/auth/google" className="flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl py-3 hover:bg-slate-50 transition-all shadow-sm">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                            <span className="text-slate-700 font-bold text-sm">Continue with Google</span>
                        </Link>
                        <Link href="/api/auth/facebook" className="flex items-center justify-center gap-2 bg-[#1877F2] border border-[#1877F2] rounded-xl py-3 hover:bg-[#166FE5] transition-all shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="w-5 h-5 fill-white"><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" /></svg>
                            <span className="text-white font-bold text-sm">Continue with Facebook</span>
                        </Link>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-slate-400">
                            <span className="bg-[#FAFAFA] px-4">OR LOGIN WITH EMAIL</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            <span className="text-red-600 text-sm font-semibold">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
                            <input
                                name="email" type="email" required autoComplete="email"
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/10 transition-all"
                                placeholder="name@company.com"
                                value={formData.email} onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between ml-1">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                                <Link href="/forgot-password" className="text-xs font-bold text-[#042F94] hover:underline">Forgot?</Link>
                            </div>
                            <div className="relative">
                                <input
                                    name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password"
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-11 text-slate-900 text-sm focus:outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/10 transition-all"
                                    placeholder="••••••••"
                                    value={formData.password} onChange={handleChange}
                                />
                                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center pt-1 ml-1">
                            <input
                                id="remember" type="checkbox"
                                checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 text-[#25D366] bg-white border-slate-200 rounded cursor-pointer"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-slate-600 font-semibold cursor-pointer select-none">
                                Keep me signed in
                            </label>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-70 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-6 active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (<>Sign In <ArrowRight size={18} /></>)}
                        </button>

                        <div className="text-center mt-8 pt-6 border-t border-slate-100">
                            <span className="text-sm text-slate-500 font-medium">Don't have an account? </span>
                            <Link href="/register" className="text-[#042F94] font-bold hover:underline text-sm ml-1">Start my trial</Link>
                        </div>
                    </form>
                </div>

                <div className="w-full text-center lg:text-left lg:pl-12 py-10">
                    <div className="flex justify-center lg:justify-start gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
                        <Link href="/support" className="hover:text-slate-600 transition-colors">Help</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
