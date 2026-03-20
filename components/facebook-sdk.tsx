"use client";

import Script from "next/script";
import { useEffect } from "react";

// Extend Window interface for FB
declare global {
    interface Window {
        FB: any;
        fbAsyncInit: () => void;
        checkLoginState: () => void;
    }
}

export function FacebookSDK() {
    const APP_ID = process.env.NEXT_PUBLIC_META_APP_ID;

    if (!APP_ID) return null; // Don't load if no App ID

    return (
        <>
            <div id="fb-root" className="hidden" />

            {/* Initialize function must be defined BEFORE the SDK script is even fetched */}
            <Script id="facebook-init" strategy="beforeInteractive">
                {`
                    window.fbAsyncInit = function() {
                        FB.init({
                            appId      : '${APP_ID}',
                            cookie     : true,
                            xfbml      : false,
                            version    : 'v20.0'
                        });
                        FB.AppEvents.logPageView();
                    };

                    window.checkLoginState = function() {
                        FB.getLoginStatus(function(response) {
                            if (response.status === 'connected') {
                                const event = new CustomEvent('facebook-login-success', { detail: response });
                                window.dispatchEvent(event);
                            }
                        });
                    }
                `}
            </Script>

            {/* Load the SDK with afterInteractive strategy to ensure dependencies are resolved */}
            <Script
                id="facebook-jssdk"
                src="https://connect.facebook.net/en_US/sdk.js"
                strategy="afterInteractive"
            />
        </>
    );
}

interface FacebookLoginButtonProps {
    configId: string;
    onLogin?: (response: any) => void;
    className?: string;
}

export function FacebookLoginButton({ configId, onLogin, className = "" }: FacebookLoginButtonProps) {
    useEffect(() => {
        if (typeof window !== 'undefined' && onLogin) {
            const handleLogin = (e: any) => {
                onLogin(e.detail);
            };
            window.addEventListener('facebook-login-success', handleLogin);

            // Re-parse XFBML to render button if added dynamically
            if (window.FB) {
                window.FB.XFBML.parse();
            }

            return () => {
                window.removeEventListener('facebook-login-success', handleLogin);
            };
        }
    }, [onLogin]);

    return (
        <div className={className}>
            <div
                className="fb-login-button"
                data-config_id={configId}
                data-width=""
                data-size="large"
                data-button-type="continue_with"
                data-layout=""
                data-auto-logout-link="false"
                data-use-continue-as="false"
                data-onlogin="checkLoginState();">
            </div>
        </div>
    );
}
