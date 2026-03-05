
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Plus, Save, Rocket, ArrowLeft, MoveVertical,
    Settings2, Trash2, Copy, Eye, Layout,
    Type, Image as ImageIcon, CreditCard, HelpCircle,
    Code, Grid, Target, Globe, AlertCircle, Link as LinkIcon,
    UploadCloud, ChevronRight, X, GripVertical, Check,
    Users, Video, MessageSquare
} from "lucide-react";
import Link from "next/link";

// --- Types & Templates ---
const SECTION_TEMPLATES = [
    { type: "HERO", label: "Hero Section", icon: <Layout size={18} /> },
    { type: "HERO_V2", label: "Frontline Hero V2", icon: <Layout size={18} /> },
    { type: "TICKER_V2", label: "Animated Ticker", icon: <Grid size={18} /> },
    { type: "STATS_STRIP_V2", label: "Stats Strip", icon: <Grid size={18} /> },
    { type: "PRODUCT_TABS_V2", label: "Product Tabs", icon: <Grid size={18} /> },
    { type: "SPLIT_LIST_V2", label: "Split Comparison", icon: <Grid size={18} /> },
    { type: "GROWTH_STEPS_V2", label: "Growth Steps", icon: <Grid size={18} /> },
    { type: "MULTI_CARDS_V2", label: "Module Grid", icon: <Grid size={18} /> },
    { type: "FINAL_CTA_V2", label: "Final App CTA", icon: <Rocket size={18} /> },
    { type: "FEATURES", label: "Features Grid", icon: <Grid size={18} /> },
    { type: "PRICING", label: "Pricing Section", icon: <CreditCard size={18} /> },
    { type: "MODULES", label: "Modules Overview", icon: <Grid size={18} /> },
    { type: "INTEGRATIONS", label: "Integrations", icon: <Globe size={18} /> },
    { type: "DIFFERENCE", label: "Master Difference", icon: <Target size={18} /> },
    { type: "FAQ", label: "FAQ Accordion", icon: <HelpCircle size={18} /> },
    { type: "TESTIMONIALS", label: "Testimonials", icon: <Users size={18} /> },
    { type: "CTA", label: "Call to Action", icon: <Rocket size={18} /> },
    { type: "VIDEO", label: "Video Block", icon: <Video size={18} /> },
    { type: "POPUP", label: "Exit/Timer Popup", icon: <MessageSquare size={18} /> },
    { type: "CUSTOM_HTML", label: "Custom HTML", icon: <Code size={18} /> },
    { type: "LOGO_WALL_V2", label: "Company Logo Wall", icon: <Grid size={18} /> },
    { type: "INTERACTIVE_CARD_V2", label: "Interactive Cards", icon: <CreditCard size={18} /> },
    { type: "IMAGE_CAROUSEL_V2", label: "Image Carousel", icon: <ImageIcon size={18} /> },
];

