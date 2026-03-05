"use client";

import { useEffect, useState } from "react";
import {
    Plus, Clock, MessageSquare, Trash2, ArrowRight,
    BarChart3, Zap, Target, MousePointer2, Settings2,
    CheckCircle2
} from "lucide-react";
import DripTimelineEditor from "../../../components/drips/DripTimelineEditor";

export default function DripsPage() {
    const [drips, setDrips] = useState<any[]>([]);
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [currentDrip, setCurrentDrip] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrips();
    }, []);

    const fetchDrips = async () => {
        setLoading(true);
        const res = await fetch("/api/drips");
        if (res.ok) {
            const json = await res.json();
            setDrips(json.data);
        }
        setLoading(false);
    };

    const handleSave = async (data: any) => {
        try {
            const res = await fetch("/api/drips", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                setView('list');
                fetchDrips();
            } else {
                alert("Error saving drip sequence");
            }
        } catch (e) {
            alert("Error saving drip sequence");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? All enrollments will be stopped.")) return;
        const res = await fetch(`/api/drips?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchDrips();
    };

    if (view === 'editor') {
        return (
            <div className="p-8">
                <DripTimelineEditor
                    initialData={currentDrip}
                    onSave={handleSave}
                    onCancel={() => setView('list')}
                />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-8 bg-[#fcfcfd]">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Drip Automation</h1>
                    <p className="text-gray-500 mt-1">Lifecycle follow-ups that convert leads into customers.</p>
                </div>
                <button
                    onClick={() => { setCurrentDrip(null); setView('editor'); }}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-bold"
                >
                    <Plus size={20} /> New Sequence
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {drips.map(drip => (
                    <div key={drip.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl hover:shadow-gray-100 transition-all duration-500 group">
                        <div className="p-8 pb-4">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-xl text-gray-800">{drip.name}</h3>
                                        <div className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">{drip.status}</div>
                                    </div>
                                    <p className="text-sm text-gray-400">{drip.description || "No description provided"}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setCurrentDrip(drip); setView('editor'); }}
                                        className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                    >
                                        <Settings2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(drip.id)}
                                        className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Analytics Strip */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Zap size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Sent</span>
                                    </div>
                                    <p className="text-xl font-black text-slate-700">{drip.analytics?.sent_count || 0}</p>
                                </div>
                                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100/50">
                                    <div className="flex items-center gap-2 text-indigo-400 mb-1">
                                        <MousePointer2 size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Reads</span>
                                    </div>
                                    <p className="text-xl font-black text-indigo-700">{drip.analytics?.read_count || 0}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-2xl border border-green-100/50">
                                    <div className="flex items-center gap-2 text-green-400 mb-1">
                                        <Target size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">ROI</span>
                                    </div>
                                    <p className="text-xl font-black text-green-700">--</p>
                                </div>
                            </div>

                            {/* Mini Timeline */}
                            <div className="relative pl-6 space-y-4 border-l-2 border-dashed border-gray-100 ml-4 mb-4">
                                {drip.steps.slice(0, 3).map((step: any, idx: number) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[1.85rem] top-1 w-3 h-3 rounded-full bg-white border-2 border-indigo-400" />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-gray-400 w-12">Step {step.step_order}</span>
                                                <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                                                    {step.flow_id ? <Zap size={14} className="text-indigo-500" /> : <MessageSquare size={14} className="text-gray-400" />}
                                                    {step.flow_id ? "Trigger Flow" : "Send Template"}
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">+{step.delay_hours}h</span>
                                        </div>
                                    </div>
                                ))}
                                {drip.steps.length > 3 && (
                                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest pt-2">+{drip.steps.length - 3} more steps</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-auto bg-gray-50/50 p-6 flex items-center justify-between border-t border-gray-50">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                <Clock size={14} />
                                <span>Updated {new Date(drip.updated_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 cursor-pointer hover:underline">
                                View Full Analytics <ArrowRight size={14} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {drips.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-400 rounded-3xl flex items-center justify-center mb-6">
                        <BarChart3 size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">No Drip Sequences Yet</h2>
                    <p className="text-gray-400 max-w-xs text-center mt-2">Start following up with your leads automatically and increase your conversion rate by 3x.</p>
                    <button
                        onClick={() => { setCurrentDrip(null); setView('editor'); }}
                        className="mt-8 bg-zinc-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-100"
                    >
                        Create Your First Drip
                    </button>
                </div>
            )}
        </div>
    );
}

