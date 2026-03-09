"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, CreditCard, ShieldCheck, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function PaymentSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Razorpay State
    const [razorpayKey, setRazorpayKey] = useState("");
    const [razorpaySecret, setRazorpaySecret] = useState("");
    const [razorpayActive, setRazorpayActive] = useState(false);

    // PhonePe State
    const [phonepeMerchantId, setPhonepeMerchantId] = useState("");
    const [phonepeSaltKey, setPhonepeSaltKey] = useState("");
    const [phonepeSaltIndex, setPhonepeSaltIndex] = useState("");
    const [phonepeActive, setPhonepeActive] = useState(false);

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            const res = await fetch("/api/settings/integrations");
            const data = await res.json();
            if (data.data) {
                const rp = data.data.find((i: any) => i.type === "RAZORPAY");
                if (rp) {
                    setRazorpayKey(rp.credentials.key_id || "");
                    setRazorpaySecret(rp.credentials.key_secret || "");
                    setRazorpayActive(rp.is_active);
                }
                const pp = data.data.find((i: any) => i.type === "PHONEPE");
                if (pp) {
                    setPhonepeMerchantId(pp.credentials.merchant_id || "");
                    setPhonepeSaltKey(pp.credentials.salt_key || "");
                    setPhonepeSaltIndex(pp.credentials.salt_index || "");
                    setPhonepeActive(pp.is_active);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRazorpay = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/settings/integrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "RAZORPAY",
                    credentials: {
                        key_id: razorpayKey,
                        key_secret: razorpaySecret
                    }
                })
            });
            if (res.ok) {
                alert("Razorpay Settings Saved!");
                setRazorpayActive(true);
            } else {
                alert("Failed to save settings");
            }
        } catch (e) {
            alert("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    const handleSavePhonepe = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/settings/integrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "PHONEPE",
                    credentials: {
                        merchant_id: phonepeMerchantId,
                        salt_key: phonepeSaltKey,
                        salt_index: phonepeSaltIndex
                    }
                })
            });
            if (res.ok) {
                alert("PhonePe Settings Saved!");
                setPhonepeActive(true);
            } else {
                alert("Failed to save settings");
            }
        } catch (e) {
            alert("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/settings" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment Gateways</h1>
                    <p className="text-gray-500">Enable payments in your chatbot flows.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Razorpay Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Razorpay Integration</h3>
                                <p className="text-xs text-gray-500">Collect payments via UPI, Cards, and Netbanking.</p>
                            </div>
                        </div>
                        {razorpayActive && (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                                <ShieldCheck size={12} /> Connected
                            </span>
                        )}
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Key ID</label>
                                <input
                                    type="text"
                                    value={razorpayKey}
                                    onChange={e => setRazorpayKey(e.target.value)}
                                    placeholder="rzp_live_..."
                                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Key Secret</label>
                                <input
                                    type="password"
                                    value={razorpaySecret}
                                    onChange={e => setRazorpaySecret(e.target.value)}
                                    placeholder="••••••••••••••"
                                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start">
                            <ExternalLink size={18} className="text-blue-600 mt-1 shrink-0" />
                            <div className="text-xs text-blue-700 leading-relaxed">
                                <p className="font-bold mb-1">How to get these keys?</p>
                                Login to your <a href="https://dashboard.razorpay.com" target="_blank" className="underline font-bold">Razorpay Dashboard</a>, go to <b>Settings &gt; API Keys</b> and generate a new key pair. Grafty uses these to create secure payment links for your customers.
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={handleSaveRazorpay}
                                disabled={saving || !razorpayKey || !razorpaySecret}
                                className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                <Save size={18} />
                                {saving ? "Saving..." : "Save Configuration"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* PhonePe Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-8">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">PhonePe Integration</h3>
                                <p className="text-xs text-gray-500">Collect payments securely in India via UPI and Cards.</p>
                            </div>
                        </div>
                        {phonepeActive && (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                                <ShieldCheck size={12} /> Connected
                            </span>
                        )}
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Merchant ID</label>
                                <input
                                    type="text"
                                    value={phonepeMerchantId}
                                    onChange={e => setPhonepeMerchantId(e.target.value)}
                                    placeholder="PGTESTPAYUAT..."
                                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Salt Key</label>
                                <input
                                    type="password"
                                    value={phonepeSaltKey}
                                    onChange={e => setPhonepeSaltKey(e.target.value)}
                                    placeholder="•••••••••••••••••••••"
                                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Salt Index</label>
                                <input
                                    type="text"
                                    value={phonepeSaltIndex}
                                    onChange={e => setPhonepeSaltIndex(e.target.value)}
                                    placeholder="1"
                                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="bg-indigo-50 p-4 rounded-xl flex gap-3 items-start">
                            <ExternalLink size={18} className="text-indigo-600 mt-1 shrink-0" />
                            <div className="text-xs text-indigo-700 leading-relaxed">
                                <p className="font-bold mb-1">Getting PhonePe Credentials</p>
                                Access your <a href="https://business.phonepe.com/" target="_blank" className="underline font-bold">PhonePe Business Dashboard</a> to generate production API keys. Grafty will use these to create secure payment links directly inside your WhatsApp flows.
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={handleSavePhonepe}
                                disabled={saving || !phonepeMerchantId || !phonepeSaltKey || !phonepeSaltIndex}
                                className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                <Save size={18} />
                                {saving ? "Saving..." : "Save Configuration"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
