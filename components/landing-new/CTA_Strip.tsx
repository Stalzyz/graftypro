"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA_Strip({ title, subtitle, primaryBtnText, primaryBtnLink, sectionImage }: any) {
    return (
        <section className="py-28 px-6 bg-[#0F172A] relative overflow-hidden">
            {sectionImage ? (
                <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${sectionImage})` }} />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-blue-900/20 pointer-events-none" />
            )}
            <div className="max-w-4xl mx-auto text-center relative z-10">
                {title && <h2 className="text-5xl font-black text-white leading-tight mb-6" dangerouslySetInnerHTML={{ __html: title }} />}
                {subtitle && <p className="text-slate-400 text-xl leading-relaxed mb-12 max-w-xl mx-auto">{subtitle}</p>}

                {primaryBtnText && primaryBtnLink && (
                    <div className="flex justify-center">
                        <Link href={primaryBtnLink} className="flex items-center gap-2 bg-[#27954D] hover:bg-[#1f7a3f] text-white font-bold px-10 py-4 rounded-xl transition-all shadow-xl shadow-green-900/40 text-base">
                            {primaryBtnText} <ArrowRight size={18} />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
