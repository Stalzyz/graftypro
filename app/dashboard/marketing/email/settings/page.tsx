"use client";

import { useState, useEffect } from "react";
import { Save, Server, Shield, Mail, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";

export default function SMTPSettingsPage() {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const [form, setForm] = useState({
        smtp_host: "",
        smtp_port: "587",
        smtp_user: "",
        smtp_pass: "",
        smtp_from_name: "",
        smtp_from_email: "",
        smtp_encryption: "TLS",
        email_signature_html: ""
    });

    const [hasPassword, setHasPassword] = useState(false);

    useEffect(() => {
        fetch("/api/workspace/smtp")
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setForm({
                        smtp_host: data.smtp_host || "",
                        smtp_port: data.smtp_port?.toString() || "587",
                        smtp_user: data.smtp_user || "",
                        smtp_pass: "",
                        smtp_from_name: data.smtp_from_name || "",
                        smtp_from_email: data.smtp_from_email || "",
                        smtp_encryption: data.smtp_encryption || "TLS",
                        email_signature_html: data.email_signature_html || ""
                    });
                    setHasPassword(data.has_password);
                }
                setLoading(false);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            const res = await fetch("/api/workspace/smtp", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            
            if (res.ok) {
                setSuccessMsg("SMTP Configuration connected successfully! You are ready to blast.");
                if (form.smtp_pass) setHasPassword(true);
                setForm(prev => ({ ...prev, smtp_pass: "" })); // Clear password field
            } else {
                setErrorMsg(data.error || "Failed to save SMTP configuration.");
            }
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-slate-100 border-t-[#27954D] animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative z-10">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-[#27954D]">
                    <Server size={16} /> SMTP BYOC CONFIGURATION
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Email Carrier Settings</h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Bring your own carrier (BYOC). Connect Hostinger, SendGrid, Amazon SES, or any valid SMTP server to dispatch marketing fleets directly from your own domain.
                </p>
            </div>

            {/* Alert Blocks */}
            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
                    <div>
                        <h4 className="font-bold text-sm">Connection Verified</h4>
                        <p className="text-xs mt-1">{successMsg}</p>
                    </div>
                </div>
            )}
            
            {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <AlertCircle className="mt-0.5 shrink-0" size={18} />
                    <div>
                        <h4 className="font-bold text-sm">Verification Failed</h4>
                        <p className="text-xs mt-1">{errorMsg}</p>
                    </div>
                </div>
            )}

            {/* Form Canvas */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-full -z-10 opacity-50 pointer-events-none"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Server Settings */}
                    <div className="col-span-1 md:col-span-2 pb-2">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
                            <Server size={14} /> Server Configuration
                        </h3>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">SMTP Host</label>
                        <input
                            type="text"
                            required
                            placeholder="smtp.hostinger.com"
                            value={form.smtp_host}
                            onChange={e => setForm({ ...form, smtp_host: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#27954D] focus:ring-2 focus:ring-[#27954D]/20 transition-all font-mono"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Port</label>
                            <input
                                type="number"
                                required
                                placeholder="587"
                                value={form.smtp_port}
                                onChange={e => setForm({ ...form, smtp_port: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#27954D] focus:ring-2 focus:ring-[#27954D]/20 transition-all font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Encryption</label>
                            <select
                                value={form.smtp_encryption}
                                onChange={e => setForm({ ...form, smtp_encryption: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#27954D] transition-all font-mono"
                            >
                                <option value="TLS">TLS</option>
                                <option value="SSL">SSL</option>
                                <option value="NONE">None</option>
                            </select>
                        </div>
                    </div>

                    {/* Authentication */}
                    <div className="col-span-1 md:col-span-2 pt-4 pb-2 mt-2">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
                            <Shield size={14} /> Authentication
                        </h3>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Username / Login</label>
                        <input
                            type="text"
                            required
                            placeholder="marketing@yourdomain.com"
                            value={form.smtp_user}
                            onChange={e => setForm({ ...form, smtp_user: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#27954D] focus:ring-2 focus:ring-[#27954D]/20 transition-all font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            Password {hasPassword && <span className="text-emerald-500 font-normal capitalize bg-emerald-50 px-2 py-0.5 rounded ml-2 border border-emerald-100">Saved securely</span>}
                        </label>
                        <input
                            type="password"
                            required={!hasPassword}
                            placeholder={hasPassword ? "••••••••••••••••" : "Your SMTP Password"}
                            value={form.smtp_pass}
                            onChange={e => setForm({ ...form, smtp_pass: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#27954D] focus:ring-2 focus:ring-[#27954D]/20 transition-all font-mono"
                        />
                        {hasPassword && (
                            <p className="text-[10px] text-slate-400 font-medium mt-1.5">Leave blank to keep existing password.</p>
                        )}
                    </div>

                    {/* Sender Profiles */}
                    <div className="col-span-1 md:col-span-2 pt-4 pb-2 mt-2">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
                            <Mail size={14} /> Sender Identity
                        </h3>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Default From Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Acme Corp Sales"
                            value={form.smtp_from_name}
                            onChange={e => setForm({ ...form, smtp_from_name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#27954D] focus:ring-2 focus:ring-[#27954D]/20 transition-all font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Default From Email</label>
                        <input
                            type="email"
                            placeholder="e.g. sales@yourdomain.com"
                            value={form.smtp_from_email}
                            onChange={e => setForm({ ...form, smtp_from_email: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#27954D] focus:ring-2 focus:ring-[#27954D]/20 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2 flex items-center justify-between">
                        <span>Global Email Signature</span>
                        <span className="text-[#27954D] text-[10px] bg-emerald-50 px-2 py-0.5 rounded">Supports HTML</span>
                    </label>
                    <textarea
                        rows={5}
                        placeholder="<p>Best regards,<br/><strong>Team Acme</strong></p>"
                        value={form.email_signature_html}
                        onChange={e => setForm({ ...form, email_signature_html: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#27954D] focus:ring-2 focus:ring-[#27954D]/20 transition-all font-mono resize-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">This signature is automatically appended to all dispatched emails before the unsubscribe link.</p>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[11px] text-slate-400 max-w-sm font-medium">
                        Saving will automatically attempt to verify the connection. If verification fails, changes might not save correctly.
                    </p>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-gradient-to-r from-[#27954D] to-[#1e7c3e] text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                    >
                        {saving ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Connecting...</>
                        ) : (
                            <><Activity size={16} /> Verify & Update Configuration</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
