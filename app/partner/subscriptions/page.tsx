"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Plus, Ticket, Users, Trash2, Layout, Zap,
    ShoppingBag, Loader2, Code, Copy, CheckCircle,
    ArrowUpRight, Target, Activity, AlertCircle, ChevronRight, Check,
    TrendingUp, ShieldCheck, ArrowRight
} from "lucide-react";
import { safeToLocaleString, formatCurrency, ensureNumber } from '@/lib/utils/number-format';


export default function SubscriptionsPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showEmbed, setShowEmbed] = useState(false);
    const [platformId, setPlatformId] = useState("");
    const [basePlans, setBasePlans] = useState<any[]>([]);

    // Wizard State
    const [step, setStep] = useState(1);

    const [newPlan, setNewPlan] = useState({
        name: "",
        description: "",
        monthly_price: 2999,
        yearly_price: 29990,
        base_plan_id: ""
    });

    const [creating, setCreating] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        fetch("/api/reseller/me")
            .then(res => res.json())
            .then(data => {
                setPlatformId(data.data?.id);
                setWalletBalance(Number(data.data?.wallet_balance || 0));
            });

        // Fetch super admin base plans via reseller-authenticated endpoint
        fetch("/api/reseller/base-plans")
            .then(res => res.json())
            .then(data => setBasePlans(data.data || []));

        fetch("/api/reseller/subscriptions")
            .then(res => res.json())
            .then(data => {
                setPlans(data.data || []);
                setLoading(false);
            });
    }, []);

    const selectedBasePlan = basePlans.find(b => b.id === newPlan.base_plan_id);
    const wholesaleCost = Number(selectedBasePlan?.min_reseller_price || 0);
    const monthlyMargin = newPlan.monthly_price - wholesaleCost;
    const marginPercent = wholesaleCost > 0 ? Math.round((monthlyMargin / newPlan.monthly_price) * 100) : 100;

    const handleCreate = async () => {
        if (!newPlan.name) return alert("Plan name is required");
        if (!newPlan.base_plan_id) return alert("Please select a base engine");
        setCreating(true);
        try {
            const res = await fetch("/api/reseller/subscriptions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPlan)
            });
            const data = await res.json();
            if (res.ok) {
                setPlans([data.data, ...plans]);
                closeModal();
            } else {
                alert(data.error);
            }
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this subscription plan? Existing users on this plan will not be affected but no new signups will be allowed.")) return;
        try {
            const res = await fetch(`/api/reseller/subscriptions?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setPlans(plans.filter(p => p.id !== id));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const openModal = () => {
        setStep(1);
        setNewPlan({
            name: "",
            description: "",
            monthly_price: 2999,
            yearly_price: 29990,
            base_plan_id: ""
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setTimeout(() => setStep(1), 300); // Reset step after animation
    };

    const embedCode = `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed/subscription.js" 
data-platform-id="${platformId}"
data-theme="light">
</script>`;

    const [copied, setCopied] = useState(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(embedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-24">

            {/* Premium Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
                        Subscription Management
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                        Manage Plans<span className="text-indigo-600">.</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm tracking-tight">Design, price, and deploy custom retail subscriptions for your vendor network.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowEmbed(true)}
                        className="px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm shadow-slate-200/50 active:scale-95 flex items-center gap-2"
                    >
                        <Code size={16} /> Embed UI
                    </button>
                    <button
                        onClick={openModal}
                        className="px-8 py-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 border border-slate-800"
                    >
                        <Plus size={16} className="text-indigo-400" /> Deploy Plan
                    </button>
                </div>
            </div>

            {/* Metrics Glass Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    icon={<Activity />}
                    color="text-emerald-500"
                    bg="bg-emerald-50"
                    border="border-emerald-100"
                    label="Active Licenses"
                    value={`${plans.length} Tiers`}
                />
                <MetricCard
                    icon={<Users />}
                    color="text-indigo-500"
                    bg="bg-indigo-50"
                    border="border-indigo-100"
                    label="Portfolio Base"
                    value="52 Users"
                />
                <MetricCard
                    icon={<TrendingUp />}
                    color="text-amber-500"
                    bg="bg-amber-50"
                    border="border-amber-100"
                    label="Retention Rate"
                    value="98.4%"
                />
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:border-indigo-200/60 transition-all duration-500">
                        {/* Decorative background element */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-100 to-purple-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700" />

                        <div className="absolute top-6 right-6 p-2 rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-300 group-hover:text-indigo-500 group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-colors z-10">
                            <Target size={20} />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 pr-12">
                                {plan.name.includes('_') ? plan.name.split('_')[1] : plan.name}
                            </h3>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed line-clamp-2 h-10 mb-8">
                                {plan.description || "System standard licensing structure."}
                            </p>

                            <div className="flex items-baseline gap-1.5 mb-8">
                                <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{plan.monthly_price}</span>
                                <span className="text-slate-400 font-semibold text-sm">/mo</span>
                            </div>

                            <div className="space-y-3.5 mb-8">
                                <PlanFeature icon={<Users size={16} />} text={`${plan.max_users} Agents`} />
                                <PlanFeature icon={<Ticket size={16} />} text={`${plan.max_contacts} Unique Leads`} />
                                {plan.flow_builder_access && <PlanFeature icon={<Layout size={16} />} text="Chat Flows" />}
                                {plan.commerce_access && <PlanFeature icon={<ShoppingBag size={16} />} text="Commerce Features" />}
                                {plan.drip_campaign_access && <PlanFeature icon={<Zap size={16} />} text="Drip Campaigns" />}
                            </div>

                            <div className="flex items-center gap-3 pt-6 border-t border-slate-100/80">
                                <button className="flex-1 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-700 bg-white hover:bg-slate-50 rounded-2xl transition-all border border-slate-200 shadow-sm active:scale-[0.98]">
                                    Modify
                                </button>
                                <button
                                    onClick={() => handleDelete(plan.id)}
                                    className="p-3.5 text-slate-400 hover:text-white hover:bg-rose-500 rounded-2xl transition-all border border-slate-200 hover:border-transparent hover:shadow-lg hover:shadow-rose-500/20 active:scale-95 bg-white"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {plans.length === 0 && (
                    <div className="lg:col-span-3 py-32 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-sm border border-slate-100 text-slate-300 mb-6 rotate-3">
                            <Ticket size={32} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-2">No Active Plans Found</h3>
                        <p className="text-sm text-slate-500 font-medium max-w-sm">Deploy your first commercial tier to start onboarding vendors and generating revenue.</p>
                        <button onClick={openModal} className="mt-8 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95">
                            Deploy Plan
                        </button>
                    </div>
                )}
            </div>

            {/* Multi-Step Creation Wizard */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="absolute inset-0" onClick={closeModal}></div>
                    <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border border-slate-200/50">

                        {/* Header & Progress */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-xl z-20">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Deploy Custom Plan</h2>
                                <p className="text-xs text-slate-500 font-medium mt-1">
                                    {step === 1 && "Step 1: Select Base Plan"}
                                    {step === 2 && "Step 2: Configure Retail Pricing"}
                                    {step === 3 && "Step 3: Review & Finalize"}
                                </p>
                            </div>

                            {/* Stepper Dots */}
                            <div className="flex gap-2 mr-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`h-2 rounded-full transition-all duration-500 ${step === i ? 'w-8 bg-indigo-600' : step > i ? 'w-2 bg-indigo-200' : 'w-2 bg-slate-200'}`} />
                                ))}
                            </div>

                            <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-100 transition-all text-slate-400">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        {/* Scrolling Content Area */}
                        <div className="p-8 overflow-y-auto flex-1 bg-slate-50/30">

                            {/* STEP 1: Select Base Engine */}
                            {step === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                                    <div className="mb-6 p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Wallet Balance</span>
                                                <span className="text-sm font-black text-slate-900">{formatCurrency(walletBalance)}</span>

                                            </div>
                                        </div>
                                        <Link href="/partner/settings/billing" className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-colors">
                                            Top Up Wallet
                                        </Link>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {basePlans.map(base => {
                                            const active = newPlan.base_plan_id === base.id;
                                            const canAfford = walletBalance >= Number(base.min_reseller_price || 0);

                                            return (
                                                <div
                                                    key={base.id}
                                                    onClick={() => canAfford && setNewPlan({ ...newPlan, base_plan_id: base.id })}
                                                    className={`p-6 rounded-[2rem] border transition-all ${!canAfford ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200' : active
                                                        ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-500/20 text-white translate-y-[-2px]'
                                                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer text-slate-900'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-lg font-black tracking-tight ${active ? 'text-white' : 'text-slate-900'}`}>{base.name}</span>
                                                                {active && <CheckCircle size={16} className="text-indigo-200" />}
                                                            </div>
                                                            <div className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-indigo-200' : 'text-slate-400'}`}>Base Cost: ₹{base.min_reseller_price || 0}/mo</div>
                                                        </div>

                                                        {!canAfford && (
                                                            <div className="text-[10px] font-bold uppercase tracking-widest bg-rose-100 text-rose-600 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                                                <AlertCircle size={12} /> Low Balance
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className={`space-y-2 text-sm font-medium ${active ? 'text-indigo-100' : 'text-slate-500'}`}>
                                                        <div className="flex items-center gap-2"><Check size={14} className={active ? "text-indigo-300" : "text-emerald-500"} /> Up to {base.max_contacts} Contacts</div>
                                                        <div className="flex items-center gap-2"><Check size={14} className={active ? "text-indigo-300" : "text-emerald-500"} /> {base.flow_builder_access ? `${base.max_flows} Custom Flows` : 'No Automations'}</div>
                                                        {base.api_access && <div className="flex items-center gap-2"><Check size={14} className={active ? "text-indigo-300" : "text-emerald-500"} /> Full API Access</div>}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {basePlans.length === 0 && (
                                            <div className="col-span-2 p-12 text-center border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-500 font-medium">
                                                No Base Plans Available.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Configure Pricing */}
                            {step === 2 && (
                                <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 pb-4">
                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-3 ml-1">Plan Identifier (Retail Name)</label>
                                            <input
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4.5 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-4 ring-indigo-500/10 outline-none transition-all font-black tracking-tight text-lg placeholder:text-slate-300"
                                                placeholder="e.g. Pro Suite 2026"
                                                value={newPlan.name}
                                                onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block ml-1">Retail Price (Monthly)</label>
                                            <div className="relative">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">₹</span>
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4.5 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-4 ring-indigo-500/10 outline-none transition-all font-black tabular-nums text-lg"
                                                    value={newPlan.monthly_price}
                                                    onChange={e => setNewPlan({ ...newPlan, monthly_price: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block ml-1">Retail Price (Yearly)</label>
                                            <div className="relative">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">₹</span>
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4.5 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-4 ring-indigo-500/10 outline-none transition-all font-black tabular-nums text-lg"
                                                    value={newPlan.yearly_price}
                                                    onChange={e => setNewPlan({ ...newPlan, yearly_price: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Real-time Profit Calculator */}
                                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2" />

                                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-indigo-300 mb-6">Profit Margin Projection (Per Vendor)</h4>

                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <div className="text-slate-400 text-xs font-medium mb-1">Base Cost</div>
                                                <div className="text-xl font-bold line-through decoration-rose-500/50">₹{wholesaleCost}</div>
                                            </div>
                                            <ChevronRight className="text-slate-600" />
                                            <div>
                                                <div className="text-slate-400 text-xs font-medium mb-1">Retail Price</div>
                                                <div className="text-xl font-bold">₹{newPlan.monthly_price}</div>
                                            </div>
                                            <ChevronRight className="text-slate-600" />
                                            <div className="text-right">
                                                <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Net Margin</div>
                                                <div className="text-3xl font-black text-emerald-400">₹{monthlyMargin}</div>
                                            </div>
                                        </div>

                                        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${marginPercent < 20 ? 'bg-rose-500' : marginPercent < 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                                style={{ width: `${Math.min(Math.max(marginPercent, 5), 100)}%` }}
                                            />
                                        </div>
                                        <div className="mt-3 text-right text-xs font-medium text-slate-400">
                                            {marginPercent}% Profit Margin
                                            {marginPercent < 0 && <span className="text-rose-400 ml-2">(Selling at a loss!)</span>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Review & Finalize */}
                            {step === 3 && (
                                <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 text-center py-6">
                                    <div className="w-24 h-24 bg-emerald-50 mx-auto rounded-full flex items-center justify-center text-emerald-500 mb-6">
                                        <ShoppingBag size={48} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Ready to Deploy</h3>
                                    <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                                        You are about to deploy <strong>{newPlan.name}</strong> powered by the <strong>{selectedBasePlan?.name}</strong> engine.
                                    </p>

                                    <div className="max-w-md mx-auto bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mt-8 text-left space-y-4">
                                        <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
                                            <span className="text-slate-500 font-medium text-sm">Wallet Deduction</span>
                                            <span className="font-bold text-rose-500">-₹{wholesaleCost}/mo</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
                                            <span className="text-slate-500 font-medium text-sm">Retail Gateway Collection</span>
                                            <span className="font-bold text-emerald-600">+₹{newPlan.monthly_price}/mo</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-slate-900 font-black">Net Profit Per Vendor</span>
                                            <span className="font-black text-xl text-emerald-600">₹{monthlyMargin}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Footer / Actions */}
                        <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
                            <button
                                onClick={() => step > 1 ? setStep(step - 1) : closeModal()}
                                className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
                            >
                                {step === 1 ? 'Cancel' : 'Back'}
                            </button>

                            {step < 3 ? (
                                <button
                                    onClick={() => {
                                        if (step === 1 && !newPlan.base_plan_id) return alert('Select an engine to continue');
                                        if (step === 2 && !newPlan.name) return alert('Enter a plan name');
                                        setStep(step + 1);
                                    }}
                                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-slate-900/10"
                                >
                                    Continue <ArrowRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleCreate}
                                    disabled={creating}
                                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70 shadow-xl shadow-indigo-600/20"
                                >
                                    {creating ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                    Deploy Plan Now
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Embed Console Engine */}
            {showEmbed && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="absolute inset-0" onClick={() => setShowEmbed(false)}></div>
                    <div className="relative bg-white border border-slate-200 w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 overflow-hidden animate-in zoom-in-95 duration-300">
                        <button onClick={() => setShowEmbed(false)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
                            <Plus size={20} className="rotate-45" />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                <Code size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Embed Layout</h2>
                                <p className="text-xs text-slate-500 font-medium">Installation Setup</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed mb-6">
                            Pricing script for your website. Place this code on your primary portal (e.g. WordPress, Webflow) to render your commercial pricing tiers.
                        </p>

                        <div className="bg-slate-900 rounded-[2rem] p-6 mb-8 font-mono text-[13px] text-indigo-300 break-all shadow-inner relative group border border-slate-800">
                            <div className="absolute top-4 right-4 text-white/20 uppercase font-black text-[10px] tracking-widest">HTML</div>
                            {embedCode}
                        </div>

                        <button
                            onClick={copyToClipboard}
                            className="w-full py-4.5 bg-slate-900 text-white font-bold text-[11px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-[0.98] shadow-xl shadow-slate-900/10"
                        >
                            {copied ? <CheckCircle size={18} className="text-emerald-400" /> : <Copy size={18} />}
                            {copied ? "Code Copied" : "Copy Pricing Script"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function MetricCard({ icon, color, bg, border, label, value }: any) {
    return (
        <div className="bg-white/60 backdrop-blur-xl border border-slate-200/60 p-8 rounded-[2.5rem] shadow-sm flex items-center gap-5 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`w-14 h-14 ${bg} rounded-[1.5rem] flex items-center justify-center ${color} shadow-inner border ${border} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                {icon}
            </div>
            <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</div>
                <div className="text-2xl font-black text-slate-900 tracking-tighter">{value}</div>
            </div>
        </div>
    );
}

function PlanFeature({ icon, text }: any) {
    return (
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
            <span className="text-indigo-500">{icon}</span>
            {text}
        </div>
    )
}
