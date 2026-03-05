
"use client";

import { useState } from "react";
import { Key, Shield, Plus, Copy, Trash2, Eye, EyeOff, RefreshCcw, Activity } from "lucide-react";

export default function SystemAPIKeys() {
    const [keys, setKeys] = useState([
        { id: 1, name: "Infrastructure Monitor", key: "gft_live_84729...9283", created: "2024-03-10", status: "ACTIVE", last_used: "2 mins ago", health: "100%" },
        { id: 2, name: "Backup Registry", key: "gft_live_19283...4721", created: "2024-02-15", status: "ACTIVE", last_used: "1 hour ago", health: "98%" },
    ]);
    const [showKey, setShowKey] = useState<number | null>(null);

    return (
        <div className="max-w-7xl space-y-12 pb-20 font-sans">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 font-semibold text-[10px] uppercase tracking-[0.2em] mb-3">
                        <Key size={14} />
                        Security Architecture
                    </div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight italic">System API Keys</h1>
                    <p className="text-slate-400 text-sm font-medium">Provision master access credentials for external infrastructure modules.</p>
                </div>
                <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200">
                    <Plus size={14} /> Generate Master Key
                </button>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {keys.map((k) => (
                    <div key={k.id} className="bg-white rounded-[40px] border border-slate-100 p-8 flex flex-col lg:flex-row items-center justify-between gap-8 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-6 w-full lg:w-auto">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">{k.name}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Provisioned {k.created}</span>
                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                                        <Activity size={10} />
                                        {k.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 max-w-xl w-full">
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4 group">
                                <code className="flex-1 font-mono text-sm font-bold text-slate-600 overflow-hidden whitespace-nowrap">
                                    {showKey === k.id ? "gft_live_84729283749283749283" : k.key}
                                </code>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowKey(showKey === k.id ? null : k.id)}
                                        className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all"
                                    >
                                        {showKey === k.id ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-slate-50 pt-6 lg:pt-0 lg:pl-10">
                            <div className="text-right">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1">Health Metric</span>
                                <div className="text-sm font-black text-slate-900">{k.health} Reliable</div>
                            </div>
                            <button className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                <div className="p-10 bg-indigo-600 rounded-[48px] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-indigo-100">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black tracking-tight">Enterprise Webhooks</h2>
                        <p className="opacity-70 text-sm font-medium">Deliver real-time system events to your custom cloud functions.</p>
                    </div>
                    <button className="px-10 py-5 bg-white text-indigo-600 rounded-[28px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">
                        Initialize Webhook Endpoint
                    </button>
                </div>
            </div>
        </div>
    );
}
