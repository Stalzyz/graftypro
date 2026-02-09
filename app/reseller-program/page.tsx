
"use client";
import React from 'react';
import { Users, Handshake, TrendingUp, ShieldCheck, ChevronRight, CheckCircle, Globe, BadgeDollarSign } from 'lucide-react';
import Link from 'next/link';
import { Logo } from "@/components/ui/Logo";
import DetailedFooter from "@/components/landing/DetailedFooter";

export default function ResellerLandingPage() {
    return (
        <main className="landing-body min-h-screen relative bg-black">
            <div className="hero-gradient" />

            {/* Nav */}
            <nav className="max-w-7xl mx-auto px-6 py-10 flex items-center justify-between relative z-10">
                <Link href="/">
                    <Logo size={70} variant="light" />
                </Link>
                <div className="flex items-center gap-6">
                    <Link href="/login" className="nav-link">Login</Link>
                    <Link href="/register?type=RESELLER" className="btn-primary">
                        Become a Partner <ChevronRight size={18} />
                    </Link>
                </div>
            </nav>

            <section className="max-w-7xl mx-auto px-6 py-24 relative z-10 text-center">
                <div className="section-tag mb-6">Partner Program</div>
                <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight">
                    Start Your Own <br />
                    <span className="text-gradient">WhatsApp SaaS Agency</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
                    Join the WAVO Partner Network. Resell the world's most powerful WhatsApp Marketing engine and keep up to 35% recurring commission.
                </p>
                <div className="flex justify-center gap-6">
                    <Link href="/register?type=RESELLER" className="btn-primary px-10 py-5 text-lg">
                        Apply for Partner Access
                    </Link>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-24 border-y border-slate-900">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <PartnerFeature
                        icon={<BadgeDollarSign />}
                        title="35% Commissions"
                        desc="Earn high recurring margins on every monthly subscription you sell."
                    />
                    <PartnerFeature
                        icon={<Globe />}
                        title="White-Label Ready"
                        desc="Sell under your own brand name, domain, and colors (Empire & Legend tiers)."
                    />
                    <PartnerFeature
                        icon={<Handshake />}
                        title="Dedicated Support"
                        desc="Get a dedicated partner success manager to help you close deals."
                    />
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black mb-4">Partner Tiers</h2>
                    <p className="text-slate-400">The more you grow, the more you earn.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <TierCard name="Starter" vendors="0-10" rate="20%" />
                    <TierCard name="Growth" vendors="11-50" rate="25%" />
                    <TierCard name="Empire" vendors="51-100" rate="30%" popular />
                    <TierCard name="Legend" vendors="100+" rate="35%" />
                </div>
            </section>

            <DetailedFooter />
        </main>
    );
}

function PartnerFeature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="glass-card p-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-wa-green/10 text-wa-green rounded-2xl flex items-center justify-center mb-6">
                {React.cloneElement(icon as React.ReactElement, { size: 32 })}
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

function TierCard({ name, vendors, rate, popular }: { name: string, vendors: string, rate: string, popular?: boolean }) {
    return (
        <div className={`p-8 rounded-[2.5rem] border ${popular ? 'border-wa-green bg-wa-green/5' : 'border-slate-800 bg-slate-900/40'} text-center`}>
            <h4 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-4">{name} Partner</h4>
            <div className="text-4xl font-black text-white mb-2">{rate}</div>
            <div className="text-slate-400 text-sm mb-6">Commission Rate</div>
            <div className="pt-6 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Requirement</div>
                <div className="text-white font-bold mt-1">{vendors} Active Vendors</div>
            </div>
        </div>
    );
}
