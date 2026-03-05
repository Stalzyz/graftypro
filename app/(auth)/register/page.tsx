
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, Check, ArrowRight, Star } from "lucide-react";
import { Logo } from "../../../components/ui/Logo";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "", password: "", mobile: "", team: "", referral: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.password,
                    mobile: formData.mobile,
                    businessName: formData.team || "My Organization",
                    location: "India"
                })
            });

            const data = await res.json();
            if (res.ok) { setSuccess(true); } else { setError(data.error || "Registration failed"); }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 font-sans">
                <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-lg w-full border border-slate-100">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="text-[#25D366] w-10 h-10" strokeWidth={3} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Registration Successful!</h2>
                    <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                        Please check your inbox at <span className="font-bold text-slate-900">{formData.email}</span> to verify your email.
                    </p>
                    <Link href="/login" className="inline-block w-full bg-[#25D366] text-white font-bold py-4 rounded-full hover:bg-green-600 transition-all shadow-lg">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex bg-white font-sans">
            {/* LEFT SIDE */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] relative flex-col justify-between p-12 xl:p-20 overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#25D366] rounded-full blur-[180px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#042F94] rounded-full blur-[180px] opacity-20 -translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <Logo variant="light" size={40} showText={false} href="/" />
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.15] tracking-tight mb-8">
                        Turn conversations <br /> into <span className="text-[#4ade80]">revenue</span>.
                    </h1>
                    <ul className="space-y-5 max-w-lg">
                        {["Official WhatsApp Business API Partner", "Zero setup fees, pay only for what you use", "AI-powered automated support flows", "Real-time analytics and broadcast tracking"].map((item, i) => (
                            <li key={i} className="flex items-start gap-4">
                                <div className="mt-1 w-5 h-5 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                                    <Check size={12} className="text-[#4ade80] stroke-[4]" />
                                </div>
                                <span className="text-slate-300 font-medium text-lg leading-snug">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative z-10 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 mt-10">
                    <div className="flex gap-1 text-[#fbbf24] mb-3">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <p className="text-slate-200 text-xl leading-relaxed font-medium mb-4">
                        "Grafty transformed how we handle customer queries. Response times dropped by 80% and sales doubled in just one month."
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white">SK</div>
                        <div>
                            <p className="font-bold text-white text-sm">Sarah Kern</p>
                            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">CTO at TechCorp</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center overflow-y-auto h-screen bg-[#FAFAFA]">
                {/* Mobile Logo */}
                <div className="lg:hidden p-6 pb-0">
                    <Logo size={40} showText={false} href="/" />
                </div>

                <div className="w-full max-w-[520px] mx-auto p-6 sm:p-10 lg:p-12 my-auto">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Create your free account</h2>
                        <p className="text-slate-500 text-base">Get started with your 14-day free trial. No credit card required.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-8">
                        <Link href="/api/auth/google" className="flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl py-3 hover:bg-slate-50 transition-all shadow-sm">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                            <span className="text-slate-700 font-bold text-sm">Sign up with Google</span>
                        </Link>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-slate-400">
                            <span className="bg-[#FAFAFA] px-4">OR REGISTER WITH EMAIL</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            <span className="text-red-600 text-sm font-semibold">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">First Name</label>
                                <input name="firstName" required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/10 transition-all" placeholder="John" value={formData.firstName} onChange={handleChange} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Last Name</label>
                                <input name="lastName" required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/10 transition-all" placeholder="Doe" value={formData.lastName} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Business Email</label>
                            <input name="email" type="email" required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/10 transition-all" placeholder="name@company.com" value={formData.email} onChange={handleChange} />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <input name="password" type={showPassword ? "text" : "password"} required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-11 text-slate-900 text-sm focus:outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/10 transition-all" placeholder="Min. 8 characters" value={formData.password} onChange={handleChange} />
                                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">WhatsApp Number</label>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 bg-white min-w-[80px]">
                                    <span className="text-lg">🇮🇳</span>
                                    <span className="text-xs font-bold text-slate-500">+91</span>
                                </div>
                                <input name="mobile" type="tel" required className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/10 transition-all" placeholder="98765 43210" value={formData.mobile} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Team</label>
                                <div className="relative">
                                    <select name="team" required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-[#25D366] appearance-none cursor-pointer" value={formData.team} onChange={handleChange}>
                                        <option value="" disabled>Select Team</option>
                                        <option>Marketing</option><option>Sales</option><option>Support</option><option>Operations</option><option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Source</label>
                                <div className="relative">
                                    <select name="referral" required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-[#25D366] appearance-none cursor-pointer" value={formData.referral} onChange={handleChange}>
                                        <option value="" disabled>Select Source</option>
                                        <option>Google Search</option><option>Social Media</option><option>Friend</option><option>Email</option><option>Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-70 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-6 active:scale-[0.98]">
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (<>Create Account <ArrowRight size={18} /></>)}
                        </button>

                        <p className="text-center text-sm text-slate-500 font-medium">
                            Already have an account?{" "}
                            <Link href="/login" className="text-[#25D366] font-bold hover:underline">Sign in</Link>
                        </p>
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
