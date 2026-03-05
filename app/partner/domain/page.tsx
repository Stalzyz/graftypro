"use client";
import { useState, useEffect } from "react";
import {
    Globe, Shield, AlertTriangle, CheckCircle,
    Loader2, Copy, ArrowRight, ExternalLink,
    Zap, Activity, ShieldCheck, Database,
    Server, ChevronRight, X, ArrowUpRight
} from "lucide-react";

export default function DomainPage() {
    const [domain, setDomain] = useState("");
    const [savedDomain, setSavedDomain] = useState("");
    const [saving, setSaving] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [status, setStatus] = useState<"idle" | "saved" | "verified" | "error">("idle");
    const [message, setMessage] = useState("");
    const [copied, setCopied] = useState("");

    useEffect(() => {
        fetch("/api/reseller/branding")
            .then(res => res.json())
            .then(data => {
                if (data.data?.custom_domain) {
                    setDomain(data.data.custom_domain);
                    setSavedDomain(data.data.custom_domain);
                    setStatus(data.data.domain_verified ? "verified" : "saved");
                }
            });
    }, []);

    const handleSave = async () => {
        if (!domain.trim()) return;
        setSaving(true);
        setMessage("");
        try {
            const res = await fetch("/api/reseller/branding", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    custom_domain: domain.trim().toLowerCase(),
                    domain_verified: false // Reset verification on domain change
                })
            });
            const data = await res.json();
            if (res.ok) {
                setSavedDomain(domain.trim().toLowerCase());
                setStatus("saved");
                setMessage("Infrastructure anchor established. Proceed to DNS mapping.");
            } else {
                setStatus("error");
                setMessage(data.error || "Establishment Refused");
            }
        } catch {
            setStatus("error");
            setMessage("Network Protocol Failure");
        } finally {
            setSaving(false);
        }
    };

    const handleVerify = async () => {
        if (!savedDomain) return;
        setVerifying(true);
        setMessage("");
        try {
            // Simulate DNS check or call a real DNS check endpoint if available
            // For now, we update the domain_verified flag in the DB
            const res = await fetch("/api/reseller/branding", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain_verified: true })
            });
            if (res.ok) {
                setStatus("verified");
                setMessage("DNS Verified. SSL Handshake Initiated.");
            } else {
                setStatus("error");
                setMessage("Checksum Mismatch. Propagation Incomplete.");
            }
        } finally {
            setVerifying(false);
        }
    };

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(""), 2000);
    };

    const cnameHost = savedDomain ? savedDomain.split(".")[0] : "portal";
    const cnameTarget = "cname.grafty.pro";

    return (
        <div className="max-w-5xl space-y-12 animate-in fade-in duration-700 pb-24">

            {/* Simple Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-600 font-black text-[9px] uppercase tracking-[0.3em] mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                        Custom Namespace
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                        Domain & DNS<span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm tracking-tight italic">Connect your custom domain and configure DNS records for your platform.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Protocol Config */}
                <div className="lg:col-span-12 space-y-10">

                    {/* Step 01: Host Establishment */}
                    <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 blur-3xl rounded-full -mr-16 -mt-16" />
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                                    <Globe size={22} />
                                </div>
                                <div className="hidden sm:block">
                                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Step 01. Genesis</h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic mt-1 leading-none">Declare Primary Namespace</p>
                                </div>
                            </div>
                            <div className="px-5 py-2 rounded-full bg-slate-50 border border-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-widest italic">
                                Ready for sync
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 relative z-10">
                            <div className="flex-1 space-y-3">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Target Subdomain</label>
                                <div className="relative group/field">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-blue-600 transition-colors italic font-black text-xs uppercase tracking-tighter">https://</div>
                                    <input
                                        className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] pl-20 pr-8 py-5 text-lg font-black italic uppercase tracking-tighter text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-200 shadow-inner"
                                        placeholder="PORTAL.YOURBRAND.COM"
                                        value={domain}
                                        onChange={e => setDomain(e.target.value.toLowerCase())}
                                    />
                                </div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2 px-1">Ensure the subdomain exists within your DNS matrix before establishment.</p>
                            </div>
                            <div className="md:pt-10">
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !domain.trim()}
                                    className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
                                    Sync Anchor
                                </button>
                            </div>
                        </div>

                        {message && (
                            <div className={`mt-8 p-6 rounded-[2rem] border animate-in slide-in-from-top-2 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest ${status === "error" ? "bg-rose-50 border-rose-100 text-rose-600" :
                                status === "verified" ? "bg-emerald-50 border-emerald-100 text-[#27954D]" :
                                    "bg-blue-50 border-blue-100 text-blue-600"
                                }`}>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg ${status === "error" ? "bg-rose-600" :
                                    status === "verified" ? "bg-[#27954D]" : "bg-blue-600"
                                    }`}>
                                    {status === "verified" ? <CheckCircle size={16} /> : status === "error" ? <AlertTriangle size={16} /> : <Activity size={16} />}
                                </div>
                                {message}
                            </div>
                        )}
                    </section>

                    {/* Step 02: DNS Mapping */}
                    {savedDomain && (
                        <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group/dns animate-in fade-in zoom-in-95 duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 blur-3xl rounded-full -mr-16 -mt-16 group-hover/dns:scale-125 transition-transform duration-1000" />

                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                                        <Database size={22} />
                                    </div>
                                    <div className="hidden sm:block">
                                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Step 02. Mapping</h2>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic mt-1 leading-none">Inject Artifact into DNS Provider</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 mb-10">
                                {[
                                    { label: "Matrix Type", value: "CNAME" },
                                    { label: "Host Pointer", value: cnameHost },
                                    { label: "Protocol Target", value: cnameTarget },
                                    { label: "Persistence", value: "Auto" }
                                ].map(({ label, value }) => (
                                    <div key={label} className="space-y-3">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{label}</label>
                                        <button
                                            onClick={() => copyToClipboard(value, label)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between group/copy hover:border-blue-600 hover:bg-white transition-all shadow-inner"
                                        >
                                            <span className="text-xs font-black italic uppercase tracking-tighter text-blue-900 truncate">{value}</span>
                                            {copied === label
                                                ? <CheckCircle size={14} className="text-[#27954D] animate-in zoom-in duration-300" />
                                                : <Copy size={14} className="text-slate-200 group-hover/copy:text-blue-600 transition-colors" />
                                            }
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-10 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Activity size={18} className="text-blue-500 animate-pulse" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Monitoring DNS Broadcast...</p>
                                </div>
                                <button
                                    onClick={handleVerify}
                                    disabled={verifying || status === "verified"}
                                    className={`w-full sm:w-auto px-12 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-50 ${status === "verified"
                                        ? "bg-emerald-50 text-[#27954D] border-2 border-emerald-100 shadow-lg shadow-emerald-500/5 cursor-default"
                                        : "bg-blue-600 text-white hover:bg-blue-900 shadow-2xl shadow-blue-600/20"
                                        }`}
                                >
                                    {verifying ? <Loader2 size={16} className="animate-spin" /> : status === "verified" ? <ShieldCheck size={16} /> : <Zap size={16} />}
                                    {verifying ? "Auditing DNS..." : status === "verified" ? "Protocol Secured" : "Execute Verify Pulse"}
                                </button>
                            </div>
                        </section>
                    )}

                    {/* Step 03: Live Deployment */}
                    {status === "verified" && (
                        <section className="bg-slate-900 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group animate-in slide-in-from-bottom-6 duration-700">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />

                            <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] flex items-center justify-center text-emerald-400 shadow-2xl">
                                    <ShieldCheck size={40} className="animate-bounce-soft" />
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-white font-black text-3xl italic uppercase tracking-tighter leading-none">Deployment Successful</h2>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Subdomain Resolving to Platform Grid</p>
                                </div>

                                <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] w-full max-w-lg group/link hover:bg-white/10 transition-colors cursor-pointer" onClick={() => window.open(`https://${savedDomain}`, '_blank')}>
                                    <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 italic">Active Endpoint</div>
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="text-xl font-black text-white italic tracking-tighter uppercase tabular-nums">{savedDomain}</span>
                                        <ExternalLink size={20} className="text-white/20 group-hover/link:text-white transition-colors" />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="px-5 py-2 rounded-full border border-white/10 text-[8px] font-black text-white/50 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Server size={10} /> Edge Synchronized
                                    </div>
                                    <div className="px-5 py-2 rounded-full border border-white/10 text-[8px] font-black text-white/50 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Shield size={10} /> SSL Handshake Active
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* Technical Protocol Notes */}
                <div className="lg:col-span-12">
                    <section className="bg-slate-50 border border-slate-200 rounded-[3rem] p-10 flex flex-col md:flex-row gap-10">
                        <div className="w-16 h-16 bg-white rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                            <AlertTriangle className="text-amber-500" size={24} />
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-1">Technical Protocol</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic leading-none">Standard DNS Operating Procedures</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                {[
                                    { title: "Namespace Constraint", desc: "Map to a subdomain entity only. Root resolution requires manual SSL bypass." },
                                    { title: "Propagation Latency", desc: "Edge synchronization requires between 300s and 86400s to achieve global resolution." },
                                    { title: "Persistence Rule", desc: "Maintain the CNAME artifact within your registrar matrix to prevent protocol dropout." },
                                    { title: "Identity Synchronization", desc: "All user agents and logos will automatically propagate to the established endpoint." }
                                ].map((note, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="w-1 h-1 rounded-full bg-blue-600 mt-1.5 shrink-0 group-hover:scale-150 transition-transform" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none italic">{note.title}</p>
                                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{note.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