const DEFAULT_CONTENTS: any = {
    HERO: {
        title: "Scale Your Business on <span class='text-gradient'>WhatsApp.</span>",
        subtitle: "Grafty is a goal-driven WhatsApp Business Platform that helps you generate leads.",
        primaryBtnText: "Start Free Trial",
        primaryBtnLink: "/register",
        secondaryBtnText: "View Solutions",
        secondaryBtnLink: "/solutions",
        heroImage: "https://images.klipfolio.com/website/public/00be0b43-a0d3-4516-9b39-64002f99d71e/SaaS%20Dashboard.png"
    },
    FEATURES: {
        title: "What Grafty <span class='text-gradient'>Actually Does.</span>",
        subtitle: "Most businesses use WhatsApp manually. Grafty turns it into a scalable sales engine.",
        features: [
            { title: "Flow Builder", desc: "Build intelligent automation.", image: "https://infobip-cdn-h0h7ekhqhgh4hgau.a02.azurefd.net/1g8x60m5haaeebc38sw9etdnqwq2orfxs6yjtxwklw767cqz71/whatsapp-flow-json.png" }
        ]
    },
    PRICING: {
        title: "Pricing. <span class='text-gradient'>API Connected.</span>",
        subtitle: "No hidden charges. Credits visible.",
        autoSync: true,
        manualPlans: []
    },
    TESTIMONIALS: {
        title: "What Our <span class='text-gradient'>Customers</span> Say.",
        subtitle: "Don't just take our word for it.",
        testimonials: [
            { name: "John Doe", role: "CEO", text: "Best platform I have ever used.", avatar: "" }
        ]
    },
    CTA: {
        title: "Ready to <span class='text-gradient'>Scale?</span>",
        subtitle: "Join thousands of businesses already growing.",
        primaryBtnText: "Get Started Now",
        primaryBtnLink: "/register",
    },
    VIDEO: {
        title: "Watch Platform in <span class='text-gradient'>Action</span>",
        subtitle: "See how everything works in 2 minutes.",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnailUrl: ""
    },
    FAQ: {
        title: "Frequently Asked <span class='text-gradient'>Questions</span>",
        subtitle: "Find answers to your questions here.",
        faqs: [
            { question: "Do I need technical skills?", answer: "No, our platform is designed for non-technical users." }
        ]
    },
    POPUP: {
        title: "Wait! Special <span class='text-gradient'>Offer</span>",
        subtitle: "Get free onboarding when you sign up today.",
        primaryBtnText: "Claim Offer",
        primaryBtnLink: "/register?promo=POPUP",
        trigger: "EXIT_INTENT",
        delayMs: 5000
    },
    HERO_V2: {
        badgeText: "New Launch",
        headline: "Ultimate <span>Growth Engine</span>",
        subText: "Automate everything, grow faster with zero overhead.",
        statsText: "Trusted by top brands everywhere",
        primaryBtnText: "Get Started Now",
        primaryBtnLink: "/register",
        secondaryBtnText: "Watch Demo",
        secondaryBtnLink: "#",
        socialProofInitials: ["JD", "AB", "XY"],
        socialProofText: "Join thousands of experts",
        dashboardImg: "https://images.klipfolio.com/website/public/00be0b43-a0d3-4516-9b39-64002f99d71e/SaaS%20Dashboard.png"
    },
    TICKER_V2: {
        items: ["Next-Gen Flow Builder", "Multi-Agent Support", "Advanced Automation", "Rich API Integration"]
    },
    STATS_STRIP_V2: {
        stats: [{ value: "10M+", label: "Messages" }, { value: "500+", label: "Active Brands" }]
    },
    PRODUCT_TABS_V2: {
        pretitle: "Features",
        title: "See Our Core Modules",
        subtitle: "Built to perform.",
        tabs: [{ label: "Flows", title: "Build Anything", desc: "Our visual flow builder gives you full control.", tags: "Visual,Fast,Easy", image: "" }]
    },
    SPLIT_LIST_V2: {
        pretitle: "The Problem",
        title: "Manual means slow.",
        leftItems: ["Missed opportunities", "Slow replies"],
        pretitleRight: "The Solution",
        rightTitle: "Grafty Automation",
        rightItems: ["Instant replies", "Perfect followups"],
        bottomText: "All from one dashboard."
    },
    GROWTH_STEPS_V2: {
        pretitle: "How It Works",
        title: "4 simple steps to scale",
        steps: [{ title: "Sign Up", desc: "Create your account instantly", color: "text-blue-500" }]
    },
    MULTI_CARDS_V2: {
        styleType: "LIGHT",
        pretitle: "Modules",
        title: "What you get inside",
        subtitle: "Everything you need.",
        cards: [{ title: "Flows", desc: "Visual editor", tags: "No Code", icon: "Zap" }]
    },
    FINAL_CTA_V2: {
        topLabel: "Enterprise Infrastructure",
        title: "Ready to Start?",
        subtitle: "Sign up free, upgrade when you need to.",
        primaryBtnText: "Start Trial",
        primaryBtnLink: "/register",
        secondaryBtnText: "Contact Sales",
        secondaryBtnLink: "#",
        bottomLabel: "100% Secure"
    },
    LOGO_WALL_V2: {
        pretitle: "Trusted By",
        title: "Brands That <span class='text-gradient'>Trust Us</span>",
        subtitle: "Join hundreds of companies already growing on Grafty.",
        bgColor: "#FFFFFF",
        logos: [
            { name: "Acme Corp", img: "" },
            { name: "Globex", img: "" },
            { name: "Initech", img: "" },
            { name: "Umbrella", img: "" },
            { name: "Wernham Hogg", img: "" },
            { name: "Dunder Mifflin", img: "" }
        ]
    },
    INTERACTIVE_CARD_V2: {
        pretitle: "Why Choose Us",
        title: "Everything You Need to <span class='text-gradient'>Scale Fast</span>",
        subtitle: "Each feature is built to give your business an unfair advantage.",
        layout: "CENTER",
        btnText: "Get Started Free",
        btnLink: "/register",
        cards: [
            { title: "Instant Automation", desc: "Set up flows once and let them run 24/7 without any manual effort.", icon: "⚡", btnText: "Learn More", btnLink: "/features/automation" },
            { title: "Smart Analytics", desc: "Track every message, click, and conversion in real time from your dashboard.", icon: "📊", btnText: "See Analytics", btnLink: "/features/analytics" },
            { title: "Team Collaboration", desc: "Multiple agents, one inbox. Assign, respond, and close faster together.", icon: "🤝", btnText: "Explore Teams", btnLink: "/features/team" }
        ]
    },
    IMAGE_CAROUSEL_V2: {
        pretitle: "Platform Tour",
        title: "See the Platform <span class='text-gradient'>In Action</span>",
        subtitle: "Visual walkthrough of every module in the Grafty platform.",
        autoplay: true,
        interval: 4,
        slides: [
            { img: "https://images.klipfolio.com/website/public/00be0b43-a0d3-4516-9b39-64002f99d71e/SaaS%20Dashboard.png", caption: "Performance Dashboard", subcaption: "Real-time metrics at a glance" },
            { img: "https://infobip-cdn-h0h7ekhqhgh4hgau.a02.azurefd.net/1g8x60m5haaeebc38sw9etdnqwq2orfxs6yjtxwklw767cqz71/whatsapp-flow-json.png", caption: "Flow Builder", subcaption: "Build automated conversation flows visually" },
            { img: "", caption: "Add your screenshot here", subcaption: "Upload a platform screenshot" }
        ]
    }
};

