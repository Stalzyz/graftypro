"use client";
import React, { useState, useEffect } from 'react';
import { CreditCard, Key, ShieldCheck, Loader2, Link as LinkIcon, RefreshCcw } from 'lucide-react';

export default function PartnerBillingSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [providers, setProviders] = useState<any[]>([]);

    // State for the primary gateway form
    const [providerType, setProviderType] = useState('Razorpay');
    const [keyId, setKeyId] = useState('');
    const [keySecret, setKeySecret] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/reseller/me");
            const data = await res.json();
            if (data?.data?.payment_gateways) {
                const gateways = typeof data.data.payment_gateways === 'string'
                    ? JSON.parse(data.data.payment_gateways)
                    : data.data.payment_gateways;

                setProviders(gateways);

                // Load first Razorpay config if present
                const rz = gateways.find((g: any) => g.provider === 'Razorpay');
                if (rz) {
                    setProviderType('Razorpay');
                    setKeyId(rz.key_id || '');
                    setKeySecret(rz.key_secret || '');
                }
            }
        } catch (error) {
            console.error("Failed to load gateways", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Build the updated gateways array
            const newGateways = [{
                provider: providerType,
                key_id: keyId,
                key_secret: keySecret,
                is_live: true,
                is_active: true
            }];

            const res = await fetch("/api/reseller/settings/billing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payment_gateways: newGateways })
            });

            if (res.ok) {
                alert("Payment Gateway Verified & Saved");
                fetchSettings();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to save gateway");
            }
        } catch (error) {
            alert("Network Error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
    );

    const hasActiveGateway = providers.length > 0 && keyId.length > 5;

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase mb-2">Commerce Matrix</h1>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Connect your settlement engine to collect 100% of retail revenue directly.</p>
            </div>

            {hasActiveGateway ? (
                <div className="p-8 bg-emerald-50 border-2 border-[#27954D] rounded-[2.5rem] flex items-center justify-between shadow-lg shadow-emerald-500/10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#27954D] text-white rounded-3xl flex items-center justify-center shadow-inner">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Checkout Engine Live</h3>
                            <p className="text-[10px] text-[#27954D] font-bold uppercase tracking-widest mt-1">
                                {providerType} Keys Authenticated & Routing Retail Profit
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-8 bg-amber-50 border-2 border-amber-200 rounded-[2.5rem] flex items-center gap-6 shadow-sm">
                    <div className="w-16 h-16 bg-amber-500 text-white rounded-3xl flex items-center justify-center shadow-inner">
                        <CreditCard size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Action Required: No Settlement Engine</h3>
                        <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest mt-1">
                            Vendors cannot purchase your subscriptions until you connect a payment gateway.
                        </p>
                    </div>
                </div>
            )}

            {/* Gateway Configuration */}
            <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />

                <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-4 border-b border-slate-100 pb-8">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                            <LinkIcon size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Provider Integration</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Routing logic for public checkout links</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block mb-3">Merchant Provider</label>
                            <div className="flex gap-4">
                                <button className="flex-1 p-5 rounded-2xl border-2 border-[#27954D] bg-emerald-50 text-[#27954D] font-black uppercase tracking-widest flex items-center justify-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#27954D] animate-pulse" />
                                    Razorpay (India)
                                </button>
                                <button className="flex-1 p-5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-400 font-black uppercase tracking-widest opacity-50 cursor-not-allowed">
                                    Stripe (Coming Soon)
                                </button>
                            </div>
                        </div>

                        <div className="col-span-2 space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block">Razorpay Key ID (Live)</label>
                            <div className="relative">
                                <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={keyId}
                                    onChange={e => setKeyId(e.target.value)}
                                    placeholder="rzp_live_abc123..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-16 pr-6 py-5 text-slate-900 focus:border-[#27954D] focus:bg-white outline-none transition-all font-black tracking-widest placeholder:text-slate-300 placeholder:font-normal"
                                />
                            </div>
                        </div>

                        <div className="col-span-2 space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block">Razorpay Key Secret (Live)</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    value={keySecret}
                                    onChange={e => setKeySecret(e.target.value)}
                                    placeholder="••••••••••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-16 pr-6 py-5 text-slate-900 focus:border-[#27954D] focus:bg-white outline-none transition-all font-black tracking-widest placeholder:text-slate-300 placeholder:font-normal"
                                />
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-2 italic">
                                Used to sign webhooks and verify payment signatures post-checkout. Stored securely.
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving || !keyId || !keySecret}
                            className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-[2rem] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <>Commit Vault Credentials <RefreshCcw size={16} /></>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Escrow Disclaimer */}
            <div className="p-6 bg-slate-900 rounded-[2rem] flex items-center gap-4">
                <ShieldCheck size={24} className="text-[#27954D] flex-shrink-0" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] leading-relaxed">
                    <strong className="text-white">Escrow routing active.</strong> 100% of the retail price collected via this gateway will be deposited directly to your bank account. Upon successful authorization, Grafty will autonomously deduct the <strong className="text-white">Wholesale Cost</strong> mapping from your pre-paid Escrow Wallet.
                </p>
            </div>
        </div>
    );
}
