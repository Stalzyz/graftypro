
export const dynamic = 'force-dynamic';
import React from "react";
import LandingNavbar from "../../components/landing-new/LandingNavbar";
import LandingFooter from "../../components/landing-new/LandingFooter";
import LandingBanner from "../../components/landing-new/LandingBanner";
import CMSRenderer from "../../components/landing-new/CMS_Renderer";
import "../../app/landing/new-grafty.css";
import { getLandingPage } from "../../lib/cms";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const page = await getLandingPage(params.slug);
    if (!page) return {};

    const seo = (page as any).seo_config || {};
    return {
        title: seo.title || page.title,
        description: seo.description,
        openGraph: {
            images: [seo.og_image].filter(Boolean)
        }
    };
}

export default async function DynamicLandingPage({ params }: { params: { slug: string } }) {
    const page = await getLandingPage(params.slug);

    if (!page) {
        notFound();
    }

    const sections = (page as any).sections || [];
    const bannerConfig = (page as any).banner_config;
    const customCSS = (page as any).custom_css;

    return (
        <main className="g-body">
            {customCSS && <style dangerouslySetInnerHTML={{ __html: customCSS }} />}
            {bannerConfig && <LandingBanner config={bannerConfig} />}
            <LandingNavbar />
            <CMSRenderer sections={sections} />
            <LandingFooter />
        </main>
    );
}
