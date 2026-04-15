
import type { Metadata } from "next";
import { Inter, Noto_Sans } from "next/font/google";
import { headers } from "next/headers";
import { BrandProvider } from "../components/branding/BrandProvider";
import { SchemaScripts } from "../components/seo/SchemaScripts";
import { WhatsAppWidget } from "../components/landing-new/WhatsAppWidget";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const noto = Noto_Sans({
    subsets: ["latin"],
    weight: ['400', '700', '900'],
    variable: '--font-noto'
});

export const dynamic = "force-dynamic";

// Helper to force HTTPS on absolute URLs (Prevents Mixed Content SSL issues)
const secureUrl = (url: string | null | undefined, host?: string) => {
    if (!url) return "";
    // Convert relative API paths to absolute URLs (needed for <link> tags)
    if (url.startsWith("/api/") || url.startsWith("/uploads/")) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${host || 'localhost:3000'}`;
        const base = appUrl.startsWith('http') ? appUrl : `https://${appUrl}`;
        return `${base.replace(/\/$/, '')}${url}`;
    }
    if (url.startsWith("http://")) return url.replace("http://", "https://");
    return url;
};

// Dynamic Metadata Generation for White-Labeling
export async function generateMetadata(): Promise<Metadata> {
    const headerList = headers();
    const host = headerList.get("x-request-host") || headerList.get("host") || "grafty.pro";
    const brandingStr = headerList.get("x-tenant-branding");
    
    let branding = null;
    if (brandingStr) {
        try {
            branding = JSON.parse(brandingStr);
        } catch (e) {}
    }

    const brandName = branding?.name || branding?.brand_name || "Grafty";
    const logoUrl = secureUrl(branding?.logo_url || "/grafty_brand.svg", host);
    const faviconUrl = secureUrl(branding?.favicon_url || "/grafty_icon.svg", host);
    const versionedFavicon = faviconUrl.includes('?') ? `${faviconUrl}&v=monster` : `${faviconUrl}?v=monster`;

    // Detect MIME type for favicon
    const getMimetype = (url: string) => {
        const u = url.toLowerCase();
        if (u.endsWith('.svg') || u.includes('svg')) return 'image/svg+xml';
        if (u.endsWith('.png')) return 'image/png';
        if (u.endsWith('.ico')) return 'image/x-icon';
        return 'image/png'; // Default fallback
    };

    const faviconType = getMimetype(faviconUrl);

    return {
        title: {
            default: `${brandName} | Official Bulk WhatsApp Messages & Automation Platform (BSP)`,
            template: `%s | ${brandName} · Bulk WhatsApp Messages`
        },
        description: branding ? `Whitelabel Bulk WhatsApp Messaging workspace for ${brandName}.` : "Official Meta BSP Infrastructure for Bulk WhatsApp Messages & Automation. Scale your business with 100% automated customer journeys and high-delivery bulk messaging.",
        keywords: [
            "WhatsApp Business API",
            "Bulk WhatsApp Marketing",
            "WhatsApp Automation Software",
            "WhatsApp CRM Integration",
            "WhatsApp Chatbot for Gyms",
            "WhatsApp Marketing for Agencies",
            "Official Meta BSP",
            "Conversational Commerce",
            "Grafty WhatsApp Platform"
        ],
        icons: {
            icon: [{ url: versionedFavicon, type: faviconType }],
            shortcut: [versionedFavicon],
            apple: [{ url: versionedFavicon, type: faviconType }],
        },
        metadataBase: new URL(`https://${host}`),
        openGraph: {
            siteName: brandName,
            title: `${brandName} | Enterprise WhatsApp Automation & ROI Engine`,
            description: "Scale your revenue with specialized WhatsApp blueprints for Real Estate, Education, Gyms, and E-commerce.",
            images: [{ url: branding?.logo_url || '/og-image.png' }],
            type: 'website'
        }
    };
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const headerList = headers();
    const host = headerList.get("x-request-host") || headerList.get("host") || "";
    const isGraftyDomain = host === "grafty.pro" || host === "www.grafty.pro";
    
    const brandingStr = headerList.get("x-tenant-branding");
    let branding = null;
    if (brandingStr) {
        try {
            branding = JSON.parse(brandingStr);
        } catch (e) {}
    }

    const brandName = branding?.name || branding?.brand_name || "Grafty";
    const rawLogoUrl = branding?.logo_url || "/grafty_brand.svg";
    const logoUrl = secureUrl(rawLogoUrl, host);
    
    // Minimal Grafty Icon as Data URI (Fail-safe fallback for null favicon)
    const GRAFTY_ICON_DATA = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDQ1MiAzNzciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIyNiAwIEMxMDEuMTcxIDAgMCAxMDEuMTcxIDAgMjI2IEMwIDM1MC44MjkgMTAxLjE3MSA0NTIgMjI2IDQ1MiBDMzUwLjgyOSA0NTIgNDUyIDM1MC44MjkgNDUyIDIyNiBDNDUyIDEwMS4xNzEgMzUwLjgyOSAwIDIyNiAwIFoiIGZpbGw9IiMyNzk1NEQiLz48L3N2ZyU+";
    
    const rawFaviconUrl = branding?.favicon_url ? secureUrl(branding.favicon_url, host) : null;
    const faviconUrl = rawFaviconUrl || GRAFTY_ICON_DATA;
    const versionedFavicon = faviconUrl.includes('data:') ? faviconUrl : (faviconUrl.includes('?') ? `${faviconUrl}&v=monster` : `${faviconUrl}?v=monster`);

    return (
        <html lang="en">
            <head>
                {/* Nuclear Fix: Force HTTPS for all assets and prevent Mixed Content warnings */}
                                <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />
                
                <SchemaScripts 
                    brandName={brandName} 
                    baseUrl={`https://${host}`} 
                    logoUrl={logoUrl} 
                />
                {/* Prevent dark-mode bleed from localStorage across all pages */}
                <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.remove('dark');` }} />
                
                {/* Meta Pixel Code - Only for Parent Domain */}
                {isGraftyDomain && (
                    <>
                        <script dangerouslySetInnerHTML={{ __html: `
                            !function(f,b,e,v,n,t,s)
                            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                            n.queue=[];t=b.createElement(e);t.async=!0;
                            t.src=v;s=b.getElementsByTagName(e)[0];
                            s.parentNode.insertBefore(t,s)}(window, document,'script',
                            'https://connect.facebook.net/en_US/fbevents.js');
                            fbq('init', '1428144328790099');
                            fbq('track', 'PageView');
                        ` }} />
                        <noscript>
                            <img height="1" width="1" style={{ display: 'none' }}
                                src="https://www.facebook.com/tr?id=1428144328790099&ev=PageView&noscript=1"
                            />
                        </noscript>
                    </>
                )}
                {/* End Meta Pixel Code */}
                
                {/* MONSTER FIX: Explicit Favicon Injection with HTTPS Force */}
                <link rel="icon" href={versionedFavicon} />
                <link rel="shortcut icon" href={versionedFavicon} />
                <link rel="apple-touch-icon" href={versionedFavicon} />
            </head>
            <body className={`${inter.className} ${noto.variable}`}>
                <BrandProvider
                    brandName={brandName}
                    logoUrl={logoUrl}
                    colors={branding ? { 
                        primary: branding.primary_color || "#27954D", 
                        secondary: branding.secondary_color || "#042F94" 
                    } : undefined}
                >
                    <Toaster position="top-right" />
                    {children}
                    <WhatsAppWidget branding={branding} />
                </BrandProvider>
            </body>
        </html>
    );
}

