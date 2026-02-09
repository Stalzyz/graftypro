"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { CheckCircle, AlertTriangle, MessageSquare, RefreshCw, Zap, Phone, Globe, ShieldCheck, Settings2, ArrowLeft, Activity } from "lucide-react";
import ManualIntegrationWizard from "@/components/whatsapp/ManualIntegrationWizard";

declare global {
    interface Window {
        FB: any;
        fbAsyncInit: () => void;
    }
}

export default function WhatsAppSettingsPage() {
    const [status, setStatus] = useState("LOADING");
    const [loading, setLoading] = useState(false);
    const [wabaDetails, setWabaDetails] = useState<any>(null);
    const [showManualWizard, setShowManualWizard] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await fetch("/api/whatsapp/status");
            const data = await res.json();
            if (data.status === 'CONNECTED') {
                setStatus("CONNECTED");
                setWabaDetails(data.account);
            } else {
                setStatus("DISCONNECTED");
            }
        } catch (e) {
            setStatus("DISCONNECTED");
        }
    };

    const initFacebook = () => {
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: process.env.NEXT_PUBLIC_META_APP_ID,
                autoLogAppEvents: true,
                xfbml: true,
                version: 'v18.0'
            });
        };
    };

    const launchWhatsAppSignup = () => {
        if (!process.env.NEXT_PUBLIC_META_APP_ID || !process.env.NEXT_PUBLIC_META_CONFIG_ID) {
            alert("Configuration Missing: META_APP_ID or CONFIG_ID is not set in environment.");
            return;
        }

        setLoading(true);

        window.FB.login(function (response: any) {
            if (response.authResponse) {
                const code = response.authResponse.code;
                exchangeCode(code);
            } else {
                setLoading(false);
            }
        }, {
            config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID,
            response_type: 'code',
            override_default_response_type: true,
            extras: {
                setup: {}
            }
        });
    };

    const exchangeCode = async (code: string) => {
        try {
            const res = await fetch("/api/whatsapp/onboard", {
                method: "POST",
                body: JSON.stringify({ code }),
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                setStatus("CONNECTED");
                fetchStatus();
                alert("WhatsApp Connected Successfully!");
            } else {
                const data = await res.json();
                alert("Connection Failed: " + data.error);
            }
        } catch (e) {
            alert("Network Error during Onboarding.");
        } finally {
            setLoading(false);
        }
    };

    if (status === 'LOADING') {
        return (
            <div className="p-12 flex flex-col items-center justify-center min-h-[60vh]">
                <RefreshCw className="w-10 h-10 text-[#27954D] animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Checking connection status...</p>
            </div>
        );
    }

    if (showManualWizard) {
        return (
            <div className="space-y-8 animate-fade-in py-10">
                <button
                    onClick={() => setShowManualWizard(false)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest pl-4 mb-6 transition-all"
                >
                    <ArrowLeft size={16} /> Back to standard setup
                </button>
                <ManualIntegrationWizard
                    onComplete={() => {
                        setShowManualWizard(false);
                        fetchStatus();
                    }}
                    onCancel={() => setShowManualWizard(false)}
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <Script
                src="https://connect.facebook.net/en_US/sdk.js"
                onLoad={initFacebook}
            />

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">WhatsApp Channel</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your official WhatsApp Business API connection.</p>
                </div>
                {status === "CONNECTED" && (
                    <span className="bg-green-50 text-[#042f94] border border-green-100 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold">
                        <div className="w-2 h-2 rounded-full bg-[#27954D] animate-pulse" />
                        System Online
                    </span>
                )}
            </div>

            {status === "CONNECTED" && wabaDetails ? (
                <div className="space-y-6">
                    {/* Hero Status Card */}
                    <div className="bg-gradient-to-br from-[#27954D]/5 to-white border border-[#27954D]/10 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
                        <div className="flex items-center gap-8">
                            <div className="w-24 h-24 bg-white border border-slate-100 rounded-full flex items-center justify-center text-[#27954D] shadow-xl shadow-green-100/20">
                                <Phone size={36} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">{wabaDetails.display_name}</h2>
                                <p className="text-[#042f94] font-bold text-xl mt-1">+{wabaDetails.phone_number}</p>
                                <div className="flex items-center gap-3 mt-4">
                                    <span className="text-[10px] bg-slate-50 text-slate-400 border border-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-2 font-bold uppercase tracking-wider">
                                        <Globe size={14} /> {wabaDetails.timezone || "Asia/Kolkata"}
                                    </span>
                                    <span className={`text-[10px] px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 border ${wabaDetails.quality_rating === 'GREEN' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                                        }`}>
                                        <ShieldCheck size={14} /> Quality: {wabaDetails.quality_rating || "High"}
                                    </span>
                                    <span className={`text-[10px] px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 border ${wabaDetails.health_status === 'HEALTHY' ? 'bg-green-50 text-[#042f94] border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                                        }`}>
                                        <Activity size={14} /> Health: {wabaDetails.health_status || "UNKNOWN"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            <div className="text-right">
                                <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Tier & Capacity</div>
                                <div className="text-gray-800 font-bold text-xl">{wabaDetails.rate_limit_tier || "Tier 1 (1k)"}</div>
                            </div>
                            <button onClick={fetchStatus} className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl text-[11px] font-bold transition-all border border-slate-100">
                                <RefreshCw size={14} /> Refresh Cloud State
                            </button>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-6">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <Zap size={18} className="text-[#27954D]" />
                                API Provisioning
                            </h3>
                            <div className="space-y-5">
                                <DetailRow label="WABA ID" value={wabaDetails.waba_id} isMono />
                                <DetailRow label="Phone ID" value={wabaDetails.phone_number_id} isMono />
                                <DetailRow label="App ID" value={wabaDetails.app_id || "Embedded"} isMono />
                            </div>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-6">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <MessageSquare size={18} className="text-[#27954D]" />
                                Interaction Metrics
                            </h3>
                            <div className="space-y-4">
                                <CapabilityItem label="Broadcast Templates" active />
                                <CapabilityItem label="Live Chat Interface" active />
                                <CapabilityItem label="Automated Flows" active />
                                <CapabilityItem label="Cloud Storage" active />
                            </div>
                        </div>
                    </div>

                    {/* Webhook Status */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner">
                                <Globe size={28} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">Inbound Webhook Pulse</h4>
                                <p className="text-xs text-gray-400 font-medium">Real-time synchronization enabled over HTTPS.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-green-600 bg-green-50 px-6 py-3 rounded-2xl border border-green-100 uppercase tracking-widest shadow-sm">
                            <CheckCircle size={16} /> Webhook Established
                        </div>
                    </div>

                    <div className="pt-8 text-center">
                        <button
                            onClick={() => {
                                if (confirm("Are you sure you want to disconnect? This will pause all active campaigns.")) {
                                    // Handle disconnect logic
                                }
                            }}
                            className="text-red-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
                        >
                            Deactivate Integration
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-[3rem] p-16 text-center max-w-2xl mx-auto flex flex-col items-center shadow-xl shadow-slate-200/20">
                    <div className="w-28 h-28 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-inner border border-slate-100">
                        <div className="w-16 h-16 bg-[#27954D] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200">
                            <Phone size={36} strokeWidth={1.5} />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 tracking-tight">Expand to WhatsApp</h2>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto mb-12 leading-relaxed">
                        Connect your official Business API and start reaching customers where they are most active.
                    </p>

                    <div className="space-y-6 w-full max-w-sm">
                        <button
                            onClick={launchWhatsAppSignup}
                            disabled={loading}
                            className="w-full bg-[#1877F2] hover:bg-blue-600 text-white px-8 py-5 rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-blue-100/50"
                        >
                            {loading ? <RefreshCw className="animate-spin" /> : (
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            )}
                            {loading ? "Initializing..." : "Connect with Facebook"}
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-slate-300 bg-white px-4">OR</div>
                        </div>

                        <button
                            onClick={() => setShowManualWizard(true)}
                            className="w-full flex items-center justify-center gap-2 py-4 text-slate-500 hover:text-slate-800 font-bold text-xs bg-slate-50 border border-slate-100 rounded-2xl transition-all"
                        >
                            <Settings2 size={16} />
                            Advanced: Manual Provisioning
                        </button>
                    </div>

                    <p className="mt-12 text-[10px] text-slate-300 font-bold uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={14} className="text-[#27954D]" />
                        Secure Enterprise Connection Protocol
                    </p>
                </div>
            )}
        </div>
    );
}

function DetailRow({ label, value, isMono = false }: { label: string; value: string; isMono?: boolean }) {
    return (
        <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] pl-1">{label}</span>
            <div className={`p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-semibold text-slate-600 ${isMono ? 'font-mono' : ''} shadow-inner truncate`}>
                {value}
            </div>
        </div>
    );
}

function CapabilityItem({ label, active }: { label: string; active: boolean }) {
    return (
        <div className="flex justify-between items-center bg-slate-50/50 p-4 border border-slate-100 rounded-2xl transition-all hover:bg-white shadow-sm">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-tight">{label}</span>
            <span className="bg-green-50 text-green-600 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">Active</span>
        </div>
    );
}
