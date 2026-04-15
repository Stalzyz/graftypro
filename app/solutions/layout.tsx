import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Vertical Automation Blueprints | Industry-Specific WhatsApp Solutions",
    description: "Scale your revenue with specialized WhatsApp automation for Gyms, Saloons, Real Estate, Education, and Restaurants. Proven scaling logic for high-growth sectors.",
    keywords: [
        "WhatsApp for Real Estate",
        "Gym admission automation",
        "Saloon booking bot",
        "Education lead qualification",
        "Restaurant direct ordering",
        "WhatsApp ROI strategies"
    ],
};

export default function SolutionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
