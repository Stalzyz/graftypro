"use client";

import React, { useState, useEffect } from "react";
import {
    Palette,
    Type,
    Layout,
    Smartphone,
    Moon,
    Sun,
    Save,
    RotateCcw,
    Sparkles,
    Eye,
    RefreshCw,
    CheckCircle2
} from "lucide-react";
import { SmartUploader } from "../../../../components/ui/SmartUploader";

export default function ThemeControlPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [config, setConfig] = useState<any>({
        primary_color: "#27954D",
        secondary_color: "#042f94",
        theme_mode: "LIGHT",
        border_radius: "12px"
    });

    useEffect(() => {
        fetch("/api/super-admin/config")
            .then(res => res.json())
            .then(data => {
                if (data) setConfig(data);
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
        if (res.ok) {
            setMessage("Theme Protocols Synchronized!");
            setTimeout(() => setMessage(""), 3000);
        }
        setSaving(false);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <RefreshCw className="animate-spin text-slate-300" size={32} />
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#042f94] font-semibold text-[10px] uppercase tracking-[0.2em] mb-3">
                        <Palette size={14} />
                        Visual Identity System
                    </div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight italic">Theme Control</h1>
                    <p className="text-slate-400 text-sm font-medium">Design and deploy the platform's global aesthetic.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl shadow-sm text-xs font-bold text-slate-600 transition-all flex items-center gap-2 active:scale-95">
                        <RotateCcw size={14} />
                        Reset Defaults
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 bg-[#042f94] rounded-2xl shadow-lg shadow-[#042f94]/10 text-xs font-bold text-white transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                        {saving ? "SYNCING..." : "Deploy Changes"}
                    </button>
                </div>
            </header>

            {message && (
                <div className="bg-[#27954D]/10 border border-[#27954D]/20 p-4 rounded-2xl flex items-center gap-3 text-[#27954D] font-bold text-sm animate-in fade-in slide-in-from-top-4">
                    <CheckCircle2 size={18} />
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    {/* Logo Management */}
                    <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <Layout size={20} />
                            </div>
                            <h3 className="font-bold text-slate-800 italic uppercase tracking-widest text-sm">Asset Repository (Logos)</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SmartUploader
                                label="Primary Logo"
                                defaultValue={config.logo_url}
                                onUploadSuccess={(url) => setConfig({ ...config, logo_url: url })}
                                description="Main brand identifier (PNG/SVG)"
                            />
                            <SmartUploader
                                label="Dark Mode Logo"
                                defaultValue={config.dark_logo_url}
                                onUploadSuccess={(url) => setConfig({ ...config, dark_logo_url: url })}
                                description="Logo for high-contrast dark themes"
                            />
                            <SmartUploader
                                label="Favicon"
                                defaultValue={config.favicon_url}
                                onUploadSuccess={(url) => setConfig({ ...config, favicon_url: url })}
                                description="Browser tab icon (32x32)"
                            />
                            <SmartUploader
                                label="Dashboard Logo"
                                defaultValue={config.dashboard_logo_url}
                                onUploadSuccess={(url) => setConfig({ ...config, dashboard_logo_url: url })}
                                description="Compact logo for sidebar navigation"
                            />
                            <SmartUploader
                                label="Reseller Logo"
                                defaultValue={config.reseller_logo_url}
                                onUploadSuccess={(url) => setConfig({ ...config, reseller_logo_url: url })}
                                description="Default logo for reseller portals"
                            />
                            <SmartUploader
                                label="Partner Logo"
                                defaultValue={config.partner_logo_url}
                                onUploadSuccess={(url) => setConfig({ ...config, partner_logo_url: url })}
                                description="Logo for affiliate/partner dashboards"
                            />
                        </div>
                    </section>

                    {/* Color Palette */}
                    <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-2xl bg-[#27954D]/10 flex items-center justify-center text-[#27954D]">
                                <Sparkles size={20} />
                            </div>
                            <h3 className="font-bold text-slate-800 italic uppercase tracking-widest text-sm">Color Orchestration</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ColorInput
                                label="Primary Brand Core"
                                value={config.primary_color}
                                onChange={(val: string) => setConfig({ ...config, primary_color: val })}
                                description="Dominant color for CTA, primary icons and headers."
                            />
                            <ColorInput
                                label="Secondary Accent"
                                value={config.secondary_color}
                                onChange={(val: string) => setConfig({ ...config, secondary_color: val })}
                                description="Used for secondary interactions and background shades."
                            />
                        </div>
                    </section>

                    {/* Typography & Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                            <h3 className="font-bold text-slate-800 italic uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
                                <Type size={14} /> Typography Matrix
                            </h3>
                            <div className="space-y-4">
                                <FontOption label="Primary Display" value="Outfit" />
                                <FontOption label="Secondary Sans" value="Inter" />
                                <FontOption label="Developer Mono" value="JetBrains Mono" />
                            </div>
                        </section>

                        <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                            <h3 className="font-bold text-slate-800 italic uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
                                <Layout size={14} /> Interface Density
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                <DensityCard label="Relaxed" active={config.border_radius === '16px'} onClick={() => setConfig({ ...config, border_radius: '16px' })} />
                                <DensityCard label="Modern" active={config.border_radius === '12px'} onClick={() => setConfig({ ...config, border_radius: '12px' })} />
                                <DensityCard label="Compact" active={config.border_radius === '4px'} onClick={() => setConfig({ ...config, border_radius: '4px' })} />
                            </div>
                        </section>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Live Preview Card */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20" style={{ backgroundColor: config.primary_color }} />
                        <h3 className="text-white font-bold italic uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                            <Eye size={14} /> Real-time Render
                        </h3>

                        <div className="space-y-6">
                            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-xl" style={{ backgroundColor: config.primary_color }}></div>
                                    <div className="h-2 w-24 bg-white/20 rounded-full"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-1.5 w-full bg-white/5 rounded-full"></div>
                                    <div className="h-1.5 w-2/3 bg-white/5 rounded-full"></div>
                                </div>
                            </div>

                            <button className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all" style={{ backgroundColor: config.primary_color, color: 'white', borderRadius: config.border_radius }}>
                                Interactive Preview
                            </button>

                            <div className="flex justify-center gap-4 pt-4">
                                <button
                                    onClick={() => setConfig({ ...config, theme_mode: 'LIGHT' })}
                                    className={`p-3 rounded-xl transition-colors ${config.theme_mode === 'LIGHT' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
                                >
                                    <Sun size={20} />
                                </button>
                                <button
                                    onClick={() => setConfig({ ...config, theme_mode: 'DARK' })}
                                    className={`p-3 rounded-xl transition-colors ${config.theme_mode === 'DARK' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
                                >
                                    <Moon size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm italic">
                        <p className="text-xs text-slate-400 leading-relaxed">
                            "Visual consistency drives platform trust. Use monochromatic scales to improve accessibility while maintaining brand prestige."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ColorInput({ label, value, onChange, description }: any) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{label}</label>
            <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-transparent focus-within:border-slate-200 transition-all">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                />
                <div className="flex-1">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="bg-transparent border-none text-sm font-bold text-slate-800 uppercase tracking-widest focus:ring-0 w-full"
                    />
                    <p className="text-[10px] text-slate-500 font-medium mt-1">{description}</p>
                </div>
            </div>
        </div>
    );
}

function FontOption({ label, value }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-white border border-transparent hover:border-slate-100 transition-all cursor-pointer">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600">{label}</span>
            <span className="text-sm font-bold text-slate-800 italic">{value}</span>
        </div>
    );
}

function DensityCard({ label, active, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${active
                ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                }`}
        >
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
    );
}
