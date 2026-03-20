"use client";
import React from 'react';
import { Megaphone, ExternalLink, X } from 'lucide-react';

interface ResellerAnnouncementProps {
    banner?: string;
    link?: string;
}

export const ResellerAnnouncement: React.FC<ResellerAnnouncementProps> = ({ banner, link }) => {
    const [dismissed, setDismissed] = React.useState(false);

    if (!banner || dismissed) return null;

    const Content = () => (
        <div className="flex items-center gap-3 px-6 py-3 cursor-default">
            <div className="bg-white/20 p-2 rounded-xl scale-90">
                <Megaphone size={16} className="text-white" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-wider text-white italic truncate flex-1">
                {banner}
            </p>
            {link && (
                <div className="flex items-center gap-2 ml-4 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors border border-white/10">
                    <span className="text-[9px] font-black uppercase text-white tracking-widest">Details</span>
                    <ExternalLink size={10} className="text-white/70" />
                </div>
            )}
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    setDismissed(true);
                }}
                className="ml-4 p-1 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
            >
                <X size={14} />
            </button>
        </div>
    );

    if (link) {
        return (
            <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-slate-900 border-b border-white/5 hover:bg-black transition-colors relative z-[100]"
            >
                <Content />
            </a>
        );
    }

    return (
        <div className="bg-slate-900 border-b border-white/5 relative z-[100]">
            <Content />
        </div>
    );
};
