"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function InvoicesListPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/finance/invoices")
            .then(res => res.json())
            .then(data => {
                if (data.data) setInvoices(data.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Invoices</h1>
                <Link
                    href="/dashboard/finance/invoices/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700"
                >
                    + Create Invoice
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4">Invoice #</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr> :
                            invoices.length === 0 ? <tr><td colSpan={6} className="p-4 text-center">No Invoices Found</td></tr> :
                                invoices.map((inv: any) => (
                                    <tr key={inv.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 font-mono">{inv.invoice_number}</td>
                                        <td className="p-4">{new Date(inv.created_at).toLocaleDateString()}</td>
                                        <td className="p-4">{inv.billing_name}</td>
                                        <td className="p-4 font-bold">₹{Number(inv.total_amount).toFixed(2)}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${inv.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {inv.pdf_url ? (
                                                <a href={inv.pdf_url} target="_blank" className="text-blue-600 underline">Download</a>
                                            ) : (
                                                <span className="text-gray-400">Generated (Check Email)</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}
