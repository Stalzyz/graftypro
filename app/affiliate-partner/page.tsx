
"use client";

import React, { useState } from "react";
import Link from "next/link";
import LandingNavbar from "../../components/landing-new/LandingNavbar";
import LandingFooter from "../../components/landing-new/LandingFooter";

import {
    ArrowRight, Check, Coins, Users, BarChart3, Wallet, Zap,
    ChevronRight, Plus, Minus, Briefcase, Shield, Target, Star
} from "lucide-react";
import "../landing/new-grafty.css";

const whoCanJoin = [
    "Digital marketers", "Agencies", "Freelancers",
    "Consultants", "Trainers", "Influencers", "IT companies"
];

const steps = [
    { num: "01", title: "Register as Affiliate Partner", desc: "Submit your application. Our team reviews and approves most partners within 24 hours." },
    { num: "02", title: "Get Your Referral Link", desc: "Access your unique referral link and marketing toolkit from your partner dashboard." },
    { num: "03", title: "Invite Businesses", desc: "Share your link via your audience, social media, email, or content marketing." },
    { num: "04", title: "Earn Commission Automatically", desc: "Commission credited to your wallet automatically whenever a referred customer pays." }
];

const earnings = [
    { label: "Subscription Purchases", desc: "Earn every time your referred customer pays a monthly or annual subscription." },
    { label: "Credit Purchases", desc: "Earn every time your referred customer tops up WhatsApp message credits." }
];

const faqs = [
    { q: "How much commission can I earn?", a: "Commissions are paid on subscription purchases and credit top-ups. Rates scale with your performance. The more customers you bring, the higher your tier and commission percentage." },
    { q: "When do I get paid?", a: "Commission is credited to your wallet automatically when a customer pays. You can request a bank transfer any time." },
    { q: "Is there a minimum payout threshold?", a: "Yes. Minimum payout is ₹500 (or equivalent). Most affiliates clear this within their first referral." },
    { q: "Do I need technical skills?", a: "No technical knowledge required. If you can share a link, you can be an affiliate." },
    { q: "Can I use paid ads to promote?", a: "Yes, as long as you don't bid on Grafty branded keywords. We recommend content marketing, social, and email." },
    { q: "How long does approval take?", a: "Most applications are reviewed and approved within 24 hours. You'll receive an email confirmation." }
];

