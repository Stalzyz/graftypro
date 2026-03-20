"use client";
import React from "react";
import "../landing/new-grafty.css";
import LandingNavbar from "../../components/landing-new/LandingNavbar";
import LandingFooter from "../../components/landing-new/LandingFooter";
import { ACADEMY_ARTICLES, ACADEMY_CATEGORIES } from "./academy-data";
import { BookOpen, ArrowRight, Search, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function AcademyPage() {
    return (
        <main className="g-body">
            <LandingNavbar />

            {/* Hero */}
            <section className="pt-40 pb-20 lg:pt-56 lg:pb-32 section-white overflow-hidden relative">
                <div className="hero-gradient" />
                <div className="max-w-7xl mx-auto px-6 relative z-10 animate-up">
                    <div className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-[4px] text-xs mb-8">
                        <BookOpen size={16} /> Technical Directives & Intelligence v3.0
                    </div>
                    <h1 className="g-h1 mb-8 max-w-5xl">
                        The Master Guide to <br />
                        <span className="text-gradient">WhatsApp Infrastructure.</span>
                    </h1>
                    <p className="g-p text-xl mb-12 max-w-3xl">
                        A comprehensive, nuclear-level technical manual covering everything from Meta Business verification to advanced flow logic and industry-specific ROI strategies.
                    </p>
                    
                    <div className="relative max-w-2xl mt-12 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search guides, technical specs, or industry strategies..."
                            className="w-full pl-16 pr-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] font-bold text-lg focus:ring-8 focus:ring-emerald-50 outline-none transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* Category Grid */}
            <section className="section-gray">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {ACADEMY_CATEGORIES.map((cat, i) => {
                            const Icon = cat.icon;
                            return (
                                <div key={i} className="g-card !p-10 border-none shadow-xl hover:shadow-2xl transition-all group">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                        <Icon size={20} />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 italic">{cat.name}</h3>
                                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{cat.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Article Listing */}
            <section className="section-white pb-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-20">
                        <h2 className="text-4xl font-black italic tracking-tighter">Latest Publications.</h2>
                        <div className="h-px flex-1 bg-slate-100 mx-10 hidden lg:block" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {Object.values(ACADEMY_ARTICLES).map((article: any) => {
                            const Icon = article.icon;
                            return (
                                <Link 
                                    key={article.slug}
                                    href={`/academy/${article.slug}`}
                                    className="flex flex-col md:flex-row gap-8 g-card !p-8 border-none group hover:scale-[1.01] transition-all bg-white shadow-lg overflow-hidden relative"
                                >
                                    <div className="absolute top-0 right-0 p-4 text-slate-50 font-black text-4xl italic transform translate-x-1/2 -translate-y-1/2 uppercase tracking-tighter opacity-20 select-none">{article.category.split(' ')[0]}</div>
                                    
                                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                        <Icon size={32} />
                                    </div>
                                    
                                    <div className="space-y-4 relative z-10">
                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-300">
                                            <span className="text-emerald-500">{article.category}</span> • <Clock size={12} /> 6 MIN READ
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight group-hover:text-emerald-950 transition-colors leading-tight">
                                            {article.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed italic">{article.description}</p>
                                        <div className="pt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600">
                                            Read Masterclass <ChevronRight size={14} className="group-hover:translate-x-2 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
