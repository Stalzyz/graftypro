"use client";

/**
 * Super Admin Finance Dashboard
 * 
 * Features:
 * - Multi-tab finance management
 * - Wallet management (Adjust, Freeze)
 * - GST Reports (Finalize, View)
 * - Audit Logs (Global history)
 */

import { useState, useEffect } from "react";
import {
    BarChart3,
    Wallet,
    FileText,
    ShieldAlert,
    Search,
    RefreshCw,
    Plus,
    Minus,
    Lock,
    Unlock,
    CheckCircle,
    Clock,
    ExternalLink
} from "lucide-react";

type Tab = 'WALLETS' | 'REPORTS' | 'AUDIT' | 'PRICING' | 'TRANSACTIONS' | 'RISK';

export default function AdminFinanceDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('WALLETS');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Wallets State
    const [wallets, setWallets] = useState<any[]>([]);
    const [walletSearch, setWalletSearch] = useState("");
    const [walletPage, setWalletPage] = useState(1);
    const [totalWallets, setTotalWallets] = useState(0);

    // Transactions State
    const [globalTransactions, setGlobalTransactions] = useState<any[]>([]);
    const [txPage, setTxPage] = useState(1);
    const [totalTx, setTotalTx] = useState(0);

    // Risk State
    const [riskProfiles, setRiskProfiles] = useState<any[]>([]);

    // Reports State
    const [reports, setReports] = useState<any[]>([]);

    // Audit State
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    // Pricing State
    const [pricing, setPricing] = useState<any[]>([]);

    // Stats State
    const [stats, setStats] = useState<any>(null);

    // Fetch Logic
    useEffect(() => {
        if (activeTab === 'WALLETS') {
            fetchWallets();
            fetchFinanceStats();
        }
        if (activeTab === 'REPORTS') fetchReports();
        if (activeTab === 'AUDIT') fetchAuditLogs();
        if (activeTab === 'PRICING') fetchPricing();
        if (activeTab === 'TRANSACTIONS') fetchTransactions();
        if (activeTab === 'RISK') fetchRiskData();
    }, [activeTab, walletPage, txPage]);

    const fetchFinanceStats = async () => {
        try {
            const res = await fetch(`/api/super-admin/finance/stats`);
            const data = await res.json();
            if (data.success) setStats(data.stats);
        } catch (err) {
            console.error("Failed to fetch stats");
        }
    };

    const fetchWallets = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/super-admin/finance/wallets?page=${walletPage}&search=${walletSearch}`);
            const data = await res.json();
            if (data.success) {
                setWallets(data.wallets);
                setTotalWallets(data.pagination.total);
            }
        } catch (err) {
            setError("Failed to fetch wallets");
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/super-admin/finance/transactions?page=${txPage}`);
            const data = await res.json();
            if (data.success) {
                setGlobalTransactions(data.transactions);
                setTotalTx(data.pagination.total);
            }
        } catch (err) {
            setError("Failed to fetch transactions");
        } finally {
            setLoading(false);
        }
    };

    const fetchRiskData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/super-admin/finance/risk`);
            const data = await res.json();
            if (data.success) setRiskProfiles(data.risk_profiles);
        } catch (err) {
            setError("Failed to fetch risk data");
        } finally {
            setLoading(false);
        }
    };

    // ... rest of fetch functions ...

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/super-admin/finance/reports`);
            const data = await res.json();
            if (data.success) setReports(data.reports);
        } catch (err) {
            setError("Failed to fetch reports");
        } finally {
            setLoading(false);
        }
    };

    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/super-admin/finance/audit-logs`);
            const data = await res.json();
            if (data.success) setAuditLogs(data.logs);
        } catch (err) {
            setError("Failed to fetch audit logs");
        } finally {
            setLoading(false);
        }
    };

    const fetchPricing = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/super-admin/credits/pricing`);
            const data = await res.json();
            if (data.success) setPricing(data.data);
        } catch (err) {
            setError("Failed to fetch pricing");
        } finally {
            setLoading(false);
        }
    };

    // Actions
    // ... keep existing actions ...

    const handleFreeze = async (walletId: string, isFrozen: boolean) => {
        const reason = window.prompt(`Reason for ${isFrozen ? 'freezing' : 'unfreezing'} wallet:`);
        if (!reason) return;

        try {
            const res = await fetch(`/api/super-admin/finance/wallets/${walletId}/freeze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_frozen: isFrozen, reason })
            });
            const data = await res.json();
            if (data.success) fetchWallets();
            else alert(data.error);
        } catch (err) {
            alert("Operation failed");
        }
    };

    const handleAdjust = async (workspaceId: string, type: 'CREDIT' | 'DEBIT') => {
        const amountStr = window.prompt(`Enter amount to ${type === 'CREDIT' ? 'add' : 'deduct'}:`);
        if (!amountStr) return;
        const amount = parseFloat(amountStr);
        if (isNaN(amount)) return;

        const finalAmount = type === 'CREDIT' ? amount : -amount;
        const reason = window.prompt("Reason for adjustment:");

        try {
            const res = await fetch(`/api/super-admin/credits/adjust`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId,
                    amount: finalAmount,
                    type: type === 'CREDIT' ? 'ADDITION' : 'DEDUCTION',
                    reason
                })
            });
            const data = await res.json();
            if (data.success) fetchWallets();
            else alert(data.error);
        } catch (err) {
            alert("Adjustment failed");
        }
    };

    const finalizeReport = async (reportId: string) => {
        if (!window.confirm("Are you sure you want to finalize this report? This action is immutable.")) return;

        try {
            const res = await fetch(`/api/super-admin/finance/reports/${reportId}/finalize`, { method: 'POST' });
            const data = await res.json();
            if (data.success) fetchReports();
            else alert(data.error);
        } catch (err) {
            alert("Finalization failed");
        }
    };

    const updatePricing = async (p: any) => {
        const meta = window.prompt("Enter Meta Cost:", p.meta_cost);
        const plat = window.prompt("Enter Platform Margin:", p.platform_margin);
        const res = window.prompt("Enter Reseller Margin:", p.reseller_margin);

        if (meta === null || plat === null || res === null) return;

        try {
            const res_api = await fetch(`/api/super-admin/credits/pricing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message_type: p.message_type,
                    country: p.country,
                    country_code: p.country_code,
                    meta_cost: parseFloat(meta),
                    platform_margin: parseFloat(plat),
                    reseller_margin: parseFloat(res)
                })
            });
            const data = await res_api.json();
            if (data.success) fetchPricing();
            else alert(data.error);
        } catch (err) {
            alert("Update failed");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b px-8 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <BarChart3 className="text-blue-600" />
                            Finance Control Center
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Super Admin Dashboard for Platform Economy</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                if (activeTab === 'WALLETS') {
                                    fetchWallets();
                                    fetchFinanceStats();
                                }
                                if (activeTab === 'REPORTS') fetchReports();
                                if (activeTab === 'PRICING') fetchPricing();
                                if (activeTab === 'AUDIT') fetchAuditLogs();
                                if (activeTab === 'TRANSACTIONS') fetchTransactions();
                                if (activeTab === 'RISK') fetchRiskData();
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b px-8">
                <div className="max-w-7xl mx-auto flex gap-8">
                    <button
                        onClick={() => setActiveTab('WALLETS')}
                        className={`py-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'WALLETS' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    >
                        <Wallet size={18} />
                        Vendor Wallets
                    </button>
                    <button
                        onClick={() => setActiveTab('TRANSACTIONS')}
                        className={`py-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'TRANSACTIONS' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    >
                        <ExternalLink size={18} />
                        Platform Transactions
                    </button>
                    <button
                        onClick={() => setActiveTab('RISK')}
                        className={`py-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'RISK' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    >
                        <ShieldAlert size={18} />
                        Risk & Fraud
                    </button>
                    <button
                        onClick={() => setActiveTab('REPORTS')}
                        className={`py-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'REPORTS' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    >
                        <FileText size={18} />
                        GST Monthly Reports
                    </button>
                    <button
                        onClick={() => setActiveTab('PRICING')}
                        className={`py-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'PRICING' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    >
                        <BarChart3 size={18} />
                        Pricing Config
                    </button>
                    <button
                        onClick={() => setActiveTab('AUDIT')}
                        className={`py-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'AUDIT' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    >
                        <ShieldAlert size={18} />
                        Audit Logs
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-8 max-w-7xl mx-auto">
                {/* Finance Summary Bar */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">In Circulation</div>
                            <div className="text-2xl font-black text-slate-900">₹{stats.circulation.toLocaleString()}</div>
                            <div className="text-[10px] text-green-600 font-bold mt-1">Available Credits</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Sales</div>
                            <div className="text-2xl font-black text-blue-600">₹{stats.total_sales.toLocaleString()}</div>
                            <div className="text-[10px] text-slate-400 font-bold mt-1">Gross Collections</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">GST Collected</div>
                            <div className="text-2xl font-black text-orange-600">₹{stats.total_gst.toLocaleString()}</div>
                            <div className="text-[10px] text-slate-400 font-bold mt-1">Tax Liability</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Activity (MTD)</div>
                            <div className="text-2xl font-black text-indigo-600">{stats.monthly_transactions.toLocaleString()}</div>
                            <div className="text-[10px] text-slate-400 font-bold mt-1">Total Transactions</div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6 flex gap-2 items-center">
                        <ShieldAlert size={20} />
                        {error}
                    </div>
                )}

                {/* Tab: Transactions */}
                {activeTab === 'TRANSACTIONS' && (
                    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Workspace</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ref ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {globalTransactions.map((tx) => (
                                    <tr key={tx.id} className="text-sm hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                                            {new Date(tx.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700">
                                            {tx.workspace_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ${tx.type === 'PURCHASE' ? 'bg-green-50 text-green-600' :
                                                tx.type === 'DEDUCTION' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-mono font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 italic text-xs max-w-xs truncate">
                                            {tx.description}
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-mono text-slate-400">
                                            {tx.related_payment_id || tx.related_message_id || tx.id}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tab: Wallets */}
                {activeTab === 'WALLETS' && (
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by workspace, GSTIN, or name..."
                                    value={walletSearch}
                                    onChange={(e) => setWalletSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchWallets()}
                                    className="w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                />
                            </div>
                            <button
                                onClick={fetchWallets}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                            >
                                Search
                            </button>
                        </div>

                        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Workspace</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Reseller</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Balance</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {wallets.map((wallet) => (
                                        <tr key={wallet.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{wallet.workspace_name}</div>
                                                <div className="text-xs text-slate-400">{wallet.workspace_id}</div>
                                                {wallet.gstin && <div className="text-[10px] mt-1 bg-blue-50 text-blue-600 inline-block px-1 rounded uppercase font-bold">GSTIN: {wallet.gstin}</div>}
                                            </td>
                                            <td className="px-6 py-4 mt-1">
                                                <span className="text-sm font-medium text-slate-600">{wallet.reseller}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="font-mono font-bold text-slate-900">₹{wallet.balance.toLocaleString()}</div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">Used: ₹{wallet.used.toLocaleString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {wallet.is_frozen ? (
                                                    <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-xs font-black uppercase">
                                                        <Lock size={12} />
                                                        Frozen
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-2.5 py-1 rounded-full text-xs font-black uppercase">
                                                        <CheckCircle size={12} />
                                                        Active
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleAdjust(wallet.workspace_id, 'CREDIT')}
                                                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-all"
                                                        title="Add Credits"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAdjust(wallet.workspace_id, 'DEBIT')}
                                                        className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-all"
                                                        title="Deduct Credits"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleFreeze(wallet.id, !wallet.is_frozen)}
                                                        className={`${wallet.is_frozen ? 'bg-slate-900' : 'bg-red-600'} hover:opacity-90 text-white p-2 rounded-lg transition-all`}
                                                        title={wallet.is_frozen ? "Unfreeze" : "Freeze"}
                                                    >
                                                        {wallet.is_frozen ? <Unlock size={16} /> : <Lock size={16} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {wallets.length === 0 && !loading && (
                                <div className="py-20 text-center text-slate-400">
                                    <Wallet size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="font-bold">No wallets found matching your search</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab: GST Reports */}
                {activeTab === 'REPORTS' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map((report) => (
                            <div key={report.id} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-black uppercase">
                                        {new Date(report.year, report.month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                    </div>
                                    {report.status === 'FINALIZED' ? (
                                        <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                                            <CheckCircle size={14} />
                                            Finalized
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-orange-600 text-xs font-bold">
                                            <Clock size={14} />
                                            Draft
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Total Sales:</span>
                                        <span className="font-bold text-slate-900">₹{Number(report.total_sales).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Total GST:</span>
                                        <span className="font-bold text-blue-600">₹{Number(report.total_gst).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs pt-2 border-t text-slate-400">
                                        <span>Invoices: {report.invoice_count}</span>
                                        <span>Trans: {report.transaction_count}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => report.pdf_url && window.open(report.pdf_url, '_blank')}
                                        className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FileText size={14} />
                                        View PDF
                                    </button>
                                    {report.status === 'DRAFT' && (
                                        <button
                                            onClick={() => finalizeReport(report.id)}
                                            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 transition-all"
                                        >
                                            Finalize
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* Tab: Risk & Fraud */}
                {activeTab === 'RISK' && (
                    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Workspace</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">24h Velocity</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Limit</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Risk Level</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Automated Block</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {riskProfiles.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-700">{p.workspace_name}</td>
                                        <td className="px-6 py-4 font-mono text-slate-900">₹{p.current_velocity.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-slate-400 text-xs font-mono">₹{p.daily_limit.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${p.risk_score > 80 ? 'bg-red-500' : p.risk_score > 50 ? 'bg-orange-500' : 'bg-green-500'}`}
                                                        style={{ width: `${Math.min(p.risk_score, 100)}%` }}
                                                    />
                                                </div>
                                                <span className={`text-[10px] font-black ${p.risk_score > 80 ? 'text-red-600' : 'text-slate-400'}`}>
                                                    {p.risk_score.toFixed(0)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {p.is_automated_blocked ? (
                                                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">Blocked</span>
                                            ) : (
                                                <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">Active</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleFreeze(p.id, !p.is_frozen)}
                                                className={`font-bold text-xs ${p.is_frozen ? 'text-green-600' : 'text-red-600'}`}
                                            >
                                                {p.is_frozen ? 'Unfreeze' : 'Emergency Freeze'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tab: Pricing Config */}
                {activeTab === 'PRICING' && (
                    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Message Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Country</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Meta Cost</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Plat Margin</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Res Profit</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Total Price</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pricing.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">{p.message_type}</span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700">{p.country} ({p.country_code || 'GLOBAL'})</td>
                                        <td className="px-6 py-4 text-right font-mono">₹{Number(p.meta_cost).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right font-mono text-green-600">₹{Number(p.platform_margin).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right font-mono text-blue-600">₹{Number(p.reseller_margin).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right font-mono font-black text-slate-900">₹{Number(p.final_vendor_price).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => updatePricing(p)}
                                                className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center gap-1 ml-auto"
                                            >
                                                <RefreshCw size={12} />
                                                Update
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tab: Audit Logs */}
                {activeTab === 'AUDIT' && (
                    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Timestamp</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Admin</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Reference</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Reason</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {auditLogs.map((log) => (
                                    <tr key={log.id} className="text-sm">
                                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-700">{log.admin_email}</div>
                                            <div className="text-[10px] text-slate-400">{log.admin_id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ${log.action_type.includes('FREEZE') ? 'bg-red-50 text-red-600' :
                                                log.action_type.includes('ADJUST') ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {log.action_type.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                            {log.target_workspace || log.target_id || '-'}
                                        </td>
                                        <td className="px-6 py-4 italic text-slate-400 text-xs">
                                            {log.reason}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
