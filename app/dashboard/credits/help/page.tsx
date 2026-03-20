"use client";

import { MessageSquare, Zap, Target, BookOpen, ArrowLeft, Coins, CheckCircle2, ShieldCheck, Gem } from "lucide-react";
import Link from "next/link";

export default function CreditHelpPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-fade-in">
            {/* Back Navigation */}
            <Link
                href="/dashboard/credits"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Wallet
            </Link>

            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-[40px] bg-slate-900 text-white p-12 md:p-20 shadow-2xl border-b-4 border-indigo-500/50">
                <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-150">
                    <Gem size={200} strokeWidth={1} />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <BookOpen size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Operational Guide</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                        Understanding <span className="text-indigo-400">Grafty Credits</span>
                    </h1>
                    <p className="mt-6 text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
                        Learn how our hybrid messaging engine balances power, transparency, and cost-efficiency for your business.
                    </p>
                </div>
            </div>

            {/* Core Concepts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="soft-card p-10 bg-white border-slate-100 hover:border-emerald-200 group transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm">
                        <Target size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Managed Mode</h3>
                    <p className="text-slate-500 font-medium leading-relaxed mb-6">Zero hassle setup. We handle all Meta compliance and billing directly.</p>
                    <div className="space-y-3">
                        <Benefit text="1-Click Embedded Signup" />
                        <Benefit text="Unified Invoice Billing" />
                        <Benefit text="No Meta API Setup Required" />
                    </div>
                </div>

                <div className="soft-card p-10 bg-white border-slate-100 hover:border-blue-200 group transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm">
                        <Zap size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Direct Mode</h3>
                    <p className="text-slate-500 font-medium leading-relaxed mb-6">Pay Meta direct rates. Ideal for high-volume Tier 2 enterprises.</p>
                    <div className="space-y-3">
                        <Benefit text="Pay Meta Price Directly" color="text-blue-600" />
                        <Benefit text="₹0.05 Platform Fee Only" color="text-blue-600" />
                        <Benefit text="15-20% Total Cost Savings" color="text-blue-600" />
                    </div>
                </div>
            </div>

            {/* The "Why" Section */}
            <div className="p-12 md:p-16 rounded-[48px] bg-slate-50 border border-slate-100">
                <div className="max-w-2xl">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-8">Why are credits required in Direct Mode?</h2>
                    <p className="text-slate-500 font-medium leading-relaxed mb-10 text-lg">
                        Even if you pay Meta directly for conversation tokens, we provide the <span className="text-slate-900 font-bold underline decoration-indigo-400">Intelligence Layer</span> that makes your WhatsApp thrive.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-12">
                        <DetailItem
                            icon={<Zap size={18} />}
                            title="Engine Orchestration"
                            desc="Managing complex flow logic, interactive buttons, and high-speed delivery."
                        />
                        <DetailItem
                            icon={<ShieldCheck size={18} />}
                            title="Real-time Guardrails"
                            desc="Ensuring campaign quality and avoiding accidental messaging bans."
                        />
                        <DetailItem
                            icon={<MessageSquare size={18} />}
                            title="CRM Integration"
                            desc="Automatically capturing lead data and syncing across your business hubs."
                        />
                        <DetailItem
                            icon={<Coins size={18} />}
                            title="Scalability"
                            desc="Dedicated throughput (TPS) for your large scale broadcast campaigns."
                        />
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="text-center py-10">
                <Link
                    href="/dashboard/credits/recharge"
                    className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl hover:scale-105 active:scale-95"
                >
                    Ready? Recharge Now <PlusIcon size={16} />
                </Link>
            </div>
        </div>
    );
}

function Benefit({ text, color = "text-emerald-600" }: { text: string, color?: string }) {
    return (
        <div className="flex items-center gap-3">
            <CheckCircle2 size={16} className={color} />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{text}</span>
        </div>
    );
}

function DetailItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-900 border border-slate-100">
                {icon}
            </div>
            <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider">{title}</h4>
            <p className="text-xs text-slate-400 font-bold leading-relaxed">{desc}</p>
        </div>
    );
}

function PlusIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
