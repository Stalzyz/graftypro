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
    const [format, setFormat] = useState("STANDARD"); // STANDARD or CAROUSEL
    const [cards, setCards] = useState<any[]>([{
        headerFormat: 'IMAGE', headerUrl: '', bodyText: '', buttons: []
    }]);

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
                    const carousel = t.components.find((c: any) => c.type === 'CAROUSEL');
                    if (carousel) {
                        setFormat("CAROUSEL");
                        const rootBody = t.components.find((c: any) => c.type === 'BODY');
                        if (rootBody) setBodyText(rootBody.text);
                        
                        setCards(carousel.cards.map((card: any) => {
                            const cHeader = card.components.find((c: any) => c.type === 'HEADER') || { format: 'IMAGE', media_url: '' };
                            const cBody = card.components.find((c: any) => c.type === 'BODY') || { text: '' };
                            const cButtons = card.components.find((c: any) => c.type === 'BUTTONS') || { buttons: [] };
                            return {
                                headerFormat: cHeader.format,
                                headerUrl: cHeader.media_url || '',
                                bodyText: cBody.text || '',
                                buttons: cButtons.buttons || []
                            };
                        }));
                    } else {
                        setFormat("STANDARD");
                        t.components.forEach((c: any) => {
                            if (c.type === 'HEADER') {
                                setHeaderType(c.format);
                                if (c.format === 'TEXT') setHeaderText(c.text);
                                else setHeaderText(c.media_url || '');
                            }
                            if (c.type === 'BODY') setBodyText(c.text);
                            if (c.type === 'FOOTER') setFooterText(c.text);
                            if (c.type === 'BUTTONS') setButtons(c.buttons);
                        });
                    }
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
            // Always show validation errors to prevent silent submission blocks
            alert(error);
            return false;
        }

        if (!silent) setSaving(true);

        const components = [];

        if (format === 'CAROUSEL') {
            components.push({ type: 'BODY', text: bodyText });
            components.push({
                type: 'CAROUSEL',
                cards: cards.map(card => {
                    const cardComps = [];
                    cardComps.push({
                        type: 'HEADER',
                        format: card.headerFormat,
                        media_url: card.headerUrl
                    });
                    if (card.bodyText) cardComps.push({ type: 'BODY', text: card.bodyText });
                    if (card.buttons && card.buttons.length > 0) {
                        cardComps.push({ type: 'BUTTONS', buttons: card.buttons });
                    }
                    return { components: cardComps };
                })
            });
        } else {
            if (headerType !== 'NONE') {
                components.push({
                    type: 'HEADER',
                    format: headerType,
                    text: headerType === 'TEXT' ? headerText : undefined,
                    media_url: headerType !== 'TEXT' && headerType !== 'NONE' ? headerText : undefined
                });
            }
            components.push({ type: 'BODY', text: bodyText });
            if (footerText) components.push({ type: 'FOOTER', text: footerText });
            if (buttons.length > 0) components.push({ type: 'BUTTONS', buttons: buttons });
        }

        const bodyIndex = (format === 'STANDARD' && headerType !== 'NONE') ? 1 : 0;
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

            // Parse response to extract potential error messages
            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                if (!silent) alert("Draft saved successfully!");
                return true;
            } else {
                alert("Failed to save draft: " + (data.error || "Server returned status " + res.status));
                return false;
            }

        } catch (e: any) {
            console.error(e);
            alert("Error saving template: " + (e.message || e));
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

    const addButton = (type: string, subType?: string) => {
        if (buttons.length >= 3) return alert("Max 3 buttons allowed");
        if (type === 'OTP') {
            setButtons([...buttons, {
                type: 'OTP',
                otp_type: subType || 'COPY_CODE',
                text: subType === 'ONE_TAP' ? 'Autofill' : 'Copy Code',
                package_name: '',
                signature_hash: ''
            }]);
        } else {
            setButtons([...buttons, { type, text: "", url: "", phone_number: "" }]);
        }
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
                        <h2 className="font-bold text-gray-900 flex items-center gap-2 tracking-tight text-lg">
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
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">

                    {template?.category === 'AUTHENTICATION' && (
                        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-start gap-3 text-purple-900">
                            <AlertCircle size={18} className="text-purple-600 shrink-0 mt-0.5" />
                            <div className="space-y-1 text-xs">
                                <p className="font-bold">🛡️ Authentication Template (OTP) Mode</p>
                                <p className="text-purple-700">Meta enforces strict security rules for verification templates: Headers & Footers are disabled, the body requires an OTP variable <code className="bg-purple-100 px-1 py-0.5 rounded font-mono text-purple-900">{`{{1}}`}</code>, and special OTP buttons (Copy Code / One-Tap) are used.</p>
                            </div>
                        </div>
                    )}

                    {/* FORMAT SELECTOR */}
                    {template?.category !== 'AUTHENTICATION' && (
                        <div className="mb-6 bg-white p-4 rounded-xl border border-gray-200">
                            <label className="text-sm font-bold text-gray-700 block mb-3">TEMPLATE FORMAT</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" value="STANDARD" checked={format === 'STANDARD'} onChange={() => setFormat('STANDARD')} disabled={!canEdit} className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-semibold">Standard</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" value="CAROUSEL" checked={format === 'CAROUSEL'} onChange={() => setFormat('CAROUSEL')} disabled={!canEdit} className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-semibold">Carousel <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded ml-1">New</span></span>
                                </label>
                            </div>
                        </div>
                    )}

                    {format === 'STANDARD' && (
                        <>
                    <div className="space-y-4">
                        {template?.category === 'AUTHENTICATION' ? (
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center text-xs text-gray-500 font-semibold">
                                <span>HEADER</span>
                                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">PROHIBITED BY META</span>
                            </div>
                        ) : (
                            <>
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
                                        <option value="IMAGE">Image (Upload JPG/PNG)</option>
                                        <option value="VIDEO">Video (Upload MP4)</option>
                                        <option value="DOCUMENT">Document (Upload PDF)</option>
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
                                        defaultValue={headerText}
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
                            </>
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
                            placeholder={template?.category === 'AUTHENTICATION' ? "{{1}} is your verification code. For your security, do not share this code." : "Type your message here... Use {{1}} for variables."}
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
                        {template?.category === 'AUTHENTICATION' ? (
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center text-xs text-gray-500 font-semibold">
                                <span>FOOTER</span>
                                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">MANAGED BY META</span>
                            </div>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                BUTTONS
                                <span className="text-[10px] text-gray-400 font-medium">MAX 3</span>
                            </label>

                            {(() => {
                                const isAuth = template?.category === 'AUTHENTICATION';
                                const hasQuickReply = buttons.some(b => b.type === 'QUICK_REPLY');
                                const hasCallToAction = buttons.some(b => b.type === 'URL' || b.type === 'PHONE_NUMBER');
                                const hasPhoneButton = buttons.some(b => b.type === 'PHONE_NUMBER');
                                const hasOtpButton = buttons.some(b => b.type === 'OTP');
                                const isMaxButtons = buttons.length >= 3;

                                if (isAuth) {
                                    return (
                                        <div className="flex gap-2 flex-wrap">
                                            <button
                                                onClick={() => addButton("OTP", "COPY_CODE")}
                                                disabled={!canEdit || hasOtpButton}
                                                title={hasOtpButton ? "Only 1 OTP button is allowed per Authentication template" : ""}
                                                className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-600 text-[10px] font-bold uppercase hover:bg-purple-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                + Copy Code Button
                                            </button>
                                            <button
                                                onClick={() => addButton("OTP", "ONE_TAP")}
                                                disabled={!canEdit || hasOtpButton}
                                                title={hasOtpButton ? "Only 1 OTP button is allowed per Authentication template" : ""}
                                                className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-bold uppercase hover:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                + One-Tap Autofill
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            onClick={() => addButton("QUICK_REPLY")}
                                            disabled={!canEdit || isMaxButtons || hasCallToAction}
                                            title={hasCallToAction ? "Meta does not allow mixing Quick Replies with Web/Call buttons" : isMaxButtons ? "Maximum 3 buttons reached" : ""}
                                            className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase hover:bg-indigo-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            + Quick Reply
                                        </button>
                                        <button
                                            onClick={() => addButton("URL")}
                                            disabled={!canEdit || isMaxButtons || hasQuickReply}
                                            title={hasQuickReply ? "Meta does not allow mixing Web buttons with Quick Replies" : isMaxButtons ? "Maximum 3 buttons reached" : ""}
                                            className="px-3 py-1.5 rounded-xl bg-orange-50 text-orange-600 text-[10px] font-bold uppercase hover:bg-orange-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            + Web Link
                                        </button>
                                        <button
                                            onClick={() => addButton("PHONE_NUMBER")}
                                            disabled={!canEdit || isMaxButtons || hasQuickReply || hasPhoneButton}
                                            title={hasQuickReply ? "Meta does not allow mixing Call buttons with Quick Replies" : hasPhoneButton ? "Maximum 1 Call Button allowed" : isMaxButtons ? "Maximum 3 buttons reached" : ""}
                                            className="px-3 py-1.5 rounded-xl bg-green-50 text-green-600 text-[10px] font-bold uppercase hover:bg-green-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            + Call Button
                                        </button>
                                    </div>
                                );
                            })()}
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
                                    <div className="text-[9px] font-black text-gray-400 uppercase mb-3">
                                        {btn.type === 'OTP' ? `OTP (${btn.otp_type || 'COPY_CODE'})` : btn.type.replace('_', ' ')}
                                    </div>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Button Label (e.g. Copy Code)"
                                            value={btn.text}
                                            onChange={e => updateButton(idx, 'text', e.target.value)}
                                            disabled={!canEdit}
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none disabled:bg-gray-50"
                                        />
                                        {btn.type === 'OTP' && btn.otp_type === 'ONE_TAP' && (
                                            <>
                                                <input
                                                    type="text"
                                                    placeholder="Package Name (e.g. com.mycompany.app)"
                                                    value={btn.package_name || ""}
                                                    onChange={e => updateButton(idx, 'package_name', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none disabled:bg-gray-50"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Signature Hash (e.g. 4a3b2c...)"
                                                    value={btn.signature_hash || ""}
                                                    onChange={e => updateButton(idx, 'signature_hash', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none disabled:bg-gray-50"
                                                />
                                            </>
                                        )}
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
                </>
            )}

                    {format === 'CAROUSEL' && (
                        <div className="space-y-6">
                            {/* Root Body for Carousel */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        MESSAGE BODY
                                        <span className="text-[10px] text-red-500 font-black">REQUIRED</span>
                                    </label>
                                </div>
                                <textarea
                                    rows={3}
                                    placeholder="Enter the text that appears above the carousel cards..."
                                    value={bodyText}
                                    onChange={e => setBodyText(e.target.value)}
                                    disabled={!canEdit}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>

                            {/* Cards Builder */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-gray-900">Carousel Cards ({cards.length}/10)</h3>
                                    {cards.length < 10 && canEdit && (
                                        <button 
                                            onClick={() => setCards([...cards, { headerFormat: 'IMAGE', headerUrl: '', bodyText: '', buttons: cards[0]?.buttons || [] }])}
                                            className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-100"
                                        >
                                            <Plus size={14}/> Add Card
                                        </button>
                                    )}
                                </div>

                                <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                                    {cards.map((card, idx) => (
                                        <div key={idx} className="min-w-[300px] bg-white border border-gray-200 rounded-xl p-4 shadow-sm snap-center flex-shrink-0 relative">
                                            {cards.length > 1 && canEdit && (
                                                <button onClick={() => setCards(cards.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                                    <Trash2 size={16}/>
                                                </button>
                                            )}
                                            <div className="font-bold text-xs text-gray-400 mb-3 uppercase">Card {idx + 1}</div>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-700 mb-1 block">Image Header <span className="text-red-500">*</span></label>
                                                    <SmartUploader
                                                        label={`Card ${idx+1} Image`}
                                                        module="templates"
                                                        fileType="image"
                                                        accept="image/jpeg, image/png, image/webp"
                                                        defaultValue={card.headerUrl}
                                                        onUploadSuccess={(url: string) => {
                                                            const newCards = [...cards];
                                                            newCards[idx].headerUrl = url;
                                                            setCards(newCards);
                                                        }}
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="text-xs font-bold text-gray-700 mb-1 block">Body Text</label>
                                                    <textarea 
                                                        rows={2}
                                                        maxLength={160}
                                                        value={card.bodyText}
                                                        onChange={(e) => {
                                                            const newCards = [...cards];
                                                            newCards[idx].bodyText = e.target.value;
                                                            setCards(newCards);
                                                        }}
                                                        disabled={!canEdit}
                                                        placeholder="Card details..."
                                                        className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                                                    />
                                                </div>

                                                {/* Card Buttons */}
                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="text-xs font-bold text-gray-700 block">Buttons (Max 2)</label>
                                                        {(!card.buttons || card.buttons.length < 2) && canEdit && (
                                                            <div className="flex gap-1">
                                                                <button onClick={() => {
                                                                    const newCards = [...cards];
                                                                    newCards[idx].buttons = [...(newCards[idx].buttons || []), { type: 'QUICK_REPLY', text: '' }];
                                                                    setCards(newCards);
                                                                }} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded hover:bg-gray-200">+ QR</button>
                                                                <button onClick={() => {
                                                                    const newCards = [...cards];
                                                                    newCards[idx].buttons = [...(newCards[idx].buttons || []), { type: 'URL', text: '', url: '' }];
                                                                    setCards(newCards);
                                                                }} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded hover:bg-gray-200">+ URL</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        {(card.buttons || []).map((btn: any, bIdx: number) => (
                                                            <div key={bIdx} className="bg-gray-50 border border-gray-200 p-2 rounded relative">
                                                                <button onClick={() => {
                                                                    const newCards = [...cards];
                                                                    newCards[idx].buttons.splice(bIdx, 1);
                                                                    setCards(newCards);
                                                                }} className="absolute -top-1 -right-1 text-gray-400 hover:text-red-500 bg-white rounded-full">
                                                                    <Trash2 size={12}/>
                                                                </button>
                                                                <div className="text-[9px] font-bold text-gray-500 mb-1">{btn.type}</div>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Button Text"
                                                                    value={btn.text}
                                                                    onChange={(e) => {
                                                                        const newCards = [...cards];
                                                                        newCards[idx].buttons[bIdx].text = e.target.value;
                                                                        setCards(newCards);
                                                                    }}
                                                                    className="w-full text-xs px-2 py-1 mb-1 border rounded"
                                                                />
                                                                {btn.type === 'URL' && (
                                                                    <input
                                                                        type="text"
                                                                        placeholder="https://..."
                                                                        value={btn.url || ''}
                                                                        onChange={(e) => {
                                                                            const newCards = [...cards];
                                                                            newCards[idx].buttons[bIdx].url = e.target.value;
                                                                            setCards(newCards);
                                                                        }}
                                                                        className="w-full text-xs px-2 py-1 border rounded"
                                                                    />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

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
