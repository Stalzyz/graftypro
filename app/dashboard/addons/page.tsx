"use client";

import { useState, useEffect } from "react";
import { 
  Puzzle, Zap, ShieldCheck, Sparkles, 
  ArrowRight, CheckCircle2, Lock, Loader2,
  Layout, Bot, BarChart4, Globe, Users, Brain
} from "lucide-react";
import toast from "react-hot-toast";

interface Addon {
    id: string;
    name: string;
    title: string;
    description: string;
    icon: string;
    price: number;
    isActive: boolean;
    isActivated?: boolean;
}

const ICON_MAP: any = {
    'Layout': <Layout className="w-6 h-6" />,
    'Bot': <Bot className="w-6 h-6" />,
    'BarChart4': <BarChart4 className="w-6 h-6" />,
    'Globe': <Globe className="w-6 h-6" />,
    'Zap': <Zap className="w-6 h-6" />,
    'Users': <Users className="w-6 h-6" />,
    'Brain': <Brain className="w-6 h-6 text-emerald-500" />
};

export default function AddonsMarketplace() {
    const [addons, setAddons] = useState<Addon[]>([]);
    const [loading, setLoading] = useState(true);
    const [activating, setActivating] = useState<string | null>(null);

    useEffect(() => {
        const fetchAddons = async () => {
            try {
                const res = await fetch('/api/dashboard/addons');
                const data = await res.json();
                if (data.success) {
                    setAddons(data.addons);
                } else {
                    toast.error(data.error || "Failed to load addons");
                }
            } catch (e) {
                toast.error("Network Error: Could not reach Marketplace");
            } finally {
                setLoading(false);
            }
        };
        fetchAddons();
    }, []);

    const handleActivate = async (addon: Addon) => {
        if (addon.isActivated) {
            toast.success(`${addon.title} is already active!`);
            return;
        }

        setActivating(addon.id);
        try {
            const res = await fetch('/api/dashboard/addons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ addonId: addon.id })
            });
            const data = await res.json();
            
            if (data.success) {
                setAddons(prev => prev.map(a => 
                    a.id === addon.id ? { ...a, isActivated: true } : a
                ));
                toast.success(`Welcome to the next level! ${addon.title} activated. 🚀`);
            } else {
                toast.error(data.error || "Activation failed");
            }
        } catch (e) {
            toast.error("Activation failed: Server Error");
        } finally {
            setActivating(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Entering the Monster Zone...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                        <Puzzle size={24} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Addons Marketplace</h1>
                </div>
                <p className="text-gray-500 font-bold max-w-2xl">
                    Modular features to power up your Grafty workspace. Enable specifically what you need, only when you need it.
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {addons.map((addon) => (
                    <div 
                        key={addon.id}
                        className={`group relative overflow-hidden bg-white border-2 rounded-3xl p-6 transition-all ${
                            addon.isActivated 
                            ? 'border-emerald-100 bg-emerald-50/20' 
                            : 'border-gray-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100'
                        }`}
                    >
                        {/* Icon & Status */}
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${
                                addon.isActivated ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-gray-50 text-gray-600 group-hover:bg-[#27954D] group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-200 transition-all'
                            }`}>
                                {ICON_MAP[addon.icon] || <Zap />}
                            </div>
                            {addon.isActivated ? (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    <CheckCircle2 size={12} /> Active
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    <Lock size={12} /> Locked
                                </div>
                            )}
                        </div>

                        {/* Text */}
                        <h3 className="text-lg font-black text-gray-900 mb-2 truncate">{addon.title}</h3>
                        <p className="text-xs text-gray-500 font-bold leading-relaxed mb-6 h-10 overflow-hidden line-clamp-2">
                            {addon.description}
                        </p>

                        {/* Footer / CTA */}
                        <div className="flex items-center justify-between border-t border-gray-100 pt-5 mt-auto">
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${addon.isActivated ? 'text-emerald-600' : 'text-gray-400'}`}>
                                    {addon.isActivated ? 'Unlimited Access' : 'Modular Cost'}
                                </span>
                                <span className="text-sm font-black text-gray-800 uppercase">
                                    {addon.isActivated ? 'FREE' : `${addon.price} Credits`}
                                    {!addon.isActivated && <span className="text-[10px] text-gray-400 ml-1">/ mo</span>}
                                </span>
                            </div>

                            <button
                                onClick={() => handleActivate(addon)}
                                disabled={activating === addon.id}
                                className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                    addon.isActivated 
                                    ? 'bg-transparent text-emerald-600 border border-emerald-200 cursor-default' 
                                    : 'bg-[#27954D] text-white hover:bg-[#1e7a3d] shadow-lg shadow-emerald-100 active:scale-95'
                                }`}
                            >
                                {activating === addon.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : addon.isActivated ? (
                                    'Activated'
                                ) : (
                                    <>Enable Now <ArrowRight size={12} /></>
                                )}
                            </button>
                        </div>
                    </div>
                ))}

                {/* Coming Soon Card */}
                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center bg-gray-50/50">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                        <Sparkles size={20} />
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">More Monsters Coming...</p>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="mt-20 p-8 bg-gradient-to-r from-[#27954D] to-[#042f94] rounded-[40px] text-white overflow-hidden relative shadow-2xl">
                <div className="relative z-10">
                    <h2 className="text-xl font-black mb-2 flex items-center gap-2">
                        <ShieldCheck className="text-emerald-400" /> Hardened Feature Gating
                    </h2>
                    <p className="text-sm text-gray-400 font-bold max-w-xl">
                        Addons are securely provisioned per-workspace. Once activated, our logic engine unlocks the corresponding capabilities across all modules instantly.
                    </p>
                </div>
                {/* Decorative element */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            </div>
        </div>
    );
}
