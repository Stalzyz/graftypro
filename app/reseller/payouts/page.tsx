"use client";

import { useState, useEffect } from "react";
import {
    Wallet,
    ArrowUpRight,
    Clock,
    CheckCircle,
    XCircle,
    Building2,
    CreditCard,
    AlertTriangle,
    Plus,
    Activity,
    ShieldCheck,
    BaggageClaim,
    History
} from "lucide-react";

export default function ResellerPayoutsPage() {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [balance, setBalance] = useState(4250.00); // Mock balance
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);

    // Form State
    const [amount, setAmount] = useState("");
    const [vpa, setVpa] = useState("");
    const resellerId = "temp-reseller-id";

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        try {
            const res = await fetch(`/api/reseller/payouts?resellerId=${resellerId}`);
            const json = await res.json();
            if (json.success) setPayouts(json.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setRequesting(true);
        try {
            const res = await fetch("/api/reseller/payouts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resellerId,
                    amount: parseFloat(amount),
                    paymentMethod: "RAZORPAY_UPI",
                    paymentDetails: { vpa }
                })
            });
            const json = await res.json();
            if (res.ok) {
                alert("Withdrawal Request Sequence Initiated.");
                setAmount("");
                setVpa("");
                fetchPayouts();
            } else {
                alert(json.error || "Failed to initialize withdrawal");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setRequesting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Auditing Ledger...</p>
        </div>
    );

    return (
        <div className="max-w-7xl animate-fade-in space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl">
                            <Wallet className="text-white" size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Earnings Terminal</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-lg max-w-2xl">Withdraw your network commissions and manage your automated payout configuration.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Balance Card & Request Form */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden shadow-3xl group">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-700">
                            <Activity size={180} strokeWidth={1} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-8 h-8 rounded-full bg-[#27954D] flex items-center justify-center">
                                    <ShieldCheck size={14} className="text-white" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Net Settled Balance</span>
                            </div>
                            <div className="text-6xl font-black tracking-tighter mb-4">₹{balance.toLocaleString()}</div>
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <span>Verified Cluster: IND-A2</span>
                                <div className="w-1 h-1 rounded-full bg-slate-700" />
                                <span className="text-[#27954D]">Ready for Payout</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[48px] border border-slate-100 p-10 shadow-sm space-y-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <BaggageClaim size={24} className="text-blue-600" />
                                Withdraw Funds
                            </h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Automatic UPI Settlement</p>
                        </div>

                        <form onSubmit={handleRequest} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Withdrawal Amount (INR)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Min Settlement: ₹1,000"
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-100 transition-all outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destination UPI Address (VPA)</label>
                                <input
                                    type="text"
                                    value={vpa}
                                    onChange={(e) => setVpa(e.target.value)}
                                    placeholder="username@upi"
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-100 transition-all outline-none"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={requesting || !amount}
                                className="w-full bg-slate-900 text-white p-6 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-[#27954D] transition-all disabled:bg-slate-200 shadow-2xl shadow-slate-200"
                            >
                                {requesting ? "PROCESSING SEQUENCE..." : "INITIALIZE SETTLEMENT"}
                            </button>
                        </form>

                        <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-3xl group">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-300 group-hover:text-amber-500 transition-colors">
                                <AlertTriangle size={20} strokeWidth={2} />
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
                                Settlements are processed through the partner gateway within 24 business hours.
                                <span className="block mt-1 text-slate-400 italic">Accuracy of VPA is mandatory for successful routing.</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payout History */}
                <div className="lg:col-span-7">
                    <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <History size={24} className="text-orange-500" />
                                    Ledger Audit
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Activity Stream & Outcomes</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                                <Clock size={20} />
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-50 bg-slate-50/30">
                                        <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Reference Node</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Yield</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {payouts.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-10 py-32 text-center">
                                                <div className="flex flex-col items-center justify-center text-slate-200 gap-4">
                                                    <History size={64} strokeWidth={1} />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Ledger Entries Recorded</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {payouts.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                        <CreditCard size={20} strokeWidth={1.5} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-900 truncate max-w-[120px] uppercase">#{p.id.substring(0, 8)}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{p.payment_method?.replace(/_/g, ' ') || 'STANDARD'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="text-base font-black text-slate-900">₹{Number(p.amount).toLocaleString()}</div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <StatusBadge status={p.status} />
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="text-[11px] text-slate-400 font-black uppercase tracking-widest">
                                                    {new Date(p.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'PAID':
            return <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#27954D]/10 text-[#27954D] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#27954D]/10"><CheckCircle size={12} strokeWidth={3} /> Success</div>;
        case 'PENDING':
            return <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100"><Clock size={12} strokeWidth={3} /> Queued</div>;
        case 'REJECTED':
            return <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100"><XCircle size={12} strokeWidth={3} /> Failed</div>;
        default:
            return <div className="px-4 py-2 bg-slate-100 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">{status}</div>;
    }
}
