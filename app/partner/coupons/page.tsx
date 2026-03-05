"use client";
import React, { useEffect, useState } from 'react';
import {
    Ticket, Plus, Trash2, Calendar, Users,
    Activity, Lock, Unlock, Search, ChevronRight,
    AlertCircle, CheckCircle2, Loader2, Sparkles,
    Zap, ArrowUpRight, X, Info
} from 'lucide-react';

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        usageLimit: '100',
        validUntil: '',
        newUsersOnly: true
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch("/api/reseller/coupons");
            const json = await res.json();
            setCoupons(json.data || []);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/reseller/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCoupon)
            });
            const json = await res.json();
            if (json.success) {
                setShowModal(false);
                fetchCoupons();
                setNewCoupon({
                    code: '',
                    discountType: 'PERCENTAGE',
                    discountValue: '',
                    usageLimit: '100',
                    validUntil: '',
                    newUsersOnly: true
                });
            } else {
                alert(json.error);
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
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.25em] mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(39,149,77,0.4)]" />
                        Sales Coupons
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                        My Coupons<span className="text-emerald-600">.</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm tracking-tight italic">Create and manage coupon codes to incentivize new vendors.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="group bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl active:scale-95 hover:bg-black"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                    Mint New Code
                </button>
            </div>

            {/* Growth Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm relative overflow-hidden group hover:border-emerald-100 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10 space-y-6">
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#27954D] border border-emerald-100 shadow-sm">
                            <Ticket size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Active Protocols</div>
                            <div className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase tabular-nums">
                                {coupons.filter(c => c.is_active).length} <span className="text-slate-200">/</span> {coupons.length}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm relative overflow-hidden group hover:border-blue-100 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10 space-y-6">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                            <Zap size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Network Conversions</div>
                            <div className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase tabular-nums">
                                {coupons.reduce((acc, c) => acc + c.usage_count, 0)} RED.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm relative overflow-hidden group hover:border-indigo-100 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10 space-y-6">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                            <Activity size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Yield Efficiency</div>
                            <div className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase tabular-nums">
                                18.4%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coupons List Console */}
            <div className="bg-white border border-slate-100 rounded-[3.5rem] shadow-sm overflow-hidden animate-in fade-in duration-700">
                <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-6 flex-1">
                        <div className="relative w-full max-w-md group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="FILTER ACTIVE PROTOCOLS..."
                                className="w-full bg-white border border-slate-200 rounded-[2rem] py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest text-slate-900 focus:border-emerald-600 outline-none transition-all shadow-inner placeholder:text-slate-200"
                            />
                        </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-4">
                        <div className="px-4 py-2 rounded-xl bg-white border border-slate-100 flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                            <Lock size={12} /> Auto-Mapping Active
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em] border-b border-slate-50">
                            <tr>
                                <th className="px-10 py-6">Protocol Code</th>
                                <th className="px-10 py-6">Yield Delta</th>
                                <th className="px-10 py-6">Redemption Volume</th>
                                <th className="px-10 py-6">Persistence</th>
                                <th className="px-10 py-6 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {coupons.map((coupon: any) => (
                                <tr key={coupon.id} className="group hover:bg-slate-50 transition-all">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="text-2xl font-black tracking-tighter text-[#27954D] italic uppercase font-mono group-hover:scale-105 transition-transform">{coupon.code}</div>
                                            {coupon.new_users_only && (
                                                <span className="text-[8px] font-black uppercase px-2.5 py-1 bg-emerald-50 text-[#27954D] rounded-full border border-emerald-100 shadow-sm leading-none italic">GENESIS ONLY</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="text-sm font-black italic tracking-tighter text-slate-900 uppercase">
                                            {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}% INCENTIVE` : `₹${coupon.discount_value} FLAT YIELD`}
                                        </div>
                                        <div className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-1 italic leading-none">Matrix Allowance</div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4 mb-1">
                                            <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden border border-slate-50 shadow-inner">
                                                <div
                                                    className="h-full bg-[#27954D] transition-all duration-1000 shadow-[0_0_8px_rgba(39,149,77,0.3)]"
                                                    style={{ width: `${(coupon.usage_count / coupon.usage_limit) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-900 italic tracking-tighter tabular-nums">{coupon.usage_count} <span className="text-slate-200">/</span> {coupon.usage_limit}</span>
                                        </div>
                                        <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic leading-none">Utilization Flow</div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2 text-slate-900 font-black italic tracking-tighter">
                                            <Calendar size={14} className="text-slate-200" />
                                            <span className="text-xs uppercase">{coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'LIFETIME ANCHOR'}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest shadow-sm ${coupon.is_active ? 'bg-emerald-50 text-[#27954D] border-emerald-100 italic' : 'bg-rose-50 text-rose-500 border-rose-100 italic'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${coupon.is_active ? 'bg-[#27954D] animate-pulse' : 'bg-rose-400'}`} />
                                            {coupon.is_active ? 'OPERATIONAL' : 'OFFLINE'}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {coupons.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-10 py-32 text-center text-slate-300">
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 border border-slate-100">
                                                <Ticket size={32} />
                                            </div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] font-italic">No Growth Artifacts Detected</h3>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mint Modal Terminal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="absolute inset-0" onClick={() => setShowModal(false)}></div>
                    <div className="bg-white border border-slate-200 w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 z-10 relative">
                        <div className="p-12 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase leading-none mb-1">Mint Artifact</h2>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic leading-none mt-1">Growth Protocol Initialization</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center rounded-[1.5rem] bg-white border border-slate-100 hover:border-rose-200 hover:text-rose-500 transition-all text-slate-400 shadow-sm active:scale-90">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-12 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-1">Access Code</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="E.G. ALPHA_50"
                                        value={newCoupon.code}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] py-5 px-6 text-lg font-black italic uppercase tracking-tighter text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all placeholder:text-slate-200 shadow-inner"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-1">Delta Logic</label>
                                    <select
                                        value={newCoupon.discountType}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all shadow-inner appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.2em] bg-[right_1.5rem_center] bg-no-repeat"
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FLAT">Flat (₹) Yield</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-1">Yield Value</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="0.00"
                                        value={newCoupon.discountValue}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] py-5 px-6 text-sm font-black italic tabular-nums text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all shadow-inner"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-1">Flow Capacity</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="Redemptions"
                                        value={newCoupon.usageLimit}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] py-5 px-6 text-sm font-black italic tabular-nums text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="button"
                                    onClick={() => setNewCoupon({ ...newCoupon, newUsersOnly: !newCoupon.newUsersOnly })}
                                    className={`w-full p-6 rounded-[2rem] border-2 transition-all text-left flex items-center gap-5 relative overflow-hidden group ${newCoupon.newUsersOnly
                                        ? 'border-emerald-600 bg-emerald-50/50 shadow-lg shadow-emerald-600/5'
                                        : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm transition-all ${newCoupon.newUsersOnly ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-200 border-slate-100'
                                        }`}>
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black italic uppercase tracking-tight leading-none text-slate-900">Genesis Capture Only</div>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-60">Restrict redemptions to unique primary nodes</p>
                                    </div>
                                    {newCoupon.newUsersOnly && <div className="absolute right-8 text-[#27954D]"><CheckCircle2 size={24} /></div>}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-6 bg-slate-900 text-white hover:bg-black rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <>Sync Artifact To Network <ArrowUpRight size={20} /></>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