export default function AffiliatePartnerPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <main className="g-body min-h-screen bg-white">
            <LandingNavbar />

            {/* ─── HERO ─── */}
            <section className="pt-40 pb-24 px-6 max-w-7xl mx-auto text-center relative overflow-hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-br from-green-50 via-emerald-50 to-transparent rounded-full blur-[120px] opacity-70 pointer-events-none" />

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-black uppercase tracking-[0.15em] px-5 py-2.5 rounded-full mb-8">
                        <Coins size={13} />
                        Affiliate Partner Program
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight mb-8 max-w-4xl mx-auto">
                        Earn Recurring Income by Recommending{" "}
                        <span className="bg-gradient-to-r from-[#27954D] to-[#042F94] bg-clip-text text-transparent">Grafty</span>
                    </h1>
                    <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-12">
                        Help businesses grow on WhatsApp. Earn commission automatically. Withdraw to your bank account. No technical knowledge required.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/reseller-register"
                            className="flex items-center gap-2 bg-[#27954D] hover:bg-[#1f7a3f] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-green-100 text-base"
                        >
                            Become an Affiliate <ArrowRight size={18} />
                        </Link>
                        <Link
                            href="/partner/login"
                            className="flex items-center gap-2 border border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all text-base"
                        >
                            Partner Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── TRUST STRIP ─── */}
            <section className="border-y border-slate-100 bg-slate-50 py-8 px-6">
                <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
                    {["Recurring Commission", "Auto Wallet Credit", "Bank Transfer Withdrawal", "No Technical Skills Needed", "Transparent Tracking"].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                            <Check size={14} className="text-green-500" />
                            {item}
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── WHO CAN JOIN ─── */}
            <section className="py-28 px-6 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-4">Made For</span>
                        <h2 className="text-4xl font-black text-slate-900 leading-tight mb-6">Who Can Become an Affiliate Partner</h2>
                        <p className="text-slate-500 text-lg mb-10 leading-relaxed">
                            Anyone who understands business and can connect people with solutions. If you have an audience or a network, you can earn with Grafty.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {whoCanJoin.map((who, i) => (
                                <div key={i} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-5 py-3">
                                    <Check size={15} className="text-green-500 flex-shrink-0" />
                                    <span className="text-slate-700 font-semibold text-sm">{who}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-100 rounded-3xl p-10">
                        <div className="text-center mb-8">
                            <div className="text-5xl font-black text-slate-900 mb-2">₹0</div>
                            <div className="text-slate-500 font-semibold">Cost to join</div>
                        </div>
                        <div className="space-y-4">
                            {[
                                "Free to register and participate",
                                "No monthly fees or subscription required",
                                "Earn from day one of referral",
                                "Withdraw any time, no lock-in",
                                "Commission paid automatically"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-white rounded-full border border-green-200 flex items-center justify-center flex-shrink-0">
                                        <Check size={13} className="text-green-500" />
                                    </div>
                                    <span className="text-slate-700 font-medium text-sm">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <section className="py-28 px-6 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-4">Simple Process</span>
                        <h2 className="text-4xl font-black text-slate-900 leading-tight">How It Works</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((step, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-md hover:border-green-100 transition-all">
                                <div className="text-5xl font-black text-slate-100 mb-6">{step.num}</div>
                                <h3 className="text-base font-black text-slate-900 mb-3">{step.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── COMMISSION STRUCTURE ─── */}
            <section className="py-28 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-4">Earnings</span>
                    <h2 className="text-4xl font-black text-slate-900 leading-tight">Commission Structure</h2>
                    <p className="text-slate-500 mt-4 text-lg max-w-xl mx-auto">You earn commission on every payment your referred customers make.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
                    {earnings.map((item, i) => (
                        <div key={i} className="bg-slate-50 rounded-2xl border border-slate-100 p-10 text-center">
                            {i === 0 ? <Coins size={36} className="text-green-500 mx-auto mb-5" /> : <Wallet size={36} className="text-blue-500 mx-auto mb-5" />}
                            <h3 className="text-xl font-black text-slate-900 mb-3">{item.label}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Example */}
                <div className="max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-3xl p-10 text-center">
                    <span className="text-xs font-black uppercase tracking-[0.15em] text-green-600 block mb-4">Example</span>
                    <div className="text-4xl font-black text-slate-900 mb-2">Customer pays ₹10,000</div>
                    <div className="text-slate-500 text-lg mb-6">→ You earn commission automatically</div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {["Commission credited to wallet", "No manual tracking needed", "Withdraw to bank anytime"].map((t, i) => (
                            <div key={i} className="bg-white rounded-xl border border-green-100 p-4">
                                <Check size={20} className="text-green-500 mx-auto mb-2" />
                                <p className="text-slate-700 text-xs font-bold leading-tight">{t}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── WITHDRAWAL PROCESS ─── */}
            <section className="py-28 px-6 bg-[#0F172A]">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-xs font-black uppercase tracking-[0.15em] text-green-400 block mb-4">Payouts</span>
                        <h2 className="text-4xl font-black text-white leading-tight">Withdraw Your Earnings</h2>
                        <p className="text-slate-400 mt-4 text-lg max-w-xl mx-auto">Simple. Transparent. Fully automated.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { num: "1", title: "Request Payout", desc: "Go to your partner dashboard and request a withdrawal of your earned balance." },
                            { num: "2", title: "Approval", desc: "Payouts are reviewed and approved quickly. You'll receive a confirmation notification." },
                            { num: "3", title: "Bank Transfer", desc: "Amount transferred directly to your bank account. Track it in your wallet history." }
                        ].map((step, i) => (
                            <div key={i} className="text-center">
                                <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-black text-xl flex items-center justify-center mx-auto mb-6">
                                    {step.num}
                                </div>
                                <h3 className="text-white font-black text-xl mb-3">{step.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FAQ ─── */}
            <section className="py-28 px-6 bg-slate-50">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-4">Common Questions</span>
                        <h2 className="text-4xl font-black text-slate-900 leading-tight">Partner FAQs</h2>
                    </div>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
                                >
                                    <span className="font-bold text-slate-900 pr-8 text-base">{faq.q}</span>
                                    {openFaq === i ? <Minus size={18} className="text-green-500 flex-shrink-0" /> : <Plus size={18} className="text-slate-400 flex-shrink-0" />}
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

            {/* ─── FINAL CTA ─── */}
            <section className="py-28 px-6 max-w-5xl mx-auto text-center">
                <div className="bg-gradient-to-br from-green-50 via-white to-blue-50 border border-green-100 rounded-3xl p-16 shadow-lg">
                    <span className="text-xs font-black uppercase tracking-[0.15em] text-green-600 block mb-6">Start Earning Today</span>
                    <h2 className="text-5xl font-black text-slate-900 leading-tight mb-6">Ready to Become a Partner?</h2>
                    <p className="text-slate-500 text-xl leading-relaxed mb-12 max-w-xl mx-auto">
                        Join a growing network of affiliates earning recurring income from Grafty referrals.
                    </p>
                    <Link
                        href="/reseller-register"
                        className="inline-flex items-center gap-2 bg-[#27954D] hover:bg-[#1f7a3f] text-white font-bold px-12 py-5 rounded-xl transition-all shadow-lg text-lg"
                    >
                        Become an Affiliate Partner <ArrowRight size={20} />
                    </Link>
                    <p className="mt-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Free to join. No hidden fees. Fully transparent.</p>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
