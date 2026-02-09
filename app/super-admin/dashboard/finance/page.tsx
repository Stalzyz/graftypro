"use client";
import { useState, useEffect } from "react";
import {
    DollarSign,
    ArrowDownLeft,
    Wallet,
    Download,
    TrendingUp,
    Zap,
    Plus,
    Edit3,
    Trash2,
    Settings,
    CheckCircle2
} from "lucide-react";

export default function FinanceDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"TRANSACTIONS" | "PLANS">("TRANSACTIONS");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [finRes, planRes] = await Promise.all([
                    fetch("/api/super-admin/finance"),
                    fetch("/api/super-admin/plans")
                ]);

                const finData = await finRes.json();
                const planData = await planRes.json();

                setStats(finData.stats);
                setTransactions(finData.transactions);
                setPlans(planData.plans || []);
                setLoading(false);
            } catch (error) {
                console.error("Fetch Error:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-[#27954D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 text-sm animate-pulse-soft">Loading financial data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-xl font-bold text-white mb-1">Finance & Billing</h1>
                    <p className="text-gray-500 text-sm">Revenue, credits, and subscription management.</p>
                </div>
                <div className="flex bg-[#0d1210] border border-[#1a2420] p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab("TRANSACTIONS")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'TRANSACTIONS' ? 'bg-[#27954D] text-black shadow-lg shadow-green-900/20' : 'text-gray-500 hover:text-white'}`}
                    >
                        Transactions
                    </button>
                    <button
                        onClick={() => setActiveTab("PLANS")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'PLANS' ? 'bg-[#27954D] text-black shadow-lg shadow-green-900/20' : 'text-gray-500 hover:text-white'}`}
                    >
                        Subscription Plans
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <KPICard
                    label="Total Revenue"
                    value={`₹${stats?.revenue?.toLocaleString() || 0}`}
                    icon={<DollarSign size={20} />}
                    trend="+18% this month"
                    trendUp={true}
                    highlight={true}
                />
                <KPICard
                    label="Unused Credits"
                    value={`₹${stats?.liability?.toLocaleString() || 0}`}
                    icon={<Wallet size={20} />}
                    trend="Liability"
                    trendUp={false}
                />
                <KPICard
                    label="Pending Payouts"
                    value={`₹${stats?.pending_payouts?.toLocaleString() || 0}`}
                    icon={<ArrowDownLeft size={20} />}
                    trend="To partners"
                    trendUp={false}
                />
            </div>

            {activeTab === "TRANSACTIONS" ? (
                /* Transactions Table */
                <div className="glass-card-dark overflow-hidden">
                    <div className="p-5 border-b border-[#1a2420] flex justify-between items-center">
                        <h3 className="font-semibold text-white">Recent Transactions</h3>
                        <button className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#27954D] transition-colors font-medium">
                            <Download size={14} />
                            Export CSV
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#0a0f0d] text-gray-400 text-[10px] uppercase tracking-widest font-bold border-b border-[#1a2420]">
                                <tr>
                                    <th className="px-5 py-4">Source / Vendor</th>
                                    <th className="px-5 py-4">Type</th>
                                    <th className="px-5 py-4">Date</th>
                                    <th className="px-5 py-4 text-right">Amount</th>
                                    <th className="px-5 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1a2420]">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center text-gray-500 font-medium">
                                            <TrendingUp size={32} className="mx-auto mb-3 opacity-20" />
                                            No transactions yet
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((t: any) => (
                                        <tr key={t.id} className="hover:bg-[#141a17]/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="text-white font-medium">{t.source}</div>
                                                <div className="text-[10px] text-gray-500 font-mono">{t.id.slice(0, 8)}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-gray-400 text-xs font-medium uppercase tracking-tighter">{t.type.replace('_', ' ')}</span>
                                            </td>
                                            <td className="px-5 py-4 text-gray-500 text-xs">
                                                {new Date(t.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-4 text-right font-mono font-bold text-white">
                                                ₹{t.amount?.toLocaleString()}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${t.status === 'SUCCESS' ? 'bg-[#27954D]/10 text-[#27954D] border border-[#27954D]/20' :
                                                    t.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                        'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    }`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Subscription Plans View */
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-xs font-semibold flex items-center gap-2">
                            <CheckCircle2 size={14} /> Only Active plans are visible in the user dashboard.
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#27954D] text-black rounded-xl text-xs font-bold hover:bg-[#1fb355] transition-all">
                            <Plus size={16} /> Create New Plan
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((p: any) => (
                            <div key={p.id} className="bg-[#0d1210] border border-[#1a2420] rounded-2xl p-6 hover:border-[#27954D]/30 transition-all group relative overflow-hidden">
                                {p.status === 'ACTIVE' && (
                                    <div className="absolute top-0 right-0 bg-[#27954D] text-black text-[9px] font-bold px-3 py-1 rounded-bl-xl shadow-lg">ACTIVE</div>
                                )}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-[#141a17] text-[#27954D] rounded-xl border border-[#27954D]/10 group-hover:bg-[#27954D] group-hover:text-black transition-all">
                                        <Settings size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-0.5">{p.name}</h4>
                                        <div className="text-[10px] font-mono text-gray-500">{p.id}</div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-end border-b border-[#1a2420] pb-3">
                                        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-none">Monthly Price</span>
                                        <span className="text-xl font-bold text-white leading-none">₹{p.price.toLocaleString()}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-[#0a0f0d] rounded-xl border border-[#1a2420]">
                                            <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Contacts</div>
                                            <div className="text-sm font-bold text-white">{p.contacts.toLocaleString()}</div>
                                        </div>
                                        <div className="p-3 bg-[#0a0f0d] rounded-xl border border-[#1a2420]">
                                            <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Campaigns</div>
                                            <div className="text-sm font-bold text-white">{p.campaigns === -1 ? 'Unlimited' : p.campaigns}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#141a17] hover:bg-[#1a2420] text-gray-400 hover:text-white rounded-xl text-xs font-bold border border-[#1a2420] transition-all">
                                        <Edit3 size={14} /> Edit
                                    </button>
                                    <button className="p-2.5 bg-red-500/5 hover:bg-red-500/10 text-red-500/50 hover:text-red-500 rounded-xl border border-red-500/10 transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function KPICard({ label, value, icon, trend, trendUp, highlight }: any) {
    return (
        <div className={`p-5 rounded-2xl border transition-all ${highlight
            ? 'bg-gradient-to-br from-[#27954D]/10 to-[#0d1210] border-[#27954D]/20 shadow-lg shadow-green-900/5'
            : 'bg-[#0d1210] border-[#1a2420] hover:border-[#27954D]/20'
            }`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${highlight ? 'bg-[#27954D] text-black shadow-lg shadow-green-600/20' : 'bg-[#141a17] text-[#27954D]'}`}>
                    {icon}
                </div>
                <div className={`text-[10px] font-bold px-2 py-1 rounded-lg ${trendUp ? 'bg-[#27954D]/10 text-[#27954D] border border-[#27954D]/20' : 'bg-gray-500/10 text-gray-400 border border-[#1a2420]'
                    }`}>
                    {trend}
                </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</div>
        </div>
    );
}
