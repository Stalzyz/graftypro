"use client";
import { useState, useEffect, useCallback } from "react";
import {
    ArrowLeft, Briefcase, DollarSign, ExternalLink, TrendingUp,
    ShieldCheck, Handshake, Calendar, Users, ArrowUpRight, CheckCircle2,
    Wallet, Info, AlertTriangle, Eye, EyeOff, LogIn, Save, RefreshCw,
    AlertOctagon, Trash2, History, Shield, Palette, Globe, Mail,
    CheckCircle, PauseCircle, PlayCircle, XCircle, Lock, Phone,
    Building2, CreditCard, Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SmartUploader } from "../../../../../components/ui/SmartUploader";

type Tab = "overview" | "governance" | "branding" | "wallet" | "audit";

export default function PartnerDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [partner, setPartner] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    // Governance state
    const [gov, setGov] = useState({ status: "", role: "", commission_pct: "", password: "" });
    const [showPass, setShowPass] = useState(false);

    // Branding state (for PLATFORM partners)
    const [branding, setBranding] = useState({
        brand_name: "", logo_url: "", favicon_url: "",
        primary_color: "#27954D", secondary_color: "#042f94",
        support_email: "", support_url: "", custom_domain: ""
    });

    // Wallet state
    const [creditAmount, setCreditAmount] = useState("");
    const [creditNote, setCreditNote] = useState("");
    const [creditLoading, setCreditLoading] = useState(false);

    // Audit state
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchPartner = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/super-admin/partners/${params.id}`);
            const data = await res.json();
            if (data.partner) {
                setPartner(data.partner);
                setGov({
                    status: data.partner.status || "ACTIVE",
                    role: data.partner.role || "AFFILIATE",
                    commission_pct: data.partner.base_commission?.toString() || "20",
                    password: ""
                });
                setBranding({
                    brand_name: data.partner.brand_name || "",
                    logo_url: data.partner.logo_url || "",
                    favicon_url: data.partner.favicon_url || "",
                    primary_color: data.partner.primary_color || "#27954D",
                    secondary_color: data.partner.secondary_color || "#042f94",
                    support_email: data.partner.support_email || "",
                    support_url: data.partner.support_url || "",
                    custom_domain: data.partner.custom_domain || ""
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    const fetchAudit = useCallback(async () => {
        setAuditLoading(true);
        try {
            const res = await fetch(`/api/super-admin/audit?resource=${params.id}&limit=30`);
            const data = await res.json();
            setAuditLogs(data.data || []);
        } finally {
            setAuditLoading(false);
        }
    }, [params.id]);

    useEffect(() => { fetchPartner(); }, [fetchPartner]);
    useEffect(() => { if (activeTab === "audit") fetchAudit(); }, [activeTab, fetchAudit]);

    const handleSaveGovernance = async () => {
        setSaving(true);
        const res = await fetch(`/api/super-admin/partners/${params.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(gov)
        });
        if (res.ok) { showToast("Governance settings saved"); fetchPartner(); }
        else showToast("Failed to save", "error");
        setSaving(false);
    };

    const handleSaveBranding = async () => {
        setSaving(true);
        const res = await fetch(`/api/super-admin/partners/${params.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ branding })
        });
        if (res.ok) showToast("Branding updated for partner");
        else showToast("Failed to save branding", "error");
        setSaving(false);
    };

    const handleStatusToggle = async () => {
        const newStatus = partner.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
        const res = await fetch(`/api/super-admin/partners/${params.id}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) { showToast(`Partner ${newStatus === "ACTIVE" ? "activated" : "suspended"}`); fetchPartner(); }
        else showToast("Failed", "error");
    };

    const handleImpersonate = async () => {
        if (!window.confirm("⚠️ SECURITY WARNING\n\nYou are about to impersonate this partner.\nAll actions will be fully logged to the audit trail.\n\nThis will open their dashboard in a new tab.\n\nProceed?")) return;
        // Server-side redirect sets the httpOnly partner_token cookie correctly
        window.open(`/api/super-admin/impersonate-partner?id=${params.id}`, "_blank");
    };

    const handleDelete = async () => {
        const reason = window.prompt("Enter reason for deletion:");
        if (!reason) return;
        if (!window.confirm("⚠️ This will permanently delete this partner and all their data. This CANNOT be undone.\n\nType OK to confirm:")) return;
        const res = await fetch(`/api/super-admin/partners/${params.id}`, { method: "DELETE" });
        if (res.ok) { showToast("Partner deleted"); router.push("/super-admin/dashboard/partners"); }
        else showToast("Deletion failed", "error");
    };

    const handleAddCredits = async () => {
        if (!creditAmount) return;
        setCreditLoading(true);
        const res = await fetch(`/api/super-admin/partners/${params.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "add_credits", amount: parseFloat(creditAmount), note: creditNote })
        });
        if (res.ok) { showToast(`₹${creditAmount} credited to partner wallet`); setCreditAmount(""); setCreditNote(""); fetchPartner(); }
        else showToast("Failed to add credits", "error");
        setCreditLoading(false);
    };

    const handleSettlement = async () => {
        const pending = (partner.total_earnings || 0) - (partner.paid_earnings || 0);
        if (pending <= 0) { showToast("No pending earnings to settle", "error"); return; }
        if (!window.confirm(`Record payout of ₹${pending} to ${partner.name}?`)) return;
        const res = await fetch(`/api/super-admin/partners/${params.id}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "settle_payout", amount: pending })
        });
        if (res.ok) { showToast(`Settlement of ₹${pending} recorded`); fetchPartner(); }
        else showToast("Settlement failed", "error");
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-[#27954D] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Loading Partner...</span>
            </div>
        </div>
    );
    if (!partner) return <div className="p-8 text-rose-500 font-black uppercase text-center pt-32">Partner Not Found</div>;

    const pendingEarnings = (partner.total_earnings || 0) - (partner.paid_earnings || 0);
    const isPlatform = partner.role === "PLATFORM";

    const TABS: { key: Tab; label: string }[] = [
        { key: "overview", label: "Overview" },
        { key: "governance", label: "Governance" },
        ...(isPlatform ? [{ key: "branding" as Tab, label: "Branding" }] : []),
        { key: "wallet", label: "Wallet & Payouts" },
        { key: "audit", label: "Audit Trail" }
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-24 px-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white text-sm font-bold animate-fade-in ${toast.type === "success" ? "bg-[#27954D]" : "bg-rose-500"}`}>
                    {toast.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6">
                <div className="flex items-center gap-4">
                    <Link href="/super-admin/dashboard/partners" className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                        <ArrowLeft size={18} className="text-slate-400" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-slate-800">{partner.name}</h1>
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${partner.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                                {partner.status}
                            </span>
                            <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600">
                                {partner.role}
                            </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                            <span>{partner.email}</span>
                            <span>•</span>
                            <span>Joined {new Date(partner.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleStatusToggle}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${partner.status === "ACTIVE"
                            ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                            : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                            }`}
                    >
                        {partner.status === "ACTIVE" ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                        {partner.status === "ACTIVE" ? "Suspend" : "Activate"}
                    </button>
                    <button
                        onClick={handleImpersonate}
                        className="flex items-center gap-2 px-4 py-3 bg-[#042f94] text-white rounded-2xl text-xs font-bold hover:bg-[#031f6b] transition-all shadow-lg"
                    >
                        <LogIn size={16} /> Impersonate
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Vendors" value={partner.vendors?.length || 0} color="blue" />
                <StatCard label="Total Earned" value={`₹${(partner.total_earnings || 0).toLocaleString()}`} color="emerald" />
                <StatCard label="Pending Payout" value={`₹${pendingEarnings.toLocaleString()}`} color="amber" />
                <StatCard label="Commission %" value={`${partner.base_commission || 20}%`} color="purple" />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit flex-wrap">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── OVERVIEW ──────────────────────────────── */}
            {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        {/* Identity card */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Partner Identity</h3>
                            {[
                                { label: "Full Name", value: partner.name },
                                { label: "Email", value: partner.email },
                                { label: "Phone", value: partner.phone || "—" },
                                { label: "Company", value: partner.company_name || "—" },
                                { label: "Role", value: partner.role },
                                { label: "Status", value: partner.status },
                                { label: "KYC", value: partner.kyc_status || "PENDING" },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                                    <span className="text-xs font-bold text-slate-700">{value}</span>
                                </div>
                            ))}
                        </div>

                        {isPlatform && branding.brand_name && (
                            <div className="bg-[#27954D]/5 border border-[#27954D]/10 rounded-3xl p-6 space-y-3">
                                <h4 className="text-[10px] font-black text-[#27954D] uppercase tracking-widest">White-Label Active</h4>
                                <p className="text-xs font-bold text-slate-700">{branding.brand_name}</p>
                                {branding.custom_domain && (
                                    <a href={`https://${branding.custom_domain}`} target="_blank" rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1">
                                        {branding.custom_domain} <ExternalLink size={10} />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        {/* Vendors table */}
                        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-black text-slate-800">Managed Vendors</h3>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-widest">All vendors under this partner's referral</p>
                                </div>
                                <span className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-black text-slate-500">{partner.vendors?.length || 0}</span>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {(!partner.vendors || partner.vendors.length === 0) ? (
                                    <div className="py-16 text-center">
                                        <Handshake size={40} className="text-slate-100 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-slate-300">No vendors referred yet</p>
                                    </div>
                                ) : partner.vendors.map((v: any) => (
                                    <div key={v.id} className="flex items-center justify-between px-8 py-5 hover:bg-slate-50 transition-all group">
                                        <div>
                                            <div className="text-sm font-bold text-slate-700 group-hover:text-[#042f94] transition-colors">{v.name}</div>
                                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                {v.status} · Joined {new Date(v.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <Link href={`/super-admin/dashboard/vendors/${v.id}`}
                                            className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-slate-700 transition-all">
                                            <ExternalLink size={14} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ledger entries */}
                        {partner.ledger_entries?.length > 0 && (
                            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                                <div className="p-8 border-b border-slate-50">
                                    <h3 className="text-sm font-black text-slate-800">Recent Ledger Activity</h3>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {partner.ledger_entries.slice(0, 5).map((entry: any) => (
                                        <div key={entry.id} className="flex items-center justify-between px-8 py-4">
                                            <div>
                                                <div className="text-xs font-bold text-slate-700">{entry.description || entry.type}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">{new Date(entry.created_at).toLocaleDateString()}</div>
                                            </div>
                                            <span className={`text-sm font-black ${(entry.amount || 0) >= 0 ? "text-[#27954D]" : "text-rose-500"}`}>
                                                {(entry.amount || 0) >= 0 ? "+" : ""}₹{Math.abs(entry.amount || 0)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── GOVERNANCE ──────────────────────────────── */}
            {activeTab === "governance" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Governance Controls</h3>
                                <button
                                    onClick={handleSaveGovernance}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-black transition-all disabled:opacity-50"
                                >
                                    {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                                    Save
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Account Status</label>
                                    <select value={gov.status} onChange={e => setGov(g => ({ ...g, status: e.target.value }))}
                                        className={`w-full border rounded-2xl px-4 py-3 font-black outline-none transition-all appearance-none text-sm ${gov.status === "ACTIVE" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-600"}`}>
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="PENDING">PENDING</option>
                                        <option value="SUSPENDED">SUSPENDED</option>
                                        <option value="DORMANT">DORMANT</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Partner Tier</label>
                                    <select value={gov.role} onChange={e => setGov(g => ({ ...g, role: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 outline-none appearance-none text-sm">
                                        <option value="AFFILIATE">AFFILIATE — Commission only</option>
                                        <option value="PLATFORM">PLATFORM — Full white-label</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Commission Rate (%)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input type="number" value={gov.commission_pct} onChange={e => setGov(g => ({ ...g, commission_pct: e.target.value }))}
                                            placeholder="20"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 font-bold text-slate-800 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 flex justify-between">
                                        <span>Force Password Reset</span>
                                        <span className="text-slate-300 normal-case font-medium">Leave blank to keep</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input type={showPass ? "text" : "password"} value={gov.password}
                                            onChange={e => setGov(g => ({ ...g, password: e.target.value }))}
                                            placeholder="New password..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-3 font-bold text-slate-800 outline-none focus:border-rose-300 transition-all" />
                                        <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 space-y-4">
                            <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                                <AlertOctagon size={14} /> Danger Zone
                            </h3>
                            <button onClick={handleDelete}
                                className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                <Trash2 size={14} /> Delete Partner (Permanent)
                            </button>
                            <p className="text-[10px] text-rose-400 font-medium">This will purge all data, referrals, and ledger history associated with this partner.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6">
                            <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-widest mb-3">
                                <AlertTriangle size={14} /> Security Advisory
                            </div>
                            <p className="text-xs text-amber-700/80 font-medium leading-relaxed">
                                Changing a partner's tier from PLATFORM to AFFILIATE will immediately revoke their white-label branding and custom domain access. Their vendors will fall back to the default Grafty branding.
                            </p>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6">
                            <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest mb-3">
                                <LogIn size={14} /> Impersonation
                            </div>
                            <p className="text-xs text-blue-700/80 font-medium leading-relaxed mb-4">
                                Opens the partner's dashboard in a new tab using a temporary token. All actions taken during impersonation are logged to the audit trail.
                            </p>
                            <button onClick={handleImpersonate}
                                className="w-full py-3 bg-[#042f94] text-white rounded-2xl text-xs font-black hover:bg-[#031f6b] transition-all">
                                Open Partner Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── BRANDING (PLATFORM only) ──────────────────────────────── */}
            {activeTab === "branding" && isPlatform && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-slate-800">White-Label Branding Override</h3>
                            <p className="text-xs text-slate-400 mt-1">Configure branding on behalf of this platform partner. Changes take effect immediately for their vendors.</p>
                        </div>
                        <button onClick={handleSaveBranding} disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-black transition-all disabled:opacity-50">
                            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                            Save Branding
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Identity */}
                            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Palette size={14} /> Visual Identity</h4>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Platform Name</label>
                                    <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-bold outline-none focus:border-slate-900 transition-all"
                                        placeholder="e.g. ChatPro, NexusCRM..."
                                        value={branding.brand_name}
                                        onChange={e => setBranding(b => ({ ...b, brand_name: e.target.value }))} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <SmartUploader label="Logo" defaultValue={branding.logo_url}
                                        onUploadSuccess={(url: string) => setBranding(b => ({ ...b, logo_url: url }))}
                                        description="PNG/SVG, 400px wide" />
                                    <SmartUploader label="Favicon" defaultValue={branding.favicon_url}
                                        onUploadSuccess={(url: string) => setBranding(b => ({ ...b, favicon_url: url }))}
                                        description="32×32 PNG/ICO" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Primary Color</label>
                                        <div className="flex gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3">
                                            <input type="color" value={branding.primary_color}
                                                onChange={e => setBranding(b => ({ ...b, primary_color: e.target.value }))}
                                                className="w-10 h-10 rounded-xl border-none bg-transparent cursor-pointer" />
                                            <input type="text" value={branding.primary_color}
                                                onChange={e => setBranding(b => ({ ...b, primary_color: e.target.value }))}
                                                className="bg-transparent font-bold text-sm text-slate-800 outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Secondary Color</label>
                                        <div className="flex gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3">
                                            <input type="color" value={branding.secondary_color}
                                                onChange={e => setBranding(b => ({ ...b, secondary_color: e.target.value }))}
                                                className="w-10 h-10 rounded-xl border-none bg-transparent cursor-pointer" />
                                            <input type="text" value={branding.secondary_color}
                                                onChange={e => setBranding(b => ({ ...b, secondary_color: e.target.value }))}
                                                className="bg-transparent font-bold text-sm text-slate-800 outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Support & Domain */}
                            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Globe size={14} /> Domain & Support</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <BrandingField label="Custom Domain" placeholder="portal.partner.com" value={branding.custom_domain} onChange={(v: string) => setBranding(b => ({ ...b, custom_domain: v }))} />
                                    <BrandingField label="Support Email" placeholder="support@partner.com" value={branding.support_email} onChange={(v: string) => setBranding(b => ({ ...b, support_email: v }))} />
                                    <BrandingField label="Help Center URL" placeholder="https://help.partner.com" value={branding.support_url} onChange={(v: string) => setBranding(b => ({ ...b, support_url: v }))} />
                                </div>
                            </div>
                        </div>

                        {/* Live preview */}
                        <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl h-fit">
                            <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-4">Preview</div>
                            <div className="bg-white rounded-2xl overflow-hidden">
                                <div className="h-10 border-b border-slate-100 flex items-center gap-2 px-3">
                                    <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center overflow-hidden">
                                        {branding.logo_url
                                            ? <img src={branding.logo_url} className="w-full h-full object-contain" alt="logo" />
                                            : <div className="w-3 h-3 rounded" style={{ backgroundColor: branding.primary_color }} />
                                        }
                                    </div>
                                    <span className="text-xs font-black text-slate-800">{branding.brand_name || "Partner Brand"}</span>
                                </div>
                                <div className="p-3 space-y-1">
                                    {["Dashboard", "Contacts", "Campaigns"].map((item, i) => (
                                        <div key={item} className="h-7 rounded-lg flex items-center px-3"
                                            style={i === 0 ? { backgroundColor: branding.primary_color } : {}}>
                                            <span className={`text-[9px] font-bold ${i === 0 ? "text-white" : "text-slate-400"}`}>{item}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 border-t border-slate-50">
                                    <div className="h-7 rounded-xl flex items-center justify-center text-white text-[9px] font-black"
                                        style={{ backgroundColor: branding.primary_color }}>
                                        New Campaign
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── WALLET & PAYOUTS ──────────────────────────────── */}
            {activeTab === "wallet" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Earnings Summary */}
                    <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-6 shadow-2xl">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Wallet size={14} className="text-[#27954D]" /> Revenue Settlement
                        </h3>
                        <div className="space-y-4">
                            <LedgerRow label="Gross Commission" value={`₹${(partner.total_earnings || 0).toLocaleString()}`} />
                            <LedgerRow label="Disbursed" value={`₹${(partner.paid_earnings || 0).toLocaleString()}`} />
                            <div className="h-px bg-white/5" />
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-[9px] font-black text-[#27954D] uppercase tracking-widest block mb-1">Pending Payout</span>
                                    <span className="text-4xl font-black">₹{pendingEarnings.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleSettlement}
                            disabled={pendingEarnings <= 0}
                            className="w-full py-4 bg-[#27954D] hover:bg-[#1e7a3e] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40"
                        >
                            Record Settlement (₹{pendingEarnings.toLocaleString()})
                        </button>
                    </div>

                    {/* Credit Provision */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <CreditCard size={14} className="text-[#042f94]" /> Provision Credits
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">Add credits directly to this partner's wallet balance for testing, compensation, or bonus allocation.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Amount (Credits)</label>
                                <input type="number" value={creditAmount} onChange={e => setCreditAmount(e.target.value)}
                                    placeholder="e.g. 5000"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 outline-none focus:border-[#042f94]/30 transition-all" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Note (Optional)</label>
                                <input type="text" value={creditNote} onChange={e => setCreditNote(e.target.value)}
                                    placeholder="e.g. Bonus for Q1 performance"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 outline-none focus:border-[#042f94]/30 transition-all" />
                            </div>
                            <button onClick={handleAddCredits} disabled={creditLoading || !creditAmount}
                                className="w-full py-4 bg-[#042f94] hover:bg-[#031f6b] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {creditLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                                {creditLoading ? "Processing..." : "Add Credits"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── AUDIT TRAIL ──────────────────────────────── */}
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
                                        <div className="text-[10px] text-slate-500 mt-1.5 font-mono bg-slate-50 rounded-lg px-3 py-2 truncate">
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

function StatCard({ label, value, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
        purple: "bg-purple-50 text-purple-600"
    };
    return (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${colors[color]}`}>
                <TrendingUp size={18} />
            </div>
            <div className="text-xl font-black text-slate-800">{value}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</div>
        </div>
    );
}

function LedgerRow({ label, value }: any) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-black">{value}</span>
        </div>
    );
}

function BrandingField({ label, placeholder, value, onChange }: any) {
    return (
        <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{label}</label>
            <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-bold outline-none focus:border-slate-900 transition-all placeholder:text-slate-500"
                placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
        </div>
    );
}
