"use client";

import { useState, useEffect } from "react";
import {
    AlertTriangle, Power, UserPlus, Megaphone, Clock, Zap,
    Save, RefreshCw, Shield, CheckCircle, XCircle, Info, Bell
} from "lucide-react";

interface PlatformConfig {
    maintenance_mode: boolean;
    maintenance_message: string;
    registration_enabled: boolean;
    require_signup_approval: boolean;
    announcement_banner: string;
    announcement_type: string;
    trial_days: number;
    default_trial_credits: number;
    platform_name: string;
    platform_tagline: string;
    support_email: string;
    support_whatsapp: string;
    meta_title: string;
    meta_description: string;
    meta_og_image: string;
}

export default function PlatformControlCenter() {
    const [config, setConfig] = useState<PlatformConfig>({
        maintenance_mode: false,
        maintenance_message: "We'll be back shortly. Scheduled maintenance in progress.",
        registration_enabled: true,
        require_signup_approval: false,
        announcement_banner: "",
        announcement_type: "info",
        trial_days: 7,
        default_trial_credits: 500,
        platform_name: "Grafty",
        platform_tagline: "",
        support_email: "",
        support_whatsapp: "",
        meta_title: "",
        meta_description: "",
        meta_og_image: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch("/api/super-admin/config")
            .then(r => r.json())
            .then(data => {
                setConfig(prev => ({ ...prev, ...data }));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            await fetch("/api/super-admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            alert("Failed to save. Check console.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <RefreshCw className="animate-spin text-emerald-500" size={32} />
        </div>
    );

    return (
        <div className="space-y-10 pb-20 max-w-5xl">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                        <Shield size={12} /> Platform Operator Controls
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Control Center</h1>
                    <p className="text-slate-400 text-sm font-medium mt-2">
                        Real-time platform controls. Changes take effect immediately without code deployment.
                    </p>
                </div>
                <button
                    onClick={save}
                    disabled={saving}
                    className={`flex items-center gap-3 px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest transition-all shadow-xl ${saved ? "bg-emerald-500 text-white" : "bg-slate-900 text-white hover:bg-slate-800"
                        }`}
                >
                    {saved ? <CheckCircle size={18} /> : saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                    {saved ? "Saved!" : saving ? "Saving..." : "Save All"}
                </button>
            </div>

            {/* Live Status Bar */}
            <div className={`flex items-center gap-4 p-5 rounded-3xl border-2 font-bold text-sm ${config.maintenance_mode
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}>
                <div className={`w-3 h-3 rounded-full ${config.maintenance_mode ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`} />
                Platform Status: {config.maintenance_mode ? "🔴 MAINTENANCE MODE ACTIVE — Platform is offline for users" : "🟢 LIVE — Platform is fully operational"}
            </div>

            {/* ── SECTION 1: Platform Access ── */}
            <Section title="Platform Access Controls" icon={<Power size={18} />} color="rose">
                <ControlRow
                    title="Maintenance Mode"
                    subtitle="Takes the entire platform offline. Users see a maintenance page instead of the app."
                    danger
                >
                    <Toggle
                        value={config.maintenance_mode}
                        onChange={(v) => setConfig({ ...config, maintenance_mode: v })}
                        danger
                    />
                </ControlRow>

                {config.maintenance_mode && (
                    <div className="px-8 pb-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Maintenance Message</label>
                        <textarea
                            rows={2}
                            value={config.maintenance_message || ""}
                            onChange={(e) => setConfig({ ...config, maintenance_message: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 text-sm font-medium outline-none resize-none"
                        />
                    </div>
                )}

                <ControlRow
                    title="New User Registration"
                    subtitle="Disable to stop all new sign-ups (existing users still login normally)."
                >
                    <Toggle
                        value={config.registration_enabled}
                        onChange={(v) => setConfig({ ...config, registration_enabled: v })}
                    />
                </ControlRow>

                <ControlRow
                    title="Require Approval for New Users"
                    subtitle="New registrations go into a 'pending' state until a super admin approves them."
                >
                    <Toggle
                        value={config.require_signup_approval}
                        onChange={(v) => setConfig({ ...config, require_signup_approval: v })}
                    />
                </ControlRow>
            </Section>

            {/* ── SECTION 2: Announcement Banner ── */}
            <Section title="Announcement Banner" icon={<Megaphone size={18} />} color="amber">
                <div className="p-8 space-y-6">
                    <p className="text-xs text-slate-400 font-medium -mt-2">
                        This banner appears at the top of every page for all users. Leave blank to disable.
                    </p>

                    {config.announcement_banner && (
                        <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold ${config.announcement_type === "warning" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                                config.announcement_type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                                    "bg-blue-50 text-blue-800 border border-blue-200"
                            }`}>
                            <Bell size={16} />
                            Preview: {config.announcement_banner}
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                        {["info", "warning", "success"].map(type => (
                            <button
                                key={type}
                                onClick={() => setConfig({ ...config, announcement_type: type })}
                                className={`p-3 rounded-2xl border-2 text-xs font-black uppercase tracking-widest transition-all ${config.announcement_type === type
                                        ? type === "warning" ? "bg-amber-500 text-white border-amber-500"
                                            : type === "success" ? "bg-emerald-500 text-white border-emerald-500"
                                                : "bg-blue-500 text-white border-blue-500"
                                        : "border-slate-100 text-slate-400"
                                    }`}
                            >
                                {type === "info" ? "📘 Info" : type === "warning" ? "⚠️ Warning" : "✅ Success"}
                            </button>
                        ))}
                    </div>

                    <textarea
                        rows={2}
                        value={config.announcement_banner || ""}
                        onChange={(e) => setConfig({ ...config, announcement_banner: e.target.value })}
                        placeholder="e.g. We're upgrading our servers on March 15. Service may be briefly interrupted."
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 text-sm font-medium outline-none resize-none"
                    />
                </div>
            </Section>

            {/* ── SECTION 3: Trial Configuration ── */}
            <Section title="Free Trial Configuration" icon={<Clock size={18} />} color="indigo">
                <div className="p-8 grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Trial Duration (Days)</label>
                        <input
                            type="number"
                            min={1} max={90}
                            value={config.trial_days}
                            onChange={(e) => setConfig({ ...config, trial_days: parseInt(e.target.value) || 7 })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-2xl font-black text-slate-900 outline-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Applied to every new workspace on registration.</p>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Trial Credits (Free)</label>
                        <div className="relative">
                            <Zap size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                            <input
                                type="number"
                                min={0}
                                value={config.default_trial_credits}
                                onChange={(e) => setConfig({ ...config, default_trial_credits: parseInt(e.target.value) || 0 })}
                                className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl pl-10 p-4 text-2xl font-black text-emerald-900 outline-none"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Credits deposited on trial start.</p>
                    </div>
                </div>
            </Section>

            {/* ── SECTION 4: Platform Identity & SEO ── */}
            <Section title="Platform Identity & SEO" icon={<Info size={18} />} color="blue">
                <div className="p-8 grid grid-cols-2 gap-6">
                    <FormField label="Platform Name" value={config.platform_name} onChange={(v) => setConfig({ ...config, platform_name: v })} placeholder="Grafty" />
                    <FormField label="Platform Tagline" value={config.platform_tagline} onChange={(v) => setConfig({ ...config, platform_tagline: v })} placeholder="Turn conversations into revenue." />
                    <FormField label="Support Email" value={config.support_email} onChange={(v) => setConfig({ ...config, support_email: v })} placeholder="support@yourdomain.com" />
                    <FormField label="Support WhatsApp" value={config.support_whatsapp} onChange={(v) => setConfig({ ...config, support_whatsapp: v })} placeholder="+91 9876543210" />
                    <div className="col-span-2">
                        <FormField label="SEO Meta Title" value={config.meta_title} onChange={(v) => setConfig({ ...config, meta_title: v })} placeholder="Grafty — WhatsApp Business Platform" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">SEO Meta Description</label>
                        <textarea
                            rows={2}
                            value={config.meta_description || ""}
                            onChange={(e) => setConfig({ ...config, meta_description: e.target.value })}
                            placeholder="Official WhatsApp API platform for businesses..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 text-sm font-medium outline-none resize-none"
                        />
                    </div>
                    <div className="col-span-2">
                        <FormField label="OG Image URL (Social Preview)" value={config.meta_og_image} onChange={(v) => setConfig({ ...config, meta_og_image: v })} placeholder="https://yourdomain.com/og-image.png" />
                    </div>
                </div>
            </Section>
        </div>
    );
}

function Section({ title, icon, color, children }: { title: string; icon: React.ReactNode; color: string; children: React.ReactNode }) {
    const colors: any = {
        rose: "bg-rose-50 text-rose-600",
        amber: "bg-amber-50 text-amber-600",
        indigo: "bg-indigo-50 text-indigo-600",
        blue: "bg-blue-50 text-blue-600",
    };
    return (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="flex items-center gap-4 p-8 border-b border-slate-50">
                <div className={`w-10 h-10 rounded-2xl ${colors[color]} flex items-center justify-center`}>{icon}</div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">{title}</h2>
            </div>
            {children}
        </div>
    );
}

function ControlRow({ title, subtitle, children, danger }: { title: string; subtitle: string; children: React.ReactNode; danger?: boolean }) {
    return (
        <div className="flex items-center justify-between p-8 border-b border-slate-50 last:border-0">
            <div>
                <p className={`font-black text-sm ${danger ? "text-rose-700" : "text-slate-900"}`}>{title}</p>
                <p className="text-xs text-slate-400 font-medium mt-1 max-w-lg">{subtitle}</p>
            </div>
            {children}
        </div>
    );
}

function Toggle({ value, onChange, danger }: { value: boolean; onChange: (v: boolean) => void; danger?: boolean }) {
    return (
        <button
            onClick={() => onChange(!value)}
            className={`relative w-14 h-7 rounded-full transition-all flex-shrink-0 ${value ? (danger ? "bg-rose-500 shadow-rose-200 shadow-lg" : "bg-emerald-500") : "bg-slate-200"
                }`}
        >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${value ? "left-8" : "left-1"}`} />
        </button>
    );
}

function FormField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{label}</label>
            <input
                type="text"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 text-sm font-medium outline-none focus:border-slate-300 transition-all"
            />
        </div>
    );
}
