"use client";
import { useState, useEffect } from "react";
import {
    Mail, Shield, Zap, Send, Save, Loader2,
    CheckCircle2, AlertTriangle, Eye, EyeOff,
    Lock, Server, ArrowRight, ShieldCheck, Activity,
    ChevronRight, ArrowUpRight, X
} from "lucide-react";

export default function EmailPage() {
    const [config, setConfig] = useState({
        host: "",
        port: "587",
        user: "",
        pass: "",
        from_name: "",
        from_email: "",
        encryption: "TLS"
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetch("/api/reseller/branding")
            .then(res => res.json())
            .then(data => {
                if (data.data?.smtp_config) {
                    setConfig(prev => ({ ...prev, ...data.data.smtp_config }));
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: "", text: "" });
        try {
            const res = await fetch("/api/reseller/branding", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    smtp_config: {
                        host: config.host,
                        port: parseInt(config.port) || 587,
                        user: config.user,
                        pass: config.pass,
                        from_name: config.from_name,
                        from_email: config.from_email,
                        encryption: config.encryption
                    }
                })
            });
            if (res.ok) {
                setMessage({ type: "success", text: "Email Relay Configuration Saved." });
            } else {
                const d = await res.json();
                setMessage({ type: "error", text: d.error || "Failed to save configuration." });
            }
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        if (!config.host || !config.user) {
            setMessage({ type: "error", text: "Fill host and username before testing." });
            return;
        }
        setTesting(true);
        setMessage({ type: "", text: "" });
        try {
            const res = await fetch("/api/reseller/branding/test-smtp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ smtp_config: config })
            });
            if (res.ok) {
                setMessage({ type: "success", text: "Test Email Sent: Check " + (config.from_email || config.user) });
            } else {
                const d = await res.json();
                setMessage({ type: "error", text: d.error || "Test Failed. Check SMTP Credentials." });
            }
        } catch {
            setMessage({ type: "error", text: "Endpoint Connection Timeout." });
        } finally {
            setTesting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
    );

    return (
        <div className="max-w-6xl space-y-12 animate-in fade-in duration-700 pb-24">

            {/* Simple Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-600 font-black text-[9px] uppercase tracking-[0.3em] mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600 shadow-[0_0_8px_rgba(71,85,105,0.4)]" />
                        Outbound Mail
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                        SMTP Config<span className="text-slate-600">.</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm tracking-tight italic">Configure your outbound mail server to send automated system emails.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleTest}
                        disabled={testing}
                        className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                    >
                        {testing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {testing ? "Sending..." : "Test SMTP"}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="group bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl active:scale-95 hover:bg-black"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="group-hover:scale-110 transition-transform" />}
                        {saving ? "Saving..." : "Save Config"}
                    </button>
                </div>
            </div>

            {/* Response Channel */}
            {message.text && (
                <div className={`p-6 rounded-[2rem] flex items-center gap-4 text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-4 shadow-sm border ${message.type === "success"
                    ? "bg-emerald-50 border-emerald-100 text-[#27954D]"
                    : "bg-rose-50 border-rose-100 text-rose-600"
                    }`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg ${message.type === "success" ? "bg-[#27954D]" : "bg-rose-600"
                        }`}>
                        {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    </div>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Configuration Console */}
                <div className="lg:col-span-8 space-y-10">

                    {/* section: server matrix */}
                    <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 blur-3xl rounded-full -mr-16 -mt-16" />
                        <div className="flex items-center gap-4 mb-10 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                                <Server size={22} />
                            </div>
                            <div>
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Relay Configuration</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic mt-1 leading-none">SMTP Core Endpoint Data</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <InputBox label="SMTP Host" placeholder="SMTP.PROVIDER.COM" value={config.host} onChange={v => setConfig({ ...config, host: v })} />
                            <InputBox label="Port Access" placeholder="587" value={config.port} onChange={v => setConfig({ ...config, port: v })} />
                            <InputBox label="Identity / User" placeholder="NAME@BRAND.COM" value={config.user} onChange={v => setConfig({ ...config, user: v })} />

                            {/* Password Terminal */}
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Access Token</label>
                                <div className="relative group/field">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-blue-600 transition-colors"><Lock size={16} /></div>
                                    <input
                                        type={showPass ? "text" : "password"}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] pl-14 pr-14 py-5 font-black italic text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-200 shadow-inner"
                                        placeholder="••••••••••••"
                                        value={config.pass}
                                        onChange={e => setConfig({ ...config, pass: e.target.value })}
                                    />
                                    <button
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-200 hover:text-blue-600 transition-colors"
                                    >
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Encryption Matrix */}
                        <div className="mt-10 pt-10 border-t border-slate-50">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 mb-4 block">Security Protocol</label>
                            <div className="grid grid-cols-3 gap-4">
                                {["TLS", "SSL", "NONE"].map(enc => (
                                    <button
                                        key={enc}
                                        onClick={() => setConfig({ ...config, encryption: enc })}
                                        className={`py-5 rounded-[2rem] border-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex flex-col items-center gap-2 ${config.encryption === enc
                                            ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]"
                                            : "bg-slate-50 border-slate-100 text-slate-300 hover:border-slate-200"
                                            }`}
                                    >
                                        {enc}
                                        {config.encryption === enc && <div className="w-1 h-1 rounded-full bg-white animate-pulse" />}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-4 text-center italic">TLS (587) is the recommended standard for global deliverability.</p>
                        </div>
                    </section>
                </div>

                {/* Sender Identity & Metrics */}
                <div className="lg:col-span-4 space-y-10">

                    {/* Sender Identity */}
                    <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm space-y-8 group hover:border-blue-100 transition-all">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                                <Mail size={22} />
                            </div>
                            <div>
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Fingerprint</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic mt-1 leading-none">Sender Alias & Mask</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <InputBox label="Mask Name" placeholder="SUPPORT TEAM" value={config.from_name} onChange={v => setConfig({ ...config, from_name: v })} icon={null} />
                            <InputBox label="Alias Email" placeholder="HELLO@BRAND.COM" value={config.from_email} onChange={v => setConfig({ ...config, from_email: v })} icon={null} />
                        </div>

                        {/* Live Dispatch Preview */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-6 space-y-4 relative overflow-hidden group/prev">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-2xl rounded-full" />
                            <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] italic">Email.Preview</div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#27954D] shadow-[0_0_6px_rgba(39,149,77,0.5)]" />
                                    <span className="text-[9px] text-white/40 font-black uppercase tracking-widest truncate max-w-[150px]">{config.from_name || "YOUR BRAND"}</span>
                                </div>
                                <div className="text-[10px] text-white font-black italic tracking-tighter uppercase leading-tight">OTP DISPATCH: #583921</div>
                                <div className="h-0.5 w-full bg-white/5 rounded-full" />
                                <div className="text-[8px] text-white/20 font-bold uppercase tracking-widest">{config.from_email || "SUPPORT@BRAND.COM"}</div>
                            </div>
                        </div>
                    </section>

                    {/* Trust Protocol */}
                    <section className="bg-blue-600 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-xl shadow-blue-600/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                        <div className="relative z-10 space-y-4">
                            <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-white">
                                <ShieldCheck size={20} />
                            </div>
                            <h4 className="text-white font-black text-lg italic uppercase tracking-tighter leading-none">Trust Protocols</h4>
                            <p className="text-white/60 text-[10px] font-medium leading-relaxed">Ensure SPF, DKIM, and DMARC handshakes are active on your DNS provider to avoid spam filtration.</p>
                            <div className="flex gap-2">
                                {['SPF', 'DKIM', 'DMARC'].map(tag => (
                                    <div key={tag} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black text-white/50 uppercase tracking-widest">{tag}</div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function InputBox({ label, placeholder, value, onChange, icon }: { label: string, placeholder: string, value: string, onChange: (v: string) => void, icon?: any }) {
    return (
        <div className="space-y-3">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{label}</label>
            <div className="relative group/field">
                {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-blue-600 transition-colors">{icon}</div>}
                <input
                    className={`w-full bg-slate-50 border border-slate-200 rounded-[2rem] ${icon ? 'pl-14' : 'px-8'} pr-8 py-5 text-sm font-black italic uppercase tracking-tighter text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-200 shadow-inner`}
                    placeholder={placeholder}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                />
            </div>
        </div>
    );
}
