"use client";
import React, { useState } from 'react';
import { Mail, Phone, ArrowRight, Loader2, CheckCircle2, FileText, Download } from 'lucide-react';

interface Props {
    toolName: string;
    onSuccess: () => void;
    title?: string;
    description?: string;
}

export function ToolLeadCapture({ toolName, onSuccess, title, description }: Props) {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/leads/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    whatsapp_number: formData.phone,
                    goal: `report_${toolName.toLowerCase().replace(/\s+/g, '_')}`,
                    business_name: toolName
                })
            });

            if (res.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    onSuccess();
                }, 3000);
            }
        } catch (err) {
            console.error("Lead Capture Error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-black text-emerald-900 mb-2">Report Sent!</h3>
                <p className="text-sm font-medium text-emerald-800/70 mb-4">
                    Check your WhatsApp and Email for your detailed {toolName} report.
                </p>
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 animate-pulse">
                    Connecting to WhatsApp Architecture...
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 text-white/5 font-black text-6xl italic transform translate-x-1/2 -translate-y-1/2 uppercase tracking-tighter">GATED</div>
            
            <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <FileText size={24} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tighter leading-tight">
                        {title || `Get Your Detailed ${toolName} Report`}
                    </h2>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                        {description || "Enter your contact details below to receive a professional audit and cost architecture directly on your WhatsApp."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Your Name</label>
                            <input 
                                required
                                type="text" 
                                placeholder="Stalin Kumar"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white/10 outline-none transition-all placeholder:text-white/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">WhatsApp Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                <input 
                                    required
                                    type="tel" 
                                    placeholder="919876543210"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:bg-white/10 outline-none transition-all placeholder:text-white/20"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                            <input 
                                required
                                type="email" 
                                placeholder="stalin@grafty.pro"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:bg-white/10 outline-none transition-all placeholder:text-white/20"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-500/10 mt-4 active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Send My Report <Download size={16} />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    🔒 No Credit Card Required • Instant Delivery via WhatsApp
                </p>
            </div>
        </div>
    );
}
