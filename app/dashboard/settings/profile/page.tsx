
"use client";

import React, { useState, useEffect } from "react";
import {
    User,
    Mail,
    Briefcase,
    Phone,
    Save,
    Loader2,
    CheckCircle2,
    Camera,
    ChevronLeft,
    PenSquare,
    Lock,
    CreditCard
} from "lucide-react";
import Link from "next/link";

export default function UserProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [profile, setProfile] = useState<any>({
        first_name: "",
        last_name: "",
        email: "",
        job_title: "",
        phone: "",
        avatar_url: "",
        bio: "",
        workspace_name: ""
    });

    useEffect(() => {
        fetch("/api/auth/me")
            .then(res => res.json())
            .then(data => {
                if (data && !data.error && data.user) {
                    setProfile({
                        ...data.user,
                        workspace_name: data.user.workspace?.name || "",
                        billing_gstin: data.user.workspace?.billing_gstin || "",
                        billing_address: data.user.workspace?.billing_address || "",
                        bank_name: data.user.workspace?.bank_name || "",
                        account_number: data.user.workspace?.account_number || "",
                        ifsc_code: data.user.workspace?.ifsc_code || "",
                        timezone: data.user.workspace?.timezone || "UTC"
                    });
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const res = await fetch("/api/auth/me", {
            method: "POST",
            body: JSON.stringify(profile),
            headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
            setMessage("Profile Updated Successfully!");
            setTimeout(() => setMessage(""), 3000);
            window.location.reload(); // Hard reload to reflect changes
        } else {
            try {
                const data = await res.json();
                setMessage(data.error || "Error updating profile.");
            } catch (e) {
                setMessage(`Error: ${res.status} ${res.statusText}`);
            }
        }
        setSaving(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setSaving(true);
            const res = await fetch("/api/uploads", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                setProfile({ ...profile, avatar_url: data.url });
                setMessage("Image uploaded! Click Save.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };


    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
            <header className="space-y-4">
                <Link href="/dashboard/settings" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
                    <ChevronLeft size={16} /> Back to Settings
                </Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Company Profile</h1>
                        <p className="text-slate-500 text-sm font-medium">Manage your business identity and billing credentials.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3.5 bg-slate-900 rounded-2xl shadow-lg text-xs font-bold text-white transition-all flex items-center gap-3 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {saving ? "SAVING..." : "Update Profile"}
                    </button>
                </div>
            </header>

            {message && (
                <div className="bg-[#27954D]/10 border border-[#27954D]/30 p-4 rounded-2xl flex items-center gap-3 text-[#27954D] font-bold text-sm">
                    <CheckCircle2 size={18} />
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    {/* Basic Info */}
                    <section className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <PenSquare size={14} /> Identity Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                                <input
                                    type="text"
                                    value={profile.first_name || ""}
                                    onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none transition-all shadow-inner"
                                    placeholder="Enter your first name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                                <input
                                    type="text"
                                    value={profile.last_name || ""}
                                    onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none transition-all shadow-inner"
                                    placeholder="Enter your last name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Company / Brand Name</label>
                            <input
                                type="text"
                                value={profile.workspace_name || ""}
                                onChange={e => setProfile({ ...profile, workspace_name: e.target.value })}
                                className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none transition-all shadow-inner"
                                placeholder="Your Company Name"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">GSTIN Number</label>
                                <input
                                    type="text"
                                    value={profile.billing_gstin || ""}
                                    onChange={e => setProfile({ ...profile, billing_gstin: e.target.value })}
                                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none transition-all shadow-inner"
                                    placeholder="27AAAAA0000A1Z5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                                <input
                                    type="tel"
                                    value={profile.phone || ""}
                                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none transition-all shadow-inner"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Workspace Timezone</label>
                                <select
                                    value={profile.timezone || "UTC"}
                                    onChange={e => setProfile({ ...profile, timezone: e.target.value })}
                                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none transition-all shadow-inner appearance-none cursor-pointer"
                                >
                                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                                    <option value="Asia/Kolkata">Asia/Kolkata (IST - India)</option>
                                    <option value="America/New_York">America/New_York (EST - New York)</option>
                                    <option value="Europe/London">Europe/London (GMT - London)</option>
                                    <option value="Asia/Dubai">Asia/Dubai (GST - Dubai)</option>
                                    <option value="Australia/Sydney">Australia/Sydney (AEST - Sydney)</option>
                                    <option value="Singapore">Singapore (SGT)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Registered Business Address</label>
                            <textarea
                                rows={2}
                                value={profile.billing_address || ""}
                                onChange={e => setProfile({ ...profile, billing_address: e.target.value })}
                                className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium text-slate-800 outline-none transition-all shadow-inner resize-none"
                                placeholder="Full business address for invoicing..."
                            />
                        </div>

                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pt-4">
                            <CreditCard size={14} /> Bank & Payment Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                                <input
                                    type="text"
                                    value={profile.bank_name || ""}
                                    onChange={e => setProfile({ ...profile, bank_name: e.target.value })}
                                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none transition-all shadow-inner"
                                    placeholder="HDFC Bank, ICICI, etc."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                                <input
                                    type="text"
                                    value={profile.account_number || ""}
                                    onChange={e => setProfile({ ...profile, account_number: e.target.value })}
                                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none transition-all shadow-inner"
                                    placeholder="0000 0000 0000 0000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">IFSC Code</label>
                                <input
                                    type="text"
                                    value={profile.ifsc_code || ""}
                                    onChange={e => setProfile({ ...profile, ifsc_code: e.target.value })}
                                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none transition-all shadow-inner"
                                    placeholder="HDFC0001234"
                                />
                            </div>
                        </div>

                    </section>

                    {/* Security Section */}
                    <section className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Lock size={14} /> Security Credentials
                        </h3>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username / Email</label>
                            <input
                                type="email"
                                value={profile.email || ""}
                                onChange={e => setProfile({ ...profile, email: e.target.value })}
                                className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none transition-all shadow-inner"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {profile.hasPassword && (
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                                    <input
                                        type="password"
                                        value={profile.current_password || ""}
                                        onChange={e => setProfile({ ...profile, current_password: e.target.value })}
                                        className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none transition-all shadow-inner"
                                        placeholder="Enter current password to change"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{profile.hasPassword ? "New Password" : "Create Password"}</label>
                                <input
                                    type="password"
                                    value={profile.new_password || ""}
                                    onChange={e => setProfile({ ...profile, new_password: e.target.value })}
                                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none transition-all shadow-inner"
                                    placeholder={profile.hasPassword ? "New Password" : "Create a secure password"}
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    {/* Profile Image View */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col items-center">
                        <div className="relative group mb-6">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl relative">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={48} className="text-slate-300" />
                                )}
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                            </div>
                            <button className="absolute -bottom-1 -right-1 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg border-4 border-white pointer-events-none">
                                <Camera size={16} />
                            </button>
                        </div>

                        <div className="text-center space-y-1 mb-8">
                            <h4 className="font-bold text-slate-900 tracking-tight">{profile.first_name} {profile.last_name}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{profile.role || "Workspace Agent"}</p>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Avatar Image URL</label>
                                <input
                                    type="text"
                                    value={profile.avatar_url || ""}
                                    onChange={e => setProfile({ ...profile, avatar_url: e.target.value })}
                                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none transition-all"
                                    placeholder="https://imgur.com/your-image.png"
                                />
                            </div>
                            <div className="p-4 bg-blue-50/50 rounded-2xl flex items-start gap-3">
                                <Mail size={16} className="text-blue-600 mt-0.5" />
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Linked Account</p>
                                    <p className="text-xs font-bold text-blue-900 truncate">{profile.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
