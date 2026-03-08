"use client";
import React, { useState, useEffect } from 'react';
import { CreditCard, Key, ShieldCheck, Loader2, Link as LinkIcon, RefreshCcw } from 'lucide-react';
import Script from 'next/script';

export default function PartnerBillingSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [providers, setProviders] = useState<any[]>([]);

    // State for the primary gateway form
    const [providerType, setProviderType] = useState('Razorpay');
    const [keyId, setKeyId] = useState('');
    const [keySecret, setKeySecret] = useState('');
    const [merchantId, setMerchantId] = useState('');
    const [saltKey, setSaltKey] = useState('');
    const [saltIndex, setSaltIndex] = useState('');

    // State for Test Net Wallet Top Up
    const [topUpAmount, setTopUpAmount] = useState<number | ''>('');
    const [toppingUp, setToppingUp] = useState(false);
    const [walletBal, setWalletBal] = useState(0);

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

                // Load config based on current selection or first available
                const rz = gateways.find((g: any) => g.provider === 'Razorpay');
                if (rz) {
                    setKeyId(rz.key_id || '');
                    setKeySecret(rz.key_secret || '');
                }
                const pp = gateways.find((g: any) => g.provider === 'PhonePe');
                if (pp) {
                    setMerchantId(pp.merchant_id || '');
                    setSaltKey(pp.salt_key || '');
                    setSaltIndex(pp.salt_index || '');
                }

                if (gateways.length > 0) {
                    setProviderType(gateways[0].provider || 'Razorpay');
                }
            }
            if (data.data?.wallet_balance !== undefined) {
                setWalletBal(Number(data.data.wallet_balance));
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
            const newGateways = providers.filter(g => g.provider !== providerType);

            const currentConfig: any = {
                provider: providerType,
                is_live: true,
                is_active: true
            };

            if (providerType === 'Razorpay') {
                currentConfig.key_id = keyId;
                currentConfig.key_secret = keySecret;
            } else if (providerType === 'PhonePe') {
                currentConfig.merchant_id = merchantId;
                currentConfig.salt_key = saltKey;
                currentConfig.salt_index = saltIndex;
            }

            newGateways.push(currentConfig);

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

    const handleTopUp = async () => {
        if (!topUpAmount || typeof topUpAmount !== 'number') return;
        setToppingUp(true);
        try {
            // 1. Generate Razorpay Order
            const generateRes = await fetch("/api/reseller/wallet/topup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: topUpAmount })
            });

            const genData = await generateRes.json();
            if (!generateRes.ok || !genData.success) {
                alert(genData.error || "Failed to initiate top-up");
                setToppingUp(false);
                return;
            }

            // 2. Open Razorpay Checkout Modal
            const options = {
                key: genData.order.razorpay_key,
                amount: genData.order.amount,
                currency: genData.order.currency,
                name: "Grafty Master Deposit",
                description: `Escrow Top-Up (₹${topUpAmount})`,
                order_id: genData.order.id,
                handler: async function (response: any) {
                    // 3. Verify Payment Signature
                    const verifyRes = await fetch("/api/reseller/wallet/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: topUpAmount,
                        })
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyRes.ok && verifyData.success) {
                        setWalletBal(verifyData.balance);
                        setTopUpAmount('');
                        alert(`Successfully added ₹${topUpAmount} to your Escrow Wallet!`);
                    } else {
                        alert("Payment Verification Failed. Contact support if debited.");
                    }
                },
                theme: { color: "#27954D" }
            };

            const rzp = new (window as any).Razorpay(options);

            rzp.on('payment.failed', function (response: any) {
                console.error(response.error);
                alert("Payment failed: " + response.error.description);
            });

            rzp.open();

        } catch (error) {
            alert("Network Error generating order");
            console.error(error);
        } finally {
            setToppingUp(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
    );

    const activeGateway = providers.find(g => g.is_active);
    const hasActiveGateway = !!activeGateway;

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
            {/* Load Razorpay Script dynamically */}
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

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
                                {activeGateway?.provider} Keys Authenticated & Routing Retail Profit
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
                                <button
                                    onClick={() => setProviderType('Razorpay')}
                                    className={`flex-1 p-5 rounded-2xl border-2 transition-all font-black uppercase tracking-widest flex items-center justify-center gap-3 ${providerType === 'Razorpay' ? 'border-[#27954D] bg-emerald-50 text-[#27954D]' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                                >
                                    {providerType === 'Razorpay' && <div className="w-2 h-2 rounded-full bg-[#27954D] animate-pulse" />}
                                    Razorpay (Ind)
                                </button>
                                <button
                                    onClick={() => setProviderType('PhonePe')}
                                    className={`flex-1 p-5 rounded-2xl border-2 transition-all font-black uppercase tracking-widest flex items-center justify-center gap-3 ${providerType === 'PhonePe' ? 'border-[#27954D] bg-emerald-50 text-[#27954D]' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                                >
                                    {providerType === 'PhonePe' && <div className="w-2 h-2 rounded-full bg-[#27954D] animate-pulse" />}
                                    PhonePe (Ind)
                                </button>
                            </div>
                        </div>

                        {providerType === 'Razorpay' ? (
                            <>
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
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="col-span-2 space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block">PhonePe Merchant ID</label>
                                    <div className="relative">
                                        <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={merchantId}
                                            onChange={e => setMerchantId(e.target.value)}
                                            placeholder="M1234567..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-16 pr-6 py-5 text-slate-900 focus:border-[#27954D] focus:bg-white outline-none transition-all font-black tracking-widest placeholder:text-slate-300 placeholder:font-normal"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block">Salt Key</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password"
                                            value={saltKey}
                                            onChange={e => setSaltKey(e.target.value)}
                                            placeholder="••••••••••••••••"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-16 pr-6 py-5 text-slate-900 focus:border-[#27954D] focus:bg-white outline-none transition-all font-black tracking-widest placeholder:text-slate-300 placeholder:font-normal"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block">Salt Index</label>
                                    <div className="relative">
                                        <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={saltIndex}
                                            onChange={e => setSaltIndex(e.target.value)}
                                            placeholder="1"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-16 pr-6 py-5 text-slate-900 focus:border-[#27954D] focus:bg-white outline-none transition-all font-black tracking-widest placeholder:text-slate-300 placeholder:font-normal"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-[2rem] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <>Commit Vault Credentials <RefreshCcw size={16} /></>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Escrow Top Up Logic (Test Net) */}
            <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />

                <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-4 border-b border-slate-100 pb-8 justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-[#27954D] rounded-2xl border border-emerald-100">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Escrow Wallet Funding</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Pre-fund your engine to allow vendor provisioning</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">Liquid Balance</div>
                            <div className="text-3xl font-black text-[#27954D] italic tracking-tighter">₹{walletBal.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-end gap-4">
                        <div className="flex-1 space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block">Top-Up Amount (₹)</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                                <input
                                    type="number"
                                    value={topUpAmount}
                                    onChange={e => setTopUpAmount(parseInt(e.target.value) || '')}
                                    placeholder="5000"
                                    className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-4.5 text-slate-900 focus:border-[#27954D] focus:ring-4 ring-emerald-500/10 outline-none transition-all font-black tracking-widest placeholder:text-slate-300 placeholder:font-normal tabular-nums shadow-sm"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleTopUp}
                            disabled={toppingUp || !topUpAmount || topUpAmount <= 0}
                            className="px-8 py-4.5 bg-[#27954D] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:shadow-none h-[64px]"
                        >
                            {toppingUp ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Process Funding"}
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
        </div >
    );
}
