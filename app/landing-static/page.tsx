"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import LandingNavbar from "../../components/landing-new/LandingNavbar";
import LandingFooter from "../../components/landing-new/LandingFooter";
import DynamicPricingSection from "../../components/landing-new/DynamicPricingSection";
import { SmartPartnerLink } from "../../components/landing-new/SmartPartnerLink";
import {
    ArrowRight, Check, Star, GitBranch, Send,
    ShoppingBag, MessageSquare, ChevronRight, Plus, Minus,
    Shield, Globe, Zap, BarChart3, Users,
    PlayCircle, TrendingUp, CheckCircle2, Sparkles,
    Mail, Video, Bot
} from "lucide-react";
import "../landing/new-grafty.css";
import {
    NeuralKnowledgeShowcase, 
    OmniHubSynergy, 
    AutopilotDrive 
} from "../../components/landing-new/cms-blocks/CMSBlocks_V3";
import BSP_Animation from "../../components/landing-new/BSP_Animation";

// ─── DATA ────────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
    "🚀 Flow Builder — Build no-code WhatsApp bots",
    "📢 Bulk WhatsApp Messages — Send to 10K+ contacts",
    "💬 Live Chat Inbox — Multi-agent team support",
    "🛒 E-commerce — Sell directly on WhatsApp",
    "⚙️ Smart Automation — Powerful drip sequences",
    "📊 CRM Engine — Kanban lead management",
    "💳 Credit Wallet — Pay-as-you-go billing",
    "📋 GST Invoicing — Auto-generated invoices",
    "🔗 Shopify Connect — Sync your store",
    "📈 Delivery Intelligence — Real-time analytics",
];

const PRODUCT_TABS = [
    {
        id: "dashboard",
        label: "Dashboard",
        icon: <BarChart3 size={16} />,
        image: "/screens/dashboard.jpg",
        title: "Everything at a glance",
        desc: "Real-time stats, message funnels, revenue potential, and onboarding checklist — all on one screen.",
        tags: ["Live Stats", "Revenue Potential", "Message Funnel", "Onboarding Guide"],
    },
    {
        id: "flow",
        label: "Flow Builder",
        icon: <GitBranch size={16} />,
        image: "/screens/flow.jpg",
        title: "Build powerful WhatsApp bots visually",
        desc: "Drag-and-drop flow builder with 20+ node types — text, buttons, products, payments, conditions, and more.",
        tags: ["No Code", "20+ Node Types", "E-commerce Flows", "Payment Collection"],
    },
    {
        id: "ai",
        label: "AI Autopilot",
        icon: <Zap size={16} />,
        image: "/screens/ai.jpg",
        title: "Train your AI salesperson in seconds",
        desc: "Upload PDFs, Docs, or URLs to create a domain-expert AI. Automate lead qualification and FAQ handling with 100% accuracy.",
        tags: ["Knowledge Engine", "PDF Training", "Auto-Qualify", "24/7 Autopilot"],
    },
    {
        id: "email",
        label: "Email Hub",
        icon: <Mail size={16} />,
        image: "/screens/email.jpg",
        title: "Omni-channel Flow Orchestration",
        desc: "Don't just message on WhatsApp. Build flows that send professional Email proposals as fallbacks or follow-ups automatically.",
        tags: ["WA + Email", "Flow Fallbacks", "SMTP Connect", "Unified Inbox"],
    },
    {
        id: "chat",
        label: "Live Chat",
        icon: <MessageSquare size={16} />,
        image: "/screens/chat.jpg",
        title: "Team inbox with 1-click Video Meet",
        desc: "Multi-agent live chat with a built-in Google Meet generator. Close deals faster with instant video consultations.",
        tags: ["Google Meet", "Multi-Agent", "Internal Notes", "Live Meet"],
    },
    {
        id: "crm",
        label: "CRM Engine",
        icon: <Users size={16} />,
        image: "/screens/crm.jpg",
        title: "Kanban CRM for lead management",
        desc: "Visual pipeline to track leads from first contact to conversion. Chat directly from lead cards.",
        tags: ["Kanban Pipeline", "Lead Tracking", "One-click Chat", "Revenue Tracking"],
    },
    {
        id: "campaign",
        label: "Bulk Messages",
        icon: <TrendingUp size={16} />,
        image: "/screens/campaign.jpg",
        title: "Bulk WhatsApp Message Intelligence",
        desc: "Track template performance for bulk campaigns, monitor delivery rates, and detect failures before they affect your Meta account.",
        tags: ["Bulk Sending", "Delivery Rate", "Failure Detection", "Health Score"],
    },
];

