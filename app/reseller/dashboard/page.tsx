"use client";

import { useState, useEffect } from "react";
import {
    Users,
    TrendingUp,
    MessageCircle,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Users2,
    BarChart2,
    Zap,
    Target,
    ShieldCheck
} from "lucide-react";

export default function ResellerDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const resellerId = "temp-reseller-id"; // Placeholder

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch(`/api/reseller/analytics?resellerId=${resellerId}`);
                const json = await res.json();
                if (json.success) setData(json.data);
            } catch (e) {
                console.error("Dashboard Load Error:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Hydrating Partner Data...</p>
        </div>
    );

    const stats = data?.stats || {};

    return (
        <div className="space-y-12 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl">
                            <Zap className="text-white fill-white" size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Partner Tower</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-lg max-w-2xl">Real-time command center for your white-labeled messaging network.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-8 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-all shadow-sm">
                        Export Reports
                    </button>
                </div>
            </header>

            {/* High Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Vendors"
                    value={stats.vendors?.total || 0}
                    trend={`+${stats.vendors?.growth || 0} New this month`}
                    icon={<Users2 size={20} />}
                    color="blue"
                />
                <StatCard
                    title="Network Revenue"
                    value={`₹${stats.earnings?.total?.toLocaleString() || 0}`}
                    trend={`₹${stats.earnings?.last30Days?.toLocaleString() || 0} Commissions`}
                    icon={<DollarSign size={20} />}
                    color="green"
                    trendUp={true}
                />
                <StatCard
                    title="Throughput"
                    value={stats.usage?.totalMessages?.toLocaleString() || 0}
                    trend="Total Network Load"
                    icon={<Activity size={20} />}
                    color="purple"
                />
                <StatCard
                    title="Partner Tier"
                    value={data?.tierProgress?.currentTier?.name || "Starter"}
                    trend={data?.tierProgress?.nextTier
                        ? `${data.tierProgress.nextTier.needed} more for ${data.tierProgress.nextTier.name}`
                        : "Maximum Tier Reached"}
                    icon={<ShieldCheck size={20} />}
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Earnings Chart */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-12 relative z-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Revenue Pulse</h2>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Daily Commission Ingress</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                                <Target size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="h-72 flex items-end gap-3 px-2 relative z-10">
                        {data?.chartData?.length > 0 ? data.chartData.map((day: any, i: number) => (
                            <div key={i} className="flex-1 group/bar relative">
                                <div
                                    className="bg-slate-100 group-hover/bar:bg-slate-900 rounded-2xl transition-all duration-500 w-full"
                                    style={{ height: `${Math.max(8, Math.min(100, (day.amount / 500) * 100))}%` }}
                                />
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-2 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all scale-75 group-hover/bar:scale-100 whitespace-nowrap z-20 shadow-2xl">
                                    ₹{day.amount}
                                </div>
                            </div>
                        )) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 gap-4">
                                <BarChart2 size={48} strokeWidth={1} />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Awaiting Data Points</p>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between mt-8 px-2 text-[10px] font-black uppercase text-slate-300 tracking-widest relative z-10">
                        <span>{data?.chartData?.[0]?.date || 'Past Cycle'}</span>
                        <span className="text-slate-900">Live View</span>
                    </div>
                </div>

                {/* Top Performers */}
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Key Accounts</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Top Performing Vendors</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-[#27954D]/10 text-[#27954D] flex items-center justify-center">
                            <TrendingUp size={20} />
                        </div>
                    </div>

                    <div className="space-y-8">
                        {data?.topVendors?.map((vendor: any, i: number) => (
                            <div key={i} className="flex items-center justify-between group/vendor">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xs font-black text-slate-400 group-hover/vendor:bg-slate-900 group-hover/vendor:text-white transition-all">
                                        0{i + 1}
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-slate-900 line-clamp-1">{vendor.name}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                            {vendor.messages.toLocaleString()} Outbound
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-[#27954D]">₹{vendor.earnings.toLocaleString()}</div>
                                    <div className="text-[9px] text-slate-300 font-black uppercase tracking-tighter">Yield</div>
                                </div>
                            </div>
                        ))}
                        {(!data?.topVendors || data.topVendors.length === 0) && (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-300 gap-4">
                                <Users size={40} strokeWidth={1} />
                                <p className="text-[10px] font-black uppercase tracking-widest">No Active Nodes</p>
                            </div>
                        )}
                    </div>

                    <button className="w-full mt-12 py-5 bg-slate-900 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#27954D] transition-all shadow-xl shadow-slate-100">
                        Universal Registry
                    </button>

                    {/* Tier Progress Visualizer */}
                    {data?.tierProgress?.nextTier && (
                        <div className="mt-8 pt-8 border-t border-slate-50">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">Next Level</p>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{data.tierProgress.nextTier.name}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-[#27954D] uppercase tracking-widest leading-loose">{data.tierProgress.nextTier.rate}% Share</p>
                                </div>
                            </div>
                            <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                <div
                                    className="h-full bg-slate-900 rounded-full transition-all duration-1000 shadow-sm"
                                    style={{ width: `${data.tierProgress.progress}%` }}
                                />
                            </div>
                            <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-4">
                                {data.tierProgress.totalVendors} / {data.tierProgress.nextTier.min_vendors} Active Nodes Linked
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon, color, trendUp }: any) {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-[#27954D]/10 text-[#27954D]',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600'
    };

    return (
        <div className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between h-[200px]">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-150 transition-transform duration-700">
                <Activity size={100} strokeWidth={1} />
            </div>

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-4 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{title}</div>
            </div>

            <div className="relative z-10">
                <div className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{value}</div>
                <div className={`text-[10px] font-black flex items-center gap-2 uppercase tracking-widest ${trendUp ? 'text-[#27954D]' : 'text-slate-400'}`}>
                    {trendUp && <ArrowUpRight size={14} strokeWidth={3} />}
                    {trend}
                </div>
            </div>
        </div>
    );
}
