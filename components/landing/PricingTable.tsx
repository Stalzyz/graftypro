
"use client";
import React from 'react';
import { Check, Zap, Rocket, Crown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const packages = [
    {
        name: "Starter",
        price: "3,999",
        desc: "Perfect for small businesses starting with WhatsApp.",
        icon: <Zap className="text-amber-400" />,
        color: "from-amber-400/20 to-orange-500/20",
        features: [
            "Official Meta Cloud API",
            "1,000 Free Service Conversations",
            "Visual Flow Builder",
            "Basic Analytics",
            "1 Team Member",
            "Standard Support"
        ]
    },
    {
        name: "Professional",
        price: "9,999",
        desc: "Best for growing brands scaling their engagement.",
        icon: <Rocket className="text-wa-green" />,
        color: "from-wa-green/20 to-emerald-500/20",
        popular: true,
        features: [
            "Everything in Starter",
            "Unlimited Campaigns",
            "Abandoned Cart Recovery",
            "Drip Campaigns & Sequences",
            "5 Team Members",
            "Priority Support",
            "Multi-Agent Shared Inbox"
        ]
    },
    {
        name: "Enterprise",
        price: "24,999",
        desc: "For large scale operations with high volume needs.",
        icon: <Crown className="text-purple-400" />,
        color: "from-purple-400/20 to-indigo-500/20",
        features: [
            "Everything in Professional",
            "Custom API Integrations",
            "Meta Green Tick Application",
            "Dedicated Account Manager",
            "Unlimited Team Members",
            "Advanced Multi-level Analytics",
            "SLA Based Support"
        ]
    }
];

export default function PricingTable() {
    const [plans, setPlans] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [billingCycle, setBillingCycle] = React.useState<"MONTHLY" | "YEARLY">("MONTHLY");

    React.useEffect(() => {
        fetch("/api/billing/plans")
            .then(res => res.json())
            .then(data => {
                setPlans(data.data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="py-24 bg-black flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-slate-800 border-t-wa-green rounded-full animate-spin" />
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Accessing Catalog...</p>
        </div>
    );

    return (
        <section id="pricing-packages" className="py-24 bg-black relative">
            <div className="max-w-7xl mx-auto px-6 text-slate-100">
                <div className="text-center mb-10">
                    <h2 className="text-4xl md:text-6xl font-black mb-6 italic tracking-tight underline decoration-wa-green decoration-8 underline-offset-[12px]">Dynamic Plans</h2>
                    <p className="text-slate-400 text-lg font-medium">Predictable billing tailored to your scale. No hidden architecture fees.</p>
                </div>

                {/* Toggle */}
                <div className="flex justify-center mb-16">
                    <div className="bg-slate-900/60 p-1 rounded-full flex relative border border-slate-800">
                        <button
                            onClick={() => setBillingCycle("MONTHLY")}
                            className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all relative z-10 ${billingCycle === "MONTHLY" ? "text-black" : "text-slate-400 hover:text-white"}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle("YEARLY")}
                            className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all relative z-10 ${billingCycle === "YEARLY" ? "text-black" : "text-slate-400 hover:text-white"}`}
                        >
                            Yearly
                        </button>
                        <div
                            className={`absolute top-1 bottom-1 w-1/2 bg-wa-green rounded-full transition-all duration-300 ${billingCycle === "YEARLY" ? "left-[calc(50%-4px)] translate-x-1" : "left-1"}`}
                        />
                        {billingCycle === "YEARLY" && (
                            <div className="absolute -top-3 -right-6 bg-amber-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full animate-bounce">
                                SAVE 20%
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((pkg, i) => {
                        const price = billingCycle === "MONTHLY"
                            ? (pkg.monthly_price || pkg.price)
                            : (pkg.yearly_price || pkg.price * 12);

                        return (
                            <div
                                key={i}
                                className={`relative glass-card p-10 flex flex-col border-2 transition-all hover:scale-[1.02] bg-slate-900/40 ${i === 1 ? 'border-wa-green shadow-[0_0_40px_rgba(35,211,102,0.15)]' : 'border-slate-800'}`}
                            >
                                {i === 1 && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-wa-green text-black px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                        High Density Build
                                    </div>
                                )}

                                <div className={`w-16 h-16 rounded-2xl bg-wa-green/10 flex items-center justify-center mb-8 border border-wa-green/20`}>
                                    <Zap className="text-wa-green" size={32} />
                                </div>

                                <h3 className="text-3xl font-black mb-2 text-white">{pkg.name}</h3>
                                <p className="text-slate-500 text-sm mb-8 leading-relaxed font-bold h-12 line-clamp-2">{pkg.description || 'Enterprise module access enabled.'}</p>

                                <div className="mb-10">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-slate-400 text-2xl font-bold italic">{pkg.currency === 'INR' ? '₹' : '$'}</span>
                                        <span className="text-6xl font-black text-white tracking-tighter">
                                            {Number(price).toLocaleString()}
                                        </span>
                                        <div className="flex flex-col ml-2">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[8px] leading-none mb-1">+ GST</span>
                                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[8px]">
                                                / {billingCycle === "MONTHLY" ? "mo" : "yr"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-12 flex-1">
                                    <PricingFeature text={`${pkg.max_contacts === -1 ? "Unlimited" : pkg.max_contacts.toLocaleString()} Contacts`} />
                                    <PricingFeature text={`${pkg.max_messages === -1 ? "Unlimited" : pkg.max_messages.toLocaleString()} Messages`} />
                                    <PricingFeature text={`${pkg.max_flows === -1 ? "Unlimited" : pkg.max_flows} Automation Flows`} />
                                    {pkg.api_access && <PricingFeature text="Developer API Hub" active />}
                                    {pkg.drip_campaign_access && <PricingFeature text="Drip Sequence Engine" active />}
                                </div>

                                <Link
                                    href={`/register?plan=${pkg.id}&cycle=${billingCycle}`}
                                    className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all ${i === 1 ? 'bg-wa-green text-black hover:bg-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                                >
                                    Start 14 days trial <ArrowRight size={16} />
                                </Link>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-slate-500 text-sm mb-6">Need a custom solution for high volume?</p>
                    <Link href="https://wa.me/919789359407" target="_blank" className="btn-secondary px-8 py-3">
                        Talk to Our Enterprise Team
                    </Link>
                </div>
            </div>
        </section>
    );
}

function PricingFeature({ text, active = true }: { text: string, active?: boolean }) {
    return (
        <div className="flex items-center gap-3 text-sm text-slate-300 font-medium group">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${active ? 'bg-wa-green/10' : 'bg-slate-800'}`}>
                <Check className={active ? 'text-wa-green' : 'text-slate-600'} size={12} />
            </div>
            <span className={active ? 'text-slate-300' : 'text-slate-600 italic'}>{text}</span>
        </div>
    );
}
