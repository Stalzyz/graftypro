"use client";
import React from "react";
import "../landing/new-grafty.css";
import LandingNavbar from "../../components/landing-new/LandingNavbar";
import LandingFooter from "../../components/landing-new/LandingFooter";
import { ChevronRight, ArrowRight, GraduationCap, ShoppingBag, HeartPulse, Landmark, Plane, UserCheck, Zap, BarChart4 } from "lucide-react";
import Link from "next/link";

export default function SolutionsPage() {
    return (
        <main className="g-body">
            <LandingNavbar />

            {/* Hero */}
            <section className="pt-40 pb-20 lg:pt-56 lg:pb-32 section-white overflow-hidden relative">
                <div className="hero-gradient" />
                <div className="max-w-7xl mx-auto px-6 relative z-10 animate-up">
                    <div className="flex items-center gap-3 text-brand-light font-black uppercase tracking-[4px] text-xs mb-8" style={{ color: 'var(--brand-light)' }}>
                        <Zap size={16} /> Vertical Orchestration v3.0
                    </div>
                    <h1 className="g-h1 mb-8 max-w-5xl">
                        Industry-Specific <br />
                        <span className="text-gradient">Automation Blueprints.</span>
                    </h1>
                    <p className="g-p text-xl mb-12 max-w-3xl">
                        Generic automation is fragile. Industry-standard infrastructure is resilient. We’ve mapped precise logic trees for every major vertical to ensure outcome-driven results.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a href="#education" className="g-btn-primary px-8 py-4">Education</a>
                        <a href="#ecommerce" className="g-btn-outline px-8 py-4">Ecommerce</a>
                        <a href="#healthcare" className="g-btn-outline px-8 py-4">Healthcare</a>
                        <a href="#finance" className="g-btn-outline px-8 py-4">Finance</a>
                    </div>
                </div>
            </section>

            {/* Section: Why Vertical Logic? */}
            <section className="section-gray">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <ValueItem title="Outcome-First" desc="We don't just send messages; we map journeys to specific conversion events like 'Class Booked' or 'Invoice Paid'." />
                        <ValueItem title="Compliance Heavy" desc="Every flow is built with Meta Business policies in mind to prevent number blocking." />
                        <ValueItem title="Data Driven" desc="Integrated analytics show you exactly where leads drop off in the automation funnel." />
                    </div>
                </div>
            </section>

            {/* 1. Education */}
            <IndustryNuclear
                id="education"
                icon={<GraduationCap />}
                title="Education & EdTech"
                intro="A lead that isn't contacted in the first 5 minutes is 90% less likely to convert."
                problem="Manual call attempts have a low pickup rate. Cold calling is inefficient. Fee collection follow-ups are time-consuming and prone to human error."
                logicTree={[
                    { step: "Lead Capture", details: "Lead enters from Meta Ads / Website / Landing Page." },
                    { step: "Instant Handshake", details: "Within 0.5 seconds, Grafty sends a Greeting + Qualification Question." },
                    { step: "Automated Qualification", details: "Based on the answer, the lead is assigned a quality score." },
                    { step: "Conversion Hook", details: "Lead is prompted to schedule a Demo Class inside WhatsApp." }
                ]}
                kpi="+35% Enrollment Potential"
                img="/screens/edutech.jpg"
            />

            {/* 2. Ecommerce */}
            <IndustryNuclear
                id="ecommerce"
                icon={<ShoppingBag />}
                title="Ecommerce & D2C"
                intro="High bounce rates and abandoned carts kill margins. WhatsApp open rates are >95%."
                problem="Carts abandoned on checkout require urgent visibility. Customers demand real-time delivery tracking across their lifecycle."
                logicTree={[
                    { step: "Cart Abandonment Trigger", details: "Integration with Shopify triggers a message 30 mins after abandonment." },
                    { step: "Dynamic Discounting", details: "Send a personalized coupon with a 'Complete Order' button." },
                    { step: "Transactional Updates", details: "Automated Order Confirmation, Shipment Tracker, and Delivery alerts." }
                ]}
                kpi="18% Avg Recovery Rate"
                img="https://cdn.botpenguin.com/assets/website/images/whatsapp-automation/converse-one.png"
                reverse
            />

            {/* Detailed Integration Section */}
            <section className="section-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="bg-slate-900 rounded-[48px] p-16 text-white animate-up relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-white/5 font-black text-6xl italic transform translate-x-1/2 -translate-y-1/2 uppercase tracking-tighter">API V3.0</div>
                        <div className="mb-20 text-center relative z-10">
                            <h2 className="text-4xl lg:text-5xl font-black mb-8 italic">Universal Integration <br /> Standards.</h2>
                            <p className="text-slate-400 max-w-2xl mx-auto italic font-medium">Grafty connects to your existing software stack using these high-authority protocols.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                            <IntegrationBlock title="Webhooks" desc="Listen to external events and trigger flows instantly." />
                            <IntegrationBlock title="REST API" desc="Push data from Grafty to your custom ERP or CRM system." />
                            <IntegrationBlock title="Zapier" desc="Connect to 5000+ apps without writing a single line of code." />
                            <IntegrationBlock title="SDK" desc="Embed Grafty logic directly into your native mobile apps." />
                        </div>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}

function ValueItem({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="text-center p-8 g-card bg-white border-slate-100 hover:shadow-2xl transition-all">
            <h3 className="text-xl font-black mb-4 italic uppercase tracking-tighter">{title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed italic">{desc}</p>
        </div>
    );
}

function IndustryNuclear({ id, icon, title, intro, problem, logicTree, kpi, img, reverse }: { id: string; icon: React.ReactNode; title: string; intro: string; problem: string; logicTree: { step: string, details: string }[], kpi: string, img: string, reverse?: boolean }) {
    return (
        <section id={id} className={`py-40 ${reverse ? 'bg-slate-50' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto px-6">
                <div className={`flex flex-col lg:flex-row gap-24 items-start ${reverse ? 'lg:flex-row-reverse' : ''}`}>
                    <div className="lg:w-1/2 animate-up">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm" style={{ color: 'var(--brand-light)' }}>{icon}</div>
                            <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic">{title}</h2>
                        </div>

                        <div className="space-y-12">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[4px] mb-4" style={{ color: 'var(--brand-light)' }}>The Context</p>
                                <p className="text-xl font-black text-slate-800 leading-tight italic">{intro}</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 mb-4 italic">Operational Friction</p>
                                <p className="g-p font-medium text-slate-500 italic">{problem}</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 mb-6 italic">Execution Logic</p>
                                <div className="space-y-4">
                                    {logicTree.map((item, i) => (
                                        <div key={i} className="flex gap-6 group">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all" style={{ borderColor: 'var(--brand-light)', color: 'var(--brand-light)' }}>
                                                    {i + 1}
                                                </div>
                                                {i < logicTree.length - 1 && <div className="w-px h-full bg-slate-200 mt-2" />}
                                            </div>
                                            <div className="pb-8">
                                                <h4 className="font-black text-slate-900 transition-colors uppercase tracking-tight italic">{item.step}</h4>
                                                <p className="text-sm text-slate-500 font-medium italic">{item.details}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-10 rounded-[32px] shadow-2xl relative overflow-hidden group" style={{ background: 'var(--brand-gradient)', color: 'white' }}>
                                <div className="absolute top-0 right-0 p-8 text-white/10 font-black text-6xl italic transform translate-x-1/2 -translate-y-1/2 uppercase tracking-tighter">SUCCESS</div>
                                <p className="text-[10px] font-black uppercase tracking-[4px] opacity-60 mb-4">Projected Efficiency</p>
                                <h4 className="text-3xl lg:text-4xl font-black tracking-tighter italic">{kpi}</h4>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/2 sticky top-32 animate-up">
                        <div className="p-4 bg-white rounded-[48px] shadow-2xl border border-slate-100 overflow-hidden relative group">
                            <img src={img} alt={title} className="rounded-[40px] w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function IntegrationBlock({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-all">
            <h4 className="font-black uppercase tracking-[3px] text-xs mb-4" style={{ color: 'var(--brand-light)' }}>{title}</h4>
            <p className="text-white/60 font-medium text-sm leading-relaxed italic">{desc}</p>
        </div>
    );
}
