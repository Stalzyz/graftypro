import type { Metadata } from 'next';
import CostCalculator from '../../components/tools/CostCalculator';
import LandingNavbar from '../../components/landing-new/LandingNavbar';
import LandingFooter from '../../components/landing-new/LandingFooter';
import { BadgeInfo, TrendingUp } from 'lucide-react';
import "../../app/landing/new-grafty.css";

export const metadata: Metadata = {
  title: "WhatsApp API Pricing Calculator | Estimate Meta Fees | Grafty",
  description: "Calculate your official WhatsApp Business Platform conversation costs. Compare Marketing, Utility, and Service message fees across India, USA, Brazil, and more.",
  keywords: ["whatsapp api cost calculator", "whatsapp conversation pricing", "meta whatsapp fees india", "official whatsapp api charges", "grafty"],
  openGraph: {
    title: "WhatsApp API Pricing Calculator | Estimate Meta Fees | Grafty",
    description: "Plan your WhatsApp marketing budget with our real-time conversation cost calculator.",
    url: 'https://grafty.pro/whatsapp-cost-calculator',
    type: 'website',
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Grafty WhatsApp API Cost Calculator",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does WhatsApp calculate pricing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "WhatsApp charges per 24-hour conversation window. Costs vary depending on the category (Marketing, Utility, Service, Authentication) and the recipient's country code."
          }
        },
        {
          "@type": "Question",
          "name": "Are the first 1000 messages on WhatsApp free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Meta provides the first 1,000 service conversations (user-initiated) free of charge every month for each WhatsApp Business Account."
          }
        }
      ]
    }
  ]
};

export default function CostCalculatorPage() {
  return (
    <main className="g-body">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingNavbar />

      <section className="pt-40 pb-20 lg:pt-56 lg:pb-32 section-white overflow-hidden relative">
        <div className="hero-gradient" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center animate-up">
          <div className="flex justify-center items-center gap-3 text-emerald-600 font-black uppercase tracking-[4px] text-xs mb-8">
            <TrendingUp size={16} /> Budget Intelligence v1.0
          </div>
          <h1 className="g-h1 mb-8 max-w-5xl mx-auto">
            Audit your WhatsApp <br />
            <span className="text-gradient">Operational Costs.</span>
          </h1>
          <p className="g-p text-xl mb-12 max-w-3xl mx-auto">
            Stop guessing your Meta invoice. Select your region, enter your expected conversation volumes, and get an atomic breakdown of your monthly expenditure.
          </p>
        </div>
      </section>

      <section className="pb-32 section-white">
        <div className="max-w-7xl mx-auto px-6">
           <CostCalculator />
        </div>
      </section>

      <section className="section-gray">
         <div className="max-w-4xl mx-auto px-6">
            <div className="g-card !p-12 border-none">
               <h3 className="text-2xl font-black mb-8 italic flex items-center gap-3">
                 <BadgeInfo className="text-emerald-500" /> Meta Fee Breakdown
               </h3>
               <div className="space-y-8 text-slate-600 font-medium leading-relaxed">
                  <p>
                    WhatsApp uses <strong>Conversation-Based Pricing</strong>. A conversation is a 24-hour window that begins when the first message is delivered.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="p-6 bg-white rounded-2xl border border-slate-100">
                        <h4 className="font-black text-xs uppercase tracking-widest text-emerald-600 mb-2">User Initiated</h4>
                        <p className="text-sm">When a user sends you a message, it opens a <strong>Service Window</strong>. The first 1,000 service conversations each month are completely free.</p>
                     </div>
                     <div className="p-6 bg-white rounded-2xl border border-slate-100">
                        <h4 className="font-black text-xs uppercase tracking-widest text-emerald-600 mb-2">Business Initiated</h4>
                        <p className="text-sm">Messages sent by your business (Marketing, Utility, Auth) require a pre-approved template and are charged per 24-hour window.</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <LandingFooter />
    </main>
  );
}
