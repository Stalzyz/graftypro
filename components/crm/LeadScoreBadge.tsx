"use client";

import { Star } from "lucide-react";

interface LeadScoreBadgeProps {
    score?: number;
}

export default function LeadScoreBadge({ score = 0 }: LeadScoreBadgeProps) {
    let colorClass = "text-gray-400 bg-gray-50";
    let label = "Cold";

    if (score >= 80) {
        colorClass = "text-amber-500 bg-amber-50";
        label = "Hot Lead";
    } else if (score >= 40) {
        colorClass = "text-green-500 bg-green-50";
        label = "Warm";
    }

    return (
        <div className={`px-2 py-0.5 rounded-md flex items-center gap-1.5 ${colorClass}`}>
            <Star size={10} fill="currentColor" />
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
            <span className="text-[10px] font-bold">{score}</span>
        </div>
    );
}
