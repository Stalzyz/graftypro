
"use client";

import { useState, useEffect, useCallback } from "react";
import {
    BarChart3,
    TrendingUp,
    Users,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Download,
    PieChart,
    Activity,
    IndianRupee,
    Target,
    Loader2,
    RefreshCw,
    Building2
} from "lucide-react";

export default function RevenueAnalytics() {
    const [stats, setStats] = useState<any>(null);
    const [topVendors, setTopVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, vendorsRes] = await Promise.all([
                fetch(`/api/super-admin/finance/stats?month=${month}&year=${year}`),
                fetch(`/api/super-admin/vendors?page=1&limit=5&sort=credits_used`)
            ]);
            const statsData = await statsRes.json();
            const vendorsData = await vendorsRes.json();

            setStats(statsData);
            if (vendorsData.success) {
                setTopVendors((vendorsData.data || []).slice(0, 3));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Compute yield distribution from trend data
    const subscriptionRevenue = stats?.subscription_revenue || 0;
    const creditRevenue = stats?.credit_revenue || 0;
    const totalRev = subscriptionRevenue + creditRevenue || 1;
    const subPct = Math.round((subscriptionRevenue / totalRev) * 100);
    const creditPct = 100 - subPct;

    return (
        <div className="max-w-7xl space-y-12 pb-20 font-sans">
            <header className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <BarChart3 className="text-white" size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Economic Cluster</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Real-time revenue monitoring, churn analysis, and fiscal intelligence.</p>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="flex items-center bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <select
                            value={month}
                            onChange={e => setMonth(parseInt(e.target.value))}
                            className="bg-transparent text-xs font-black uppercase tracking-widest px-4 py-2 outline-none"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString("default", { month: "short" })}
                                </option>
                            ))}
                        </select>
                        <select
                            value={year}
                            onChange={e => setYear(parseInt(e.target.value))}
                            className="bg-transparent text-xs font-black uppercase tracking-widest px-4 py-2 outline-none border-l border-slate-200"
                        >
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                        </select>
                    </div>
                    <button
                        onClick={fetchData}
                        className="px-6 py-4 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <InsightCard
                    label="Gross Revenue"
                    value={loading ? "—" : `₹${Number(stats?.total_revenue || 0).toLocaleString()}`}
                    sub="Total collected"
                    icon={<IndianRupee />}
                    loading={loading}
                />
                <InsightCard
                    label="Active Vendors"
                    value={loading ? "—" : String(stats?.active_vendors || 0)}
                    sub="Platform wide"
                    icon={<Users />}
                    loading={loading}
                />
                <InsightCard
                    label="GST Payable"
                    value={loading ? "—" : `₹${Number(stats?.gst?.total || 0).toLocaleString()}`}
                    sub="Tax liability"
                    icon={<Activity />}
                    loading={loading}
                />
                <InsightCard
                    label="Net Earnings"
                    value={loading ? "—" : `₹${Number(stats?.net_revenue || 0).toLocaleString()}`}
                    sub="After GST"
                    icon={<Target />}
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Revenue Trajectory Chart */}
                <div className="lg:col-span-8 bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm space-y-8 flex flex-col" style={{ minHeight: 420 }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="text-blue-500" size={18} />
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Revenue Trajectory</h2>
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            {new Date(0, month - 1).toLocaleString("default", { month: "long" })} {year}
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400 gap-2">
                            <Loader2 size={24} className="animate-spin" /> Loading revenue data...
                        </div>
                    ) : stats?.trend && stats.trend.length > 0 ? (
                        <div className="flex-1 flex items-end justify-between px-4 pb-2 gap-1">
                            {stats.trend.map((t: any, idx: number) => {
                                const maxRev = Math.max(...stats.trend.map((m: any) => m.revenue), 1);
                                const height = Math.max((t.revenue / maxRev) * 100, 4);
                                return (
                                    <div key={idx} className="flex flex-col items-center gap-3 flex-1 group">
                                        <div className="relative w-full flex justify-center">
                                            <div
                                                className="w-full max-w-[40px] bg-slate-50 group-hover:bg-blue-600 rounded-t-xl transition-all duration-500 cursor-help"
                                                style={{ height: `${height * 2}px` }}
                                                title={`₹${t.revenue.toLocaleString()}`}
                                            />
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.month}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-medium">
                            No revenue data for this period.
                        </div>
                    )}
                </div>

                {/* Side panels */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Yield Distribution */}
                    <section className="bg-slate-900 rounded-[40px] p-10 text-white space-y-10 shadow-2xl overflow-hidden relative group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-600/20 blur-[80px]" />
                        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                            <PieChart className="text-emerald-400" size={18} />
                            <h2 className="text-xs font-black uppercase tracking-widest">Yield Distribution</h2>
                        </div>
                        <div className="space-y-8 relative z-10">
                            {loading ? (
                                <div className="text-slate-500 text-xs italic">Loading...</div>
                            ) : (
                                <>
                                    <ProgressRow label="Subscription Revenue" value={`${subPct}%`} color="bg-emerald-400" />
                                    <ProgressRow label="Credit Revenue" value={`${creditPct}%`} color="bg-blue-400" />
                                </>
                            )}
                        </div>
                    </section>

                    {/* Top Revenue Vendors */}
                    <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                            <BarChart3 className="text-slate-400" size={18} />
                            <h2 className="text-sm font-black text-slate-900 tracking-tight">Top Vendors</h2>
                        </div>
                        <div className="space-y-6">
                            {loading ? (
                                <div className="text-slate-400 text-xs font-medium italic">Loading...</div>
                            ) : topVendors.length === 0 ? (
                                <div className="text-slate-400 text-xs font-medium italic">No vendor data available.</div>
                            ) : (
                                topVendors.map((v: any, i: number) => (
                                    <div key={v.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-400">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-slate-700">
                                                    {v.business_name || v.name || "—"}
                                                </span>
                                                <div className="text-[9px] text-slate-300 font-medium">{v.email}</div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">
                                            {v.wallet?.balance ? `₹${Number(v.wallet.balance).toLocaleString()}` : "—"}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InsightCard({ label, value, sub, icon, loading }: any) {
    return (
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 group">
            <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>
            </div>
            <div>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                    {loading ? <span className="text-slate-200 animate-pulse">—</span> : value}
                </h3>
                <p className="text-[9px] text-slate-300 font-medium mt-1">{sub}</p>
            </div>
        </div>
    );
}

function ProgressRow({ label, value, color }: any) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                <span className="text-[11px] font-black text-white">{value}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: value }} />
            </div>
        </div>
    );
}
