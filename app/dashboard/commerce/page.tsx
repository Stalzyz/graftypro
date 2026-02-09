"use client";

import { useState, useEffect } from "react";
import {
    ShoppingBag,
    RefreshCw,
    Plus,
    CheckCircle2,
    AlertCircle,
    Package,
    ShoppingCart,
    Link as LinkIcon
} from "lucide-react";

export default function CommercePage() {
    const [stores, setStores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mock fetch stores
        setIsLoading(false);
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <ShoppingBag className="text-blue-600" />
                        Commerce Engine
                    </h1>
                    <p className="text-slate-500 mt-1">Connect your stores and automate your sales on WhatsApp.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200">
                    <Plus size={18} />
                    Connect Store
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Stores</p>
                    <h2 className="text-4xl font-black text-slate-900 mt-2">2</h2>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Products Synced</p>
                    <h2 className="text-4xl font-black text-slate-900 mt-2">1,240</h2>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recovered Revenue</p>
                    <h2 className="text-4xl font-black text-slate-900 mt-2 text-emerald-600">₹45,210</h2>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">Your Connected Stores</h3>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            <RefreshCw size={10} className="animate-spin" />
                            Auto-Sync Enabled
                        </span>
                    </div>
                </div>

                <div className="divide-y divide-slate-50">
                    {[
                        { name: "My Shoe Store", platform: "WooCommerce", status: "ACTIVE", icon: "👞" },
                        { name: "Fashion Hub", platform: "Shopify", status: "ACTIVE", icon: "👗" }
                    ].map((store, i) => (
                        <div key={i} className="px-8 py-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                                    {store.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{store.name}</h4>
                                    <p className="text-xs text-slate-500 font-medium">{store.platform}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</p>
                                    <span className="text-emerald-600 text-xs font-bold flex items-center gap-1 mt-1">
                                        <CheckCircle2 size={12} />
                                        {store.status}
                                    </span>
                                </div>
                                <button className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-800 transition-all">
                                    Manage
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <ShoppingCart size={120} />
                    </div>
                    <h3 className="text-2xl font-black mb-2 relative z-10">Abandoned Cart Recovery</h3>
                    <p className="text-blue-100 mb-6 relative z-10 text-sm leading-relaxed max-w-md">
                        Recover up to 25% of lost sales by sending automatic WhatsApp reminders to shoppers who left their checkout.
                    </p>
                    <button className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-blue-900/20 relative z-10">
                        Configure Automation
                    </button>
                </div>

                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <LinkIcon size={120} />
                    </div>
                    <h3 className="text-2xl font-black mb-2 relative z-10">Smart Product Links</h3>
                    <p className="text-slate-400 mb-6 relative z-10 text-sm leading-relaxed max-w-md">
                        Generate trackable WhatsApp links for your top products to use in your social media and marketing campaigns.
                    </p>
                    <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-blue-900/20 relative z-10">
                        Create Smart Link
                    </button>
                </div>
            </div>
        </div>
    );
}
