"use client";

import { useState } from "react";
import {
    Send,
    Users,
    BookOpen,
    Filter,
    Zap,
    LayoutTemplate,
    Search,
    Clock,
    CheckCircle2
} from "lucide-react";

export default function EduBroadcastPage() {
    const [template, setTemplate] = useState("");
    const [sending, setSending] = useState(false);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    const statuses = [
        { id: "NEW", label: "New Leads" },
        { id: "CONTACTED", label: "Contacted" },
        { id: "DEMO_SCHEDULED", label: "Demo Scheduled" },
        { id: "PAYMENT_PENDING", label: "Payment Pending" },
    ];

    const handleLaunch = async () => {
        if (!template) return alert("Select a template");
        setSending(true);
        try {
            const res = await fetch("/api/edu/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: `Edu Broadcast: ${new Date().toLocaleDateString()}`,
                    templateName: template,
                    targetStatus: selectedStatuses.length > 0 ? selectedStatuses : undefined
                })
            });
            if (res.ok) {
                alert("Broadcast Launched Successfully!");
            } else {
                alert("Launch Failed");
            }
        } catch (e) {
            alert("Error launching broadcast");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bulk Broadcast Center</h1>
                    <p className="text-slate-500 font-medium">Drive admissions with targeted WhatsApp blast.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-green-50 rounded-xl flex items-center gap-2 border border-green-100">
                        <CheckCircle2 size={16} className="text-green-600" />
                        <span className="text-[10px] font-black uppercase text-green-700">WABA Active</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CONFIGURATION */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-8 space-y-8">
                        {/* 1. Select Audience */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Users size={18} className="text-blue-600" />
                                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">1. Target Audience</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {statuses.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => {
                                            if (selectedStatuses.includes(s.id)) setSelectedStatuses(prev => prev.filter(x => x !== s.id));
                                            else setSelectedStatuses(prev => [...prev, s.id]);
                                        }}
                                        className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${selectedStatuses.includes(s.id)
                                                ? "border-blue-500 bg-blue-50/50 text-blue-700"
                                                : "border-slate-50 bg-slate-50/30 text-slate-500 hover:border-slate-100"
                                            }`}
                                    >
                                        <span className="text-sm font-bold">{s.label}</span>
                                        {selectedStatuses.includes(s.id) && <CheckCircle2 size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Select Template */}
                        <div className="space-y-4 pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-2 mb-2">
                                <LayoutTemplate size={18} className="text-purple-600" />
                                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">2. Message Template</h3>
                            </div>
                            <div className="relative">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search Approved Templates (Meta)..."
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {["admission_open_2026", "demo_reminder_final", "early_bird_discount", "course_brochure_v2"].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTemplate(t)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${template === t ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-50 hover:border-slate-100"
                                            }`}
                                    >
                                        <p className="text-sm font-black">{t}</p>
                                        <p className="text-[10px] opacity-70">Approved • Category: Utility</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SUMMARY & ACTIONS */}
                <div className="space-y-6">
                    <div className="glass-card p-6 bg-slate-900 border-none">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Broadcast Summary</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Target Count</span>
                                <span className="text-lg font-black text-white">1,240 <span className="text-xs font-normal opacity-50">Leads</span></span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Credits</span>
                                <span className="text-lg font-black text-amber-400">1,240 <span className="text-xs font-normal opacity-50">CR</span></span>
                            </div>
                        </div>

                        <button
                            onClick={handleLaunch}
                            disabled={sending || !template}
                            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm uppercase tracking-widest transition-all ${sending || !template
                                    ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-900/40"
                                }`}
                        >
                            <Send size={18} />
                            {sending ? "Launching..." : "Launch Broadcast"}
                        </button>

                        <p className="text-[10px] text-center text-slate-500 mt-4 px-4 font-medium italic">
                            *Messages will be throttled at 10/sec to comply with Meta quality guidelines.
                        </p>
                    </div>

                    {/* RECENT BROADCASTS PREVIEW */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock size={16} className="text-slate-400" />
                            <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Recent Activity</h3>
                        </div>
                        <div className="space-y-4 text-xs font-bold text-slate-500">
                            <div className="flex items-center justify-between opacity-50 italic">
                                <span>No recent broadcasts found.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
