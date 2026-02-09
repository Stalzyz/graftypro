
"use client";

import { useState } from "react";
import {
    Activity,
    ShieldAlert,
    Search,
    Filter,
    ArrowRight,
    Database,
    User,
    Clock,
    Terminal,
    Lock,
    ExternalLink,
    AlertCircle,
    CheckCircle2
} from "lucide-react";

export default function SuperAdminAuditTrail() {
    const logs = [
        { id: "LOG-482", user: "Root Admin", action: "PLATFORM_CONFIG_SYNC", target: "Branding", time: "2 mins ago", status: "SUCCESS" },
        { id: "LOG-481", user: "SYSTEM", action: "DB_SCHEMA_MIGRATION", target: "PostgreSQL", time: "15 mins ago", status: "SUCCESS" },
        { id: "LOG-480", user: "Finance Admin", action: "INVOICE_GENERATION", target: "Tesla Motors", time: "1 hour ago", status: "SUCCESS" },
        { id: "LOG-479", user: "Unknown", action: "UNAUTHORIZED_LOGIN_ATTEMPT", target: "Admin Login", time: "2 hours ago", status: "CRITICAL" },
        { id: "LOG-478", user: "Root Admin", action: "MODULE_TOGGLE", target: "Commerce Hub", time: "3 hours ago", status: "SUCCESS" },
    ];

    return (
        <div className="max-w-7xl space-y-12 pb-20 font-sans">
            <header className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <Activity className="text-white" size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence Log</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Real-time audit trails, security heartbeat, and event telemetry.</p>
                </div>

                <div className="flex gap-4">
                    <button className="px-6 py-4 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                        <Filter size={14} />
                        Filter Streams
                    </button>
                    <button className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-rose-600 transition-all shadow-xl shadow-rose-200 active:scale-95 animate-pulse">
                        <ShieldAlert size={14} />
                        Active Security Incident
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <SecurityCard label="Security Standing" value="OPTIMIZED" icon={<Lock />} status="HEALTHY" color="green" />
                <SecurityCard label="Suspicious Events" value="1" icon={<ShieldAlert />} status="ACTION REQUIRED" color="orange" />
                <SecurityCard label="Database Sync" value="REAL-TIME" icon={<Database />} status="99.9% UPTIME" color="blue" />
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden border-t-4 border-t-slate-900">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-3">
                        <Terminal className="text-slate-400" size={18} />
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Live Event Stream</h2>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input
                            type="text"
                            placeholder="Search Logs, Actions, IDs..."
                            className="bg-white border-none rounded-2xl pl-10 pr-6 py-3 text-xs font-bold w-72 focus:ring-2 focus:ring-slate-100 shadow-sm transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol ID</th>
                                <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator</th>
                                <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation Details</th>
                                <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                                <th className="text-center px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="text-right px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-slate-200 group-hover:bg-slate-900 transition-colors rounded-full" />
                                            <span className="text-xs font-black text-slate-900 font-mono italic">{log.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2">
                                            <User className="text-slate-300" size={12} />
                                            <span className="text-xs font-bold text-slate-700">{log.user}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-black text-slate-900 tracking-tight">{log.action}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target: {log.target}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock size={12} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{log.time}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${log.status === 'SUCCESS' ? 'bg-[#27954D]/10 text-[#27954D]' : 'bg-rose-500/10 text-rose-500'}`}>
                                            {log.status === 'SUCCESS' ? <CheckCircle2 size={10} className="inline mr-1" /> : <AlertCircle size={10} className="inline mr-1" />}
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                                            <ArrowRight size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-slate-50/50 flex items-center justify-between border-t border-slate-50">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Activity size={12} className="text-[#27954D]" />
                            System Pulse: Stable
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Clock size={12} className="text-blue-500" />
                            Avg Latency: 42ms
                        </div>
                    </div>
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                        Download Security Audit Pack <ExternalLink size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function SecurityCard({ label, value, icon, status, color }: any) {
    const colorClasses: any = {
        green: "text-[#27954D] bg-[#27954D]/10",
        orange: "text-orange-500 bg-orange-500/10",
        blue: "text-blue-500 bg-blue-500/10",
    };

    return (
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-6 group hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${colorClasses[color]}`}>
                    {status}
                </div>
            </div>
            <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{label}</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
            </div>
        </div>
    );
}
