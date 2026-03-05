"use client";

import { useState, useEffect } from "react";
import {
    Mail,
    Plus,
    Search,
    ChevronRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Edit3,
    BarChart,
    Settings,
    FileCode,
    Zap,
    Save,
    RefreshCw,
    TestTube,
    Send
} from "lucide-react";

export default function EmailAutomationHub() {
    const [config, setConfig] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testEmail, setTestEmail] = useState("");

    const [templates, setTemplates] = useState<any[]>([]);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Fetch Config
        fetch("/api/super-admin/config")
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                setLoading(false);
            });

        // Fetch Templates
        fetchTemplates();
    }, []);

    const fetchTemplates = () => {
        fetch("/api/super-admin/email/templates")
            .then(res => res.json())
            .then(data => {
                if (data.success) setTemplates(data.data);
            });
    };

    const handleSaveConfig = async () => {
        setSaving(true);
        const res = await fetch("/api/super-admin/config", {
            method: "POST",
            body: JSON.stringify(config),
            headers: { "Content-Type": "application/json" }
        });
        if (res.ok) alert("Email Infrastructure Updated");
        setSaving(false);
    };

    const handleSaveTemplate = async () => {
        if (!editingTemplate) return;

        const isNew = !editingTemplate.id;
        const url = isNew ? "/api/super-admin/email/templates" : `/api/super-admin/email/templates/${editingTemplate.id}`;
        const method = isNew ? "POST" : "PATCH";

        const res = await fetch(url, {
            method,
            body: JSON.stringify(editingTemplate),
            headers: { "Content-Type": "application/json" }
        });

        if (res.ok) {
            alert(isNew ? "Template Created" : "Template Updated");
            setIsModalOpen(false);
            fetchTemplates();
        } else {
            alert("Failed to save template");
        }
    };

    const deleteTemplate = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await fetch(`/api/super-admin/email/templates/${id}`, { method: "DELETE" });
        fetchTemplates();
    };

    const handleTest = async () => {
        if (!testEmail) return alert("Enter test email");
        setTesting(true);
        // We'll rely on handleSave first to ensure latest config is used
        await handleSaveConfig();

        const res = await fetch("/api/super-admin/email/test", {
            method: "POST",
            body: JSON.stringify({ to: testEmail }),
            headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        if (data.success) alert("Test signal dispatched successfully.");
        else alert("Signal failure: " + data.error);
        setTesting(false);
    };

    return (
        <div className="max-w-7xl space-y-12 pb-20 font-sans relative">
            {/* Template Editor Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-black text-slate-900">{editingTemplate?.id ? 'Edit Protocol' : 'New Protocol'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="bg-white p-2 rounded-xl text-slate-400 hover:text-red-500 transition-colors shadow-sm">
                                <AlertCircle size={20} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-6">
                                <SettingInput
                                    label="Protocol Slug (Unique)"
                                    value={editingTemplate?.slug}
                                    onChange={(v) => setEditingTemplate({ ...editingTemplate, slug: v })}
                                    description="e.g. vendor-onboarding"
                                />
                                <SettingInput
                                    label="Subject Line"
                                    value={editingTemplate?.subject}
                                    onChange={(v) => setEditingTemplate({ ...editingTemplate, subject: v })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">HTML Body Content</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-xs font-mono text-slate-900 shadow-inner outline-none focus:bg-white transition-all min-h-[200px]"
                                    value={editingTemplate?.body_html || ""}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, body_html: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors text-xs uppercase tracking-widest">Cancel</button>
                            <button onClick={handleSaveTemplate} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors shadow-lg shadow-slate-200">Save Protocol</button>
                        </div>
                    </div>
                </div>
            )}

            <header className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <Mail className="text-white" size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Signal Flow</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Automated communication protocols, lifecycle emails, and notification logic.</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            setEditingTemplate({ slug: "", subject: "", body_html: "", is_active: true });
                            setIsModalOpen(true);
                        }}
                        className="px-6 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <Plus size={14} />
                        New Blueprint
                    </button>
                    <button
                        onClick={handleSaveConfig}
                        disabled={saving}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                        Sync Infrastructure
                    </button>
                </div>
            </header>

            {/* SMTP Infrastructure */}
            <section className="bg-white rounded-[40px] border border-slate-100 p-12 space-y-10 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                    <div className="flex items-center gap-3">
                        <Settings className="text-slate-900" size={20} />
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">SMTP Backbone</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                        <SettingInput
                            label="SMTP Host"
                            value={config.smtp_host}
                            onChange={(v: string) => setConfig({ ...config, smtp_host: v })}
                        />
                    </div>
                    <SettingInput
                        label="Port"
                        value={config.smtp_port}
                        onChange={(v: string) => setConfig({ ...config, smtp_port: parseInt(v) })}
                    />
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Encryption</label>
                        <select
                            className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 shadow-inner outline-none focus:bg-white transition-all"
                            value={config.smtp_encryption}
                            onChange={(e) => setConfig({ ...config, smtp_encryption: e.target.value })}
                        >
                            <option value="TLS">TLS (587)</option>
                            <option value="SSL">SSL (465)</option>
                            <option value="NONE">None</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SettingInput
                        label="SMTP Username"
                        value={config.smtp_user}
                        onChange={(v: string) => setConfig({ ...config, smtp_user: v })}
                    />
                    <SettingInput
                        label="SMTP Password"
                        type="password"
                        value={config.smtp_pass}
                        onChange={(v: string) => setConfig({ ...config, smtp_pass: v })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SettingInput
                        label="From Name"
                        value={config.smtp_from_name}
                        onChange={(v: string) => setConfig({ ...config, smtp_from_name: v })}
                    />
                    <SettingInput
                        label="From Email"
                        value={config.smtp_from_email}
                        onChange={(v: string) => setConfig({ ...config, smtp_from_email: v })}
                    />
                </div>

                <div className="pt-6 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 max-w-md">
                        <SettingInput
                            label="Test Receiver Address"
                            value={testEmail}
                            onChange={setTestEmail}
                            description="Enter an email to test your signal flow."
                        />
                    </div>
                    <button
                        onClick={handleTest}
                        disabled={testing}
                        className="px-8 py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {testing ? <RefreshCw className="animate-spin" size={14} /> : <Send size={14} />}
                        {testing ? "Sending..." : "Dispatch Test Signal"}
                    </button>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-[40px] border border-slate-100 p-8 space-y-6 shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                        <Zap size={64} className="text-blue-500" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Triggers</h3>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">14</p>
                        <div className="flex items-center gap-2 text-[#27954D] font-bold text-[10px] uppercase tracking-widest">
                            <CheckCircle2 size={12} /> Sync Healthy
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] border border-slate-100 p-8 space-y-6 shadow-sm">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Monthly Volume</h3>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">84.2K</p>
                        <div className="flex items-center gap-2 text-blue-500 font-bold text-[10px] uppercase tracking-widest">
                            <BarChart size={12} /> Delivery Rate 99.8%
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] border border-slate-100 p-8 space-y-6 shadow-sm">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Infrastructure</h3>
                        <div className="pt-2 flex items-center gap-4">
                            <ProviderBadge label="Postmark" active />
                            <ProviderBadge label="SendGrid" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Blueprint Registry
                        <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase">{templates.length} Active</span>
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input
                            type="text"
                            placeholder="Search Templates..."
                            className="bg-slate-50 border-none rounded-2xl pl-10 pr-6 py-3 text-xs font-bold w-64 focus:ring-2 focus:ring-slate-100 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Name</th>
                                <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Slug (Trigger)</th>
                                <th className="text-center px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="text-center px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Updated</th>
                                <th className="text-right px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {templates.map((tpl) => (
                                <tr key={tpl.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-black text-slate-900 tracking-tight">{tpl.subject}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                                                <FileCode size={10} /> {tpl.id}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                            <span className="text-xs font-bold text-slate-700">{tpl.slug}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${tpl.is_active ? 'bg-[#27954D]/10 text-[#27954D]' : 'bg-slate-100 text-slate-400'}`}>
                                            {tpl.is_active ? 'ACTIVE' : 'INNACTIVE'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(tpl.updated_at).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-10 py-8 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingTemplate(tpl);
                                                setIsModalOpen(true);
                                            }}
                                            className="px-6 py-2.5 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-slate-700 transition-all"
                                        >
                                            Engineer
                                        </button>
                                        <button
                                            onClick={() => deleteTemplate(tpl.id)}
                                            className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                                        >
                                            <AlertCircle size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function ProviderBadge({ label, active = false }: any) {
    return (
        <div className={`p-4 rounded-3xl border flex items-center justify-between gap-6 transition-all ${active ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white border-slate-100 text-slate-400 grayscale opacity-50'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            <Settings size={14} />
        </div>
    );
}

function SettingInput({ label, value, onChange, type = "text", description = "" }: { label: string, value: any, onChange: (val: any) => void, type?: string, description?: string }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
            <input
                type={type}
                className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 shadow-inner outline-none focus:bg-white transition-all focus:border-slate-100 placeholder:text-slate-500"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
            />
            {description && <p className="text-[10px] text-slate-400 font-medium px-1 italic">{description}</p>}
        </div>
    );
}
