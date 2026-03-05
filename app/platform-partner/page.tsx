
"use client";

import React, { useState } from "react";
import Link from "next/link";
import LandingNavbar from "../../components/landing-new/LandingNavbar";
import LandingFooter from "../../components/landing-new/LandingFooter";
import {
    ArrowRight, Check, Globe, Palette, Server, Layers, Cpu,
    BarChart3, Wallet, Receipt, Shield, Zap, Plus, Minus, ChevronRight
} from "lucide-react";
import "../landing/new-grafty.css";

const features = [
    { title: "Custom Branding", desc: "Your logo, brand colors, and domain. The platform is entirely yours. Customers never see Grafty.", icon: <Palette size={28} className="text-amber-500" /> },
    { title: "Custom Domain", desc: "Point your domain or subdomain (portal.yourbrand.com) to Grafty infrastructure. Full SSL included.", icon: <Globe size={28} className="text-blue-500" /> },
    { title: "Custom Pricing", desc: "Set your own subscription rates and credit pricing. Keep the margin. No royalties to Grafty.", icon: <Wallet size={28} className="text-green-500" /> },
    { title: "Vendor Management", desc: "Onboard, manage, and deactivate vendors from your Super-Admin panel. Full lifecycle control.", icon: <Layers size={28} className="text-violet-500" /> },
    { title: "Subscription Control", desc: "Create and manage subscription plans. Set feature access levels per plan. Full flexibility.", icon: <Server size={28} className="text-rose-500" /> },
    { title: "Revenue Dashboard", desc: "Real-time revenue tracking. Monitor vendor activity, billing, and platform growth all in one place.", icon: <BarChart3 size={28} className="text-cyan-500" /> },
    { title: "Automated Billing", desc: "Revenue automatically splits on every customer payment. No manual reconciliation needed.", icon: <Receipt size={28} className="text-orange-500" /> },
    { title: "White-Label Infrastructure", desc: "Enterprise-grade infrastructure managed by Grafty. You focus on sales and network growth.", icon: <Cpu size={28} className="text-slate-500" /> }
];

const steps = [
    { num: "01", title: "Submit Application", desc: "Fill out the Platform Partner application. Our team reviews and contacts you within 48 hours." },
    { num: "02", title: "Get Approval", desc: "Application is reviewed, background checked, and approved. You receive your partner agreement." },
    { num: "03", title: "Setup Branding", desc: "Configure your brand, domain, colors, SMTP, and pricing through the Super-Admin panel." },
    { num: "04", title: "Launch Platform", desc: "Start onboarding your customers. Your platform operates independently under your brand." }
];

const howRevenueWorks = [
    "Customer buys a subscription on your branded platform",
    "System automatically processes payment",
    "Revenue split is calculated instantly",
    "Platform partner receives their margin automatically",
    "Full transaction history in your revenue dashboard"
];

const faqs = [
    { q: "Do I need technical skills to manage the platform?", a: "No. Grafty handles all DevOps, server maintenance, and core code updates. You manage vendors and settings through an intuitive Super-Admin dashboard. No technical background required." },
    { q: "Can I use my own domain?", a: "Yes. You can point your root domain or any subdomain (e.g., portal.yourbrand.com) to Grafty infrastructure. We provide DNS configuration guidance and full SSL." },
    { q: "How many vendors can I onboard?", a: "There is no limit on the number of vendors or customers you can onboard. Platform Partners have unlimited capacity." },
    { q: "What support do I receive?", a: "Platform Partners receive dedicated onboarding support, documentation access, and direct contact with the Grafty partner team for technical queries." },
    { q: "How does revenue splitting work?", a: "Revenue is split automatically on every payment. You set your pricing, and the difference between your rate and platform cost is your margin. Fully automated." },
    { q: "Can I create my own affiliate network under my platform?", a: "Yes. As a Platform Partner, you can create and manage your own affiliate partners, set their commission rates, and track their referrals from your Super-Admin panel." }
];

