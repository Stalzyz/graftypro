"use client";
import React from "react";
import { ArrowRight } from "lucide-react";

export default function ModulesOverview() {
    return (
        <section id="modules" className="py-40 bg-[#0B0F0C] border-y border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-32 animate-up">
                    <h2 className="text-white text-4xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none">Architectural <br /><span className="text-white/20">Standards.</span></h2>
                </div>

                <div className="space-y-48">
                    <InfrastructureSection
                        title="Flow Architecture"
                        desc="Interactive journeys designed for conversion — not conversation."
                        items={["Interactive Buttons", "Payment Collect", "User Tracking", "Logic Trees"]}
                        quote="Every click has a measurable destination."
                    />

                    <InfrastructureSection
                        title="Revenue Engine"
                        desc="Every transaction logged. Every credit tracked. Every invoice generated."
                        items={["Real-time Ledger", "Auto-GST Invoices", "Wallet Economics", "Financial Sync"]}
                        quote="Clarity replaces operational guesswork."
                        reverse
                    />

                    <InfrastructureSection
                        title="Multi-Tenant Precision"
                        desc="Designed for agencies, institutions, and white-label operators."
                        items={["Isolated Nodes", "Role Governance", "Owner Hub", "Multi-brand Hub"]}
                        quote="Architecture built for scale, not volume."
                    />
                </div>
            </div>
        </section>
    );
}

function InfrastructureSection({ title, desc, items, quote, reverse }: { title: string; desc: string; items: string[]; quote: string; reverse?: boolean }) {
    return (
        <div className={`flex flex-col lg:flex-row gap-20 lg:gap-32 items-center ${reverse ? 'lg:flex-row-reverse' : ''} animate-up`}>
            <div className="lg:w-1/2">
                <h3 className="text-4xl lg:text-5xl font-black text-white mb-8 tracking-tighter leading-none uppercase italic">{title}</h3>
                <p className="g-p text-xl lg:text-2xl font-medium mb-12 text-slate-400 italic">{desc}</p>
                <div className="grid grid-cols-2 gap-6 mb-12">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 font-black uppercase tracking-widest text-[10px]" style={{ color: 'var(--brand-light)' }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--brand-light)' }} />
                            {item}
                        </div>
                    ))}
                </div>
                <p className="text-white/80 font-bold italic border-l-2 pl-8 py-4 bg-white/[0.01]" style={{ borderLeftColor: 'var(--brand-light)' }}>
                    "{quote}"
                </p>
            </div>

            <div className="lg:w-1/2 w-full aspect-video bg-[#121814] border border-white/5 flex items-center justify-center relative group overflow-hidden rounded-[48px]">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'radial-gradient(circle at center, rgba(34, 133, 87, 0.1) 0%, transparent 70%)' }} />
                <div className="text-[10px] font-black tracking-[10px] uppercase text-white/[0.03] transform -rotate-12 scale-150">INFRASTRUCTURE</div>
                <div className="relative z-10 text-white/20 text-xs font-black uppercase tracking-widest">[ Protocol Visualization ]</div>
            </div>
        </div>
    );
}
