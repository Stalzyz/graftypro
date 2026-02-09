
"use client";

import { useState } from "react";
import {
    Zap,
    Coins,
    TrendingUp,
    ShieldCheck,
    Globe,
    Info,
    History,
    ArrowRight,
    Search,
    IndianRupee,
    AlertCircle
} from "lucide-react";

export default function CreditModule() {
    return (
        <div className="max-w-7xl space-y-12 pb-20 font-sans">
            <header className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <Coins className="text-white" size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Credit Nexus</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Manage conversation credits, billing bridges, and global message quotas.</p>
                </div>

                <div className="flex gap-4">
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95">
                        <Zap size={14} className="fill-white" />
                        Provision Bulk Credits
                    </button>
                </div>
            </header>

            {/* Meta Connection Explanation */}
            <div className="bg-blue-600 rounded-[40px] p-10 text-white flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden shadow-2xl shadow-blue-200">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Globe size={200} />
                </div>
                <div className="relative z-10 lg:w-2/3 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                        <Info size={14} /> Meta Cloud API Integration Guide
                    </div>
                    <h2 className="text-4xl font-black leading-tight">Syncing Meta Conversations with Internal Credits</h2>
                    <p className="text-blue-100 font-medium text-lg">
                        Meta charges per 24-hour conversation window. Our internal system bridges this by allowing you to resell these windows as "Credits" or charge per-message over the Meta base cost.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                            <h4 className="font-black text-sm mb-2 uppercase tracking-wider">How it works</h4>
                            <p className="text-xs text-blue-100/80 leading-relaxed">Users purchase credits from your billing portal. Each WhatsApp message (or conversation window) deducts credits from their wallet based on your custom multipliers.</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                            <h4 className="font-black text-sm mb-2 uppercase tracking-wider">Meta Direct Billing</h4>
                            <p className="text-xs text-blue-100/80 leading-relaxed">You can also allow users to attach their own credit card to Meta, while you only charge for platform "Access Fees" via subscriptions.</p>
                        </div>
                    </div>
                </div>
                <div className="lg:w-1/3 w-full bg-white rounded-3xl p-8 text-slate-900 shadow-3xl">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                        <TrendingUp className="text-blue-600" /> Yield Control
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-black uppercase text-slate-400">Buying Cost (Meta)</span>
                            <span className="text-sm font-black text-slate-900">₹0.30 / msg</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <span className="text-[10px] font-black uppercase text-blue-600">Resell Rate</span>
                            <span className="text-sm font-black text-blue-700">₹0.75 / msg</span>
                        </div>
                        <div className="pt-4">
                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-2">
                                <span>Platform Profit Margin</span>
                                <span className="text-green-600">150% Profit</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="w-2/3 h-full bg-blue-600 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <CreditStatCard label="Circulating Credits" value="1.2M" icon={<Coins />} color="blue" />
                <CreditStatCard label="Credit Revenue" value="₹12.4 L" icon={<IndianRupee />} color="green" />
                <CreditStatCard label="Low Balance Alerts" value="14" icon={<AlertCircle />} color="orange" />
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden border-t-4 border-t-slate-900">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Global Wallet Registry</h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input
                            type="text"
                            placeholder="Find Organizations or Wallet IDs..."
                            className="bg-white border-none rounded-2xl pl-10 pr-6 py-3 text-xs font-bold w-72 focus:ring-2 focus:ring-slate-100 shadow-sm transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Identity</th>
                                <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Wallet Status</th>
                                <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Credits</th>
                                <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Consumption (24h)</th>
                                <th className="text-right px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <CreditRow name="Tesla Motors" credits="45,000" usage="1,200" status="HEALTHY" />
                            <CreditRow name="SpaceX" credits="2,100" usage="850" status="CRITICAL" />
                            <CreditRow name="Starlink" credits="1,20,000" usage="0" status="INACTIVE" />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function CreditStatCard({ label, value, icon, color }: any) {
    const colorClasses: any = {
        blue: "text-blue-600 bg-blue-50",
        green: "text-[#27954D] bg-[#27954D]/10",
        orange: "text-orange-600 bg-orange-50",
    };

    return (
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-6 group hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${colorClasses[color]}`}>
                    Platform Wide
                </div>
            </div>
            <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{label}</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
            </div>
        </div>
    );
}

function CreditRow({ name, credits, usage, status }: any) {
    return (
        <tr className="hover:bg-slate-50/30 transition-colors group">
            <td className="px-10 py-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black">
                        {name[0]}
                    </div>
                    <div>
                        <div className="text-sm font-black text-slate-900">{name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Org</div>
                    </div>
                </div>
            </td>
            <td className="px-10 py-8">
                <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${status === 'HEALTHY' ? 'bg-[#27954D]/10 text-[#27954D]' :
                        status === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500' :
                            'bg-slate-100 text-slate-400'
                    }`}>
                    {status}
                </span>
            </td>
            <td className="px-10 py-8 text-xs font-black text-slate-900 italic">{credits} Units</td>
            <td className="px-10 py-8">
                <div className="flex items-center gap-2">
                    <TrendingUp size={12} className="text-blue-500" />
                    <span className="text-xs font-bold text-slate-700">{usage} Units</span>
                </div>
            </td>
            <td className="px-10 py-8 text-right">
                <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                    <History size={14} />
                </button>
            </td>
        </tr>
    );
}
