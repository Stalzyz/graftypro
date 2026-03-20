"use client";
import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Copy, 
  Check, 
  ArrowRight, 
  Users, 
  TrendingUp, 
  AlertCircle,
  MessageCircle,
  Coins
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReferralsPage() {
    const [referralData, setReferralData] = useState<{
        code: string;
        stats: {
            total_referrals: number;
            confirmed_referrals: number;
            bonus_balance: number;
        }
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        const fetchReferralData = async () => {
            try {
                const res = await fetch('/api/dashboard/referrals');
                const data = await res.json();
                setReferralData(data);
            } catch (err) {
                console.error("Failed to fetch referral data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReferralData();
    }, []);

    const copyLink = () => {
        if (!referralData) return;
        const link = `${window.location.protocol}//${window.location.host}/register?referral=${referralData.code}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success("Referral link copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="animate-pulse space-y-8">
        <div className="h-48 bg-slate-100 rounded-[2.5rem]"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-slate-100 rounded-[2.5rem]"></div>
            <div className="h-32 bg-slate-100 rounded-[2.5rem]"></div>
            <div className="h-32 bg-slate-100 rounded-[2.5rem]"></div>
        </div>
    </div>;

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Hero Header */}
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Gift size={200} />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-3 text-emerald-400 font-black uppercase tracking-[0.3em] text-[10px] mb-6">
                        <Gift size={16} /> Viral Growth Engine
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter mb-6 leading-none">
                        Invite a Business, <br />
                        <span className="text-emerald-400">Both Get 500 Credits.</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-lg mb-10 leading-relaxed">
                        Scale your impact. When a business joins Grafty using your link and connects their first WhatsApp number, we'll fuel **both** accounts with 500 Service Credits.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1 flex items-center justify-between border border-white/5">
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest pl-2">Your Code:</span>
                            <span className="text-emerald-400 font-black tracking-tighter text-xl px-4">{referralData?.code}</span>
                        </div>
                        <button 
                            onClick={copyLink}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? "Copied" : "Copy Link"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard 
                    label="Total Invited" 
                    value={referralData?.stats.total_referrals || 0} 
                    icon={<Users className="text-blue-500" />} 
                />
                <StatCard 
                    label="WABA Connected" 
                    value={referralData?.stats.confirmed_referrals || 0} 
                    icon={<TrendingUp className="text-emerald-500" />} 
                />
                <StatCard 
                    label="Bonus Credits" 
                    value={`${referralData?.stats.bonus_balance || 0} CR`} 
                    icon={<Coins className="text-amber-500" />} 
                />
            </div>

            {/* Terms & Consent */}
            <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                        <AlertCircle size={28} />
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-2xl font-black italic tracking-tighter mb-2">The Golden Rule.</h3>
                            <p className="text-slate-500 font-medium">To protect the ecosystem, referral credits carry specific usage conditions. Please review and agree before inviting others.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight">What counts as a "Referral"?</h4>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                    The invited business must complete verification and connect an official WhatsApp Phone Number (WABA) for the first time.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight">Where can I use these credits?</h4>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                    <span className="text-emerald-600 font-bold">Service Conversations Only.</span> These credits fuel your customer support auto-replies. They cannot be used for Marketing or Utility templates.
                                </p>
                            </div>
                        </div>

                        <label className="flex items-center gap-4 cursor-pointer group pt-6">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    checked={agreed} 
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${agreed ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-200 group-hover:border-slate-300'}`}>
                                    {agreed && <Check size={14} className="text-white" />}
                                </div>
                            </div>
                            <span className="text-sm font-bold text-slate-700 tracking-tight"> I understand that Referral Credits are for Service Conversations only and agree to the <a href="/terms-and-conditions" className="text-blue-500 hover:underline">Referral Terms</a>.</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Step Guide */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StepItem num="01" text="Share your unique link with a business owner." />
                <StepItem num="02" text="They sign up and start their 7-day free trial." />
                <StepItem num="03" text="They connect their first phone number via Meta." />
                <StepItem num="04" text="Both of you instantly get 500 Credits in your Service Wallets." />
            </div>
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between group hover:border-slate-200 transition-all">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                <p className="text-4xl font-black italic tracking-tighter text-slate-900">{value}</p>
            </div>
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                {icon}
            </div>
        </div>
    );
}

function StepItem({ num, text }: { num: string, text: string }) {
    return (
        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-4">
            <span className="text-3xl font-black italic tracking-tighter text-slate-200 leading-none">{num}</span>
            <p className="text-xs font-bold text-slate-600 leading-relaxed">{text}</p>
        </div>
    );
}
