
"use client";

import { useState, useEffect } from "react";
import {
    Save,
    Upload,
    Palette as PaletteIcon,
    Globe,
    Shield,
    Mail,
    Smartphone,
    Layout,
    CheckCircle2,
    RefreshCw
} from "lucide-react";

export default function BrandingPanel() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [config, setConfig] = useState<any>({
        platform_name: "",
        platform_tagline: "",
        support_email: "",
        primary_color: "#27954D",
        secondary_color: "#042F94",
        modules: {}
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
            setMessage("Configuration Synchronized Successfully!");
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
        <div className="max-w-6xl space-y-10 pb-20">
            <header className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <PaletteIcon className="text-white" size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Branding</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Control the global visual identity and system-wide module toggles.</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                    {saving ? "SYNCING..." : "SAVE CHANGES"}
                </button>
            </header>

            {message && (
                <div className="bg-[#27954D]/10 border border-[#27954D]/20 p-4 rounded-2xl flex items-center gap-3 text-[#27954D] font-bold text-sm animate-in fade-in slide-in-from-top-4">
                    <CheckCircle2 size={18} />
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Identity */}
                <div className="lg:col-span-8 space-y-8">
                    <section className="bg-white rounded-[32px] border border-slate-100 p-10 shadow-sm space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                            <Globe className="text-slate-400" size={18} />
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Core Identity</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Platform Name</label>
                                <input
                                    type="text"
                                    value={config.platform_name}
                                    onChange={e => setConfig({ ...config, platform_name: e.target.value })}
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
                                    placeholder="e.g. WAVO"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tagline</label>
                                <input
                                    type="text"
                                    value={config.platform_tagline}
                                    onChange={e => setConfig({ ...config, platform_tagline: e.target.value })}
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
                                    placeholder="e.g. Enterprise WhatsApp BSP"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <LogoUpload label="Main Logo" value={config.logo_url} onChange={val => setConfig({ ...config, logo_url: val })} />
                            <LogoUpload label="Favicon" value={config.favicon_url} onChange={val => setConfig({ ...config, favicon_url: val })} />
                            <LogoUpload label="Login Logo" value={config.login_logo_url} onChange={val => setConfig({ ...config, login_logo_url: val })} />
                        </div>
                    </section>

                    <section className="bg-white rounded-[32px] border border-slate-100 p-10 shadow-sm space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                            <PaletteIcon className="text-slate-400" size={18} />
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Visual Theme</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ColorPicker
                                label="Primary Brand Color"
                                value={config.primary_color}
                                onChange={val => setConfig({ ...config, primary_color: val })}
                            />
                            <ColorPicker
                                label="Secondary Brand Color"
                                value={config.secondary_color}
                                onChange={val => setConfig({ ...config, secondary_color: val })}
                            />
                        </div>

                        <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-6">
                            <ThemeToggle label="Light Mode" active={config.theme_mode === 'LIGHT'} onClick={() => setConfig({ ...config, theme_mode: 'LIGHT' })} />
                            <ThemeToggle label="Dark Mode" active={config.theme_mode === 'DARK'} onClick={() => setConfig({ ...config, theme_mode: 'DARK' })} />
                        </div>
                    </section>
                </div>

                {/* Sidebar Controls */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-slate-900 rounded-[32px] p-10 text-white space-y-8 shadow-2xl">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                            <Shield className="text-blue-400" size={18} />
                            <h2 className="text-sm font-black uppercase tracking-widest">Module Engine</h2>
                        </div>

                        <div className="space-y-4">
                            <ModuleToggle label="Commerce Hub" active={config.modules?.commerce} onChange={v => setConfig({ ...config, modules: { ...config.modules, commerce: v } })} />
                            <ModuleToggle label="Drip Automation" active={config.modules?.drips} onChange={v => setConfig({ ...config, modules: { ...config.modules, drips: v } })} />
                            <ModuleToggle label="Reseller Network" active={config.modules?.reseller} onChange={v => setConfig({ ...config, modules: { ...config.modules, reseller: v } })} />
                            <ModuleToggle label="White Labeling" active={config.modules?.white_label} onChange={v => setConfig({ ...config, modules: { ...config.modules, white_label: v } })} />
                            <ModuleToggle label="Developer APIs" active={config.modules?.api_access} onChange={v => setConfig({ ...config, modules: { ...config.modules, api_access: v } })} />
                        </div>
                    </section>

                    <section className="bg-white rounded-[32px] border border-slate-100 p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <Smartphone className="text-slate-400" size={18} />
                            <h2 className="text-xs font-black uppercase tracking-widest">Support Links</h2>
                        </div>
                        <InputSmall label="Support Email" value={config.support_email} onChange={v => setConfig({ ...config, support_email: v })} />
                        <InputSmall label="Support WhatsApp" value={config.support_whatsapp} onChange={v => setConfig({ ...config, support_whatsapp: v })} />
                    </section>
                </div>
            </div>
        </div>
    );
}

function LogoUpload({ label, value, onChange }: any) {
    return (
        <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</span>
            <div className="h-32 bg-slate-50 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-slate-100 transition-all overflow-hidden relative">
                {value ? (
                    <img src={value} className="w-full h-full object-contain p-4" />
                ) : (
                    <>
                        <Upload size={20} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                        <span className="text-[9px] font-black text-slate-300 group-hover:text-slate-900 uppercase">Upload</span>
                    </>
                )}
            </div>
        </div>
    );
}

function ColorPicker({ label, value, onChange }: any) {
    return (
        <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</span>
            <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4">
                <input
                    type="color"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-12 h-12 rounded-xl border-none cursor-pointer bg-transparent"
                />
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="flex-1 bg-transparent border-none text-sm font-bold text-slate-900 focus:ring-0"
                />
            </div>
        </div>
    );
}

function ModuleToggle({ label, active, onChange }: any) {
    return (
        <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-tight">{label}</span>
            <button
                onClick={() => onChange(!active)}
                className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-blue-600' : 'bg-white/10'}`}
            >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? 'right-1' : 'left-1'}`} />
            </button>
        </label>
    );
}

function ThemeToggle({ label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${active ? 'bg-slate-900 text-white border-slate-900 bg-shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}
        >
            {label}
        </button>
    );
}

function InputSmall({ label, value, onChange }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-slate-50 border border-transparent rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
            />
        </div>
    );
}
