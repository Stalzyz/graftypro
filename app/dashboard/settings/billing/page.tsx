"use client";

import { useState, useEffect } from "react";
import { Check, Zap, Shield, CreditCard } from "lucide-react";
import Script from "next/script";

export default function BillingPage() {
    const [currentPlan, setCurrentPlan] = useState("FREE");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch current plan status
        fetch("/api/billing/status")
            .then(res => res.json())
            .then(data => {
                if (data.plan) setCurrentPlan(data.plan);
            });
    }, []);

    const handleUpgrade = async (plan: string) => {
        setLoading(true);
        try {
            // 1. Create Subscription via API
            const res = await fetch("/api/billing/subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan })
            });
            const data = await res.json();

            if (!data.subscriptionId) throw new Error("Failed to init subscription");

            // 2. Launch Razorpay
            const options = {
                "key": process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                "subscription_id": data.subscriptionId,
                "name": "Wabot SaaS",
                "description": `Upgrade to ${plan}`,
                "handler": async function (response: any) {
                    // 3. Verify on Backend
                    await fetch("/api/billing/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(response)
                    });
                    alert("Upgrade Successful! Refreshing...");
                    window.location.reload();
                },
                "theme": {
                    "color": "#18181b"
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (e) {
            console.error(e);
            alert("Upgrade failed. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div>
                <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>
                <p className="text-gray-500">Manage your subscription and usage limits.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FREE PLAN */}
                <div className={`p-6 rounded-2xl border ${currentPlan === 'FREE' ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-gray-200 bg-white'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">Free Starter</h3>
                            <p className="text-sm text-gray-500">Perfect for small businesses.</p>
                        </div>
                        {currentPlan === 'FREE' && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">CURRENT</span>}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-6">Free</div>
                    <ul className="space-y-3 mb-8">
                        <FeatureItem text="100 Contacts" />
                        <FeatureItem text="1 Broadcast Campaign" />
                        <FeatureItem text="Basic Flow Builder" />
                    </ul>
                    <button disabled className="w-full bg-gray-100 text-gray-400 font-medium py-2 rounded-lg cursor-not-allowed">
                        Included
                    </button>
                </div>

                {/* PRO PLAN */}
                <div className={`p-6 rounded-2xl border ${currentPlan === 'PRO' ? 'border-green-500 bg-green-50/50 ring-1 ring-green-500' : 'border-gray-200 bg-white shadow-lg relative overflow-hidden'}`}>
                    {currentPlan !== 'PRO' && <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg">POPULAR</div>}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">Pro Business</h3>
                            <p className="text-sm text-gray-500">Scale your automation.</p>
                        </div>
                        {currentPlan === 'PRO' && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">CURRENT</span>}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-6">₹2,999<span className="text-sm font-normal text-gray-500">/mo</span></div>
                    <ul className="space-y-3 mb-8">
                        <FeatureItem text="10,000 Contacts" />
                        <FeatureItem text="Unlimited Broadcasts" />
                        <FeatureItem text="Advanced Flows & Conditions" />
                        <FeatureItem text="Priority Support" />
                    </ul>
                    {currentPlan === 'PRO' ? (
                        <button disabled className="w-full bg-green-600 text-white font-medium py-2 rounded-lg cursor-not-allowed">
                            Active
                        </button>
                    ) : (
                        <button
                            onClick={() => handleUpgrade('PRO')}
                            disabled={loading}
                            className="w-full bg-zinc-900 text-white font-medium py-2 rounded-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? "Processing..." : <>Upgrade to Pro <Zap size={16} className="fill-yellow-400 text-yellow-400" /></>}
                        </button>
                    )}
                </div>
            </div>

            {/* Enterprise / Custom */}
            <div className="bg-gray-900 text-white p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="font-bold text-xl mb-2 flex items-center gap-2"><Shield size={20} /> Enterprise Security</h3>
                    <p className="text-gray-400 text-sm max-w-sm">Need custom limits, SLA, or on-premise deployment? We offer tailored solutions for large organizations.</p>
                </div>
                <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                    Contact Sales
                </button>
            </div>
        </div>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                <Check size={12} />
            </div>
            {text}
        </li>
    );
}
