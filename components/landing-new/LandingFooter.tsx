"use client";
import React from "react";
import Link from "next/link";
import { Logo } from "../ui/Logo";

export default function LandingFooter() {
    return (
        <footer className="pt-24 pb-12 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    <div className="lg:col-span-1">
                        <Logo size={40} brandName="Grafty" variant="color" />
                        <p className="mt-8 text-slate-500 font-medium italic leading-relaxed max-w-xs">
                            Goal-driven WhatsApp Business Platform for scalable growth. Built for serious business orchestration.
                        </p>
                    </div>

                    <FooterCol title="Product" links={[
                        { label: "Pricing / Plans", href: "/#pricing" },
                        { label: "Flow Orchestration", href: "https://grafty.pro/how-to-use/flow-builder" },
                        { label: "Broadcast Engine", href: "/#features" },
                        { label: "Vertical Solutions", href: "/solutions" }
                    ]} />

                    <FooterCol title="Ecosystem" links={[
                        { label: "Affiliate Partner", href: "/affiliate-partner" },
                        { label: "Platform Partner", href: "/platform-partner" },
                        { label: "Technical Academy", href: "/academy" },
                        { label: "Apply for Access", href: "/register" }
                    ]} />

                    <FooterCol title="Governance" links={[
                        { label: "Terms of Access", href: "/terms" },
                        { label: "Privacy Protocol", href: "/privacy" },
                        { label: "Data Deletion", href: "/data-deletion" },
                        { label: "Refund Policy", href: "/terms" }
                    ]} />
                </div>

                <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                    <p className="text-slate-400 text-xs font-black uppercase tracking-[4px]">
                        &copy; {new Date().getFullYear()} Grafty Pro. Operational Integrity Guaranteed.
                    </p>
                    <div className="flex items-center gap-8">
                        {/* Logos removed as per request */}
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
    return (
        <div>
            <h4 className="text-slate-900 font-black uppercase tracking-[4px] text-xs mb-8 italic">{title}</h4>
            <ul className="space-y-4">
                {links.map((link, i) => (
                    <li key={i}>
                        <Link href={link.href} className="text-slate-500 hover:text-[var(--brand-light)] font-bold text-sm transition-colors italic group flex items-center gap-2">
                            <div className="w-0 h-0.5 bg-[var(--brand-light)] group-hover:w-4 transition-all" /> {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
