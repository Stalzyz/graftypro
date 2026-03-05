"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Send,
    Calendar,
    Users,
    BarChart3,
    GitBranch,
    LayoutTemplate,
    Clock,
    X,
    ArrowRight,
    Zap,
    TrendingUp,
    CheckCircle
} from "lucide-react";

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [segments, setSegments] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [flows, setFlows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [targetType, setTargetType] = useState<"TEMPLATE" | "FLOW">("TEMPLATE");
    const [templateName, setTemplateName] = useState("");
    const [flowId, setFlowId] = useState("");
    const [segmentId, setSegmentId] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [cRes, sRes, tRes, fRes] = await Promise.all([
                fetch("/api/campaigns"),
                fetch("/api/segments"),
                fetch("/api/templates"),
                fetch("/api/flows")
            ]);

            const cData = await cRes.json();
            const sData = await sRes.json();
            const tData = await tRes.json();
            const fData = await fRes.json();

            if (cData.data) setCampaigns(cData.data);
            if (sData.data) setSegments(sData.data);
            if (tData.data) setTemplates(tData.data.filter((t: any) => t.status === 'APPROVED'));
            if (fData.data) setFlows(fData.data.filter((f: any) => f.status === 'PUBLISHED'));

            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await fetch("/api/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    templateName: targetType === 'TEMPLATE' ? templateName : null,
                    flowId: targetType === 'FLOW' ? flowId : null,
                    segmentId: segmentId || null,
                    scheduledAt: scheduledAt || null
                })
            });

            if (res.ok) {
                setShowModal(false);
                resetForm();
                fetchData();
            } else {
                alert("Failed to launch campaign");
            }
        } catch (e) {
            alert("Error launching campaign");
        } finally {
            setSending(false);
        }
    };

    const resetForm = () => {
        setName("");
        setTargetType("TEMPLATE");
        setTemplateName("");
        setFlowId("");
        setSegmentId("");
        setScheduledAt("");
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'badge-success';
            case 'PROCESSING': return 'badge-warning animate-pulse';
            case 'SCHEDULED': return 'badge-info';
            default: return 'badge-neutral';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Campaigns</h1>
                    <p className="text-gray-500 text-sm">Create and monitor your broadcast campaigns.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary"
                >
                    <Plus size={18} /> New Campaign
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <MiniStat
                    label="Total Campaigns"
                    value={campaigns.length}
                    icon={<Send size={18} />}
                    color="text-[#042f94]"
                    bg="bg-[#27954D]/10"
                />
                <MiniStat
                    label="Sent Today"
                    value={campaigns.reduce((acc, c) => acc + (c.stats?.sent || 0), 0).toLocaleString()}
                    icon={<TrendingUp size={18} />}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <MiniStat
                    label="Active Flows"
                    value={campaigns.filter(c => c.status === 'PROCESSING').length}
                    icon={<Zap size={18} />}
                    color="text-amber-600"
                    bg="bg-amber-50"
                />
                <MiniStat
                    label="Success Rate"
                    value="98.2%"
                    icon={<CheckCircle size={18} />}
                    color="text-green-600"
                    bg="bg-green-50"
                />
            </div>

            {/* Campaign List */}
            <div className="soft-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500">Campaign Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500">Target</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500">Audience</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500">Progress</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500">Status</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading campaigns...</td></tr>
                            ) : campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                            <Send size={24} className="text-gray-300" />
                                        </div>
                                        <p className="text-gray-500 text-sm">No campaigns found. Start by creating one.</p>
                                    </td>
                                </tr>
                            ) : campaigns.map(c => (
                                <tr key={c.id} className="hover:bg-[#27954D]/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-800">{c.name}</div>
                                        <div className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {c.flow_id ? (
                                            <div className="flex items-center gap-2 text-blue-600 font-medium text-xs bg-blue-50 w-fit px-2 py-1 rounded-lg">
                                                <GitBranch size={12} /> Flow
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-[#042f94] font-medium text-xs bg-[#27954D]/10 w-fit px-2 py-1 rounded-lg">
                                                <LayoutTemplate size={12} /> {c.template_name}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600 text-xs font-medium">
                                            <Users size={14} className="text-gray-400" />
                                            {c.filters?.segment_id ? (segments.find(s => s.id === c.filters.segment_id)?.name || "Segment") : "All Contacts"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="max-w-[140px]">
                                            <div className="flex justify-between text-[10px] font-medium text-gray-500 mb-1">
                                                <span>{c.stats?.sent || 0} / {c.stats?.total || 0}</span>
                                                <span className="text-[#27954D] font-bold">{Math.round(((c.stats?.sent || 0) / (c.stats?.total || 1)) * 100)}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#27954D] transition-all duration-500 rounded-full"
                                                    style={{ width: `${Math.round(((c.stats?.sent || 0) / (c.stats?.total || 1)) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`badge ${getStatusBadge(c.status)}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-gray-400 hover:text-[#27954D] hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                            <BarChart3 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- New Campaign Modal --- */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl animate-fade-in overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Create Campaign</h3>
                                <p className="text-sm text-gray-500">Launch a new broadcast to your audience.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-2">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Campaign Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="e.g. Summer Promo"
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Target Audience</label>
                                        <select
                                            value={segmentId}
                                            onChange={e => setSegmentId(e.target.value)}
                                            className="input appearance-none"
                                        >
                                            <option value="">All Contacts</option>
                                            {segments.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Schedule Launch</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 text-gray-400" size={16} />
                                            <input
                                                type="datetime-local"
                                                value={scheduledAt}
                                                onChange={e => setScheduledAt(e.target.value)}
                                                className="input pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-xl mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setTargetType("TEMPLATE")}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${targetType === "TEMPLATE" ? "bg-[#27954D] text-white" : "text-gray-400 hover:bg-gray-50"}`}
                                        >
                                            Template
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTargetType("FLOW")}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${targetType === "FLOW" ? "bg-[#27954D] text-white" : "text-gray-400 hover:bg-gray-50"}`}
                                        >
                                            Flow
                                        </button>
                                    </div>

                                    {targetType === 'TEMPLATE' ? (
                                        <div className="space-y-3">
                                            <label className="block text-xs font-semibold text-gray-600">Select Template</label>
                                            <select
                                                required
                                                value={templateName}
                                                onChange={e => setTemplateName(e.target.value)}
                                                className="input bg-white"
                                            >
                                                <option value="">Choose a template</option>
                                                {templates.map(t => (
                                                    <option key={t.id} value={t.name}>{t.name}</option>
                                                ))}
                                            </select>
                                            <div className="p-3 bg-blue-50 rounded-xl text-[10px] text-blue-700 font-medium border border-blue-100">
                                                Only approved WhatsApp templates will be shown here.
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <label className="block text-xs font-semibold text-gray-600">Select Flow</label>
                                            <select
                                                required
                                                value={flowId}
                                                onChange={e => setFlowId(e.target.value)}
                                                className="input bg-white"
                                            >
                                                <option value="">Choose a flow</option>
                                                {flows.map(f => (
                                                    <option key={f.id} value={f.id}>{f.name}</option>
                                                ))}
                                            </select>
                                            <div className="p-3 bg-amber-50 rounded-xl text-[10px] text-amber-700 font-medium border border-amber-100 flex gap-2 items-start">
                                                <Zap size={14} className="shrink-0" />
                                                Visual flows allow for multi-step automated journeys.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary flex-1 py-4"
                                >
                                    Discard
                                </button>
                                <button
                                    disabled={sending}
                                    type="submit"
                                    className="btn-primary flex-[2] py-4 shadow-xl shadow-green-100"
                                >
                                    {sending ? 'Launching...' : 'Launch Campaign'}
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function MiniStat({ label, value, icon, color, bg }: any) {
    return (
        <div className="soft-card p-5 flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${bg} ${color}`}>
                {icon}
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-800 tracking-tight">{value}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
            </div>
        </div>
    );
}
