"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // For back navigation

export default function CreateInvoicePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [billingDetails, setBillingDetails] = useState({
        name: "",
        address: "",
        state: "Karnataka", // Default
        pincode: "",
        gstin: "",
        email: "",
        phone: ""
    });

    const [items, setItems] = useState([
        { description: "", hsn_code: "", quantity: 1, rate: 0, taxable_value: 0 }
    ]);

    const [paymentMethod, setPaymentMethod] = useState("Manual");
    const [paymentId, setPaymentId] = useState("");
    const [status, setStatus] = useState("PAID");

    const addItem = () => {
        setItems([...items, { description: "", hsn_code: "", quantity: 1, rate: 0, taxable_value: 0 }]);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        // Auto-calc taxable if rate/qty changes
        if (field === "quantity" || field === "rate") {
            const qty = field === "quantity" ? Number(value) : Number(newItems[index].quantity);
            const rate = field === "rate" ? Number(value) : Number(newItems[index].rate);
            newItems[index].taxable_value = qty * rate;
        }
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (Number(item.taxable_value) || 0), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/finance/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items,
                    billingDetails,
                    paymentMethod,
                    paymentId: paymentId || `MANUAL-${Date.now()}`, // Auto-generate if empty
                    status
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Access toast via global or simpler alert for MVP if toast not avail
            alert("Invoice Created Successfully! Check email.");
            // router.push("/dashboard/finance/invoices"); 
        } catch (err: any) {
            console.error(err);
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold">Create New Invoice</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow border">
                {/* 1. Customer Details */}
                <div className="grid grid-cols-2 gap-4">
                    <h2 className="col-span-2 text-lg font-semibold border-b pb-2">Customer Details</h2>

                    <input
                        className="border p-2 rounded"
                        placeholder="Customer Name"
                        required
                        value={billingDetails.name}
                        onChange={e => setBillingDetails({ ...billingDetails, name: e.target.value })}
                    />
                    <input
                        className="border p-2 rounded"
                        placeholder="Email"
                        required
                        type="email"
                        value={billingDetails.email}
                        onChange={e => setBillingDetails({ ...billingDetails, email: e.target.value })}
                    />
                    <input
                        className="border p-2 rounded"
                        placeholder="Phone"
                        value={billingDetails.phone}
                        onChange={e => setBillingDetails({ ...billingDetails, phone: e.target.value })}
                    />
                    <input
                        className="border p-2 rounded"
                        placeholder="GSTIN (Optional)"
                        value={billingDetails.gstin}
                        onChange={e => setBillingDetails({ ...billingDetails, gstin: e.target.value })}
                    />
                    <input
                        className="border p-2 rounded col-span-2"
                        placeholder="Full Address"
                        required
                        value={billingDetails.address}
                        onChange={e => setBillingDetails({ ...billingDetails, address: e.target.value })}
                    />
                    <input
                        className="border p-2 rounded"
                        placeholder="State"
                        required
                        value={billingDetails.state}
                        onChange={e => setBillingDetails({ ...billingDetails, state: e.target.value })}
                    />
                    <input
                        className="border p-2 rounded"
                        placeholder="Pincode"
                        required
                        value={billingDetails.pincode}
                        onChange={e => setBillingDetails({ ...billingDetails, pincode: e.target.value })}
                    />
                </div>

                {/* 2. Items */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b pb-2">Line Items</h2>
                    {items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                            <input
                                className="col-span-4 border p-2 rounded"
                                placeholder="Description"
                                required
                                value={item.description}
                                onChange={e => updateItem(index, 'description', e.target.value)}
                            />
                            <input
                                className="col-span-2 border p-2 rounded"
                                placeholder="HSN (Optional)"
                                value={item.hsn_code}
                                onChange={e => updateItem(index, 'hsn_code', e.target.value)}
                            />
                            <input
                                className="col-span-1 border p-2 rounded"
                                type="number"
                                min="1"
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={e => updateItem(index, 'quantity', e.target.value)}
                            />
                            <input
                                className="col-span-2 border p-2 rounded"
                                type="number"
                                min="0" step="0.01"
                                placeholder="Rate"
                                value={item.rate}
                                onChange={e => updateItem(index, 'rate', e.target.value)}
                            />
                            <div className="col-span-2 font-mono text-right p-2 bg-gray-50 rounded">
                                {(item.taxable_value).toFixed(2)}
                            </div>
                            <button type="button" onClick={() => removeItem(index)} className="col-span-1 text-red-500 font-bold hover:text-red-700">X</button>
                        </div>
                    ))}
                    <button type="button" onClick={addItem} className="text-blue-600 font-semibold">+ Add Item</button>

                    <div className="text-right font-bold text-xl mt-4">
                        Total Taxable: ₹{calculateTotal().toFixed(2)}
                        <p className="text-sm text-gray-500 font-normal">+ 18% GST (Auto-calculated)</p>
                    </div>
                </div>

                {/* 3. Payment */}
                <div className="grid grid-cols-3 gap-4">
                    <h2 className="col-span-3 text-lg font-semibold border-b pb-2">Payment Details</h2>
                    <select
                        className="border p-2 rounded"
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                    >
                        <option value="Manual">Manual / Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                        <option value="UPI">UPI</option>
                        <option value="Credit Card">Credit Card</option>
                    </select>

                    <input
                        className="border p-2 rounded"
                        placeholder="Transaction ID / Ref"
                        value={paymentId}
                        onChange={e => setPaymentId(e.target.value)}
                    />

                    <select
                        className="border p-2 rounded"
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                    >
                        <option value="PAID">Paid</option>
                        <option value="PENDING">Pending</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition"
                >
                    {loading ? "Generating Invoice..." : "Create Invoice & Send Email"}
                </button>
            </form>
        </div>
    );
}
