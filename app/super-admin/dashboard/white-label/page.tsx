
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Globe, Paintbrush, Fingerprint, ExternalLink, Zap, Users, ArrowUpRight, X, Save, RefreshCw, Upload, CheckCircle2 } from "lucide-react";

export default function WhiteLabelHub() {
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [selectedPartner, setSelectedPartner] = useState<any>(null);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        fetchPartners();
    }, [page]);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/super-admin/resellers?page=${page}&limit=20`);
            const data = await res.json();
            if (data.success) {
                setPartners(data.data || []);
                setTotalPages(data.pagination.totalPages);
                setTotalRecords(data.pagination.total);
            }
        } catch (error) {
            console.error("Failed to fetch partners");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl space-y-12 pb-20 font-sans">
            <header className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <ShieldCheck className="text-white" size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Partner Hub</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Enterprise Platform Partner Management, Custom Domains, and Branding Provisioning.</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95">
                        <Fingerprint size={14} />
                        Provision Platform Partner
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <FeatureCard
                    title="Custom Domain Engine"
                    description="CNAME mapping and SSL automation for elite resellers."
                    icon={<Globe />}
                    value={`${totalRecords} Registered`} // Showing total as approximation for now
                    link="Manage DNS"
                    href="#registry"
                />
                <FeatureCard
                    title="Design Profile Sync"
                    description="Automated logo and theme inheritance for child-tenant portals."
                    icon={<Paintbrush />}
                    value="Synchronized"
                    link="Theme Rules"
                    href="/super-admin/dashboard/theme"
                />
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between" id="registry">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Elite Deployment Registry</h2>
                    <span className="px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase">Page {page} of {totalPages}</span>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-slate-400 gap-2">
                            <RefreshCw size={24} className="animate-spin" /> Loading Registry...
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Identity</th>
                                    <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Gateway</th>
                                    <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">State</th>
                                    <th className="text-right px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {partners.map((partner) => (
                                    <PartnerRow
                                        key={partner.id}
                                        partner={partner}
                                        onConfigure={() => { setSelectedPartner(partner); setIsConfigModalOpen(true); }}
                                    />
                                ))}
                                {partners.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-10 text-slate-400 font-bold text-sm">No partners found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-8 bg-slate-50/50 flex items-center justify-between border-t border-slate-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Showing {partners.length} of {totalRecords} Records
                    </span>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || totalPages === 0}
                            className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Config Modal */}
            {isConfigModalOpen && selectedPartner && (
                <ConfigModal
                    partner={selectedPartner}
                    onClose={() => setIsConfigModalOpen(false)}
                    onSuccess={() => { setIsConfigModalOpen(false); fetchPartners(); }}
                />
            )}

            {/* Create Partner Modal */}
            {isCreateModalOpen && (
                <CreatePartnerModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => { setIsCreateModalOpen(false); fetchPartners(); }}
                />
            )}
        </div>
    );
}

function FeatureCard({ title, description, icon, value, link, href }: any) {
    return (
        <div className="bg-white rounded-[40px] border border-slate-100 p-10 space-y-8 hover:shadow-2xl transition-all duration-500 group">
            <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Status</span>
                    <span className="text-sm font-black text-slate-900">{value}</span>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{description}</p>
                <Link href={href || "#"} className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 hover:underline pt-4">
                    {link} <ArrowUpRight size={14} />
                </Link>
            </div>
        </div>
    );
}

function PartnerRow({ partner, onConfigure }: any) {
    const name = partner.business_name || partner.name;
    const domain = partner.custom_domain || "Not Configured";
    const status = partner.status;

    return (
        <tr className="hover:bg-slate-50/30 transition-colors group">
            <td className="px-10 py-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black uppercase overflow-hidden">
                        {partner.logo_url ? (
                            <img
                                src={partner.logo_url}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerText = name[0]; }}
                            />
                        ) : name[0]}
                    </div>
                    <div>
                        <div className="text-sm font-black text-slate-900">{name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{partner.tier?.name || 'Standard License'}</div>
                    </div>
                </div>
            </td>
            <td className="px-10 py-8">
                <div className="flex items-center gap-2">
                    <Globe size={14} className={partner.custom_domain ? "text-blue-500" : "text-slate-300"} />
                    <span className={`text-xs font-bold ${partner.custom_domain ? "text-slate-700" : "text-slate-300 italic"}`}>{domain}</span>
                </div>
            </td>
            <td className="px-10 py-8">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'ACTIVE' ? 'bg-[#27954D] shadow-[0_0_8px_rgba(39,149,77,0.5)]' : 'bg-slate-400'}`} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{status}</span>
                </div>
            </td>
            <td className="px-10 py-8 text-right">
                <button
                    onClick={onConfigure}
                    className="px-6 py-2.5 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-slate-700 transition-all"
                >
                    Configure Identity
                </button>
            </td>
        </tr>
    );
}