export default function LandingBuilder({ params }: { params: { id: string } }) {
    const [page, setPage] = useState<any>(null);
    const [sections, setSections] = useState<any[]>([]);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);

    // Banner & CSS state
    const [bannerConfig, setBannerConfig] = useState<any>({ text: "", image: "", link: "", is_active: false });
    const [customCss, setCustomCss] = useState("");

    useEffect(() => {
        fetchPageData();
    }, []);

    const fetchPageData = async () => {
        try {
            const res = await fetch(`/api/super-admin/landing/pages/${params.id}`);
            const json = await res.json();
            if (json.success) {
                setPage(json.data);
                setSections(json.data.sections || []);
                setBannerConfig(json.data.banner_config || { text: "", image: "", link: "", is_active: false });
                setCustomCss(json.data.custom_css || "");
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const addSection = async (type: string) => {
        const res = await fetch(`/api/super-admin/landing/pages/${params.id}/sections`, {
            method: "POST",
            body: JSON.stringify({
                type,
                content: DEFAULT_CONTENTS[type] || { title: `New ${type} Section` },
                order: sections.length
            })
        });
        if (res.ok) fetchPageData();
    };

    const deleteSection = async (id: string) => {
        if (!confirm("Are you sure you want to destroy this node?")) return;
        try {
            await fetch(`/api/super-admin/landing/pages/${params.id}/sections/${id}`, {
                method: "DELETE"
            });
            fetchPageData();
            if (activeSectionId === id) setActiveSectionId(null);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleSectionVisibility = async (id: string, current: boolean) => {
        try {
            await fetch(`/api/super-admin/landing/pages/${params.id}/sections/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ is_active: !current })
            });
            setSections(sections.map(s => s.id === id ? { ...s, is_active: !current } : s));
        } catch (e) {
            console.error(e);
        }
    };

    const savePageSettings = async () => {
        setSaving(true);
        try {
            await fetch(`/api/super-admin/landing/pages/${params.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    banner_config: bannerConfig,
                    custom_css: customCss
                })
            });
        } catch (e) {
            console.error(e);
        }
        setSaving(false);
    };

    const publishPage = async () => {
        setPublishing(true);
        await savePageSettings();
        try {
            await fetch(`/api/super-admin/landing/pages/${params.id}/publish`, {
                method: "POST"
            });
            alert("Deployed to production cluster successfully.");
        } catch (e) {
            console.error(e);
        }
        setPublishing(false);
    };

    const updateSectionInState = (id: string, newContent: any) => {
        setSections(sections.map(s => s.id === id ? { ...s, content: newContent } : s));
    };

    const persistSection = async (id: string, content: any) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/super-admin/landing/pages/${params.id}/sections/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ content })
            });
            if (res.ok) {
                console.log("Section persisted successfully");
                alert("Section changes saved to database.");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to save section.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    const activeSection = sections.find(s => s.id === activeSectionId);

    return (
        <div className="flex flex-col bg-[#F8FAFC] font-inter" style={{ minHeight: 'calc(100vh - 80px)' }}>
            {/* Top Navigation */}
            <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-12 shrink-0">
                <div className="flex items-center gap-6">
                    <Link href="/super-admin/dashboard/landing-page" className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl hover:bg-slate-100 transition-all text-slate-400">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs">
                                🌐
                            </div>
                            <div>
                                <h1 className="text-xl font-extrabold text-slate-900 leading-none tracking-tight">Frontline Experience</h1>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Designing Page: {page?.slug}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {page?.status === 'DRAFT' ? (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black rounded-lg uppercase tracking-widest border border-amber-200">Draft Mode</span>
                    ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-[9px] font-black rounded-lg uppercase tracking-widest border border-green-200">Live Snapshot</span>
                    )}
                    <a
                        href={page?.slug === 'home' ? '/' : `/${page?.slug}`}
                        target="_blank"
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold text-[10px] hover:bg-slate-50 transition-all uppercase tracking-widest"
                    >
                        <Eye size={14} strokeWidth={2.5} /> View Live Site
                    </a>
                    <button
                        onClick={publishPage}
                        disabled={publishing}
                        className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest"
                    >
                        {publishing ? "Deploying..." : <><Rocket size={14} strokeWidth={2.5} /> Deploy Changes</>}
                    </button>
                </div>
            </header>

            <div className="flex overflow-hidden p-12 gap-10" style={{ height: 'calc(100vh - 80px - 80px)' }}>
                {/* Left: Section Blueprint (Structure) */}
                <div className="w-1/3 flex flex-col overflow-y-auto custom-scrollbar pr-4 pb-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-1">Active Blueprint</span>
                            <h2 className="text-sm font-bold text-slate-500">Structural Flow Architecture</h2>
                        </div>
                        <button
                            onClick={() => setActiveSectionId('ADD_SECTION')}
                            className="bg-blue-600/10 text-blue-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all"
                        >
                            <Plus size={14} strokeWidth={3} /> Add Section
                        </button>
                    </div>

                    <div className="space-y-4">
                        {sections.map((section, idx) => (
                            <div
                                key={section.id}
                                onClick={() => setActiveSectionId(section.id)}
                                className={`bg-white rounded-[2rem] border border-slate-100 p-8 flex items-center justify-between transition-all cursor-pointer group hover:shadow-xl hover:shadow-slate-100/50 ${activeSectionId === section.id ? 'ring-2 ring-slate-900 border-transparent shadow-2xl scale-[1.02]' : ''}`}
                            >
                                <div className="flex items-center gap-8">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:text-slate-900 transition-colors">
                                        <GripVertical size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="px-3 py-1 bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest rounded-lg">
                                                {section.type}
                                            </span>
                                            {!section.is_active && (
                                                <span className="px-3 py-1 bg-amber-100 text-[9px] font-black text-amber-600 uppercase tracking-widest rounded-lg">
                                                    Hidden
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                                            {section.content.title?.replace(/<[^>]*>?/gm, '') || `Untitled ${section.type}`}
                                        </h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(section.id, section.is_active); }}
                                        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${section.is_active ? 'text-slate-400 hover:text-blue-600' : 'text-amber-500 hover:text-amber-600'}`}
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Banner & Global Settings */}
                    <div className="mt-12 pt-12 border-t border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Global Node Configuration</h3>
                        <div
                            onClick={() => setActiveSectionId('BANNER_SETTINGS')}
                            className={`bg-[#0F172A] rounded-[2rem] p-8 flex items-center justify-between cursor-pointer hover:shadow-2xl transition-all ${activeSectionId === 'BANNER_SETTINGS' ? 'ring-2 ring-blue-500 shadow-2xl' : ''}`}
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <Target size={20} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">Marketing Offer Banner</h4>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase mt-1 tracking-widest">Target CTA Engine</p>
                                </div>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${bannerConfig.is_active ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`} />
                        </div>
                    </div>
                </div>

                {/* Right: Controller Console (The Monster Editor) */}
                <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                    {activeSection ? (
                        <div className="flex flex-col h-full">
                            <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                                        <Settings2 size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Section Editor</h3>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Node ID: {activeSection.id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => persistSection(activeSection.id, activeSection.content)}
                                    className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    <Save size={14} /> Persist Changes
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                                <MonsterPropertyEditor
                                    section={activeSection}
                                    onChange={(newContent: any) => updateSectionInState(activeSection.id, newContent)}
                                    onPersist={() => persistSection(activeSection.id, activeSection.content)}
                                    saving={saving}
                                />
                            </div>
                        </div>
                    ) : activeSectionId === 'ADD_SECTION' ? (
                        <div className="p-12">
                            <div className="mb-10">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Add Dynamic Blueprint Node</h3>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Inject high-fidelity components into your architecture.</p>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                {SECTION_TEMPLATES.map((tpl) => (
                                    <button
                                        key={tpl.type}
                                        onClick={() => addSection(tpl.type)}
                                        className="flex flex-col items-center gap-4 p-8 bg-slate-50 border border-transparent rounded-[2.5rem] hover:bg-white hover:border-slate-200 hover:shadow-2xl hover:scale-[1.02] transition-all group"
                                    >
                                        <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                                            {tpl.icon}
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-900">{tpl.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : activeSectionId === 'BANNER_SETTINGS' ? (
                        <div className="p-12 overflow-y-auto custom-scrollbar">
                            <div className="mb-10 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Offer Console</h3>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Manage top-level marketing triggers.</p>
                                </div>
                                <button
                                    onClick={savePageSettings}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-blue-200"
                                >
                                    <Check size={16} className="mr-2 inline" /> Save Logic
                                </button>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Banner Visibility</label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setBannerConfig({ ...bannerConfig, is_active: !bannerConfig.is_active })}
                                            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border ${bannerConfig.is_active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                        >
                                            {bannerConfig.is_active ? 'Active Engine' : 'Offline'}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dynamic Text Content</label>
                                    <textarea
                                        value={bannerConfig.text}
                                        onChange={(e) => setBannerConfig({ ...bannerConfig, text: e.target.value })}
                                        className="w-full bg-slate-50 border-slate-100 rounded-2xl p-6 text-sm font-bold focus:bg-white transition-all ring-blue-500/10 focus:ring-4 outline-none"
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CTA Destination (Deep Link)</label>
                                    <input
                                        value={bannerConfig.link}
                                        onChange={(e) => setBannerConfig({ ...bannerConfig, link: e.target.value })}
                                        className="w-full bg-slate-50 border-slate-100 rounded-2xl p-6 text-sm font-mono font-bold focus:bg-white transition-all outline-none"
                                        placeholder="/register?promo=SUMMER50"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Custom CSS Injection</label>
                                    <textarea
                                        value={customCss}
                                        onChange={(e) => setCustomCss(e.target.value)}
                                        className="w-full h-[300px] bg-slate-900 border-slate-800 rounded-3xl p-8 text-sm font-mono text-green-400 focus:ring-4 ring-blue-500/10 outline-none"
                                        placeholder=".text-gradient { background: linear-gradient(...); }"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-20 py-40">
                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-400 mb-8 border border-slate-100 shadow-inner">
                                <Layout size={48} />
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Architectural Studio</h4>
                            <p className="text-slate-400 font-bold text-xs mt-4 leading-relaxed uppercase tracking-widest max-w-sm">Select a node from the blueprint on the left to begin deep data manipulation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Monster Components ---

/**
 * ImageUploadField
 * Shows a URL input + a local file upload button side by side.
 * Uploads via /api/media/upload (module=cms) and sets the returned URL.
 */
function ImageUploadField({
    label,
    value,
    onChange,
    placeholder = "Paste URL or upload file",
    optional = true
}: {
    label: string;
    value: string;
    onChange: (url: string) => void;
    placeholder?: string;
    optional?: boolean;
}) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = React.useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        console.log("[ImageUploadField] Uploading file:", file.name, file.size);
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("module", "cms");
            const res = await fetch("/api/media/upload", { method: "POST", body: fd });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text.substring(0, 100)}`);
            }
            const json = await res.json();
            console.log("[ImageUploadField] Upload result:", json);
            if (json.success && json.url) {
                onChange(json.url);
            } else {
                alert("Upload failed: " + (json.error || "Unknown error"));
            }
        } catch (err: any) {
            console.error("[ImageUploadField] Upload catch error:", err);
            alert("Upload error: " + err.message);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {label} {optional && <span className="text-slate-300 normal-case font-bold">(optional)</span>}
            </label>
            <div className="flex gap-2">
                <input
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 focus:bg-white focus:border-blue-300 transition-all outline-none"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="Upload from local drive"
                    className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap shadow"
                >
                    <UploadCloud size={15} />
                    {uploading ? "Uploading..." : "Upload"}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
            {value && (
                <div className="mt-2 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                    <img
                        src={`${value}${value.includes('?') ? '&' : '?'}t=${Date.now()}`}
                        alt="Preview"
                        className="w-full max-h-60 object-contain bg-white"
                    />
                </div>
            )}
        </div>
    );
}

function MonsterPropertyEditor({ section, onChange, onPersist, saving }: { section: any, onChange: (c: any) => void, onPersist: () => void, saving: boolean }) {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const handleFieldChange = (field: string, value: any) => {
        setHasUnsavedChanges(true);
        onChange({ ...section.content, [field]: value });
    };

    return (
        <div className="space-y-10 relative">
            {hasUnsavedChanges && (
                <div className="sticky top-0 z-20 -mx-6 px-6 py-2 bg-amber-50 border-b border-amber-100 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center gap-2 text-amber-700 font-bold text-[10px] uppercase tracking-wider">
                        <AlertCircle size={14} />
                        Unsaved Local Changes
                    </div>
                    <button
                        onClick={() => {
                            onPersist();
                            setHasUnsavedChanges(false);
                        }}
                        disabled={saving}
                        className="px-3 py-1 bg-amber-600 text-white rounded-md text-[10px] font-black uppercase hover:bg-amber-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Persist Now"}
                    </button>
                </div>
            )}

            {/* Standard Headers - Visible for most sections */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Heading (HTML Support)</label>
                    <input
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-lg font-black tracking-tight text-slate-900 focus:bg-white focus:border-blue-300 transition-all outline-none"
                        value={section.content.title || ""}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                        placeholder="Section heading..."
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sub-Text Narrative</label>
                    <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-medium text-slate-700 leading-relaxed focus:bg-white focus:border-blue-300 transition-all outline-none"
                        value={section.content.subtitle || ""}
                        onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                        rows={3}
                        placeholder="Supporting description text..."
                    />
                </div>

                <ImageUploadField
                    label="Background / Section Image"
                    value={section.content.sectionImage || ""}
                    onChange={(url) => handleFieldChange('sectionImage', url)}
                    placeholder="Paste URL or upload image"
                />
            </div>

            {/* 🔥 ULTIMATE DYNAMIC EDITOR FOR NEW V2 BLOCKS 🔥 */}
            {section.type.endsWith('_V2') && (
                <div className="space-y-6 pt-6 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Dynamic Properties Editor</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(section.content).map(([key, value]) => {
                            if (key === 'title' || key === 'subtitle' || key === 'sectionImage') return null;

                            if (typeof value === 'string' || typeof value === 'number') {
                                // If it looks like an image URL or image key, use ImageUploadField. Otherwise use input/textarea.
                                if (key.toLowerCase().includes('img') || key.toLowerCase().includes('image') || (typeof value === 'string' && value.startsWith('http'))) {
                                    return (
                                        <div key={key} className="col-span-1 md:col-span-2">
                                            <ImageUploadField
                                                label={key.replace(/([A-Z])/g, ' $1').trim()}
                                                value={value as string}
                                                onChange={(val) => handleFieldChange(key, val)}
                                            />
                                        </div>
                                    );
                                }

                                return (
                                    <div key={key} className={`space-y-2 ${((value as string).length > 60 || key.toLowerCase().includes('text')) ? 'col-span-1 md:col-span-2' : ''}`}>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                                        {(value as string).length > 60 || key.toLowerCase().includes('desc') || key.toLowerCase().includes('text') ? (
                                            <textarea
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-300 transition-all outline-none resize-none"
                                                value={value}
                                                onChange={(e) => handleFieldChange(key, e.target.type === 'number' ? Number(e.target.value) : e.target.value)}
                                                rows={3}
                                            />
                                        ) : (
                                            <input
                                                type={typeof value === 'number' ? 'number' : 'text'}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-300 transition-all outline-none"
                                                value={value}
                                                onChange={(e) => handleFieldChange(key, e.target.type === 'number' ? Number(e.target.value) : e.target.value)}
                                            />
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
            )}

            {/* V2 Array Editors */}
            {section.content.items && Array.isArray(section.content.items) && (
                <div className="pt-6 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">String Items Array</label>
                    <ArrayEditor
                        items={section.content.items.map((str: string) => ({ value: str }))}
                        onChange={(arr) => handleFieldChange('items', arr.map(a => a.value))}
                        template={{ value: "New Item text..." }}
                        renderItem={(item, index, update) => (
                            <input className="w-full text-sm font-bold text-slate-900 bg-transparent border-b border-slate-200 outline-none pb-1" value={item.value} onChange={(e) => update({ value: e.target.value })} placeholder="Item Text" />
                        )}
                    />
                </div>
            )}
            {section.content.socialProofInitials && Array.isArray(section.content.socialProofInitials) && (
                <div className="pt-6 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Initials</label>
                    <input
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-300 transition-all outline-none"
                        value={section.content.socialProofInitials.join(", ")}
                        onChange={(e) => handleFieldChange('socialProofInitials', e.target.value.split(',').map(s => s.trim()))}
                        placeholder="JD, AB, XY..."
                    />
                </div>
            )}
            {section.content.logos && Array.isArray(section.content.logos) && (
                <div className="pt-6 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Company / Brand Logos</label>
                    <ArrayEditor
                        items={section.content.logos}
                        onChange={(arr) => handleFieldChange('logos', arr)}
                        template={{ name: "New Brand", img: "" }}
                        renderItem={(item, index, update) => (
                            <div className="space-y-4">
                                <input className="w-full text-sm font-bold text-slate-900 bg-transparent border-b border-slate-200 outline-none pb-1" value={item.name || ""} onChange={(e) => update({ name: e.target.value })} placeholder="Brand Name" />
                                <ImageUploadField
                                    label="Logo Image (Optional if using name)"
                                    value={item.img || ''}
                                    onChange={(url) => update({ img: url })}
                                    placeholder="Upload or paste image URL"
                                />
                            </div>
                        )}
                    />
                </div>
            )}
            {section.content.cards && Array.isArray(section.content.cards) && (
                <div className="pt-6 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Section Cards</label>
                    <ArrayEditor
                        items={section.content.cards}
                        onChange={(arr) => handleFieldChange('cards', arr)}
                        template={{ title: "New Feature", desc: "Short description here", icon: "⭐", btnText: "Learn More", btnLink: "#", tags: "" }}
                        renderItem={(item, index, update) => (
                            <div className="space-y-3">
                                <div className="grid grid-cols-[1fr_80px] gap-2">
                                    <input className="font-bold text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300 w-full" value={item.title || ""} onChange={(e) => update({ title: e.target.value })} placeholder="Card Title" />
                                    <input className="font-bold text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none text-center" value={item.icon || ""} onChange={(e) => update({ icon: e.target.value })} placeholder="Emoji Icon" />
                                </div>
                                <textarea className="w-full text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300 resize-none" value={item.desc || ""} onChange={(e) => update({ desc: e.target.value })} placeholder="Card Description..." rows={2} />
                                <div className="grid grid-cols-2 gap-2">
                                    <input className="text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none" value={item.btnText || ""} onChange={(e) => update({ btnText: e.target.value })} placeholder="Button Text (optional)" />
                                    <input className="text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none" value={item.btnLink || ""} onChange={(e) => update({ btnLink: e.target.value })} placeholder="Button Link (optional)" />
                                </div>
                                <input className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none" value={item.tags || ""} onChange={(e) => update({ tags: e.target.value })} placeholder="Tags (comma separated, for MULTI_CARDS_V2)" />
                            </div>
                        )}
                    />
                </div>
            )}
            {section.content.slides && Array.isArray(section.content.slides) && (
                <div className="pt-6 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Carousel Slides</label>
                    <ArrayEditor
                        items={section.content.slides}
                        onChange={(arr) => handleFieldChange('slides', arr)}
                        template={{ img: "", caption: "New Slide", subcaption: "Slide details here" }}
                        renderItem={(item, index, update) => (
                            <div className="space-y-3">
                                <ImageUploadField
                                    label="Slide Image"
                                    value={item.img || ''}
                                    onChange={(url) => update({ img: url })}
                                    optional={false}
                                    placeholder="Upload or paste slide image URL"
                                />
                                <input className="w-full font-bold text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300" value={item.caption || ""} onChange={(e) => update({ caption: e.target.value })} placeholder="Main Caption" />
                                <input className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none" value={item.subcaption || ""} onChange={(e) => update({ subcaption: e.target.value })} placeholder="Sub Caption (optional)" />
                            </div>
                        )}
                    />
                </div>
            )}

            {/* HERO extras */}
            {section.type === 'HERO' && (
                <div className="space-y-6 pt-6 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">CTA Buttons</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary CTA Label</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-300 transition-all outline-none"
                                value={section.content.primaryBtnText || ""}
                                onChange={(e) => handleFieldChange('primaryBtnText', e.target.value)}
                                placeholder="Start Free Trial"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary CTA Link</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 focus:bg-white focus:border-blue-300 transition-all outline-none"
                                value={section.content.primaryBtnLink || ""}
                                onChange={(e) => handleFieldChange('primaryBtnLink', e.target.value)}
                                placeholder="/register"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secondary CTA Label</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-300 transition-all outline-none"
                                value={section.content.secondaryBtnText || ""}
                                onChange={(e) => handleFieldChange('secondaryBtnText', e.target.value)}
                                placeholder="View Solutions"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secondary CTA Link</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 focus:bg-white focus:border-blue-300 transition-all outline-none"
                                value={section.content.secondaryBtnLink || ""}
                                onChange={(e) => handleFieldChange('secondaryBtnLink', e.target.value)}
                                placeholder="/solutions"
                            />
                        </div>
                    </div>


                    <ImageUploadField
                        label="Main Hero Visual (Macbook/Dashboard)"
                        optional={false}
                        value={section.content.heroImage || ""}
                        onChange={(url) => handleFieldChange('heroImage', url)}
                        placeholder="Upload dashboard screenshot or paste URL"
                    />

                    <ImageUploadField
                        label="Floating Mobile Overlay Image"
                        value={section.content.overlayImage || ""}
                        onChange={(url) => handleFieldChange('overlayImage', url)}
                        placeholder="Upload mobile overlay image or paste URL"
                    />
                </div>
            )}

            {/* FEATURES matrix */}
            {section.type === 'FEATURES' && (
                <div className="pt-6 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Feature Card Matrix</label>
                    <ArrayEditor
                        items={section.content.features || []}
                        onChange={(items) => handleFieldChange('features', items)}
                        template={{ title: "New Feature", desc: "Detail description.", image: "" }}
                        renderItem={(item, index, update) => (
                            <div className="space-y-3">
                                <input
                                    className="w-full text-sm font-black text-slate-900 bg-transparent border-b border-slate-200 pb-1 outline-none focus:border-blue-400"
                                    value={item.title}
                                    onChange={(e) => update({ title: e.target.value })}
                                    placeholder="Feature Title"
                                />
                                <textarea
                                    className="w-full text-xs font-medium text-slate-600 bg-transparent border-none outline-none resize-none"
                                    value={item.desc}
                                    onChange={(e) => update({ desc: e.target.value })}
                                    placeholder="Feature description..."
                                    rows={2}
                                />
                                <ImageUploadField
                                    label="Feature Image"
                                    value={item.image || ''}
                                    onChange={(url) => update({ image: url })}
                                    placeholder="Upload or paste image URL"
                                />
                            </div>
                        )}
                    />
                </div>
            )}

            {/* PRICING section */}
            {section.type === 'PRICING' && (
                <div className="pt-6 border-t border-slate-100 space-y-6">
                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                            <h4 className="text-xs font-black uppercase text-slate-900 tracking-widest">Auto-Sync with Plans</h4>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">Pull real-time data from financial engine</p>
                        </div>
                        <button
                            onClick={() => handleFieldChange('autoSync', !section.content.autoSync)}
                            className={`w-14 h-7 rounded-full relative transition-all ${section.content.autoSync ? 'bg-blue-600' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${section.content.autoSync ? 'right-1' : 'left-1'}`} />
                        </button>
                    </div>

                    {!section.content.autoSync && (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual Plan Overrides</label>
                            <ArrayEditor
                                items={section.content.manualPlans || []}
                                onChange={(items) => handleFieldChange('manualPlans', items)}
                                template={{ name: "New Plan", price: 0, credits: 0, features: [], is_featured: false }}
                                renderItem={(item, index, update) => (
                                    <div className="grid grid-cols-2 gap-4">
                                        <input className="font-bold text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none" value={item.name} onChange={(e) => update({ name: e.target.value })} placeholder="Plan Name" />
                                        <input className="font-bold text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none" type="number" value={item.price} onChange={(e) => update({ price: Number(e.target.value) })} placeholder="Price" />
                                    </div>
                                )}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* CUSTOM_HTML */}
            {section.type === 'CUSTOM_HTML' && (
                <div className="pt-6 border-t border-slate-100 space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Raw HTML Injection</label>
                    <textarea
                        className="w-full h-[400px] bg-slate-900 border-none rounded-3xl p-8 text-sm font-mono text-green-400 outline-none"
                        value={section.content.html || ""}
                        onChange={(e) => handleFieldChange('html', e.target.value)}
                        placeholder="<div>...</div>"
                    />
                </div>
            )}

            {/* TESTIMONIALS */}
            {section.type === 'TESTIMONIALS' && (
                <div className="pt-6 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Testimonial Cards</label>
                    <ArrayEditor
                        items={section.content.testimonials || []}
                        onChange={(items) => handleFieldChange('testimonials', items)}
                        template={{ name: "New Customer", role: "Role", text: "Customer feedback.", avatar: "" }}
                        renderItem={(item, index, update) => (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <input className="font-bold text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300" value={item.name} onChange={(e) => update({ name: e.target.value })} placeholder="Name" />
                                    <input className="font-bold text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300" value={item.role} onChange={(e) => update({ role: e.target.value })} placeholder="Role/Company" />
                                </div>
                                <textarea className="w-full text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300 resize-none" value={item.text} onChange={(e) => update({ text: e.target.value })} placeholder="Feedback text..." rows={3} />
                                <ImageUploadField label="Avatar" value={item.avatar || ''} onChange={(url) => update({ avatar: url })} placeholder="Avatar URL" />
                            </div>
                        )}
                    />
                </div>
            )}

            {/* CTA */}
            {section.type === 'CTA' && (
                <div className="space-y-6 pt-6 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">CTA Button Settings</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button Label</label>
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-300 transition-all outline-none" value={section.content.primaryBtnText || ""} onChange={(e) => handleFieldChange('primaryBtnText', e.target.value)} placeholder="Get Started Now" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button Link</label>
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 focus:bg-white focus:border-blue-300 transition-all outline-none" value={section.content.primaryBtnLink || ""} onChange={(e) => handleFieldChange('primaryBtnLink', e.target.value)} placeholder="/register" />
                        </div>
                    </div>
                </div>
            )}

            {/* VIDEO */}
            {section.type === 'VIDEO' && (
                <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">YouTube/Vimeo Embed URL</label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 focus:bg-white focus:border-blue-300 transition-all outline-none" value={section.content.videoUrl || ""} onChange={(e) => handleFieldChange('videoUrl', e.target.value)} placeholder="https://www.youtube.com/embed/..." />
                        <p className="text-[10px] text-slate-400">Please use embed URL formats.</p>
                    </div>
                    <ImageUploadField label="Custom Thumbnail Override (Optional)" value={section.content.thumbnailUrl || ''} onChange={(url) => handleFieldChange('thumbnailUrl', url)} />
                </div>
            )}

            {/* POPUP */}
            {section.type === 'POPUP' && (
                <div className="space-y-6 pt-6 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Popup Configuration</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trigger Type</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-300 transition-all outline-none"
                                value={section.content.trigger || "EXIT_INTENT"}
                                onChange={(e) => handleFieldChange('trigger', e.target.value)}
                            >
                                <option value="EXIT_INTENT">On Exit Intent</option>
                                <option value="SCROLL">On Scroll (50%)</option>
                                <option value="TIMER">On Timer</option>
                            </select>
                        </div>
                        {section.content.trigger === 'TIMER' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delay (Ms)</label>
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 focus:bg-white focus:border-blue-300 transition-all outline-none" type="number" value={section.content.delayMs || 5000} onChange={(e) => handleFieldChange('delayMs', Number(e.target.value))} />
                            </div>
                        )}
                    </div>
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mt-4">Button Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button Label</label>
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-300 transition-all outline-none" value={section.content.primaryBtnText || ""} onChange={(e) => handleFieldChange('primaryBtnText', e.target.value)} placeholder="Claim Offer" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button Link</label>
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 focus:bg-white focus:border-blue-300 transition-all outline-none" value={section.content.primaryBtnLink || ""} onChange={(e) => handleFieldChange('primaryBtnLink', e.target.value)} placeholder="/register" />
                        </div>
                    </div>
                </div>
            )}

            {/* FAQ */}
            {section.type === 'FAQ' && (
                <div className="pt-6 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Questions & Answers</label>
                    <ArrayEditor
                        items={section.content.faqs || []}
                        onChange={(items) => handleFieldChange('faqs', items)}
                        template={{ question: "New Question?", answer: "Answer text here." }}
                        renderItem={(item, index, update) => (
                            <div className="space-y-3">
                                <input className="font-bold text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-full outline-none focus:border-blue-300" value={item.question} onChange={(e) => update({ question: e.target.value })} placeholder="Question?" />
                                <textarea className="w-full text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300 resize-none" value={item.answer} onChange={(e) => update({ answer: e.target.value })} placeholder="Answer text..." rows={3} />
                            </div>
                        )}
                    />
                </div>
            )}

            {/* INTEGRATIONS - apps list with logos */}
            {section.type === 'INTEGRATIONS' && (
                <div className="pt-6 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Integration App Logos</label>
                    <ArrayEditor
                        items={section.content.apps || []}
                        onChange={(items) => handleFieldChange('apps', items)}
                        template={{ name: "App Name", logo: "" }}
                        renderItem={(item, index, update) => (
                            <div className="flex items-center gap-4">
                                {item.logo ? <img src={item.logo} alt="" className="w-10 h-10 object-contain rounded" onError={(e) => (e.currentTarget.style.display = 'none')} /> : <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-500 text-xs">IMG</div>}
                                <div className="flex-1 space-y-2">
                                    <input className="w-full text-sm font-bold text-slate-900 bg-transparent border-b border-slate-200 outline-none pb-1" value={item.name} onChange={(e) => update({ name: e.target.value })} placeholder="App Name" />
                                    <ImageUploadField
                                        label="App Logo"
                                        value={item.logo || ''}
                                        onChange={(url) => update({ logo: url })}
                                        placeholder="Upload logo or paste URL"
                                    />
                                </div>
                            </div>
                        )}
                    />
                </div>
            )}
        </div>
    );
}

function ArrayEditor({ items, onChange, template, renderItem }: { items: any[], onChange: (i: any[]) => void, template: any, renderItem: (item: any, idx: number, update: (val: any) => void) => React.ReactNode }) {
    const addItem = () => onChange([...items, { ...template, id: Math.random().toString(36).substr(2, 9) }]);
    const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx));
    const updateItem = (idx: number, newVal: any) => onChange(items.map((it, i) => i === idx ? { ...it, ...newVal } : it));

    return (
        <div className="space-y-4">
            {items.map((item, idx) => (
                <div key={idx} className="group relative bg-white border border-slate-100 rounded-2xl p-5 transition-all hover:shadow-lg">
                    <button
                        onClick={() => removeItem(idx)}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                    >
                        <X size={14} strokeWidth={3} />
                    </button>
                    {renderItem(item, idx, (val) => updateItem(idx, val))}
                </div>
            ))}
            <button
                onClick={addItem}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
            >
                <Plus size={14} strokeWidth={3} /> Add Item
            </button>
        </div>
    );
}
