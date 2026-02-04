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
        }
    }, [selectedNode]);

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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => handleUpdate("content", e.target.value)}
                            rows={6}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Hello, how can I help you?"
                        />
                        <p className="text-xs text-gray-400 mt-2">Supports basic text formatting.</p>
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
                                    onChange={(e) => handleUpdate("dripId", e.target.value)}
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
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-center text-gray-400">
                Changes are auto-saved to canvas
            </div>
        </aside>
    );
}
