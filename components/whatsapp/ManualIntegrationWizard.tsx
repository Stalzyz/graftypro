"use client";

import { useState, useEffect, useCallback } from "react";
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
    RefreshCw,
    BookOpen
} from "lucide-react";
import Link from "next/link";

interface ManualWizardProps {
    onComplete: () => void;
    onCancel: () => void;
}

export default function ManualIntegrationWizard({ onComplete, onCancel }: ManualWizardProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        wabaId: "",
        phoneNumberId: "",
        appId: "",
        appSecret: "",
        accessToken: "",
        billingModel: "DIRECT" as "DIRECT" | "MANAGED"
    });

    const [config, setConfig] = useState({
        webhookUrl: "",
        verifyToken: ""
    });

    const [validationResult, setValidationResult] = useState<any>(null);

    // Fetch Webhook Config
    const fetchConfig = useCallback(async () => {
        try {
            const res = await fetch("/api/whatsapp/config");
            const data = await res.json();
            if (data.webhookUrl) {
                setConfig(data);
                console.log("[Wizard] Webhook config received:", data.webhookUrl);
            }
        } catch (err) {
            console.error("[Wizard] Failed to fetch config:", err);
        }
    }, []);

    // Load on mount
    useEffect(() => {
        const saved = localStorage.getItem("manual_setup_draft");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setFormData(prev => ({ ...prev, ...parsed }));
            } catch (e) {}
        }
        fetchConfig();
    }, [fetchConfig]);

    // Save on change
    useEffect(() => {
        localStorage.setItem("manual_setup_draft", JSON.stringify(formData));
    }, [formData]);

    // When moving to Step 3, re-fetch config if blank
    useEffect(() => {
        if (step === 3 && !config.webhookUrl) {
            fetchConfig();
        }
    }, [step, config.webhookUrl, fetchConfig]);

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

            // data.data now contains verifiedName and phoneNumber from our monster API fix
            setValidationResult(data.data);
            setStep(2);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    return (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden animate-fade-in max-w-2xl mx-auto">
            <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">WhatsApp Cloud API</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Manual Setup Wizard</p>
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

                {/* Step 1: Form */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-slate-800">App Hosting Model</p>
                                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-inner">
                                    <button onClick={() => setFormData({ ...formData, billingModel: 'MANAGED' })} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.billingModel === 'MANAGED' ? 'bg-[#27954D] text-white shadow-md' : 'text-slate-400'}`}>Grafty Hub</button>
                                    <button onClick={() => setFormData({ ...formData, billingModel: 'DIRECT' })} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.billingModel === 'DIRECT' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400'}`}>Own App</button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputGroup label="WABA ID" icon={<Building size={16} />} placeholder="1092..." value={formData.wabaId} onChange={(v: string) => setFormData({ ...formData, wabaId: v })} />
                            <InputGroup label="Phone Number ID" icon={<Phone size={16} />} placeholder="2019..." value={formData.phoneNumberId} onChange={(v: string) => setFormData({ ...formData, phoneNumberId: v })} />
                            {formData.billingModel === 'DIRECT' && (
                                <>
                                    <InputGroup label="App ID" icon={<Globe size={16} />} placeholder="8273..." value={formData.appId} onChange={(v: string) => setFormData({ ...formData, appId: v })} />
                                    <InputGroup label="App Secret" icon={<Lock size={16} />} placeholder="••••" type="password" value={formData.appSecret} onChange={(v: string) => setFormData({ ...formData, appSecret: v })} />
                                </>
                            )}
                        </div>
                        <InputGroup label="Access Token" icon={<ShieldCheck size={16} />} placeholder="EAAG...." type="password" value={formData.accessToken} onChange={(v: string) => setFormData({ ...formData, accessToken: v })} />

                        <div className="pt-6 flex justify-between">
                            <button onClick={onCancel} className="text-slate-400 text-sm font-bold hover:text-slate-600">Cancel</button>
                            <button onClick={validateAndSave} disabled={loading} className="bg-[#27954D] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg disabled:opacity-50">
                                {loading && <Loader2 className="animate-spin" size={18} />}
                                Validate & Continue <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Show Resolved Identity (Phone # and Name) */}
                {step === 2 && (
                    <div className="space-y-8">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-green-50 text-[#27954D] rounded-full flex items-center justify-center shadow-inner"><CheckCircle size={32} /></div>
                            <h3 className="text-xl font-bold text-slate-800">Verification Successful</h3>
                        </div>

                        <div className="bg-slate-50 rounded-3xl p-6 grid grid-cols-2 gap-6 border border-slate-100 italic shadow-inner">
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Display Name</p>
                                <p className="text-sm font-bold text-slate-700">{validationResult?.verifiedName || "Unknown"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Phone Number</p>
                                <p className="text-sm font-bold text-[#042f94]">+{validationResult?.phoneNumber || "Unknown"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Quality</p>
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{validationResult?.qualityRating || "GREEN"}</span>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-between">
                            <button onClick={() => setStep(1)} className="text-slate-400 flex items-center gap-2"><ArrowLeft size={18} /> Back</button>
                            <button onClick={() => setStep(3)} className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2">Setup Webhook <ArrowRight size={18} /></button>
                        </div>
                    </div>
                )}

                {/* Step 3: Webhook (The Fix for Blank URLs) */}
                {step === 3 && (
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-800">Step 3 — Webhook Handshake</h3>
                            <p className="text-sm text-slate-500">Configure these in your Meta App Dashboard / WhatsApp / Configuration.</p>
                        </div>

                        <div className="space-y-4">
                            {config.webhookUrl ? (
                                <>
                                    <CopyBox label="Callback URL" value={config.webhookUrl} onCopy={() => copyToClipboard(config.webhookUrl)} />
                                    <CopyBox label="Verify Token" value={config.verifyToken} onCopy={() => copyToClipboard(config.verifyToken)} />
                                </>
                            ) : (
                                <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-center space-y-4">
                                    <Loader2 className="animate-spin mx-auto text-slate-300" size={32} />
                                    <p className="text-sm text-slate-400 font-bold">Fetching webhook configuration...</p>
                                    <button onClick={fetchConfig} className="text-[#27954D] text-xs font-bold flex items-center gap-2 mx-auto uppercase"><RefreshCw size={14} /> Retry Now</button>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 flex justify-between">
                            <button onClick={() => setStep(2)} className="text-slate-400 flex items-center gap-2"><ArrowLeft size={18} /> Back</button>
                            <button onClick={() => { localStorage.removeItem("manual_setup_draft"); onComplete(); }} className="bg-gradient-to-r from-[#27954D] to-[#042f94] text-white px-10 py-4 rounded-2xl font-bold shadow-lg">Establish Connection</button>
                        </div>
                    </div>
                )}
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
                <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-11 pr-4 py-4 text-sm font-medium outline-none focus:border-[#27954D]/30 focus:bg-white transition-all text-slate-700" />
            </div>
        </div>
    );
}

function CopyBox({ label, value, onCopy }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{label}</label>
            <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-mono text-slate-600 truncate shadow-inner">{value}</div>
                <button onClick={onCopy} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#27954D]/30 hover:text-[#27954D] shadow-sm"><Copy size={18} /></button>
            </div>
        </div>
    );
}
