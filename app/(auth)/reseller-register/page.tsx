"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, Check, ArrowRight, ShieldCheck, PieChart, Zap, RefreshCw, AlertCircle } from "lucide-react";
import { Logo } from "../../../components/ui/Logo";

export default function ResellerRegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        businessName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!agreedToTerms) {
            setError("You must agree to the Partner Terms and Conditions.");
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/reseller/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                if (data.otpError) {
                    setError(data.message);
                }
                setVerifying(true);
            } else {
                setError(data.error || "Registration failed");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/reseller/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email, otp })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || "Verification failed");
            }
        } catch (err) {
            setError("Verification error.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/reseller/auth/resend-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email })
            });
            const data = await res.json();
            if (res.ok) {
                alert("A new OTP has been sent to your email.");
            } else {
                setError(data.error);
            }
        } catch (e) {
            setError("Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    /* ── SUCCESS ── */
    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[2.5rem] shadow-xl p-10 text-center max-w-lg w-full border border-slate-100">
                    <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Check className="text-[#27954D] w-10 h-10" strokeWidth={3} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Email Verified!</h2>
                    <p className="text-slate-500 mb-8 text-base leading-relaxed">
                        Welcome to the network. Your email is verified. Please log in to complete your KYC submission and start earning.
                    </p>
                    <Link
                        href="/partner/login"
                        className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-[#27954D] transition-all text-sm uppercase tracking-widest"
                    >
                        Access Partner Portal <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        );
    }

    /* ── MAIN ── */
    return (
        <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] relative flex-col justify-between p-20 overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#27954D] rounded-full blur-[200px] opacity-10 translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10">
                    <Logo size={48} variant="light" />
                    <div className="mt-20">
                        <h1 className="text-6xl font-black leading-[1.05] tracking-tighter mb-10 text-white">
                            The Future of <br /> Partnership.
                        </h1>
                        <div className="space-y-10">
                            <FeatureItem icon={<Zap className="text-yellow-400" />} title="Zero Latency" desc="Start earning from your first referral — instantly tracked." />
                            <FeatureItem icon={<PieChart className="text-emerald-400" />} title="Recurring Commission" desc="Earn on every subscription renewal and credit top-up." />
                            <FeatureItem icon={<ShieldCheck className="text-blue-400" />} title="Transparent Payouts" desc="Real-time wallet. Withdraw anytime to your bank account." />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center bg-slate-50 overflow-y-auto">
                <div className="w-full max-w-[520px] mx-auto p-10 lg:p-16 py-12">
                    {!verifying ? (
                        /* ── REGISTRATION FORM ── */
                        <div>
                            <div className="mb-10">
                                <Logo size={40} brandName="Grafty" />
                                <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight mt-6">Become a Partner.</h2>
                                <p className="text-slate-500 text-base font-medium">Free to join. Earn recurring commission.</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                                    <span className="text-red-600 text-sm font-semibold">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleRegister} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                                        <input
                                            name="name" required
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#27954D] focus:ring-4 focus:ring-green-500/10 transition-all"
                                            placeholder="John Doe"
                                            value={formData.name} onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Name</label>
                                        <input
                                            name="businessName" required
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#27954D] focus:ring-4 focus:ring-green-500/10 transition-all"
                                            placeholder="Acme Agency"
                                            value={formData.businessName} onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Work Email</label>
                                    <input
                                        name="email" type="email" required
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#27954D] focus:ring-4 focus:ring-green-500/10 transition-all"
                                        placeholder="you@yourbrand.com"
                                        value={formData.email} onChange={handleChange}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                                        <div className="relative">
                                            <input
                                                name="password" type={showPassword ? "text" : "password"} required
                                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 pr-11 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#27954D] focus:ring-4 focus:ring-green-500/10 transition-all"
                                                placeholder="Min 8 chars"
                                                value={formData.password} onChange={handleChange}
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm</label>
                                        <input
                                            name="confirmPassword" type="password" required
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#27954D] focus:ring-4 focus:ring-green-500/10 transition-all"
                                            placeholder="Repeat"
                                            value={formData.confirmPassword} onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 mt-4 pt-2">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        className="mt-1 w-4 h-4 text-[#27954D] rounded border-slate-300 focus:ring-[#27954D] cursor-pointer"
                                    />
                                    <label htmlFor="terms" className="text-sm text-slate-500 font-medium leading-relaxed">
                                        I agree to the <Link href="/terms" target="_blank" className="text-[#27954D] font-bold hover:underline">Terms & Conditions</Link> and <Link href="/privacy" target="_blank" className="text-[#27954D] font-bold hover:underline">Privacy Policy</Link>.
                                    </label>
                                </div>

                                <button
                                    type="submit" disabled={loading}
                                    className="w-full bg-[#27954D] hover:bg-[#1f7a3f] text-white font-black py-4 rounded-2xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest mt-2 active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? <RefreshCw className="animate-spin" size={16} /> : <>Create Partner Account <ArrowRight size={16} /></>}
                                </button>

                                <p className="text-center text-sm font-medium text-slate-500">
                                    Already a partner?{" "}
                                    <Link href="/partner/login" className="text-[#27954D] font-bold hover:underline">Sign in</Link>
                                </p>
                            </form>
                        </div>
                    ) : (
                        /* ── OTP VERIFY ── */
                        <div>
                            <div className="mb-10">
                                <Logo size={40} brandName="Grafty" />
                                <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight mt-6">Check your Inbox.</h2>
                                <p className="text-slate-500 text-base font-medium">
                                    We've sent a 6-digit code to <span className="text-slate-900 font-black">{formData.email}</span>.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                                    <span className="text-red-600 text-sm font-semibold">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleVerifyOtp} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Code</label>
                                    <input
                                        type="text" required maxLength={6}
                                        className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-6 text-center text-4xl font-black text-slate-900 tracking-[1em] focus:outline-none focus:border-[#27954D] focus:ring-4 focus:ring-green-500/10 transition-all"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                                    />
                                </div>

                                <button
                                    type="submit" disabled={loading || otp.length < 6}
                                    className="w-full bg-[#27954D] hover:bg-[#1f7a3f] text-white font-black py-4 rounded-2xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? <RefreshCw className="animate-spin" size={16} /> : <><ShieldCheck size={16} /> Verify & Continue</>}
                                </button>

                                <div className="text-center">
                                    <button type="button" onClick={handleResendOtp} disabled={loading}
                                        className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-[#27954D] transition-colors">
                                        Resend Code
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ icon, title, desc }: any) {
    return (
        <div className="flex items-start gap-5">
            <div className="mt-1 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                {icon}
            </div>
            <div>
                <h3 className="font-black text-white text-sm uppercase tracking-widest mb-1">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
