
"use client";
import React from 'react';
import {
    ShoppingBag,
    Home,
    GraduationCap,
    HeartPulse,
    Utensils,
    Zap
} from 'lucide-react';

const industries = [
    {
        name: "E-Commerce",
        icon: <ShoppingBag size={32} />,
        desc: "Automate abandoned cart recovery, order updates, and personalized product recommendations."
    },
    {
        name: "Real Estate",
        icon: <Home size={32} />,
        desc: "Send 360 virtual tours, schedule site visits, and filter high-intent leads instantly."
    },
    {
        name: "Education",
        icon: <GraduationCap size={32} />,
        desc: "Automate admissions, send attendance alerts, and handle student queries with AI bots."
    },
    {
        name: "Healthcare",
        icon: <HeartPulse size={32} />,
        desc: "Appointment bookings, follow-up reminders, and digital prescription sharing via WhatsApp."
    },
    {
        name: "Restaurants",
        icon: <Utensils size={32} />,
        desc: "Digital menu browsing, table reservations, and loyalty program management."
    },
    {
        name: "SaaS & Tech",
        icon: <Zap size={32} />,
        desc: "Instant onboarding, feature updates, and technical support directly on WhatsApp."
    }
];

export default function Industries() {
    return (
        <section id="industries" className="py-24 bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <div className="section-tag mx-auto">Who use WAVO?</div>
                    <h2 className="text-4xl md:text-5xl font-black mt-6 mb-6">Designed for <span className="text-gradient">Every Industry</span></h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">WAVO is versatile enough to transform how you interact with customers, regardless of your business sector.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {industries.map((ind, index) => (
                        <div key={index} className="glass-card p-10 group hover:border-wa-green/30 transition-all">
                            <div className="icon-box group-hover:bg-wa-green/20 group-hover:scale-110 transition-all duration-300">
                                {ind.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">{ind.name}</h3>
                            <p className="text-slate-400 leading-relaxed">{ind.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
