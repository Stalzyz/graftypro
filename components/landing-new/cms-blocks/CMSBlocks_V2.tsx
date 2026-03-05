"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, PlayCircle, Star, CheckCircle2, Check, Shield, Zap, Receipt, Globe, BarChart3, ChevronRight, Plus, Minus } from "lucide-react";

// Helper components
const IconMap: any = { Zap, Receipt, Shield, Globe, BarChart3, CheckCircle2, Check, Star, PlayCircle, ArrowRight, Sparkles };

const getIcon = (name: string, props: any) => {
    const Icon = IconMap[name];
    if (!Icon) return null;
    return <Icon {...props} />;
};

// 1. HERO_V2
export function HeroV2({ badgeText, headline, subText, statsText, primaryBtnText, primaryBtnLink, secondaryBtnText, secondaryBtnLink, socialProofInitials, socialProofText, dashboardImg }: any) {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => setIsVisible(true), []);

    return (
        <section className="pt-36 pb-0 px-6 max-w-7xl mx-auto relative overflow-hidden">
            <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-green-100 rounded-full blur-[120px] opacity-40 pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px] opacity-40 pointer-events-none" />

            <div className={`relative z-10 text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                {badgeText && (
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 text-green-700 text-xs font-black uppercase tracking-[0.12em] px-5 py-2.5 rounded-full mb-8 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span dangerouslySetInnerHTML={{ __html: badgeText }} />
                    </div>
                )}

                {headline && (
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight mb-6 max-w-5xl mx-auto" dangerouslySetInnerHTML={{ __html: headline }} />
                )}

                {subText && (
                    <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-4" dangerouslySetInnerHTML={{ __html: subText }} />
                )}

                {statsText && (
                    <p className="text-sm text-slate-400 font-medium mb-10" dangerouslySetInnerHTML={{ __html: statsText }} />
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                    {primaryBtnText && (
                        <Link href={primaryBtnLink || "#"} className="group flex items-center gap-2 bg-[#27954D] hover:bg-[#1f7a3f] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-green-200/60 text-base active:scale-95">
                            {primaryBtnText} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}
                    {secondaryBtnText && (
                        <Link href={secondaryBtnLink || "#"} className="flex items-center gap-2 bg-white text-slate-700 font-bold px-8 py-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-base">
                            <PlayCircle size={18} className="text-green-500" /> {secondaryBtnText}
                        </Link>
                    )}
                </div>

                {socialProofInitials && socialProofInitials.length > 0 && (
                    <div className="flex items-center justify-center gap-6 mb-12">
                        <div className="flex -space-x-2">
                            {socialProofInitials.map((init: string, i: number) => (
                                <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white ${["bg-green-500", "bg-blue-500", "bg-violet-500", "bg-amber-500", "bg-rose-500"][i % 5]}`}>
                                    {init}
                                </div>
                            ))}
                        </div>
                        <div className="text-left">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-amber-400 text-amber-400" />)}
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{socialProofText}</p>
                        </div>
                    </div>
                )}
            </div>

            {dashboardImg && (
                <div className="relative mx-auto max-w-5xl">
                    <div className="bg-slate-100 rounded-t-2xl border border-slate-200 border-b-0 px-4 py-3 flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <div className="flex-1 bg-white rounded-md text-xs text-slate-400 font-medium px-3 py-1.5 text-center mx-8 border border-slate-200">
                            app.grafty.pro/dashboard
                        </div>
                    </div>
                    <div className="relative rounded-b-2xl overflow-hidden border border-slate-200 border-t-0 shadow-2xl shadow-slate-900/20">
                        <img src={dashboardImg} alt="Dashboard" className="w-full object-cover object-top" />
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
                    </div>
                </div>
            )}
        </section>
    );
}

