"use client";

import { useState, useEffect } from "react";
import { CreditCard, Save, ShieldCheck, AlertCircle, RefreshCw, Zap, Key } from "lucide-react";

export default function SuperAdminPaymentSettings() {
    const [gateways, setGateways] = useState([
        { provider: "Razorpay", key_id: "", key_secret: "", is_live: false, is_active: true }
    ]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/super-admin/finance/payment")
            .then(res => res.json())
            .then(data => {
                if (data.gateways && Array.isArray(data.gateways) && data.gateways.length > 0) {
                    setGateways(data.gateways);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/super-admin/finance/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gateways })
            });

            if (res.ok) {
                alert("Master Payment Gateway settings updated successfully.");
            } else {
                alert("Failed to save settings.");
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("Error saving settings.");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = (index: number, field: string, value: any) => {
        const newGateways = [...gateways];
        newGateways[index] = { ...newGateways[index], [field]: value };
        setGateways(newGateways);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <RefreshCw className="animate-spin text-slate-300" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-fade-in">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center">
                        <CreditCard className="text-emerald-400" size={24} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Master Payment Gateway</h1>
                </div>
                <p className="text-slate-500 font-medium ml-15">Configure the global Razorpay keys used to collect Escrow Top-Ups and Wholesale License fees from Partners.</p>
            </header>

            <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden p-10 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-[#27954D]" size={20} />
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Razorpay Integration</h3>
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                        <Zap size={14} /> Active
                    </div>
                </div>

                <div className="space-y-6">
                    {gateways.map((gw, index) => (
                        <div key={index} className="space-y-6 bg-slate-50 p-8 rounded-[32px] border border-slate-100 group">

                            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    <Key className="text-slate-400" size={20} />
                                    {gw.provider} Credentials
                                </h4>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Mode</span>
                                    <button
                                        onClick={() => handleUpdate(index, "is_live", !gw.is_live)}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${gw.is_live ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'}`}
                                    >
                                        <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Key ID</label>
                                    <input
                                        type="text"
                                        value={gw.key_id}
                                        onChange={(e) => handleUpdate(index, "key_id", e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all font-mono"
                                        placeholder="rzp_test_..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Key Secret</label>
                                    <input
                                        type="password"
                                        value={gw.key_secret}
                                        onChange={(e) => handleUpdate(index, "key_secret", e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all font-mono"
                                        placeholder="Enter Razorpay Secret Key"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                    <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h5 className="text-sm font-black text-slate-900 uppercase">Critical Infrastructure</h5>
                        <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                            These keys govern the absolute flow of funds from Partners into your Super Admin bank account. Ensure Live Mode is toggled ON when providing production keys.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-xl disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                        {saving ? "Saving Protocol..." : "Deploy Master Keys"}
                    </button>
                </div>
            </section>
        </div>
    );
}
