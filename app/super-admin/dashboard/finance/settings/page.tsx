
"use client";

import { useState, useEffect } from "react";
import {
    Settings, ShieldCheck, Lock, Unlock, AlertTriangle, Calendar,
    FileText, CheckCircle2, Info, ArrowRight, Ban, Zap
} from "lucide-react";

export default function FinanceSettings() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [locking, setLocking] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch("/api/super-admin/finance/config");
            const data = await res.json();
            setConfig(data.config);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleLockMonth = async (month: number, year: number) => {
        if (!confirm(`Are you sure you want to lock ${month}/${year}? This is an immutable action for the audit period.`)) return;

        setLocking(true);
        try {
            const res = await fetch("/api/super-admin/finance/config/lock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ month, year })
            });
            if (res.ok) {
                alert("Accounting month locked successfully.");
                fetchConfig();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLocking(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-black text-slate-300 uppercase tracking-widest animate-pulse">Initializing Financial Core...</div>;

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-fade-in">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center">
                        <Settings className="text-white" size={24} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">Finance Control Panel</h1>
                </div>
                <p className="text-slate-400 font-medium ml-15">Configure tax compliance, audit locks, and immutable financial rules.</p>
            </header>

            {/* Audit & Lock Status */}
            <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-[#27954D]" size={20} />
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Accounting Enforcer</h3>
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest border border-slate-800">
                        System Active
                    </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-8 flex items-center justify-between border border-slate-100 group hover:border-slate-200 transition-all">
                    <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Locked Audit Period</div>
                        <div className="text-2xl font-black text-slate-900">
                            {config?.last_locked_month ? `${config.last_locked_month} / ${config.last_locked_year}` : "NO PERIODS LOCKED"}
                        </div>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-slate-100 group-hover:scale-110 transition-transform">
                        {config?.last_locked_month ? <Lock className="text-rose-500" /> : <Unlock className="text-slate-300" />}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl border border-rose-100 bg-rose-50/30 space-y-4">
                        <div className="flex items-center gap-2 text-rose-500 text-xs font-black uppercase">
                            <AlertTriangle size={14} /> Critical Warning
                        </div>
                        <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                            Locking a month prevents any new invoices, modifications, or deletions for that period. This is mandatory for GST filing integrity.
                        </p>
                    </div>

                    <div className="flex items-center justify-end">
                        <button
                            onClick={() => handleLockMonth(currentMonth - 1 || 12, currentMonth === 1 ? currentYear - 1 : currentYear)}
                            disabled={locking}
                            className="px-8 py-5 bg-rose-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-rose-100 hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {locking ? 'Securing Ledger...' : `Lock Audit Month (${currentMonth - 1 || 12}/${currentMonth === 1 ? currentYear - 1 : currentYear})`}
                        </button>
                    </div>
                </div>
            </section>

            {/* GST Configuration */}
            <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden p-8 space-y-8 h-fit">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-blue-500" size={20} />
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">GST & Tax Matrix</h3>
                    </div>
                    {config?.tax_config && (
                        <div className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                            Dynamic Config Active
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-4 gap-6">
                    <EditableStatBox
                        label="CGST Rate"
                        value={(config?.tax_config?.cgst_rate || 0.09) * (config?.tax_config?.cgst_rate < 1 ? 100 : 1)}
                        onChange={(v: number) => setConfig({ ...config, tax_config: { ...config.tax_config, cgst_rate: v } })}
                    />
                    <EditableStatBox
                        label="SGST Rate"
                        value={(config?.tax_config?.sgst_rate || 0.09) * (config?.tax_config?.sgst_rate < 1 ? 100 : 1)}
                        onChange={(v: number) => setConfig({ ...config, tax_config: { ...config.tax_config, sgst_rate: v } })}
                    />
                    <EditableStatBox
                        label="IGST Rate"
                        value={(config?.tax_config?.igst_rate || 0.18) * (config?.tax_config?.igst_rate < 1 ? 100 : 1)}
                        onChange={(v: number) => setConfig({ ...config, tax_config: { ...config.tax_config, igst_rate: v } })}
                    />
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center space-y-2 group hover:border-blue-200 transition-all">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default HSN</div>
                        <input
                            type="text"
                            value={config?.tax_config?.hsn_code || "998311"}
                            onChange={(e) => setConfig({ ...config, tax_config: { ...config.tax_config, hsn_code: e.target.value } })}
                            className="text-xl font-black text-slate-900 bg-transparent text-center outline-none w-full"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <SaveTaxConfigButton config={config?.tax_config} />
                </div>
            </section>
        </div>
    );
}

function EditableStatBox({ label, value, onChange }: any) {
    return (
        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center space-y-2 group hover:border-blue-200 transition-all">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
            <div className="relative">
                <input
                    type="number"
                    step="0.01"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="text-xl font-black text-slate-900 bg-transparent text-center outline-none w-full"
                />
                <span className="text-xs font-bold text-slate-400 absolute right-4 top-1.5 group-hover:text-blue-500 transition-colors">%</span>
            </div>
        </div>
    );
}

function SaveTaxConfigButton({ config }: any) {
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/super-admin/finance/config/tax", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tax_config: {
                        cgst_rate: (config?.cgst_rate || 9) > 1 ? config?.cgst_rate / 100 : config?.cgst_rate,
                        sgst_rate: (config?.sgst_rate || 9) > 1 ? config?.sgst_rate / 100 : config?.sgst_rate,
                        igst_rate: (config?.igst_rate || 18) > 1 ? config?.igst_rate / 100 : config?.igst_rate,
                        hsn_code: config?.hsn_code || "998311"
                    }
                })
            });
            if (res.ok) {
                alert("Tax configuration updated successfully.");
            } else {
                alert("Failed to update tax configuration.");
            }
        } catch (e) {
            console.error(e);
            alert("Error saving config.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
            {saving ? <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" /> : <Zap size={14} />}
            {saving ? 'Saving...' : 'Update Compliance Matrix'}
        </button>
    );
}
