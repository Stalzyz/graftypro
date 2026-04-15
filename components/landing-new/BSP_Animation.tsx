"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Send, ShoppingBag, Star, Bot, Sparkles } from "lucide-react";

const STAGES = [
    { id: "START", duration: 1000 },
    { id: "USER_MSG", duration: 2000, text: "Hi, I need pricing for the Growth Plan." },
    { id: "BOT_REPLY", duration: 2000, text: "Sure! Here are our best plans for you:" },
    { id: "PRODUCT_SHOWCASE", duration: 3000 },
    { id: "SELECTION", duration: 1500 },
    { id: "PAYMENT", duration: 2500 },
    { id: "CONFIRMATION", duration: 2500, text: "Your order is confirmed! Ready to scale? 🚀" },
];

export default function BSP_Animation() {
    const [currentStage, setCurrentStage] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentStage((prev) => (prev + 1) % STAGES.length);
        }, STAGES[currentStage].duration);
        return () => clearTimeout(timer);
    }, [currentStage]);

    return (
        <div className="w-full max-w-[450px] aspect-[9/16] bg-white rounded-[3rem] shadow-2xl border-[8px] border-slate-900 overflow-hidden relative group">
            {/* Status Bar */}
            <div className="h-10 bg-slate-900 flex items-center justify-between px-8 text-white/40">
                <div className="text-[10px] font-bold">9:41</div>
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full border border-white/20" />
                    <div className="w-3 h-3 rounded-full border border-white/20" />
                </div>
            </div>

            {/* Chat Header */}
            <div className="bg-[#075E54] p-4 flex items-center gap-3 shadow-md">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <Bot size={20} />
                </div>
                <div>
                    <div className="text-white font-bold text-sm flex items-center gap-2">
                        Grafty Autopilot <Sparkles size={12} className="text-yellow-400" />
                    </div>
                    <div className="text-white/60 text-[10px] uppercase tracking-widest font-black">Always Online</div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="absolute inset-0 top-24 bottom-0 bg-[#E5DDD5] p-6 space-y-4 overflow-hidden">
                <AnimatePresence>
                    {currentStage >= 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            className="bg-[#DCF8C6] p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] ml-auto text-sm text-slate-800 font-medium"
                        >
                            {STAGES[1].text}
                        </motion.div>
                    )}

                    {currentStage >= 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] text-sm text-slate-800 font-medium"
                        >
                            {STAGES[2].text}
                        </motion.div>
                    )}

                    {currentStage >= 3 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                        >
                            <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-100 relative group overflow-hidden">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                        <ShoppingBag size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-slate-900">Growth Plan</div>
                                        <div className="text-[10px] font-bold text-green-600 uppercase">₹2,999 / mo</div>
                                    </div>
                                </div>
                                <div className="space-y-1.5 mb-4">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium"><Check size={12} className="text-green-500" /> 10,000 Credits</div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium"><Check size={12} className="text-green-500" /> AI Autopilot Engaged</div>
                                </div>
                                
                                <motion.div
                                    animate={currentStage === 4 ? { scale: 0.95, backgroundColor: "#27954D", color: "#FFFFFF" } : {}}
                                    className="w-full py-2.5 rounded-xl border border-green-500 text-green-600 text-[10px] font-black uppercase tracking-widest text-center transition-colors"
                                >
                                    {currentStage === 4 ? "Selected" : "Select Product"}
                                </motion.div>

                                {currentStage === 4 && (
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1.5, opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-green-500/20 rounded-full"
                                    />
                                )}
                            </div>
                        </motion.div>
                    )}

                    {currentStage === 5 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="absolute inset-0 z-20 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mb-6"
                            />
                            <h4 className="text-xl font-black text-slate-900 mb-2">Processing Secure Payment</h4>
                            <p className="text-sm text-slate-500 font-medium">Redirecting to Razorpay checkout...</p>
                        </motion.div>
                    )}

                    {currentStage >= 6 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                             <div className="bg-white p-4 rounded-2xl shadow-xl border border-green-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-200">
                                    <Check size={24} strokeWidth={3} />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-slate-900">Payment Successful</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Order #GR-99421 Confirmed</div>
                                </div>
                            </div>
                            
                            <motion.div
                                initial={{ opacity: 0, x: -20, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] text-sm text-[#075E54] font-bold border-l-4 border-[#075E54]"
                            >
                                {STAGES[6].text}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Overlay */}
            <div className="absolute bottom-6 left-6 right-6 h-12 bg-white rounded-full shadow-lg border border-slate-100 flex items-center px-6 gap-3">
                <div className="w-px h-6 bg-slate-100" />
                <div className="flex-1 text-slate-300 text-xs font-medium">Type a message...</div>
                <div className="text-green-500"><Send size={18} /></div>
            </div>

            {/* Brand Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none rotate-[-45deg] scale-[2]">
                <h1 className="text-9xl font-black">GRAFTY</h1>
            </div>
        </div>
    );
}
