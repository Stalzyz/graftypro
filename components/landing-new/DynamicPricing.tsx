"use client";
import React, { useEffect, useState } from 'react';
import { Check, ArrowRight, Loader2, Zap, Star } from 'lucide-react';
import Link from 'next/link';

interface Plan {
    id: string;
    name: string;
    monthly_price: number;
    yearly_price: number;
    credits: number;
    features: string[];
    is_featured: boolean;
    flow_builder_access: boolean;
    drip_campaign_access: boolean;
}

interface DynamicPricingProps {
    title?: string;
    subtitle?: string;
    manualPlans?: any[];
    autoSync?: boolean;
}

export default function DynamicPricing({
    title = "Simple, Transparent Pricing",
    subtitle = "Start your 7-day free trial. No credit card required.",
    manualPlans,
    autoSync = true
}: DynamicPricingProps) {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

    useEffect(() => {
        if (!autoSync && manualPlans) {
            setPlans(manualPlans);
            setLoading(false);
            return;
        }
        const fetchPlans = async () => {
            try {
                const res = await fetch('/api/billing/plans');
                const json = await res.json();
                if (json.data) setPlans(json.data);
            } catch (err) {
                console.error("Failed to fetch plans", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, [autoSync, manualPlans]);

    if (loading) {
        return (
            <section id="pricing" className="section-white flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-[var(--brand-light)]" size={40} />
            </section>
        );
    }

    if (plans.length === 0) return null;

    const yearlySavings = 17; // percent

    return (
        <section id="pricing" className="section-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12 animate-up">
                    <h2 className="g-h2 mb-4" dangerouslySetInnerHTML={{ __html: title }} />
                    <p className="g-p text-xl mb-8">{subtitle}</p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
                        <button
                            onClick={() => setBilling('monthly')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${billing === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBilling('yearly')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${billing === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Yearly
                            <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                                Save {yearlySavings}%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Plan Cards */}
                <div className={`grid grid-cols-1 ${plans.length <= 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : plans.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} gap-8`}>
                    {plans.map((plan) => {
                        const price = billing === 'yearly'
                            ? Math.round((plan.yearly_price / 12))
                            : plan.monthly_price;

                        return (
                            <PriceCard
                                key={plan.id}
                                name={plan.name}
                                price={price}
                                yearly={billing === 'yearly'}
                                yearlyTotal={plan.yearly_price}
                                credits={plan.credits}
                                features={plan.features}
                                featured={plan.is_featured}
                                hasFlows={plan.flow_builder_access}
                            />
                        );
                    })}
                </div>

                {/* Bottom Note */}
                <p className="text-center text-slate-400 text-sm font-medium mt-10">
                    All plans include a <strong className="text-slate-700">7-day free trial</strong>. No credit card required. Cancel anytime.
                </p>
            </div>
        </section>
    );
}

function PriceCard({
    name, price, yearly, yearlyTotal, credits, features, featured, hasFlows
}: {
    name: string;
    price: number;
    yearly: boolean;
    yearlyTotal: number;
    credits: number;
    features: string[];
    featured?: boolean;
    hasFlows?: boolean;
}) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className={`g-card flex flex-col h-full border-2 relative ${featured ? 'border-[var(--brand-light)] ring-4 ring-[var(--brand-light)]/10 scale-[1.02]' : 'border-slate-100'}`}>
            {featured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg flex items-center gap-1.5">
                    <Star size={11} fill="white" /> Most Popular
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{name}</h3>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-slate-700">₹</span>
                    <span className="text-5xl font-black tracking-tight text-slate-900">
                        {price.toLocaleString()}
                    </span>
                    <span className="text-slate-400 font-bold uppercase text-xs">/mo</span>
                </div>
                {yearly && (
                    <p className="text-xs text-slate-400 font-medium mb-4">
                        ₹{yearlyTotal.toLocaleString()} billed annually
                    </p>
                )}

                {/* Credits */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 mt-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-1">Operational Credits</p>
                    <p className="text-2xl font-black tracking-tighter text-[var(--brand-light)]">{credits.toLocaleString()}</p>
                </div>

                {/* Feature Tags */}
                {!hasFlows && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg">Live Chat</span>
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-black rounded-lg">Templates</span>
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-black rounded-lg">Campaigns</span>
                    </div>
                )}
            </div>

            {/* Feature List */}
            <ul className="space-y-3 mb-8 flex-grow">
                {features.map((f, i) => (
                    <li key={i} className="flex gap-3 items-start">
                        <Check size={16} className="shrink-0 text-[var(--brand-light)] mt-0.5" />
                        <span className="text-slate-600 font-medium text-sm leading-snug">{f}</span>
                    </li>
                ))}
            </ul>

            {/* CTA — Start Trial Button */}
            <Link
                href={`/register?plan=${slug}&billing=${yearly ? 'yearly' : 'monthly'}`}
                className={`${featured ? 'g-btn-primary' : 'g-btn-outline'} w-full group py-4 text-sm font-black flex items-center justify-center gap-2`}
            >
                <Zap size={15} className={featured ? "text-yellow-300" : "text-[var(--brand-light)]"} />
                Start 7-Day Free Trial
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="text-center text-[10px] text-slate-400 font-medium mt-2">
                No credit card required
            </p>
        </div>
    );
}
