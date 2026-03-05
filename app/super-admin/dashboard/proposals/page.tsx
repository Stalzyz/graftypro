
"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Download,
    Send,
    CheckCircle2,
    ArrowUpRight,
    Building2,
    IndianRupee,
    Printer,
    PenTool,
    X,
    Loader2
} from "lucide-react";

export default function ProposalsModule() {
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchProposals();
    }, [page]);

    const fetchProposals = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/super-admin/proposals?page=${page}&limit=50`);
            const data = await res.json();
            if (data.success) {
                setProposals(data.data || []);
                setTotalPages(data.pagination.totalPages);
                setTotalRecords(data.pagination.total);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl space-y-12 pb-20 font-sans relative">
            <header className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <PenTool className="text-white" size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Proposal Forge</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Design, track, and dispatch professional business proposals.</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        <Plus size={14} />
                        Forge New Proposal
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ProposalStatCard label="Live Proposals" value={totalRecords} icon={<Send />} color="blue" />
                <ProposalStatCard label="Conversion Rate" value="68%" icon={<CheckCircle2 />} color="green" />
                <ProposalStatCard label="Pipeline Value" value="₹84.2 L" icon={<IndianRupee />} color="emerald" />
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden border-t-4 border-t-slate-900">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Negotiation Desk</h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input
                            type="text"
                            placeholder="Find Proposals or Clients..."
                            className="bg-white border-none rounded-2xl pl-10 pr-6 py-3 text-xs font-bold w-72 focus:ring-2 focus:ring-slate-100 shadow-sm transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-slate-400 gap-2">
                            <Loader2 size={24} className="animate-spin" /> Loading Proposals...
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol ID</th>
                                    <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Counterparty</th>
                                    <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Proposed Value</th>
                                    <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifecycle</th>
                                    <th className="text-right px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Command</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {proposals.map((prop) => (
                                    <tr key={prop.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-6 bg-slate-200 group-hover:bg-slate-900 transition-colors rounded-full" />
                                                <span className="text-xs font-black text-slate-900 font-mono italic">{prop.protocol_id || prop.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-900">{prop.client_name}</span>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Building2 className="text-slate-300" size={10} />
                                                    <span className="text-[10px] font-bold text-slate-400">{prop.client_company}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-xs font-black text-slate-900">₹{parseFloat(prop.amount).toLocaleString()}</td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${prop.status === 'ACCEPTED' ? 'bg-[#27954D]/10 text-[#27954D]' :
                                                    prop.status === 'SENT' ? 'bg-blue-500/10 text-blue-500' :
                                                        prop.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
                                                            'bg-slate-200/50 text-slate-500'
                                                }`}>
                                                {prop.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right flex justify-end gap-2">
                                            <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-900 hover:text-slate-700 transition-all shadow-sm">
                                                <Download size={14} />
                                            </button>
                                            <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-900 hover:text-slate-700 transition-all shadow-sm">
                                                <Printer size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-8 bg-slate-50/50 flex items-center justify-between border-t border-slate-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Page {page} of {totalPages} ({totalRecords} Forged)
                    </span>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || totalPages === 0}
                            className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900">Forge Proposal</h3>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900">
                                <X size={20} />
                            </button>
                        </div>
                        <CreateProposalForm onSuccess={() => {
                            setShowCreateModal(false);
                            fetchProposals();
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
}

function ProposalStatCard({ label, value, icon, color }: any) {
    const colorClasses: any = {
        blue: "text-blue-600 bg-blue-50",
        green: "text-[#27954D] bg-[#27954D]/10",
        emerald: "text-emerald-600 bg-emerald-50",
    };

    return (
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-6 group hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${colorClasses[color]}`}>
                    Active
                </div>
            </div>
            <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{label}</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
            </div>
        </div>
    );
}

function CreateProposalForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        client_name: "",
        client_company: "",
        amount: "",
        items: [] as any[] // Placeholder for simple item logic
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/super-admin/proposals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                onSuccess();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">Client Name</label>
                <input
                    required
                    value={formData.client_name}
                    onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-slate-900 transition-all"
                    placeholder="E.g. Elon Musk"
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">Company</label>
                <input
                    value={formData.client_company}
                    onChange={e => setFormData({ ...formData, client_company: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-slate-900 transition-all"
                    placeholder="E.g. Tesla Inc."
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">Total Value (INR)</label>
                <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-slate-900 transition-all"
                    placeholder="50000"
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all disabled:opacity-50"
            >
                {loading ? "Forging..." : "Create Proposal"}
            </button>
        </form>
    );
}
