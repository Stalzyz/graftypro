"use client";

import { useState, useEffect } from "react";
import {
    Key,
    Save,
    RefreshCw,
    Shield,
    Facebook,
    Chrome, // For Google
    Radio,  // For Pusher
    Settings
} from "lucide-react";

export default function AuthSettingsPage() {
    const [config, setConfig] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // We need to fetch SECRET config too, or at least public placeholders
        // Actually, we usually don't send back secrets. We just send empty or masked.
        // User inputs new secret to update.
        fetch("/api/super-admin/config")
            .then(res => res.json())
            .then(data => {
                setConfig(data); // This might not include secrets, which is fine.
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const res = await fetch("/api/super-admin/config", {
            method: "POST",
            body: JSON.stringify(config),
            headers: { "Content-Type": "application/json" }
        });
        if (res.ok) alert("Security Protocol Updated");
        else alert("Update Failed");
        setSaving(false);
    };

    return (
        <div className="max-w-7xl space-y-12 pb-20 font-sans">
            <header className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <Key className="text-white" size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Authentication Hooks</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Configure external identity providers and real-time socket security.</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                        Sync Protocols
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* OAuth Providers */}
                <section className="bg-white rounded-[40px] border border-slate-100 p-10 space-y-8 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                        <Shield className="text-blue-600" size={20} />
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">OAuth2 Identity</h2>
                    </div>

                    <div className="space-y-8">
                        {/* Google */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Chrome size={16} className="text-slate-500" />
                                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Google Workspace</span>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <SettingInput
                                    label="Client ID"
                                    value={config.google_client_id}
                                    onChange={(v) => setConfig({ ...config, google_client_id: v })}
                                />
                                <SettingInput
                                    label="Client Secret"
                                    value={config.google_client_secret}
                                    onChange={(v) => setConfig({ ...config, google_client_secret: v })}
                                    type="password"
                                    placeholder="••••••••••••••••"
                                />
                            </div>
                        </div>

                        {/* Facebook */}
                        <div className="space-y-4 pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2 mb-2">
                                <Facebook size={16} className="text-blue-600" />
                                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Meta / Facebook</span>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <SettingInput
                                    label="App ID"
                                    value={config.facebook_client_id}
                                    onChange={(v) => setConfig({ ...config, facebook_client_id: v })}
                                />
                                <SettingInput
                                    label="App Secret"
                                    value={config.facebook_client_secret}
                                    onChange={(v) => setConfig({ ...config, facebook_client_secret: v })}
                                    type="password"
                                    placeholder="••••••••••••••••"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Realtime (Pusher) */}
                <section className="bg-white rounded-[40px] border border-slate-100 p-10 space-y-8 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                        <Radio className="text-pink-600" size={20} />
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Realtime Engine (Pusher)</h2>
                    </div>

                    <div className="space-y-4">
                        <SettingInput
                            label="App ID"
                            value={config.pusher_app_id}
                            onChange={(v) => setConfig({ ...config, pusher_app_id: v })}
                        />
                        <SettingInput
                            label="Key"
                            value={config.pusher_key}
                            onChange={(v) => setConfig({ ...config, pusher_key: v })}
                        />
                        <SettingInput
                            label="Secret"
                            value={config.pusher_secret}
                            onChange={(v) => setConfig({ ...config, pusher_secret: v })}
                            type="password"
                            placeholder="••••••••••••••••"
                        />
                        <SettingInput
                            label="Cluster"
                            value={config.pusher_cluster}
                            onChange={(v) => setConfig({ ...config, pusher_cluster: v })}
                            placeholder="mt1"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}

function SettingInput({ label, value, onChange, type = "text", placeholder = "", description = "" }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
            <input
                type={type}
                className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 shadow-inner outline-none focus:bg-white transition-all focus:border-slate-100 placeholder:text-slate-500"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
            {description && <p className="text-[10px] text-slate-400 font-medium px-1 italic">{description}</p>}
        </div>
    );
}
