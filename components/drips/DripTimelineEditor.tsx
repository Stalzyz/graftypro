
"use client";

import { useState, useEffect } from "react";
import {
    Plus, Clock, MessageSquare, Trash2, ArrowDown,
    Settings, Zap, CheckCircle2, ShieldAlert,
    Calendar, Globe, BellOff, Info, Play
} from "lucide-react";

interface DripStep {
    id?: string;
    step_order: number;
    delay_hours: number;
    template_id?: string;
    flow_id?: string;
}

interface DripTimelineEditorProps {
    initialData?: any;
    onSave: (data: any) => void;
    onCancel: () => void;
}

export default function DripTimelineEditor({ initialData, onSave, onCancel }: DripTimelineEditorProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [goalId, setGoalId] = useState(initialData?.goal_id || "");
    const [stopOnReply, setStopOnReply] = useState(initialData?.stop_on_reply ?? true);
    const [steps, setSteps] = useState<DripStep[]>(initialData?.steps || [{ step_order: 1, delay_hours: 0 }]);

    // Settings
    const [settings, setSettings] = useState(initialData?.settings || {
        business_hours: true,
        start_hour: 9,
        end_hour: 18,
        timezone: "Asia/Kolkata",
        days: [1, 2, 3, 4, 5]
    });

    // Reference Data
    const [flows, setFlows] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [goals, setGoals] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const [f, t, g] = await Promise.all([
                fetch("/api/flows").then(res => res.json()),
                fetch("/api/templates").then(res => res.json()),
                fetch("/api/goals").then(res => res.json())
            ]);
            setFlows(f.data || []);
            setTemplates(t.data || []);
            setGoals(g.data || []);
        };
        fetchData();
    }, []);

    const handleAddStep = () => {
        const nextOrder = steps.length + 1;
        setSteps([...steps, { step_order: nextOrder, delay_hours: 24 }]);
    };

    const updateStep = (index: number, updates: Partial<DripStep>) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], ...updates };
        setSteps(newSteps);
    };

    const handleSave = () => {
        if (!name) return alert("Sequence name is required");
        onSave({
            id: initialData?.id,
            name,
            description,
            goal_id: goalId || null,
            stop_on_reply: stopOnReply,
            settings,
            steps
        });
    };

    return (
        <div className="flex gap-8 max-w-6xl mx-auto p-4 animate-in fade-in duration-500">
            {/* Main Timeline */}
            <div className="flex-1 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Zap size={24} />
                        </div>
                        <div className="flex-1">
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Enter Sequence Name..."
                                className="text-2xl font-bold text-gray-900 w-full outline-none placeholder:text-gray-300"
                            />
                            <input
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Add a description (e.g. 7-day conversion series)"
                                className="text-sm text-gray-500 w-full outline-none mt-1 placeholder:text-gray-300"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <ShieldAlert size={14} className="text-slate-400" />
                            <span className="text-xs font-medium text-slate-600">Meta Compliant</span>
                        </div>
                        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                            <CheckCircle2 size={14} className="text-green-500" />
                            <span className="text-xs font-medium text-green-700">Conversion Driven</span>
                        </div>
                    </div>
                </div>

                {/* Vertical Steps */}
                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <div key={index} className="group relative flex gap-6">
                            {/* Connector Line */}
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm z-10 transition-colors ${step.flow_id || step.template_id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>
                                    {step.step_order}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="w-0.5 h-full bg-indigo-50 -my-2 group-hover:bg-indigo-100 transition-colors" />
                                )}
                            </div>

                            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-indigo-200 transition-all group-hover:shadow-md mb-8">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-50 p-2 rounded-lg text-gray-400">
                                            <Clock size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Delay</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <input
                                                    type="number"
                                                    value={step.delay_hours}
                                                    onChange={e => updateStep(index, { delay_hours: parseInt(e.target.value) })}
                                                    className="w-16 border-b border-gray-100 focus:border-indigo-500 font-bold text-gray-700 outline-none transition-colors"
                                                />
                                                <span className="text-sm text-gray-500">hours after previous step</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSteps(steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_order: i + 1 })))}
                                        className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${step.flow_id ? 'border-indigo-500 bg-indigo-50/50' : 'border-dashed border-gray-100 bg-gray-50/20 hover:border-gray-200'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Play size={14} className={step.flow_id ? 'text-indigo-600' : 'text-gray-400'} />
                                            <span className="text-xs font-bold uppercase tracking-wide">Trigger Flow</span>
                                        </div>
                                        <select
                                            value={step.flow_id || ""}
                                            onChange={e => updateStep(index, { flow_id: e.target.value, template_id: "" })}
                                            className="w-full bg-transparent text-sm font-medium outline-none text-gray-700"
                                        >
                                            <option value="">Choose Flow...</option>
                                            {flows.map(f => (
                                                <option key={f.id} value={f.id}>{f.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${step.template_id ? 'border-indigo-500 bg-indigo-50/50' : 'border-dashed border-gray-100 bg-gray-50/20 hover:border-gray-200'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <MessageSquare size={14} className={step.template_id ? 'text-indigo-600' : 'text-gray-400'} />
                                            <span className="text-xs font-bold uppercase tracking-wide">Send Template</span>
                                        </div>
                                        <select
                                            value={step.template_id || ""}
                                            onChange={e => updateStep(index, { template_id: e.target.value, flow_id: "" })}
                                            className="w-full bg-transparent text-sm font-medium outline-none text-gray-700"
                                        >
                                            <option value="">Choose Template...</option>
                                            {templates.map(t => (
                                                <option key={t.id} value={t.id}>{t.name} ({t.language})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={handleAddStep}
                        className="w-full group py-4 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-1 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-gray-400 hover:text-indigo-600"
                    >
                        <Plus size={20} className="mb-1" />
                        <span className="text-sm font-bold uppercase tracking-widest">Add Next Step</span>
                    </button>
                </div>
            </div>

            {/* Side Configuration */}
            <div className="w-80 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <CheckCircle2 size={18} className="text-indigo-600" />
                        <h2 className="font-bold text-gray-700 uppercase tracking-wide text-sm">Stop Conditions</h2>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                            <input
                                type="checkbox"
                                checked={stopOnReply}
                                onChange={e => setStopOnReply(e.target.checked)}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-700">Stop on Reply</p>
                                <p className="text-[10px] text-gray-400 uppercase mt-0.5 tracking-tight">Pause if user responds</p>
                            </div>
                        </label>

                        <div className="pt-2">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                <Zap size={10} /> Goal Association
                            </p>
                            <select
                                value={goalId}
                                onChange={e => setGoalId(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            >
                                <option value="">No linked goal</option>
                                {goals.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-gray-400 mt-2 px-1">
                                <Info size={10} className="inline mr-1 mb-0.5" />
                                Sequence stops instantly when this goal is achieved.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar size={18} className="text-indigo-600" />
                        <h2 className="font-bold text-gray-700 uppercase tracking-wide text-sm">Timing Logic</h2>
                    </div>

                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-600">Business Hours</span>
                            <div
                                onClick={() => setSettings({ ...settings, business_hours: !settings.business_hours })}
                                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${settings.business_hours ? 'bg-indigo-600' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.business_hours ? 'right-1' : 'left-1'}`} />
                            </div>
                        </div>

                        {settings.business_hours && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Delivery Window</p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={settings.start_hour}
                                            onChange={e => setSettings({ ...settings, start_hour: parseInt(e.target.value) })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5 text-xs text-center"
                                        />
                                        <span className="text-gray-300">to</span>
                                        <input
                                            type="number"
                                            value={settings.end_hour}
                                            onChange={e => setSettings({ ...settings, end_hour: parseInt(e.target.value) })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5 text-xs text-center"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Timezone</p>
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-50">
                                        <Globe size={12} className="text-gray-400" />
                                        <span className="text-xs text-gray-600">{settings.timezone}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    <button
                        onClick={handleSave}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={18} />
                        Save Sequence
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full py-4 bg-white text-gray-500 rounded-2xl font-bold border border-gray-100 hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

