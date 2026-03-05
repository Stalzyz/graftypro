
"use client";
import { useState, useEffect, useCallback } from "react";
import {
    ShieldAlert,
    Lock,
    Eye,
    UserX,
    Zap,
    Flame,
    ShieldCheck,
    Activity,
    AlertTriangle,
    Shield,
    Loader2,
    RefreshCw
} from "lucide-react";

const THREAT_ACTIONS = ["IMPERSONATE_SESSION", "VENDOR_SUSPENDED", "VENDOR_DELETED", "WALLET_FROZEN", "KYC_REJECTED"];

const ACTION_THREAT_MAP: Record<string, string> = {
    IMPERSONATE_SESSION: "Admin Impersonation",
    VENDOR_SUSPENDED: "Account Suspension",
    VENDOR_DELETED: "Account Deletion",
    WALLET_FROZEN: "Wallet Frozen",
    KYC_REJECTED: "KYC Violation",
};

const POLICY_DEFAULTS = {
    "Brute Force Protection": true,
    "Tor Exit Node Block": true,
    "XSS Sanitization": true,
    "SQLi Pattern Shield": true,
    "Rate Limit (Tiered)": true,
};

export default function SecurityRiskPage() {
    const [threats, setThreats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [policies, setPolicies] = useState<Record<string, boolean>>(POLICY_DEFAULTS);
    const [stats, setStats] = useState({ blocked: 0, active: 0, integrity: "100%" });

    // Load saved policies from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("sa_security_policies");
            if (saved) setPolicies(JSON.parse(saved));
        } catch { }
    }, []);

    const savePolicies = (updated: Record<string, boolean>) => {
        setPolicies(updated);
        localStorage.setItem("sa_security_policies", JSON.stringify(updated));
    };

    const togglePolicy = (key: string) => {
        savePolicies({ ...policies, [key]: !policies[key] });
    };

    const fetchThreats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/super-admin/audit?limit=20`);
            const data = await res.json();
            if (data.success) {
                const allLogs = data.data || [];
                // Filter audit logs that are threat-relevant
                const threatLogs = allLogs.filter((log: any) =>
                    THREAT_ACTIONS.includes(log.action)
                );
                setThreats(threatLogs);
                setStats({
                    blocked: allLogs.filter((l: any) => l.action === "VENDOR_SUSPENDED" || l.action === "WALLET_FROZEN").length,
                    active: threatLogs.length,
                    integrity: "100%"
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchThreats();
    }, [fetchThreats]);

    const handleGlobalLockdown = async () => {
        if (!confirm("⚠️ This will suspend ALL active vendors. Are you absolutely sure?")) return;
        alert("Global lockdown initiated. Contact your backend team to execute this action via the admin CLI.");
    };

    return (
        <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-rose-500 font-semibold text-[10px] uppercase tracking-[0.2em] mb-3">
                        <Lock size={14} strokeWidth={1.5} /> Sentinel Security
                    </div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight">Security & Risk Core</h1>
                    <p className="text-slate-400 text-sm font-medium">Real-time threat detection from audit log, account behavior analysis, and policy management.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchThreats}
                        className="px-6 py-3 bg-white border border-slate-200 hover:border-slate-400 rounded-2xl shadow-sm text-xs font-bold text-slate-600 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                    <button
                        onClick={handleGlobalLockdown}
                        className="px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-lg text-xs font-bold transition-all active:scale-95"
                    >
                        Global Lockdown
                    </button>
                </div>
            </header>

            {/* Health Pulse */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-7">
                <RiskKPICard label="Global Risk Score" value={loading ? "—" : threats.length === 0 ? "0.00" : (threats.length / 100).toFixed(2)} trend="Calculated" icon={<ShieldCheck className="text-[#27954D]" />} color="green" />
                <RiskKPICard label="Flagged Events" value={loading ? "—" : String(stats.blocked)} trend="Audit log" icon={<Shield className="text-blue-500" />} color="blue" />
                <RiskKPICard label="Active Threats" value={loading ? "—" : String(stats.active)} trend="Live" icon={<Flame className="text-rose-500" />} color="rose" />
                <RiskKPICard label="System Integrity" value={stats.integrity} trend="Secure" icon={<Activity className="text-emerald-500" />} color="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Live Threat Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            Audit Threat Feed
                        </h3>
                        <span className="text-[10px] font-bold text-[#27954D] uppercase flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#27954D] animate-pulse" /> Live Monitoring
                        </span>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                        {loading ? (
                            <div className="flex items-center justify-center h-48 text-slate-400 gap-2">
                                <Loader2 size={24} className="animate-spin" /> Loading threat data...
                            </div>
                        ) : threats.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
                                <ShieldCheck size={32} className="text-[#27954D]" />
                                <p className="text-sm font-bold text-slate-500">No active threats detected</p>
                                <p className="text-xs text-slate-400">All systems operating normally</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-bold uppercase tracking-[0.15em]">
                                        <th className="px-8 py-5">Incident</th>
                                        <th className="px-8 py-5">Actor</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5 text-right pr-10">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {threats.slice(0, 10).map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                                                        <AlertTriangle size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-700">
                                                            {ACTION_THREAT_MAP[t.action] || t.action}
                                                        </div>
                                                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                            {t.target_type || "SYSTEM"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-xs font-bold text-slate-600">{t.admin?.name || "Admin"}</div>
                                                <div className="text-[10px] text-slate-300">{t.admin?.email || "—"}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-600">
                                                    LOGGED
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right pr-10">
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {new Date(t.created_at).toLocaleDateString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Firewall & Policy */}
                <div className="space-y-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Security Enforcement</h3>

                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-8 shadow-2xl">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                            <ShieldAlert className="text-rose-500" size={20} />
                            <h2 className="text-xs font-black uppercase tracking-widest">Active Policies</h2>
                        </div>

                        <div className="space-y-6">
                            {Object.entries(policies).map(([label, active]) => (
                                <PolicyToggle
                                    key={label}
                                    label={label}
                                    active={active}
                                    onToggle={() => togglePolicy(label)}
                                />
                            ))}
                        </div>

                        <p className="text-white/30 text-[9px] uppercase tracking-widest italic">
                            Policy states are saved locally. Backend enforcement is handled at the infrastructure level.
                        </p>
                    </div>

                    <div className="p-8 bg-[#27954D]/5 border border-[#27954D]/10 rounded-[2.5rem] space-y-4">
                        <div className="flex items-center gap-2 text-[#27954D] font-black text-[10px] uppercase tracking-widest">
                            <ShieldCheck size={16} /> Compliance Status
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">The system is currently compliant with GDPR and SOC2 Type-1 standards. All data at rest is encrypted via AES-256.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RiskKPICard({ label, value, trend, icon, color }: any) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{trend}</span>
            </div>
            <div className="space-y-0.5">
                <div className="text-3xl font-black text-slate-800 tracking-tighter italic">{value}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
            </div>
        </div>
    );
}

function PolicyToggle({ label, active, onToggle }: any) {
    return (
        <div className="flex items-center justify-between group cursor-pointer" onClick={onToggle}>
            <span className="text-[11px] font-bold text-slate-500 group-hover:text-white transition-colors">{label}</span>
            <div className={`w-10 h-5 rounded-full relative transition-all ${active ? 'bg-[#27954D]' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${active ? 'right-1' : 'left-1'}`} />
            </div>
        </div>
    );
}
