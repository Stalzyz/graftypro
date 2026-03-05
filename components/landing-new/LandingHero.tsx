"use client";
import React from "react";
import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";

interface LandingHeroProps {
    title?: string;
    subtitle?: string;
    primaryBtnText?: string;
    primaryBtnLink?: string;
    secondaryBtnText?: string;
    secondaryBtnLink?: string;
    heroImage?: string;
    overlayImage?: string;
}

export default function LandingHero({
    title = "Scale Your Business on WhatsApp.",
    subtitle = "Grafty is a goal-driven WhatsApp Business Platform that helps you generate leads, collect payments, and scale revenue — without manual effort.",
    primaryBtnText = "Start Free Trial",
    primaryBtnLink = "/register",
    secondaryBtnText = "View Solutions",
    secondaryBtnLink = "/solutions",
    heroImage = "https://images.klipfolio.com/website/public/00be0b43-a0d3-4516-9b39-64002f99d71e/SaaS%20Dashboard.png",
    overlayImage = "https://cdn.botpenguin.com/assets/website/images/whatsapp-automation/converse-one.png"
}: LandingHeroProps) {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            <div className="hero-gradient" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    <div className="lg:w-1/2 animate-up">
                        <h1 className="g-h1 mb-8" dangerouslySetInnerHTML={{ __html: title }} />
                        <p className="g-p text-xl mb-12 max-w-xl italic font-medium">
                            {subtitle}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href={primaryBtnLink} className="g-btn-primary px-10 py-5 text-lg">
                                {primaryBtnText}
                            </Link>
                            <Link href={secondaryBtnLink} className="g-btn-outline px-10 py-5 text-lg flex items-center gap-3">
                                <Play size={20} fill="var(--brand-light)" /> {secondaryBtnText}
                            </Link>
                        </div>

                        <div className="mt-12 flex items-center gap-8 grayscale opacity-50">
                            <span className="text-[10px] font-black uppercase tracking-[4px]">Meta Business Partner</span>
                            <span className="text-[10px] font-black uppercase tracking-[4px]">GDPR Compliant</span>
                        </div>
                    </div>

                    <div className="lg:w-1/2 relative animate-up" style={{ animationDelay: '0.2s' }}>
                        <div className="relative z-10 g-card !p-2 bg-slate-100/30 backdrop-blur-md border-white/20 shadow-2xl overflow-hidden">
                            <img
                                src={heroImage}
                                alt="Grafty Dashboard"
                                className="rounded-[10px] w-full"
                            />
                        </div>

                        {overlayImage && (
                            <div className="absolute -bottom-10 -left-10 w-48 hidden lg:block z-20">
                                <div className="bg-white p-3 rounded-3xl shadow-2xl border border-gray-100">
                                    <img
                                        src={overlayImage}
                                        alt="WhatsApp Mobile Preview"
                                        className="rounded-2xl"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#228557] rounded-full blur-[100px] -z-10 opacity-10" />
                    </div>
                </div>
            </div>
        </section>
    );
}
