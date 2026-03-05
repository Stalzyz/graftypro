
"use client";

import { useState, useEffect } from "react";
import {
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    Zap,
    History,
    ShieldCheck,
    ExternalLink,
    Filter,
    Calendar,
    IndianRupee
} from "lucide-react";

interface CreditTransaction {
    id: string;
    type: string;
    amount: number;
    balance_after: number;
    description: string;
    message_category: string | null;
    meta_message_id: string | null;
    created_at: string;
}

export default function CreditLedgerPage() {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLedger = async () => {
            try {
                const res = await fetch("/api/credits/ledger");
                const data = await res.json();
                setBalance(data.balance || 0);
                setTransactions(data.transactions || []);
            } catch (e) {
                console.error("Failed to load ledger");
            } finally {
                setLoading(false);
            }
        };
        fetchLedger();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-400 tracking-widest uppercase">Syncing Ledger Data...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Credit Ledger</h1>
                    <p className="text-slate-400 font-medium">Real-time audit of your WhatsApp Business Platform consumption.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-2">
                        <Zap size={14} className="fill-white" /> Recharge Credits
                    </button>
                    <button className="bg-white border border-slate-200 text-slate-600 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-slate-900 transition-all flex items-center gap-2">
                        <Calendar size={14} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Wallet Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <IndianRupee size={120} strokeWidth={1} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Available Balance</p>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-5xl font-black tracking-tighter">₹{balance.toLocaleString()}</span>
                        </div>
                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck size={14} /> System Verified
                        </p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Total Purchases</p>
                        <p className="text-2xl font-black text-slate-900">₹{balance.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300 italic">
                        No recent recharges
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Meta Status</p>
                        <p className="text-2xl font-black text-slate-900">Healthy</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-widest">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Direct Connection Active
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <History size={20} className="text-slate-900" />
                        <h3 className="font-black text-xl text-slate-900">Consumption History</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 italic">
                            Showing last {transactions.length} activities
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Execution Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity Description</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Category</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-slate-900">{new Date(tx.created_at).toLocaleDateString()}</p>
                                        <p className="text-[10px] font-medium text-slate-400">{new Date(tx.created_at).toLocaleTimeString()}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-slate-700">{tx.description}</p>
                                        {tx.meta_message_id && (
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-1 uppercase">
                                                ID: {tx.meta_message_id.substring(0, 20)}...
                                                <ExternalLink size={10} className="group-hover:text-slate-900 transition-colors" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-full tracking-widest uppercase ${tx.message_category === 'MARKETING' ? 'bg-amber-50 text-amber-600' :
                                                tx.message_category === 'UTILITY' ? 'bg-blue-50 text-blue-600' :
                                                    tx.message_category === 'SERVICE' ? 'bg-emerald-50 text-emerald-600' :
                                                        'bg-slate-100 text-slate-500'
                                            }`}>
                                            {tx.message_category || 'SYSTEM'}
                                        </span>
                                    </td>
                                    <td className={`px-8 py-6 text-right text-sm font-black ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-900'}`}>
                                        {tx.amount > 0 ? `+ ₹${tx.amount.toFixed(2)}` : `- ₹${Math.abs(tx.amount).toFixed(2)}`}
                                    </td>
                                    <td className="px-8 py-6 text-right text-sm font-black text-slate-900">
                                        ₹{tx.balance_after.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-200">
                                                <History size={32} />
                                            </div>
                                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No transactions discovered in this cycle.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
