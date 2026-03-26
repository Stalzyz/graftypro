
"use client";

import { useState, useEffect, useTransition } from "react";
import { uploadBrandingImage, saveBrandingConfig, loadBrandingConfig } from "./actions";
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
    RefreshCw,
    TrendingUp,
    AlertCircle
} from "lucide-react";

export default function BrandingPanel() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [isPending, startTransition] = useTransition();
    const [config, setConfig] = useState<any>({
        platform_name: "",
        platform_tagline: "",
        support_email: "",
        primary_color: "#27954D",
        secondary_color: "#042F94",
        modules: {}
    });

    useEffect(() => {
        startTransition(async () => {
            const data = await loadBrandingConfig();
            if (data) setConfig(data);
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        startTransition(async () => {
            const result = await saveBrandingConfig(config);
            if (result.success) {
                setMessage("Branding saved successfully.");
                setTimeout(() => setMessage(""), 3000);
            } else {
                setMessage(result.error || "Save failed.");
            }
            setSaving(false);
        });
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
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Branding</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Manage platform branding and modules.</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                    {saving ? "SAVING..." : "SAVE SETTINGS"}
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
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Platform</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Platform Name</label>
                                <input
                                    type="text"
                                    value={config.platform_name}
                                    onChange={e => setConfig({ ...config, platform_name: e.target.value })}
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
                                    placeholder="e.g. Grafty"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Tagline</label>
                                <input
                                    type="text"
                                    value={config.platform_tagline}
                                    onChange={e => setConfig({ ...config, platform_tagline: e.target.value })}
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
                                    placeholder="e.g. Enterprise WhatsApp BSP"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center gap-3 text-slate-500">
                            <Shield size={20} className="text-slate-400" />
                            <div className="text-xs font-bold">
                                File Uploads Locked: Logo and Favicon are strictly managed through static `/grafty.svg` assets.
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-[32px] border border-slate-100 p-10 shadow-sm space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                            <PaletteIcon className="text-slate-400" size={18} />
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Theme</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ColorPicker
                                label="Primary Brand Color"
                                value={config.primary_color}
                                onChange={(val: string) => setConfig({ ...config, primary_color: val })}
                            />
                            <ColorPicker
                                label="Secondary Brand Color"
                                value={config.secondary_color}
                                onChange={(val: string) => setConfig({ ...config, secondary_color: val })}
                            />
                        </div>

                        <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-6">
                            <ThemeToggle label="Light Mode" active={config.theme_mode === 'LIGHT'} onClick={() => setConfig({ ...config, theme_mode: 'LIGHT' })} />
                            <ThemeToggle label="Dark Mode" active={config.theme_mode === 'DARK'} onClick={() => setConfig({ ...config, theme_mode: 'DARK' })} />
                        </div>
                    </section>

                    <section className="bg-white rounded-[32px] border border-slate-100 p-10 shadow-sm space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                            <TrendingUp className="text-slate-400" size={18} />
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">SEO & Social</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Meta Title</label>
                                <input
                                    type="text"
                                    value={config.meta_title}
                                    onChange={e => setConfig({ ...config, meta_title: e.target.value })}
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
                                    placeholder="e.g. Grafty | Best WhatsApp Manager"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Meta Description</label>
                                <textarea
                                    value={config.meta_description}
                                    onChange={e => setConfig({ ...config, meta_description: e.target.value })}
                                    rows={3}
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all resize-none"
                                    placeholder="Briefly describe your platform for search engines..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Sitemap URL</label>
                                <input
                                    type="text"
                                    value={config.sitemap_url}
                                    onChange={e => setConfig({ ...config, sitemap_url: e.target.value })}
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
                                    placeholder="e.g. https://grafty.pro/sitemap.xml"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <LogoUpload label="OG / Social Share Image" value={config.meta_og_image} onChange={(val: string) => setConfig({ ...config, meta_og_image: val })} />
                            <div className="bg-slate-50 rounded-3xl p-6 flex flex-col justify-center gap-2">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <AlertCircle size={14} /> Tips for SEO
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                    • Titles should be under 60 characters.<br/>
                                    • Descriptions should be under 160 characters.<br/>
                                    • Use 1200x630px for OG images to ensure perfect social sharing.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Controls */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-slate-900 rounded-[32px] p-10 text-white space-y-8 shadow-2xl">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                            <Shield className="text-blue-400" size={18} />
                            <h2 className="text-sm font-black uppercase tracking-widest">Modules</h2>
                        </div>

                        <div className="space-y-4">
                            <ModuleToggle label="Commerce" active={config.features?.commerce} onChange={(v: boolean) => setConfig({ ...config, features: { ...config.features, commerce: v } })} />
                            <ModuleToggle label="Automation" active={config.features?.drips} onChange={(v: boolean) => setConfig({ ...config, features: { ...config.features, drips: v } })} />
                            <ModuleToggle label="Flow Builder" active={config.features?.flows} onChange={(v: boolean) => setConfig({ ...config, features: { ...config.features, flows: v } })} />
                            <ModuleToggle label="API" active={config.features?.api} onChange={(v: boolean) => setConfig({ ...config, features: { ...config.features, api: v } })} />
                        </div>
                    </section>

                    <section className="bg-white rounded-[32px] border border-slate-100 p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <Smartphone className="text-slate-400" size={18} />
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Support Links</h2>
                        </div>
                        <InputSmall label="Support Email" value={config.support_email} onChange={(v: string) => setConfig({ ...config, support_email: v })} />
                        <InputSmall label="Support WhatsApp" value={config.support_whatsapp} onChange={(v: string) => setConfig({ ...config, support_whatsapp: v })} />
                    </section>

                    <section className="bg-white rounded-[32px] border border-slate-100 p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <Smartphone className="text-emerald-500" size={18} />
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Floating Widget</h2>
                        </div>
                        <InputSmall label="FAB WhatsApp Number" value={config.fab_whatsapp_number} onChange={(v: string) => setConfig({ ...config, fab_whatsapp_number: v })} />
                        <p className="text-[9px] text-slate-400 font-medium italic italic">This number will be used for the floating WhatsApp button on the landing pages.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}

function LogoUpload({ label, value, onChange }: any) {
    const [uploading, setUploading] = useState(false);
    const [, startTransition] = useTransition();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log("[CLIENT] File selected:", file.name, file.type, file.size);
        setUploading(true);
        
        // Use Server Action directly — no middleware, no fetch(), no cookie issues
        const formData = new FormData();
        formData.append("file", file);
        formData.append("module", "branding");

        console.log("[CLIENT] Dispatching uploadBrandingImage Server Action...");
        startTransition(async () => {
            try {
                const result = await uploadBrandingImage(formData);
                console.log("[CLIENT] Server Action Response:", result);
                if (result.success && result.url) {
                    onChange(result.url);
                } else {
                    alert(result.error || "Upload failed");
                }
            } catch (error: any) {
                console.error("[CLIENT] Upload error catch:", error);
                alert(`Upload failed: ${error.message || error}`);
            } finally {
                setUploading(false);
            }
        });
    };

    return (
        <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{label}</span>
            <label className="h-32 bg-slate-50 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-slate-100 transition-all overflow-hidden relative">
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                />

                {uploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                        <RefreshCw className="animate-spin text-slate-400" size={24} />
                    </div>
                ) : null}

                {value ? (
                    <img src={value} className="w-full h-full object-contain p-4" alt="Logo" />
                ) : (
                    <>
                        <Upload size={20} className="text-slate-500 group-hover:text-slate-900 transition-colors" />
                        <span className="text-[9px] font-black text-slate-500 group-hover:text-slate-900 uppercase">Upload</span>
                    </>
                )}
            </label>
        </div>
    );
}

function ColorPicker({ label, value, onChange }: any) {
    return (
        <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{label}</span>
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
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</label>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-slate-50 border border-transparent rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
            />
        </div>
    );
}
