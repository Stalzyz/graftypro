
"use client";
import { useState, useEffect, useCallback } from "react";
import {
    Globe, Shield, AlertTriangle, CheckCircle,
    Loader2, Copy, ArrowRight, ExternalLink,
    Zap, Activity, ShieldCheck, Database,
    Server, ChevronRight, X, ArrowUpRight,
    Search, Plus, Trash2, Info
} from "lucide-react";

interface PartnerDomain {
    id: string;
    domain: string;
    is_verified: boolean;
    verification_token?: string;
    target_host: string;
    created_at: string;
}

export default function DomainPage() {
    const [domains, setDomains] = useState<PartnerDomain[]>([]);
    const [loading, setLoading] = useState(true);
    const [newDomain, setNewDomain] = useState("");
    const [adding, setAdding] = useState(false);
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const [sslCheckingId, setSslCheckingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
    const [copied, setCopied] = useState("");

    const fetchDomains = useCallback(async () => {
        try {
            const res = await fetch("/api/reseller/domains");
            const data = await res.json();
            if (data.success) {
                setDomains(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch domains");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDomains();
    }, [fetchDomains]);

    const handleAddDomain = async () => {
        if (!newDomain.trim()) return;
        setAdding(true);
        setMessage(null);
        try {
            const res = await fetch("/api/reseller/domains", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain: newDomain.trim() })
            });
            const data = await res.json();
            if (res.ok) {
                setDomains([data.data, ...domains]);
                setNewDomain("");
                setMessage({ text: "Primary domain added. DNS target provided.", type: "success" });
            } else {
                setMessage({ text: data.error || "Failed to add domain", type: "error" });
            }
        } catch {
            setMessage({ text: "Connection error during setup", type: "error" });
        } finally {
            setAdding(false);
        }
    };

    const handleVerifyDomain = async (id: string) => {
        setVerifyingId(id);
        setMessage(null);
        try {
            const res = await fetch(`/api/reseller/domains/${id}/verify`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                setDomains(domains.map(d => d.id === id ? { ...d, is_verified: true } : d));
                setMessage({ text: "DNS verified. Domain now active.", type: "success" });
            } else {
                setMessage({ text: data.error || "Verification failed. DNS records not detected.", type: "error" });
            }
        } catch {
            setMessage({ text: "Verification request failed", type: "error" });
        } finally {
            setVerifyingId(null);
        }
    };

    const handleSslCheck = async (id: string) => {
        setSslCheckingId(id);
        setMessage(null);
        try {
            const res = await fetch(`/api/reseller/domains/${id}/ssl-check`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                setMessage({ text: "SSL verified and secure. Encryption active.", type: "success" });
            } else {
                setMessage({ text: data.error || "SSL check failed. Certificate may still be provisioning.", type: "error" });
            }
        } catch {
            setMessage({ text: "SSL scanning failed", type: "error" });
        } finally {
            setSslCheckingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Permanently deleting this domain will break its connection. Proceed?")) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/reseller/domains/${id}`, { method: "DELETE" });
            if (res.ok) {
                setDomains(domains.filter(d => d.id !== id));
                setMessage({ text: "Domain removed from system.", type: "info" });
            }
        } catch {
            setMessage({ text: "Delete request failed", type: "error" });
        } finally {
            setDeletingId(null);
        }
    };

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(""), 2000);
    };

    return (
        <div className="max-w-6xl space-y-12 animate-in fade-in duration-700 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-600 font-black text-[9px] uppercase tracking-[0.3em] mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                        Infrastructure Management
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                        White-Label Domains<span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm tracking-tight italic">Provision and manage custom domains for your white-labeled platform.</p>
                </div>
                <div className="flex items-center gap-4">
                    <a href="#setup-guide" className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:border-blue-600 transition-all flex items-center gap-2">
                        <Info size={14} />
                        Setup Guide
                    </a>
                </div>
            </div>

            {message && (
                <div className={`p-6 rounded-[2rem] border animate-in slide-in-from-top-4 flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-widest ${
                    message.type === "error" ? "bg-rose-50 border-rose-100 text-rose-600" :
                    message.type === "success" ? "bg-emerald-50 border-emerald-100 text-[#27954D]" :
                    "bg-blue-50 border-blue-100 text-blue-600"
                }`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                            message.type === "error" ? "bg-rose-600" :
                            message.type === "success" ? "bg-[#27954D]" : "bg-blue-600"
                        }`}>
                            {message.type === "success" ? <CheckCircle size={18} /> : message.type === "error" ? <AlertTriangle size={18} /> : <Info size={18} />}
                        </div>
                        {message.text}
                    </div>
                    <button onClick={() => setMessage(null)} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Protocol Config */}
                <div className="lg:col-span-12 space-y-10">
                    {/* Add Domain Section */}
                    <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 blur-3xl rounded-full -mr-16 -mt-16" />
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                                    <Plus size={22} />
                                </div>
                                <div className="hidden sm:block">
                                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Add New Domain</h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic mt-1 leading-none">Link Your Custom Branding</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 relative z-10">
                            <div className="flex-1 space-y-3">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Target Hostname</label>
                                <div className="relative group/field">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-blue-600 transition-colors italic font-black text-xs uppercase tracking-tighter">https://</div>
                                    <input
                                        className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] pl-20 pr-8 py-5 text-lg font-black italic uppercase tracking-tighter text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-200 shadow-inner"
                                        placeholder="PORTAL.YOURBRAND.COM"
                                        value={newDomain}
                                        onChange={e => setNewDomain(e.target.value.toLowerCase())}
                                    />
                                </div>
                            </div>
                            <div className="md:pt-9 flex items-center">
                                <button
                                    onClick={handleAddDomain}
                                    disabled={adding || !newDomain.trim()}
                                    className="w-full md:w-auto px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {adding ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
                                    Add Domain
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Domains List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Connected Domains</h3>
                            <button onClick={fetchDomains} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all">
                                <Activity size={14} />
                            </button>
                        </div>

                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                <Loader2 size={32} className="text-slate-200 animate-spin" />
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Scanning...</span>
                            </div>
                        ) : domains.length === 0 ? (
                            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[3rem] py-24 flex flex-col items-center justify-center text-center space-y-4">
                                <Globe size={48} className="text-slate-200 mb-2" />
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">No Active Domains</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic leading-none max-w-xs">Declare your first custom domain to activate your white-label platform.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {domains.map((domain) => (
                                    <DomainCard 
                                        key={domain.id} 
                                        domain={domain} 
                                        verifying={verifyingId === domain.id} 
                                        sslChecking={sslCheckingId === domain.id}
                                        deleting={deletingId === domain.id}
                                        onVerify={() => handleVerifyDomain(domain.id)}
                                        onSslCheck={() => handleSslCheck(domain.id)}
                                        onDelete={() => handleDelete(domain.id)}
                                        onCopy={(val, key) => copyToClipboard(val, key)}
                                        copyStatus={copied}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* How-To Guide Section */}
                <div className="lg:col-span-12" id="setup-guide">
                    <section className="bg-slate-900 rounded-[3rem] p-12 relative overflow-hidden">
                        {/* Background Accents */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 blur-[120px] rounded-full opacity-10 -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600 blur-[100px] rounded-full opacity-10 -ml-32 -mb-32" />
                        
                        <div className="relative z-10 space-y-12">
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-blue-400 uppercase tracking-widest mb-4">
                                    <Zap size={10} /> Setup Guide
                                </div>
                                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                                    How to Setup Your <span className="text-blue-400">Custom Domain</span>.
                                </h3>
                                <p className="text-slate-400 font-medium text-sm max-w-2xl mx-auto">Follow these four simple steps to activate your white-label platform under your own brand's hostname.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {[
                                    {
                                        step: "01",
                                        title: "DNS Setup",
                                        desc: "Point your CNAME record to the provided target in your DNS panel (Cloudflare, GoDaddy, etc).",
                                        icon: <Server size={20} className="text-blue-400" />
                                    },
                                    {
                                        step: "02",
                                        title: "Domain Entry",
                                        desc: "Enter your domain above (e.g., app.yourbrand.com) and click 'Add Domain' to initialize.",
                                        icon: <Plus size={20} className="text-emerald-400" />
                                    },
                                    {
                                        step: "03",
                                        title: "DNS Verify",
                                        desc: "Once DNS propagates, click 'Verify DNS' to check connectivity with our servers.",
                                        icon: <Activity size={20} className="text-amber-400" />
                                    },
                                    {
                                        step: "04",
                                        title: "SSL Security",
                                        desc: "Our system will automatically provision an SSL certificate. Encryption active within seconds.",
                                        icon: <ShieldCheck size={20} className="text-violet-400" />
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all relative">
                                        <div className="text-[40px] font-black text-white/5 absolute top-4 right-6 italic select-none group-hover:text-white/10 transition-colors">{item.step}</div>
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                                            {item.icon}
                                        </div>
                                        <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4">{item.title}</h4>
                                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-widest italic">{item.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                                        <Info size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Cloudflare Users</p>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider italic">Ensure the orange cloud (Proxy) is DISABLED in Cloudflare during the initial verification.</p>
                                    </div>
                                </div>
                                <button onClick={() => window.open('/docs/white-label', '_blank')} className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] hover:bg-blue-400 hover:text-white transition-all whitespace-nowrap">
                                    Full Documentation
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function DomainCard({ domain, verifying, sslChecking, deleting, onVerify, onSslCheck, onDelete, onCopy, copyStatus }: { 
    domain: PartnerDomain; 
    verifying: boolean; 
    sslChecking: boolean;
    deleting: boolean;
    onVerify: () => void; 
    onSslCheck: () => void;
    onDelete: () => void;
    onCopy: (val: string, key: string) => void;
    copyStatus: string;
}) {
    const [expanded, setExpanded] = useState(!domain.is_verified);
    const cnameHost = domain.domain.split(".")[0];
    const cnameTarget = domain.target_host || "cname.your-server.com";

    return (
        <div className={`bg-white border rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-sm ${
            domain.is_verified ? "border-emerald-100" : "border-slate-100"
        }`}>
            {/* Header */}
            <div className={`p-8 flex items-center justify-between ${domain.is_verified ? "bg-emerald-50/30" : "bg-white"}`}>
                <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform duration-500 ${
                        domain.is_verified ? "bg-[#27954D] rotate-12 scale-110" : "bg-slate-900"
                    }`}>
                        {domain.is_verified ? <ShieldCheck size={28} /> : <Globe size={28} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">{domain.domain}</h3>
                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                domain.is_verified ? "bg-emerald-100 text-[#27954D]" : "bg-slate-100 text-slate-400"
                            }`}>
                                {domain.is_verified ? "Verified" : "Pending DNS"}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic mt-2">
                            Status: {domain.is_verified ? "Active" : "Waiting for Propagation"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setExpanded(!expanded)} 
                        className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
                    >
                        <Info size={18} />
                    </button>
                    {domain.is_verified && (
                        <button
                            onClick={onSslCheck}
                            disabled={sslChecking}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {sslChecking ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                            {sslChecking ? "Scanning" : "SSL Check"}
                        </button>
                    )}
                    {!domain.is_verified && (
                        <button
                            onClick={onVerify}
                            disabled={verifying}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {verifying ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                            {verifying ? "Verifying" : "Verify DNS"}
                        </button>
                    )}
                    <button 
                        onClick={onDelete}
                        disabled={deleting}
                        className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                    >
                        {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                </div>
            </div>

            {/* Config Details */}
            {expanded && (
                <div className="p-8 border-t border-slate-50 bg-slate-50/50 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { label: "Record Type", value: "CNAME" },
                            { label: "Host Name", value: cnameHost },
                            { label: "Target Value", value: cnameTarget },
                            { label: "TTL", value: "3600s" }
                        ].map(({ label, value }) => (
                            <div key={label} className="space-y-3">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{label}</label>
                                <button
                                    onClick={() => onCopy(value, `${domain.id}-${label}`)}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between group/copy hover:border-blue-600 transition-all shadow-sm"
                                >
                                    <span className="text-[11px] font-black italic uppercase tracking-tighter text-blue-900 truncate">{value}</span>
                                    {copyStatus === `${domain.id}-${label}`
                                        ? <CheckCircle size={12} className="text-[#27954D] animate-in zoom-in duration-300" />
                                        : <Copy size={12} className="text-slate-200 group-hover/copy:text-blue-600 transition-colors" />
                                    }
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    {!domain.is_verified && (
                        <div className="mt-8 p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
                            <AlertTriangle size={16} className="text-amber-500 mt-1 shrink-0" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Awaiting Propagation</p>
                                <p className="text-[10px] text-amber-600 font-medium leading-relaxed">
                                    Configure the above CNAME record in your registrar's DNS panel. If using Cloudflare, ensure "Proxying" (Orange Cloud) is DISABLED for the initial verification.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
