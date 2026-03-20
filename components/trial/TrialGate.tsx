
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AlertTriangle, Zap, Clock, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TrialState {
    status: "loading" | "paid" | "trial" | "expired" | "no_trial";
    days_left: number;
    trial_expired: boolean;
}

// Full-page block for expired trials
export function TrialExpiredGate() {
    const pathname = usePathname();
    const [trial, setTrial] = useState<TrialState>({ status: "loading", days_left: 0, trial_expired: false });
    const [plans, setPlans] = useState<any[]>([]);

    const fetchTrial = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/trial-status");
            
            if (res.status === 401) {
                console.warn("[TrialGate] Unauthorized access to trial status.");
                setTrial({ status: "paid", days_left: 0, trial_expired: false });
                return;
            }

            const data = await res.json();
            setTrial({ status: data.status, days_left: data.days_left ?? 0, trial_expired: data.trial_expired });
        } catch (err) {
            console.error("[TrialGate] Failed to fetch trial status:", err);
            setTrial({ status: "paid", days_left: 0, trial_expired: false });
        }
    }, []);

    const fetchPlans = useCallback(async () => {
        try {
            const res = await fetch("/api/billing/plans");
            const data = await res.json();
            setPlans(data.data || []);
        } catch (err) {
            console.error("[TrialGate] Failed to fetch plans:", err);
        }
    }, []);

    useEffect(() => { 
        fetchTrial(); 
        fetchPlans();
    }, [fetchTrial, fetchPlans]);

    const isBillingPage = pathname === "/dashboard/settings/billing";

    if (trial.status === "loading" || !trial.trial_expired || isBillingPage) return null;

    const displayPlans = plans.length > 0 ? plans.slice(0, 2) : [
        { name: "Lite Chat", price: 999, description: "Templates + Chat" },
        { name: "Prime Starter", price: 1999, description: "Full Automation" }
    ];

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 text-center relative overflow-hidden">
                {/* Gradient top bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" />

                <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={40} className="text-orange-500" />
                </div>

                <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                    Your 7-Day Trial Has Ended
                </h2>
                <p className="text-slate-500 text-base leading-relaxed mb-8">
                    Your free trial period is over. Upgrade to a plan to continue accessing your dashboard, campaigns, templates, and conversations.
                </p>

                <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-3">Available Plans</p>
                    <div className="grid grid-cols-2 gap-3">
                        {displayPlans.map(p => (
                            <div key={p.name} className="bg-white border border-slate-200 rounded-xl p-3 text-left">
                                <p className="text-xs font-black text-slate-900">{p.name}</p>
                                <p className="text-lg font-black text-[#27954D]">₹{p.price.toLocaleString()}/mo</p>
                                <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{p.description || p.tag}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <Link
                    href="/dashboard/settings/billing"
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-slate-900/20 text-base"
                >
                    <Zap size={18} className="text-yellow-400" />
                    Choose a Plan & Upgrade
                </Link>

                <p className="text-xs text-slate-400 mt-4">
                    Need help? <a href="mailto:support@grafty.pro" className="text-[#27954D] font-bold hover:underline">Contact support</a>
                </p>
            </div>
        </div>
    );
}

// Non-blocking top banner for active trials
export function TrialBanner() {
    const [trial, setTrial] = useState<TrialState>({ status: "loading", days_left: 0, trial_expired: false });
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        async function fetchTrial() {
            try {
                const res = await fetch("/api/auth/trial-status");
                const data = await res.json();
                setTrial({ status: data.status, days_left: data.days_left ?? 0, trial_expired: data.trial_expired });
            } catch {
                setTrial({ status: "paid", days_left: 0, trial_expired: false });
            }
        }
        fetchTrial();
    }, []);

    if (dismissed || trial.status !== "trial" || trial.trial_expired) return null;

    const urgent = trial.days_left <= 2;

    return (
        <div className={`w-full flex items-center justify-between px-6 py-2.5 text-sm font-bold ${urgent ? "bg-orange-500 text-white" : "bg-amber-50 text-amber-900 border-b border-amber-200"}`}>
            <div className="flex items-center gap-3">
                <Clock size={15} className={urgent ? "text-white" : "text-amber-500"} />
                <span>
                    {urgent
                        ? `⚠️ Trial ending soon — ${trial.days_left} day${trial.days_left === 1 ? "" : "s"} left! Upgrade now to keep your data.`
                        : `🎉 You're on a 7-day free trial — ${trial.days_left} day${trial.days_left === 1 ? "" : "s"} remaining.`
                    }
                </span>
                <Link href="/dashboard/settings/billing" className={`underline font-black ${urgent ? "text-white" : "text-amber-700"}`}>
                    Upgrade Now →
                </Link>
            </div>
            <button onClick={() => setDismissed(true)} className="ml-4 opacity-60 hover:opacity-100 transition-opacity">
                <X size={16} />
            </button>
        </div>
    );
}
