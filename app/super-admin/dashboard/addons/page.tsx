"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Brain, Bot, Users, Save, RefreshCw, 
  Settings2, Eye, EyeOff, Edit3, Trash2, 
  CheckCircle2, AlertCircle, Info, ChevronRight,
  TrendingUp, CreditCard, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Addon {
    id: string;
    name: string;
    title: string;
    description: string | null;
    icon: string | null;
    category: string | null;
    price: number;
    is_active: boolean;
    created_at: string;
}

const ICON_MAP: Record<string, any> = {
    Brain,
    Zap,
    Bot,
    Users,
    Settings2
};

export default function AddonsManagementPage() {
    const [addons, setAddons] = useState<Addon[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAddons();
    }, []);

    async function fetchAddons() {
        try {
            setLoading(true);
            const res = await fetch('/api/super-admin/addons');
            const data = await res.json();
            if (data.data) {
                setAddons(data.data);
            }
        } catch (e) {
            toast.error("Failed to load addons");
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateAddon() {
        if (!editingAddon) return;
        setSaving(true);
        try {
            const res = await fetch('/api/super-admin/addons', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingAddon.id,
                    price: editingAddon.price,
                    is_active: editingAddon.is_active,
                    title: editingAddon.title,
                    description: editingAddon.description
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`${editingAddon.title} updated successfully!`);
                setEditingAddon(null);
                fetchAddons();
            } else {
                throw new Error(data.error);
            }
        } catch (e: any) {
            toast.error(e.message || "Update failed");
        } finally {
            setSaving(false);
        }
    }

    const toggleStatus = async (addon: Addon) => {
        try {
            const res = await fetch('/api/super-admin/addons', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: addon.id,
                    is_active: !addon.is_active
                })
            });
            if (res.ok) {
                toast.success(`${addon.title} ${!addon.is_active ? 'Activated' : 'Deactivated'}`);
                fetchAddons();
            }
        } catch (e) {
            toast.error("Failed to toggle status");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20 font-sans">
            {/* Header Area */}
            <header className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-200">
                            <Zap className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                                Marketplace Control
                            </h1>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Platform Addons & Micro-Services</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-6 bg-white px-8 py-4 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Services</span>
                        <span className="text-xl font-black text-slate-900">{addons.filter(a => a.is_active).length} / {addons.length}</span>
                    </div>
                    <div className="w-px h-10 bg-slate-100" />
                    <button 
                        onClick={fetchAddons}
                        className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-all"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </header>

            {/* Price Adjustment Warning */}
            <div className="bg-blue-600 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-blue-500/20">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <TrendingUp size={240} />
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="text-blue-200" size={24} />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Economic Protocol</span>
                        </div>
                        <h2 className="text-3xl font-black leading-tight mb-4">Addon Elasticity Controller</h2>
                        <p className="text-blue-100 text-sm font-medium leading-relaxed">
                            Adjust the credit-value of platform modules in real-time. Changes to these values will reflect immediately across all vendor marketplaces. Use with caution during high-traffic windows.
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-lg">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">System Currency</p>
                                <p className="text-xl font-black">PLATFORM CREDITS</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading && addons.length === 0 ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-[400px] bg-white rounded-[40px] border border-slate-100 animate-pulse" />
                    ))
                ) : (
                    addons.map((addon) => {
                        const Icon = ICON_MAP[addon.icon || 'Zap'] || Zap;
                        return (
                            <motion.div 
                                layoutId={addon.id}
                                key={addon.id} 
                                className={`bg-white rounded-[40px] border border-slate-100 p-10 flex flex-col justify-between group hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 relative ${!addon.is_active ? 'opacity-60 bg-slate-50' : ''}`}
                            >
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 ${addon.is_active ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                            <Icon size={28} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => setEditingAddon(addon)}
                                                className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => toggleStatus(addon)}
                                                className={`p-3 rounded-2xl transition-all ${addon.is_active ? 'bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                            >
                                                {addon.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{addon.title}</h3>
                                            {!addon.is_active && <span className="text-[9px] font-black bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-widest">Inactive</span>}
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">{addon.description}</p>
                                    </div>

                                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 group-hover:border-slate-200 transition-all">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Credit Cost</span>
                                            <TrendingUp size={12} className="text-blue-500" />
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-slate-900">{addon.price}</span>
                                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Credits</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-50 mt-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${addon.is_active ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                {addon.category || 'Standard'} Addon
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-300">ID: {addon.id.split('-')[0]}</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingAddon && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingAddon(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-10 lg:p-14">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                                            {React.createElement(ICON_MAP[editingAddon.icon || 'Zap'] || Zap, { size: 24 })}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Modify Addon</h2>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Global Parameter Update</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setEditingAddon(null)}
                                        className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100"
                                    >
                                        &times;
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Title</label>
                                        <input 
                                            type="text" 
                                            value={editingAddon.title}
                                            onChange={e => setEditingAddon(p => p ? { ...p, title: e.target.value } : null)}
                                            className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-blue-500/20 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Credit Cost (Monthly)</label>
                                        <div className="relative">
                                            <CreditCard size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <input 
                                                type="number" 
                                                value={editingAddon.price}
                                                onChange={e => setEditingAddon(p => p ? { ...p, price: parseInt(e.target.value) } : null)}
                                                className="w-full bg-slate-50 border border-transparent rounded-2xl pl-16 pr-6 py-4 text-xl font-black text-slate-900 focus:bg-white focus:border-blue-500/20 outline-none transition-all"
                                            />
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-1">Current Value: {editingAddon.price} Credits</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                        <textarea 
                                            value={editingAddon.description || ''}
                                            onChange={e => setEditingAddon(p => p ? { ...p, description: e.target.value } : null)}
                                            rows={3}
                                            className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-xs font-semibold focus:bg-white focus:border-blue-500/20 outline-none transition-all resize-none"
                                        />
                                    </div>
                                    
                                    <div className="pt-6">
                                        <button 
                                            onClick={handleUpdateAddon}
                                            disabled={saving}
                                            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                                        >
                                            {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                                            Commit Protocol Update
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}

