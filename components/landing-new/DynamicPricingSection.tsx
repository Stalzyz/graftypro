"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Star, Loader2 } from "lucide-react";

const FALLBACK_PLANS = [
    {
        id: "starter",
        name: "STARTER",
        monthly_price: 999,
        yearly_price: 9990,
        original_monthly: 2999,
        description: "Essential WhatsApp Automation for small teams.",
        features_list: [
            "Quick Replies Access",
            "Visual Flow Builder",
            "Message Nodes Only",
            "Shared Inbox (2 Agents)",
            "Unlimited Broadcasts"
        ],
        is_featured: false,
    },
    {
        id: "growth",
        name: "GROWTH",
        monthly_price: 2999,
        yearly_price: 29990,
        original_monthly: 5999,
        description: "Scale your sales with E-commerce and CRM.",
        features_list: [
            "Everything in Starter",
            "CRM & Lead Management",
            "E-Commerce WhatsApp Shop",
            "Courses & Academy Engine",
            "Logic & Automation Nodes",
            "Shared Inbox (10 Agents)"
        ],
        is_featured: true,
        badge_text: "Best Value",
    },
    {
        id: "enterprise",
        name: "ENTERPRISE",
        monthly_price: 14999,
        yearly_price: 149990,
        original_monthly: 24999,
        description: "Ultimate scale with Drips and Integrations.",
        features_list: [
            "Everything in Growth",
            "Drip Message Sequences",
            "Advanced CRM Engine",
            "Integration Nodes (Webhooks/Shopify)",
            "Dedicated Success Manager",
            "Shared Inbox (50 Agents)"
        ],
        is_featured: false,
    },
];

