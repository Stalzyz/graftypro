
"use client";

import { useState } from "react";
import {
    Mail,
    Plus,
    Search,
    ChevronRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Edit3,
    BarChart,
    Settings,
    FileCode,
    Zap
} from "lucide-react";

export default function EmailAutomationHub() {
    const templates = [
        { id: 1, name: "Vendor Onboarding Success", trigger: "Registration Complete", status: "ACTIVE", open: "84%", sent: "1,240" },
        { id: 2, name: "Subscription Renewal Reminder", trigger: "3 Days Before Expiry", status: "ACTIVE", open: "92%", sent: "450" },
        { id: 3, name: "Waitlist Confirmation", trigger: "Waitlist Join", status: "DRAFT", open: "-", sent: "-" },
        { id: 4, name: "Partner commission Payout", trigger: "Manual Approval", status: "ACTIVE", open: "98%", sent: "88" },
    ];

    return (
        <div className="max-w-7xl space-y-12 pb-20 font-sans">
            <header className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <Mail className="text-white" size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Signal Flow</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Automated communication protocols, lifecycle emails, and notification logic.</p>
                </div>

                <div className="flex gap-4">
                    <button className="px-6 py-4 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                        <BarChart size={14} />
                        Analytics
                    </button>
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95">
                        <Plus size={14} />
                        New Automation
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-[40px] border border-slate-100 p-8 space-y-6 shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                        <Zap size={64} className="text-blue-500" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Triggers</h3>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">14</p>
                        <div className="flex items-center gap-2 text-[#27954D] font-bold text-[10px] uppercase tracking-widest">
                            <CheckCircle2 size={12} /> Sync Healthy
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] border border-slate-100 p-8 space-y-6 shadow-sm">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Monthly Volume</h3>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">84.2K</p>
                        <div className="flex items-center gap-2 text-blue-500 font-bold text-[10px] uppercase tracking-widest">
                            <BarChart size={12} /> Delivery Rate 99.8%
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] border border-slate-100 p-8 space-y-6 shadow-sm">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Infrastructure</h3>
                        <div className="pt-2 flex items-center gap-4">
                            <ProviderBadge label="Postmark" active />
                            <ProviderBadge label="SendGrid" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Blueprint Registry
                        <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase">{templates.length} Active</span>
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input
                            type="text"
                            placeholder="Search Templates..."
                            className="bg-slate-50 border-none rounded-2xl pl-10 pr-6 py-3 text-xs font-bold w-64 focus:ring-2 focus:ring-slate-100 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Name</th>
                                <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trigger Point</th>
                                <th className="text-center px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Health</th>
                                <th className="text-center px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</th>
                                <th className="text-right px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {templates.map((tpl) => (
                                <tr key={tpl.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-black text-slate-900 tracking-tight">{tpl.name}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                                                <FileCode size={10} /> tpl_auth_{tpl.id}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                            <span className="text-xs font-bold text-slate-700">{tpl.trigger}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${tpl.status === 'ACTIVE' ? 'bg-[#27954D]/10 text-[#27954D]' : 'bg-slate-100 text-slate-400'}`}>
                                            {tpl.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-xs font-black text-slate-900">{tpl.open} Opens</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tpl.sent} Sent</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button className="px-6 py-2.5 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                                            Engineer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function ProviderBadge({ label, active = false }: any) {
    return (
        <div className={`p-4 rounded-3xl border flex items-center justify-between gap-6 transition-all ${active ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white border-slate-100 text-slate-400 grayscale opacity-50'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            <Settings size={14} />
        </div>
    );
}
