"use client";

import { useEffect, useState } from "react";
import { Plus, Clock, MessageSquare, Trash2, ArrowRight } from "lucide-react";

export default function DripsPage() {
    const [drips, setDrips] = useState<any[]>([]);
    const [view, setView] = useState<'list' | 'create'>('list');
    const [loading, setLoading] = useState(true);

    // Form State
    const [name, setName] = useState("");
    const [steps, setSteps] = useState<any[]>([{ step_order: 1, delay_hours: 0, template_id: "" }]);
    const [templates, setTemplates] = useState<any[]>([]);

    useEffect(() => {
        fetchDrips();
        fetchTemplates();
    }, []);

    const fetchDrips = async () => {
        const res = await fetch("/api/drips");
        if (res.ok) {
            const json = await res.json();
            setDrips(json.data);
        }
        setLoading(false);
    };

    const fetchTemplates = async () => {
        const res = await fetch("/api/templates");
        if (res.ok) {
            const json = await res.json();
            setTemplates(json.data || []);
        }
    };

    const handleAddStep = () => {
        setSteps([...steps, { step_order: steps.length + 1, delay_hours: 24, template_id: "" }]);
    };

    const handleRemoveStep = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index);
        // Reorder
        const reordered = newSteps.map((s, i) => ({ ...s, step_order: i + 1 }));
        setSteps(reordered);
    };

    const updateStep = (index: number, field: string, value: any) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setSteps(newSteps);
    };

    const handleSave = async () => {
        if (!name) return alert("Please enter a name");

        try {
            const res = await fetch("/api/drips", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, steps })
            });
            if (res.ok) {
                alert("Drip Saved!");
                setView('list');
                fetchDrips();
                // Reset
                setName("");
                setSteps([{ step_order: 1, delay_hours: 0, template_id: "" }]);
            } else {
                alert("Error saving drip");
            }
        } catch (e) {
            alert("Error saving drip");
        }
    };

    return (
        <div className="h-full flex flex-col p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Drip Campaigns</h1>
                {view === 'list' && (
                    <button onClick={() => setView('create')} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                        <Plus size={18} /> New Drip Sequence
                    </button>
                )}
            </div>

            {view === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {drips.map(drip => (
                        <div key={drip.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-semibold text-lg">{drip.name}</h3>
                                <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">{drip.status}</span>
                            </div>
                            <div className="space-y-3">
                                {drip.steps.map((step: any) => (
                                    <div key={step.id} className="flex items-center gap-3 text-sm text-gray-600">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                            {step.step_order}
                                        </div>
                                        <div className="flex-1 border-b border-gray-100 pb-2">
                                            <span className="block font-medium text-gray-800">Template ID: {step.template_id || "None"}</span>
                                            <span className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                                <Clock size={12} /> Wait {step.delay_hours} hours
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {drips.length === 0 && !loading && (
                        <div className="text-gray-500 text-center col-span-2 py-12">No drip campaigns found. Create one!</div>
                    )}
                </div>
            ) : (
                <div className="bg-white max-w-2xl rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Welcome Series"
                        />
                    </div>
                    <div className="p-6 space-y-6 bg-gray-50 min-h-[300px]">
                        {steps.map((step, index) => (
                            <div key={index} className="flex gap-4 items-start relative">
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold shadow-sm z-10">
                                        {step.step_order}
                                    </div>
                                    {index < steps.length - 1 && <div className="w-0.5 h-full bg-gray-300 -my-2" />}
                                </div>

                                <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Delay (Hours after previous)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={step.delay_hours}
                                                onChange={e => updateStep(index, 'delay_hours', parseInt(e.target.value))}
                                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Template</label>
                                            <select
                                                value={step.template_id}
                                                onChange={e => updateStep(index, 'template_id', e.target.value)}
                                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                            >
                                                <option value="">Select Template</option>
                                                {templates.map(t => (
                                                    <option key={t.id} value={t.name}>{t.name} ({t.language})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <button onClick={() => handleRemoveStep(index)} className="text-red-500 text-xs hover:text-red-700 font-medium">
                                        Remove Step
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button onClick={handleAddStep} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 text-sm font-medium transition-colors">
                            + Add Next Step
                        </button>
                    </div>

                    <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                        <button onClick={() => setView('list')} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button onClick={handleSave} className="px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 font-medium">Save Campaign</button>
                    </div>
                </div>
            )}
        </div>
    );
}
