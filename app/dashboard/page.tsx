"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import {
    Users,
    MessageCircle,
    Zap,
    TrendingUp,
    ArrowUpRight,
    Send,
    CheckCircle2,
    Clock,
    Wallet,
    Activity,
    ArrowRight,
    ShoppingBag,
    Sparkles,
    BarChart3,
    Target,
    Star,
    PlusCircle,
    ShoppingBag as Storefront,
    MessageSquare,
    Link as LinkIcon
} from "lucide-react";

import { useUser } from "../../hooks/use-user";

export default function DashboardPage() {
    const { user } = useUser();
    const [stats, setStats] = useState<any>({
        contactsCount: 0,
        messagesSent: 0,
        activeFlows: 0,
        totalRevenue: 0,
        funnel: { sent: 0, delivered: 0, read: 0, replied: 0 },
        recentCampaigns: [],
        wabaDetails: null,
        walletBalance: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/dashboard/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (e) {
                console.error("Failed to fetch dash stats", e);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="p-12 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="relative w-14 h-14 mb-5">
                    <div className="absolute inset-0 rounded-full border-4 border-[#27954D]/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#27954D] animate-spin"></div>
                </div>
                <p className="text-slate-500 font-semibold text-sm">Loading your dashboard...</p>
            </div>
        );
    }

    const checklistProgress = Math.round(
        ([stats.wabaConnected, stats.activeFlows > 0, stats.messagesSent > 0, stats.totalRevenue > 0]
            .filter(Boolean).length / 4) * 100
    );

    return (
        <div className="space-y-7 pb-16 animate-fade-in">

            {/* === TOP HEADER === */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Welcome back, {user?.first_name || "there"} 👋
                        </h1>
                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm shadow-green-200">
                            <Sparkles size={9} /> V4.1 LIVE
                        </span>
                    </div>
                    
                    {/* WABA Connection Status Pill */}
                    <div className="flex items-center gap-2 mt-2">
                        {stats.wabaConnected ? (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-[10px] font-bold">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] animate-pulse"></div>
                                Connected: {stats.wabaDetails?.phone_number || "Active"}
                            </div>
                        ) : (
                            <Link href="/dashboard/settings" className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-md text-[10px] font-bold hover:bg-rose-100 transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                WhatsApp Not Connected — Click to setup
                            </Link>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Wallet Balance Display */}
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Credits</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-800">₹{stats.walletBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}</span>
                            <Link href="/dashboard/credits" className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded transition-colors">Top Up</Link>
                        </div>
                    </div>
                    
                    <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>

                    <Link href="/dashboard/commerce"
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-[#27954D]/40 hover:text-[#27954D] hover:shadow-sm transition-all">
                        <ShoppingBag size={14} /> Commerce
                    </Link>
                    <Link href="/dashboard/campaigns"
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#27954D] to-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-green-200 hover:shadow-lg hover:shadow-green-300 hover:-translate-y-0.5 transition-all">
                        <Send size={13} /> New Broadcast
                    </Link>
                </div>
            </div>

            {/* === QUICK ACTIONS ROW === */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <Link href="/dashboard/contacts?add=true" className="flex flex-col p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Users size={16} className="text-blue-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 mb-0.5">Add Contact</span>
                    <span className="text-[10px] font-medium text-slate-400">Import or sync users</span>
                </Link>
                <Link href="/dashboard/templates?create=true" className="flex flex-col p-4 bg-white border border-slate-200 rounded-2xl hover:border-purple-300 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <MessageSquare size={16} className="text-purple-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 mb-0.5">New Template</span>
                    <span className="text-[10px] font-medium text-slate-400">Design a rich message</span>
                </Link>
                <Link href="/dashboard/chat" className="flex flex-col p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <MessageCircle size={16} className="text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 mb-0.5">Live Chat</span>
                    <span className="text-[10px] font-medium text-slate-400">Respond to customers</span>
                </Link>
                <Link href="/dashboard/commerce/products/new" className="flex flex-col p-4 bg-white border border-slate-200 rounded-2xl hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Storefront size={16} className="text-amber-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 mb-0.5">Add Product</span>
                    <span className="text-[10px] font-medium text-slate-400">For WhatsApp catalog</span>
                </Link>
            </div>

            {/* === STAT CARDS === */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    label="Total Contacts"
                    value={stats.contactsCount?.toLocaleString() ?? "0"}
                    icon={<Users size={18} />}
                    trend="+12% this week"
                    trendUp={true}
                    color="blue"
                />
                <StatCard
                    label="Messages Sent"
                    value={stats.messagesSent?.toLocaleString() ?? "0"}
                    icon={<MessageCircle size={18} />}
                    trend="High volume"
                    trendUp={true}
                    color="green"
                />
                <StatCard
                    label="Active Flows"
                    value={stats.activeFlows ?? 0}
                    icon={<Zap size={18} />}
                    trend="Running"
                    trendUp={true}
                    color="purple"
                />
                <StatCard
                    label="Revenue"
                    value={`₹${stats.totalRevenue?.toLocaleString() ?? "0"}`}
                    icon={<Wallet size={18} />}
                    trend="+8% monthly"
                    trendUp={true}
                    color="amber"
                />
            </div>

            {/* === ONBOARDING CHECKLIST === */}
            <div className="bg-gradient-to-br from-[#042F94] via-blue-800 to-indigo-900 rounded-2xl p-6 relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#27954D]/20 rounded-full -ml-20 -mb-20 blur-2xl"></div>

                <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <Target size={16} className="text-blue-300" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Onboarding Checklist</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-28 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#27954D] to-emerald-400 rounded-full transition-all duration-700"
                                    style={{ width: `${checklistProgress}%` }}
                                />
                            </div>
                            <span className="text-[11px] font-bold text-blue-200">{checklistProgress}%</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { label: "Connect WhatsApp", done: stats.wabaConnected, link: "/dashboard/settings" },
                            { label: "Create First Flow", done: stats.activeFlows > 0, link: "/dashboard/flows" },
                            { label: "Send First Campaign", done: stats.messagesSent > 0, link: "/dashboard/campaigns" },
                            { label: "Collect First Payment", done: stats.totalRevenue > 0, link: "/dashboard/orders" }
                        ].map((step, i) => (
                            <Link key={i} href={step.link}
                                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all group ${step.done
                                    ? 'bg-[#27954D]/20 border-[#27954D]/40 text-white'
                                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20 hover:text-white/70'
                                    }`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${step.done
                                    ? 'bg-[#27954D] shadow-sm shadow-green-400/30'
                                    : 'border-2 border-white/20'
                                    }`}>
                                    {step.done && <CheckCircle2 size={12} className="text-white" />}
                                </div>
                                <span className="text-xs font-semibold">{step.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* === MAIN GRID === */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Message Funnel */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                            <div className="w-7 h-7 rounded-lg bg-[#27954D]/10 flex items-center justify-center">
                                <BarChart3 size={15} className="text-[#27954D]" />
                            </div>
                            Message Funnel
                        </h3>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            LIVE
                        </span>
                    </div>
                    <div className="space-y-5">
                        <FunnelBar label="Sent" count={stats.funnel.sent} percent={100} icon={<Send size={13} />} color="#27954D" />
                        <FunnelBar label="Delivered" count={stats.funnel.delivered} percent={stats.funnel.sent ? (stats.funnel.delivered / stats.funnel.sent) * 100 : 0} icon={<CheckCircle2 size={13} />} color="#042F94" />
                        <FunnelBar label="Read" count={stats.funnel.read} percent={stats.funnel.delivered ? (stats.funnel.read / stats.funnel.delivered) * 100 : 0} icon={<Activity size={13} />} color="#7c3aed" />
                        <FunnelBar label="Replied" count={stats.funnel.replied} percent={stats.funnel.read ? (stats.funnel.replied / stats.funnel.read) * 100 : 0} icon={<TrendingUp size={13} />} color="#f59e0b" />
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                    {/* Revenue Potential */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 blur-2xl -mr-8 -mt-8 rounded-full"></div>
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Revenue Potential</h3>
                        <div className="mb-5 relative">
                            <span className="text-3xl font-black text-white">
                                ₹{stats.potentialRevenue?.toLocaleString() ?? "0"}
                            </span>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                Recover this monthly with <strong className="text-slate-200">Abandoned Cart Automation</strong>.
                            </p>
                        </div>
                        <Link href="/dashboard/flows"
                            className="flex items-center justify-between w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition-all hover:shadow-lg hover:shadow-blue-500/30">
                            Unlock Potential <ArrowRight size={13} />
                        </Link>
                    </div>

                    {/* Affiliate Partner */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <Star size={14} className="text-amber-600" />
                            </div>
                            <h3 className="text-[11px] font-black text-amber-900 uppercase tracking-widest">Partner Opportunity</h3>
                        </div>
                        <p className="text-xs text-amber-700 mb-4 font-medium leading-relaxed">
                            Refer 3 businesses and unlock <strong>25% recurring commission</strong>.
                        </p>
                        <Link href="/affiliate-partner"
                            className="inline-flex items-center gap-2 text-xs font-black text-amber-600 hover:text-amber-700 group transition-colors">
                            Learn More <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* === Recent Broadcasts === */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                        <div className="w-7 h-7 rounded-lg bg-[#27954D]/10 flex items-center justify-center">
                            <Send size={14} className="text-[#27954D]" />
                        </div>
                        Recent Broadcasts
                    </h3>
                    <Link href="/dashboard/campaigns" className="text-[#27954D] hover:text-emerald-700 transition-colors">
                        <ArrowUpRight size={18} />
                    </Link>
                </div>
                {stats.recentCampaigns?.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Clock size={22} className="text-slate-300" />
                        </div>
                        <p className="text-xs font-semibold text-slate-400">No campaigns yet</p>
                        <p className="text-xs text-slate-300 mt-1">Send your first broadcast to get started</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {stats.recentCampaigns.map((c: any) => (
                            <CampaignRow key={c.id} campaign={c} />
                        ))}
                    </div>
                )}
            </div>

            {/* === CTA Banner === */}
            <div className="relative bg-gradient-to-r from-[#042f94] via-blue-700 to-[#27954D] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden shadow-xl shadow-blue-200/40">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full -mr-40 -mt-40 blur-3xl"></div>
                </div>
                <div className="relative">
                    <h3 className="font-black text-xl text-white mb-1">Ready to grow your audience?</h3>
                    <p className="text-white/75 text-sm">Create an automated flow to engage customers 24/7</p>
                </div>
                <Link href="/dashboard/flows"
                    className="relative flex-shrink-0 bg-white text-[#042f94] font-bold text-sm px-6 py-3 rounded-xl hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all">
                    Build a Flow →
                </Link>
            </div>
        </div>
    );
}

/* =================== SUBCOMPONENTS =================== */

const colorMap = {
    blue: {
        bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
        border: "border-blue-100",
        icon: "bg-blue-100 text-blue-600",
        value: "text-blue-900",
        trend: "text-blue-500 bg-blue-50",
        glow: "hover:shadow-blue-100",
    },
    green: {
        bg: "bg-gradient-to-br from-emerald-50 to-green-50",
        border: "border-emerald-100",
        icon: "bg-emerald-100 text-emerald-600",
        value: "text-emerald-900",
        trend: "text-emerald-600 bg-emerald-50",
        glow: "hover:shadow-emerald-100",
    },
    purple: {
        bg: "bg-gradient-to-br from-violet-50 to-purple-50",
        border: "border-violet-100",
        icon: "bg-violet-100 text-violet-600",
        value: "text-violet-900",
        trend: "text-violet-500 bg-violet-50",
        glow: "hover:shadow-violet-100",
    },
    amber: {
        bg: "bg-gradient-to-br from-amber-50 to-orange-50",
        border: "border-amber-100",
        icon: "bg-amber-100 text-amber-600",
        value: "text-amber-900",
        trend: "text-amber-600 bg-amber-50",
        glow: "hover:shadow-amber-100",
    }
};

function StatCard({ label, value, icon, trend, trendUp, color = "green" }: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
    color?: keyof typeof colorMap;
}) {
    const c = colorMap[color];
    return (
        <div className={`${c.bg} border ${c.border} rounded-2xl p-5 transition-all duration-200 hover:shadow-md ${c.glow} hover:-translate-y-0.5 group`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon} shadow-sm group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${c.trend}`}>
                        {trendUp ? "↑" : "↓"} {trend}
                    </span>
                )}
            </div>
            <div className={`text-2xl font-black tracking-tight mb-1 ${c.value}`}>{value}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
        </div>
    );
}

function FunnelBar({ label, count, percent, icon, color }: {
    label: string;
    count: number;
    percent: number;
    icon: React.ReactNode;
    color: string;
}) {
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center text-white" style={{ background: color }}>
                        {icon}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{count?.toLocaleString()}</span>
                    <span className="text-xs text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded font-medium">{Math.round(percent)}%</span>
                </div>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${percent}%`, background: color }}
                />
            </div>
        </div>
    );
}

function CampaignRow({ campaign }: { campaign: any }) {
    const isComplete = campaign.status === 'COMPLETED';
    return (
        <div className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 transition-colors group">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isComplete ? 'bg-[#27954D]' : 'bg-blue-500 animate-pulse'}`} />
                <div>
                    <div className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-[#27954D] transition-colors">{campaign.name}</div>
                    <div className="text-[11px] text-slate-400" suppressHydrationWarning>{new Date(campaign.created_at).toLocaleDateString()}</div>
                </div>
            </div>
            <div className={`text-xs font-bold px-2 py-1 rounded-lg ${isComplete ? 'text-emerald-700 bg-emerald-50' : 'text-blue-600 bg-blue-50'}`}>
                {campaign.sent_count} sent
            </div>
        </div>
    );
}
