"use client";
import React from "react";
import "../landing/new-grafty.css";
import LandingNavbar from "../../components/landing-new/LandingNavbar";
import LandingFooter from "../../components/landing-new/LandingFooter";

export default function DataDeletionPage() {
    return (
        <main className="g-body">
            <LandingNavbar />
            <section className="pt-40 pb-40 section-white">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="g-h1 mb-20">Data Deletion <span className="text-gradient">Policy.</span></h1>
                    <p className="g-p mb-12 text-slate-500 italic">Last Updated: February 23, 2026</p>

                    <div className="space-y-16">
                        <DeletionSection
                            title="1. Introduction"
                            content="At Grafty (Wabot BSP), we respect your privacy and provide transparent ways to manage and remove your data. If you have used our application via Facebook Login or connected your WhatsApp Business Account, you can request the deletion of your data following the instructions below."
                        />
                        <DeletionSection
                            title="2. How to Request Data Deletion"
                            content="You can request the deletion of your account and associated data by sending an email to support@grafty.pro. Please include the email address associated with your account and specify that you are requesting a full data deletion. Alternatively, you can navigate to Dashboard > Settings > Workspace where an option to 'Delete Workspace' is available for account owners."
                        />
                        <DeletionSection
                            title="3. Data Removed upon Request"
                            content="When you request data deletion, the following information is permanently removed from our active servers: Your user profile information (Name, Email, Profile Picture), WhatsApp message logs stored in our system, Automation flows and drip sequences, and linked Meta API Access Tokens."
                        />
                        <DeletionSection
                            title="4. Data Retained for Legal Compliance"
                            content="Please note that certain data may be retained even after a deletion request as required by law or for legitimate business purposes. This includes: Billing and transaction records (required for GST and tax compliance in India), Audit logs of critical actions for security purposes, and support ticket history."
                        />
                        <DeletionSection
                            title="5. Meta (Facebook) Data Deletion"
                            content="If you have used 'Facebook Login for Business' to connect your WABA, you can also manage your app permissions directly on Facebook. Navigate to your Facebook Settings & Privacy > Settings > Apps and Websites, find 'Grafty', and click 'Remove'. This will stop our app from accessing your Meta data immediately."
                        />
                        <DeletionSection
                            title="6. Processing Time"
                            content="Data deletion requests received via email are processed within 72 hours. Once processed, you will receive a confirmation email. Please note that data stored in encrypted offline backups may persist for up to 30 days but will be inaccessible and eventually overwritten."
                        />
                    </div>
                </div>
            </section>
            <LandingFooter />
        </main>
    );
}

function DeletionSection({ title, content }: { title: string; content: string }) {
    return (
        <div className="border-b border-slate-100 pb-12">
            <h2 className="text-slate-900 text-xl font-black uppercase tracking-[4px] mb-8 italic">{title}</h2>
            <p className="g-p text-lg leading-relaxed text-slate-600">{content}</p>
        </div>
    );
}
