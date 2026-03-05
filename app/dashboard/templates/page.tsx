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
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Templates Dashboard</h1>
                    <p className="text-gray-500 text-sm font-medium">Manage and sync your WhatsApp message templates.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={syncFromMeta}
                        disabled={loading}
                        style={{
                            all: 'unset',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '0 24px',
                            height: '44px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '12px',
                            color: '#374151',
                            fontWeight: '700',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        Sync
                    </button>
                    <Link href="/dashboard/templates/new" style={{ all: 'unset' }}>
                        <button
                            style={{
                                all: 'unset',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '0 24px',
                                height: '44px',
                                backgroundColor: '#27954D',
                                borderRadius: '12px',
                                color: '#FFFFFF',
                                fontWeight: '700',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(39, 149, 77, 0.2)',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <Plus size={20} />
                            New
                        </button>
                    </Link>
                </div>
            </div>

            {/* Search */}
            <div
                style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}
            >
                <Search style={{ color: '#9CA3AF', flexShrink: 0 }} size={20} />
                <input
                    type="text"
                    placeholder="Search templates..."
                    style={{
                        all: 'unset',
                        flex: 1,
                        fontSize: '14px',
                        color: '#1F2937',
                        width: '100%'
                    }}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
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
                        <button
                            className="px-8 py-3 bg-[#27954D] text-white font-bold transition-all hover:bg-[#1f7a3f] active:scale-95 shadow-lg"
                            style={{ borderRadius: '12px' }}
                        >
                            Create Template
                        </button>
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
