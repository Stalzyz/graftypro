"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Activity,
    ShieldAlert,
    CheckCircle,
    AlertTriangle,
    Globe,
    Search,
    Filter,
    ArrowRight,
    ArrowLeft,
    RefreshCw,
    ShieldCheck,
    Lock
} from "lucide-react";

export default function SuperAdminIntegrationsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/super-admin/integrations");
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = data?.integrations?.filter((i: any) =>
        i.workspace?.name?.toLowerCase().includes(search.toLowerCase()) ||
        i.phone_number?.includes(search) ||
        i.waba_id?.includes(search)
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-[#27954D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-medium tracking-wide">Scanning Network Nodes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-7xl mx-auto space-y-12 pb-20">
            {/* Executive Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <Link href="/super-admin/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-[#042f94] font-semibold text-[10px] uppercase tracking-[0.2em] mb-3 transition-colors">
                        <ArrowLeft size={14} /> Back to Command Tower
                    </Link>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight">Cloud Integrations</h1>
                    <p className="text-slate-400 text-sm font-medium">Monitoring global Meta Cloud API health and security compliance.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group w-64 lg:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#27954D] transition-colors" size={16} strokeWidth={2} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by WABA ID, Phone or Workspace..."
                            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-3 text-xs font-medium outline-none focus:border-[#27954D]/30 focus:shadow-lg focus:shadow-green-900/5 transition-all"
                        />
                    </div>
                    <button onClick={fetchData} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-[#27954D] hover:border-[#27954D]/30 transition-all shadow-sm">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </header>

            {/* Network Health Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-7">
                <SummaryCard label="Total Nodes" value={data?.summary?.total || 0} icon={<Globe size={20} />} color="slate" />
                <SummaryCard label="Healthy Status" value={data?.summary?.healthy || 0} icon={<CheckCircle size={20} />} color="green" />
                <SummaryCard label="Critical Issues" value={data?.summary?.critical || 0} icon={<ShieldAlert size={20} />} color="red" />
                <SummaryCard label="Auto-Suspended" value={data?.summary?.suspended || 0} icon={<Lock size={20} />} color="amber" />
            </div>

            {/* Registry Table */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm shadow-slate-200/20">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-bold uppercase tracking-[0.15em]">
                            <th className="px-8 py-5">Workspace & Identity</th>
                            <th className="px-8 py-5">Integration State</th>
                            <th className="px-8 py-5">Health Status</th>
                            <th className="px-8 py-5">Security Protocol</th>
                            <th className="px-8 py-5 text-right pr-10">Analytics</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered?.map((acc: any) => (
                            <tr key={acc.id} className="hover:bg-slate-50/50 transition-all group">
                                <td className="px-8 py-6">
                                    <div className="font-semibold text-slate-700 text-sm group-hover:text-[#042f94] transition-colors">{acc.workspace?.name}</div>
                                    <div className="text-[10px] text-slate-300 font-medium mt-1 uppercase tracking-widest flex items-center gap-2">
                                        <span>+{acc.phone_number}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                        <span>ID: {acc.phone_number_id.slice(0, 10)}...</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-[0.05em] uppercase border ${acc.integration_status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-100' :
                                            acc.integration_status === 'SUSPENDED' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                'bg-slate-50 text-slate-400 border-slate-100'
                                        }`}>
                                        {acc.integration_status}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${acc.health_status === 'HEALTHY' ? 'bg-[#27954D]' :
                                                acc.health_status === 'WARNING' ? 'bg-amber-400' :
                                                    'bg-red-500'
                                            }`} />
                                        <span className="text-xs font-semibold text-slate-600">{acc.health_status}</span>
                                    </div>
                                    <div className="text-[9px] text-slate-300 font-medium mt-1">
                                        Last Check: {acc.last_health_check_at ? new Date(acc.last_health_check_at).toLocaleTimeString() : 'Never'}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        {acc.app_secret ? (
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100" title="AES-256-GCM Encrypted">
                                                <Lock size={10} /> ENCRYPTED
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 italic">
                                                LEGACY
                                            </div>
                                        )}
                                        {acc.webhook_verified_at && (
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                                                <Globe size={10} /> WEBHOOK
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right pr-10">
                                    <Link href={`/super-admin/vendors/${acc.workspace_id}`} className="inline-flex items-center gap-2 text-[#27954D] hover:text-[#042f94] font-bold text-[10px] uppercase tracking-wider transition-all">
                                        Audit Shell <ArrowRight size={14} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered?.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Activity size={32} />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">No integrations matching your criteria found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function SummaryCard({ label, value, icon, color }: any) {
    const colorMap: any = {
        slate: "bg-slate-50 text-slate-400",
        green: "bg-[#27954D]/5 text-[#042f94]",
        red: "bg-red-50 text-red-500",
        amber: "bg-amber-50 text-amber-500"
    };

    return (
        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
            <div className={`w-14 h-14 rounded-2xl ${colorMap[color]} flex items-center justify-center transition-transform duration-500 group-hover:scale-110`}>
                {icon}
            </div>
            <div>
                <div className="text-3xl font-semibold text-slate-800 tracking-tight">{value}</div>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{label}</div>
            </div>
        </div>
    );
}
