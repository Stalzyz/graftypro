"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import {
    Users,
    MessageCircle,
    BarChart3,
    Zap,
    TrendingUp,
    ArrowUpRight,
    Send,
    CheckCircle2,
    Clock,
    Wallet,
    Activity,
    Trophy,
    ArrowRight,
    ShoppingBag
} from "lucide-react";
import WelcomeModal from "@/components/dashboard/WelcomeModal";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>({
        contactsCount: 0,
        messagesSent: 0,
        activeFlows: 0,
        totalRevenue: 0,
        funnel: { sent: 0, delivered: 0, read: 0, replied: 0 },
        recentCampaigns: []
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
                <div className="w-10 h-10 border-3 border-[#27954D] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium text-sm animate-pulse-soft">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 animate-fade-in relative">
            <WelcomeModal />

            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Welcome back 👋</h1>
                    <p className="text-gray-500 text-sm mt-1">Here's what's happening with your messaging today.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/commerce" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                        <ShoppingBag size={14} /> Commerce Dashboard
                    </Link>
                    <Link href="/dashboard/campaigns" className="btn-primary">
                        <Send size={16} /> New Broadcast
                    </Link>
                </div>
            </div>

            {/* PROGRESS TRACKER (Gamification) */}
            <div className="soft-card p-6 border-blue-100 bg-blue-50/30">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                        <Trophy size={16} className="text-blue-600" /> Onboarding Checklist
                    </h3>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        {Math.round(([stats.wabaConnected, stats.activeFlows > 0, stats.messagesSent > 0, stats.totalRevenue > 0].filter(Boolean).length / 4) * 100)}% Complete
                    </span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Connect WhatsApp", done: stats.wabaConnected, link: "/dashboard/settings" },
                        { label: "Create First Flow", done: stats.activeFlows > 0, link: "/dashboard/flows" },
                        { label: "Send First Campaign", done: stats.messagesSent > 0, link: "/dashboard/campaigns" },
                        { label: "Collect First Payment", done: stats.totalRevenue > 0, link: "/dashboard/orders" }
                    ].map((step, i) => (
                        <Link key={i} href={step.link} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${step.done ? 'bg-white border-green-100 text-green-700 font-bold' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'}`}>
                            {step.done ? <CheckCircle2 size={16} className="text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
                            <span className="text-xs">{step.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-5">
                        <StatCard
                            label="Total Contacts"
                            value={stats.contactsCount?.toLocaleString()}
                            icon={<Users size={20} />}
                            trend="+12% this week"
                        />
                        <StatCard
                            label="Messages Sent"
                            value={stats.messagesSent?.toLocaleString()}
                            icon={<MessageCircle size={20} />}
                            trend="High volume"
                        />
                        <StatCard
                            label="Active Flows"
                            value={stats.activeFlows}
                            icon={<Zap size={20} />}
                            trend="Running smoothly"
                        />
                        <StatCard
                            label="Revenue"
                            value={`₹${stats.totalRevenue?.toLocaleString()}`}
                            icon={<Wallet size={20} />}
                            trend="+8% vs last month"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* REVENUE POTENTIAL METER */}
                    <div className="soft-card p-6 bg-slate-900 border-slate-800 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/40 transition-all"></div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Revenue Potential</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-black">₹{stats.potentialRevenue?.toLocaleString()}</span>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">You could recover this amount monthly with <strong>Abandoned Cart Automation</strong>.</p>
                        </div>
                        <Link href="/dashboard/flows" className="flex items-center justify-between w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold transition-all">
                            Unlock Potential <ArrowRight size={14} />
                        </Link>
                    </div>

                    {/* Reseller Upsell */}
                    <div className="soft-card p-6 border-amber-100 bg-amber-50/30">
                        <h3 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-3">Reseller Opportunity</h3>
                        <p className="text-xs text-amber-700 mb-6 font-medium leading-relaxed">Refer 3 businesses and unlock <strong>25% recurring commission</strong>.</p>
                        <Link href="/landing/reseller" className="text-xs font-black text-amber-600 flex items-center gap-2 hover:gap-3 transition-all">
                            Learn More <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Conversion Funnel */}
                <div className="lg:col-span-2 soft-card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <BarChart3 size={18} className="text-[#27954D]" />
                            Message Funnel
                        </h3>
                        <span className="badge badge-success">Live</span>
                    </div>

                    <div className="space-y-6">
                        <FunnelBar
                            label="Sent"
                            count={stats.funnel.sent}
                            percent={100}
                            icon={<Send size={14} />}
                        />
                        <FunnelBar
                            label="Delivered"
                            count={stats.funnel.delivered}
                            percent={stats.funnel.sent ? (stats.funnel.delivered / stats.funnel.sent) * 100 : 0}
                            icon={<CheckCircle2 size={14} />}
                        />
                        <FunnelBar
                            label="Read"
                            count={stats.funnel.read}
                            percent={stats.funnel.delivered ? (stats.funnel.read / stats.funnel.delivered) * 100 : 0}
                            icon={<Activity size={14} />}
                        />
                        <FunnelBar
                            label="Replied"
                            count={stats.funnel.replied}
                            percent={stats.funnel.read ? (stats.funnel.replied / stats.funnel.read) * 100 : 0}
                            icon={<TrendingUp size={14} />}
                        />
                    </div>
                </div>

                {/* Recent Campaigns */}
                <div className="soft-card p-6">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="font-semibold text-gray-800 text-sm">Recent Broadcasts</h3>
                        <Link href="/dashboard/campaigns" className="text-[#27954D] hover:opacity-80 transition-opacity">
                            <ArrowUpRight size={18} />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {stats.recentCampaigns?.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <Clock size={28} className="mx-auto mb-3 opacity-30" />
                                <p className="text-xs font-medium">No campaigns yet</p>
                            </div>
                        ) : (
                            stats.recentCampaigns.map((c: any) => (
                                <CampaignRow key={c.id} campaign={c} />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Action Banner */}
            <div className="bg-gradient-to-r from-[#042f94] to-[#27954D] rounded-2xl p-6 flex items-center justify-between text-white shadow-lg shadow-green-200/30">
                <div>
                    <h3 className="font-bold text-lg">Ready to grow your audience?</h3>
                    <p className="text-white/80 text-sm mt-1">Create an automated flow to engage customers 24/7</p>
                </div>
                <Link
                    href="/dashboard/flows"
                    className="bg-white text-[#042f94] px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
                >
                    Build Flow
                </Link>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, trend }: { label: string; value: string | number; icon: React.ReactNode; trend?: string }) {
    return (
        <div className="stat-card">
            <div className="flex justify-between items-start mb-4">
                <div className="stat-icon">
                    {icon}
                </div>
                {trend && <span className="text-[10px] font-medium text-gray-400">{trend}</span>}
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label mt-1">{label}</div>
        </div>
    );
}

function FunnelBar({ label, count, percent, icon }: { label: string; count: number; percent: number; icon: React.ReactNode }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#27954D]/10 text-[#27954D] flex items-center justify-center">
                        {icon}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
                <div className="text-right">
                    <span className="text-sm font-semibold text-gray-800">{count?.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 ml-2">{Math.round(percent)}%</span>
                </div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-[#27954D] to-[#042f94] rounded-full transition-all duration-700"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

function CampaignRow({ campaign }: { campaign: any }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 hover:bg-[#27954D]/5 transition-colors">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${campaign.status === 'COMPLETED' ? 'bg-[#27954D]' : 'bg-blue-500 animate-pulse'}`} />
                <div>
                    <div className="text-sm font-medium text-gray-800 line-clamp-1">{campaign.name}</div>
                    <div className="text-[10px] text-gray-400">{new Date(campaign.created_at).toLocaleDateString()}</div>
                </div>
            </div>
            <div className="text-xs font-medium text-[#27954D]">{campaign.sent_count} sent</div>
        </div>
    );
}
