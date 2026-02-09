
"use client";

import { useState } from "react";
import { ShieldCheck, Globe, Paintbrush, Fingerprint, ExternalLink, Zap, Users, ArrowUpRight } from "lucide-react";

export default function WhiteLabelHub() {
    return (
        <div className="max-w-7xl space-y-12 pb-20 font-sans">
            <header className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <ShieldCheck className="text-white" size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Identity Nexus</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Enterprise White-labeling, Custom Domains, and Branding Provisioning.</p>
                </div>

                <div className="flex gap-4">
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95">
                        <Fingerprint size={14} />
                        Provision Elite Client
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <FeatureCard
                    title="Custom Domain Engine"
                    description="CNAME mapping and SSL automation for elite resellers."
                    icon={<Globe />}
                    value="14 Active"
                    link="Manage DNS"
                />
                <FeatureCard
                    title="Design Profile Sync"
                    description="Automated logo and theme inheritance for child-tenant portals."
                    icon={<Paintbrush />}
                    value="Synchronized"
                    link="Theme Rules"
                />
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Elite Deployment Registry</h2>
                    <span className="px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase">Tier 1 Partners</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Identity</th>
                                <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Gateway</th>
                                <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal Health</th>
                                <th className="text-right px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <WhiteLabelRow name="Atlas Agency" domain="app.atlasconnect.io" status="Optimal" />
                            <WhiteLabelRow name="Vortex Sol" domain="panel.vortexmedia.in" status="Optimal" />
                            <WhiteLabelRow name="Zenith Group" domain="zenithwa.com" status="Propagating" />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ title, description, icon, value, link }: any) {
    return (
        <div className="bg-white rounded-[40px] border border-slate-100 p-10 space-y-8 hover:shadow-2xl transition-all duration-500 group">
            <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Status</span>
                    <span className="text-sm font-black text-slate-900">{value}</span>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{description}</p>
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 hover:underline pt-4">
                    {link} <ArrowUpRight size={14} />
                </button>
            </div>
        </div>
    );
}

function WhiteLabelRow({ name, domain, status }: any) {
    return (
        <tr className="hover:bg-slate-50/30 transition-colors group">
            <td className="px-10 py-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black">
                        {name[0]}
                    </div>
                    <div>
                        <div className="text-sm font-black text-slate-900">{name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Elite License v4</div>
                    </div>
                </div>
            </td>
            <td className="px-10 py-8">
                <div className="flex items-center gap-2">
                    <Globe size={14} className="text-blue-500" />
                    <span className="text-xs font-bold text-slate-700">{domain}</span>
                </div>
            </td>
            <td className="px-10 py-8">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'Optimal' ? 'bg-[#27954D] shadow-[0_0_8px_rgba(39,149,77,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{status}</span>
                </div>
            </td>
            <td className="px-10 py-8 text-right">
                <button className="px-6 py-2.5 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                    Configure Identity
                </button>
            </td>
        </tr>
    );
}
