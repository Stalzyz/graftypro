import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import PricingPageContent from "./PricingPageContent";

export const metadata: Metadata = {
    title: "Pricing & Economics | Grafty WhatsApp BSP",
    description: "Transparent operational economics for enterprise WhatsApp automation. Credits, conversation categories, and global WhatsApp API pricing.",
    openGraph: {
        title: "Pricing & Economics | Grafty WhatsApp BSP",
        description: "Transparent operational economics for enterprise WhatsApp automation."
    }
};

export default function PricingPage() {
    return <PricingPageContent />;
}