export default function PlatformPartnerPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <main className="g-body min-h-screen bg-white">
            <LandingNavbar />

            {/* ─── HERO ─── */}
            <section className="pt-40 pb-24 px-6 max-w-7xl mx-auto text-center relative overflow-hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-br from-blue-50 via-indigo-50 to-transparent rounded-full blur-[120px] opacity-70 pointer-events-none" />

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-[0.15em] px-5 py-2.5 rounded-full mb-8">
                        <Globe size={13} />
                        Platform Partner Program
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight mb-8 max-w-4xl mx-auto">
                        Launch Your Own{" "}
                        <span className="bg-gradient-to-r from-[#042F94] to-[#27954D] bg-clip-text text-transparent">WhatsApp Platform</span>
                    </h1>
                    <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-4">
                        Platform Partners operate their own branded WhatsApp BSP platform using Grafty infrastructure. Custom domain. Custom pricing. Automated revenue. Full white-label control.
                    </p>
                    <p className="text-sm text-slate-400 font-medium mb-12">
                        Stop selling other people's technology.&nbsp;&nbsp;Own the entire stack.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/reseller-register" className="flex items-center gap-2 bg-[#042F94] hover:bg-[#031d6e] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-100 text-base">
                            Apply for Platform Partner <ArrowRight size={18} />
                        </Link>
                        <Link href="/partner/login" className="flex items-center gap-2 border border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all text-base">
                            Partner Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── TRUST STRIP ─── */}
            <section className="border-y border-slate-100 bg-slate-50 py-8 px-6">
                <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
                    {["Full White-Label", "Custom Domain & SSL", "Unlimited Vendors", "Automated Revenue", "Enterprise Infrastructure"].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                            <Check size={14} className="text-blue-500" />
                            {item}
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── WHAT YOU GET ─── */}
            <section className="py-28 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-4">Your Platform</span>
                    <h2 className="text-4xl font-black text-slate-900 leading-tight">What Platform Partners Get</h2>
                    <p className="text-slate-500 mt-4 text-lg max-w-2xl mx-auto">Everything you need to run an independent, fully branded WhatsApp SaaS business.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feat, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group">
                            <div className="p-3 bg-slate-50 rounded-xl inline-flex mb-5 group-hover:scale-110 transition-transform">
                                {feat.icon}
                            </div>
                            <h3 className="font-black text-slate-900 text-base mb-2">{feat.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── HOW REVENUE WORKS ─── */}
            <section className="py-28 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-4">Revenue Model</span>
                            <h2 className="text-4xl font-black text-slate-900 leading-tight mb-6">Automated Revenue Splitting</h2>
                            <p className="text-slate-500 text-lg mb-10 leading-relaxed">
                                When a customer purchases on your platform, the system automatically calculates and credits your margin. No manual work. No reconciliation. Fully automated.
                            </p>
                            <div className="space-y-4">
                                {howRevenueWorks.map((step, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 text-blue-600 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                            {i + 1}
                                        </div>
                                        <span className="text-slate-700 font-medium text-sm leading-relaxed pt-1">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-900 to-[#042F94] rounded-3xl p-10 text-white">
                            <span className="text-xs font-black uppercase tracking-[0.15em] text-blue-300 block mb-6">Revenue Example</span>
                            <div className="space-y-5 mb-8">
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <span className="text-slate-300 font-medium text-sm">Customer Pays</span>
                                    <span className="text-white font-black text-xl">₹5,000</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <span className="text-slate-300 font-medium text-sm">Platform Cost</span>
                                    <span className="text-red-400 font-black text-xl">₹3,000</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-slate-300 font-bold">Your Margin</span>
                                    <span className="text-green-400 font-black text-3xl">₹2,000</span>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-2">Auto-credited to your wallet</p>
                                <p className="text-slate-400 text-sm">For every customer payment. Every subscription renewal. Every credit purchase. Fully automated.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── HOW TO BECOME ─── */}
            <section className="py-28 px-6 max-w-6xl mx-auto">
                <div className="text-center mb-20">
                    <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-4">Getting Started</span>
                    <h2 className="text-4xl font-black text-slate-900 leading-tight">How to Become a Platform Partner</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step, i) => (
                        <div key={i} className="bg-slate-50 rounded-2xl border border-slate-100 p-8 relative group hover:border-blue-100 hover:bg-white hover:shadow-md transition-all">
                            <div className="text-5xl font-black text-slate-100 group-hover:text-blue-50 transition-colors mb-6">{step.num}</div>
                            <h3 className="text-base font-black text-slate-900 mb-3">{step.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── FAQ ─── */}
            <section className="py-28 px-6 bg-slate-50">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-4">Common Questions</span>
                        <h2 className="text-4xl font-black text-slate-900 leading-tight">Platform Partner FAQs</h2>
                    </div>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
                                >
                                    <span className="font-bold text-slate-900 pr-8 text-base">{faq.q}</span>
                                    {openFaq === i ? <Minus size={18} className="text-blue-500 flex-shrink-0" /> : <Plus size={18} className="text-slate-400 flex-shrink-0" />}
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── GLOBAL POSITIONING / FINAL CTA ─── */}
            <section className="py-28 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-gradient-to-br from-[#0F172A] to-[#042F94] rounded-3xl p-16 text-center text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 text-white/3 text-[200px] font-black uppercase leading-none select-none pointer-events-none -translate-y-1/4 translate-x-1/4">BSP</div>
                        <div className="relative z-10">
                            <span className="text-xs font-black uppercase tracking-[0.15em] text-blue-300 block mb-6">Global Positioning</span>
                            <h2 className="text-5xl font-black leading-tight mb-6">
                                Grafty is not just a WhatsApp tool.
                            </h2>
                            <p className="text-slate-300 text-xl leading-relaxed mb-4 max-w-2xl mx-auto">
                                It is a scalable business infrastructure. Built for serious growth.
                            </p>
                            <p className="text-slate-500 font-medium mb-12">
                                As a Platform Partner, you inherit this infrastructure and make it your own.
                            </p>
                            <Link href="/reseller-register" className="inline-flex items-center gap-2 bg-white text-slate-900 font-black px-12 py-5 rounded-xl transition-all hover:bg-slate-100 text-lg">
                                Apply for Platform Partnership <ArrowRight size={20} />
                            </Link>
                            <div className="mt-10 flex flex-wrap justify-center gap-8 opacity-40">
                                {["Meta-Compliant", "GST-Ready", "Enterprise Infrastructure", "Unlimited Scale"].map((t, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                                        <Check size={14} />
                                        {t}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
