"use client";
import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function MasterDifference() {
    const points = [
        "Goal-Based Automation Logic",
        "Built-in Revenue Tracking",
        "GST-Compliant Automated Invoicing",
        "Multi-tenant Platform & Affiliate Partner Hierarchy",
        "Automated Real-time Revenue Split",
        "Isolated Infrastructure Nodes",
        "Zero Human Intervention Required"
    ];

    return (
        <section className="section-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-32 items-center">
                    <div className="lg:w-1/2 animate-up">
                        <h2 className="g-h2 mb-10">How We’re <span className="text-gradient">Different.</span></h2>
                        <div className="space-y-6">
                            {points.map((p, i) => (
                                <div key={i} className="flex gap-4 items-start group">
                                    <div className="p-1 rounded-full group-hover:bg-[var(--brand-light)] group-hover:text-white transition-all shadow-sm" style={{ backgroundColor: 'rgba(34, 133, 87, 0.1)', color: 'var(--brand-light)' }}>
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <p className="text-xl font-black text-slate-800 italic uppercase tracking-tighter">{p}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:w-1/2 animate-up">
                        <div className="bg-slate-900 rounded-[32px] p-12 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-light)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10 flex flex-col gap-10">
                                <div className="p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <p className="text-white text-3xl font-black italic tracking-tighter uppercase leading-tight">"Engineered for <br /> operational integrity."</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                                        <div className="h-full bg-emerald-500 w-[99.9%]" style={{ background: 'var(--brand-gradient)' }} />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[4px]">System Integrity Level</p>
                                        <p className="text-emerald-500 font-bold italic">99.99%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
