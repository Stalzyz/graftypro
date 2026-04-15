"use client";
import React from "react";
import "../landing/new-grafty.css";
import LandingNavbar from "../../components/landing-new/LandingNavbar";
import LandingFooter from "../../components/landing-new/LandingFooter";
import { 
    ChevronRight, 
    ArrowRight, 
    GraduationCap, 
    ShoppingBag, 
    HeartPulse, 
    Landmark, 
    Plane, 
    UserCheck, 
    Zap, 
    BarChart4, 
    Dumbbell, 
    Scissors, 
    Utensils, 
    Home 
} from "lucide-react";
import Link from "next/link";

import { SOLUTIONS_DATA } from "./solutions-data";

import { WhatsAppSimulator } from "./WhatsAppSimulator";

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
                    
                    {/* Industry Matrix / Selection Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 pb-12">
                        {Object.values(SOLUTIONS_DATA).map((sol) => {
                            const Icon = sol.icon;
                            return (
                                <Link 
                                    key={sol.slug}
                                    href={`/solutions/${sol.slug}`}
                                    className="g-card !p-8 border-none group hover:scale-[1.02] transition-all bg-white relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 text-slate-50 font-black text-4xl italic transform translate-x-1/2 -translate-y-1/2 uppercase tracking-tighter opacity-10 group-hover:opacity-20 transition-opacity uppercase">{sol.slug}</div>
                                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
                                        <Icon size={20} />
                                    </div>
                                    <h4 className="font-black text-lg uppercase tracking-tight mb-3 flex items-center gap-3">
                                        {sol.title.split('for ')[1] || sol.title} <ArrowRight size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </h4>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{sol.description}</p>
                                </Link>
                            );
                        })}
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
                intro="An admission lead that isn't contacted in the first 5 minutes is 90% less likely to convert."
                problem="High-intent leads cold down rapidly. Manual counseling follow-ups are inconsistent. Students miss critical course updates buried in email inboxes."
                logicTree={[
                    { step: "Lead Capture", details: "Lead entry from Meta Ads / Landing Pages into Grafty CRM." },
                    { step: "Instant Handshake", details: "Grafty sends a Welcome Kit + Qualification Question in <0.5s." },
                    { step: "Course Delivery", details: "Automated lesson drips and study materials via Academy Engine." },
                    { step: "Fee Automation", details: "Scheduled reminders with integrated 1-click payment links." }
                ]}
                kpi="+40% Admission Velocity"
                industry="education"
            />

            {/* 2. Ecommerce */}
            <IndustryNuclear
                id="ecommerce"
                icon={<ShoppingBag />}
                title="Ecommerce & D2C"
                intro="98% of mobile shoppers prefer chatting over browsing complex web menus."
                problem="Cart abandonment kills margins. Customers demand real-time order tracking and conversational support across their entire lifestyle."
                logicTree={[
                    { step: "Cart Recovery", details: "Trigger personalized recovery flows 15 mins after abandonment." },
                    { step: "Order Tracking", details: "Automated status updates from 'Packed' to 'Out for Delivery'." },
                    { step: "Loyalty Drips", details: "Post-purchase sequences for reviews and repeat order coupons." }
                ]}
                kpi="18% Avg Recovery Rate"
                industry="ecommerce"
                reverse
            />

            {/* 3. Real Estate */}
            <IndustryNuclear
                id="real-estate"
                icon={<Home />}
                title="Real Estate & Prop-Tech"
                intro="High-ticket deals require zero latency between interest and information delivery."
                problem="Prospective buyers wait days for brochures. Site visits are lost due to manual scheduling friction and poor lead nurturing."
                logicTree={[
                    { step: "Virtual Tour", details: "Deliver floorplans and HD property videos directly in WhatsApp." },
                    { step: "Qualification", details: "Bot collects Budget, BHK, and Location preferences instantly." },
                    { step: "Visit Scheduler", details: "Integrated booking for site visits synced with agent calendars." },
                    { step: "CRM Bridge", details: "Real-time sync to HubSpot/Salesforce for immediate broker follow-up." }
                ]}
                kpi="4x Site Visit Volume"
                industry="real-estate"
            />

            {/* 4. Gym & Fitness */}
            <IndustryNuclear
                id="gym-fitness"
                icon={<Dumbbell />}
                title="Gyms & Fitness"
                intro="Retention is the only metric that matters in the fitness industry."
                problem="Members stop visiting and subscriptions expire without notice. Manual follow-ups for renewals are time-expensive and inefficient."
                logicTree={[
                    { step: "Lead Magnet", details: "Instant 3-day trial pass delivery via QR scan at marketing touchpoints." },
                    { step: "Renewal Bot", details: "Auto-reminders 7 days before expiry with renewal payment link." },
                    { step: "Retention Drip", details: "Automated 'Miss You' messages if a member doesn't swipe in for 5 days." },
                    { step: "Nutrition Upsell", details: "Supplement store catalog available inside the WhatsApp chat." }
                ]}
                kpi="65% Member Retention"
                industry="gym-fitness"
                reverse
            />

            {/* 5. Saloon & Wellness */}
            <IndustryNuclear
                id="saloon-spa"
                icon={<Scissors />}
                title="Saloons & Spas"
                intro="Convert midnight scrolling into morning appointments without a receptionist."
                problem="Missed peak-hour calls and high no-show rates. Stylists are underutilized while the phone continues to ring at the front desk."
                logicTree={[
                    { step: "Self-Service Booking", details: "Customers select services and favorite stylists in-chat 24/7." },
                    { step: "Advance Payments", details: "Collect slot-booking fees to eliminate no-show revenue loss." },
                    { step: "Loyalty Wallet", details: "Track visit history and reward returning clients automatically." }
                ]}
                kpi="95% No-Show Reduction"
                industry="saloon-spa"
            />

            {/* 6. Restaurants */}
            <IndustryNuclear
                id="restaurants"
                icon={<Utensils />}
                title="Restaurants & QSRs"
                intro="Stop paying 30% commission to delivery platforms. Own your customer data."
                problem="Reliance on third-party aggregators destroys margins. Staffing shortages lead to slow table service and customer frustration."
                logicTree={[
                    { step: "QR-to-Kitchen", details: "Scan table QR to browse the menu, order, and pay in WhatsApp." },
                    { step: "Direct Ordering", details: "Bypass Swiggy/Zomato. Keep 100% of revenue and customer data." },
                    { step: "Loyalty Broadcasts", details: "Send personalized Happy Hour offers based on order history." }
                ]}
                kpi="+22% Net Profit Margin"
                industry="restaurants"
                reverse
            />

            {/* 7. Marketing Agencies */}
            <IndustryNuclear
                id="agencies"
                icon={<BarChart4 />}
                title="Digital Marketing Agencies"
                intro="The missing link between ad-spend and client-revenue."
                problem="Agencies generate leads, but clients fail to convert them. Proving value is difficult without a unified lead nurturing system."
                logicTree={[
                    { step: "White-Label ROI", details: "Provide Grafty as your own proprietary tech stack to clients." },
                    { step: "CTWA Mastery", details: "Deploy Click-to-WhatsApp ads with 100% automated nurturing." },
                    { step: "Lead Attribution", details: "Track exactly which ad creative converted into a closed deal." }
                ]}
                kpi="3x Client LTV"
                industry="agencies"
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

            {/* JSON-LD Schema for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "Grafty WhatsApp Automation",
                        "operatingSystem": "Web-based",
                        "applicationCategory": "BusinessApplication",
                        "description": "Unified WhatsApp automation platform for industry-specific scaling in Gyms, Saloons, Real Estate, and Education.",
                        "offers": {
                            "@type": "Offer",
                            "price": "2999",
                            "priceCurrency": "INR"
                        },
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.9",
                            "reviewCount": "120"
                        }
                    })
                }}
            />
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

function IndustryNuclear({ id, icon, title, intro, problem, logicTree, kpi, industry, reverse }: { id: string; icon: React.ReactNode; title: string; intro: string; problem: string; logicTree: { step: string, details: string }[], kpi: string, industry: string, reverse?: boolean }) {
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

                    <div className="lg:w-1/2 sticky top-32 animate-up flex items-center justify-center">
                        <WhatsAppSimulator industry={industry} />
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
