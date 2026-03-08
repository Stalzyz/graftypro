
"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    MoreVertical,
    Zap,
    Shield,
    Check,
    X,
    Edit,
    Trash2,
    Globe,
    Cylinder,
    Settings2
} from "lucide-react";

interface Package {
    id: string;
    name: string;
    description: string;
    monthly_price: number;
    yearly_price: number;
    price: number;
    min_reseller_price: number;
    currency: string;
    billing_cycle: string;
    credits: number;
    max_contacts: number;
    max_flows: number;
    max_campaigns: number;
    max_messages: number;
    api_access: boolean;
    crm_access: boolean;
    flow_builder_access: boolean;
    drip_campaign_access: boolean;
    commerce_access: boolean;
    edu_engine_access: boolean;
    is_public: boolean;
    is_featured: boolean;
}

export default function PackageManagement() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<Package | null>(null);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await fetch("/api/super-admin/packages");
            const { data } = await res.json();
            setPackages(data || []);
        } catch (error) {
            console.error("Failed to fetch packages");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this package?")) return;
        try {
            const res = await fetch(`/api/super-admin/packages/${id}`, { method: "DELETE" });
            if (res.ok) fetchPackages();
            else {
                const data = await res.json();
                alert(data.error);
            }
        } catch (error) {
            alert("Delete failed");
        }
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl">
                            <Settings2 className="text-white" size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Packages</h1>
                    </div>
                    <p className="text-slate-400 font-medium max-w-2xl text-lg leading-relaxed">
                        Manage subscription packages and feature limits.
                    </p>
                </div>
                <button
                    onClick={() => { setEditingPackage(null); setIsModalOpen(true); }}
                    className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-3xl font-black hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-slate-200"
                >
                    <Plus size={20} strokeWidth={3} />
                    Add Package
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Live Plans" value={packages.length.toString()} icon={<Globe size={20} />} color="slate" />
                <StatCard label="Public Access" value={packages.filter(p => p.is_public).length.toString()} icon={<Check size={20} />} color="green" />
                <StatCard label="Enterprise Hooks" value={packages.filter(p => (p.monthly_price > 1000 || p.price > 1000)).length.toString()} icon={<Shield size={20} />} color="blue" />
                <StatCard label="Revenue Model" value="SUBSCRIPTION" icon={<Cylinder size={20} />} color="orange" />
            </div>

            {/* Package Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                {packages.map((pkg) => (
                    <div key={pkg.id} className="group bg-white rounded-[40px] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 p-8 z-10">
                            <button onClick={() => handleDelete(pkg.id)} className="text-slate-200 hover:text-rose-500 transition-colors bg-white/50 backdrop-blur-sm p-2 rounded-full">
                                <Trash2 size={20} />
                            </button>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`w-3 h-3 rounded-full ${pkg.is_public ? 'bg-[#27954D]' : 'bg-orange-400'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    {pkg.is_public ? 'Public Catalog' : 'Custom Build'}
                                </span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-2 truncate group-hover:text-[#27954D] transition-colors">{pkg.name}</h3>
                            <p className="text-slate-500 text-sm font-medium line-clamp-2 h-10">{pkg.description}</p>
                        </div>

                        {/* Dual Pricing Display */}
                        <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-slate-50">
                            <div className="flex items-baseline justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">MSRP (Retail)</span>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-slate-900 tracking-tighter">
                                        {pkg.currency} {pkg.monthly_price?.toLocaleString() || pkg.price?.toLocaleString()}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">+ GST</div>
                                </div>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded border border-indigo-100">Wholesale (BSP Gets)</span>
                                <div className="text-right">
                                    <div className="text-xl font-black text-indigo-600 tracking-tighter">
                                        {pkg.currency} {pkg.min_reseller_price?.toLocaleString() || "0"}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Base Cost</div>
                                </div>
                            </div>
                        </div>

                        {/* Free Monthly Credits — prominent display */}
                        <div className="flex items-center justify-between bg-gradient-to-r from-[#27954D]/10 to-emerald-50 border border-[#27954D]/20 rounded-2xl px-5 py-4 mb-6">
                            <div>
                                <p className="text-[9px] font-black text-[#27954D] uppercase tracking-[0.2em]">Free Credits / Month</p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">{(pkg.credits || 0).toLocaleString()}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-[#27954D] flex items-center justify-center">
                                <Zap size={20} className="text-white" />
                            </div>
                        </div>

                        <div className="space-y-6 flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <LimitBadge label="Contacts" value={pkg.max_contacts} />
                                <LimitBadge label="Flows" value={pkg.max_flows} />
                                <LimitBadge label="Campaigns" value={pkg.max_campaigns} />
                                <LimitBadge label="Messages" value={pkg.max_messages} />
                            </div>

                            <div className="space-y-3">
                                <FeatureTag active={pkg.api_access} label="API Access" />
                                <FeatureTag active={pkg.crm_access} label="Advance CRM" />
                                <FeatureTag active={pkg.flow_builder_access} label="Conditional Flows" />
                                <FeatureTag active={pkg.drip_campaign_access} label="Drip Sequences" />
                                <FeatureTag active={pkg.commerce_access} label="Store Engine" />
                                <FeatureTag active={pkg.edu_engine_access} label="EDU Admission Hub" />
                            </div>
                        </div>

                        <div className="mt-10 flex gap-4">
                            <button
                                onClick={() => { setEditingPackage(pkg); setIsModalOpen(true); }}
                                className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm ${(pkg.monthly_price === 0 || pkg.price === 0)
                                    ? "bg-[#27954D] text-white hover:bg-[#1e7e3e]"
                                    : "bg-slate-900 text-white hover:bg-slate-800"
                                    }`}
                            >
                                {(pkg.monthly_price === 0 || pkg.price === 0) ? "START FREE TRIAL" : "UPGRADE PLAN"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-slate-900/40 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[48px] shadow-3xl p-12 relative custom-scrollbar">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-8 right-8 text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            <X size={32} />
                        </button>

                        <div className="mb-12">
                            <h2 className="text-3xl font-black text-slate-900 mb-2">
                                {editingPackage ? 'Edit Package' : 'Add Package'}
                            </h2>
                            <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.2em]">Set package limits and features.</p>
                        </div>

                        <PackageForm
                            initialData={editingPackage}
                            onSuccess={() => { setIsModalOpen(false); fetchPackages(); }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: any, color: string }) {
    const colors: any = {
        slate: 'bg-slate-50 text-slate-900',
        green: 'bg-[#27954D]/10 text-[#27954D]',
        blue: 'bg-blue-50 text-blue-600',
        orange: 'bg-orange-50 text-orange-600'
    };
    return (
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-3xl font-black text-slate-900">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center`}>
                {icon}
            </div>
        </div>
    )
}

