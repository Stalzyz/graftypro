"use client";
import { useState, useEffect } from "react";
import { Shield, RefreshCw, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
    IMPERSONATE_SESSION: "bg-purple-50 text-purple-600 border-purple-100",
    BULK_HARD_DELETE: "bg-rose-50 text-rose-600 border-rose-100",
    BULK_SOFT_DELETE: "bg-amber-50 text-amber-600 border-amber-100",
    DELETE_VENDOR: "bg-rose-50 text-rose-600 border-rose-100",
    MODULE_DISABLE: "bg-slate-50 text-slate-500 border-slate-100",
    MODULE_ENABLE: "bg-emerald-50 text-emerald-600 border-emerald-100",
    SUBSCRIPTION_CANCEL: "bg-rose-50 text-rose-600 border-rose-100",
    SUBSCRIPTION_UPGRADE: "bg-blue-50 text-blue-600 border-blue-100",
    UPDATE_VENDOR: "bg-blue-50 text-blue-600 border-blue-100",
    BULK_ACTIVATE: "bg-emerald-50 text-emerald-600 border-emerald-100",
    BULK_PAUSE: "bg-amber-50 text-amber-600 border-amber-100",
};

export default function AuditPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: "50", ...(search && { action: search }) });
            const res = await fetch(`/api/super-admin/audit?${params}`);
            const data = await res.json();
            setLogs(data.logs || []);
            setTotalPages(data.meta?.pages || 1);
            setTotal(data.meta?.total || 0);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchLogs(); }, [page, search]);

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-24 px-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[#042f94] font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                        <Shield size={12} /> Immutable Audit Trail
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800">Audit Log</h1>
                    <p className="text-slate-400 text-sm mt-1">{total.toLocaleString()} total events</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Filter by action..."
                            className="bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#042f94]/30 shadow-sm w-56" />
                    </div>
                    <button onClick={fetchLogs} className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                        <RefreshCw size={16} className={`text-slate-400 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </header>

            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-slate-50/80 text-slate-400 text-[9px] font-black uppercase tracking-[0.15em] border-b border-slate-100">
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Target</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">Admin</th>
                                <th className="px-6 py-4">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={5} className="py-24 text-center">
                                    <div className="w-8 h-8 border-2 border-[#042f94] border-t-transparent rounded-full animate-spin mx-auto" />
                                </td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={5} className="py-24 text-center text-slate-400 text-sm">No audit logs found</td></tr>
                            ) : logs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-all">
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${ACTION_COLORS[log.action] || "bg-slate-50 text-slate-500 border-slate-100"}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-mono text-slate-500">{log.resource?.slice(0, 16)}...</span>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        {log.details && (
                                            <span className="text-[11px] font-mono text-slate-400 truncate block">
                                                {JSON.stringify(log.details).slice(0, 80)}...
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-mono text-slate-500">{log.admin_id?.slice(0, 8)}...</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-slate-50/50 px-8 py-4 flex justify-between items-center border-t border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {page} of {totalPages}</div>
                    <div className="flex gap-2">
                        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                            className="p-2 bg-white border border-slate-100 rounded-xl hover:text-[#042f94] transition-all disabled:opacity-30 shadow-sm">
                            <ChevronLeft size={16} />
                        </button>
                        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                            className="p-2 bg-white border border-slate-100 rounded-xl hover:text-[#042f94] transition-all disabled:opacity-30 shadow-sm">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
