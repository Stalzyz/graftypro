
"use client";
import { useState, useEffect } from "react";
import {
    ArrowLeft,
    Briefcase,
    DollarSign,
    ExternalLink,
    TrendingUp,
    ShieldCheck,
    Handshake,
    Calendar,
    Users,
    ArrowUpRight,
    CheckCircle2,
    Wallet,
    Info
} from "lucide-react";
import Link from "next/link";

export default function PartnerDetailPage({ params }: { params: { id: string } }) {
    const [partner, setPartner] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/super-admin/partners/${params.id}`)
            .then(res => res.json())
            .then(data => {
                setPartner(data.partner);
                setLoading(false);
            });
    }, [params.id]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-[#27954D] border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!partner) return <div className="p-8 text-red-500 font-bold uppercase tracking-widest text-xs">Node Entity Not Found</div>;

    const pendingEarnings = partner.total_earnings - partner.paid_earnings;

    return (
        <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-20">
            {/* Header Area */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="flex items-start gap-6">
                    <Link href="/super-admin/dashboard/partners" className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                        <ArrowLeft size={20} className="text-slate-400" />
                    </Link>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold text-slate-800 tracking-tight">{partner.name}</h1>
                            <div className="px-3 py-1 bg-[#27954D]/10 text-[#27954D] rounded-full text-[9px] font-black uppercase tracking-widest">
                                Global Reseller
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-black text-slate-300">{partner.email}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5"><Calendar size={14} /> Registered {new Date(partner.created_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="px-6 py-4 bg-white border border-slate-100 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Share Protocol</span>
                        <span className="text-sm font-black text-slate-900 tracking-tighter italic">{partner.commission_pct}%</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Financial Ledger */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[40px] p-10 text-white space-y-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full bg-blue-500/10 group-hover:scale-125 transition-transform duration-700" />

                        <div className="space-y-1 relative z-10">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Wallet size={16} className="text-[#27954D]" /> Revenue Settlement
                            </h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fiscal Performance Matrix</p>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <LedgerItem label="Gross Commission" value={`₹${partner.total_earnings}`} />
                            <LedgerItem label="Disbursed Capital" value={`₹${partner.paid_earnings}`} />
                            <div className="h-px bg-white/5" />
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-[9px] font-black text-[#27954D] uppercase tracking-[0.2em] block mb-1">Available for Payout</span>
                                    <h4 className="text-4xl font-black tracking-tighter">₹{pendingEarnings}</h4>
                                </div>
                                <ArrowUpRight className="text-slate-600" size={32} />
                            </div>
                        </div>

                        <button className="w-full py-5 bg-[#27954D] hover:bg-white hover:text-black text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#27954D]/20 active:scale-95 relative z-10">
                            Record Settlement
                        </button>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[40px] p-8 space-y-6 shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <Info className="text-blue-500" size={18} />
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Governance Settings</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-slate-400 text-[10px] font-black uppercase">Lifecycle Status</span>
                                <span className="text-[#27954D] flex items-center gap-1.5"><CheckCircle2 size={12} /> ACTIVE</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-slate-400 text-[10px] font-black uppercase">Partner Grade</span>
                                <span className="text-slate-700">TIER 1 (ELITE)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Portfolio */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PortfolioStat label="Portfolio Size" value={`${partner.referred_workspaces.length} Tenancies`} icon={<Users />} color="blue" />
                        <PortfolioStat label="Growth Velocity" value="+12.4%" icon={<TrendingUp />} color="emerald" />
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Ecosystem Tenancies</h3>
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Managed workspaces under this partner node</p>
                            </div>
                            <span className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Total: {partner.referred_workspaces.length}
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-sans">
                                <thead>
                                    <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="px-10 py-6">Workspace Identity</th>
                                        <th className="px-10 py-6">Tier Status</th>
                                        <th className="px-10 py-6">Deployment Date</th>
                                        <th className="px-10 py-6 text-right pr-12">Telemetry</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {partner.referred_workspaces.map((w: any) => (
                                        <tr key={w.id} className="hover:bg-slate-50/50 group transition-all">
                                            <td className="px-10 py-8">
                                                <div className="font-bold text-slate-700 text-sm group-hover:text-[#042f94] transition-colors">{w.name}</div>
                                                <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-0.5">ID: {w.id.slice(0, 8)}</div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${w.plan === 'ENTERPRISE' ? 'bg-indigo-50 border-indigo-100 text-indigo-500' : 'bg-slate-50 border-slate-100 text-slate-400'
                                                    }`}>
                                                    {w.plan}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 text-xs font-bold text-slate-400 font-mono">
                                                {new Date(w.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-10 py-8 text-right pr-12">
                                                <Link href={`/super-admin/dashboard/vendors/${w.id}`} className="p-3 bg-slate-50 rounded-xl text-slate-300 hover:bg-slate-900 hover:text-white transition-all inline-block shadow-sm">
                                                    <ExternalLink size={14} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {partner.referred_workspaces.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-10 py-24 text-center">
                                                <Handshake size={48} className="text-slate-100 mx-auto mb-4" />
                                                <p className="text-sm font-medium text-slate-300 italic">No tenancies documented in this partner node.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LedgerItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center group/item">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover/item:text-slate-300 transition-colors">{label}</span>
            <span className="text-sm font-black tracking-tight">{value}</span>
        </div>
    );
}

function PortfolioStat({ label, value, icon, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-[#27954D]/10 text-[#27954D]"
    };
    return (
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-4 hover:shadow-xl transition-all duration-500 group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]} group-hover:scale-110 transition-transform shadow-sm`}>
                {icon}
            </div>
            <div>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block">{label}</span>
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter italic uppercase">{value}</h3>
            </div>
        </div>
    );
}
