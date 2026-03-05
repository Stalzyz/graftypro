"use client";

import { useEffect, useState } from "react";
import {
    Users,
    Zap,
    Target,
    CreditCard,
    TrendingUp,
    ArrowRight,
    Plus,
    LayoutDashboard,
    FileText,
    BarChart3,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";

export default function EducationDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/education/analytics")
            .then(res => res.json())
            .then(data => {
                if (data.success) setStats(data.stats);
                setLoading(false);
            });
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded">EduTech CRM</div>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">
                        Lead → Admission <span className="text-blue-600">Machine</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Turbocharge your institute revenue with automated WhatsApp follow-ups.</p>
                </div>

                <div className="flex gap-3">
                    <Link
                        href="/dashboard/education/forms"
                        className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <FileText size={18} /> Lead Forms
                    </Link>
                    <Link
                        href="/dashboard/education/leads"
                        className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:scale-105 transition-all shadow-xl shadow-slate-200"
                    >
                        <Plus size={18} /> Add Lead
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Leads"
                    value={loading ? "..." : stats?.totalLeads}
                    sub="Lifetime Pipeline"
                    icon={<Users className="text-blue-600" size={24} />}
                    trend="+12%"
                />
                <StatCard
                    label="Conversion Rate"
                    value={loading ? "..." : `${stats?.conversionRate}%`}
                    sub="Inquiry to Admission"
                    icon={<Target className="text-emerald-600" size={24} />}
                    trend="+1.2%"
                />
                <StatCard
                    label="Enrollments"
                    value={loading ? "..." : stats?.enrolledLeads}
                    sub="Confirmed Admissions"
                    icon={<Plus className="text-indigo-600" size={24} />}
                    trend="+5"
                />
                <StatCard
                    label="Revenue (Est.)"
                    value={loading ? "..." : `₹${stats?.totalRevenue?.toLocaleString()}`}
                    sub="WhatsApp Attributed"
                    icon={<CreditCard className="text-amber-600" size={24} />}
                    trend="ROI Focused"
                />
            </div>

            {/* Large CTA Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Pipeline Summary Card */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-100/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>

                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Live Admission Pipeline</h3>
                            <p className="text-slate-500 font-medium mb-8">Manage your students from inquiry to payment in one visual board.</p>

                            <div className="grid grid-cols-3 gap-4 mb-10">
                                <PipelineMiniStat label="New Inquiries" count={stats?.statusBreakdown?.find((s: any) => s.status === 'NEW')?._count || 0} color="blue" />
                                <PipelineMiniStat label="Follow-ups" count={stats?.statusBreakdown?.find((s: any) => s.status === 'FOLLOW_UP')?._count || 0} color="amber" />
                                <PipelineMiniStat label="Ready to Pay" count={stats?.statusBreakdown?.find((s: any) => s.status === 'PAYMENT_PENDING')?._count || 0} color="emerald" />
                            </div>

                            <Link
                                href="/dashboard/education/leads"
                                className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-3xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 group"
                            >
                                Open Kanban Pipeline <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Automation Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FeatureCard
                            title="Instant Follow-up"
                            desc="Send course brochure & fee structure the second they inquire."
                            icon={<Zap className="text-yellow-500" />}
                            active={true}
                        />
                        <FeatureCard
                            title="Payment Reminders"
                            desc="Auto-send Razorpay/Stripe links to students in 'Payment Pending'."
                            icon={<CreditCard className="text-emerald-500" />}
                            active={true}
                        />
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl">
                        <h4 className="text-lg font-black mb-6 flex items-center gap-2">
                            <BarChart3 size={20} className="text-blue-400" /> Lead Sources
                        </h4>
                        <div className="space-y-4">
                            {stats?.sourceBreakdown?.map((src: any) => (
                                <div key={src.lead_source} className="group cursor-pointer">
                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                        <span>{src.lead_source || "Direct/Unknown"}</span>
                                        <span className="text-white">{src._count} leads</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full group-hover:bg-blue-400 transition-all"
                                            style={{ width: `${Math.min(100, (src._count / (stats.totalLeads || 1)) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            {(!stats?.sourceBreakdown || stats?.sourceBreakdown?.length === 0) && (
                                <p className="text-xs text-slate-500 italic">No lead data yet.</p>
                            )}
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-800">
                            <p className="text-xs text-slate-500 font-bold mb-4">OPTIMIZATION TIP</p>
                            <p className="text-sm text-slate-300 font-medium leading-relaxed">
                                Your <span className="text-blue-400">WhatsApp Flows</span> have the highest conversion rate. Increase budget on these forms.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-lg">
                        <h4 className="font-black text-slate-900 mb-4 tracking-tight">Need Help?</h4>
                        <div className="flex gap-4 items-center group cursor-pointer">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <LayoutDashboard size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">Setup Guide</p>
                                <p className="text-xs text-slate-500 font-medium">Follow 5 steps to convert.</p>
                            </div>
                            <ArrowUpRight size={16} className="ml-auto text-slate-300 group-hover:text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, sub, icon, trend }: any) {
    return (
        <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-100/50 transition-all group overflow-hidden relative">
            <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:scale-150 transition-transform duration-700">
                {icon}
            </div>
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>
                <div className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-lg">
                    {trend}
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{value}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-[10px] text-slate-300 font-bold">{sub}</p>
            </div>
        </div>
    );
}

function PipelineMiniStat({ label, count, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100"
    };
    return (
        <div className={`p-4 rounded-2xl border ${colors[color]} text-center`}>
            <p className="text-2xl font-black mb-1">{count}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</p>
        </div>
    );
}

function FeatureCard({ title, desc, icon, active }: any) {
    return (
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] flex items-start gap-4 hover:shadow-lg transition-shadow">
            <div className="p-3 bg-slate-50 rounded-2xl shrink-0">
                {icon}
            </div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-black text-slate-900 tracking-tight">{title}</h4>
                    {active && <span className="w-1 h-1 rounded-full bg-green-500" />}
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
