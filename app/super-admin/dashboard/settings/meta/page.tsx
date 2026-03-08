
"use client";

import { useState, useEffect } from "react";
import {
    Activity,
    Save,
    ShieldCheck,
    Key,
    Lock,
    Eye,
    EyeOff,
    Zap,
    Info,
    CheckCircle2,
    RefreshCw,
    Globe,
    Settings,
    CreditCard
} from "lucide-react";

export default function MetaArchitecture() {
    const [config, setConfig] = useState<any>({
        meta_app_id: "",
        meta_app_secret: "",
        meta_waba_id: "",
        meta_business_id: "",
        meta_system_token: "",
        meta_permanent_token: "",
        meta_credit_line_id: "",
        meta_onboarding_mode: "TECH_PROVIDER",
        meta_config_id: "",
        meta_phone_id: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSecrets, setShowSecrets] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch("/api/super-admin/config");
            const data = await res.json();
            if (data) {
                setConfig({
                    ...data,
                    // Secrets are kept empty in the UI to avoid overwriting unless changed
                    meta_app_secret: "",
                    meta_system_token: "",
                    meta_permanent_token: "",
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = { ...config };
            // Remove secrets if they are empty (to avoid overwriting with empty)
            if (!payload.meta_app_secret) delete payload.meta_app_secret;
            if (!payload.meta_system_token) delete payload.meta_system_token;
            if (!payload.meta_permanent_token) delete payload.meta_permanent_token;

            const res = await fetch("/api/super-admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setMessage("Settings saved successfully.");
                setTimeout(() => setMessage(""), 5000);
                fetchConfig();
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert("Operation Failed: " + (errorData.error || "Check server logs for details."));
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred during sync.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <RefreshCw className="animate-spin text-slate-300" size={32} />
        </div>
    );

    return (
        <div className="max-w-7xl space-y-12 pb-20 font-sans">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[#27954D] font-semibold text-[10px] uppercase tracking-[0.2em] mb-3">
                        <Activity size={14} />
                        Meta
                    </div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight">Meta Settings</h1>
                    <p className="text-slate-400 text-sm font-medium">Manage Meta App and Business settings.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowSecrets(!showSecrets)}
                        className="px-6 py-4 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        {showSecrets ? <EyeOff size={14} /> : <Eye size={14} />}
                        {showSecrets ? "Hide" : "Show"}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                        {saving ? "SAVING..." : "SAVE SETTINGS"}
                    </button>
                </div>
            </header>

            {message && (
                <div className="bg-[#27954D]/10 border border-[#27954D]/20 p-4 rounded-2xl flex items-center gap-3 text-[#27954D] font-bold text-sm animate-in fade-in slide-in-from-top-4">
                    <CheckCircle2 size={18} />
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Meta App Context */}
                <div className="lg:col-span-2 space-y-10">
                    <section className="bg-white rounded-[40px] border border-slate-100 p-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Key size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">App Credentials</h2>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Meta App basic details</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Meta App ID</label>
                                <input
                                    type="text"
                                    value={config.meta_app_id || ""}
                                    onChange={(e) => setConfig({ ...config, meta_app_id: e.target.value })}
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-100 focus:outline-none transition-all"
                                    placeholder="e.g. 154823901928..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Meta App Secret</label>
                                <div className="relative group">
                                    <input
                                        type={showSecrets ? "text" : "password"}
                                        value={config.meta_app_secret || ""}
                                        onChange={(e) => setConfig({ ...config, meta_app_secret: e.target.value })}
                                        className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-100 focus:outline-none transition-all pr-12"
                                        placeholder={config.meta_app_secret_enc ? "••••••••••••••••" : "Paste Secret"}
                                    />
                                    <Lock size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Configuration ID</label>
                            <input
                                type="text"
                                value={config.meta_config_id || ""}
                                onChange={(e) => setConfig({ ...config, meta_config_id: e.target.value })}
                                className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-100 focus:outline-none transition-all"
                                placeholder="The 'Config ID' from your Meta App"
                            />
                        </div>
                    </section>

                    <section className="bg-white rounded-[40px] border border-slate-100 p-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Zap size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Tokens</h2>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Meta system user tokens</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">System User Token (Permanent)</label>
                                <textarea
                                    value={config.meta_system_token || ""}
                                    onChange={(e) => setConfig({ ...config, meta_system_token: e.target.value })}
                                    rows={3}
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-100 focus:outline-none transition-all resize-none"
                                    placeholder={config.meta_system_token_enc ? "••••••••••••••••••••••••••••••••••••" : "EAA..."}
                                />
                                <p className="text-[9px] font-bold text-slate-400 italic">This token is used for automated template approval and health monitoring.</p>
                            </div>

                            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Onboarding Mode</label>
                                    <select
                                        value={config.meta_onboarding_mode || "TECH_PROVIDER"}
                                        onChange={(e) => setConfig({ ...config, meta_onboarding_mode: e.target.value })}
                                        className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-100 focus:outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="TECH_PROVIDER">Technology Provider</option>
                                        <option value="SOLUTION_PARTNER">Solution Partner</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Credit Line ID</label>
                                    <input
                                        type="text"
                                        value={config.meta_credit_line_id || ""}
                                        onChange={(e) => setConfig({ ...config, meta_credit_line_id: e.target.value })}
                                        className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-100 focus:outline-none transition-all"
                                        placeholder="Meta Billing ID"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-10">
                    <div className="bg-slate-900 rounded-[40px] p-10 text-white space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[60px]" />

                        <div className="space-y-2 relative z-10">
                            <h3 className="text-xl font-black italic tracking-tight">Identifiers</h3>
                            <p className="text-slate-400 text-xs font-medium">Business and WABA IDs</p>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Business ID</label>
                                <input
                                    type="text"
                                    value={config.meta_business_id || ""}
                                    onChange={(e) => setConfig({ ...config, meta_business_id: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:bg-white/10 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">WABA ID</label>
                                <input
                                    type="text"
                                    value={config.meta_waba_id || ""}
                                    onChange={(e) => setConfig({ ...config, meta_waba_id: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:bg-white/10 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Phone ID</label>
                                <input
                                    type="text"
                                    value={config.meta_phone_id || ""}
                                    onChange={(e) => setConfig({ ...config, meta_phone_id: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:bg-white/10 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                    <Info size={14} />
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                    All vendors onboarded via Embedded Signup will be linked to this Master Business ID for shared billing and management.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] border border-slate-100 p-10 space-y-6">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest text-[#27954D]">Internal Security</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AES-256 Encryption</span>
                                <ShieldCheck size={16} className="text-[#27954D]" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Row-Level Security</span>
                                <ShieldCheck size={16} className="text-[#27954D]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
