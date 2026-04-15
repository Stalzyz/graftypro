"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    Plus,
    Mail,
    Send,
    BarChart3,
    TrendingUp,
    AlertOctagon,
    AlertTriangle,
    ShieldCheck,
    ChevronDown,
    ChevronUp,
    Info,
    Zap,
    X,
    ArrowRight,
    Users,
    Clock,
    Layout,
    Settings,
    Lock
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function EmailHubPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [segments, setSegments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [previewMode, setPreviewMode] = useState<'none' | 'mobile' | 'desktop'>('none');
    const [mounted, setMounted] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [htmlContent, setHtmlContent] = useState("");
    const [segmentId, setSegmentId] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [attachments, setAttachments] = useState([{ name: "", url: "" }]);
    const [sending, setSending] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [cRes, sRes] = await Promise.all([
                fetch("/api/marketing/email"),
                fetch("/api/segments")
            ]);
            const [cData, sData] = await Promise.all([cRes.json(), sRes.json()]);

            if (cData.data) setCampaigns(cData.data);
            if (sData.data) setSegments(sData.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            const payload = {
                name,
                subject,
                html_content: htmlContent,
                filters: segmentId ? { segment_id: segmentId } : {},
                attachments: attachments.filter(a => a.name.trim() !== "" && a.url.trim() !== ""),
                scheduledAt
            };
            const res = await fetch("/api/marketing/email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Email Campaign Launched! 🚀");
                setShowModal(false);
                resetForm();
                fetchData();
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to launch campaign");
            }
        } catch (e) {
            toast.error("Protocol Error: Check your connection");
        } finally {
            setSending(false);
        }
    };

    const resetForm = () => {
        setName(""); setSubject(""); setHtmlContent("");
        setSegmentId(""); setScheduledAt(""); setPreviewMode("none");
        setAttachments([{ name: "", url: "" }]);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase';
            case 'PROCESSING': return 'bg-amber-100 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase animate-pulse';
            case 'SCHEDULED': return 'bg-blue-100 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase';
            case 'FAILED': return 'bg-rose-100 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase';
            default: return 'bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-[#27954D]/10 rounded-2xl text-[#27954D]">
                            <Mail size={24} />
                        </div>
                        Email Hub
                    </h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">High-performance bulk messaging for your marketplace.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/marketing/email/settings" className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest hover:border-slate-300 transition-all shadow-sm group">
                        <Settings size={18} className="group-hover:rotate-45 transition-transform" /> Carrier Config
                    </Link>
                    <button 
                        onClick={() => setShowModal(true)} 
                        className="flex items-center gap-2 px-6 py-4 bg-[#27954D] text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-widest hover:bg-[#1e7a3d] transition-all shadow-xl shadow-emerald-100 group"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" /> New Campaign
                    </button>
                </div>
            </div>

            {/* Stats Radar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MiniStat label="Total Sent" value={campaigns.reduce((acc, c) => acc + (c.stats?.sent || 0), 0).toLocaleString()} icon={<Send size={20} />} color="text-[#042f94]" bg="bg-[#042f94]/10" />
                <MiniStat label="Open Rate" value={`${Math.round((campaigns.reduce((acc, c) => acc + (c.stats?.opened || 0), 0) / (campaigns.reduce((acc, c) => acc + (c.stats?.sent || 0), 0) || 1)) * 100)}%`} icon={<BarChart3 size={20} />} color="text-emerald-600" bg="bg-emerald-100" />
                <MiniStat label="Pulse (Active)" value={campaigns.filter(c => c.status === 'PROCESSING').length} icon={<Zap size={20} />} color="text-amber-600" bg="bg-amber-100" />
                <MiniStat label="Failed Total" value={campaigns.reduce((acc, c) => acc + (c.stats?.failed || 0), 0).toLocaleString()} icon={<AlertTriangle size={20} />} color="text-rose-600" bg="bg-rose-100" />
            </div>

            {/* Campaign Table */}
            <div className="bg-white/40 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Campaign Details</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Subject Line</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Progress</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Engagement</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-300 font-bold uppercase tracking-widest animate-pulse">Synchronizing Signals...</td></tr>
                            ) : campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                                                <Mail size={32} />
                                            </div>
                                            <div>
                                                <p className="text-slate-900 font-black uppercase tracking-tight">System Idle</p>
                                                <p className="text-slate-400 text-xs font-medium">No email campaigns have been initiated yet.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : campaigns.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-black text-slate-900">{c.name}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{new Date(c.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-xs text-slate-500 font-medium max-w-xs truncate">{c.subject}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="w-48">
                                            <div className="flex justify-between text-[9px] font-black uppercase tracking-tight text-slate-400 mb-1.5">
                                                <span>{c.stats?.sent || 0} / {c.stats?.total || 0}</span>
                                                <span className="text-[#27954D]">{Math.round(((c.stats?.sent || 0) / (c.stats?.total || 1)) * 100)}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-[#27954D] to-[#1e7a3d] transition-all duration-700"
                                                    style={{ width: `${Math.round(((c.stats?.sent || 0) / (c.stats?.total || 1)) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-4">
                                            <div className="text-center">
                                                <div className="text-xs font-black text-slate-900">{c.stats?.opened || 0}</div>
                                                <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Opens</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs font-black text-slate-900">{c.stats?.clicked || 0}</div>
                                                <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Clicks</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={getStatusBadge(c.status)}>{c.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Creation Slide-Over Drawer - Portaled globally to escape layout traps */}
            {mounted && showModal && createPortal(
                <div className="fixed top-0 right-0 bottom-0 left-0 lg:left-[280px] z-[9999] flex justify-end">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                        onClick={() => setShowModal(false)}
                    />

                    {/* Drawer Panel - Full Screen */}
                    <div className="relative w-full h-full bg-white flex flex-col animate-in slide-in-from-bottom-8 fade-in-0 duration-300">
                        
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0 shadow-sm">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <Zap className="text-emerald-500" size={20} /> New Broadcast
                                </h3>
                                <p className="text-slate-400 text-xs font-medium mt-1">Configure and launch your bulk campaign.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"><X size={18} /></button>
                        </div>

                        {/* Body Area */}
                        {previewMode !== "none" ? (
                            <div className="p-8 flex-1 flex flex-col items-center bg-slate-50/50 overflow-y-auto w-full">
                                <div className="w-full flex justify-between items-center mb-6">
                                    <h4 className="text-sm font-bold text-slate-700">Live {previewMode === 'mobile' ? 'Mobile' : 'Desktop'} Preview</h4>
                                    <button onClick={() => setPreviewMode("none")} className="text-xs font-bold text-[#27954D] uppercase hover:underline">Return to Editor</button>
                                </div>
                                <div className={`bg-white shadow-xl border border-slate-200 rounded-3xl overflow-hidden transition-all shrink-0 ${previewMode === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full min-h-[600px]'}`}>
                                    {/* Mock Browser Header */}
                                    <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
                                        <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                        <div className="ml-4 truncate text-[10px] text-slate-400 font-medium bg-white px-3 py-1 rounded-full border border-slate-200 flex-1 text-center">
                                            {subject || "Subject Preview..."}
                                        </div>
                                    </div>
                                    <iframe 
                                        srcDoc={htmlContent || "<div style='font-family: sans-serif; padding: 20px; color: #94a3b8;'>Start typing to see your email layout preview...</div>"} 
                                        className="w-full h-full border-none"
                                        title="Email Preview"
                                    />
                                </div>
                            </div>
                        ) : (
                            <form id="campaign-form" onSubmit={handleCreate} className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30">
                                {/* Deliverability Playbook */}
                                <div className={`border rounded-[1.5rem] transition-all duration-300 overflow-hidden ${showGuide ? 'bg-white border-slate-200 shadow-lg' : 'bg-slate-50/50 border-slate-100'}`}>
                                    <button 
                                        type="button"
                                        onClick={() => setShowGuide(!showGuide)}
                                        className="w-full px-6 py-4 flex items-center justify-between text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Expert Deliverability Playbook</h4>
                                                {!showGuide && <p className="text-[10px] text-slate-400 font-medium mt-0.5">Read our guide to ensure 99% inbox placement.</p>}
                                            </div>
                                        </div>
                                        {showGuide ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                    </button>
                                    
                                    {showGuide && (
                                        <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="grid md:grid-cols-2 gap-6 mt-2">
                                                {/* DO'S */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest pb-1 border-b border-emerald-50">
                                                        <ShieldCheck size={14} /> The Golden Rules (Do's)
                                                    </div>
                                                    <div className="space-y-3">
                                                        <TipItem icon={<TrendingUp size={14} />} title="The Warm-Up Phase" text="Start slow (50-100/day) and multiply weekly to establish domain trust." />
                                                        <TipItem icon={<Lock size={14} />} title="Authenticate Domain" text="Ensure SPF, DKIM, and DMARC records are set in your DNS." />
                                                        <TipItem icon={<Zap size={14} />} title="Embrace Cloud Links" text="Never hard-attach files. Use our Cloud Links to bypass spam filters." />
                                                        <TipItem icon={<Users size={14} />} title="Personalize Payload" text="Use {{first_name}} to make every email unique to the recipient." />
                                                    </div>
                                                </div>
                                                {/* DON'TS */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest pb-1 border-b border-rose-50">
                                                        <AlertOctagon size={14} /> The Danger Zone (Don'ts)
                                                    </div>
                                                    <div className="space-y-3">
                                                        <TipItem icon={<X size={14} />} title="No Cold Lists" text="Sending to purchased/scraped databases will blacklist your domain." color="text-rose-400" />
                                                        <TipItem icon={<Info size={14} />} title="Avoid Spam Triggers" text="Don't use ALL CAPS or words like 'FREE' and 'GUARANTEE'." color="text-rose-400" />
                                                        <TipItem icon={<TrendingUp size={14} className="rotate-180" />} title="No URL Shorteners" text="Avoid bit.ly/others. Use direct raw links or hyperlinked text." color="text-rose-400" />
                                                        <TipItem icon={<Mail size={14} />} title="Don't Hide Opt-Out" text="Hiding unsubscribe leads to 'Mark as Spam' which kills reputation." color="text-rose-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-6 max-w-7xl mx-auto w-full">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Internal Campaign Name</label>
                                        <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Summer Sale 2024" className="w-full px-5 py-4 bg-white border border-slate-200 rounded-[1rem] text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Audience Segment</label>
                                        <select value={segmentId} onChange={e => setSegmentId(e.target.value)} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-[1rem] text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm">
                                            <option value="">All Active Contacts</option>
                                            {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="max-w-7xl mx-auto w-full">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email Subject Line</label>
                                    <input required type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Wait! Your exclusive deal is inside..." className="w-full px-5 py-4 bg-white border border-slate-200 rounded-[1rem] text-sm font-black text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-300 shadow-sm" />
                                </div>

                                <div className="max-w-7xl mx-auto w-full">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block flex justify-between">
                                        <span>Template / HTML Content</span>
                                        <span className="text-emerald-500">Supports Markdown & Personalization</span>
                                    </label>
                                    <textarea 
                                        required 
                                        rows={12} 
                                        value={htmlContent} 
                                        onChange={e => setHtmlContent(e.target.value)} 
                                        placeholder="Use {{first_name}} to personalize your message..."
                                        className="w-full px-6 py-6 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-medium text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none shadow-sm"
                                    />
                                    <div className="mt-4 flex gap-3">
                                        <button type="button" onClick={() => setPreviewMode("mobile")} className="px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">Preview Mobile</button>
                                        <button type="button" onClick={() => setPreviewMode("desktop")} className="px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">Preview Desktop</button>
                                    </div>
                                </div>

                                {/* Cloud Attachments */}
                                <div className="p-6 bg-white border border-slate-200 rounded-[1.5rem] space-y-4 shadow-sm max-w-7xl mx-auto w-full">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex justify-between">
                                        <span>Cloud Documents (Links)</span>
                                        <span className="text-amber-500">Improves Deliverability</span>
                                    </label>
                                    <p className="text-xs text-slate-500 font-medium pb-2">To prevent spam filters, link your Google Drive, Dropbox, or hosted PDFs here instead of hard-attaching thick files.</p>
                                    {attachments.map((att, i) => (
                                        <div key={i} className="flex gap-3 items-center">
                                            <input type="text" placeholder="e.g. Sales Catalog" value={att.name} onChange={e => {
                                                const newAtt = [...attachments];
                                                newAtt[i].name = e.target.value;
                                                setAttachments(newAtt);
                                            }} className="w-1/3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                                            <input type="url" placeholder="e.g. https://drive.google.com/..." value={att.url} onChange={e => {
                                                const newAtt = [...attachments];
                                                newAtt[i].url = e.target.value;
                                                setAttachments(newAtt);
                                            }} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                                            {attachments.length > 1 && (
                                                <button type="button" onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="p-3 text-slate-400 hover:text-rose-500 transition-all">
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setAttachments([...attachments, { name: "", url: "" }])} className="text-xs font-bold text-[#27954D] uppercase hover:underline">
                                        + Add Another Link
                                    </button>
                                </div>
                            </form>
                        )}
                        
                        {/* Fixed Footer */}
                        {previewMode === "none" && (
                            <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] z-10">
                                <button type="button" onClick={() => setShowModal(false)} className="py-4 bg-white text-slate-500 rounded-[1rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-200 max-w-sm ml-auto w-full">Discard</button>
                                <button form="campaign-form" disabled={sending} type="submit" className="py-4 bg-gradient-to-r from-[#27954D] to-[#1e7a3d] text-white rounded-[1rem] text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 max-w-sm mr-auto w-full">
                                    {sending ? "Initiating..." : "Launch Campaign"} <ArrowRight size={16} />
                                </button>
                            </div>
                        )}
                        
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

function TipItem({ icon, title, text, color = "text-emerald-500" }: any) {
    return (
        <div className="flex gap-3">
            <div className={`mt-1 ${color} shrink-0`}>{icon}</div>
            <div>
                <p className="text-[11px] font-black text-slate-800 leading-tight">{title}</p>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">{text}</p>
            </div>
        </div>
    );
}

function MiniStat({ label, value, icon, color, bg }: any) {
    return (
        <div className="bg-white/40 backdrop-blur-xl border border-slate-100 p-8 rounded-[2rem] shadow-sm flex items-center gap-6 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all">
            <div className={`p-4 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div>
                <div className="text-3xl font-black text-slate-900 tracking-tighter">{value}</div>
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1">{label}</div>
            </div>
        </div>
    );
}
