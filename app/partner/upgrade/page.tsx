
"use client";

import { Check, Crown, Zap, Shield, Globe, Mail, Rocket, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function UpgradePage() {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        // This would typically involve a payment link or a request to admin
        alert("Your request to become a Platform Partner has been sent to our verification team. We will contact you shortly.");
        window.location.href = "/partner/dashboard";
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                    Partner Growth
                </div>
                 <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 tracking-tight">
                    Scale to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 inline-block">Platform Partner</span>
                </h1>
                <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium">
                    Stop earning just commissions. Start building your own branded empire with full white-label infrastructure.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-8">
                    <FeatureItem
                        icon={<Crown className="text-amber-400" />}
                        title="100% White-Label"
                        desc="Logo, colors, favicon, and custom domain mapping. Your clients see your brand, always."
                    />
                    <FeatureItem
                        icon={<Zap className="text-cyan-400" />}
                        title="Subscription Builder"
                        desc="Create your own plans, set your own prices, and keep all the margins above the floor."
                    />
                    <FeatureItem
                        icon={<Shield className="text-emerald-400" />}
                        title="Private SMTP & DNS"
                        desc="Send emails from your own domain and manage your own DNS settings for your vendors."
                    />
                    <FeatureItem
                        icon={<Globe className="text-blue-400" />}
                        title="Embedded Checkout"
                        desc="Iframe and JS snippets to sell directly on your existing agency website."
                    />
                </div>

                <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full"></div>
                    <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-10 shadow-2xl overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4">
                            <Rocket className="text-zinc-800 group-hover:text-cyan-500/20 transition-colors" size={100} />
                        </div>

                        <h3 className="text-2xl font-black text-white mb-2">Whitelabel Partner</h3>
                        <div className="mb-6 flex items-baseline gap-1">
                            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">₹46,000</span>
                            <span className="text-zinc-500 text-xs font-bold">one time</span>
                        </div>

                        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                            Full autonomy structure. Deploy isolated database frames, setup custom nodes, and keep 100% of your customer revenue dashboard yields.
                        </p>

                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 mb-6 space-y-3">
                            <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Fee Breakdown</div>
                            <div className="flex justify-between text-xs font-bold text-zinc-300">
                                <span className="text-zinc-500">Setup & White-label DNS</span>
                                <span>₹10,000</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-zinc-300">
                                <span className="text-zinc-500">Dedicated Cloud Node Setup</span>
                                <span>₹20,000</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-zinc-300">
                                <span className="text-zinc-500">Lifetime Orchestration Fee</span>
                                <span>₹10,000</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-zinc-300">
                                <span className="text-zinc-500">Lifetime SLA Support</span>
                                <span>₹6,000</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            {[
                                "No Grafty Network Branding",
                                "Custom Pricing / Plan Builders",
                                "Isolated Database Sandboxing",
                                "Private domain SMTP Routing",
                                "Unlimited Domain Mapping Control"
                             ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm font-bold text-zinc-300">
                                    <div className="w-5 h-5 bg-cyan-500/10 text-cyan-500 rounded-md flex items-center justify-center">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                    {item}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleUpgrade}
                            disabled={loading}
                            className="w-full py-4 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all active:scale-95 shadow-xl shadow-cyan-500/10"
                        >
                            Request Whitelabel Access
                            <ArrowRight size={18} />
                        </button>

                        <p className="text-center text-[10px] text-zinc-600 mt-6 font-black uppercase tracking-widest">
                            Verification required within 24 hours
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ icon, title, desc }: any) {
    return (
        <div className="flex gap-5">
            <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group hover:border-zinc-700 transition-colors">
                {icon}
            </div>
            <div>
                <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
