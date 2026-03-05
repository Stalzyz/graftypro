"use client";
import React, { useEffect, useState } from 'react';
import {
    TrendingUp, Users, Wallet, ArrowUpRight, History,
    AlertCircle, Zap, Target, ShieldCheck, ChevronRight,
    Copy, Check, ExternalLink, X, Upload, Loader2, Star,
    DollarSign, Activity, Clock, Plus, ArrowRight,
    RefreshCcw, Search, Filter, ArrowUp, ArrowDown,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function PartnerDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState<'code' | 'link' | null>(null);
    const [isKycModalOpen, setIsKycModalOpen] = useState(false);

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/reseller/stats");
            const json = await res.json();
            setData(res.ok ? json : { _error: json.error || "Load Failed" });
        } catch { setData({ _error: "Network Error" }); }
        finally { setLoading(false); }
    };

    const handleKycSubmit = async (kycData: any) => {
        const res = await fetch("/api/reseller/kyc/submit", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(kycData)
        });
        if (res.ok) { setIsKycModalOpen(false); fetchStats(); }
        else { const e = await res.json(); alert(e.error || "Submission failed"); }
    };

    const copyText = (text: string, type: 'code' | 'link') => {
        navigator.clipboard?.writeText(text).then(() => {
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        }).catch(() => {
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
    );

    if (data?._error) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 border border-rose-100 shadow-sm">
                <AlertCircle size={32} />
            </div>
            <div className="text-center">
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-2">Protocol Error</h3>
                <p className="text-slate-500 font-bold text-sm tracking-tight">{data._error}</p>
            </div>
            <button
                onClick={() => { setLoading(true); fetchStats(); }}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
            >
                Re-Initialize Console
            </button>
        </div>
    );

    if (!data) return null;

    const kycPending = data.profile.kyc_status !== 'VERIFIED';
    const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${data.profile.referral_code}` : '';

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">

            {/* Simple Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#27954D] font-black text-[9px] uppercase tracking-[0.3em] mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        Network Live
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                        Dashboard<span className="text-[#27954D]">.</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm tracking-tight italic">Overview of your partner network and performance metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex flex-col items-end mr-2">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Status</span>
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter italic">Operational</span>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${data.profile.role === 'PLATFORM'
                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm'
                        }`}>
                        {data.profile.role || 'Partner'}
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-black uppercase tracking-widest shadow-inner">
                        Tier {data.profile.tier || "01"}
                    </div>
                </div>
            </div>

            {/* Critical Lifecycle Alert */}
            {kycPending && (
                <div className={`rounded-[2rem] border-2 p-8 flex flex-col lg:flex-row items-center justify-between gap-8 animate-in slide-in-from-top-4 duration-500 overflow-hidden relative group ${data.profile.kyc_status === 'SUBMITTED'
                    ? 'bg-amber-50/50 border-amber-100'
                    : 'bg-blue-50/50 border-blue-100'
                    }`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className={`w-14 h-14 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-lg ${data.profile.kyc_status === 'SUBMITTED' ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-blue-600 text-white shadow-blue-500/20'
                            }`}>
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight italic uppercase">
                                {data.profile.kyc_status === 'SUBMITTED' ? 'Verification Pending Review' : 'Identity Genesis Required'}
                            </h3>
                            <p className="text-sm text-slate-500 font-bold tracking-tight mt-1 max-w-md">
                                {data.profile.kyc_status === 'SUBMITTED'
                                    ? 'Our compliance team is auditing your credentials. Access to payouts will be enabled shortly.'
                                    : 'Establish your platform identity to unlock liquidity pools and premium commission tiers.'}
                            </p>
                        </div>
                    </div>
                    {data.profile.kyc_status === 'NONE' && (
                        <button
                            onClick={() => setIsKycModalOpen(true)}
                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all transform active:scale-95 shadow-xl relative z-10"
                        >
                            Begin Verification
                        </button>
                    )}
                </div>
            )}

            {/* Metric Clusters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    label="Active Liquidity"
                    value={`₹${data.wallet.balance.toLocaleString()}`}
                    sub={`${data.wallet.pending_payouts} pending settle`}
                    icon={<Wallet size={24} />}
                    color="emerald"
                />
                <MetricCard
                    label="Monthly Velocity"
                    value={`₹${data.wallet.this_month.toLocaleString()}`}
                    icon={<TrendingUp size={24} />}
                    color="blue"
                    trend="+14.2%"
                />
                <MetricCard
                    label="Network Growth"
                    value={data.gamification.current_vendors}
                    sub="Active Workspaces"
                    icon={<Users size={24} />}
                    color="purple"
                    trend="+4"
                />
                <MetricCard
                    label="Daily Yield"
                    value={`₹${data.wallet.today.toLocaleString()}`}
                    icon={<Zap size={24} />}
                    color="amber"
                />
            </div>

            {/* Intelligence Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Growth Link */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm group hover:border-[#27954D]/20 transition-all">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em] mb-6">Referral Pipeline</div>
                    <div className="space-y-6">
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner group-hover:bg-white transition-colors">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Unique Access Code</div>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-black text-[#27954D] tracking-tighter italic uppercase">{data.profile.referral_code}</span>
                                <button
                                    onClick={() => copyText(data.profile.referral_code, 'code')}
                                    className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-[#27954D] text-slate-400 hover:text-[#27954D] transition-all shadow-sm active:scale-90"
                                >
                                    {copied === 'code' ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => copyText(referralLink, 'link')}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all"
                        >
                            {copied === 'link' ? <CheckCircle2 size={16} /> : <ExternalLink size={16} />}
                            Copy Network Invite
                        </button>
                    </div>
                </div>

                {/* Performance Tier */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">Ecosystem Level</div>
                        <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100 shadow-sm">
                            <Star size={20} fill="currentColor" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1 italic uppercase">
                                {data.gamification.next_tier?.name || 'Grandmaster'}
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Next Achievement Unlock</p>
                        </div>

                        {data.gamification.next_tier ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                        <span>Capacity {data.gamification.current_vendors}</span>
                                        <span>Target {data.gamification.next_tier.requirement}</span>
                                    </div>
                                    <div className="h-4 bg-slate-100/80 rounded-full border border-slate-200 p-1 shadow-inner">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#27954D] to-[#042F94] rounded-full transition-all duration-1000 shadow-sm"
                                            style={{ width: `${Math.min(100, (data.gamification.current_vendors / data.gamification.next_tier.requirement) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                    <p className="text-[10px] text-[#27954D] font-bold leading-relaxed">
                                        Deploy <span className="font-black underline">{data.gamification.next_tier.remaining} more nodes</span> to trigger the <span className="font-black">{data.gamification.next_tier.bonus}% yield multiplier</span>.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 bg-slate-900 rounded-[2rem] text-center">
                                <div className="text-white font-black text-xs uppercase tracking-[0.2em] mb-1">Apex Partner</div>
                                <div className="text-slate-400 text-[9px] font-bold uppercase tracking-widest italic">Maximum Commission Active</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Operations Terminal */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm overflow-hidden relative group">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em] mb-6">Yield Summary</div>
                    <div className="space-y-3 relative z-10">
                        {[
                            { label: "Pipeline Value", value: `₹${(data.alerts.leads_count * 2500).toLocaleString()}`, icon: <Target size={14} />, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
                            { label: "Lifetime Revenue", value: `₹${data.wallet.total_earned.toLocaleString()}`, icon: <DollarSign size={14} />, color: "text-[#27954D]", bg: "bg-emerald-50", border: "border-emerald-100" },
                            { label: "Settlement Pool", value: `₹${data.wallet.balance.toLocaleString()}`, icon: <History size={14} />, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100" },
                        ].map((row, i) => (
                            <div key={i} className={`flex items-center justify-between p-5 rounded-2xl border ${row.bg} ${row.border} hover:scale-[1.02] transition-transform duration-300`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl bg-white border ${row.border} ${row.color}`}>
                                        {row.icon}
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{row.label}</span>
                                </div>
                                <span className={`text-sm font-black italic tracking-tighter ${row.color}`}>{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Transaction Log */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-10 py-8 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Activity Oracle</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Live settlement stream</p>
                        </div>
                    </div>
                    <Link href="/partner/ledger" className="group px-6 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-900 uppercase tracking-widest hover:border-[#27954D] transition-all flex items-center gap-2 shadow-sm">
                        View Matrix <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {data.recent_activity.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 border border-slate-100 shadow-inner">
                            <Clock size={40} />
                        </div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No Events Found</h3>
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1">Activity will broadcast here in real-time</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {data.recent_activity.map((item: any) => (
                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-10 py-6 hover:bg-slate-50/50 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className={`w-2 h-2 rounded-full hidden sm:block ${item.type === 'COMMISSION' ? 'bg-[#27954D] shadow-[0_0_8px_rgba(39,149,77,0.4)]' : 'bg-blue-600 shadow-[0_0_8px_rgba(4,47,148,0.4)]'}`} />
                                    <div>
                                        <p className="text-sm font-black text-slate-900 tracking-tight group-hover:text-[#27954D] transition-colors uppercase italic">{item.description}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic leading-none">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-4 sm:mt-0 ml-8 sm:ml-0">
                                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border shadow-sm ${item.type === 'COMMISSION' ? 'bg-emerald-50 text-[#27954D] border-emerald-100' :
                                        item.type === 'PAYOUT' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            'bg-slate-50 text-slate-500 border-slate-100'
                                        }`}>
                                        {item.type}
                                    </span>
                                    <span className={`text-xl font-black italic tracking-tighter tabular-nums ${Number(item.amount) >= 0 ? 'text-[#27954D]' : 'text-rose-500'}`}>
                                        {Number(item.amount) >= 0 ? '+' : '-'}₹{Math.abs(Number(item.amount)).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* KYC Submission Modal Persistence */}
            {isKycModalOpen && (
                <KycSubmissionModal
                    onClose={() => setIsKycModalOpen(false)}
                    onSubmit={handleKycSubmit}
                />
            )}
        </div>
    );
}

function MetricCard({ label, value, sub, icon, color, trend }: any) {
    const colorMap: any = {
        emerald: 'text-[#27954D] bg-emerald-50 border-emerald-100 shadow-emerald-500/5',
        blue: 'text-blue-600 bg-blue-50 border-blue-100 shadow-blue-500/5',
        purple: 'text-purple-600 bg-purple-50 border-purple-100 shadow-purple-500/5',
        amber: 'text-amber-600 bg-amber-50 border-amber-100 shadow-amber-500/5',
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm ${colorMap[color]} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    {React.cloneElement(icon, { size: 28 })}
                </div>
                {trend && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-[#27954D] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm shadow-emerald-500/5">
                        <ArrowUpRight size={12} strokeWidth={3} /> {trend}
                    </div>
                )}
            </div>
            <div className="space-y-1 relative z-10">
                <div className="text-3xl font-black text-slate-900 tracking-tighter italic tabular-nums leading-none">{value}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</div>
                {sub && <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic mt-1 leading-none">{sub}</div>}
            </div>
        </div>
    );
}

function KycSubmissionModal({ onClose, onSubmit }: any) {
    const [step, setStep] = useState(1);
    const [kycType, setKycType] = useState('PERSONAL');
    const [formData, setFormData] = useState({ id_type: 'PASSPORT', id_number: '', business_reg_number: '', documents: [] as string[] });
    const [uploading, setUploading] = useState(false);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Identity Genesis</h2>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 italic">Protocol Step {step} of 02</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-100 hover:border-rose-200 hover:text-rose-500 transition-all text-slate-400 shadow-sm active:scale-90">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-10">
                    {step === 1 ? (
                        <div className="space-y-8">
                            <div className="text-center space-y-2">
                                <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Select Entity Class</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Choose your operational structure</p>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { type: 'PERSONAL', label: 'Individual', desc: 'PAN / AADHAAR', icon: <Users size={20} /> },
                                    { type: 'BUSINESS', label: 'Organization', desc: 'GSTIN / MSME', icon: <Activity size={20} /> }
                                ].map(({ type, label, desc, icon }) => (
                                    <button
                                        key={type}
                                        onClick={() => setKycType(type)}
                                        className={`p-8 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-4 relative overflow-hidden group ${kycType === type
                                            ? 'border-[#27954D] bg-emerald-50/50 shadow-lg shadow-emerald-500/5'
                                            : 'border-slate-100 hover:border-slate-300 bg-slate-50'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm transition-transform duration-500 group-hover:rotate-6 ${kycType === type ? 'bg-[#27954D] text-white border-[#27954D]' : 'bg-white text-slate-400 border-slate-200'
                                            }`}>
                                            {icon}
                                        </div>
                                        <div>
                                            <p className={`font-black text-lg italic uppercase tracking-tighter leading-none ${kycType === type ? 'text-slate-900' : 'text-slate-400'}`}>{label}</p>
                                            <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">{desc}</p>
                                        </div>
                                        {kycType === type && <div className="absolute top-4 right-4 text-[#27954D]"><ShieldCheck size={20} /></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="text-center space-y-2">
                                <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Node Documentation</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Upload {kycType === 'PERSONAL' ? 'Genesis Identification' : 'Certificate of Incorporation'}</p>
                            </div>

                            <div className="relative group">
                                <input
                                    type="file" accept="image/*,.pdf"
                                    disabled={uploading}
                                    onChange={async (e) => {
                                        if (!e.target.files?.length) return;
                                        setUploading(true);
                                        try {
                                            const fd = new FormData();
                                            fd.append("file", e.target.files[0]);
                                            fd.append("module", "documents");
                                            const res = await fetch("/api/media/upload", { method: "POST", body: fd });
                                            const d = await res.json();
                                            if (res.ok) setFormData({ ...formData, documents: [d.url] });
                                            else alert(d.error || "Upload failed");
                                        } catch { alert("Network error"); }
                                        finally { setUploading(false); }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                                />
                                <div className={`p-16 border-4 border-dashed rounded-[2.5rem] text-center transition-all duration-500 ${uploading ? 'border-[#27954D] bg-emerald-50 scale-[0.98]' :
                                    formData.documents.length > 0 ? 'border-[#27954D] bg-emerald-50' :
                                        'border-slate-100 bg-slate-50/50 hover:border-[#27954D] hover:bg-emerald-50/30'
                                    }`}>
                                    {uploading ? (
                                        <div className="space-y-4">
                                            <Loader2 className="mx-auto text-[#27954D] animate-spin" size={48} />
                                            <p className="text-[10px] font-black uppercase text-[#27954D] tracking-[0.3em] italic">Transmitting Data...</p>
                                        </div>
                                    ) : formData.documents.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-[#27954D] text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                                                <Check size={32} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase italic">Document Authenticated</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tap to re-upload</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto text-slate-300 border border-slate-100 shadow-sm transition-transform group-hover:scale-110 group-hover:-rotate-3">
                                                <Upload size={32} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-600 uppercase tracking-widest">Push Documents</p>
                                                <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">PDF / JPG / PNG Max 10MB</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 bg-slate-900 rounded-[2rem] flex items-center gap-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full" />
                                <ShieldCheck size={24} className="text-[#27954D] relative z-10" />
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] leading-relaxed relative z-10">
                                    Encrypted end-to-end. By pushing these files, you authorize Grafty to perform a secure compliance audit.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-10 py-8 border-t border-slate-100 flex gap-4 bg-slate-50/50">
                    {step === 2 && (
                        <button
                            onClick={() => setStep(1)}
                            className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                        >
                            Back To Start
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (step === 1) setStep(2);
                            else onSubmit({ kyc_type: kycType, id_type: formData.id_type, id_number: formData.id_number, business_reg_number: formData.business_reg_number, documents: formData.documents });
                        }}
                        className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all transform active:scale-95 shadow-xl shadow-slate-900/10"
                    >
                        {step === 1 ? 'Commit Entity Choice' : 'Initiate Protocol Audit'}
                    </button>
                </div>
            </div>
        </div>
    );
}
