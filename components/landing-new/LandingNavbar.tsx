"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "../ui/Logo";
import { Menu, X, ChevronDown, Zap, Link as LinkIcon, Calculator, BadgeCheck } from "lucide-react";

export default function LandingNavbar({ branding }: { branding?: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const [config, setConfig] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const platformName = branding?.brand_name || config?.platform_name || "Grafty";

    useEffect(() => {
        fetch("/api/config/public")
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(() => { });

        // Server-verified auth check
        fetch("/api/auth/trial-status")
            .then(res => setIsLoggedIn(res.ok))
            .catch(() => setIsLoggedIn(false));
    }, []);

    const staticNavLinks = [
        { label: "Product", href: "/#features" },
        { label: "Solutions", href: "/solutions" },
        { label: "Pricing", href: "/pricing" },
        { label: "Partner Program", href: "/affiliate-partner" },
    ];

    const freeTools = [
        { label: "Link Generator", href: "/whatsapp-link-generator", icon: <LinkIcon size={14} /> },
        { label: "Cost Calculator", href: "/whatsapp-cost-calculator", icon: <Calculator size={14} /> },
        { label: "Green Tick Checker", href: "/whatsapp-green-tick-checker", icon: <BadgeCheck size={14} /> },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Logo size={40} brandName={platformName} variant="color" logoUrl={branding?.logo_url} />

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-8">
                    {staticNavLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="g-nav-link text-slate-600 font-semibold hover:text-slate-900 transition-colors text-sm"
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* Free Tools Dropdown */}
                    <div 
                        className="relative group"
                        onMouseEnter={() => setIsToolsOpen(true)}
                        onMouseLeave={() => setIsToolsOpen(false)}
                    >
                        <button className="flex items-center gap-1.5 text-slate-600 font-semibold hover:text-slate-900 transition-colors text-sm py-8">
                            Free Tools <ChevronDown size={14} className={`transition-transform duration-300 ${isToolsOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isToolsOpen && (
                            <div className="absolute top-full left-0 w-64 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="p-3 mb-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Growth Utilities</p>
                                </div>
                                {freeTools.map((tool) => (
                                    <Link
                                        key={tool.label}
                                        href={tool.href}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-all group/item"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover/item:bg-emerald-100 transition-colors">
                                            {tool.icon}
                                        </div>
                                        <span className="text-sm font-bold">{tool.label}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {!isLoggedIn ? (
                        <>
                            <Link
                                href="/login"
                                className="text-slate-500 font-semibold border-l border-slate-200 pl-8 ml-2 text-sm hover:text-slate-900 transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="g-btn-primary py-3 px-6 text-sm bg-[#27954D] text-white rounded-xl font-bold hover:bg-[#1f7a3f] transition-all"
                            >
                                Start Free Trial
                            </Link>
                        </>
                    ) : (
                        <Link
                            href="/dashboard"
                            className="g-btn-primary py-3 px-8 text-sm bg-[#27954D] text-white rounded-xl font-bold hover:bg-[#1f7a3f] transition-all shadow-lg"
                        >
                            Back to Dashboard
                        </Link>
                    )}
                </div>

                {/* Mobile Toggle */}
                <div className="flex items-center gap-4 lg:hidden">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-slate-900 p-2">
                        {isOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="lg:hidden absolute top-20 left-0 right-0 bg-white border-b border-gray-100 p-8 space-y-6 shadow-xl max-h-[80vh] overflow-y-auto">
                    {staticNavLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="block text-lg font-semibold text-slate-900 hover:text-[#27954D] transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Free Tools</p>
                        {freeTools.map((tool) => (
                            <Link
                                key={tool.label}
                                href={tool.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 text-lg font-semibold text-slate-600"
                            >
                                {tool.icon} {tool.label}
                            </Link>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-gray-100 space-y-4">
                        {!isLoggedIn ? (
                            <>
                                <Link href="/login" onClick={() => setIsOpen(false)} className="block text-lg font-semibold text-slate-500">
                                    Login
                                </Link>
                                <Link href="/register" onClick={() => setIsOpen(false)} className="block text-lg font-bold text-[#27954D]">
                                    Start Free Trial
                                </Link>
                            </>
                        ) : (
                            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block text-lg font-bold text-[#27954D]">
                                Dashboard
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
