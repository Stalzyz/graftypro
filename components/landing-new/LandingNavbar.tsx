"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "../ui/Logo";
import { Menu, X } from "lucide-react";

export default function LandingNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<any>(null);
    const platformName = config?.platform_name || "Grafty";

    useEffect(() => {
        fetch("/api/config/public")
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(() => { });
    }, []);

    const staticNavLinks = [
        { label: "Product", href: "/#features" },
        { label: "Solutions", href: "/solutions" },
        { label: "Pricing", href: "/pricing" },
        { label: "Partner Program", href: "/affiliate-partner" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Logo size={40} brandName={platformName} variant="color" />

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
                <div className="lg:hidden absolute top-20 left-0 right-0 bg-white border-b border-gray-100 p-8 space-y-6 shadow-xl">
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

                    <div className="pt-6 border-t border-gray-100 space-y-4">
                        <Link href="/login" onClick={() => setIsOpen(false)} className="block text-lg font-semibold text-slate-500">
                            Login
                        </Link>
                        <Link href="/register" onClick={() => setIsOpen(false)} className="block text-lg font-bold text-[#27954D]">
                            Start Free Trial
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
