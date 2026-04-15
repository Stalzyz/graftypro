import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { INTEGRATIONS_DATA } from '../../integrations-data';
import LandingNavbar from '../../../components/landing-new/LandingNavbar';
import LandingFooter from '../../../components/landing-new/LandingFooter';
import "../../../app/landing/new-grafty.css";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = INTEGRATIONS_DATA[params.slug];
  if (!data) return { title: "Integration Not Found" };

  return {
    title: `${data.title} | Official Grafty API`,
    description: data.description,
    keywords: [`whatsapp ${params.slug} integration`, `${params.slug} whatsapp marketing`, `connect ${params.slug} to whatsapp`, "Grafty BSP"],
    openGraph: {
      title: data.title,
      description: data.description,
      type: 'website',
      url: `https://grafty.pro/integrations/${params.slug}`,
    },
    alternates: {
      canonical: `/integrations/${params.slug}`,
    }
  };
}

export async function generateStaticParams() {
  return Object.keys(INTEGRATIONS_DATA).map((slug) => ({
    slug,
  }));
}

export default function IntegrationPage({ params }: Props) {
  const data = INTEGRATIONS_DATA[params.slug];
  if (!data) notFound();
  
  const Icon = data.icon;

  return (
    <main className="g-body">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data.schema) }}
      />
      <LandingNavbar />

      {/* Programmatic Hero */}
      <section className="pt-40 pb-20 lg:pt-56 lg:pb-32 section-white overflow-hidden relative">
        <div className="hero-gradient" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 animate-up">
          <div className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-[4px] text-xs mb-8">
            <Icon size={16} /> Native Integration: {data.slug}
          </div>
          <h1 
            className="g-h1 mb-8 max-w-5xl"
            dangerouslySetInnerHTML={{ __html: data.heroTitle }}
          />
          <p className="g-p text-xl mb-12 max-w-3xl">
            {data.description}
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="/register" className="g-btn-primary px-8 py-4">Connect {data.slug} Now</a>
          </div>
        </div>
      </section>

      {/* Programmatic Use Cases Map */}
      <section className="section-gray py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="g-h2 mb-16 text-center">Top {data.slug} Automated Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.useCases.map((uc: any, i: number) => {
               const UCIcon = uc.icon;
               return (
                  <div key={i} className="p-8 bg-white rounded-3xl shadow-xl border border-slate-100 flex gap-6 items-start">
                     <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                        <UCIcon size={24} />
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{uc.title}</h3>
                        <p className="text-slate-500 leading-relaxed">{uc.desc}</p>
                     </div>
                  </div>
               )
            })}
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
