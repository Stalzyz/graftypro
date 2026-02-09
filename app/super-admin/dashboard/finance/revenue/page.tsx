
"use client";

import { useState } from "react";
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
    DollarSign,
    Target
} from "lucide-react";

export default function RevenueAnalytics() {
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

                <div className="flex gap-4">
                    <button className="px-6 py-4 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                        <Calendar size={14} />
                        Last 30 Days
                    </button>
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95">
                        <Download size={14} />
                        Export Report
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <InsightCard label="Monthly Recurring Revenue" value="₹12.4L" growth="+14.2%" trend="up" icon={<DollarSign />} />
                <InsightCard label="Total Active Subscriptions" value="1,240" growth="+8.5%" trend="up" icon={<Users />} />
                <InsightCard label="Credit Consumption" value="₹4.8L" growth="-2.1%" trend="down" icon={<Activity />} />
                <InsightCard label="LTV Average" value="₹18.5K" growth="+5.0%" trend="up" icon={<Target />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Revenue Graph Placeholder */}
                <div className="lg:col-span-8 bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm space-y-8 h-[500px] flex flex-col">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="text-blue-500" size={18} />
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Revenue Trajectory</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 mr-6">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subscription</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Credits</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent" />
                        <div className="text-center space-y-2 relative z-10 transition-transform group-hover:scale-110 duration-700">
                            <BarChart3 className="mx-auto text-slate-200" size={64} />
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Live Visualization Engine Initializing...</p>
                        </div>
                    </div>
                </div>

                {/* Growth Distribution */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-slate-900 rounded-[40px] p-10 text-white space-y-10 shadow-2xl overflow-hidden relative group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-600/20 blur-[80px]" />

                        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                            <PieChart className="text-emerald-400" size={18} />
                            <h2 className="text-xs font-black uppercase tracking-widest">Yield Distribution</h2>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <ProgressRow label="Starter Core" value="35%" color="bg-emerald-400" />
                            <ProgressRow label="Enterprise Growth" value="45%" color="bg-blue-400" />
                            <ProgressRow label="White Label P" value="20%" color="bg-purple-400" />
                        </div>

                        <button className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all group/btn">
                            Detailed Breakdown <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={14} />
                        </button>
                    </section>

                    <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                            <BarChart3 className="text-slate-400" size={18} />
                            <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                                Top Revenue Nodes
                            </h2>
                        </div>

                        <div className="space-y-6">
                            <TopNode name="Z-Corp Africa" revenue="₹4.2L" />
                            <TopNode name="Stark Industries" revenue="₹3.8L" />
                            <TopNode name="Wayne Ent" revenue="₹2.9L" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InsightCard({ label, value, growth, trend, icon }: any) {
    return (
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 group">
            <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tight ${trend === 'up' ? 'text-[#27954D]' : 'text-rose-500'}`}>
                    {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {growth}
                </div>
            </div>
            <div>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
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

function TopNode({ name, revenue }: any) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-500 transition-colors" />
                <span className="text-xs font-bold text-slate-700">{name}</span>
            </div>
            <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">{revenue}</span>
        </div>
    );
}
