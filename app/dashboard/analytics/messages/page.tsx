"use client";

import { useState, useEffect } from "react";
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    Search,
    RefreshCw,
    TrendingDown,
    TrendingUp,
    ShieldAlert
} from "lucide-react";
import { format } from "date-fns";

export default function MessageIntelligencePage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/analytics/delivery");
            const result = await res.json();
            if (res.ok) setData(result);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[50vh]">
                <RefreshCw className="animate-spin text-[#27954D] w-10 h-10 mb-4" />
                <p className="text-sm font-medium text-slate-500">Compiling Delivery Intelligence...</p>
            </div>
        );
    }

    if (!data) {
        return <div>Failed to load intelligence data.</div>;
    }

    const { overview, templates, recentFailures } = data;
    const isHealthy = Number(overview.successRate) > 90;

    const filteredFailures = recentFailures?.filter((f: any) =>
        f.phone.includes(searchTerm) || f.error.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Delivery Intelligence</h1>
                    <p className="text-slate-500 mt-1">Smart delivery monitoring and message failure detection.</p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-xs uppercase"
                >
                    <RefreshCw size={14} /> Refresh Data
                </button>
            </div>

            {/* Health Alert Bar */}
            {!isHealthy && overview.totalAttempts > 50 && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-700 shadow-sm animate-pulse-slow">
                    <ShieldAlert size={24} className="shrink-0" />
                    <div>
                        <h3 className="font-bold text-sm text-red-800">Delivery Warning: Quality Drop Detected</h3>
                        <p className="text-xs font-medium mt-0.5">Your delivery rate is extremely low ({overview.successRate}%). Please check your recent broadcast targets or template quality to avoid Meta account suspension.</p>
                    </div>
                </div>
            )}

            {/* Top Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Processed"
                    value={overview.totalAttempts}
                    icon={<Activity size={20} className="text-blue-500" />}
                    bg="bg-blue-50"
                />
                <StatCard
                    title="Successfully Delivered"
                    value={overview.delivered}
                    icon={<CheckCircle size={20} className="text-green-500" />}
                    bg="bg-green-50"
                />
                <StatCard
                    title="Delivery Rate"
                    value={`${overview.successRate}%`}
                    icon={Number(overview.successRate) > 90 ? <TrendingUp size={20} className="text-green-500" /> : <TrendingDown size={20} className="text-orange-500" />}
                    bg="bg-slate-50"
                    danger={Number(overview.successRate) < 85 && overview.totalAttempts > 50}
                />
                <StatCard
                    title="Total Failures"
                    value={overview.failed}
                    icon={<AlertTriangle size={20} className="text-red-500" />}
                    bg="bg-red-50"
                    danger={overview.failed > 0}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Template Performance Monitor */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        Template Performance Monitor
                    </h2>
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <div className="col-span-5">Template Name</div>
                            <div className="col-span-2 text-center">Volume</div>
                            <div className="col-span-3 text-center">Failed</div>
                            <div className="col-span-2 text-right">Success %</div>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                            {templates?.length === 0 && (
                                <div className="p-8 text-center text-slate-400 font-medium text-sm">No template data recorded yet.</div>
                            )}
                            {templates?.map((t: any, i: number) => (
                                <div key={i} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors">
                                    <div className="col-span-5 font-bold text-slate-700 truncate">{t.name}</div>
                                    <div className="col-span-2 text-center text-sm font-semibold text-slate-600">{t.total}</div>
                                    <div className="col-span-3">
                                        {t.failed > 0 ? (
                                            <div className="mx-auto w-max px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100 flex items-center gap-1.5"><AlertTriangle size={12} /> {t.failed}</div>
                                        ) : (
                                            <div className="mx-auto w-max px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold border border-green-100">0</div>
                                        )}
                                    </div>
                                    <div className="col-span-2 text-right font-bold">
                                        <span className={Number(t.deliveryRate) > 90 ? "text-green-600" : "text-red-500"}>{t.deliveryRate}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quality Score Box */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800">Connection Health</h2>
                    <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden h-[400px] flex flex-col justify-center items-center text-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#27954D] blur-[100px] opacity-20 rounded-full" />
                        <div className="absolute bottom-0 text-amber-500 blur-[80px] opacity-20 w-32 h-32 rounded-full" />

                        <div className="relative z-10 space-y-6">
                            <div className="w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center border-emerald-500 bg-slate-800 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                <div className="text-4xl font-bold text-emerald-400">{overview.successRate}%</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">Health Score</div>
                                <p className="text-slate-400 text-sm mt-2 max-w-[200px] mx-auto">
                                    Your number's delivery reputation looks solid. Keep monitoring bounce rates.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Smart Failure Log */}
            <div className="space-y-4 pt-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    Message Failure Log
                </h2>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center">
                        <div className="relative flex-1 max-w-sm">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by number or error..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#27954D] transition-all font-semibold"
                            />
                        </div>
                    </div>

                    <div className="min-w-full divide-y divide-slate-100 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400">
                                    <th className="p-4 font-bold border-b border-slate-100 pl-6">Time</th>
                                    <th className="p-4 font-bold border-b border-slate-100">Phone Number</th>
                                    <th className="p-4 font-bold border-b border-slate-100">Template / Context</th>
                                    <th className="p-4 font-bold border-b border-slate-100">Smart Reason</th>
                                    <th className="p-4 font-bold border-b border-slate-100 pr-6">Meta Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFailures?.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500 font-medium text-sm">
                                            Perfect! No recent failures found.
                                        </td>
                                    </tr>
                                )}
                                {filteredFailures?.map((fail: any) => (
                                    <tr key={fail.id} className="hover:bg-red-50/30 transition-colors group">
                                        <td className="p-4 text-xs font-semibold text-slate-500 whitespace-nowrap pl-6">
                                            {format(new Date(fail.time), "MMM d, h:mm a")}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-slate-700 font-mono whitespace-nowrap">
                                            +{fail.phone}
                                        </td>
                                        <td className="p-4 text-sm font-semibold text-slate-600 truncate max-w-[200px]" title={fail.template}>
                                            {fail.template}
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100 truncate max-w-[300px]" title={fail.error}>
                                                <AlertTriangle size={12} /> {fail.error}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs font-bold text-slate-400 pr-6">
                                            {fail.code}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
}

function StatCard({ title, value, icon, bg, danger = false }: any) {
    return (
        <div className={`p-6 rounded-3xl border ${danger ? 'border-red-200 bg-red-50/50 shadow-sm' : 'border-slate-200 bg-white shadow-sm'} flex items-start justify-between relative overflow-hidden group`}>
            <div className="z-10 relative">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{title}</h3>
                <div className={`text-4xl font-extrabold tracking-tight ${danger ? 'text-red-600' : 'text-slate-800'}`}>{value}</div>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} z-10 relative group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
        </div>
    );
}
