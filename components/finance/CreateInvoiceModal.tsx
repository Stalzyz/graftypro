
import { useState } from "react";
import { X, Plus, Trash2, Save, FileText } from "lucide-react";

export function CreateInvoiceModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        billing_name: "",
        billing_gstin: "",
        billing_state: "Karnataka", // Default
        items: [{ description: "", hsn_code: "998311", quantity: 1, rate: 0 }],
        transaction_id: ""
    });

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: "", hsn_code: "998311", quantity: 1, rate: 0 }]
        });
    };

    const removeItem = (index: number) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        (newItems[index] as any)[field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/super-admin/finance/invoices/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                onSuccess();
            } else {
                alert(data.error || "Failed to create invoice");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[30px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <FileText size={20} className="text-indigo-600" />
                        New Invoice
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Customer Details */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Customer Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                placeholder="Customer Name *"
                                className="p-3 bg-slate-50 rounded-xl outline-none font-bold text-sm"
                                value={formData.billing_name}
                                onChange={e => setFormData({ ...formData, billing_name: e.target.value })}
                                required
                            />
                            <input
                                placeholder="GSTIN (Optional)"
                                className="p-3 bg-slate-50 rounded-xl outline-none font-bold text-sm uppercase"
                                value={formData.billing_gstin}
                                onChange={e => setFormData({ ...formData, billing_gstin: e.target.value })}
                            />
                        </div>
                        <select
                            className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold text-sm"
                            value={formData.billing_state}
                            onChange={e => setFormData({ ...formData, billing_state: e.target.value })}
                        >
                            <option value="Karnataka">Karnataka</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Telangana">Telangana</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                            <option value="Gujarat">Gujarat</option>
                            <option value="West Bengal">West Bengal</option>
                            <option value="Kerala">Kerala</option>
                            {/* Add more states as needed */}
                        </select>
                        <input
                            placeholder="Transaction / Reference ID (Optional)"
                            className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold text-sm"
                            value={formData.transaction_id}
                            onChange={e => setFormData({ ...formData, transaction_id: e.target.value })}
                        />
                    </div>

                    {/* Line Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Line Items</h3>
                            <button type="button" onClick={addItem} className="text-xs font-bold text-indigo-600 hover:underline">+ Add Item</button>
                        </div>

                        {formData.items.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-start">
                                <div className="flex-1 space-y-2">
                                    <input
                                        placeholder="Description"
                                        className="w-full p-2 bg-slate-50 rounded-lg outline-none font-medium text-xs"
                                        value={item.description}
                                        onChange={e => updateItem(idx, 'description', e.target.value)}
                                        required
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            placeholder="HSN"
                                            className="w-1/3 p-2 bg-slate-50 rounded-lg outline-none font-medium text-xs"
                                            value={item.hsn_code}
                                            onChange={e => updateItem(idx, 'hsn_code', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Qty"
                                            className="w-1/4 p-2 bg-slate-50 rounded-lg outline-none font-medium text-xs"
                                            value={item.quantity}
                                            onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value))}
                                            min="1"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Rate"
                                            className="w-1/3 p-2 bg-slate-50 rounded-lg outline-none font-medium text-xs"
                                            value={item.rate}
                                            onChange={e => updateItem(idx, 'rate', parseFloat(e.target.value))}
                                            min="0"
                                        />
                                    </div>
                                </div>
                                {formData.items.length > 1 && (
                                    <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-400 hover:text-red-600">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Generate Invoice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
