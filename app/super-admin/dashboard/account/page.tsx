"use client";

import React, { useState, useEffect } from "react";
import {
    ShieldAlert,
    User,
    Mail,
    Save,
    Loader2,
    CheckCircle2,
    Camera,
    Activity,
    Lock,
    Eye,
    EyeOff,
    ShieldCheck
} from "lucide-react";

export default function AdminProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [admin, setAdmin] = useState<any>({
        name: "",
        email: "",
        role: "SUPER_ADMIN",
        avatar_url: "",
        bio: "",
        password: ""
    });

    useEffect(() => {
        fetch("/api/super-admin/profile")
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setAdmin({
                        ...data,
                        password: ""
                    });
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const res = await fetch("/api/super-admin/profile", {
            method: "POST",
            body: JSON.stringify(admin),
            headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
            setMessage("Root Administrator Credentials Synchronized!");
            setAdmin(prev => ({ ...prev, password: "" }));
            setTimeout(() => setMessage(""), 3000);
        }
        setSaving(false);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-rose-600 font-semibold text-[10px] uppercase tracking-[0.2em] mb-3">
                        <Lock size={14} />
                        Highest Privilege Protocol
                    </div>
                    <h1 className="text-4xl font-semibold text-slate-900 tracking-tight italic">Administrator Console</h1>
                    <p className="text-slate-500 text-sm font-medium">Configure global root access and administrative identity.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-4 bg-slate-900 rounded-2xl shadow-xl text-xs font-bold text-white transition-all flex items-center gap-3 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {saving ? "SYNCING PROTOCOLS..." : "Update Master Identity"}
                    </button>
                </div>
            </header>

            {message && (
                <div className="bg-[#27954D]/10 border border-[#27954D]/30 p-5 rounded-3xl flex items-center gap-3 text-[#27954D] font-bold text-sm shadow-sm animate-in zoom-in-95 duration-300">
                    <CheckCircle2 size={18} />
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    {/* Security Credential Matrix */}
                    <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm space-y-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                                    <ShieldAlert size={20} />
                                </div>
                                <h3 className="font-bold text-slate-900 italic uppercase tracking-widest text-sm">Master Identity Matrix</h3>
                            </div>
                            <div className="px-4 py-1.5 bg-rose-50 rounded-full text-[10px] font-black text-rose-600 tracking-widest uppercase border border-rose-100">
                                {admin.role} ACCESS
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Display Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        value={admin.name || ""}
                                        onChange={e => setAdmin({ ...admin, name: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-slate-100 transition-all shadow-inner"
                                        placeholder="Administrator Name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Login Email (Read-Only)</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200" size={18} />
                                    <input
                                        type="email"
                                        value={admin.email}
                                        disabled
                                        className="w-full bg-slate-50/50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-3 pt-4 border-t border-slate-50">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between">
                                    <span>Reset Master Password</span>
                                    <span className="text-[8px] text-slate-300 italic">Leave empty to preserve existing credentials</span>
                                </label>
                                <div className="relative group">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={admin.password || ""}
                                        onChange={e => setAdmin({ ...admin, password: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-12 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-slate-100 transition-all font-mono shadow-inner"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Administrative Bio / Designation</label>
                            <textarea
                                rows={4}
                                value={admin.bio || ""}
                                onChange={e => setAdmin({ ...admin, bio: e.target.value })}
                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-slate-100 transition-all resize-none shadow-inner"
                                placeholder="Describe your administrative scope or role..."
                            />
                        </div>
                    </section>

                    {/* System Activity Hub (Mock) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <Activity className="text-[#27954D]" size={20} />
                                <h3 className="font-bold italic uppercase tracking-widest text-xs">Security Analytics</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-bold opacity-60 uppercase tracking-widest">
                                    <span>Last Master Login</span>
                                    <span>Just Now</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-[#27954D]" />
                                </div>
                                <p className="text-[11px] text-white/50 leading-relaxed italic">
                                    Identity is verified via RSA encryption and session-level tokens. Use extreme caution when updating.
                                </p>
                            </div>
                        </section>

                        <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm italic flex items-center justify-center">
                            <p className="text-xs text-slate-400 leading-relaxed font-bold text-center uppercase tracking-tight">
                                "With great power comes great responsibility. Administrative logs are immutable and monitored."
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    {/* Master Avatar Card */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-50 flex flex-col items-center">
                        <div className="relative group mb-8">
                            <div className="w-40 h-40 rounded-[3rem] bg-slate-100 flex items-center justify-center overflow-hidden border-8 border-slate-50 shadow-inner group transition-transform hover:rotate-3">
                                {admin.avatar_url ? (
                                    <img src={admin.avatar_url} alt="Admin" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                ) : (
                                    <User size={64} className="text-slate-200" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="text-white" size={32} />
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white">
                                <ShieldAlert size={20} />
                            </div>
                        </div>

                        <div className="w-full space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Avatar Resource URL</label>
                                <input
                                    type="text"
                                    value={admin.avatar_url || ""}
                                    onChange={e => setAdmin({ ...admin, avatar_url: e.target.value })}
                                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-900 outline-none transition-all shadow-inner"
                                    placeholder="https://grafty.pro/cdn/root-avatar.png"
                                />
                            </div>

                            <div className="p-6 bg-slate-50 rounded-3xl space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#27954D] animate-ping" />
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active Session</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight">
                                    Your personal branding will be visible across all system-generated audit logs and messages.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
