import type { Metadata } from 'next';
import LinkGenerator from '../../components/tools/LinkGenerator';
import LandingNavbar from '../../components/landing-new/LandingNavbar';
import LandingFooter from '../../components/landing-new/LandingFooter';
import { ShieldCheck, Zap, Share2, MessageCircle } from 'lucide-react';
import "../../app/landing/new-grafty.css";

export const metadata: Metadata = {
  title: "Free WhatsApp Link & QR Code Generator | Grafty",
  description: "Create official WhatsApp wa.me links and custom QR codes for your business. Free WhatsApp marketing tool with pre-filled message support.",
  keywords: ["whatsapp link generator", "wa.me link creator", "whatsapp qr code generator", "free whatsapp marketing tools", "grafty"],
  openGraph: {
    title: "Free WhatsApp Link & QR Code Generator | Grafty",
    description: "The official way to create WhatsApp click-to-chat links and branded QR codes.",
    url: 'https://grafty.pro/whatsapp-link-generator',
    type: 'website',
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Grafty WhatsApp Link & QR Generator",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "1250"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is this WhatsApp link tool free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Grafty's WhatsApp Link and QR Generator is 100% free for lifetime use by businesses and individuals."
          }
        },
        {
          "@type": "Question",
          "name": "Can I add a custom message to the WhatsApp link?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, you can add a pre-filled message that will automatically appear in the user's text box when they click the link."
          }
        }
      ]
    }
  ]
};

export default function WhatsAppLinkGeneratorPage() {
  return (
    <main className="g-body">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingNavbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 lg:pt-56 lg:pb-32 section-white overflow-hidden relative">
        <div className="hero-gradient" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center animate-up">
          <div className="flex justify-center items-center gap-3 text-emerald-600 font-black uppercase tracking-[4px] text-xs mb-8">
            <Zap size={16} /> Free Marketing Intelligence v1.0
          </div>
          <h1 className="g-h1 mb-8 max-w-5xl mx-auto">
            Design your official <br />
            <span className="text-gradient">WhatsApp Connection.</span>
          </h1>
          <p className="g-p text-xl mb-12 max-w-3xl mx-auto">
            Generate high-intent click-to-chat links and branded QR codes for your e-commerce store, real estate ads, or customer support. Zero friction, zero cost.
          </p>
        </div>
      </section>

      {/* Tool Section */}
      <section className="pb-32 section-white">
        <div className="max-w-7xl mx-auto px-6">
           <LinkGenerator />
        </div>
      </section>

      {/* Education / SEO Section */}
      <section className="section-gray">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="g-h2 mb-16 text-center italic tracking-tighter">Strategic Utility.</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Share2 size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Social Commerce Links</h3>
              <p className="g-p text-sm leading-relaxed">
                Use wa.me links in your Instagram Bio, Facebook Ads, or TikTok profiles. It allows your customers to start a conversation with one tap, bypassing slow email or web forms.
              </p>
            </div>

            <div className="space-y-6">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Print-to-Chat QR Codes</h3>
              <p className="g-p text-sm leading-relaxed">
                Download your branded QR code for packaging, restaurant tables, or office entry points. It’s the fastest bridge between the physical and digital world for your business.
              </p>
            </div>

            <div className="space-y-6">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <MessageCircle size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Pre-filled Messages</h3>
              <p className="g-p text-sm leading-relaxed">
                Add a context-aware message like "I want to book a demo" so you know exactly why the customer is reaching out before you even reply.
              </p>
            </div>

            <div className="space-y-6">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Zero Redirects</h3>
              <p className="g-p text-sm leading-relaxed">
                Grafty links use the official WhatsApp API structure, ensuring your users never see scary "Warning" pages from third-party link shorteners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ for Tool */}
      <section className="section-white">
        <div className="max-w-3xl mx-auto px-6">
           <h3 className="g-h3 mb-12 text-center">Frequently Asked.</h3>
           <div className="space-y-6">
             <div className="g-card !p-8">
               <p className="font-bold text-slate-900 mb-2">Is this tool free for lifetime?</p>
               <p className="text-sm text-slate-500 font-medium">Yes. Grafty provides the Link and QR generator for free to help small businesses start their WhatsApp journey.</p>
             </div>
             <div className="g-card !p-8">
               <p className="font-bold text-slate-900 mb-2">Can I track how many people clicked my link?</p>
               <p className="text-sm text-slate-500 font-medium">Tracking and advanced analytics are available when you connect your number to the official Grafty Platform.</p>
             </div>
           </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
