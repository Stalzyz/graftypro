"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Trash2,
    Edit2,
    Zap,
    MessageCircle,
    GitBranch,
    CheckCircle,
    XCircle,
    MoreHorizontal,
    ArrowRight
} from "lucide-react";

export default function AutoResponders() {
    const [responders, setResponders] = useState<any[]>([]);
    const [flows, setFlows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<any>(null);

    // Form State
    const [keyword, setKeyword] = useState("");
    const [matchType, setMatchType] = useState("EXACT");
    const [replyType, setReplyType] = useState("TEXT");
    const [replyText, setReplyText] = useState("");
    const [flowId, setFlowId] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [rRes, fRes] = await Promise.all([
                fetch("/api/auto-responders"),
                fetch("/api/flows")
            ]);
            const rData = await rRes.json();
            const fData = await fRes.json();
            if (rData.data) setResponders(rData.data);
            if (fData.data) setFlows(fData.data.filter((f: any) => f.status === 'PUBLISHED'));
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/auto-responders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editing?.id,
                    keyword,
                    match_type: matchType,
                    reply_type: replyType,
                    reply_text: replyType === 'TEXT' ? replyText : null,
                    flow_id: replyType === 'FLOW' ? flowId : null
                })
            });
            if (res.ok) {
                fetchData();
                closeModal();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to save");
            }
        } catch (e) {
            alert("Error saving");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/auto-responders/${id}`, { method: "DELETE" });
            if (res.ok) fetchData();
        } catch (e) {
            alert("Delete failed");
        }
    };

    const openModal = (item: any = null) => {
        if (item) {
            setEditing(item);
            setKeyword(item.keyword);
            setMatchType(item.match_type);
            setReplyType(item.reply_type);
            setReplyText(item.reply_text || "");
            setFlowId(item.flow_id || "");
        } else {
            setEditing(null);
            setKeyword("");
            setMatchType("EXACT");
            setReplyType("TEXT");
            setReplyText("");
            setFlowId("");
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditing(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Keyword Auto-Responders</h1>
                    <p className="text-sm text-gray-500 mt-1">Automatically reply to customers based on keywords they text.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
                >
                    <Plus size={18} /> New Responder
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Keyword</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Match Type</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {responders.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                            <Zap size={16} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{item.keyword}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-black uppercase tracking-tighter border border-gray-200">
                                        {item.match_type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {item.reply_type === 'TEXT' ? (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MessageCircle size={14} className="text-green-500" />
                                            <span className="truncate max-w-[200px]">{item.reply_text}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                                            <GitBranch size={14} className="text-blue-500" />
                                            <span>Flow: {item.flow?.name || "Unknown"}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {item.status ? (
                                        <div className="flex items-center gap-1.5 text-green-600 text-[10px] font-bold uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Active
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div> Inactive
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openModal(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {responders.length === 0 && !loading && (
                    <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-4">
                            <Zap size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No Auto-Responders yet</h3>
                        <p className="text-sm text-gray-400 mt-1 max-w-xs">Stop answering repetitive questions. Set up keywords like "Price" or "Location" to automate your replies.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900">{editing ? 'Edit Responder' : 'Create Responder'}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded-full transition-all">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Keyword</label>
                                <input
                                    required
                                    type="text"
                                    value={keyword}
                                    onChange={e => setKeyword(e.target.value)}
                                    placeholder="e.g. PRICE or MENU"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Match Type</label>
                                    <select
                                        value={matchType}
                                        onChange={e => setMatchType(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                    >
                                        <option value="EXACT">Exact Match</option>
                                        <option value="CONTAINS">Contains</option>
                                        <option value="STARTS_WITH">Starts With</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Reply with</label>
                                    <select
                                        value={replyType}
                                        onChange={e => setReplyType(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                    >
                                        <option value="TEXT">Simple Text</option>
                                        <option value="FLOW">Visual Flow</option>
                                    </select>
                                </div>
                            </div>

                            {replyType === 'TEXT' ? (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Response Text</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Type the message your bot should send back..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Select flow</label>
                                    <select
                                        required
                                        value={flowId}
                                        onChange={e => setFlowId(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                    >
                                        <option value="">-- Choose a Flow --</option>
                                        {flows.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={saving}
                                    type="submit"
                                    className="flex-3 bg-zinc-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-xl shadow-zinc-200"
                                >
                                    {saving ? 'Saving...' : 'Activate Responder'} <ArrowRight size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
