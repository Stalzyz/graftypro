"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import {
    Plus,
    Search,
    GitMerge,
    Edit2,
    Trash2,
    PlayCircle,
    Zap,
    Clock,
    MoreHorizontal,
    Rocket
} from "lucide-react";
import FlowInjectorModal from "../../../components/flow-builder/FlowInjectorModal";

export default function FlowsPage() {
    const [flows, setFlows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showInjector, setShowInjector] = useState(false);

    const fetchFlows = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/flows?keyword=${search}`);
            const data = await res.json();
            if (res.ok) {
                setFlows(data.data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        try {
            const res = await fetch(`/api/flows/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setFlows(flows.filter(f => f.id !== id));
            }
        } catch (e) {
            alert("Failed to delete flow");
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchFlows, 300);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <div className="space-y-6 animate-fade-in relative">
            
            {/* AI Injector Modal */}
            <FlowInjectorModal 
                isOpen={showInjector} 
                onClose={() => setShowInjector(false)} 
                onSuccess={() => fetchFlows()} 
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Flow Builder</h1>
                    <p className="text-gray-500 text-sm">Visual automation journeys for your customers.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setShowInjector(true)}
                        className="btn-soft px-6 flex-1 md:flex-none border-dashed border-2 hover:border-black/20"
                    >
                        <Zap size={18} className="text-yellow-500" fill="currentColor" /> Quick Inject
                    </button>
                    <Link
                        href="/dashboard/flows/create"
                        className="btn-primary px-8 flex-1 md:flex-none"
                    >
                        <Plus size={18} /> New Flow
                    </Link>
                </div>
            </div>

            {/* toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search flows..."
                        className="input pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-3xl border border-gray-100"></div>
                    ))}
                </div>
            ) : flows.length === 0 ? (
                <div className="text-center py-20 soft-card">
                    <div className="bg-[#27954D]/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#27954D]">
                        <GitMerge size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">No automation flows yet</h3>
                    <p className="text-gray-500 text-sm mt-1 mb-6">Create your first automated flow to engage customers effortlessly.</p>
                    <Link href="/dashboard/flows/create" className="btn-primary px-10 mx-auto">
                        Get Started
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {flows.map(flow => (
                        <div key={flow.id} className="soft-card p-6 hover:shadow-xl transition-all group border-transparent hover:border-[#27954D]/20">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-[#27954D]/10 rounded-xl flex items-center justify-center text-[#27954D]">
                                    <GitMerge size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/dashboard/flows/${flow.id}`} className="p-2 text-gray-400 hover:text-[#27954D] hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100">
                                        <Edit2 size={16} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(flow.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-800 text-lg mb-2">{flow.name}</h3>
                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className="badge badge-neutral text-[10px] flex items-center gap-1">
                                    <Zap size={10} />
                                    {flow.trigger_keyword ? `Trigger: ${flow.trigger_keyword}` : 'No Keyword'}
                                </span>
                                <span className={`badge text-[10px] ${flow.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}`}>
                                    {flow.status}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    <Clock size={12} />
                                    {new Date(flow.updated_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-[#042f94]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#27954D]" />
                                    {flow.analytics?._count?.hits || 0} Runs
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
