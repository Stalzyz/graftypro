"use client";

import { KeySquare, Webhook, RefreshCw, Copy, Check, Save } from "lucide-react";
import { useState, useEffect } from "react";

export default function SecurityApiPage() {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [webhookUrl, setWebhookUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedWebhook, setCopiedWebhook] = useState(false);

    useEffect(() => {
        fetch("/api/settings/api-keys")
            .then(res => res.json())
            .then(data => {
                setApiKey(data.apiKey || null);
                setWebhookUrl(data.webhookUrl || '');
                setLoading(false);
            });
    }, []);

    const generateKey = async () => {
        if (!confirm("Generating a new API Key will invalidate your old one. Are you sure?")) return;
        setSaving(true);
        const res = await fetch("/api/settings/api-keys/generate", { method: "POST" });
        const data = await res.json();
        if (data.success) {
            setApiKey(data.apiKey);
        }
        setSaving(false);
    };

    const saveWebhook = async () => {
        setSaving(true);
        const res = await fetch("/api/settings/api-keys", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ webhookUrl })
        });
        const data = await res.json();
        if (data.success) {
            alert('Webhook updated successfully!');
        }
        setSaving(false);
    };

    const copyToClipboard = (text: string, type: 'key' | 'webhook') => {
        navigator.clipboard.writeText(text);
        if (type === 'key') {
            setCopiedKey(true);
            setTimeout(() => setCopiedKey(false), 2000);
        } else {
            setCopiedWebhook(true);
            setTimeout(() => setCopiedWebhook(false), 2000);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><RefreshCw className="animate-spin text-gray-400" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center relative py-10">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-white to-rose-50/50 blur-3xl -z-10" />
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Security & Integrations</h1>
                <p className="text-slate-500 text-base mt-3 max-w-xl mx-auto">
                    Extend your BSP's power with secure API bridges and real-time outbound webhooks for 25+ CRM & Lead platforms.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Developer API Key */}
                <div className="soft-card p-6 border border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                            <KeySquare size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Workspace API Key</h3>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                            Use this key to authenticate external requests (e.g. from Pabbly or custom scripts) to trigger flows and messages. Keep this key completely secret.
                        </p>
                    </div>

                    <div className="mt-8">
                        {apiKey ? (
                            <div className="space-y-4">
                                <div className="flex bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                                    <input
                                        type="text"
                                        readOnly
                                        value={apiKey}
                                        className="bg-transparent px-4 py-3 flex-1 text-sm font-mono text-gray-600 outline-none select-all"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(apiKey, 'key')}
                                        className="px-4 bg-gray-100 border-l border-gray-200 text-gray-600 hover:bg-gray-200 transition-colors"
                                    >
                                        {copiedKey ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <button
                                    onClick={generateKey}
                                    disabled={saving}
                                    className="w-full flex justify-center items-center gap-2 py-3 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition-colors"
                                >
                                    <RefreshCw size={14} className={saving ? "animate-spin" : ""} /> Replace API Key
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={generateKey}
                                disabled={saving}
                                className="w-full flex justify-center items-center gap-2 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors"
                            >
                                <KeySquare size={16} /> Generate Secret Key
                            </button>
                        )}
                    </div>
                </div>

                {/* Outbound Webhook */}
                <div className="soft-card p-6 border border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                                <Webhook size={24} />
                            </div>
                            <span className={`px-2 py-1 text-[10px] font-black uppercase rounded-lg ${webhookUrl ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                                {webhookUrl ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Global Outbound Webhook</h3>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                            Configure an endpoint where we will automatically post incoming messages, lead data, and Form submissions (from your Flow Builder actions).
                        </p>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Endpoint URL</label>
                            <input
                                type="url"
                                value={webhookUrl}
                                onChange={e => setWebhookUrl(e.target.value)}
                                placeholder="https://hook.us1.make.com/..."
                                className="bg-white border border-gray-200 px-4 py-3 rounded-xl w-full text-sm font-mono text-gray-800 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            />
                        </div>
                        <button
                            onClick={saveWebhook}
                            disabled={saving}
                            className={`w-full flex justify-center items-center gap-2 py-3 font-bold text-sm rounded-xl transition-all ${webhookUrl ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                            <Save size={16} /> Save Webhook URL
                        </button>
                    </div>
                </div>
            </div>

            {/* Documentation Mini */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-200/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />

                <div className="relative">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Developer Bridge (V1)</h3>
                            <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
                                Fire flows, send templates, or push direct messages from your external apps.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                const url = `${window.location.origin}/api/v1/trigger`;
                                copyToClipboard(url, 'webhook');
                                alert("API Endpoint copied to clipboard!");
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-all border border-white/5"
                        >
                            <Copy size={14} /> Copy Endpoint URL
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-black/40 rounded-3xl p-6 border border-white/10">
                            <div className="flex items-center gap-3 text-emerald-400 text-[10px] font-black mb-4 uppercase tracking-[0.2em]">
                                <span className="px-2 py-0.5 bg-emerald-400/10 rounded-md">POST</span>
                                <span className="text-slate-500">/api/v1/trigger</span>
                            </div>
                            <pre className="text-indigo-200 font-mono text-[11px] overflow-x-auto custom-scrollbar-dark leading-relaxed">
                                {`{
  "api_key": "YOUR_SECRET_KEY",
  "action": "trigger_flow",
  "phone": "919876543210",
  "flow_id": "IDENTIFIER",
  "parameters": {
    "user_name": "Stalin",
    "order_id": "9942"
  }
}`}
                            </pre>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DocTip title="Multi-Action" desc="Supports flow, template, and raw message push." />
                            <DocTip title="Variable Injection" desc="Parameters map automatically to Flow variables." />
                            <DocTip title="CRM Support" desc="Triggered leads are automatically synced to CRM." />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DocTip({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{title}</h4>
            <p className="text-[11px] text-slate-400 font-medium leading-tight">{desc}</p>
        </div>
    );
}
