import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { USE_CASES_DATA } from '../../use-cases-data';
import LandingNavbar from '../../../components/landing-new/LandingNavbar';
import LandingFooter from '../../../components/landing-new/LandingFooter';
import { AEO_AnswerBox } from '../../../components/seo/AEO_AnswerBox';
import "../../../app/landing/new-grafty.css";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = USE_CASES_DATA[params.slug];
  if (!data) return { title: "Use Case Not Found" };

  return {
    title: `${data.title} | Official Grafty API`,
    description: data.description,
    keywords: [`whatsapp ${params.slug}`, `automate ${params.slug} via whatsapp`, `whatsapp marketing ${params.slug}`, "Grafty"],
    openGraph: {
      title: data.title,
      description: data.description,
      type: 'website',
      url: `https://grafty.pro/use-cases/${params.slug}`,
    },
    alternates: {
      canonical: `/use-cases/${params.slug}`,
    }
  };
}

export async function generateStaticParams() {
  return Object.keys(USE_CASES_DATA).map((slug) => ({
    slug,
  }));
}

export default function UseCasePage({ params }: Props) {
  const data = USE_CASES_DATA[params.slug];
  if (!data) notFound();
  
  const Icon = data.icon;

  return (
    <main className="g-body">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data.schema) }}
      />
      <LandingNavbar />

      {/* Hero */}
      <section className="pt-40 pb-20 lg:pt-56 lg:pb-32 section-white overflow-hidden relative">
        <div className="hero-gradient" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 animate-up">
          <div className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-[4px] text-xs mb-8">
            <Icon size={16} /> Automation Blueprint: {data.slug}
          </div>
          <h1 
            className="g-h1 mb-8 max-w-5xl"
            dangerouslySetInnerHTML={{ __html: data.heroTitle }}
          />
          <p className="g-p text-xl mb-12 max-w-3xl">
            {data.description}
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="/register" className="g-btn-primary px-8 py-4">Build This Flow for Free</a>
          </div>
        </div>
      </section>

      {/* ADVANCED AEO INJECTION */}
      {data.aeoQuestion && data.aeoAnswer && (
        <section className="section-white py-12">
           <div className="max-w-4xl mx-auto px-6">
              <div className="mb-4">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direct Answer Optimization</span>
              </div>
              <AEO_AnswerBox 
                 question={data.aeoQuestion} 
                 answer={data.aeoAnswer} 
                 className="bg-slate-50 border-emerald-100"
              />
           </div>
        </section>
      )}

      {/* Features */}
      <section className="section-gray py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="g-h2 mb-16 text-center">Core Mechanics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.features.map((f: any, i: number) => {
               const FIcon = f.icon;
               return (
                  <div key={i} className="p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
                     <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-6">
                        <FIcon size={20} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-800 mb-3">{f.title}</h3>
                     <p className="text-slate-500 leading-relaxed font-medium">{f.desc}</p>
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
