
"use client";

import { useState } from "react";
import {
    FileText,
    Plus,
    Search,
    MoreVertical,
    Download,
    Send,
    Clock,
    CheckCircle2,
    ArrowUpRight,
    Building2,
    Users,
    Mail,
    IndianRupee,
    Printer,
    PenTool
} from "lucide-react";

export default function ProposalsModule() {
    const [proposals, setProposals] = useState([
        { id: "PROP-2026-001", client: "Zomato Corp", status: "SENT", amount: "₹1,20,000", date: "2 mins ago" },
        { id: "PROP-2026-002", client: "Airtel India", status: "ACCEPTED", amount: "₹4,50,000", date: "1 hour ago" },
        { id: "PROP-2026-003", client: "Reliance Ind", status: "DRAFT", amount: "₹8,00,000", date: "5 hours ago" },
    ]);

    return (
        <div className="max-w-7xl space-y-12 pb-20 font-sans">
            <header className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <PenTool className="text-white" size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Proposal Forge</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Design, track, and dispatch professional business proposals.</p>
                </div>

                <div className="flex gap-4">
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95">
                        <Plus size={14} />
                        Forge New Proposal
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ProposalStatCard label="Live Proposals" value="42" icon={<Send />} color="blue" />
                <ProposalStatCard label="Conversion Rate" value="68%" icon={<CheckCircle2 />} color="green" />
                <ProposalStatCard label="Pipeline Value" value="₹84.2 L" icon={<IndianRupee />} color="emerald" />
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden border-t-4 border-t-slate-900">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Negotiation Desk</h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input
                            type="text"
                            placeholder="Find Proposals or Clients..."
                            className="bg-white border-none rounded-2xl pl-10 pr-6 py-3 text-xs font-bold w-72 focus:ring-2 focus:ring-slate-100 shadow-sm transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol ID</th>
                                <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Counterparty</th>
                                <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Proposed Value</th>
                                <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifecycle</th>
                                <th className="text-right px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Command</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {proposals.map((prop) => (
                                <tr key={prop.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-slate-200 group-hover:bg-slate-900 transition-colors rounded-full" />
                                            <span className="text-xs font-black text-slate-900 font-mono italic">{prop.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="text-slate-300" size={14} />
                                            <span className="text-xs font-bold text-slate-700">{prop.client}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-xs font-black text-slate-900">{prop.amount}</td>
                                    <td className="px-10 py-8">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${prop.status === 'ACCEPTED' ? 'bg-[#27954D]/10 text-[#27954D]' :
                                                prop.status === 'SENT' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-slate-200/50 text-slate-500'
                                            }`}>
                                            {prop.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-right flex justify-end gap-2">
                                        <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                            <Download size={14} />
                                        </button>
                                        <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                            <Printer size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-slate-50/50 flex items-center justify-between border-t border-slate-50">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Proposal Template v4.2 in effect</span>
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                        Customize Design Header/Footer <ArrowUpRight size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function ProposalStatCard({ label, value, icon, color }: any) {
    const colorClasses: any = {
        blue: "text-blue-600 bg-blue-50",
        green: "text-[#27954D] bg-[#27954D]/10",
        emerald: "text-emerald-600 bg-emerald-50",
    };

    return (
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-6 group hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${colorClasses[color]}`}>
                    Active
                </div>
            </div>
            <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{label}</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
            </div>
        </div>
    );
}
