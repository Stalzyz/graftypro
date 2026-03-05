"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle2,
    ArrowRight,
    Zap,
    MessageSquare,
    TrendingUp,
    ShoppingBag,
    ShieldCheck,
    Loader2
} from "lucide-react";

export default function ProfilingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        industry: "",
        use_api_already: false,
        message_volume: "",
        sell_products: false,
        needs_assistance: false,
        interested_in_reseller: false
    });

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // This API will be called to update workspace fields
            await fetch("/api/auth/profile-update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            router.push("/dashboard");
        } catch (error) {
            router.push("/dashboard"); // Fallback
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFBFF] relative overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            {/* Background Aesthetic Blobs */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#25D366]/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#042F94]/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-xl w-full mx-auto py-12 px-6 relative z-10">
                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                        <TrendingUp size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Let's Set Up Your Growth Plan</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Tell us about your business to personalize your 500 free credits offer.</p>
                </div>

                <div className="glass-card p-8 border-slate-100 shadow-xl space-y-8 bg-white/80 backdrop-blur-xl rounded-2xl">
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 border-l-2 border-blue-500 pl-3 uppercase tracking-widest">What industry are you in?</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                                    value={formData.industry}
                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                >
                                    <option value="">Select Industry</option>
                                    <option value="ecommerce">E-commerce / Retail</option>
                                    <option value="realestate">Real Estate</option>
                                    <option value="education">EdTech / Education</option>
                                    <option value="healthcare">Healthcare</option>
                                    <option value="agency">Agency / Marketing</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 border-l-2 border-blue-500 pl-3 uppercase tracking-widest">Monthly WhatsApp Message Volume?</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                                    value={formData.message_volume}
                                    onChange={(e) => setFormData({ ...formData, message_volume: e.target.value })}
                                >
                                    <option value="">Select Volume</option>
                                    <option value="<1000">Less than 1,000</option>
                                    <option value="1000-10000">1,000 - 10,000</option>
                                    <option value="10000-100000">10,000 - 100,000</option>
                                    <option value="100000+">100,000+</option>
                                </select>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.industry || !formData.message_volume}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 disabled:opacity-50 transition-all"
                            >
                                Continue <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right duration-300">
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-400 border-l-2 border-blue-500 pl-3 uppercase tracking-widest text-left">Help Us Personalize Your Dashboard</label>

                                {[
                                    { id: "sell_products", label: "I want to sell products online", icon: <ShoppingBag size={18} /> },
                                    { id: "use_api_already", label: "I already use WhatsApp API", icon: <MessageSquare size={18} /> },
                                    { id: "needs_assistance", label: "I need automation setup assistance", icon: <Zap size={18} /> },
                                    { id: "interested_in_reseller", label: "Interested in Reseller Income", icon: <TrendingUp size={18} /> }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setFormData({ ...formData, [item.id]: !formData[item.id as keyof typeof formData] })}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${formData[item.id as keyof typeof formData]
                                            ? "border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-sm"
                                            : "border-slate-100 bg-white text-slate-600 font-medium"
                                            }`}
                                    >
                                        <span className="flex items-center gap-3">{item.icon} {item.label}</span>
                                        {formData[item.id as keyof typeof formData] && <CheckCircle2 size={18} />}
                                    </button>
                                ))}
                            </div>

                            <p className="text-xs text-slate-400 text-center font-medium italic">"Every user offered something irresistible." - Claim your bonus credits after setup.</p>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : "Access My Dashboard"}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-12 flex items-center justify-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 py-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-blue-500" /> Data Captured</div>
                    <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                    <div className="flex items-center gap-1.5"><TrendingUp size={14} className="text-blue-500" /> Signup Profiled</div>
                    <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                    <div className="flex items-center gap-1.5"><Zap size={14} className="text-blue-500" /> Smart Segmentation</div>
                </div>
            </div>
        </div>
    );
}