// 2. TICKER
export function TickerV2({ items = [] }: any) {
    if (!items.length) return null;
    const scrollItems = [...items, ...items, ...items];
    return (
        <div className="overflow-hidden py-3 bg-gradient-to-r from-[#042F94] to-[#27954D] relative">
            <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-[#042F94] to-transparent z-10" />
            <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-[#27954D] to-transparent z-10" />
            <div className="flex gap-10 whitespace-nowrap" style={{ animation: "ticker 40s linear infinite" }}>
                {scrollItems.map((item: string, i: number) => (
                    <span key={i} className="text-white/90 text-sm font-semibold flex-shrink-0 flex items-center gap-2">
                        {item} <span className="text-white/30 mx-2">·</span>
                    </span>
                ))}
            </div>
            <style>{`@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
        </div>
    );
}

// 3. STATS STRIP
export function StatsStripV2({ stats = [] }: any) {
    if (!stats.length) return null;
    return (
        <section className="py-14 px-6 bg-[#0F172A]">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat: any, i: number) => (
                    <div key={i} className="text-center">
                        <div className="text-4xl font-black text-white mb-1" dangerouslySetInnerHTML={{ __html: stat.value }} />
                        <div className="text-slate-400 text-sm font-medium" dangerouslySetInnerHTML={{ __html: stat.label }} />
                    </div>
                ))}
            </div>
        </section>
    );
}

// 4. PRODUCT TABS
export function ProductTabsV2({ pretitle, title, subtitle, tabs = [] }: any) {
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        if (!tabs.length) return;
        const timer = setInterval(() => setActiveTab((prev) => (prev + 1) % tabs.length), 5000);
        return () => clearInterval(timer);
    }, [tabs.length]);

    if (!tabs.length) return null;
    const tab = tabs[activeTab];

    return (
        <section className="py-28 px-6 bg-slate-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-14">
                    {pretitle && <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-4" dangerouslySetInnerHTML={{ __html: pretitle }} />}
                    {title && <h2 className="text-4xl font-black text-slate-900" dangerouslySetInnerHTML={{ __html: title }} />}
                    {subtitle && <p className="text-slate-500 mt-4 text-lg max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: subtitle }} />}
                </div>

                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {tabs.map((t: any, i: number) => (
                        <button key={i} onClick={() => setActiveTab(i)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border transition-all ${activeTab === i ? "bg-[#27954D] text-white border-[#27954D] shadow-lg shadow-green-200/50" : "bg-white text-slate-600 border-slate-200 hover:border-green-300"}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab && (
                    <div className="grid lg:grid-cols-3 gap-8 items-start">
                        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                            <h3 className="text-2xl font-black text-slate-900 mb-4" dangerouslySetInnerHTML={{ __html: tab.title }} />
                            <p className="text-slate-500 leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: tab.desc }} />
                            {tab.tags && (
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {(Array.isArray(tab.tags) ? tab.tags : tab.tags.split(',')).map((tag: string, j: number) => (
                                        <span key={j} className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-100">{tag.trim()}</span>
                                    ))}
                                </div>
                            )}
                            <Link href="/register" className="inline-flex items-center gap-2 bg-[#27954D] text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#1f7a3f] transition-all">
                                Try it Free <ArrowRight size={15} />
                            </Link>
                        </div>
                        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-slate-200 shadow-xl">
                            <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2">
                                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /><div className="w-2.5 h-2.5 rounded-full bg-green-400" /></div>
                                <span className="text-xs text-slate-400 font-medium ml-2">app.grafty.pro</span>
                            </div>
                            <img src={tab.image} alt={tab.title} className="w-full object-cover object-top transition-all duration-300" />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

// 5. SPLIT LIST
export function SplitListV2({ pretitle, title, leftTitle, leftItems = [], pretitleRight, rightTitle, rightItems = [], bottomText }: any) {
    return (
        <section className="py-28 px-6 max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
                <div>
                    {pretitle && <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-4" dangerouslySetInnerHTML={{ __html: pretitle }} />}
                    {title && <h2 className="text-4xl font-black text-slate-900 leading-tight mb-8" dangerouslySetInnerHTML={{ __html: title }} />}
                    <div className="space-y-3 mb-10">
                        {leftItems.map((p: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 text-slate-500 font-medium">
                                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 bg-red-400 rounded-full" /></div>
                                <span dangerouslySetInnerHTML={{ __html: p }} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl border border-green-100 p-10">
                    {pretitleRight && <span className="text-xs font-black uppercase tracking-[0.15em] text-green-600 block mb-6">{pretitleRight}</span>}
                    {rightTitle && <h3 className="text-2xl font-black text-slate-900 mb-6">{rightTitle}</h3>}
                    <div className="grid grid-cols-2 gap-3">
                        {rightItems.map((item: string, i: number) => (
                            <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-white shadow-sm">
                                <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                                <span className="text-slate-700 font-semibold text-sm" dangerouslySetInnerHTML={{ __html: item }} />
                            </div>
                        ))}
                    </div>
                    {bottomText && <p className="text-center text-xs font-black uppercase tracking-widest text-slate-400 mt-8" dangerouslySetInnerHTML={{ __html: bottomText }} />}
                </div>
            </div>
        </section>
    );
}

// 6. GROWTH STEPS
export function GrowthStepsV2({ pretitle, title, steps = [] }: any) {
    if (!steps.length) return null;
    return (
        <section className="py-28 px-6 bg-slate-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    {pretitle && <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-4" dangerouslySetInnerHTML={{ __html: pretitle }} />}
                    {title && <h2 className="text-4xl font-black text-slate-900 leading-tight" dangerouslySetInnerHTML={{ __html: title }} />}
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step: any, i: number) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-lg hover:border-green-100 transition-all group">
                            <div className={`text-5xl font-black ${step.color || 'text-green-500'} opacity-20 group-hover:opacity-40 transition-opacity mb-6`}>{String(i + 1).padStart(2, '0')}</div>
                            <h3 className="text-lg font-black text-slate-900 mb-3" dangerouslySetInnerHTML={{ __html: step.title }} />
                            <p className="text-slate-500 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: step.desc }} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// 7. MULTI CARDS V2
export function MultiCardsV2({ pretitle, title, subtitle, cards = [], styleType }: any) {
    if (!cards.length) return null;
    const isDark = styleType === 'DARK';
    return (
        <section className={`py-28 px-6 ${isDark ? 'bg-[#0F172A]' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    {pretitle && <span className={`text-xs font-black uppercase tracking-[0.15em] block mb-4 ${isDark ? 'text-green-400' : 'text-slate-400'}`} dangerouslySetInnerHTML={{ __html: pretitle }} />}
                    {title && <h2 className={`text-4xl font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`} dangerouslySetInnerHTML={{ __html: title }} />}
                    {subtitle && <p className={`mt-4 text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`} dangerouslySetInnerHTML={{ __html: subtitle }} />}
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-auto-fit gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
                    {cards.map((card: any, i: number) => (
                        <div key={i} className={`${isDark ? 'text-center group' : 'bg-slate-50 rounded-2xl border border-slate-100 p-7 hover:bg-white hover:shadow-lg transition-all group'}`}>
                            {isDark ? (
                                <>
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/10 border border-green-500/30 text-green-400 font-black text-xl flex items-center justify-center mx-auto mb-6 group-hover:border-green-400 transition-colors">
                                        {i + 1}
                                    </div>
                                    <h3 className="text-white font-black text-lg mb-3" dangerouslySetInnerHTML={{ __html: card.title }} />
                                    <p className="text-slate-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: card.desc }} />
                                </>
                            ) : (
                                <>
                                    <div className="mb-4 p-2.5 bg-white rounded-xl inline-flex shadow-sm">{getIcon(card.icon, { size: 22, className: "text-blue-500" })}</div>
                                    <h3 className="font-black text-slate-900 text-base mb-3" dangerouslySetInnerHTML={{ __html: card.title }} />
                                    <p className="text-slate-500 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: card.desc }} />
                                    {card.tags && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {(Array.isArray(card.tags) ? card.tags : card.tags.split(',')).map((tag: string, j: number) => (
                                                <span key={j} className="bg-white text-slate-500 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-slate-200">{tag.trim()}</span>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// 8. FINAL CTA V2
export function FinalCTAV2({ topLabel, title, subtitle, primaryBtnText, primaryBtnLink, secondaryBtnText, secondaryBtnLink, bottomLabel }: any) {
    return (
        <section className="py-28 px-6 bg-[#0F172A] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-blue-900/20 pointer-events-none" />
            <div className="max-w-4xl mx-auto text-center relative z-10">
                {topLabel && (
                    <div className="inline-block bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm text-slate-300 font-medium mb-8" dangerouslySetInnerHTML={{ __html: topLabel }} />
                )}
                {title && <h2 className="text-5xl font-black text-white leading-tight mb-6" dangerouslySetInnerHTML={{ __html: title }} />}
                {subtitle && <p className="text-slate-400 text-xl leading-relaxed mb-12 max-w-xl mx-auto" dangerouslySetInnerHTML={{ __html: subtitle }} />}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {primaryBtnText && (
                        <Link href={primaryBtnLink || "#"} className="flex items-center gap-2 bg-[#27954D] hover:bg-[#1f7a3f] text-white font-bold px-10 py-4 rounded-xl transition-all shadow-xl shadow-green-900/40 text-base">
                            {primaryBtnText} <ArrowRight size={18} />
                        </Link>
                    )}
                    {secondaryBtnText && (
                        <Link href={secondaryBtnLink || "#"} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-10 py-4 rounded-xl border border-white/20 transition-all text-base">
                            {secondaryBtnText}
                        </Link>
                    )}
                </div>
                {bottomLabel && (
                    <p className="text-slate-600 text-xs uppercase tracking-[0.2em] font-bold mt-12" dangerouslySetInnerHTML={{ __html: bottomLabel }} />
                )}
            </div>
        </section>
    );
}

// 9. LOGO WALL V2 — Animated infinite logo strip
export function LogoWallV2({ pretitle, title, subtitle, logos = [], bgColor }: any) {
    const scrollLogos = logos.length > 0 ? [...logos, ...logos, ...logos] : [];
    const bg = bgColor || '#F8FAFC';
    return (
        <section className="py-20 px-6 overflow-hidden" style={{ backgroundColor: bg }}>
            <div className="max-w-7xl mx-auto">
                {(pretitle || title || subtitle) && (
                    <div className="text-center mb-14">
                        {pretitle && <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-3" dangerouslySetInnerHTML={{ __html: pretitle }} />}
                        {title && <h2 className="text-3xl font-black text-slate-900 mb-4" dangerouslySetInnerHTML={{ __html: title }} />}
                        {subtitle && <p className="text-slate-500 max-w-xl mx-auto" dangerouslySetInnerHTML={{ __html: subtitle }} />}
                    </div>
                )}
                {scrollLogos.length > 0 && (
                    <div className="relative">
                        <div className="absolute left-0 top-0 h-full w-24 z-10 pointer-events-none" style={{ background: `linear-gradient(to right, ${bg}, transparent)` }} />
                        <div className="absolute right-0 top-0 h-full w-24 z-10 pointer-events-none" style={{ background: `linear-gradient(to left, ${bg}, transparent)` }} />
                        <div className="flex gap-12 items-center" style={{ animation: 'logoScroll 35s linear infinite', whiteSpace: 'nowrap' }}>
                            {scrollLogos.map((logo: any, i: number) => (
                                <div key={i} className="inline-flex items-center justify-center flex-shrink-0 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300">
                                    {logo.img ? (
                                        <img src={logo.img} alt={logo.name || 'Logo'} className="h-10 w-auto max-w-[120px] object-contain" />
                                    ) : (
                                        <div className="h-10 px-6 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 font-black text-sm">
                                            {logo.name || 'Brand'}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <style>{`@keyframes logoScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }`}</style>
                    </div>
                )}
            </div>
        </section>
    );
}

// 10. INTERACTIVE CARD V2 — Feature cards with gradient icons + CTA
export function InteractiveCardV2({ pretitle, title, subtitle, cards = [], btnText, btnLink, layout }: any) {
    if (!cards.length) return null;
    const isCentered = layout === 'CENTER';
    const gradients = [
        'from-green-400 to-emerald-600',
        'from-blue-400 to-indigo-600',
        'from-violet-400 to-purple-600',
        'from-amber-400 to-orange-600',
        'from-rose-400 to-pink-600',
        'from-cyan-400 to-teal-600',
    ];
    return (
        <section className="py-28 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className={`mb-16 ${isCentered ? 'text-center' : ''}`}>
                    {pretitle && <span className="text-xs font-black uppercase tracking-[0.15em] text-[#27954D] block mb-4" dangerouslySetInnerHTML={{ __html: pretitle }} />}
                    {title && <h2 className="text-4xl font-black text-slate-900 leading-tight mb-4" dangerouslySetInnerHTML={{ __html: title }} />}
                    {subtitle && <p className="text-slate-500 text-lg max-w-2xl" style={isCentered ? { margin: '0 auto' } : {}} dangerouslySetInnerHTML={{ __html: subtitle }} />}
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {cards.map((card: any, i: number) => (
                        <div key={i} className="group bg-white border border-slate-100 rounded-3xl p-8 hover:shadow-2xl hover:shadow-slate-200/80 hover:-translate-y-1 transition-all duration-300">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                                {card.icon ? (
                                    <span className="text-2xl">{card.icon}</span>
                                ) : (
                                    <Sparkles size={24} className="text-white" />
                                )}
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-3" dangerouslySetInnerHTML={{ __html: card.title || 'Feature' }} />
                            <p className="text-slate-500 leading-relaxed text-sm mb-6" dangerouslySetInnerHTML={{ __html: card.desc || '' }} />
                            {card.btnText && (
                                <Link href={card.btnLink || btnLink || '#'} className="inline-flex items-center gap-2 text-[#27954D] font-bold text-sm hover:gap-3 transition-all">
                                    {card.btnText} <ArrowRight size={15} />
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
                {btnText && (
                    <div className="text-center">
                        <Link href={btnLink || '#'} className="inline-flex items-center gap-2 bg-[#27954D] hover:bg-[#1f7a3f] text-white font-bold px-10 py-4 rounded-xl transition-all shadow-xl shadow-green-200/60 text-base">
                            {btnText} <ArrowRight size={18} />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}

// 11. IMAGE CAROUSEL V2 — Auto-advancing fullwidth image carousel
export function ImageCarouselV2({ pretitle, title, subtitle, slides = [], autoplay, interval }: any) {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const ms = (interval && !isNaN(Number(interval))) ? Number(interval) * 1000 : 4000;

    useEffect(() => {
        if (autoplay === false) return;
        if (!slides.length || paused) return;
        const t = setInterval(() => setActive(p => (p + 1) % slides.length), ms);
        return () => clearInterval(t);
    }, [slides.length, paused, ms, autoplay]);

    if (!slides.length) return null;

    return (
        <section className="py-28 px-6 bg-slate-50 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {(pretitle || title || subtitle) && (
                    <div className="text-center mb-16">
                        {pretitle && <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 block mb-4" dangerouslySetInnerHTML={{ __html: pretitle }} />}
                        {title && <h2 className="text-4xl font-black text-slate-900 mb-4" dangerouslySetInnerHTML={{ __html: title }} />}
                        {subtitle && <p className="text-slate-500 text-lg max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: subtitle }} />}
                    </div>
                )}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 border border-slate-200"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}>
                    <div className="relative" style={{ aspectRatio: '16/7' }}>
                        {slides.map((s: any, i: number) => (
                            <div key={i} className={`absolute inset-0 transition-all duration-700 ${i === active ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
                                {s.img ? (
                                    <img src={s.img} alt={s.caption || `Slide ${i + 1}`} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-400 font-bold text-xl">
                                        {s.caption || `Slide ${i + 1}`}
                                    </div>
                                )}
                                {(s.caption || s.subcaption) && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-10">
                                        {s.caption && <h3 className="text-white font-black text-2xl" dangerouslySetInnerHTML={{ __html: s.caption }} />}
                                        {s.subcaption && <p className="text-white/80 mt-2" dangerouslySetInnerHTML={{ __html: s.subcaption }} />}
                                    </div>
                                )}
                            </div>
                        ))}
                        <button onClick={() => setActive(p => (p - 1 + slides.length) % slides.length)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 hover:bg-white rounded-2xl flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10">
                            <ChevronRight size={20} className="rotate-180 text-slate-700" />
                        </button>
                        <button onClick={() => setActive(p => (p + 1) % slides.length)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 hover:bg-white rounded-2xl flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10">
                            <ChevronRight size={20} className="text-slate-700" />
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
                    {slides.map((_: any, i: number) => (
                        <button key={i} onClick={() => setActive(i)}
                            className={`transition-all duration-300 rounded-full ${i === active ? 'w-8 h-3 bg-[#27954D]' : 'w-3 h-3 bg-slate-300 hover:bg-slate-400'}`} />
                    ))}
                </div>
                <p className="text-center text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">{active + 1} / {slides.length}</p>
            </div>
        </section>
    );
}


