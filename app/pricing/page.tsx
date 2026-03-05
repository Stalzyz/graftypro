"use client";
import React from 'react';
import "../landing/new-grafty.css";
import LandingNavbar from "../../components/landing-new/LandingNavbar";
import LandingFooter from "../../components/landing-new/LandingFooter";
import { DynamicPricingSection } from "../../components/landing-new/DynamicPricingSection";
import { Check, ArrowRight, ShieldCheck, Wallet, Zap, HelpCircle, Info, BarChart3, Database, Users } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
    return (
        <main className="g-body">
            <LandingNavbar />

            {/* Hero */}
            <section className="pt-40 pb-20 lg:pt-56 lg:pb-32 section-white overflow-hidden relative">
                <div className="hero-gradient" />
                <div className="max-w-7xl mx-auto px-6 relative z-10 animate-up">
                    <div className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-[4px] text-xs mb-8">
                        <Wallet size={16} /> Financial Architecture v1.0
                    </div>
                    <h1 className="g-h1 mb-8 max-w-5xl">
                        Transparent <br />
                        <span className="text-gradient">Operational Economics.</span>
                    </h1>
                    <p className="g-p text-xl mb-12 max-w-3xl">
                        No hidden layers. No complex calculations. Grafty uses a goal-driven credit economy designed for serious business operators who value structure over shortcuts.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a href="#plans" className="g-btn-primary px-8 py-4">Compare Plans</a>
                        <a href="#economics" className="g-btn-outline px-8 py-4">Credit Economics</a>
                    </div>
                </div>
            </section>

            {/* Dynamic Plans — live from super admin */}
            <section id="plans" className="section-gray">
                <div className="max-w-7xl mx-auto px-6">
                    <DynamicPricingSection />
                </div>
            </section>

            {/* Credit Economics - The Textbook Part */}
            <section id="economics" className="section-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                        <div className="animate-up">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[5px] mb-4 block">Chapter 01</span>
                            <h2 className="g-h2 mb-10">Understanding <br />Credit Economics.</h2>
                            <div className="prose prose-slate max-w-none space-y-8">
                                <p className="g-p font-medium text-slate-800">WhatsApp Business Platform uses 'Conversation-Based Pricing'. Grafty simplifies this using a unified Credit Economy.</p>

                                <DocPart title="1.1 The 24-Hour Window">
                                    <p>A 'Conversation' is a 24-hour window that starts when the first message is delivered. During this window, any number of messages can be exchanged between the business and the user for a single fee.</p>
                                </DocPart>

                                <DocPart title="1.2 Conversation Categories">
                                    <ul className="space-y-6 mt-6">
                                        <CategoryItem title="Marketing" desc="Promotions, offers, or any message that isn't Utility or Authentication." cost="Highest Credit Usage" />
                                        <CategoryItem title="Utility" desc="Direct transaction updates, shipping alerts, or billing information." cost="Medium Credit Usage" />
                                        <CategoryItem title="Authentication" desc="One-time passwords (OTPs) for login or verification." cost="Low Credit Usage" />
                                        <CategoryItem title="Service" desc="Replies to user-initiated messages within a 24-hour window." cost="Free (First 1,000 / mo)" />
                                    </ul>
                                </DocPart>

                                <DocPart title="1.3 Auto-Deduction Logic">
                                    <p>Grafty's engine automatically detects the category of your template and deducts credits from your wallet in real-time. Full ledger visibility is provided for every single deduction.</p>
                                </DocPart>
                            </div>
                        </div>

                        <div className="animate-up sticky top-32">
                            <div className="g-card bg-slate-900 border-none p-12 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 text-white/5 font-black text-4xl italic transform translate-x-1/2 -translate-y-1/2 uppercase tracking-tighter">LEDGER</div>
                                <h3 className="text-2xl font-black mb-8 italic">Real-time Cost Ledger</h3>
                                <p className="text-slate-400 mb-8 font-medium">Inside your Grafty dashboard, every conversation is logged with atomic precision. We verify costs directly with Meta's pricing manifest.</p>
                                <div className="space-y-6">
                                    <LedgerLine label="Meta Category: Marketing" value="- 0.82 Credits" />
                                    <LedgerLine label="Meta Category: Utility" value="- 0.35 Credits" />
                                    <LedgerLine label="Service Window" value="0.00 Credits" />
                                    <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                        <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Remaining Wallet Balance</span>
                                        <span className="text-3xl font-black tracking-tighter">24,192</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Comparison - Nuclear Details */}
            <section className="section-gray">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24 animate-up">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[5px] mb-4 block">Chapter 02</span>
                        <h2 className="g-h2">Architectural Comparison.</h2>
                        <p className="g-p mt-4">Every permission. Every module. Listed for full clarity.</p>
                    </div>

                    <div className="overflow-x-auto animate-up">
                        <table className="w-full text-left border-collapse g-card !p-0 overflow-hidden">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="p-8 text-xs font-black uppercase tracking-widest text-slate-400">Infrastructure Feature</th>
                                    <th className="p-8 text-sm font-black text-slate-800">Starter</th>
                                    <th className="p-8 text-sm font-black text-emerald-600">Growth</th>
                                    <th className="p-8 text-sm font-black text-slate-800">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                <CompareRow title="Flow Builder Nodes" starter="Unlimited" growth="Unlimited" enterprise="Unlimited" />
                                <CompareRow title="Flow Logic Trees" starter="Standard" growth="Advanced (Branching)" enterprise="Advanced + API" />
                                <CompareRow title="Team Access Control" starter="1 Seat" growth="3 Seats" enterprise="Unlimited" />
                                <CompareRow title="API Endpoints" starter="-" growth="Standard" enterprise="Full Access" />
                                <CompareRow title="Broadcast Rate" starter="Tier 1" growth="Tier 2/3" enterprise="Tier 4 (Infinite)" />
                                <CompareRow title="Wait-Time Logic" starter="-" growth="Active" enterprise="Active" />
                                <CompareRow title="CRM Custom Tags" starter="10" growth="Unlimited" enterprise="Unlimited" />
                                <CompareRow title="White-Label Option" starter="-" growth="-" enterprise="Available" />
                                <CompareRow title="Support SLA" starter="48h" growth="12h" enterprise="2h (Priority)" />
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Billing & GST */}
            <section className="section-white">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-up">
                        <div>
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-8">
                                <ShieldCheck />
                            </div>
                            <h3 className="text-xl font-bold mb-6 italic uppercase tracking-tighter">GST & Compliance Billing</h3>
                            <p className="g-p text-sm">Grafty is built for high-authority businesses. Every recharge generates an automated GST-compliant invoice. You can download these instantly from your 'Billing' tab for tax reconciliation.</p>
                        </div>
                        <div>
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-8">
                                <BarChart3 />
                            </div>
                            <h3 className="text-xl font-bold mb-6 italic uppercase tracking-tighter">Scaling & Upgrades</h3>
                            <p className="g-p text-sm">You can upgrade your infrastructure node at any time. Credits are never lost during an upgrade; they are simply moved to your new tier ledger. No downtime during scaling.</p>
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="mt-32 space-y-4">
                        <h2 className="g-h3 mb-12 text-center">Billing Directives.</h2>
                        <FaqSimple q="What happens if I run out of credits?" a="Your automated flows will pause instantly. We recommend setting up 'Low Balance Alerts' to recharge before depletion. Your wallet balance is visible 24/7." />
                        <FaqSimple q="Do unused credits expire?" a="Credits remain valid for 12 months from the date of recharge, provided your infrastructure subscription is active." />
                        <FaqSimple q="Is the Meta fee separate?" a="No. Grafty credits cover BOTH the Meta conversation fee and the Grafty platform usage fee in one unified unit." />
                        <FaqSimple q="Can I get a refund for a recharge?" a="Per our governance policy, recharges are non-refundable as they involve immediate allocation of WABA resources. We recommend starting with a small recharge to test your flows." />
                    </div>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}

