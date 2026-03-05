"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Receipt,
    ArrowLeft,
    Building2,
    Plus,
    Trash2,
    Save,
    Calculator,
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard
} from "lucide-react";

export default function SuperAdminCreateInvoice() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [workspaceId, setWorkspaceId] = useState("");
    const [billingDetails, setBillingDetails] = useState({
        name: "",
        address: "",
        state: "Karnataka",
        pincode: "",
        gstin: "",
        email: "",
        phone: ""
    });

    const [items, setItems] = useState([
        { description: "Pro Plan Subscription", hsn_code: "998311", quantity: 1, rate: 1000, taxable_value: 1000 }
    ]);

    const [paymentMethod, setPaymentMethod] = useState("Manual");
    const [paymentId, setPaymentId] = useState("");
    const [status, setStatus] = useState("PAID");
    const [notes, setNotes] = useState("");

    const addItem = () => {
        setItems([...items, { description: "", hsn_code: "998311", quantity: 1, rate: 0, taxable_value: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length === 1) return;
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        if (field === "quantity" || field === "rate") {
            const qty = field === "quantity" ? Number(value) : Number(newItems[index].quantity);
            const rate = field === "rate" ? Number(value) : Number(newItems[index].rate);
            newItems[index].taxable_value = qty * rate;
        }
        setItems(newItems);
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (Number(item.taxable_value) || 0), 0);
    };

    const calculateGST = () => calculateSubtotal() * 0.18;
    const calculateTotal = () => calculateSubtotal() + calculateGST();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!workspaceId) return alert("Please Provide Workspace ID");

        setLoading(true);
        try {
            const res = await fetch("/api/super-admin/finance/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    workspaceId,
                    items,
                    billingDetails,
                    paymentMethod,
                    paymentId,
                    status,
                    notes
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Generation failed");
            }

            alert("Invoice Generated & Email Dispatched Successfully!");
            router.push("/super-admin/dashboard/finance/invoices");
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl space-y-12 pb-20">
            <header className="flex items-center gap-6">
                <button
                    onClick={() => router.back()}
                    className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                            <Receipt className="text-white" size={16} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Issue New Invoice</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">System Override: Manual Fiscal Record Generation.</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Target Entity */}
                <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 space-y-8">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                            <Building2 size={20} />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest text-xs">Target Workspace</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Workspace ID</label>
                            <input
                                required
                                value={workspaceId}
                                onChange={e => setWorkspaceId(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-50 transition-all"
                                placeholder="e.g., ws_abc123"
                            />
                        </div>
                        <div className="flex items-end pb-2">
                            <p className="text-[10px] text-slate-400 italic">Enter the unique identifier of the workspace receiving this invoice.</p>
                        </div>
                    </div>
                </section>

                {/* Section 2: Billing Details */}
                <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 space-y-8">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest text-xs">Customer Billing Info</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Billing Name</label>
                            <div className="relative">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input required value={billingDetails.name} onChange={e => setBillingDetails({ ...billingDetails, name: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 font-bold text-slate-900" placeholder="Organization or Individual Name" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input required type="email" value={billingDetails.email} onChange={e => setBillingDetails({ ...billingDetails, email: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 font-bold text-slate-900" placeholder="billing@client.com" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input value={billingDetails.phone} onChange={e => setBillingDetails({ ...billingDetails, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 font-bold text-slate-900" placeholder="+91 00000 00000" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">GSTIN Number</label>
                            <input value={billingDetails.gstin} onChange={e => setBillingDetails({ ...billingDetails, gstin: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900" placeholder="Optional GSTIN" />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Billing Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-6 top-5 text-slate-300" size={16} />
                                <textarea required value={billingDetails.address} onChange={e => setBillingDetails({ ...billingDetails, address: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 font-bold text-slate-900 h-24 resize-none" placeholder="Enter complete billing address..." />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">State</label>
                            <input required value={billingDetails.state} onChange={e => setBillingDetails({ ...billingDetails, state: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900" placeholder="e.g., Karnataka" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Pincode</label>
                            <input required value={billingDetails.pincode} onChange={e => setBillingDetails({ ...billingDetails, pincode: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900" placeholder="000000" />
                        </div>
                    </div>
                </section>

                {/* Section 3: Itemization */}
                <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                                <Calculator size={20} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest text-xs">Revenue Items</h2>
                        </div>
                        <button type="button" onClick={addItem} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all">
                            <Plus size={12} /> Add Row
                        </button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-4 items-end bg-slate-50/50 p-6 rounded-3xl relative group">
                                <div className="col-span-12 md:col-span-5 space-y-2">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Description</label>
                                    <input required value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" />
                                </div>
                                <div className="col-span-4 md:col-span-2 space-y-2">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest">HSN</label>
                                    <input value={item.hsn_code} onChange={e => updateItem(idx, 'hsn_code', e.target.value)} className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" />
                                </div>
                                <div className="col-span-4 md:col-span-1 space-y-2">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Qty</label>
                                    <input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" />
                                </div>
                                <div className="col-span-4 md:col-span-2 space-y-2">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Rate (₹)</label>
                                    <input type="number" value={item.rate} onChange={e => updateItem(idx, 'rate', e.target.value)} className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" />
                                </div>
                                <div className="col-span-10 md:col-span-1 flex flex-col items-end pb-3">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Total</span>
                                    <span className="text-sm font-black text-slate-900">₹{item.taxable_value}</span>
                                </div>
                                <div className="col-span-2 md:col-span-1 flex justify-center pb-2">
                                    <button onClick={() => removeItem(idx)} type="button" className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col items-end space-y-3 pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-10">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sub-Total</span>
                            <span className="text-xl font-bold text-slate-500">₹{calculateSubtotal().toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-10">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">GST (18%)</span>
                            <span className="text-xl font-bold text-slate-500">₹{calculateGST().toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-10 pt-4 border-t border-slate-200">
                            <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Grand Total</span>
                            <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{calculateTotal().toLocaleString()}</span>
                        </div>
                    </div>
                </section>

                {/* Section 4: Settlement */}
                <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 space-y-8">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                            <CreditCard size={20} />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest text-xs">Payment & Status</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Collection Method</label>
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none">
                                <option value="Manual">Manual Settlement</option>
                                <option value="Bank Transfer">Wire Transfer</option>
                                <option value="UPI">UPI Payload</option>
                                <option value="Razorpay">Live Gateway</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identifier / Ref</label>
                            <input value={paymentId} onChange={e => setPaymentId(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none" placeholder="TXN-XXXXXX" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fiscal Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value)} className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none ${status === 'PAID' ? 'text-green-600' : 'text-orange-500'}`}>
                                <option value="PAID">Settled (Paid)</option>
                                <option value="PENDING">Outstanding (Pending)</option>
                            </select>
                        </div>

                        <div className="md:col-span-3 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Remarks</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 h-20 resize-none" placeholder="Internal notes (not visible on PDF)..." />
                        </div>
                    </div>
                </section>

                <div className="flex gap-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 px-8 py-6 bg-white border border-slate-100 text-slate-400 rounded-[30px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        Cancel Protocol
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] px-8 py-6 bg-slate-900 text-white rounded-[30px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? "Initializing Ledger..." : (
                            <>
                                <Save size={16} /> Generate & Dispatch Invoice
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
