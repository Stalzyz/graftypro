
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Handshake, Users, Globe, TrendingUp, ShieldAlert, MoreVertical,
    Plus, Search, IndianRupee, ExternalLink,
    Loader2, RefreshCw, X, Zap, ChevronRight, ShieldCheck, Fingerprint, FileText, CheckCircle2, AlertCircle
} from "lucide-react";

export default function PartnerRegistry() {
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<any>(null);
    const [isKycModalOpen, setIsKycModalOpen] = useState(false);

    const [stats, setStats] = useState<any>({
        totalPartners: 0,
        activePartners: 0,
        monthlyRevenue: 0,
        totalEndClients: 0
    });

    useEffect(() => {
        fetchPartners();
    }, [page]);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/super-admin/partners?page=${page}&limit=20`);
            const data = await res.json();

            if (data.data) {
                setPartners(data.data);
                setTotalPages(data.pagination.totalPages);
                setTotalRecords(data.pagination.total);

                setStats({
                    totalPartners: data.pagination.total,
                    activePartners: data.data.filter((p: any) => p.status === 'ACTIVE').length,
                    monthlyRevenue: data.pagination.total * 12500,
                    totalEndClients: data.pagination.total * 3
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = async (partnerId: string, currentRole: string) => {
        const nextRole = currentRole === 'PLATFORM' ? 'AFFILIATE' : 'PLATFORM';
        if (!confirm(`Switch this partner to ${nextRole}? This will change their dashboard capabilities immediately.`)) return;

        try {
            const res = await fetch(`/api/super-admin/partners/${partnerId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: nextRole })
            });
            if (res.ok) {
                fetchPartners();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleVerifyKyc = async (partnerId: string, status: 'VERIFIED' | 'REJECTED', notes: string) => {
        try {
            const res = await fetch(`/api/super-admin/resellers/${partnerId}/kyc`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, notes })
            });
            if (res.ok) {
                setIsKycModalOpen(false);
                fetchPartners();
            }
        } catch (e) {
            alert("Verification failed");
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-fade-in relative">
            {/* Header Area */}
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg">
                            <Handshake className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Affiliate Network</h1>
                            <p className="text-slate-400 font-medium text-sm">Managing Affiliate and Platform Partners worldwide.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <Search size={16} className="text-slate-400 ml-4" />
                        <input
                            placeholder="Search partners..."
                            className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 px-4 py-2 w-[250px]"
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-orange-600 transition-all shadow-xl shadow-slate-100 active:scale-95"
                    >
                        <Plus size={14} /> Add Partner
                    </button>
                </div>
            </header>

            {/* Quick Intel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <IntelCard
                    label="Total Partners"
                    value={stats.totalPartners}
                    icon={<Users className="text-blue-500" />}
                    trend="Growth: +4 MoM"
                />
                <IntelCard
                    label="Ecosystem Revenue"
                    value={`₹${(stats.monthlyRevenue || 0).toLocaleString()}`}
                    icon={<TrendingUp className="text-green-500" />}
                    trend="+12.5% vs Last MoB"
                />
                <IntelCard
                    label="End-Client Volume"
                    value={stats.totalEndClients}
                    icon={<Globe className="text-purple-500" />}
                    trend="Market Reach"
                />
                <IntelCard
                    label="Pending KYC"
                    value={partners.filter(p => p.kyc_status === 'SUBMITTED').length}
                    icon={<Fingerprint className="text-orange-500" />}
                    trend="Awaiting Review"
                    alert={partners.some(p => p.kyc_status === 'SUBMITTED')}
                />
            </div>

            {/* Partner Registry Table */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-slate-400 gap-2">
                            <Loader2 size={24} className="animate-spin" /> Loading Partners...
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <th className="px-8 py-6">Partner Info</th>
                                    <th className="px-8 py-6">Identity & KYC</th>
                                    <th className="px-8 py-6">Business Volume</th>
                                    <th className="px-8 py-6">Wallet & Tier</th>
                                    <th className="px-8 py-6">Intelligence</th>
                                    <th className="px-8 py-6">Capability Role</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {partners.map((partner) => (
                                    <tr key={partner.id} className="hover:bg-slate-50/10 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-slate-700 transition-all overflow-hidden border border-slate-100">
                                                    {partner.logo_url ? <img src={partner.logo_url} className="w-full h-full object-cover" /> : (partner.business_name?.[0] || partner.name?.[0] || 'P')}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900">{partner.business_name || partner.name}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase">{partner.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full border border-slate-200" style={{ background: partner.primary_color || '#000' }} />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{partner.brand_name || 'Generic'}</span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedPartner(partner);
                                                        setIsKycModalOpen(true);
                                                    }}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${partner.kyc_status === 'VERIFIED' ? 'bg-green-50 text-green-600 border-green-100' :
                                                        partner.kyc_status === 'SUBMITTED' ? 'bg-orange-50 text-orange-600 border-orange-100 animate-pulse' :
                                                            partner.kyc_status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                                                                'bg-slate-50 text-slate-400 border-slate-100'
                                                        }`}
                                                >
                                                    {partner.kyc_status === 'VERIFIED' ? <CheckCircle2 size={10} /> :
                                                        partner.kyc_status === 'SUBMITTED' ? <AlertCircle size={10} /> : <Fingerprint size={10} />}
                                                    KYC: {partner.kyc_status || 'NONE'}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="text-sm font-black text-slate-900">{partner.workspace_count || 0} Clients</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500" style={{ width: '45%' }} />
                                                    </div>
                                                    <span className="text-[8px] font-black text-slate-300 uppercase">Growth Potential</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="text-sm font-black text-slate-900">₹{Number(partner.wallet_balance || 0).toLocaleString()}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${partner.tier_id ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                                        {partner.tier?.name || 'Standard Tier'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col items-center">
                                                    <div className={`text-xs font-black ${partner.risk_score > 60 ? 'text-red-500' : partner.risk_score > 30 ? 'text-amber-500' : 'text-green-500'}`}>
                                                        {partner.risk_score || 0}%
                                                    </div>
                                                    <div className="text-[8px] font-black text-slate-300 uppercase">Risk</div>
                                                </div>
                                                <div className="w-px h-8 bg-slate-100" />
                                                <div className="flex flex-col">
                                                    <div className="text-[10px] font-black text-slate-900 uppercase">Commission</div>
                                                    <div className="text-xs font-bold text-slate-400">{partner.base_commission || 20}% Rate</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button
                                                onClick={() => toggleRole(partner.id, partner.role)}
                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${partner.role === 'PLATFORM'
                                                    ? 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 hover:bg-cyan-500/20'
                                                    : 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20'
                                                    }`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${partner.role === 'PLATFORM' ? 'bg-cyan-500' : 'bg-amber-500'}`} />
                                                {partner.role || 'AFFILIATE'}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/super-admin/dashboard/partners/${partner.id}`} className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
                                                    <ChevronRight size={16} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing Page {page} of {totalPages} ({totalRecords} Partners)
                        </span>
                        <p className="text-[10px] font-bold text-slate-300 italic mt-1">
                            Compliance: FY {new Date().getFullYear()}-{new Date().getFullYear() + 1}
                        </p>
                    </div>

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

            {/* Modals */}
            {isAddModalOpen && (
                <AddPartnerModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        fetchPartners();
                    }}
                />
            )}

            {isKycModalOpen && selectedPartner && (
                <KycReviewModal
                    partner={selectedPartner}
                    onClose={() => setIsKycModalOpen(false)}
                    onVerify={(status: 'VERIFIED' | 'REJECTED', notes: string) => handleVerifyKyc(selectedPartner.id, status, notes)}
                />
            )}
        </div>
    );
}

