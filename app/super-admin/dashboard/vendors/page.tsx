"use client";
import { useState, useEffect, useCallback } from "react";
import {
    Search, Loader2, Eye, Users, Plus, X, Building, Mail, Lock,
    ChevronLeft, ChevronRight, LogIn, Trash2, PauseCircle, PlayCircle,
    Filter, CheckCircle2, XCircle, RefreshCw, AlertTriangle, CreditCard,
    UserMinus, UserPlus, Download, MoreHorizontal, Zap, Shield
} from "lucide-react";
import Link from "next/link";

const PLANS = ["FREE", "STARTER", "PRO", "ENTERPRISE"];
const STATUSES = ["ACTIVE", "SUSPENDED", "DORMANT"];

export default function VendorListPage() {
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterPlan, setFilterPlan] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    // Selection
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [bulkResult, setBulkResult] = useState<any>(null);

    // Bulk action state
    const [bulkAction, setBulkAction] = useState("");
    const [bulkValue, setBulkValue] = useState("");
    const [bulkCredits, setBulkCredits] = useState("");
    const [showBulkPanel, setShowBulkPanel] = useState(false);

    // Create form
    const [formData, setFormData] = useState({ business_name: "", email: "", password: "", plan: "FREE" });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchVendors = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(), limit: "20", search,
                ...(filterPlan && { plan: filterPlan }),
                ...(filterStatus && { status: filterStatus })
            });
            const res = await fetch(`/api/super-admin/vendors?${params}`);
            const data = await res.json();
            setVendors(data.data || []);
            setTotalPages(data.meta?.pages || 1);
            setTotal(data.meta?.total || 0);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [search, page, filterPlan, filterStatus]);

    useEffect(() => {
        const timer = setTimeout(fetchVendors, 400);
        return () => clearTimeout(timer);
    }, [fetchVendors]);

    const toggleSelectAll = () => {
        if (selectedIds.length === vendors.length && vendors.length > 0) setSelectedIds([]);
        else setSelectedIds(vendors.map(v => v.id));
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const executeBulkAction = async () => {
        if (!bulkAction || selectedIds.length === 0) return;

        // Confirm destructive actions
        if (["hard_delete", "soft_delete"].includes(bulkAction)) {
            if (!window.confirm(`${bulkAction === "hard_delete" ? "⚠️ PERMANENT" : "Soft"} delete ${selectedIds.length} vendors?`)) return;
            if (bulkAction === "hard_delete") {
                const confirm2 = window.prompt("Type 'CONFIRM' to proceed with permanent deletion:");
                if (confirm2 !== "CONFIRM") return;
            }
        }

        setBulkLoading(true);
        setBulkResult(null);
        try {
            const res = await fetch("/api/super-admin/vendors/bulk", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ids: selectedIds,
                    action: bulkAction,
                    value: bulkValue || undefined,
                    credits: bulkCredits || undefined
                })
            });
            const data = await res.json();
            setBulkResult(data);
            if (data.succeeded > 0) {
                showToast(`${data.succeeded}/${data.total} operations completed`);
                setSelectedIds([]);
                fetchVendors();
            }
            if (data.failed > 0) {
                showToast(`${data.failed} operations failed`, "error");
            }
        } catch (e) {
            showToast("Bulk operation failed", "error");
        } finally {
            setBulkLoading(false);
            setBulkAction("");
            setBulkValue("");
            setBulkCredits("");
        }
    };

    const handleQuickAction = async (id: string, action: string, value?: string) => {
        try {
            const res = await fetch("/api/super-admin/vendors/bulk", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: [id], action, value })
            });
            if (res.ok) { showToast("Done"); fetchVendors(); }
            else showToast("Failed", "error");
        } catch { showToast("Error", "error"); }
    };

    const handleImpersonate = async (id: string) => {
        const res = await fetch(`/api/super-admin/vendors/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "impersonate" })
        });
        const data = await res.json();
        if (data.token) {
            document.cookie = `token=${data.token}; path=/; max-age=3600;`;
            window.open("/dashboard?impersonating=1", "_blank");
        } else {
            showToast(data.error || "Impersonation failed", "error");
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError("");
        try {
            const res = await fetch("/api/super-admin/vendors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed");
            setShowCreateModal(false);
            setFormData({ business_name: "", email: "", password: "", plan: "FREE" });
            showToast("Vendor created successfully");
            fetchVendors();
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const needsValue = ["change_plan"].includes(bulkAction);
    const needsCredits = ["add_credits", "remove_credits"].includes(bulkAction);

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-24 px-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white text-sm font-bold animate-fade-in ${toast.type === "success" ? "bg-[#042f94]" : "bg-rose-500"}`}>
                    {toast.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[#042f94] font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                        <Users size={12} /> Vendor Registry
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Vendor Management</h1>
                    <p className="text-slate-400 text-sm mt-1">{total.toLocaleString()} total vendors</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowBulkPanel(!showBulkPanel)}
                        className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
                        <Zap size={14} /> Bulk Ops
                    </button>
                    <button onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-[#042f94] hover:bg-[#031f6b] text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-[#042f94]/20">
                        <Plus size={16} /> New Vendor
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search name, ID, email..."
                        className="w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#042f94]/30 transition-all shadow-sm" />
                </div>
                <select value={filterPlan} onChange={e => { setFilterPlan(e.target.value); setPage(1); }}
                    className="bg-white border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 outline-none appearance-none shadow-sm min-w-[130px]">
                    <option value="">All Plans</option>
                    {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                    className="bg-white border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 outline-none appearance-none shadow-sm min-w-[130px]">
                    <option value="">All Statuses</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Bulk Operations Panel */}
            {showBulkPanel && selectedIds.length > 0 && (
                <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-emerald-400">{selectedIds.length} vendors selected</span>
                        <button onClick={() => { setSelectedIds([]); setShowBulkPanel(false); }}
                            className="p-2 hover:bg-slate-800 rounded-xl transition-all">
                            <X size={16} className="text-slate-400" />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[180px]">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Action</label>
                            <select value={bulkAction} onChange={e => setBulkAction(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none appearance-none">
                                <option value="">Select action...</option>
                                <option value="activate">✅ Activate</option>
                                <option value="pause">⏸️ Pause</option>
                                <option value="soft_delete">🗑️ Soft Delete</option>
                                <option value="hard_delete">💀 Hard Delete</option>
                                <option value="change_plan">📦 Change Plan</option>
                                <option value="add_credits">➕ Add Credits</option>
                                <option value="remove_credits">➖ Remove Credits</option>
                                <option value="remove_partner">🔗 Remove Partner</option>
                            </select>
                        </div>

                        {needsValue && (
                            <div className="flex-1 min-w-[140px]">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Plan</label>
                                <select value={bulkValue} onChange={e => setBulkValue(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none appearance-none">
                                    <option value="">Select plan...</option>
                                    {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        )}

                        {needsCredits && (
                            <div className="flex-1 min-w-[120px]">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Credits</label>
                                <input type="number" value={bulkCredits} onChange={e => setBulkCredits(e.target.value)}
                                    placeholder="e.g. 100"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none" />
                            </div>
                        )}

                        <button onClick={executeBulkAction} disabled={bulkLoading || !bulkAction}
                            className="flex items-center gap-2 px-6 py-3 bg-[#042f94] hover:bg-[#031f6b] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg">
                            {bulkLoading ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                            Execute
                        </button>
                    </div>

                    {bulkResult && (
                        <div className="bg-slate-800 rounded-2xl p-4 text-xs font-mono">
                            <span className="text-emerald-400">✓ {bulkResult.succeeded} succeeded</span>
                            {bulkResult.failed > 0 && <span className="text-rose-400 ml-4">✗ {bulkResult.failed} failed</span>}
                        </div>
                    )}
                </div>
            )}

            {/* Show bulk panel hint when items selected but panel hidden */}
            {selectedIds.length > 0 && !showBulkPanel && (
                <div className="bg-[#042f94] text-white rounded-2xl px-6 py-4 flex items-center justify-between">
                    <span className="text-sm font-bold">{selectedIds.length} vendors selected</span>
                    <div className="flex gap-3">
                        <button onClick={() => setShowBulkPanel(true)}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-all">
                            Open Bulk Actions
                        </button>
                        <button onClick={() => setSelectedIds([])}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-slate-50/80 text-slate-400 text-[9px] font-black uppercase tracking-[0.15em] border-b border-slate-100">
                                <th className="px-6 py-4 w-10">
                                    <input type="checkbox"
                                        checked={selectedIds.length === vendors.length && vendors.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-slate-200 text-[#042f94] cursor-pointer" />
                                </th>
                                <th className="px-6 py-4">Vendor</th>
                                <th className="px-6 py-4">Plan</th>
                                <th className="px-6 py-4 text-center">Messages</th>
                                <th className="px-6 py-4 text-center">Campaigns</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={7} className="py-24 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-2 border-[#042f94] border-t-transparent rounded-full animate-spin" />
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Loading...</span>
                                    </div>
                                </td></tr>
                            ) : vendors.length === 0 ? (
                                <tr><td colSpan={7} className="py-24 text-center">
                                    <Users size={40} className="mx-auto mb-3 text-slate-100" />
                                    <div className="text-sm text-slate-400">No vendors found</div>
                                </td></tr>
                            ) : vendors.map(vendor => {
                                const isSoftDeleted = (vendor.settings as any)?.soft_deleted;
                                return (
                                    <tr key={vendor.id}
                                        className={`hover:bg-slate-50/50 transition-all group ${selectedIds.includes(vendor.id) ? "bg-[#042f94]/5" : ""} ${isSoftDeleted ? "opacity-60" : ""}`}>
                                        <td className="px-6 py-5">
                                            <input type="checkbox" checked={selectedIds.includes(vendor.id)}
                                                onChange={() => toggleSelect(vendor.id)}
                                                className="w-4 h-4 rounded border-slate-200 text-[#042f94] cursor-pointer" />
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-semibold text-slate-700 group-hover:text-[#042f94] transition-colors">
                                                {vendor.name}
                                                {isSoftDeleted && <span className="ml-2 text-[9px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-black uppercase">Deleted</span>}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest">
                                                {vendor.id.slice(0, 8)}... • {new Date(vendor.joined_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${vendor.plan === "ENTERPRISE" ? "bg-indigo-50 text-indigo-600 border-indigo-100" : vendor.plan === "PRO" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
                                                {vendor.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-sm font-bold text-slate-600">{vendor.stats?.messages?.toLocaleString() || 0}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-sm font-bold text-slate-600">{vendor.stats?.campaigns?.toLocaleString() || 0}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button
                                                onClick={() => handleQuickAction(vendor.id, vendor.status === "ACTIVE" ? "pause" : "activate")}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${vendor.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" : "bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-100"}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${vendor.status === "ACTIVE" ? "bg-emerald-500" : "bg-rose-500"}`} />
                                                {vendor.status}
                                            </button>
                                        </td>
                                        <td className="px-6 py-5 text-right pr-8">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => handleImpersonate(vendor.id)} title="Impersonate"
                                                    className="p-2 bg-white border border-slate-100 hover:border-[#042f94]/30 text-slate-400 hover:text-[#042f94] rounded-xl transition-all shadow-sm">
                                                    <LogIn size={14} />
                                                </button>
                                                <Link href={`/super-admin/dashboard/vendors/${vendor.id}`} title="Full Profile"
                                                    className="p-2 bg-white border border-slate-100 hover:border-[#042f94]/30 text-slate-400 hover:text-[#042f94] rounded-xl transition-all shadow-sm">
                                                    <Eye size={14} />
                                                </Link>
                                                <button onClick={() => handleQuickAction(vendor.id, "soft_delete")} title="Soft Delete"
                                                    className="p-2 bg-white border border-slate-100 hover:border-rose-200 text-slate-400 hover:text-rose-500 rounded-xl transition-all shadow-sm">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-slate-50/50 px-8 py-4 flex justify-between items-center border-t border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Page {page} of {totalPages} • {total} total
                    </div>
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

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                    <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Create Vendor</h2>
                                    <p className="text-xs text-slate-400 mt-1">Provision a new tenant workspace</p>
                                </div>
                                <button onClick={() => setShowCreateModal(false)}
                                    className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400">
                                    <X size={18} />
                                </button>
                            </div>

                            {formError && (
                                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-2">
                                    <AlertTriangle size={14} /> {formError}
                                </div>
                            )}

                            <form onSubmit={handleCreate} className="space-y-4">
                                {[
                                    { key: "business_name", label: "Business Name", type: "text", icon: <Building size={16} />, placeholder: "Acme Corp" },
                                    { key: "email", label: "Owner Email", type: "email", icon: <Mail size={16} />, placeholder: "owner@acme.com" },
                                    { key: "password", label: "Password", type: "password", icon: <Lock size={16} />, placeholder: "••••••••" },
                                ].map(field => (
                                    <div key={field.key}>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{field.label}</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">{field.icon}</span>
                                            <input required type={field.type} placeholder={field.placeholder}
                                                value={(formData as any)[field.key]}
                                                onChange={e => setFormData(f => ({ ...f, [field.key]: e.target.value }))}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:border-[#042f94]/30 transition-all" />
                                        </div>
                                    </div>
                                ))}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Plan</label>
                                    <select value={formData.plan} onChange={e => setFormData(f => ({ ...f, plan: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none appearance-none">
                                        {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <button type="submit" disabled={formLoading}
                                    className="w-full py-4 bg-[#042f94] hover:bg-[#031f6b] text-white font-bold rounded-2xl transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2">
                                    {formLoading ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
                                    Create Vendor
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
