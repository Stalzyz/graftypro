"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Coins, TrendingUp, TrendingDown, Plus, History, CreditCard, Zap } from "lucide-react";

interface WalletData {
    current_balance: number;
    total_purchased: number;
    total_used: number;
    is_frozen: boolean;
    freeze_reason?: string;
}

interface Transaction {
    id: string;
    type: string;
    amount: number;
    balance_before: number;
    balance_after: number;
    description: string;
    created_at: string;
}

function CreditsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        fetchWalletData();
        if (searchParams.get("success") === "true") {
            setShowSuccess(true);
            // Clear the URL after 5 seconds
            const timer = setTimeout(() => setShowSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    const fetchWalletData = async () => {
        try {
            const res = await fetch("/api/credits/wallet");
            const data = await res.json();

            if (data.success) {
                setWallet(data.wallet);
                setTransactions(data.transactions || []);
            }
        } catch (error) {
            console.error("Failed to fetch wallet data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTopUp = () => {
        router.push("/dashboard/credits/recharge");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const balance = Number(wallet?.current_balance || 0);
    const purchased = Number(wallet?.total_purchased || 0);
    const used = Number(wallet?.total_used || 0);

    return (
        <div className="space-y-8">
            {/* Success Notification */}
            {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <Plus size={20} className="text-green-600" />
                        </div>
                        <div>
                            <p className="font-bold text-green-900">Recharge Successful!</p>
                            <p className="text-sm text-green-700">Your credits have been added to your wallet. It may take a minute to reflect.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        💎 Credits Wallet
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 text-lg">
                        Manage your messaging credits and transaction history
                    </p>
                </div>
                <button
                    onClick={handleTopUp}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
                >
                    <Plus size={20} />
                    Top Up Credits
                </button>
            </div>

            {/* Frozen Warning */}
            {wallet?.is_frozen && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                        <div className="bg-red-100 p-2 rounded-lg">
                            <Zap size={20} className="text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-900">Wallet Frozen</h3>
                            <p className="text-sm text-red-700 mt-1">
                                {wallet.freeze_reason || "Your wallet has been temporarily frozen. Please contact support."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Balance */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-white/20 p-3 rounded-xl">
                            <Coins size={24} />
                        </div>
                    </div>
                    <div className="text-sm font-medium opacity-90 uppercase tracking-wider">Available Balance</div>
                    <div className="text-4xl font-black mt-2">{balance.toLocaleString()}</div>
                    <div className="text-xs opacity-75 mt-1">Credits</div>
                </div>

                {/* Total Purchased */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-50 p-3 rounded-xl">
                            <TrendingUp size={24} className="text-green-600" />
                        </div>
                    </div>
                    <div className="text-sm font-medium text-slate-600 uppercase tracking-wider">Total Purchased</div>
                    <div className="text-3xl font-black text-slate-900 mt-2">{purchased.toLocaleString()}</div>
                    <div className="text-xs text-slate-500 mt-1">All-time</div>
                </div>

                {/* Total Used */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-orange-50 p-3 rounded-xl">
                            <TrendingDown size={24} className="text-orange-600" />
                        </div>
                    </div>
                    <div className="text-sm font-medium text-slate-600 uppercase tracking-wider">Total Used</div>
                    <div className="text-3xl font-black text-slate-900 mt-2">{used.toLocaleString()}</div>
                    <div className="text-xs text-slate-500 mt-1">Messages sent</div>
                </div>
            </div>

            {/* Transaction History Section */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg">
                            <History size={20} className="text-slate-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Recent Transactions</h2>
                            <p className="text-sm text-slate-500">Your latest credit activity</p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/credits/history"
                        className="text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1 transition-colors"
                    >
                        View Full History &rarr;
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    {transactions.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <History size={24} className="text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-medium">No transactions yet</p>
                            <p className="text-sm text-slate-400 mt-1">Your credit activity will appear here</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Balance After
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.slice(0, 10).map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${tx.type === "PURCHASE"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-orange-100 text-orange-700"
                                                    }`}
                                            >
                                                {tx.type === "PURCHASE" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700">{tx.description}</td>
                                        <td className={`px-6 py-4 text-right font-bold ${tx.amount > 0 ? "text-green-600" : "text-orange-600"
                                            }`}>
                                            {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-slate-900">
                                            {tx.balance_after.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(tx.created_at).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric"
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 p-3 rounded-xl shadow-sm">
                        <CreditCard size={24} className="text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-indigo-900 text-lg">How Credits Work</h3>
                        <p className="text-slate-600 mt-1 leading-relaxed">
                            Credits are automatically deducted when you send WhatsApp messages.
                            Each message cost depends on the category (Marketing, Utility, Auth, Service) and the destination country.
                            Top up your wallet to ensure uninterrupted messaging for your campaigns.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CreditsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <CreditsContent />
        </Suspense>
    );
}
