
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import React from "react";
import LandingNavbar from "../components/landing-new/LandingNavbar";
import LandingFooter from "../components/landing-new/LandingFooter";
import LandingBanner from "../components/landing-new/LandingBanner";
import CMSRenderer from "../components/landing-new/CMS_Renderer";
import "./landing/new-grafty.css";
import { getLandingPage } from "../lib/cms";
import StaticLandingPage from "./landing-static/page";
import { headers } from "next/headers";
import { getTenantBranding, isWhiteLabeled } from "../lib/tenant/context";

export async function generateMetadata() {
    const page = await getLandingPage("home");
    const isWhitelabel = isWhiteLabeled();
    const branding = getTenantBranding();

    const brandName = isWhitelabel && branding ? (branding as any).brand_name : "Grafty";
    const defaultTitle = `${brandName} - WhatsApp Bulk Messages & Automation`;
    const defaultDesc = `Send bulk WhatsApp messages, automate flows, and scale your business with ${brandName}. High delivery rates & no-code flow builder.`;

    const seo = (page as any)?.seo_config || {};
    return {
        title: seo.title || defaultTitle,
        description: seo.description || defaultDesc,
        openGraph: {
            title: seo.title || defaultTitle,
            description: seo.description || defaultDesc,
            images: [seo.og_image || (isWhitelabel && branding ? (branding as any).logo_url : null)].filter(Boolean)
        },
        alternates: {
            canonical: seo.canonical || '/',
        }
    };
}

export default async function LandingPage() {
    headers(); // force dynamic
    
    // 1. Check for Whitelabel Branding
    const isWhitelabel = isWhiteLabeled();
    const branding = getTenantBranding();

    if (isWhitelabel && branding) {
        const type = (branding as any).home_page_type || "DEFAULT";
        
        // Tier 3: Custom HTML
        if (type === "CUSTOM" && (branding as any).custom_home_html) {
            return (
                <main dangerouslySetInnerHTML={{ __html: (branding as any).custom_home_html }} />
            );
        }

        // Tier 1: Branded Default
        // We pass the branding to the static landing page
        if (type === "DEFAULT") {
            return <StaticLandingPage branding={branding} />;
        }
    }

    // 2. Main App: CMS Logic
    const page = await getLandingPage("home");
    const sections = (page as any)?.sections || [];
    const bannerConfig = (page as any)?.banner_config;
    const customCSS = (page as any)?.custom_css;

    // If CMS has content, use it
    if (sections.length > 0) {
        return (
            <main className="g-body">
                {customCSS && <style dangerouslySetInnerHTML={{ __html: customCSS }} />}
                <LandingBanner config={bannerConfig} />
                <LandingNavbar />
                <CMSRenderer sections={sections} />
                <LandingFooter />
            </main>
        );
    }

    // Fallback: static premium landing page
    return <StaticLandingPage />;
}