function PlanCard({ name, price, credits, desc, modules, featured }: { name: string; price: string; credits: string; desc: string; modules: string[]; featured?: boolean }) {
    return (
        <div className={`g-card flex flex-col h-full border-2 ${featured ? 'border-emerald-500 ring-8 ring-emerald-500/5' : 'border-slate-100'}`}>
            <div className="mb-10">
                <p className="text-[10px] font-black uppercase tracking-[4px] text-emerald-600 mb-4">{name}</p>
                <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-xl font-bold">₹</span>
                    <span className="text-6xl font-black tracking-tighter leading-none">{price}</span>
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">/mo</span>
                </div>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">{desc}</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl mb-10 border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Infrastructure Load</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">{credits} <span className="text-xs font-bold text-slate-400 uppercase">Credits / mo</span></p>
            </div>

            <ul className="space-y-4 mb-12 flex-grow">
                {modules.map((m, i) => (
                    <li key={i} className="flex gap-3 items-center text-sm font-bold text-slate-700">
                        <Check size={18} className="text-emerald-500 shrink-0" /> {m}
                    </li>
                ))}
            </ul>

            <Link href="/register" className={`${featured ? 'g-btn-primary' : 'g-btn-outline'} w-full group`}>
                Start Trial <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}

function DocPart({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-12">
            <h4 className="text-lg font-black mb-4 uppercase tracking-tighter text-slate-900 border-b border-slate-100 pb-2">{title}</h4>
            <div className="text-slate-500 font-medium leading-relaxed">{children}</div>
        </div>
    );
}

function CategoryItem({ title, desc, cost }: { title: string; desc: string, cost: string }) {
    return (
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-emerald-500/30 transition-all">
            <h5 className="font-black uppercase tracking-widest text-[10px] text-emerald-600 mb-2">{title}</h5>
            <p className="text-slate-800 font-bold mb-2">{desc}</p>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest italic">{cost}</p>
        </div>
    );
}

function LedgerLine({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center py-4 border-b border-white/5 group">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest group-hover:text-emerald-500 transition-colors">{label}</span>
            <span className="text-lg font-black tracking-tighter">{value}</span>
        </div>
    );
}

function CompareRow({ title, starter, growth, enterprise }: { title: string, starter: string, growth: string, enterprise: string }) {
    return (
        <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
            <td className="p-8 text-sm font-bold text-slate-600 group-hover:text-slate-900">{title}</td>
            <td className="p-8 text-sm font-medium text-slate-400">{starter}</td>
            <td className="p-8 text-sm font-black text-emerald-600">{growth}</td>
            <td className="p-8 text-sm font-medium text-slate-400">{enterprise}</td>
        </tr>
    );
}

function FaqSimple({ q, a }: { q: string, a: string }) {
    return (
        <div className="g-card !p-8">
            <h4 className="font-bold text-slate-900 mb-4 flex gap-3"><span className="text-emerald-500 font-black">?</span> {q}</h4>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">{a}</p>
        </div>
    );
}
