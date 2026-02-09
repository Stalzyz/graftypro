
"use client";
import { useState, useEffect } from "react";
import {
    ArrowLeft,
    Shield,
    Zap,
    Activity,
    MessageSquare,
    Users,
    LogIn,
    AlertOctagon,
    Save,
    Calendar,
    ArrowUpRight,
    Building2,
    Mail,
    Phone,
    Globe,
    ExternalLink,
    Lock
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VendorDetailPage({ params }: { params: { id: string } }) {
    const [vendor, setVendor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Edit State
    const [plan, setPlan] = useState("");
    const [status, setStatus] = useState("");

    const router = useRouter();

    useEffect(() => {
        fetch(`/api/super-admin/vendors/${params.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.workspace) {
                    setVendor(data.workspace);
                    setPlan(data.workspace.plan);
                    setStatus(data.workspace.status);
                }
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, [params.id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/super-admin/vendors/${params.id}`, {
                method: "PATCH",
                body: JSON.stringify({ plan, status }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) alert("Vendor Updated Successfully");
            else alert("Update Failed");
        } catch (e) {
            alert("Error saving");
        } finally {
            setSaving(false);
        }
    };

    const handleImpersonate = async () => {
        const confirm = window.confirm("⚠️ SECURITY WARNING\n\nYou are about to log in as this user. All actions will be logged.\n\nType 'CONFIRM' to proceed, or Click OK to bypass check in DEV mode.");
        if (!confirm) return;

        try {
            const res = await fetch(`/api/super-admin/vendors/${params.id}`, {
                method: "POST",
                body: JSON.stringify({ action: "impersonate" })
            });
            const data = await res.json();

            if (data.token) {
                document.cookie = `token=${data.token}; path=/; max-age=86400;`;
                window.open("/dashboard", "_blank");
            } else {
                alert("Impersonation failed: " + data.error);
            }
        } catch (e) {
            alert("Network Error");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-[#27954D] border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!vendor) return <div className="p-8 text-red-500 font-bold">Vendor Not Found</div>;

    return (
        <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-20">
            {/* Minimal Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="flex items-start gap-6">
                    <Link href="/super-admin/dashboard/vendors" className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                        <ArrowLeft size={20} className="text-slate-400" />
                    </Link>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{vendor.name}</h1>
                            <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">ID: {vendor.id}</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                            <span className="flex items-center gap-1.5"><Calendar size={14} /> Onboarded {new Date(vendor.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5"><Building2 size={14} /> Enterprise Client</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleImpersonate}
                        className="px-6 py-4 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        <LogIn size={14} /> Stealth Access
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <Activity className="animate-spin" size={14} /> : <Save size={14} />}
                        Sync Changes
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Provisioning Controls */}
                <div className="space-y-8">
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 space-y-10 shadow-sm">
                        <div className="space-y-1">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Shield size={16} className="text-blue-500" /> Subscription Tier
                            </h3>
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Instance Provisioning</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Entitlement Level</label>
                                <select
                                    value={plan}
                                    onChange={(e) => setPlan(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-50 transition-all appearance-none"
                                >
                                    <option value="FREE">Free Tier</option>
                                    <option value="PRO">Pro Plan</option>
                                    <option value="ENTERPRISE">Enterprise High-Density</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Lifecycle Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className={`w-full border rounded-2xl px-6 py-4 font-black outline-none transition-all appearance-none ${status === 'ACTIVE' ? 'bg-green-50 border-green-100 text-[#27954D]' : 'bg-rose-50 border-rose-100 text-rose-500'
                                        }`}
                                >
                                    <option value="ACTIVE">System Operant (ACTIVE)</option>
                                    <option value="SUSPENDED">Access Revoked (SUSPENDED)</option>
                                    <option value="DARMANT">Inactive State (DORMANT)</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-50">
                            <div className="p-6 bg-rose-500/5 rounded-3xl border border-rose-500/10 space-y-4">
                                <div className="flex items-center gap-3 text-rose-500 font-black text-[10px] uppercase tracking-widest">
                                    <AlertOctagon size={16} /> Restricted Actions
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">Decommissioning a workspace is irreversible and purges all message telemetry.</p>
                                <button className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-rose-600 shadow-lg shadow-rose-100">
                                    Terminate Workspace
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Telemetry & Integration */}
                <div className="lg:col-span-2 space-y-10">
                    {/* KPI Pulse */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard label="Total Messages" value={vendor._count.messages} icon={<MessageSquare />} color="blue" />
                        <StatCard label="Campaign Pulse" value={vendor._count.campaigns} icon={<Zap />} color="orange" />
                        <StatCard label="Automation Flow" value={vendor._count.flows} icon={<Activity />} color="emerald" />
                    </div>

                    {/* WABA Health */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Globe size={16} className="text-[#27954D]" /> WhatsApp Ecosystem
                                </h3>
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Meta Cloud API Status</p>
                            </div>
                            <button className="text-[10px] font-black text-[#27954D] uppercase tracking-widest flex items-center gap-2 hover:underline">
                                Sync Meta Data <ArrowUpRight size={14} />
                            </button>
                        </div>

                        {vendor.waba ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-1">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Verified Number</span>
                                    <div className="text-xl font-black text-slate-800">{vendor.waba.phone_number}</div>
                                </div>
                                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-1">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Quality Score</span>
                                    <div className={`text-xl font-black flex items-center gap-2 ${vendor.waba.quality_rating === 'GREEN' ? 'text-[#27954D]' : 'text-amber-500'}`}>
                                        <div className={`w-2 h-2 rounded-full ${vendor.waba.quality_rating === 'GREEN' ? 'bg-[#27954D]' : 'bg-amber-500'}`} />
                                        {vendor.waba.quality_rating || 'NOMINAL'}
                                    </div>
                                </div>
                                <div className="col-span-full p-8 bg-slate-50 border border-slate-100 rounded-[32px] flex items-center justify-between">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">System Identifier (WABA ID)</span>
                                        <div className="text-xs font-mono font-bold text-slate-500">{vendor.waba.waba_id}</div>
                                    </div>
                                    <div className="flex h-10 items-center gap-2 px-4 bg-green-500/10 text-[#27954D] rounded-full text-[10px] font-black uppercase tracking-widest">
                                        Active Integration
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="aspect-[21/9] bg-slate-50 border border-slate-100 rounded-[40px] border-dashed flex flex-col items-center justify-center gap-4">
                                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300">
                                    <Shield size={24} />
                                </div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">No Official WhatsApp API Linked</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }: any) {
    const colors: any = {
        blue: "text-blue-600 bg-blue-50",
        orange: "text-orange-600 bg-orange-50",
        emerald: "text-[#27954D] bg-[#27954D]/10",
    };

    return (
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-4 group hover:shadow-xl transition-all duration-500">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                {icon}
            </div>
            <div>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value.toLocaleString()}</h3>
            </div>
        </div>
    );
}
