"use client";

import { useState, useEffect } from "react";
import {
    Download,
    Link as LinkIcon,
    Image as ImageIcon,
    Share2,
    CheckCircle,
    Copy,
    ExternalLink,
    Zap,
    Rocket,
    Puzzle
} from "lucide-react";

export default function MarketingToolkitPage() {
    const [copied, setCopied] = useState(false);
    const referralCode = "PARTNER2024"; // Mock
    const [referralUrl, setReferralUrl] = useState(`https://app.grekam.in/join/${referralCode}`);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setReferralUrl(`${window.location.origin}/join/${referralCode}`);
        }
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const assets = [
        {
            title: "Network Social Banner",
            dimensions: "1200 x 630 px",
            type: "PNG",
            preview: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400"
        },
        {
            title: "WhatsApp Promo Asset",
            dimensions: "1080 x 1080 px",
            type: "JPG",
            preview: "https://images.unsplash.com/photo-1614680376593-902f74cc0d41?auto=format&fit=crop&q=80&w=400"
        },
        {
            title: "Agency Header Graph",
            dimensions: "600 x 200 px",
            type: "PNG",
            preview: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=400"
        },
        {
            title: "Feature Spotlight Card",
            dimensions: "1200 x 630 px",
            type: "PNG",
            preview: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400"
        }
    ];

    return (
        <div className="max-w-7xl animate-fade-in space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl">
                            <Puzzle className="text-white" size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Marketing Arsenal</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-lg max-w-2xl">Fuel your agency growth with high-conversion assets and precision tracking links.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Referral Link Card */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden shadow-3xl group">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Share2 size={180} strokeWidth={1} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                    <Zap size={14} fill="white" className="text-white" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Precision Target Link</span>
                            </div>

                            <p className="text-sm text-slate-400 font-bold leading-relaxed mb-8 uppercase tracking-tight">
                                Onboard new vendors directly into your cluster. Lifetime commission mapping active.
                            </p>

                            <div className="bg-white/5 border border-white/5 rounded-[32px] p-6 space-y-4">
                                <div className="text-[10px] font-black text-slate-500 break-all bg-white/5 p-4 rounded-xl font-mono">
                                    {referralUrl}
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="w-full py-5 bg-white text-slate-900 rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-blue-600 hover:text-white shadow-xl shadow-black/20 active:scale-95"
                                >
                                    {copied ? <CheckCircle size={16} strokeWidth={3} /> : <Copy size={16} strokeWidth={3} />}
                                    {copied ? "IDENTIFIER COPIED" : "COPY LINK"}
                                </button>
                            </div>

                            <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-8">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <LinkIcon size={12} strokeWidth={3} /> Partner ID: <span className="text-white">{referralCode}</span>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-[#27954D] animate-pulse" />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100 flex items-start gap-5 group">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                            <Rocket size={24} />
                        </div>
                        <p className="text-[11px] font-bold text-blue-700 leading-relaxed uppercase tracking-tight">
                            "High performance strategy: Embed this link in your YouTube reviews or platform tutorials to capture high-intent leads automatically."
                        </p>
                    </div>
                </div>

                {/* Creative Assets */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <ImageIcon size={24} className="text-blue-600" />
                                Brand Artillery
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ready-to-Deploy Assets</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {assets.map((asset, idx) => (
                            <div key={idx} className="bg-white rounded-[48px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 group flex flex-col">
                                <div className="aspect-[16/10] relative overflow-hidden bg-slate-50">
                                    <img
                                        src={asset.preview}
                                        alt={asset.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.9] group-hover:brightness-100"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4 backdrop-blur-sm">
                                        <button className="w-14 h-14 bg-white rounded-2xl text-slate-900 hover:bg-[#27954D] hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 shadow-2xl flex items-center justify-center">
                                            <Download size={24} strokeWidth={2.5} />
                                        </button>
                                        <button className="w-14 h-14 bg-white rounded-2xl text-slate-900 hover:bg-blue-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 delay-75 shadow-2xl flex items-center justify-center">
                                            <ExternalLink size={24} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                    <div className="absolute top-6 left-6">
                                        <span className="text-[9px] font-black bg-white/90 backdrop-blur-md text-slate-900 px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">
                                            {asset.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-lg font-black text-slate-900 tracking-tight truncate">{asset.title}</h4>
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                            HQ ASSET
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {asset.dimensions}
                                        </span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 bg-slate-100 rounded-full" />)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-8 py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[48px] text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:bg-slate-100 hover:border-slate-300 transition-all flex items-center justify-center gap-3">
                        <Download size={20} />
                        Request Custom Creative Assets
                    </button>
                </div>
            </div>
        </div>
    );
}
