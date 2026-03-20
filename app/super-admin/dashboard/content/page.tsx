"use client";

import { useState, useEffect } from "react";
import {
    Globe, Save, RefreshCw, CheckCircle, Plus, Trash2,
    ChevronDown, ChevronUp, Image, MessageSquare, HelpCircle,
    Star, Zap, ArrowRight, Eye
} from "lucide-react";

interface HeroConfig {
    headline: string;
    headline_highlight: string;
    subtitle: string;
    cta_primary_label: string;
    cta_primary_link: string;
    cta_secondary_label: string;
    cta_secondary_link: string;
    badge_text: string;
    show_stats: boolean;
}

interface Feature {
    icon: string;
    title: string;
    description: string;
}

interface Testimonial {
    name: string;
    role: string;
    company: string;
    quote: string;
    avatar_initials: string;
}

interface FAQ {
    question: string;
    answer: string;
}

interface LandingConfig {
    hero: HeroConfig;
    features: Feature[];
    testimonials: Testimonial[];
    faqs: FAQ[];
    stats: { label: string; value: string }[];
}

const defaultConfig: LandingConfig = {
    hero: {
        headline: "Turn Conversations into",
        headline_highlight: "Revenue",
        subtitle: "Official WhatsApp Business API Platform — Automate, Broadcast & Convert at Scale.",
        cta_primary_label: "Start Free Trial",
        cta_primary_link: "/register",
        cta_secondary_label: "Watch Demo",
        cta_secondary_link: "#demo",
        badge_text: "⚡ Official Meta BSP Partner",
        show_stats: true,
    },
    features: [
        { icon: "Zap", title: "AI-Powered Flows", description: "Build intelligent conversation flows with conditional logic and AI responses." },
        { icon: "Globe", title: "Broadcast at Scale", description: "Send targeted campaigns to unlimited contacts with real-time analytics." },
        { icon: "Star", title: "CRM Integration", description: "Full contact management with tags, segments, and deal tracking." },
    ],
    testimonials: [
        { name: "Sarah Kern", role: "CTO", company: "TechCorp", quote: "Grafty transformed how we handle customer queries. Response times dropped by 80%.", avatar_initials: "SK" },
    ],
    faqs: [
        { question: "What is the WhatsApp Business API?", answer: "The WhatsApp Business API allows businesses to communicate with customers at scale using WhatsApp's messaging platform." },
    ],
    stats: [
        { label: "Active Businesses", value: "2,400+" },
        { label: "Messages Sent", value: "50M+" },
        { label: "Avg. Response Rate", value: "94%" },
        { label: "Uptime SLA", value: "99.9%" },
    ]
};

