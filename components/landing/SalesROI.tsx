
"use client";
import React from 'react';
import { TrendingUp, Clock, Target, DollarSign } from 'lucide-react';

export default function SalesROI() {
    return (
        <section className="py-24 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <div className="section-tag">Business Growth</div>
                        <h2 className="text-4xl md:text-5xl font-black mt-6 mb-8 leading-tight">
                            Unlock <span className="text-wa-green">3X Sales Efficiency</span> with Automation
                        </h2>
                        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                            Stop losing leads to slow response times. Grafty enables real-time engagement that keeps customers in your sales funnel and drives consistent ROI.
                        </p>

                        <div className="space-y-8">
                            {[
                                { title: "25% Higher Conversion", icon: <TrendingUp className="text-emerald-400" />, desc: "Automated follow-ups ensure no lead goes cold, boosting conversion rates instantly." },
                                { title: "Instant Lead Filtering", icon: <Target className="text-amber-400" />, desc: "Qualify leads with smart AI workflows before a human agent even steps in." },
                                { title: "Lower Customer Acquisition Cost", icon: <DollarSign className="text-wa-green" />, desc: "Reach thousands of customers at a fraction of the cost of traditional ads." },
                                { title: "24/7 Sales Engine", icon: <Clock className="text-purple-400" />, desc: "Your business stays open while you sleep, handling queries and closing deals." }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-6 items-start">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                                        <p className="text-slate-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-wa-green/20 blur-[100px] rounded-full" />
                        <div className="glass-card p-8 relative overflow-hidden">
                            <div className="text-center mb-10">
                                <h3 className="text-3xl font-black mb-2">ROI Calculator</h3>
                                <p className="text-slate-500">Estimate your potential growth</p>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span>Current Monthly Leads</span>
                                        <span className="text-wa-green">1,000</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full">
                                        <div className="h-full w-1/3 bg-wa-green rounded-full shadow-[0_0_10px_rgba(35,211,102,0.5)]" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-700">
                                        <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Before Grafty</div>
                                        <div className="text-2xl font-black">₹4,00,000</div>
                                        <div className="text-[10px] text-red-400 font-bold mt-1">10% CR</div>
                                    </div>
                                    <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/30">
                                        <div className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">After Grafty</div>
                                        <div className="text-2xl font-black">₹10,00,000</div>
                                        <div className="text-[10px] text-emerald-400 font-bold mt-1">25% CR</div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-wa-green/20 to-blue-500/20 p-8 rounded-3xl border border-white/10 text-center">
                                    <div className="text-slate-400 font-bold mb-1">Estimated Annual uplift</div>
                                    <div className="text-4xl font-black text-wa-green">₹72,00,000</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
}
