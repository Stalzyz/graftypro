import type { Metadata } from 'next';
import GreenTickChecker from '../../components/tools/GreenTickChecker';
import LandingNavbar from '../../components/landing-new/LandingNavbar';
import LandingFooter from '../../components/landing-new/LandingFooter';
import { BadgeCheck, ShieldAlert } from 'lucide-react';
import "../../app/landing/new-grafty.css";

export const metadata: Metadata = {
  title: "WhatsApp Green Tick Eligibility Checker | Verify Your Business | Grafty",
  description: "Check if your business qualifies for the WhatsApp Official Blue/Green Badge. Expert verification tool for Meta Business Notability and Compliance.",
  keywords: ["whatsapp green tick checker", "verify whatsapp business account", "whatsapp blue badge requirements", "official business account verification", "grafty"],
  openGraph: {
    title: "WhatsApp Green Tick Eligibility Checker | Verify Your Business | Grafty",
    description: "Audit your brand's notability and discover your chances of getting the WhatsApp Green Tick.",
    url: 'https://grafty.pro/whatsapp-green-tick-checker',
    type: 'website',
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Grafty WhatsApp Green Tick Eligibility Audit",
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
          "name": "What are the requirements for a WhatsApp Green Tick?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The main requirements are: 1. A verified Meta Business Manager, 2. Two-factor authentication enabled, 3. WhatsApp Messaging Tier 2 or higher, and 4. Brand notability (organic news mentions)."
          }
        },
        {
          "@type": "Question",
          "name": "How long does it take to get a WhatsApp Verified Badge?",
          "acceptedAnswer": {
            "@type": {
              "@type": "Answer",
              "text": "The application process usually takes 2-4 business days once submitted through an Official BSP like Grafty."
            }
          }
        }
      ]
    }
  ]
};

export default function GreenTickPage() {
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
            <BadgeCheck size={16} /> Brand Authority Protocol v2.4
          </div>
          <h1 className="g-h1 mb-8 max-w-5xl mx-auto">
            Audit your official <br />
            <span className="text-gradient">Verification Status.</span>
          </h1>
          <p className="g-p text-xl mb-12 max-w-3xl mx-auto">
            The "Green Tick" is the ultimate symbol of trust on WhatsApp. Use our professional audit tool to determine if your business meets Meta's strict notability and compliance guidelines.
          </p>
        </div>
      </section>

      <section className="pb-32 section-white">
        <div className="max-w-7xl mx-auto px-6">
           <GreenTickChecker />
        </div>
      </section>

      <section className="section-gray">
        <div className="max-w-4xl mx-auto px-6 py-20">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                 <h2 className="text-3xl font-black italic tracking-tighter mb-8">Why the Badge <br/>Matters for Growth.</h2>
                 <ul className="space-y-6">
                    <BenefitItem title="Unparalleled Trust" desc="Users respond 3x more to verified accounts than standard business profiles." />
                    <BenefitItem title="Brand Visibility" desc="Your business name is visible even to users who haven't saved your contact number." />
                    <BenefitItem title="Reduced Report Rates" desc="Official status signals to users and Meta that you are a legitimate entity." />
                 </ul>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl relative">
                 <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-8">
                    <ShieldAlert size={24} />
                 </div>
                 <h4 className="text-xl font-bold mb-4 uppercase tracking-tight">The "Notability" Trap</h4>
                 <p className="text-slate-500 text-sm font-medium leading-relaxed">
                   Most businesses fail because Meta does not consider them "Notable." This means you must be mentioned in legitimate, high-traffic news outlets. Paid PR or internal press releases **do not count**.
                 </p>
              </div>
           </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}

function BenefitItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-4 items-start">
       <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
       <div>
          <h4 className="font-black text-sm uppercase tracking-tight mb-1">{title}</h4>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}
