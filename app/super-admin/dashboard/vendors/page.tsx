"use client";
import { useState, useEffect } from "react";
import { Search, Loader2, Eye, CheckCircle, AlertTriangle, Users, Plus, X, Building, Mail, Lock, MoreHorizontal, ArrowRight, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function VendorListPage() {
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        business_name: "",
        email: "",
        password: "",
        plan: "FREE"
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchVendors();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, page]);

    async function fetchVendors() {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                search
            });
            const res = await fetch(`/api/super-admin/vendors?${params}`);
            const data = await res.json();
            setVendors(data.data || []);
            setTotalPages(data.meta?.pages || 1);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const handleCreateVendor = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError("");

        try {
            const res = await fetch("/api/super-admin/vendors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create vendor");

            setShowCreateModal(false);
            setFormData({ business_name: "", email: "", password: "", plan: "FREE" });
            fetchVendors();
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#042f94] font-semibold text-[10px] uppercase tracking-[0.2em] mb-3">
                        <Users size={14} strokeWidth={1.5} /> Organization Registry
                    </div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight">Vendor Management</h1>
                    <p className="text-slate-400 text-sm font-medium">Provision and manage tenant workspaces globally.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group w-64 lg:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#27954D] transition-colors" size={16} strokeWidth={2} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, ID or email..."
                            className="w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#27954D]/30 transition-all text-slate-700 placeholder:text-slate-300 shadow-sm shadow-slate-200/20"
                        />
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#27954D] hover:bg-[#042f94] text-white rounded-2xl shadow-lg shadow-[#27954D]/10 text-xs font-bold transition-all active:scale-95"
                    >
                        <Plus size={18} strokeWidth={2.5} /> <span>New Org</span>
                    </button>
                </div>
            </header>

            {/* Vendor Table - Modern Executive Style */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm shadow-slate-200/20">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-bold uppercase tracking-[0.15em]">
                                <th className="px-8 py-5">Organizational Entity</th>
                                <th className="px-8 py-5">Plan Tier</th>
                                <th className="px-8 py-5">Throughput</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Date Onboarded</th>
                                <th className="px-8 py-5 text-right pr-10">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-8 h-8 border-2 border-[#27954D] border-t-transparent rounded-full animate-spin" />
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest animate-pulse">Syncing Registry...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : vendors.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-32 text-center">
                                        <Users size={48} strokeWidth={1} className="mx-auto mb-4 text-slate-100" />
                                        <div className="text-sm font-medium text-slate-400 italic">No matches found for "{search}"</div>
                                    </td>
                                </tr>
                            ) : (
                                vendors.map((vendor) => (
                                    <tr key={vendor.id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="font-semibold text-slate-700 text-sm group-hover:text-[#042f94] transition-colors leading-tight">{vendor.name}</div>
                                            <div className="text-[10px] text-slate-300 font-medium tracking-tight mt-1 uppercase tracking-widest">UID: {vendor.id.slice(0, 8)}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Badge label={vendor.plan} color={vendor.plan === 'ENTERPRISE' ? 'indigo' : vendor.plan === 'PRO' ? 'green' : 'slate'} />
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm font-semibold text-slate-700">{vendor.stats.messages.toLocaleString()}</div>
                                                <span className="text-[10px] font-bold text-slate-300 tracking-wider">OUTBOUND</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${vendor.status === 'ACTIVE' ? 'bg-[#27954D]' : 'bg-red-500'}`} />
                                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">{vendor.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-slate-400 text-xs font-medium">
                                            {new Date(vendor.joined_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-6 text-right pr-10">
                                            <Link
                                                href={`/super-admin/dashboard/vendors/${vendor.id}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 hover:border-[#27954D]/30 text-slate-400 hover:text-[#042f94] rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
                                            >
                                                <Eye size={14} strokeWidth={2} />
                                                <span>Audit</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination - Minimal */}
                <div className="bg-slate-50/50 px-10 py-5 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-t border-slate-100">
                    <div>Batch {page} of {totalPages}</div>
                    <div className="flex gap-3">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 bg-white border border-slate-100 rounded-xl hover:text-[#27954D] transition-all disabled:opacity-30 shadow-sm"
                        >
                            <ChevronLeft size={16} strokeWidth={2.5} />
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 bg-white border border-slate-100 rounded-xl hover:text-[#27954D] transition-all disabled:opacity-30 shadow-sm"
                        >
                            <ChevronRight size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Modal - Refined for Enterprise */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]" onClick={() => setShowCreateModal(false)} />
                    <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in border border-slate-100">
                        <div className="p-10 space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Ecosystem Expansion</h2>
                                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Instance Provisioning Protocol</p>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all text-slate-300 hover:text-slate-600 border border-transparent hover:border-slate-100">
                                    <X size={20} strokeWidth={1.5} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateVendor} className="space-y-6">
                                {formError && (
                                    <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl text-red-600 text-[10px] font-bold tracking-wide flex items-center gap-3">
                                        <AlertTriangle size={16} strokeWidth={2.5} /> {formError}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Business Identity</label>
                                        <div className="relative">
                                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} strokeWidth={2} />
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. Acme Global"
                                                value={formData.business_name}
                                                onChange={e => setFormData({ ...formData, business_name: e.target.value })}
                                                className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium outline-none focus:border-[#27954D]/30 transition-all text-slate-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Executive Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} strokeWidth={2} />
                                            <input
                                                required
                                                type="email"
                                                placeholder="owner@acme.com"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium outline-none focus:border-[#27954D]/30 transition-all text-slate-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Access Cipher</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} strokeWidth={2} />
                                            <input
                                                required
                                                type="password"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium outline-none focus:border-[#27954D]/30 transition-all text-slate-700"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="w-full py-5 bg-[#27954D] hover:bg-[#042f94] text-white font-bold rounded-2xl transition-all shadow-xl shadow-[#27954D]/10 hover:shadow-[#27954D]/20 active:scale-[0.98] disabled:opacity-50 text-sm"
                                    >
                                        {formLoading ? "Synchronizing..." : "Authorize Provisioning"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Badge({ label, color }: { label: string; color: 'green' | 'indigo' | 'slate' }) {
    const styles = {
        green: "bg-[#27954D]/5 text-[#042f94] border-[#27954D]/10",
        indigo: "bg-indigo-50/50 text-indigo-500 border-indigo-100",
        slate: "bg-slate-50 text-slate-400 border-slate-100",
    };

    return (
        <span className={`px-3 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-[0.05em] shadow-sm ${styles[color]}`}>
            {label}
        </span>
    );
}

