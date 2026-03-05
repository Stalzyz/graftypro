"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    FileText,
    Download,
    Plus,
    Search,
    CheckCircle2,
    Clock,
    Receipt,
    Percent,
    Building2,
    RefreshCw,
    ArrowUpRight
} from "lucide-react";

export default function InvoiceGSTManager() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("all");
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<any[]>([]);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await fetch("/api/super-admin/finance/invoices");
            const data = await res.json();
            if (data.data) setInvoices(data.data);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const stats = {
        taxable: invoices.reduce((acc, inv) => acc + Number(inv.net_amount), 0),
        gst: invoices.reduce((acc, inv) => acc + Number(inv.gst_amount), 0),
        pending: invoices.filter(inv => inv.payment_status === 'PENDING').reduce((acc, inv) => acc + Number(inv.total_amount), 0),
        settled: invoices.filter(inv => inv.payment_status === 'PAID').reduce((acc, inv) => acc + Number(inv.total_amount), 0),
    };

    if (loading) return <div className="p-20 text-center"><RefreshCw className="animate-spin inline mr-2" /> Initializing Fiscal Data...</div>;

    return (
        <div className="max-w-7xl space-y-12 pb-20">
            <header className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <Receipt className="text-white" size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Revenue Ledger</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Automated GST compliance, tax settlements, and fiscal history.</p>
                </div>

                <div className="flex gap-4">
                    <button className="px-6 py-4 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                        <Percent size={14} />
                        GST Settings
                    </button>
                    <button
                        onClick={() => router.push("/super-admin/dashboard/finance/invoices/new")}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        <Plus size={14} />
                        Manual Invoice
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Taxable" value={`₹${stats.taxable.toLocaleString()}`} icon={<Building2 />} color="blue" />
                <StatCard label="GST Collected" value={`₹${stats.gst.toLocaleString()}`} icon={<Percent />} color="green" />
                <StatCard label="Pending Payments" value={`₹${stats.pending.toLocaleString()}`} icon={<Clock />} color="orange" />
                <StatCard label="Settled To Date" value={`₹${stats.settled.toLocaleString()}`} icon={<CheckCircle2 />} color="emerald" />
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex gap-8">
                        {['all', 'paid', 'pending', 'cancelled'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-[10px] font-black uppercase tracking-[0.2em] pb-2 border-b-2 transition-all ${activeTab === tab ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-300 hover:text-slate-500'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input
                            type="text"
                            placeholder="Find Invoice, Org..."
                            className="bg-slate-50 border-none rounded-xl pl-10 pr-6 py-2.5 text-xs font-bold w-64 focus:ring-2 focus:ring-slate-100 transition-all"
                            onChange={(e) => {
                                // Search filter logic here if needed
                            }}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identifier</th>
                                <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization</th>
                                <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Amount</th>
                                <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax</th>
                                <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Issued</th>
                                <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="text-center px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {invoices.map((inv, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                                                <FileText size={14} className="text-white" />
                                            </div>
                                            <span className="text-xs font-black text-slate-900">{inv.invoice_number}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-slate-700">{inv.billing_name}</span>
                                    </td>
                                    <td className="px-8 py-6 text-xs font-bold text-slate-900">₹{Number(inv.net_amount).toLocaleString()}</td>
                                    <td className="px-8 py-6 text-xs font-medium text-slate-500">₹{Number(inv.gst_amount).toLocaleString()}</td>
                                    <td className="px-8 py-6 text-xs font-medium text-slate-400 uppercase px-1">{new Date(inv.created_at).toLocaleDateString()}</td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${inv.payment_status === 'PAID' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                            {inv.payment_status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(`/api/finance/invoices/${inv.id}/pdf`);
                                                    if (!res.ok) throw new Error("PDF load failed");
                                                    const blob = await res.blob();
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `Invoice-${inv.invoice_number}.pdf`;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    a.remove();
                                                } catch (e) {
                                                    alert("Failed to download PDF");
                                                }
                                            }}
                                            className="p-3 bg-slate-100 rounded-xl hover:bg-slate-900 hover:text-slate-700 transition-all"
                                        >
                                            <Download size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-slate-50/50 flex items-center justify-between border-t border-slate-50">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Automated Fiscal Engine active</span>
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                        Export Full Year Ledger <ArrowUpRight size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }: any) {
    const colors: any = {
        blue: "bg-blue-600 shadow-blue-200",
        green: "bg-green-600 shadow-green-200",
        orange: "bg-orange-600 shadow-orange-200",
        emerald: "bg-emerald-600 shadow-emerald-200",
    };

    return (
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4 hover:shadow-xl hover:shadow-slate-100 transition-all duration-500 group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${colors[color]} group-hover:scale-110 transition-transform duration-500`}>
                {icon}
            </div>
            <div>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
            </div>
        </div>
    );
}
