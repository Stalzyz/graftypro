
"use client";
import { useState, useEffect } from "react";
import {
    Users,
    Plus,
    Search,
    Loader2,
    DollarSign,
    Briefcase,
    Handshake,
    Filter,
    ArrowRight,
    TrendingUp,
    MoreHorizontal,
    Mail,
    Phone,
    CheckCircle2,
    ExternalLink,
    Building2,
    X,
    ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default function PartnerListPage() {
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Form Stats
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const res = await fetch("/api/super-admin/partners");
            const data = await res.json();
            setPartners(data.partners || []);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/super-admin/partners", {
                method: "POST",
                body: JSON.stringify({ name, email, password, phone, commission_pct: 20 }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                setShowCreate(false);
                fetchPartners();
                alert("Partner Created!");
            } else {
                alert("Failed to create partner");
            }
        } catch (e) {
            alert("Network Error");
        }
    };

    return (
        <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#042f94] font-semibold text-[10px] uppercase tracking-[0.2em] mb-3">
                        <Handshake size={14} strokeWidth={1.5} /> Distribution Network
                    </div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight">Partner Registry</h1>
                    <p className="text-slate-400 text-sm font-medium">Manage resellers, white-label agencies, and affiliate settlements.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#27954D] hover:bg-[#042f94] text-white rounded-2xl shadow-lg shadow-[#27954D]/10 text-xs font-bold transition-all active:scale-95"
                    >
                        <Plus size={18} strokeWidth={2.5} /> <span>Join Partner</span>
                    </button>
                </div>
            </header>

            {/* Core Analytics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <KPICard
                    label="Active Partners"
                    value={partners.length.toString()}
                    icon={<Users size={22} strokeWidth={1.5} />}
                    color="green"
                    trend="GROWING"
                />
                <KPICard
                    label="Pending Payouts"
                    value="₹0.00"
                    icon={<DollarSign size={22} strokeWidth={1.5} />}
                    color="blue"
                    trend="SETTLED"
                />
                <KPICard
                    label="Network Velocity"
                    value="8.4x"
                    icon={<TrendingUp size={22} strokeWidth={1.5} />}
                    color="emerald"
                    trend="SCALE"
                />
            </div>

            {/* Partners Table */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm shadow-slate-200/20">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div className="flex gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#27954D] transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder="Filter Partners..."
                                className="bg-white border border-slate-100 rounded-xl pl-10 pr-6 py-2.5 text-xs font-bold w-64 focus:ring-4 focus:ring-slate-50 transition-all outline-none"
                            />
                        </div>
                    </div>
                    <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                        <Filter size={14} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-bold uppercase tracking-[0.15em]">
                                <th className="px-10 py-6">Partner Entity</th>
                                <th className="px-10 py-6">Status</th>
                                <th className="px-10 py-6">Governance</th>
                                <th className="px-10 py-6">Commission</th>
                                <th className="px-10 py-6 text-right pr-12">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-24 text-center">
                                        <div className="w-8 h-8 border-2 border-[#27954D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Syncing Nodes...</span>
                                    </td>
                                </tr>
                            ) : partners.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-24 text-center">
                                        <Handshake size={48} className="mx-auto mb-4 text-slate-100" />
                                        <span className="text-sm font-medium text-slate-400 italic">No partners currently registered in cluster.</span>
                                    </td>
                                </tr>
                            ) : partners.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-[#042f94]/5 text-[#042f94] flex items-center justify-center font-black text-xs shadow-sm shadow-[#042f94]/5">
                                                {p.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-700 text-sm group-hover:text-[#042f94] transition-colors">{p.name}</div>
                                                <div className="text-[10px] text-slate-300 font-medium tracking-tight mt-0.5 uppercase tracking-widest leading-none">{p.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-[0.05em] border ${p.status === 'ACTIVE' ? 'bg-[#27954D]/5 text-[#27954D] border-[#27954D]/10' : 'bg-amber-50 text-amber-500 border-amber-100'
                                            }`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[10px] font-bold text-slate-700 flex items-center gap-2">
                                                <Users size={12} className="text-slate-300" /> {p.referral_count} Tenancies
                                            </div>
                                            <div className="text-[9px] font-medium text-slate-300 uppercase tracking-widest italic">Tier 1 License</div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-black text-slate-700">{p.commission_pct}%</div>
                                            <span className="text-[9px] font-black text-slate-300 tracking-[0.1em] uppercase">Revenue Share</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right pr-12">
                                        <Link
                                            href={`/super-admin/dashboard/partners/${p.id}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 hover:border-[#27954D]/30 text-slate-400 hover:text-[#042f94] rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
                                        >
                                            <ExternalLink size={14} strokeWidth={2.5} />
                                            <span>Config</span>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/40 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-3xl p-12 relative border border-slate-100">
                        <button onClick={() => setShowCreate(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors">
                            <X size={24} />
                        </button>

                        <div className="mb-10 space-y-2">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Onboard Partner</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Reseller Node Provisioning Protocol</p>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-6">
                            <InputField label="Partner Entity Name" icon={<Building2 size={16} />} value={name} onChange={setName} placeholder="e.g. Atlas Marketing Group" />
                            <InputField label="Corporate Email" icon={<Mail size={16} />} type="email" value={email} onChange={setEmail} placeholder="partner@entity.com" />
                            <InputField label="Primary Contact" icon={<Phone size={16} />} value={phone} onChange={setPhone} placeholder="+91 XXXX XXXX" />
                            <InputField label="Access Cipher" icon={<ShieldCheck size={16} />} type="password" value={password} onChange={setPassword} placeholder="••••••••" />

                            <div className="pt-6 flex gap-4">
                                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.25em] hover:bg-black transition-all shadow-xl shadow-slate-200">Initialize</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function KPICard({ label, value, trend, icon, color }: any) {
    const colorStyles: any = {
        green: "bg-green-50 text-[#042f94]",
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
    };

    return (
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm transition-all duration-300 group hover:shadow-xl hover:-translate-y-1">
            <div className="flex justify-between items-start mb-8">
                <div className={`w-14 h-14 rounded-2xl ${colorStyles[color]} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-sm`}>
                    {icon}
                </div>
                <div className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black rounded-full tracking-widest uppercase">
                    {trend}
                </div>
            </div>
            <div className="space-y-1">
                <div className="text-3xl font-black text-slate-800 tracking-tighter italic">{value}</div>
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{label}</div>
            </div>
        </div>
    );
}

function InputField({ label, icon, value, onChange, type = "text", placeholder }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors">
                    {icon}
                </div>
                <input
                    required
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-50 transition-all"
                />
            </div>
        </div>
    );
}
