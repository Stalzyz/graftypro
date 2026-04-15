"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Power, CheckCircle, TrendingUp, ShieldCheck, Zap, Activity } from "lucide-react";

export default function AutopilotEngineAnimation() {
  const [scene, setScene] = useState(1);

  // 8-second master loop: 4 scenes, 2 seconds each
  useEffect(() => {
    const timer = setInterval(() => {
      setScene((prev) => (prev >= 4 ? 1 : prev + 1));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full aspect-square md:aspect-video rounded-3xl bg-white border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative flex items-center justify-center">
      {/* Background radial soft light for depth */}
      <div className={`absolute inset-0 transition-opacity duration-1000 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${scene >= 1 ? 'from-emerald-50/50 via-white to-white' : 'from-slate-50 via-white to-white'}`} />

      {/* --- SCENE 1: AUTOPILOT START --- */}
      <motion.div 
        className="absolute top-8 flex flex-col items-center gap-3 z-30"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-100 shadow-sm">
          <span className="text-sm font-semibold text-slate-600">Autopilot</span>
          {/* Toggle Switch */}
          <div className="relative w-12 h-6 rounded-full bg-slate-200 overflow-hidden shadow-inner">
            <motion.div 
              className="absolute inset-0 bg-emerald-500"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: scene >= 1 ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
            <motion.div 
              className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center z-10"
              animate={{ x: scene >= 1 ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Power className={`w-2.5 h-2.5 ${scene >= 1 ? 'text-emerald-500' : 'text-slate-400'}`} />
            </motion.div>
          </div>
          <span className={`text-xs font-bold transition-colors duration-500 ${scene >= 1 ? 'text-emerald-500' : 'text-slate-400'}`}>
            {scene >= 1 ? 'ENGAGED' : 'OFF'}
          </span>
        </div>
      </motion.div>

      {/* Global Green Glow that intensifies */}
      <motion.div 
        className="absolute w-64 h-64 bg-emerald-400/20 rounded-full blur-[80px] pointer-events-none"
        animate={{ 
          opacity: scene === 1 ? 0.3 : scene >= 2 ? 0.6 : 0,
          scale: scene === 4 ? 1.5 : 1
        }}
        transition={{ duration: 1 }}
      />

      {/* --- SCENE 2, 3, 4: CHATS AND CONVERSION --- */}
      <div className="relative w-full max-w-sm h-64 flex flex-col justify-end pb-8 z-20">
        <AnimatePresence>
          {scene >= 2 && (
            <div className="flex flex-col gap-3 w-full px-8">
              {/* Lead 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
                className="self-start relative group w-full"
              >
                <div className="bg-slate-100 text-slate-700 text-sm px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm border border-slate-200/50 inline-block w-3/4">
                  Do you have this in stock?
                </div>
                {/* AI Reply overlaying/connecting */}
                <AnimatePresence>
                  {scene >= 3 && (
                    <motion.div 
                      key="r1"
                      initial={{ opacity: 0, scale: 0.9, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.3, type: "spring" }}
                      className="absolute -right-4 top-6 bg-emerald-500 text-white text-xs px-3 py-2 rounded-2xl rounded-tr-sm shadow-lg z-10 w-3/4"
                    >
                      {scene === 4 ? (
                        <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-white" /> Order Confirmed</div>
                      ) : (
                        "Yes, 4 left! Buy now?"
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Lead 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20, rotate: 1 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, delay: 0.2 }}
                className="self-start relative w-full pt-4"
              >
                <div className="bg-slate-100 text-slate-700 text-sm px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm border border-slate-200/50 inline-block w-2/3">
                  Price for bulk?
                </div>
                <AnimatePresence>
                  {scene >= 3 && (
                    <motion.div 
                      key="r2"
                      initial={{ opacity: 0, scale: 0.9, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1, type: "spring" }}
                      className="absolute -right-2 top-8 bg-emerald-500 text-white text-xs px-3 py-2 rounded-2xl rounded-tr-sm shadow-lg z-10 w-3/4"
                    >
                      {scene === 4 ? (
                        <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-white" /> Payment Received</div>
                      ) : (
                        "$40/ea for 100+. Link?"
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Lead 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, delay: 0.4 }}
                className="self-start relative w-full pt-6"
              >
                <div className="bg-slate-100 text-slate-700 text-sm px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm border border-slate-200/50 inline-block w-4/5">
                  Ship to NY?
                </div>
                <AnimatePresence>
                  {scene >= 3 && (
                    <motion.div 
                      key="r3"
                      initial={{ opacity: 0, scale: 0.8 }} animate={scene === 3 ? { opacity: 1, scale: 1 } : { opacity: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
                      className="absolute right-0 top-8 bg-white text-emerald-600 border border-emerald-100 text-xs px-3 py-1.5 rounded-2xl rounded-tr-sm shadow-lg z-10 flex gap-1 items-center"
                    >
                      <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></span>
                      <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce delay-200"></span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* --- SCENE 4: OUTCOME GRAPH & BADGES --- */}
      <AnimatePresence>
        {scene === 4 && (
          <>
            {/* Graph swooping up */}
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-4 rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.15)] border border-emerald-100 z-40 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-semibold mb-0.5">Revenue Added</span>
                <span className="text-xl font-bold text-slate-800">+$12,400</span>
              </div>
            </motion.div>

            {/* Floating Metrics */}
            {[
              { icon: Activity, label: "100% Uptime", x: -100, y: -80, rotate: -5, delay: 0.1 },
              { icon: Zap, label: "< 2s Response", x: 100, y: -40, rotate: 8, delay: 0.2 },
              { icon: ShieldCheck, label: "99.9% Accuracy", x: -120, y: 40, rotate: -4, delay: 0.3 },
            ].map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{ opacity: 1, x: badge.x, y: badge.y, scale: 1, rotate: badge.rotate }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", delay: badge.delay, stiffness: 200 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-1.5 z-40"
              >
                <badge.icon className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap">{badge.label}</span>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
