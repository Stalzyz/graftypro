
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ShieldCheck, Smartphone, Building2, MapPin } from "lucide-react";

export default function CompleteProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        businessName: "",
        mobile: "",
        location: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/complete-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push("/dashboard");
            } else {
                const data = await res.json();
                setError(data.error || "Update failed");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFBFF] relative overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">

            {/* Background Aesthetic Blobs */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#25D366]/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#042F94]/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-[480px] relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center mb-8">
                        <img src="/grafty_brand.svg" alt="Grafty" className="h-10 w-auto" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2 tracking-tight">Complete your profile</h1>
                    <p className="text-slate-500 font-medium text-sm sm:text-base">Almost there! Just a few more details.</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 sm:p-10 border border-slate-50 relative overflow-hidden">

                    {/* Top Accent Gradient Line */}
                    <div
                        style={{ background: 'linear-gradient(90deg, #042F94 0%, #25D366 100%)' }}
                        className="absolute top-0 left-0 w-full h-1.5"
                    ></div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold flex items-center gap-3 animate-shake">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Business Name */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Business Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                                <input
                                    name="businessName"
                                    required
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 text-sm focus:outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/5 transition-all outline-none"
                                    placeholder="Acme Corp"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Mobile */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone Number</label>
                            <div className="relative">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    name="mobile"
                                    type="tel"
                                    required
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 text-sm focus:outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/5 transition-all outline-none"
                                    placeholder="+91 98765 43210"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Location / Timezone</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                                <select
                                    name="location"
                                    required
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 text-sm focus:outline-none focus:border-[#25D366] transition-all appearance-none cursor-pointer"
                                    value={formData.location}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Select your region</option>
                                    <option value="India">India (IST)</option>
                                    <option value="US">United States (EST/PST)</option>
                                    <option value="UK">United Kingdom (GMT)</option>
                                    <option value="Europe">Europe (CET)</option>
                                    <option value="Asia">Asia (Singapore/HK)</option>
                                    <option value="Australia">Australia (AEST)</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ background: 'linear-gradient(90deg, #042F94 0%, #25D366 100%)' }}
                            className="w-full hover:opacity-90 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-[0_10px_20px_-5px_rgba(37,211,102,0.3)] transition-all flex items-center justify-center gap-3 mt-8 active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin w-5 h-5" />
                            ) : (
                                <>
                                    Complete Setup <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
