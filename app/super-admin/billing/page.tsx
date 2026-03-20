"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    Zap,
    ExternalLink,
    Edit2,
    Save,
    X,
    Unplug
} from "lucide-react";

interface Plan {
    id: string;
    name: string;
    description: string;
    monthly_price: number;
    yearly_price: number;
    max_contacts: number;
    max_messages: number;
    max_flows: number;
    max_campaigns: number;
    max_users: number;
    is_active: boolean;
    razorpay_monthly_plan_id?: string;
    razorpay_yearly_plan_id?: string;
}

export default function SuperAdminBillingPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Plan>>({});
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [manualIds, setManualIds] = useState<Record<string, string>>({});

    useEffect(() => { fetchPlans(); }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/super-admin/billing/plans");
            const data = await res.json();
            setPlans(data.plans || []);
        } catch (e) {
            setMessage({ type: "error", text: "Failed to load plans" });
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async (planId: string, cycle: "monthly" | "yearly", manualId?: string) => {
        setSyncing(`${planId}-${cycle}`);
        setMessage(null);
        try {
            const body = manualId 
                ? { plan_id: planId, cycle, manual_rzp_id: manualId }
                : { plan_id: planId, cycle };

            const res = await fetch("/api/super-admin/billing/sync-razorpay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: "success", text: `✅ ${manualId ? 'Connected' : 'Synced'}! Razorpay ID: ${data.razorpay_plan_id}` });
                fetchPlans();
            } else {
                setMessage({ type: "error", text: data.error || "Sync failed" });
            }
        } catch (e: any) {
            setMessage({ type: "error", text: e.message });
        } finally {
            setSyncing(null);
        }
    };

    const handleDisconnect = async (planId: string, cycle: "monthly" | "yearly") => {
        if (!confirm(`Are you sure you want to disconnect the ${cycle} Razorpay plan? Users will not be able to subscribe until you re-sync.`)) return;
        setSyncing(`${planId}-${cycle}`);
        setMessage(null);
        try {
            const res = await fetch("/api/super-admin/billing/plans", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: planId, cycle })
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: "success", text: `🔌 ${cycle} plan disconnected. You can now re-sync with new Razorpay credentials.` });
                fetchPlans();
            } else {
                setMessage({ type: "error", text: data.error || "Disconnect failed" });
            }
        } catch (e: any) {
            setMessage({ type: "error", text: e.message });
        } finally {
            setSyncing(null);
        }
    };

    const startEdit = (plan: Plan) => {
        setEditingId(plan.id);
        setEditForm({
            monthly_price: plan.monthly_price,
            yearly_price: plan.yearly_price,
            description: plan.description,
            max_contacts: plan.max_contacts,
            max_messages: plan.max_messages,
            max_flows: plan.max_flows,
            max_campaigns: plan.max_campaigns,
            max_users: plan.max_users,
        });
    };

    const saveEdit = async (planId: string) => {
        try {
            const res = await fetch("/api/super-admin/billing/plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: planId, ...editForm })
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: "success", text: "Plan updated. Re-sync to Razorpay to apply new price." });
                setEditingId(null);
                fetchPlans();
            } else {
                setMessage({ type: "error", text: data.error });
            }
        } catch (e: any) {
            setMessage({ type: "error", text: e.message });
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#27954D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400 text-xs font-medium">Loading Plans...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Link href="/super-admin/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-[#042f94] font-semibold text-[10px] uppercase tracking-[0.2em] mb-3 transition-colors">
                        <ArrowLeft size={14} /> Back to Command Tower
                    </Link>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight">Subscription Plans</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">
                        Edit plan details and sync Razorpay IDs for autopay subscriptions.
                    </p>
                </div>
                <button onClick={fetchPlans} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-[#27954D] transition-all">
                    <RefreshCw size={18} />
                </button>
            </header>

            {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                    {message.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                    {message.text}
                    <button onClick={() => setMessage(null)} className="ml-auto"><X size={14} /></button>
                </div>
            )}

            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-6 py-4 text-sm font-medium flex gap-3">
                <Zap size={18} className="shrink-0 mt-0.5 text-amber-500" />
                <div>
                    <strong>How Autopay Works:</strong> After you click "Sync to Razorpay", the system creates the recurring plan via the Razorpay API and stores the Plan ID automatically.
                    The next time a user clicks "Upgrade Plan", they will be charged automatically every month/year via Razorpay — <strong>no manual steps needed</strong>.
                    <br/><strong>If you change the price</strong>, update it here, save it, then click "Re-sync" to create a new plan in Razorpay with the updated price.
                </div>
            </div>

            <div className="space-y-6">
                {plans.map(plan => {
                    const isEditing = editingId === plan.id;
                    return (
                        <div key={plan.id} className={`bg-white border rounded-[2rem] p-8 shadow-sm transition-all ${!plan.is_active ? "opacity-50" : ""}`}>
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                                        {plan.is_active ? (
                                            <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-full border border-green-100">Active</span>
                                        ) : (
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-black uppercase rounded-full">Inactive</span>
                                        )}
                                    </div>
                                    {!isEditing && (
                                        <p className="text-slate-400 text-sm mt-1">{plan.description || "No description"}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {isEditing ? (
                                        <>
                                            <button onClick={() => saveEdit(plan.id)} className="flex items-center gap-1.5 bg-[#27954D] text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-green-700 transition-all">
                                                <Save size={14} /> Save
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-slate-200 transition-all">
                                                <X size={14} /> Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => startEdit(plan)} className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-black hover:bg-slate-200 transition-all">
                                            <Edit2 size={14} /> Edit
                                        </button>
                                    )}
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {[
                                        { label: "Monthly Price (₹)", key: "monthly_price" },
                                        { label: "Yearly Price (₹)", key: "yearly_price" },
                                        { label: "Max Contacts", key: "max_contacts" },
                                        { label: "Max Messages/mo", key: "max_messages" },
                                        { label: "Max Flows", key: "max_flows" },
                                        { label: "Max Campaigns", key: "max_campaigns" },
                                        { label: "Max Users", key: "max_users" },
                                    ].map(({ label, key }) => (
                                        <div key={key}>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</label>
                                            <input
                                                type="number"
                                                value={(editForm as any)[key] ?? ""}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-[#27954D] transition-all"
                                            />
                                        </div>
                                    ))}
                                    <div className="col-span-2 md:col-span-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                                        <input
                                            type="text"
                                            value={(editForm as any).description ?? ""}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-[#27954D] transition-all"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                                    {[
                                        { label: "Monthly", value: `₹${Number(plan.monthly_price).toLocaleString()}` },
                                        { label: "Yearly", value: `₹${Number(plan.yearly_price).toLocaleString()}` },
                                        { label: "Contacts", value: plan.max_contacts?.toLocaleString() },
                                        { label: "Messages/mo", value: plan.max_messages?.toLocaleString() },
                                        { label: "Users", value: plan.max_users },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="bg-slate-50 rounded-2xl p-4">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</div>
                                            <div className="text-lg font-black text-slate-900">{value}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Razorpay Sync Section */}
                            <div className="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(["monthly", "yearly"] as const).map((cycle) => {
                                    const rzpId = cycle === "monthly" ? plan.razorpay_monthly_plan_id : plan.razorpay_yearly_plan_id;
                                    const syncKey = `${plan.id}-${cycle}`;
                                    const isSyncing = syncing === syncKey;
                                    const price = cycle === "monthly" ? Number(plan.monthly_price) : Number(plan.yearly_price);

                                    return (
                                        <div key={cycle} className={`rounded-2xl p-5 border ${rzpId ? "border-green-100 bg-green-50" : "border-orange-100 bg-orange-50"}`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <div className="text-xs font-black text-slate-700 uppercase tracking-wider">
                                                        {cycle === "monthly" ? "Monthly" : "Yearly"} Autopay
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                                        ₹{price.toLocaleString()} / {cycle === "monthly" ? "mo" : "yr"}
                                                    </div>
                                                </div>
                                                {rzpId ? (
                                                    <div className="flex items-center gap-1.5 text-green-600">
                                                        <CheckCircle size={14} />
                                                        <span className="text-[10px] font-black uppercase">Synced</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-[10px] font-black text-orange-500 uppercase">Not Synced</div>
                                                )}
                                            </div>
                                            {rzpId && (
                                                <div className="text-[10px] font-mono text-slate-500 bg-white rounded-lg px-3 py-1.5 border border-green-100 mb-3 flex items-center justify-between">
                                                    <span className="truncate">{rzpId}</span>
                                                    <a href={`https://dashboard.razorpay.com/app/subscriptions/plans/${rzpId}`} target="_blank" rel="noreferrer" className="shrink-0 ml-2 text-[#27954D]">
                                                        <ExternalLink size={10} />
                                                    </a>
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                {/* Main action button */}
                                                <button
                                                    onClick={() => !rzpId && handleSync(plan.id, cycle)}
                                                    disabled={isSyncing || (price <= 0 && !manualIds[syncKey]) || !!rzpId}
                                                    className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                                        rzpId ? "bg-green-100 text-green-700 cursor-default" :
                                                        (price <= 0 && !manualIds[syncKey]) ? "bg-slate-100 text-slate-300 cursor-not-allowed" :
                                                        "bg-slate-900 text-white hover:bg-[#27954D]"
                                                    }`}
                                                >
                                                    {isSyncing ? (
                                                        <><RefreshCw size={12} className="animate-spin" /> Working...</>
                                                    ) : rzpId ? (
                                                        <><CheckCircle size={12} /> Plan Connected</>
                                                    ) : price <= 0 && !manualIds[syncKey] ? (
                                                        "Set Price First"
                                                    ) : (
                                                        <><Zap size={12} className="fill-current" /> Sync to Razorpay</>
                                                    )}
                                                </button>

                                                {/* Manual Connect input (shown when not synced) */}
                                                {!rzpId && (
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Paste Razorpay Plan ID"
                                                            value={manualIds[syncKey] || ""}
                                                            onChange={(e) => setManualIds(prev => ({ ...prev, [syncKey]: e.target.value }))}
                                                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-mono outline-none focus:border-[#27954D]"
                                                        />
                                                        <button 
                                                            onClick={() => handleSync(plan.id, cycle, manualIds[syncKey])}
                                                            disabled={!manualIds[syncKey] || isSyncing}
                                                            className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 disabled:opacity-50"
                                                        >
                                                            Connect
                                                        </button>
                                                    </div>
                                                )}
                                                
                                                {/* Force Re-sync + Disconnect (shown when synced) */}
                                                {rzpId && (
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => {
                                                                if (confirm('Force re-sync will CREATE a NEW plan in Razorpay with the current price. Continue?')) {
                                                                    handleDisconnect(plan.id, cycle).then(() => handleSync(plan.id, cycle));
                                                                }
                                                            }}
                                                            disabled={isSyncing}
                                                            className="flex-1 py-1.5 text-[10px] font-black text-slate-400 uppercase hover:text-[#27954D] flex items-center justify-center gap-1 transition-colors border border-slate-200 rounded-xl hover:border-[#27954D]/30"
                                                        >
                                                            <RefreshCw size={10} className={isSyncing ? "animate-spin" : ""} /> Re-sync
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDisconnect(plan.id, cycle)}
                                                            disabled={isSyncing}
                                                            className="flex-1 py-1.5 text-[10px] font-black text-red-400 uppercase hover:text-red-600 flex items-center justify-center gap-1 transition-colors border border-red-100 rounded-xl hover:border-red-200 hover:bg-red-50"
                                                        >
                                                            <Unplug size={10} /> Disconnect
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
