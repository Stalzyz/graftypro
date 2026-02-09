"use client";

import { useState, useEffect } from "react";
import {
    Users,
    GraduationCap,
    Target,
    TrendingUp,
    MessageSquare,
    Search,
    Plus,
    Filter,
    ArrowRight,
    DollarSign,
    CheckCircle2,
    Clock,
    Zap
} from "lucide-react";
import Link from "next/link";

export default function EducationDashboard() {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<any>({
        totalLeads: 0,
        enrolledCount: 0,
        conversionRate: 0,
        revenue: 0,
        pendingPayment: 0,
        courseBreakdown: []
    });

    useEffect(() => {
        fetch("/api/edu/analytics")
            .then(res => res.json())
            .then(data => {
                setAnalytics(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admission Conversion Engine</h1>
                    <p className="text-slate-500 font-medium">Capture leads, automate follow-ups, and track enrollment revenue.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/education/leads" className="bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                        View Pipeline
                    </Link>
                    <Link href="/dashboard/education/forms" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-black hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200">
                        <Plus size={18} /> Create Lead Form
                    </Link>
                </div>
            </div>

            {/* Growth Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <EduStatCard
                    label="Total Leads"
                    value={analytics.totalLeads}
                    icon={<Users className="text-blue-600" />}
                    trend="+18% this month"
                />
                <EduStatCard
                    label="Admission Rev"
                    value={`₹${analytics.revenue.toLocaleString()}`}
                    icon={<DollarSign className="text-green-600" />}
                    trend="ROI Positive"
                />
                <EduStatCard
                    label="Conversion Rate"
                    value={`${analytics.conversionRate}%`}
                    icon={<Target className="text-purple-600" />}
                    trend="Above Avg (12%)"
                />
                <EduStatCard
                    label="Pending Py"
                    value={analytics.pendingPayment}
                    icon={<Clock className="text-amber-600" />}
                    trend="Needs Urgency Nudge"
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* REVENUE POTENTIAL METER (Edu Version) */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-10 bg-slate-900 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
                        <div className="relative z-10">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Edu Conversion Insight</h3>
                            <div className="flex items-center gap-10">
                                <div>
                                    <span className="text-6xl font-black">₹{(analytics.pendingPayment * 15000).toLocaleString()}</span>
                                    <p className="text-slate-400 mt-4 text-sm max-w-xs">
                                        Potential revenue from <strong>{analytics.pendingPayment}</strong> leads in "Payment Pending" stage.
                                        Trigger a discount nudge now?
                                    </p>
                                </div>
                                <div className="flex-1 max-w-xs space-y-4">
                                    <button className="w-full py-4 bg-blue-600 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                        Trigger Urgency Drip <MessageSquare size={16} />
                                    </button>
                                    <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all">
                                        Book Counselor Call
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Course Performance Breakdown */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-900">Course Performance</h3>
                            <button className="text-xs font-black text-blue-600 uppercase tracking-widest">Full Report</button>
                        </div>
                        <div className="glass-card p-8 space-y-6">
                            {analytics.courseBreakdown?.length > 0 ? (
                                analytics.courseBreakdown.map((cb: any) => (
                                    <div key={cb.course_interested} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm font-bold text-slate-700">{cb.course_interested || "Unspecified Course"}</span>
                                            <span className="text-xs font-black text-slate-400">{cb._count.id} Leads</span>
                                        </div>
                                        <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${(cb._count.id / (analytics.totalLeads || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No course data yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-black text-slate-900">Quick Setup Assets</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <TemplateActionCard
                                title="Admission Inquiry Flow"
                                desc="Auto-capture name, parent info and grade from WhatsApp."
                                status="Ready"
                            />
                            <TemplateActionCard
                                title="Demo Class Sequence"
                                desc="Send automated reminders 2h and 10m before demo."
                                status="Ready"
                            />
                        </div>
                    </div>
                </div>

                {/* Lead Aging Panel */}
                <div className="space-y-6">
                    <div className="glass-card p-6 border-amber-100 bg-amber-50/20">
                        <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-widest mb-4">
                            <Clock size={14} className="text-amber-600" /> Lead Aging Warning
                        </div>
                        <p className="text-sm text-amber-700 font-medium mb-6">
                            You have <strong>12 leads</strong> stuck in "Contacted" for more than 48 hours.
                        </p>
                        <button className="w-full py-3 bg-amber-600 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-200">
                            Bulk Re-engage (Discount Offer)
                        </button>
                    </div>

                    <div className="soft-card p-6">
                        <h4 className="text-sm font-black mb-4 flex items-center gap-2 text-slate-800">
                            <CheckCircle2 size={16} className="text-green-500" /> Recent Enrolled
                        </h4>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Student Name {i}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">IIT-JEE Fastrack Batch</p>
                                    </div>
                                    <span className="text-xs font-black text-green-600">+₹15,000</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50">
                            Download Audit Report
                        </button>
                    </div>
                </div>
            </div>

            {/* GETTING STARTED / INSTRUCTIONS */}
            <div className="space-y-4 pt-12 border-t border-slate-100 mt-12">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Zap size={20} className="text-amber-500 fill-amber-500" /> Getting Started: Your Admission Workflow
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InstructionStep
                        step="01"
                        title="Capture Leads"
                        desc="Create a Lead Form or sync a Meta Flow ID. Use the 'Inquiry' template to start capturing parent & student data."
                        link="/dashboard/education/meta-flows"
                    />
                    <InstructionStep
                        step="02"
                        title="Auto-Followup"
                        desc="The system automatically sends brochures & demo reminders based on lead status. Customize these in Automated Sequences."
                        link="/dashboard/drips"
                    />
                    <InstructionStep
                        step="03"
                        title="Manage Pipeline"
                        desc="Drag leads across the Kanban board. When a student is ready, hit 'Collect Payment' to generate a Razorpay link."
                        link="/dashboard/education/leads"
                    />
                    <InstructionStep
                        step="04"
                        title="Scale Growth"
                        desc="Use Bulk Broadcasts to re-engage dead leads or announce new batches to specific course interest groups."
                        link="/dashboard/education/broadcast"
                    />
                </div>
            </div>
        </div>
    );
}

function InstructionStep({ step, title, desc, link }: any) {
    return (
        <Link href={link} className="soft-card p-6 bg-white hover:border-blue-500 transition-all group flex flex-col h-full">
            <span className="text-4xl font-black text-slate-100 group-hover:text-blue-50 transition-colors mb-4 block tracking-tighter">{step}</span>
            <h4 className="font-bold text-slate-900 mb-2">{title}</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 flex-1">{desc}</p>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                Configure Module <ArrowRight size={12} />
            </span>
        </Link>
    );
}

function EduStatCard({ label, value, icon, trend }: any) {
    return (
        <div className="soft-card p-6 hover:shadow-xl transition-all cursor-default">
            <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                    {icon}
                </div>
                <span className="text-[10px] font-bold text-slate-400">{trend}</span>
            </div>
            <div className="space-y-1">
                <h4 className="text-2xl font-black text-slate-900">{value}</h4>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
            </div>
        </div>
    );
}

function TemplateActionCard({ title, desc, status }: any) {
    return (
        <div className="soft-card p-6 group hover:border-blue-500 transition-all">
            <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{title}</h4>
                <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{status}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">{desc}</p>
            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                Activate Module <ArrowRight size={12} />
            </button>
        </div>
    );
}
