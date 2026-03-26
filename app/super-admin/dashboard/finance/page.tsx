
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    IndianRupee, CreditCard, Receipt, FileText, Download, Lock, Unlock,
    Filter, Search, Calendar, Landmark, Wallet, ArrowUpRight, ArrowDownRight,
    Scale, Calculator, ShieldCheck, FileSpreadsheet, Send, MoreHorizontal,
    Trash2, Ban, RefreshCcw, Eye, Settings
} from "lucide-react";
import { CreateInvoiceModal } from "@/components/finance/CreateInvoiceModal";

export default function FinanceDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isExporting, setIsExporting] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Reset page when date changes
    useEffect(() => {
        setPage(1);
    }, [month, year]);

    useEffect(() => {
        fetchFinanceData();
    }, [month, year, page]);

    const fetchFinanceData = async () => {
        setLoading(true);
        try {
            const [statsRes, invoicesRes] = await Promise.all([
                fetch(`/api/super-admin/finance/stats?month=${month}&year=${year}`),
                fetch(`/api/super-admin/finance/invoices?month=${month}&year=${year}&page=${page}&limit=50`)
            ]);

            const statsData = await statsRes.json();
            const invoicesData = await invoicesRes.json();

            setStats(statsData);

            if (invoicesData.data) {
                setInvoices(invoicesData.data);
                setTotalPages(invoicesData.pagination.totalPages);
                setTotalRecords(invoicesData.pagination.total);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type: "B2B" | "B2C" | "HSN") => {
        setIsExporting(true);
        try {
            const url = `/api/super-admin/finance/reports?type=${type}&month=${month}&year=${year}`;
            window.open(url, '_blank');
        } catch (e) {
            console.error(e);
        } finally {
            setIsExporting(false);
        }
    };

    if (loading && !stats) return <LoadingPulse />;

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-fade-in">

            {/* Header Area */}
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg">
                            <Landmark className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Finance</h1>
                            <p className="text-slate-400 font-medium text-sm italic">Manage platform revenue and taxes.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="bg-transparent text-slate-900 text-xs font-black uppercase tracking-widest px-4 py-2 outline-none"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                        <select
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="bg-transparent text-slate-900 text-xs font-black uppercase tracking-widest px-4 py-2 outline-none border-l border-slate-200"
                        >
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                        </select>
                    </div>
                    <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block" />

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="p-4 bg-slate-900 border border-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center"
                        title="Create New Invoice"
                    >
                        <FileText size={20} />
                    </button>

                    <Link href="/super-admin/dashboard/packages" className="px-6 py-4 bg-amber-500 border border-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-amber-600 transition-all shadow-lg">
                        <CreditCard size={14} /> Subscription Plans
                    </Link>
                    
                    <Link href="/super-admin/dashboard/finance/settings" className="px-6 py-4 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Settings size={14} /> Tax Settings
                    </Link>

                    <button
                        onClick={() => handleExport("B2B")}
                        className="px-6 py-4 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <FileSpreadsheet size={14} /> GSTR-1 B2B
                    </button>
                    <button
                        onClick={() => handleExport("HSN")}
                        className="px-6 py-4 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <FileSpreadsheet size={14} /> HSN Summary
                    </button>
                </div>
            </header>

            {/* Create Invoice Modal */}
            {isCreateModalOpen && (
                <CreateInvoiceModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        fetchFinanceData();
                    }}
                />
            )}

            {/* Core Financial Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FinanceKPICard
                        label="Total Revenue"
                        value={`₹${(stats?.total_revenue || 0).toLocaleString()}`}
                        sub="Total amount collected"
                        icon={<Scale className="text-blue-500" />}
                        color="bg-blue-50"
                    />
                    <FinanceKPICard
                        label="GST"
                        value={`₹${(stats?.gst?.total || 0).toLocaleString()}`}
                        sub="Calculated GST liability"
                        icon={<Calculator className="text-indigo-500" />}
                        color="bg-indigo-50"
                    />
                    <FinanceKPICard
                        label="Net Revenue"
                        value={`₹${(stats?.net_revenue || 0).toLocaleString()}`}
                        sub="Revenue after tax"
                        icon={<IndianRupee className="text-green-500" />}
                        color="bg-green-50"
                    />
                </div>

                <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-white/10 group-hover:text-white/20 transition-all animate-pulse">
                        <Ban size={120} />
                    </div>
                    <div className="relative z-10 flex items-center justify-between">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Status</h3>
                        {stats?.is_locked ? <Lock size={16} className="text-red-400" /> : <Unlock size={16} className="text-green-400" />}
                    </div>
                    <div className="relative z-10">
                        <div className="text-3xl font-black">{stats?.is_locked ? 'Locked' : 'Open'}</div>
                        <p className="text-white/40 text-[11px] font-medium leading-relaxed mt-2 uppercase tracking-wide">
                            {stats?.is_locked
                                ? 'This month is locked for accounting.'
                                : 'This month is open for changes.'}
                        </p>
                    </div>
                    {!stats?.is_locked && (
                        <button className="relative z-10 w-full py-4 bg-white/10 hover:bg-red-500 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/20">
                            Lock Month
                        </button>
                    )}
                </div>
            </div>

            {/* GST Breakdown & Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <CreditCard size={16} className="text-indigo-500" />
                        GST Breakdown
                    </h3>
                    <div className="space-y-6">
                        <GSTMeter label="CGST (Central)" value={stats?.gst?.cgst || 0} total={stats?.gst?.total} color="bg-blue-500" />
                        <GSTMeter label="SGST (State)" value={stats?.gst?.sgst || 0} total={stats?.gst?.total} color="bg-indigo-500" />
                        <GSTMeter label="IGST (Integrated)" value={stats?.gst?.igst || 0} total={stats?.gst?.total} color="bg-purple-500" />
                    </div>
                    <div className="pt-6 border-t border-slate-50 italic">
                        <p className="text-[11px] text-slate-400 font-medium">Rates are calculated automatically.</p>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Revenue Trend</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase">Settled</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[250px] flex items-end justify-between px-4 pb-2">
                        {stats?.trend?.map((t: any, idx: number) => {
                            const maxRev = Math.max(...stats.trend.map((m: any) => m.revenue), 1);
                            const height = (t.revenue / maxRev) * 100;
                            return (
                                <div key={idx} className="flex flex-col items-center gap-4 group flex-1">
                                    <div className="relative w-full flex justify-center">
                                        <div
                                            className="w-12 bg-slate-50 group-hover:bg-blue-600 rounded-t-xl transition-all duration-500 cursor-help"
                                            style={{ height: `${Math.max(height, 5)}%` }}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all">
                                                ₹{t.revenue.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.month}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Global Invoice Registry */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Invoices</h3>
                        <p className="text-slate-400 text-xs font-medium">List of all platform invoices.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                        <Search size={16} className="text-slate-400" />
                        <input
                            placeholder="Find by INV-ID, Customer, or GSTIN..."
                            className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 placeholder:text-slate-400 w-[250px]"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <th className="px-8 py-6">Invoice</th>
                                <th className="px-8 py-6">Customer</th>
                                <th className="px-8 py-6">Tax Details</th>
                                <th className="px-8 py-6">Amount</th>
                                <th className="px-8 py-6 text-right">Status</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50/10 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-slate-700 transition-all">
                                                <Receipt size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900 tracking-tight">{inv.invoice_number}</div>
                                                <div className="text-[8px] font-mono text-slate-300 truncate w-32">{inv.invoice_hash}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-xs font-bold text-slate-700">{inv.billing_name}</div>
                                        <div className="text-[10px] font-bold text-slate-400">{inv.billing_gstin || 'B2C (UNREGISTERED)'}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-2">
                                            <div className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-black text-slate-400">HSN: {inv.hsn_code}</div>
                                            <div className={`text-[10px] px-2 py-0.5 rounded font-black ${inv.igst_amount > 0 ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {inv.igst_amount > 0 ? 'INTER-STATE' : 'INTRA-STATE'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-black text-slate-900">₹{Number(inv.total_amount).toLocaleString()}</div>
                                        <div className="text-[10px] font-bold text-[#27954D]">GST incl. ₹{Number(inv.gst_amount).toLocaleString()}</div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="inline-flex items-center gap-1.5 bg-green-50 text-[#27954D] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                            <ShieldCheck size={10} />
                                            {inv.payment_status}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-300 mt-1">{new Date(inv.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => window.open(`/api/super-admin/finance/invoices/${encodeURIComponent(inv.invoice_number)}/preview`, '_blank')}
                                                className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
                                                title="View HTML Preview"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => window.open(`/api/super-admin/finance/invoices/${encodeURIComponent(inv.invoice_number)}/pdf`, '_blank')}
                                                className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
                                                title="Download PDF"
                                            >
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400">
                        Displaying page {page} of {totalPages} ({totalRecords} total records)
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
        </div>
    );
}

function FinanceKPICard({ label, value, sub, icon, color }: any) {
    return (
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-4 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
            <div className={`absolute -top-10 -right-10 w-32 h-32 ${color} rounded-full group-hover:scale-150 transition-transform duration-700 opacity-20`} />
            <div className="relative z-10 flex items-start justify-between">
                <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-slate-900 transition-all duration-500 shadow-sm border border-black/5`}>
                    {icon}
                </div>
            </div>
            <div className="relative z-10 space-y-1">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{label}</span>
                    <span className="text-[11px] font-bold text-slate-300 italic">{sub}</span>
                </div>
            </div>
        </div>
    );
}

function GSTMeter({ label, value, total, color }: any) {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{label}</span>
                <span className="text-xs font-black text-slate-900">₹{value.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}

function LoadingPulse() {
    return (
        <div className="max-w-7xl mx-auto py-20 animate-pulse space-y-12">
            <div className="h-40 bg-slate-100 rounded-[40px]" />
            <div className="grid grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-[40px]" />)}
            </div>
            <div className="h-[600px] bg-slate-50 rounded-[40px]" />
        </div>
    );
}
