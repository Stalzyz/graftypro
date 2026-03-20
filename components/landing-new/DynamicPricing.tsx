"use client";
import React, { useState } from 'react';
import { Check, Zap, Rocket, Building2, MessageCircle } from 'lucide-react';

const plans = [
    {
        name: "STARTER",
        monthly_price: 1999,
        yearly_price: 19999,
        original_monthly: 2999,
        icon: <Zap className="w-5 h-5" />,
        desc: "Essential WhatsApp Automation for small teams.",
        features: [
            "Quick Replies Access",
            "Visual Flow Builder",
            "Message Nodes Only",
            "Shared Inbox (2 Agents)",
            "Unlimited Broadcasts"
        ],
        gradient: "from-blue-500 to-indigo-600"
    },
    {
        name: "GROWTH",
        monthly_price: 3999,
        yearly_price: 39999,
        original_monthly: 5999,
        icon: <Rocket className="w-5 h-5" />,
        desc: "Scale your sales with E-commerce and CRM.",
        features: [
            "Everything in Starter",
            "CRM & Lead Management",
            "E-Commerce WhatsApp Shop",
            "Courses & Academy Engine",
            "Logic & Automation Nodes",
            "Shared Inbox (10 Agents)"
        ],
        gradient: "from-purple-500 to-pink-600",
        popular: true
    },
    {
        name: "ENTERPRISE",
        monthly_price: 14999,
        yearly_price: 149999,
        original_monthly: 24999,
        icon: <Building2 className="w-5 h-5" />,
        desc: "Ultimate scale with Drips and Integrations.",
        features: [
            "Everything in Growth",
            "Drip Message Sequences",
            "Advanced CRM Engine",
            "Integration Nodes (Webhooks/API)",
            "Dedicated Success Manager",
            "Shared Inbox (50 Agents)"
        ],
        gradient: "from-orange-500 to-red-600"
    }
];

export default function DynamicPricing() {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <section className="py-24 bg-white relative overflow-hidden" id="pricing">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Simple, Transparent Pricing</h2>
                    <p className="text-slate-500 text-lg">Choose the perfect plan for your business growth.</p>
                    
                    {/* Toggle Switch */}
                    <div className="mt-10 flex items-center justify-center gap-4">
                        <span className={`text-sm font-bold ${!isYearly ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
                        <button 
                            onClick={() => setIsYearly(!isYearly)}
                            className="relative w-16 h-8 rounded-full p-1 transition-all duration-300 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 focus:outline-none"
                        >
                            <div className={`w-6 h-6 bg-white rounded-full transition-transform shadow-md transform ${isYearly ? 'translate-x-8' : 'translate-x-0'}`} />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${isYearly ? 'text-slate-900' : 'text-slate-400'}`}>Yearly</span>
                            <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full">SAVE 20%</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((p) => (
                        <div key={p.name} className={`relative flex flex-col p-8 rounded-[2.5rem] border ${p.popular ? 'border-purple-200 shadow-2xl shadow-purple-100 ring-2 ring-purple-50' : 'border-slate-100'} bg-white transition-all hover:scale-[1.02]`}>
                            {p.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest shadow-lg">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.gradient} text-white flex items-center justify-center mb-6 shadow-lg`}>
                                {p.icon}
                            </div>

                            <h3 className="text-xl font-black mb-2 tracking-tight text-slate-800">{p.name}</h3>
                            <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed">{p.desc}</p>

                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-bold">₹</span>
                                    <span className="text-5xl font-black tracking-tight">
                                        {isYearly ? (p.yearly_price / 12).toLocaleString(undefined, { maximumFractionDigits: 0 }) : p.monthly_price.toLocaleString()}
                                    </span>
                                    <span className="text-slate-400 font-bold">/mo</span>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">+ Tax & WhatsApp charges</p>
                            </div>

                            <div className="space-y-4 mb-10 flex-grow">
                                {p.features.map(f => (
                                    <div key={f} className="flex items-start gap-3">
                                        <div className="bg-green-50 p-1 rounded-full mt-0.5">
                                            <Check className="w-3 h-3 text-green-600" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-600">{f}</span>
                                    </div>
                                ))}
                            </div>

                            <button className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${p.popular ? 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                Start Free Trial
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* WhatsApp Floating Button */}
            <a 
                href="https://wa.me/919789359407" 
                target="_blank" 
                rel="noreferrer"
                className="fixed bottom-8 right-8 w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform z-50 animate-bounce"
            >
                <MessageCircle fill="currentColor" size={32} />
            </a>
        </section>
    );
}
