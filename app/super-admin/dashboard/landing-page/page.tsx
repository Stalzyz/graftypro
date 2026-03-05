
"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit2, Globe, Trash2, Eye, Layout } from "lucide-react";
import Link from "next/link";

export default function LandingPagesList() {
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await fetch("/api/super-admin/landing/pages");
            const json = await res.json();
            setPages(json.data || []);
        } finally {
            setLoading(false);
        }
    };

    const createPage = async () => {
        const title = prompt("Enter Page Title");
        const slug = prompt("Enter Page Slug (e.g. home, reseller)");
        if (!title || !slug) return;

        const res = await fetch("/api/super-admin/landing/pages", {
            method: "POST",
            body: JSON.stringify({ title, slug })
        });
        if (res.ok) fetchPages();
    };

    const seedV2Page = async () => {
        if (!confirm("This will overwrite 'home' with Monster Level V2 defaults. Proceed?")) return;
        setLoading(true);
        const res = await fetch("/api/super-admin/landing/seed", { method: "POST" });
        if (res.ok) fetchPages();
        else {
            alert("Failed to seed V2 defaults.");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Landing Page CMS</h1>
                    <p className="text-slate-500 font-medium mt-1">Nuclear-level control over all growth nodes.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={seedV2Page}
                        className="flex items-center gap-2 bg-blue-100 text-blue-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-200 transition-all border border-blue-200"
                    >
                        Deploy V2 Defaults
                    </button>
                    <button
                        onClick={createPage}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-200"
                    >
                        <Plus size={18} /> Create New Page
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map((page) => (
                    <div key={page.id} className="bg-white border border-slate-100 rounded-3xl p-8 hover:shadow-2xl hover:shadow-slate-100 transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Layout size={24} className="text-slate-900" />
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${page.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                {page.status}
                            </span>
                        </div>

                        <h3 className="text-xl font-black text-slate-900 mb-2">{page.title}</h3>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Globe size={12} /> /{page.slug}
                        </p>

                        <div className="flex gap-3">
                            <Link
                                href={`/super-admin/dashboard/landing-page/${page.id}`}
                                className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-900 hover:text-slate-700 text-slate-900 px-4 py-3 rounded-xl font-bold text-xs transition-all"
                            >
                                <Edit2 size={14} /> Design Node
                            </Link>
                            <a
                                href={page.slug === 'home' ? '/' : `/${page.slug}`}
                                target="_blank"
                                className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                            >
                                <Eye size={18} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
