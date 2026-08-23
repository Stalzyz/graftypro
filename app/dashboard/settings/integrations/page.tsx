"use client";

import { Calendar, Check, Mail, Globe, Settings as SettingsIcon, AlertCircle, ShoppingBag, Video, Loader2, Instagram, X } from "lucide-react";
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

    // Instagram Integration State
    const [showIgModal, setShowIgModal] = useState(false);
    const [showIgGuide, setShowIgGuide] = useState(false);
    const [igPageId, setIgPageId] = useState("");
    const [igAccessToken, setIgAccessToken] = useState("");
    const [savingIg, setSavingIg] = useState(false);

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
            const fetched = intData.data || [];
            setIntegrations(fetched);

            const ig = fetched.find((i: any) => i.type === 'INSTAGRAM');
            if (ig?.credentials) {
                setIgPageId(ig.credentials.page_id || "");
                setIgAccessToken(ig.credentials.access_token || "");
            }

            // Fetch Manual Link
            const mlRes = await fetch("/api/settings/workspace/meet-link");
            const mlData = await mlRes.json();
            if (mlData.success) setManualLink(mlData.link || "");

            setLoading(false);
        };

        fetchInitialData();
    }, [searchParams]);

    const handleSaveIgCredentials = async () => {
        if (!igPageId.trim() || !igAccessToken.trim()) {
            toast.error("Please enter both Instagram Page ID and Access Token");
            return;
        }
        setSavingIg(true);
        try {
            const res = await fetch("/api/settings/integrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "INSTAGRAM",
                    credentials: {
                        page_id: igPageId.trim(),
                        access_token: igAccessToken.trim(),
                    }
                })
            });
            if (res.ok) {
                toast.success("Instagram Messaging Integration connected! 📸");
                setShowIgModal(false);
                const updated = await (await fetch("/api/settings/integrations")).json();
                setIntegrations(updated.data || []);
            } else {
                toast.error("Failed to save Instagram credentials");
            }
        } catch (e) {
            toast.error("Network error saving Instagram settings");
        } finally {
            setSavingIg(false);
        }
    };

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
                <p className="text-gray-500 text-sm text-center mt-1">Supercharge your WhatsApp & Instagram flows with 1-click integrations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Instagram Direct Messaging & Meta Ads */}
                <div className={`soft-card p-6 border-2 transition-all ${isConnected('INSTAGRAM') ? 'border-pink-500 bg-pink-50/10' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white rounded-xl flex items-center justify-center shadow-md">
                            <Instagram size={24} />
                        </div>
                        {isConnected('INSTAGRAM') ? (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-lg flex items-center gap-1">
                                <Check size={10} /> Active
                            </span>
                        ) : (
                            <span className="px-2 py-1 bg-pink-100 text-pink-700 text-[10px] font-black uppercase rounded-lg">
                                Available
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Instagram & Meta DMs</h3>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        Automate Instagram DMs, Story Mentions, Reel Comment-to-DM replies, and Meta Ads leads.
                    </p>
                    <button
                        onClick={() => setShowIgModal(true)}
                        className="w-full mt-6 py-2.5 rounded-xl text-sm font-black bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 text-white shadow-lg hover:opacity-95 transition-all">
                        {isConnected('INSTAGRAM') ? 'Manage Instagram' : 'Connect Instagram'}
                    </button>
                </div>

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

            {/* Modal for Instagram Integration Setup */}
            {showIgModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 space-y-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white rounded-xl flex items-center justify-center shadow-md">
                                    <Instagram size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Instagram Messaging Setup</h3>
                                    <p className="text-xs text-gray-500">Connect your Instagram Professional Account</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowIgModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1.5 ml-1">Instagram Business Page / Account ID</label>
                                <input
                                    type="text"
                                    value={igPageId}
                                    onChange={(e) => setIgPageId(e.target.value)}
                                    placeholder="e.g. 178414000000000"
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm font-mono font-bold text-gray-800 outline-none focus:ring-4 focus:ring-rose-100 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1.5 ml-1">Meta System User Access Token</label>
                                <input
                                    type="password"
                                    value={igAccessToken}
                                    onChange={(e) => setIgAccessToken(e.target.value)}
                                    placeholder="EAAG..."
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm font-mono font-bold text-gray-800 outline-none focus:ring-4 focus:ring-rose-100 transition-all"
                                />
                            </div>

                            <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                                        <span>🌐 Meta Webhook Configuration</span>
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => setShowIgGuide(true)}
                                        className="text-[11px] font-extrabold text-purple-700 hover:text-purple-900 bg-white hover:bg-purple-100 px-3 py-1 rounded-lg border border-purple-200 shadow-sm transition-all flex items-center gap-1">
                                        📖 Step-by-Step Guide
                                    </button>
                                </div>
                                <div className="text-[11px] text-purple-800 font-mono space-y-1">
                                    <div><span className="font-bold">Callback URL:</span> https://grafty.pro/api/webhooks/instagram</div>
                                    <div><span className="font-bold">Verify Token:</span> grafty_webhook_verify</div>
                                    <div><span className="font-bold">Subscribed Fields:</span> messages, instagram_story_mentions, comments</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <button
                                type="button"
                                onClick={() => setShowIgGuide(true)}
                                className="text-xs font-bold text-rose-600 hover:text-rose-800 underline">
                                Need help getting Meta Token & Page ID?
                            </button>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowIgModal(false)}
                                    className="px-5 py-2.5 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-100 transition-all">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveIgCredentials}
                                    disabled={savingIg}
                                    className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 text-white shadow-lg hover:opacity-95 transition-all">
                                    {savingIg ? 'Saving...' : 'Save & Connect Instagram'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Detailed Step-by-Step Meta Integration Guide */}
            {showIgGuide && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 space-y-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between sticky top-0 bg-white pb-3 border-b border-gray-100 z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 via-rose-500 to-amber-500 text-white rounded-xl flex items-center justify-center shadow-md">
                                    <Instagram size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Step-by-Step Meta & Instagram Guide</h3>
                                    <p className="text-xs text-gray-500 font-medium">Complete setup instructions for Meta Developer App & Webhooks</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowIgGuide(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all">
                                <X size={22} />
                            </button>
                        </div>

                        {/* Step 1 */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-black flex items-center justify-center">1</span>
                                <h4 className="text-sm font-black text-gray-800">Convert Instagram to Professional Account</h4>
                            </div>
                            <div className="pl-8 text-xs text-gray-600 space-y-1.5 font-medium leading-relaxed">
                                <p>1. Open the Instagram app on your smartphone &gt; Go to your profile &gt; Tap menu ☰ &gt; <strong>Settings and activity</strong>.</p>
                                <p>2. Tap <strong>Account type and tools</strong> &gt; <strong>Switch to professional account</strong> &gt; Select <strong>Business</strong>.</p>
                                <p>3. Go to <strong>Settings</strong> &gt; <strong>Messages and story replies</strong> &gt; <strong>Message controls</strong>.</p>
                                <p>4. Toggle <strong>Allow access to messages</strong> to <strong>ON</strong> (Mandatory for Meta API access).</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="space-y-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">2</span>
                                <h4 className="text-sm font-black text-gray-800">Link Instagram to Your Facebook Business Page</h4>
                            </div>
                            <div className="pl-8 text-xs text-gray-600 space-y-1.5 font-medium leading-relaxed">
                                <p>1. Open your Facebook Business Page (e.g. Grekam Academy).</p>
                                <p>2. Click <strong>Settings</strong> &gt; <strong>Linked Accounts</strong> &gt; Select <strong>Instagram</strong>.</p>
                                <p>3. Click <strong>Connect Account</strong> and log in with your Instagram Business credentials to authorize the link.</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="space-y-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">3</span>
                                <h4 className="text-sm font-black text-gray-800">Generate Permanent Meta Token & Copy Page ID</h4>
                            </div>
                            <div className="pl-8 text-xs text-gray-600 space-y-2 font-medium leading-relaxed">
                                <p>1. Go to <a href="https://business.facebook.com/settings" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold">Meta Business Manager Settings</a> &gt; <strong>Users</strong> &gt; <strong>System Users</strong>.</p>
                                <p>2. Click <strong>Add System User</strong> (Name: Grafty Automation, Role: Admin).</p>
                                <p>3. Click <strong>Add Assets</strong> &gt; Select your Facebook Page & Instagram Account &gt; Toggle <strong>Full Control</strong>.</p>
                                <p>4. Click <strong>Generate New Token</strong> &gt; Select your Meta App and check the following permissions:</p>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 font-mono text-[11px] text-gray-700 space-y-1">
                                    <div>✔ instagram_basic</div>
                                    <div>✔ instagram_manage_messages</div>
                                    <div>✔ pages_show_list</div>
                                    <div>✔ pages_read_engagement</div>
                                    <div>✔ pages_messaging</div>
                                </div>
                                <p>5. Copy the generated permanent token starting with <code>EAAG...</code> and paste it into Grafty.</p>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="space-y-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center">4</span>
                                <h4 className="text-sm font-black text-gray-800">Configure Meta Webhooks in Developer Console</h4>
                            </div>
                            <div className="pl-8 text-xs text-gray-600 space-y-2 font-medium leading-relaxed">
                                <p>1. Go to <a href="https://developers.facebook.com/" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold">Meta Developer Console</a> &gt; Select your App &gt; <strong>Webhooks</strong>.</p>
                                <p>2. Select <strong>Instagram</strong> from the dropdown and click <strong>Subscribe to this object</strong>.</p>
                                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 font-mono text-[11px] text-emerald-900 space-y-1">
                                    <div><strong>Callback URL:</strong> https://grafty.pro/api/webhooks/instagram</div>
                                    <div><strong>Verify Token:</strong> grafty_webhook_verify</div>
                                </div>
                                <p>3. Under Subscriptions, click <strong>Subscribe</strong> for:</p>
                                <div className="flex gap-2 text-[10px] font-mono font-bold">
                                    <span className="px-2 py-1 bg-gray-100 rounded-md">messages</span>
                                    <span className="px-2 py-1 bg-gray-100 rounded-md">instagram_story_mentions</span>
                                    <span className="px-2 py-1 bg-gray-100 rounded-md">comments</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setShowIgGuide(false)}
                                className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-black transition-all">
                                Got It! Close Guide
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
