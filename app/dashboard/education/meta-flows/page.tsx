"use client";

import { useState } from "react";
import {
    Plus,
    Smartphone,
    Play,
    Settings,
    Zap,
    CheckCircle2,
    AlertCircle,
    Eye,
    LifeBuoy
} from "lucide-react";

export default function MetaFlowsPage() {
    const [flows, setFlows] = useState([
        { id: "1", name: "Student Inquiry Flow", meta_flow_id: "1092837465", status: "PUBLISHED", submissions: 421 },
        { id: "2", name: "Demo Class Booking", meta_flow_id: "8827364510", status: "DRAFT", submissions: 0 }
    ]);

    return (
        <div className="space-y-8 pb-32">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">WhatsApp Meta Flows</h1>
                <p className="text-slate-500 font-medium tracking-tight">Configure high-converting native forms that open directly inside WhatsApp.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* FLOW LIST */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Flows</h3>
                        <button className="text-blue-600 text-xs font-black uppercase flex items-center gap-1 hover:underline">
                            <Plus size={14} /> Import from Meta
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {flows.map(flow => (
                            <div key={flow.id} className="glass-card p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                        <Smartphone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                            {flow.name}
                                            {flow.status === "PUBLISHED" ? (
                                                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Live</span>
                                            ) : (
                                                <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Draft</span>
                                            )}
                                        </h4>
                                        <p className="text-xs text-slate-400 font-medium">Flow ID: {flow.meta_flow_id} • {flow.submissions} submissions</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-200 transition-all" title="Preview">
                                        <Eye size={18} />
                                    </button>
                                    <button className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-200 transition-all" title="Settings">
                                        <Settings size={18} />
                                    </button>
                                    <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2">
                                        <Zap size={14} className="text-amber-400 fill-amber-400" /> Use in Flow
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* EMPTY STATE HELPER */}
                    <div className="mt-12 p-10 border-2 border-dashed border-slate-100 rounded-[32px] bg-slate-50/30">
                        <div className="max-w-xl mx-auto text-center space-y-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                                <LifeBuoy size={32} className="text-blue-500" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">How to use Meta Flows?</h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                Meta Flows (native forms) are created in the <strong>Meta Business Manager</strong>. Once created and published, simply add the Flow ID here to sync inquiry data directly into your Admission CRM.
                            </p>
                            <div className="flex justify-center gap-4 pt-4">
                                <button className="text-blue-600 text-xs font-black uppercase border-b-2 border-blue-600 pb-1">Documentation</button>
                                <button className="text-blue-600 text-xs font-black uppercase border-b-2 border-blue-600 pb-1">Setup Video</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SIDEBAR PREVIEW */}
                <div className="space-y-6">
                    <div className="glass-card p-6 bg-slate-900 border-none text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Experience Preview</h3>

                        <div className="space-y-4 relative z-10">
                            <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                                <p className="text-[10px] font-bold text-blue-300 mb-2">WhatsApp Client Message</p>
                                <p className="text-xs leading-relaxed">"Click the button below to register for the JEE Advanced Demo Class."</p>
                            </div>
                            <div className="bg-blue-500 py-3 rounded-xl text-center text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-900/40">
                                Register Now (Flow)
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                <p className="text-[10px] font-bold text-slate-400 mb-2 italic">Submission Outcome</p>
                                <p className="text-[10px] leading-relaxed text-slate-300">
                                    Lead "Ankit Singh" added to <strong>Demo Scheduled</strong> pipeline. Automated brochure sent.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pro Tip</h3>
                        <div className="flex gap-3">
                            <Zap size={20} className="text-amber-500 shrink-0 mt-1" />
                            <p className="text-[11px] font-medium leading-relaxed text-slate-600">
                                Use native flows with <strong>Conversion API</strong> to track your actual lead costs in Meta Ads Manager.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
