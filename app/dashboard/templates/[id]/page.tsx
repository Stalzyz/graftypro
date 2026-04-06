"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Send, Trash2, Plus, Image as ImageIcon, FileText, PlayCircle, Link as LinkIcon, Phone, AlertCircle, RefreshCw } from "lucide-react";
import { SmartUploader } from "../../../../components/ui/SmartUploader";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TemplateEditor({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [template, setTemplate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Components State
    const [headerType, setHeaderType] = useState("NONE"); // NONE, TEXT, IMAGE
    const [headerText, setHeaderText] = useState("");
    const [bodyText, setBodyText] = useState("");
    const [footerText, setFooterText] = useState("");
    const [buttons, setButtons] = useState<any[]>([]);

    // Sprint 3: Variables & Samples State
    const [variables, setVariables] = useState<string[]>([]);
    const [samples, setSamples] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchTemplate();
    }, []);

    // Extract variables whenever body text changes
    useEffect(() => {
        extractVariables(bodyText);
    }, [bodyText]);

    const fetchTemplate = async () => {
        try {
            const res = await fetch(`/api/templates/${params.id}`);
            const data = await res.json();
            if (data.data) {
                const t = data.data;
                setTemplate(t);

                // Parse Components JSON to State
                if (Array.isArray(t.components)) {
                    t.components.forEach((c: any) => {
                        if (c.type === 'HEADER') {
                            setHeaderType(c.format);
                            if (c.format === 'TEXT') setHeaderText(c.text);
                        }
                        if (c.type === 'BODY') setBodyText(c.text);
                        if (c.type === 'FOOTER') setFooterText(c.text);
                        if (c.type === 'BUTTONS') setButtons(c.buttons);
                    });
                }

                // Load existing samples from variables table
                if (t.variables && t.variables.length > 0) {
                    const newSamples: any = {};
                    t.variables.forEach((v: any) => {
                        newSamples[v.param_index] = v.sample_value;
                    });
                    setSamples(newSamples);
                }
            }
        } catch (e) {
            console.error("Fetch Error:", e);
        } finally {
            setLoading(false);
        }
    };

    const extractVariables = (text: string) => {
        const regex = /{{([0-9]+)}}/g;
        const matches = text.match(regex);

        if (matches) {
            const foundVars = matches.map(m => m.replace(/{{|}}/g, ''));
            const uniqueVars = Array.from(new Set(foundVars)).sort((a, b) => parseInt(a) - parseInt(b));
            setVariables(uniqueVars);
        } else {
            setVariables([]);
        }
    };

    const handleSampleChange = (index: string, value: string) => {
        setSamples({ ...samples, [index]: value });
    };

    const validateTemplate = () => {
        if (variables.length > 0) {
            const numericVars = variables.map(v => parseInt(v));
            const maxVar = Math.max(...numericVars);
            if (maxVar !== variables.length) {
                return `Variables must be sequential. You have {{${maxVar}}} but only ${variables.length} total variables.`;
            }
            for (let i = 1; i <= maxVar; i++) {
                if (!numericVars.includes(i)) return `Missing variable {{${i}}}.`;
            }
        }

        if (buttons.length > 0) {
            const hasQuickReply = buttons.some(b => b.type === 'QUICK_REPLY');
            const phoneButtons = buttons.filter(b => b.type === 'PHONE_NUMBER');
            const hasCallToAction = buttons.some(b => b.type === 'URL' || b.type === 'PHONE_NUMBER');
            if (hasQuickReply && hasCallToAction) {
                return "Meta does not allow mixing Quick Reply buttons with URL or Call buttons in the same template.";
            }
            if (phoneButtons.length > 1) {
                return "Meta allows a maximum of 1 Call button per template.";
            }
        }

        if (bodyText.length > 1024) return "Body text exceeds 1024 characters.";

        return null;
    };

    const handleSave = async (silent = false) => {
        const error = validateTemplate();
        if (error) {
            if (!silent) alert(error);
            return false;
        }

        if (!silent) setSaving(true);

        const components = [];
        if (headerType !== 'NONE') {
            components.push({
                type: 'HEADER',
                format: headerType,
                text: headerType === 'TEXT' ? headerText : undefined,
                // Pass URL for media headers
                media_url: headerType !== 'TEXT' && headerType !== 'NONE' ? headerText : undefined
            });
        }

        components.push({ type: 'BODY', text: bodyText });

        if (footerText) {
            components.push({ type: 'FOOTER', text: footerText });
        }

        if (buttons.length > 0) {
            components.push({ type: 'BUTTONS', buttons: buttons });
        }

        const bodyIndex = headerType !== 'NONE' ? 1 : 0;
        const variableData = variables.map(v => ({
            component_index: bodyIndex,
            param_index: parseInt(v),
            sample_value: samples[v] || `Sample ${v}`
        }));

        try {
            const res = await fetch(`/api/templates/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ components, variables: variableData })
            });

            if (res.ok) {
                if (!silent) alert("Draft saved successfully!");
                return true;
            } else {
                if (!silent) alert("Failed to save draft");
                return false;
            }

        } catch (e) {
            console.error(e);
            if (!silent) alert("Error saving template");
            return false;
        } finally {
            if (!silent) setSaving(false);
        }
    };

    const handleSubmitToMeta = async () => {
        // 1. Save first to ensure Meta gets latest data
        const saved = await handleSave(true);
        if (!saved) return;

        if (!confirm("Are you sure? This will send the template to Meta's review team. You won't be able to edit it until it's processed.")) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/templates/${params.id}/submit`, {
                method: "POST"
            });
            const data = await res.json();

            if (res.ok) {
                alert("Template submitted to Meta successfully!");
                router.refresh(); // Update status display
                fetchTemplate(); // Reload local state
            } else {
                alert("Submission failed: " + data.error);
            }
        } catch (e) {
            console.error(e);
            alert("Network error during submission");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRefreshStatus = async () => {
        setRefreshing(true);
        try {
            const res = await fetch(`/api/templates/${params.id}/refresh`, { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setTemplate({ ...template, status: data.status });
            } else {
                alert("Failed to refresh status: " + data.error);
            }
        } catch (e) {
            console.error(e);
            alert("Error refreshing status");
        } finally {
            setRefreshing(false);
        }
    };

    const addButton = (type: string) => {
        if (buttons.length >= 3) return alert("Max 3 buttons allowed");
        setButtons([...buttons, { type, text: "", url: "", phone_number: "" }]);
    };

    const updateButton = (index: number, field: string, val: string) => {
        const newBtns = [...buttons];
        newBtns[index][field] = val;
        setButtons(newBtns);
    };

    const removeButton = (index: number) => {
        const newBtns = [...buttons];
        newBtns.splice(index, 1);
        setButtons(newBtns);
    };

    const getPreviewBody = () => {
        let text = bodyText;
        if (!text) return "";

        variables.forEach(v => {
            const sample = samples[v] || `{{${v}}}`;
            text = text.split(`{{${v}}}`).join(`<span class="font-bold text-blue-600">${sample}</span>`);
        });
        return text;
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!template) return <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl">Template not found.</div>;

    const canEdit = template.status === 'DRAFT' || template.status === 'REJECTED';

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6">

            {/* LEFT: Editor Panel */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-w-0">

                {/* Header Toolbar */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <div>
                        <Link href="/dashboard/templates" className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 mb-1 transition-colors">
                            <ArrowLeft size={12} /> Back to List
                        </Link>
                        <h2 className="font-bold text-gray-900 flex items-center gap-2 uppercase tracking-tight text-lg">
                            {template.name}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${template.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                template.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                                }`}>{template.status}</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefreshStatus}
                            disabled={refreshing}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50 shadow-sm"
                            style={{ borderRadius: '10px', height: '36px' }}
                        >
                            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                            Refresh Status
                        </button>

                        <button
                            onClick={() => handleSave()}
                            disabled={saving || submitting || !canEdit}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50 shadow-sm"
                            style={{ borderRadius: '10px', height: '36px' }}
                        >
                            <Save size={14} />
                            {saving ? "Saving..." : "Save Draft"}
                        </button>

                        <button
                            onClick={handleSubmitToMeta}
                            disabled={saving || submitting || !canEdit}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#27954D] text-white text-xs font-bold transition-all hover:bg-[#1f7a3f] active:scale-95 disabled:opacity-50 shadow-md"
                            style={{ borderRadius: '10px', height: '36px' }}
                        >
                            <Send size={14} />
                            {submitting ? "Submitting..." : "Submit to Meta"}
                        </button>
                    </div>
                </div>

                {/* Editor Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">

                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                HEADER
                                <span className="text-[10px] text-gray-400 font-medium">OPTIONAL</span>
                            </label>
                            <select
                                value={headerType}
                                onChange={e => setHeaderType(e.target.value)}
                                disabled={!canEdit}
                                className="text-xs border border-gray-300 rounded-md px-3 py-1.5 font-semibold bg-white outline-none focus:border-blue-500 transition-colors disabled:bg-gray-50"
                            >
                                <option value="NONE">No Header</option>
                                <option value="TEXT">Text Header</option>
                                <option value="IMAGE">Image Header (JPG/PNG)</option>
                                <option value="VIDEO">Video Header (MP4)</option>
                                <option value="DOCUMENT">Document Header (PDF)</option>
                            </select>
                        </div>

                        {headerType === 'TEXT' && (
                            <div className="relative">
                                <input
                                    type="text"
                                    maxLength={60}
                                    placeholder="Enter header text"
                                    value={headerText}
                                    onChange={e => setHeaderText(e.target.value)}
                                    disabled={!canEdit}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12 disabled:bg-gray-50"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">{headerText.length}/60</span>
                            </div>
                        )}

                        {headerType === 'IMAGE' && (
                            <SmartUploader
                                label="Header Image"
                                module="templates"
                                fileType="image"
                                accept="image/jpeg, image/png, image/webp"
                                description="PNG, JPG, WebP (Max 5MB)"
                                defaultValue={headerText} // re-using headerText for storage of media URL
                                onUploadSuccess={(url: string) => setHeaderText(url)}
                            />
                        )}

                        {headerType === 'VIDEO' && (
                            <SmartUploader
                                label="Header Video"
                                module="templates"
                                fileType="video"
                                accept="video/mp4"
                                maxSizeMB={16}
                                description="MP4 only (Max 16MB) - Upload locally"
                                defaultValue={headerText}
                                onUploadSuccess={(url: string) => setHeaderText(url)}
                            />
                        )}

                        {headerType === 'DOCUMENT' && (
                            <SmartUploader
                                label="Header Document"
                                module="templates"
                                fileType="document"
                                accept="application/pdf"
                                maxSizeMB={100}
                                description="PDF only (Max 100MB) - Upload locally"
                                defaultValue={headerText}
                                onUploadSuccess={(url: string) => setHeaderText(url)}
                            />
                        )}
                    </div>

                    {/* Body */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                BODY TEXT
                                <span className="text-[10px] text-red-500 font-black">REQUIRED</span>
                            </label>
                            <span className={`text-[10px] font-bold ${bodyText.length > 1000 ? 'text-red-500' : 'text-gray-400'}`}>
                                {bodyText.length} / 1024
                            </span>
                        </div>

                        <textarea
                            rows={8}
                            placeholder="Type your message here... Use {{1}} for variables."
                            value={bodyText}
                            onChange={e => setBodyText(e.target.value)}
                            disabled={!canEdit}
                            className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all leading-relaxed disabled:bg-gray-50"
                        />

                        {variables.length > 0 && (
                            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-[11px] font-bold text-blue-700 uppercase mb-3 flex items-center gap-2">
                                    <AlertCircle size={14} /> Sample Values for Variables
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {variables.map(v => (
                                        <div key={v} className="flex flex-col gap-1">
                                            <div className="text-[10px] font-bold text-blue-600">PARAMETER {`{{${v}}}`}</div>
                                            <input
                                                type="text"
                                                placeholder={`Sample value...`}
                                                value={samples[v] || ""}
                                                onChange={e => handleSampleChange(v, e.target.value)}
                                                disabled={!canEdit}
                                                className="px-3 py-1.5 text-xs border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-50"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            FOOTER
                            <span className="text-[10px] text-gray-400 font-medium">OPTIONAL</span>
                        </label>
                        <input
                            type="text"
                            maxLength={60}
                            placeholder="e.g. Not interested? Reply STOP"
                            value={footerText}
                            onChange={e => setFooterText(e.target.value)}
                            disabled={!canEdit}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm italic text-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-gray-50"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                BUTTONS
                                <span className="text-[10px] text-gray-400 font-medium">MAX 3</span>
                            </label>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => addButton("QUICK_REPLY")}
                                    disabled={!canEdit}
                                    className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase hover:bg-indigo-100 transition-colors disabled:opacity-50"
                                >
                                    + Quick Reply
                                </button>
                                <button
                                    onClick={() => addButton("URL")}
                                    disabled={!canEdit}
                                    className="px-4 py-2 rounded-xl bg-orange-50 text-orange-600 text-[10px] font-bold uppercase hover:bg-orange-100 transition-colors disabled:opacity-50"
                                >
                                    + Web Link
                                </button>
                                <button
                                    onClick={() => addButton("PHONE_NUMBER")}
                                    disabled={!canEdit}
                                    className="px-4 py-2 rounded-xl bg-green-50 text-green-600 text-[10px] font-bold uppercase hover:bg-green-100 transition-colors disabled:opacity-50"
                                >
                                    + Call Button
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {buttons.map((btn, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm relative group">
                                    <button
                                        onClick={() => removeButton(idx)}
                                        disabled={!canEdit}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-gray-200 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 disabled:hidden"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                    <div className="text-[9px] font-black text-gray-400 uppercase mb-3">{btn.type.replace('_', ' ')}</div>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Button Text"
                                            value={btn.text}
                                            onChange={e => updateButton(idx, 'text', e.target.value)}
                                            disabled={!canEdit}
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none disabled:bg-gray-50"
                                        />
                                        {btn.type === 'URL' && (
                                            <input
                                                type="text"
                                                placeholder="https://..."
                                                value={btn.url}
                                                onChange={e => updateButton(idx, 'url', e.target.value)}
                                                disabled={!canEdit}
                                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none disabled:bg-gray-50"
                                            />
                                        )}
                                        {btn.type === 'PHONE_NUMBER' && (
                                            <input
                                                type="text"
                                                placeholder="+1234567890 (no spaces or dashes)"
                                                value={btn.phone_number}
                                                onChange={e => updateButton(idx, 'phone_number', e.target.value)}
                                                disabled={!canEdit}
                                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none disabled:bg-gray-50"
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* RIGHT: Preview */}
            <div className="w-[380px] hidden xl:flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 font-bold text-xs uppercase text-gray-500">
                    Live Preview
                </div>

                <div className="flex-1 bg-[#f0f2f5] p-6 flex flex-col items-center justify-start gap-8" style={{ backgroundImage: "url('https://w0.peakpx.com/wallpaper/580/630/wallpaper-whatsapp-background.jpg')", backgroundSize: 'cover' }}>
                    <div className="w-full max-w-[300px] bg-white rounded-3xl shadow-2xl overflow-hidden border-[6px] border-[#222]">
                        <div className="bg-[#075e54] p-3 flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white"><Phone size={14} /></div>
                            <div className="text-white font-bold text-xs flex-1">Business Account</div>
                        </div>
                        <div className="p-3 space-y-1">
                            <div className="bg-white rounded-xl rounded-tl-none shadow-sm border border-black/5 overflow-hidden">
                                {headerType === 'IMAGE' && <div className="aspect-[16/9] bg-gray-200 flex items-center justify-center text-gray-400"><ImageIcon size={32} /></div>}
                                {headerType === 'VIDEO' && <div className="aspect-[16/9] bg-gray-800 flex items-center justify-center text-white relative"><PlayCircle size={40} className="opacity-70" /></div>}
                                {headerType === 'DOCUMENT' && <div className="h-20 bg-blue-50 border-b border-blue-100 flex items-center gap-3 px-4 text-blue-500"><FileText size={24} /><div className="flex-1 min-w-0"><div className="text-xs font-bold truncate">Attachment.pdf</div><div className="text-[9px] uppercase tracking-wider opacity-60">1.2 MB • DOCUMENT</div></div></div>}
                                <div className="p-3">
                                    {headerType === 'TEXT' && headerText && <div className="font-bold text-gray-900 text-sm mb-1">{headerText}</div>}
                                    <div className="text-xs text-gray-800 leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: getPreviewBody() || '<span class="text-gray-300 italic">No content...</span>' }} />
                                    {footerText && <div className="text-[10px] text-gray-400 mt-2 font-medium">{footerText}</div>}
                                    <div className="flex justify-end items-center mt-1"><span className="text-[9px] text-gray-400 uppercase tracking-tighter">10:41 AM</span></div>
                                </div>
                            </div>
                            {buttons.map((btn, idx) => (
                                <div key={idx} className="bg-white border-t border-gray-100 rounded-lg shadow-sm py-2.5 flex items-center justify-center">
                                    <span className="text-[12px] font-semibold text-blue-500">{btn.text || "Button Text"}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
