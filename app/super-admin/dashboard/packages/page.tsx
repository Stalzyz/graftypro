"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import {
  Plus, ChevronRight, Info, Zap, User, ShoppingCart,
  BookOpen, Cpu, Layout, Database, CreditCard, Save,
  Settings, Mail, GitBranch, MessageSquare, Radio, Workflow, ExternalLink, Unplug, CheckCircle, AlertTriangle, RefreshCw,
  ChevronUp, ChevronDown, Trash
} from 'lucide-react';

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface SubscriptionPlan {
  id?: string;
  // General
  name: string;
  description: string;
  badge_text: string;
  cta_label: string;
  accent_color: string;
  bonus_text: string;
  // Pricing
  monthly_price: number;
  original_monthly_price: number;
  yearly_price: number;
  original_yearly_price: number;
  currency: string;
  gst_percentage: number;
  setup_fee: number;
  // Reseller Costs
  min_reseller_monthly_price: number;
  min_reseller_yearly_price: number;
  // Limits
  max_contacts: number;
  max_messages: number;
  max_flows: number;
  max_users: number;
  max_campaigns: number;
  trial_days: number;
  // Modules
  module_crm: boolean;
  module_ecommerce: boolean;
  module_academy: boolean;
  module_integration: boolean;
  module_drip: boolean;
  // Flow Nodes
  flow_msg_access: boolean;
  flow_automation_access: boolean;
  flow_logic_access: boolean;
  flow_commerce_access: boolean;
  flow_integration_access: boolean;
  // Flags
  is_featured: boolean;
  hidden_plan: boolean;
  unlimited_messaging: boolean;
  // Razorpay
  razorpay_monthly_plan_id?: string;
  razorpay_yearly_plan_id?: string;
  features_list?: string[];
}

const DEFAULT: SubscriptionPlan = {
  name: "", description: "", badge_text: "", cta_label: "Get Started",
  accent_color: "#27954D", bonus_text: "",
  monthly_price: 0, original_monthly_price: 0,
  yearly_price: 0, original_yearly_price: 0,
  currency: "INR", gst_percentage: 18, setup_fee: 0,
  min_reseller_monthly_price: 0, min_reseller_yearly_price: 0,
  max_contacts: 100, max_messages: 500, max_flows: 3,
  max_users: 1, max_campaigns: 1, trial_days: 0,
  module_crm: false, module_ecommerce: false, module_academy: false,
  module_integration: false, module_drip: false,
  flow_msg_access: true, flow_automation_access: false,
  flow_logic_access: false, flow_commerce_access: false,
  flow_integration_access: false,
  is_featured: false, hidden_plan: false, unlimited_messaging: false,
  razorpay_monthly_plan_id: "", razorpay_yearly_plan_id: "",
  features_list: [],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
        {hint && <span className="text-[10px] text-slate-400 font-medium">({hint})</span>}
      </div>
      {children}
    </div>
  );
}

const INPUT = "w-full bg-slate-50 border border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 ring-slate-200 focus:border-slate-300 transition-all";
const SELECT_CLS = `${INPUT} cursor-pointer`;

