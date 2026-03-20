"use client";
import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Globe, 
  TrendingUp, 
  MessageSquare, 
  ShieldCheck, 
  Info,
  ArrowRight,
  TrendingDown,
  DollarSign,
  Download
} from 'lucide-react';
import { ToolLeadCapture } from './ToolLeadCapture';

const PRICING_DATA: Record<string, { marketing: number, utility: number, service: number, auth: number }> = {
  "India": { marketing: 0.72, utility: 0.30, service: 0.29, auth: 0.10 },
  "Brazil": { marketing: 0.45, utility: 0.25, service: 0.20, auth: 0.15 },
  "United Kingdom": { marketing: 0.05, utility: 0.03, service: 0.03, auth: 0.02 },
  "USA / Canada": { marketing: 0.015, utility: 0.01, service: 0.01, auth: 0.005 },
  "UAE": { marketing: 0.15, utility: 0.08, service: 0.07, auth: 0.05 },
};

export default function CostCalculator() {
  const [region, setRegion] = useState("India");
  const [phone, setPhone] = useState('');
  const [volumes, setVolumes] = useState({
    marketing: 1000,
    utility: 500,
    service: 500,
    auth: 100
  });

  const [isCalculated, setIsCalculated] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);

  useEffect(() => {
    if (phone.length >= 10) {
        const timer = setTimeout(() => {
            fetch('/api/tools/lead-capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: phone.replace(/\D/g, ''),
                    tool: 'COST_CALCULATOR',
                    metadata: { region, volumes }
                })
            }).catch(() => {});
        }, 2000);
        return () => clearTimeout(timer);
    }
  }, [phone, region, volumes]);

  useEffect(() => {
    if (hasInteracted) {
        fetch('/api/meta/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventName: 'Lead',
                customData: {
                    content_name: 'WhatsApp Cost Calculator',
                    content_category: 'Utility Tools'
                }
            })
        }).catch(() => {});
    }
  }, [hasInteracted]);

  const currentRates = PRICING_DATA[region] || PRICING_DATA["India"];
  
  const costs = {
    marketing: volumes.marketing * currentRates.marketing,
    utility: volumes.utility * currentRates.utility,
    service: Math.max(0, (volumes.service - 1000)) * currentRates.service, // 1000 free service convos
    auth: volumes.auth * currentRates.auth,
  };

  const totalCost = Object.values(costs).reduce((a, b) => a + b, 0);

  const handleVolumeChange = (type: keyof typeof volumes, value: string) => {
    const num = parseInt(value) || 0;
    setVolumes(prev => ({ ...prev, [type]: num }));
    setHasInteracted(true);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Settings */}
        <div className="lg:col-span-2 g-card p-10 border-none shadow-2xl shadow-green-900/5 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-black tracking-tight mb-1">Configuration</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Select your region & message mix</p>
            </div>
            <div className="relative group">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
              <select 
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setHasInteracted(true);
                }}
                className="pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold appearance-none focus:ring-4 focus:ring-emerald-50 outline-none cursor-pointer min-w-[150px]"
              >
                {Object.keys(PRICING_DATA).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="relative group flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <input 
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="WhatsApp Number (e.g. 91...)"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <VolumeInput 
              label="Marketing" 
              desc="Promotional offers & upsells"
              value={volumes.marketing}
              onChange={(v) => handleVolumeChange('marketing', v)}
              color="text-amber-500"
            />
            <VolumeInput 
              label="Utility" 
              desc="Order updates & notifications"
              value={volumes.utility}
              onChange={(v) => handleVolumeChange('utility', v)}
              color="text-blue-500"
            />
            <VolumeInput 
              label="Service" 
              desc="Customer-initiated support"
              value={volumes.service}
              onChange={(v) => handleVolumeChange('service', v)}
              color="text-emerald-500"
              info="First 1,000 are free monthly"
            />
            <VolumeInput 
              label="Authentication" 
              desc="OTPs & Login verifications"
              value={volumes.auth}
              onChange={(v) => handleVolumeChange('auth', v)}
              color="text-slate-500"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6 sticky top-32">
          <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 text-white/5 font-black text-3xl italic uppercase tracking-tighter">ESTIMATE</div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-8">Monthly Meta Fees</p>
            
            <div className="space-y-6 mb-12">
              <div className="flex justify-between items-end">
                <span className="text-6xl font-black tracking-tighter leading-none">
                  {region === "USA / Canada" || region === "United Kingdom" ? "$" : "₹"}
                  {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2">/mo</span>
              </div>
              <p className="text-slate-400 text-sm font-medium">Estimated cost based on current Meta Conversation pricing for {region}.</p>
            </div>

            <div className="space-y-4 pt-8 border-t border-white/10">
              <CostRow label="Marketing" cost={costs.marketing} symbol={region === "USA / Canada" || region === "United Kingdom" ? "$" : "₹"} />
              <CostRow label="Utility" cost={costs.utility} symbol={region === "USA / Canada" || region === "United Kingdom" ? "$" : "₹"} />
              <CostRow label="Service" cost={costs.service} symbol={region === "USA / Canada" || region === "United Kingdom" ? "$" : "₹"} />
              <CostRow label="Auth" cost={costs.auth} symbol={region === "USA / Canada" || region === "United Kingdom" ? "$" : "₹"} />
            </div>
          </div>

          <div className="g-card border-none shadow-xl p-8 bg-emerald-50/50">
             <div className="flex gap-4 items-start">
               <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                 <TrendingDown size={20} />
               </div>
               <div>
                 <h4 className="text-sm font-black uppercase tracking-tight mb-2 text-emerald-900">Efficiency Tip</h4>
                 <p className="text-xs text-emerald-800/70 font-medium leading-relaxed">
                   Conversations are 24-hour windows. By grouping notifications using Grafty's <strong>Flow Batching</strong>, you can reduce costs by up to 30%.
                 </p>
               </div>
             </div>
          </div>

          {!leadCaptured && (
            <div className="animate-up">
              {showLeadCapture ? (
                <ToolLeadCapture 
                  toolName="Cost Calculator" 
                  onSuccess={() => {
                    setLeadCaptured(true);
                    setShowLeadCapture(false);
                  }} 
                />
              ) : (
                <button 
                  onClick={() => setShowLeadCapture(true)}
                  className="w-full bg-slate-900 text-white rounded-[2rem] p-8 text-center hover:scale-[1.02] transition-all shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 text-white/5 font-black text-xl italic uppercase tracking-tighter group-hover:scale-110 transition-transform">PDF REPORT</div>
                  <div className="flex flex-col items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Download size={20} />
                    </div>
                    <div>
                      <h4 className="font-black uppercase tracking-tight text-white">Get Detailed Cost Audit</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Free PDF Audit via WhatsApp</p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          )}

          <a href="/pricing" className="g-btn-primary w-full group py-5">
             See Grafty Platform Pricing <ArrowRight size={18} className="ml-2 group-hover:ml-4 transition-all" />
          </a>
        </div>
      </div>
    </div>
  );
}

function VolumeInput({ label, desc, value, onChange, color, info }: { label: string, desc: string, value: number, onChange: (v: string) => void, color: string, info?: string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className={`text-xs font-black uppercase tracking-widest ${color}`}>{label}</label>
        {info && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight bg-slate-100 px-2 py-0.5 rounded-full">{info}</span>}
      </div>
      <div className="relative group">
        <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
        <input 
          type="number" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
        />
      </div>
      <p className="text-[10px] text-slate-400 font-medium px-2">{desc}</p>
    </div>
  );
}

function CostRow({ label, cost, symbol }: { label: string, cost: number, symbol: string }) {
  return (
    <div className="flex justify-between items-center group">
      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest group-hover:text-emerald-500 transition-colors">{label}</span>
      <span className="text-sm font-black tracking-tight">{symbol}{cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>
  );
}
