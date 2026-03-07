
"use client";

import React from 'react';
import Link from 'next/link';
import {
    Play,
    CheckCircle,
    ChevronRight,
    BookOpen,
    Settings,
    Zap,
    Smartphone,
    Key,
    Workflow,
    ArrowLeft,
    GraduationCap,
    HelpCircle
} from 'lucide-react';
import { Logo } from "../../components/ui/Logo";

const categories = [
    {
        title: "Platform Onboarding",
        icon: <Settings className="text-blue-500" />,
        lessons: [
            { name: "Setting up Meta Business Account", href: "#" },
            { name: "Creating your first WhatsApp App", href: "#" },
            { name: "Generating Permanent Access Tokens", href: "#" },
            { name: "Number Verification Protocol", href: "#" }
        ]
    },
    {
        title: "Automation Engine",
        icon: <Workflow className="text-purple-500" />,
        lessons: [
            { name: "Visual Flow Builder Basics", href: "/how-to-use/flow-builder" },
            { name: "Advanced Conditional Branching", href: "#" },
            { name: "Webhook & API Integrations", href: "#" },
            { name: "Template Approval Workflow", href: "#" }
        ]
    },
    {
        title: "Growth & Marketing",
        icon: <Zap className="text-amber-500" />,
        lessons: [
            { name: "Official Broadcast Campaigns", href: "#" },
            { name: "Drip Sequence Architecture", href: "#" },
            { name: "Abandoned Cart Recovery", href: "#" },
            { name: "Storefront Catalog Management", href: "#" }
        ]
    }
];

export default function HowToUse() {
    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            {/* Header */}
            <header className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <Link href="/">
                        <Logo size={32} variant="color" />
                    </Link>
                    <div className="h-6 w-px bg-slate-100" />
                    <div className="flex items-center gap-2">
                        <GraduationCap size={20} className="text-[#27954D]" />
                        <span className="text-sm font-black text-slate-900 tracking-tight uppercase">Academy</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">Sign In</Link>
                    <Link href="/" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all">Back to Home</Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-20">
                <div className="flex flex-col lg:flex-row gap-20">
                    {/* Left Sidebar Info */}
                    <div className="lg:w-1/3 space-y-10">
                        <div className="space-y-6">
                            <h1 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                                Build Your <span className="text-[#27954D]">WhatsApp Empire.</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed">
                                Complete documentation and video masterclass on scaling your business with official WhatsApp APIs.
                            </p>
                        </div>

                        <div className="p-8 bg-slate-900 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                                <HelpCircle size={100} />
                            </div>
                            <h3 className="text-xl font-black mb-4 relative z-10">Need Expert Help?</h3>
                            <p className="text-slate-400 text-sm mb-8 relative z-10">Our deployment engineering team can setup your complete Meta structure for you.</p>
                            <Link href="https://wa.me/919789359407" target="_blank" className="relative z-10 block w-full py-4 text-center bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                                Chat with Expert
                            </Link>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="lg:w-2/3 space-y-16">
                        {/* Featured Video */}
                        <div className="aspect-video bg-slate-100 rounded-[48px] border-4 border-slate-50 relative flex items-center justify-center overflow-hidden group cursor-pointer shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#27954D]/20 to-blue-600/20 opacity-40" />
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-500">
                                <Play fill="#0F172A" size={32} />
                            </div>
                            <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                                <div className="text-white">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">Featured Masterclass</div>
                                    <h2 className="text-2xl font-black">Meta Cloud API: Zero to Live in 15 Minutes</h2>
                                </div>
                                <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl text-white font-mono text-xs">
                                    14:52
                                </div>
                            </div>
                        </div>

                        {/* Category Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {categories.map((cat, i) => (
                                <div key={i} className="bg-white p-10 rounded-[40px] border border-slate-100 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8">
                                        {cat.icon}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-6">{cat.title}</h3>
                                    <div className="space-y-4">
                                        {cat.lessons.map((lesson, idx) => (
                                            <Link href={lesson.href} key={idx} className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors group/lesson">
                                                <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover/lesson:bg-[#27954D] group-hover/lesson:text-white transition-all">
                                                    <ChevronRight size={12} strokeWidth={3} />
                                                </div>
                                                <span className="text-sm font-bold">{lesson.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-20 px-8 border-t border-slate-100 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <Logo size={40} variant="color" />
                    <div className="flex gap-10">
                        <Link href="/privacy" className="text-xs font-bold text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest">Privacy Policy</Link>
                        <Link href="/terms" className="text-xs font-bold text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest">Terms of Service</Link>
                        <Link href="https://wa.me/919789359407" className="text-xs font-black text-[#27954D] uppercase tracking-widest">Support WhatsApp</Link>
                    </div>
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        © 2026 Grafty ECOSYSTEM. ALL RIGHTS RESERVED.
                    </div>
                </div>
            </footer>
        </div>
    );
}
