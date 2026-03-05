"use client";
import React, { useEffect, useState } from 'react';
import {
    Receipt,
    Download,
    Mail,
    Search,
    ChevronRight,
    FileText,
    ExternalLink,
    CheckCircle2,
    Clock,
    User,
    Shield,
    Loader2
} from 'lucide-react';

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await fetch("/api/reseller/invoices");
            const json = await res.json();
            setInvoices(json.data || []);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
                        Fiscal Settlements
                    </h1>
                    <p className="text-slate-500 font-bold text-sm">
                        Access and download tax-compliant invoices for your vendor transactions.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-[#E9F5ED] border border-[#D1EADC] rounded-xl flex items-center gap-2">
                        <Shield size={14} className="text-[#27954D]" />
                        <span className="text-[10px] font-black uppercase text-[#1E743C] tracking-widest leading-none">Audited Billing</span>
                    </div>
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Locate invoice sequence..."
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 text-sm font-medium focus:border-[#27954D] outline-none transition-all shadow-inner placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5">Reference</th>
                                <th className="px-8 py-5">Managed Vendor</th>
                                <th className="px-8 py-5">Total Value</th>
                                <th className="px-8 py-5">Settlement Status</th>
                                <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {invoices.map((invoice: any) => (
                                <tr key={invoice.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-[#27954D] group-hover:text-white transition-all">
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <div className="text-slate-900 font-bold tracking-tight">{invoice.invoice_number}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tighter tabular-nums">
                                                    {new Date(invoice.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="text-slate-800 font-bold">{invoice.workspace?.business_name || invoice.workspace?.name}</div>
                                            <div className="px-1.5 py-0.5 bg-slate-100 rounded text-[8px] font-black text-slate-400 tabular-nums uppercase border border-slate-200">ID: {invoice.workspace_id.slice(0, 8)}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-lg font-black tracking-tight text-slate-900">₹{Number(invoice.total_amount).toLocaleString()}</div>
                                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 italic">INC. GST</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border flex items-center gap-1.5 w-fit ${invoice.payment_status === 'PAID' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {invoice.payment_status === 'PAID' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                            {invoice.payment_status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2.5 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-all border border-slate-200 shadow-sm">
                                                <Download size={16} />
                                            </button>
                                            <button
                                                onClick={() => window.open(invoice.pdf_url, '_blank')}
                                                disabled={!invoice.pdf_url}
                                                className="p-2.5 bg-[#27954D] hover:bg-[#1f7a3f] text-white rounded-xl transition-all active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed shadow-lg shadow-[#27954D]/10"
                                            >
                                                <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-60">
                                            <Receipt size={48} className="text-slate-200 mb-4" />
                                            <div className="text-xs font-black uppercase text-slate-400 tracking-[0.3em]">No Billing Records Found</div>
                                            <p className="text-[10px] font-bold text-slate-400 mt-2 max-w-xs leading-relaxed italic uppercase">
                                                Financial events will appear here once your vendors initiate settlements.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
