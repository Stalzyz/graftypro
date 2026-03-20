"use client";

import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from "react";

// --- ABSOLUTE DESTROYER: NO LUCIDE ICONS (Confirm library stability) ---
// Using emojis temporarily as forensic indicators.

/**
 * FORCED ERROR BOUNDARY (Isolation Layer)
 */
class LocalErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: any }> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("[CRASH DETECTED]:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-20 bg-rose-50 border-4 border-rose-200 rounded-[48px] text-rose-900">
                    <h2 className="text-4xl font-black mb-4">CRASH RECOVERED</h2>
                    <p className="font-bold mb-8">Isolated Error: {String(this.state.error)}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-rose-900 text-white px-8 py-4 rounded-2xl font-bold uppercase"
                    >
                        Force Restart Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function PackagesPage() {
    return (
        <LocalErrorBoundary>
            <PackagesPageInternal />
        </LocalErrorBoundary>
    );
}

function PackagesPageInternal() {
    const [isMounted, setIsMounted] = useState(false);
    const [packages, setPackages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<any>(null);

    useEffect(() => {
        setIsMounted(true);
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/super-admin/packages");
            const json = await res.json();
            
            console.log("[ABSOLUTE RENDER] API Response:", json);
            
            let dataArray = [];
            if (json && typeof json === 'object') {
                if (Array.isArray(json.data)) dataArray = json.data;
                else if (Array.isArray(json)) dataArray = json;
            }

            console.log("[ABSOLUTE RENDER] Raw Array Data:", dataArray);
            console.log("[ABSOLUTE RENDER] Is Array Check:", Array.isArray(dataArray));
            
            // Final check: filter out any null entries that shouldn't be there
            const cleanArray = Array.isArray(dataArray) ? dataArray.filter(i => i && typeof i === 'object') : [];
            setPackages(cleanArray);
            
        } catch (error) {
            console.error("[ABSOLUTE FETCH ERROR]:", error);
            setPackages([]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isMounted) return <div className="min-h-screen bg-[#F8FAFC]"></div>;

    // --- ABSOLUTE DESTROYER: PRE-LOOP GUARD ---
    const renderData = Array.isArray(packages) ? packages : [];
    console.log("[ABSOLUTE RENDER] Packages List Type:", typeof renderData);
    console.log("[ABSOLUTE RENDER] Packages List Constructor:", renderData.constructor.name);

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans selection:bg-indigo-100">
            {/* Header */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter flex items-center gap-3">
                        👑 Core Registry (Absolute)
                    </h1>
                </div>
                <button 
                    onClick={() => { setEditingPackage(null); setIsModalOpen(true); }}
                    className="bg-[#4F46E5] text-white px-10 py-5 rounded-3xl font-black text-xs uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                    + Create Blueprint
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-black text-slate-400 uppercase text-xs tracking-widest">Querying Infrastructure...</p>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto">
                    {!Array.isArray(renderData) || renderData.length === 0 ? (
                        <div className="bg-white border-4 border-dashed border-slate-200 rounded-[64px] p-32 text-center">
                            <h3 className="text-2xl font-black text-slate-300 uppercase italic">Empty Sector</h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {/* --- ABSOLUTE DESTROYER: MAP IS PROTECTED --- */}
                            {renderData.map((pkg, idx) => {
                                // Double-Layer Protection: Ensure pkg is an object
                                if (!pkg || typeof pkg !== 'object') return null;

                                const safeId = String(pkg.id || `temp-${idx}`);
                                const safeName = String(pkg.name || "UNNAMED");
                                const safePrice = Number(pkg.monthly_price || 0);
                                const safeMessages = Number(pkg.max_messages || 0);
                                const safeContacts = Number(pkg.max_contacts || 0);
                                const isFeatured = pkg.is_featured === true;

                                return (
                                    <div key={safeId} className={`relative bg-white p-10 rounded-[60px] border-4 transition-all hover:shadow-2xl ${isFeatured ? 'border-indigo-600 ring-8 ring-indigo-50' : 'border-white shadow-xl'}`}>
                                        
                                        <div className="flex justify-end gap-2 mb-6 absolute top-8 right-8">
                                             <button onClick={() => { setEditingPackage(pkg); setIsModalOpen(true); }} className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-[10px] uppercase hover:bg-slate-200">Edit</button>
                                        </div>

                                        <h3 className="text-3xl font-black text-slate-900 mb-2">{safeName}</h3>
                                        <p className="text-slate-400 mb-8 text-[10px] font-black uppercase tracking-widest">{String(pkg.description || "No Protocol Description")}</p>

                                        <div className="bg-slate-50 p-8 rounded-[40px] mb-10 border border-slate-100">
                                            <div className="text-4xl font-black text-slate-900 mb-1">{String(pkg.currency || "INR")} {safePrice}</div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Credits</div>
                                        </div>

                                        <div className="flex flex-col gap-4 mb-10">
                                            <div className="py-2 border-b border-slate-50 flex justify-between items-center">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Contacts</span>
                                                <span className="font-black text-slate-900">{safeContacts}</span>
                                            </div>
                                            <div className="py-2 border-b border-slate-50 flex justify-between items-center">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Messages</span>
                                                <span className="font-black text-slate-900 text-sm">{safeMessages === -1 ? "∞" : safeMessages}</span>
                                            </div>
                                        </div>

                                        <button className={`w-full py-5 rounded-[32px] font-black text-xs uppercase shadow-lg ${isFeatured ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'}`}>
                                            {String(pkg.cta_label || "Select Model")}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
                    <div className="bg-white w-full max-w-4xl h-auto max-h-[90vh] rounded-[56px] flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                        <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                            <h2 className="text-2xl font-black uppercase tracking-tight">{editingPackage ? "Config" : "Build"} Base</h2>
                            <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center font-black text-xl">X</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-10">
                           <PackageForm onCancel={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); fetchPackages(); }} initialData={editingPackage} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- DEFENSIVE FORM ---
function PackageForm({ onCancel, onSuccess, initialData }: any) {
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: String(initialData?.name || ""),
        description: String(initialData?.description || ""),
        monthly_price: Number(initialData?.monthly_price || 0),
        currency: String(initialData?.currency || "INR"),
        max_contacts: Number(initialData?.max_contacts || 0),
        max_messages: Number(initialData?.max_messages || 0),
        max_flows: Number(initialData?.max_flows || 0),
        is_featured: !!initialData?.is_featured,
        badge_text: String(initialData?.badge_text || ""),
        cta_label: String(initialData?.cta_label || "Get Started")
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const url = initialData?.id ? `/api/super-admin/packages/${initialData.id}` : "/api/super-admin/packages";
            const method = initialData?.id ? "PATCH" : "POST";
            
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    monthly_price: Number(formData.monthly_price),
                    max_contacts: Number(formData.max_contacts),
                    max_messages: Number(formData.max_messages),
                    max_flows: Number(formData.max_flows),
                })
            });

            if (res.ok) onSuccess();
            else alert("Protocol Update Failed.");
        } catch (error) { 
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-10">
            <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Prototype Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-3xl font-bold outline-none transition-all" />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Currency Node</label>
                    <input required type="text" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-3xl font-bold outline-none transition-all" />
                </div>
                <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">System Log/Description</label>
                    <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-3xl font-bold outline-none transition-all" rows={3} />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Price (MO)</label>
                     <input type="number" value={formData.monthly_price} onChange={e => setFormData({...formData, monthly_price: Number(e.target.value)})} className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none" />
                </div>
                <div>
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Contacts</label>
                     <input type="number" value={formData.max_contacts} onChange={e => setFormData({...formData, max_contacts: Number(e.target.value)})} className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none" />
                </div>
                <div>
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Messages</label>
                     <input type="number" value={formData.max_messages} onChange={e => setFormData({...formData, max_messages: Number(e.target.value)})} className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none" />
                </div>
                <div>
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Flow Limit</label>
                     <input type="number" value={formData.max_flows} onChange={e => setFormData({...formData, max_flows: Number(e.target.value)})} className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none" />
                </div>
            </div>

            <div className="p-8 bg-indigo-50 border-2 border-indigo-100 rounded-[32px] flex items-center gap-6">
               <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} className="w-8 h-8 rounded-xl" />
               <div>
                   <p className="font-black text-indigo-900 uppercase text-xs">Flag as Featured Prototype</p>
                   <p className="text-[10px] text-indigo-400 font-bold">Priority listing in the vendor sector.</p>
               </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 pt-10">
                <button type="submit" disabled={isLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white p-8 rounded-[32px] font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50">
                    {isLoading ? "Running Script..." : "Commit Changes"}
                </button>
                <button type="button" onClick={onCancel} className="px-10 py-8 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-[32px] font-black uppercase tracking-widest transition-all">
                    Abort
                </button>
            </div>
        </form>
    );
}
