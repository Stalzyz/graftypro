"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface App {
    name: string;
    logo: string;
}

interface IntegrationsProps {
    title?: string;
    subtitle?: string;
    apps?: App[];
    ctaText?: string;
    ctaLink?: string;
}

export default function Integrations({
    title = "Connects with the Apps You Love",
    subtitle = "Full API support for custom CRM orchestration.",
    apps = [
        { name: "Shopify", logo: "https://www.vectorlogo.zone/logos/shopify/shopify-icon.svg" },
        { name: "WooCommerce", logo: "https://www.vectorlogo.zone/logos/woocommerce/woocommerce-icon.svg" },
        { name: "Zoho", logo: "https://www.vectorlogo.zone/logos/zoho/zoho-icon.svg" },
        { name: "Zapier", logo: "https://www.vectorlogo.zone/logos/zapier/zapier-icon.svg" },
        { name: "Make", logo: "https://www.vectorlogo.zone/logos/make/make-icon.svg" },
        { name: "n8n", logo: "https://www.vectorlogo.zone/logos/n8n/n8n-icon.svg" },
        { name: "Razorpay", logo: "https://www.vectorlogo.zone/logos/razorpay/razorpay-icon.svg" },
        { name: "Google", logo: "https://www.vectorlogo.zone/logos/google/google-icon.svg" }
    ],
    ctaText = "Explore Integrations",
    ctaLink = "/solutions"
}: IntegrationsProps) {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-xs font-black uppercase tracking-[4px] text-slate-400 mb-10">{title}</p>
                <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-20 mb-16 px-4">
                    {apps.map((app) => (
                        <div key={app.name} className="flex flex-col items-center gap-4 hover:scale-110 transition-transform duration-300">
                            <img src={app.logo} alt={app.name} className="h-10 w-auto object-contain" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{app.name}</span>
                        </div>
                    ))}
                </div>
                <div className="animate-up">
                    <p className="g-p text-lg mb-8 italic">{subtitle}</p>
                    <Link href={ctaLink} className="text-[var(--brand-light)] font-black uppercase tracking-[4px] text-xs flex items-center justify-center gap-2 group transition-all">
                        {ctaText} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
