import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { SOLUTIONS_DATA } from '../solutions-data';
import LandingNavbar from '../../../components/landing-new/LandingNavbar';
import LandingFooter from '../../../components/landing-new/LandingFooter';
import "../../../app/landing/new-grafty.css";
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { MetaCapiTracker } from '../../../components/seo/MetaCapiTracker';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = SOLUTIONS_DATA[params.slug];
  if (!data) return { title: "Solution Not Found" };

  return {
    title: `${data.title} | WhatsApp Automation Solution by Grafty`,
    description: data.description,
    keywords: [`whatsapp for ${params.slug}`, `whatsapp marketing ${params.slug}`, `whatsapp automation ${params.slug}`, "Grafty"],
    openGraph: {
      title: data.title,
      description: data.description,
      type: 'website',
      url: `https://grafty.pro/solutions/${params.slug}`,
    }
  };
}

export async function generateStaticParams() {
  return Object.keys(SOLUTIONS_DATA).map((slug) => ({
    slug,
  }));
}

export default function SolutionPage({ params }: Props) {
  const data = SOLUTIONS_DATA[params.slug];
  if (!data) notFound();

  const Icon = data.icon;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": data.title,
    "description": data.description,
    "provider": {
      "@type": "Organization",
      "name": "Grafty",
      "url": "https://grafty.pro"
    },
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "WhatsApp Business Solutions",
      "itemListElement": data.features.map((f: any, i: number) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": f.title,
          "description": f.desc
        }
      }))
    }
  };

  return (
    <main className="g-body">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MetaCapiTracker
        eventName="ViewContent"
        customData={{
          content_name: data.title,
          content_category: 'Industry Solution',
          content_type: 'vertical'
        }}
      />
      <LandingNavbar />

      {/* Hero */}
      <section className="pt-40 pb-20 lg:pt-56 lg:pb-32 section-white overflow-hidden relative">
        <div className="hero-gradient" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 animate-up">
          <div className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-[4px] text-xs mb-8">
            <Icon size={16} /> Industry Vertical: {data.slug}
          </div>
          <h1 
            className="g-h1 mb-8 max-w-5xl"
            dangerouslySetInnerHTML={{ __html: data.heroTitle }}
          />
          <p className="g-p text-xl mb-12 max-w-3xl">
            {data.description}
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="/join" className="g-btn-primary px-8 py-4">Start Scaling</a>
            <a href="/whatsapp-link-generator" className="g-btn-outline px-8 py-4">Free Link Generator</a>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="section-gray">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
             <div className="space-y-12">
               <div>
                  <h2 className="g-h2 mb-6 italic tracking-tighter">The Challenge.</h2>
                  <p className="g-p">{data.problem}</p>
               </div>
               <div className="p-10 bg-emerald-50 rounded-[3rem] border border-emerald-100">
                  <h3 className="text-xl font-black uppercase tracking-tight text-emerald-900 mb-4 flex items-center gap-3">
                    <CheckCircle2 size={24} /> The Grafty Solution
                  </h3>
                  <p className="text-emerald-800/80 font-medium leading-relaxed">
                    {data.solution}
                  </p>
               </div>
             </div>
             
             <div className="grid grid-cols-1 gap-6">
               {data.features.map((f: any, i: number) => {
                 const FIcon = f.icon;
                 return (
                    <div key={i} className="g-card !p-8 border-none group hover:scale-[1.02] transition-all cursor-default">
                       <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:bg-emerald-600 transition-colors">
                          <FIcon size={20} />
                       </div>
                       <h4 className="font-black text-lg uppercase tracking-tight mb-3">{f.title}</h4>
                       <p className="text-xs text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                    </div>
                 );
               })}
             </div>
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="section-white overflow-hidden relative">
         <div className="max-w-4xl mx-auto px-6 py-20 text-center relative z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] font-black text-slate-50 opacity-20 -z-10 select-none">Impact</div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-600 mb-4">Validated Impact</p>
            <h2 className="text-6xl font-black tracking-tighter mb-8 italic">{data.caseStudy.result}</h2>
            <p className="text-2xl font-bold text-slate-800 mb-12 max-w-2xl mx-auto leading-relaxed">
               "{data.caseStudy.quote}"
            </p>
            <div className="flex items-center justify-center gap-4 border-t border-slate-100 pt-8 inline-flex mx-auto">
               <div className="text-left">
                  <p className="font-black uppercase tracking-tight text-slate-900">{data.caseStudy.client}</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Growth Case Study</p>
               </div>
            </div>
         </div>
      </section>

      {/* CTA */}
      <section className="section-gray">
         <div className="max-w-5xl mx-auto px-6">
            <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden text-center">
               <div className="absolute top-0 right-0 p-12 text-white/5 font-black text-6xl italic transform translate-x-1/2 -translate-y-1/2 uppercase tracking-tighter">UPGRADE</div>
               <h2 className="g-h2 mb-8 !text-white">Ready to dominate <br/>{data.title}?</h2>
               <p className="text-slate-400 text-lg font-medium mb-12 max-w-2xl mx-auto">Join hundreds of {data.slug} pioneers using Grafty to automate their most profitable conversations.</p>
               <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <a href="/join" className="g-btn-primary px-12 py-5 shadow-emerald-500/20">Claim Your API Account</a>
                  <a href="/pricing" className="g-btn-outline !bg-transparent !border-white/20 !text-white px-12 py-5 hover:!bg-white/5">View Full Architecture</a>
               </div>
            </div>
         </div>
      </section>

      <LandingFooter />
    </main>
  );
}
