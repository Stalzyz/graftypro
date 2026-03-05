"use client";
import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Prerequisites() {
    const checks = [
        "Business Email Presence",
        "Meta Business Manager Ownership",
        "Dedicated Clean Phone Number",
        "Verified Business Identity",
        "GSTIN Registration Documents"
    ];

    return (
        <section className="section-gray">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-32 items-center">
                    <div className="lg:w-1/2 animate-up">
                        <div className="bg-white p-16 rounded-[48px] shadow-2xl border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#228557] rounded-full blur-[80px] opacity-10" />
                            <h2 className="g-h3 mb-12 uppercase tracking-tighter italic font-black text-2xl">Onboarding Protocol</h2>
                            <div className="space-y-8 mb-16">
                                {checks.map((c, i) => (
                                    <div key={i} className="flex items-center gap-6 group">
                                        <div style={{ color: 'var(--brand-light)' }} className="group-hover:scale-110 transition-transform">
                                            <CheckCircle2 size={28} />
                                        </div>
                                        <span className="text-xl font-black text-slate-800 italic uppercase tracking-tighter">{c}</span>
                                    </div>
                                ))}
                            </div>
                            <Link href="/academy" className="g-btn-primary w-full group py-6 text-xl">
                                Detailed Blueprints <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    <div className="lg:w-1/2 animate-up">
                        <h2 className="text-3xl lg:text-5xl font-black mb-10 leading-tight italic uppercase tracking-tighter">
                            Ready to Orchestrate <br />
                            <span className="text-gradient">Infrastructure Wealth?</span>
                        </h2>
                        <p className="g-p text-xl mb-12 font-medium italic">
                            Infrastructure is only as resilient as its configuration. We provide the technical directive. You execute the intention.
                        </p>
                        <div className="grid grid-cols-2 gap-12">
                            <div className="space-y-3">
                                <p className="text-5xl font-black text-slate-900 tracking-tighter italic">100%</p>
                                <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Policy Compliance</p>
                            </div>
                            <div className="space-y-3">
                                <p className="text-5xl font-black text-slate-900 tracking-tighter italic">Zero</p>
                                <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Manual Latency</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
