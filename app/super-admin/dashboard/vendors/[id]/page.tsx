"use client";
import { useState, useEffect, useCallback } from "react";
import {
    ArrowLeft, Shield, Zap, Activity, MessageSquare, Users, LogIn,
    AlertOctagon, Save, Calendar, Building2, Phone, Globe, Lock,
    ToggleLeft, ToggleRight, CreditCard, History, ChevronDown,
    RefreshCw, Trash2, PauseCircle, PlayCircle, AlertTriangle,
    CheckCircle2, XCircle, Clock, DollarSign, Package, Eye, EyeOff
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MODULES = [
    { key: "flow_builder", label: "Flow Builder", icon: "⚡" },
    { key: "drip", label: "Drip Campaigns", icon: "💧" },
    { key: "broadcast", label: "Broadcast", icon: "📢" },
    { key: "template_creator", label: "Template Creator", icon: "🎨" },
    { key: "reseller", label: "Affiliate Partner", icon: "🤝" },
    { key: "white_label", label: "Platform Partner", icon: "🏷️" },
    { key: "wallet", label: "Wallet", icon: "💰" },
    { key: "analytics", label: "Analytics", icon: "📊" },
    { key: "api_access", label: "API Access", icon: "🔌" },
];

const PLANS = ["FREE", "STARTER", "PRO", "ENTERPRISE"];

export default function VendorDetailPage({ params }: { params: { id: string } }) {
    const [vendor, setVendor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"profile" | "modules" | "subscription" | "audit">("profile");
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    // Profile state
    const [plan, setPlan] = useState("");
    const [status, setStatus] = useState("");
    const [profile, setProfile] = useState({ business_name: "", phone: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);

    // Modules state
    const [modules, setModules] = useState<Record<string, boolean>>({});
    const [moduleSaving, setModuleSaving] = useState<string | null>(null);
    const [addons, setAddons] = useState<any[]>([]);
    const [addonSaving, setAddonSaving] = useState<string | null>(null);

    // Subscription state
    const [subscription, setSubscription] = useState<any>(null);
    const [subAction, setSubAction] = useState("");
    const [subValue, setSubValue] = useState("");
    const [subLoading, setSubLoading] = useState(false);

    // Audit state
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);

    const router = useRouter();

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchVendor = useCallback(async () => {
        const res = await fetch(`/api/super-admin/vendors/${params.id}`);
        const data = await res.json();
        if (data.workspace) {
            setVendor(data.workspace);
            setPlan(data.workspace.plan);
            setStatus(data.workspace.status);
            const owner = data.workspace.users?.find((u: any) => u.role === "OWNER");
            setProfile({
                business_name: data.workspace.business_name || data.workspace.name,
                phone: owner?.phone || "",
                password: ""
            });
        }
        setLoading(false);
    }, [params.id]);

    const fetchModules = useCallback(async () => {
        const res = await fetch(`/api/super-admin/vendors/${params.id}/modules`);
        const data = await res.json();
        if (data.modules) setModules(data.modules);
    }, [params.id]);
    
    const fetchAddons = useCallback(async () => {
        const res = await fetch(`/api/super-admin/vendors/${params.id}/addons`);
        const data = await res.json();
        if (data.addons) setAddons(data.addons);
    }, [params.id]);

    const fetchSubscription = useCallback(async () => {
        const res = await fetch(`/api/super-admin/vendors/${params.id}/subscription`);
        const data = await res.json();
        if (data.subscription) setSubscription(data.subscription);
    }, [params.id]);

    const fetchAudit = useCallback(async () => {
        setAuditLoading(true);
        const res = await fetch(`/api/super-admin/vendors/${params.id}/audit`);
        const data = await res.json();
        setAuditLogs(data.logs || []);
        setAuditLoading(false);
    }, [params.id]);

    useEffect(() => {
        fetchVendor();
        fetchModules();
        fetchAddons();
        fetchSubscription();
    }, [fetchVendor, fetchModules, fetchAddons, fetchSubscription]);

    useEffect(() => {
        if (activeTab === "audit") fetchAudit();
    }, [activeTab, fetchAudit]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/super-admin/vendors/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan, status, business_name: profile.business_name, phone: profile.phone, password: profile.password || undefined })
            });
            if (res.ok) {
                showToast("Profile updated successfully");
                setProfile(p => ({ ...p, password: "" }));
                fetchVendor();
            } else {
                const err = await res.json();
                showToast(err.error || "Update failed", "error");
            }
        } catch { showToast("Network error", "error"); }
        finally { setSaving(false); }
    };

    const handleModuleToggle = async (key: string, current: boolean) => {
        setModuleSaving(key);
        try {
            const res = await fetch(`/api/super-admin/vendors/${params.id}/modules`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ module: key, enabled: !current })
            });
            if (res.ok) {
                setModules(m => ({ ...m, [key]: !current }));
                showToast(`${key.replace(/_/g, " ")} ${!current ? "enabled" : "disabled"}`);
            } else {
                showToast("Toggle failed", "error");
            }
        } catch { showToast("Network error", "error"); }
        finally { setModuleSaving(null); }
    };
    
    const handleAddonToggle = async (addonId: string, currentStatus: string) => {
        const newStatus = currentStatus === "ACTIVE" ? "DEACTIVATE" : "ACTIVATE";
        setAddonSaving(addonId);
        try {
            const res = await fetch(`/api/super-admin/vendors/${params.id}/addons`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ addonId, action: newStatus })
            });
            if (res.ok) {
                showToast(`Addon ${newStatus === "ACTIVATE" ? "provisioned" : "revoked"} successfully`);
                fetchAddons();
            } else {
                const err = await res.json();
                showToast(err.error || "Toggle failed", "error");
            }
        } catch { showToast("Network error", "error"); }
        finally { setAddonSaving(null); }
    };

    const handleSubscriptionAction = async () => {
        if (!subAction) return;
        setSubLoading(true);
        try {
            const body: any = { action: subAction };
            if (subAction === "upgrade" || subAction === "downgrade") body.plan = subValue;
            if (subAction === "extend_trial") body.trial_days = parseInt(subValue) || 7;
            if (subAction === "set_custom_price") body.custom_price = parseFloat(subValue);
            if (subAction === "force_renewal") body.renewal_date = subValue;

            const res = await fetch(`/api/super-admin/vendors/${params.id}/subscription`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                showToast(`Subscription ${subAction} applied`);
                fetchSubscription();
                setSubAction("");
                setSubValue("");
            } else {
                const err = await res.json();
                showToast(err.error || "Action failed", "error");
            }
        } catch { showToast("Network error", "error"); }
        finally { setSubLoading(false); }
    };

    const handleImpersonate = async () => {
        if (!window.confirm("⚠️ SECURITY WARNING\n\nYou are about to impersonate this vendor.\nAll actions will be fully logged to the audit trail.\n\nThis will open their dashboard in a new tab.\n\nProceed?")) return;
        // Server-side redirect sets the httpOnly token cookie correctly
        window.open(`/api/super-admin/impersonate-vendor?id=${params.id}`, "_blank");
    };

    const handleSoftDelete = async () => {
        const reason = window.prompt("Enter reason for soft delete:");
        if (!reason) return;
        const res = await fetch("/api/super-admin/vendors/bulk", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: [params.id], action: "soft_delete", reason })
        });
        if (res.ok) { showToast("Vendor soft deleted"); fetchVendor(); }
        else showToast("Failed", "error");
    };

    const handleHardDelete = async () => {
        if (!window.confirm("⚠️ PERMANENT DELETION\n\nThis will delete ALL data including messages, campaigns, contacts, and invoices.\n\nThis CANNOT be undone.")) return;
        const confirm2 = window.prompt("Type 'PURGE' to confirm:");
        if (confirm2 !== "PURGE") return;
        const res = await fetch(`/api/super-admin/vendors/${params.id}`, { method: "DELETE" });
        if (res.ok) { router.push("/super-admin/dashboard/vendors"); }
        else showToast("Deletion failed", "error");
    };

    const handleStatusToggle = async (newStatus: string) => {
        const res = await fetch("/api/super-admin/vendors/bulk", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: [params.id], action: newStatus === "ACTIVE" ? "activate" : "pause" })
        });
        if (res.ok) { showToast(`Vendor ${newStatus === "ACTIVE" ? "activated" : "paused"}`); fetchVendor(); }
        else showToast("Failed", "error");
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-[#042f94] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Loading Vendor Profile...</span>
            </div>
        </div>
    );

    if (!vendor) return <div className="p-8 text-rose-500 font-black uppercase text-center pt-32">Vendor Not Found</div>;

    const isSoftDeleted = (vendor.settings as any)?.soft_deleted;
    const owner = vendor.users?.find((u: any) => u.role === "OWNER");

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-24 px-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white text-sm font-bold animate-fade-in ${toast.type === "success" ? "bg-[#042f94]" : "bg-rose-500"}`}>
                    {toast.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    {toast.msg}
                </div>
            )}

            {/* Impersonation Banner (if opened from impersonate) */}
            {isSoftDeleted && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 flex items-center gap-3 text-amber-700 font-bold text-sm">
                    <AlertTriangle size={18} />
                    This vendor is SOFT DELETED — account is hidden from frontend but data is preserved.
                    <button onClick={async () => {
                        const res = await fetch("/api/super-admin/vendors/bulk", {
                            method: "PATCH", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ids: [params.id], action: "restore" })
                        });
                        if (res.ok) { showToast("Vendor restored"); fetchVendor(); }
                    }} className="ml-auto px-4 py-2 bg-amber-500 text-white rounded-xl text-xs hover:bg-amber-600 transition-all">
                        Restore Account
                    </button>
                </div>
            )}

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6">
                <div className="flex items-center gap-4">
                    <Link href="/super-admin/dashboard/vendors" className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                        <ArrowLeft size={18} className="text-slate-400" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-800">{vendor.name}</h1>
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${vendor.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                                {vendor.status}
                            </span>
                            {isSoftDeleted && <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600">SOFT DELETED</span>}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                            <span>ID: {params.id.slice(0, 12)}...</span>
                            <span>•</span>
                            <span>Joined {new Date(vendor.created_at).toLocaleDateString()}</span>
                            {owner && <><span>•</span><span>{owner.email}</span></>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Quick Status Toggle */}
                    <button
                        onClick={() => handleStatusToggle(vendor.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE")}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${vendor.status === "ACTIVE" ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"}`}
                    >
                        {vendor.status === "ACTIVE" ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                        {vendor.status === "ACTIVE" ? "Pause" : "Activate"}
                    </button>

                    <button
                        onClick={handleImpersonate}
                        className="flex items-center gap-2 px-4 py-3 bg-[#042f94] text-white rounded-2xl text-xs font-bold hover:bg-[#031f6b] transition-all shadow-lg shadow-[#042f94]/20"
                    >
                        <LogIn size={16} /> Impersonate
                    </button>

                    <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-black transition-all disabled:opacity-50"
                    >
                        {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Messages", value: vendor._count?.messages || 0, icon: <MessageSquare size={18} />, color: "blue" },
                    { label: "Campaigns", value: vendor._count?.campaigns || 0, icon: <Zap size={18} />, color: "amber" },
                    { label: "Contacts", value: vendor._count?.contacts || 0, icon: <Users size={18} />, color: "emerald" },
                    { label: "Flows", value: vendor._count?.flows || 0, icon: <Activity size={18} />, color: "purple" },
                ].map(stat => (
                    <div key={stat.label} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${stat.color === "blue" ? "bg-blue-50 text-blue-500" : stat.color === "amber" ? "bg-amber-50 text-amber-500" : stat.color === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-purple-50 text-purple-500"}`}>
                            {stat.icon}
                        </div>
                        <div className="text-2xl font-black text-slate-800">{stat.value.toLocaleString()}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
                {(["profile", "modules", "subscription", "audit"] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        {tab === "profile" ? "Profile & Control" : tab === "modules" ? "Module Control" : tab === "subscription" ? "Subscription" : "Audit Trail"}
                    </button>
                ))}
            </div>

            {/* TAB: Profile */}
            {activeTab === "profile" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Controls */}
                    <div className="space-y-6">
                        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                <Zap size={14} className="text-[#042f94]" /> Plan & Status
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Plan Tier</label>
                                    <select value={plan} onChange={e => setPlan(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-800 outline-none focus:border-[#042f94]/30 transition-all appearance-none">
                                        {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Account Status</label>
                                    <select value={status} onChange={e => setStatus(e.target.value)}
                                        className={`w-full border rounded-2xl px-4 py-3 font-black outline-none transition-all appearance-none ${status === "ACTIVE" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-600"}`}>
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="SUSPENDED">SUSPENDED</option>
                                        <option value="DORMANT">DORMANT</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 space-y-4">
                            <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                                <AlertOctagon size={14} /> Danger Zone
                            </h3>
                            <button onClick={handleSoftDelete}
                                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                                Soft Delete (Reversible)
                            </button>
                            <button onClick={handleHardDelete}
                                className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                                Hard Delete (Permanent)
                            </button>
                        </div>
                    </div>

                    {/* Right: Profile */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                <Users size={14} className="text-blue-500" /> Owner Profile
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Business Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input type="text" value={profile.business_name}
                                            onChange={e => setProfile(p => ({ ...p, business_name: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3 font-semibold text-slate-800 outline-none focus:border-[#042f94]/30 transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input type="text" value={profile.phone}
                                            onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3 font-semibold text-slate-800 outline-none focus:border-[#042f94]/30 transition-all" />
                                    </div>
                                </div>
                                <div className="col-span-full">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 flex items-center justify-between">
                                        <span>Force Password Reset</span>
                                        <span className="text-slate-300 normal-case font-medium">Leave blank to keep current</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input type={showPassword ? "text" : "password"} value={profile.password}
                                            onChange={e => setProfile(p => ({ ...p, password: e.target.value }))}
                                            placeholder="Enter new password..."
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-12 py-3 font-semibold text-slate-800 outline-none focus:border-rose-300 transition-all" />
                                        <button onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* WABA */}
                        {vendor.waba && (
                            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 mb-6">
                                    <Globe size={14} className="text-emerald-500" /> WhatsApp Account
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 rounded-2xl p-4">
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone Number</div>
                                        <div className="text-lg font-black text-slate-800 mt-1">{vendor.waba.phone_number}</div>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-4">
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quality Rating</div>
                                        <div className={`text-lg font-black mt-1 ${vendor.waba.quality_rating === "GREEN" ? "text-emerald-600" : "text-amber-500"}`}>
                                            {vendor.waba.quality_rating || "UNKNOWN"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: Modules */}
            {activeTab === "modules" && (
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Module Control</h3>
                            <p className="text-xs text-slate-400 mt-1">Enable or disable features for this vendor in real-time</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MODULES.map(mod => {
                            const enabled = modules[mod.key] !== false;
                            const isSaving = moduleSaving === mod.key;
                            return (
                                <div key={mod.key}
                                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${enabled ? "bg-[#042f94]/5 border-[#042f94]/10" : "bg-slate-50 border-slate-100"}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{mod.icon}</span>
                                        <div>
                                            <div className="text-sm font-bold text-slate-700">{mod.label}</div>
                                            <div className={`text-[10px] font-black uppercase tracking-widest ${enabled ? "text-[#042f94]" : "text-slate-400"}`}>
                                                {enabled ? "ENABLED" : "DISABLED"}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleModuleToggle(mod.key, enabled)}
                                        disabled={isSaving}
                                        className="transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? (
                                            <RefreshCw size={24} className="animate-spin text-slate-400" />
                                        ) : enabled ? (
                                            <ToggleRight size={32} className="text-[#042f94]" />
                                        ) : (
                                            <ToggleLeft size={32} className="text-slate-300" />
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Marketplace Addons (Admin Override) */}
                    <div className="mt-12 border-t border-slate-50 pt-10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <Package size={18} className="text-[#042f94]" /> Marketplace Addons (Admin Override)
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">Manual provision or revoke Marketplace features (Bypasses credits)</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {addons.length === 0 ? (
                                <div className="col-span-full py-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Addons Found In Marketplace</p>
                                </div>
                            ) : addons.map(addon => {
                                const isActive = addon.status === "ACTIVE";
                                const isSaving = addonSaving === addon.id;
                                return (
                                    <div key={addon.id} 
                                        className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${isActive ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100 opacity-60"}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                                                <Zap size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-800">{addon.title}</div>
                                                <div className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-emerald-600" : "text-slate-400"}`}>
                                                    {isActive ? "ACTIVE" : "INACTIVE"}
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleAddonToggle(addon.id, addon.status)}
                                            disabled={isSaving}
                                            className="transition-all disabled:opacity-50"
                                        >
                                            {isSaving ? (
                                                <RefreshCw size={24} className="animate-spin text-slate-400" />
                                            ) : isActive ? (
                                                <ToggleRight size={32} className="text-emerald-500" />
                                            ) : (
                                                <ToggleLeft size={32} className="text-slate-300" />
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: Subscription */}
            {activeTab === "subscription" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Current Status */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                            <CreditCard size={14} className="text-[#042f94]" /> Current Subscription
                        </h3>
                        {subscription && (
                            <div className="space-y-4">
                                {[
                                    { label: "Plan", value: subscription.plan },
                                    { label: "Status", value: subscription.subscription_status || "N/A" },
                                    { label: "Plan Name", value: subscription.plan_details?.name || "N/A" },
                                    { label: "Price", value: subscription.plan_details?.price ? `₹${subscription.plan_details.price}` : "N/A" },
                                    { label: "Billing Cycle", value: subscription.plan_details?.billing_cycle || "N/A" },
                                    { label: "Trial Ends", value: subscription.trial_ends_at ? new Date(subscription.trial_ends_at).toLocaleDateString() : "N/A" },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                        <span className="text-sm font-bold text-slate-700">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Override Actions */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                            <Shield size={14} className="text-amber-500" /> Subscription Override
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Action</label>
                                <select value={subAction} onChange={e => setSubAction(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-800 outline-none appearance-none">
                                    <option value="">Select action...</option>
                                    <option value="upgrade">Upgrade Plan</option>
                                    <option value="downgrade">Downgrade Plan</option>
                                    <option value="extend_trial">Extend Trial</option>
                                    <option value="cancel">Cancel Subscription</option>
                                    <option value="reactivate">Reactivate Subscription</option>
                                    <option value="force_renewal">Force Renewal</option>
                                    <option value="set_custom_price">Set Custom Price</option>
                                </select>
                            </div>

                            {(subAction === "upgrade" || subAction === "downgrade") && (
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">New Plan</label>
                                    <select value={subValue} onChange={e => setSubValue(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-800 outline-none appearance-none">
                                        <option value="">Select plan...</option>
                                        {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            )}

                            {subAction === "extend_trial" && (
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Days to Add</label>
                                    <input type="number" value={subValue} onChange={e => setSubValue(e.target.value)}
                                        placeholder="e.g. 7"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-800 outline-none" />
                                </div>
                            )}

                            {subAction === "set_custom_price" && (
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Custom Price (₹)</label>
                                    <input type="number" value={subValue} onChange={e => setSubValue(e.target.value)}
                                        placeholder="e.g. 999"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-800 outline-none" />
                                </div>
                            )}

                            {subAction === "force_renewal" && (
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">New Renewal Date</label>
                                    <input type="date" value={subValue} onChange={e => setSubValue(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-800 outline-none" />
                                </div>
                            )}

                            {subAction && (
                                <button onClick={handleSubscriptionAction} disabled={subLoading}
                                    className="w-full py-4 bg-[#042f94] hover:bg-[#031f6b] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {subLoading ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                                    Execute Override
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: Audit */}
            {activeTab === "audit" && (
                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                            <History size={14} className="text-[#042f94]" /> Audit Trail
                        </h3>
                        <button onClick={fetchAudit} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                            <RefreshCw size={16} className={`text-slate-400 ${auditLoading ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {auditLoading ? (
                            <div className="py-16 text-center">
                                <div className="w-8 h-8 border-2 border-[#042f94] border-t-transparent rounded-full animate-spin mx-auto" />
                            </div>
                        ) : auditLogs.length === 0 ? (
                            <div className="py-16 text-center text-slate-400 text-sm">No audit logs found</div>
                        ) : auditLogs.map((log: any) => (
                            <div key={log.id} className="px-8 py-5 flex items-start gap-4 hover:bg-slate-50/50 transition-all">
                                <div className="w-8 h-8 rounded-xl bg-[#042f94]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Shield size={14} className="text-[#042f94]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{log.action}</span>
                                        <span className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                                    </div>
                                    {log.details && (
                                        <div className="text-[11px] text-slate-500 mt-1 font-mono bg-slate-50 rounded-lg px-3 py-2 mt-2 truncate">
                                            {JSON.stringify(log.details)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
