
"use client";

import React, { useState, useEffect } from "react";
import { 
    Users, 
    Search, 
    Download, 
    Filter, 
    Phone, 
    Calendar, 
    Wrench,
    RefreshCw,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    MousePointer2
} from "lucide-react";
import { format } from "date-fns";

export default function LeadsDashboard() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterTool, setFilterTool] = useState("ALL");
    
    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/super-admin/leads");
            const data = await res.json();
            setLeads(data.leads || []);
        } catch (error) {
            console.error("Failed to fetch leads:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.phone.includes(searchTerm);
        const matchesFilter = filterTool === "ALL" || lead.tool_type === filterTool;
        return matchesSearch && matchesFilter;
    });

    const exportToCSV = () => {
        const headers = ["Phone", "Tool", "Date", "Metadata"];
        const rows = filteredLeads.map(l => [
            l.phone,
            l.tool_type,
            format(new Date(l.created_at), 'yyyy-MM-dd HH:mm'),
            JSON.stringify(l.metadata || {})
        ]);
        
        const content = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-10 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#27954D] font-semibold text-[10px] uppercase tracking-[0.2em] mb-3">
                        <Users size={14} />
                        Growth Engine
                    </div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight italic">Tool Leads</h1>
                    <p className="text-slate-400 text-sm font-medium">Captured phone numbers from free platform utilities.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={exportToCSV}
                        className="px-6 py-4 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <Download size={14} />
                        Export CSV
                    </button>
                    <button 
                         onClick={fetchLeads}
                         className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                            type="text"
                            placeholder="Search by phone number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-emerald-50 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="relative group min-w-[200px]">
                        <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                        <select 
                            value={filterTool}
                            onChange={(e) => setFilterTool(e.target.value)}
                            className="w-full pl-14 pr-10 py-5 bg-white border border-slate-100 rounded-3xl text-sm font-bold appearance-none focus:ring-4 focus:ring-emerald-50 outline-none cursor-pointer transition-all shadow-sm"
                        >
                            <option value="ALL">All Tools</option>
                            <option value="LINK_GENERATOR">Link Generator</option>
                            <option value="COST_CALCULATOR">Cost Calculator</option>
                            <option value="GREEN_TICK_CHECKER">Green Tick</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Captured From</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                                            Synchronizing Lead Registry...
                                        </td>
                                    </tr>
                                ) : filteredLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                                            No leads found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLeads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                        <Phone size={16} />
                                                    </div>
                                                    <span className="font-bold text-slate-800">+{lead.phone}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-black text-[#042f94] uppercase tracking-tight">
                                                        {lead.tool_type.replace(/_/g, ' ')}
                                                    </span>
                                                    {lead.metadata?.region && (
                                                        <span className="text-[10px] text-slate-400 font-medium italic">
                                                            Region: {lead.metadata.region}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-slate-500 font-medium text-xs italic">
                                                    <Calendar size={14} className="text-slate-300" />
                                                    {format(new Date(lead.created_at), 'MMM dd, yyyy • HH:mm')}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <a 
                                                    href={`https://wa.me/${lead.phone}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    Contact <ExternalLink size={12} />
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

