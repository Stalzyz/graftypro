"use client";
import React, { useEffect, useState } from 'react';
import {
    Briefcase, Plus, FileText, Receipt, Trash2,
    Send, Eye, ChevronRight, Search, Clock,
    CheckCircle2, Shield, Target, ArrowUpRight,
    X, Loader2, Sparkles, Activity
} from 'lucide-react';

export default function ProposalsPage() {
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newProposal, setNewProposal] = useState({
        title: '',
        leadId: '',
        items: [{ title: 'Standard Plan', price: 999 }, { title: 'Drip Module', price: 499 }],
        totalAmount: 1498
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        try {
            const res = await fetch("/api/reseller/proposals");
            const json = await res.json();
            setProposals(json.data || []);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch("/api/reseller/proposals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProposal)
            });
            const json = await res.json();
            if (json.success) {
                setShowModal(false);
                fetchProposals();
                setNewProposal({ title: '', leadId: '', items: [], totalAmount: 0 });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCreating(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-24">

            {/* Simple Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.25em] mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                        Proposal Documents
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                        My Proposals<span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm tracking-tight italic">Draft and manage sales proposals for potential high-value vendors.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="group bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl active:scale-95 hover:bg-black"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                    Draft New Proposal
                </button>
            </div>

            {/* Strategic Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm flex items-center gap-6 group hover:border-blue-100 transition-all">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 group-hover:scale-110 transition-transform">
                        <Target size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Active Pipeline</div>
                        <div className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">{proposals.length} Drafts</div>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm flex items-center gap-6 group hover:border-emerald-100 transition-all">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#27954D] shadow-sm border border-emerald-100 group-hover:scale-110 transition-transform">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Conv. Rate</div>
                        <div className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">64.2%</div>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm flex items-center gap-6 group hover:border-[#042F94]/10 transition-all">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                        <Activity size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Matrix Yield</div>
                        <div className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">High</div>
                    </div>
                </div>
            </div>

            {/* Invoices List Terminal */}
            <div className="bg-white border border-slate-100 rounded-[3.5rem] shadow-sm overflow-hidden animate-in fade-in duration-700">
                <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="relative w-full max-w-md group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="SEARCH NEGOTIATION RECORDS..."
                            className="w-full bg-white border border-slate-200 rounded-[2rem] py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest text-slate-900 focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-200"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em] border-b border-slate-50">
                            <tr>
                                <th className="px-10 py-6">Strategic Plan</th>
                                <th className="px-10 py-6">Pricing Matrix</th>
                                <th className="px-10 py-6">Negotiation Status</th>
                                <th className="px-10 py-6">Timestamp</th>
                                <th className="px-10 py-6 text-right">Terminal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {proposals.map((proposal: any) => (
                                <tr key={proposal.id} className="hover:bg-slate-50 transition-all group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all shadow-sm">
                                                <Briefcase size={20} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black italic tracking-tighter text-slate-900 uppercase group-hover:text-blue-600 transition-colors">{proposal.title}</div>
                                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Commercial Artifact</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="text-2xl font-black italic tracking-tighter text-slate-900 tabular-nums leading-none">₹{Number(proposal.total_amount).toLocaleString()}</div>
                                        <div className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-1 italic leading-none">Full Value</div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest shadow-sm ${proposal.status === 'ACCEPTED' ? 'bg-emerald-50 text-[#27954D] border-emerald-100' :
                                            proposal.status === 'SENT' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                'bg-slate-50 text-slate-500 border-slate-100'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${proposal.status === 'ACCEPTED' ? 'bg-[#27954D] animate-pulse' :
                                                proposal.status === 'SENT' ? 'bg-blue-400' :
                                                    'bg-slate-300'
                                                }`} />
                                            {proposal.status}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none font-mono">
                                            {new Date(proposal.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button className="p-3 bg-white border border-slate-100 text-slate-300 hover:text-slate-900 hover:border-slate-300 rounded-xl transition-all shadow-sm active:scale-90">
                                                <Eye size={18} />
                                            </button>
                                            <button className="p-3 bg-slate-900 text-white rounded-xl transition-all shadow-lg hover:bg-black active:scale-95 shadow-black/10">
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {proposals.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-10 py-32 text-center text-slate-300">
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 border border-slate-100">
                                                <Briefcase size={32} />
                                            </div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] font-italic">No Strategy Active</h3>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Proposal Modal Engine */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="absolute inset-0" onClick={() => setShowModal(false)}></div>
                    <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-[3.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 z-10">
                        <div className="p-12 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase leading-none mb-1">Construct strategy</h2>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic leading-none mt-1">Pricing Configuration Matrix</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center rounded-[1.5rem] bg-white border border-slate-100 hover:border-rose-200 hover:text-rose-500 transition-all text-slate-400 shadow-sm active:scale-90">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-12 space-y-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-1">Campaign Namespace</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="E.G. ENTERPRISE GROWTH ARTIFACT"
                                    value={newProposal.title}
                                    onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] py-5 px-8 text-lg font-black italic uppercase tracking-tighter text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-200 shadow-inner"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Strategy Components</div>
                                    <button type="button" className="text-[9px] font-black uppercase text-blue-600 hover:underline transition-all flex items-center gap-1 italic">Inject Module <Plus size={12} /></button>
                                </div>
                                <div className="space-y-3">
                                    {newProposal.items.map((item, i) => (
                                        <div key={i} className="flex gap-6 items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-blue-100 transition-all group/item">
                                            <div className="flex-1">
                                                <div className="text-xs font-black italic text-slate-900 uppercase tracking-tight">{item.title}</div>
                                                <div className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Included Protocol</div>
                                            </div>
                                            <div className="text-sm font-black italic text-slate-500 tabular-nums">₹{item.price}</div>
                                            <button type="button" className="p-2.5 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-8 bg-slate-900 rounded-[2.5rem] relative overflow-hidden group/total">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full group-hover/total:scale-150 transition-transform duration-1000" />
                                <span className="text-[10px] font-black uppercase text-white/30 tracking-[0.4em] relative z-10 italic">Total value</span>
                                <span className="text-4xl font-black italic tracking-tighter text-white relative z-10 tabular-nums leading-none">₹{newProposal.totalAmount.toLocaleString()}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full py-6 bg-blue-600 text-white hover:bg-black rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                {creating ? <Loader2 className="animate-spin" /> : <>Initiate Strategy Broadcast <ArrowUpRight size={20} /></>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
