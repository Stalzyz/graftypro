
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

    const brandName = branding?.name || "Grafty";
    const logoUrl = branding?.logo_url || "/grafty_brand.svg?v=5";
    const faviconUrl = branding?.favicon_url || logoUrl;

    return {
        title: {
            default: `${brandName} | Official WhatsApp Business Solution Provider (BSP)`,
            template: `%s | ${brandName}`
        },
        description: branding ? `Whitelabel BSP workspace for ${brandName}.` : "Enterprise WhatsApp Marketing Platform. Official Meta BSP infrastructure.",
        icons: {
            icon: [{ url: faviconUrl, type: 'image/svg+xml' }],
            shortcut: [faviconUrl],
            apple: [{ url: faviconUrl, type: 'image/svg+xml' }],
        },
        metadataBase: new URL(`https://${host}`),
        openGraph: {
            siteName: brandName,
            title: `${brandName} | WhatsApp Business Platform`,
            images: [{ url: '/og-image.png' }]
        }
    };
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const headerList = headers();
    const brandingStr = headerList.get("x-tenant-branding");
    let branding = null;
    if (brandingStr) {
        try {
            branding = JSON.parse(brandingStr);
        } catch (e) {}
    }

    return (
        <html lang="en">
            <head>
                <SchemaScripts />
                {/* Prevent dark-mode bleed from localStorage across all pages */}
                <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.remove('dark');` }} />
                
                {/* Meta Pixel Code */}
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
                {/* End Meta Pixel Code */}
            </head>
            <body className={`${inter.className} ${noto.variable}`}>
                <BrandProvider
                    brandName={branding?.name}
                    logoUrl={branding?.logo_url}
                    colors={branding ? { 
                        primary: branding.primary_color || "#27954D", 
                        secondary: branding.secondary_color || "#042F94" 
                    } : undefined}
                >
                    <Toaster position="top-right" />
                    {children}
                    {!branding && <WhatsAppWidget />}
                </BrandProvider>
            </body>
        </html>
    );
}

