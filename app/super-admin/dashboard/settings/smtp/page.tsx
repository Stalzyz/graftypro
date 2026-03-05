
"use client";

import { useState } from "react";
import { Mail, Zap, RefreshCw, Save, CheckCircle2, AlertCircle, Trash2, Plus, ArrowUpRight } from "lucide-react";

export default function SMTPRelayMatrix() {
    const [configs, setConfigs] = useState([
        { id: 1, provider: "Grafty Official (AWS SES)", host: "email-smtp.us-east-1.amazonaws.com", port: 587, status: "PRIMARY", success_rate: "99.2%" },
        { id: 2, provider: "Super Admin Recovery (Postmark)", host: "smtp.postmarkapp.com", port: 587, status: "BACKUP", success_rate: "99.8%" },
    ]);
    const [loading, setLoading] = useState(false);

    return (
        <div className="max-w-7xl space-y-12 pb-20 font-sans">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[#E11D48] font-semibold text-[10px] uppercase tracking-[0.2em] mb-3">
                        <Mail size={14} />
                        Communications Backbone
                    </div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight italic">SMTP Relay Matrix</h1>
                    <p className="text-slate-400 text-sm font-medium">Manage global email infrastructure and failover delivery protocols.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-4 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                        <Zap size={14} className="text-amber-500" />
                        Test All Relays
                    </button>
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95">
                        <Plus size={14} /> Forge New Relay
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {configs.map((config) => (
                    <div key={config.id} className="bg-white rounded-[40px] border border-slate-100 p-10 space-y-8 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                        <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[9px] font-black uppercase tracking-widest ${config.status === 'PRIMARY' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-slate-100 text-slate-400'}`}>
                            {config.status} ROUTE
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{config.provider}</h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    <CheckCircle2 size={12} className="text-green-500" />
                                    Healthy Connection • {config.success_rate} Delivery
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-50">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Endpoints</span>
                                    <div className="text-xs font-bold text-slate-700 font-mono truncate">{config.host}:{config.port}</div>
                                </div>
                                <div>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Queue Priority</span>
                                    <div className="text-xs font-bold text-slate-700">{config.status === 'PRIMARY' ? 'High / Real-time' : 'Normal / Backup'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button className="flex-1 py-4 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-slate-700 transition-all">
                                Edit Protocol
                            </button>
                            <button className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                <div className="lg:col-span-2 p-10 bg-slate-900 rounded-[48px] text-white space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] group-hover:bg-blue-600/20 transition-all" />

                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black italic tracking-tight">Email Dispatcher Rules</h2>
                            <p className="text-slate-400 text-xs font-medium">Define logic for fallback and vendor-specific overrides.</p>
                        </div>
                        <button className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-blue-600 transition-all text-slate-700">
                            <Save size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <PolicySwitch label="Retry Cycles" value="3 Times" />
                        <PolicySwitch label="Daily Cap" value="Unlimited" />
                        <PolicySwitch label="Fallback Wait" value="30 Sec" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function PolicySwitch({ label, value }: any) {
    return (
        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}</span>
            <div className="flex items-center justify-between">
                <span className="text-lg font-black">{value}</span>
                <button className="text-blue-400"><ArrowUpRight size={16} /></button>
            </div>
        </div>
    );
}