export default function DynamicPricingSection({ compact = false }: { compact?: boolean }) {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isYearly, setIsYearly] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        fetch("/api/auth/trial-status")
            .then(res => setIsLoggedIn(res.ok))
            .catch(() => setIsLoggedIn(false));

        fetch("/api/billing/plans")
            .then(res => res.json())
            .then(data => {
                const fetched = data?.plans || data?.data || [];
                fetched.sort((a: any, b: any) => Number(a.monthly_price || a.price) - Number(b.monthly_price || b.price));
                setPlans(fetched.length > 0 ? fetched : FALLBACK_PLANS as any);
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
        <div className="w-full">
            {/* Monthly / Yearly Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
                <span className={`text-sm font-bold transition-colors ${!isYearly ? "text-slate-900" : "text-slate-400"}`}>
                    Monthly
                </span>

                {/* Gradient Toggle Button */}
                <button
                    type="button"
                    onClick={() => setIsYearly(v => !v)}
                    aria-label="Toggle billing period"
                    className="relative w-[56px] h-[30px] rounded-full p-[3px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#27954D] transition-all"
                    style={{ background: "linear-gradient(135deg, #27954D 0%, #042F94 100%)" }}
                >
                    <div
                        className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${isYearly ? "translate-x-[26px]" : "translate-x-0"}`}
                    />
                </button>

                <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold transition-colors ${isYearly ? "text-slate-900" : "text-slate-400"}`}>
                        Yearly
                    </span>
                    <span className="inline-flex items-center bg-green-50 text-green-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-green-100">
                        SAVE 2 MONTHS
                    </span>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid gap-8 grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto">
                {plans.map((plan) => {
                    const isPopular = plan.is_featured || plan.name?.toUpperCase().includes("GROWTH");
                    const featureList: string[] = typeof plan.features_list === "string"
                        ? JSON.parse(plan.features_list)
                        : (plan.features_list || plan.features || []);

                    const monthlyPrice = Number(plan.monthly_price || plan.price || 0);
                    const yearlyPrice = Number(plan.yearly_price || (monthlyPrice * 10));
                    const originalMonthly = Number(plan.original_monthly || plan.original_monthly_price || 0);
                    const displayPrice = isYearly ? Math.round(yearlyPrice / 12) : monthlyPrice;
                    const savings = originalMonthly > 0 ? originalMonthly - monthlyPrice : 0;

                    return (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col rounded-[2rem] border-2 p-8 transition-all duration-300 hover:shadow-2xl ${
                                isPopular
                                    ? "border-[#27954D] ring-8 ring-[#27954D]/5 bg-white shadow-xl scale-105 z-10"
                                    : "border-slate-100 bg-white hover:border-slate-200"
                            }`}
                        >
                            {/* Badge */}
                            {isPopular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center gap-1.5 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg"
                                        style={{ background: "linear-gradient(135deg, #27954D 0%, #042F94 100%)" }}>
                                        <Star size={10} fill="currentColor" /> {plan.badge_text || "Best Value"}
                                    </span>
                                </div>
                            )}

                            {/* Plan Name */}
                            <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 mb-5">
                                {plan.name?.split("(")[0].trim()}
                            </p>

                            {/* MSRP */}
                            {originalMonthly > 0 && (
                                <div className="mb-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">MSRP:</span>
                                    <span className="text-sm text-slate-400 line-through font-bold ml-1">
                                        ₹{originalMonthly.toLocaleString("en-IN")}/mo
                                    </span>
                                </div>
                            )}

                            {/* Selling Price Label */}
                            {originalMonthly > 0 && (
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Selling Price</p>
                            )}

                            {/* Main Price */}
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-xl font-bold text-slate-900">₹</span>
                                <span className="text-5xl font-black tracking-tighter text-slate-900 leading-none">
                                    {displayPrice.toLocaleString("en-IN")}
                                </span>
                                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">/mo</span>
                            </div>

                            {/* Yearly note */}
                            {isYearly && (
                                <p className="text-[10px] text-slate-400 font-bold mb-1">
                                    Billed ₹{yearlyPrice.toLocaleString("en-IN")}/year
                                </p>
                            )}

                            {/* Savings Badge */}
                            {savings > 0 && !isYearly && (
                                <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-green-100 mb-3 w-fit">
                                    You Save ₹{savings.toLocaleString("en-IN")}/mo
                                </div>
                            )}
                            {isYearly && (
                                <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-green-100 mb-3 w-fit">
                                    2 Months FREE on yearly
                                </div>
                            )}

                            <p className="text-[11px] font-semibold text-slate-400 mb-5">
                                + Additional charges apply for messages
                            </p>

                            {/* Divider */}
                            <div className="border-t border-slate-100 mb-5" />

                            {/* Features */}
                            {featureList.length > 0 && (
                                <ul className="space-y-3 mb-8 flex-grow">
                                    {featureList.map((f, fi) => (
                                        <li key={fi} className="flex gap-3 items-start text-sm font-semibold text-slate-700 leading-tight">
                                            <div className="w-5 h-5 rounded-full bg-[#27954D]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check size={12} className="text-[#27954D]" strokeWidth={3} />
                                            </div>
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* CTA Button */}
                            <Link
                                href={isLoggedIn ? `/dashboard/settings/billing?plan=${plan.id}` : "/register"}
                                onClick={() => {
                                    fetch("/api/meta/events", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            eventName: "InitiateCheckout",
                                            customData: {
                                                content_name: plan.name,
                                                content_category: "Subscription Plan",
                                                value: displayPrice,
                                                currency: "INR"
                                            }
                                        })
                                    }).catch(() => {});
                                }}
                                className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-sm transition-all group mt-auto ${
                                    isPopular
                                        ? "text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
                                        : "border-2 border-slate-200 text-slate-700 hover:border-[#27954D] hover:text-[#27954D] hover:bg-slate-50"
                                }`}
                                style={isPopular ? { background: "linear-gradient(135deg, #27954D 0%, #042F94 100%)" } : {}}
                            >
                                {isLoggedIn ? "Select Plan" : "Get Started"}
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <p className="text-center text-[10px] text-slate-400 font-medium mt-3">
                                No credit card required for trial
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 text-center text-slate-500 text-sm font-medium">
                <p>All plans include a 7-day free trial. No credit card required.</p>
            </div>
        </div>
    );
}
