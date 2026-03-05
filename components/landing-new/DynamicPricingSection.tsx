"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Zap, Star, Loader2 } from "lucide-react";
import { SmartPartnerLink } from "./SmartPartnerLink";

interface Plan {
    id: string;
    name: string;
    price: number;
    description?: string;
    features?: string[];
    credits?: number;
    max_contacts?: number;
    max_broadcasts?: number;
    is_popular?: boolean;
}

const FALLBACK_PLANS: Plan[] = [
    {
        id: "starter",
        name: "Starter",
        price: 4999,
        credits: 2500,
        description: "For emerging businesses building their first automated sales funnels.",
        features: ["Flow Builder", "Standard Broadcasts", "1 Team Seat", "CRM Lite", "WhatsApp Integration"],
    },
    {
        id: "growth",
        name: "Growth",
        price: 9999,
        credits: 7500,
        description: "For high-volume operators requiring complex behavioral drips and team control.",
        features: ["Flow Builder", "Drip Campaigns", "Template Creator", "3 Team Seats", "Advanced CRM", "API Access"],
        is_popular: true,
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: 24999,
        credits: 20000,
        description: "For institutions and agencies requiring complete architectural control.",
        features: ["Everything in Growth", "Full Analytics", "Unlimited Seats", "White-Label Ready", "Priority Support", "Custom Integrations"],
    },
];

export function DynamicPricingSection({ compact = false }: { compact?: boolean }) {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/billing/plans")
            .then(res => res.json())
            .then(data => {
                const fetchedPlans: Plan[] = data?.data || [];
                setPlans(fetchedPlans.length > 0 ? fetchedPlans : FALLBACK_PLANS);
            })
            .catch(() => setPlans(FALLBACK_PLANS))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-[#27954D]" size={36} />
            </div>
        );
    }

    return (
        <div className={`grid gap-8 ${plans.length === 2 ? "grid-cols-1 lg:grid-cols-2 max-w-4xl mx-auto" : "grid-cols-1 lg:grid-cols-3"}`}>
            {plans.map((plan, i) => {
                const isPopular = plan.is_popular || i === 1;
                const featureList: string[] = plan.features || [];

                return (
                    <div
                        key={plan.id}
                        className={`relative flex flex-col rounded-3xl border-2 p-8 lg:p-10 transition-all duration-300 hover:shadow-2xl ${isPopular
                            ? "border-[#27954D] ring-8 ring-[#27954D]/5 bg-white shadow-xl"
                            : "border-slate-100 bg-white hover:border-slate-200"
                            }`}
                    >
                        {isPopular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <span className="inline-flex items-center gap-1.5 bg-[#27954D] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                    <Star size={10} fill="currentColor" /> Most Popular
                                </span>
                            </div>
                        )}

                        <div className="mb-8">
                            <p className="text-[10px] font-black uppercase tracking-[4px] text-[#27954D] mb-4">{plan.name}</p>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-2xl font-bold text-slate-900">₹</span>
                                <span className="text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 leading-none">
                                    {plan.price.toLocaleString("en-IN")}
                                </span>
                                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">/mo</span>
                            </div>
                            {plan.credits && (
                                <div className="bg-slate-50 rounded-2xl px-4 py-3 inline-flex items-center gap-2 mb-4 border border-slate-100">
                                    <Zap size={14} className="text-[#27954D]" />
                                    <span className="text-sm font-black text-slate-700">{plan.credits.toLocaleString()} Credits / month</span>
                                </div>
                            )}
                            {plan.description && (
                                <p className="text-slate-500 font-medium text-sm leading-relaxed">{plan.description}</p>
                            )}
                        </div>

                        {featureList.length > 0 && (
                            <ul className="space-y-3 mb-10 flex-grow">
                                {featureList.map((f, fi) => (
                                    <li key={fi} className="flex gap-3 items-center text-sm font-semibold text-slate-700">
                                        <div className="w-5 h-5 rounded-full bg-[#27954D]/10 flex items-center justify-center flex-shrink-0">
                                            <Check size={12} className="text-[#27954D]" strokeWidth={3} />
                                        </div>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <Link
                            href="/register"
                            className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-sm transition-all group ${isPopular
                                ? "bg-gradient-to-r from-[#27954D] to-[#042F94] text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
                                : "border-2 border-slate-200 text-slate-700 hover:border-[#27954D] hover:text-[#27954D]"
                                }`}
                        >
                            Start Free Trial
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}
