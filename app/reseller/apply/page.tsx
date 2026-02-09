"use client";

import { useState } from "react";
import {
    ShieldCheck,
    Rocket,
    TrendingUp,
    CheckCircle,
    ArrowRight,
    Globe,
    Zap,
    Users,
    Layout,
    Briefcase,
    Globe2,
    PieChart
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function ResellerApplyPage() {
    return (
        <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-blue-100 font-sans">
            {/* Nav */}
            <nav className="h-24 px-12 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-50 border-b border-slate-50">
                <div className="flex items-center gap-3">
                    <Logo size={32} variant="color" />
                    <div className="h-4 w-px bg-slate-200" />
                    <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Partner Network</span>
                </div>
                <div className="flex items-center gap-8">
                    <Link href="/reseller/dashboard" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                        Network Portal
                    </Link>
                    <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
                        Join the Tower
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-12 py-24 lg:py-40 relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-purple-50/50 rounded-full blur-[120px] -z-10" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
                    <div className="lg:col-span-7 space-y-10">
                        <div className="inline-flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] animate-in slide-in-from-left-4 duration-500">
                            <Zap size={14} fill="white" />
                            Whitelabel Infrastructure
                        </div>

                        <h1 className="text-6xl lg:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter animate-in fade-in slide-in-from-top-8 duration-700">
                            Architect Your <br />
                            <span className="text-blue-600">SaaS Empire.</span>
                        </h1>

                        <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl animate-in fade-in duration-1000">
                            Scale a global messaging agency using the world's most modular WhatsApp automation engine. White-label, distribute, and monetize under your brand.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 pt-6">
                            <button className="h-14 px-12 bg-slate-900 text-white rounded-[32px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-blue-600 transition-all hover:scale-105 active:scale-95 shadow-3xl shadow-slate-200 group">
                                Deploy Your Agency
                                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                            <button className="h-14 px-12 border-2 border-slate-100 text-slate-900 rounded-[32px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all">
                                View Commission Ledger
                            </button>
                        </div>

                        <div className="pt-12 flex items-center gap-8">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="w-14 h-14 rounded-3xl border-4 border-white bg-slate-100 shadow-xl overflow-hidden relative group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-400 group-hover:scale-110 transition-transform" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="text-lg font-black text-slate-900 tracking-tight">Active Tier-1 Partners</div>
                                <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mt-0.5">Operating in 12 Global Regions</div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 grid grid-cols-1 gap-8 relative">
                        <FeatureCard2
                            icon={<ShieldCheck className="text-blue-600" size={32} />}
                            title="Zero-Origin"
                            desc="100% anonymized infrastructure. Your vendors never see Wabot code."
                        />
                        <FeatureCard2
                            icon={<PieChart className="text-[#27954D]" size={32} />}
                            title="Markup Engine"
                            desc="Real-time profit control. Define your own price per message."
                        />
                        <FeatureCard2
                            icon={<Layout className="text-orange-500" size={32} />}
                            title="Domain Tower"
                            desc="C-NAME mapping with automated TLS certification."
                        />
                    </div>
                </div>

                {/* Performance Cluster */}
                <div className="mt-40 pt-24 border-t border-slate-50 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="md:col-span-1">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Network Integrity</h3>
                        <p className="text-sm font-bold text-slate-500 leading-relaxed italic">"The definitive standard for regional SaaS expansion in emerging markets."</p>
                    </div>
                    <MetricCard title="Settled Yield" value="₹2.4Cr+" />
                    <MetricCard title="Compute Load" value="120M+" />
                    <MetricCard title="Success Vector" value="99.9%" />
                </div>
            </main>
        </div>
    );
}

function FeatureCard2({ icon, title, desc }: any) {
    return (
        <div className="p-10 bg-white rounded-[48px] border border-slate-50 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                {icon}
            </div>
            <div className="bg-slate-50 w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 group-hover:bg-slate-900 transition-all duration-500">
                <div className="group-hover:text-white transition-colors duration-500">
                    {icon}
                </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3 uppercase">{title}</h3>
            <p className="text-slate-400 font-bold text-sm leading-relaxed uppercase tracking-tight">{desc}</p>
        </div>
    );
}

function MetricCard({ title, value }: any) {
    return (
        <div className="p-8 bg-white rounded-[40px] border border-slate-50 shadow-sm">
            <div className="text-5xl font-black text-slate-900 tracking-tighter mb-2">{value}</div>
            <div className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">{title}</div>
        </div>
    );
}
