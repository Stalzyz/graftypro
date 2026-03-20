"use client";

import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from "react";

/**
 * ABSOLUTE DESTROYER: NO LUCIDE ICONS (Absolute Library Stability)
 * Using emojis for forensic indicators and UI clarity in "Nuclear" mode.
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
                <div className="p-20 bg-rose-50 border-4 border-rose-200 rounded-[48px] text-rose-900 shadow-2xl animate-in fade-in zoom-in duration-500">
                    <div className="flex items-center gap-6 mb-8">
                        <span className="text-8xl">☢️</span>
                        <div>
                            <h2 className="text-5xl font-black tracking-tighter uppercase">Protocol Failure</h2>
                            <p className="font-bold text-rose-600 opacity-80 uppercase tracking-widest mt-2 px-1 text-xs">Node Isolation Active</p>
                        </div>
                    </div>
                    
                    <div className="bg-white/50 p-10 rounded-[40px] border-2 border-rose-100 mb-10 overflow-auto max-h-[300px]">
                        <p className="font-mono text-sm leading-relaxed">
                            <span className="font-black text-rose-900 block mb-2">[HEX_DUMP]:</span>
                            {String(this.state.error?.stack || this.state.error)}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-rose-900 text-white px-10 py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-all"
                        >
                            Force System Re-Initialize
                        </button>
                    </div>
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
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            
            const json = await res.json();
            const dataArray = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
            
            // Filter and sanitize
            const cleanArray = dataArray.filter((i: any) => i && typeof i === 'object');
            setPackages(cleanArray);
            
        } catch (error) {
            console.error("[FETCH CRASH]:", error);
            setPackages([]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isMounted) return <div className="min-h-screen bg-[#F8FAFC]"></div>;

    const renderData = Array.isArray(packages) ? packages : [];

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans selection:bg-indigo-100">
            {/* Header */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter flex items-center gap-4">
                        <span className="p-4 bg-indigo-600 rounded-[28px] text-3xl shadow-xl shadow-indigo-100 italic">B</span>
                        Core Blueprint Registry
                    </h1>
                    <p className="mt-3 text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] ml-2">Total active subscription models: {renderData.length}</p>
                </div>
                <button 
                    onClick={() => { setEditingPackage(null); setIsModalOpen(true); }}
                    className="bg-[#0F172A] text-white px-10 py-5 rounded-[32px] font-black text-xs uppercase shadow-[0_20px_40px_rgba(15,23,42,0.2)] hover:bg-slate-800 transition-all flex items-center gap-3"
                >
                    <span className="text-xl">+</span> Initialize New Prototype
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <div className="w-16 h-16 border-[6px] border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="font-black text-slate-400 uppercase text-xs tracking-[0.3em]">Querying Global Infrastructure...</p>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto">
                    {renderData.length === 0 ? (
                        <div className="bg-white border-4 border-dashed border-slate-200 rounded-[80px] p-40 text-center flex flex-col items-center">
                            <span className="text-8xl mb-8 opacity-20">🕳️</span>
                            <h3 className="text-3xl font-black text-slate-300 uppercase italic tracking-widest">Null Sector Detected</h3>
                            <p className="text-slate-400 font-bold mt-4">Initialize a blueprint to start the registry.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {renderData.map((pkg, idx) => {
                                if (!pkg || typeof pkg !== 'object') return null;

                                const safeId = String(pkg.id || `temp-${idx}`);
                                const safeName = String(pkg.name || "UNNAMED");
                                const safePrice = Number(pkg.monthly_price || 0);
                                const safeMessages = Number(pkg.max_messages || 0);
                                const safeContacts = Number(pkg.max_contacts || 0);
                                const isFeatured = pkg.is_featured === true;

                                return (
                                    <div key={safeId} className={`group relative bg-white p-12 rounded-[72px] border-4 transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] ${isFeatured ? 'border-indigo-600 ring-[12px] ring-indigo-50' : 'border-white shadow-[0_10px_40px_rgba(0,0,0,0.04)]'}`}>
                                        
                                        {isFeatured && (
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">
                                                ★ High Performance
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-3 mb-8">
                                             <button onClick={() => { setEditingPackage(pkg); setIsModalOpen(true); }} className="w-12 h-12 bg-slate-50 rounded-[20px] flex items-center justify-center hover:bg-slate-100 transition-colors shadow-sm">⚙️</button>
                                        </div>

                                        <h3 className="text-3xl font-black text-[#0F172A] mb-3 leading-tight uppercase tracking-tight">{safeName}</h3>
                                        <p className="text-slate-400 mb-10 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed line-clamp-2 min-h-[40px]">{String(pkg.description || "No core description provided.")}</p>

                                        <div className="bg-slate-50 p-10 rounded-[48px] mb-12 border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-all">
                                            <div className="text-5xl font-black text-[#0F172A] mb-1 tracking-tighter tabular-nums flex items-baseline gap-2">
                                                <span className="text-lg opacity-40 italic">{String(pkg.currency || "INR")}</span>
                                                {safePrice}
                                            </div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 px-1">Monthly Operational Cost</div>
                                        </div>

                                        <div className="flex flex-col gap-6 mb-12 px-2">
                                            <div className="py-1 flex justify-between items-center group/item hover:translate-x-1 transition-transform">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                   <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span> Contacts
                                                </span>
                                                <span className="font-black text-[#0F172A] text-lg tabular-nums">{safeContacts.toLocaleString()}</span>
                                            </div>
                                            <div className="py-1 flex justify-between items-center group/item hover:translate-x-1 transition-transform">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                   <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span> Messages
                                                </span>
                                                <span className="font-black text-[#0F172A] text-lg tabular-nums">{safeMessages === -1 ? "∞" : safeMessages.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <button className={`w-full py-6 rounded-[40px] font-black text-xs uppercase tracking-widest shadow-2xl hover:translate-y-[-4px] active:translate-y-[2px] transition-all duration-300 ${isFeatured ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-[#0F172A] text-white shadow-slate-200'}`}>
                                            {String(pkg.cta_label || "Select Configuration")}
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
                <div className="fixed inset-0 z-[999999] flex items-center justify-center p-6 md:p-12 bg-[#0F172A]/90 backdrop-blur-xl animate-in fade-in duration-300 overflow-hidden">
                    <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[72px] flex flex-col overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.4)] border-[12px] border-white/10 group">
                        <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white rounded-[32px] flex items-center justify-center text-3xl shadow-xl shadow-slate-100 border border-slate-100">{editingPackage ? "🧪" : "🔬"}</div>
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tight text-[#0F172A] leading-none mb-2">{editingPackage ? "Edit" : "Initialize"} Prototype</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{editingPackage ? `SYSTEM_UUID: ${editingPackage.id}` : "CORE_PROTO_REQ: P-1001"}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-16 h-16 bg-white hover:bg-rose-50 hover:text-rose-500 rounded-full flex items-center justify-center font-black text-xl shadow-lg border border-slate-50 transition-all active:scale-95 group">✕</button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                           <PackageForm onCancel={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); fetchPackages(); }} initialData={editingPackage} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- DEFENSIVE TABBED FORM ---
function PackageForm({ onCancel, onSuccess, initialData }: any) {
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('identity'); // identity, limits, modules, pricing
    
    const [formData, setFormData] = useState({
        name: String(initialData?.name || ""),
        description: String(initialData?.description || ""),
        monthly_price: Number(initialData?.monthly_price || 0),
        currency: String(initialData?.currency || "INR"),
        max_contacts: Number(initialData?.max_contacts || 0),
        max_messages: Number(initialData?.max_messages || 0),
        max_flows: Number(initialData?.max_flows || 0),
        is_featured: !!initialData?.is_featured,
        badge_text: String(initialData?.badge_text || "Best Value"),
        cta_label: String(initialData?.cta_label || "Get Started"),
        module_crm: !!initialData?.module_crm,
        module_ecommerce: !!initialData?.module_ecommerce,
        module_academy: !!initialData?.module_academy,
        module_integration: !!initialData?.module_integration,
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
                body: JSON.stringify(formData)
            });

            if (res.ok) onSuccess();
            else {
                const err = await res.json();
                alert(`Protocol Error: ${err.error || "Execution Failed"}`);
            }
        } catch (error) { 
            console.error(error);
            alert("System Communication Link Failure.");
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'identity', label: 'Identity', icon: '📛' },
        { id: 'limits', label: 'Limits', icon: '⚖️' },
        { id: 'modules', label: 'Modules', icon: '🧩' },
        { id: 'pricing', label: 'Pricing', icon: '💰' }
    ];

    return (
        <div className="flex h-full">
            {/* Sidebar Tabs */}
            <div className="w-[320px] bg-slate-50 border-r border-slate-100 flex flex-col p-8 gap-3">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-4 px-4 tracking-widest italic">Core Config Sectors</p>
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-5 p-6 rounded-[32px] text-sm font-black transition-all group ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-xl shadow-slate-100 border border-slate-100' : 'text-slate-400 hover:bg-white/50 hover:text-indigo-600'}`}
                    >
                        <span className={`text-2xl transition-transform ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110 grayscale opacity-40'}`}>{tab.icon}</span>
                        {tab.label}
                        {activeTab === tab.id && <span className="ml-auto w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>}
                    </button>
                ))}

                <div className="mt-auto p-8 rounded-[40px] bg-white border border-slate-100 border-dashed">
                    <p className="text-[9px] font-black text-slate-300 uppercase leading-relaxed text-center italic">Protocol Status: ACTIVE_EDITING<br/>Source: ADMIN_CONTROL_CENTER</p>
                </div>
            </div>

            {/* Main Form Area */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden bg-white">
                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    
                    <div className="max-w-4xl mx-auto space-y-12">
                        
                        {/* 1. Identity TAB */}
                        {activeTab === 'identity' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-6 mb-3 block tracking-widest italic">Blueprint Name</label>
                                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-8 bg-slate-50 border-4 border-transparent focus:border-indigo-600 focus:bg-white rounded-[32px] font-black text-xl outline-none transition-all placeholder:text-slate-200" placeholder="e.g. ULTRA GROWTH X" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-6 mb-3 block tracking-widest italic">Core Log Entry / Description</label>
                                        <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-8 bg-slate-50 border-4 border-transparent focus:border-indigo-600 focus:bg-white rounded-[40px] font-bold text-lg outline-none transition-all min-h-[160px] resize-none placeholder:text-slate-200" placeholder="Describe the purpose of this prototype..." />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-6 mb-3 block tracking-widest italic">Badge Protocol</label>
                                        <input type="text" value={formData.badge_text} onChange={e => setFormData({...formData, badge_text: e.target.value})} className="w-full p-6 bg-slate-50 border-4 border-transparent focus:border-indigo-600 rounded-[32px] font-black outline-none transition-all" />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-6 mb-3 block tracking-widest italic">Action Trigger Label</label>
                                        <input type="text" value={formData.cta_label} onChange={e => setFormData({...formData, cta_label: e.target.value})} className="w-full p-6 bg-slate-50 border-4 border-transparent focus:border-indigo-600 rounded-[32px] font-black outline-none transition-all" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Limits TAB */}
                        {activeTab === 'limits' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="p-10 bg-slate-50 rounded-[48px] border-2 border-transparent hover:border-indigo-100 transition-all flex flex-col gap-4">
                                        <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest italic">Contact Nodes</label>
                                        <input required type="number" value={formData.max_contacts} onChange={e => setFormData({...formData, max_contacts: Number(e.target.value)})} className="w-full bg-transparent text-4xl font-black outline-none tabular-nums text-indigo-600" />
                                        <p className="text-[9px] font-bold text-slate-300 uppercase italic">Max individual contacts per workspace engine.</p>
                                    </div>
                                    <div className="p-10 bg-slate-50 rounded-[48px] border-2 border-transparent hover:border-indigo-100 transition-all flex flex-col gap-4">
                                        <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest italic">Message Throughput</label>
                                        <div className="flex items-center gap-4">
                                             <input required type="number" value={formData.max_messages} onChange={e => setFormData({...formData, max_messages: Number(e.target.value)})} className="w-full bg-transparent text-4xl font-black outline-none tabular-nums text-[#0F172A]" />
                                             {formData.max_messages === -1 && <span className="text-4xl">∞</span>}
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-300 uppercase italic">Input -1 for unlimited hyper-sharding.</p>
                                    </div>
                                    <div className="p-10 bg-slate-50 rounded-[48px] border-2 border-transparent hover:border-indigo-100 transition-all flex flex-col gap-4">
                                        <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest italic">Flow Schematics</label>
                                        <input required type="number" value={formData.max_flows} onChange={e => setFormData({...formData, max_flows: Number(e.target.value)})} className="w-full bg-transparent text-4xl font-black outline-none tabular-nums text-[#0F172A]" />
                                        <p className="text-[9px] font-bold text-slate-300 uppercase italic">Active automation logical entities allowed.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Modules TAB */}
                        {activeTab === 'modules' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="grid grid-cols-2 gap-8">
                                    <ModuleToggle label="CRM Engine" icon="🏢" description="Universal sales & lead management nodes." active={formData.module_crm} onClick={() => setFormData({...formData, module_crm: !formData.module_crm})} />
                                    <ModuleToggle label="Commerce V3" icon="🛍️" description="Native WhatsApp cart and fulfillment logic." active={formData.module_ecommerce} onClick={() => setFormData({...formData, module_ecommerce: !formData.module_ecommerce})} />
                                    <ModuleToggle label="Academy Pulse" icon="🎓" description="Internal educational engine for vendors." active={formData.module_academy} onClick={() => setFormData({...formData, module_academy: !formData.module_academy})} />
                                    <ModuleToggle label="Integrations" icon="🔌" description="API and 3rd party hyper-linking enabled." active={formData.module_integration} onClick={() => setFormData({...formData, module_integration: !formData.module_integration})} />
                                </div>
                            </div>
                        )}

                        {/* 4. Pricing TAB */}
                        {activeTab === 'pricing' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="p-12 bg-indigo-900 rounded-[56px] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-10 opacity-10 animate-pulse">💰</div>
                                    <div className="relative z-10 flex flex-col gap-10">
                                        <div className="grid grid-cols-2 gap-10">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-indigo-300 px-2 tracking-widest mb-4 block italic">Fuel Rate / Price</label>
                                                <div className="flex items-baseline gap-4">
                                                    <span className="text-2xl font-black italic opacity-60">{formData.currency}</span>
                                                    <input required type="number" value={formData.monthly_price} onChange={e => setFormData({...formData, monthly_price: Number(e.target.value)})} className="w-full bg-transparent text-7xl font-black outline-none tabular-nums placeholder:text-indigo-800" placeholder="0" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-indigo-300 px-2 tracking-widest mb-4 block italic">Currency Node</label>
                                                <input required type="text" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-full bg-indigo-800/50 p-6 rounded-[28px] text-white font-black text-2xl outline-none focus:bg-indigo-800 transition-all border-2 border-indigo-700/50" />
                                            </div>
                                        </div>
                                        
                                        <hr className="border-indigo-800" />
                                        
                                        <div className="flex items-center gap-6">
                                            <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} className="w-10 h-10 rounded-2xl bg-indigo-800 border-none shadow-inner accent-indigo-400" />
                                            <div>
                                                <p className="font-black uppercase tracking-widest text-sm">Flag as Hyper Prototype</p>
                                                <p className="text-xs text-indigo-300 font-bold italic">This plan will be highly visible in vendor sectors.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                    
                </div>

                {/* Footer Controls */}
                <div className="p-10 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
                    <button type="button" onClick={onCancel} className="px-10 py-6 rounded-3xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-rose-500 transition-all">
                        Abort Protocol
                    </button>
                    <button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-16 py-6 rounded-[32px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl flex items-center gap-4 transition-all active:scale-95 disabled:opacity-50">
                        {isLoading ? "Running Script..." : "Commit Structure to Core"}
                    </button>
                </div>
            </form>

            {/* Live Preview Sidebar */}
            <div className="w-[480px] bg-slate-900 border-l border-white/5 flex flex-col p-12 overflow-y-auto custom-scrollbar">
                <p className="text-[10px] font-black uppercase text-slate-500 mb-8 px-4 tracking-[0.3em] italic">Real-Time Schematic Preview</p>
                
                <div className={`relative bg-white p-12 rounded-[72px] border-[6px] border-white shadow-2xl transition-all duration-700 ${formData.is_featured ? 'ring-8 ring-indigo-500/20' : ''}`}>
                    
                    {formData.is_featured && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-10 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl">
                            {formData.badge_text || "★ High Performance"}
                        </div>
                    )}

                    <h3 className="text-3xl font-black text-[#0F172A] mb-3 leading-tight uppercase tracking-tight">{formData.name || "UNNAMED_ENTITY"}</h3>
                    <p className="text-slate-400 mb-10 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed line-clamp-2 min-h-[40px]">{formData.description || "Describe the core purpose of this prototype in the Identity sector."}</p>

                    <div className="bg-slate-50 p-10 rounded-[48px] mb-12 border border-slate-100">
                        <div className="text-5xl font-black text-[#0F172A] mb-1 tracking-tighter tabular-nums flex items-baseline gap-2">
                            <span className="text-lg opacity-40 italic">{formData.currency}</span>
                            {formData.monthly_price || 0}
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Active Operational Rate</div>
                    </div>

                    <div className="flex flex-col gap-6 mb-12 px-2">
                        <div className="py-2 flex justify-between items-center border-b border-slate-50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacts</span>
                            <span className="font-black text-[#0F172A] text-lg tabular-nums">{(formData.max_contacts || 0).toLocaleString()}</span>
                        </div>
                        <div className="py-2 flex justify-between items-center border-b border-slate-50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bot Flows</span>
                            <span className="font-black text-[#0F172A] text-lg tabular-nums">{formData.max_flows || 0}</span>
                        </div>
                    </div>

                    <button className={`w-full py-6 rounded-[40px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl ${formData.is_featured ? 'bg-indigo-600 text-white' : 'bg-[#0F172A] text-white'}`}>
                        {formData.cta_label}
                    </button>
                    
                    <div className="mt-12 flex flex-wrap gap-2">
                        {formData.module_crm && <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase rounded-lg border border-indigo-100">CRM Engine</span>}
                        {formData.module_ecommerce && <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase rounded-lg border border-indigo-100">Shop Engine</span>}
                        {formData.module_academy && <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase rounded-lg border border-indigo-100">Academy Ent</span>}
                        {formData.module_integration && <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase rounded-lg border border-indigo-100">API Access</span>}
                    </div>
                </div>

                <div className="mt-auto p-10 bg-white/5 rounded-[48px] border border-white/10">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-4 tracking-[0.3em]">System Manifest</h4>
                    <div className="space-y-3 font-mono text-[9px] text-slate-500 overflow-hidden">
                        <p className="truncate">RES_AUTH: SUCCESS</p>
                        <p className="truncate">MEM_DUMP: {Math.random().toString(16).substring(2, 8).toUpperCase()}</p>
                        <p className="truncate">SYNC_ST: COMPLETE</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ModuleToggle({ label, icon, description, active, onClick }: { label: string; icon: string; description: string; active: boolean; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} className={`p-8 rounded-[40px] border-4 transition-all text-left flex flex-col gap-3 group relative ${active ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-100' : 'bg-slate-50 border-transparent hover:border-slate-100'}`}>
            <div className={`text-3xl transition-transform ${active ? 'scale-110' : 'grayscale opacity-40 group-hover:scale-110'}`}>{icon}</div>
            <p className={`font-black uppercase text-[10px] tracking-widest ${active ? 'text-white' : 'text-slate-400'}`}>{label}</p>
            <p className={`text-[9px] font-bold italic leading-relaxed ${active ? 'text-indigo-100' : 'text-slate-300'}`}>{description}</p>
            {active && <div className="absolute top-6 right-6 w-4 h-4 rounded-full bg-white shadow-lg flex items-center justify-center text-[10px]">✔️</div>}
        </button>
    );
}
