import type { Metadata } from "next";
import { Inter, Noto_Sans } from "next/font/google";
import "./globals.css";
import { FacebookSDK } from "../components/facebook-sdk";

const inter = Inter({ subsets: ["latin"] });
const noto = Noto_Sans({
    subsets: ["latin"],
    weight: ['400', '700', '900'],
    variable: '--font-noto'
});

export const metadata: Metadata = {
    title: "Grafty | WhatsApp Marketing Platform",
    description: "The next generation of WhatsApp automation and business growth.",
    icons: {
        icon: "/grafty_fav.png",
    }
};

import { BrandProvider } from "../components/branding/BrandProvider";
import { SystemConfigService } from "../lib/services/system-config-service";

async function getBranding() {
    try {
        return await SystemConfigService.getPublicConfig();
    } catch (e) {
        return null;
    }
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const branding = await getBranding();

    return (
        <html lang="en">
            <head>
                {/* Prevent dark-mode bleed from localStorage across all pages */}
                <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.remove('dark');` }} />
            </head>
            <body className={`${inter.className} ${noto.variable}`}>
                <BrandProvider
                    colors={branding ? { primary: branding.primary_color || "#27954D", secondary: branding.secondary_color || "#042F94" } : undefined}
                >
                    <FacebookSDK />
                    {children}
                </BrandProvider>
            </body>
        </html>
    );
}
