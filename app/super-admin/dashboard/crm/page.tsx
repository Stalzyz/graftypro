
"use client";

import { useState, useEffect } from "react";
import {
    Users, Target, TrendingUp, Zap, MessageSquare, Phone, Mail, MoreVertical,
    Plus, Filter, Search, IndianRupee, Briefcase, Calendar, ArrowUpRight,
    Trophy, Flame, Clock, ShieldAlert, BarChart3, ChevronRight, AlertCircle,
    CheckCircle2, XCircle, Send, Loader2
} from "lucide-react";
import { safeToLocaleString, formatCurrency, ensureNumber } from "../../../../lib/utils/number-format";
import "../../../../lib/polyfills/safe-number";

const STAGES = [
    { id: "LEAD_CAPTURED", label: "Lead Captured", color: "bg-blue-500", border: "border-blue-100" },
    { id: "CONTACTED", label: "Contacted", color: "bg-indigo-500", border: "border-indigo-100" },
    { id: "DEMO_SCHEDULED", label: "Demo Scheduled", color: "bg-purple-500", border: "border-purple-100" },
    { id: "PROPOSAL_SENT", label: "Proposal Sent", color: "bg-amber-500", border: "border-amber-100" },
    { id: "NEGOTIATION", label: "Negotiation", color: "bg-orange-500", border: "border-orange-100" },
    { id: "WON", label: "Won", color: "bg-green-500", border: "border-green-100" },
    { id: "LOST", label: "Lost", color: "bg-red-500", border: "border-red-100" },
];

