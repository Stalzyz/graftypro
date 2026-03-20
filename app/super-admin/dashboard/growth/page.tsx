"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Zap, Users, MessageSquare, Send, Clock, AlertCircle,
    CheckCircle2, Loader2, Search, Filter, ArrowUpRight,
    TrendingUp, MousePointer2, Mail, Phone, ChevronRight
} from "lucide-react";
import { formatCurrency } from "../../../../lib/utils/number-format";

export default function GrowthWarRoom() {
    const [abandonedUsers, setAbandonedUsers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState<string | null>(null);
    const [messageStatus, setMessageStatus] = useState<{ id: string, status: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchGrowthData();
    }, []);

    const fetchGrowthData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/super-admin/growth/recovery");
            const data = await res.json();
            setAbandonedUsers(data.users || []);
            setStats(data.stats || null);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRecovery = async (userId: string, phone: string) => {
        if (!phone) return;
        setSending(userId);
        setMessageStatus(null);
        try {
            const res = await fetch("/api/super-admin/growth/recovery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, phone })
            });
            const result = await res.json();
            if (res.ok) {
                setMessageStatus({ id: userId, status: 'success', text: "Message Sent!" });
                fetchGrowthData(); // Refresh to update "last reached"
            } else {
                setMessageStatus({ id: userId, status: 'error', text: result.error || "Failed to send" });
            }
        } catch (e) {
            setMessageStatus({ id: userId, status: 'error', text: "Network Error" });
        } finally {
            setSending(null);
        }
    };

    if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading...</div>;

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Zap size={120} className="text-slate-900" />
                </div>
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <Zap className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Growth<span className="text-blue-600">.</span></h1>
                            <p className="text-slate-400 font-medium text-sm">Recover abandoned signups.</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex flex-wrap items-center gap-4">
                    <div className="px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Platform WABA: Active</span>
                    </div>
                </div>
            </header>

            <div className="flex justify-end gap-4 animate-up">
                <Link 
                    href="/super-admin/dashboard/growth/leads"
                    className="flex items-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all active:scale-95 shadow-2xl shadow-slate-200 group"
                >
                    <Users size={18} className="text-emerald-500 group-hover:scale-125 transition-transform" />
                    View Tool Leads Dashboard
                    <ArrowUpRight size={18} className="text-slate-400 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </Link>
            </div>

            {/* Growth KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <KPICard
                    label="Abandoned Leads"
                    value={stats?.total_abandoned || 0}
                    sub="Signups without Workspace"
                    icon={<Users className="text-blue-500" />}
                    trend="+5 today"
                />
                <KPICard
                    label="Potential ARR"
                    value={`₹${((stats?.total_abandoned || 0) * 3500 * 12).toLocaleString()}`}
                    sub="Based on Starter Plan"
                    icon={<TrendingUp className="text-green-500" />}
                    trend="Market Opportunity"
                />
                <KPICard
                    label="Reachout Rate"
                    value={`${stats?.reached_percentage || 0}%`}
                    sub="Leads Contacted"
                    icon={<MousePointer2 className="text-purple-500" />}
                    trend="Pipeline Intensity"
                />
                <KPICard
                    label="Recovery Rate"
                    value="12.4%"
                    sub="Converted to Vendors"
                    icon={<CheckCircle2 className="text-orange-500" />}
                    trend="Conversion target: 20%"
                />
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search abandoned users..."
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:border-slate-900 outline-none transition-all shadow-inner"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-3.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                                <th className="px-10 py-6">User Identity</th>
                                <th className="px-10 py-6">Signup Date</th>
                                <th className="px-10 py-6">Engagement Status</th>
                                <th className="px-10 py-6 text-right">Instant Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {abandonedUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/30 transition-all duration-300 group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900 font-black text-lg border border-slate-200 group-hover:scale-110 transition-transform">
                                                {user.name?.[0] || <Users size={20} />}
                                            </div>
                                            <div>
                                                <div className="text-base font-black text-slate-900 tracking-tight">{user.name || "Anonymous User"}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Mail size={12} className="text-slate-300" />
                                                    <span className="text-xs text-slate-400 font-bold">{user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">{new Date(user.created_at).toLocaleDateString()}</span>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-0.5">
                                                {Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60))} Hours Ago
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            {!user.last_reached_at ? (
                                                <div className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-2">
                                                    <Clock size={12} /> Pending Capture
                                                </div>
                                            ) : (
                                                <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
                                                    <Send size={12} /> Reached {new Date(user.last_reached_at).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {messageStatus && messageStatus.id === user.id && (
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${messageStatus.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                                    {messageStatus.text}
                                                </span>
                                            )}
                                            <button
                                                onClick={() => handleSendRecovery(user.id, user.phone || "")}
                                                disabled={sending === user.id || !user.phone}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-slate-200 ${!user.phone ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-blue-200'
                                                    }`}
                                            >
                                                {sending === user.id ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                                                {user.phone ? "Send Recovery WA" : "No Phone"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {abandonedUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-10 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 grayscale opacity-30">
                                            <Zap size={48} />
                                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Zero Abandonment Detected</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function KPICard({ label, value, sub, icon, trend }: any) {
    return (
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-4 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex items-start justify-between">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm">
                    {icon}
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{trend}</span>
                </div>
            </div>
            <div className="relative z-10 space-y-1">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">{value}</h3>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                    <span className="text-[11px] font-bold text-slate-300 italic">{sub}</span>
                </div>
            </div>
        </div>
    );
}
