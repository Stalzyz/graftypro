"use client";
import React, { useState, useEffect } from 'react';
import { 
  BadgeCheck, 
  ShieldCheck, 
  AlertCircle, 
  FileText, 
  Globe, 
  Scale,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download
} from 'lucide-react';
import { ToolLeadCapture } from './ToolLeadCapture';

type Step = {
  id: string;
  question: string;
  options: { label: string; score: number }[];
};

const STEPS: Step[] = [
  {
    id: 'fb_verif',
    question: "Is your Meta (Facebook) Business Manager verified?",
    options: [
      { label: "Yes, fully verified", score: 40 },
      { label: "Verification in progress", score: 10 },
      { label: "No / Not sure", score: 0 },
    ]
  },
  {
    id: 'notability',
    question: "Do you have 3+ organic news articles features (not PR) in the last 12 months?",
    options: [
      { label: "Yes, we are a known brand", score: 40 },
      { label: "1 or 2 small mentions", score: 15 },
      { label: "None so far", score: 0 },
    ]
  },
  {
    id: 'tier',
    question: "What is your current WhatsApp Messaging Tier?",
    options: [
      { label: "Tier 2 or above (10k+ msgs/day)", score: 20 },
      { label: "Tier 1 (1k msgs/day)", score: 5 },
      { label: "Just starting out / Trial", score: 0 },
    ]
  }
];

export default function GreenTickChecker() {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [phone, setPhone] = useState('');
  const [complete, setComplete] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);

  useEffect(() => {
    if (phone.length >= 10 && !complete) {
        const timer = setTimeout(() => {
            fetch('/api/tools/lead-capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: phone.replace(/\D/g, ''),
                    tool: 'GREEN_TICK_CHECKER',
                    metadata: { currentStep, score }
                })
            }).catch(() => {});
        }, 2000);
        return () => clearTimeout(timer);
    }
  }, [phone, currentStep, score, complete]);

  useEffect(() => {
    if (complete) {
        fetch('/api/meta/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventName: 'Lead',
                customData: {
                    content_name: 'WhatsApp Green Tick Eligibility Checker',
                    content_category: 'Utility Tools',
                    value: score,
                    currency: 'SCORE'
                }
            })
        }).catch(() => {});
    }
  }, [complete]);

  const handleSelect = (s: number) => {
    const newScore = score + s;
    if (currentStep < STEPS.length - 1) {
      setScore(newScore);
      setCurrentStep(prev => prev + 1);
    } else {
      setScore(newScore);
      setComplete(true);
    }
  };

  const reset = () => {
    setScore(0);
    setCurrentStep(0);
    setComplete(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="g-card p-10 lg:p-16 border-none shadow-2xl shadow-green-900/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-slate-50 font-black text-8xl italic uppercase tracking-tighter -z-10 select-none">BADGE</div>
        
        {!complete ? (
          <div className="space-y-12 relative z-10 animate-fade-in">
             <div className="flex justify-between items-end">
               <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mb-2">Requirement Protocol</p>
                 <h3 className="text-2xl font-black tracking-tighter italic">Step {currentStep + 1} of {STEPS.length}</h3>
               </div>
               <span className="text-xs font-bold text-slate-300">Phase: Verification Check</span>
             </div>

              <div className="space-y-8">
                {!phone || phone.length < 10 ? (
                  <div className="space-y-6 animate-in slide-in-from-top-10">
                    <h2 className="text-2xl font-black text-slate-800 leading-tight">
                      To start your brand authority audit, please enter your WhatsApp number.
                    </h2>
                    <div className="relative">
                       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                       </div>
                       <input 
                         type="tel"
                         value={phone}
                         onChange={(e) => setPhone(e.target.value)}
                         placeholder="e.g. 919876543210"
                         className="w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-bold focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-slate-300"
                       />
                    </div>
                    <p className="text-xs text-slate-400 font-medium italic">
                      We'll save your audit progress to this number. No spam, just professional analysis.
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-black text-slate-800 leading-tight border-l-4 border-emerald-500 pl-6">
                      {STEPS[currentStep].question}
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {STEPS[currentStep].options.map((opt, i) => (
                        <button 
                          key={i}
                          onClick={() => handleSelect(opt.score)}
                          className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl text-left hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group"
                        >
                          <span className="font-bold text-slate-700 group-hover:text-emerald-900 transition-colors">{opt.label}</span>
                          <ArrowRight size={18} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-2 transition-all" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {phone && phone.length >= 10 && (
                <div className="flex gap-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                   {STEPS.map((_, i) => (
                     <div key={i} className={`flex-1 transition-all duration-500 ${i <= currentStep ? 'bg-emerald-500' : ''}`} />
                   ))}
                </div>
              )}
          </div>
        ) : (
          <div className="text-center space-y-10 animate-up">
            <div className="flex justify-center">
              {score >= 80 ? (
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-pulse shadow-xl shadow-emerald-100">
                  <BadgeCheck size={48} />
                </div>
              ) : score >= 40 ? (
                <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                  <ShieldCheck size={48} />
                </div>
              ) : (
                <div className="w-24 h-24 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                  <AlertCircle size={48} />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tighter">Your Eligibility: {score}%</h2>
              <p className="g-p max-w-lg mx-auto">
                {score >= 80 
                  ? "Outstanding. Your brand has high authority. You are an ideal candidate for the WhatsApp Verified Badge." 
                  : score >= 40 
                    ? "Moderate chance. We recommend focusing on Press mentions and higher messaging tiers before applying."
                    : "Low probability. You need to verify your FB Business Manager and build brand notable first."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-8">
              <button 
                onClick={() => {
                  if (!leadCaptured) setShowLeadCapture(true);
                }} 
                className={`g-btn-outline py-4 px-8 flex items-center justify-center gap-2 ${leadCaptured ? 'opacity-50 cursor-default' : ''}`}
              >
                <Download size={18} /> {leadCaptured ? 'Report Requested' : 'Get PDF Audit'}
              </button>
              <a href="/join" className="g-btn-primary py-4 px-8 group">
                Apply via Grafty <ArrowRight size={18} className="ml-2 group-hover:ml-4 transition-all" />
              </a>
            </div>

            {showLeadCapture && !leadCaptured && (
                <div className="mt-10 max-w-xl mx-auto text-left">
                    <ToolLeadCapture 
                        toolName="Green Tick Checker"
                        title="Get Your Green Tick Strategy Audit"
                        description="Based on your 11% eligibility, we've prepared a corrective action plan to help you get verified in 30 days."
                        onSuccess={() => {
                            setLeadCaptured(true);
                            setShowLeadCapture(false);
                        }}
                    />
                </div>
            )}

            <div className="pt-10 border-t border-slate-100">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                 Disclaimer: The final decision on the Green Tick rests solely with Meta. Grafty only facilitates the expert application process.
               </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
         <EduCard icon={<Globe size={20}/>} title="Notability" text="Meta checks if your business is searched often in news or journals." />
         <EduCard icon={<Scale size={20}/>} title="Compliance" text="Your display name must match your legal brand records exactly." />
         <EduCard icon={<CheckCircle2 size={20}/>} title="Verification" text="2FA and Facebook Business Manager verification is mandatory." />
      </div>
    </div>
  );
}

function EduCard({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) {
  return (
    <div className="g-card p-8 border-none shadow-lg">
      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">{icon}</div>
      <h4 className="font-black uppercase tracking-tight mb-3 text-slate-900">{title}</h4>
      <p className="text-xs text-slate-500 font-medium leading-relaxed">{text}</p>
    </div>
  );
}
