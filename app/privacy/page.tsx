"use client";
import React from "react";
import "../landing/new-grafty.css";
import LandingNavbar from "../../components/landing-new/LandingNavbar";
import LandingFooter from "../../components/landing-new/LandingFooter";
import { useBranding } from "../../hooks/use-branding";

export default function PrivacyPage() {
    const { branding } = useBranding();
    const brandName = branding?.brand_name || "Platform";
    const supportEmail = branding?.support?.email || "support@portal.io";

    return (
        <main className="g-body">
            <LandingNavbar />
            <section className="pt-40 pb-40 section-white">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="g-h1 mb-20">Privacy <span className="text-gradient">Protocol.</span></h1>
                    <p className="g-p mb-12 text-slate-500 italic">Last Updated: February 22, 2026</p>

                    <div className="space-y-16">
                        <PrivacySection
                            title="1. Information We Collect"
                            content="We collect information necessary to provide our WhatsApp automation services. This includes business contact details, registration data (including GSTIN), and data transmitted via the Meta WhatsApp Cloud API. We also collect usage data, IP addresses, and browser information for security and analytics purposes."
                        />
                        <PrivacySection
                            title="2. How We Use Your Data"
                            content="Your data is used to orchestrate messaging flows, process broadcasts, manage billing, and improve platform performance. We process message content only as required to route it through the WhatsApp API. We do not sell your personal or business data to third parties."
                        />
                        <PrivacySection
                            title="3. Meta Cloud API Data Handling"
                            content={`${brandName} acts as a data processor for the data you send and receive via the WhatsApp Cloud API. This data is subject to Meta's Privacy Policy. We ensure that API tokens and sensitive credentials are encrypted and stored securely within our infrastructure.`}
                        />
                        <PrivacySection
                            title="4. Data Retention & Security"
                            content="We retain your data for as long as your account is active or as needed to provide services. Message logs may be purged periodically according to our retention settings (defaulting to 30 days). We implement industry-standard security measures, including SSL encryption and secure server environments, to protect your data."
                        />
                        <PrivacySection
                            title="5. Third-Party Sharing"
                            content="We share data with third-party providers only when necessary for service delivery, such as Meta (for WhatsApp Cloud API) and Razorpay (for payment processing). These providers have their own privacy policies and are prohibited from using your data for other purposes."
                        />
                        <PrivacySection
                            title="6. Data Subject Rights"
                            content="Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data. You can manage most of your data through the Dashboard. For specific data deletion requests, please contact our support team."
                        />
                        <PrivacySection
                            title="7. Cookies"
                            content="We use cookies to maintain your session and remember your preferences. You can disable cookies in your browser settings, but it may affect the functionality of our platform."
                        />
                        <PrivacySection
                            title="8. Updates to this Policy"
                            content="We may update this Privacy Protocol from time to time to reflect changes in our practices or for legal reasons. We will notify you of any significant changes via the dashboard or email."
                        />
                        <PrivacySection
                            title="9. Contact Support"
                            content={`For any privacy-related concerns or data requests, please email us at ${supportEmail}.`}
                        />
                    </div>
                </div>
            </section>
            <LandingFooter />
        </main>
    );
}

function PrivacySection({ title, content }: { title: string; content: string }) {
    return (
        <div className="border-b border-slate-100 pb-12">
            <h2 className="text-slate-900 text-xl font-black uppercase tracking-[4px] mb-8 italic">{title}</h2>
            <p className="g-p text-lg leading-relaxed text-slate-600">{content}</p>
        </div>
    );
}
