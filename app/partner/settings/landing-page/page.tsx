"use client";
import React, { useEffect, useState } from "react";
import {
    Save, Loader2, Layout, Globe, Code,
    CheckCircle2, AlertTriangle, ExternalLink,
    Zap, Monitor, Info, Shield
} from "lucide-react";
import Link from 'next/link';

export default function LandingPageSettings() {
    const [config, setConfig] = useState({
        home_page_type: "DEFAULT",
        external_home_url: "",
        custom_home_html: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetch("/api/reseller/landing-page")
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setConfig({
                        home_page_type: data.data.home_page_type || "DEFAULT",
                        external_home_url: data.data.external_home_url || "",
                        custom_home_html: data.data.custom_home_html || ""
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
            const res = await fetch("/api/reseller/landing-page", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            });
            if (res.ok) {
                setMessage({ type: "success", text: "Landing Page Strategy Synchronized." });
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-600 font-black text-[9px] uppercase tracking-[0.3em] mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600 shadow-[0_0_8px_rgba(71,85,105,0.4)]" />
                        Platform Portal
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                        Homepage<span className="text-slate-600">.</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm tracking-tight italic">Define your entry point strategy for custom domains.</p>
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
                {/* Configuration Console */}
                <div className="lg:col-span-8 space-y-10">
                    <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 blur-3xl rounded-full -mr-16 -mt-16" />
                        
                        <div className="flex items-center gap-4 mb-12 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                                <Layout size={22} />
                            </div>
                            <div>
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Strategy Configuration</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic mt-1 leading-none">Select the primary responder type</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                            <StrategyOption 
                                active={config.home_page_type === "DEFAULT"}
                                onClick={() => setConfig({ ...config, home_page_type: "DEFAULT" })}
                                icon={<Monitor size={20} />}
                                label="Branded Default"
                                desc="Optimized platform landing page with your identity."
                            />
                            <StrategyOption 
                                active={config.home_page_type === "EXTERNAL"}
                                onClick={() => setConfig({ ...config, home_page_type: "EXTERNAL" })}
                                icon={<Globe size={20} />}
                                label="External Redirect"
                                desc="Redirect root traffic to your existing homepage."
                            />
                            <StrategyOption 
                                active={config.home_page_type === "CUSTOM"}
                                onClick={() => setConfig({ ...config, home_page_type: "CUSTOM" })}
                                icon={<Code size={20} />}
                                label="Custom HTML"
                                desc="Inject your own HTML/CSS for a unique experience."
                            />
                        </div>

                        {/* Conditionals */}
                        <div className="mt-12 pt-12 border-t border-slate-50 relative z-10 space-y-10">
                            {config.home_page_type === "EXTERNAL" && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                                        Redirect URL <Info size={12} className="text-slate-300" />
                                    </label>
                                    <div className="relative group/field">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-blue-600 transition-colors"><Globe size={16} /></div>
                                        <input
                                            className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] pl-14 pr-8 py-5 text-sm font-black tracking-tight text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-200 shadow-inner"
                                            placeholder="https://your-main-site.com"
                                            value={config.external_home_url}
                                            onChange={e => setConfig({ ...config, external_home_url: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic ml-1">Traffic hitting your root custom domain will be redirected here.</p>
                                </div>
                            )}

                            {config.home_page_type === "CUSTOM" && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                                        HTML Payload <Info size={12} className="text-slate-300" />
                                    </label>
                                    <div className="relative group/field">
                                        <div className="absolute left-6 top-8 text-slate-300 group-focus-within/field:text-blue-600 transition-colors"><Code size={16} /></div>
                                        <textarea
                                            rows={12}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] pl-14 pr-8 py-8 text-sm font-mono text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-200 shadow-inner"
                                            placeholder="<!DOCTYPE html>... Your custom code here"
                                            value={config.custom_home_html}
                                            onChange={e => setConfig({ ...config, custom_home_html: e.target.value })}
                                        />
                                    </div>
                                    <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-[2rem] flex items-start gap-4">
                                        <Shield size={18} className="text-blue-600 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-blue-700 font-bold leading-relaxed">
                                            WARNING: Direct HTML injection is high-privilege. Ensure your code is valid and secure. We serve this via a standard &lt;main&gt; wrapper.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {config.home_page_type === "DEFAULT" && (
                                <div className="animate-in fade-in slide-in-from-top-4">
                                    <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                <CheckCircle2 size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-900 uppercase italic">Native Optimization Active</h3>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Using platform standard whitelabel engine.</p>
                                            </div>
                                        </div>
                                        <Link href="/partner/settings" className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-emerald-500 transition-all flex items-center gap-2">
                                            Verify Branding <ArrowRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-8">
                   <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 relative z-10">System Insight</h3>
                        <div className="space-y-6 relative z-10">
                            <InsightRow 
                                icon={<Zap size={14} className="text-amber-400" />}
                                title="Edge Propagation"
                                desc="Changes sync across global DNS nodes within 60 seconds."
                            />
                            <InsightRow 
                                icon={<Shield size={14} className="text-blue-400" />}
                                title="Auto-SSL Layer"
                                desc="Custom homepages are secured automatically via our edge proxy."
                            />
                            <InsightRow 
                                icon={<Monitor size={14} className="text-[#27954D]" />}
                                title="Device Responsive"
                                desc="Platform default page is pre-optimized for mobile/desktop UX."
                            />
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Quick Links</h4>
                        <div className="space-y-2">
                            <Link href="/partner/domain" className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900 italic">Custom Domains</span>
                                <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-600" />
                            </Link>
                            <Link href="/partner/settings" className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900 italic">Brand Assets</span>
                                <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-600" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StrategyOption({ active, onClick, icon, label, desc }: any) {
    return (
        <button
            onClick={onClick}
            className={`p-6 rounded-[2.2rem] border-2 transition-all text-left flex flex-col gap-4 relative overflow-hidden group ${active
                ? 'border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-900/20'
                : 'border-slate-100 hover:border-slate-300 bg-slate-50 shadow-inner'
                }`}
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-transform duration-500 group-hover:scale-110 ${active ? 'bg-white/10 border-white/20 text-white' : 'bg-white text-slate-400 border-slate-200'
                }`}>
                {icon}
            </div>
            <div>
                <p className={`font-black text-sm italic uppercase tracking-tight leading-none ${active ? 'text-white' : 'text-slate-900'}`}>{label}</p>
                <p className={`text-[9px] font-bold tracking-tight mt-2 leading-relaxed ${active ? 'text-white/60' : 'text-slate-400'}`}>{desc}</p>
            </div>
            {active && <div className="absolute top-4 right-4 text-emerald-400"><CheckCircle2 size={16} /></div>}
        </button>
    );
}

function InsightRow({ icon, title, desc }: any) {
    return (
        <div className="flex gap-4">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">{title}</p>
                <p className="text-[9px] text-white/40 font-bold leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function ArrowRight({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14m-7-7 7 7-7 7" />
        </svg>
    )
}
