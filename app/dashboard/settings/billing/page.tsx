"use client";

import { useState, useEffect } from "react";
import { Check, Zap, Shield, CreditCard, ArrowRight, Star, Sparkles } from "lucide-react";
import Script from "next/script";

interface PlanDetail {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    billing_cycle: string;
    max_contacts: number;
    max_flows: number;
    max_campaigns: number;
    max_messages: number;
    max_users: number; // Added
    api_access: boolean;
    crm_access: boolean;
    flow_builder_access: boolean;
    drip_campaign_access: boolean;
    original_monthly_price?: number;
}

export default function BillingPage() {
    const [currentPlan, setCurrentPlan] = useState<string>("STARTER");
    const [availablePlans, setAvailablePlans] = useState<PlanDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState(false);
    const [trialStatus, setTrialStatus] = useState<any>(null);
    const [upgradeError, setUpgradeError] = useState<string | null>(null);
    const [upgradeSuccess, setUpgradeSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statusRes, plansRes, trialRes] = await Promise.all([
                    fetch("/api/billing/status"),
                    fetch("/api/billing/plans"),
                    fetch("/api/auth/trial-status")
                ]);
                
                const statusData = await statusRes.json();
                const plansData = await plansRes.json();
                const trialData = await trialRes.json();

                if (statusData.plan) setCurrentPlan(statusData.plan);
                setAvailablePlans(plansData.data || []);
                setTrialStatus(trialData);
            } catch (error) {
                console.error("Failed to load billing data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleUpgrade = async (planName: string) => {
        setUpgrading(true);
        setUpgradeError(null);
        setUpgradeSuccess(false);
        try {
            const res = await fetch("/api/billing/subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan: planName })
            });
            const data = await res.json();

            if (!res.ok || !data.subscriptionId) {
                setUpgradeError(data.error || "Failed to initiate subscription. Please try again.");
                return;
            }

            // Diagnostic: If key is missing, fetch it from system (or use a sensible fallback)
            let rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
            if (!rzpKey) {
                // Try fetching from public config if not in env
                const configRes = await fetch("/api/super-admin/finance/payment/public-key");
                const configData = await configRes.json();
                rzpKey = configData.key_id;
            }

            if (!rzpKey) {
                throw new Error("Payment Gateway not configured. Please contact support.");
            }

            const options = {
                "key": rzpKey,
                "subscription_id": data.subscriptionId,
                "name": "Grafty",
                "description": `Upgrade to ${planName}`,
                "handler": async function (response: any) {
                    await fetch("/api/billing/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(response)
                    });
                    setUpgradeSuccess(true);
                    setTimeout(() => window.location.reload(), 1500);
                },
                "modal": {
                    "ondismiss": () => setUpgrading(false)
                },
                "theme": { "color": "#27954D" }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (e: any) {
            console.error(e);
            setUpgradeError(e.message || "Upgrade failed. Please try again.");
        } finally {
            setUpgrading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Billing Data...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-16 animate-fade-in">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            {/* Error Banner */}
            {upgradeError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4 flex items-start gap-3 text-sm font-medium">
                    <span className="text-red-500 text-lg">⚠️</span>
                    <div>
                        <p className="font-black">Upgrade Failed</p>
                        <p className="mt-1">{upgradeError}</p>
                    </div>
                    <button onClick={() => setUpgradeError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
                </div>
            )}

            {/* Success Banner */}
            {upgradeSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl px-6 py-4 flex items-center gap-3 text-sm font-black">
                    ✅ Payment successful! Your plan is being activated. Reloading...
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-12">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#27954D] flex items-center justify-center shadow-lg">
                            <Star className="text-white fill-white" size={20} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Cloud Subscriptions</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-lg">Manage your organization's computational limits and module access.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Plan</p>
                        <p className="text-sm font-black text-slate-900">{currentPlan}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="bg-[#27954D]/10 text-[#27954D] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                        {trialStatus?.status === 'trial' ? 'Trial Period' : 'Scale Active'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Fallback to STARTER if no plans exist or during load failures */}
                {availablePlans.length === 0 && (
                    <div className="relative flex flex-col rounded-3xl border-2 p-8 transition-all duration-300 border-slate-100 bg-white shadow-lg">
                        <div className="mb-6">
                            <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-500 mb-4">STARTER</p>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-2xl font-bold text-slate-900">₹</span>
                                <span className="text-5xl font-black tracking-tighter text-slate-900 leading-none">999</span>
                                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">/mo</span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 mb-4">+ Additional charges apply for messages</p>
                            <p className="text-sm text-slate-600 font-medium h-10 line-clamp-2 mt-4 border-t border-slate-100 pt-4">Entry Point Access</p>
                        </div>
                        <ul className="space-y-3 mb-10 flex-grow pt-4">
                            <li className="flex gap-3 items-start text-sm font-semibold text-slate-700 leading-tight">
                                <div className="w-5 h-5 rounded-full bg-[#27954D]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><Check size={12} className="text-[#27954D]" strokeWidth={3} /></div>
                                <span>2,000 Contacts</span>
                            </li>
                        </ul>
                        <button disabled className="mt-auto w-full bg-[#27954D]/10 text-[#27954D] font-black py-4 rounded-2xl uppercase tracking-widest text-xs border border-[#27954D]/20">
                            Current Infrastructure
                        </button>
                    </div>
                )}

                {availablePlans.map((plan) => {
                    const isCurrent = currentPlan === plan.name;
                    const isPopular = (plan as any).is_featured || plan.name.includes("GROWTH");

                    return (
                        <div key={plan.id} className={`relative flex flex-col rounded-3xl border-2 p-8 transition-all duration-300 hover:shadow-2xl ${isCurrent || isPopular ? 'border-[#27954D] bg-white ' + (isPopular ? 'ring-8 ring-[#27954D]/5 shadow-xl scale-105 z-10' : 'shadow-lg scale-[1.02]') : 'border-slate-100 bg-white'}`}>
                            {isPopular && !isCurrent && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center gap-1.5 bg-[#27954D] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                        <Star size={10} fill="currentColor" /> {(plan as any).badge_text || "Best Value"}
                                    </span>
                                </div>
                            )}
                            {isCurrent && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                        <Check size={10} /> Active Plan
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-500 mb-4">
                                    {plan.name.split('(')[0].trim()}
                                </p>

                                {/* MSRP / Strike Price */}
                                {plan.original_monthly_price && Number(plan.original_monthly_price) > Number(plan.price) && (
                                    <div className="mb-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MSRP:</span>
                                        <span className="text-sm text-slate-400 line-through font-bold ml-1">
                                            ₹{Number(plan.original_monthly_price).toLocaleString("en-IN")}/mo
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-2xl font-bold text-slate-900">₹</span>
                                    <span className="text-5xl font-black tracking-tighter text-slate-900 leading-none">
                                        {Number(plan.price).toLocaleString("en-IN")}
                                    </span>
                                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">/{plan.billing_cycle === 'YEARLY' ? 'yr' : 'mo'}</span>
                                </div>

                                {/* Savings Badge */}
                                {plan.original_monthly_price && Number(plan.original_monthly_price) > Number(plan.price) && (
                                    <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-green-100 mb-4">
                                        You Save ₹{(Number(plan.original_monthly_price) - Number(plan.price)).toLocaleString("en-IN")}/mo
                                    </div>
                                )}

                                <p className="text-[11px] font-bold text-slate-400 mb-4">+ Additional charges apply for messages</p>
                                
                                <p className="text-sm text-slate-600 font-medium h-10 line-clamp-2 mt-4 border-t border-slate-100 pt-4">
                                    {plan.description || 'Full Module Access'}
                                </p>
                            </div>

                            <ul className="space-y-3 mb-10 flex-grow pt-4">
                                <li className="flex gap-3 items-start text-sm font-semibold text-slate-700 leading-tight">
                                    <div className="w-5 h-5 rounded-full bg-[#27954D]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><Check size={12} className="text-[#27954D]" strokeWidth={3} /></div>
                                    <span>{plan.max_contacts.toLocaleString()} Contacts</span>
                                </li>
                                <li className="flex gap-3 items-start text-sm font-semibold text-slate-700 leading-tight">
                                    <div className="w-5 h-5 rounded-full bg-[#27954D]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><Check size={12} className="text-[#27954D]" strokeWidth={3} /></div>
                                    <span>{plan.max_users} Multi-User Roles</span>
                                </li>
                                <li className="flex gap-3 items-start text-sm font-semibold text-slate-700 leading-tight">
                                    <div className="w-5 h-5 rounded-full bg-[#27954D]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><Check size={12} className="text-[#27954D]" strokeWidth={3} /></div>
                                    <span>{plan.max_messages.toLocaleString()} Messages / mo</span>
                                </li>
                                {plan.api_access && (
                                    <li className="flex gap-3 items-start text-sm font-semibold text-slate-700 leading-tight">
                                        <div className="w-5 h-5 rounded-full bg-[#27954D]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><Check size={12} className="text-[#27954D]" strokeWidth={3} /></div>
                                        <span>REST API Integration</span>
                                    </li>
                                )}
                                {plan.crm_access && (
                                    <li className="flex gap-3 items-start text-sm font-semibold text-slate-700 leading-tight">
                                        <div className="w-5 h-5 rounded-full bg-[#27954D]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><Check size={12} className="text-[#27954D]" strokeWidth={3} /></div>
                                        <span>Advanced Lead CRM</span>
                                    </li>
                                )}
                            </ul>

                            {isCurrent ? (
                                <button disabled className="mt-auto w-full bg-[#27954D]/10 text-[#27954D] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border border-[#27954D]/20">
                                    <Check size={16} strokeWidth={3} /> Active Plan
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleUpgrade(plan.name)}
                                    disabled={upgrading}
                                    className={`mt-auto w-full flex justify-center items-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all group ${isPopular ? "bg-gradient-to-r from-[#27954D] to-[#042F94] text-white shadow-lg hover:shadow-xl hover:scale-[1.02]" : "border-2 border-slate-200 text-slate-700 hover:border-[#27954D] hover:text-[#27954D] hover:bg-slate-50"}`}
                                >
                                    {upgrading ? "Loading..." : (
                                        <>
                                            {isCurrent ? "Active Plan" : "Upgrade Plan"}
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}

                {/* Enterprise Custom Hook (Dynamic / Contact fallback) */}
                {!availablePlans.some(p => p.name.toUpperCase().includes("ENTERPRISE")) && (
                    <div className="bg-slate-900 text-white p-12 rounded-[50px] flex flex-col justify-between group overflow-hidden relative border-4 border-slate-800 shadow-2xl">
                        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                            <Shield size={120} strokeWidth={1} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
                                <Sparkles className="text-yellow-400 fill-yellow-400" size={24} />
                            </div>
                            <h3 className="font-black text-3xl mb-4 tracking-tight">Enterprise Build</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">Dedicated infrastructure, custom throughput limits, and 24/7 technical escort.</p>

                            <div className="space-y-4 mb-12">
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                                    <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-white"><Check size={10} /></div>
                                    Custom SLA Agreements
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                                    <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-white"><Check size={10} /></div>
                                    Dedicated Node Instance
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                                    <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-white"><Check size={10} /></div>
                                    On-Premise Deployment
                                </div>
                            </div>
                        </div>
                        <button className="relative z-10 w-full bg-white text-slate-900 px-6 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-3">
                            Engage Sales Team <Zap size={14} className="fill-slate-900" />
                        </button>
                    </div>
                )}
            </div>

            {/* Support Notice */}
            <div className="flex flex-col md:flex-row items-center justify-between p-12 bg-slate-50 rounded-[48px] border border-slate-100">
                <div className="flex items-center gap-6 mb-6 md:mb-0">
                    <div className="w-16 h-16 rounded-[24px] bg-white flex items-center justify-center shadow-sm">
                        <CreditCard className="text-slate-900" size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 text-xl tracking-tight">Secure Payment Infrastructure</h4>
                        <p className="text-slate-400 text-sm font-medium">All transactions are encrypted and processed via Razorpay Enterprise Gateway.</p>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">PCI DSS Compliant</span>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">256-Bit SSL Secured</span>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ text, active = false }: { text: string, active?: boolean }) {
    return (
        <li className="flex items-center gap-4 text-sm font-bold text-slate-600 group/item">
            <div className={`w-6 h-6 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                <Check size={12} strokeWidth={3} />
            </div>
            <span className={active ? 'text-indigo-600 font-black' : 'text-slate-500'}>{text}</span>
        </li>
    );
}
