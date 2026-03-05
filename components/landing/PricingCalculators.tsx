
"use client";
import React, { useState } from 'react';
import { Calculator, Wallet, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PricingCalculators() {
    const [messages, setMessages] = useState(10000);
    const [rechargeAmount, setRechargeAmount] = useState(1000);

    // Mock calculation logic for Messaging Charges (INR based)
    // Avg charge in India is around ₹0.40 to ₹0.60 per conversation
    const avgChargePerMsg = 0.50;
    const totalMessagingCost = messages * avgChargePerMsg;

    // Platform Fee in INR (Converted from $49 roughly)
    const platformFee = 3999;
    const totalEstimated = platformFee + totalMessagingCost;

    // Recharge GST Logic
    const gstRate = 0.18;
    const gstAmount = rechargeAmount * gstRate;
    const finalRecharge = rechargeAmount + gstAmount;

    return (
        <section id="pricing" className="py-24 bg-slate-900 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-wa-green/5 blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 blur-[100px] -ml-48 -mb-48" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20 px-2 lg:px-0">
                    <div className="flex justify-center mb-6">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 flex items-center gap-2 text-emerald-400 font-bold text-xs">
                            <ShieldCheck size={16} /> Meta Verified Business Partner
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black mb-6">Transparent <span className="text-gradient">Indian Pricing</span></h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">No hidden fees. Scale your business in India with our local payment support and GST compliance.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                    {/* Messaging Estimator */}
                    <div className="glass-card p-10 flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-wa-green/10 rounded-2xl flex items-center justify-center">
                                <Calculator className="text-wa-green" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Monthly Estimator</h3>
                        </div>

                        <div className="space-y-10 flex-1">
                            <div className="space-y-4">
                                <div className="flex justify-between font-bold">
                                    <span className="text-slate-400">Monthly Conversations</span>
                                    <span className="text-white text-xl">{messages.toLocaleString()}</span>
                                </div>
                                <input
                                    type="range"
                                    min="1000"
                                    max="100000"
                                    step="1000"
                                    value={messages}
                                    onChange={(e) => setMessages(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-wa-green shadow-[0_0_15px_rgba(35,211,102,0.2)]"
                                />
                            </div>

                            <div className="space-y-5 bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Fixed Platform Fee</span>
                                    <span className="text-white font-black">₹{platformFee.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Est. WhatsApp Usage (direct to Meta)</span>
                                    <span className="text-white font-black">₹{totalMessagingCost.toLocaleString()}</span>
                                </div>
                                <div className="h-px bg-slate-800 my-2" />
                                <div className="flex justify-between text-2xl font-black">
                                    <span className="text-white">Total Est. Cost</span>
                                    <span className="text-wa-green">₹{totalEstimated.toLocaleString()}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium italic text-center uppercase tracking-wider">Note: Conversation charges may vary by category and country.</p>
                            </div>
                        </div>
                    </div>

                    {/* Wallet Recharge Rules */}
                    <div className="glass-card p-10 border-wa-green/20 flex flex-col h-full relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                                <Wallet className="text-wa-green" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Wallet Recharge</h3>
                        </div>
                        <p className="text-slate-400 mb-10 leading-relaxed">
                            Pay only for what you use. Top up your wallet to send bulk campaigns or handle customer chats.
                        </p>

                        <div className="flex-1 space-y-8">
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Recharge Amount</label>
                                        <div className="text-4xl font-black text-white">₹{rechargeAmount.toLocaleString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">+ 18% GST</div>
                                        <div className="text-lg font-bold text-slate-600">₹{gstAmount.toLocaleString()}</div>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="500"
                                    max="10000"
                                    step="500"
                                    value={rechargeAmount}
                                    onChange={(e) => setRechargeAmount(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-wa-green shadow-[0_0_15px_rgba(35,211,102,0.2)]"
                                />
                                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <span>Min ₹500</span>
                                    <span>Max ₹10,000</span>
                                </div>
                            </div>

                            <div className="bg-wa-green text-black p-8 rounded-[2rem] text-center">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Total Payable Incl. GST</div>
                                <div className="text-5xl font-black mb-2">₹{finalRecharge.toLocaleString()}</div>
                                <div className="text-[11px] font-bold uppercase tracking-widest mb-6 opacity-70">Incl. 7-Day Full Access Trial</div>
                                <Link
                                    href="/join"
                                    className="block w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:scale-105 transition-all shadow-xl mb-4"
                                >
                                    Start 7-Day Trial
                                </Link>
                                <Link
                                    href="https://wa.me/919789359407?text=I%20want%20to%20book%20a%20demo"
                                    target="_blank"
                                    className="block w-full py-3 bg-transparent border-2 border-black/10 text-black/60 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-black/5 transition-all"
                                >
                                    Book a Demo
                                </Link>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-800 flex items-center gap-4">
                            <ShieldCheck className="text-wa-green shrink-0" size={24} />
                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">
                                Secure payments via Razorpay. Supported: UPI, Cards, Netbanking. Maximum recharge per transaction is ₹10,000 + GST.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
