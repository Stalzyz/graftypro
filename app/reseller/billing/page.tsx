"use client";

import { useState, useEffect } from "react";
import { CreditCard, Download, FileText, AlertCircle, Plus, CheckCircle } from "lucide-react";

export default function ResellerBillingPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [toppingUp, setToppingUp] = useState(false);

    const resellerId = "temp-reseller-id"; // Placeholder

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await fetch(`/api/reseller/invoices?resellerId=${resellerId}`);
            const json = await res.json();
            if (json.success) setInvoices(json.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleTopUp = async () => {
        setToppingUp(true);
        try {
            const res = await fetch("/api/reseller/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resellerId, amount: 1000 }) // Test amount
            });
            if (res.ok) fetchInvoices();
        } catch (e) {
            console.error(e);
        } finally {
            setToppingUp(false);
        }
    };

    return (
        <div className="max-w-5xl animate-fade-in">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <CreditCard className="text-blue-600" />
                        Billing & Invoices
                    </h1>
                    <p className="text-gray-500 mt-1">Manage your wallet and download official invoices.</p>
                </div>

                <button
                    onClick={handleTopUp}
                    disabled={toppingUp}
                    className="btn btn-primary px-6"
                >
                    <Plus size={18} />
                    {toppingUp ? "Processing..." : "Add ₹1,000 Credits"}
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Stats Summary */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="stat-card">
                        <div className="stat-label">Current Balance</div>
                        <div className="stat-value text-blue-600">₹4,250.00</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Low Credit Threshold</div>
                        <div className="stat-value">₹500.00</div>
                    </div>
                    <div className="stat-card bg-green-50 border-green-100">
                        <div className="stat-label text-green-600">Total Spent (Year)</div>
                        <div className="stat-value">₹12,000.00</div>
                    </div>
                </div>

                {/* Invoices Table */}
                <div className="md:col-span-3">
                    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-900">Invoice History</h2>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Showing last 20 entries</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#fcfdfc] border-b border-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Invoice #</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Amount</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {invoices.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No invoices found yet.</td>
                                        </tr>
                                    )}
                                    {invoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <FileText size={18} className="text-gray-400" />
                                                    <span className="font-bold text-gray-900">{inv.invoice_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(inv.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                ₹{Number(inv.amount_total).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="badge badge-success text-[10px]">
                                                    <CheckCircle size={10} className="mr-1" />
                                                    PAID
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-all">
                                                    <Download size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Billing Alerts */}
                <div className="md:col-span-3">
                    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                        <AlertCircle className="text-amber-600 mt-1" size={20} />
                        <div>
                            <h3 className="font-bold text-amber-900 text-sm">Auto-Refill Reminder</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                Your current balance is above the threshold. We will notify you at <strong>{resellerId.includes("temp") ? "partner@bluesky.com" : "your email"}</strong> when it drops below ₹500.00.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
