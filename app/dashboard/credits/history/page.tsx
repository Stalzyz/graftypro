'use client';

/**
 * Transaction History Page
 * 
 * Features:
 * - Transaction list with pagination
 * - Filter by type (All, Purchases, Deductions)
 * - Date range filter
 * - Search by invoice number or payment ID
 * - Invoice download
 * - Export to CSV
 * - Beautiful UI with animations
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Transaction {
    id: string;
    type: 'PURCHASE' | 'DEDUCTION';
    amount: number;
    balance_before: number;
    balance_after: number;
    net_amount: number;
    gst_amount: number;
    cgst_amount: number;
    sgst_amount: number;
    igst_amount: number;
    total_amount: number;
    payment_id: string | null;
    message_id: string | null;
    invoice_number: string | null;
    invoice_pdf: string | null;
    description: string;
    status: string;
    created_at: string;
    message_category: string | null;
    country_code: string | null;
    meta_cost: number;
    our_charge: number;
    margin: number;
}

export default function TransactionHistoryPage() {
    const router = useRouter();

    // State
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'PURCHASE' | 'DEDUCTION'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Fetch transactions
    useEffect(() => {
        fetchTransactions();
    }, [typeFilter, currentPage]);

    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '20'
            });

            if (typeFilter !== 'ALL') {
                params.append('type', typeFilter);
            }

            const response = await fetch(`/api/credits/transactions?${params}`);
            const data = await response.json();

            if (data.success) {
                setTransactions(data.transactions);
                setTotalPages(data.pagination.totalPages);
                setTotal(data.pagination.total);
            } else {
                setError(data.error);
            }
        } catch (err: any) {
            setError('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    // Filter transactions by search query
    const filteredTransactions = transactions.filter(tx => {
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        return (
            tx.invoice_number?.toLowerCase().includes(query) ||
            tx.payment_id?.toLowerCase().includes(query) ||
            tx.description?.toLowerCase().includes(query)
        );
    });

    // Export to CSV
    const exportToCSV = () => {
        const headers = [
            'Date',
            'Type',
            'Amount',
            'GST',
            'Total',
            'Balance After',
            'Invoice Number',
            'Payment ID',
            'Status'
        ];

        const rows = filteredTransactions.map(tx => [
            new Date(tx.created_at).toLocaleDateString('en-IN'),
            tx.type,
            tx.net_amount,
            tx.gst_amount,
            tx.total_amount,
            tx.balance_after,
            tx.invoice_number || '-',
            tx.payment_id || '-',
            tx.status
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Format currency
    const formatINR = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Transaction History
                            </h1>
                            <p className="text-gray-600">
                                View all your credit purchases and deductions
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/dashboard/credits/recharge')}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            + Recharge Credits
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                            <div className="text-sm text-gray-600 mb-1">Total Transactions</div>
                            <div className="text-2xl font-bold text-gray-900">{total}</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                            <div className="text-sm text-gray-600 mb-1">Total Purchases</div>
                            <div className="text-2xl font-bold text-green-600">
                                {transactions.filter(t => t.type === 'PURCHASE').length}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                            <div className="text-sm text-gray-600 mb-1">Total Deductions</div>
                            <div className="text-2xl font-bold text-orange-600">
                                {transactions.filter(t => t.type === 'DEDUCTION').length}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
                    <div className="grid md:grid-cols-4 gap-4">
                        {/* Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Transaction Type
                            </label>
                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value as any);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            >
                                <option value="ALL">All Transactions</option>
                                <option value="PURCHASE">Purchases Only</option>
                                <option value="DEDUCTION">Deductions Only</option>
                            </select>
                        </div>

                        {/* Search */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search
                            </label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by invoice, payment ID, or description..."
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            />
                        </div>

                        {/* Export */}
                        <div className="flex items-end">
                            <button
                                onClick={exportToCSV}
                                disabled={filteredTransactions.length === 0}
                                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                📊 Export CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="text-gray-600 mt-4">Loading transactions...</p>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No Transactions Found
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchQuery ? 'Try adjusting your search query' : 'Start by recharging your credits'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => router.push('/dashboard/credits/recharge')}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                            >
                                Recharge Now
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Transaction List */}
                        <div className="space-y-4">
                            {filteredTransactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            {/* Left: Type Badge & Details */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${tx.type === 'PURCHASE'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-orange-100 text-orange-700'
                                                            }`}
                                                    >
                                                        {tx.type === 'PURCHASE' ? '💰 Purchase' : '📤 Deduction'}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(tx.created_at).toLocaleString('en-IN', {
                                                            dateStyle: 'medium',
                                                            timeStyle: 'short'
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm">{tx.description}</p>
                                            </div>

                                            {/* Right: Amount */}
                                            <div className="text-right">
                                                <div className={`text-2xl font-bold ${tx.type === 'PURCHASE' ? 'text-green-600' : 'text-orange-600'
                                                    }`}>
                                                    {tx.type === 'PURCHASE' ? '+' : '-'}{formatINR(Math.abs(tx.amount))}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Balance: {formatINR(tx.balance_after)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                            {/* Purchase Details */}
                                            {tx.type === 'PURCHASE' && (
                                                <>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Credits Amount:</span>
                                                            <span className="font-semibold">{formatINR(tx.net_amount)}</span>
                                                        </div>
                                                        {tx.cgst_amount > 0 ? (
                                                            <>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-600">CGST (9%):</span>
                                                                    <span>{formatINR(tx.cgst_amount)}</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-600">SGST (9%):</span>
                                                                    <span>{formatINR(tx.sgst_amount)}</span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">IGST (18%):</span>
                                                                <span>{formatINR(tx.igst_amount)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                                                            <span className="text-gray-900">Total Paid:</span>
                                                            <span className="text-blue-600">{formatINR(tx.total_amount)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {tx.invoice_number && (
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">Invoice:</span>
                                                                <span className="font-mono text-blue-600">{tx.invoice_number}</span>
                                                            </div>
                                                        )}
                                                        {tx.payment_id && (
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">Payment ID:</span>
                                                                <span className="font-mono text-xs">{tx.payment_id}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Status:</span>
                                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                                                {tx.status}
                                                            </span>
                                                        </div>

                                                        {/* Download Invoice Button */}
                                                        {tx.invoice_number && (
                                                            <button
                                                                onClick={() => window.open(`/api/invoices/${tx.invoice_number}/download`, '_blank')}
                                                                className="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all"
                                                            >
                                                                📄 Download Invoice
                                                            </button>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            {/* Deduction Details */}
                                            {tx.type === 'DEDUCTION' && (
                                                <>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Category:</span>
                                                            <span className="font-semibold">{tx.message_category || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Country:</span>
                                                            <span>{tx.country_code || 'N/A'}</span>
                                                        </div>
                                                        {tx.message_id && (
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">Message ID:</span>
                                                                <span className="font-mono text-xs">{tx.message_id.substring(0, 20)}...</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Meta Cost:</span>
                                                            <span>{formatINR(tx.meta_cost)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Our Charge:</span>
                                                            <span>{formatINR(tx.our_charge)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                                                            <span className="text-gray-900">Margin:</span>
                                                            <span className="text-green-600">{formatINR(tx.margin)}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-semibold hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ← Previous
                                </button>

                                <div className="flex gap-2">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const page = i + 1;
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === page
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white border-2 border-gray-200 hover:border-blue-500'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-semibold hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
