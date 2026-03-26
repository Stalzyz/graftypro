"use client";
import React from "react";
import "../landing/new-grafty.css";
import LandingNavbar from "../../components/landing-new/LandingNavbar";
import LandingFooter from "../../components/landing-new/LandingFooter";
import { useBranding } from "../../hooks/use-branding";

export default function TermsPage() {
    const { branding } = useBranding();
    const brandName = branding?.brand_name || "Platform";
    const supportEmail = branding?.support?.email || "support@portal.io";

    return (
        <main className="g-body">
            <LandingNavbar />
            <section className="pt-40 pb-40 section-white">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="g-h1 mb-20">Terms and <span className="text-gradient">Conditions.</span></h1>
                    <p className="g-p mb-12 text-slate-500 italic">Last Updated: February 22, 2026</p>

                    <div className="space-y-16">
                        <TermSection
                            title="1. Acceptance of Terms"
                            content={`By accessing or using ${brandName}, you agree to be bound by these Terms and Conditions. Our services are built upon the Meta WhatsApp Cloud API. By using our platform, you also agree to strictly adhere to Meta's WhatsApp Business Terms of Service and WhatsApp Business Messaging Policies.`}
                        />
                        <TermSection
                            title="2. Account Eligibility & Responsibility"
                            content="You must be a legally recognized business entity to use our enterprise services. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate, current, and complete information during the registration process."
                        />
                        <TermSection
                            title="3. WhatsApp Business API Usage"
                            content={`${brandName} provides technical infrastructure to utilize Meta's Cloud API. You acknowledge that your use of WhatsApp is subject to Meta's approval. ${brandName} is not responsible for any suspension or termination of your WhatsApp Business Account (WABA) by Meta due to policy violations. You agree not to use the service for spamming, transmitting prohibited content, or any activity that violates Meta's guidelines.`}
                        />
                        <TermSection
                            title="4. Prohibited Content & Activities"
                            content={`You agree not to use ${brandName} to transmit any content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable. Meta prohibits certain business categories (e.g., gambling, adult content, illicit drugs) from using the WhatsApp Business API. Violation of these restrictions will result in immediate termination of your access.`}
                        />
                        <TermSection
                            title="5. Intellectual Property"
                            content={`All content, features, and functionality on the ${brandName} platform, including but not limited to software, designs, and logos, are the exclusive property of the platform provider. Using ${brandName} does not grant you ownership of any intellectual property rights in our services or the content you access.`}
                        />
                        <TermSection
                            title="6. Payments, Refunds & Credits"
                            content="Subscription fees and top-up credits (for messaging) are billed in advance. Due to the nature of digital services and API consumptions, all payments are non-refundable. Credits in your wallet do not expire as long as your account remains active. Failure to pay subscription fees may result in suspension of API access."
                        />
                        <TermSection
                            title="7. Limitation of Liability"
                            content={`${brandName} shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the service, including service interruptions caused by Meta's infrastructure or API changes. Our total liability shall not exceed the amount paid by you for the service in the preceding three months.`}
                        />
                        <TermSection
                            title="8. Termination"
                            content={`We reserve the right to terminate or suspend your account immediately, without prior notice, if you breach these Terms. Upon termination, your right to use the platform and access the WhatsApp Cloud API via our infrastructure will cease immediately.`}
                        />
                        <TermSection
                            title="9. Contact Information"
                            content={`For any legal inquiries or support regarding these terms, please contact us at ${supportEmail}.`}
                        />
                    </div>
                </div>
            </section>
            <LandingFooter />
        </main>
    );
}

function TermSection({ title, content }: { title: string; content: string }) {
    return (
        <div className="border-b border-slate-100 pb-12">
            <h2 className="text-slate-900 text-xl font-black uppercase tracking-[4px] mb-8 italic">{title}</h2>
            <p className="g-p text-lg leading-relaxed text-slate-600">{content}</p>
        </div>
    );
}
