"use client";
import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

export function WhatsAppWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [whatsappNumber, setWhatsappNumber] = useState('919789359407'); // Default fallback

    useEffect(() => {
        // Fetch global config for WhatsApp number
        fetch('/api/public/config')
            .then(res => res.json())
            .then(res => {
                if (res.success && res.data.fab_whatsapp_number) {
                    setWhatsappNumber(res.data.fab_whatsapp_number);
                }
            })
            .catch(err => console.error("Failed to fetch FAB number", err));

        const handleScroll = () => {
            if (window.scrollY > 300) setScrolled(true);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!scrolled) return null;

    return (
        <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-4 font-sans">
            {/* Chat Bubble / Window */}
            {isOpen && (
                <div className="w-[350px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
                    {/* Header */}
                    <div className="bg-slate-900 p-8 text-white relative">
                        <div className="absolute top-0 right-0 p-4">
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <MessageCircle size={28} />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-slate-900 rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-lg tracking-tight">Grafty Assistant</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Online & Automated</p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-8 space-y-6">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic font-medium text-slate-600 text-sm leading-relaxed">
                            "Hello! I'm Grafty's automation engine. Ready to scale your business with official WhatsApp API? Ask me anything!"
                        </div>
                        
                        <div className="space-y-3">
                            <QuickAction label="Book a Demo" onClick={() => window.open(`https://wa.me/${whatsappNumber}?text=I want to book a demo`, '_blank')} />
                            <QuickAction label="View Pricing" onClick={() => window.location.href = '/pricing'} />
                            <QuickAction label="Partner Program" onClick={() => window.location.href = '/reseller-program'} />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 pt-0">
                        <a 
                            href={`https://wa.me/${whatsappNumber}?text=Hello Grafty! I need help with WhatsApp API.`}
                            target="_blank"
                            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-xl shadow-green-200 active:scale-95"
                        >
                            Start Live Chat <Send size={14} />
                        </a>
                    </div>
                </div>
            )}

            {/* Launcher Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl relative group ${isOpen ? 'bg-slate-900 text-white' : 'bg-[#25D366] text-white hover:scale-110 active:scale-95'}`}
            >
                {isOpen ? <X size={28} /> : (
                    <>
                        <div className="absolute -top-2 -right-2 bg-slate-900 text-white p-1 rounded-lg animate-bounce border-2 border-white">
                            <Sparkles size={12} />
                        </div>
                        <MessageCircle size={32} />
                    </>
                )}
            </button>
        </div>
    );
}

function QuickAction({ label, onClick }: { label: string, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-left group"
        >
            <span className="text-xs font-bold text-slate-700">{label}</span>
            <ArrowRight size={14} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
        </button>
    );
}

function ArrowRight({ size, className }: { size: number, className: string }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}
