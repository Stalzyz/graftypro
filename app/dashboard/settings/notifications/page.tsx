"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Mail, Save, Loader2, Info } from "lucide-react";
import Link from "next/link";

export default function NotificationsSettingsPage() {
    const [emails, setEmails] = useState<string[]>([]);
    const [newEmail, setNewEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings/notifications");
            const data = await res.json();
            if (data.emails) {
                setEmails(data.emails);
            }
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmail = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newEmail.trim();
        if (!trimmed) return;
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) {
            alert("Please enter a valid email address");
            return;
        }

        if (emails.includes(trimmed)) {
            setNewEmail("");
            return;
        }

        setEmails([...emails, trimmed]);
        setNewEmail("");
    };

    const handleRemoveEmail = (emailToRemove: string) => {
        setEmails(emails.filter(e => e !== emailToRemove));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/settings/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emails })
            });
            if (res.ok) {
                alert("Notification settings saved successfully!");
            } else {
                alert("Failed to save settings");
            }
        } catch (error) {
            console.error(error);
            alert("Network error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <Link href="/dashboard/settings" className="text-blue-600 text-sm font-medium hover:underline mb-2 inline-block">
                    &larr; Back to Settings
                </Link>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Alerts & Notifications</h1>
                <p className="text-gray-500 text-sm">Configure automated system emails sent to your team.</p>
            </div>

            {/* Email List Settings */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Mail className="text-blue-600" size={20} />
                            Payment Notifications
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            These email addresses will receive instant notifications whenever a customer successfully completes a payment via your WhatsApp Flow.
                        </p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Info Alert */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-sm text-blue-800">
                        <Info className="shrink-0 mt-0.5 text-blue-500" size={18} />
                        <div>
                            <p className="font-semibold">Context-Rich Emails</p>
                            <p className="text-blue-700/80 mt-1">
                                Notifications bypass flow-builder limits and include the customer's phone number, amount paid, any collected form details, and their last 5 chat messages so your agents have full context.
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center p-8 text-gray-400">
                            <Loader2 className="animate-spin" size={24} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Email List */}
                            <div className="space-y-2">
                                {emails.length === 0 ? (
                                    <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center">
                                        No notification emails added yet.
                                    </div>
                                ) : (
                                    emails.map(email => (
                                        <div key={email} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                            <div className="font-medium text-gray-700 text-sm">{email}</div>
                                            <button 
                                                onClick={() => handleRemoveEmail(email)}
                                                className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add Email Form */}
                            <form onSubmit={handleAddEmail} className="flex gap-2 pt-2">
                                <input
                                    type="email"
                                    placeholder="agent@company.com"
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button 
                                    type="submit"
                                    disabled={!newEmail.trim()}
                                    className="px-4 py-2 bg-gray-900 text-white font-medium text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Plus size={16} /> Add Email
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Save Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading || saving}
                        className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? "Saving..." : "Save Preferences"}
                    </button>
                </div>
            </div>
        </div>
    );
}
