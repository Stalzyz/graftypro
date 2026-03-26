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
    Puzzle,
    Loader2
} from "lucide-react";

export default function MarketingToolkitPage() {
    const [copied, setCopied] = useState(false);
    const [referralCode, setReferralCode] = useState("");
    const [referralUrl, setReferralUrl] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/reseller/stats");
            const data = await res.json();
            if (data.profile?.referral_code) {
                setReferralCode(data.profile.referral_code);
                const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
                setReferralUrl(`${baseUrl}/register?ref=${data.profile.referral_code}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
    );

    return (
        <div className="max-w-7xl animate-fade-in space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shadow-sm border border-blue-100">
                            <Rocket className="text-blue-600" size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">PARTNER <span className="text-blue-500">TOOLKIT</span></h1>
                    </div>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl italic">Fuel your agency growth with high-conversion assets and precision tracking links.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Referral Link Card */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white border border-slate-200 rounded-[3rem] p-10 text-slate-900 relative overflow-hidden shadow-sm group">
                        <div className="absolute top-0 right-0 p-10 opacity-5 text-blue-600 group-hover:scale-110 transition-transform duration-700">
                            <Share2 size={180} strokeWidth={1} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Zap size={14} className="text-blue-600" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Precision Target Link</span>
                            </div>

                            <p className="text-sm text-slate-600 font-bold leading-relaxed mb-8 uppercase tracking-tight italic">
                                Onboard new vendors directly into your network. Lifetime commission mapping active.
                            </p>

                            <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 space-y-4 shadow-sm">
                                <div className="text-[10px] font-bold text-slate-600 break-all bg-white p-4 rounded-xl font-mono border border-slate-200 shadow-inner">
                                    {referralUrl}
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-blue-600 shadow-md active:scale-95"
                                >
                                    {copied ? <CheckCircle size={16} strokeWidth={3} /> : <Copy size={16} strokeWidth={3} />}
                                    {copied ? "IDENTIFIER COPIED" : "COPY PRECISION LINK"}
                                </button>
                            </div>

                            <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-8">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                                    <LinkIcon size={12} strokeWidth={3} /> Partner Referral ID: <span className="text-blue-600">{referralCode}</span>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-[#27954D] animate-pulse" />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 flex items-start gap-5 group transition-colors hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 border border-slate-200 shadow-sm group-hover:border-blue-200 group-hover:scale-110 transition-transform">
                            <Rocket size={24} />
                        </div>
                        <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase tracking-tight italic">
                            "High performance strategy: Embed this link in your YouTube reviews or platform tutorials to capture high-intent leads automatically."
                        </p>
                    </div>
                </div>

                {/* Creative Assets */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight italic flex items-center gap-3">
                                <ImageIcon size={24} className="text-blue-500" />
                                MARKETING <span className="text-blue-400">ASSETS</span>
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Ready-to-Deploy Assets</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {assets.map((asset, idx) => (
                            <div key={idx} className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 group flex flex-col hover:border-blue-200">
                                <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
                                    <img
                                        src={asset.preview}
                                        alt={asset.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.95] group-hover:brightness-100"
                                    />
                                    <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4 backdrop-blur-sm">
                                        <button className="w-14 h-14 bg-slate-900 rounded-2xl text-white hover:bg-[#27954D] transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 shadow-2xl flex items-center justify-center">
                                            <Download size={24} strokeWidth={2.5} />
                                        </button>
                                        <button className="w-14 h-14 bg-slate-900 rounded-2xl text-white hover:bg-blue-600 transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 delay-75 shadow-2xl flex items-center justify-center">
                                            <ExternalLink size={24} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                    <div className="absolute top-6 left-6">
                                        <span className="text-[9px] font-black bg-white/90 backdrop-blur-md text-slate-800 px-4 py-2 rounded-full uppercase tracking-widest shadow-sm border border-slate-200">
                                            {asset.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-lg font-black text-slate-900 tracking-tight italic truncate">{asset.title}</h4>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            HQ ASSET
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
                                            {asset.dimensions}
                                        </span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 bg-slate-200 rounded-full" />)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-8 py-10 bg-slate-50 border-2 border-dashed border-slate-300 rounded-[3rem] text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all flex items-center justify-center gap-3 italic">
                        <Download size={20} />
                        Request Custom Creative Assets
                    </button>
                </div>
            </div>
        </div>
    );
}
