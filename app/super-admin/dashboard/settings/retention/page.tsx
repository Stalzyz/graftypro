
"use client";

import { useState } from "react";
import { History, Database, HardDrive, ShieldAlert, Save, RefreshCcw, Download, Trash2, Calendar } from "lucide-react";

export default function AuditRetentionPolicy() {
    const [retention, setRetention] = useState({
        systemLogs: "90",
        messageArchive: "365",
        auditTrail: "PERMANENT",
        storageUsage: "42.8 GB"
    });

    const logs = [
        { id: 1, type: "WABA Events", count: "4.2M", size: "12.4 GB", lastPurged: "Yesterday" },
        { id: 2, type: "API Requests", count: "12.8M", size: "28.1 GB", lastPurged: "10-MAR-2024" },
        { id: 3, type: "Auth Logs", count: "84K", size: "120 MB", lastPurged: "Never" },
    ];

    return (
        <div className="max-w-7xl space-y-12 pb-20 font-sans">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-slate-500 font-semibold text-[10px] uppercase tracking-[0.2em] mb-3">
                        <History size={14} />
                        Data Lifecycle Management
                    </div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight italic">Audit & Retention</h1>
                    <p className="text-slate-400 text-sm font-medium">Define global data persistence protocols and archival schedules.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-4 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={14} /> Export Global Audit
                    </button>
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200">
                        <Save size={14} /> Deploy Policy
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[48px] border border-slate-100 p-10 space-y-10 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                                <Database className="text-blue-600" size={24} /> Persistence Configuration
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <RetentionSelect
                                label="System Logs"
                                description="Error logs, debug traces, and system events."
                                value={retention.systemLogs}
                            />
                            <RetentionSelect
                                label="Message Archive"
                                description="Individual WhatsApp message content logs."
                                value={retention.messageArchive}
                            />
                            <RetentionSelect
                                label="Audit Trail"
                                description="Admin actions and security modifications."
                                value={retention.auditTrail}
                                disabled
                            />
                            <div className="p-8 bg-slate-50 rounded-[40px] flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Footprint</span>
                                    <div className="text-2xl font-black text-slate-900">{retention.storageUsage}</div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl text-slate-400">
                                    <HardDrive size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[48px] border border-slate-100 overflow-hidden shadow-sm">
                        <div className="p-8 bg-slate-50/50 border-b border-slate-50">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Active Table Distributions</h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {logs.map((log) => (
                                <div key={log.id} className="p-8 flex items-center justify-between group hover:bg-slate-50 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-slate-900">{log.type}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                {log.count} Records • {log.size}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right mr-4">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block">Last Purge</span>
                                            <span className="text-xs font-bold text-slate-600">{log.lastPurged}</span>
                                        </div>
                                        <button className="p-4 bg-red-50 text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="p-10 bg-slate-900 rounded-[48px] text-white space-y-8 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/20 blur-[60px] group-hover:bg-red-600/40 transition-all duration-700" />
                        <div className="flex items-center gap-4">
                            <ShieldAlert size={28} className="text-red-500" />
                            <h2 className="text-xl font-black italic tracking-tight">Archival Rules</h2>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">Archived data is moved to Cold Storage (S3 Glacier) automatically. Retrieval may take up to 24 hours.</p>
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Auto Archival</span>
                                <div className="w-10 h-5 bg-green-500 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Archive Frequency</span>
                                <span className="text-xs font-black">Monthly</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-zinc-50 rounded-[40px] border border-zinc-200/50">
                        <div className="flex items-center gap-3 mb-4">
                            <RefreshCcw size={16} className="text-slate-400" />
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto-Cleanup Engine</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium italic">
                            System will automatically prune logs older than the defined retention period at 02:00 AM UTC every Sunday.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RetentionSelect({ label, description, value, disabled = false }: any) {
    return (
        <div className="space-y-4">
            <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</label>
                <p className="text-[11px] text-slate-400 font-medium leading-tight">{description}</p>
            </div>
            <select
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all appearance-none disabled:opacity-50"
                value={value}
                disabled={disabled}
                onChange={() => { }}
            >
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="180">180 Days</option>
                <option value="365">1 Year</option>
                <option value="PERMANENT">Permanent (Legal Hold)</option>
            </select>
        </div>
    );
}
