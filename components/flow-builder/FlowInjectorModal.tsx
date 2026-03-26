"use client";

import { useState } from "react";
import { 
    X, 
    Zap, 
    Code, 
    Rocket, 
    ArrowRight, 
    ShieldCheck, 
    Users,
    MessageSquare,
    Loader2,
    Sparkles,
    LayoutTemplate,
    BadgeCheck
} from "lucide-react";
import { SIMPLE_FLOW_TEMPLATES } from "../../lib/goals/templates";


interface FlowInjectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function FlowInjectorModal({ isOpen, onClose, onSuccess }: FlowInjectorModalProps) {
    const [jsonInput, setJsonInput] = useState("");
    const [aiPrompt, setAiPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setGenerating(true);
        setError(null);
        try {
            const res = await fetch("/api/flows/generate/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: aiPrompt })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "AI Generation failed");
            
            setJsonInput(JSON.stringify(data.script, null, 4));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setGenerating(false);
        }
    };


    const handleInject = async (script?: any) => {
        setLoading(true);
        setError(null);
        
        try {
            const dataToInject = script || JSON.parse(jsonInput);
            
            const res = await fetch("/api/flows/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToInject)
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Failed to inject flow");
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Invalid JSON structure");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100 flex flex-col md:flex-row">
                
                {/* Left Sidebar: Pro Blueprints */}
                <div className="w-full md:w-80 bg-slate-50 border-r border-gray-100 p-8 flex flex-col">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <LayoutTemplate size={18} className="text-slate-400" />
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Master Blueprints</h3>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">Quick-start your automation with industry-standard flows.</p>
                    </div>

                    <div className="flex-1 space-y-4">
                        {SIMPLE_FLOW_TEMPLATES.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => {
                                    setJsonInput(JSON.stringify(template.script, null, 4));
                                    setAiPrompt(`Customizing ${template.name}...`);
                                }}
                                className="w-full group text-left p-4 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all relative overflow-hidden"
                            >
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-1.5 rounded-lg bg-slate-50 group-hover:bg-emerald-50 transition-colors`}>
                                            <Zap size={14} className={template.iconColor} />
                                        </div>
                                        <h4 className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors">{template.name}</h4>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 leading-normal line-clamp-2 uppercase group-hover:text-slate-500">{template.description}</p>
                                </div>
                                <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight size={12} className="text-emerald-500" />
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200/50">
                        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                            <div className="flex items-center gap-2 mb-2">
                                <BadgeCheck size={14} className="text-emerald-600" />
                                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-tight">Enterprise Ready</span>
                            </div>
                            <p className="text-[9px] font-bold text-emerald-600/70 uppercase leading-tight">All blueprints follow meta best practices & anti-spam guidelines.</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col p-8 relative bg-white">
                    <button 
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 z-20"
                    >
                        <X size={20} />
                    </button>

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Sparkles size={24} className="text-purple-600 animate-pulse" />
                            AI Flow Assistant
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Describe your flow in plain English, and I'll write the code for you.</p>
                    </div>

                    {/* AI Prompt Input */}
                    <div className="flex gap-2 mb-6 p-2 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-purple-200 focus-within:ring-2 focus-within:ring-purple-50 transition-all">
                        <input 
                            type="text" 
                            className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-medium"
                            placeholder="e.g., 'A pizza shop flow that asks for size and flavor, then collects payment'"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
                        />
                        <button 
                            onClick={handleAIGenerate}
                            disabled={generating || !aiPrompt.trim()}
                            className="bg-black text-white px-6 py-2 rounded-xl text-xs font-bold hover:opacity-80 disabled:opacity-30 transition-all flex items-center gap-2"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="animate-spin" size={12} />
                                    Brainstorming...
                                </>
                            ) : (
                                <>
                                    <Zap size={12} fill="currentColor" />
                                    Generate
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex-1 relative mb-6">
                        <div className="absolute top-4 left-6 flex items-center gap-2 z-10">
                            <Code size={12} className="text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">JSON SCRIPT EDITOR</span>
                        </div>
                        <textarea
                            className="w-full h-full min-h-[350px] pt-12 p-6 font-mono text-xs bg-gray-900 text-green-400 rounded-3xl outline-none focus:ring-2 ring-emerald-500/20 border-none shadow-2xl shadow-emerald-900/10 resize-none custom-scrollbar"
                            placeholder='{
    "name": "My AI Flow",
    "steps": [
        { "id": "hello", "text": "Welcome!" }
    ]
}'
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-medium border border-red-100">
                            Error: {error}
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-gray-400">
                            <MessageSquare size={16} />
                            <span className="text-xs font-bold uppercase tracking-tighter">Text, Buttons, Media, CRM APIs supported</span>
                        </div>
                        <button
                            onClick={() => handleInject()}
                            disabled={loading || !jsonInput.trim()}
                            className="bg-[#27954D] text-white px-8 py-4 rounded-2xl shadow-xl shadow-emerald-200 hover:shadow-emerald-300 hover:scale-[1.02] active:scale-100 transition-all flex items-center gap-3 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span className="text-sm font-black uppercase tracking-widest">Injecting...</span>
                                </>
                            ) : (
                                <>
                                    <Rocket size={18} />
                                    <span className="text-sm font-black uppercase tracking-widest">Inject Flow Code</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