export default function CRMSalesWarRoom() {
    const [leads, setLeads] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"KANBAN" | "LIST" | "ANALYTICS">("KANBAN");
    const [selectedLead, setSelectedLead] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [leadsRes, statsRes] = await Promise.all([
                fetch("/api/super-admin/crm/leads"),
                fetch("/api/super-admin/crm/stats")
            ]);
            const leadsData = await leadsRes.json();
            const statsData = await statsRes.json();

            setLeads(Array.isArray(leadsData) ? leadsData : []);
            setStats(statsData?.error ? null : statsData);

            if (leadsData?.error || statsData?.error) {
                console.error("Super Admin CRM Fetch Error:", { leadsData, statsData });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStage = async (leadId: string, newStage: string) => {
        try {
            const res = await fetch("/api/super-admin/crm/leads", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: leadId, stage: newStage })
            });
            if (res.ok) fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading && !stats) return <LoadingPulse />;

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-fade-in">
            {/* Header Area */}
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <Target className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sales Command Center</h1>
                            <p className="text-slate-400 font-medium text-sm">Aggressive revenue tracking and pipeline mobilization.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <button
                        onClick={() => setView("KANBAN")}
                        className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${view === 'KANBAN' ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                        Kanban board
                    </button>
                    <button
                        onClick={() => setView("LIST")}
                        className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${view === 'LIST' ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                        List View
                    </button>
                    <button
                        onClick={() => setView("ANALYTICS")}
                        className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${view === 'ANALYTICS' ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                        Intelligence
                    </button>
                    <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block" />
                    <button className="px-8 py-4 bg-[#27954D] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-[#042f94] transition-all shadow-xl shadow-green-100 active:scale-95">
                        <Plus size={14} /> Capture Lead
                    </button>
                </div>
            </header>

            {/* Executive KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <KPICard
                    label="Pipeline Velocity"
                    value={formatCurrency(stats?.pipeline?.total_active_value)}
                    sub="Total Managed Volume"
                    icon={<Flame className="text-orange-500" />}
                    trend="+12% WoW"
                />
                <KPICard
                    label="Revenue Forecast"
                    value={formatCurrency(stats?.pipeline?.forecast)}
                    sub="Expected (Value x Probability)"
                    icon={<TrendingUp className="text-green-500" />}
                    trend="Target Driven"
                />
                <KPICard
                    label="Conversion Rate"
                    value="24.8%"
                    sub="Lead to Won Strike Rate"
                    icon={<Trophy className="text-amber-500" />}
                    trend="Top 1% Global"
                />
                <KPICard
                    label="Month-to-Date"
                    value={formatCurrency(stats?.mtd?.revenue)}
                    sub={`${ensureNumber(stats?.mtd?.vendors)} New Onboardings`}
                    icon={<BarChart3 className="text-blue-500" />}
                    trend="Actual Realized"
                />
            </div>

            {/* Main CRM View */}
            {view === "KANBAN" && (
                <div className="flex gap-6 overflow-x-auto pb-10 custom-scrollbar -mx-4 px-4 h-[calc(100vh-450px)] min-h-[600px]">
                    {STAGES.map((stage) => (
                        <div key={stage.id} className="min-w-[320px] flex-1 flex flex-col gap-6">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{stage.label}</h3>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-100 px-3 py-1 rounded-full shadow-sm">
                                    {(Array.isArray(leads) ? leads : []).filter(l => l?.stage === stage.id).length}
                                </span>
                            </div>

                            <div className="flex-1 bg-slate-50/50 rounded-[40px] p-4 space-y-4 border border-slate-100/50 overflow-y-auto custom-scrollbar">
                                {(Array.isArray(leads) ? leads : []).filter(l => l?.stage === stage.id).map((lead) => (
                                    <LeadCard key={lead.id} lead={lead} onClick={() => setSelectedLead(lead)} onMove={(s: string) => handleUpdateStage(lead.id, s)} />
                                ))}

                                <button className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/50">
                                    <Plus size={12} /> Add Prospect
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {view === "LIST" && (
                <div className="bg-white rounded-[48px] border border-slate-100 overflow-hidden shadow-sm">
                    {/* List View Implementation */}
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-6">Prospect Name</th>
                                <th className="px-8 py-6">Current Stage</th>
                                <th className="px-8 py-6">Deal Value</th>
                                <th className="px-8 py-6">Probability</th>
                                <th className="px-8 py-6">Assigned To</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-slate-50/30 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-slate-900">{lead.name}</div>
                                        <div className="text-[10px] text-slate-400 font-medium uppercase">{lead.company_name}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${STAGES.find(s => s.id === lead.stage)?.color || 'bg-slate-400'} text-white`}>
                                            {lead.stage ? lead.stage.replace('_', ' ') : 'UNKNOWN'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-slate-900">{formatCurrency(lead.deal_value)}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[60px]">
                                                <div className="h-full bg-blue-500" style={{ width: `${lead.probability}%` }} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400">{lead.probability}%</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200" />
                                            <span className="text-xs font-bold text-slate-600">{lead.manager?.name || 'Unassigned'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Lead Detail Sidebar Overlay */}
            {selectedLead && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedLead(null)} />
                    <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-slide-left p-12 overflow-y-auto">
                        <LeadDetail
                            lead={selectedLead}
                            onClose={() => setSelectedLead(null)}
                            onRefresh={(newActivity: any) => {
                                // Local update for speed
                                setSelectedLead({
                                    ...selectedLead,
                                    activities: [newActivity, ...(selectedLead.activities || [])]
                                });
                                // Background refresh
                                fetchData();
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function KPICard({ label, value, sub, icon, trend }: any) {
    return (
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-4 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex items-start justify-between">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-slate-700 transition-all duration-500 shadow-sm">
                    {icon}
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{trend}</span>
                </div>
            </div>
            <div className="relative z-10 space-y-1">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                    <span className="text-[11px] font-bold text-slate-300 italic">{sub}</span>
                </div>
            </div>
        </div>
    );
}

function LeadCard({ lead, onClick, onMove }: any) {
    const stage = STAGES.find(s => s.id === lead.stage);

    return (
        <div
            onClick={onClick}
            className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-100 transition-all duration-300 space-y-4 group cursor-pointer relative overflow-hidden"
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${stage?.color}`} />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-105 transition-transform">
                        {lead.name[0]}
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 tracking-tight">{lead.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lead.company_name || lead.source}</p>
                    </div>
                </div>
                <div className="px-2 py-1 bg-slate-50 rounded-lg text-slate-500 hover:text-slate-900 transition-colors">
                    <MoreVertical size={14} />
                </div>
            </div>

            <div className="flex items-center justify-between py-3 border-y border-slate-50">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                    <IndianRupee size={12} className="text-[#27954D]" />
                    {safeToLocaleString(lead.deal_value)}
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black text-slate-300 uppercase">Prob.</span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${lead.probability > 70 ? 'bg-green-50 text-green-600' : lead.probability > 40 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                        {lead.probability}%
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
                <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-200" title={lead.manager?.name} />
                </div>
                <div className="flex-1" />
                <div className="flex gap-1">
                    <button className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                        <Phone size={14} />
                    </button>
                    <button className="p-2 text-slate-300 hover:text-purple-500 hover:bg-purple-50 rounded-xl transition-all">
                        <MessageSquare size={14} />
                    </button>
                </div>
            </div>

            {/* Quick Move Trigger (Subtle) */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={20} className="text-slate-300" />
            </div>
        </div>
    );
}

function LeadDetail({ lead, onClose, onRefresh }: any) {
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleAddNote = async () => {
        if (!note.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/super-admin/crm/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    leadId: lead.id,
                    action: "NOTE",
                    description: note
                })
            });
            const newActivity = await res.json();

            if (res.ok) {
                setNote("");
                // Optimistic update or refresh
                if (onRefresh) onRefresh(newActivity);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-12">
            <header className="flex items-start justify-between">
                <div className="flex gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-white text-3xl font-black shadow-2xl">
                        {lead?.name?.[0] || '?'}
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">{lead?.name}</h2>
                        <div className="flex items-center gap-3">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STAGES.find(s => s.id === lead?.stage)?.color || 'bg-slate-400'} text-white shadow-lg`}>
                                {lead?.stage ? lead.stage.replace('_', ' ') : 'UNKNOWN'}
                            </span>
                            <span className="text-slate-300 text-xs">•</span>
                            <span className="text-sm font-bold text-slate-400 italic" suppressHydrationWarning>Created {new Date(lead.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-4 hover:bg-slate-50 rounded-2xl transition-all text-slate-500 hover:text-slate-900">
                    <XCircle size={28} />
                </button>
            </header>

            <div className="grid grid-cols-2 gap-10">
                <div className="p-8 bg-slate-50 rounded-[40px] space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Financial Intelligence</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-bold text-slate-500">Deal Value</span>
                            <span className="text-2xl font-black text-slate-900">{formatCurrency(lead.deal_value)}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-bold text-slate-500">Win Probability</span>
                            <span className="text-2xl font-black text-blue-600">{lead.probability}%</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-bold text-slate-500">Expected Closing</span>
                            <span className="text-sm font-black text-slate-900" suppressHydrationWarning>{lead.expected_close ? new Date(lead.expected_close).toLocaleDateString() : 'TBD'}</span>
                        </div>
                    </div>
                </div>
                <div className="p-8 bg-slate-50 rounded-[40px] space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Contact Identity</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-xs"><Mail size={16} className="text-slate-400" /></div>
                            <span className="text-sm font-bold text-slate-700">{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-xs"><Phone size={16} className="text-slate-400" /></div>
                            <span className="text-sm font-bold text-slate-700">{lead.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-xs"><Briefcase size={16} className="text-slate-400" /></div>
                            <span className="text-sm font-bold text-slate-700">{lead.company_name}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Action Timeline</h3>
                </div>

                {/* Add Note Input */}
                <div className="p-6 bg-slate-50 rounded-[32px] space-y-4 border border-slate-100">
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Log a note, call summary, or next step..."
                        className="w-full bg-white border-0 rounded-2xl p-4 text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:ring-0 resize-none shadow-sm"
                        rows={3}
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={handleAddNote}
                            disabled={submitting || !note.trim()}
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:bg-slate-200 flex items-center gap-2"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                            {submitting ? "LOGGING..." : "LOG ACTIVITY"}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {lead.activities?.map((activity: any) => (
                        <div key={activity.id} className="flex gap-6 relative group">
                            <div className="absolute left-[20px] top-[40px] bottom-[-20px] w-0.5 bg-slate-100 group-last:hidden" />
                            <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-100 flex items-center justify-center z-10 shadow-sm transition-all group-hover:border-slate-900">
                                <ActivityIcon action={activity.action} />
                            </div>
                            <div className="flex-1 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-2 group-hover:border-slate-200 transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="text-sm font-black text-slate-900 uppercase tracking-wide">{activity.action ? activity.action.replace('_', ' ') : 'ACTION'}</div>
                                    <span className="text-[10px] font-bold text-slate-300" suppressHydrationWarning>{new Date(activity.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{activity.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-10 flex gap-4">
                <button className="flex-1 py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
                    Schedule Demo
                </button>
                <button className="flex-1 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-[24px] font-black text-xs uppercase tracking-widest hover:border-slate-900 transition-all">
                    Generate Proposal
                </button>
            </div>
        </div>
    );
}

function ActivityIcon({ action }: { action: string }) {
    switch (action) {
        case 'LEAD_CAPTURED': return <CheckCircle2 size={16} className="text-green-500" />;
        case 'STAGE_CHANGE': return <TrendingUp size={16} className="text-blue-500" />;
        case 'CONTACTED':
        case 'CALL': return <Phone size={16} className="text-indigo-500" />;
        case 'EMAIL': return <Mail size={16} className="text-sky-500" />;
        case 'NOTE': return <MessageSquare size={16} className="text-slate-500" />;
        case 'DEMO':
        case 'DEMO_SCHEDULED': return <Calendar size={16} className="text-purple-500" />;
        case 'PROPOSAL_GENERATED':
        case 'PROPOSAL_SENT': return <Briefcase size={16} className="text-amber-500" />;
        default: return <Clock size={16} className="text-slate-300" />;
    }
}

function LoadingPulse() {
    return (
        <div className="max-w-7xl mx-auto py-20 animate-pulse space-y-12">
            <div className="h-40 bg-slate-100 rounded-[40px]" />
            <div className="grid grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-50 rounded-[40px]" />)}
            </div>
            <div className="flex gap-6 h-[500px]">
                {[1, 2, 3, 4].map(i => <div key={i} className="flex-1 bg-slate-50 rounded-[40px]" />)}
            </div>
        </div>
    );
}
