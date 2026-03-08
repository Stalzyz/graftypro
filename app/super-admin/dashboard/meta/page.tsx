"use client";

import { useState, useEffect } from "react";
import {
    Facebook,
    ShieldCheck,
    Save,
    RefreshCw,
    Globe,
    Key,
    Layout,
    Database,
    CheckCircle2,
    Lock,
    Settings,
    HelpCircle
} from "lucide-react";

export default function MetaOnboardingPage() {
    const [config, setConfig] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("/api/super-admin/config")
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const res = await fetch("/api/super-admin/config", {
            method: "POST",
            body: JSON.stringify(config),
            headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
            setMessage("Meta Business Integration Synchronized!");
            setTimeout(() => setMessage(""), 3000);
        }
        setSaving(false);
    };

    if (loading) return <div className="p-20 text-center"><RefreshCw className="animate-spin inline mr-2" /> Initializing Handshake...</div>;

    return (
        <div className="max-w-6xl space-y-12 pb-20 animate-fade-in">
            <header className="flex items-end justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#042f94] font-semibold text-[10px] uppercase tracking-[0.2em] mb-3">
                        <Facebook size={14} />
                        Cloud API Onboarding
                    </div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight italic">Meta Business Bridge</h1>
                    <p className="text-slate-400 text-sm font-medium">Link your platform to Meta's infrastructure as a Tech Provider.</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-4 bg-[#0668E1] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-[#0556bc] transition-all shadow-xl shadow-[#0668E1]/20 active:scale-95 disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                    Deploy Meta Protocol
                </button>
            </header>

            {message && (
                <div className="bg-[#27954D]/10 border border-[#27954D]/20 p-4 rounded-2xl flex items-center gap-3 text-[#27954D] font-bold text-sm">
                    <CheckCircle2 size={18} />
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Core App Credentials */}
                <section className="bg-white rounded-[40px] border border-slate-100 p-10 space-y-8 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                            <Key size={20} />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">App Identity</h3>
                    </div>

                    <div className="space-y-6">
                        <SettingInput
                            label="Meta App ID"
                            value={config.meta_app_id}
                            onChange={(v: string) => setConfig({ ...config, meta_app_id: v })}
                        />
                        <SettingInput
                            label="Meta App Secret"
                            type="password"
                            value={config.meta_app_secret}
                            onChange={(v: string) => setConfig({ ...config, meta_app_secret: v })}
                            description="Stored with AES-256-GCM encryption."
                        />
                    </div>
                </section>

                {/* Business Identifiers */}
                <section className="bg-white rounded-[40px] border border-slate-100 p-10 space-y-8 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                            <Database size={20} />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Business Logic</h3>
                    </div>

                    <div className="space-y-6">
                        <SettingInput
                            label="Meta Business ID"
                            value={config.meta_business_id}
                            onChange={(v: string) => setConfig({ ...config, meta_business_id: v })}
                        />
                        <SettingInput
                            label="Primary WABA ID"
                            value={config.meta_waba_id}
                            onChange={(v: string) => setConfig({ ...config, meta_waba_id: v })}
                            description="The default WhatsApp Business Account for the platform."
                        />
                        <SettingInput
                            label="Meta Phone ID"
                            value={config.meta_phone_id}
                            onChange={(v: string) => setConfig({ ...config, meta_phone_id: v })}
                            description="The specific Phone Number ID for sending platform-level messages."
                        />
                    </div>
                </section>

                {/* Secure Tokens */}
                <section className="bg-white rounded-[40px] border border-slate-100 p-10 space-y-8 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                <ShieldCheck size={20} />
                            </div>
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Gateway Tokens</h3>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                            <Lock size={10} /> Fully Encrypted Store
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <SettingInput
                            label="Permanent System Token"
                            type="password"
                            value={config.meta_permanent_token}
                            onChange={(v: string) => setConfig({ ...config, meta_permanent_token: v })}
                            description="System User Token with full WABA permissions."
                        />
                        <SettingInput
                            label="Platform Credit Line ID"
                            value={config.meta_credit_line_id}
                            onChange={(v: string) => setConfig({ ...config, meta_credit_line_id: v })}
                            description="Shared credit line ID for technical provider billing."
                        />
                    </div>
                </section>

                {/* Onboarding Mode */}
                <section className="bg-white rounded-[40px] border border-slate-100 p-10 space-y-8 shadow-sm lg:col-span-2">
                    <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
                            <Settings size={20} />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Operational Mode</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div
                            onClick={() => setConfig({ ...config, meta_onboarding_mode: 'TECH_PROVIDER' })}
                            className={`p-8 rounded-[2rem] border-2 cursor-pointer transition-all ${config.meta_onboarding_mode === 'TECH_PROVIDER' ? 'border-[#0668E1] bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-2">Tech Provider</h4>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">Integrated via Meta Cloud API using your own app and Business ID. Best for SaaS platforms.</p>
                        </div>

                        <div
                            onClick={() => setConfig({ ...config, meta_onboarding_mode: 'SOLUTION_PARTNER' })}
                            className={`p-8 rounded-[2rem] border-2 cursor-pointer transition-all ${config.meta_onboarding_mode === 'SOLUTION_PARTNER' ? 'border-purple-500 bg-purple-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-2">Solution Partner</h4>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">Operate through the Meta Solution Partner Program. Requires specific partner credentials and agreement.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function SettingInput({ label, value, onChange, type = "text", description = "" }: { label: string, value: any, onChange: (val: any) => void, type?: string, description?: string }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
            <input
                type={type}
                className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 shadow-inner outline-none focus:bg-white transition-all focus:border-slate-100 placeholder:text-slate-500"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
            />
            {description && <p className="text-[10px] text-slate-400 font-medium px-1 italic">{description}</p>}
        </div>
    );
}
