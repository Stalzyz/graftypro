
"use client";

import { useState } from "react";
import {
    Globe,
    Edit3,
    Eye,
    Plus,
    Move,
    Trash2,
    Layout,
    CheckCircle2,
    RefreshCw,
    ImageIcon,
    Link as LinkIcon,
    ArrowUpRight
} from "lucide-react";

export default function LandingPageBuilder() {
    const [sections, setSections] = useState([
        { id: 1, type: "Hero", title: "Scale your revenue with WhatsApp", subtitle: "Official Meta BSP Infrastructure", active: true },
        { id: 2, type: "Features", title: "Automate everything", subtitle: "Flows, Drips, Chatbots", active: true },
        { id: 3, type: "Pricing", title: "Transparent Pricing", subtitle: "Scale as you grow", active: true },
        { id: 4, type: "Reseller", title: "Partner Program", subtitle: "Build your own agency", active: false },
    ]);

    return (
        <div className="max-w-7xl space-y-12 pb-20 font-sans">
            <header className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <Globe className="text-white" size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Frontline Experience</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Control the public-facing landing pages, offer banners, and CTA engines.</p>
                </div>

                <div className="flex gap-4">
                    <button className="px-6 py-4 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                        <Eye size={14} />
                        View Live Site
                    </button>
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95">
                        <RefreshCw size={14} />
                        Deploy Changes
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Section List */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between px-4 mb-2">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Active Blueprint</span>
                        <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:underline">
                            <Plus size={12} /> Add Custom Section
                        </button>
                    </div>

                    <div className="space-y-4">
                        {sections.map((section, idx) => (
                            <div key={section.id} className="bg-white rounded-[32px] border border-slate-100 p-6 flex items-center gap-6 group hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all cursor-move">
                                    <Move size={18} />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            {section.type}
                                        </span>
                                        {!section.active && (
                                            <span className="px-2 py-0.5 rounded-md bg-orange-50 text-[9px] font-black text-orange-400 uppercase tracking-widest">
                                                Hidden
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-black text-slate-900 tracking-tight">{section.title}</h4>
                                    <p className="text-xs text-slate-400">{section.subtitle}</p>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                                        <Edit3 size={16} />
                                    </button>
                                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Offer Banners & Global CTA */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-slate-900 rounded-[40px] p-10 text-white space-y-8 shadow-2xl overflow-hidden relative group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 blur-[80px] group-hover:bg-blue-600/40 transition-all" />

                        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                            <ImageIcon className="text-blue-400" size={18} />
                            <h2 className="text-sm font-black uppercase tracking-widest">Offer Console</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Active Banner Text</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:bg-white/10 focus:outline-none transition-all placeholder:text-slate-700"
                                    rows={3}
                                    placeholder="e.g. FLAT 50% OFF FOR FIRST 100 VENDORS. USE CODE: STARTUP50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">CTA Destination</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-white focus:bg-white/10 focus:outline-none transition-all"
                                        placeholder="/register?promo=true"
                                    />
                                </div>
                            </div>

                            <button className="w-full py-5 bg-blue-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-500 transition-all active:scale-95">
                                <RefreshCw size={14} /> Update Experience
                            </button>
                        </div>
                    </section>

                    <section className="bg-white rounded-[40px] border border-slate-100 p-8 space-y-6 shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <Layout className="text-slate-400" size={18} />
                            <h2 className="text-xs font-black uppercase tracking-widest">Static Assets</h2>
                        </div>

                        <div className="space-y-3">
                            <AssetLink label="Customer Reviews" />
                            <AssetLink label="Brand Guidelines" />
                            <AssetLink label="Legal Pack" />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function AssetLink({ label }: any) {
    return (
        <button className="w-full h-16 bg-slate-50 rounded-2xl flex items-center px-6 justify-between group hover:bg-slate-900 transition-all duration-300">
            <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest transition-colors">{label}</span>
            <ArrowUpRight size={14} className="text-slate-300 group-hover:text-white transition-colors" />
        </button>
    );
}
