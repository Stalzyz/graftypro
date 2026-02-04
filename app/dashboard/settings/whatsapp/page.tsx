"use client";

import { useState, useEffect } from "react";
import Script from "next/script";

// Declare global FB object
declare global {
    interface Window {
        FB: any;
        fbAsyncInit: () => void;
    }
}

export default function WhatsAppSettingsPage() {
    const [status, setStatus] = useState("DISCONNECTED");
    const [loading, setLoading] = useState(false);

    // 1. Initialize Facebook SDK
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

    // 2. Launch Embedded Signup
    const launchWhatsAppSignup = () => {
        setLoading(true);

        // Log in with Facebook
        window.FB.login(function (response: any) {
            if (response.authResponse) {
                const code = response.authResponse.code;
                // Send code to backend
                exchangeCode(code);
            } else {
                console.log('User cancelled login or did not fully authorize.');
                setLoading(false);
            }
        }, {
            config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID,
            response_type: 'code',
            override_default_response_type: true,
            extras: {
                setup: {
                    // Prefill data if needed
                }
            }
        });
    };

    const exchangeCode = async (code: string) => {
        try {
            const res = await fetch("/api/whatsapp/onboard", {
                method: "POST",
                body: JSON.stringify({ code }),
                headers: { "Content-Type": "application/json" } // Add Auth Token in real app
            });

            if (res.ok) {
                setStatus("CONNECTED");
                alert("WhatsApp Connected Successfully!");
            } else {
                alert("Failed to connect.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <Script
                src="https://connect.facebook.net/en_US/sdk.js"
                onLoad={initFacebook}
            />

            <div>
                <h1 className="text-2xl font-bold text-gray-900">WhatsApp Connection</h1>
                <p className="text-gray-500">Connect your business number to start messaging.</p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
                {status === "CONNECTED" ? (
                    <div className="space-y-4">
                        <div className="bg-green-100 text-green-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl">
                            ✅
                        </div>
                        <h3 className="text-xl font-semibold">Your Number is Connected</h3>
                        <p className="text-gray-500">You are ready to send campaigns.</p>
                        <button className="text-red-600 font-medium hover:underline text-sm">
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                            {/* WhatsApp Logo Placeholder */}
                            <span className="text-4xl">📞</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Connect with Facebook</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                We use the official Meta Embedded Signup flow. It's secure and instant.
                            </p>
                        </div>
                        <button
                            onClick={launchWhatsAppSignup}
                            disabled={loading}
                            className="bg-[#1877F2] text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                        >
                            {loading ? "Connecting..." : "Log in with Facebook"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
