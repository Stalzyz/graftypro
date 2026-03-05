"use client";

import { useState, useEffect } from "react";
import { X, User, Phone, Mail, DollarSign, Tag, Briefcase, Plus } from "lucide-react";

interface AddLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    stages: any[];
    columns?: any[];
}

export function AddLeadModal({ isOpen, onClose, onSuccess, stages, columns = [] }: AddLeadModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        source: "DIRECT",
        deal_value: 0,
        status: "NEW",
        stage_id: "",
        custom_data: {} as Record<string, any>
    });

    useEffect(() => {
        if (stages && stages.length > 0 && !formData.stage_id) {
            setFormData(prev => ({ ...prev, stage_id: stages[0].id }));
        }
    }, [stages]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/crm/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                onSuccess();
                onClose();
                setFormData({
                    name: "",
                    phone: "",
                    email: "",
                    source: "DIRECT",
                    deal_value: 0,
                    status: "NEW",
                    stage_id: stages[0]?.id || "",
                    custom_data: {}
                });
            } else {
                const data = await res.json();
                alert(data.error || "Failed to add lead");
            }
        } catch (error) {
            console.error("Add Lead Error:", error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white overflow-hidden animate-in fade-in zoom-in duration-300">
                <header className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Plus size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Create New Lead</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Add to Universal CRM Index</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 font-bold">
                        <X size={20} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Primary Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    required
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Phone & Email */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Phone (WhatsApp)</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                                    <input
                                        type="tel"
                                        placeholder="919876543210"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Deal Value & Stage */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Deal Value (₹)</label>
                                <div className="relative group">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.deal_value}
                                        onChange={(e) => setFormData({ ...formData, deal_value: parseFloat(e.target.value) })}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Pipeline Stage</label>
                                <div className="relative group">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                                    <select
                                        value={formData.stage_id}
                                        onChange={(e) => setFormData({ ...formData, stage_id: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                                    >
                                        <option value="">Select Stage</option>
                                        {stages.map(stage => (
                                            <option key={stage.id} value={stage.id}>{stage.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Source */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Lead Source</label>
                            <div className="relative group">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                                <select
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                                >
                                    <option value="DIRECT">DIRECT</option>
                                    <option value="WHATSAPP">WHATSAPP</option>
                                    <option value="FACEBOOK">FACEBOOK</option>
                                    <option value="INSTAGRAM">INSTAGRAM</option>
                                    <option value="WEBSITE">WEBSITE</option>
                                    <option value="REFERRAL">REFERRAL</option>
                                </select>
                            </div>
                        </div>

                        {/* Custom Columns */}
                        {columns.length > 0 && (
                            <div className="pt-4 mt-2 border-t border-slate-100">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Custom Attributes</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {columns.filter(c => c.is_visible).map(col => (
                                        <div key={col.key} className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">{col.name}</label>
                                            <input
                                                type={col.type === 'NUMBER' ? 'number' : col.type === 'DATE' ? 'date' : 'text'}
                                                placeholder={col.name}
                                                value={formData.custom_data[col.key] || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    custom_data: { ...formData.custom_data, [col.key]: e.target.value }
                                                })}
                                                className="w-full px-4 py-3 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4">
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 transform active:scale-[0.98]"
                        >
                            {loading ? "PROCESING..." : "CREATE LEAD"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
