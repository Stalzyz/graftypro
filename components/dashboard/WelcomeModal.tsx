"use client";

import { useState, useEffect } from "react";
import {
    X,
    Gift,
    Zap,
    Target,
    Trophy,
    Users,
    ArrowRight,
    CheckCircle2,
    Loader2
} from "lucide-react";

export default function WelcomeModal() {
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    useEffect(() => {
        // Check if user has already seen the modal in this session (or fetch from DB)
        const checkOffer = async () => {
            const seen = localStorage.getItem("welcome_modal_seen");
            if (!seen) {
                // To be extra sure, we could fetch from /api/user/status
                setIsVisible(true);
            }
        };
        checkOffer();
    }, []);

    const handleClaim = async (offer: string) => {
        setLoading(true);
        try {
            await fetch("/api/auth/claim-offer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ offer })
            });
            localStorage.setItem("welcome_modal_seen", "true");
            setIsVisible(false);
        } catch (error) {
            setIsVisible(false);
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in zoom-in duration-300">
            <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600"></div>

                <div className="p-12">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-amber-100">
                                <Trophy size={12} /> Personalized Welcome
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Let's Help You Make <br /> Money <span className="text-blue-600">Faster</span>.</h2>
                        </div>
                        <button onClick={() => setIsVisible(false)} className="text-slate-300 hover:text-slate-500 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <p className="text-slate-500 text-lg mb-10 leading-relaxed">
                        Every login is an opportunity. Pick your **"Irresistible Offer"** to kickstart your growth today. Choose one:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { id: "credits", label: "Free 500 Credits", desc: "Launch your first campaign instantly.", icon: <Zap size={20} />, color: "blue" },
                            { id: "template", label: "Recovery Flow Template", desc: "Pre-built abandoned cart automation.", icon: <Target size={20} />, color: "purple" },
                            { id: "call", label: "15-Min Strategy Call", desc: "Success roadmap with our expert.", icon: <Users size={20} />, color: "green" },
                            { id: "reseller", label: "Reseller Commission+", desc: "Unlock 5% extra recursive margin.", icon: <TrendingUp size={20} />, color: "amber" }
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => handleClaim(opt.id)}
                                disabled={loading}
                                className="group p-6 rounded-3xl border border-slate-100 bg-slate-50 text-left hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all relative overflow-hidden"
                            >
                                <div className={`w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    {opt.icon}
                                </div>
                                <h4 className="font-bold text-slate-900 mb-1">{opt.label}</h4>
                                <p className="text-xs text-slate-500 font-medium">{opt.desc}</p>
                                <ArrowRight size={16} className="absolute bottom-6 right-6 text-slate-200 group-hover:text-blue-500 transition-colors" />
                            </button>
                        ))}
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                <Gift size={20} className="text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bonus Offer</p>
                                <p className="text-sm font-bold text-slate-700">Upgrade in 48h → Get 20% Extra Credits</p>
                            </div>
                        </div>
                        {loading && <Loader2 size={24} className="animate-spin text-blue-600" />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TrendingUp(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    );
}
