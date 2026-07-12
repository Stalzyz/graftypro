"use client";

import { Calendar, Check, Mail, Globe, Settings as SettingsIcon, AlertCircle, ShoppingBag, Video, Loader2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

export default function IntegrationsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-20">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        }>
            <IntegrationsContent />
        </Suspense>
    );
}

function IntegrationsContent() {
    const [integrations, setIntegrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [manualLink, setManualLink] = useState("");
    const [savingLink, setSavingLink] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchInitialData = async () => {
            const status = searchParams.get("status");
            if (status === "integration_success") {
                toast.success("Google Calendar connected successfully! 🗓️");
                window.history.replaceState({}, '', window.location.pathname);
            }

            // Fetch Integrations
            const intRes = await fetch("/api/settings/integrations");
            const intData = await intRes.json();
            setIntegrations(intData.data || []);

            // Fetch Manual Link
            const mlRes = await fetch("/api/settings/workspace/meet-link");
            const mlData = await mlRes.json();
            if (mlData.success) setManualLink(mlData.link || "");

            setLoading(false);
        };

        fetchInitialData();
    }, [searchParams]);

    const handleSaveManualLink = async () => {
        setSavingLink(true);
        try {
            const res = await fetch("/api/settings/workspace/meet-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ link: manualLink })
            });
            if (res.ok) {
                toast.success("Manual meeting link saved!");
            } else {
                toast.error("Failed to save link");
            }
        } catch (e) {
            toast.error("Error saving link");
        } finally {
            setSavingLink(false);
        }
    };

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
                        onClick={() => window.location.href = `/api/auth/google?scope=calendar&integration=true`}
                        className={`w-full mt-6 py-2.5 rounded-xl text-sm font-black transition-all ${isConnected('GOOGLE_CALENDAR')
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'btn-primary shadow-lg shadow-emerald-100'
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
                        onClick={() => window.location.href = '/api/auth/google?scope=sheets&integration=true'}
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

            {/* Manual Meeting Link Fallback */}
            <div className="soft-card p-8 border-2 border-gray-100 bg-white shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Video size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-800 tracking-tight">Personal Meeting Room</h3>
                        <p className="text-sm text-gray-500 font-medium">Set a permanent fallback link (Meet, Zoom, or Jitsi) for your workspace.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="https://meet.google.com/your-personal-id"
                            value={manualLink}
                            onChange={(e) => setManualLink(e.target.value)}
                            className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-gray-700 outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={handleSaveManualLink}
                        disabled={savingLink}
                        className="bg-indigo-600 hover:bg-black text-white px-8 py-3 rounded-xl text-sm font-black transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 whitespace-nowrap"
                    >
                        {savingLink ? "Saving..." : "Save Link"}
                    </button>
                </div>

                <div className="mt-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                    <p className="text-[11px] text-indigo-900 leading-relaxed font-semibold">
                        💡 <span className="text-indigo-700">Pro Tip:</span> If you don't connect Google Calendar using the card above, we will use this link for every "Start Video Meet" request in the Live Chat.
                    </p>
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
