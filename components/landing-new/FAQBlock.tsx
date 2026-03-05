"use client";
import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function FAQBlock({ title, subtitle, faqs = [], sectionImage }: any) {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    if (!faqs || faqs.length === 0) return null;

    return (
        <section className="py-28 px-6 bg-white relative">
            {sectionImage && (
                <div className="absolute inset-0 bg-cover bg-center opacity-5" style={{ backgroundImage: `url(${sectionImage})` }} />
            )}
            <div className="max-w-3xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    {title && <h2 className="text-4xl font-black text-slate-900 leading-tight mb-4" dangerouslySetInnerHTML={{ __html: title }} />}
                    {subtitle && <p className="text-slate-500 text-lg max-w-2xl mx-auto">{subtitle}</p>}
                </div>
                <div className="space-y-3">
                    {faqs.map((faq: any, i: number) => (
                        <div key={i} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden hover:border-slate-200 transition-colors shadow-sm">
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full p-6 text-left flex justify-between items-center hover:bg-white transition-colors"
                            >
                                <span className="font-bold text-slate-900 pr-8 text-base">{faq.question}</span>
                                {openFaq === i
                                    ? <Minus size={18} className="text-green-500 flex-shrink-0" />
                                    : <Plus size={18} className="text-slate-400 flex-shrink-0" />
                                }
                            </button>
                            {openFaq === i && (
                                <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4 bg-white">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
