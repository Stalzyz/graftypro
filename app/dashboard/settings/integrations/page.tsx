"use client";

import { Calendar, Check, Mail, Globe, Settings as SettingsIcon, AlertCircle, ShoppingBag } from "lucide-react";
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
                            : 'btn-primary shadow-lg'
                            }`}>
                        {isConnected('GOOGLE_CALENDAR') ? 'Manage Connection' : 'Connect Calendar'}
                    </button>
                </div>

                {/* Shopify Integration */}
                <div className={`soft-card p-6 border-2 transition-all ${isConnected('SHOPIFY') ? 'border-emerald-500 bg-emerald-50/10' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <ShoppingBag size={24} />
                        </div>
                        {isConnected('SHOPIFY') ? (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-lg flex items-center gap-1">
                                <Check size={10} /> Active
                            </span>
                        ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-400 text-[10px] font-black uppercase rounded-lg">
                                Disconnected
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Shopify</h3>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        Sync products, recover abandoned carts, and send order updates via WhatsApp.
                    </p>
                    <button
                        onClick={() => window.location.href = '/dashboard/commerce'}
                        className="w-full mt-6 py-2.5 rounded-xl text-sm font-black btn-primary shadow-lg">
                        Configure Shopify
                    </button>
                </div>

                {/* Google Sheets */}
                <div className={`soft-card p-6 border-2 transition-all ${isConnected('GOOGLE_SHEETS') ? 'border-emerald-500 bg-emerald-50/10' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <Globe size={24} />
                        </div>
                        {isConnected('GOOGLE_SHEETS') ? (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-lg flex items-center gap-1">
                                <Check size={10} /> Active
                            </span>
                        ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-400 text-[10px] font-black uppercase rounded-lg">
                                Disconnected
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Google Sheets</h3>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        Export leads and conversation data directly to your sheets for real-time reporting.
                    </p>
                    <button
                        onClick={() => window.location.href = '/api/auth/google?scope=sheets'}
                        className="w-full mt-6 py-2.5 rounded-xl text-sm font-black btn-primary shadow-lg">
                        Connect Sheets
                    </button>
                </div>

                {/* Zapier */}
                <div className={`soft-card p-6 border-2 transition-all ${isConnected('ZAPIER') ? 'border-emerald-500 bg-emerald-50/10' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                            <Zap size={24} />
                        </div>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-lg flex items-center gap-1">
                            <Check size={10} /> Functional
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Zapier</h3>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        Connect Grafty to 5000+ apps like HubSpot, Slack, and Salesforce via Webhooks.
                    </p>
                    <button
                        onClick={() => window.open('https://zapier.com/apps/grafty/integrations', '_blank')}
                        className="w-full mt-6 py-2.5 rounded-xl text-sm font-black btn-primary shadow-lg">
                        Explore Zaps
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
        </div >
    );
}

function Zap({ size, className }: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
    )
}
