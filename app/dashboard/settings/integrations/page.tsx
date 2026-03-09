"use client";

import { Calendar, Check, Mail, Globe, Settings as SettingsIcon, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/settings/integrations")
            .then(res => res.json())
            .then(data => {
                setIntegrations(data.data || []);
                setLoading(false);
            });
    }, []);

    const isConnected = (type: string) => integrations.some(i => i.type === type && i.is_active);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight text-center">Connected Apps</h1>
                <p className="text-gray-500 text-sm text-center mt-1">Supercharge your WhatsApp flows with 1-click integrations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Google Calendar Integration */}
                <div className={`soft-card p-6 border-2 transition-all ${isConnected('GOOGLE_CALENDAR') ? 'border-emerald-500 bg-emerald-50/10' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <Calendar size={24} />
                        </div>
                        {isConnected('GOOGLE_CALENDAR') ? (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-lg flex items-center gap-1">
                                <Check size={10} /> Active
                            </span>
                        ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-400 text-[10px] font-black uppercase rounded-lg">
                                Disconnected
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Google Calendar</h3>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        Sync your appointment bookings directly to your Google Calendar in real-time.
                    </p>
                    <button
                        onClick={() => window.location.href = '/api/auth/google?scope=calendar'}
                        className={`w-full mt-6 py-2.5 rounded-xl text-sm font-black transition-all ${isConnected('GOOGLE_CALENDAR')
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-200'
                            }`}>
                        {isConnected('GOOGLE_CALENDAR') ? 'Manage Connection' : 'Connect Calendar'}
                    </button>
                </div>

                {/* Calendly (Coming Soon) */}
                <div className="soft-card p-6 border border-gray-100 opacity-60">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-400 rounded-xl flex items-center justify-center">
                            <Globe size={24} />
                        </div>
                        <span className="px-2 py-1 bg-gray-50 text-gray-400 text-[10px] font-black uppercase rounded-lg">
                            Coming Soon
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Calendly</h3>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        Automate slot picking using your existing Calendly availability and booking pages.
                    </p>
                    <button disabled className="w-full mt-6 py-2.5 rounded-xl text-sm font-black bg-gray-50 text-gray-400 cursor-not-allowed">
                        Connect Calendly
                    </button>
                </div>

                {/* Zapier (Coming Soon) */}
                <div className="soft-card p-6 border border-gray-100 opacity-60">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-50 text-orange-400 rounded-xl flex items-center justify-center">
                            <Zap size={24} />
                        </div>
                        <span className="px-2 py-1 bg-gray-50 text-gray-400 text-[10px] font-black uppercase rounded-lg">
                            Coming Soon
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Zapier</h3>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        Connect Grafty to 5000+ apps like Sheets, HubSpot, and Slack via Zaps.
                    </p>
                    <button disabled className="w-full mt-6 py-2.5 rounded-xl text-sm font-black bg-gray-50 text-gray-400 cursor-not-allowed">
                        Connect Zapier
                    </button>
                </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4">
                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                <div className="space-y-1">
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Security Note</h4>
                    <p className="text-xs text-amber-800/80 leading-relaxed font-medium">
                        All integration credentials are encrypted at rest using AES-256-GCM. We only request the minimum permissions required for our features to function.
                    </p>
                </div>
            </div>
        </div>
    );
}

function Zap({ size, className }: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
    )
}
