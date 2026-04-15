"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Globe, File as FileIcon, ShoppingBag, 
  BrainCircuit, CheckCircle2, TrendingUp, MessageCircle
} from "lucide-react";

export default function KnowledgeEngineAnimation() {
  const [scene, setScene] = useState(1);

  // 10-second master loop: 5 scenes, 2 seconds each
  useEffect(() => {
    const timer = setInterval(() => {
      setScene((prev) => (prev >= 5 ? 1 : prev + 1));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full aspect-video rounded-3xl bg-slate-50 border border-slate-200/60 shadow-inner overflow-hidden relative flex items-center justify-center">
      {/* 
        Background subtle grid and gradients
      */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-blue-500/5 mix-blend-multiply" />

      {/* --- SCENE 1 & 2: DATA INPUT AND NEURAL PROCESSING --- */}
      <AnimatePresence>
        {(scene === 1 || scene === 2) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Core Node */}
            <motion.div 
              animate={{ 
                boxShadow: scene === 2 
                  ? ["0px 0px 0px 0px rgba(16,185,129,0)", "0px 0px 60px 20px rgba(16,185,129,0.2)", "0px 0px 0px 0px rgba(16,185,129,0)"]
                  : "0px 0px 0px 0px rgba(16,185,129,0)",
                scale: scene === 2 ? [1, 1.1, 1] : 1
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="relative z-10 w-24 h-24 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center"
            >
              <BrainCircuit className={`w-10 h-10 ${scene === 2 ? 'text-emerald-500' : 'text-slate-400'} transition-colors duration-1000`} />
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: scene === 1 ? 1 : 0, y: scene === 1 ? 20 : 30 }}
                className="absolute -bottom-8 whitespace-nowrap text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100"
              >
                Train your AI
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: scene === 2 ? 1 : 0, y: scene === 2 ? 0 : 10 }}
                className="absolute -bottom-8 whitespace-nowrap text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full shadow-sm border border-emerald-100"
              >
                Neural Intelligence Active
              </motion.div>
            </motion.div>

            {/* Floating Data Pillars */}
            {[
              { icon: FileText, label: "PDF", x: -140, y: -90, delay: 0 },
              { icon: Globe, label: "URL", x: 140, y: -90, delay: 0.1 },
              { icon: FileIcon, label: "DOC", x: -140, y: 90, delay: 0.2 },
              { icon: ShoppingBag, label: "CATALOG", x: 140, y: 90, delay: 0.3 }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ x: item.x, y: item.y, opacity: 0, scale: 0 }}
                animate={{ 
                  x: scene === 2 ? 0 : item.x, 
                  y: scene === 2 ? 0 : item.y,
                  opacity: scene === 2 ? 0 : 1,
                  scale: scene === 2 ? 0.3 : 1
                }}
                transition={{ 
                  duration: 1.2, 
                  delay: scene === 2 ? item.delay * 0.5 : item.delay,
                  ease: "easeInOut"
                }}
                className="absolute z-0 flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center border border-slate-100">
                  <item.icon className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider hidden sm:block">{item.label}</span>
                
                {/* Neural Lines bridging to center */}
                <svg className="absolute top-1/2 left-1/2 w-40 h-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: -1 }}>
                  <motion.line 
                    x1="50%" y1="50%" 
                    x2={item.x > 0 ? "0%" : "100%"} 
                    y2={item.y > 0 ? "0%" : "100%"}
                    stroke="url(#gradient)" strokeWidth="2" strokeDasharray="4 4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                      pathLength: scene === 2 ? 1 : 0, 
                      opacity: scene === 2 ? 0.4 : 0 
                    }}
                    transition={{ duration: 1 }}
                  />
                </svg>
              </motion.div>
            ))}

            <svg className="hidden">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SCENE 3 & 4: WHATSAPP INTERACTION & SCALING --- */}
      <AnimatePresence>
        {(scene === 3 || scene === 4) && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: scene === 4 ? 0.7 : 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Primary Chat Window */}
            <motion.div 
              className="relative w-72 bg-slate-50/90 backdrop-blur-md rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden z-20 flex flex-col"
              animate={{ 
                x: scene === 4 ? -40 : 0,
                y: scene === 4 ? -20 : 0
              }}
            >
              {/* Header */}
              <div className="bg-emerald-500 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white text-xs font-bold">Grafty AI</div>
                  <div className="text-emerald-100 text-[10px]">Online</div>
                </div>
              </div>
              {/* Body */}
              <div className="p-4 bg-[url('https://cdn.pixabay.com/photo/2021/07/04/18/06/leaves-6387063_1280.png')] bg-cover bg-opacity-5 flex flex-col gap-3 min-h-[160px]">
                {/* User msg */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                  className="bg-white text-slate-700 text-xs p-2.5 rounded-2xl rounded-tr-sm self-end shadow-sm max-w-[85%]"
                >
                  Do you have size 9 in this product?
                </motion.div>
                {/* Typing... */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={scene === 3 ? { opacity: [0, 1, 0] } : { opacity: 0, display: "none" }} 
                  transition={{ delay: 0.5, duration: 1.2 }}
                  className="bg-white/80 text-slate-500 text-[10px] p-2 rounded-2xl rounded-tl-sm self-start shadow-sm w-12 flex justify-center gap-1"
                >
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                </motion.div>
                {/* AI Reply */}
                <motion.div 
                  initial={{ opacity: 0, x: -20, scale: 0.9 }} 
                  animate={{ opacity: 1, x: 0, scale: 1 }} 
                  transition={{ delay: 1.6 }}
                  className="bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs p-2.5 rounded-2xl rounded-tl-sm self-start shadow-sm max-w-[90%] relative"
                >
                  Yes, available! ⚡️ Would you like me to place an order?
                  <motion.div 
                    initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.8 }}
                    className="absolute -right-1 -bottom-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center"
                  ></motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* Scaling Shadows (Scene 4) */}
            {scene === 4 && (
              <>
                {[
                  { x: 40, y: 20, rotate: 5, delay: 0.1, msg: "+10 chats" },
                  { x: -60, y: 40, rotate: -8, delay: 0.2, msg: "+50 chats" },
                  { x: 80, y: -30, rotate: 12, delay: 0.3, msg: "+100 chats" }
                ].map((ghost, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.5, rotate: 0 }}
                    animate={{ opacity: 0.4, x: ghost.x, y: ghost.y, scale: 0.8, rotate: ghost.rotate }}
                    transition={{ delay: ghost.delay, duration: 0.6, ease: "easeOut" }}
                    className="absolute w-72 h-40 bg-white rounded-[2rem] shadow-xl border border-slate-200 z-10 flex items-center justify-center"
                  >
                    <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full font-bold text-lg">
                      {ghost.msg}
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SCENE 5: OUTCOME / DASHBOARD --- */}
      <AnimatePresence>
        {scene === 5 && (
          <motion.div 
            initial={{ opacity: 0, filter: "blur(10px)", scale: 1.1 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)", transition: { duration: 1.5 } }} // Slow fade back to scene 1
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-30"
          >
            <div className="absolute inset-0 bg-emerald-500/5 backdrop-blur-sm" />
            
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center gap-4 relative"
            >
              <div className="flex gap-4">
                <div className="flex flex-col items-center bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[100px]">
                  <TrendingUp className="w-8 h-8 text-blue-500 mb-2" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Growth</span>
                  <span className="text-2xl font-bold text-slate-800">+340%</span>
                </div>
                <div className="flex flex-col items-center bg-emerald-50 p-4 rounded-xl border border-emerald-100 min-w-[100px]">
                  <MessageCircle className="w-8 h-8 text-emerald-500 mb-2" />
                  <span className="text-[10px] font-semibold text-emerald-600/70 uppercase tracking-wider">Automated</span>
                  <span className="text-2xl font-bold text-emerald-600">24/7</span>
                </div>
              </div>

              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg mt-2"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-semibold tracking-wide">100% Accuracy. 0% Delay.</span>
              </motion.div>
            </motion.div>
            
            {/* Floating particles for Outcome */}
            {Array.from({length: 6}).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], y: -100 }}
                transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                className="absolute w-2 h-2 rounded-full bg-emerald-400"
                style={{ left: `${30 + i * 10}%`, bottom: '20%' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Floating Badges (Optional enhancements) */}
      <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none opacity-60">
        <div className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">AI Trained</div>
        <div className="text-[9px] font-bold tracking-widest text-emerald-500 uppercase">Instant Replies</div>
      </div>
    </div>
  );
}
