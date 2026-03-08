
"use client";
import React, { useEffect, useState } from 'react';
import {
    Users, Copy, Check, ExternalLink, ShieldCheck,
    ArrowUpRight, Target, Zap, Loader2, Search,
    Filter, AlertCircle, History, UserPlus, Building2
} from 'lucide-react';

export default function ReferralsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'vendors' | 'partners'>('vendors');
    const [copied, setCopied] = useState<'code' | 'link' | null>(null);

    useEffect(() => {
        fetchReferrals();
    }, []);

    const fetchReferrals = async () => {
        try {
            const res = await fetch("/api/reseller/referrals");
            const json = await res.json();
            setData(res.ok ? json : { _error: json.error || "Load Failed" });
        } catch {
            setData({ _error: "Network Error" });
        } finally {
            setLoading(false);
        }
    };

    const copyText = (text: string, type: 'code' | 'link') => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
    );

    if (data?._error) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 border border-rose-100 shadow-sm">
                <AlertCircle size={32} />
            </div>
            <div className="text-center">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-2">Protocol Error</h3>
                <p className="text-slate-500 font-bold text-sm tracking-tight">{data._error}</p>
            </div>
            <button
                onClick={() => { setLoading(true); fetchReferrals(); }}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
            >
                Retry Connection
            </button>
        </div>
    );

    const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${data.referral_code}` : '';

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#27954D] font-black text-[9px] uppercase tracking-[0.3em] mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        Network Pipeline
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                        Referrals<span className="text-[#27954D]">.</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm tracking-tight italic">Scale your network and track your referred entities.</p>
                </div>
            </div>

            {/* Invite Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
                    <div className="relative z-10 space-y-8">
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tight">Expand Your Grid</h3>
                            <p className="text-slate-400 text-xs font-bold leading-relaxed mt-2 uppercase tracking-wide">Share your referral credentials to onboard new nodes and earn yielding commissions.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol Code</span>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-black text-emerald-400 tracking-tighter italic uppercase">{data.referral_code}</span>
                                    <button
                                        onClick={() => copyText(data.referral_code, 'code')}
                                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
                                    >
                                        {copied === 'code' ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Activation Link</span>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400 truncate max-w-[120px]">{inviteLink}</span>
                                    <button
                                        onClick={() => copyText(inviteLink, 'link')}
                                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
                                    >
                                        {copied === 'link' ? <Check size={16} /> : <ExternalLink size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <StatCard
                        label="Total Vendors"
                        value={data.stats.total_vendors}
                        icon={<Building2 size={24} />}
                        color="emerald"
                    />
                    <StatCard
                        label="Total Partners"
                        value={data.stats.total_partners}
                        icon={<UserPlus size={24} />}
                        color="blue"
                    />
                    <StatCard
                        label="Total Yield"
                        value={`₹${data.stats.total_earned.toLocaleString()}`}
                        icon={<Zap size={24} />}
                        color="amber"
                        className="col-span-2"
                    />
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-10 py-8 border-b border-slate-100 bg-slate-50/50 gap-6">
                    <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl w-fit">
                        <button
                            onClick={() => setActiveTab('vendors')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'vendors' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                        >
                            Referred Vendors
                        </button>
                        <button
                            onClick={() => setActiveTab('partners')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'partners' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                        >
                            Sub-Partners
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input
                                type="text"
                                placeholder={`Filter ${activeTab}...`}
                                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 transition-all w-full sm:w-64"
                            />
                        </div>
                    </div>
                </div>

                <div className="min-h-[400px]">
                    {activeTab === 'vendors' ? (
                        <VendorList vendors={data.vendors} />
                    ) : (
                        <PartnerList partners={data.partners} />
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color, className = "" }: any) {
    const colorMap: any = {
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        amber: 'text-amber-600 bg-amber-50 border-amber-100'
    };
    return (
        <div className={`bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm group hover:border-slate-300 transition-all ${className}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform ${colorMap[color]}`}>
                {icon}
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tighter italic tabular-nums leading-none">{value}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{label}</div>
        </div>
    );
}

function VendorList({ vendors }: { vendors: any[] }) {
    if (vendors.length === 0) return <EmptyState label="No Referred Vendors Found" sub="Entities you onboard via your link will appear here." icon={<Building2 size={40} />} />;

    return (
        <div className="divide-y divide-slate-50">
            {vendors.map((item) => (
                <div key={item.id} className="px-10 py-6 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm group-hover:text-emerald-600 transition-colors">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 tracking-tight uppercase italic group-hover:text-emerald-600 transition-colors">{item.workspace?.name || 'Unknown Workspace'}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.workspace?.plan || 'FREE'} PLAN</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic">{new Date(item.mapped_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${item.workspace?.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                            }`}>
                            {item.workspace?.status || 'INACTIVE'}
                        </span>
                        <ChevronRight size={16} className="text-slate-200 group-hover:translate-x-1 group-hover:text-emerald-400 transition-all" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function PartnerList({ partners }: { partners: any[] }) {
    if (partners.length === 0) return <EmptyState label="No Referred Partners Found" sub="Partners you invite to join the network will appear here." icon={<UserPlus size={40} />} />;

    return (
        <div className="divide-y divide-slate-50">
            {partners.map((partner) => (
                <div key={partner.id} className="px-10 py-6 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm group-hover:text-blue-600 transition-colors">
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 tracking-tight uppercase italic group-hover:text-blue-600 transition-colors">{partner.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{partner.role}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic">Joined {new Date(partner.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-black text-slate-900 tabular-nums italic leading-none">₹{Number(partner.wallet_balance).toLocaleString()}</p>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Active Balance</span>
                        </div>
                        <ChevronRight size={16} className="text-slate-200 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ label, sub, icon }: any) {
    return (
        <div className="py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200 border border-slate-100 shadow-inner">
                {icon}
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{label}</h3>
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1 italic">{sub}</p>
        </div>
    );
}

function ChevronRight({ size, className }: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size} height={size}
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            className={className}
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}
