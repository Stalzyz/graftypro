"use client";
import React, { useEffect, useState } from 'react';
import { History, TrendingUp, Download, Filter, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { safeToLocaleString, formatCurrency, ensureNumber } from '@/lib/utils/number-format';


export default function ResellerLedgerPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLedger();
    }, []);

    const fetchLedger = async () => {
        try {
            const res = await fetch("/api/reseller/stats");
            const data = await res.json();
            if (data.recent_activity) setEntries(data.recent_activity);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#27954D] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fiscal History Ledger</h1>
                    <p className="text-sm text-slate-500 mt-1">Immutable record of commissions, payouts, and adjustments.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                        <Filter size={14} /> Filter Logic
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#27954D] text-white rounded-xl text-xs font-bold hover:bg-[#1f7a3f] transition-all shadow-lg shadow-[#27954D]/10">
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </header>

            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5">Event Detail</th>
                                <th className="px-8 py-5">Category</th>
                                <th className="px-8 py-5">Delta Amount</th>
                                <th className="px-8 py-5">Final Balance</th>
                                <th className="px-8 py-5">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {entries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <Clock size={40} className="mx-auto text-slate-200 mb-4" />
                                        <p className="text-sm font-bold text-slate-400">No financial events recorded in this cycle.</p>
                                    </td>
                                </tr>
                            ) : entries.map((item: any) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="text-slate-900 font-bold text-sm tracking-tight">{item.description}</div>
                                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                            {new Date(item.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${item.type === 'COMMISSION' ? 'bg-green-50 text-green-600 border-green-100' :
                                            item.type === 'PAYOUT' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className={`px-8 py-6 font-black text-sm ${Number(item.amount) >= 0 ? 'text-[#27954D]' : 'text-red-500'}`}>
                                        {Number(item.amount) >= 0 ? '+' : '-'} {formatCurrency(Math.abs(Number(item.amount)))}

                                    </td>
                                    <td className="px-8 py-6 font-bold text-xs text-slate-600">
                                        {formatCurrency(item.balance_after)}

                                    </td>
                                    <td className="px-8 py-6 text-[10px] text-slate-400 font-bold tabular-nums">
                                        #{item.reference_id?.slice(-8) || 'SYSTEM'}
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