function ConfigModal({ partner, onClose, onSuccess }: any) {
    const defaultFeatureFlags = {
        flows: true, drips: true, commerce: true, edu: false,
        api: false, bulk_broadcast: true, crm: true, affiliate: false,
    };
    const [config, setConfig] = useState({
        custom_domain: partner.custom_domain || "",
        brand_name: partner.brand_name || "",
        logo_url: partner.logo_url || "",
        primary_color: partner.primary_color || "#0F172A",
        secondary_color: partner.secondary_color || "#3B82F6",
        support_email: partner.support_email || "",
        support_whatsapp: partner.support_whatsapp || "",
        min_markup_percent: partner.min_markup_percent ?? 10,
        max_markup_percent: partner.max_markup_percent ?? 200,
        feature_flags: { ...defaultFeatureFlags, ...(partner.feature_flags || {}) },
    });
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"branding" | "features" | "limits">("branding");

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/super-admin/resellers/${partner.id}`, {
                method: "PATCH",
                body: JSON.stringify(config),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) onSuccess();
            else alert("Failed to save configuration");
        } catch (e) {
            alert("Error saving configuration");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-slate-900/40 animate-in fade-in zoom-in duration-300">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[48px] shadow-3xl relative custom-scrollbar">
                <div className="sticky top-0 bg-white rounded-t-[48px] z-10 px-12 pt-10 pb-6 border-b border-slate-50">
                    <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-slate-900 transition-colors">
                        <X size={28} />
                    </button>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Partner Config</h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-5">{partner.business_name || partner.name}</p>

                    {/* Tabs */}
                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl">
                        {[
                            { id: "branding", label: "🎨 Branding" },
                            { id: "features", label: "⚡ Feature Flags" },
                            { id: "limits", label: "💰 Pricing Limits" },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-white text-slate-900 shadow-md" : "text-slate-400"}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-12 space-y-8">
                    {/* BRANDING TAB */}
                    {activeTab === "branding" && (<>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Custom Domain (CNAME)</label>
                            <input type="text" value={config.custom_domain} onChange={e => setConfig({ ...config, custom_domain: e.target.value })}
                                className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all" placeholder="e.g. portal.partner.com" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Brand Name</label>
                                <input type="text" value={config.brand_name} onChange={e => setConfig({ ...config, brand_name: e.target.value })}
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all" placeholder="e.g. Partner Agency" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Support Email</label>
                                <input type="email" value={config.support_email} onChange={e => setConfig({ ...config, support_email: e.target.value })}
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all" placeholder="support@partner.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Brand Color</label>
                                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl">
                                    <input type="color" value={config.primary_color} onChange={e => setConfig({ ...config, primary_color: e.target.value })} className="w-10 h-10 rounded-xl border-none cursor-pointer bg-transparent" />
                                    <span className="text-xs font-bold text-slate-700">{config.primary_color}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Secondary Brand Color</label>
                                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl">
                                    <input type="color" value={config.secondary_color} onChange={e => setConfig({ ...config, secondary_color: e.target.value })} className="w-10 h-10 rounded-xl border-none cursor-pointer bg-transparent" />
                                    <span className="text-xs font-bold text-slate-700">{config.secondary_color}</span>
                                </div>
                            </div>
                        </div>
                        <LogoUpload label="Brand Logo" value={config.logo_url} onChange={(url: string) => setConfig({ ...config, logo_url: url })} />
                    </>)}

                    {/* FEATURE FLAGS TAB */}
                    {activeTab === "features" && (
                        <div className="space-y-4">
                            <p className="text-[10px] text-slate-400 font-medium">Control which modules this reseller's sub-tenants can access. Disabling a module hides it from their dashboard.</p>
                            {[
                                { key: "flows", label: "🔀 Flow Builder", desc: "Visual conversation flow designer" },
                                { key: "drips", label: "⏱️ Drip Campaigns", desc: "Automated message sequences" },
                                { key: "bulk_broadcast", label: "📢 Bulk Broadcast", desc: "Mass message campaigns" },
                                { key: "crm", label: "👥 CRM Module", desc: "Contact management and pipelines" },
                                { key: "commerce", label: "🛒 Commerce / E-Commerce", desc: "Product catalog and orders" },
                                { key: "edu", label: "🎓 Academy CRM", desc: "Education and course management" },
                                { key: "api", label: "🌐 API Access", desc: "External API integration keys" },
                                { key: "affiliate", label: "🤝 Affiliate Program", desc: "Referral and commission tracking" },
                            ].map(({ key, label, desc }) => {
                                const isEnabled = config.feature_flags[key as keyof typeof config.feature_flags] ?? true;
                                return (
                                    <div key={key} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isEnabled ? "bg-white border-slate-100" : "bg-slate-50 border-slate-100 opacity-60"}`}>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{label}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
                                        </div>
                                        <button
                                            onClick={() => setConfig({ ...config, feature_flags: { ...config.feature_flags, [key]: !isEnabled } })}
                                            className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${isEnabled ? "bg-emerald-500" : "bg-slate-200"}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${isEnabled ? "left-7" : "left-1"}`} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* PRICING LIMITS TAB */}
                    {activeTab === "limits" && (
                        <div className="space-y-8">
                            <p className="text-[10px] text-slate-400 font-medium">Set minimum and maximum markup percentages this reseller can apply on top of your base price.</p>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Minimum Markup %</label>
                                    <div className="relative">
                                        <input type="number" min={0} max={500}
                                            value={config.min_markup_percent}
                                            onChange={e => setConfig({ ...config, min_markup_percent: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl pl-4 pr-10 py-5 text-3xl font-black text-emerald-900 outline-none"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-sm">%</span>
                                    </div>
                                    <p className="text-[9px] text-slate-400 mt-1">Reseller must mark up at least this much above your wholesale price.</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Maximum Markup %</label>
                                    <div className="relative">
                                        <input type="number" min={0} max={10000}
                                            value={config.max_markup_percent}
                                            onChange={e => setConfig({ ...config, max_markup_percent: parseFloat(e.target.value) || 200 })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-4 pr-10 py-5 text-3xl font-black text-slate-900 outline-none"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">%</span>
                                    </div>
                                    <p className="text-[9px] text-slate-400 mt-1">Reseller cannot exceed this markup. Leave 0 for unlimited.</p>
                                </div>
                            </div>

                            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                                <p className="text-xs font-black text-amber-700 mb-2">📊 Example</p>
                                <p className="text-[11px] text-amber-600 font-medium">
                                    If your plan costs ₹999 and min markup is {config.min_markup_percent}%, the reseller must charge at least ₹{Math.round(999 * (1 + config.min_markup_percent / 100)).toLocaleString()}.
                                </p>
                            </div>
                        </div>
                    )}

                    <button onClick={handleSave} disabled={saving}
                        className="w-full bg-slate-900 text-white p-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:bg-slate-200 flex items-center justify-center gap-2"
                    >
                        {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                        {saving ? "SAVING..." : "SAVE PARTNER CONFIG"}
                    </button>
                </div>
            </div>
        </div>
    );
}


function LogoUpload({ label, value, onChange }: any) {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("module", "branding");

        try {
            const res = await fetch("/api/media/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (res.ok && data.url) {
                onChange(data.url);
            } else {
                alert(data.error || "Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</span>
            <label className="h-32 bg-slate-50 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-slate-100 transition-all overflow-hidden relative">
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                />

                {uploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                        <RefreshCw className="animate-spin text-slate-400" size={24} />
                    </div>
                ) : null}

                {value ? (
                    <img src={value} className="w-full h-full object-contain p-4" alt="Logo" />
                ) : (
                    <>
                        <Upload size={20} className="text-slate-500 group-hover:text-slate-900 transition-colors" />
                        <span className="text-[9px] font-black text-slate-500 group-hover:text-slate-900 uppercase">Upload</span>
                    </>
                )}
            </label>
        </div>
    );
}

function CreatePartnerModal({ onClose, onSuccess }: any) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        business_name: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!formData.name || !formData.email) return alert("Name and Email are required");

        setLoading(true);
        try {
            const res = await fetch("/api/super-admin/resellers", {
                method: "POST",
                body: JSON.stringify(formData),
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();

            if (res.ok) {
                onSuccess();
            } else {
                alert(data.error || "Failed to create");
            }
        } catch (e) {
            alert("Error creating reseller");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-slate-900/40 animate-in fade-in zoom-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[48px] shadow-3xl p-12 relative">
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-slate-900 transition-colors">
                    <X size={32} />
                </button>

                <div className="mb-10">
                    <h2 className="text-3xl font-black text-slate-900 mb-2">New Elite Partner</h2>
                    <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.2em]">Provision access for a new white-label tenant.</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Partner Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
                            placeholder="e.g. john@agency.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Business Name</label>
                        <input
                            type="text"
                            value={formData.business_name}
                            onChange={e => setFormData({ ...formData, business_name: e.target.value })}
                            className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
                            placeholder="e.g. Agency Corp"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password (Optional)</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
                            placeholder="Default: Password@123"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-slate-900 text-white p-6 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-[#27954D] transition-all disabled:bg-slate-200 flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                        {loading ? "PROVISIONING..." : "CREATE PARTNER"}
                    </button>
                </div>
            </div>
        </div>
    );
}
