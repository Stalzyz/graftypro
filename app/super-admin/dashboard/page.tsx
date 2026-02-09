"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Users,
    MessageSquare,
    IndianRupee,
    Activity,
    ArrowUpRight,
    Zap,
    ShieldAlert,
    LayoutDashboard,
    ArrowRight,
    Search,
    Filter,
    MoreHorizontal,
    ExternalLink,
    Globe
} from "lucide-react";

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/super-admin/stats")
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-[#27954D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-medium tracking-wide">Syncing Core Infrastructure...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-7xl mx-auto space-y-12 pb-20">
            {/* Minimal Executive Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#042f94] font-semibold text-[10px] uppercase tracking-[0.2em] mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#27954D]" />
                        Operations Overview
                    </div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight">Platform Console</h1>
                    <p className="text-slate-400 text-sm font-medium">Real-time performance and ecosystem health metrics.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex flex-col items-end mr-4">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none mb-1">Last Update</span>
                        <span className="text-xs font-semibold text-slate-500">Just Now</span>
                    </div>
                    <button className="px-5 py-2.5 bg-white border border-slate-200 hover:border-[#27954D]/30 rounded-2xl shadow-sm text-xs font-semibold text-slate-600 transition-all flex items-center gap-2">
                        <Filter size={14} strokeWidth={2} /> 24 Hours
                    </button>
                    <button className="px-5 py-2.5 bg-[#27954D] hover:bg-[#042f94] rounded-2xl shadow-lg shadow-[#27954D]/10 text-xs font-bold text-white transition-all">
                        Deep Audit
                    </button>
                </div>
            </header>

            {/* Critical Alerts (Subtle but Clear) */}
            {stats?.riskAlerts?.length > 0 && (
                <section className="animate-slide-in">
                    <div className="flex items-center gap-2 mb-6 px-1">
                        <ShieldAlert className="text-amber-500" size={16} strokeWidth={2.5} />
                        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Administrative Priorities</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {stats.riskAlerts.map((alert: any) => (
                            <div key={alert.id} className="p-5 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-between group hover:border-amber-200 transition-all shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                                        <Zap size={20} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-700 leading-tight mb-0.5">{alert.workspaceName}</div>
                                        <div className="text-[10px] font-medium text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                                            <span className="text-amber-600">{alert.status}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            <span>{alert.reason}</span>
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href={`/super-admin/dashboard/vendors/${alert.id}`}
                                    className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-slate-300 hover:text-slate-600"
                                >
                                    <ArrowRight size={18} strokeWidth={1.5} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Core Analytics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
                <KPICard
                    label="Active Partners"
                    value={stats?.vendorsCount || 0}
                    trend="+12.5%"
                    icon={<Users size={22} strokeWidth={1.5} />}
                    color="green"
                />
                <KPICard
                    label="Total Messages"
                    value={stats?.messagesTotal?.toLocaleString() || 0}
                    trend="+4.2%"
                    icon={<MessageSquare size={22} strokeWidth={1.5} />}
                    color="teal"
                />
                <KPICard
                    label="Ecosystem Revenue"
                    value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
                    trend="+18%"
                    icon={<IndianRupee size={22} strokeWidth={1.5} />}
                    color="emerald"
                    highlight={true}
                />
                <KPICard
                    label="Uptime Efficiency"
                    value="99.8%"
                    trend="Optimal"
                    icon={<Activity size={22} strokeWidth={1.5} />}
                    color="blue"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Modernized Onboarding Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Recent Enrollments</h3>
                        </div>
                        <Link href="/super-admin/dashboard/vendors" className="text-[#042f94] hover:text-[#27954D] transition-colors text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                            Global Directory <ExternalLink size={12} strokeWidth={2.5} />
                        </Link>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm shadow-slate-200/20">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-bold uppercase tracking-[0.15em]">
                                    <th className="px-8 py-5">Organization Entity</th>
                                    <th className="px-8 py-5">Tier</th>
                                    <th className="px-8 py-5">Provisioning Date</th>
                                    <th className="px-8 py-5 text-right pr-10">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {stats?.recentVendors?.map((v: any) => (
                                    <tr key={v.id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="font-semibold text-slate-700 text-sm group-hover:text-[#042f94] transition-colors">{v.name}</div>
                                            <div className="text-[10px] text-slate-300 font-medium tracking-tight mt-0.5 uppercase tracking-widest">ID: {v.id.slice(0, 8)}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-[0.05em] uppercase border ${v.plan === 'ENTERPRISE' ? 'bg-indigo-50/30 text-indigo-500 border-indigo-100' :
                                                v.plan === 'PRO' ? 'bg-[#27954D]/5 text-[#042f94] border-[#27954D]/10' :
                                                    'bg-slate-50 text-slate-400 border-slate-100'
                                                }`}>
                                                {v.plan || 'BASIC'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-medium text-slate-400">
                                            {v.joined_at ? new Date(v.joined_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
                                        </td>
                                        <td className="px-8 py-5 text-right pr-10">
                                            <Link href={`/super-admin/dashboard/vendors/${v.id}`} className="inline-flex items-center justify-center p-2 rounded-xl text-slate-300 hover:text-[#27954D] hover:bg-white border border-transparent hover:border-slate-100 transition-all group-hover:shadow-sm">
                                                <MoreHorizontal size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Operations Sidebar */}
                <div className="space-y-8">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Network Management</h3>

                    <div className="space-y-4">
                        <QuickActionCard
                            title="Cloud Nexus"
                            description="API health & monitoring"
                            href="/super-admin/dashboard/infra"
                            icon={<Globe size={18} strokeWidth={1.5} />}
                            color="indigo"
                        />
                        <QuickActionCard
                            title="Vendor Ledger"
                            description="Organization management"
                            href="/super-admin/dashboard/vendors"
                            icon={<Users size={18} strokeWidth={1.5} />}
                            color="green"
                        />
                        <QuickActionCard
                            title="Revenue Core"
                            description="Financial settlement audit"
                            href="/super-admin/dashboard/finance/revenue"
                            icon={<IndianRupee size={18} strokeWidth={1.5} />}
                            color="emerald"
                        />
                        <QuickActionCard
                            title="Infra Logs"
                            description="Edge node health status"
                            href="/super-admin/dashboard/audit"
                            icon={<Zap size={18} strokeWidth={1.5} />}
                            color="teal"
                        />
                    </div>

                    {/* Scale Card - Executive Calm */}
                    <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full bg-[#27954D]/5 group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative z-10 space-y-5">
                            <div className="w-10 h-10 rounded-2xl bg-[#27954D]/10 flex items-center justify-center text-[#042f94]">
                                <Activity size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-semibold text-slate-800">Ecosystem Health</h4>
                                <p className="text-slate-400 text-xs leading-relaxed">Infrastructure load is at 14.2%. Global nodes are synchronized and ready for scale.</p>
                            </div>
                            <button className="w-full py-3 bg-slate-50 hover:bg-[#27954D]/5 rounded-xl text-[10px] font-bold text-slate-600 tracking-widest uppercase transition-all">
                                Protocol Status
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ label, value, trend, icon, highlight, color }: any) {
    const colorStyles: any = {
        green: "bg-green-50 text-[#042f94]",
        teal: "bg-teal-50 text-teal-600",
        emerald: "bg-emerald-50 text-emerald-600",
        blue: "bg-blue-50 text-blue-600",
    };

    return (
        <div className={`p-8 rounded-[2.5rem] transition-all duration-300 group ${highlight
            ? "bg-white border border-[#27954D]/20 shadow-lg shadow-[#27954D]/5"
            : "bg-white/60 border border-slate-100 hover:bg-white hover:border-[#27954D]/20 hover:shadow-xl hover:shadow-[#27954D]/5 hover:-translate-y-1"
            } glass-card`}>
            <div className="flex justify-between items-start mb-8">
                <div className={`w-12 h-12 rounded-2xl ${colorStyles[color]} flex items-center justify-center transition-transform duration-500 group-hover:scale-110`}>
                    {icon}
                </div>
                <div className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-full tracking-wider group-hover:bg-[#27954D]/10 group-hover:text-[#042f94] transition-colors">
                    {trend}
                </div>
            </div>
            <div className="space-y-0.5">
                <div className="text-3xl font-semibold text-slate-800 tracking-tight">{value}</div>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.15em]">{label}</div>
            </div>
        </div>
    );
}

function QuickActionCard({ title, description, href, icon, color }: any) {
    const colorStyles: any = {
        green: "bg-green-50 text-[#042f94]",
        teal: "bg-teal-50 text-teal-600",
        emerald: "bg-emerald-50 text-emerald-600",
    };

    return (
        <Link
            href={href}
            className="p-5 rounded-[1.8rem] bg-white border border-slate-100 hover:border-[#27954D]/30 transition-all shadow-sm group hover:shadow-md block"
        >
            <div className="flex items-center gap-5">
                <div className={`w-11 h-11 rounded-2xl ${colorStyles[color]} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <div className="font-semibold text-slate-700 text-sm group-hover:text-[#042f94] transition-colors">{title}</div>
                    <div className="text-[11px] font-medium text-slate-400">{description}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowUpRight size={14} strokeWidth={2.5} />
                </div>
            </div>
        </Link>
    );
}

