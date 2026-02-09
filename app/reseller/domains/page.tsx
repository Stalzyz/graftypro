"use client";

import { useState } from "react";
import {
    Globe,
    ShieldCheck,
    CheckCircle,
    ExternalLink,
    Settings2,
    Server,
    Cpu,
    Lock,
    Zap,
    RotateCcw,
    AlertTriangle
} from "lucide-react";

export default function DomainsPage() {
    const [verifying, setVerifying] = useState(false);
    const [customDomain, setCustomDomain] = useState("dashboard.mybrand.com");

    const handleVerify = () => {
        setVerifying(true);
        setTimeout(() => setVerifying(false), 2000);
    };

    return (
        <div className="max-w-7xl animate-fade-in space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl">
                            <Globe className="text-white" size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Domain Infrastructure</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-lg max-w-2xl">Map your professional identity to our high-performance messaging cluster.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    {/* Domain Setup */}
                    <section className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <Server size={120} strokeWidth={1} />
                        </div>

                        <div className="flex items-center justify-between mb-12 relative z-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Live Mapping</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: Operational</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-[#27954D]/10 text-[#27954D] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#27954D]/10">
                                <ShieldCheck size={12} strokeWidth={3} /> Connected
                            </div>
                        </div>

                        <div className="space-y-10 relative z-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Deployment URL</label>
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-slate-50 border border-transparent rounded-[24px] px-8 py-5 flex items-center gap-4 transition-all">
                                        <Globe size={20} className="text-slate-300" />
                                        <span className="text-lg font-black text-slate-900 tracking-tight">{customDomain}</span>
                                    </div>
                                    <button className="bg-slate-900 text-white w-16 rounded-[24px] flex items-center justify-center hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                                        <ExternalLink size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-10 bg-slate-900 rounded-[32px] text-white">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                            <Cpu size={18} className="text-[#27954D]" />
                                            Gateway Records
                                        </h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Configure your registrar to these values</p>
                                    </div>
                                    <Lock size={18} className="text-slate-700" />
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 text-[10px] font-black uppercase text-slate-600 tracking-widest px-4">
                                        <div>Record Type</div>
                                        <div>Mapping Host</div>
                                        <div>Sequence Value</div>
                                    </div>
                                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5 grid grid-cols-3 text-sm font-mono items-center hover:bg-white/10 transition-all cursor-crosshair">
                                        <div className="text-[#27954D] font-black uppercase tracking-widest text-[10px]">CNAME</div>
                                        <div className="font-bold">dashboard</div>
                                        <div className="text-slate-400">cname.wabot.in</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <Zap size={14} className="text-amber-500" />
                                    <p className="text-[10px] text-slate-400 font-bold italic tracking-tight uppercase">
                                        DNS propagation globally typically requires 12-24 hours.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                            <button
                                className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-[#27954D] transition-all flex items-center justify-center gap-3 disabled:bg-slate-200 group"
                                onClick={handleVerify}
                                disabled={verifying}
                            >
                                <RotateCcw size={14} className={verifying ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                                {verifying ? "Scanning Records..." : "Verify DNS Cluster"}
                            </button>
                            <div className="flex items-center gap-8">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">TLS Encryption</span>
                                    <span className="text-xs font-black text-[#27954D] uppercase">Active & Secure</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden group shadow-3xl">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Globe size={180} strokeWidth={1} />
                        </div>
                        <h3 className="text-xl font-black mb-8 relative z-10 tracking-tight">Identity Advantages</h3>
                        <ul className="space-y-6 relative z-10">
                            <BenefitItem
                                title="Vendor Trust"
                                description="Operate on your own root domain to establish authority."
                            />
                            <BenefitItem
                                title="Invisible Origin"
                                description="Complete obfuscation of our backend infrastructure."
                            />
                            <BenefitItem
                                title="SEO Authority"
                                description="Index your white-label pages under your own brand."
                            />
                        </ul>
                    </div>

                    <div className="p-8 bg-rose-50 rounded-[40px] border border-rose-100 group">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-rose-500 shadow-sm transition-transform group-hover:rotate-12">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[10px] font-black text-rose-900 uppercase tracking-widest mb-1">Architecture Warning</h4>
                                <p className="text-[11px] text-rose-700 font-bold leading-relaxed">
                                    Misconfiguring CNAME records may lead to persistent SSL handshake failures and service downtime for your sub-vendors.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BenefitItem({ title, description }: { title: string, description: string }) {
    return (
        <li className="flex gap-4 group/item">
            <div className="mt-1 w-5 h-5 rounded-full bg-[#27954D] flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform shadow-[0_0_12px_rgba(39,149,77,0.3)]">
                <CheckCircle size={12} className="text-white" strokeWidth={4} />
            </div>
            <div>
                <div className="text-xs font-black uppercase tracking-widest text-white mb-1">{title}</div>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{description}</p>
            </div>
        </li>
    )
}
