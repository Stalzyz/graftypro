
"use client";
import React from 'react';
import {
    Play,
    Settings,
    ShieldCheck,
    Smartphone,
    Key,
    Workflow,
    ArrowRight
} from 'lucide-react';

const tutorials = [
    {
        title: "Create WhatsApp Business Manager",
        desc: "Step-by-step guide to setting up your business account on Meta.",
        icon: <Settings size={24} />,
        time: "5:20",
        steps: ["Navigate to business.facebook.com", "Create Business Account", "Setup WhatsApp Manager"]
    },
    {
        title: "Create Meta Developer App",
        desc: "Learn how to create a Meta App and choose the right permissions.",
        icon: <Workflow size={24} />,
        time: "4:45",
        steps: ["Go to developers.facebook.com", "Create My Apps", "Select Business Type", "Add WhatsApp Product"]
    },
    {
        title: "Get Access Tokens",
        desc: "How to generate temporary and permanent system user tokens.",
        icon: <Key size={24} />,
        time: "3:30",
        steps: ["Generate System User", "Assign WhatsApp Assets", "Generate Token", "Copy to Grafty Dashboard"]
    },
    {
        title: "Mobile Number Verification",
        desc: "Validating your professional number for Meta Cloud API.",
        icon: <Smartphone size={24} />,
        time: "6:10",
        steps: ["Enter Phone Number", "Select Verification Mode", "Enter 6-digit OTP", "Profile Approval"]
    }
];

export default function SetupGuide() {
    return (
        <section className="py-24 bg-slate-900 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-wa-green/20 to-transparent" />

            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20 px-2 lg:px-0">
                    <div className="section-tag mb-6">Expert Academy</div>
                    <h2 className="text-4xl md:text-5xl font-black mb-6">Master the <span className="text-gradient">Green Tick</span> Setup.</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">We've simplified the Meta Cloud API integration. Follow our guided video tutorials and get your business online in under 15 minutes.</p>

                    <button className="inline-flex items-center gap-2 px-10 py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl">
                        Watch All Tutorials <Play fill="black" size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {tutorials.map((video, i) => (
                        <div key={i} className="glass-card overflow-hidden group hover:border-wa-green/40 transition-all bg-black/40">
                            <div className="flex flex-col lg:flex-row">
                                <div className="lg:w-1/2 aspect-video bg-slate-800 relative flex items-center justify-center overflow-hidden">
                                    {/* Mock Thumbnail with Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-wa-green/20 to-blue-600/20 opacity-40 group-hover:opacity-60 transition-opacity" />
                                    <div className="relative z-10 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-110 transition-all cursor-pointer">
                                        <Play fill="white" size={24} />
                                    </div>
                                    <div className="absolute bottom-4 right-4 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white backdrop-blur-md">
                                        {video.time}
                                    </div>
                                    <ShieldCheck className="absolute top-4 left-4 text-wa-green opacity-20" size={32} />
                                </div>
                                <div className="lg:w-1/2 p-8">
                                    <div className="w-10 h-10 rounded-xl bg-wa-green/10 flex items-center justify-center text-wa-green mb-6 border border-wa-green/20">
                                        {video.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">{video.title}</h3>
                                    <p className="text-slate-500 text-xs mb-6 leading-relaxed">{video.desc}</p>

                                    <div className="space-y-3">
                                        {video.steps.map((step, idx) => (
                                            <div key={idx} className="flex gap-2 items-center text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60">
                                                <ArrowRight size={10} className="text-wa-green" /> {step}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