const TESTIMONIALS = [
    {
        name: "Rajan Mehta",
        role: "Founder, EduTech India",
        avatar: "RM",
        color: "from-green-500 to-emerald-600",
        text: "We moved from manual WhatsApp replies to fully automated lead qualification. Our response time dropped from 4 hours to under 2 minutes. {platformName} is the backbone of our admissions process.",
        stars: 5,
    },
    {
        name: "Priya Sharma",
        role: "E-commerce Owner, FashionKart",
        avatar: "PS",
        color: "from-violet-500 to-purple-600",
        text: "The flow builder is insane. We send product carousels, collect Razorpay payments, and confirm orders — all inside WhatsApp. Our conversion rate jumped 34% in the first month.",
        stars: 5,
    },
    {
        name: "Arjun Nair",
        role: "Digital Marketing Agency",
        avatar: "AN",
        color: "from-blue-500 to-indigo-600",
        text: "I white-labeled {platformName} for 12 of my clients. The platform partner program is a goldmine. I'm earning recurring revenue while my clients get enterprise WhatsApp automation.",
        stars: 5,
    },
];

const STATS = [
    { value: "10M+", label: "Messages Delivered" },
    { value: "500+", label: "Active Businesses" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "4 min", label: "Avg Setup Time" },
];

const MODULES = [
    {
        title: "Smart Knowledge Engine", icon: <Zap size={22} className="text-indigo-600" />,
        desc: "Train AI on your business data. Handle complex customer queries automatically using GPT-4 and your own PDFs.",
        bg: "bg-indigo-50", border: "border-indigo-100",
        tags: ["Knowledge Base", "AI Autopilot", "PDF Training", "GPT-4"],
    },
    {
        title: "Email Hub", icon: <Mail size={22} className="text-blue-600" />,
        desc: "Connect your SMTP and send professional emails alongside WhatsApp flows for a true omni-channel experience.",
        bg: "bg-blue-50", border: "border-blue-100",
        tags: ["SMTP Integration", "Email Flows", "WA+Email Sync", "Email Inbox"],
    },
    {
        title: "Google Meet Integration", icon: <Video size={22} className="text-emerald-600" />,
        desc: "Generate 1-click individual meeting links for leads. Close high-ticket deals through instant video consultations.",
        bg: "bg-emerald-50", border: "border-emerald-100",
        tags: ["1-Click Meet", "Auto Links", "Google Calendar", "Video CSR"],
    },
    {
        title: "Flow Builder", icon: <GitBranch size={22} className="text-green-600" />,
        desc: "Build lead qualification, booking, checkout, and payment flows. No coding required.",
        bg: "bg-green-50", border: "border-green-100",
        tags: ["Lead Flows", "No Code", "20+ Nodes", "Payments"],
    },
    {
        title: "Bulk WhatsApp Messages", icon: <Send size={22} className="text-sky-600" />,
        desc: "Send bulk WhatsApp messages to targeted segments with high delivery rates and cost transparency.",
        bg: "bg-sky-50", border: "border-sky-100",
        tags: ["Bulk Sending", "Segments", "Cost Preview", "Analytics"],
    },
    {
        title: "Team Inbox & CRM", icon: <MessageSquare size={22} className="text-amber-600" />,
        desc: "Multi-agent inbox with labels, tags, follow-up reminders, and customer history.",
        bg: "bg-amber-50", border: "border-amber-100",
        tags: ["Multi-Agent", "Labels", "Follow-Up"],
    },
];

