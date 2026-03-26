"use client";
import React from "react";
import Link from "next/link";
import { Logo } from "../ui/Logo";
import { Facebook, Instagram, Linkedin } from "lucide-react";

function PinterestIcon({ size = 24 }: { size?: number }) {
    return (
        <svg fill="currentColor" width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.965 1.406-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.261 7.929-7.261 4.162 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
        </svg>
    );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-[var(--brand-light)] transition-all transform hover:scale-110"
        >
            {icon}
        </a>
    );
}

export default function LandingFooter({ branding }: { branding?: any }) {
    const brandName = branding?.brand_name || "Grafty";
    const isWhitelabel = !!branding;

    return (
        <footer className="pt-24 pb-12 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    <div className="lg:col-span-1">
                        <Logo size={40} brandName={brandName} variant="color" logoUrl={branding?.logo_url} />
                        <p className="mt-8 text-slate-500 font-medium italic leading-relaxed max-w-xs">
                            Goal-driven WhatsApp Business Platform for scalable growth. Built for serious business orchestration.
                        </p>
                    </div>

                    <FooterCol title="Product" links={[
                        { label: "Pricing / Plans", href: "/pricing" },
                        { label: "Flow Orchestration", href: "/how-to-use" },
                        { label: "Broadcast Engine", href: "/#features" },
                        { label: "Industry Solutions", href: "/solutions" }
                    ]} />

                    <FooterCol title="Free Tools" links={[
                        { label: "WhatsApp Link Gen", href: "/whatsapp-link-generator" },
                        { label: "Cost Calculator", href: "/whatsapp-cost-calculator" },
                        { label: "Green Tick Checker", href: "/whatsapp-green-tick-checker" },
                        { label: "Documentation", href: "/docs" }
                    ]} />

                    <FooterCol title="Alternatives" links={[
                        { label: "WATI Alternative", href: "/compare/wati" },
                        { label: "Interakt Alternative", href: "/compare/interakt" },
                        { label: "AiSensy Alternative", href: "/compare/aisensy" }
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
                        { label: "Data Deletion", href: "/data-deletion" }
                    ]} />
                </div>

                <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                    <p className="text-slate-400 text-xs font-black uppercase tracking-[4px]">
                        &copy; {new Date().getFullYear()} {brandName}. All Rights Reserved.
                    </p>
                    {!isWhitelabel && (
                        <div className="flex items-center gap-6">
                            <SocialLink href="https://www.facebook.com/graftypro" icon={<Facebook size={18} />} />
                            <SocialLink href="https://www.instagram.com/graftypro" icon={<Instagram size={18} />} />
                            <SocialLink href="https://www.linkedin.com/company/graftypro" icon={<Linkedin size={18} />} />
                            <SocialLink href="https://in.pinterest.com/graftypro" icon={<PinterestIcon size={18} />} />
                        </div>
                    )}
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
