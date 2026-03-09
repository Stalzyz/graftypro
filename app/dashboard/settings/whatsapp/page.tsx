"use client";
import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import {
    CheckCircle, AlertTriangle, MessageSquare, RefreshCw, Zap, Phone, Globe,
    ShieldCheck, Settings2, ArrowLeft, Activity, Camera, Edit2, X, Upload, Shield, Flame
} from "lucide-react";
import ManualIntegrationWizard from "@/components/whatsapp/ManualIntegrationWizard";

declare global {
    interface Window {
        // Facebook global removed for Hosted ES
    }
}

export default function WhatsAppSettingsPage() {
    const [status, setStatus] = useState("LOADING");
    const [loading, setLoading] = useState(false);
    const [wabaDetails, setWabaDetails] = useState<any>(null);
    const [showManualWizard, setShowManualWizard] = useState(false);
    const [workspaceId, setWorkspaceId] = useState("");

    // Edit Modal State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        connection_name: "",
        access_token: "******",
        waba_id: "",
        phone_number_id: "",
        app_id: "",
        app_secret: "******"
    });

    // Picture upload state
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingPic, setUploadingPic] = useState(false);

    const [publicConfig, setPublicConfig] = useState<any>(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const wabaIdParam = urlParams.get('setup_target_id') || urlParams.get('waba_id');
        const codeParam = urlParams.get('code');

        if (codeParam) {
            // New v20.0 OAuth Flow returns code
            window.history.replaceState({}, document.title, window.location.pathname);
            onboardAccount(codeParam);
        } else if (wabaIdParam) {
            // Clean URL so it doesn't re-trigger
            window.history.replaceState({}, document.title, window.location.pathname);
            claimAccount(wabaIdParam);
        } else if (urlParams.get('state')) {
            // If they returned from Meta without IDs but with state, we can attempt a blind claim
            window.history.replaceState({}, document.title, window.location.pathname);
            claimAccount();
        }

        fetchStatus();
        fetchPublicConfig();
    }, []);

    const claimAccount = async (wabaId?: string) => {
        setLoading(true);
        setStatus("LOADING");
        try {
            // Add a slight delay to allow the webhook to finish if it's racing
            await new Promise(r => setTimeout(r, 2000));

            const res = await fetch("/api/whatsapp/claim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ waba_id: wabaId })
            });

            if (res.ok) {
                alert("Account Connected Successfully!");
            } else {
                const data = await res.json().catch(() => ({}));
                console.error("Claim failed:", data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            fetchStatus();
        }
    };

    const onboardAccount = async (code: string) => {
        setLoading(true);
        setStatus("LOADING");
        try {
            const res = await fetch("/api/whatsapp/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code })
            });

            if (res.ok) {
                alert("Account Connected Successfully!");
            } else {
                const data = await res.json().catch(() => ({}));
                console.error("Onboarding failed:", data);
                alert("Meta Error: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error(error);
            alert("Connection error occurred.");
        } finally {
            fetchStatus();
            setLoading(false);
        }
    };

    const fetchPublicConfig = async () => {
        try {
            const res = await fetch("/api/config/public");
            const data = await res.json();
            if (data.success) {
                setPublicConfig(data);
            }
        } catch (e) {
            console.error("Failed to fetch public config", e);
        }
    };

    const fetchStatus = async () => {
        try {
            const res = await fetch("/api/whatsapp/status");
            const data = await res.json();
            if (data.workspaceId) setWorkspaceId(data.workspaceId);

            if (data.status === 'CONNECTED') {
                setStatus("CONNECTED");
                setWabaDetails(data.account);
                setEditForm({
                    connection_name: data.account.connection_name || "WhatsApp Channel",
                    access_token: "******",
                    waba_id: data.account.waba_id,
                    phone_number_id: data.account.phone_number_id,
                    app_id: data.account.app_id || "",
                    app_secret: "******"
                });
            } else {
                setStatus("DISCONNECTED");
            }
        } catch (e) {
            setStatus("DISCONNECTED");
        }
    };

    const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("Image too large. Maximum size is 2MB.");
            return;
        }

        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            alert("Invalid image format. Use JPG, PNG, or WEBP.");
            return;
        }

        setUploadingPic(true);
        const data = new FormData();
        data.append("file", file);

        try {
            const res = await fetch("/api/whatsapp/profile/upload", {
                method: "POST",
                body: data
            });
            const result = await res.json();
            if (res.ok) {
                alert("Profile Updated Successfully");
                fetchStatus();
            } else {
                alert("Meta Error: " + result.error);
            }
        } catch (err) {
            alert("Connection error occurred.");
        } finally {
            setUploadingPic(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSaveEdit = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/whatsapp/edit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm)
            });
            const data = await res.json();
            if (res.ok) {
                alert("Connection Updated Successfully");
                setIsEditing(false);
                fetchStatus();
            } else {
                alert(data.error || "Failed to update connection");
            }
        } catch (e) {
            alert("Network error.");
        } finally {
            setLoading(false);
        }
    };

    const launchWhatsAppSignup = () => {
        const appId = publicConfig?.meta_app_id || process.env.NEXT_PUBLIC_META_APP_ID;
        const configId = publicConfig?.meta_config_id || process.env.NEXT_PUBLIC_META_CONFIG_ID;

        if (!appId || !configId || !workspaceId) {
            alert("Meta Configuration Missing. Please contact support or set it in the Admin panel.");
            return;
        }

        setLoading(true);

        const redirectUri = `${window.location.origin}/dashboard/settings/whatsapp`;
        // Navigate users to the Hosted ES flow. We pass the workspaceId as the state
        // so we can associate the `account_update` webhook with this specific workspace.
        const metaUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}&config_id=${configId}&state=${workspaceId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&override_default_response_type=true`;

        // Open in new tab or same tab. Since it's an OAuth flow, same-tab or popup is standard.
        // A popup ensures they return to this page naturally, but for maximum compatibility we'll use a new tab or let them redirect.
        window.location.href = metaUrl;
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
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in mb-20">

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
                    <div className="bg-gradient-to-br from-[#27954D]/5 to-white border border-[#27954D]/10 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-8 z-10">
                            {/* Profile Image with Upload Trigger */}
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-32 h-32 bg-white border border-slate-100 rounded-full flex items-center justify-center text-[#27954D] shadow-xl shadow-green-100/20 overflow-hidden relative">
                                    {wabaDetails.profile_picture_url ? (
                                        <img src={wabaDetails.profile_picture_url} className="w-full h-full object-cover" alt="WABA" />
                                    ) : (
                                        <Phone size={48} strokeWidth={1} />
                                    )}
                                    {uploadingPic && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                            <RefreshCw className="w-8 h-8 animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-1 right-1 bg-white border border-slate-100 p-2.5 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                                    <Camera size={18} className="p-0.5" />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handlePictureUpload}
                                />
                            </div>

                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">{wabaDetails.display_name}</h2>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-[#27954D] transition-all"
                                        title="Edit Display Name"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                </div>
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
                        <div className="flex flex-col items-end gap-3 z-10">
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

                    <div className="pt-8 text-center border-t border-slate-100">
                        <button
                            onClick={async () => {
                                if (confirm("⚠️ NUCLEAR WARNING: Are you sure you want to disconnect? This will server ALL Meta connections immediately.")) {
                                    try {
                                        setLoading(true);
                                        const res = await fetch("/api/whatsapp/disconnect", { method: "DELETE" });
                                        if (res.ok) {
                                            alert("Meta Connection successfully purged.");
                                            setStatus("DISCONNECTED");
                                            setWabaDetails(null);
                                        } else {
                                            const data = await res.json().catch(() => ({}));
                                            alert("Failed to disconnect: " + (data.error || res.statusText));
                                        }
                                    } catch (e) {
                                        alert("Network Error during disconnect.");
                                    } finally {
                                        setLoading(false);
                                    }
                                }
                            }}
                            disabled={loading}
                            className={`text-red-600 font-black uppercase tracking-[0.2em] text-[10px] transition-all bg-red-50 px-6 py-3 rounded-xl border border-red-100 ${loading ? "opacity-50" : "hover:bg-red-100 active:scale-95"}`}
                        >
                            {loading ? "Deactivating..." : "Deactivate Integration (Nuclear)"}
                        </button>
                    </div>

                    {/* EDIT MODAL */}
                    {isEditing && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-10 pb-6 bg-slate-50/50 border-b border-slate-100/50 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">Connection Settings</h2>
                                        <p className="text-sm text-slate-400 mt-1">Update your Meta credentials</p>
                                    </div>
                                    <button onClick={() => setIsEditing(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white text-slate-400 transition-colors shadow-sm"><X size={20} /></button>
                                </div>
                                <div className="p-10 pt-8 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Friendly Name</label>
                                        <input
                                            value={editForm.connection_name}
                                            onChange={(e) => setEditForm({ ...editForm, connection_name: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-green-50 outline-none transition-all"
                                            placeholder="e.g. Primary Support"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta App ID</label>
                                        <input
                                            value={editForm.app_id}
                                            onChange={(e) => setEditForm({ ...editForm, app_id: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-green-50 outline-none transition-all font-mono"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WABA ID</label>
                                            <input
                                                value={editForm.waba_id}
                                                onChange={(e) => setEditForm({ ...editForm, waba_id: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold focus:ring-4 focus:ring-green-50 outline-none transition-all font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone ID</label>
                                            <input
                                                value={editForm.phone_number_id}
                                                onChange={(e) => setEditForm({ ...editForm, phone_number_id: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold focus:ring-4 focus:ring-green-50 outline-none transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={loading}
                                        className="w-full py-5 bg-[#27954D] text-white font-black rounded-[2rem] shadow-xl shadow-green-100/50 hover:scale-[1.02] active:scale-95 transition-all text-sm mt-4 uppercase tracking-widest disabled:opacity-50"
                                    >
                                        {loading ? "Updating..." : "Save Configuration"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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
                        Connect your official Business API to start configuring your flow builder, inbox, and drips.
                    </p>
                    <div className="flex flex-col gap-4 w-full max-w-sm">
                        <button
                            onClick={launchWhatsAppSignup}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-5 text-white font-bold text-sm bg-gradient-to-br from-[#27954D] to-[#218141] hover:scale-105 active:scale-95 border-b-4 border-[#165a2d] rounded-2xl transition-all shadow-xl shadow-green-100 disabled:opacity-50"
                        >
                            <Zap size={18} /> {loading ? "Connecting..." : "Connect Official Account"}
                        </button>
                        <button
                            onClick={() => setShowManualWizard(true)}
                            className="w-full py-4 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest transition-all"
                        >
                            Manual Credentials Entry
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailRow({ label, value, isMono = false }: { label: string; value: string; isMono?: boolean }) {
    return (
        <div className="space-y-1.5 flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1">{label}</span>
            <div className={`p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 text-xs font-bold text-slate-700 ${isMono ? 'font-mono' : ''} truncate`}>
                {value}
            </div>
        </div>
    );
}

function CapabilityItem({ label, active }: { label: string; active?: boolean }) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100/50 rounded-2xl">
            <span className="text-xs font-bold text-slate-700">{label}</span>
            {active ? (
                <div className="flex items-center gap-2 text-[10px] font-black text-green-600 bg-green-100/50 px-3 py-1 rounded-lg uppercase tracking-wider">
                    <CheckCircle size={12} /> Active
                </div>
            ) : (
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 bg-slate-100 px-3 py-1 rounded-lg uppercase tracking-wider">
                    Locked
                </div>
            )}
        </div>
    );
}
