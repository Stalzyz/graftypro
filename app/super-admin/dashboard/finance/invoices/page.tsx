
"use client";

import { useState } from "react";
import {
    FileText,
    Download,
    MoreVertical,
    Plus,
    Search,
    CheckCircle2,
    Clock,
    Receipt,
    Percent,
    Building2,
    Calendar,
    ArrowUpRight
} from "lucide-react";

export default function InvoiceGSTManager() {
    const [activeTab, setActiveTab] = useState("all");
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [newInvoice, setNewInvoice] = useState({
        vendor: "",
        amount: "",
        tax_percent: 18,
        status: "PENDING"
    });

    const invoices = [
        { id: "INV-2024-001", vendor: "Tesla Motors", amount: "₹45,000", tax: "₹8,100", date: "08 Feb 2024", status: "PAID" },
        { id: "INV-2024-002", vendor: "SpaceX", amount: "₹1,20,000", tax: "₹21,600", date: "07 Feb 2024", status: "PENDING" },
        { id: "INV-2024-003", vendor: "Starlink", amount: "₹25,000", tax: "₹4,500", date: "05 Feb 2024", status: "PAID" },
    ];

    const handleGenerateInvoice = (e: any) => {
        e.preventDefault();
        alert("Manual Invoice Generated successfully! Distributing ledger entries...");
        setIsManualModalOpen(false);
    };

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
                        onClick={() => setIsManualModalOpen(true)}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        <Plus size={14} />
                        Manual Invoice
                    </button>
                </div>
            </header>

            {/* Manual Invoice Modal */}
            {isManualModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/40 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[40px] shadow-3xl p-10 relative">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Fiscal Override</h2>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-8">Manual Invoice Generation Protocol</p>

                        <form onSubmit={handleGenerateInvoice} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Organization</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-50 transition-all"
                                    placeholder="Enter Vendor Name..."
                                    value={newInvoice.vendor}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, vendor: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Amount (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none"
                                        placeholder="0.00"
                                        value={newInvoice.amount}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GST Rate (%)</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none appearance-none"
                                        value={newInvoice.tax_percent}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, tax_percent: parseInt(e.target.value) })}
                                    >
                                        <option value={18}>18% Standard</option>
                                        <option value={12}>12% Reduced</option>
                                        <option value={5}>5% Essential</option>
                                        <option value={0}>0% Exempt</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsManualModalOpen(false)}
                                    className="flex-1 px-8 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-200"
                                >
                                    Generate & Issue
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Taxable" value="₹24.8L" icon={<Building2 />} color="blue" />
                <StatCard label="GST Collected" value="₹4.4L" icon={<Percent />} color="green" />
                <StatCard label="Pending Payments" value="₹1.2L" icon={<Clock />} color="orange" />
                <StatCard label="Settled This Month" value="₹5.6L" icon={<CheckCircle2 />} color="emerald" />
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
                                <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax (18%)</th>
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
                                            <span className="text-xs font-black text-slate-900">{inv.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-slate-700">{inv.vendor}</span>
                                    </td>
                                    <td className="px-8 py-6 text-xs font-bold text-slate-900">{inv.amount}</td>
                                    <td className="px-8 py-6 text-xs font-medium text-slate-500">{inv.tax}</td>
                                    <td className="px-8 py-6 text-xs font-medium text-slate-400 uppercase px-1">{inv.date}</td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${inv.status === 'PAID' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <button className="p-3 bg-slate-100 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                                            <Download size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-slate-50/50 flex items-center justify-between border-t border-slate-50">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Automated Fiscal Engine v2.0 active</span>
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
