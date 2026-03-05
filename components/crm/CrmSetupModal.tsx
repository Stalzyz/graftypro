"use client";

import { useState, useEffect } from "react";
import { X, Columns, Layers, Plus, Trash, LayoutPanelTop, Eye, EyeOff, Save, Loader2, FileText, BookOpen, ExternalLink, ChevronRight, HelpCircle } from "lucide-react";

interface CrmSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRefresh: () => void;
    stages: any[];
    columns: any[];
    initialTab?: "STAGES" | "COLUMNS" | "INTEGRATIONS" | "GUIDES";
}

export function CrmSetupModal({ isOpen, onClose, onRefresh, stages, columns, initialTab }: CrmSetupModalProps) {
    const [activeTab, setActiveTab] = useState<"STAGES" | "COLUMNS" | "INTEGRATIONS" | "GUIDES">("STAGES");

    useEffect(() => {
        if (isOpen && initialTab) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);
    const [loading, setLoading] = useState(false);
    const [workspaceId, setWorkspaceId] = useState<string>("");

    // Stage States
    const [newStageName, setNewStageName] = useState("");
    const [newStageColor, setNewStageColor] = useState("#3B82F6");

    // Column States
    const [newColName, setNewColName] = useState("");
    const [newColType, setNewColType] = useState<"TEXT" | "NUMBER" | "DATE" | "SELECT">("TEXT");
    const [isAddingColumn, setIsAddingColumn] = useState(false);

    // Fetch user context for webhook URL
    useEffect(() => {
        if (isOpen) {
            fetch("/api/auth/me")
                .then(res => res.json())
                .then(data => {
                    if (data.user?.workspace_id) setWorkspaceId(data.user.workspace_id);
                });
        }
    }, [isOpen]);

    const webhookUrl = workspaceId ? `${window.location.origin}/api/crm/webhook/${workspaceId}` : "Fetching URL...";
    const googleAppScriptCode = `/**
 * LIVE GOOGLE SHEETS SYNC
 * Paste this into Extensions > Apps Script
 */
function onFormSubmit(e) {
  var responses = e.namedValues;
  var payload = {
    name: responses['Full Name'] ? responses['Full Name'][0] : "New Lead",
    email: responses['Email'] ? responses['Email'][0] : "",
    phone: responses['Phone'] ? responses['Phone'][0] : "",
    source: "Google Sheets Live"
  };

  UrlFetchApp.fetch("${webhookUrl}", {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  });
}`;

    const handleAddStage = async () => {
        if (!newStageName) return;
        setLoading(true);
        try {
            const res = await fetch("/api/crm/stages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newStageName, color: newStageColor, order: stages.length })
            });

            if (res.ok) {
                setNewStageName("");
                onRefresh();
            }
        } catch (error) {
            console.error("Add Stage Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStage = async (id: string) => {
        if (!confirm("Are you sure? This may break leads in this stage.")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/crm/stages/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Failed to delete stage");
                return;
            }
            onRefresh();
        } catch (error) {
            console.error("Delete Stage Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddColumn = async () => {
        if (!newColName) return;
        setLoading(true);
        try {
            const res = await fetch("/api/crm/columns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newColName,
                    type: newColType,
                    order: columns.length
                })
            });

            if (res.ok) {
                setNewColName("");
                setIsAddingColumn(false);
                onRefresh();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to add column");
            }
        } catch (error) {
            console.error("Add Column Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteColumn = async (id: string) => {
        if (!confirm("Are you sure? This will remove this attribute from all leads.")) return;
        setLoading(true);
        try {
            await fetch(`/api/crm/columns/${id}`, { method: "DELETE" });
            onRefresh();
        } catch (error) {
            console.error("Delete Column Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleVisibility = async (col: any) => {
        setLoading(true);
        try {
            await fetch(`/api/crm/columns/${col.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_visible: !col.is_visible })
            });
            onRefresh();
        } catch (error) {
            console.error("Toggle Visibility Error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                <header className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-950/20">
                            <LayoutPanelTop size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">CRM Settings</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Configure pipeline stages & contact attributes</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 font-bold">
                        <X size={20} />
                    </button>
                </header>

                <div className="flex border-b border-slate-100 flex-shrink-0">
                    <button
                        onClick={() => setActiveTab("STAGES")}
                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === "STAGES" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        Pipeline Stages
                    </button>
                    <button
                        onClick={() => setActiveTab("COLUMNS")}
                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === "COLUMNS" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        Data Columns
                    </button>
                    <button
                        onClick={() => setActiveTab("INTEGRATIONS")}
                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === "INTEGRATIONS" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        Integrations
                    </button>
                    <button
                        onClick={() => setActiveTab("GUIDES")}
                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === "GUIDES" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            Help & Guides
                        </div>
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
                    {activeTab === "STAGES" && (
                        <div className="space-y-6 animate-in slide-in-from-left-2 duration-300">
                            <div className="grid grid-cols-12 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-10">
                                <input
                                    type="text"
                                    placeholder="New Stage Name"
                                    value={newStageName}
                                    onChange={(e) => setNewStageName(e.target.value)}
                                    className="col-span-12 md:col-span-8 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                                />
                                <div className="col-span-6 md:col-span-3 h-[46px] w-full flex items-center justify-center p-1 bg-white border border-slate-200 rounded-xl">
                                    <input
                                        type="color"
                                        value={newStageColor}
                                        onChange={(e) => setNewStageColor(e.target.value)}
                                        className="h-full w-full rounded-lg cursor-pointer border-none p-0 overflow-hidden bg-transparent"
                                    />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 pr-2">{newStageColor}</span>
                                </div>
                                <button
                                    onClick={handleAddStage}
                                    disabled={loading || !newStageName}
                                    className="col-span-6 md:col-span-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all active:scale-95 h-[46px]"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
                                </button>
                            </div>

                            <div className="space-y-3 pt-2">
                                {stages.map((stage, i) => (
                                    <div key={stage.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white/40" style={{ backgroundColor: stage.color }}>
                                                {i + 1}
                                            </div>
                                            <span className="font-extrabold text-slate-800 text-sm">{stage.name}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteStage(stage.id)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                ))}
                                {stages.length === 0 && (loading ? (
                                    <div className="p-10 text-center animate-pulse">
                                        <Loader2 size={24} className="animate-spin mx-auto text-blue-500 mb-2" />
                                        <p className="text-xs font-bold text-slate-400 uppercase">Synchronizing Stages...</p>
                                    </div>
                                ) : (
                                    <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-300 text-xs font-black uppercase tracking-[0.2em] leading-relaxed">
                                        Pipeline Initialization Required <br /> Add stages to configure workflow
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "COLUMNS" && (
                        <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                            <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
                                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 flex-shrink-0">
                                    <Columns size={24} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Data Integrity Guard</h4>
                                    <p className="text-xs font-bold text-amber-600/80 mt-1 leading-relaxed">System columns (Name, Email, Phone, Stage, Value) are immutable. Custom columns defined here will persist across the Universal CRM Index.</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {isAddingColumn && (
                                    <div className="grid grid-cols-12 gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm animate-in zoom-in duration-200">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Column Name (e.g. Website)"
                                            value={newColName}
                                            onChange={(e) => setNewColName(e.target.value)}
                                            className="col-span-12 md:col-span-7 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                                        />
                                        <select
                                            value={newColType}
                                            onChange={(e: any) => setNewColType(e.target.value)}
                                            className="col-span-8 md:col-span-4 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                        >
                                            <option value="TEXT">Short Text</option>
                                            <option value="NUMBER">Number</option>
                                            <option value="DATE">Date</option>
                                            <option value="SELECT">Select List</option>
                                        </select>
                                        <button
                                            onClick={handleAddColumn}
                                            disabled={loading || !newColName}
                                            className="col-span-4 md:col-span-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                                        >
                                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={20} />}
                                        </button>
                                        <button
                                            onClick={() => setIsAddingColumn(false)}
                                            className="col-span-12 text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest text-center mt-1"
                                        >
                                            Cancel Creation
                                        </button>
                                    </div>
                                )}

                                {columns.map((col) => (
                                    <div key={col.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-100 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400">
                                                {col.type === 'NUMBER' ? '00' : col.type === 'DATE' ? <Layers size={14} /> : 'Aa'}
                                            </div>
                                            <div>
                                                <p className="font-extrabold text-slate-800 text-sm">{col.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{col.key}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleVisibility(col)}
                                                className={`p-3 rounded-xl transition-all ${col.is_visible ? "text-blue-600 bg-blue-50" : "text-slate-300 bg-slate-50"}`}
                                            >
                                                {col.is_visible ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteColumn(col.id)}
                                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {!isAddingColumn && (
                                    <button
                                        onClick={() => setIsAddingColumn(true)}
                                        className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-300 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50/30 transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                                    >
                                        <Plus size={18} /> Add Custom Attribute
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "INTEGRATIONS" && (
                        <div className="space-y-8 animate-in slide-in-from-right-2 duration-300 pb-10">
                            {/* Google Sheets Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Google Sheets Live Pulse</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Automatic background ingestion</p>
                                    </div>
                                </div>
                                <div className="bg-slate-900 rounded-[2rem] p-6 text-white space-y-4 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                                    <p className="text-xs font-bold opacity-70 leading-relaxed">
                                        Use this script in your Google Sheets (Extensions {'>'} Apps Script) to sync new leads instantly to your CRM.
                                    </p>
                                    <div className="bg-black/40 rounded-2xl p-4 font-mono text-[10px] text-emerald-400 border border-white/5 max-h-[150px] overflow-y-auto no-scrollbar">
                                        <pre>{googleAppScriptCode}</pre>
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(googleAppScriptCode);
                                            alert("Script copied to clipboard!");
                                        }}
                                        className="w-full py-3 bg-white text-slate-900 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-emerald-400 hover:text-white transition-all active:scale-95"
                                    >
                                        Copy Apps Script Snippet
                                    </button>
                                </div>
                            </div>

                            {/* Meta Ads Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                                        <Layers size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Meta Lead Ads Webhook</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connect Facebook Lead Campaigns</p>
                                    </div>
                                </div>
                                <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 space-y-4 relative overflow-hidden group">
                                    <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                        Configure your Meta Developer App with this Callback URL to receive leads from Facebook Forms in real-time.
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-mono text-[10px] text-slate-600 truncate">
                                            {webhookUrl}
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(webhookUrl);
                                                alert("Webhook URL copied!");
                                            }}
                                            className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-all active:scale-95"
                                        >
                                            <Save size={14} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Verification Token</p>
                                            <p className="text-[10px] font-bold text-slate-700 truncate">SST_WABOT_SECURE_VERIFY</p>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab("GUIDES")}
                                            className="flex items-center justify-center gap-2 bg-blue-600/5 text-blue-600 border border-blue-600/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                                        >
                                            Setup Guide
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "GUIDES" && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-10">
                            {/* Intro */}
                            <div className="p-6 bg-blue-600 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20">
                                <h3 className="text-xl font-black flex items-center gap-3">
                                    <BookOpen size={24} />
                                    Connection Guides
                                </h3>
                                <p className="text-xs font-bold opacity-80 mt-2 leading-relaxed">
                                    Step-by-step instructions to automate your lead generation by connecting Google Sheets and Meta Ads to your CRM Engine.
                                </p>
                            </div>

                            {/* Google Sheets Guide */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                                            <FileText size={20} />
                                        </div>
                                        <h4 className="font-black text-slate-800 uppercase tracking-tight">Google Sheets Sync Setup</h4>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[8px] font-black uppercase">Live Sync</span>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { step: 1, title: "Prepare Your Sheet", desc: "Ensure your Google Sheet has headers named 'Full Name', 'Email', and 'Phone' in any column." },
                                        { step: 2, title: "Open Apps Script", desc: "In your Spreadsheet menu, go to Extensions > Apps Script." },
                                        { step: 3, title: "Deploy Integration Snippet", desc: "Copy the code from the 'Integrations' tab and paste it into the editor, replacing everything." },
                                        { step: 4, title: "Configure Automation Trigger", desc: "Click the Clock Icon (Triggers) > + Add Trigger. Set function to 'onFormSubmit', Event source to 'From spreadsheet', and Event type to 'On form submit'." },
                                        { step: 5, title: "Final Authorization", desc: "Save the trigger and authorize the Google account. Your leads will now sync in real-time!" }
                                    ].map((s) => (
                                        <div key={s.step} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 transition-all group">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex-shrink-0 flex items-center justify-center text-emerald-600 text-xs font-black">
                                                {s.step}
                                            </div>
                                            <div>
                                                <h5 className="font-extrabold text-slate-900 text-sm mb-0.5">{s.title}</h5>
                                                <p className="text-xs font-bold text-slate-500 leading-relaxed">{s.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Meta Ads Guide */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                                            <Layers size={20} />
                                        </div>
                                        <h4 className="font-black text-slate-800 uppercase tracking-tight">Meta Lead Ads Webhook</h4>
                                    </div>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[8px] font-black uppercase">API Connect</span>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { step: 1, title: "Developer Portal Access", desc: "Login to developers.facebook.com and create or select your Business App." },
                                        { step: 2, title: "Add Webhooks Product", desc: "Click 'Add Product' in the left menu and select 'Webhooks'." },
                                        { step: 3, title: "Configure Subscription", desc: "Select 'Page' from the dropdown. Use the Callback URL and Verify Token provided in the Integrations tab." },
                                        { step: 4, title: "Subscribe to Leadgen", desc: "In the list of Page fields, find 'leadgen' and click 'Subscribe'. This enables real-time data flow." },
                                        { step: 5, title: "Permission Check", desc: "Ensure your app has 'leads_retrieval' permission with Advanced Access for automated ingestion." }
                                    ].map((s) => (
                                        <div key={s.step} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 transition-all group">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex-shrink-0 flex items-center justify-center text-blue-600 text-xs font-black">
                                                {s.step}
                                            </div>
                                            <div>
                                                <h5 className="font-extrabold text-slate-900 text-sm mb-0.5">{s.title}</h5>
                                                <p className="text-xs font-bold text-slate-500 leading-relaxed">{s.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <a
                                    href="https://developers.facebook.com/docs/marketing-api/guides/lead-ads/webhooks"
                                    target="_blank"
                                    className="flex items-center justify-center gap-2 w-full py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                                >
                                    Official Meta Documentation <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-slate-100 flex-shrink-0 bg-slate-50/50">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-xl shadow-slate-950/10"
                    >
                        CLOSE SETTINGS
                    </button>
                </div>
            </div>
        </div>
    );
}