function LimitBadge({ label, value }: { label: string, value: number }) {
    const isUnlimited = value === -1 || value >= 99999999;
    return (
        <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 flex flex-col justify-center">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            <span className={`text-sm font-black ${isUnlimited ? 'text-[#27954D]' : 'text-slate-900'}`}>
                {isUnlimited ? "UNLIMITED" : value.toLocaleString()}
            </span>
        </div>
    )
}

function FeatureTag({ active, label }: { active: boolean, label: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${active ? 'bg-[#27954D] text-white shadow-[0_0_8px_rgba(39,149,77,0.4)]' : 'bg-slate-100 text-slate-400'}`}>
                {active ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
            </div>
            <span className={`text-xs font-bold tracking-tight ${active ? 'text-slate-700' : 'text-slate-400 italic'}`}>{label}</span>
        </div>
    )
}

function PackageForm({ initialData, onSuccess }: { initialData?: any, onSuccess: () => void }) {
    const [formData, setFormData] = useState(initialData ? {
        ...initialData,
        monthly_price: initialData.monthly_price || initialData.price || 0,
        yearly_price: initialData.yearly_price || 0,
        credits: initialData.credits || 0,
        is_featured: initialData.is_featured || false,
    } : {
        name: "",
        description: "",
        monthly_price: "",
        min_reseller_price: "",
        credits: 0,
        currency: "INR",
        max_contacts: 1000,
        max_flows: 10,
        max_campaigns: 5,
        max_messages: 5000,
        api_access: false,
        crm_access: true,
        flow_builder_access: true,
        drip_campaign_access: false,
        commerce_access: false,
        edu_engine_access: false,
        is_public: true,
        is_featured: false,
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = initialData
                ? `/api/super-admin/packages/${initialData.id}`
                : "/api/super-admin/packages";

            const method = initialData ? "PATCH" : "POST";

            const payload = {
                ...formData,
                price: formData.monthly_price,
                credits: parseInt(formData.credits) || 0,
                is_featured: !!formData.is_featured,
            };

            const res = await fetch(url, {
                method,
                body: JSON.stringify(payload),
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) onSuccess();
            else {
                const data = await res.json();
                alert(data.error);
            }
        } catch (error) {
            alert("Action failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Core Info */}
            <div className="space-y-8">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Package Identity</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Pro Growth Module"
                        className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-xl font-bold text-slate-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-50 transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Pricing Structure (+GST Auto Applied)</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[9px] font-black text-slate-500 uppercase mb-1 block">Monthly Price (MSRP)</label>
                            <input
                                type="number"
                                required
                                value={formData.monthly_price}
                                onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })}
                                placeholder="0.00"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-slate-900 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-indigo-600 uppercase mb-1 flex items-center gap-1"><Shield size={10} /> Wholesale Partner Cost</label>
                            <input
                                type="number"
                                required
                                value={formData.min_reseller_price}
                                onChange={(e) => setFormData({ ...formData, min_reseller_price: e.target.value })}
                                placeholder="0.00"
                                className="w-full bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 font-black text-indigo-900 outline-none focus:ring-2 ring-indigo-500/20"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Free Credits Granted / Month</label>
                    <div className="relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#27954D]/10 flex items-center justify-center">
                            <Zap size={14} className="text-[#27954D]" />
                        </div>
                        <input
                            type="number"
                            min={0}
                            value={formData.credits}
                            onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                            placeholder="e.g. 500"
                            className="w-full bg-gradient-to-r from-[#27954D]/5 to-emerald-50 border-2 border-[#27954D]/20 focus:border-[#27954D]/60 rounded-3xl pl-14 pr-6 py-5 text-2xl font-black text-slate-900 outline-none transition-all"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500 uppercase tracking-wider">credits</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium pl-2">These credits are deposited into the vendor wallet at the start of each billing month.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Structural Limits (Set -1 for Unlimited)</label>
                    <div className="grid grid-cols-2 gap-4">
                        <LimitInput label="Max Contacts" value={formData.max_contacts} onChange={(v) => setFormData({ ...formData, max_contacts: v })} />
                        <LimitInput label="Max Flows" value={formData.max_flows} onChange={(v) => setFormData({ ...formData, max_flows: v })} />
                        <LimitInput label="Monthly Campaigns" value={formData.max_campaigns} onChange={(v) => setFormData({ ...formData, max_campaigns: v })} />
                        <LimitInput label="Monthly Messages" value={formData.max_messages} onChange={(v) => setFormData({ ...formData, max_messages: v })} />
                        <LimitInput label="Max Workspaces/Teams" value={formData.max_teams || 1} onChange={(v) => setFormData({ ...formData, max_teams: v })} />
                    </div>
                </div>
            </div>

            {/* Modules & Flags */}
            <div className="space-y-8 flex flex-col">
                <div className="space-y-4 bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 block">Module Permissions</label>
                    <div className="grid grid-cols-1 gap-4">
                        <ToggleSwitch label="API" active={formData.api_access} onToggle={(v) => setFormData({ ...formData, api_access: v })} />
                        <ToggleSwitch label="EDU CRM" active={formData.edu_engine_access} onToggle={(v) => setFormData({ ...formData, edu_engine_access: v })} />
                        <ToggleSwitch label="Commerce" active={formData.commerce_access} onToggle={(v) => setFormData({ ...formData, commerce_access: v })} />
                        <ToggleSwitch label="Automation" active={formData.drip_campaign_access} onToggle={(v) => setFormData({ ...formData, drip_campaign_access: v })} />
                        <ToggleSwitch label="Public Catalog Status" active={formData.is_public} onToggle={(v) => setFormData({ ...formData, is_public: v })} />
                        <ToggleSwitch label="⭐ Featured / Most Popular" active={formData.is_featured} onToggle={(v) => setFormData({ ...formData, is_featured: v })} />
                    </div>
                </div>

                <div className="flex-1" />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white p-8 rounded-[32px] font-black text-2xl uppercase tracking-tighter hover:bg-[#27954D] transition-all disabled:bg-slate-200"
                >
                    {loading ? "SAVING..." : "SAVE PACKAGE"}
                </button>
            </div>
        </form>
    )
}

function LimitInput({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
    return (
        <div className="relative group">
            <span className="absolute left-4 top-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full bg-white border border-slate-100 rounded-2xl pl-4 pr-4 pt-6 pb-2 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-slate-50"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {value === -1 ? (
                    <span className="text-[9px] font-black text-[#27954D] bg-[#27954D]/10 px-2 py-1 rounded-md">UNLIMITED</span>
                ) : null}
            </div>
        </div>
    )
}

function ToggleSwitch({ label, active, onToggle }: { label: string, active: boolean, onToggle: (v: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onToggle(!active)}
            className="flex items-center justify-between w-full p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-300 transition-all group"
        >
            <span className={`text-[11px] font-black uppercase tracking-wider ${active ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
            <div className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-[#27954D]' : 'bg-slate-200'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? 'left-7' : 'left-1'}`} />
            </div>
        </button>
    )
}