function KycReviewModal({ partner, onClose, onVerify }: any) {
    const [notes, setNotes] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-3xl bg-slate-900/60 animate-in fade-in zoom-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-3xl overflow-hidden border border-white/20 flex flex-col">
                <div className="p-10 border-b border-slate-50">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3 text-orange-600 font-bold text-[10px] uppercase tracking-[0.3em]">
                            <Fingerprint size={16} /> Compliance Review
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={24} /></button>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">{partner.business_name || partner.name}</h2>
                    <p className="text-slate-400 font-medium text-sm mt-1">Reviewing verification documents for {partner.email}</p>
                </div>

                <div className="p-10 flex-1 overflow-y-auto space-y-8 custom-scrollbar max-h-[60vh]">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Type</label>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-sm font-bold text-slate-900">{partner.kyc_type || 'NOT SPECIFIED'}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Reference</label>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-sm font-bold text-slate-900">{partner.kyc_data?.id_number || 'MISSING'} ({partner.kyc_data?.id_type || 'N/A'})</span>
                            </div>
                        </div>
                    </div>

                    {partner.kyc_data?.business_reg_number && (
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-100 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full inline-block">Business Registration</label>
                            <div className="p-6 bg-slate-900 text-white rounded-[32px] shadow-xl">
                                <span className="text-xl font-black tracking-widest italic">{partner.kyc_data.business_reg_number}</span>
                            </div>
                        </div>
                    )}

                    {partner.kyc_data?.documents && partner.kyc_data.documents.length > 0 && (
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supporting Documents</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {partner.kyc_data.documents.map((doc: string, idx: number) => (
                                    <a
                                        key={idx}
                                        href={doc}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-white hover:border-slate-200 transition-all group shadow-sm hover:shadow-md"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-900">Document #{idx + 1}</div>
                                                <div className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Click to view</div>
                                            </div>
                                        </div>
                                        <ExternalLink size={16} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Review Notes</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Add compliance notes or rejection reasons..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-sm font-medium focus:bg-white focus:border-slate-200 focus:outline-none transition-all min-h-[120px]"
                        />
                    </div>
                </div>

                <div className="p-10 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <button
                        onClick={() => { setIsProcessing(true); onVerify('REJECTED', notes); }}
                        disabled={isProcessing}
                        className="p-5 border-2 border-red-500/20 text-red-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                    >
                        <X size={16} /> Reject Submission
                    </button>
                    <button
                        onClick={() => { setIsProcessing(true); onVerify('VERIFIED', notes); }}
                        disabled={isProcessing}
                        className="p-5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
                    >
                        <CheckCircle2 size={16} /> Approve Partner
                    </button>
                </div>
            </div>
        </div>
    );
}

function AddPartnerModal({ onClose, onSuccess }: any) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        business_name: "",
        password: "",
        role: "AFFILIATE"
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) return alert("All fields are required.");

        setLoading(true);
        try {
            const res = await fetch("/api/super-admin/resellers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                onSuccess();
            } else {
                alert(data.error || "Provisioning failed.");
            }
        } catch (error) {
            alert("Network error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-slate-900/40 animate-in fade-in zoom-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[48px] shadow-3xl p-12 relative border border-white/20">
                <button onClick={onClose} className="absolute top-10 right-10 text-slate-500 hover:text-slate-900 transition-colors">
                    <X size={32} />
                </button>

                <div className="mb-12">
                    <div className="flex items-center gap-3 text-slate-900 font-bold text-[10px] uppercase tracking-[0.3em] mb-4">
                        <Plus size={14} className="text-orange-500" /> Provision Entity
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">New Partner</h2>
                    <p className="text-slate-400 font-medium text-sm">Deploy a new partner node to the global network.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Identity</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
                            placeholder="John Grayson"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
                            placeholder="john@grafty.net"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Initial Role</label>
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all appearance-none"
                            >
                                <option value="AFFILIATE">Affiliate</option>
                                <option value="PLATFORM">Platform</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Access Key (Password)</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white p-6 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-600 transition-all disabled:bg-slate-200 flex items-center justify-center gap-3 mt-4 shadow-2xl shadow-slate-200 active:scale-95"
                    >
                        {loading ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                        {loading ? "COMMITTING..." : "PROVISION ACCESS"}
                    </button>
                </form>
            </div>
        </div>
    );
}

function IntelCard({ label, value, icon, trend, alert }: any) {
    return (
        <div className={`bg-white p-8 rounded-[40px] border ${alert ? 'border-red-100' : 'border-slate-100'} shadow-sm space-y-4 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden`}>
            {alert && <div className="absolute top-0 right-0 w-2 h-full bg-red-500 animate-pulse" />}
            <div className="relative z-10 flex items-start justify-between">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-slate-700 transition-all duration-500 shadow-sm border border-black/5">
                    {icon}
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{trend}</span>
                </div>
            </div>
            <div className="relative z-10 space-y-1">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">{value}</h3>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                </div>
            </div>
        </div>
    );
}
