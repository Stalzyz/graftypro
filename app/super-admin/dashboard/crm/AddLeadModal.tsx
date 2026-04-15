
"use client";

import { useState } from "react";
import { X, Send, User, Mail, Phone, Briefcase, IndianRupee, Rocket, Loader2 } from "lucide-react";

export default function AddLeadModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company_name: "",
        deal_value: "",
        source: "DIRECT_INBOUND",
        type: "VENDOR"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/super-admin/crm/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    deal_value: parseFloat(formData.deal_value) || 0
                })
            });
            if (res.ok) {
                onSuccess();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-xl bg-white rounded-[48px] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
                <header className="p-10 bg-slate-900 text-white flex justify-between items-start">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                                <Rocket size={20} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">Capture Prospect</h2>
                        </div>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Hydrate platform growth pipeline</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                        <X size={24} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Identity</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900 transition-all font-medium" 
                                    placeholder="e.g. Rahul Sharma"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900 transition-all font-medium" 
                                    placeholder="rahul@company.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900 transition-all font-medium" 
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Deal Valuation</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input 
                                    type="number"
                                    value={formData.deal_value}
                                    onChange={e => setFormData({...formData, deal_value: e.target.value})}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900 transition-all font-medium" 
                                    placeholder="50000"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Company / Organization</label>
                        <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input 
                                value={formData.company_name}
                                onChange={e => setFormData({...formData, company_name: e.target.value})}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900 transition-all font-medium" 
                                placeholder="Grekam Solutions Pvt Ltd"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            disabled={loading}
                            className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:bg-slate-300"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                            {loading ? "COMMITTING TO DATABASE..." : "CREATE PROSPECT ENTRY"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
