"use client";
import { useEffect, useState } from "react";
import {
    Plus, Ticket, Users, Check, Trash2, Layout, Zap,
    ShoppingBag, Loader2, Code, Copy, CheckCircle,
    ArrowUpRight, Target, ShieldCheck, Activity, ChevronRight, AlertCircle
} from "lucide-react";

export default function SubscriptionsPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showEmbed, setShowEmbed] = useState(false);
    const [platformId, setPlatformId] = useState("");
    const [basePlans, setBasePlans] = useState<any[]>([]);

    const [newPlan, setNewPlan] = useState({
        name: "",
        description: "",
        monthly_price: 999,
        yearly_price: 9990,
        base_plan_id: ""
    });

    const [creating, setCreating] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        fetch("/api/reseller/me")
            .then(res => res.json())
            .then(data => {
                setPlatformId(data.data?.id);
                setWalletBalance(Number(data.data?.wallet_balance || 0));
            });

        // Fetch super admin base plans
        fetch("/api/super-admin/packages")
            .then(res => res.json())
            .then(data => setBasePlans(data.data?.filter((p: any) => p.is_public && p.reseller_id === null) || []));

        fetch("/api/reseller/subscriptions")
            .then(res => res.json())
            .then(data => {
                setPlans(data.data || []);
                setLoading(false);
            });
    }, []);

    const handleCreate = async () => {
        if (!newPlan.name) return alert("Plan name is required");
        if (!newPlan.base_plan_id) return alert("Please select a base engine");
        setCreating(true);
        try {
            const res = await fetch("/api/reseller/subscriptions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPlan)
            });
            const data = await res.json();
            if (res.ok) {
                setPlans([data.data, ...plans]);
                setShowModal(false);
                setNewPlan({
                    name: "",
                    description: "",
                    monthly_price: 999,
                    yearly_price: 9990,
                    base_plan_id: ""
                });
            } else {
                alert(data.error);
            }
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this subscription plan? Existing users on this plan will not be affected but no new signups will be allowed.")) return;
        try {
            const res = await fetch(`/api/reseller/subscriptions?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setPlans(plans.filter(p => p.id !== id));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const embedCode = `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed/subscription.js" 
data-platform-id="${platformId}"
data-theme="light">
</script>`;

    const [copied, setCopied] = useState(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(embedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-24">

            {/* Simplified Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-600 font-black text-[9px] uppercase tracking-[0.3em] mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
                        Monetization Plans
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                        Manage Plans<span className="text-indigo-600">.</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm tracking-tight italic">Design and deploy subscription tiers for your vendor network.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowEmbed(true)}
                        className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                    >
                        <Code size={16} /> Embed Matrix
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-black shadow-xl active:scale-95 flex items-center gap-2"
                    >
                        <Plus size={16} /> Deploy New Plan
                    </button>
                </div>
            </div>

            {/* Platform Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm flex items-center gap-6 group hover:border-[#27954D]/20 transition-all">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#27954D] shadow-inner border border-emerald-100 group-hover:scale-110 transition-transform">
                        <Activity size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Active Licenses</div>
                        <div className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">{plans.length} Tiers</div>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm flex items-center gap-6 group hover:border-blue-200 transition-all">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner border border-blue-100 group-hover:scale-110 transition-transform">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Portfolio Base</div>
                        <div className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">52 Nodes</div>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm flex items-center gap-6 group hover:border-amber-200 transition-all">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner border border-amber-100 group-hover:scale-110 transition-transform">
                        <Zap size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Yield Efficiency</div>
                        <div className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">98.4%</div>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-white border border-slate-100 rounded-[3rem] p-8 relative overflow-hidden group shadow-sm hover:shadow-2xl hover:border-[#27954D]/10 transition-all duration-500 animate-in zoom-in-95">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-slate-900 group-hover:scale-110 transition-transform duration-1000 rotate-12">
                            <Ticket size={120} strokeWidth={1} />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
                                        {plan.name.includes('_') ? plan.name.split('_')[1] : plan.name}
                                    </h3>
                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-[#27954D] group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-all">
                                        <Target size={20} />
                                    </div>
                                </div>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-relaxed line-clamp-2 italic">{plan.description || "System standard licensing structure."}</p>
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-slate-900 italic tracking-tighter">₹{plan.monthly_price}</span>
                                <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] italic">/ Global Month</span>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-50">
                                <FeatureLine icon={<Users size={14} />} text={`${plan.max_users} Agent Nodes`} />
                                <FeatureLine icon={<Ticket size={14} />} text={`${plan.max_contacts} Unique Leads`} />
                                {plan.flow_builder_access && <FeatureLine icon={<Layout size={14} />} text="Flow Logic Engine" />}
                                {plan.commerce_access && <FeatureLine icon={<ShoppingBag size={14} />} text="Commerce Artifacts" />}
                                {plan.drip_campaign_access && <FeatureLine icon={<Zap size={14} />} text="Drip Sequences" />}
                            </div>

                            <div className="flex items-center gap-3 pt-6">
                                <button className="flex-1 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl transition-all border border-slate-100 hover:border-slate-900 active:scale-[0.98]">
                                    Modify Config
                                </button>
                                <button
                                    onClick={() => handleDelete(plan.id)}
                                    className="p-3.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 active:scale-90"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {plans.length === 0 && (
                    <div className="lg:col-span-3 py-32 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[3rem] text-center space-y-4">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-slate-200 border border-slate-50 shadow-sm">
                            <Ticket size={40} />
                        </div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">No Active Plans</h3>
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic">Deploy your first commercial tier to begin signups</p>
                    </div>
                )}
            </div>

            {/* Create Plan Modal Engine */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="absolute inset-0" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white border border-slate-200 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase leading-none mb-1">Deploy Artifact</h2>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic leading-none mt-1">Initialize Commercial License</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-100 hover:border-rose-200 hover:text-rose-500 transition-all text-slate-400 shadow-sm active:scale-90">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Plan Identifier (Retail Name)</label>

                                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-[#27954D] uppercase tracking-widest leading-none">Available Escrow Liquid</span>
                                    <span className="text-sm font-black text-[#27954D] leading-none">₹{walletBalance.toLocaleString()}</span>
                                </div>
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4.5 text-slate-900 focus:border-[#27954D] focus:bg-white outline-none transition-all font-black italic uppercase tracking-tighter placeholder:text-slate-300 shadow-inner"
                                    placeholder="E.G. PRO GROWTH MATRIX"
                                    value={newPlan.name}
                                    onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Select Base Engine (Wholesale Capability)</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {basePlans.map(base => {
                                        const active = newPlan.base_plan_id === base.id;
                                        return (
                                            <div
                                                key={base.id}
                                                onClick={() => setNewPlan({ ...newPlan, base_plan_id: base.id })}
                                                className={`p-5 rounded-3xl border transition-all cursor-pointer ${active
                                                    ? 'bg-slate-900 border-slate-900 shadow-xl'
                                                    : 'bg-white border-slate-200 hover:border-[#27954D] hover:shadow-md'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${active ? 'border-emerald-400' : 'border-slate-300'}`}>
                                                            {active && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                                                        </div>
                                                        <span className={`text-lg font-black uppercase tracking-tight italic ${active ? 'text-white' : 'text-slate-900'}`}>{base.name}</span>
                                                    </div>
                                                    <div className={`text-right ${active ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                        <div className="text-[10px] font-black uppercase tracking-widest">Base Cost</div>
                                                        <div className="text-xl font-black tracking-tighter">₹{base.min_reseller_price || 0}</div>

                                                        {walletBalance < Number(base.min_reseller_price || 0) && (
                                                            <div className="text-[8px] font-black uppercase tracking-widest text-rose-500 mt-1 flex items-center justify-end gap-1">
                                                                <AlertCircle size={10} /> Escrow Low
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className={`flex flex-wrap gap-2 pt-4 border-t ${active ? 'border-slate-800' : 'border-slate-100'}`}>
                                                    <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${active ? 'bg-white/10 text-slate-300' : 'bg-slate-50 text-slate-500'}`}>Contacts: {base.max_contacts}</span>
                                                    <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${active ? 'bg-white/10 text-slate-300' : 'bg-slate-50 text-slate-500'}`}>Flows: {base.max_flows}</span>
                                                    {base.api_access && <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>API Ready</span>}
                                                    {base.commerce_access && <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${active ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>Commerce</span>}
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {basePlans.length === 0 && (
                                        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 text-xs font-bold uppercase tracking-widest">
                                            No Base Engines Available. Contact Platform Administrator.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Retail Price (Monthly)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-[#27954D] focus:ring-4 ring-emerald-500/10 outline-none transition-all font-black tabular-nums shadow-sm"
                                        placeholder="2999"
                                        value={newPlan.monthly_price}
                                        onChange={e => setNewPlan({ ...newPlan, monthly_price: parseInt(e.target.value) })}
                                    />
                                    {newPlan.base_plan_id && (
                                        <p className="text-[9px] font-bold text-slate-400 px-1 mt-1">Must be {">"} ₹{basePlans.find(b => b.id === newPlan.base_plan_id)?.min_reseller_price || 0}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Retail Price (Yearly)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-[#27954D] focus:ring-4 ring-emerald-500/10 outline-none transition-all font-black tabular-nums shadow-sm"
                                        placeholder="29990"
                                        value={newPlan.yearly_price}
                                        onChange={e => setNewPlan({ ...newPlan, yearly_price: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            {newPlan.base_plan_id && walletBalance < Number(basePlans.find(b => b.id === newPlan.base_plan_id)?.min_reseller_price || 0) && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 mt-4">
                                    <AlertCircle size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none mb-1">Insufficient Escrow Funds</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                            Your wallet balance is too low to cover the Wholesale Cost of this engine. Please top up your wallet in the Billing section to deploy this plan.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleCreate}
                                disabled={creating || (newPlan.base_plan_id ? walletBalance < Number(basePlans.find(b => b.id === newPlan.base_plan_id)?.min_reseller_price || 0) : false)}
                                className="w-full py-5 bg-[#27954D] text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-[2rem] flex items-center justify-center gap-3 mt-4 hover:bg-black transition-all shadow-xl shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none"
                            >
                                {creating ? <Loader2 className="animate-spin" /> : <>Deploy Subscription Matrix <ArrowUpRight size={18} /></>}
                            </button>
                        </div>
                    </div>
                </div>
                </div>
    )
}

{/* Embed Console Engine */ }
{
    showEmbed && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={() => setShowEmbed(false)}></div>
            <div className="relative bg-white border border-slate-200 w-full max-w-xl rounded-[3rem] shadow-2xl p-12 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                        <Code size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Embed.Matrix</h2>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic leading-none mt-1">Cross-Protocol Initialization</p>
                    </div>
                </div>

                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed mb-6">Injection script for external node synchronization. Place this artifact on your primary portal to render current commercial tiers.</p>

                <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 mb-10 font-mono text-[11px] text-emerald-400 break-all h-32 overflow-y-auto shadow-inner relative group">
                    <div className="absolute top-4 right-4 text-white/10 group-hover:text-white/20 transition-colors uppercase font-black text-[8px] tracking-widest">Script.js</div>
                    {embedCode}
                </div>

                <button
                    onClick={copyToClipboard}
                    className="w-full py-5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-[2rem] flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-[0.98] shadow-xl shadow-black/10"
                >
                    {copied ? <CheckCircle size={18} className="text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" /> : <Copy size={18} />}
                    {copied ? "Artifact Copied" : "Copy Injection Script"}
                </button>

                <div className="mt-10 p-6 bg-blue-50/50 border border-blue-100 rounded-[2rem] flex gap-5">
                    <Zap className="text-blue-500 shrink-0" size={20} />
                    <p className="text-[10px] text-blue-700 font-bold uppercase tracking-widest leading-relaxed italic">
                        This artifact automatically resolves revenue splits and attributes leads to your platform fingerprint during node provisioning.
                    </p>
                </div>
            </div>
        </div>
    )
}
        </div >
    )
}

function FeatureLine({ icon, text }: any) {
    return (
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-700 transition-colors italic">
            <span className="text-[#27954D]">{icon}</span>
            {text}
        </div>
    )
}
