
"use client";

import { useState, useEffect } from "react";
import { Shield, ShieldCheck, Users, Lock, ChevronRight, Plus, Save, AlertTriangle, RefreshCw, X, Trash2, Key, Info } from "lucide-react";

export default function RBACConfiguration() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<any>(null);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/super-admin/admins");
            const data = await res.json();
            if (data.success) {
                setAdmins(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch admins");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (admin: any) => {
        setSelectedAdmin(admin);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedAdmin(null);
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-7xl space-y-12 pb-20 font-sans">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[#042f94] font-semibold text-[10px] uppercase tracking-[0.2em] mb-3">
                        <Shield size={14} />
                        Governance Control
                    </div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight italic">RBAC Matrix</h1>
                    <p className="text-slate-400 text-sm font-medium">Configure global permission layers and administrative boundaries.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200"
                >
                    <Plus size={14} /> Forge New Role
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Administrative team</h3>
                        </div>
                        <div className="divide-y divide-slate-50 line-clamp-2">
                            {loading ? (
                                <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3">
                                    <RefreshCw className="animate-spin" size={16} />
                                    Analyzing Neural Links...
                                </div>
                            ) : (
                                admins.map((admin) => (
                                    <div key={admin.id} className="p-8 flex items-center justify-between group hover:bg-slate-50 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-slate-700 transition-all shadow-sm">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900">{admin.name || "Unnamed Entity"}</div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{admin.email} • {admin.role}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {admin.role === 'SUPER_ADMIN' ? (
                                                <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest border border-slate-800 shadow-lg">
                                                    SYSTEM MASTER
                                                </span>
                                            ) : (
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${admin.role === 'FINANCE' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'}`}>
                                                    {admin.role}
                                                </span>
                                            )}
                                            <button
                                                onClick={() => handleEdit(admin)}
                                                className="p-3 bg-slate-50 rounded-xl hover:bg-slate-900 hover:text-slate-700 transition-all shadow-sm"
                                            >
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RBAC MATRIX SECTION */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-10 border-b border-slate-50 bg-slate-900 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest">Standardized Permission Matrix</h3>
                                <p className="text-[10px] text-white/40 font-bold uppercase mt-1">Cross-role functional boundary definitions</p>
                            </div>
                            <Key size={20} className="text-blue-400" />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                        <th className="px-8 py-6">Functional Module</th>
                                        <th className="px-8 py-6 text-center">Super Admin</th>
                                        <th className="px-8 py-6 text-center">Sales</th>
                                        <th className="px-8 py-6 text-center">Finance</th>
                                        <th className="px-8 py-6 text-center">Support</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-600">
                                    <MatrixRow label="Operational Hub & Stats" roles={[true, true, true, true]} />
                                    <MatrixRow label="Sales War Room (CRM)" roles={[true, true, false, false]} />
                                    <MatrixRow label="Financial Ledger & GST" roles={[true, false, true, false]} />
                                    <MatrixRow label="RBAC & Governance" roles={[true, false, false, false]} />
                                    <MatrixRow label="Infrastructure Control" roles={[true, false, false, false]} />
                                    <MatrixRow label="Whitelabel & Branding" roles={[true, false, false, true]} />
                                    <MatrixRow label="SMTP & Automation" roles={[true, false, false, false]} />
                                </tbody>
                            </table>
                        </div>
                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                            <Info size={14} className="text-[#042f94]" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Super Admin has atomic, unrestricted access to all platform logic and database streams.</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="p-8 bg-amber-50 rounded-[40px] border border-amber-100 space-y-6">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="text-amber-500" size={20} />
                            <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest">Security Alert</h4>
                        </div>
                        <p className="text-[11px] text-amber-600 leading-relaxed font-medium">
                            Role configurations impact all accounts immediately. Deleting a role might lock users out of the system. Proceed with extreme caution when modifying "Governance" roles.
                        </p>
                    </div>

                    <div className="p-8 bg-slate-900 rounded-[40px] text-white space-y-8">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                            <Lock className="text-blue-400" size={18} />
                            <h2 className="text-sm font-black uppercase tracking-widest">System Lockout</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Multi-Factor Auth</span>
                                <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Expiry</span>
                                <span className="text-xs font-black">24 Hours</span>
                            </div>
                        </div>
                        <button className="w-full py-4 bg-white/5 border border-white/10 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                            Save Global Policies
                        </button>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <AdminModal
                    admin={selectedAdmin}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => { setIsModalOpen(false); fetchAdmins(); }}
                />
            )}
        </div>
    );
}

function AdminModal({ admin, onClose, onSuccess }: any) {
    const [formData, setFormData] = useState({
        name: admin?.name || "",
        email: admin?.email || "",
        password: "",
        role: admin?.role || "SUPPORT"
    });
    const [loading, setLoading] = useState(false);
    const isEdit = !!admin;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = isEdit ? `/api/super-admin/admins/${admin.id}` : "/api/super-admin/admins";
            const method = isEdit ? "PATCH" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) onSuccess();
            else {
                const err = await res.json();
                alert(err.error || "Operation failed");
            }
        } catch (e) {
            alert("Network error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Confirm permanent termination of this administrative identity?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/super-admin/admins/${admin.id}`, { method: "DELETE" });
            if (res.ok) onSuccess();
            else {
                const err = await res.json();
                alert(err.error || "Termination failed");
            }
        } catch (e) {
            alert("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-slate-900/40 animate-in fade-in zoom-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[48px] shadow-3xl p-12 relative">
                <button onClick={onClose} className="absolute top-10 right-10 text-slate-500 hover:text-slate-900 transition-colors">
                    <X size={32} />
                </button>

                <div className="mb-10">
                    <h2 className="text-3xl font-black text-slate-900 mb-2">{isEdit ? "Refine Role" : "Forge Identity"}</h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Define administrative boundaries for the node.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Identity Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
                            placeholder="e.g. Sarah Connor"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Universal Address (Email)</label>
                        <input
                            type="email"
                            required
                            disabled={isEdit}
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all disabled:opacity-50"
                            placeholder="admin@grafty.net"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Permission Layer</label>
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all appearance-none"
                            >
                                <option value="SUPER_ADMIN">Super Admin</option>
                                <option value="SALES">Sales Agent</option>
                                <option value="FINANCE">Finance Admin</option>
                                <option value="SUPPORT">Customer Support</option>
                                <option value="READ_ONLY">Auditor (Read Only)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Access Key</label>
                            <input
                                type="password"
                                required={!isEdit}
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
                                placeholder={isEdit ? "Leave blank to keep" : "••••••••"}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        {isEdit && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex-1 bg-red-50 text-red-500 p-6 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} /> Terminate
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] bg-slate-900 text-white p-6 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:bg-slate-200 flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                            {isEdit ? "COMMIT CHANGES" : "FORGE IDENTITY"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function MatrixRow({ label, roles }: { label: string, roles: boolean[] }) {
    return (
        <tr className="hover:bg-slate-50/50 transition-all">
            <td className="px-8 py-5 text-slate-900">{label}</td>
            {roles.map((can, i) => (
                <td key={i} className="px-8 py-5 text-center">
                    <div className="flex justify-center">
                        {can ? (
                            <div className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
                                <ShieldCheck size={14} />
                            </div>
                        ) : (
                            <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                                <Lock size={12} />
                            </div>
                        )}
                    </div>
                </td>
            ))}
        </tr>
    );
}
