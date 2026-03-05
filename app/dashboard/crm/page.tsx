"use client";

import { useState, useEffect } from "react";
import { useBranding } from "../../../hooks/use-branding";
import {
    Users, Plus, Columns, Search, Filter,
    Download, Upload, Settings, LayoutGrid, List, HelpCircle
} from "lucide-react";
import { UniversalCrmBoard } from "../../../components/crm/UniversalCrmBoard";
import { AddLeadModal } from "../../../components/crm/AddLeadModal";
import { ImportCrmModal } from "../../../components/crm/ImportCrmModal";
import { CrmSetupModal } from "../../../components/crm/CrmSetupModal";
import { EditLeadModal } from "../../../components/crm/EditLeadModal";

export default function UniversalCrmPage() {
    const { branding } = useBranding();
    const [view, setView] = useState<"table" | "kanban">("table");

    // Modals
    const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isSetupOpen, setIsSetupOpen] = useState(false);
    const [setupTab, setSetupTab] = useState<"STAGES" | "COLUMNS" | "INTEGRATIONS" | "GUIDES">("STAGES");
    const [editLeadTarget, setEditLeadTarget] = useState<any>(null);

    // Core Data States
    const [leads, setLeads] = useState<any[]>([]);
    const [columns, setColumns] = useState<any[]>([]);
    const [stages, setStages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [leadsRes, colsRes, stagesRes] = await Promise.all([
                fetch("/api/crm/leads"),
                fetch("/api/crm/columns"),
                fetch("/api/crm/stages")
            ]);

            const [leadsData, colsData, stagesData] = await Promise.all([
                leadsRes.json(), colsRes.json(), stagesRes.json()
            ]);

            setLeads(Array.isArray(leadsData) ? leadsData : []);
            setColumns(Array.isArray(colsData) ? colsData : []);
            setStages(Array.isArray(stagesData) ? stagesData : []);

            if (!Array.isArray(leadsData) || !Array.isArray(colsData) || !Array.isArray(stagesData)) {
                console.error("CRM Data Fetch failed:", { leadsData, colsData, stagesData });
            }
        } catch (error) {
            console.error("CRM Load Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const res = await fetch("/api/crm/leads/export");
            if (!res.ok) throw new Error("Export failed");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `crm_export_${new Date().getTime()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export Error:", error);
            alert("Export failed");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900">CRM Engine</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Universal Customer Data Server</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Toggles */}
                    <div className="bg-slate-100 p-1 rounded-xl flex">
                        <button
                            onClick={() => setView('table')}
                            className={`p-2 rounded-lg text-sm transition-all ${view === 'table' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setView('kanban')}
                            className={`p-2 rounded-lg text-sm transition-all ${view === 'kanban' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>

                    <div className="h-8 w-px bg-slate-200"></div>

                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors shadow-sm"
                    >
                        <Upload size={14} /> Import
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors shadow-sm"
                    >
                        <Download size={14} /> Export
                    </button>

                    <button
                        onClick={() => setIsAddLeadOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <Plus size={16} /> Add Lead
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden flex flex-col p-8">
                {/* Search & Utility Bar */}
                <div className="flex items-center justify-between mb-6 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 flex-1">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search across all leads, columns, and notes..."
                                className="w-full pl-12 pr-4 py-3 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pr-2">
                        <button className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-800 font-bold rounded-xl text-xs hover:bg-slate-100 transition-colors">
                            <Filter size={14} /> Filter
                        </button>
                        <button
                            onClick={() => {
                                setSetupTab("STAGES");
                                setIsSetupOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-800 font-bold rounded-xl text-xs hover:bg-slate-100 transition-colors"
                        >
                            <Settings size={14} /> Setup
                        </button>
                        <button
                            onClick={() => {
                                setSetupTab("GUIDES");
                                setIsSetupOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-bold rounded-xl text-xs hover:bg-blue-50 transition-colors border border-blue-100/50"
                        >
                            <HelpCircle size={14} /> Help & Guides
                        </button>
                    </div>
                </div>

                {/* The Board */}
                <div className="flex-1 overflow-hidden bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                    <UniversalCrmBoard
                        view={view}
                        leads={leads}
                        columns={columns}
                        stages={stages}
                        loading={loading}
                        onRefresh={fetchData}
                        onEdit={(lead: any) => setEditLeadTarget(lead)}
                    />
                </div>
            </main>

            {/* Modals */}
            <AddLeadModal
                isOpen={isAddLeadOpen}
                onClose={() => setIsAddLeadOpen(false)}
                onSuccess={fetchData}
                stages={stages}
                columns={columns}
            />
            <ImportCrmModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onSuccess={fetchData}
                stages={stages}
            />
            <CrmSetupModal
                isOpen={isSetupOpen}
                initialTab={setupTab}
                onClose={() => setIsSetupOpen(false)}
                onRefresh={fetchData}
                stages={stages}
                columns={columns}
            />
            <EditLeadModal
                isOpen={!!editLeadTarget}
                lead={editLeadTarget}
                onClose={() => setEditLeadTarget(null)}
                onSuccess={fetchData}
                stages={stages}
                columns={columns}
            />
        </div>
    );
}

