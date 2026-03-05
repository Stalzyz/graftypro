"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Target, Trash2, Info } from "lucide-react";

export default function SegmentsPage() {
    const [segments, setSegments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // New Segment Form
    const [name, setName] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    useEffect(() => {
        fetchSegments();
    }, []);

    const fetchSegments = async () => {
        const res = await fetch("/api/segments");
        const data = await res.json();
        if (data.data) setSegments(data.data);
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!name) return;
        const res = await fetch("/api/segments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                filters: { tags: selectedTags }
            })
        });
        if (res.ok) {
            setName("");
            setSelectedTags([]);
            setIsCreating(false);
            fetchSegments();
        }
    };

    const addTag = () => {
        if (tagInput && !selectedTags.includes(tagInput)) {
            setSelectedTags([...selectedTags, tagInput]);
            setTagInput("");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Segments</h1>
                    <p className="text-gray-500">Create target audiences for personalized broadcasts.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
                >
                    <Plus size={20} />
                    New Segment
                </button>
            </div>

            {isCreating && (
                <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-gray-900">Configure Segment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Segment Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. VIP Customers"
                                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Tags</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addTag()}
                                    placeholder="Enter tag and press enter..."
                                    className="flex-1 border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button onClick={addTag} className="bg-gray-100 px-3 rounded-lg text-sm font-bold">Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedTags.map(tag => (
                                    <span key={tag} className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                        {tag}
                                        <button onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}><Plus size={12} className="rotate-45" /></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button onClick={() => setIsCreating(false)} className="text-gray-500 font-medium">Cancel</button>
                        <button onClick={handleCreate} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Save Segment</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {segments.map((s: any) => (
                    <div key={s.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Target size={20} />
                            </div>
                            <button className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">{s.name}</h3>
                        <div className="flex flex-wrap gap-1 mt-3">
                            {s.filters?.tags?.map((tag: string) => (
                                <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                            {(!s.filters?.tags || s.filters.tags.length === 0) && (
                                <span className="text-xs text-gray-400 italic">No filters (Include All)</span>
                            )}
                        </div>
                        <div className="mt-6 flex items-center justify-between text-xs text-gray-400 font-medium">
                            <span>Created {new Date(s.created_at).toLocaleDateString()}</span>
                            <div className="flex items-center gap-1 text-blue-600">
                                <Users size={12} />
                                <span>Dynamic</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {segments.length === 0 && !loading && (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-800">No segments yet</h3>
                    <p className="text-gray-500">Break your audience into smaller groups for better engagement.</p>
                </div>
            )}
        </div>
    );
}
