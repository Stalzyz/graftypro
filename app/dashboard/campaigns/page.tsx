"use client";

import { useState, useEffect, useCallback } from "react";
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
    CheckCircle,
    Image as ImageIcon,
    Variable,
    Info,
    AlertTriangle,
    ChevronDown,
    Save,
    RotateCcw,
    MousePointer2
} from "lucide-react";
import { SmartUploader } from "@/components/ui/SmartUploader";
import { toast } from "react-hot-toast";

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
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [flowId, setFlowId] = useState("");
    const [segmentId, setSegmentId] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [headerMediaUrl, setHeaderMediaUrl] = useState("");
    const [variableMapping, setVariableMapping] = useState<Record<string, string>>({});
    const [sending, setSending] = useState(false);
    
    // Retargeting State
    const [retargetModal, setRetargetModal] = useState<any>(null); 
    const [retargetType, setRetargetType] = useState<"READ" | "UNREAD" | "FAILED" | "REPLIED" | "NONE">("NONE");
    const [showRetargetOptions, setShowRetargetOptions] = useState(false);
    const [intelData, setIntelData] = useState<any>(null);
    const [loadingIntel, setLoadingIntel] = useState(false);

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (showRetargetOptions && retargetModal) {
            fetchIntelligence(retargetModal.id);
        }
    }, [showRetargetOptions, retargetModal]);

    const fetchIntelligence = async (cid: string) => {
        setLoadingIntel(true);
        try {
            const res = await fetch(`/api/campaigns/${cid}/intelligence`);
            const data = await res.json();
            if (data.success) setIntelData(data.data);
        } catch (e) {
            console.error("Failed to fetch intelligence:", e);
        } finally {
            setLoadingIntel(false);
        }
    };

    // When a template is selected, auto-detect its variables and header type
    const handleTemplateSelect = useCallback((tName: string) => {
        setTemplateName(tName);
        const tmpl = templates.find((t: any) => t.name === tName);
        setSelectedTemplate(tmpl || null);
        setVariableMapping({});
        setHeaderMediaUrl("");
    }, [templates]);

    const fetchData = async () => {
        try {
            const [cRes, sRes, tRes, fRes] = await Promise.all([
                fetch("/api/campaigns"),
                fetch("/api/segments"),
                fetch("/api/templates"),
                fetch("/api/flows")
            ]);

            const [cData, sData, tData, fData] = await Promise.all([
                cRes.json(), sRes.json(), tRes.json(), fRes.json()
            ]);

            if (cData.data) setCampaigns(cData.data);
            if (sData.data) setSegments(sData.data);
            if (tData.data) setTemplates(tData.data);
            if (fData.data) setFlows(fData.data.filter((f: any) => f.status === 'PUBLISHED'));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
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
                    scheduledAt: scheduledAt || null,
                    variableMapping: targetType === 'TEMPLATE' ? variableMapping : {},
                    headerMediaUrl: targetType === 'TEMPLATE' ? (headerMediaUrl || null) : null,
                    // Pass retargeting context if active
                    retargeting: retargetType !== 'NONE' ? { campaign_id: retargetModal.id, type: retargetType } : null
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

    const handleStatusChange = async (cid: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/campaigns/${cid}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                toast.success(`Campaign ${newStatus.toLowerCase()} successfully`);
                fetchData();
            } else {
                toast.error("Failed to update status");
            }
        } catch (e) {
            toast.error("Error updating status");
        }
    };

    const resetForm = () => {
        setName(""); setTargetType("TEMPLATE"); setTemplateName("");
        setSelectedTemplate(null); setFlowId(""); setSegmentId("");
        setScheduledAt(""); setHeaderMediaUrl(""); setVariableMapping({});
        setRetargetType("NONE"); setRetargetModal(null); setShowRetargetOptions(false);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'badge-success';
            case 'PROCESSING': return 'badge-warning animate-pulse';
            case 'PAUSED': return 'bg-amber-100 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold';
            case 'CANCELLED': return 'bg-rose-100 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-bold';
            case 'SCHEDULED': return 'badge-info';
            default: return 'badge-neutral';
        }
    };

    // Parse detected variables/header from selected template's components
    const detectedVars: number[] = [];
    let hasHeader = false;
    let headerFormat = "";
    if (selectedTemplate && Array.isArray(selectedTemplate.components)) {
        for (const comp of selectedTemplate.components) {
            if (comp.type === "HEADER") { hasHeader = true; headerFormat = comp.format; }
            if (comp.type === "BODY" && comp.text) {
                const matches = comp.text.match(/{{([0-9]+)}}/g) || [];
                matches.forEach((m: string) => {
                    const n = parseInt(m.replace(/{{|}}/g, ""));
                    if (!detectedVars.includes(n)) detectedVars.push(n);
                });
            }
        }
        detectedVars.sort((a, b) => a - b);
    }

    const CONTACT_FIELDS = [
        { value: "name", label: "Contact Name" },
        { value: "phone", label: "Phone Number" },
        { value: "email", label: "Email" },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Campaigns</h1>
                    <p className="text-gray-500 text-sm">Create and monitor your broadcast campaigns.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                    <Plus size={18} /> New Campaign
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <MiniStat label="Total Campaigns" value={campaigns.length} icon={<Send size={18} />} color="text-[#042f94]" bg="bg-[#27954D]/10" />
                <MiniStat label="Sent Successfully" value={campaigns.reduce((acc, c) => acc + (c.stats?.sent || 0), 0).toLocaleString()} icon={<TrendingUp size={18} />} color="text-green-600" bg="bg-green-50" />
                <MiniStat label="Failed Total" value={campaigns.reduce((acc, c) => acc + (c.stats?.failed || 0), 0).toLocaleString()} icon={<AlertTriangle size={18} />} color="text-rose-600" bg="bg-rose-50" />
                <MiniStat label="Active" value={campaigns.filter(c => c.status === 'PROCESSING').length} icon={<Zap size={18} />} color="text-amber-600" bg="bg-amber-50" />
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
                                                {c.stats?.failed > 0 && <span className="text-rose-500 font-bold">{c.stats.failed} Failed</span>}
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                                                <div 
                                                    className="h-full bg-[#27954D] transition-all duration-500" 
                                                    style={{ width: `${Math.round(((c.stats?.sent || 0) / (c.stats?.total || 1)) * 100)}%` }}
                                                ></div>
                                                <div 
                                                    className="h-full bg-rose-500 transition-all duration-500" 
                                                    style={{ width: `${Math.round(((c.stats?.failed || 0) / (c.stats?.total || 1)) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`badge ${getStatusBadge(c.status)}`}>{c.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {c.status === 'PROCESSING' && (
                                                <button 
                                                    onClick={() => handleStatusChange(c.id, 'PAUSED')}
                                                    className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="Pause Campaign"
                                                >
                                                    <Clock size={16} />
                                                </button>
                                            )}
                                            {c.status === 'PAUSED' && (
                                                <button 
                                                    onClick={() => handleStatusChange(c.id, 'PROCESSING')}
                                                    className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Resume Campaign"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            )}
                                            {(c.status === 'PROCESSING' || c.status === 'PAUSED') && (
                                                <button 
                                                    onClick={() => handleStatusChange(c.id, 'CANCELLED')}
                                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Stop Campaign"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                            {(c.status === 'COMPLETED' || c.status === 'PROCESSING') && (
                                                <button 
                                                    onClick={() => {
                                                        setRetargetModal(c);
                                                        setShowRetargetOptions(true);
                                                    }}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg title='Retarget Audience'"
                                                >
                                                    <RotateCcw size={16} />
                                                </button>
                                            )}
                                            <button className="p-1.5 text-gray-400 hover:text-[#27954D] hover:bg-white rounded-lg">
                                                <BarChart3 size={18} />
                                            </button>
                                        </div>
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
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl animate-fade-in overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Create Campaign</h3>
                                <p className="text-sm text-gray-500">Launch a new broadcast to your audience.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-2"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleCreate} className="p-8 space-y-6 overflow-y-auto">
                            {/* Retargeting Context Card */}
                            {retargetType !== 'NONE' && retargetModal && (
                                <div className="bg-[#27954D]/5 border border-[#27954D]/10 rounded-2xl p-4 flex items-center justify-between mb-4 border-l-4 border-l-[#27954D]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#27954D] shadow-sm">
                                            <RotateCcw size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-[#27954D] uppercase">Retargeting Active</p>
                                            <p className="text-xs text-gray-600 font-medium">Source: <span className="font-bold">{retargetModal.name}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Goal</p>
                                        <p className="text-xs font-bold text-gray-800">{retargetType}</p>
                                    </div>
                                </div>
                            )}

                            {/* Row 1: Name + Audience */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Campaign Name</label>
                                    <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Summer Promo" className="input" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Target Audience</label>
                                    {retargetType !== 'NONE' ? (
                                        <div className="input bg-[#27954D]/5 border-[#27954D]/20 text-[#27954D] flex items-center gap-2 font-bold cursor-not-allowed">
                                            <RotateCcw size={14} /> {retargetType} Segment
                                        </div>
                                    ) : (
                                        <select value={segmentId} onChange={e => setSegmentId(e.target.value)} className="input appearance-none">
                                            <option value="">All Contacts</option>
                                            {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>

                            {/* Row 2: Type Switcher */}
                            <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-xl mb-4">
                                    <button type="button" onClick={() => setTargetType("TEMPLATE")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${targetType === "TEMPLATE" ? "bg-[#27954D] text-white" : "text-gray-400 hover:bg-gray-50"}`}>
                                        <LayoutTemplate size={12} className="inline mr-1" />Template
                                    </button>
                                    <button type="button" onClick={() => setTargetType("FLOW")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${targetType === "FLOW" ? "bg-[#27954D] text-white" : "text-gray-400 hover:bg-gray-50"}`}>
                                        <GitBranch size={12} className="inline mr-1" />Flow
                                    </button>
                                </div>

                                {targetType === 'TEMPLATE' ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Select Approved Template</label>
                                            <select required value={templateName} onChange={e => handleTemplateSelect(e.target.value)} className="input bg-white">
                                                <option value="">Choose a template...</option>
                                                {templates.filter((t: any) => t.status === 'APPROVED').map((t: any) => (
                                                    <option key={t.id} value={t.name}>{t.name}</option>
                                                ))}
                                            </select>
                                            {templates.filter((t: any) => t.status === 'APPROVED').length === 0 && (
                                                <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                                                    <AlertTriangle size={10} /> No approved templates yet. Submit a template first.
                                                </p>
                                            )}
                                        </div>

                                        {/* Header Media Override */}
                                        {selectedTemplate && hasHeader && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerFormat) && (
                                            <div className="space-y-2">
                                                <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                                                    <ImageIcon size={12} className="text-blue-500" />
                                                    Header {headerFormat} (Direct Upload)
                                                </label>
                                                <SmartUploader
                                                    onUploadSuccess={(url) => setHeaderMediaUrl(url)}
                                                    defaultValue={headerMediaUrl}
                                                    fileType={headerFormat.toLowerCase() as any}
                                                    module="campaigns"
                                                    label=""
                                                    accept={
                                                        headerFormat === 'IMAGE' ? "image/*" :
                                                        headerFormat === 'VIDEO' ? "video/*" :
                                                        "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                    }
                                                    description={`Upload the ${headerFormat.toLowerCase()} for this broadcast.`}
                                                />
                                                {headerMediaUrl && (
                                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 mt-2">
                                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                        <p className="text-[10px] text-gray-500 font-medium truncate flex-1">
                                                            {headerMediaUrl}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Dynamic Variable Mapping */}
                                        {selectedTemplate && detectedVars.length > 0 && (
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                                                    <Variable size={12} className="text-[#27954D]" />
                                                    Map Template Variables
                                                </label>
                                                <div className="space-y-2">
                                                    {detectedVars.map(varNum => (
                                                        <div key={varNum} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3">
                                                            <span className="text-xs font-bold text-[#042f94] bg-blue-50 px-2 py-1 rounded-lg shrink-0">
                                                                {`{{${varNum}}}`}
                                                            </span>
                                                            <ChevronDown size={14} className="text-gray-400 shrink-0" />
                                                            <div className="flex flex-1 gap-2">
                                                                <select
                                                                    value={variableMapping[String(varNum)]?.startsWith("static:") ? "__static__" : (variableMapping[String(varNum)] || "")}
                                                                    onChange={e => {
                                                                        const val = e.target.value;
                                                                        if (val === "__static__") {
                                                                            setVariableMapping(prev => ({ ...prev, [String(varNum)]: "static:" }));
                                                                        } else {
                                                                            setVariableMapping(prev => ({ ...prev, [String(varNum)]: val }));
                                                                        }
                                                                    }}
                                                                    className="input bg-white flex-1 text-xs"
                                                                >
                                                                    <option value="">— select source —</option>
                                                                    {CONTACT_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                                                    <option value="__static__">Static Text...</option>
                                                                </select>
                                                                {variableMapping[String(varNum)]?.startsWith("static:") && (
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Enter static value"
                                                                        value={variableMapping[String(varNum)].replace("static:", "")}
                                                                        onChange={e => setVariableMapping(prev => ({ ...prev, [String(varNum)]: `static:${e.target.value}` }))}
                                                                        className="input bg-white flex-1 text-xs"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                                                    <Info size={10} /> Unmapped variables will default to "Customer".
                                                </p>
                                            </div>
                                        )}

                                        {selectedTemplate && detectedVars.length === 0 && !hasHeader && (
                                            <div className="p-3 bg-green-50 rounded-xl text-[10px] text-green-700 font-medium border border-green-100">
                                                ✅ This template has no variables or media — it will be sent as-is.
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <label className="block text-xs font-semibold text-gray-600">Select Published Flow</label>
                                        <select required value={flowId} onChange={e => setFlowId(e.target.value)} className="input bg-white">
                                            <option value="">Choose a flow...</option>
                                            {flows.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                        </select>
                                        <div className="p-3 bg-amber-50 rounded-xl text-[10px] text-amber-700 font-medium border border-amber-100 flex gap-2 items-start">
                                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                            <span>Note: Meta restricts outbound flows. Flows are triggered via template button clicks. Use a template for initial outreach.</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Row 3: Schedule */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Schedule Launch (optional)</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3 text-gray-400" size={16} />
                                    <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="input pl-10" />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-4">Discard</button>
                                <button disabled={sending} type="submit" className="btn-primary flex-[2] py-4 shadow-xl shadow-green-100">
                                    {sending ? 'Launching...' : 'Launch Campaign'} <ArrowRight size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Retargeting Selection Modal (Intelligence Hub) */}
            {showRetargetOptions && retargetModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-left">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-200 border border-gray-100">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-[#27954D]/5">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">Precision Retargeting</h3>
                                <p className="text-sm text-gray-500">Intelligent follow-ups for "{retargetModal.name}"</p>
                            </div>
                            <button onClick={() => setShowRetargetOptions(false)} className="p-2 hover:bg-white rounded-2xl transition-all shadow-sm">
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="p-8 space-y-4">
                            {loadingIntel ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                    <div className="w-12 h-12 border-4 border-[#27954D]/20 border-t-[#27954D] rounded-full animate-spin" />
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Calculating Audience Impact...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <RetargetOption 
                                            icon={<Clock size={20} />}
                                            title="Nudge Readers"
                                            count={intelData?.counts?.UNREAD || 0}
                                            color="amber"
                                            description="Received but not opened"
                                            onClick={() => {
                                                setRetargetType("UNREAD");
                                                setName(`Follow-up: ${retargetModal.name}`);
                                                setRetargetModal(retargetModal);
                                                setShowRetargetOptions(false);
                                                setShowModal(true);
                                            }}
                                        />
                                        <RetargetOption 
                                            icon={<MousePointer2 size={20} />}
                                            title="Engage Readers"
                                            count={intelData?.counts?.READ || 0}
                                            color="blue"
                                            description="Read but no response"
                                            onClick={() => {
                                                setRetargetType("READ");
                                                setName(`Next Step: ${retargetModal.name}`);
                                                setRetargetModal(retargetModal);
                                                setShowRetargetOptions(false);
                                                setShowModal(true);
                                            }}
                                        />
                                        <RetargetOption 
                                            icon={<AlertTriangle size={20} />}
                                            title="Retry Failed"
                                            count={intelData?.counts?.FAILED || 0}
                                            color="rose"
                                            description="Transmission rejected"
                                            onClick={() => {
                                                setRetargetType("FAILED");
                                                setName(`Retry: ${retargetModal.name}`);
                                                setRetargetModal(retargetModal);
                                                setShowRetargetOptions(false);
                                                setShowModal(true);
                                            }}
                                        />
                                        <RetargetOption 
                                            icon={<Zap size={20} />}
                                            title="High intent"
                                            count={intelData?.counts?.REPLIED || 0}
                                            color="green"
                                            description="Already interacted"
                                            onClick={() => {
                                                setRetargetType("REPLIED");
                                                setName(`Conversion: ${retargetModal.name}`);
                                                setRetargetModal(retargetModal);
                                                setShowRetargetOptions(false);
                                                setShowModal(true);
                                            }}
                                        />
                                    </div>

                                    <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#042f94]/10 rounded-xl flex items-center justify-center text-[#042f94]">
                                                <TrendingUp size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Total Reachable Reach</p>
                                                <p className="text-lg font-bold text-gray-800">{intelData?.potentialImpact || 0} Contacts</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-[#27954D] bg-[#27954D]/10 px-2 py-1 rounded-lg">LIVE DATA</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-4 bg-gray-50/50 text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold border-t border-gray-100">
                            Powered by Precision Retargeting Engine
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Sub-components for Premium UI ---

function RetargetOption({ icon, title, count, color, description, onClick }: any) {
    const colorClasses: any = {
        amber: "border-amber-50 bg-amber-50/30 hover:bg-amber-50 hover:border-amber-100 text-amber-600 bg-amber-100",
        blue: "border-blue-50 bg-blue-50/30 hover:bg-blue-50 hover:border-blue-100 text-blue-600 bg-blue-100",
        rose: "border-rose-50 bg-rose-50/30 hover:bg-rose-50 hover:border-rose-100 text-rose-600 bg-rose-100",
        green: "border-green-50 bg-green-50/30 hover:bg-green-50 hover:border-green-100 text-green-600 bg-green-100",
    };

    const [border, bg, hover, iconText, iconBg] = colorClasses[color].split(" ");

    return (
        <button 
            onClick={onClick}
            className={`w-full flex flex-col gap-3 p-5 rounded-3xl border-2 ${border} ${bg} ${hover} transition-all text-left group`}
        >
            <div className="flex items-center justify-between w-full">
                <div className={`p-2.5 ${iconBg} ${iconText} rounded-xl group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-gray-800">{count}</span>
                    <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Users</p>
                </div>
            </div>
            <div>
                <h4 className="font-bold text-gray-800 text-sm leading-tight">{title}</h4>
                <p className="text-[10px] text-gray-500 italic mt-0.5 line-clamp-1">{description}</p>
            </div>
        </button>
    );
}


function MiniStat({ label, value, icon, color, bg }: any) {
    return (
        <div className="soft-card p-5 flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${bg} ${color}`}>{icon}</div>
            <div>
                <div className="text-2xl font-bold text-gray-800 tracking-tight">{value}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
            </div>
        </div>
    );
}
