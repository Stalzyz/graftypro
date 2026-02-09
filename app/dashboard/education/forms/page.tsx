"use client";

import { useState } from "react";
import {
    Plus,
    Trash2,
    Link as LinkIcon,
    QrCode,
    FileText,
    ChevronRight,
    Layout,
    MessageSquare,
    CheckCircle2
} from "lucide-react";

export default function EduFormBuilder() {
    const [forms, setForms] = useState([
        { id: "1", name: "IIT-JEE Demo Class Inquiry", type: "INQUIRY", submissions: 142, status: "ACTIVE" },
        { id: "2", name: "Scholarship Test 2026", type: "SCHOLARSHIP", submissions: 89, status: "ACTIVE" }
    ]);

    return (
        <div className="space-y-8 pb-32">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lead Capture Forms</h1>
                    <p className="text-slate-500 font-medium">Create high-converting enrollment forms for WhatsApp & Ads.</p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-blue-200 flex items-center gap-2">
                    <Plus size={18} /> New Form
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {forms.map(form => (
                    <div key={form.id} className="glass-card p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                                <Layout size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">{form.name}</h3>
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span className="text-blue-600">{form.type}</span>
                                    <span className="flex items-center gap-1"><FileText size={12} /> {form.submissions} Submissions</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-200 transition-all" title="Get Link">
                                <LinkIcon size={18} />
                            </button>
                            <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-200 transition-all" title="Get QR Code">
                                <QrCode size={18} />
                            </button>
                            <button className="px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-black transition-all">
                                Edit Form
                            </button>
                        </div>
                    </div>
                ))}

                <button className="border-2 border-dashed border-slate-100 rounded-[32px] p-12 flex flex-col items-center justify-center hover:bg-slate-50 transition-all group">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform mb-4">
                        <Plus size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Create New Collection Asset</span>
                </button>
            </div>

            {/* QUICK ACTIONS FOR CLICK-TO-WHATSAPP ADS */}
            <div className="soft-card p-10 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-3xl rounded-full -mr-48 -mt-48"></div>
                <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <h2 className="text-3xl font-black mb-4">Connect to Meta Ads</h2>
                        <p className="text-blue-100 mb-8 opacity-90 leading-relaxed">
                            Sync your admission forms directly with <strong>Click-to-WhatsApp Ads</strong>. Capturing name and grade takes 1s, increasing Lead → Demo conversion by 40%.
                        </p>
                        <div className="flex gap-4">
                            <button className="px-8 py-3 bg-white text-blue-600 rounded-xl font-black text-xs">Configure Meta Pixel</button>
                            <button className="px-8 py-3 bg-white/10 border border-white/20 rounded-xl font-black text-xs">Watch Tutorial</button>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <div className="glass-card bg-white/10 border-white/20 p-6 w-full max-w-sm">
                            <h4 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-blue-300" /> WhatsApp Flow Preview
                            </h4>
                            <div className="space-y-3">
                                <div className="p-3 bg-white/10 rounded-lg text-[10px] font-medium">"Hello! Which course are you interested in?"</div>
                                <div className="p-3 bg-blue-500 rounded-lg text-[10px] font-bold">Select Course (IIT / NEET)</div>
                                <div className="p-3 bg-white/10 rounded-lg text-[10px] font-medium">"Great! Select your preference for a demo call."</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
