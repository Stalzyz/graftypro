"use client";
import React from "react";

export default function WhyGrafty() {
    return (
        <section className="py-40 bg-[#0B0F0C] relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="max-w-4xl mb-32 animate-up">
                    <h2 className="text-white text-4xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none">Structure <br /><span className="text-white/20">Over Chaos.</span></h2>

                    <div className="space-y-8 max-w-2xl mt-12">
                        <p className="text-2xl lg:text-3xl font-medium text-slate-300 italic">
                            Most businesses operate WhatsApp manually. <br />
                            <span className="text-slate-600">Disorganized. Reactive. Dependent.</span>
                        </p>
                        <p className="text-xl font-black text-white italic border-l-2 pl-8 py-4 uppercase tracking-tighter" style={{ borderLeftColor: 'var(--brand-light)' }}>
                            "Grafty introduces structure."
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-white/5">
                    <LuxuryFeature
                        title="Automation"
                        desc="Precision logic replacing manual guesswork and human error."
                    />
                    <LuxuryFeature
                        title="Ledger Control"
                        desc="Every operational cost accounted for in real-time."
                    />
                    <LuxuryFeature
                        title="Predictability"
                        desc="Outcome-driven flows that move the revenue needle."
                    />
                    <LuxuryFeature
                        title="Team Clarity"
                        desc="Isolated permissions and transparent contribution tracking."
                    />
                </div>

                <div className="mt-32 text-center animate-up">
                    <p className="text-slate-500 font-medium italic text-xl border-t border-white/5 pt-16">
                        When communication is structured, growth becomes intentional.
                    </p>
                </div>
            </div>
        </section>
    );
}

function LuxuryFeature({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="bg-[#0B0F0C] p-16 hover:bg-white/[0.01] transition-all group">
            <h4 className="text-white text-xs font-black uppercase tracking-[5px] mb-8 group-hover:text-[var(--brand-light)] transition-colors">{title}</h4>
            <p className="text-slate-500 text-lg font-medium italic leading-relaxed tracking-tight">{desc}</p>
        </div>
    );
}
