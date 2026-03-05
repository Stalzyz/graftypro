"use client";

import React, { useState, useEffect } from "react";
import {
    ShieldCheck,
    Zap,
    TrendingUp,
    Save,
    Lock,
    AlertCircle,
    Coins,
    Gem,
    Settings2,
    RefreshCw,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Calculator
} from "lucide-react";

export default function RevenueEngineSettings() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch("/api/super-admin/finance/revenue-settings")
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/super-admin/finance/revenue-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <RefreshCw className="animate-spin text-purple-600" size={40} />
        </div>
    );

    return (
        <div className="space-y-12 pb-20 max-w-[1400px] mx-auto animate-fade-in">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Revenue Engine Protocol</h1>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.2em] mt-2">Hybrid Base Cost + Tier Bonus Orchestration</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest hover:bg-purple-600 transition-all active:scale-95 shadow-2xl shadow-slate-200 disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                        {saving ? "Updating Core..." : "Deploy Financial Logic"}
                    </button>
                    {saved && (
                        <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-6 rounded-full border border-emerald-100">
                            <ShieldCheck size={14} />
                            Protocol Active
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Column 1: Core Economics */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Platform Base Cost Model */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 space-y-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <PieChart className="text-purple-600" size={24} />
                                Platform Base Economics
                            </h3>
                            <div className="px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest">Global Master Default</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Master Base Cost (₹)</label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</div>
                                    <input
                                        type="number"
                                        value={config?.rev_base_platform_cost}
                                        onChange={e => setConfig({ ...config, rev_base_platform_cost: Number(e.target.value) })}
                                        className="w-full bg-slate-50 border-none rounded-[24px] pl-12 pr-6 py-5 font-black text-xl text-slate-900 outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                    />
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-2 ml-4 tracking-tighter italic">Platform's absolute minimum earning per subscription.</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Minimum Selling Price (₹)</label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</div>
                                    <input
                                        type="number"
                                        value={config?.rev_min_selling_price}
                                        onChange={e => setConfig({ ...config, rev_min_selling_price: Number(e.target.value) })}
                                        className="w-full bg-slate-50 border-none rounded-[24px] pl-12 pr-6 py-5 font-black text-xl text-slate-900 outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                    />
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-2 ml-4 tracking-tighter italic">Partners cannot set plan prices below this threshold.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-sm border border-slate-100">
                                <Calculator size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900">Profit Simulation</h4>
                                <p className="text-xs text-slate-400 font-medium">
                                    Expected Partner Share: ₹{(config?.rev_min_selling_price || 0) - (config?.rev_base_platform_cost || 0)} per min-sale.
                                </p>
                            </div>
                            <div className="ml-auto flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={config?.rev_lock_pricing_floor}
                                        onChange={e => setConfig({ ...config, rev_lock_pricing_floor: e.target.checked })}
                                        className="w-5 h-5 rounded-lg text-purple-600 border-none bg-white shadow-inner focus:ring-purple-600"
                                    />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enforce Floor Price</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tier Milestone Protocol */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 space-y-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <TrendingUp className="text-emerald-500" size={24} />
                                Tier Milestone Protocol
                            </h3>
                            <button
                                onClick={() => setConfig({ ...config, rev_enable_tier_bonus: !config.rev_enable_tier_bonus })}
                                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${config.rev_enable_tier_bonus ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                            >
                                {config.rev_enable_tier_bonus ? 'Active' : 'Disabled'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Tier 1 */}
                            <div className="space-y-6 p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">T1</div>
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Growth Tier</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Monthly Threshold (₹)</label>
                                        <input
                                            type="number"
                                            value={config.rev_tier_threshold_1}
                                            onChange={e => setConfig({ ...config, rev_tier_threshold_1: Number(e.target.value) })}
                                            className="w-full bg-white border-none rounded-xl px-4 py-3 font-bold text-slate-900 outline-none shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Bonus % on Profit</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={config.rev_tier_bonus_1}
                                                onChange={e => setConfig({ ...config, rev_tier_bonus_1: Number(e.target.value) })}
                                                className="w-full bg-white border-none rounded-xl px-4 py-3 font-bold text-slate-900 outline-none shadow-sm"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-300">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tier 2 */}
                            <div className="space-y-6 p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black">T2</div>
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Empire Tier</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Monthly Threshold (₹)</label>
                                        <input
                                            type="number"
                                            value={config.rev_tier_threshold_2}
                                            onChange={e => setConfig({ ...config, rev_tier_threshold_2: Number(e.target.value) })}
                                            className="w-full bg-white border-none rounded-xl px-4 py-3 font-bold text-slate-900 outline-none shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Bonus % on Profit</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={config.rev_tier_bonus_2}
                                                onChange={e => setConfig({ ...config, rev_tier_bonus_2: Number(e.target.value) })}
                                                className="w-full bg-white border-none rounded-xl px-4 py-3 font-bold text-slate-900 outline-none shadow-sm"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-300">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Side Controls & Summary */}
                <div className="space-y-10">
                    {/* Wallet Margin Model */}
                    <div className="bg-slate-900 rounded-[40px] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Coins size={120} />
                        </div>
                        <div className="relative z-10 flex items-center justify-between">
                            <h3 className="text-xl font-black">Usage Credits</h3>
                            <button
                                onClick={() => setConfig({ ...config, rev_enable_wallet_margin: !config.rev_enable_wallet_margin })}
                                className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${config.rev_enable_wallet_margin ? 'bg-purple-500/20 text-purple-300' : 'bg-white/10 text-white/40'}`}
                            >
                                {config.rev_enable_wallet_margin ? 'Split Active' : 'Hold Split'}
                            </button>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">WL Margin per Msg (₹)</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-purple-400">₹</div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={config.rev_default_wallet_margin}
                                        onChange={e => setConfig({ ...config, rev_default_wallet_margin: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-3xl pl-12 pr-6 py-5 font-black text-2xl text-slate-700 outline-none focus:bg-white/10 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                                <div className="flex justify-between items-center text-xs font-bold leading-none">
                                    <span className="text-slate-500 uppercase tracking-widest">Base Meta Cost</span>
                                    <span>₹0.80</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold leading-none">
                                    <span className="text-slate-500 uppercase tracking-widest">WL Margin</span>
                                    <span className="text-emerald-400">₹{config.rev_default_wallet_margin}</span>
                                </div>
                                <div className="pt-4 border-t border-white/10 flex justify-between items-center font-black">
                                    <span className="text-[10px] text-purple-400 uppercase tracking-widest">Final Client Price</span>
                                    <span className="text-xl">₹{(0.80 + config.rev_default_wallet_margin).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fraud Prevention & Guard */}
                    <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm space-y-6">
                        <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <Lock className="text-rose-500" size={20} />
                            Safety Protocol
                        </h4>
                        <div className="space-y-4">
                            <GuardItem active={true} label="Immutable Ledger Auth" />
                            <GuardItem active={true} label="Monthly Bonus Recalc Lock" />
                            <GuardItem active={true} label="Refund Auto-Reversal" />
                            <GuardItem active={true} label="Base Cost Tamper Proof" />
                            <GuardItem active={config.rev_lock_pricing_floor} label="Static Floor Enforcement" />
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="p-8 bg-purple-50 rounded-[40px] border border-purple-100 flex flex-col gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-sm border border-purple-100">
                            <AlertCircle size={24} />
                        </div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">Historical Data Transparency</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Changing these variables will ONLY affect future transactions. Existing ledger entries remain immutable to ensure historical audit integrity.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GuardItem({ active, label }: { active: boolean; label: string }) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            {active ? (
                <ShieldCheck className="text-emerald-500" size={16} />
            ) : (
                <AlertCircle className="text-rose-500" size={16} />
            )}
        </div>
    );
}