const FAQS = [
    { q: "Do I need WhatsApp API to use {platformName}?", a: "Yes. {platformName} works with WhatsApp Business API. Our Academy section explains how to set it up step by step — it takes about 4 minutes." },
    { q: "How much does WhatsApp API cost?", a: "Meta charges per conversation. Costs vary by country and message type. {platformName} shows exact costs before sending so there are zero surprises. Marketing messages in India cost ~₹0.88, utility ₹0.13." },
    { q: "Can I send bulk WhatsApp messages?", a: "Yes. Our platform is built for bulk WhatsApp messages. Send to 10k+ contacts with real-time delivery tracking and performance analytics. You can segment by behavior, tags, or custom filters." },
    { q: "Can I run e-commerce on WhatsApp?", a: "Yes. You can sell products, collect payments via Razorpay, manage orders, send COD confirmations, and generate GST invoices — all inside WhatsApp." },
    { q: "Is there a free trial?", a: "Yes. Sign up and explore all modules before upgrading to a paid plan. You get a perfect 7-day free trial to start." },
    { q: "What prerequisites does WhatsApp API need?", a: "Meta Business Manager account, business verification documents, a dedicated phone number, and a business email. GST registration and a business website are recommended for faster approval." },
];

// ─── TICKER COMPONENT ─────────────────────────────────────────────────────────
function FeatureTicker() {
    const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
    return (
        <div className="overflow-hidden py-3 bg-gradient-to-r from-[#042F94] to-[#27954D] relative">
            <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-[#042F94] to-transparent z-10" />
            <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-[#27954D] to-transparent z-10" />
            <div
                className="flex gap-10 whitespace-nowrap"
                style={{ animation: "ticker 40s linear infinite" }}
            >
                {items.map((item, i) => (
                    <span key={i} className="text-white/90 text-sm font-semibold flex-shrink-0 flex items-center gap-2">
                        {item}
                        <span className="text-white/30 mx-2">·</span>
                    </span>
                ))}
            </div>
            <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </div>
    );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function StaticLandingPage({ branding }: { branding?: any }) {
    const platformName = branding?.brand_name || "Grafty";
    const primaryColor = branding?.primary_color || "#27954D";
    const domain = branding?.domain || "app.grafty.pro";

    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [showStickyBar, setShowStickyBar] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsVisible(true);
        const handleScroll = () => {
            setShowStickyBar(window.scrollY > 600);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Auto-rotate tabs
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % PRODUCT_TABS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <main className="g-body min-h-screen bg-blueprint overflow-x-hidden">
            {branding && (
                <style dangerouslySetInnerHTML={{ __html: `
                    :root {
                        --primary: ${primaryColor};
                        --primary-rgb: ${primaryColor.startsWith('#') ? primaryColor.slice(1) : primaryColor};
                    }
                    .bg-\\[\\#27954D\\] { background-color: ${primaryColor} !important; }
                    .text-\\[\\#27954D\\] { color: ${primaryColor} !important; }
                    .border-\\[\\#27954D\\] { border-color: ${primaryColor} !important; }
                    .hover\\:bg-\\[\\#1f7a3f\\]:hover { filter: brightness(0.9); }
                    .shadow-green-200\\/60 { shadow-color: ${primaryColor}33 !important; }
                    .text-green-600 { color: ${primaryColor} !important; }
                    .text-green-500 { color: ${primaryColor} !important; }
                    .bg-green-500 { background-color: ${primaryColor} !important; }
                    .bg-green-50 { background-color: ${primaryColor}11 !important; }
                    .border-green-100 { border-color: ${primaryColor}22 !important; }
                    .border-green-200 { border-color: ${primaryColor}44 !important; }
                `}} />
            )}
            <LandingNavbar branding={branding} />

            {/* ─── STICKY BOTTOM BAR (mobile) ─── */}
            <div className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-all duration-300 ${showStickyBar ? "translate-y-0" : "translate-y-full"}`}>
                <div className="bg-[#0F172A] border-t border-white/10 p-4 flex gap-3">
                    <Link href="/register" className="flex-1 bg-[#27954D] text-white font-bold py-3 rounded-xl text-center text-sm">
                        Start Free Trial
                    </Link>
                    <Link href="/login" className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl text-center text-sm border border-white/20">
                        Sign In
                    </Link>
                </div>
            </div>

            {/* ─── HERO ─── */}
            <section ref={heroRef} className="pt-36 pb-28 px-6 max-w-7xl mx-auto relative overflow-hidden border-b-2 border-slate-900">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className={`relative z-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-white border-2 border-slate-900 text-slate-900 text-xs font-mono font-bold uppercase px-4 py-2 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <span className="w-2 h-2 bg-slate-900" />
                            Official Platform
                        </div>

                        {/* Headline */}
                        <h1 className="text-5xl md:text-7xl font-serif font-black text-slate-900 leading-[1.05] tracking-tight mb-6">
                            Stop Losing Customers<br />
                            to <span className="bg-slate-900 text-white px-2">Slow Replies.</span>
                        </h1>

                        <p className="text-xl text-slate-700 leading-relaxed mb-4 border-l-4 border-slate-900 pl-4 bg-white/50 py-2">
                            {platformName} automates your communication — so every lead is captured, every customer is followed up, and every sale closes faster. <strong className="text-slate-900">Zero manual work.</strong>
                        </p>
                        <p className="text-sm font-mono text-slate-600 font-medium mb-10 uppercase tracking-widest">
                            Used by 500+ businesses · Powered by Meta
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
                            <Link
                                href="/register"
                                className="g-btn-primary"
                            >
                                Start Free Trial
                                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/how-to-use"
                                className="g-btn-outline"
                            >
                                <PlayCircle size={18} className="mr-2" />
                                Watch Demo
                            </Link>
                        </div>

                        {/* Social proof micro-strip */}
                        <div className="flex items-center gap-6">
                            <div className="flex -space-x-2">
                                {["RM", "PS", "AN", "KV", "SR"].map((init, i) => (
                                    <div key={i} className={`w-8 h-8 border-2 border-slate-900 bg-white flex items-center justify-center text-[10px] font-black text-slate-900 relative z-[${10-i}] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                                        {init}
                                    </div>
                                ))}
                            </div>
                            <div className="text-left">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-amber-400 text-amber-400" />)}
                                </div>
                                <p className="text-xs text-slate-500 font-medium">500+ businesses trust {platformName}</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative flex justify-center lg:justify-end border-4 border-slate-900 bg-white p-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-sm ml-auto">
                        <BSP_Animation />
                    </div>
                </div>
            </section>

            {/* ─── TICKER ─── */}
            <FeatureTicker />

            {/* ─── STATS STRIP ─── */}
            <section className="py-14 px-6 bg-[#0F172A]">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-4xl font-black text-white mb-1">{stat.value}</div>
                            <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── PRODUCT TABS (Screenshots) ─── */}
            <section className="py-28 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-4">The Platform</span>
                        <h2 className="text-4xl font-black text-slate-900">See {platformName} in Action</h2>
                        <p className="text-slate-500 mt-4 text-lg max-w-2xl mx-auto">Real screenshots from the live platform — not mockups.</p>
                    </div>

                    {/* Tab Buttons */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                        {PRODUCT_TABS.map((tab, i) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(i)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border transition-all ${activeTab === i
                                    ? "bg-[#27954D] text-white border-[#27954D] shadow-lg shadow-green-200/50"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-green-300"
                                    }`}
                            >
                                {tab.icon}{tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="grid lg:grid-cols-3 gap-8 items-start">
                        {/* Info Pane */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                            <h3 className="text-2xl font-black text-slate-900 mb-4">{PRODUCT_TABS[activeTab].title}</h3>
                            <p className="text-slate-500 leading-relaxed mb-6">{PRODUCT_TABS[activeTab].desc}</p>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {PRODUCT_TABS[activeTab].tags.map((tag, j) => (
                                    <span key={j} className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-100">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <Link href="/register" className="inline-flex items-center gap-2 bg-[#27954D] text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#1f7a3f] transition-all">
                                Try it Free <ArrowRight size={15} />
                            </Link>
                        </div>

                        {/* Screenshot */}
                        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-slate-200 shadow-xl">
                            <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                     <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                </div>
                                <span className="text-xs text-slate-400 font-medium ml-2">{domain}</span>
                            </div>
                            <Image
                                src={PRODUCT_TABS[activeTab].image}
                                alt={PRODUCT_TABS[activeTab].title}
                                width={900}
                                height={560}
                                className="w-full object-cover object-top transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* Dot indicators */}
                    <div className="flex justify-center gap-2 mt-6">
                        {PRODUCT_TABS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTab(i)}
                                className={`w-2 h-2 rounded-full transition-all ${activeTab === i ? "bg-green-500 w-6" : "bg-slate-300"}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── V3 FLAGSHIP: AI KNOWLEDGE ─── */}
            <NeuralKnowledgeShowcase 
                platformName={platformName}
            />

            {/* ─── V3 FLAGSHIP: OMNI HUB ─── */}
            <OmniHubSynergy 
                platformName={platformName}
            />

            {/* ─── V3 FLAGSHIP: AUTOPILOT ─── */}
            <AutopilotDrive 
                platformName={platformName}
            />

            {/* ─── PROBLEM / SOLUTION ─── */}
            <section className="py-28 px-6 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-4">The Problem</span>
                        <h2 className="text-4xl font-black text-slate-900 leading-tight mb-8">
                            Most businesses use WhatsApp <span className="text-red-500">manually.</span>
                        </h2>
                        <div className="space-y-3 mb-10">
                            {["Leads ask questions. No one replies for hours.", "Follow-ups are forgotten. Customers move on.", "Payment collection is awkward and manual.", "No data. No analytics. No growth visibility."].map((p, i) => (
                                <div key={i} className="flex items-start gap-3 text-slate-500 font-medium">
                                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                                    </div>
                                    {p}
                                </div>
                            ))}
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            {platformName} converts WhatsApp into a <strong className="text-slate-900">structured business platform</strong> — so every message becomes an opportunity, automatically.
                        </p>
                    </div>

                    <div className="bg-white rounded-none border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-10">
                        <span className="text-xs font-mono font-black uppercase tracking-[0.15em] text-green-600 block mb-6">With {platformName}:</span>
                        <div className="grid grid-cols-2 gap-3">
                            {["Leads auto-captured", "Instant smart replies", "Payments directly", "Full customer history", "Bulk broadcasts", "Team inbox", "GST invoices auto-sent", "Real-time analytics"].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white rounded-none px-4 py-3 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                                    <span className="text-slate-700 font-semibold text-sm">{item}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-xs font-black uppercase tracking-widest text-slate-400 mt-8">Everything from one dashboard.</p>
                    </div>
                </div>
            </section>

            {/* ─── HOW IT HELPS YOU SCALE ─── */}
            <section className="py-28 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20 border-y-2 border-slate-900 py-10 bg-white shadow-[0px_8px_0px_0px_rgba(0,0,0,1)]">
                        <span className="text-xs font-mono font-black uppercase tracking-[0.15em] text-slate-400 block mb-4">Growth Engine</span>
                        <h2 className="text-4xl font-black text-slate-900 leading-tight">How {platformName} Helps You Scale</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { num: "01", title: "Capture Every Lead", desc: "Automatically collect customer details through WhatsApp forms and flows. Never miss an enquiry again.", color: "text-green-500" },
                            { num: "02", title: "Automate Conversations", desc: "Send automatic replies, follow-ups, and reminders without manual effort. Reduce workload. Increase speed.", color: "text-blue-500" },
                            { num: "03", title: "Convert Customers Faster", desc: "Send payment links, offers, and product catalogs directly inside WhatsApp. Customers buy faster.", color: "text-violet-500" },
                            { num: "04", title: "Track Business Growth", desc: "Monitor leads, sales, campaign performance, message costs, and revenue. Make decisions based on data.", color: "text-amber-500" },
                        ].map((step, i) => (
                            <div key={i} className="g-card group">
                                <div className={`text-5xl font-serif font-black ${step.color} opacity-20 group-hover:opacity-40 transition-opacity mb-6`}>{step.num}</div>
                                <h3 className="text-lg font-black text-slate-900 mb-3 uppercase tracking-tight">{step.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CORE MODULES ─── */}
            <section className="py-28 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <span className="text-xs font-mono font-black uppercase tracking-[0.15em] text-slate-400 block mb-4">Platform Modules</span>
                    <h2 className="text-4xl font-serif font-black text-slate-900 leading-tight">Everything Your Business Needs</h2>
                    <p className="text-slate-500 mt-4 text-lg max-w-2xl mx-auto">One platform. Complete control. Every tool to grow on WhatsApp.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MODULES.map((mod, i) => (
                        <div key={i} className={`g-card ${mod.bg}`}>
                            <div className="p-3 bg-white border-2 border-slate-900 inline-flex mb-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-1 transition-transform">
                                {mod.icon}
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-3">{mod.title}</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-5">{mod.desc}</p>
                            <div className="flex flex-wrap gap-2">
                                {mod.tags.map((tag, j) => (
                                    <span key={j} className="bg-white text-slate-700 font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── HOW IT WORKS (dark) ─── */}
            <section className="py-28 px-6 bg-[#0F172A]">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-xs font-black uppercase tracking-[0.15em] text-green-400 block mb-4">Simple Setup</span>
                        <h2 className="text-4xl font-black text-white leading-tight">Get Live in 4 Minutes</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: "Connect Platforms", desc: "Add your WhatsApp API, SMTP Email, and Google Calendar for a complete setup." },
                            { title: "Train Your AI", desc: "Upload your business PDFs and docs to the AI Knowledge Engine in seconds." },
                            { title: "Design Automation", desc: "Build omni-channel flows that handle chats, emails, and meetings automatically." },
                            { title: "Start Growing", desc: "Launch campaigns and let the AI autopilot handle enquiries while you close deals." },
                        ].map((step, i) => (
                            <div key={i} className="text-center group p-6 bg-slate-900 border-2 border-white/20">
                                <div className="w-12 h-12 border-2 border-white text-white font-mono font-black text-xl flex items-center justify-center mx-auto mb-6">
                                    0{i + 1}
                                </div>
                                <h3 className="text-white font-serif font-black text-lg mb-3">{step.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-16">
                        <Link href="/register" className="g-btn-primary">
                            Start Free Trial <ArrowRight size={18} className="ml-2" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── TESTIMONIALS ─── */}
            <section className="py-28 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                     <div className="text-center mb-16">
                        <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-4">Customer Stories</span>
                        <h2 className="text-4xl font-black text-slate-900 leading-tight">Businesses That Grew With {platformName}</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="g-card">
                                <div className="flex items-center gap-1 mb-5">
                                    {[...Array(t.stars)].map((_, j) => <Star key={j} size={14} className="fill-slate-900 text-slate-900" />)}
                                </div>
                                <p className="text-slate-800 font-serif leading-relaxed mb-6 text-[15px]">"{t.text}"</p>
                                <div className="flex items-center gap-3 border-t-2 border-slate-900 pt-4">
                                    <div className="w-8 h-8 border-2 border-slate-900 bg-slate-900 text-white flex items-center justify-center font-mono font-black text-xs">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-sm">{t.name}</p>
                                        <p className="text-slate-500 text-xs font-mono">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── META RULES & COSTS ─── */}
            <section className="py-28 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-10">
                        <div className="bg-white rounded-3xl border border-slate-100 p-10 shadow-sm">
                            <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-4">Requirements</span>
                            <h3 className="text-2xl font-black text-slate-900 mb-8">WhatsApp API Prerequisites</h3>
                            <div className="space-y-4">
                                {[
                                    { label: "Meta Business Manager account", req: true },
                                    { label: "Business verification documents", req: true },
                                    { label: "Dedicated phone number", req: true },
                                    { label: "Business email address", req: true },
                                    { label: "GST registration", req: false },
                                    { label: "Business website", req: false },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Check size={16} className={item.req ? "text-green-500" : "text-slate-300"} />
                                        <span className={`text-sm font-medium ${item.req ? "text-slate-700" : "text-slate-400"}`}>{item.label}</span>
                                        {!item.req && <span className="text-[10px] uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Recommended</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-100 p-10 shadow-sm">
                            <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-4">Meta Policy</span>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">Meta Rules & Costs</h3>
                            <p className="text-slate-500 text-sm mb-8 leading-relaxed">WhatsApp API is regulated by Meta. Businesses must follow messaging policies and obtain customer opt-ins.</p>
                            <div className="space-y-3 mb-8">
                                {[
                                    "Templates require Meta approval before sending",
                                    "Customers must opt-in to receive messages",
                                    "Spam and unsolicited messaging is prohibited",
                                ].map((rule, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Shield size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-slate-600 text-sm">{rule}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-5">
                                <p className="text-green-800 text-sm font-bold">✓ {platformName} shows message costs before sending. Zero hidden charges.</p>
                                <p className="text-green-600 text-xs mt-1">India rates: Marketing ₹0.88 · Utility ₹0.13 · Service Free</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── WHY GRAFTY ─── */}
            <section className="py-28 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-4">Why Choose Us</span>
                    <h2 className="text-4xl font-black text-slate-900 leading-tight">Built for Serious Growth</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {[
                        { title: "Complete Platform", desc: "Not just messaging. Every tool to run and grow a business on WhatsApp.", icon: <Zap size={22} className="text-green-500" /> },
                        { title: "Transparent Pricing", desc: "No hidden fees. Clear credit system. Know exactly what you spend.", icon: <Receipt size={22} className="text-blue-500" /> },
                        { title: "Enterprise Grade", desc: "Reliable delivery, secure architecture, 99.9% uptime SLA.", icon: <Shield size={22} className="text-violet-500" /> },
                        { title: "Partner Ecosystem", desc: "Grow with affiliates and platform partners. Scale without limits.", icon: <Globe size={22} className="text-amber-500" /> },
                        { title: "Fully Automated", desc: "No manual operations required. Everything works automatically.", icon: <BarChart3 size={22} className="text-rose-500" /> },
                    ].map((item, i) => (
                        <div key={i} className="bg-slate-50 rounded-2xl border border-slate-100 p-7 hover:bg-white hover:shadow-lg hover:border-slate-200 transition-all">
                            <div className="mb-4 p-2.5 bg-white rounded-xl inline-flex shadow-sm">{item.icon}</div>
                            <h3 className="font-black text-slate-900 text-base mb-3">{item.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── PRICING ─── */}
            <section id="pricing" className="py-28 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-xs font-black uppercase tracking-[0.15em] text-[#27954D] block mb-4">Simple Pricing</span>
                        <h2 className="text-4xl font-black text-slate-900 leading-tight">Plans For Every Business</h2>
                        <p className="text-slate-500 mt-4 text-lg max-w-2xl mx-auto">Straightforward pricing. No hidden fees. Credit-based system with full cost visibility.</p>
                    </div>
                    <DynamicPricingSection />
                    <div className="text-center mt-12">
                        <Link href="/pricing" className="inline-flex items-center gap-2 text-[#27954D] font-bold text-sm hover:underline">
                            View full pricing details <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── FAQ ─── */}
            <section className="py-28 px-6 bg-white">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-4">Common Questions</span>
                        <h2 className="text-4xl font-black text-slate-900 leading-tight">Frequently Asked Questions</h2>
                    </div>
                    <div className="space-y-3">
                        {FAQS.map((faq, i) => (
                            <div key={i} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden hover:border-slate-200 transition-colors shadow-sm">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full p-6 text-left flex justify-between items-center hover:bg-white transition-colors"
                                >
                                    <span className="font-bold text-slate-900 pr-8 text-base">{faq.q}</span>
                                    {openFaq === i
                                        ? <Minus size={18} className="text-green-500 flex-shrink-0" />
                                        : <Plus size={18} className="text-slate-400 flex-shrink-0" />
                                    }
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4 bg-white">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── PARTNER CALLOUT ─── */}
            <section className="py-28 px-6 bg-blueprint">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
                    <div className="bg-white border-4 border-slate-900 p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                        <span className="text-xs font-mono font-black uppercase tracking-[0.15em] text-slate-500 block mb-4">For Marketers & Agencies</span>
                        <h3 className="text-3xl font-serif font-black text-slate-900 leading-tight mb-4">Become an Affiliate Partner</h3>
                        <p className="text-slate-600 mb-8 leading-relaxed">Earn recurring commission by recommending {platformName}. No technical knowledge required.</p>
                        <div className="flex flex-wrap gap-3 mb-8">
                            {["Recurring Commission", "Auto Wallet Credit", "Bank Withdrawal", "No Limit"].map((t, i) => (
                                <span key={i} className="bg-white text-slate-900 font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{t}</span>
                            ))}
                        </div>
                        <SmartPartnerLink destinationType="affiliate" className="g-btn-primary text-sm">
                            Become an Affiliate <ArrowRight size={16} className="ml-2" />
                        </SmartPartnerLink>
                    </div>

                    <div className="bg-slate-900 border-4 border-slate-900 p-12 text-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                        <span className="text-xs font-mono font-black uppercase tracking-[0.15em] text-slate-400 block mb-4">For Builders & Tech Companies</span>
                        <h3 className="text-3xl font-serif font-black leading-tight mb-4">Launch Your Own WhatsApp Platform</h3>
                        <p className="text-slate-300 mb-8 leading-relaxed">Own a branded WhatsApp BSP platform. Custom domain. Custom pricing. Full white-label control.</p>
                        <div className="flex flex-wrap gap-3 mb-8">
                            {["Custom Branding", "Custom Domain", "Vendor Management", "Revenue Dashboard"].map((t, i) => (
                                <span key={i} className="bg-slate-800 text-white font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border border-white/20">{t}</span>
                            ))}
                        </div>
                        <Link href="/platform-partner" className="g-btn-outline text-slate-900 text-sm">
                            Launch Your Platform <ArrowRight size={16} className="ml-2" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── FINAL CTA ─── */}
            <section className="py-28 px-6 bg-slate-900 border-t-4 border-slate-900 relative overflow-hidden">
                 <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-block bg-white border-2 border-white px-4 py-2 text-xs font-mono font-bold text-slate-900 mb-8 uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                        Enterprise Infrastructure
                    </div>
                     <h2 className="text-5xl font-serif font-black text-white leading-tight mb-6">
                        Ready to Automate Your<br />WhatsApp Business?
                    </h2>
                    <p className="text-slate-300 text-xl leading-relaxed mb-12 max-w-xl mx-auto">
                        Join 500+ businesses, agencies, institutes, and ecommerce brands growing on {platformName}.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/register" className="g-btn-primary">
                            Start Free Trial <ArrowRight size={18} className="ml-2" />
                        </Link>
                        <Link href="/pricing" className="g-btn-outline bg-white text-slate-900">
                            View Pricing
                        </Link>
                    </div>
                    <p className="text-slate-600 text-xs uppercase tracking-[0.2em] font-bold mt-12">
                        Meta-Compliant · GST-Ready · Enterprise Infrastructure · No Credit Card Required
                    </p>
                </div>
            </section>

            <LandingFooter branding={branding} />
        </main>
    );
}
