"use client";
import React, { useEffect, useState } from 'react';
import {
    Target,
    Plus,
    Search,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    ChevronRight,
    MessageSquare,
    CheckCircle2,
    Clock,
    MoreHorizontal,
    Loader2
} from 'lucide-react';

export default function LeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newLead, setNewLead] = useState({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        notes: '',
        source: 'MANUAL'
    });

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await fetch("/api/reseller/leads");
            const json = await res.json();
            setLeads(json.data || []);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/reseller/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newLead)
            });
            const json = await res.json();
            if (json.success) {
                setShowModal(false);
                fetchLeads();
                setNewLead({ name: '', email: '', phone: '', businessName: '', notes: '', source: 'MANUAL' });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Simple Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#27954D] font-black text-[9px] uppercase tracking-[0.3em] mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        Sales Leads
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                        Manage Leads<span className="text-[#27954D]">.</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm tracking-tight italic">Track and manage your incoming sales inquiries and opportunities.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#27954D] text-white rounded-2xl font-bold text-sm hover:bg-[#1f7a3f] transition-all shadow-lg active:scale-95"
                >
                    <Plus size={18} /> Secure New Lead
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox label="New Leads" value={leads.filter(l => l.status === 'NEW').length} icon={<Clock size={16} className="text-blue-500" />} color="blue" />
                <StatBox label="Contacted" value={leads.filter(l => l.status === 'CONTACTED').length} icon={<Mail size={16} className="text-amber-500" />} color="amber" />
                <StatBox label="Proposals" value={leads.filter(l => l.status === 'PROPOSAL_SENT').length} icon={<Briefcase size={16} className="text-purple-500" />} color="purple" />
                <StatBox label="Converted" value={leads.filter(l => l.status === 'CONVERTED').length} icon={<CheckCircle2 size={16} className="text-[#27954D]" />} color="green" />
            </div>

            {/* Pipeline Table */}
            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Find target lead..."
                            className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-12 pr-4 text-sm font-medium focus:border-[#27954D] outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5">Target Identity</th>
                                <th className="px-8 py-5">Communication</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Captured</th>
                                <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {leads.map((lead: any) => (
                                <tr key={lead.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-[#27954D] group-hover:text-white transition-all">
                                                <Target size={18} />
                                            </div>
                                            <div>
                                                <div className="text-slate-900 font-bold tracking-tight">{lead.name}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{lead.business_name || 'Individual'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            {lead.email && <div className="flex items-center gap-2 text-xs text-slate-600 font-medium"><Mail size={12} className="text-slate-300" /> {lead.email}</div>}
                                            {lead.phone && <div className="flex items-center gap-2 text-xs text-slate-600 font-medium"><Phone size={12} className="text-slate-300" /> {lead.phone}</div>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${lead.status === 'CONVERTED' ? 'bg-green-50 text-green-600 border-green-100' :
                                            lead.status === 'PROPOSAL_SENT' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                'bg-slate-50 text-slate-500 border-slate-200'
                                            }`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-slate-400 font-bold text-[10px] uppercase">
                                        {new Date(lead.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 hover:bg-slate-100 text-slate-400 rounded-xl transition-all">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {leads.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-60">
                                            <Target size={48} className="text-slate-200 mb-4" />
                                            <div className="text-sm font-bold text-slate-400">No leads in pipeline.</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Lead Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white border border-slate-200 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-slate-100 bg-slate-50">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Secure Target Lead</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Initiate sales nurture sequence</p>
                        </div>

                        <form onSubmit={handleCreate} className="p-10 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Lead Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Authorized Rep Name"
                                        value={newLead.name}
                                        onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-[#27954D] outline-none transition-all placeholder:text-slate-300"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Business Identity</label>
                                    <input
                                        type="text"
                                        placeholder="Legal Entity Name"
                                        value={newLead.businessName}
                                        onChange={(e) => setNewLead({ ...newLead, businessName: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-[#27954D] outline-none transition-all placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Direct Email</label>
                                    <input
                                        type="email"
                                        placeholder="corporate@domain.com"
                                        value={newLead.email}
                                        onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-[#27954D] outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Active Phone</label>
                                    <input
                                        type="text"
                                        placeholder="+91 XXX XXX XXXX"
                                        value={newLead.phone}
                                        onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-[#27954D] outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Strategic Notes</label>
                                <textarea
                                    rows={3}
                                    placeholder="Sales context / specific requirements..."
                                    value={newLead.notes}
                                    onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#27954D] outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                >
                                    Dismiss
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] py-4 bg-[#27954D] text-white hover:bg-[#1f7a3f] rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={18} />}
                                    Initialize Lead Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatBox({ label, value, icon, color }: any) {
    const colorMap: any = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        green: 'bg-green-50 text-green-600 border-green-100',
    };
    return (
        <div className="bg-white border border-slate-100 p-5 rounded-[1.5rem] flex items-center justify-between shadow-sm hover:border-slate-200 transition-all">
            <div>
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 leading-none">{label}</div>
                <div className="text-2xl font-black text-slate-900 tabular-nums">{value}</div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]} border shadow-sm`}>
                {icon}
            </div>
        </div>
    );
}
