
"use client";

import { useState } from "react";
import { Settings2, Zap, Shield, Check, X, ShieldCheck, Cpu } from "lucide-react";

export default function ModuleManager() {
    const [modules, setModules] = useState([
        { id: "commerce", name: "WhatsApp Commerce", description: "Catalog, Carts, and Payments via WhatsApp", active: true },
        { id: "flows", name: "Advanced Flows", description: "Complex multi-step user interaction flows", active: true },
        { id: "drips", name: "Drip Campaigns", description: "Automated sequence messaging based on triggers", active: true },
        { id: "edu", name: "Educational Engine", description: "LMS and course delivery via WhatsApp", active: false },
        { id: "api", name: "Developer API", description: "External integration and webhook engine", active: true },
    ]);

    const toggleModule = (id: string) => {
        setModules(prev => prev.map(m => m.id === id ? { ...m, active: !m.active } : m));
    };

    return (
        <div className="max-w-7xl space-y-12 pb-20 font-sans">
            <header className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <Cpu className="text-white" size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Synapse Engine</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Global feature toggles, module provisioning, and feature flags.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {modules.map(module => (
                    <div key={module.id} className="bg-white rounded-[40px] border border-slate-100 p-10 flex flex-col justify-between group hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 ${module.active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <Settings2 size={24} />
                                </div>
                                <button
                                    onClick={() => toggleModule(module.id)}
                                    className={`w-14 h-8 rounded-full relative transition-all ${module.active ? 'bg-[#27954D]' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${module.active ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{module.name}</h3>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">{module.description}</p>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-50 mt-10">
                            <div className="flex items-center gap-3">
                                {module.active ? (
                                    <div className="flex items-center gap-2 text-[#27954D] text-[10px] font-black uppercase tracking-widest">
                                        <ShieldCheck size={14} /> System Online
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-slate-300 text-[10px] font-black uppercase tracking-widest">
                                        <Shield size={14} /> Deactivated
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                <button className="h-[320px] border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center gap-4 text-slate-300 hover:border-slate-400 hover:text-slate-500 transition-all group">
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Settings2 size={24} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Architect New Module</span>
                </button>
            </div>
        </div>
    );
}