export default function GlobalContentManager() {
    const [config, setConfig] = useState<LandingConfig>(defaultConfig);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"hero" | "features" | "testimonials" | "faqs" | "stats">("hero");

    useEffect(() => {
        fetch("/api/super-admin/config")
            .then(r => r.json())
            .then(data => {
                if (data.landing_page_config && typeof data.landing_page_config === "object") {
                    const merged = {
                        ...defaultConfig,
                        ...data.landing_page_config,
                        hero: { ...defaultConfig.hero, ...(data.landing_page_config.hero || {}) }
                    };
                    setConfig(merged);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            await fetch("/api/super-admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ landing_page_config: config })
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: "hero", label: "🏠 Hero", icon: <Globe size={14} /> },
        { id: "features", label: "⚡ Features", icon: <Zap size={14} /> },
        { id: "testimonials", label: "💬 Testimonials", icon: <MessageSquare size={14} /> },
        { id: "faqs", label: "❓ FAQs", icon: <HelpCircle size={14} /> },
        { id: "stats", label: "📊 Stats", icon: <Star size={14} /> },
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <RefreshCw className="animate-spin text-emerald-500" size={32} />
        </div>
    );

    return (
        <div className="space-y-8 pb-20 max-w-5xl">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                        <Globe size={12} /> Landing Page Content Manager
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Global Content</h1>
                    <p className="text-slate-400 text-sm font-medium mt-2">
                        Edit every section of your public landing page without touching code.
                    </p>
                </div>
                <div className="flex gap-3">
                    <a href="/" target="_blank" className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all border border-slate-100">
                        <Eye size={16} /> Preview
                    </a>
                    <button
                        onClick={save} disabled={saving}
                        className={`flex items-center gap-3 px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest transition-all shadow-xl ${saved ? "bg-emerald-500 text-white" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                    >
                        {saved ? <CheckCircle size={18} /> : saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                        {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── HERO SECTION ── */}
            {activeTab === "hero" && (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8">
                    <h2 className="text-lg font-black text-slate-900">Hero Section</h2>

                    <div className="grid grid-cols-2 gap-6">
                        <Field label="Main Headline" value={config.hero.headline} onChange={v => setConfig({ ...config, hero: { ...config.hero, headline: v } })} placeholder="Turn Conversations into" />
                        <Field label="Highlighted Word (accent color)" value={config.hero.headline_highlight} onChange={v => setConfig({ ...config, hero: { ...config.hero, headline_highlight: v } })} placeholder="Revenue" />
                        <div className="col-span-2">
                            <Field label="Subtitle" value={config.hero.subtitle} onChange={v => setConfig({ ...config, hero: { ...config.hero, subtitle: v } })} placeholder="Official WhatsApp Business API Platform..." />
                        </div>
                        <Field label="Badge Text (top pill)" value={config.hero.badge_text} onChange={v => setConfig({ ...config, hero: { ...config.hero, badge_text: v } })} placeholder="⚡ Official Meta BSP Partner" />
                        <div className="col-span-2 grid grid-cols-2 gap-6">
                            <Field label="Primary CTA Label" value={config.hero.cta_primary_label} onChange={v => setConfig({ ...config, hero: { ...config.hero, cta_primary_label: v } })} placeholder="Start Free Trial" />
                            <Field label="Primary CTA Link" value={config.hero.cta_primary_link} onChange={v => setConfig({ ...config, hero: { ...config.hero, cta_primary_link: v } })} placeholder="/register" />
                            <Field label="Secondary CTA Label" value={config.hero.cta_secondary_label} onChange={v => setConfig({ ...config, hero: { ...config.hero, cta_secondary_label: v } })} placeholder="Watch Demo" />
                            <Field label="Secondary CTA Link" value={config.hero.cta_secondary_link} onChange={v => setConfig({ ...config, hero: { ...config.hero, cta_secondary_link: v } })} placeholder="#demo" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                        <button
                            onClick={() => setConfig({ ...config, hero: { ...config.hero, show_stats: !config.hero.show_stats } })}
                            className={`w-10 h-5 rounded-full transition-all relative ${config.hero.show_stats ? "bg-emerald-500" : "bg-slate-200"}`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${config.hero.show_stats ? "left-5" : "left-0.5"}`} />
                        </button>
                        <span className="text-sm font-black text-slate-700">Show Stats Bar below hero</span>
                    </div>

                    {/* Live Preview */}
                    <div className="bg-slate-900 rounded-3xl p-8 text-white">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Live Preview</p>
                        <div className="inline-block bg-white/10 text-xs font-black px-4 py-1.5 rounded-full mb-4">{config.hero.badge_text || "Badge Text"}</div>
                        <h2 className="text-4xl font-black mb-3">
                            {config.hero.headline} <span className="text-emerald-400">{config.hero.headline_highlight}</span>
                        </h2>
                        <p className="text-slate-400 mb-6 max-w-lg">{config.hero.subtitle}</p>
                        <div className="flex gap-3">
                            <span className="bg-emerald-500 text-white text-sm font-black px-6 py-3 rounded-xl">{config.hero.cta_primary_label}</span>
                            <span className="border border-white/20 text-white text-sm font-black px-6 py-3 rounded-xl">{config.hero.cta_secondary_label}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── FEATURES SECTION ── */}
            {activeTab === "features" && (
                <div className="space-y-4">
                    {config.features.map((feat, i) => (
                        <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Feature {i + 1}</span>
                                <button onClick={() => setConfig({ ...config, features: config.features.filter((_, idx) => idx !== i) })} className="text-slate-300 hover:text-rose-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <Field label="Icon Name (Lucide)" value={feat.icon} onChange={v => { const f = [...config.features]; f[i] = { ...f[i], icon: v }; setConfig({ ...config, features: f }); }} placeholder="Zap, Globe, Star..." />
                                <Field label="Title" value={feat.title} onChange={v => { const f = [...config.features]; f[i] = { ...f[i], title: v }; setConfig({ ...config, features: f }); }} placeholder="AI-Powered Flows" />
                                <Field label="Description" value={feat.description} onChange={v => { const f = [...config.features]; f[i] = { ...f[i], description: v }; setConfig({ ...config, features: f }); }} placeholder="Build intelligent flows..." />
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => setConfig({ ...config, features: [...config.features, { icon: "Zap", title: "", description: "" }] })}
                        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black text-sm hover:border-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> Add Feature
                    </button>
                </div>
            )}

            {/* ── TESTIMONIALS SECTION ── */}
            {activeTab === "testimonials" && (
                <div className="space-y-4">
                    {config.testimonials.map((t, i) => (
                        <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Testimonial {i + 1}</span>
                                <button onClick={() => setConfig({ ...config, testimonials: config.testimonials.filter((_, idx) => idx !== i) })} className="text-slate-300 hover:text-rose-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <Field label="Name" value={t.name} onChange={v => { const arr = [...config.testimonials]; arr[i] = { ...arr[i], name: v }; setConfig({ ...config, testimonials: arr }); }} placeholder="Sarah Kern" />
                                <Field label="Role" value={t.role} onChange={v => { const arr = [...config.testimonials]; arr[i] = { ...arr[i], role: v }; setConfig({ ...config, testimonials: arr }); }} placeholder="CTO" />
                                <Field label="Company" value={t.company} onChange={v => { const arr = [...config.testimonials]; arr[i] = { ...arr[i], company: v }; setConfig({ ...config, testimonials: arr }); }} placeholder="TechCorp" />
                                <Field label="Avatar Initials" value={t.avatar_initials} onChange={v => { const arr = [...config.testimonials]; arr[i] = { ...arr[i], avatar_initials: v }; setConfig({ ...config, testimonials: arr }); }} placeholder="SK" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Quote</label>
                                <textarea
                                    rows={2}
                                    value={t.quote}
                                    onChange={(e) => { const arr = [...config.testimonials]; arr[i] = { ...arr[i], quote: e.target.value }; setConfig({ ...config, testimonials: arr }); }}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 text-sm font-medium outline-none resize-none"
                                    placeholder="Grafty transformed how we handle customer queries..."
                                />
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => setConfig({ ...config, testimonials: [...config.testimonials, { name: "", role: "", company: "", quote: "", avatar_initials: "" }] })}
                        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black text-sm hover:border-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> Add Testimonial
                    </button>
                </div>
            )}

            {/* ── FAQs SECTION ── */}
            {activeTab === "faqs" && (
                <div className="space-y-4">
                    {config.faqs.map((faq, i) => (
                        <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-8">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">FAQ {i + 1}</span>
                                <button onClick={() => setConfig({ ...config, faqs: config.faqs.filter((_, idx) => idx !== i) })} className="text-slate-300 hover:text-rose-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <Field label="Question" value={faq.question} onChange={v => { const arr = [...config.faqs]; arr[i] = { ...arr[i], question: v }; setConfig({ ...config, faqs: arr }); }} placeholder="What is the WhatsApp Business API?" />
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Answer</label>
                                    <textarea
                                        rows={3}
                                        value={faq.answer}
                                        onChange={(e) => { const arr = [...config.faqs]; arr[i] = { ...arr[i], answer: e.target.value }; setConfig({ ...config, faqs: arr }); }}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 text-sm font-medium outline-none resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => setConfig({ ...config, faqs: [...config.faqs, { question: "", answer: "" }] })}
                        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black text-sm hover:border-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> Add FAQ
                    </button>
                </div>
            )}

            {/* ── STATS SECTION ── */}
            {activeTab === "stats" && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {config.stats.map((stat, i) => (
                            <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-6 flex gap-4 items-start">
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <Field label="Value" value={stat.value} onChange={v => { const arr = [...config.stats]; arr[i] = { ...arr[i], value: v }; setConfig({ ...config, stats: arr }); }} placeholder="50M+" />
                                    <Field label="Label" value={stat.label} onChange={v => { const arr = [...config.stats]; arr[i] = { ...arr[i], label: v }; setConfig({ ...config, stats: arr }); }} placeholder="Messages Sent" />
                                </div>
                                <button onClick={() => setConfig({ ...config, stats: config.stats.filter((_, idx) => idx !== i) })} className="text-slate-300 hover:text-rose-500 transition-colors mt-6">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setConfig({ ...config, stats: [...config.stats, { value: "", label: "" }] })}
                        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black text-sm hover:border-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> Add Stat
                    </button>
                </div>
            )}
        </div>
    );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{label}</label>
            <input
                type="text"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 text-slate-900 text-sm font-medium outline-none focus:border-slate-300 transition-all"
            />
        </div>
    );
}
