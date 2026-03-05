
"use client";
import React from 'react';
import {
    Cpu,
    Link as LinkIcon,
    Webhook,
    Puzzle,
    CloudCog
} from 'lucide-react';

const ecosystems = [
    { name: "Meta", category: "Official API Partner", icon: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" },
    { name: "Shopify", category: "E-Commerce", icon: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Shopify_Logo.png" },
    { name: "WooCommerce", category: "E-Commerce", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/WooCommerce_Logo.svg/1200px-WooCommerce_Logo.svg.png" },
    { name: "Salesforce", category: "CRM", icon: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg" },
    { name: "Zoho", category: "CRM", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Zoho_logo.svg/1024px-Zoho_logo.svg.png" },
    { name: "Make", category: "Automation", icon: "https://www.make.com/favicon.ico" },
    { name: "n8n", category: "Automation", icon: "https://n8n.io/favicon.ico" },
    { name: "Zapier", category: "Automation", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Zapier_logo.svg/1200px-Zapier_logo.svg.png" }
];

export default function Integrations() {
    return (
        <section className="py-24 bg-white border-y border-slate-100 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-20">
                    <div className="lg:w-1/3 text-slate-900">
                        <div className="section-tag mb-6 border-slate-200 text-slate-500">Omnichannel Ecosystem</div>
                        <h2 className="text-4xl font-black mb-8 leading-tight">
                            Connects with the <br />
                            <span className="text-[#27954D]">Apps You Love.</span>
                        </h2>
                        <p className="text-slate-500 text-lg mb-10 leading-relaxed font-medium">
                            Grafty bridges the gap between your existing software and WhatsApp. Sync data, automate notifications, and build cross-platform workflows in minutes.
                        </p>
                        <div className="flex gap-6">
                            <div className="flex flex-col gap-2">
                                <div className="text-2xl font-black text-slate-900">50+</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Integrations</div>
                            </div>
                            <div className="w-px h-12 bg-slate-100" />
                            <div className="flex flex-col gap-2">
                                <div className="text-2xl font-black text-slate-900">100%</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Sync</div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-2/3 grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {ecosystems.map((app, i) => (
                            <div key={i} className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:border-[#27954D]/30 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100">
                                <div className="w-full h-12 mb-6 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                    <img src={app.icon} alt={app.name} className="max-h-full max-w-full object-contain" />
                                </div>
                                <div className="text-slate-900 font-bold text-sm mb-1">{app.name}</div>
                                <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{app.category}</div>
                            </div>
                        ))}

                        {/* Custom Webhook & API Cards */}
                        <div className="bg-[#27954D]/5 border border-[#27954D]/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:bg-[#27954D]/10 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-[#27954D]/10 flex items-center justify-center text-[#27954D] mb-4">
                                <Webhook size={24} />
                            </div>
                            <div className="text-[#27954D] font-bold text-sm mb-1">Webhooks</div>
                            <div className="text-[9px] font-black uppercase text-emerald-500/50 tracking-widest">Connect Anything</div>
                        </div>

                        <div className="bg-blue-600/5 border border-blue-600/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:bg-blue-600/10 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 mb-4">
                                <Cpu size={24} />
                            </div>
                            <div className="text-blue-500 font-bold text-sm mb-1">Developer API</div>
                            <div className="text-[9px] font-black uppercase text-blue-500/50 tracking-widest">Scalable Docs</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
