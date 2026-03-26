"use client";
import React, { useEffect, useState } from 'react';
import {
    Users,
    Plus,
    Shield,
    Search,
    ExternalLink,
    MoreVertical,
    CreditCard,
    Zap,
    TrendingUp,
    AlertCircle,
    BarChart2,
    Lock,
    Loader2,
    ChevronRight,
    Wallet,
    Building,
    Mail,
    RefreshCw,
    X
} from 'lucide-react';
import { safeToLocaleString, formatCurrency, ensureNumber } from '@/lib/utils/number-format';


const PLANS = ["FREE", "STARTER", "PRO", "ENTERPRISE"];

export default function MyVendors() {
    const [vendors, setVendors] = useState<any[]>([]);
    const [partner, setPartner] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [adding, setAdding] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newMapping, setNewMapping] = useState({ workspaceId: "", description: "" });
    const [formData, setFormData] = useState({ business_name: "", email: "", password: "", plan: "FREE" });
    const [formError, setFormError] = useState("");

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [vRes, pRes, sRes] = await Promise.all([
                fetch("/api/reseller/vendors"),
                fetch("/api/reseller/me"),
                fetch("/api/reseller/stats")
            ]);
            const vData = await vRes.json();
            const pData = await pRes.json();
            const sData = await sRes.json();
            if (vData.data) setVendors(vData.data);
            if (pData.data) setPartner(pData.data);
            if (!sData.error) setStats(sData);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const fetchVendors = async () => {
        try {
            const res = await fetch("/api/reseller/vendors");
            const data = await res.json();
            if (data.data) setVendors(data.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddVendor = async (e: any) => {
        e.preventDefault();
        setAdding(true);
        try {
            const res = await fetch("/api/reseller/vendors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMapping)
            });
            if (res.ok) {
                setIsAddModalOpen(false);
                fetchVendors();
                setNewMapping({ workspaceId: "", description: "" });
            } else {
                const err = await res.json();
                alert(err.error || "Linking Failed");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setAdding(false);
        }
    };

    const handleCreateVendor = async (e: any) => {
        e.preventDefault();
        setCreating(true);
        setFormError("");
        try {
            const res = await fetch("/api/reseller/vendors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setIsCreateModalOpen(false);
                setFormData({ business_name: "", email: "", password: "", plan: "FREE" });
                fetchVendors();
            } else {
                setFormError(data.error || "Creation Failed");
            }
        } catch (e) {
            console.error(e);
            setFormError("Network Error");
        } finally {
            setCreating(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
    );

    const isPlatform = partner?.role === "PLATFORM";

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Simplified Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-600 font-black text-[9px] uppercase tracking-[0.3em] mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                        Vendor Network
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                        My Vendors<span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm tracking-tight italic">Manage and monitor all active vendors in your network.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <Shield size={16} /> Link New Vendor
                    </button>
                    {isPlatform && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-black transition-all shadow-lg shadow-black/10 active:scale-95"
                        >
                            <Plus size={18} /> Create New Vendor
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Managed</div>
                    <div className="text-2xl font-black text-slate-900">{vendors.length}</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-1 uppercase">Active Workspaces</div>
                </div>
                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Portfolio Value</div>
                    <div className="text-2xl font-black text-slate-900">{formatCurrency(vendors.reduce((acc, v) => acc + (v.balance || 0), 0))}</div>

                    <div className="text-[10px] text-slate-500 font-medium mt-1 uppercase">Aggregate Credits</div>
                </div>
                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Critical Alerts</div>
                    <div className="text-2xl font-black text-red-500">{vendors.filter(v => v.balance < 500).length}</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-1 uppercase text-red-400">Low Balance Threat</div>
                </div>
                <div className="bg-[#E9F5ED] p-6 rounded-[1.5rem] border border-[#D1EADC] shadow-sm shadow-[#27954D]/5">
                    <div className="text-[10px] font-black text-[#1E743C] uppercase tracking-widest mb-2">Retention Rate</div>
                    <div className="text-2xl font-black text-[#1E743C]">{stats?.monthly?.retention_rate || '100'}%</div>
                    <div className="text-[10px] text-[#27954D] font-medium mt-1 uppercase italic">Verified</div>
                </div>
            </div>

            {/* Vendors Table */}
            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Identify specific vendor..."
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 text-sm font-medium focus:border-blue-600 outline-none transition-all shadow-inner placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5">Managed Entity</th>
                                <th className="px-8 py-5">Credit Health</th>
                                <th className="px-8 py-5">Plan</th>
                                <th className="px-8 py-5">Volume</th>
                                <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {vendors.map((v: any) => (
                                <tr key={v.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-blue-600 text-lg border border-slate-200 group-hover:scale-105 transition-all">
                                                {v.name.substring(0, 1)}
                                            </div>
                                            <div>
                                                <div className="text-slate-900 font-bold tracking-tight text-base">{v.business_name || v.name}</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${v.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'
                                                        }`}>{v.status}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tabular-nums tracking-tighter">ID: {v.id.slice(0, 8)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${v.balance < 500 ? 'bg-red-500 animate-pulse' : 'bg-blue-600'}`}></div>
                                            <div>
                                                <div className={`text-lg font-black tracking-tight ${v.balance < 500 ? 'text-red-500' : 'text-slate-900'}`}>
                                                    {formatCurrency(v.balance)}

                                                </div>
                                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Credits</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl w-fit">
                                            <Zap size={12} className="text-amber-500" />
                                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{v.plan || 'Standard'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-6">
                                            <div>
                                                <div className="text-xs font-black text-slate-700">{safeToLocaleString(v.stats?.total_messages)}</div>

                                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Messages</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-slate-700">{safeToLocaleString(v.stats?.total_campaigns)}</div>

                                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Campaigns</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 text-slate-400">
                                            <button className="p-2 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-all border border-transparent hover:border-slate-200">
                                                <ExternalLink size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-all border border-transparent hover:border-slate-200">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Link Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white border border-slate-200 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Add Vendor</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Link existing workspace to your profile</p>
                            </div>
                            <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                                <Lock size={20} />
                            </div>
                        </div>

                        <form onSubmit={handleAddVendor} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="workspace-uid" className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Workspace UID</label>
                                <input
                                    id="workspace-uid"
                                    required
                                    type="text"
                                    placeholder="Enter Workspace ID"
                                    value={newMapping.workspaceId}
                                    onChange={(e) => setNewMapping({ ...newMapping, workspaceId: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="op-notes" className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Operational Notes</label>
                                <textarea
                                    id="op-notes"
                                    rows={3}
                                    placeholder="Sales context / mapping reason..."
                                    value={newMapping.description}
                                    onChange={(e) => setNewMapping({ ...newMapping, description: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all resize-none placeholder:text-slate-300"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-4 bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="flex-[2] py-4 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {adding ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={18} />}
                                    Link Vendor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white border border-slate-200 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Create Workspace</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Create a new tenant node directly</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm hover:text-rose-500 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        {formError && (
                            <div className="mx-10 mt-6 bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                <AlertCircle size={16} /> {formError}
                            </div>
                        )}

                        <form onSubmit={handleCreateVendor} className="p-10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Business Name</label>
                                    <div className="relative">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Acme Corp"
                                            value={formData.business_name}
                                            onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Owner Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input
                                            required
                                            type="email"
                                            placeholder="owner@acme.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Security Key (Pass)</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input
                                            required
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Activation Tier</label>
                                    <div className="relative">
                                        <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <select
                                            value={formData.plan}
                                            onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none"
                                        >
                                            {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full py-4 bg-slate-900 text-white hover:bg-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
                            >
                                {creating ? <RefreshCw size={18} className="animate-spin" /> : <Plus size={18} />}
                                Create Vendor
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
