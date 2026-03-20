"use client";

import { useEffect, useState } from "react";
import {
    Users,
    Search,
    Filter,
    Plus,
    MoreVertical,
    MessageSquare,
    Phone,
    Clock,
    ChevronRight,
    Loader2,
    Calendar,
    IndianRupee,
    MapPin,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { ImportEduLeadModal } from "../../../../components/education/ImportEduLeadModal";

const STAGES = [
    { id: "NEW", name: "New Leads", color: "bg-blue-500" },
    { id: "CONTACTED", name: "Contacted", color: "bg-indigo-500" },
    { id: "FOLLOW_UP", name: "Follow-up", color: "bg-amber-500" },
    { id: "DEMO_SCHEDULED", name: "Demo Class", color: "bg-purple-500" },
    { id: "PAYMENT_PENDING", name: "Payment Pending", color: "bg-orange-500" },
    { id: "ENROLLED", name: "Enrolled", color: "bg-emerald-500" },
    { id: "LOST", name: "Lost", color: "bg-slate-400" }
];

export default function LeadPipeline() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [updating, setUpdating] = useState<string | null>(null);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    const [newLead, setNewLead] = useState({
        student_name: "",
        whatsapp_number: "",
        email: "",
        course_interested: "",
        city: "",
        potential_revenue: ""
    });

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await fetch("/api/education/leads?activities=true");
            const data = await res.json();
            if (data.data) setLeads(data.data);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddLead = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/education/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newLead)
            });
            if (res.ok) {
                setShowAddModal(false);
                setNewLead({ student_name: "", whatsapp_number: "", email: "", course_interested: "", city: "", potential_revenue: "" });
                fetchLeads();
            }
        } catch (e) {
            alert("Error creating lead");
        }
    };

    const handleStageChange = async (leadId: string, newStage: string) => {
        setUpdating(leadId);
        try {
            const res = await fetch(`/api/education/leads/${leadId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStage })
            });
            if (res.ok) {
                setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStage } : l));
            }
        } catch (e) {
            alert("Failed to update status");
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/dashboard/education" className="text-slate-400 hover:text-slate-900 transition-colors">
                            <ArrowLeft size={18} />
                        </Link>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lead Pipeline</h1>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Manage your admission conversions from inquiry to enrollment.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Users size={18} /> Import
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-[#27954D] to-[#042F94] text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl hover:scale-[1.02] transition-all active:scale-95"
                    >
                        <Plus size={18} /> Add New Lead
                    </button>
                </div>
            </div>

            {/* Board Container */}
            <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
                {STAGES.map(stage => (
                    <div key={stage.id} className="min-w-[320px] w-[320px] flex flex-col h-full bg-[#F8FAFC] rounded-[2rem] border border-slate-100/50 p-4">
                        {/* Stage Header */}
                        <div className="flex items-center justify-between px-3 mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none">{stage.name}</h3>
                                <span className="text-[10px] font-black text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">{leads.filter(l => l.status === stage.id).length}</span>
                            </div>
                            <button className="text-slate-400 hover:text-slate-900"><MoreVertical size={16} /></button>
                        </div>

                        {/* Cards List */}
                        <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar min-h-[500px]">
                            {leads.filter(l => l.status === stage.id).map(lead => (
                                <LeadCard
                                    key={lead.id}
                                    lead={lead}
                                    onUpdate={handleStageChange}
                                    isUpdating={updating === lead.id}
                                />
                            ))}
                            {leads.filter(l => l.status === stage.id).length === 0 && (
                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-white/50">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Leads</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modals */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-900">Create New Lead</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleAddLead} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Student Name</label>
                                    <input
                                        required
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newLead.student_name}
                                        onChange={e => setNewLead({ ...newLead, student_name: e.target.value })}
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">WhatsApp Number</label>
                                    <input
                                        required
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newLead.whatsapp_number}
                                        onChange={e => setNewLead({ ...newLead, whatsapp_number: e.target.value })}
                                        placeholder="1234567890"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Course Interested</label>
                                <input
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newLead.course_interested}
                                    onChange={e => setNewLead({ ...newLead, course_interested: e.target.value })}
                                    placeholder="e.g. Science Class"
                                />
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200">
                                Save Lead to Pipeline
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ImportEduLeadModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={fetchLeads}
            />
        </div>
    );
}

function LeadCard({ lead, onUpdate, isUpdating }: any) {
    return (
        <div className={`
            p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 
            hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/10 
            transition-all duration-300 cursor-pointer group relative overflow-hidden
            ${isUpdating ? 'opacity-50 pointer-events-none' : ''}
        `}>
            {isUpdating && <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 backdrop-blur-sm"><Loader2 className="animate-spin text-blue-600" /></div>}

            {/* Accent Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-6 shadow-sm border border-slate-100">
                    {lead.student_name?.[0] || 'L'}
                </div>
                <div className="flex flex-col items-end">
                    <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[8px] font-black rounded-full uppercase tracking-[0.2em] mb-2 border border-blue-100">
                        {lead.lead_source || 'Unknown'}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5"><Calendar size={10} /> {new Date(lead.created_at).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="space-y-1.5 mb-6">
                <h4 className="text-base font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{lead.student_name}</h4>
                <div className="flex items-center gap-2">
                    <p className="text-[11px] text-slate-500 font-bold px-2 py-0.5 bg-slate-50 rounded-lg border border-slate-100">{lead.course_interested || "Not Specified"}</p>
                    {lead.grade && <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{lead.grade}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2.5 text-[10px] text-slate-500 font-black bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                    <MapPin size={12} className="text-slate-400 shrink-0" /> 
                    <span className="truncate">{lead.city || "Remote"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[10px] text-emerald-600 font-black bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                    <IndianRupee size={12} className="shrink-0" /> 
                    <span>{Number(lead.potential_revenue).toLocaleString('en-IN')}</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                <div className="flex gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); window.location.href = `/dashboard/chat?phone=${lead.whatsapp_number}`; }}
                        className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-black hover:scale-110 active:scale-95 transition-all shadow-lg shadow-slate-200"
                        title="Open WhatsApp Chat"
                    >
                        <MessageSquare size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onUpdate(lead.id, 'ENROLLED'); }}
                        className={`w-10 h-10 rounded-xl ${lead.status === 'ENROLLED' ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-400 hover:text-blue-600'} flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-slate-100`}
                        title="Mark as Enrolled"
                    >
                        <Plus size={18} />
                    </button>
                </div>
                
                <div className="relative">
                    <select
                        value={lead.status}
                        onChange={(e) => onUpdate(lead.id, e.target.value)}
                        className="appearance-none text-[9px] font-black text-slate-600 uppercase tracking-[0.15em] bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl outline-none cursor-pointer border border-slate-200 hover:border-blue-300 transition-all pr-8"
                    >
                        {STAGES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <ChevronRight size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
