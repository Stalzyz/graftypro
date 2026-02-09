"use client";

import { useState, useEffect } from "react";
import {
    ShieldCheck,
    Lock,
    Building,
    Phone,
    Zap,
    Globe,
    CheckCircle,
    AlertTriangle,
    Loader2,
    ArrowRight,
    ArrowLeft,
    Copy,
    ExternalLink
} from "lucide-react";

interface ManualWizardProps {
    onComplete: () => void;
    onCancel: () => void;
}

export default function ManualIntegrationWizard({ onComplete, onCancel }: ManualWizardProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        wabaId: "",
        phoneNumberId: "",
        appId: "",
        appSecret: "",
        accessToken: ""
    });

    const [config, setConfig] = useState({
        webhookUrl: "",
        verifyToken: ""
    });

    // Validation Result
    const [validationResult, setValidationResult] = useState<any>(null);

    useEffect(() => {
        fetch("/api/whatsapp/config")
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(err => console.error(err));
    }, []);

    const webhookUrl = config.webhookUrl;
    const verifyToken = config.verifyToken;

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const validateAndSave = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/whatsapp/manual-setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Validation failed");
            }

            setValidationResult(data.data);
            handleNext();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    return (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden animate-fade-in max-w-2xl mx-auto">
            {/* Header */}
            <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">WhatsApp Cloud API</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Manual Provisioning Wizard</p>
                </div>
                <div className="flex items-center gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`w-2 h-2 rounded-full ${step >= i ? 'bg-[#27954D]' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </div>

            <div className="p-10">
                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-shake">
                        <AlertTriangle size={18} />
                        {error}
                    </div>
                )}

                {/* Step 1: Credentials */}
                {step === 1 && (
                    <div className="space-y-6 animate-slide-in">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800">Step 1 — API Credentials</h3>
                            <p className="text-sm text-slate-500">Enter your Meta App and WABA identification numbers.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputGroup
                                label="WABA ID"
                                icon={<Building size={16} />}
                                placeholder="1092837465..."
                                value={formData.wabaId}
                                onChange={(v: string) => setFormData({ ...formData, wabaId: v })}
                            />
                            <InputGroup
                                label="Phone Number ID"
                                icon={<Phone size={16} />}
                                placeholder="2019283746..."
                                value={formData.phoneNumberId}
                                onChange={(v: string) => setFormData({ ...formData, phoneNumberId: v })}
                            />
                            <InputGroup
                                label="App ID"
                                icon={<Globe size={16} />}
                                placeholder="82736451..."
                                value={formData.appId}
                                onChange={(v: string) => setFormData({ ...formData, appId: v })}
                            />
                            <InputGroup
                                label="App Secret"
                                icon={<Lock size={16} />}
                                placeholder="••••••••"
                                type="password"
                                value={formData.appSecret}
                                onChange={(v: string) => setFormData({ ...formData, appSecret: v })}
                            />
                        </div>

                        <InputGroup
                            label="Permanent Access Token"
                            icon={<ShieldCheck size={16} />}
                            placeholder="EAAG...."
                            type="password"
                            value={formData.accessToken}
                            onChange={(v: string) => setFormData({ ...formData, accessToken: v })}
                        />

                        <div className="pt-6 flex justify-between">
                            <button onClick={onCancel} className="text-slate-400 text-sm font-bold hover:text-slate-600 px-4">Cancel</button>
                            <button
                                onClick={validateAndSave}
                                disabled={loading}
                                className="bg-[#27954D] hover:bg-[#042f94] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-100 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Validate & Continue"}
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Validation Result */}
                {step === 2 && (
                    <div className="space-y-8 animate-slide-in">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-green-50 text-[#27954D] rounded-full flex items-center justify-center shadow-inner">
                                <CheckCircle size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Verification Successful</h3>
                                <p className="text-sm text-slate-500">We've successfully verified your credentials with Meta.</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-3xl p-6 grid grid-cols-2 gap-6 border border-slate-100 shadow-inner">
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Display Name</p>
                                <p className="text-sm font-bold text-slate-700">{validationResult?.verifiedName || "Unknown"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Phone Number</p>
                                <p className="text-sm font-bold text-[#042f94]">+{validationResult?.phoneNumber || "Unknown"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Quality Rating</p>
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-lg uppercase">{validationResult?.qualityRating || "GREEN"}</span>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Status</p>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg uppercase">VERIFIED</span>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-between">
                            <button onClick={handleBack} className="text-slate-400 text-sm font-bold hover:text-slate-600 flex items-center gap-2">
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button
                                onClick={handleNext}
                                className="bg-[#1c2b24] hover:bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95"
                            >
                                Setup Webhook <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Webhook Setup */}
                {step === 3 && (
                    <div className="space-y-8 animate-slide-in">
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-800">Step 3 — Webhook Handshake</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Copy these values into your Meta App's WhatsApp Webhook settings to enable real-time message receiving.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <CopyBox label="Callback URL" value={webhookUrl} onCopy={() => copyToClipboard(webhookUrl)} />
                            <CopyBox label="Verify Token" value={verifyToken} onCopy={() => copyToClipboard(verifyToken)} />
                        </div>

                        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-4">
                            <Globe size={20} className="text-blue-500 mt-1" />
                            <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                Once you save these in the Meta Dashboard, Meta will send a verification ping.
                                Make sure to subscribe to <b>messages</b> and <b>message_status</b> events.
                            </p>
                        </div>

                        <div className="pt-6 flex justify-between">
                            <button onClick={handleBack} className="text-slate-400 text-sm font-bold hover:text-slate-600 flex items-center gap-2">
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button
                                onClick={onComplete}
                                className="bg-gradient-to-r from-[#27954D] to-[#042f94] text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all hover:shadow-xl hover:shadow-green-900/10 active:scale-95 shadow-lg shadow-green-100"
                            >
                                Establish Connection <Zap size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
                <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em] shadow-sm">Enterprise Security Protocol v2.0-Manual</p>
            </div>
        </div>
    );
}

function InputGroup({ label, icon, placeholder, value, onChange, type = "text" }: any) {
    return (
        <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#27954D] transition-colors">{icon}</div>
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-11 pr-4 py-4 text-sm font-medium outline-none focus:border-[#27954D]/30 focus:bg-white transition-all text-slate-700"
                />
            </div>
        </div>
    );
}

function CopyBox({ label, value, onCopy }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{label}</label>
            <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-mono text-slate-600 truncate shadow-inner">
                    {value}
                </div>
                <button
                    onClick={onCopy}
                    className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#27954D]/30 hover:text-[#27954D] transition-all active:scale-90 shadow-sm"
                >
                    <Copy size={18} />
                </button>
            </div>
        </div>
    );
}
