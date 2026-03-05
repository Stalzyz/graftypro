
"use client";

import { useState } from "react";
import { Workflow, Play, Pause, Zap, Clock, AlertCircle, Plus, ChevronRight, Save, Settings2 } from "lucide-react";

export default function AutomationEngine() {
    const [tasks, setTasks] = useState([
        { id: 1, name: "Subscription Expiry Check", type: "CRON", schedule: "Daily @ 00:00", status: "RUNNING", lastRun: "12 hours ago" },
        { id: 2, name: "Low Credit Alerts", type: "TRIGGER", condition: "Balance < 500", status: "RUNNING", lastRun: "5 mins ago" },
        { id: 3, name: "Inactive WABA Cleanup", type: "CRON", schedule: "Weekly @ Sunday", status: "PAUSED", lastRun: "2 days ago" },
        { id: 4, name: "Fraud Detection Engine", type: "STREAM", logic: "Velocity Check", status: "RUNNING", lastRun: "Real-time" },
    ]);

    return (
        <div className="max-w-7xl space-y-12 pb-20 font-sans">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-emerald-600 font-semibold text-[10px] uppercase tracking-[0.2em] mb-3">
                        <Workflow size={14} />
                        Orchestration Layer
                    </div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight italic">Automation Engine</h1>
                    <p className="text-slate-400 text-sm font-medium">Manage system-wide triggers, background jobs, and scheduled workflows.</p>
                </div>
                <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200">
                    <Plus size={14} /> Initialize Workflow
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Active System Tasks</h3>
                            <button className="p-2 text-slate-400 hover:text-slate-900 transition-all">
                                <Settings2 size={16} />
                            </button>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {tasks.map((task) => (
                                <div key={task.id} className="p-8 flex items-center justify-between group hover:bg-slate-50 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all group-hover:scale-110 ${task.status === 'RUNNING' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                            {task.status === 'RUNNING' ? <Zap size={20} className="animate-pulse" /> : <Clock size={20} />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-slate-900">{task.name}</div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                                                {task.type} • {task.schedule || task.condition || task.logic}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right mr-4">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Last Execution</span>
                                            <span className="text-xs font-bold text-slate-600">{task.lastRun}</span>
                                        </div>
                                        <button className={`p-3 rounded-xl transition-all ${task.status === 'RUNNING' ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}>
                                            {task.status === 'RUNNING' ? <Pause size={14} /> : <Play size={14} />}
                                        </button>
                                        <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-900 hover:text-slate-700 transition-all shadow-sm">
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-10 bg-emerald-600 rounded-[48px] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-emerald-100">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                <Zap className="fill-white" size={24} /> Engine Health: 99.9%
                            </h2>
                            <p className="opacity-70 text-sm font-medium italic">3,482 jobs processed in the last 24 hours with zero pipeline lag.</p>
                        </div>
                        <button className="px-10 py-5 bg-black/20 text-white border border-white/10 rounded-[28px] font-black text-[10px] uppercase tracking-[0.2em] backdrop-blur-md hover:bg-white hover:text-emerald-600 transition-all">
                            View Engine Logs
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="p-8 bg-slate-900 rounded-[40px] text-white space-y-8">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                            <AlertCircle className="text-blue-400" size={18} />
                            <h2 className="text-sm font-black uppercase tracking-widest">Worker Config</h2>
                        </div>
                        <div className="space-y-6">
                            <PolicyToggle label="Async Overload" active={true} />
                            <PolicyToggle label="Auto-Scaling" active={true} />
                            <PolicyToggle label="Dead Letter Queue" active={false} />
                        </div>
                        <div className="pt-6 border-t border-white/5">
                            <button className="w-full py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                <Save size={14} /> Sync Configurations
                            </button>
                        </div>
                    </div>

                    <div className="p-8 bg-zinc-50 rounded-[40px] border border-zinc-200/50">
                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Concurrency Limit</h4>
                        <div className="h-2 bg-zinc-200 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-emerald-500 w-[65%]" />
                        </div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase">65% Capacity - 13/20 Active Workers</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PolicyToggle({ label, active }: any) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${active ? 'right-1' : 'left-1'}`} />
            </div>
        </div>
    );
}
