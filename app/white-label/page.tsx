
"use client";
import React from 'react';
import { Palette, Globe, Server, ShieldCheck, ChevronRight, CheckCircle, Smartphone, Cpu } from 'lucide-react';
import Link from 'next/link';
import { Logo } from "@/components/ui/Logo";
import DetailedFooter from "@/components/landing/DetailedFooter";

export default function WhiteLabelPage() {
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
                        Start White-Label <ChevronRight size={18} />
                    </Link>
                </div>
            </nav>

            <section className="max-w-7xl mx-auto px-6 py-24 relative z-10 text-center">
                <div className="section-tag mb-6 text-purple-400 border-purple-400/30 bg-purple-400/10">Enterprise Solution</div>
                <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight">
                    Your Brand. <br />
                    <span className="text-gradient">Our Technology.</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
                    Launch your own WhatsApp automation platform in 24 hours. Full white-label capabilities with custom domain, branding, and billing.
                </p>
                <div className="flex justify-center gap-6">
                    <Link href="https://wa.me/919789359407?text=I%20want%20to%20know%20more%20about%20White-Label" target="_blank" className="btn-primary bg-purple-600 hover:bg-purple-500 px-10 py-5 text-lg">
                        Get Demo & Pricing
                    </Link>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-24 border-y border-slate-900">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-4xl font-black mb-8">What is <span className="text-purple-400">White-Label?</span></h2>
                        <div className="space-y-6">
                            <FeatureRow icon={<Palette />} title="Custom Branding" desc="Use your own logo, favicon, and primary brand colors across the entire dashboard." />
                            <FeatureRow icon={<Globe />} title="Custom Domain" desc="Run the platform on your own subdomain like app.yourcompany.com." />
                            <FeatureRow icon={<Server />} title="Private Infrastructure" desc="Dedicated nodes to ensure 99.9% uptime for your most demanding enterprise clients." />
                            <FeatureRow icon={<Smartphone />} title="Native Mobile Support" desc="Fully responsive dashboard that works as a PWA for your customers' convenience." />
                        </div>
                    </div>
                    <div className="glass-card p-4 relative group">
                        <div className="absolute inset-0 bg-purple-600/10 blur-[80px] -z-10 group-hover:bg-purple-600/20 transition-all" />
                        <img
                            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
                            alt="Dashboard Preview"
                            className="rounded-2xl"
                        />
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-24 text-center">
                <h2 className="text-4xl font-black mb-16">Ready to Scale?</h2>
                <div className="flex flex-col md:flex-row justify-center gap-8">
                    <div className="p-10 glass-card text-left max-w-sm">
                        <div className="text-2xl font-bold mb-4">Partner Tier</div>
                        <p className="text-slate-500 mb-8 text-sm leading-relaxed">Best for agencies and freelancers wanting to provide a value-added service to their clients.</p>
                        <ul className="space-y-3 mb-10">
                            <li className="flex items-center gap-2 text-xs font-bold text-slate-300"><CheckCircle size={14} className="text-wa-green" /> 20-35% Commissions</li>
                            <li className="flex items-center gap-2 text-xs font-bold text-slate-300"><CheckCircle size={14} className="text-wa-green" /> Partner Dashboard</li>
                            <li className="flex items-center gap-2 text-xs font-bold text-slate-300"><CheckCircle size={14} className="text-wa-green" /> Sales Toolkit</li>
                        </ul>
                        <Link href="/reseller-program" className="text-wa-green font-bold text-sm tracking-widest uppercase hover:underline">View Program →</Link>
                    </div>

                    <div className="p-10 glass-card text-left border-purple-500/30 max-w-sm">
                        <div className="text-2xl font-bold mb-4 text-purple-400">Enterprise White-Label</div>
                        <p className="text-slate-500 mb-8 text-sm leading-relaxed">Complete ownership. Your domain, your pricing, your branding. No mention of WAVO anywhere.</p>
                        <ul className="space-y-3 mb-10">
                            <li className="flex items-center gap-2 text-xs font-bold text-slate-300"><CheckCircle size={14} className="text-purple-400" /> Custom Domain (CNAME)</li>
                            <li className="flex items-center gap-2 text-xs font-bold text-slate-300"><CheckCircle size={14} className="text-purple-400" /> SSO & Custom Auth</li>
                            <li className="flex items-center gap-2 text-xs font-bold text-slate-300"><CheckCircle size={14} className="text-purple-400" /> Custom SMTP Configuration</li>
                        </ul>
                        <Link href="https://wa.me/919789359407" className="text-purple-400 font-bold text-sm tracking-widest uppercase hover:underline">Request Enterprise →</Link>
                    </div>
                </div>
            </section>

            <DetailedFooter />
        </main>
    );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex items-start gap-5">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0 text-purple-400">
                {React.cloneElement(icon as React.ReactElement, { size: 24 })}
            </div>
            <div>
                <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
                <p className="text-slate-500 text-sm">{desc}</p>
            </div>
        </div>
    );
}
