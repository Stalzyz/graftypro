"use client";

import { useState, useEffect } from "react";
import {
    Users,
    UserPlus,
    Shield,
    Mail,
    Key,
    Trash2,
    Loader2,
    Search,
    BadgeCheck,
    Lock
} from "lucide-react";

export default function TeamManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "AGENT"
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/settings/users");
            const data = await res.json();
            if (data.data) setUsers(data.data);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviting(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch("/api/settings/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to invite user");

            setSuccess(`User ${formData.email} invited successfully!`);
            setFormData({
                email: "",
                password: "",
                first_name: "",
                last_name: "",
                role: "AGENT"
            });
            fetchUsers();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setInviting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#27954D]" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Team Management</h1>
                    <p className="text-gray-500 text-sm">Manage workspace agents and their access permissions.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Invite Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-xl shadow-gray-100/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <UserPlus size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Invite New Agent</h2>
                        </div>

                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1.5 block">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3 text-gray-400" size={16} />
                                    <input
                                        required
                                        type="email"
                                        placeholder="agent@company.com"
                                        className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1.5 block">Password</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-3 text-gray-400" size={16} />
                                    <input
                                        required
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1.5 block">First Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="John"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                        value={formData.first_name}
                                        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1.5 block">Last Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Doe"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                        value={formData.last_name}
                                        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1.5 block">Access Role</label>
                                <div className="relative">
                                    <Shield className="absolute left-4 top-3 text-gray-400" size={16} />
                                    <select
                                        className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium appearance-none"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="AGENT">Agent (Inbox Access)</option>
                                        <option value="ADMIN">Admin (Full Control)</option>
                                        <option value="FINANCE">Finance (Billing Only)</option>
                                    </select>
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl">{error}</p>}
                            {success && <p className="text-[#27954D] text-xs font-bold bg-green-50 p-3 rounded-xl">{success}</p>}

                            <button
                                disabled={inviting}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50"
                            >
                                {inviting ? <Loader2 size={20} className="animate-spin" /> : <>Invite Agent <UserPlus size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Users List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Users size={20} className="text-gray-400" />
                                <h3 className="font-bold text-gray-800">Active Members ({users.length})</h3>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search team..."
                                    className="bg-gray-50 border-none rounded-xl pl-9 pr-4 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none w-48"
                                />
                            </div>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {users.map((user) => (
                                <div key={user.id} className="p-6 flex items-center justify-between group hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm">
                                            {user.first_name?.[0] || user.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-gray-800">{user.first_name} {user.last_name}</h4>
                                                {user.role === 'OWNER' && (
                                                    <span className="bg-amber-50 text-amber-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border border-amber-100 flex items-center gap-1">
                                                        <Lock size={8} /> Owner
                                                    </span>
                                                )}
                                                {user.role === 'ADMIN' && (
                                                    <span className="bg-blue-50 text-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border border-blue-100">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Joined</div>
                                            <div className="text-[10px] font-bold text-gray-500 tracking-tight">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        {user.role !== 'OWNER' && (
                                            <button className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats Panel */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-lg shadow-indigo-100">
                            <div className="flex justify-between items-start mb-4">
                                <BadgeCheck className="text-indigo-200" size={24} />
                                <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest">Active Status</span>
                            </div>
                            <h4 className="text-2xl font-black">{users.filter(u => u.role === 'AGENT').length}</h4>
                            <p className="text-xs text-indigo-100 font-medium mt-1">Chat Agents Connected</p>
                        </div>
                        <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <Shield className="text-indigo-600" size={24} />
                                <span className="bg-gray-50 text-gray-400 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest tracking-widest">Security</span>
                            </div>
                            <h4 className="text-2xl font-black text-gray-800">{users.filter(u => u.role === 'ADMIN' || u.role === 'OWNER').length}</h4>
                            <p className="text-xs text-gray-400 font-medium mt-1">Privileged Access Roles</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
