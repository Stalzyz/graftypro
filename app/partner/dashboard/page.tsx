
"use client";
import React, { useEffect, useState } from 'react';
import {
    TrendingUp,
    Users,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    History,
    AlertCircle
} from 'lucide-react';

export default function PartnerDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/reseller/stats");
            const json = await res.json();
            setData(json);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter">Welcome, {data.profile.name}</h1>
                    <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                        Current Tier: <span className="text-cyan-400">{data.profile.tier}</span> • Commission: {data.profile.commisson_rate}%
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-zinc-800">
                        Copy Referral Link
                    </button>
                    <button className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-cyan-500/20">
                        Request Payout
                    </button>
                </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Wallet Balance"
                    value={`₹${data.wallet.balance.toLocaleString()}`}
                    subValue="Available for Payout"
                    icon={<Wallet className="text-cyan-400" size={24} />}
                />
                <StatCard
                    label="This Month"
                    value={`₹${data.wallet.this_month.toLocaleString()}`}
                    subValue="+12% from last month"
                    icon={<TrendingUp className="text-green-400" size={24} />}
                    trending="up"
                />
                <StatCard
                    label="Total Vendors"
                    value={data.stats.total_vendors}
                    subValue="Locked & Permanent"
                    icon={<Users className="text-purple-400" size={24} />}
                />
                <StatCard
                    label="Risk Score"
                    value={data.stats.risk_score}
                    subValue={data.stats.risk_score > 50 ? "Manual Audit Required" : "Account Healthy"}
                    icon={<AlertCircle className={data.stats.risk_score > 50 ? "text-red-400" : "text-green-400"} size={24} />}
                    variant={data.stats.risk_score > 50 ? "danger" : "default"}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ledger */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <History size={18} className="text-zinc-500" />
                        <h2 className="font-black uppercase text-xs tracking-widest text-zinc-400">Recent Financial History</h2>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-900/50 text-[10px] uppercase font-black text-zinc-500 tracking-widest border-b border-zinc-900">
                                <tr>
                                    <th className="px-6 py-4">Transaction Details</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Balance After</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900">
                                {data.recent_activity.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-zinc-900/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="text-white font-bold">{item.description}</div>
                                            <div className="text-[10px] text-zinc-600 font-mono mt-0.5">{new Date(item.created_at).toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${item.type === 'COMMISSION' ? 'bg-green-500/10 text-green-400' :
                                                    item.type === 'PAYOUT' ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-800 text-zinc-400'
                                                }`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 font-black ${Number(item.amount) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {Number(item.amount) >= 0 ? '+' : ''}{Number(item.amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-zinc-500">
                                            ₹{Number(item.balance_after).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Action Panel */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-cyan-600 to-blue-700 p-6 rounded-3xl shadow-2xl shadow-cyan-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl group-hover:bg-white/20 transition-all"></div>
                        <h3 className="text-xl font-black italic tracking-tighter text-white">Tier Upgrades</h3>
                        <p className="text-white/70 text-sm mt-2 font-bold italic">You are just {Math.max(0, 10 - data.stats.total_vendors)} vendors away from Growth Tier!</p>
                        <div className="mt-4 bg-black/20 rounded-full h-2 overflow-hidden">
                            <div className="bg-white h-full transition-all" style={{ width: `${Math.min(100, (data.stats.total_vendors / 10) * 100)}%` }}></div>
                        </div>
                        <button className="w-full mt-6 py-3 bg-white text-cyan-600 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl">
                            View Benefits
                        </button>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-3xl">
                        <h3 className="text-xs font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                            <History size={14} /> Quick Stats
                        </h3>
                        <div className="mt-6 space-y-4">
                            <div className="flex justify-between items-center bg-zinc-900/30 p-3 rounded-xl">
                                <span className="text-xs text-zinc-500 font-bold">Total Earned</span>
                                <span className="text-white font-black italic">₹{data.wallet.total_earned.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center bg-zinc-900/30 p-3 rounded-xl">
                                <span className="text-xs text-zinc-500 font-bold">Pending Payouts</span>
                                <span className="text-cyan-400 font-black italic">{data.wallet.pending_payouts}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, subValue, icon, trending, variant = "default" }: any) {
    return (
        <div className={`bg-zinc-950 border p-6 rounded-3xl transition-transform hover:scale-[1.02] ${variant === 'danger' ? 'border-red-900/30 bg-red-950/5' : 'border-zinc-900'
            }`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${variant === 'danger' ? 'bg-red-500/10' : 'bg-zinc-900'
                    }`}>
                    {icon}
                </div>
                {trending && (
                    <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${trending === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                        {trending === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        12%
                    </div>
                )}
            </div>
            <div>
                <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{label}</div>
                <div className="text-2xl font-black tracking-tighter mt-1">{value}</div>
                <div className="text-[10px] text-zinc-600 font-bold uppercase mt-1 italic">{subValue}</div>
            </div>
        </div>
    );
}
