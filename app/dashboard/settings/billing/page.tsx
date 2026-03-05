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
}

export default function BillingPage() {
    const [currentPlan, setCurrentPlan] = useState<string>("PRIME STARTER");
    const [availablePlans, setAvailablePlans] = useState<PlanDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statusRes, plansRes] = await Promise.all([
                    fetch("/api/billing/status"),
                    fetch("/api/billing/plans")
                ]);

                const statusData = await statusRes.json();
                const plansData = await plansRes.json();

                if (statusData.plan) setCurrentPlan(statusData.plan);
                setAvailablePlans(plansData.data || []);
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
        try {
            const res = await fetch("/api/billing/subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan: planName })
            });
            const data = await res.json();

            if (!data.subscriptionId) throw new Error("Failed to init subscription");

            const options = {
                "key": process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                "subscription_id": data.subscriptionId,
                "name": "Grafty Enterprise",
                "description": `Upgrade to ${planName}`,
                "handler": async function (response: any) {
                    await fetch("/api/billing/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(response)
                    });
                    alert("Upgrade Successful! System re-calibrating...");
                    window.location.reload();
                },
                "theme": { "color": "#0F172A" }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (e) {
            console.error(e);
            alert("Upgrade unsuccessful. Please contact support.");
        } finally {
            setUpgrading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Encrypting Billing Data...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-16 animate-fade-in">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

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
                        Scale Active
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Fallback to PRIME STARTER if no plans exist or during load failures */}
                {availablePlans.length === 0 && (
                    <div className="p-10 rounded-[40px] border-2 border-slate-100 bg-white shadow-sm flex flex-col">
                        <div className="mb-8">
                            <h3 className="font-black text-2xl text-slate-900 mb-1">Prime Starter</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider italic">Entry Point Access</p>
                        </div>
                        <div className="text-4xl font-black text-slate-900 mb-10 tracking-tighter">₹1,999</div>
                        <div className="space-y-4 mb-10 flex-1">
                            <FeatureItem text="1,000 Contacts" />
                            <FeatureItem text="10 Automated Flows" />
                            <FeatureItem text="2,500 Messages / mo" />
                            <FeatureItem text="Shared Inbox (2 Agents)" />
                        </div>
                        <button disabled className="w-full bg-slate-50 text-slate-300 font-black py-5 rounded-2xl uppercase tracking-widest text-xs cursor-not-allowed border border-slate-100">
                            Current Infrastructure
                        </button>
                    </div>
                )}

                {availablePlans.map((plan) => {
                    const isCurrent = currentPlan === plan.name;
                    return (
                        <div key={plan.id} className={`p-10 rounded-[40px] border-2 transition-all duration-500 flex flex-col relative group ${isCurrent ? 'border-[#27954D] bg-white shadow-2xl scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                            {plan.price > 0 && !isCurrent && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-4 py-2 rounded-full tracking-[0.2em] shadow-xl">MOST POPULAR</div>
                            )}

                            <div className="mb-8">
                                <h3 className="font-black text-2xl text-slate-900 mb-1">{plan.name}</h3>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{plan.description || 'Full Module Access'}</p>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span className="text-sm text-slate-400 font-medium">Up to {plan.max_users} Multi-User Roles</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span className="text-sm text-slate-400 font-medium">{plan.max_messages} Messages/mo</span>
                                </div>
                            </div>

                            <div className="mb-10 flex items-end gap-1">
                                <span className="text-sm font-bold text-slate-400 mb-2">{plan.currency}</span>
                                <span className="text-5xl font-black text-slate-900 tracking-tighter">{plan.price.toLocaleString()}</span>
                                <div className="flex flex-col">
                                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[8px] leading-none">+ GST</span>
                                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest leading-normal">/ {plan.billing_cycle === 'MONTHLY' ? 'mo' : 'yr'}</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                <FeatureItem text={`${plan.max_contacts.toLocaleString()} Contacts`} />
                                <FeatureItem text={`${plan.max_messages.toLocaleString()} Messages / mo`} />
                                <FeatureItem text={`${plan.max_flows} Automated Flows`} />
                                <FeatureItem text={`${plan.max_campaigns} Active Broadcasts`} />
                                {plan.api_access && <FeatureItem text="REST API Integration" active />}
                                {plan.drip_campaign_access && <FeatureItem text="Drip Sequences" active />}
                                {plan.crm_access && <FeatureItem text="Advanced Lead CRM" active />}
                            </div>

                            {isCurrent ? (
                                <button disabled className="w-full bg-[#27954D] text-white font-black py-5 rounded-3xl uppercase tracking-widest text-xs shadow-xl shadow-[#27954D]/20 transition-all flex items-center justify-center gap-2">
                                    <Check size={16} strokeWidth={4} /> Fully Provisioned
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleUpgrade(plan.name)}
                                    disabled={upgrading}
                                    className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl uppercase tracking-widest text-xs hover:bg-[#27954D] transition-all hover:shadow-2xl shadow-slate-200 flex items-center justify-center gap-2 group-hover:scale-[0.98]"
                                >
                                    {upgrading ? "Provisioning..." : <>Start 14 days trial <ArrowRight size={14} strokeWidth={3} /></>}
                                </button>
                            )}
                        </div>
                    );
                })}

                {/* Enterprise Custom Hook */}
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
