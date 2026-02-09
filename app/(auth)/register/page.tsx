"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Building, Phone, Globe, ArrowRight, AlertCircle, Loader2, Sparkles, CheckCircle, ChevronLeft } from "lucide-react";

type AccountType = "VENDOR" | "RESELLER" | "ENTERPRISE";

export default function RegisterAdvancedPage() {
    const router = useRouter();
    const [accountType, setAccountType] = useState<AccountType>("VENDOR");
    const [step, setStep] = useState(1); // 1: Contact Info, 2: Verification, 3: Password & Complete

    const [formData, setFormData] = useState({
        businessName: "",
        website: "",
        fullName: "",
        email: "",
        phone: "",
        password: "",
        otpEmail: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [verificationSent, setVerificationSent] = useState(false);

    const handleSendOTP = async () => {
        if (!formData.email) {
            setError("Email is required.");
            return;
        }
        setStep(3); // Direct bypass
    };

    const handleVerifyOTP = async () => {
        setStep(3);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    business_name: formData.businessName,
                    full_name: formData.fullName,
                    website: formData.website,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    role: accountType === "RESELLER" ? "RESELLER_APPLICANT" : "OWNER", // Map accordingly
                    // context: accountType
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed");

            // Redirect based on type
            if (accountType === "RESELLER") router.push("/reseller/dashboard"); // or confirmation
            else if (accountType === "ENTERPRISE") router.push("/contact/success");
            else router.push("/profiling");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto w-full">
            {/* Header / Type Selector */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Your Account</h2>
                <div className="flex justify-center gap-1 bg-gray-100 p-1 rounded-xl inline-flex mb-6">
                    <TypeButton active={accountType === "VENDOR"} onClick={() => setAccountType("VENDOR")} label="Business" />
                    <TypeButton active={accountType === "RESELLER"} onClick={() => setAccountType("RESELLER")} label="Reseller" />
                    <TypeButton active={accountType === "ENTERPRISE"} onClick={() => setAccountType("ENTERPRISE")} label="Enterprise" />
                </div>
                <p className="text-sm text-gray-500">
                    {accountType === "VENDOR" && "Automate your customer engagement."}
                    {accountType === "RESELLER" && "Partner with us and earn recurring revenue."}
                    {accountType === "ENTERPRISE" && "Custom white-label solutions at scale."}
                </p>
            </div>

            {/* ERROR ALERT */}
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-xs font-medium flex items-center gap-2 mb-6">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* STEPS */}
            <form onSubmit={step === 3 ? handleRegister : (e) => { e.preventDefault(); step === 1 ? handleSendOTP() : handleVerifyOTP(); }}>

                {/* STEP 1: CONTACT INFO */}
                {step === 1 && (
                    <div className="space-y-4 animate-in slide-in-from-right duration-300">
                        {/* Google Auth Button */}
                        <button
                            type="button"
                            onClick={() => window.location.href = "/api/auth/google/mock"}
                            className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-all mb-4"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                            Continue with Google {process.env.NODE_ENV === "development" ? "(Mock)" : ""}
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase font-bold">Or register with email</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <Input label="Full Name" icon={<Sparkles size={16} />} value={formData.fullName} onChange={v => setFormData({ ...formData, fullName: v })} required placeholder="Enter your name" />

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Business Name" icon={<Building size={16} />} value={formData.businessName} onChange={v => setFormData({ ...formData, businessName: v })} required />
                            <Input label="Website" icon={<Globe size={16} />} value={formData.website} onChange={v => setFormData({ ...formData, website: v })} placeholder="https://" />
                        </div>

                        <Input label="Official Email" icon={<Mail size={16} />} type="email" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} required />
                        <Input label="Phone Number" icon={<Phone size={16} />} type="tel" value={formData.phone} onChange={v => setFormData({ ...formData, phone: v })} required />
                    </div>
                )}

                {/* STEP 2: VERIFICATION */}
                {step === 2 && (
                    <div className="space-y-4 animate-in slide-in-from-right duration-300">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Mail size={24} />
                            </div>
                            <h3 className="font-bold text-gray-800">Verify your email</h3>
                            <p className="text-xs text-gray-500 mt-1">We sent a verification code to {formData.email}</p>
                        </div>

                        <Input label="Verification Code" placeholder="123456" value={formData.otpEmail} onChange={v => setFormData({ ...formData, otpEmail: v })} required />

                        <button type="button" onClick={() => setStep(1)} className="text-xs text-blue-600 hover:underline w-full text-center mt-2">Change Contact Info</button>
                    </div>
                )}

                {/* STEP 3: PASSWORD & FINISH */}
                {step === 3 && (
                    <div className="space-y-4 animate-in slide-in-from-right duration-300">
                        <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center gap-3 text-green-700 text-sm mb-4">
                            <CheckCircle size={20} /> Contacts Verified Successfully!
                        </div>

                        <Input label="Set Password" icon={<Lock size={16} />} type="password" value={formData.password} onChange={v => setFormData({ ...formData, password: v })} required minLength={8} />

                        <div className="flex items-center gap-2">
                            <input type="checkbox" required className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <label className="text-xs text-gray-500">I agree to the <Link href="#" className="underline">Terms of Service</Link> & <Link href="#" className="underline">Privacy Policy</Link></label>
                        </div>
                    </div>
                )}

                {/* FOOTER ACTIONS */}
                <div className="mt-8">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1e293b] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#0f172a] transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : (step === 3 ? "Create Account" : "Next Step")}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </div>
            </form>

            <div className="pt-6 text-center">
                <p className="text-gray-500 text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 font-bold hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}

function TypeButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${active ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"}`}
        >
            {label}
        </button>
    );
}

function Input({ label, value, onChange, type = "text", placeholder, icon, required, minLength }: {
    label: string,
    value: string,
    onChange: (v: string) => void,
    type?: string,
    placeholder?: string,
    icon?: React.ReactNode,
    required?: boolean,
    minLength?: number
}) {
    return (
        <div className="space-y-1.5 w-full">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative group">
                {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">{icon}</div>}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    minLength={minLength}
                    className={`w-full bg-gray-50 border-transparent focus:bg-white focus:border-blue-500/30 rounded-xl ${icon ? "pl-11" : "pl-4"} pr-4 py-3 text-sm font-medium outline-none transition-all shadow-inner focus:ring-4 focus:ring-blue-500/5`}
                />
            </div>
        </div>
    );
}
