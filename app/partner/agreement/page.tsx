
"use client";

import React, { useState, useEffect } from 'react';
import { 
    Shield, FileCheck, Upload, CheckCircle2, ChevronRight, 
    Info, CreditCard, Lock, User, Briefcase, FileText,
    ArrowRight, AlertCircle, Search, RefreshCw
} from 'lucide-react';
import { Logo } from "@/components/ui/Logo";

export default function PlatformAgreementPage() {
    const [step, setStep] = useState(1);
    const [scrolledToBottom, setScrolledToBottom] = useState(false);
    const [reseller, setReseller] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [signing, setSigning] = useState(false);
    
    // Form States
    const [kycType, setKycType] = useState('PERSONAL');
    const [kycDocs, setKycDocs] = useState({
        pan_url: '',
        aadhar_url: '',
        business_reg_url: '',
        signing_name: '',
        is_uploading: false
    });
    const [verifyingStatus, setVerifyingStatus] = useState<string | null>(null);

    useEffect(() => {
        const fetchReseller = async () => {
            try {
                const res = await fetch("/api/reseller/me");
                const data = await res.json();
                if (data.data) {
                    setReseller(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch reseller", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReseller();
    }, []);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            setScrolledToBottom(true);
        }
    };

    const runMockVerification = async () => {
        setVerifyingStatus("Booting AI Vision Engine...");
        
        try {
            // Check PAN
            setVerifyingStatus("Analyzing PAN Card Authenticity...");
            const panRes = await fetch("/api/reseller/kyc/ai-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileUrl: kycDocs.pan_url, type: 'PAN' })
            });
            const panData = await panRes.json();
            if (!panData.success) throw new Error(`PAN Error: ${panData.reason}`);

            // Check Aadhar
            setVerifyingStatus("Scrutinizing Aadhar/National ID...");
            const aadharRes = await fetch("/api/reseller/kyc/ai-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileUrl: kycDocs.aadhar_url, type: 'AADHAR' })
            });
            const aadharData = await aadharRes.json();
            if (!aadharData.success) throw new Error(`ID Error: ${aadharData.reason}`);

            setVerifyingStatus("Matching biometric signatures with OCR data...");
            await new Promise(r => setTimeout(r, 1500));
            
            setStep(3);
            setVerifyingStatus(null);
        } catch (err: any) {
            setVerifyingStatus(null);
            alert(err.message || "AI Verification Failed. Please upload clear document images.");
        }
    };

    const handleFinalSubmit = async () => {
        setSigning(true);
        try {
            const res = await fetch("/api/reseller/agreement", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    kyc_type: kycType,
                    signature: kycDocs.signing_name,
                    agreement_version: "v4.2.0-PLATFORM-ENTERPRISE",
                    documents: [kycDocs.pan_url, kycDocs.aadhar_url, kycDocs.business_reg_url].filter(Boolean)
                })
            });
            
            const data = await res.json();
            if (data.success) {
                // Wait briefly for the UI to show provisioning
                await new Promise(r => setTimeout(r, 2000));
                window.location.href = "/partner/dashboard";
            } else {
                throw new Error(data.error || "Submission failed");
            }
        } catch (err: any) {
            alert(err.message);
            setSigning(false);
        }
    };

    const uploadFile = async (file: File, key: string) => {
        setKycDocs(prev => ({ ...prev, is_uploading: true }));
        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("module", "kyc");
            const res = await fetch("/api/media/upload", { method: "POST", body: fd });
            const data = await res.json();
            if (data.url) {
                setKycDocs(prev => ({ ...prev, [key]: data.url, is_uploading: false }));
            } else {
                alert("Upload failed: " + (data.error || "Unknown error"));
                setKycDocs(prev => ({ ...prev, is_uploading: false }));
            }
        } catch (err) {
            alert("Network error during upload");
            setKycDocs(prev => ({ ...prev, is_uploading: false }));
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-slate-900 border-t-[#27954D] rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900 font-sans">
            {/* Minimal Header */}
            <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Logo size={24} brandName="GRAFTY" />
                    <div className="h-6 w-px bg-slate-100 mx-2" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Platform Onboarding Protocol</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-slate-300">Auth Signature Required</span>
                    <Shield size={18} className="text-[#27954D]" />
                </div>
            </header>

            <main className="max-w-4xl mx-auto py-16 px-6">
                
                {/* Stepper Header */}
                <div className="mb-12 flex items-center justify-between px-4">
                    <StepIndicator num={1} label="Agreement & Pricing" active={step === 1} completed={step > 1} />
                    <div className="h-px flex-1 bg-slate-200 mx-4 mt-[-20px]" />
                    <StepIndicator num={2} label="KYC Integration" active={step === 2} completed={step > 2} />
                    <div className="h-px flex-1 bg-slate-200 mx-4 mt-[-20px]" />
                    <StepIndicator num={3} label="Digital Verification" active={step === 3} completed={step > 3} />
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-hidden">
                    
                    {/* STEP 1: AGREEMENT CONTENT */}
                    {step === 1 && (
                        <div className="p-10 lg:p-16">
                            <div className="mb-10 text-center">
                                <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase mb-4">Grafty Platform Partner Agreement</h1>
                                <p className="text-slate-500 font-medium">Please review the setup fees and operational protocols before signing.</p>
                            </div>

                            <div className="grid lg:grid-cols-3 gap-6 mb-12">
                                <PriceCard 
                                    title="License & Setup" 
                                    amount="₹24,999" 
                                    desc="Core White-label Engine Licensing & Backend Configuration." 
                                />
                                <PriceCard 
                                    title="Tunneling & SSL" 
                                    amount="₹15,000" 
                                    desc="Dedicated DNS Security Tunneling & Cloud Certifications." 
                                />
                                <PriceCard 
                                    title="Strategic Success" 
                                    amount="₹10,000" 
                                    desc="Direct Onboarding Strategy & Enterprise Support SLA." 
                                />
                            </div>

                            <div 
                                onScroll={handleScroll}
                                className="h-80 overflow-y-auto mb-10 p-8 bg-slate-50 rounded-2xl border border-slate-100 text-sm leading-relaxed text-slate-600 scrollbar-thin scrollbar-thumb-slate-200"
                            >
                                <AgreementContent />
                            </div>

                            <div className="flex flex-col items-center gap-6">
                                {!scrolledToBottom && (
                                    <p className="text-xs text-rose-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                        <AlertCircle size={14} /> Please scroll to the bottom to acknowledge
                                    </p>
                                )}
                                <button
                                    disabled={!scrolledToBottom}
                                    onClick={() => setStep(2)}
                                    className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.2em] transition-all
                                        ${scrolledToBottom 
                                            ? 'bg-slate-900 text-white hover:bg-black shadow-xl active:scale-95' 
                                            : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                                >
                                    Proceed to KYC Upload
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: KYC UPLOAD */}
                    {step === 2 && (
                        <div className="p-10 lg:p-16">
                            <div className="mb-10">
                                <h2 className="text-3xl font-black text-slate-900 italic tracking-tight uppercase mb-2">Compliance Architecture</h2>
                                <p className="text-slate-500">Enable AML/KYC verification for your enterprise node.</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 mb-10">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Entity Archetype</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button 
                                                onClick={() => setKycType('PERSONAL')}
                                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${kycType === 'PERSONAL' ? 'border-[#27954D] bg-emerald-50/50 text-[#27954D]' : 'border-slate-100 text-slate-400'}`}
                                            >
                                                <User size={20} />
                                                <span className="text-[10px] font-black uppercase">Personal ID</span>
                                            </button>
                                            <button 
                                                onClick={() => setKycType('BUSINESS')}
                                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${kycType === 'BUSINESS' ? 'border-[#27954D] bg-emerald-50/50 text-[#27954D]' : 'border-slate-100 text-slate-400'}`}
                                            >
                                                <Briefcase size={20} />
                                                <span className="text-[10px] font-black uppercase">Business Entity</span>
                                            </button>
                                        </div>
                                    </div>

                                    <DocUpload 
                                        label="PAN Card Verification" 
                                        sub="Front view required for tax residency" 
                                        onFile={(f) => uploadFile(f, 'pan_url')} 
                                        isSet={!!kycDocs.pan_url} 
                                        isLoading={kycDocs.is_uploading}
                                    />
                                    <DocUpload 
                                        label="Aadhar / National ID" 
                                        sub="Address & identity verification pulse" 
                                        onFile={(f) => uploadFile(f, 'aadhar_url')} 
                                        isSet={!!kycDocs.aadhar_url} 
                                        isLoading={kycDocs.is_uploading}
                                    />
                                    {kycType === 'BUSINESS' && (
                                        <DocUpload 
                                            label="GST / Business Reg" 
                                            sub="Corporate authorization certificate" 
                                            onFile={(f) => uploadFile(f, 'business_reg_url')} 
                                            isSet={!!kycDocs.business_reg_url} 
                                            isLoading={kycDocs.is_uploading}
                                        />
                                    )}
                                </div>

                                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-sm">
                                            <Search size={18} />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">Verification Engine</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <StatusLine label="Document Integrity Check" active={!!kycDocs.pan_url} />
                                        <StatusLine label="Biometric Sync Ready" active={!!kycDocs.aadhar_url} />
                                        <StatusLine label="Entity Legitimacy Score" active={kycType === 'PERSONAL' || !!kycDocs.business_reg_url} />
                                    </div>

                                    {verifyingStatus && (
                                        <div className="mt-8 p-4 bg-white rounded-xl border border-emerald-100 flex items-center gap-3 animate-pulse">
                                            <RefreshCw size={16} className="text-[#27954D] animate-spin" />
                                            <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">{verifyingStatus}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setStep(1)} className="px-8 py-5 border border-slate-200 text-slate-400 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-50">Back</button>
                                <button
                                    disabled={!kycDocs.pan_url || !kycDocs.aadhar_url || (kycType === 'BUSINESS' && !kycDocs.business_reg_url) || !!verifyingStatus}
                                    onClick={runMockVerification}
                                    className={`flex-1 py-5 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.2em] transition-all
                                        ${(!kycDocs.pan_url || !kycDocs.aadhar_url) ? 'bg-slate-100 text-slate-300' : 'bg-slate-900 text-white hover:bg-black shadow-xl animate-in fade-in zoom-in'}`}
                                >
                                    Initiate AI Verification
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: DIGITAL SIGNATURE */}
                    {step === 3 && (
                        <div className="p-10 lg:p-16 text-center">
                            <div className="mb-12">
                                <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#27954D] mx-auto mb-6 scale-in-center">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 italic tracking-tight uppercase mb-2">Authenticated Identity Verified</h2>
                                <p className="text-slate-500">Final certification of the Platform Partner Node.</p>
                            </div>

                            <div className="max-w-md mx-auto space-y-8">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Apply Digital Signature</label>
                                    <input 
                                        type="text" 
                                        placeholder="TYPE FULL LEGAL NAME"
                                        className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-medium text-center focus:border-[#27954D] focus:bg-white outline-none transition-all placeholder:text-slate-200 placeholder:italic"
                                        value={kycDocs.signing_name}
                                        onChange={(e) => setKycDocs({...kycDocs, signing_name: e.target.value})}
                                    />
                                    <p className="mt-4 text-[10px] text-slate-400 font-medium uppercase tracking-[0.05em]">
                                        By typing your name above, you acknowledge this as a legally binding digital signature under the Information Technology Act.
                                    </p>
                                </div>

                                <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl flex items-start gap-4 text-left">
                                    <Lock size={20} className="text-[#27954D] mt-1 shrink-0" />
                                    <div>
                                        <p className="text-xs font-black text-[#27954D] uppercase tracking-wide mb-1">Encrypted Certification</p>
                                        <p className="text-[10px] text-emerald-700 leading-normal">
                                            Signature Timestamp: {new Date().toLocaleString()} <br />
                                            Cert ID: HW-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    disabled={kycDocs.signing_name.length < 3 || signing}
                                    onClick={handleFinalSubmit}
                                    className={`w-full py-6 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.25em] transition-all
                                        ${kycDocs.signing_name.length < 3 ? 'bg-slate-100 text-slate-300' : 'bg-[#27954D] text-white hover:bg-emerald-700 shadow-2xl shadow-emerald-200'}`}
                                >
                                    {signing ? (
                                        <><RefreshCw size={18} className="animate-spin" /> Provisioning Node...</>
                                    ) : (
                                        'Finalize Onboarding'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-12 flex justify-center gap-8 opacity-40 grayscale">
                    <img src="/stripe.svg" className="h-4" alt="PCI Compliant" />
                    <img src="/iso.svg" className="h-5" alt="ISO Certified" />
                    <img src="/security.svg" className="h-6" alt="AES 256" />
                </div>
            </main>
        </div>
    );
}

function StepIndicator({ num, label, active, completed }: { num: number, label: string, active: boolean, completed: boolean }) {
    return (
        <div className="flex flex-col items-center gap-3 relative z-10">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all duration-500
                ${completed ? 'bg-[#27954D] text-white' : active ? 'bg-slate-900 text-white scale-110 shadow-lg' : 'bg-white border border-slate-200 text-slate-300'}`}>
                {completed ? <CheckCircle2 size={20} /> : num}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'text-slate-900' : 'text-slate-300'}`}>{label}</span>
        </div>
    );
}

function PriceCard({ title, amount, desc }: { title: string, amount: string, desc: string }) {
    return (
        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-white hover:border-[#27954D]/20 transition-all hover:shadow-xl hover:shadow-slate-200/50">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{title}</h3>
            <div className="text-2xl font-black text-slate-900 mb-3 italic tracking-tight">{amount}</div>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{desc}</p>
        </div>
    );
}

function DocUpload({ label, sub, onFile, isSet, isLoading }: { label: string, sub: string, onFile: (f: File) => void, isSet: boolean, isLoading?: boolean }) {
    return (
        <div className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer relative overflow-hidden group
            ${isSet ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 hover:border-slate-300'}`}>
            <input 
                type="file" 
                disabled={isLoading}
                className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all 
                    ${isSet ? 'bg-[#27954D] text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                    {isLoading ? <RefreshCw className="animate-spin" size={20} /> : (isSet ? <FileCheck size={20} /> : <Upload size={20} />)}
                </div>
                <div>
                    <h4 className={`text-[11px] font-black uppercase tracking-wide mb-0.5 ${isSet ? 'text-[#27954D]' : 'text-slate-900'}`}>{label}</h4>
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">
                        {isLoading ? 'Transmitting...' : (isSet ? 'Document Captured Successfully' : sub)}
                    </p>
                </div>
            </div>
        </div>
    );
}

function StatusLine({ label, active }: { label: string, active: boolean }) {
    return (
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
            <span className={active ? 'text-slate-600' : 'text-slate-300'}>{label}</span>
            <div className={`w-2 h-2 rounded-full ${active ? 'bg-[#27954D]' : 'bg-slate-200'}`} />
        </div>
    );
}

function AgreementContent() {
    return (
        <div className="space-y-6">
            <section>
                <h3 className="font-black text-slate-900 uppercase mb-2">1. PLATFORM SCOPE & LICENSE</h3>
                <p>Grafty Grant provides the Platform Partner a non-exclusive, non-transferable license to utilize the White-label Interactive Commerce Engine. This includes the deployment of sub-vendor dashboards, automated billing pipelines, and custom DNS tunneling protocols.</p>
            </section>
            <section>
                <h3 className="font-black text-slate-900 uppercase mb-2">2. MASTER ESCROW SYSTEM (W2R LOGIC)</h3>
                <p>Operations are governed by the **Wholesale-to-Retail (W2R) Escrow Protocol**. As a Platform Partner, you maintain a Master Wallet balance. </p>
                <div className="my-4 p-4 bg-white rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 italic mb-2">Operational Example:</p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-500 font-medium">
                        <li>Sub-vendor purchases ₹1,000 Credits (Retail)</li>
                        <li>Wholesale Cost is calculated at ₹750 (Tier Adjusted)</li>
                        <li>₹750 is automatically deducted from Partner Master Escrow</li>
                        <li>₹250 remains as the Instant Liquidity Margin for the Partner</li>
                    </ul>
                </div>
                <p>Credits will not be provisioned to sub-vendors if the Master Escrow balance is insufficient to cover the Wholesale Cost.</p>
            </section>
            <section>
                <h3 className="font-black text-slate-900 uppercase mb-2">3. RECHARGE PROTOCOL</h3>
                <p>Partners must maintain a minimum threshold balance of ₹5,000 to ensure uninterrupted sub-vendor service. Automatic recharge triggers can be configured via the Billing Settings.</p>
            </section>
            <section>
                <h3 className="font-black text-slate-900 uppercase mb-2">4. COMPLIANCE & KYC</h3>
                <p>Platform Partners are responsible for the first-level compliance of their sub-vendors. Grafty reserves the right to suspend any Partner Node found facilitating prohibited content or non-compliant WhatsApp practices as per Meta’s latest Commerce Policy.</p>
            </section>
            <section>
                <h3 className="font-black text-slate-900 uppercase mb-2">5. TERMINATION & RECOVERY</h3>
                <p>Upon termination, the White-label custom domain will be de-provisioned within 48 hours. Master Escrow balances are refundable post-audit of pending sub-vendor usage.</p>
            </section>
        </div>
    );
}
