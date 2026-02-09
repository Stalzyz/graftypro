
"use client";

import { useState, useEffect } from "react";
import {
    CreditCard,
    Save,
    Zap,
    ShieldCheck,
    AlertCircle,
    Power,
    RefreshCw,
    ExternalLink
} from "lucide-react";

export default function PaymentSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [gateways, setGateways] = useState<any[]>([]);

    useEffect(() => {
        // Mock fetch or actual API
        setGateways([
            { provider: "Razorpay", key_id: "rzp_test_...", key_secret: "••••••••", is_live: false, is_active: true },
            { provider: "Stripe", key_id: "pk_test_...", key_secret: "••••••••", is_live: false, is_active: false },
        ]);
        setLoading(false);
    }, []);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => setSaving(false), 1500);
    };

    return (
        <div className="max-w-6xl space-y-12 pb-20">
            <header className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <CreditCard className="text-white" size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fintech Pipeline</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Configure payment gateways, webhooks, and treasury credentials.</p>
                </div>

                <div className="flex gap-4">
                    <button className="px-6 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-200 transition-all active:scale-95">
                        <Zap size={14} />
                        Test All Connections
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                        Save Infrastructure
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {gateways.map((gw, idx) => (
                    <GatewayCard key={idx} gateway={gw} />
                ))}

                <button className="h-[400px] border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center gap-4 text-slate-300 hover:border-slate-400 hover:text-slate-500 transition-all group">
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CreditCard size={24} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Connect New Gateway</span>
                </button>
            </div>

            <section className="bg-white rounded-[40px] border border-slate-100 p-12 space-y-8 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-green-500" size={20} />
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Global Webhook Shield</h2>
                    </div>
                    <div className="px-4 py-2 bg-slate-900 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                        Status: Listening
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Webhook Endpoint</label>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-slate-50 p-5 rounded-2xl text-[11px] font-bold text-slate-900 border border-slate-100 break-all">
                                https://app.grekam.in/api/billing/webhook
                            </code>
                            <button className="p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                                <ExternalLink size={14} className="text-slate-400" />
                            </button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Signing Secret</label>
                        <input
                            type="password"
                            className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
                            value="whsec_••••••••••••••••"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function GatewayCard({ gateway }: { gateway: any }) {
    return (
        <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group">
            <div className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                            <span className="text-white font-black text-lg">{gateway.provider[0]}</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">{gateway.provider}</h3>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Payment Processor</span>
                        </div>
                    </div>
                    <div className={`p-4 rounded-2xl transition-all ${gateway.is_active ? 'bg-green-500/10 text-green-500' : 'bg-slate-100 text-slate-400'}`}>
                        <Power size={20} />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">API Key ID</label>
                        <input
                            type="text"
                            className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 font-mono shadow-inner"
                            value={gateway.key_id}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">API Key Secret</label>
                        <input
                            type="password"
                            className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 font-mono shadow-inner"
                            value={gateway.key_secret}
                        />
                    </div>
                </div>

                <div className="pt-6 flex items-center gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-10 h-5 rounded-full relative transition-all ${gateway.is_live ? 'bg-[#27954D]' : 'bg-orange-500'}`}>
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${gateway.is_live ? 'right-1' : 'left-1'}`} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            {gateway.is_live ? 'Live Mode' : 'Sandbox'}
                        </span>
                    </label>

                    <button className="ml-auto text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                        Configure Webhooks
                    </button>
                </div>
            </div>

            {!gateway.is_active && (
                <div className="bg-slate-50 p-6 flex items-center gap-3 px-10">
                    <AlertCircle size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gateway is currently dormant</span>
                    <button className="ml-auto text-[10px] font-black text-slate-900 border-b border-slate-900">Activate Provider</button>
                </div>
            )}
        </div>
    );
}
