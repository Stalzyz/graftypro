
"use client";
import {
    ShieldAlert,
    Lock,
    Eye,
    UserX,
    Zap,
    Flame,
    ShieldCheck,
    Activity,
    ArrowUpRight,
    AlertTriangle,
    Search,
    Filter,
    Shield
} from "lucide-react";

export default function SecurityRiskPage() {
    const threats = [
        { id: "T-882", target: "Tesla Motors", threat: "Brute Force Attempt", score: 88, status: "MITIGATED", date: "Just now" },
        { id: "T-881", target: "SpaceX", threat: "WABA Sandbox Violation", score: 65, status: "WATCHING", date: "12m ago" },
        { id: "T-880", target: "Anonymous", threat: "SQL Injection Probe", score: 92, status: "BANNED", date: "45m ago" },
    ];

    return (
        <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-rose-500 font-semibold text-[10px] uppercase tracking-[0.2em] mb-3">
                        <Lock size={14} strokeWidth={1.5} /> Sentinel Security
                    </div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight">Security & Risk Core</h1>
                    <p className="text-slate-400 text-sm font-medium">Real-time threat detection, account behavior analysis, and firewall orchestration.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-lg text-xs font-bold transition-all active:scale-95">
                        Global Lockdown
                    </button>
                </div>
            </header>

            {/* Health Pulse */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-7">
                <RiskKPICard label="Global Risk Score" value="0.04" trend="Nominal" icon={<ShieldCheck className="text-[#27954D]" />} color="green" />
                <RiskKPICard label="Blocked Requests" value="1,402" trend="+12%" icon={<Shield className="text-blue-500" />} color="blue" />
                <RiskKPICard label="Active Threats" value="3" trend="-45%" icon={<Flame className="text-rose-500" />} color="rose" />
                <RiskKPICard label="System Integrity" value="100%" trend="Secure" icon={<Activity className="text-emerald-500" />} color="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Live Threat Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            Active Mitigation Feed
                        </h3>
                        <span className="text-[10px] font-bold text-[#27954D] uppercase flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#27954D] animate-pulse" /> Live Monitoring
                        </span>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-bold uppercase tracking-[0.15em]">
                                    <th className="px-8 py-5">Incident</th>
                                    <th className="px-8 py-5">Severity</th>
                                    <th className="px-8 py-5">Protocol Status</th>
                                    <th className="px-8 py-5 text-right pr-10">Operation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {threats.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                                                    <AlertTriangle size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-700">{t.threat}</div>
                                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t.target}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-20">
                                                    <div className={`h-full rounded-full ${t.score > 80 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${t.score}%` }} />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400">{t.score}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${t.status === 'BANNED' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' :
                                                    t.status === 'MITIGATED' ? 'bg-green-100 text-[#27954D]' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right pr-10">
                                            <button className="text-slate-300 hover:text-slate-900 transition-colors">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                            <PolicyToggle label="Brute Force Protection" active={true} />
                            <PolicyToggle label="Tor Exit Node Block" active={true} />
                            <PolicyToggle label="XSS Sanitization" active={true} />
                            <PolicyToggle label="SQLi Pattern Shield" active={true} />
                            <PolicyToggle label="Rate Limit (Tiered)" active={true} />
                        </div>

                        <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all">
                            Manage Security Rules
                        </button>
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

function PolicyToggle({ label, active }: any) {
    return (
        <div className="flex items-center justify-between group cursor-pointer">
            <span className="text-[11px] font-bold text-slate-500 group-hover:text-white transition-colors">{label}</span>
            <div className={`w-10 h-5 rounded-full relative transition-all ${active ? 'bg-[#27954D]' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${active ? 'right-1' : 'left-1'}`} />
            </div>
        </div>
    );
}
