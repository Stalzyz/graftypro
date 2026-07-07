"use client";

import { X, Paperclip, Loader2, Calendar, Trash2, Copy, Smartphone, ChevronDown, ChevronUp, FileCode, Webhook } from "lucide-react";
import { SmartUploader } from "../ui/SmartUploader";
import MetaFormSidebar from "./sidebar/MetaFormSidebar";
import { MetaFormCompiler } from "../../lib/whatsapp/meta-form-compiler";
import toast from "react-hot-toast";
import { useEffect, useState, useRef } from "react";

export default function FlowPropertiesPanel({ selectedNode, onChange, onClose, onDelete, onDuplicate }: any) {
    const [label, setLabel] = useState("");
    const [content, setContent] = useState("");

    // Action Node Data
    const [actionType, setActionType] = useState("start_drip");
    const [dripId, setDripId] = useState("");
    const [drips, setDrips] = useState<any[]>([]);

    // Condition Data
    const [conditionType, setConditionType] = useState("message_body");
    const [operator, setOperator] = useState("contains");
    const [value, setValue] = useState("");

    // Catalog Data
    const [productId, setProductId] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);

    // Payment Data
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("INR");
    const [paymentTitle, setPaymentTitle] = useState("");
    const [paymentProvider, setPaymentProvider] = useState("Razorpay");

    // Meta Flow Data
    const [metaFlowId, setMetaFlowId] = useState("");
    const [metaFlowCTA, setMetaFlowCTA] = useState("Open Form");
    const [metaFlowHeader, setMetaFlowHeader] = useState("");
    const [metaFlowFooter, setMetaFlowFooter] = useState("");
    const [initialScreen, setInitialScreen] = useState("QUESTION_1");
    const [flowToken, setFlowToken] = useState("");
    const [metaFlowHeaderType, setMetaFlowHeaderType] = useState<'text' | 'image'>('text');

    // Goal Data
    const [goalId, setGoalId] = useState("");
    const [goals, setGoals] = useState<any[]>([]);

    // Wait Data
    const [delayValue, setDelayValue] = useState("5");
    const [delayUnit, setDelayUnit] = useState("minutes");

    // Time Window Data
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("18:00");

    // List Data
    const [listItems, setListItems] = useState<{ id: string, title: string, description: string }[]>([]);
    const [sectionTitle, setSectionTitle] = useState("Menu");
    const [listBtnText, setListBtnText] = useState("Select Option");

    // Enhanced Message Node Data
    const [contentType, setContentType] = useState<'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'VOICE'>('TEXT');
    const [mediaUrl, setMediaUrl] = useState("");
    const [buttons, setButtons] = useState<any[]>([]);

    // Meta Template Data
    const [templateName, setTemplateName] = useState("");
    const [templateLanguage, setTemplateLanguage] = useState("en_US");
    const [templateBodyText, setTemplateBodyText] = useState("");

    // List Node Data
    // Action Node Data (Email & Sheets)
    const [emailAddress, setEmailAddress] = useState("");
    const [emailSubject, setEmailSubject] = useState("");
    const [spreadsheetId, setSpreadsheetId] = useState("");
    const [sheetName, setSheetName] = useState("");
    const [webhookUrl, setWebhookUrl] = useState("");

    const [headerUrl, setHeaderUrl] = useState("");

    // Location Data
    const [locationType, setLocationType] = useState<'REQUEST' | 'SEND'>('REQUEST');
    const [locationName, setLocationName] = useState("");
    const [locationAddress, setLocationAddress] = useState("");
    
    // Meta Flow Advanced
    const [metaFlowSpec, setMetaFlowSpec] = useState("");
    const [isSyncing, setIsSyncing] = useState(false);

    // External Webhook / CRM Bridge Data
    const [extUrl, setExtUrl] = useState("");
    const [extMethod, setExtMethod] = useState("POST");
    const [extHeaders, setExtHeaders] = useState("");
    const [extBody, setExtBody] = useState("");
    const [captureKey, setCaptureKey] = useState("");

    useEffect(() => {
        if (selectedNode) {
            setLabel(selectedNode.data.label || "Node");
            setContent(selectedNode.data.text || "");

            if (selectedNode.type === 'action') {
                const at = selectedNode.data.actionType || "start_drip";
                setActionType(at);
                setDripId(selectedNode.data.dripId || "");
                setEmailAddress(selectedNode.data.emailAddress || "");
                setEmailSubject(selectedNode.data.emailSubject || "");
                setSpreadsheetId(selectedNode.data.spreadsheetId || "");
                setSheetName(selectedNode.data.sheetName || "");
                setWebhookUrl(selectedNode.data.webhookUrl || "");

                // Fetch drips
                fetch('/api/drips').then(r => r.json()).then(res => setDrips(res.data || []));
            }

            if (selectedNode.type === 'condition') {
                setConditionType(selectedNode.data.conditionType || "message_body");
                setOperator(selectedNode.data.operator || "contains");
                setValue(selectedNode.data.value || "");
            }

            if (selectedNode.type === 'catalog') {
                setProductId(selectedNode.data.productId || "");
                fetch('/api/commerce/products').then(r => r.json()).then(res => setProducts(res.data || []));
            }

            if (selectedNode.type === 'payment') {
                setAmount(selectedNode.data.amount || "0");
                setCurrency(selectedNode.data.currency || "INR");
                setPaymentTitle(selectedNode.data.paymentTitle || "Pay Now");
                setPaymentProvider(selectedNode.data.paymentProvider || "Razorpay");
            }

            if (selectedNode.type === 'meta_flow') {
                setMetaFlowId(selectedNode.data.flowId || "");
                setMetaFlowCTA(selectedNode.data.flowCTA || "Open Form");
                setMetaFlowHeader(selectedNode.data.flowHeader || "");
                setMetaFlowFooter(selectedNode.data.flowFooter || "");
                setInitialScreen(selectedNode.data.initialScreen || "QUESTION_1");
                setFlowToken(selectedNode.data.flowToken || "");
                setMetaFlowHeaderType(selectedNode.data.headerType || "text");
                setHeaderUrl(selectedNode.data.headerUrl || "");
                setMetaFlowSpec(selectedNode.data.flowSpec ? JSON.stringify(selectedNode.data.flowSpec, null, 2) : "");
            }

            if (selectedNode.type === 'goal') {
                setGoalId(selectedNode.data.goalId || "");
                fetch('/api/goals').then(r => r.json()).then(res => setGoals(res.data || []));
            }

            if (selectedNode.type === 'wait') {
                setDelayValue(selectedNode.data.delayValue || "5");
                setDelayUnit(selectedNode.data.delayUnit || "minutes");
            }

            if (selectedNode.type === 'time_window') {
                setStartTime(selectedNode.data.startTime || "09:00");
                setEndTime(selectedNode.data.endTime || "18:00");
            }

            if (selectedNode.type === 'drip') {
                setDripId(selectedNode.data.dripId || "");
                fetch('/api/drips').then(r => r.json()).then(res => setDrips(res.data || []));
            }

            if (selectedNode.type === 'list') {
                setListItems(selectedNode.data.items || []);
                setSectionTitle(selectedNode.data.sectionTitle || "Menu");
                setListBtnText(selectedNode.data.buttonText || "Select Option");
                setHeaderUrl(selectedNode.data.headerUrl || "");
            }

            if (selectedNode.type === 'message' || selectedNode.type === 'start') {
                setContentType(selectedNode.data.contentType || 'TEXT');
                setMediaUrl(selectedNode.data.mediaUrl || "");
                setButtons(selectedNode.data.buttons || []);
            }

            if (selectedNode.type === 'meta_template') {
                setTemplateName(selectedNode.data.templateName || "");
                setTemplateLanguage(selectedNode.data.language || "en_US");
                setTemplateBodyText(selectedNode.data.bodyText || "");
                fetch('/api/templates').then(r => r.json()).then(res => setTemplates(res.data?.filter((t: any) => t.status === 'APPROVED') || []));
            }

            if (selectedNode.type === 'location') {
                setLocationType(selectedNode.data.locationType || 'REQUEST');
                setLocationName(selectedNode.data.name || "");
                setLocationAddress(selectedNode.data.address || "");
            }

            if (selectedNode.type === 'external_webhook' || selectedNode.type === 'webhook_crm') {
                setExtUrl(selectedNode.data.url || "");
                setExtMethod(selectedNode.data.method || "POST");
                setExtHeaders(typeof selectedNode.data.headers === 'string' ? selectedNode.data.headers : JSON.stringify(selectedNode.data.headers || {}, null, 2));
                setExtBody(typeof selectedNode.data.body === 'string' ? selectedNode.data.body : JSON.stringify(selectedNode.data.body || {}, null, 2));
                setCaptureKey(selectedNode.data.captureKey || "");
            }
        }
    }, [selectedNode]);

    const handleUpdateListItems = (items: any[]) => {
        setListItems(items);
        if (selectedNode) {
            onChange(selectedNode.id, { ...selectedNode.data, items });
        }
    };

    const handleUpdate = (field: string, val: string) => {
        if (!selectedNode) return;

        let newData = { ...selectedNode.data };

        if (field === "label") {
            setLabel(val);
            newData.label = val;
        } else if (field === "content") {
            setContent(val);
            newData.text = val;
        } else if (field === "actionType") {
            setActionType(val);
            newData.actionType = val;
        } else if (field === "dripId") {
            setDripId(val);
            newData.dripId = val;
        } else if (field === "conditionType") {
            setConditionType(val);
            newData.conditionType = val;
        } else if (field === "operator") {
            setOperator(val);
            newData.operator = val;
        } else if (field === "value") {
            setValue(val);
            newData.value = val;
        } else if (field === "amount") {
            setAmount(val);
            newData.amount = val;
        } else if (field === "currency") {
            setCurrency(val);
            newData.currency = val;
        } else if (field === "paymentTitle") {
            setPaymentTitle(val);
            newData.paymentTitle = val;
        } else if (field === "metaFlowId") {
            setMetaFlowId(val);
            newData.flowId = val;
        } else if (field === "metaFlowCTA") {
            setMetaFlowCTA(val);
            newData.flowCTA = val;
        } else if (field === "metaFlowHeader") {
            setMetaFlowHeader(val);
            newData.flowHeader = val;
        } else if (field === "metaFlowFooter") {
            setMetaFlowFooter(val);
            newData.flowFooter = val;
        } else if (field === "initialScreen") {
            setInitialScreen(val);
            newData.initialScreen = val;
        } else if (field === "flowToken") {
            setFlowToken(val);
            newData.flowToken = val;
        } else if (field === "metaFlowHeaderType") {
            setMetaFlowHeaderType(val as 'text' | 'image');
            newData.headerType = val;
        } else if (field === "metaFlowHeaderUrl") {
            setHeaderUrl(val);
            newData.headerUrl = val;
        } else if (field === "goalId") {
            setGoalId(val);
            newData.goalId = val;
            const g = goals.find(g => g.id === val);
            if (g) newData.goalName = g.name;
        } else if (field === "delayValue") {
            setDelayValue(val);
            newData.delayValue = val;
        } else if (field === "delayUnit") {
            setDelayUnit(val);
            newData.delayUnit = val;
        } else if (field === "startTime") {
            setStartTime(val);
            newData.startTime = val;
        } else if (field === "endTime") {
            setEndTime(val);
            newData.endTime = val;
        } else if (field === "sectionTitle") {
            setSectionTitle(val);
            newData.sectionTitle = val;
        } else if (field === "listBtnText") {
            setListBtnText(val);
            newData.buttonText = val;
        } else if (field === "productId") {
            setProductId(val);
            newData.productId = val;
            // Store name/image for visual reference in node
            const p = products.find(p => p.id === val);
            if (p) {
                newData.productName = p.name;
                newData.productImage = p.image_url;
                newData.productPrice = p.price;
            }
        } else if (field === "contentType") {
            setContentType(val as any);
            newData.contentType = val;
        } else if (field === "mediaUrl") {
            setMediaUrl(val);
            newData.mediaUrl = val;
        } else if (field === "headerUrl") {
            setHeaderUrl(val);
            newData.headerUrl = val;
        } else if (field === "emailAddress") {
            setEmailAddress(val);
            newData.emailAddress = val;
        } else if (field === "emailSubject") {
            setEmailSubject(val);
            newData.emailSubject = val;
        } else if (field === "spreadsheetId") {
            setSpreadsheetId(val);
            newData.spreadsheetId = val;
        } else if (field === "sheetName") {
            setSheetName(val);
            newData.sheetName = val;
        } else if (field === "webhookUrl") {
            setWebhookUrl(val);
            newData.webhookUrl = val;
        } else if (field === "templateName") {
            setTemplateName(val);
            newData.templateName = val;
        } else if (field === "language") {
            setTemplateLanguage(val);
            newData.language = val;
        } else if (field === "bodyText") {
            setTemplateBodyText(val);
            newData.bodyText = val;
        } else if (field === "locationType") {
            setLocationType(val as any);
            newData.locationType = val;
        } else if (field === "locationName") {
            setLocationName(val);
            newData.name = val;
        } else if (field === "locationAddress") {
            setLocationAddress(val);
            newData.address = val;
        } else if (field === "extUrl") {
            setExtUrl(val);
            newData.url = val;
        } else if (field === "extMethod") {
            setExtMethod(val);
            newData.method = val;
        } else if (field === "extHeaders") {
            setExtHeaders(val);
            newData.headers = val;
        } else if (field === "extBody") {
            setExtBody(val);
            newData.body = val;
        } else if (field === "captureKey") {
            setCaptureKey(val);
            newData.captureKey = val;
        }

        onChange(selectedNode.id, newData);
    };

    if (!selectedNode) return null;

    const nodeTypeLabel: Record<string, string> = {
        message: 'Message Node',
        list: 'List Menu Node',
        start: 'Start Trigger',
        condition: 'Condition',
        wait: 'Wait / Delay',
        time_window: 'Time Window',
        payment: 'Payment Request',
        catalog: 'Product Catalog',
        order_tracking: 'Order Tracking',
        appointment: 'Appointment',
        drip: 'Drip Enrollment',
        action: 'Action Node',
        meta_flow: 'Meta Form',
        end: 'End Flow',
        order_summary: 'Order Summary',
        meta_template: 'Cloud Template',
        location: 'Location Pin',
        external_webhook: 'CRM Bridge (Webhook)',
        webhook_crm: 'CRM Bridge (Enterprise)',
    };

    const nodeTypeBg: Record<string, string> = {
        message: 'bg-emerald-100 text-emerald-800',
        list: 'bg-fuchsia-100 text-fuchsia-800',
        start: 'bg-blue-100 text-blue-800',
        condition: 'bg-violet-100 text-violet-800',
        wait: 'bg-amber-100 text-amber-800',
        time_window: 'bg-slate-100 text-slate-800',
        payment: 'bg-emerald-100 text-emerald-800',
        catalog: 'bg-orange-100 text-orange-800',
        order_tracking: 'bg-orange-100 text-orange-800',
        appointment: 'bg-blue-100 text-blue-800',
        drip: 'bg-slate-100 text-slate-800',
        action: 'bg-zinc-100 text-zinc-800',
        meta_flow: 'bg-indigo-100 text-indigo-800',
        end: 'bg-red-100 text-red-800',
        order_summary: 'bg-orange-100 text-orange-800',
        meta_template: 'bg-emerald-100 text-emerald-800',
        location: 'bg-purple-100 text-purple-800',
        external_webhook: 'bg-slate-100 text-slate-800',
        webhook_crm: 'bg-indigo-100 text-indigo-800',
    };

    return (
        <aside className="w-80 bg-white border-l border-gray-100 flex flex-col h-full z-10">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white shrink-0">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${nodeTypeBg[selectedNode.type || ''] || 'bg-gray-100 text-gray-700'}`}>
                        {nodeTypeLabel[selectedNode.type || ''] || selectedNode.type}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {onDuplicate && (
                        <button onClick={() => onDuplicate(selectedNode)} title="Duplicate Node" className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Copy size={14} />
                        </button>
                    )}
                    {onDelete && (
                        <button onClick={onDelete} title="Delete Node" className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                        </button>
                    )}
                    <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-5 flex-1 overflow-y-auto">
                {/* Node ID badge */}
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Node ID</p>
                    <p className="text-[11px] font-mono text-gray-600 mt-0.5">{selectedNode.id}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Internal Name</label>
                    <input
                        type="text"
                        value={label}
                        onChange={(e) => handleUpdate("label", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {selectedNode.type === 'start' && (
                    <div className="pt-2 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Keyword (Live)</label>
                            <input
                                type="text"
                                value={content}
                                onChange={(e) => handleUpdate("content", e.target.value.toUpperCase())}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm font-black outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50/30"
                                placeholder="e.g. MENU, START, HI"
                            />
                            <p className="text-[10px] text-blue-600 mt-1.5 font-medium leading-tight">
                                💡 This is the EXACT word the customer sends to start this flow. 
                            </p>
                        </div>
                    </div>
                )}

                {selectedNode.type === 'message' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                            <select
                                value={contentType}
                                onChange={(e) => handleUpdate("contentType", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
                            >
                                <option value="TEXT">Text Only</option>
                                {selectedNode.type !== 'start' && (
                                    <>
                                        <option value="IMAGE">Image + Text</option>
                                        <option value="VIDEO">Video + Text</option>
                                        <option value="DOCUMENT">Document</option>
                                        <option value="VOICE">Voice Note</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {contentType !== 'TEXT' && selectedNode.type !== 'start' && (
                            <SmartUploader
                                label="Media Content"
                                module="flow"
                                defaultValue={mediaUrl}
                                description={`Upload ${contentType.toLowerCase()} (Max 10MB)`}
                                onUploadSuccess={(url) => {
                                    setMediaUrl(url);
                                    handleUpdate("mediaUrl", url);
                                }}
                                accept={
                                    contentType === 'IMAGE' ? "image/jpeg,image/png,image/webp" :
                                        contentType === 'VIDEO' ? "video/mp4,video/webm" :
                                            contentType === 'VOICE' ? "audio/mpeg,audio/ogg" :
                                                "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                }
                                fileType={contentType.toLowerCase() as any}
                            />
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {contentType === 'TEXT' ? 'Message Body' : 'Caption'}
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => handleUpdate("content", e.target.value)}
                                rows={4}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Hello, how can I help you?"
                            />
                        </div>

                        {/* Interactive Buttons Section */}
                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase">Interactive Buttons</label>
                                    {buttons.filter((b: any) => b.type === 'reply').length >= 3 && (
                                        <p className="text-[9px] text-rose-500 font-bold mt-0.5">⚠️ Max 3 reply buttons (Meta limit)</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        if (buttons.filter((b: any) => b.type === 'reply').length >= 3) return;
                                        const newButtons = [...buttons, { id: Math.random().toString(36).substr(2, 9), title: 'New Button', type: 'reply' }];
                                        setButtons(newButtons);
                                        onChange(selectedNode.id, { ...selectedNode.data, buttons: newButtons });
                                    }}
                                    disabled={buttons.filter((b: any) => b.type === 'reply').length >= 3}
                                    className={`text-[10px] font-black uppercase ${buttons.filter((b: any) => b.type === 'reply').length >= 3
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-blue-600 hover:underline'
                                        }`}
                                >
                                    + Add Button
                                </button>
                            </div>
                            <div className="space-y-2">
                                {buttons.map((btn, idx) => (
                                    <div key={btn.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2 relative group">
                                        <button
                                            onClick={() => {
                                                const newButtons = buttons.filter(b => b.id !== btn.id);
                                                setButtons(newButtons);
                                                onChange(selectedNode.id, { ...selectedNode.data, buttons: newButtons });
                                            }}
                                            className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <X size={10} />
                                        </button>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={btn.title}
                                                onChange={(e) => {
                                                    const newButtons = [...buttons];
                                                    newButtons[idx].title = e.target.value;
                                                    setButtons(newButtons);
                                                    onChange(selectedNode.id, { ...selectedNode.data, buttons: newButtons });
                                                }}
                                                placeholder="Button Label"
                                                className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold outline-none"
                                            />
                                            <select
                                                value={btn.type}
                                                onChange={(e) => {
                                                    const newButtons = [...buttons];
                                                    newButtons[idx].type = e.target.value;
                                                    setButtons(newButtons);
                                                    onChange(selectedNode.id, { ...selectedNode.data, buttons: newButtons });
                                                }}
                                                className="w-24 bg-white border border-gray-200 rounded-lg p-2 text-[10px] font-bold outline-none"
                                            >
                                                <option value="reply">Reply</option>
                                                <option value="url">URL</option>
                                            </select>
                                        </div>
                                        {btn.type !== 'reply' && (
                                            <input
                                                type="text"
                                                value={btn.value || ""}
                                                onChange={(e) => {
                                                    const newButtons = [...buttons];
                                                    newButtons[idx].value = e.target.value;
                                                    setButtons(newButtons);
                                                    onChange(selectedNode.id, { ...selectedNode.data, buttons: newButtons });
                                                }}
                                                placeholder="https://..."
                                                className="w-full bg-white border border-gray-200 rounded-lg p-2 text-[10px] font-medium outline-none"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {selectedNode.type === 'catalog' && (
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Sequence / Carousel Products</label>
                            <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">Max 10</span>
                        </div>
                        <select
                            value=""
                            onChange={(e) => {
                                const val = e.target.value;
                                if (!val) return;
                                const p = products.find((prod: any) => prod.id === val);
                                const currentList = (selectedNode.data?.carouselProducts && selectedNode.data.carouselProducts.length > 0) ? selectedNode.data.carouselProducts : (selectedNode.data?.productName ? [{
                                    id: selectedNode.data.productId || 'manual',
                                    name: selectedNode.data.productName,
                                    price: selectedNode.data.productPrice,
                                    image: selectedNode.data.productImage,
                                    text: selectedNode.data.text
                                }] : []);

                                if (currentList.length >= 10) {
                                    alert("Maximum 10 products allowed in a sequence.");
                                    return;
                                }

                                const newData = {
                                    ...selectedNode.data,
                                    carouselProducts: [...currentList, {
                                        id: val,
                                        name: p ? p.name : 'Unknown Product',
                                        price: p ? p.price : 0,
                                        image: p ? (p.image_url || (p.image_urls && p.image_urls[0]) || '') : '',
                                        text: p ? p.description : ''
                                    }]
                                };
                                // Clear legacy single-product fields if turning into multi-product
                                delete newData.productId; delete newData.productName; delete newData.productPrice; delete newData.productImage;
                                onChange(selectedNode.id, newData);
                            }}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
                        >
                            <option value="">+ Add a product...</option>
                            {products.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                            ))}
                        </select>

                        {/* Show current selections preview */}
                        <div className="space-y-2 mt-3 max-h-60 overflow-y-auto">
                            {((selectedNode.data?.carouselProducts && selectedNode.data.carouselProducts.length > 0) ? selectedNode.data.carouselProducts : (selectedNode.data?.productName ? [{
                                id: selectedNode.data.productId || 'manual',
                                name: selectedNode.data.productName,
                                price: selectedNode.data.productPrice,
                                image: selectedNode.data.productImage,
                                text: selectedNode.data.text
                            }] : [])).map((cp: any, idx: number) => (
                                <div key={idx} className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center gap-3 relative group">
                                    {cp.image && (
                                        <img src={cp.image} className="w-10 h-10 object-cover rounded-lg" alt={cp.name} />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-purple-900 truncate">{cp.name}</div>
                                        <div className="text-xs text-purple-700 font-semibold">₹{cp.price}</div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const currentList = (selectedNode.data?.carouselProducts && selectedNode.data.carouselProducts.length > 0) ? selectedNode.data.carouselProducts : (selectedNode.data?.productName ? [{
                                                id: selectedNode.data.productId || 'manual', name: selectedNode.data.productName, price: selectedNode.data.productPrice, image: selectedNode.data.productImage, text: selectedNode.data.text
                                            }] : []);
                                            const newList = currentList.filter((_: any, i: number) => i !== idx);
                                            onChange(selectedNode.id, { ...selectedNode.data, carouselProducts: newList, productId: null, productName: null, productPrice: null, productImage: null });
                                        }}
                                        className="p-1.5 bg-white text-rose-500 rounded-md shadow-sm border border-purple-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Manual entry fallback when no products exist */}
                        {products.length === 0 && (
                            <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                                <p className="text-xs font-bold text-amber-800">⚠️ No products found in your Commerce store. Enter product details manually:</p>
                                <input
                                    type="text"
                                    placeholder="Product Name"
                                    value={selectedNode.data.productName || ''}
                                    onChange={(e) => onChange(selectedNode.id, { ...selectedNode.data, productName: e.target.value })}
                                    className="w-full border border-amber-200 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-amber-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Price (e.g. 999)"
                                    value={selectedNode.data.productPrice || ''}
                                    onChange={(e) => onChange(selectedNode.id, { ...selectedNode.data, productPrice: e.target.value })}
                                    className="w-full border border-amber-200 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-amber-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Description (optional)"
                                    value={selectedNode.data.text || ''}
                                    onChange={(e) => onChange(selectedNode.id, { ...selectedNode.data, text: e.target.value })}
                                    className="w-full border border-amber-200 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-amber-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Image URL (optional, must be https://...)"
                                    value={selectedNode.data.productImage || ''}
                                    onChange={(e) => onChange(selectedNode.id, { ...selectedNode.data, productImage: e.target.value })}
                                    className="w-full border border-amber-200 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>
                        )}

                        <p className="text-xs text-gray-400 mt-2">
                            The bot will send this product as an interactive message with an &quot;Interested&quot; button. Connect the output handle to the next step.
                        </p>
                    </div>
                )}

                {selectedNode.type === 'payment' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Title / Reason</label>
                            <input
                                type="text"
                                value={paymentTitle}
                                onChange={(e) => handleUpdate("paymentTitle", e.target.value)}
                                placeholder="e.g. Booking Fee"
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => handleUpdate("amount", e.target.value)}
                                    placeholder="0.00"
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                <select
                                    value={currency}
                                    onChange={(e) => handleUpdate("currency", e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
                                >
                                    <option value="INR">INR</option>
                                    <option value="USD">USD</option>
                                    <option value="AED">AED</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gateway Provider</label>
                            <select
                                value={paymentProvider}
                                onChange={(e) => handleUpdate("paymentProvider", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
                            >
                                <option value="Razorpay">Razorpay (Ind)</option>
                                <option value="PhonePe">PhonePe (Ind)</option>
                            </select>
                        </div>
                        <p className="text-xs text-gray-400">
                            The bot will generate a secure payment link via the selected provider and send it to the user.
                        </p>
                    </div>
                )}

                {selectedNode.type === 'action' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                            <select
                                value={actionType}
                                onChange={(e) => handleUpdate("actionType", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            >
                                <option value="start_drip">Start Drip Campaign</option>
                                <option value="stop_drip">Stop Drip Campaign</option>
                                <option value="webhook">Trigger Outbound Webhook</option>
                                <option value="save_to_crm">Sync to Universal CRM</option>
                                <option value="google_sheet">Append to Google Sheet</option>
                                <option value="send_email">Send Notification Email</option>
                            </select>
                        </div>

                        {actionType === 'start_drip' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Campaign</label>
                                <select
                                    value={dripId}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        handleUpdate("dripId", val);
                                        const selected = drips.find(d => d.id === val);
                                        if (selected) handleUpdate("dripName", selected.name);
                                    }}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                >
                                    <option value="">Select a Drip...</option>
                                    {drips.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {actionType === 'send_email' && (
                            <div className="space-y-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                <div>
                                    <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">Recipient Email</label>
                                    <input
                                        type="email"
                                        placeholder="stalin@grafty.pro"
                                        value={emailAddress}
                                        onChange={(e) => handleUpdate("emailAddress", e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">Subject</label>
                                    <input
                                        type="text"
                                        placeholder="New Lead Generated"
                                        value={emailSubject}
                                        onChange={(e) => handleUpdate("emailSubject", e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="text-[10px] text-blue-700 bg-blue-100 p-2 rounded-lg font-medium">
                                    This will send a notification with the full lead details and variables to the email specified above.
                                </div>
                            </div>
                        )}
                        {actionType === 'webhook' && (
                            <div className="space-y-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">Webhook URL</label>
                                    <input
                                        type="text"
                                        placeholder="https://your-api.com/webhook"
                                        value={webhookUrl}
                                        onChange={(e) => handleUpdate("webhookUrl", e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-slate-500"
                                    />
                                </div>
                                <div className="text-[10px] text-slate-700 bg-slate-100 p-2 rounded-lg font-medium">
                                    The full lead payload (name, phone, variable data) will be sent as a POST request to this URL.
                                </div>
                            </div>
                        )}
                        {actionType === 'google_sheet' && (
                            <div className="space-y-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                <div>
                                    <label className="block text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-1">Spreadsheet ID</label>
                                    <input
                                        type="text"
                                        placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                                        value={spreadsheetId}
                                        onChange={(e) => handleUpdate("spreadsheetId", e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                    <p className="text-[9px] text-emerald-600 mt-1">Copy this from your Google Sheet URL.</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-1">Sheet Name</label>
                                    <input
                                        type="text"
                                        placeholder="Sheet1"
                                        value={sheetName}
                                        onChange={(e) => handleUpdate("sheetName", e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="text-[10px] text-emerald-700 bg-emerald-100 p-2 rounded-lg font-medium">
                                    Make sure you have shared your sheet with our service account email to allow writing.
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {selectedNode.type === 'condition' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Check Field</label>
                            <select
                                value={conditionType}
                                onChange={(e) => handleUpdate("conditionType", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
                            >
                                <option value="message_body">Last Message Text</option>
                                <option value="contact_tag">Contact Tag</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                            <select
                                value={operator}
                                onChange={(e) => handleUpdate("operator", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
                            >
                                <option value="equals">Equals (Exact)</option>
                                <option value="contains">Contains (Partial)</option>
                                <option value="starts_with">Starts With</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => handleUpdate("value", e.target.value)}
                                placeholder="e.g. yes, help, sales"
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                            Use the <span className="font-bold text-green-600">Green Handle</span> for True matches and <span className="font-bold text-red-600">Red Handle</span> for False.
                        </div>
                    </div>
                )}

                {selectedNode.type === 'order_tracking' && (
                    <div className="space-y-4">
                        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                            <h4 className="text-sm font-black text-orange-900 mb-2 tracking-tight">E-Commerce Automation</h4>
                            <p className="text-xs text-orange-700 font-medium leading-relaxed">
                                This node automatically captures the <strong>last user response</strong> as an Order ID and fetches live tracking data.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Success Path
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium">Follows this path if the order is found and status is retrieved.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Failed Path
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium">Follows this path if the Order ID is invalid or not found.</p>
                        </div>
                    </div>
                )}

                {selectedNode.type === 'meta_flow' && (
                    <div className="space-y-4">
                        <MetaFormSidebar 
                            nodeId={selectedNode.id} 
                            nodeData={selectedNode.data} 
                            onChange={onChange} 
                        />
                        
                        <div className="pt-4 border-t border-gray-100 space-y-4">
                            <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Advanced Configuration</h4>
                            
                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                <p className="text-[10px] text-amber-700 font-bold leading-tight mb-2">
                                    If you have an existing form created outside of Grafty, you can map it here.
                                </p>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Flow ID (Optional)</label>
                                <input
                                    type="text"
                                    value={metaFlowId}
                                    onChange={(e) => handleUpdate("flowId", e.target.value)}
                                    placeholder="e.g. 1234567890"
                                    className="w-full border border-amber-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">CTA Button Text</label>
                                <input
                                    type="text"
                                    value={metaFlowCTA}
                                    onChange={(e) => handleUpdate("flowCTA", e.target.value)}
                                    placeholder="Open Form"
                                    className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100 space-y-3">
                                <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 ml-1">JSON FLOW SPEC (ADVANCED)</label>
                                <textarea
                                    value={metaFlowSpec}
                                    onChange={(e) => {
                                        setMetaFlowSpec(e.target.value);
                                        handleUpdate("flowSpec", e.target.value);
                                    }}
                                    rows={8}
                                    placeholder='{ "screens": [...] }'
                                    className="w-full border border-gray-200 bg-gray-900 text-green-400 font-mono text-[10px] rounded-xl p-3 outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none shadow-inner"
                                />
                                
                                <button
                                    onClick={async () => {
                                        setIsSyncing(true);
                                        try {
                                            let finalSpec = {};
                                            
                                            if (selectedNode.data.formFields && selectedNode.data.formFields.length > 0) {
                                                finalSpec = MetaFormCompiler.compileSingleScreen(selectedNode.data.formFields);
                                                setMetaFlowSpec(JSON.stringify(finalSpec, null, 2));
                                                handleUpdate("flowSpec", JSON.stringify(finalSpec, null, 2));
                                            } else {
                                                finalSpec = JSON.parse(metaFlowSpec || "{}");
                                            }

                                            const res = await fetch('/api/whatsapp/flows/sync', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    flowId: metaFlowId,
                                                    spec: finalSpec,
                                                    name: selectedNode.data.label || "New Flow"
                                                })
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                if (data.warning) {
                                                    toast.warning("Uploaded but not published: " + data.warning);
                                                } else {
                                                    toast.success("Flow Synced to Meta! 🚀");
                                                }
                                                if (data.metaFlowId && !metaFlowId) {
                                                    handleUpdate("metaFlowId", data.metaFlowId);
                                                    setMetaFlowId(data.metaFlowId);
                                                    toast.success("Meta Flow ID attached to Node!");
                                                    setTimeout(() => window.dispatchEvent(new Event('flow:save')), 500);
                                                }
                                            } else {
                                                toast.error(data.error || "Sync failed");
                                            }
                                        } catch (e: any) {
                                            toast.error("Invalid JSON or Network Error");
                                        } finally {
                                            setIsSyncing(false);
                                        }
                                    }}
                                    disabled={isSyncing}
                                    className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${isSyncing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-xl hover:shadow-indigo-100'}`}
                                >
                                    {isSyncing ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-3 h-3 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
                                            SYNCING...
                                        </span>
                                    ) : (
                                        <>
                                            <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">↑</div>
                                            SYNC TO META CLOUD
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {selectedNode.type === 'goal' && (
                    <div className="space-y-4">
                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                            <h4 className="text-sm font-black text-emerald-900 mb-2 tracking-tight">ROI Tracking</h4>
                            <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                                Marking this node as a Goal enables conversion tracking for this flow.
                            </p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Select Goal</label>
                            <select
                                value={goalId}
                                onChange={(e) => handleUpdate("goalId", e.target.value)}
                                className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-100 transition-all"
                            >
                                <option value="">Select a Goal...</option>
                                {goals.map((g: any) => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {selectedNode.type === 'wait' && (
                    <div className="space-y-4">
                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                            <h4 className="text-sm font-black text-amber-900 mb-2 tracking-tight">Flow Pause</h4>
                            <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                Use this to simulate natural delay or wait before the next automated step.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Value</label>
                                <input
                                    type="number"
                                    value={delayValue}
                                    onChange={(e) => handleUpdate("delayValue", e.target.value)}
                                    className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-amber-100 transition-all"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Unit</label>
                                <select
                                    value={delayUnit}
                                    onChange={(e) => handleUpdate("delayUnit", e.target.value)}
                                    className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-amber-100 transition-all"
                                >
                                    <option value="minutes">Minutes</option>
                                    <option value="hours">Hours</option>
                                    <option value="days">Days</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {selectedNode.type === 'time_window' && (
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <h4 className="text-sm font-black text-slate-900 mb-2 tracking-tight">Operating Hours</h4>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                Branch the flow based on when the customer messages you.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Start Time</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => handleUpdate("startTime", e.target.value)}
                                    className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">End Time</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => handleUpdate("endTime", e.target.value)}
                                    className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                />
                            </div>
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold bg-gray-50 p-2 rounded-lg text-center">
                            Timezone: Asia/Kolkata (IST)
                        </div>
                    </div>
                )}

                {selectedNode.type === 'list' && (
                    <div className="space-y-4">
                        <div className="bg-fuchsia-50 p-4 rounded-2xl border border-fuchsia-100">
                            <h4 className="text-sm font-black text-fuchsia-900 mb-2 tracking-tight">Interactive Menu</h4>
                            <p className="text-xs text-fuchsia-700 font-medium leading-relaxed">
                                Create a list of up to 10 options. Users can select one to proceed.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Button Text</label>
                                    <input
                                        type="text"
                                        value={listBtnText}
                                        onChange={(e) => handleUpdate("listBtnText", e.target.value)}
                                        placeholder="e.g. View Options"
                                        className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-fuchsia-100 transition-all font-sans"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Section Title</label>
                                    <input
                                        type="text"
                                        value={sectionTitle}
                                        onChange={(e) => handleUpdate("sectionTitle", e.target.value)}
                                        placeholder="e.g. Main Menu"
                                        className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-fuchsia-100 transition-all font-sans"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2 px-1">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Menu Items</label>
                                    {listItems.length >= 10 && (
                                        <p className="text-[9px] text-rose-500 font-bold mt-0.5">⚠️ Max 10 items (Meta limit)</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        if (listItems.length >= 10) return;
                                        handleUpdateListItems([...listItems, { id: Math.random().toString(36).substr(2, 9), title: 'New Option', description: '' }]);
                                    }}
                                    disabled={listItems.length >= 10}
                                    className={`text-[10px] font-black uppercase ${listItems.length >= 10
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-fuchsia-600 hover:underline'
                                        }`}
                                >
                                    + Add Item
                                </button>
                            </div>
                            <div className="space-y-3">
                                {listItems.map((item, idx) => (
                                    <div key={item.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2 relative group">
                                        <button
                                            onClick={() => handleUpdateListItems(listItems.filter(i => i.id !== item.id))}
                                            className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                                        </button>
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => {
                                                const newItems = [...listItems];
                                                newItems[idx].title = e.target.value;
                                                handleUpdateListItems(newItems);
                                            }}
                                            placeholder="Item Title"
                                            className="w-full bg-white border border-gray-100 rounded-lg p-2 text-xs font-black outline-none focus:ring-2 focus:ring-fuchsia-100"
                                        />
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => {
                                                const newItems = [...listItems];
                                                newItems[idx].description = e.target.value;
                                                handleUpdateListItems(newItems);
                                            }}
                                            placeholder="Short description (optional)"
                                            className="w-full bg-white border border-gray-100 rounded-lg p-2 text-[10px] font-bold text-gray-500 outline-none focus:ring-2 focus:ring-fuchsia-100"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {selectedNode.type === 'drip' && (
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <h4 className="text-sm font-black text-slate-900 mb-2 tracking-tight">Drip Enrollment</h4>
                            <p className="text-xs text-slate-700 font-medium leading-relaxed">
                                Automatically enroll the contact into a multi-step follow-up sequence.
                            </p>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Target Sequence</label>
                            <select
                                value={dripId}
                                onChange={(e) => {
                                    const selectedDrip = drips.find(d => d.id === e.target.value);
                                    handleUpdate("dripId", e.target.value);
                                    if (selectedDrip) {
                                        handleUpdate("dripName", selectedDrip.name);
                                    }
                                }}
                                className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none"
                            >
                                <option value="">Select Drip Sequence...</option>
                                {drips.map((d: any) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <p className="text-[10px] text-amber-700 font-bold leading-tight">
                                Note: If the contact is already enrolled and the sequence is active, it won't be re-enrolled to prevent duplicates.
                            </p>
                        </div>
                    </div>
                )}

                {selectedNode.type === 'appointment' && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <h4 className="text-sm font-black text-blue-900 mb-2 tracking-tight">Appointment Booking</h4>
                            <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                This node triggers a calendar picker or handles slot booking confirmation.
                            </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-[10px] text-gray-500 font-bold leading-tight">
                                Users will be prompted to select a slot. The next response will be treated as the Slot ID for booking.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Success Path
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium">Followed after successful slot booking.</p>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <button
                                onClick={() => window.location.href = '/dashboard/settings/integrations'}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                            >
                                <Calendar size={14} />
                                Connect Google Calendar
                            </button>
                            <p className="text-[9px] text-center text-gray-400 mt-2 font-bold uppercase tracking-widest">
                                Required for real-time sync
                            </p>
                        </div>
                    </div>
                )}

                {selectedNode.type === 'order_summary' && (
                    <div className="space-y-4">
                        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                            <h4 className="text-sm font-black text-orange-900 mb-2 tracking-tight">Checkout Summary</h4>
                            <p className="text-xs text-orange-700 font-medium leading-relaxed">
                                Displays the list of items in the cart, individual prices, and the grand total.
                            </p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Contextual Message</label>
                            <textarea
                                value={content}
                                onChange={(e) => handleUpdate("content", e.target.value)}
                                placeholder="e.g. Here is your order summary. Please review before proceeding to payment."
                                className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 text-sm font-bold outline-none focus:ring-4 focus:ring-orange-100 transition-all resize-none"
                                rows={4}
                            />
                        </div>
                    </div>
                )}

                {selectedNode.type === 'meta_template' && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <FileCode size={16} className="text-emerald-600" />
                            <h4 className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">Template Configuration</h4>
                        </div>
                        <div className="space-y-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Template Name</label>
                                <select
                                    value={templateName}
                                    onChange={e => {
                                        const val = e.target.value;
                                        handleUpdate("templateName", val);
                                        const t = templates.find(t => t.name === val);
                                        if (t) {
                                            handleUpdate("language", t.language);
                                            setTemplateLanguage(t.language);
                                            // Extract body text from components
                                            const bodyComp = (t.components as any[] || []).find(c => c.type === 'BODY');
                                            if (bodyComp) {
                                                handleUpdate("bodyText", bodyComp.text);
                                                setTemplateBodyText(bodyComp.text);
                                            }
                                        }
                                    }}
                                    className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-2 text-xs font-bold focus:border-emerald-500 outline-none"
                                >
                                    <option value="">Select an approved template...</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.name}>{t.name} ({t.language})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Language</label>
                                <input
                                    type="text"
                                    value={templateLanguage}
                                    onChange={e => handleUpdate("language", e.target.value)}
                                    placeholder="en_US"
                                    className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-2 text-xs font-bold focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Body Preview</label>
                                <textarea
                                    value={templateBodyText}
                                    onChange={e => handleUpdate("bodyText", e.target.value)}
                                    placeholder="Welcome to our service!"
                                    className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-2 text-xs font-medium focus:border-emerald-500 outline-none resize-none"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {selectedNode.type === 'location' && (
                    <div className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                            <h4 className="text-sm font-black text-purple-900 mb-2 tracking-tight">Location Intelligence</h4>
                            <p className="text-xs text-purple-700 font-medium leading-relaxed">
                                Request the user's current GPS location or send a specific pin (e.g., for a store locator).
                            </p>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Pin Type</label>
                            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                                <button
                                    onClick={() => handleUpdate("locationType", "REQUEST")}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${locationType === 'REQUEST' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Request GPS
                                </button>
                                <button
                                    onClick={() => handleUpdate("locationType", "SEND")}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${locationType === 'SEND' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Send Pin
                                </button>
                            </div>
                        </div>

                        {locationType === 'SEND' ? (
                            <div className="space-y-3 pt-2">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Store / Place Name</label>
                                    <input
                                        type="text"
                                        value={locationName}
                                        onChange={(e) => handleUpdate("locationName", e.target.value)}
                                        placeholder="e.g. Grafty HQ"
                                        className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-purple-100 transition-all font-sans"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Full Address</label>
                                    <textarea
                                        value={locationAddress}
                                        onChange={(e) => handleUpdate("locationAddress", e.target.value)}
                                        placeholder="Enter the full address or Google Maps link..."
                                        rows={3}
                                        className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-purple-100 transition-all font-sans resize-none"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="p-3 bg-purple-100/50 rounded-xl border border-purple-100">
                                <p className="text-[10px] text-purple-700 font-bold leading-tight">
                                    The bot will present a &quot;Send Location&quot; button to the customer. When they click it, their coordinates will be sent to the bot.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {(selectedNode.type === 'external_webhook' || selectedNode.type === 'webhook_crm') && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Webhook size={16} className="text-indigo-600" />
                            <h4 className="text-[11px] font-black text-indigo-800 uppercase tracking-widest">CRM Bridge Config</h4>
                        </div>
                        
                        <div className="space-y-4 p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Webhook URL</label>
                                <input
                                    type="text"
                                    value={extUrl}
                                    onChange={e => handleUpdate("extUrl", e.target.value)}
                                    placeholder="https://hooks.hubspot.com/..."
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Method</label>
                                    <select
                                        value={extMethod}
                                        onChange={e => handleUpdate("extMethod", e.target.value)}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                                    >
                                        <option value="POST">POST</option>
                                        <option value="GET">GET</option>
                                        <option value="PUT">PUT</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Capture Key</label>
                                    <input
                                        type="text"
                                        value={captureKey}
                                        onChange={e => handleUpdate("captureKey", e.target.value)}
                                        placeholder="crm_res"
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">JSON Headers</label>
                                <textarea
                                    value={extHeaders}
                                    onChange={e => handleUpdate("extHeaders", e.target.value)}
                                    placeholder='{ "Authorization": "Bearer ..." }'
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-mono outline-none focus:border-indigo-500 shadow-sm"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">JSON Body Mapping</label>
                                <textarea
                                    value={extBody}
                                    onChange={e => handleUpdate("extBody", e.target.value)}
                                    placeholder='{ "email": "{{contact.email}}", "name": "{{contact.name}}" }'
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-mono outline-none focus:border-indigo-500 shadow-sm"
                                    rows={5}
                                />
                            </div>
                        </div>

                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 mt-2">
                            <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                                💡 <b>Pro Tip:</b> Use <code className="bg-white px-1 rounded">{"{{contact.____}}"}</code> variables to map WhatsApp data to CRM fields.
                            </p>
                            <p className="text-[10px] text-amber-800 font-black mt-2">
                                ✅ Branches: Connect output handles to &quot;Success&quot; or &quot;Failed&quot;.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* WhatsApp Preview (message & list nodes only) */}
            {(selectedNode.type === 'message' || selectedNode.type === 'list' || selectedNode.type === 'meta_template') && (
                <div className="border-t border-gray-100 shrink-0">
                    <div className="px-4 py-2.5 flex items-center gap-2 bg-gray-50 border-b border-gray-100">
                        <Smartphone size={13} className="text-emerald-600" />
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">WhatsApp Preview</p>
                    </div>
                    <div className="bg-[#ECE5DD] p-3 min-h-[80px] max-h-[200px] overflow-y-auto">
                        <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm max-w-[85%] text-[12px] font-medium text-gray-800 leading-relaxed">
                            {/* Media indicator */}
                            {(selectedNode.data?.contentType === 'IMAGE' || selectedNode.data?.headerUrl) && (
                                <div className="bg-gray-100 rounded-lg h-20 mb-2 flex items-center justify-center text-gray-400 text-[10px] font-bold overflow-hidden">
                                    {selectedNode.data?.mediaUrl || selectedNode.data?.headerUrl ? (
                                        <img src={selectedNode.data?.mediaUrl || selectedNode.data?.headerUrl} alt="preview" className="w-full h-full object-cover rounded-lg" />
                                    ) : '📷 Image'}
                                </div>
                            )}
                            {selectedNode.data?.contentType === 'VIDEO' && (
                                <div className="bg-gray-100 rounded-lg h-16 mb-2 flex items-center justify-center text-gray-400 text-[10px] font-bold">🎬 Video</div>
                            )}
                            {selectedNode.data?.contentType === 'DOCUMENT' && (
                                <div className="bg-gray-100 rounded-lg px-3 py-2 mb-2 flex items-center gap-2 text-gray-600 text-[10px]">📄 Document</div>
                            )}
                            {/* Body text */}
                            <p className="whitespace-pre-wrap">{selectedNode.data?.bodyText || selectedNode.data?.text || selectedNode.data?.label || '...'}</p>
                            {/* Buttons */}
                            {selectedNode.data?.buttons?.length > 0 && (
                                <div className="mt-2 space-y-1 border-t border-gray-100 pt-2">
                                    {selectedNode.data.buttons.map((btn: any, i: number) => (
                                        <div key={i} className="text-center text-[11px] font-bold text-blue-600 border border-blue-100 rounded-lg py-1">
                                            {btn.title || 'Button'}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* List items */}
                            {selectedNode.type === 'list' && (
                                <div className="mt-2 border-t border-gray-100 pt-2 text-center">
                                    <div className="text-[11px] font-bold text-blue-600 border border-blue-100 rounded-lg py-1">
                                        {selectedNode.data?.buttonText || '☰ Open Menu'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
                <p className="text-[9px] text-gray-400 font-bold">Changes apply to canvas in real-time</p>
            </div>
        </aside>
    );
}
