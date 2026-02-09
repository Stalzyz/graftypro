"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function FlowPropertiesPanel({ selectedNode, onChange, onClose }: any) {
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

    // Payment Data
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("INR");
    const [paymentTitle, setPaymentTitle] = useState("");

    // Meta Flow Data
    const [metaFlowId, setMetaFlowId] = useState("");
    const [metaFlowCTA, setMetaFlowCTA] = useState("Open Form");
    const [metaFlowHeader, setMetaFlowHeader] = useState("");
    const [metaFlowFooter, setMetaFlowFooter] = useState("");

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

    // List Node Data
    const [headerUrl, setHeaderUrl] = useState("");

    useEffect(() => {
        if (selectedNode) {
            setLabel(selectedNode.data.label || "Node");
            setContent(selectedNode.data.text || "");

            if (selectedNode.type === 'action') {
                setActionType(selectedNode.data.actionType || "start_drip");
                setDripId(selectedNode.data.dripId || "");
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
                fetch('/api/products').then(r => r.json()).then(res => setProducts(res.data || []));
            }

            if (selectedNode.type === 'payment') {
                setAmount(selectedNode.data.amount || "0");
                setCurrency(selectedNode.data.currency || "INR");
                setPaymentTitle(selectedNode.data.paymentTitle || "Pay Now");
            }

            if (selectedNode.type === 'meta_flow') {
                setMetaFlowId(selectedNode.data.flowId || "");
                setMetaFlowCTA(selectedNode.data.flowCTA || "Open Form");
                setMetaFlowHeader(selectedNode.data.flowHeader || "");
                setMetaFlowFooter(selectedNode.data.flowFooter || "");
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
        }

        onChange(selectedNode.id, newData);
    };

    if (!selectedNode) return null;

    return (
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-xl z-10 transition-transform">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-800">Edit Node</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Node Type</label>
                    <div className="px-3 py-2 bg-gray-100 rounded text-sm font-medium text-gray-700 capitalize">
                        {selectedNode.type}
                    </div>
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

                {(selectedNode.type === 'message' || selectedNode.type === 'start') && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                            <select
                                value={contentType}
                                onChange={(e) => handleUpdate("contentType", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
                            >
                                <option value="TEXT">Text Only</option>
                                <option value="IMAGE">Image + Text</option>
                                <option value="VIDEO">Video + Text</option>
                                <option value="DOCUMENT">Document</option>
                                <option value="VOICE">Voice Note</option>
                            </select>
                        </div>

                        {contentType !== 'TEXT' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Media URL</label>
                                <input
                                    type="text"
                                    value={mediaUrl}
                                    onChange={(e) => handleUpdate("mediaUrl", e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
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
                                <label className="block text-xs font-semibold text-gray-500 uppercase">Interactive Buttons</label>
                                <button
                                    onClick={() => {
                                        const newButtons = [...buttons, { id: Math.random().toString(36).substr(2, 9), title: 'New Button', type: 'reply' }];
                                        setButtons(newButtons);
                                        onChange(selectedNode.id, { ...selectedNode.data, buttons: newButtons });
                                    }}
                                    className="text-[10px] font-black text-blue-600 uppercase hover:underline"
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
                                                <option value="call">Call</option>
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
                                                placeholder={btn.type === 'url' ? "https://..." : "+1234..."}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                        <select
                            value={productId}
                            onChange={(e) => handleUpdate("productId", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
                        >
                            <option value="">Choose a product...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-400 mt-2">
                            The bot will send this product as an interactive message.
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
                        <p className="text-xs text-gray-400">
                            The bot will generate a secure payment link via Razorpay/Stripe and send it to the user.
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
                        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                            <h4 className="text-sm font-black text-indigo-900 mb-2 tracking-tight">Structured Data Collection</h4>
                            <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                                Launches a native WhatsApp form. Captured data is auto-mapped to CRM Contact Attributes.
                            </p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Meta Flow ID</label>
                            <input
                                type="text"
                                value={metaFlowId}
                                onChange={(e) => handleUpdate("metaFlowId", e.target.value)}
                                placeholder="e.g. 1234567890"
                                className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">CTA Button Text</label>
                            <input
                                type="text"
                                value={metaFlowCTA}
                                onChange={(e) => handleUpdate("metaFlowCTA", e.target.value)}
                                placeholder="e.g. Book Survey"
                                className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Header (Optional)</label>
                            <input
                                type="text"
                                value={metaFlowHeader}
                                onChange={(e) => handleUpdate("metaFlowHeader", e.target.value)}
                                className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Body Message</label>
                            <textarea
                                value={content}
                                onChange={(e) => handleUpdate("content", e.target.value)}
                                rows={4}
                                className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Footer (Optional)</label>
                            <input
                                type="text"
                                value={metaFlowFooter}
                                onChange={(e) => handleUpdate("metaFlowFooter", e.target.value)}
                                className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                            />
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

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Button Text</label>
                                <input
                                    type="text"
                                    value={listBtnText}
                                    onChange={(e) => handleUpdate("listBtnText", e.target.value)}
                                    placeholder="e.g. View Options"
                                    className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-fuchsia-100 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Section Title</label>
                                <input
                                    type="text"
                                    value={sectionTitle}
                                    onChange={(e) => handleUpdate("sectionTitle", e.target.value)}
                                    placeholder="e.g. Main Menu"
                                    className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-fuchsia-100 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2 px-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Menu Items</label>
                                <button
                                    onClick={() => handleUpdateListItems([...listItems, { id: Math.random().toString(36).substr(2, 9), title: 'New Option', description: '' }])}
                                    className="text-[10px] font-black text-fuchsia-600 uppercase hover:underline"
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
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Success Path
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium">Followed after successful slot booking.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-center text-gray-400">
                Changes are auto-saved to canvas
            </div>
        </aside>
    );
}
