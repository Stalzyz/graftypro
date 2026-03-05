
"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingBanner({ config }: { config: any }) {
    if (!config || !config.is_active || !config.text) return null;

    return (
        <div className="bg-slate-900 overflow-hidden relative group">
            <Link
                href={config.link || "#"}
                className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-center gap-3 text-center transition-all hover:bg-white/5"
            >
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-[0.2em] opacity-80">
                        Limited Offer
                    </span>
                </div>
                <p className="text-white text-xs sm:text-sm font-bold tracking-tight">
                    {config.text}
                </p>
                <ArrowRight size={14} className="text-blue-500 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}