function Toggle({ label, sub, enabled, icon, onChange }: { label: string; sub?: string; enabled: boolean; icon: React.ReactNode; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      className={cn(
        "cursor-pointer p-5 rounded-2xl border-2 transition-all select-none flex items-center gap-4",
        enabled ? "bg-slate-900 border-slate-900 text-white" : "bg-slate-50 border-transparent text-slate-400 hover:border-slate-200 hover:text-slate-600 hover:bg-white"
      )}
    >
      <div className={cn("p-2 rounded-lg", enabled ? "bg-white/10" : "bg-slate-100")}>{icon}</div>
      <div className="flex-1">
        <p className="text-[11px] font-bold uppercase tracking-widest">{label}</p>
        {sub && <p className={cn("text-[10px] mt-0.5", enabled ? "text-white/50" : "text-slate-400")}>{sub}</p>}
      </div>
      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all", enabled ? "border-white bg-white" : "border-slate-300")}>
        {enabled && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function PackagesPage() {
  const [packages, setPackages] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<SubscriptionPlan>(DEFAULT);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [manualIds, setManualIds] = useState<Record<string, string>>({});
  const [gatewayConfig, setGatewayConfig] = useState({ key_id: "", key_secret: "" });
  const [savingGateway, setSavingGateway] = useState(false);

  const set = (patch: Partial<SubscriptionPlan>) => setForm(f => ({ ...f, ...patch }));

  useEffect(() => { 
    fetchPackages(); 
    fetchGatewayConfig();
  }, []);

  async function fetchPackages() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/super-admin/packages');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}: Failed to fetch packages`);
      setPackages(Array.isArray(json.data) ? json.data : []);
    } catch (e: any) { 
      console.error("Fetch Error:", e);
      setError(e.message || "Failed to load packages."); 
    }
    finally { setLoading(false); }
  }

  async function fetchGatewayConfig() {
    try {
      const res = await fetch("/api/super-admin/finance/payment");
      const data = await res.json();
      const rzp = data.gateways?.find((g: any) => g.provider === "Razorpay");
      if (rzp) setGatewayConfig({ key_id: rzp.key_id || "", key_secret: rzp.key_secret || "" });
    } catch (e) { console.error("Failed to fetch gateway config", e); }
  }

  async function handleSaveGateway() {
    setSavingGateway(true);
    try {
      const res = await fetch("/api/super-admin/finance/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          gateways: [
            { provider: "Razorpay", ...gatewayConfig, is_active: true, is_live: gatewayConfig.key_id.startsWith('rzp_live') }
          ] 
        })
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
      } else {
        throw new Error("Failed to save credentials");
      }
    } catch (e: any) { setError(e.message); }
    finally { setSavingGateway(false); }
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Package name is required."); return; }
    try {
      setSaving(true); setError(null);
      const method = editingId && editingId !== 'new' ? 'PATCH' : 'POST';
      const url = editingId && editingId !== 'new' ? `/api/super-admin/packages/${editingId}` : '/api/super-admin/packages';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed.");
      setSuccess(true); setTimeout(() => setSuccess(false), 2500);
      setForm(DEFAULT); setEditingId(null);
      fetchPackages();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleSync(cycle: "monthly" | "yearly", manualId?: string) {
    if (!editingId || editingId === 'new') return;
    setSyncing(cycle);
    try {
      const body = manualId 
        ? { plan_id: editingId, cycle, manual_rzp_id: manualId }
        : { plan_id: editingId, cycle };

      const res = await fetch("/api/super-admin/billing/sync-razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        set({ [cycle === "monthly" ? "razorpay_monthly_plan_id" : "razorpay_yearly_plan_id"]: data.razorpay_plan_id });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
      } else {
        throw new Error(data.error || "Sync failed");
      }
    } catch (e: any) { setError(e.message); }
    finally { setSyncing(null); }
  }

  async function handleDisconnect(cycle: "monthly" | "yearly") {
    if (!editingId || editingId === 'new') return;
    if (!confirm(`Are you sure you want to disconnect the ${cycle} Razorpay plan?`)) return;
    setSyncing(cycle);
    try {
      const res = await fetch("/api/super-admin/billing/plans", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, cycle })
      });
      const data = await res.json();
      if (data.success) {
        set({ [cycle === "monthly" ? "razorpay_monthly_plan_id" : "razorpay_yearly_plan_id"]: "" });
        setSuccess(true);
      } else {
        throw new Error(data.error || "Disconnect failed");
      }
    } catch (e: any) { setError(e.message); }
    finally { setSyncing(null); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete the package "${name}"? This cannot be undone.`)) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/super-admin/packages/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete package");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      fetchPackages();
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  const TABS = [
    { id: 'general', label: 'General', icon: <Layout size={14} /> },
    { id: 'pricing', label: 'Pricing', icon: <CreditCard size={14} /> },
    { id: 'reseller', label: 'Reseller Cost', icon: <GitBranch size={14} /> },
    { id: 'limits', label: 'Limits', icon: <Database size={14} /> },
    { id: 'modules', label: 'Modules', icon: <Cpu size={14} /> },
    { id: 'features', label: 'Bonus Features', icon: <Plus size={14} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={14} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Packages</h1>
          <p className="text-sm text-slate-400 mt-1">Manage subscription plans for vendors</p>
        </div>
        {!editingId && (
          <button onClick={() => { setEditingId("new"); setForm(DEFAULT); setActiveTab('general'); }}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-sm">
            <Plus size={16} /> New Package
          </button>
        )}
      </div>

      {/* ALERTS */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
            <Info size={16} /> {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm font-semibold flex items-center gap-2">
            ✓ Package saved successfully.
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {editingId ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* TAB BAR */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit flex-wrap">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn("px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                    activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                  {tab.icon} {tab.label}
                </button>
              ))}
              <button onClick={() => { setEditingId(null); setForm(DEFAULT); }}
                className="ml-2 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">
                Cancel
              </button>
            </div>

            {/* FORM CARD */}
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100">
              <AnimatePresence mode="wait">

                {/* ── GENERAL TAB ─────────────────────────────────────── */}
                {activeTab === 'general' && (
                  <motion.div key="general" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-6">
                    <Field label="Package Name">
                      <input value={form.name} onChange={e => set({ name: e.target.value })} className={INPUT} placeholder="e.g. Professional" />
                    </Field>
                    <Field label="Badge" hint="optional">
                      <input value={form.badge_text} onChange={e => set({ badge_text: e.target.value })} className={INPUT} placeholder="e.g. POPULAR" />
                    </Field>
                    <div className="col-span-2">
                      <Field label="Description">
                        <textarea value={form.description} onChange={e => set({ description: e.target.value })} className={cn(INPUT, "h-24 resize-none")} placeholder="Briefly describe this plan..." />
                      </Field>
                    </div>
                    <Field label="CTA Button Label">
                      <input value={form.cta_label} onChange={e => set({ cta_label: e.target.value })} className={INPUT} placeholder="Get Started" />
                    </Field>
                    <Field label="Accent Color">
                      <div className="flex gap-3">
                        <input type="color" value={form.accent_color} onChange={e => set({ accent_color: e.target.value })} className="w-12 h-11 rounded-xl border border-slate-200 p-1 cursor-pointer bg-white" />
                        <input value={form.accent_color} onChange={e => set({ accent_color: e.target.value })} className={cn(INPUT, "flex-1")} placeholder="#27954D" />
                      </div>
                    </Field>
                    <Field label="Bonus Text" hint="marketing line">
                      <input value={form.bonus_text} onChange={e => set({ bonus_text: e.target.value })} className={INPUT} placeholder="e.g. Priority Support Included" />
                    </Field>
                    <div className="col-span-2 flex gap-8 pt-4 border-t border-slate-50">
                      <Toggle label="Featured Plan" sub="Highlighted in pricing table" enabled={form.is_featured} icon={<Radio size={16} />} onChange={() => set({ is_featured: !form.is_featured })} />
                      <Toggle label="Hidden Plan" sub="Private / enterprise deals" enabled={form.hidden_plan} icon={<Settings size={16} />} onChange={() => set({ hidden_plan: !form.hidden_plan })} />
                      <Toggle label="Unlimited Messaging" sub="No message credit deduction" enabled={form.unlimited_messaging} icon={<MessageSquare size={16} />} onChange={() => set({ unlimited_messaging: !form.unlimited_messaging })} />
                    </div>
                  </motion.div>
                )}

                {/* ── PRICING TAB ─────────────────────────────────────── */}
                {activeTab === 'pricing' && (
                  <motion.div key="pricing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div className="grid grid-cols-3 gap-6">
                      <Field label="Currency">
                        <select value={form.currency} onChange={e => set({ currency: e.target.value })} className={SELECT_CLS}>
                          <option value="INR">INR — Indian Rupee</option>
                          <option value="USD">USD — US Dollar</option>
                          <option value="AED">AED — UAE Dirham</option>
                        </select>
                      </Field>
                      <Field label="GST %" hint="added on top of selling price">
                        <input type="number" value={form.gst_percentage} onChange={e => set({ gst_percentage: +e.target.value })} className={INPUT} />
                      </Field>
                      <Field label="One-Time Setup Fee" hint="optional">
                        <input type="number" value={form.setup_fee} onChange={e => set({ setup_fee: +e.target.value })} className={INPUT} placeholder="0" />
                      </Field>
                    </div>

                    {/* Monthly */}
                    <div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Monthly Billing</p>
                      <div className="grid grid-cols-2 gap-6">
                        <Field label="Selling Price / Month">
                          <input type="number" value={form.monthly_price} onChange={e => set({ monthly_price: +e.target.value })} className={INPUT} />
                        </Field>
                        <Field label="Actual Price / Month" hint="crossed out on pricing card">
                          <input type="number" value={form.original_monthly_price} onChange={e => set({ original_monthly_price: +e.target.value })} className={INPUT} />
                        </Field>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 ml-1">
                        Vendor pays: <strong>{form.currency} {(form.monthly_price * (1 + form.gst_percentage / 100)).toFixed(2)}</strong> incl. {form.gst_percentage}% GST
                      </p>
                    </div>

                    {/* Yearly */}
                    <div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Yearly Billing</p>
                      <div className="grid grid-cols-2 gap-6">
                        <Field label="Selling Price / Year">
                          <input type="number" value={form.yearly_price} onChange={e => set({ yearly_price: +e.target.value })} className={INPUT} />
                        </Field>
                        <Field label="Actual Price / Year" hint="crossed out on pricing card">
                          <input type="number" value={form.original_yearly_price} onChange={e => set({ original_yearly_price: +e.target.value })} className={INPUT} />
                        </Field>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 ml-1">
                        Vendor pays: <strong>{form.currency} {(form.yearly_price * (1 + form.gst_percentage / 100)).toFixed(2)}</strong> incl. {form.gst_percentage}% GST
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ── RESELLER COST TAB ───────────────────────────────── */}
                {activeTab === 'reseller' && (
                  <motion.div key="reseller" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-sm flex gap-3">
                      <Info size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Minimum Reseller Selling Price</p>
                        <p className="text-xs mt-1 text-amber-600">Resellers <strong>cannot</strong> price their plans below these values. This protects your base margin.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <Field label="Min Reseller Monthly Price">
                        <input type="number" value={form.min_reseller_monthly_price} onChange={e => set({ min_reseller_monthly_price: +e.target.value })} className={INPUT} placeholder="0" />
                      </Field>
                      <Field label="Min Reseller Yearly Price">
                        <input type="number" value={form.min_reseller_yearly_price} onChange={e => set({ min_reseller_yearly_price: +e.target.value })} className={INPUT} placeholder="0" />
                      </Field>
                    </div>
                    {(form.min_reseller_monthly_price > 0 || form.min_reseller_yearly_price > 0) && (
                      <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 space-y-1">
                        <p>Reseller monthly floor: <strong className="text-slate-700">{form.currency} {form.min_reseller_monthly_price}</strong></p>
                        <p>Reseller yearly floor: <strong className="text-slate-700">{form.currency} {form.min_reseller_yearly_price}</strong></p>
                        <p>Your platform margin (monthly): <strong className="text-green-600">{form.currency} {Math.max(0, form.monthly_price - form.min_reseller_monthly_price).toFixed(2)}</strong></p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── LIMITS TAB ──────────────────────────────────────── */}
                {activeTab === 'limits' && (
                  <motion.div key="limits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-6">
                    {[
                      { label: 'Contacts', key: 'max_contacts' },
                      { label: 'Agents (Users)', key: 'max_users' },
                      { label: 'Flows', key: 'max_flows' },
                      { label: 'Monthly Messages', key: 'max_messages' },
                      { label: 'Campaigns', key: 'max_campaigns' },
                      { label: 'Trial Days', key: 'trial_days' },
                    ].map(f => (
                      <Field key={f.key} label={f.label}>
                        <input type="number" min={0}
                          value={form[f.key as keyof SubscriptionPlan] as number}
                          onChange={e => set({ [f.key]: +e.target.value })}
                          className={INPUT} />
                      </Field>
                    ))}
                  </motion.div>
                )}

                {/* ── MODULES TAB ─────────────────────────────────────── */}
                {activeTab === 'modules' && (
                  <motion.div key="modules" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Main Modules</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Toggle label="CRM" sub="Contacts, Deals & Pipelines" enabled={form.module_crm} icon={<User size={16} />} onChange={() => set({ module_crm: !form.module_crm, crm_access: !form.module_crm } as any)} />
                        <Toggle label="Ecommerce" sub="Products, Orders & Cart" enabled={form.module_ecommerce} icon={<ShoppingCart size={16} />} onChange={() => set({ module_ecommerce: !form.module_ecommerce } as any)} />
                        <Toggle label="Academy" sub="Courses, Leads & Admissions" enabled={form.module_academy} icon={<BookOpen size={16} />} onChange={() => set({ module_academy: !form.module_academy } as any)} />
                        <Toggle label="API Access" sub="External integrations & webhooks" enabled={form.module_integration} icon={<Zap size={16} />} onChange={() => set({ module_integration: !form.module_integration } as any)} />
                        <Toggle label="Drip Messages" sub="Scheduled message sequences" enabled={form.module_drip} icon={<Mail size={16} />} onChange={() => set({ module_drip: !form.module_drip } as any)} />
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Flow Builder Permissions</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Toggle label="Messages & Broadcasts" sub="Send messages in flows" enabled={form.flow_msg_access} icon={<MessageSquare size={16} />} onChange={() => set({ flow_msg_access: !form.flow_msg_access })} />
                        <Toggle label="Automations" sub="Trigger-based auto responses" enabled={form.flow_automation_access} icon={<Workflow size={16} />} onChange={() => set({ flow_automation_access: !form.flow_automation_access })} />
                        <Toggle label="Logic & Conditions" sub="If/Else branching nodes" enabled={form.flow_logic_access} icon={<GitBranch size={16} />} onChange={() => set({ flow_logic_access: !form.flow_logic_access })} />
                        <Toggle label="Commerce Nodes" sub="Product cards in flows" enabled={form.flow_commerce_access} icon={<ShoppingCart size={16} />} onChange={() => set({ flow_commerce_access: !form.flow_commerce_access })} />
                        <Toggle label="API Nodes" sub="Webhook & HTTP nodes" enabled={form.flow_integration_access} icon={<Cpu size={16} />} onChange={() => set({ flow_integration_access: !form.flow_integration_access })} />
                      </div>
                    </div>
                  </motion.div>
                )}

                 {/* ── FEATURES TAB ─────────────────────────────────────── */}
                {activeTab === 'features' && (
                  <motion.div key="features" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="flex gap-2">
                        <input 
                          type="text" 
                          id="new_feature_input"
                          placeholder="Add a custom feature bullet (e.g. Green Tick Support)"
                          className="flex-1 bg-slate-50 border border-transparent rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 ring-slate-200"
                        />
                        <button 
                          onClick={() => {
                            const input = document.getElementById('new_feature_input') as HTMLInputElement;
                            if (input && input.value.trim()) {
                              set({ features_list: [...(form.features_list || []), input.value.trim()] });
                              input.value = "";
                            }
                          }}
                          className="px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                        >
                          Add Bullet
                        </button>
                    </div>

                    <div className="space-y-2 mt-4">
                      {(!form.features_list || form.features_list.length === 0) ? (
                        <p className="text-xs text-slate-400 italic">No custom features added yet.</p>
                      ) : (
                        form.features_list.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col gap-1">
                                <button 
                                  disabled={idx === 0}
                                  onClick={() => {
                                    const list = [...(form.features_list || [])];
                                    [list[idx], list[idx - 1]] = [list[idx - 1], list[idx]];
                                    set({ features_list: list });
                                  }}
                                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:pointer-events-none"
                                >
                                  <ChevronUp size={12} />
                                </button>
                                <button 
                                  disabled={idx === (form.features_list?.length || 0) - 1}
                                  onClick={() => {
                                    const list = [...(form.features_list || [])];
                                    [list[idx], list[idx + 1]] = [list[idx + 1], list[idx]];
                                    set({ features_list: list });
                                  }}
                                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:pointer-events-none"
                                >
                                  <ChevronDown size={12} />
                                </button>
                              </div>
                              <span className="text-sm font-semibold text-slate-700">✓ {item}</span>
                            </div>
                            <button 
                              onClick={() => set({ features_list: form.features_list?.filter((_, i) => i !== idx) })}
                              className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-all text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── PAYMENTS TAB ────────────────────────────────────── */}
                {activeTab === 'payments' && (
                  <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    {/* GLOBAL CREDENTIALS */}
                    <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Settings size={16} className="text-slate-400" />
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">Global Razorpay Credentials</h4>
                        </div>
                        <button 
                          onClick={handleSaveGateway} 
                          disabled={savingGateway}
                          className="px-4 py-2 bg-[#27954D] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
                        >
                          {savingGateway ? "Saving..." : "Save Credentials"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Key ID</label>
                          <input 
                            type="text" 
                            placeholder="rzp_test_..."
                            value={gatewayConfig.key_id}
                            onChange={e => setGatewayConfig(p => ({ ...p, key_id: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono font-bold outline-none focus:border-[#27954D] transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Key Secret</label>
                          <input 
                            type="password" 
                            placeholder="Enter Key Secret"
                            value={gatewayConfig.key_secret}
                            onChange={e => setGatewayConfig(p => ({ ...p, key_secret: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono font-bold outline-none focus:border-[#27954D] transition-all"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium italic">
                        Note: These keys are used for automated plan creation and escrow payments.
                      </p>
                    </div>

                    <div className="h-px bg-slate-100" />

                    <div className="grid grid-cols-2 gap-8">
                      {(["monthly", "yearly"] as const).map(cycle => {
                        const rzpId = cycle === "monthly" ? form.razorpay_monthly_plan_id : form.razorpay_yearly_plan_id;
                        const isSyncing = syncing === cycle;
                        const price = cycle === "monthly" ? form.monthly_price : form.yearly_price;
                        const manualId = manualIds[cycle] || "";
                        const isNew = !editingId || editingId === 'new';

                        return (
                          <div key={cycle} className={cn("p-8 rounded-[40px] border-2 transition-all", rzpId ? "bg-green-50 border-green-100" : "bg-white border-slate-100 shadow-sm")}>
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                <h5 className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">{cycle} Cycle</h5>
                                <p className="text-xl font-black text-slate-900">₹{price.toLocaleString()}</p>
                              </div>
                              {rzpId ? (
                                <div className="flex items-center gap-2 text-[#27954D] bg-white px-3 py-1 rounded-full border border-green-100 text-[10px] font-black uppercase tracking-wider shadow-sm">
                                  <CheckCircle size={14} /> Connected
                                </div>
                              ) : (
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-slate-300 shadow-sm" /> Disconnected
                                </div>
                              )}
                            </div>

                            {rzpId && (
                              <div className="bg-white p-4 rounded-2xl border border-green-100 shadow-sm mb-6 flex items-center justify-between group">
                                <div className="truncate pr-4">
                                  <span className="text-[8px] font-black text-slate-300 uppercase block mb-0.5">Razorpay Plan ID</span>
                                  <span className="text-[11px] font-mono font-bold text-slate-600">{rzpId}</span>
                                </div>
                                <div className="flex gap-2">
                                  <a href={`https://dashboard.razorpay.com/app/subscriptions/plans/${rzpId}`} target="_blank" rel="noreferrer" 
                                    className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                                    <ExternalLink size={14} />
                                  </a>
                                  {!isNew && (
                                    <button onClick={() => handleDisconnect(cycle)} 
                                      className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                      <Unplug size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="space-y-4">
                              <button
                                onClick={() => handleSync(cycle)}
                                disabled={isSyncing || !!rzpId || price <= 0 || isNew}
                                className={cn(
                                  "w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-95",
                                  rzpId ? "bg-white text-[#27954D] cursor-default border border-green-200" :
                                  (price <= 0 || isNew) ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none" :
                                  "bg-slate-900 text-white hover:bg-[#27954D]"
                                )}
                              >
                                {isSyncing ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" />}
                                {rzpId ? "Auto-Sync Complete" : isNew ? "Save Package to Sync" : isSyncing ? "Connecting..." : "Sync to Razorpay"}
                              </button>

                              {!rzpId && (
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="Manual Plan ID"
                                    value={manualId || (isNew ? (cycle === "monthly" ? form.razorpay_monthly_plan_id : form.razorpay_yearly_plan_id) : "")}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (isNew) {
                                        set({ [cycle === "monthly" ? "razorpay_monthly_plan_id" : "razorpay_yearly_plan_id"]: val });
                                      } else {
                                        setManualIds(p => ({ ...p, [cycle]: val }));
                                      }
                                    }}
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#27954D] transition-all shadow-sm"
                                  />
                                  {!isNew && (
                                    <button
                                      onClick={() => handleSync(cycle, manualId)}
                                      disabled={!manualId || isSyncing}
                                      className="px-5 py-3 bg-slate-100 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-200 disabled:opacity-50"
                                    >
                                      Link
                                    </button>
                                  )}
                                </div>
                              )}

                              {rzpId && !isNew && (
                                <button
                                  onClick={() => handleSync(cycle)}
                                  className="w-full py-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100 hover:border-slate-300"
                                >
                                  Force Re-sync
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* SAVE ROW */}
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm">
                <Save size={16} /> {saving ? "Saving..." : editingId !== 'new' ? "Update Package" : "Save Package"}
              </button>
              <button onClick={() => { setEditingId(null); setForm(DEFAULT); }}
                className="px-8 bg-slate-100 text-slate-500 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── PACKAGE LIST ──────────────────────────────────────────────── */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {loading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Package size={32} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No packages yet.</p>
                <p className="text-sm">Click "New Package" to create your first plan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.map(pkg => (
                  <div key={pkg.id} onClick={() => { setForm({ ...DEFAULT, ...pkg } as SubscriptionPlan); setEditingId(pkg.id!); setActiveTab('general'); }}
                    className="group bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-300 transition-all cursor-pointer flex justify-between items-center shadow-sm hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                        style={{ backgroundColor: (pkg.accent_color || '#27954D') + '18' }}>
                        <Layout size={18} style={{ color: pkg.accent_color || '#27954D' }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{pkg.name}</h4>
                          {pkg.badge_text && <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{pkg.badge_text}</span>}
                          {pkg.is_featured && <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-50 text-green-600">Featured</span>}
                          {pkg.hidden_plan && <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Hidden</span>}
                        </div>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                          {pkg.currency} {pkg.monthly_price}/mo · {pkg.max_contacts} contacts · {pkg.max_users} agent{pkg.max_users !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(pkg.id!, pkg.name); }} 
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Package"
                      >
                        <Trash size={16} />
                      </button>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-700 group-hover:translate-x-1 transition-all ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// micro-icon fix for empty state
function Package({ size, className }: { size: number; className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16.5 9.4 7.5 4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>;
}
