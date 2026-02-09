"use client";

import { useState, useEffect } from "react";
import {
    Palette,
    Globe,
    Upload,
    Save,
    CheckCircle,
    Megaphone,
    LifeBuoy,
    TrendingUp,
    Layout,
    Type,
    MousePointer2,
    Shield
} from "lucide-react";

export default function BrandingPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        brand_name: "",
        logo_url: "",
        favicon_url: "",
        primary_color: "#0F172A",
        secondary_color: "#042f94",
        custom_domain: "",
        broadcast_banner: "",
        broadcast_link: "",
        support_email: "",
        support_url: "",
        markup_percentage: 0
    });

    const resellerId = "temp-reseller-id";

    useEffect(() => {
        async function fetchBranding() {
            try {
                const res = await fetch(`/api/reseller/branding?resellerId=${resellerId}`);
                const json = await res.json();
                if (json.success && json.data) {
                    setFormData(prev => ({ ...prev, ...json.data }));
                }
            } catch (e) {
                console.error("Load error", e);
            } finally {
                setLoading(false);
            }
        }
        fetchBranding();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage("");
        try {
            const res = await fetch("/api/reseller/branding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resellerId, ...formData })
            });
            const json = await res.json();
            if (json.success) {
                setMessage("White-label identity synchronized successfully.");
                setTimeout(() => setMessage(""), 3000);
            }
        } catch (e) {
            console.error("Save error", e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Architecting Identity...</p>
        </div>
    );

    return (
        <div className="max-w-6xl animate-fade-in space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl">
                            <Layout className="text-white" size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">White-Label Tower</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-lg max-w-2xl">Configure your agency's brand DNA, custom infrastructure, and network communication.</p>
                </div>
            </header>

            {message && (
                <div className="p-6 bg-[#27954D]/10 text-[#27954D] rounded-3xl border border-[#27954D]/20 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                    <CheckCircle size={20} strokeWidth={3} />
                    <span className="text-sm font-black uppercase tracking-widest">{message}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Configuration Panel */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Visual Identity */}
                    <Section
                        title="Core Identity"
                        description="Define the visual signature of your messaging platform."
                        icon={<Palette size={18} className="text-blue-500" />}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InputGroup label="Platform Architecture Name">
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-100 transition-all outline-none"
                                    placeholder="e.g. Nexus Communications"
                                    value={formData.brand_name || ""}
                                    onChange={e => setFormData({ ...formData, brand_name: e.target.value })}
                                />
                            </InputGroup>
                            <InputGroup label="Whitelabel Primary Domain">
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-100 transition-all outline-none"
                                    placeholder="app.yourdomain.com"
                                    value={formData.custom_domain || ""}
                                    onChange={e => setFormData({ ...formData, custom_domain: e.target.value })}
                                />
                            </InputGroup>
                            <div className="md:col-span-2">
                                <InputGroup label="Brand Asset Logo (Public URL)">
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            className="flex-1 bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-100 transition-all outline-none"
                                            placeholder="https://cloud.cdn.com/logo.png"
                                            value={formData.logo_url || ""}
                                            onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                                        />
                                        <button className="bg-slate-900 text-white px-6 rounded-2xl hover:bg-slate-800 transition-all">
                                            <Upload size={18} />
                                        </button>
                                    </div>
                                </InputGroup>
                            </div>
                            <div className="flex items-center gap-10 bg-slate-50 p-6 rounded-3xl">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Primary Accent</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            className="h-12 w-12 rounded-xl cursor-pointer border-none bg-transparent"
                                            value={formData.primary_color || "#0F172A"}
                                            onChange={e => setFormData({ ...formData, primary_color: e.target.value })}
                                        />
                                        <span className="font-mono text-xs font-bold text-slate-900">{formData.primary_color}</span>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-slate-200" />
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Surface Contrast</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            className="h-12 w-12 rounded-xl cursor-pointer border-none bg-transparent"
                                            value={formData.secondary_color || "#042f94"}
                                            onChange={e => setFormData({ ...formData, secondary_color: e.target.value })}
                                        />
                                        <span className="font-mono text-xs font-bold text-slate-900">{formData.secondary_color}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Network Broadcast */}
                    <Section
                        title="Network Signal"
                        description="Push global announcements to all sub-vendor dashboards."
                        icon={<Megaphone size={18} className="text-orange-500" />}
                    >
                        <div className="space-y-6">
                            <InputGroup label="Network Announcement Banner">
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-100 transition-all outline-none"
                                    placeholder="🎉 Enterprise upgrades now 20% off for active vendors..."
                                    value={formData.broadcast_banner || ""}
                                    onChange={e => setFormData({ ...formData, broadcast_banner: e.target.value })}
                                />
                            </InputGroup>
                            <InputGroup label="Call-to-Action Resource Link">
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-100 transition-all outline-none"
                                    placeholder="https://..."
                                    value={formData.broadcast_link || ""}
                                    onChange={e => setFormData({ ...formData, broadcast_link: e.target.value })}
                                />
                            </InputGroup>
                        </div>
                    </Section>

                    {/* Support & Infrastructure */}
                    <Section
                        title="Partner Logistics"
                        description="Configure technical support and profit mechanics."
                        icon={<LifeBuoy size={18} className="text-purple-500" />}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <InputGroup label="Whitelabel Support Email">
                                <input
                                    type="email"
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-100 transition-all outline-none"
                                    placeholder="support@partner.com"
                                    value={formData.support_email || ""}
                                    onChange={e => setFormData({ ...formData, support_email: e.target.value })}
                                />
                            </InputGroup>
                            <InputGroup label="Technical Documentation URL">
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-100 transition-all outline-none"
                                    placeholder="https://docs.partner.com"
                                    value={formData.support_url || ""}
                                    onChange={e => setFormData({ ...formData, support_url: e.target.value })}
                                />
                            </InputGroup>
                        </div>

                        <div className="bg-slate-50 p-8 rounded-[32px]">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <TrendingUp size={14} className="text-green-600" />
                                        Global Markup Engine
                                    </h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Added to base cost per message</p>
                                </div>
                                <div className="text-4xl font-black text-slate-900">{formData.markup_percentage}%</div>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-900"
                                value={formData.markup_percentage || 0}
                                onChange={e => setFormData({ ...formData, markup_percentage: parseFloat(e.target.value) })}
                            />
                        </div>
                    </Section>

                    <button
                        className="w-full bg-slate-900 text-white p-10 rounded-[48px] font-black text-2xl uppercase tracking-tighter hover:bg-[#27954D] transition-all disabled:bg-slate-200 shadow-2xl shadow-slate-200"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? "DEPLOYING IDENTITY..." : "DEPLOY WHITELABEL CONFIGURATION"}
                    </button>
                </div>

                {/* Live Preview Console */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="sticky top-32">
                        <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden group shadow-3xl">
                            <div className="absolute top-0 right-0 p-8">
                                <span className="text-[10px] font-black bg-white/10 px-4 py-2 rounded-full border border-white/5 uppercase tracking-[0.2em]">Live Simulation</span>
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-12">
                                    {formData.logo_url ? (
                                        <img src={formData.logo_url} className="h-10 w-auto rounded-xl object-contain" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-2xl bg-[#27954D] flex items-center justify-center font-black">
                                            {formData.brand_name?.charAt(0) || "W"}
                                        </div>
                                    )}
                                    <span className="font-black text-lg tracking-tight truncate">{formData.brand_name || "Platform Hub"}</span>
                                </div>

                                <div className="space-y-4 mb-12">
                                    <div className="h-4 w-1/3 bg-white/5 rounded-full" />
                                    <div className="h-2 w-full bg-white/5 rounded-full" />
                                    <div className="h-2 w-full bg-white/5 rounded-full" />
                                    <div className="h-2 w-3/4 bg-white/5 rounded-full" />
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="h-3 w-1/4 bg-white/10 rounded-full" />
                                        <div className="h-10 w-10 rounded-xl bg-white/5" />
                                    </div>
                                    <div
                                        className="h-20 w-full rounded-3xl shadow-lg transition-transform hover:scale-[1.02]"
                                        style={{ backgroundColor: formData.primary_color }}
                                    >
                                        <div className="flex items-center justify-center h-full p-4 overflow-hidden">
                                            <div className="w-full h-1 bg-white/20 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: formData.secondary_color }} />
                        </div>

                        <div className="mt-8 bg-slate-50 p-8 rounded-[40px] border border-slate-100 flex items-center gap-6 group">
                            <div className="w-16 h-16 rounded-[24px] bg-white flex items-center justify-center text-slate-300 group-hover:text-amber-500 transition-colors">
                                <Shield size={32} strokeWidth={1} />
                            </div>
                            <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                                "All sub-vendors linked to your account will inherit this branding DNA across their dashboard, emails, and white-labeled domain."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({ title, description, icon, children }: { title: string, description: string, icon: any, children: React.ReactNode }) {
    return (
        <section className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
                {icon}
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
            </div>
            <p className="text-[11px] font-bold text-slate-400 capitalize tracking-widest mb-10">{description}</p>
            {children}
        </section>
    )
}

function InputGroup({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            {children}
        </div>
    )
}
