"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, LayoutTemplate, Search, FileText, RefreshCw } from "lucide-react";

export default function TemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchTemplates();
    }, []);

    const syncFromMeta = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/templates/sync", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                alert(`Synced ${data.synced} templates (${data.skipped} skipped)`);
                fetchTemplates();
            } else {
                alert("Sync failed: " + data.error);
            }
        } catch (e) {
            alert("Sync Error");
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const res = await fetch("/api/templates");
            const data = await res.json();
            if (data.data) setTemplates(data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filtered = templates.filter((t: any) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'badge-success';
            case 'REJECTED': return 'badge-error';
            case 'PENDING': return 'badge-warning';
            case 'DRAFT': return 'badge-neutral';
            default: return 'badge-neutral';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Message Templates</h1>
                    <p className="text-gray-500 text-sm">Create & manage WhatsApp templates for your campaigns.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={syncFromMeta}
                        disabled={loading}
                        className="btn-secondary"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Sync from Meta
                    </button>
                    <Link href="/dashboard/templates/new">
                        <button className="btn-primary">
                            <Plus size={18} />
                            New Template
                        </button>
                    </Link>
                </div>
            </div>

            {/* Search */}
            <div className="soft-card p-4 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        className="input pl-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Templates Grid */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">
                    <RefreshCw size={24} className="mx-auto mb-3 animate-spin text-[#27954D]" />
                    <p className="text-sm">Loading templates...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 soft-card">
                    <div className="w-16 h-16 bg-[#27954D]/10 text-[#27954D] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <LayoutTemplate size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No templates found</h3>
                    <p className="text-gray-500 text-sm mb-6">Create your first template to start sending broadcasts.</p>
                    <Link href="/dashboard/templates/new">
                        <button className="btn-primary">Create Template</button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((t: any) => (
                        <div key={t.id} className="soft-card p-5 flex flex-col h-full group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-[#27954D]/10 text-[#27954D] rounded-xl">
                                    <FileText size={18} />
                                </div>
                                <span className={`badge ${getStatusBadge(t.status)}`}>
                                    {t.status}
                                </span>
                            </div>

                            <h3 className="font-semibold text-gray-800 mb-1 truncate">{t.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                                <span className="uppercase">{t.language}</span>
                                <span>•</span>
                                <span className="uppercase">{t.category}</span>
                            </div>

                            <div className="mt-auto border-t border-gray-100 pt-4 flex justify-between items-center text-sm text-gray-500">
                                <span className="text-xs">{new Date(t.updated_at).toLocaleDateString()}</span>
                                <Link href={`/dashboard/templates/${t.id}`} className="text-[#27954D] hover:underline text-sm font-medium">
                                    Edit
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
