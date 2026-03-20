
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

export async function generateMetadata() {
    const page = await getLandingPage("home");
    const seo = (page as any)?.seo_config || {};
    return {
        title: seo.title || "Grafty | WhatsApp Business Marketing & Automation Platform",
        description: seo.description || "The ultimate official WhatsApp Business API platform. Build flows, automate customer support, and scale retail sales on WhatsApp with Grafty.",
        openGraph: {
            title: seo.title || "Grafty | WhatsApp Business Marketing & Automation Platform",
            description: seo.description || "The ultimate official WhatsApp Business API platform.",
            images: [seo.og_image].filter(Boolean)
        }
    };
}

export default async function LandingPage() {
    headers(); // force dynamic
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
