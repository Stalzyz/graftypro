"use client";
import React, { useEffect, useState } from "react";
import {
    Layout, Palette, Shield, RefreshCw, Save,
    CheckCircle2, Globe, Eye, Loader2, Image as ImageIcon,
    Target, Monitor, Mail, HelpCircle, ArrowRight, Zap,
    AlertTriangle, Send
} from "lucide-react";
import Link from 'next/link';
import { SmartUploader } from "../../../components/ui/SmartUploader";

export default function BrandingPage() {
    const [config, setConfig] = useState({
        brand_name: "",
        logo_url: "",
        favicon_url: "",
        primary_color: "#0F172A",
        secondary_color: "#3B82F6",
        support_email: "",
        support_url: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetch("/api/reseller/branding")
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setConfig({
                        brand_name: data.data.brand_name || "",
                        logo_url: data.data.logo_url || "",
                        favicon_url: data.data.favicon_url || "",
                        primary_color: data.data.primary_color || "#0F172A",
                        secondary_color: data.data.secondary_color || "#3B82F6",
                        support_email: data.data.support_email || "",
                        support_url: data.data.support_url || ""
                    });
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
                body: JSON.stringify(config)
            });
            if (res.ok) {
                setMessage({ type: "success", text: "Identity Synchronization Complete." });
            } else {
                setMessage({ type: "error", text: "Update Sequence Failed." });
            }
        } finally {
            setSaving(false);
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
                        Platform Identity
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                        Branding<span className="text-slate-600">.</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm tracking-tight italic">Customize your platform experience with your brand identity.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="group bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl active:scale-95 hover:bg-black"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="group-hover:scale-110 transition-transform" />}
                    {saving ? "Transmitting..." : "Sync Gateway"}
                </button>
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
                {/* Visual Identity Console */}
                <div className="lg:col-span-7 space-y-10">
                    <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 blur-3xl rounded-full -mr-16 -mt-16" />
                        <div className="flex items-center gap-4 mb-10 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                                <Palette size={22} />
                            </div>
                            <div>
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Genesis</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic mt-1 leading-none">Primary Label & Visual Tone</p>
                            </div>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Brand Name [H1-TAG]</label>
                                <div className="relative group/field">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-blue-600 transition-colors"><Zap size={16} /></div>
                                    <input
                                        className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] pl-14 pr-8 py-5 text-sm font-black italic uppercase tracking-tighter text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-200 shadow-inner"
                                        placeholder="YOUR PLATFORM NAME"
                                        value={config.brand_name}
                                        onChange={e => setConfig({ ...config, brand_name: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                <ChromeMetric
                                    label="Execution Primary"
                                    desc="Buttons, Highlights, Active Nodes"
                                    value={config.primary_color}
                                    onChange={(v: string) => setConfig({ ...config, primary_color: v })}
                                />
                                <ChromeMetric
                                    label="Neutral Support"
                                    desc="Headers, Borders, Accents"
                                    value={config.secondary_color}
                                    onChange={(v: string) => setConfig({ ...config, secondary_color: v })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Support Config */}
                    <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 blur-3xl rounded-full -mr-16 -mt-16" />
                        <div className="flex items-center gap-4 mb-10 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                                <Mail size={22} />
                            </div>
                            <div>
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Pulse Support</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic mt-1 leading-none">Customer Service Touchpoints</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <InputModule
                                label="Support Email"
                                placeholder="SUPPORT@BRAND.COM"
                                value={config.support_email}
                                onChange={(v: string) => setConfig({ ...config, support_email: v.toLowerCase() })}
                                icon={<Mail size={14} />}
                            />
                            <InputModule
                                label="Support URL"
                                placeholder="HTTPS://SUPPORT.BRAND.COM"
                                value={config.support_url}
                                onChange={(v: string) => setConfig({ ...config, support_url: v.toLowerCase() })}
                                icon={<Globe size={14} />}
                            />
                        </div>
                    </section>
                </div>

                {/* Asset Management & Preview */}
                <div className="lg:col-span-5 space-y-10">
                    {/* Assets */}
                    <section className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm space-y-10 group hover:border-blue-100 transition-all">
                        <div className="space-y-4">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Primary Grid Logo</label>
                            <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-3xl group-hover:bg-white transition-colors">
                                <SmartUploader
                                    label="LOGO"
                                    defaultValue={config.logo_url}
                                    onUploadSuccess={(url: string) => setConfig({ ...config, logo_url: url })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-10 border-t border-slate-50">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Protocol Favicon</label>
                            <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-3xl group-hover:bg-white transition-colors">
                                <SmartUploader
                                    label="FAVICON"
                                    defaultValue={config.favicon_url}
                                    onUploadSuccess={(url: string) => setConfig({ ...config, favicon_url: url })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Preview Sandbox */}
                    <section className="bg-slate-900 rounded-[3.5rem] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 blur-[80px] opacity-40 transition-all duration-1000 group-hover:scale-125" style={{ backgroundColor: config.primary_color }} />
                        <div className="flex items-center gap-3 text-white/30 text-[9px] font-black uppercase tracking-[0.3em] mb-10 relative z-10 italic">
                            <Monitor size={14} className="animate-pulse" /> Sandbox.Preview
                        </div>
                        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl relative z-10 border border-white/10 group-hover:scale-[1.02] transition-transform duration-700">
                            <div className="h-12 border-b border-slate-100 flex items-center justify-between px-5 bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-slate-200">
                                        {config.logo_url
                                            ? <img src={config.logo_url} className="w-full h-full object-contain" alt="logo" />
                                            : <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.primary_color }} />
                                        }
                                    </div>
                                    <span className="text-[10px] font-black text-slate-900 tracking-tighter uppercase italic">{config.brand_name || "PRO CONSOLE"}</span>
                                </div>
                            </div>
                            <div className="flex h-32">
                                <div className="w-12 border-r border-slate-100 p-3 space-y-2 bg-slate-50/30">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`h-1 rounded-full ${i === 1 ? 'w-6' : 'w-4 opacity-30'}`} style={i === 1 ? { backgroundColor: config.primary_color } : { backgroundColor: '#cbd5e1' }} />
                                    ))}
                                </div>
                                <div className="flex-1 p-4 space-y-3">
                                    <div className="h-8 w-full rounded-xl flex items-center justify-center text-white text-[7px] font-black uppercase tracking-widest shadow-lg shadow-black/10" style={{ backgroundColor: config.primary_color }}>
                                        Execute Action
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="h-8 bg-slate-50 border border-slate-100 rounded-lg" />
                                        <div className="h-8 bg-slate-50 border border-slate-100 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Navigation */}
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/partner/domain" className="p-6 bg-slate-50 border border-slate-100 rounded-[2.2rem] flex flex-col items-center gap-3 group hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                            <Globe size={20} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-center italic">Domain & DNS</span>
                        </Link>
                        <Link href="/partner/email" className="p-6 bg-slate-50 border border-slate-100 rounded-[2.2rem] flex flex-col items-center gap-3 group hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                            <Send size={20} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-center italic">SMTP Config</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputModule({ label, placeholder, value, onChange, icon }: any) {
    return (
        <div className="space-y-3">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{label}</label>
            <div className="relative group/field">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-blue-600 transition-colors">{icon}</div>
                <input
                    className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] pl-14 pr-8 py-5 text-sm font-black italic uppercase tracking-tighter text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-200 shadow-inner"
                    placeholder={placeholder}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                />
            </div>
        </div>
    );
}

function ChromeMetric({ label, desc, value, onChange }: any) {
    return (
        <div className="space-y-3">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{label}</label>
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-[2rem] p-4 transition-all focus-within:border-blue-600 group/color shadow-inner">
                <div className="relative w-14 h-14 shrink-0">
                    <input
                        type="color"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full h-full rounded-2xl border-2 border-white shadow-xl" style={{ backgroundColor: value }} />
                </div>
                <div className="flex-1 space-y-0.5">
                    <input
                        type="text"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className="bg-transparent text-sm font-black text-slate-900 uppercase italic outline-none w-full tracking-tighter"
                    />
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">{desc}</p>
                </div>
            </div>
        </div>
    );
}
