"use client";

import { useEffect, useState } from "react";
import {
    FileText,
    Plus,
    Copy,
    ExternalLink,
    MoreVertical,
    Users,
    Zap,
    Check,
    Loader2,
    ArrowLeft,
    X,
    Trash2,
    Save
} from "lucide-react";
import Link from "next/link";

export default function EducationForms() {
    const [forms, setForms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copying, setCopying] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [type, setType] = useState("INQUIRY");
    const [fields, setFields] = useState<any[]>([
        { name: "Full Name", type: "text", required: true },
        { name: "Phone Number", type: "tel", required: true }
    ]);
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const res = await fetch("/api/education/forms");
            const data = await res.json();
            if (data.data) setForms(data.data);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreateForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/education/forms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    type,
                    fields,
                    success_msg: successMsg
                })
            });

            if (res.ok) {
                setShowCreateModal(false);
                resetForm();
                fetchForms();
            } else {
                alert("Failed to create form");
            }
        } catch (e) {
            alert("Error creating form");
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setName("");
        setType("INQUIRY");
        setFields([
            { name: "Full Name", type: "text", required: true },
            { name: "Phone Number", type: "tel", required: true }
        ]);
        setSuccessMsg("");
    };

    const addField = () => {
        setFields([...fields, { name: "", type: "text", required: false }]);
    };

    const removeField = (index: number) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const updateField = (index: number, key: string, value: any) => {
        const newFields = [...fields];
        newFields[index][key] = value;
        setFields(newFields);
    };

    const copyToClipboard = (id: string, type: 'link' | 'flow') => {
        const text = type === 'link'
            ? `${window.location.origin}/api/education/forms/submit?formId=${id}`
            : `FLOW_ID: ${id}`;
        navigator.clipboard.writeText(text);
        setCopying(id);
        setTimeout(() => setCopying(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/dashboard/education" className="text-slate-400 hover:text-slate-900 transition-colors">
                            <ArrowLeft size={18} />
                        </Link>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                            Entry Points
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium">Create and manage lead capture forms for your institute.</p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary"
                >
                    <Plus size={18} /> New Lead Form
                </button>
            </div>

            {/* Forms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {forms.length === 0 ? (
                    <div className="lg:col-span-3 py-20 text-center bg-white border border-dashed border-slate-200 rounded-[3rem]">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <FileText size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900">No Lead Forms Yet</h3>
                        <p className="text-slate-500 font-medium mt-2 mb-8">Start capturing student inquiries from WhatsApp or Web.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary"
                        >
                            <Plus size={18} /> Create Your First Form
                        </button>
                    </div>
                ) : (
                    <>
                        {forms.map(form => (
                            <div key={form.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-[1.25rem] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <FileText size={28} />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded uppercase tracking-tighter mb-2">
                                            {form.type}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                                            <Zap size={10} /> AUTO-FOLLOWUP ON
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{form.name}</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">
                                    {form.fields?.length || 0} Dynamic Fields
                                </p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <p className="text-2xl font-black text-slate-900">{form._count?.leads || 0}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leads Captured</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <p className="text-2xl font-black text-slate-900">0%</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conv. Rate</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => copyToClipboard(form.id, 'link')}
                                        className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all group/btn"
                                    >
                                        <span className="flex items-center gap-2"><ExternalLink size={14} /> Direct Public Link</span>
                                        {copying === form.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />}
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(form.id, 'flow')}
                                        className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all group/btn"
                                    >
                                        <span className="flex items-center gap-2"><Zap size={14} /> WhatsApp Flow ID</span>
                                        {copying === form.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* --- CREATE MODAL --- */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">New Entry Point</h2>
                                <p className="text-sm font-medium text-slate-400">Configure your inquiry capture form.</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateForm} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Form Title</label>
                                        <input
                                            required
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="e.g. Website Inquiry Form"
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-50 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Form Context</label>
                                        <select
                                            value={type}
                                            onChange={e => setType(e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-50 transition-all appearance-none"
                                        >
                                            <option value="INQUIRY">Standard Inquiry</option>
                                            <option value="ADMISSION">Course Admission</option>
                                            <option value="CALLBACK">Callback Request</option>
                                            <option value="FEEDBACK">Student Feedback</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900 uppercase">Auto-Logic</h4>
                                            <p className="text-[10px] font-bold text-slate-400">Trigger flows instantly</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white rounded-2xl text-[10px] font-medium text-slate-500 leading-relaxed italic">
                                        "When a lead submits this form, they will receive a personalized WhatsApp greeting automatically."
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dynamic Input Fields</label>
                                    <button
                                        type="button"
                                        onClick={addField}
                                        className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 underline underline-offset-4"
                                    >
                                        + Add Attribute
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {fields.map((field, idx) => (
                                        <div key={idx} className="flex gap-4 items-center animate-in slide-in-from-right-4 duration-300">
                                            <input
                                                required
                                                type="text"
                                                value={field.name}
                                                onChange={e => updateField(idx, 'name', e.target.value)}
                                                placeholder="Field Name"
                                                className="flex-1 bg-slate-50 border-none rounded-xl px-5 py-3 text-xs font-bold text-slate-900"
                                            />
                                            <select
                                                value={field.type}
                                                onChange={e => updateField(idx, 'type', e.target.value)}
                                                className="w-32 bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-900"
                                            >
                                                <option value="text">Text</option>
                                                <option value="tel">Phone</option>
                                                <option value="email">Email</option>
                                                <option value="number">Numeric</option>
                                                <option value="date">Date</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => removeField(idx)}
                                                disabled={field.required}
                                                className="p-3 text-slate-300 hover:text-rose-500 disabled:opacity-20 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Acknowledgment Message (Optional)</label>
                                <textarea
                                    value={successMsg}
                                    onChange={e => setSuccessMsg(e.target.value)}
                                    placeholder="Thank you! We will reach out within 2 hours."
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-50 transition-all h-24 resize-none"
                                />
                            </div>
                        </form>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 h-16 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleCreateForm}
                                disabled={saving}
                                className="flex-[2] h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                {saving ? "Saving Cluster..." : "Deploy Lead Form"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
