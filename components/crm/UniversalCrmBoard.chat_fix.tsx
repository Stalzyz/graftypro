"use client";

import {
    MoreHorizontal, Smartphone, Mail, Globe,
    Calendar, CheckCircle2, MessageSquare, AlertCircle
} from "lucide-react";

export function UniversalCrmBoard({
    view, leads, columns, stages, loading, onRefresh, onEdit
}: any) {
    if (loading) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center p-20 animate-pulse bg-slate-50/50">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading CRM...</h3>
            </div>
        );
    }

    if (view === "table") {
        return (
            <div className="h-full w-full overflow-auto custom-scrollbar bg-white">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 w-12 text-center text-[10px] font-black uppercase text-slate-400">#</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Primary Identity</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest w-40">Pipeline Stage</th>
                            {Array.isArray(columns) && columns.filter((c: any) => c.is_visible).map((col: any) => (
                                <th key={col.key} className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">
                                    {col.name}
                                </th>
                            ))}
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Added On</th>
                            <th className="px-6 py-4 w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {leads.map((lead: any, i: number) => (
                            <tr key={lead.id} onClick={() => onEdit && onEdit(lead)} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                <td className="px-6 py-4 text-center text-xs font-black text-slate-300">{i + 1}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900">{lead.name}</span>
                                        <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400">
                                            {lead.phone && <span className="flex items-center gap-1"><Smartphone size={10} /> {lead.phone}</span>}
                                            {lead.email && <span className="flex items-center gap-1"><Mail size={10} /> {lead.email}</span>}
                                            {lead.source && (
                                                <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${lead.source.includes("META") ? "bg-blue-600 text-white" :
                                                    lead.source.includes("SHEET") ? "bg-emerald-600 text-white" :
                                                        "bg-slate-200 text-slate-600"
                                                    }`}>
                                                    {lead.source}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className="text-[10px] font-black px-2 py-1 rounded-md border uppercase tracking-widest"
                                        style={{
                                            borderColor: lead.stage?.color || '#94a3b8',
                                            color: lead.stage?.color || '#94a3b8',
                                            backgroundColor: `${lead.stage?.color || '#94a3b8'}10`
                                        }}
                                    >
                                        {lead.stage?.name || lead.status}
                                    </span>
                                </td>
                                {Array.isArray(columns) && columns.filter((c: any) => c.is_visible).map((col: any) => (
                                    <td key={col.key} className="px-6 py-4 text-sm font-medium text-slate-600 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                        {lead.custom_data?.[col.key] || '-'}
                                    </td>
                                ))}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-bold text-slate-600" suppressHydrationWarning>{new Date(lead.created_at).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(lead); }} className="text-slate-300 hover:text-blue-500 transition-colors p-2 opacity-0 group-hover:opacity-100">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {leads.length === 0 && (
                            <tr>
                                <td colSpan={10} className="px-6 py-20 text-center">
                                    <Globe size={48} className="mx-auto mb-4 text-slate-200" />
                                    <h3 className="text-lg font-black text-slate-400">Database Empty</h3>
                                    <p className="text-sm font-medium text-slate-300 mt-2">Add a lead or sync from an integration to begin.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    } // end table view

    if (view === "kanban") {
        return (
            <div className="h-full w-full overflow-x-auto flex items-start gap-6 p-6 bg-slate-50/50">
                {Array.isArray(stages) && stages.map((stage: any) => {
                    const stageLeads = Array.isArray(leads) ? leads.filter((l: any) => l.stage_id === stage.id) : [];
                    return (
                        <div key={stage.id} className="w-80 flex-shrink-0 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex flex-col max-h-full">
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md rounded-t-[2rem] z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                                    <h4 className="font-black text-slate-900 tracking-tight">{stage.name}</h4>
                                </div>
                                <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{stageLeads.length}</span>
                            </div>

                            <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                                {stageLeads.map((lead: any) => (
                                    <div key={lead.id} onClick={() => onEdit && onEdit(lead)} className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="font-black text-slate-800 leading-tight">{lead.name}</h5>
                                            <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(lead); }} className="text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                        {lead.source && (
                                            <div className="mb-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${lead.source.includes("META") ? "bg-blue-600 text-white" :
                                                    lead.source.includes("SHEET") ? "bg-emerald-600 text-white" :
                                                        "bg-slate-100 text-slate-500"
                                                    }`}>
                                                    {lead.source}
                                                </span>
                                            </div>
                                        )}
                                        <div className="text-[10px] font-bold text-slate-400 space-y-1 mb-3">
                                            {lead.phone && <div className="flex items-center gap-1.5"><Smartphone size={12} />{lead.phone}</div>}
                                            {lead.email && <div className="flex items-center gap-1.5"><Mail size={12} />{lead.email}</div>}
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                            <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider" suppressHydrationWarning>
                                                ₹{parseFloat(lead.deal_value || 0).toLocaleString()}
                                            </div>
                                            {lead.contact_id ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (lead.phone) {
                                                            window.location.href = `/dashboard/chat?phone=${lead.phone}`;
                                                        }
                                                    }}
                                                    className="text-emerald-500 flex items-center gap-1 text-[9px] font-black uppercase hover:bg-emerald-50 px-2 py-1 rounded-md transition-colors"
                                                >
                                                    <MessageSquare size={12} /> Chat
                                                </button>
                                            ) : (
                                                <span className="text-slate-300 text-[9px] font-black uppercase flex items-center gap-1">
                                                    <AlertCircle size={10} /> No Waba
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {stageLeads.length === 0 && (
                                    <div className="h-24 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-300 text-xs font-bold uppercase tracking-widest">
                                        Drop Here
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Add Stage Column */}
                <div className="w-80 flex-shrink-0 h-40 border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:text-blue-500 transition-all rounded-[2rem] flex items-center justify-center text-slate-400 font-black uppercase tracking-widest cursor-pointer text-sm gap-2">
                    + Add Stage
                </div>
            </div>
        );
    }

    return null;
}
