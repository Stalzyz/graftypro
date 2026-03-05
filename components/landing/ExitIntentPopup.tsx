"use client";

import { useState, useEffect } from "react";
import { X, Send, HelpCircle, Laptop, DollarSign, ArrowRight } from "lucide-react";

export default function ExitIntentPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");

    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY < 0 && !localStorage.getItem("exit_popup_shown")) {
                setIsVisible(true);
                localStorage.setItem("exit_popup_shown", "true");
            }
        };

        document.addEventListener("mouseleave", handleMouseLeave);
        return () => document.removeEventListener("mouseleave", handleMouseLeave);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] w-full max-w-xl overflow-hidden shadow-2xl relative">
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <X size={24} />
                </button>

                {step === 1 && (
                    <div className="p-10 text-center">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                            <HelpCircle size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Wait! Before You Go...</h2>
                        <p className="text-slate-500 mb-10 text-lg">What's stopping you from using WhatsApp automation today?</p>

                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: "expensive", label: "Too expensive", icon: <DollarSign size={18} /> },
                                { id: "confused", label: "Not sure how it works", icon: <Laptop size={18} /> },
                                { id: "exploring", label: "Just exploring for now", icon: <Send size={18} /> }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setStep(2)}
                                    className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all text-left font-bold text-slate-700"
                                >
                                    <span className="flex items-center gap-3">{opt.icon} {opt.label}</span>
                                    <ArrowRight size={18} className="text-slate-300" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="p-10 text-center bg-blue-600 text-white">
                        <h2 className="text-3xl font-black mb-4">Let's Make It Easy.</h2>
                        <p className="text-blue-100 mb-8 opacity-90">Grab our <strong>WhatsApp ROI Cheat Sheet</strong> and a special <strong>20% discount</strong> code for your first month.</p>

                        <div className="space-y-4">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 outline-none focus:bg-white/20 transition-all placeholder:text-blue-200"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button
                                onClick={() => setIsVisible(false)}
                                className="w-full bg-white text-blue-600 py-4 rounded-xl font-black text-lg shadow-xl shadow-blue-900/40"
                            >
                                Send Me The Offer
                            </button>
                        </div>
                        <p className="mt-6 text-xs text-blue-200 font-bold uppercase tracking-widest">Limited to first 50 visitors today</p>
                    </div>
                )}
            </div>
        </div>
    );
}
