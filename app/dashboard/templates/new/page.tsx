"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

export default function NewTemplatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        category: "MARKETING",
        language: "en_US" // Default to US English
    });

    const languages = [
        { code: "en_US", name: "English (US)" },
        { code: "en_GB", name: "English (UK)" },
        { code: "es", name: "Spanish" },
        { code: "pt_BR", name: "Portuguese (BR)" },
        { code: "hi", name: "Hindi" },
        // Add more as needed
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Sanitize name for API to be absolutely sure
        const apiName = formData.name.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

        try {
            const res = await fetch("/api/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, name: apiName })
            });

            const data = await res.json();

            if (res.ok) {
                // Redirect to the Editor
                router.push(`/dashboard/templates/${data.data.id}`);
            } else {
                alert(data.error);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to create template");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/dashboard/templates" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-6">
                <ArrowLeft size={18} />
                Back to Templates
            </Link>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Create New Template</h2>
                    <p className="text-sm text-gray-500">Define the core properties before adding content.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. welcome_offer_v1"
                            value={formData.name}
                            onChange={e => {
                                let val = e.target.value.toLowerCase();
                                val = val.replace(/[\s-]/g, '_'); // space/hyphen to underscore
                                val = val.replace(/[^a-z0-9_]/g, ''); // strip invalid chars
                                setFormData({ ...formData, name: val });
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Only lowercase letters, numbers, and underscores.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="MARKETING">Marketing</option>
                                <option value="UTILITY">Utility</option>
                                <option value="AUTHENTICATION">Authentication</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                            <select
                                value={formData.language}
                                onChange={e => setFormData({ ...formData, language: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                {languages.map(l => (
                                    <option key={l.code} value={l.code}>{l.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-8 py-2.5 bg-[#27954D] text-white font-bold transition-all hover:bg-[#1f7a3f] active:scale-95 shadow-lg disabled:opacity-50"
                            style={{ borderRadius: '12px', height: '48px' }}
                        >
                            {loading ? "Creating..." : (
                                <>
                                    <span>Continue to Editor</span>
                                    <Check size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
