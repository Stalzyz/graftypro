"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Sparkles, 
    ArrowRight, 
    CheckCircle2, 
    Database, 
    Mail, 
    Zap, 
    MessageSquare,
    ShieldCheck
} from "lucide-react";

import KnowledgeEngineAnimation from "../KnowledgeEngineAnimation";
import AutopilotEngineAnimation from "../AutopilotEngineAnimation";

// --- Neural Knowledge Showcase ---
export function NeuralKnowledgeShowcase({ 
    pretitle = "Neural Intelligence",
    title = "AI Knowledge Engine", 
    subtitle = "Train your AI on PDFs, URLs, and Docs in seconds.",
    knowledgeSources = ["Company PDFs", "Product URLs", "Support Docs", "Policy Manuals"],
    learningStatusText = "Active Neural Learning...",
    resultHeadline = "100% Accuracy. 0% Delay.",
    resultDesc = "Your AI salesperson knows every detail of your business, answering complex queries instantly on WhatsApp.",
    primaryBtnText = "Train Your AI Now",
    primaryBtnLink = "/register"
}: any) {
    return (
        <section className="py-28 px-6 bg-[#0B0F19] relative overflow-hidden text-white">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-green-500 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-4 block">{pretitle}</span>
                        <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight" dangerouslySetInnerHTML={{ __html: title }} />
                        <p className="text-slate-400 text-lg mb-10 leading-relaxed" dangerouslySetInnerHTML={{ __html: subtitle }} />

                        <div className="space-y-6 mb-10">
                            <div className="grid grid-cols-2 gap-4">
                                {knowledgeSources.map((source: string, i: number) => (
                                    <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
                                        <Database size={18} className="text-blue-400" />
                                        <span className="text-sm font-bold text-slate-200">{source}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-5 py-3 rounded-2xl mb-12">
                            <div className="relative flex items-center justify-center">
                                <span className="absolute w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                                <span className="relative w-2 h-2 bg-blue-500 rounded-full" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-blue-400">{learningStatusText}</span>
                        </div>

                        <div className="mb-10 p-8 bg-gradient-to-br from-blue-900/20 to-transparent border border-blue-500/20 rounded-[2.5rem]">
                            <h3 className="text-xl font-black mb-3 text-white" dangerouslySetInnerHTML={{ __html: resultHeadline }} />
                            <p className="text-slate-400 text-sm leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: resultDesc }} />
                            <Link href={primaryBtnLink || "/register"} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-xl transition-all shadow-xl shadow-blue-900/40">
                                {primaryBtnText} <ArrowRight size={18} />
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
                        <div className="relative bg-[#161B22] border border-white/10 rounded-[3rem] p-4 shadow-2xl">
                            <div className="bg-[#0D1117] rounded-[2.5rem] overflow-hidden border border-white/5 relative">
                                <div className="absolute top-0 w-full z-50 p-4 border-b border-black/5 flex items-center gap-2 bg-transparent">
                                    <div className="flex gap-1.5"><div className="w-2.5 h-2.5 bg-slate-300 rounded-full" /><div className="w-2.5 h-2.5 bg-slate-300 rounded-full" /><div className="w-2.5 h-2.5 bg-slate-300 rounded-full" /></div>
                                </div>
                                <KnowledgeEngineAnimation />
                                
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <motion.div 
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="w-24 h-24 bg-blue-500/20 backdrop-blur-xl border border-blue-500/40 rounded-full flex items-center justify-center"
                                    >
                                        <Sparkles size={40} className="text-blue-400" />
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// --- Omni Hub Synergy Section ---
export function OmniHubSynergy({
    pretitle = "Cross-Channel Authority",
    title = "Omni-channel Synergy",
    subtitle = "WhatsApp for speed. Email for Authority. Master both seamlessly.",
    waFeatureTitle = "Personalized WhatsApp",
    waFeatureDesc = "High engagement messaging with instant AI replies.",
    emailFeatureTitle = "Automated Email Hub",
    emailFeatureDesc = "Professional proposals and follow-ups sent via your own SMTP.",
    synergyLogic = "If WhatsApp not opened within 2 hrs -> Auto-send Email proposal.",
    demoImage = "/screens/email.jpg",
    ctaText = "Explore Omni-channel",
    ctaLink = "/register"
}: any) {
    return (
        <section className="py-28 px-6 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-xs font-black uppercase tracking-[0.2em] text-[#042F94] mb-4 block"
                    >{pretitle}</motion.span>
                    <motion.h2 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-slate-900 mb-6" dangerouslySetInnerHTML={{ __html: title }} />
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: subtitle }} />
                </div>

                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="space-y-12"
                    >
                        <div className="flex gap-6">
                            <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center flex-shrink-0 text-green-600 border border-green-100">
                                <MessageSquare size={30} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-2" dangerouslySetInnerHTML={{ __html: waFeatureTitle }} />
                                <p className="text-slate-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: waFeatureDesc }} />
                            </div>
                        </div>

                        <div className="relative h-20 flex flex-col items-center justify-center">
                            <div className="w-px h-full bg-gradient-to-b from-green-500 via-[#042F94] to-blue-500 opacity-20" />
                            <div className="absolute bg-[#F8FAFC] border border-slate-200 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-[#042F94] shadow-sm">
                                {synergyLogic}
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center flex-shrink-0 text-blue-600 border border-blue-100">
                                <Mail size={30} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-2" dangerouslySetInnerHTML={{ __html: emailFeatureTitle }} />
                                <p className="text-slate-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: emailFeatureDesc }} />
                            </div>
                        </div>

                        <Link href={ctaLink || "/register"} className="inline-flex items-center gap-3 bg-[#042F94] text-white font-black px-10 py-5 rounded-2xl transition-all shadow-xl shadow-[#042F94]/20 hover:scale-[1.02]">
                            {ctaText} <ArrowRight size={20} />
                        </Link>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="relative"
                    >
                        <div className="bg-slate-50 rounded-[3rem] p-4 border border-slate-100 shadow-inner">
                            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100">
                                <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                                    <div className="flex gap-1.5"><div className="w-2.5 h-2.5 bg-slate-300 rounded-full" /><div className="w-2.5 h-2.5 bg-slate-200 rounded-full" /><div className="w-2.5 h-2.5 bg-slate-100 rounded-full" /></div>
                                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Workflow Orchestrator</span>
                                </div>
                                <img src={demoImage} alt="Omni Hub" className="w-full object-cover" />
                            </div>
                        </div>

                        {/* Floating Synergy Badges */}
                        <motion.div 
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute -top-6 -right-6 bg-white border border-slate-100 shadow-xl rounded-3xl p-6 flex items-center gap-4"
                        >
                            <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center text-white"><Zap size={20} /></div>
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</div>
                                <div className="text-sm font-black text-slate-900">400% Higher Conversion</div>
                            </div>
                        </motion.div>

                        <motion.div 
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity }}
                            className="absolute -bottom-6 -left-6 bg-white border border-slate-100 shadow-xl rounded-3xl p-6 flex items-center gap-4"
                        >
                            <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center text-white"><ShieldCheck size={20} /></div>
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reliability</div>
                                <div className="text-sm font-black text-slate-900">0% Lead Leakage</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// --- AI Autopilot Status ---
export function AutopilotDrive({
    pretitle = "Autonomous Sales",
    title = "AI Autopilot Engine",
    subtitle = "Zero manual intervention. Let AI qualify, nurture, and close leads on WhatsApp 24/7.",
    stats = [
        { label: "Uptime", value: "100%", sub: "Always Online" },
        { label: "Latency", value: "< 2s", sub: "Instant Neural Reply" },
        { label: "Accuracy", value: "99.9%", sub: "Hallucination-Free" },
        { label: "Scaling", value: "Unlimited", sub: "Concurrent Chats" }
    ],
    ctaText = "Launch Autopilot",
    ctaLink = "/register"
}: any) {
    return (
        <section className="py-28 px-6 bg-slate-900 relative overflow-hidden text-white">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-[#0F172A] to-green-900/20" />
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <motion.span 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-xs font-black uppercase tracking-[0.2em] text-green-400 mb-4 block"
                    >{pretitle}</motion.span>
                    <motion.h2 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="text-4xl md:text-6xl font-black mb-6" dangerouslySetInnerHTML={{ __html: title }} />
                    <motion.p 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: subtitle }} />
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="relative rounded-[3rem] overflow-hidden border border-white/10 group shadow-2xl shadow-blue-500/10 pointer-events-none"
                    >
                        <AutopilotEngineAnimation />
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                        {stats.map((stat: any, i: number) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/5 border border-white/10 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] hover:bg-white/10 transition-all hover:-translate-y-1"
                            >
                                <div className="text-3xl lg:text-4xl font-black text-green-400 mb-2 break-words" dangerouslySetInnerHTML={{ __html: stat.value }} />
                                <div className="text-sm font-black uppercase tracking-widest text-white mb-2" dangerouslySetInnerHTML={{ __html: stat.label }} />
                                <div className="text-xs text-slate-500 font-medium" dangerouslySetInnerHTML={{ __html: stat.sub }} />
                            </motion.div>
                        ))}

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="col-span-2 mt-4"
                        >
                            <Link href={ctaLink || "/register"} className="block w-full text-center bg-white text-slate-900 font-black px-10 py-5 rounded-2xl hover:bg-green-400 transition-all shadow-xl shadow-green-500/10">
                                {ctaText} — 1,000 Free Credits
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
