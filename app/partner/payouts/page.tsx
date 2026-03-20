"use client";
import React, { useEffect, useState } from 'react';
import {
    Wallet, Plus, CreditCard, Banknote, History,
    ExternalLink, ShieldCheck, TrendingUp, Activity,
    ChevronRight, X, AlertCircle, Loader2, ArrowUpRight,
    Zap, DollarSign, Clock, CheckCircle2
} from 'lucide-react';
import { safeToLocaleString, formatCurrency, ensureNumber } from '@/lib/utils/number-format';


export default function PayoutsPage() {
    const [stats, setStats] = useState<any>(null);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [bankDetails, setBankDetails] = useState({ 
        bank_account_holder: "", 
        bank_account_number: "", 
        bank_ifsc: "", 
        bank_name: "" 
    });
    const [bankSaving, setBankSaving] = useState(false);
    const [request, setRequest] = useState({ amount: "", paymentMethod: "BANK_TRANSFER", paymentDetails: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/reseller/profile");
            const data = await res.json();
            setProfile(data);
            setBankDetails({
                bank_account_holder: data.bank_account_holder || "",
                bank_account_number: data.bank_account_number || "",
                bank_ifsc: data.bank_ifsc || "",
                bank_name: data.bank_name || ""
            });
            setLoadingProfile(false);
        } catch (e) {
            console.error(e);
            setLoadingProfile(false);
        }
    };

    const handleBankSubmit = async (e: any) => {
        e.preventDefault();
        setBankSaving(true);
        try {
            const res = await fetch("/api/reseller/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bankDetails)
            });
            if (res.ok) {
                setIsBankModalOpen(false);
                fetchProfile();
            } else {
                alert("Failed to update bank details");
            }
        } finally {
            setBankSaving(false);
        }
    };

    const fetchData = async () => {
        try {
            const [sRes, pRes] = await Promise.all([
                fetch("/api/reseller/stats"),
                fetch("/api/reseller/payouts")
            ]);
            const sData = await sRes.json();
            const pData = await pRes.json();
            setStats(sData);
            if (pData.data) setPayouts(pData.data);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/reseller/payouts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request)
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchData();
            } else {
                const err = await res.json();
                alert(err.error || "Initiation Refused");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-24">

            {/* Simple Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-600 font-black text-[9px] uppercase tracking-[0.3em] mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                        Treasury & Payouts
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                        Payouts<span className="text-amber-600">.</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm tracking-tight italic">Manage your earnings, wallet balance, and withdrawal requests.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="group bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl active:scale-95 hover:bg-black"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                    Execute Withdrawal
                </button>
            </div>

            {/* Treasury Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm relative overflow-hidden group hover:border-emerald-100 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10 space-y-6">
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#27954D] border border-emerald-100 shadow-sm">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Available Yield</div>
                            <div className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase tabular-nums leading-none">
                                {formatCurrency(stats?.wallet.balance)}

                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-[#27954D] uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full w-fit border border-emerald-100">
                            <CheckCircle2 size={12} /> Ready for Settle
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm relative overflow-hidden group hover:border-blue-100 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10 space-y-6">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                            <Clock size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Pending Transit</div>
                            <div className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase tabular-nums leading-none">
                                {stats?.wallet.pending_payouts || 0} Req
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full w-fit border border-blue-100">
                            <Activity size={12} className="animate-pulse" /> In System Matrix
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm relative overflow-hidden group hover:border-slate-200 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10 space-y-6">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Lifetime Harvest</div>
                            <div className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase tabular-nums leading-none">
                                {formatCurrency(stats?.wallet.total_earned)}

                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full w-fit border border-slate-100">
                            <DollarSign size={12} /> Cumulative Gain
                        </div>
                    </div>
                </div>
            </div>

            {/* Bank details & Settlement Control */}
            <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full -mr-48 -mt-48 animate-pulse" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="flex items-center gap-2 text-blue-400 font-black text-[9px] uppercase tracking-[0.3em] mb-6 italic">
                            <ShieldCheck size={16} /> Settlement Protocol
                        </div>
                        <h2 className="text-4xl font-black italic tracking-tighter mb-6 leading-none uppercase">
                            Your Yield <br /> <span className="text-blue-400">Destination.</span>
                        </h2>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-md">
                            Ensure your liquidity endpoint is correctly configured. Automated payouts trigger high-speed IMPS/NEFT transfers.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 space-y-8">
                        {loadingProfile ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-400" /></div>
                        ) : (
                            <>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center pb-6 border-b border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                                                <CreditCard size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Settlement Account</p>
                                                <p className="text-sm font-black italic tracking-tight">{profile?.bank_account_number || "NOT CONFIGURED"}</p>
                                            </div>
                                        </div>
                                        {profile?.bank_account_number && <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2">
                                            <CheckCircle2 size={12} /> Verified
                                        </div>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Gate Code (IFSC)</p>
                                            <p className="text-sm font-black italic tracking-tight uppercase tabular-nums">{profile?.bank_ifsc || "---"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Protocol Name</p>
                                            <p className="text-sm font-black italic tracking-tight uppercase line-clamp-1">{profile?.bank_name || "---"}</p>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setIsBankModalOpen(true)}
                                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-95 translate-y-2"
                                >
                                    Update Payment Node <ChevronRight size={18} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Matrix Transaction History */}
            <div className="bg-white border border-slate-100 rounded-[3.5rem] shadow-sm overflow-hidden">
                <div className="bg-slate-50/50 px-10 py-8 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                            <History size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Settlement Matrix</h2>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Immutable transaction sequence</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em] border-b border-slate-50">
                            <tr>
                                <th className="px-10 py-6">Protocol ID</th>
                                <th className="px-10 py-6">Yield Amount</th>
                                <th className="px-10 py-6">Matrix Status</th>
                                <th className="px-10 py-6 text-right">Synchronization Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {payouts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-10 py-32 text-center">
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 border border-slate-100">
                                                <History size={32} />
                                            </div>
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Zero History Detected</h3>
                                        </div>
                                    </td>
                                </tr>
                            ) : payouts.map((p: any) => (
                                <tr key={p.id} className="group hover:bg-slate-50 transition-all">
                                    <td className="px-10 py-7">
                                        <span className="text-[10px] font-black text-slate-400 font-mono tracking-tighter uppercase group-hover:text-slate-900 transition-colors">#{p.id.slice(-8)}</span>
                                    </td>
                                    <td className="px-10 py-7">
                                        <span className="text-xl font-black text-slate-900 italic tracking-tighter tabular-nums leading-none">{formatCurrency(p.amount)}</span>

                                    </td>
                                    <td className="px-10 py-7">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest shadow-sm ${p.status === 'PAID' ? 'bg-emerald-50 text-[#27954D] border-emerald-100' :
                                            p.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                'bg-slate-50 text-slate-500 border-slate-100'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'PAID' ? 'bg-[#27954D]' :
                                                p.status === 'PENDING' ? 'bg-amber-400' :
                                                    'bg-slate-300'
                                                }`} />
                                            {p.status}
                                        </div>
                                    </td>
                                    <td className="px-10 py-7 text-right">
                                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1 italic">
                                            {new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                        <div className="text-[9px] text-slate-300 font-bold uppercase tracking-widest tabular-nums italic">
                                            {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Terminal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white border border-slate-200 w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative z-10">
                        <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase leading-none mb-1">Settle Artifact</h2>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic leading-none mt-1">Convert Commission to Liquidity</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-100 hover:border-rose-200 hover:text-rose-500 transition-all text-slate-400 shadow-sm active:scale-90">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Liquidity Quantity (₹)</label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#27954D] transition-colors"><DollarSign size={20} /></div>
                                    <input
                                        required
                                        type="number"
                                        max={stats?.wallet.balance}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] pl-16 pr-8 py-5 text-xl font-black italic text-slate-900 outline-none focus:border-[#27954D] focus:bg-white transition-all tabular-nums placeholder:text-slate-200 shadow-inner"
                                        placeholder="0.00"
                                        value={request.amount}
                                        onChange={(e) => setRequest({ ...request, amount: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-between px-2">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Available Pool</span>
                                    <span className="text-[10px] font-black text-slate-900 italic tracking-tighter">{formatCurrency(stats?.wallet.balance)}</span>

                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Payout Protocol</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { id: 'BANK_TRANSFER', label: 'Bank Transfer', desc: 'NEFT / RTGS / IMPS Secure Settle', icon: <Banknote size={16} /> },
                                        { id: 'UPI', label: 'UPI Instant', desc: 'Direct Node-to-Node Transfer', icon: <Zap size={16} /> },
                                        { id: 'RAZORPAY', label: 'Razorpay Auto', desc: 'Commercial Gateway Settlement', icon: <CreditCard size={16} /> }
                                    ].map(method => (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => setRequest({ ...request, paymentMethod: method.id })}
                                            className={`p-6 rounded-[2rem] border-2 transition-all text-left flex items-center gap-5 relative overflow-hidden group ${request.paymentMethod === method.id
                                                ? 'border-blue-900 bg-blue-50/50 shadow-lg shadow-blue-900/5'
                                                : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm transition-all ${request.paymentMethod === method.id ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-300 border-slate-100'
                                                }`}>
                                                {method.icon}
                                            </div>
                                            <div>
                                                <p className={`font-black text-sm italic uppercase tracking-tight leading-none ${request.paymentMethod === method.id ? 'text-slate-900' : 'text-slate-400'}`}>{method.label}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-60">{method.desc}</p>
                                            </div>
                                            {request.paymentMethod === method.id && <div className="absolute right-6 text-blue-900"><CheckCircle2 size={24} /></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                disabled={submitting || !request.amount || Number(request.amount) > stats?.wallet.balance}
                                type="submit"
                                className="w-full py-6 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.4em] rounded-[2rem] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl active:scale-[0.98] disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : <>Initiate Settle Artifact <ArrowUpRight size={20} /></>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Bank Modal */}
            {isBankModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="absolute inset-0" onClick={() => setIsBankModalOpen(false)}></div>
                    <div className="bg-white border border-slate-200 w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative z-10">
                        <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase leading-none mb-1">Payment Node</h2>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic leading-none mt-1">Configure Settlement Endpoint</p>
                            </div>
                            <button onClick={() => setIsBankModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-100 hover:border-rose-200 hover:text-rose-500 transition-all text-slate-400 shadow-sm">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleBankSubmit} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Holder Name</label>
                                <input 
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-blue-600 transition-all text-slate-900 appearance-none"
                                    value={bankDetails.bank_account_holder}
                                    onChange={e => setBankDetails({...bankDetails, bank_account_holder: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                                <input 
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-blue-600 transition-all text-slate-900"
                                    value={bankDetails.bank_account_number}
                                    placeholder={profile?.bank_account_number ? "********" : "Enter account number"}
                                    onChange={e => setBankDetails({...bankDetails, bank_account_number: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank IFSC</label>
                                    <input 
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-blue-600 transition-all uppercase text-slate-900"
                                        value={bankDetails.bank_ifsc}
                                        onChange={e => setBankDetails({...bankDetails, bank_ifsc: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                                    <input 
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-blue-600 transition-all text-slate-900"
                                        value={bankDetails.bank_name}
                                        onChange={e => setBankDetails({...bankDetails, bank_name: e.target.value})}
                                    />
                                </div>
                            </div>
                            <button 
                                disabled={bankSaving}
                                type="submit" 
                                className="w-full py-5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 mt-4 hover:bg-black transition-all"
                            >
                                {bankSaving ? <Loader2 className="animate-spin" /> : "Authorize Settlement Endpoint"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
