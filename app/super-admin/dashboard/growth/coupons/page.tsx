"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Ticket, Plus, Search, Filter, Clock, Trash2, Settings, 
    CheckCircle, Calendar, Zap, Landmark, Wallet, IndianRupee,
    ChevronRight, MoreHorizontal, Ban, RefreshCcw, Eye, Download,
    Tag, Percent, Info, AlertTriangle, X
} from 'lucide-react';
import { cn } from "@/lib/utils";

// --- TYPES ---
interface GlobalCoupon {
    id: string;
    code: string;
    discount_type: 'PERCENTAGE' | 'FLAT';
    discount_value: number;
    usage_limit: number;
    usage_count: number;
    is_active: boolean;
    valid_until: string | null;
    new_users_only: boolean;
    razorpay_offer_id: string | null;
    created_at: string;
    plan_restrictions: string[];
    _count?: {
        workspaces: number;
    };
}

const DEFAULT_COUPON = {
    code: "",
    discountType: "PERCENTAGE",
    discountValue: 0,
    usageLimit: 100,
    validUntil: "",
    newUsersOnly: true,
    restrictions: [],
    razorpay_offer_id: ""
};

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<GlobalCoupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form State
    const [form, setForm] = useState(DEFAULT_COUPON);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/super-admin/coupons');
            const data = await res.json();
            if (data.success) {
                setCoupons(data.data);
            }
        } catch (e) {
            console.error(e);
            setError("Failed to load coupons.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!form.code || form.discountValue <= 0) {
            setError("Please provide a valid code and discount value.");
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch('/api/super-admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                setSuccess("Coupon created successfully!");
                setIsCreateModalOpen(false);
                setForm(DEFAULT_COUPON);
                fetchCoupons();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(data.error || "Failed to create coupon.");
            }
        } catch (e) {
            setError("Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/super-admin/coupons/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !currentStatus })
            });
            if (res.ok) fetchCoupons();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        try {
            const res = await fetch(`/api/super-admin/coupons/${id}`, { method: 'DELETE' });
            if (res.ok) fetchCoupons();
        } catch (e) {
            console.error(e);
        }
    };

    const filteredCoupons = coupons.filter(c => 
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: coupons.length,
        active: coupons.filter(c => c.is_active).length,
        totalUsages: coupons.reduce((acc, curr) => acc + curr.usage_count, 0)
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
                            <Ticket className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Coupons</h1>
                            <p className="text-slate-400 font-medium text-sm italic">Generate platform-wide discount codes.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 shadow-inner group w-[300px]">
                        <Search size={18} className="text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <input 
                            placeholder="Find code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300 ml-3 w-full"
                        />
                    </div>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
                    >
                        <Plus size={18} /> New Coupon
                    </button>
                </div>
            </header>

            {/* Success/Error Alerts */}
            <AnimatePresence>
                {success && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-xs font-black uppercase tracking-widest flex items-center gap-3">
                        <CheckCircle size={16} /> {success}
                    </motion.div>
                )}
                {error && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs font-black uppercase tracking-widest flex items-center gap-3">
                        <AlertTriangle size={16} /> {error}
                        <button onClick={() => setError(null)} className="ml-auto opacity-50 hover:opacity-100 transition-opacity"><X size={16} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard label="Total Coupons" value={stats.total} icon={<Ticket className="text-blue-500" />} color="bg-blue-50" />
                <StatCard label="Active Codes" value={stats.active} icon={<Zap className="text-amber-500" />} color="bg-amber-50" />
                <StatCard label="Global Applications" value={stats.totalUsages} icon={<Wallet className="text-emerald-500" />} color="bg-emerald-50" />
            </div>

            {/* Coupons List */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
                        <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Loading Ledger...</p>
                    </div>
                ) : filteredCoupons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                            <Ticket className="text-slate-200" size={40} />
                        </div>
                        <div>
                            <p className="text-slate-900 font-black text-lg">No Coupons Found</p>
                            <p className="text-slate-400 text-sm italic">Start by creating your first platform-wide discount.</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-6">Coupon Identity</th>
                                    <th className="px-8 py-6">Discount Value</th>
                                    <th className="px-8 py-6">Usage Progress</th>
                                    <th className="px-8 py-6">Validity</th>
                                    <th className="px-8 py-6 text-right">Status</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredCoupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-slate-50/10 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
                                                    <Tag size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                                                        {coupon.code}
                                                        {coupon.new_users_only && <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">NEW USERS</span>}
                                                        {coupon.razorpay_offer_id && <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full">RAZORPAY LINKED</span>}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-medium">
                                                        {coupon.razorpay_offer_id ? `Offer: ${coupon.razorpay_offer_id}` : 'Platform Internal Code'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="text-lg font-black text-slate-900">
                                                    {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                                                </div>
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">OFF</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1.5 w-40">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    <span>{coupon.usage_count} / {coupon.usage_limit}</span>
                                                    <span>{Math.round((coupon.usage_count / coupon.usage_limit) * 100)}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={cn("h-full transition-all duration-1000 rounded-full", (coupon.usage_count / coupon.usage_limit) > 0.8 ? "bg-rose-500" : "bg-indigo-600")}
                                                        style={{ width: `${(coupon.usage_count / coupon.usage_limit) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-700">
                                                    {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'LIFETIME'}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">Expires on</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                                                    coupon.is_active ? "bg-green-50 text-[#27954D] hover:bg-red-50 hover:text-red-500 hover:border-red-100" : "bg-slate-100 text-slate-400 hover:bg-green-50 hover:text-green-600"
                                                )}
                                            >
                                                {coupon.is_active ? <CheckCircle size={10} /> : <Ban size={10} />}
                                                {coupon.is_active ? 'Active' : 'Paused'}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleDelete(coupon.id)}
                                                    className="p-2.5 rounded-xl border border-slate-100 text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden border border-slate-100"
                        >
                            <div className="p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                            <Plus size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Create Global Coupon</h3>
                                            <p className="text-slate-400 text-xs font-medium">Setup a platform-wide discount code.</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsCreateModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-900"><X size={20}/></button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razorpay Offer ID (Optional)</label>
                                        <input 
                                            placeholder="E.G. offer_NK7Z..."
                                            value={form.razorpay_offer_id}
                                            onChange={(e) => setForm({...form, razorpay_offer_id: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-mono font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50 transition-all placeholder:text-slate-300"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unique Code</label>
                                        <input 
                                            placeholder="E.G. GRAFTY50"
                                            value={form.code}
                                            onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 outline-none focus:ring-4 ring-indigo-50 transition-all placeholder:text-slate-300"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount Type</label>
                                            <select 
                                                value={form.discountType}
                                                onChange={(e) => setForm({...form, discountType: e.target.value})}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 outline-none focus:ring-4 ring-indigo-50 transition-all cursor-pointer"
                                            >
                                                <option value="PERCENTAGE">Percentage (%)</option>
                                                <option value="FLAT">Flat Amount (₹)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Value</label>
                                            <input 
                                                type="number"
                                                value={form.discountValue}
                                                onChange={(e) => setForm({...form, discountValue: parseFloat(e.target.value)})}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 outline-none focus:ring-4 ring-indigo-50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usage Limit</label>
                                            <input 
                                                type="number"
                                                value={form.usageLimit}
                                                onChange={(e) => setForm({...form, usageLimit: parseInt(e.target.value)})}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 outline-none focus:ring-4 ring-indigo-50 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                                            <input 
                                                type="date"
                                                value={form.validUntil}
                                                onChange={(e) => setForm({...form, validUntil: e.target.value})}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 outline-none focus:ring-4 ring-indigo-50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-[28px] border border-slate-100">
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all", form.newUsersOnly ? "bg-indigo-600 shadow-lg" : "bg-slate-200")}>
                                            <UserCheck size={18} className={form.newUsersOnly ? "text-white" : "text-slate-400"} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-800">New Users Only</p>
                                            <p className="text-[9px] text-slate-400 font-medium italic">Apply only to workspaces with no active plan.</p>
                                        </div>
                                        <button 
                                            onClick={() => setForm({...form, newUsersOnly: !form.newUsersOnly})}
                                            className={cn("w-14 h-8 rounded-full border-2 transition-all relative", form.newUsersOnly ? "bg-indigo-600 border-indigo-600" : "bg-slate-200 border-transparent")}
                                        >
                                            <div className={cn("absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all", form.newUsersOnly ? "right-1" : "left-1")} />
                                        </button>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleCreate}
                                    disabled={submitting}
                                    className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all disabled:opacity-50 active:scale-95"
                                >
                                    {submitting ? "Generating Code..." : "Activate Coupon Code"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ label, value, icon, color }: any) {
    return (
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-2xl hover:-translate-y-1 transition-all">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
            </div>
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm", color)}>
                {icon}
            </div>
        </div>
    );
}

const UserCheck = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
);
