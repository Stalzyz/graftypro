"use client";
import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, Lock, Zap, ArrowRight, Loader2 } from 'lucide-react';

export default function PublicVendorCheckout({ params }: { params: { plan_id: string } }) {
    const [plan, setPlan] = useState<any>(null);
    const [partnerSettings, setPartnerSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        vendor_name: '',
        business_name: '',
        vendor_email: '',
        password: ''
    });

    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchPlanData();
        // Load Razorpay dynamically
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const fetchPlanData = async () => {
        try {
            const res = await fetch(`/api/public/checkout/init?plan_id=${params.plan_id}`);
            const data = await res.json();

            if (res.ok) {
                setPlan(data.plan);
                setPartnerSettings(data.reseller);
            } else {
                setError(data.error || "Plan not found");
            }
        } catch (e) {
            setError("Network Error");
        } finally {
            setLoading(false);
        }
    };

    const handleCheckoutPhase = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        try {
            // 1. Create a Razorpay Order natively on the Reseller's Account
            const rzKeys = partnerSettings.payment_gateways?.find((g: any) => g.provider === 'Razorpay');

            if (!rzKeys || !rzKeys.key_id) {
                alert("Partner Integration Error: Gateway Offline");
                setProcessing(false);
                return;
            }

            const initRes = await fetch("/api/public/checkout/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan_id: plan.id,
                    reseller_id: plan.reseller_id,
                    vendor_email: form.vendor_email
                })
            });

            const orderData = await initRes.json();
            if (!initRes.ok) throw new Error(orderData.error);

            // 2. Launch Razorpay Instance attached to the Partner's key
            const options = {
                key: rzKeys.key_id, // Important: This uses the Partner's Key, NOT Grafty's.
                amount: plan.monthly_price * 100, // INR in paise
                currency: "INR",
                name: partnerSettings.business_name || partnerSettings.name,
                description: `Subscription - ${plan.name}`,
                order_id: orderData.order_id,
                prefill: {
                    name: form.vendor_name,
                    email: form.vendor_email
                },
                theme: {
                    color: partnerSettings.branding_settings?.primary_color || "#0F172A"
                },
                handler: async function (response: any) {
                    await finalizeFulfillment(response.razorpay_payment_id, response.razorpay_signature);
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert("Payment Authorization Failed");
                setProcessing(false);
            });

            rzp.open();

        } catch (err: any) {
            alert(err.message || "Failed to initialize payment gateway");
            setProcessing(false);
        }
    };

    const finalizeFulfillment = async (paymentId: string, signature: string) => {
        try {
            // 3. Fulfill the Order - Verify Signature AND run Escrow Wallet Deduction
            const fulfillRes = await fetch("/api/public/checkout/fulfill", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    payment_id: paymentId,
                    signature: signature,
                    plan_id: plan.id,
                    reseller_id: plan.reseller_id,
                    form_data: form
                })
            });

            const fulfillData = await fulfillRes.json();
            if (fulfillRes.ok) {
                // Provisioning Successful
                window.location.href = `/checkout/success?workspace_id=${fulfillData.workspace_id}`;
            } else {
                throw new Error(fulfillData.error);
            }
        } catch (err: any) {
            alert(`Fulfillment Error: ${err.message}. If money was deducted, contact support.`);
            setProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-slate-300" size={32} /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-rose-500 font-bold uppercase tracking-widest">{error}</div>;

    // Apply strict White-Label Branding if configured
    const primaryColor = partnerSettings?.branding_settings?.primary_color || "#0F172A";

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">

            {/* Left Box: Value Prop (White Labeled) */}
            <div className="w-full md:w-[45%] bg-slate-900 p-12 md:p-20 text-white flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>

                <div className="relative z-10">
                    <h2 className="text-xl font-black uppercase tracking-widest mb-1 opacity-70">
                        {partnerSettings.brand_name || partnerSettings.business_name}
                    </h2>
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-none mb-6">
                        {plan.name} Matrix
                    </h1>
                    <p className="text-sm font-bold opacity-80 uppercase tracking-widest leading-relaxed max-w-sm mb-12">
                        You are initiating a direct subscription mapping to the {partnerSettings.brand_name} network engine.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <CheckCircle2 className="text-emerald-400 flex-shrink-0" />
                            <div>
                                <h4 className="font-black uppercase tracking-widest text-sm">Commercial License</h4>
                                <p className="text-[10px] opacity-70 uppercase tracking-widest mt-1">Full access to the core communication infrastructure.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <CheckCircle2 className="text-emerald-400 flex-shrink-0" />
                            <div>
                                <h4 className="font-black uppercase tracking-widest text-sm">Scalable Capacity</h4>
                                <p className="text-[10px] opacity-70 uppercase tracking-widest mt-1">Up to {plan.max_contacts} synced network connections natively mapped.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-20 pt-10 border-t border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck size={18} className="text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted Settlement</span>
                    </div>
                    <p className="text-[9px] opacity-60 uppercase tracking-widest">
                        Payments are processed securely via {partnerSettings.payment_gateways?.[0]?.provider || 'Razorpay'} on behalf of {partnerSettings.business_name}.
                    </p>
                </div>
            </div>

            {/* Right Box: The Form */}
            <div className="w-full md:w-[55%] p-8 md:p-20 flex items-center justify-center bg-white">
                <div className="w-full max-w-md space-y-10">

                    <div className="flex items-end justify-between border-b-2 border-slate-100 pb-8">
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authorization Required</div>
                            <div className="text-4xl font-black text-slate-900 tracking-tighter italic">₹{plan.monthly_price} <span className="text-sm text-slate-400 font-bold">/ Mo</span></div>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#27954D] border border-emerald-100 shadow-inner">
                            <Lock size={20} />
                        </div>
                    </div>

                    <form onSubmit={handleCheckoutPhase} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 sm:col-span-1 space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Operator Name</label>
                                <input required type="text" value={form.vendor_name} onChange={e => setForm({ ...form, vendor_name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:border-slate-500 focus:bg-white outline-none transition-all font-black" />
                            </div>
                            <div className="col-span-2 sm:col-span-1 space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Entity Name (Business)</label>
                                <input required type="text" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:border-slate-500 focus:bg-white outline-none transition-all font-black" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Secure Origin Email</label>
                            <input required type="email" value={form.vendor_email} onChange={e => setForm({ ...form, vendor_email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:border-slate-500 focus:bg-white outline-none transition-all font-black lowercase" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Vault Password Configuration</label>
                            <input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:border-slate-500 focus:bg-white outline-none transition-all font-black tracking-widest" />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-5 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-[2rem] flex items-center justify-center gap-3 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {processing ? <Loader2 className="animate-spin" /> : <>Authorize ₹{plan.monthly_price} Signature <ArrowRight size={18} /></>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
