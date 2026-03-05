"use client";
import React from "react";
import { Star } from "lucide-react";

export default function Testimonials({ title, subtitle, testimonials = [], sectionImage }: any) {
    if (!testimonials || testimonials.length === 0) return null;

    return (
        <section className="py-28 px-6 bg-slate-50 relative">
            {sectionImage && (
                <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${sectionImage})` }} />
            )}
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    {title && <h2 className="text-4xl font-black text-slate-900 leading-tight mb-4" dangerouslySetInnerHTML={{ __html: title }} />}
                    {subtitle && <p className="text-slate-500 text-lg max-w-2xl mx-auto">{subtitle}</p>}
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((t: any, i: number) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-8 hover:shadow-lg transition-all">
                            <div className="flex items-center gap-1 mb-5">
                                {[...Array(5)].map((_, j) => <Star key={j} size={14} className="fill-amber-400 text-amber-400" />)}
                            </div>
                            <p className="text-slate-700 leading-relaxed mb-6 text-[15px]">"{t.text}"</p>
                            <div className="flex items-center gap-3">
                                {t.avatar ? (
                                    <img src={t.avatar} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt={t.name} />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                        {t.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                                <div>
                                    <p className="font-black text-slate-900 text-sm">{t.name}</p>
                                    <p className="text-slate-400 text-xs">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
