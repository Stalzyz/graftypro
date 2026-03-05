"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";

export default function PopupBlock({ title, subtitle, primaryBtnText, primaryBtnLink, trigger, delayMs, sectionImage }: any) {
    const [isVisible, setIsVisible] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    useEffect(() => {
        if (hasTriggered) return;

        if (trigger === "TIMER") {
            const timer = setTimeout(() => {
                setIsVisible(true);
                setHasTriggered(true);
            }, delayMs || 5000);
            return () => clearTimeout(timer);
        }

        if (trigger === "SCROLL") {
            const handleScroll = () => {
                const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                if (scrollPercentage >= 50 && !hasTriggered) {
                    setIsVisible(true);
                    setHasTriggered(true);
                }
            };
            window.addEventListener("scroll", handleScroll);
            return () => window.removeEventListener("scroll", handleScroll);
        }

        if (trigger === "EXIT_INTENT") {
            const handleMouseLeave = (e: MouseEvent) => {
                if (e.clientY <= 0 && !hasTriggered) {
                    setIsVisible(true);
                    setHasTriggered(true);
                }
            };
            document.addEventListener("mouseleave", handleMouseLeave);
            return () => document.removeEventListener("mouseleave", handleMouseLeave);
        }
    }, [trigger, delayMs, hasTriggered]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsVisible(false)} />
            <div className="relative bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {sectionImage && (
                    <div className="h-40 bg-slate-100 relative">
                        <img src={sectionImage} className="w-full h-full object-cover" alt="Popup header" />
                    </div>
                )}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 w-8 h-8 bg-black/10 hover:bg-black/20 text-slate-900 rounded-full flex items-center justify-center transition-colors z-10"
                >
                    <X size={16} />
                </button>
                <div className="p-10 text-center">
                    {title && <h2 className="text-3xl font-black text-slate-900 leading-tight mb-4" dangerouslySetInnerHTML={{ __html: title }} />}
                    {subtitle && <p className="text-slate-500 text-base mb-8">{subtitle}</p>}

                    {primaryBtnText && primaryBtnLink && (
                        <Link href={primaryBtnLink} onClick={() => setIsVisible(false)} className="flex items-center justify-center gap-2 w-full bg-[#27954D] hover:bg-[#1f7a3f] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-green-900/20 text-base">
                            {primaryBtnText} <ArrowRight size={18} />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
