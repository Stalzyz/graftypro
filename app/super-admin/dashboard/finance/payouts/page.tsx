
"use client";
import React, { useEffect, useState } from 'react';
import {
    Wallet,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    RefreshCcw,
    ExternalLink,
    ShieldCheck,
    AlertTriangle,
    Zap
} from 'lucide-react';

export default function AdminPayoutsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        try {
            const res = await fetch("/api/super-admin/reseller/payouts");
            const data = await res.json();
            setRequests(data.payouts || []);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAction = async (requestId: string, action: 'APPROVE' | 'REJECT', mode: 'MANUAL' | 'AUTOMATED' = 'AUTOMATED') => {
        const notes = window.prompt(`Notes for ${action.toLowerCase()} (${mode.toLowerCase()}):`);
        if (notes === null) return;

        setProcessing(requestId);
        try {
            const res = await fetch("/api/super-admin/reseller/payouts", {
                method: "POST",
                body: JSON.stringify({ requestId, action, adminNotes: notes, mode }),
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                alert(`Payout ${action === 'APPROVE' ? `Approved (${mode})` : 'Rejected'}`);
                fetchPayouts();
            } else {
                const error = await res.json();
                alert(error.error || "Action failed");
            }
        } catch (e) {
            alert("Network Error");
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return <div className="p-8 text-zinc-500 font-bold uppercase tracking-widest animate-pulse">Initializing Financial Ledger...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter text-white">Reseller Payouts</h1>
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-1 italic">Master Treasury Control</p>
                </div>
                <button
                    onClick={() => fetchPayouts()}
                    className="p-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl border border-zinc-800 transition-all active:rotate-180"
                >
                    <RefreshCcw size={18} />
                </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-950 text-[10px] uppercase font-black text-zinc-500 tracking-widest border-b border-zinc-800">
                            <tr>
                                <th className="px-6 py-4">Reseller</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Current Balance</th>
                                <th className="px-6 py-4">Method & Details</th>
                                <th className="px-6 py-4">Risk Analysis</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Decisions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {requests.map((p) => (
                                <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="text-white font-bold">{p.reseller.name}</div>
                                        <div className="text-[10px] text-zinc-500 font-bold mt-0.5">{p.reseller.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xl font-black tracking-tighter text-white">₹{Number(p.amount).toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-zinc-400">
                                        ₹{Number(p.reseller.wallet_balance).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-bold text-zinc-300 uppercase">{p.payment_method}</div>
                                        <div className="text-[10px] text-zinc-500 truncate max-w-[150px]">{JSON.stringify(p.payment_details)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                                                p.risk_score > 70 ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' :
                                                p.risk_score > 40 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                                'bg-zinc-800 text-zinc-500 border-zinc-700'
                                            }`}>
                                                Risk {p.risk_score}%
                                            </div>
                                            {p.risk_flags && p.risk_flags.length > 0 && (
                                                <div className="flex items-center gap-1 group/flags relative">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping absolute -top-0.5 -right-0.5" />
                                                    <AlertTriangle size={12} className={p.risk_score > 70 ? 'text-red-400' : 'text-orange-400'} />
                                                    <div className="text-[8px] text-zinc-600 font-black cursor-help hover:text-blue-400 transition-colors">
                                                        {p.risk_flags.length} Signal(s)
                                                    </div>
                                                    
                                                    {/* Tooltip on hover */}
                                                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-zinc-950 border border-zinc-800 p-3 rounded-xl shadow-2xl opacity-0 invisible group-hover/flags:opacity-100 group-hover/flags:visible transition-all z-20 pointer-events-none">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-2 border-b border-zinc-900 pb-1">Fraud Signals</p>
                                                        <div className="space-y-1.5">
                                                            {p.risk_flags.map((f: any, i: number) => (
                                                                <div key={i} className="flex justify-between items-start gap-2">
                                                                    <span className="text-[8px] font-bold text-zinc-300 italic">#{f.flag}</span>
                                                                    <span className={`text-[7px] font-black px-1 rounded uppercase ${
                                                                        f.severity === 'HIGH' ? 'text-red-400 bg-red-400/10' : 'text-orange-400 bg-orange-400/10'
                                                                    }`}>{f.severity}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${p.status === 'PAID' ? 'bg-green-500/10 text-green-400' :
                                                p.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 animate-pulse' :
                                                    'bg-red-500/10 text-red-400'
                                            }`}>
                                            {p.status === 'PAID' ? <CheckCircle2 size={12} /> : p.status === 'PENDING' ? <Clock size={12} /> : <XCircle size={12} />}
                                            {p.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {p.status === 'PENDING' ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    disabled={processing === p.id}
                                                    onClick={() => handleAction(p.id, 'REJECT')}
                                                    className="p-2 border border-red-900/50 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                                {/* Automated One-Click Payout */}
                                                <button
                                                    disabled={processing === p.id}
                                                    onClick={() => handleAction(p.id, 'APPROVE', 'AUTOMATED')}
                                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all flex items-center gap-2 text-xs font-black shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/20"
                                                    title="Execute One-Click Razorpay Payout"
                                                >
                                                    {processing === p.id ? <RefreshCcw size={14} className="animate-spin" /> : <Zap size={14} className="fill-current" />}
                                                    Payout
                                                </button>

                                                {/* Manual Backup Approval */}
                                                <button
                                                    disabled={processing === p.id}
                                                    onClick={() => handleAction(p.id, 'APPROVE', 'MANUAL')}
                                                    className="p-2 border border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500 rounded-lg transition-all"
                                                    title="Mark as Paid Manually (No Money Sent)"
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-[10px] text-zinc-600 font-bold uppercase italic">
                                                Processed at {new Date(p.processed_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-600 font-bold italic uppercase tracking-widest">
                                        No payout requests found in the ledger.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-3xl relative overflow-hidden group">
                    <ShieldCheck className="absolute top-0 right-0 -mr-4 -mt-4 text-zinc-900 group-hover:text-zinc-800 transition-colors" size={120} />
                    <div className="relative z-10">
                        <h3 className="text-xs font-black uppercase text-zinc-500 tracking-widest">Treasury Safety</h3>
                        <p className="text-xl font-black italic tracking-tighter text-white mt-2">100% Audit Coverage</p>
                        <p className="text-zinc-500 text-sm mt-1">Every payout debits the wallet and creates an immutable ledger entry automatically.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
