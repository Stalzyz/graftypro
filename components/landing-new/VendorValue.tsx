"use client";
import React from "react";
import { Zap, Wallet, Inbox, Layout } from "lucide-react";
import Link from "next/link";

export default function VendorValue() {
    return (
        <section className="py-40 bg-[#0B0F0C] relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-32 animate-up">
                    <h2 className="text-white text-4xl lg:text-6xl font-black italic uppercase tracking-tighter">Built for Measurable <br /><span className="text-white/20">Growth.</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <ValueCard
                        icon={<Zap size={24} />}
                        title="Automate & Convert"
                        desc="Build visual non-linear flows that handle qualification, booking, and sales while you sleep."
                        link="/academy"
                        cta="See Flows"
                    />
                    <ValueCard
                        icon={<Wallet size={24} />}
                        title="Credit & Billing Control"
                        desc="A secure financial ecosystem with automated GST invoices and real-time ledger tracking."
                        link="/academy"
                        cta="How credits work"
                    />
                    <ValueCard
                        icon={<Inbox size={24} />}
                        title="Team Inbox & CRM"
                        desc="Multi-seat conversation management. Assign leads, tag customers, and never lose a response."
                        link="/academy"
                        cta="Team features"
                    />
                    <ValueCard
                        icon={<Layout size={24} />}
                        title="Industry-ready Templates"
                        desc="Pre-built architectures for Education, Ecommerce, and Healthcare. Deploy in minutes."
                        link="/solutions"
                        cta="See templates"
                    />
                </div>
            </div>
        </section>
    );
}

function ValueCard({ icon, title, desc, link, cta }: { icon: React.ReactNode; title: string; desc: string; link: string; cta: string }) {
    return (
        <div className="p-16 bg-[#121814] border border-white/5 hover:border-[var(--brand-light)]/30 transition-all flex flex-col gap-10 rounded-[32px]">
            <div className="w-14 h-14 border border-[var(--brand-light)]/20 flex items-center justify-center" style={{ color: 'var(--brand-light)' }}>
                {icon}
            </div>
            <div>
                <h3 className="text-3xl font-black text-white mb-6 italic tracking-tight uppercase">{title}</h3>
                <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10 italic">{desc}</p>
                <Link href={link} className="inline-flex items-center gap-4 font-black uppercase tracking-[4px] text-[10px] hover:text-white transition-colors group" style={{ color: 'var(--brand-light)' }}>
                    {cta} <div className="w-12 h-px bg-white/10 group-hover:w-20 group-hover:bg-white transition-all" />
                </Link>
            </div>
        </div>
    );
}
