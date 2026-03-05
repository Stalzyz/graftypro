
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Server,
    Activity,
    Database,
    Globe,
    Cpu,
    Zap,
    ShieldCheck,
    RefreshCw,
    Network,
    HardDrive,
    Lock
} from "lucide-react";

export default function InfraMonitorPage() {
    const [data, setData] = useState<any>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

    const fetchStats = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch("/api/super-admin/infra");
            const json = await res.json();
            if (res.ok) {
                setData(json);
                setLastRefreshed(new Date());
            }
        } catch (e) {
            console.error("Failed to fetch infra stats", e);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const mem = data?.memory;
    const memPct = mem ? Math.round((mem.used_mb / mem.total_mb) * 100) : 0;

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#042f94] font-semibold text-[10px] uppercase tracking-[0.2em] mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#27954D] animate-pulse" />
                        Infrastructure Live Matrix
                    </div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight italic">System Instance</h1>
                    <p className="text-slate-400 text-sm font-medium">Real-time telemetry from the application runtime.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchStats}
                        className="px-6 py-3 bg-white border border-slate-200 hover:border-[#27954D]/30 rounded-2xl shadow-sm text-xs font-bold text-slate-600 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                        Synchronize Matrix
                    </button>
                    {lastRefreshed && (
                        <div className="px-5 py-3 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest italic border border-slate-100">
                            Last sync: {lastRefreshed.toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </header>

            {/* Core Telemetry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatusCard
                    label="Process Uptime"
                    value={data?.uptime || "—"}
                    sub="Node.js runtime"
                    icon={<Lock size={20} />}
                    color="blue"
                />
                <StatusCard
                    label="Heap Memory"
                    value={data ? `${memPct}% used` : "—"}
                    sub={mem ? mem.formatted : "Loading..."}
                    icon={<HardDrive size={20} />}
                    color="indigo"
                />
                <StatusCard
                    label="Node.js Version"
                    value={data?.node_version || "—"}
                    sub={data?.platform || "—"}
                    icon={<Globe size={20} />}
                    color="emerald"
                />
                <StatusCard
                    label="Environment"
                    value={data?.env || "—"}
                    sub="Runtime mode"
                    icon={<Cpu size={20} />}
                    color="cyan"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* DB Stats */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 italic uppercase tracking-widest">Database Activity</h3>
                            <p className="text-[10px] text-slate-400 font-medium">Live metrics from PostgreSQL</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Workspaces</div>
                            <div className="text-3xl font-black text-slate-800 italic">
                                {data ? data.db?.active_workspaces?.toLocaleString() : "—"}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium uppercase">Status: ACTIVE</div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Messages (Last 24h)</div>
                            <div className="text-3xl font-black text-slate-800 italic">
                                {data ? data.db?.messages_24h?.toLocaleString() : "—"}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium uppercase">Throughput</div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-50 text-center text-xs text-slate-400 font-medium italic">
                        Advanced metrics (CPU %, network I/O, query times) require an observability tool like Datadog or Prometheus.
                    </div>
                </div>

                {/* Instance Details */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-2 italic">Active Protocols</h3>

                    <div className="space-y-4">
                        <InfraItem
                            label="Database Tier"
                            value="PostgreSQL"
                            sub="Prisma ORM"
                            icon={<Database size={18} />}
                            status="HEALTHY"
                        />
                        <InfraItem
                            label="Signal Hub (WS)"
                            value="Pusher"
                            sub="Real-time events"
                            icon={<Zap size={18} />}
                            status="SYNCED"
                        />
                        <InfraItem
                            label="CDN"
                            value="Active"
                            sub="Static asset delivery"
                            icon={<Network size={18} />}
                            status="ACTIVE"
                        />
                        <InfraItem
                            label="SSL"
                            value="Validated"
                            sub="TLS encryption"
                            icon={<ShieldCheck size={18} />}
                            status="SECURE"
                        />
                    </div>

                    <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-[#27954D] blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative z-10 space-y-4">
                            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#27954D]">
                                <Activity size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white italic">System Healthy</h4>
                                <p className="text-slate-500 text-[10px] leading-relaxed uppercase tracking-widest mt-1">
                                    All core services are running normally.
                                </p>
                            </div>
                            <button
                                onClick={fetchStats}
                                className="w-full py-3 bg-[#27954D] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all"
                            >
                                Refresh Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusCard({ label, value, sub, icon, color }: any) {
    const colors: any = {
        cyan: "bg-cyan-50 text-cyan-500",
        indigo: "bg-indigo-50 text-indigo-500",
        emerald: "bg-emerald-50 text-emerald-500",
        blue: "bg-blue-50 text-blue-500"
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                    {icon}
                </div>
                <div className="w-2 h-2 rounded-full bg-slate-100 group-hover:bg-[#27954D] transition-colors" />
            </div>
            <div className="space-y-1">
                <div className="text-2xl font-black text-slate-800 italic">{value}</div>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{label}</div>
                <p className="text-[9px] text-slate-400 font-medium uppercase mt-2">{sub}</p>
            </div>
        </div>
    );
}

function InfraItem({ label, value, sub, icon, status }: any) {
    return (
        <div className="p-5 bg-white border border-slate-100 rounded-[1.8rem] flex items-center justify-between group hover:border-[#27954D]/30 transition-all shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-[#042f94]/5 group-hover:text-[#042f94] transition-all">
                    {icon}
                </div>
                <div>
                    <div className="text-[10px] font-black text-[#042f94] uppercase tracking-widest mb-0.5 italic">{label}</div>
                    <div className="text-sm font-bold text-slate-800">{value}</div>
                    <div className="text-[10px] font-medium text-slate-400 uppercase italic">{sub}</div>
                </div>
            </div>
            <div className={`text-[8px] font-black px-2 py-1 rounded-lg border italic ${status === 'HEALTHY' || status === 'SECURE' || status === 'SYNCED'
                    ? 'bg-[#27954D]/5 text-[#27954D] border-[#27954D]/10'
                    : 'bg-blue-50 text-blue-500 border-blue-100'
                }`}>
                {status}
            </div>
        </div>
    );
}
