import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { COMPARISON_DATA } from '../comparison-data';
import LandingNavbar from '../../../components/landing-new/LandingNavbar';
import LandingFooter from '../../../components/landing-new/LandingFooter';
import "../../../app/landing/new-grafty.css";
import { Check, X, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = COMPARISON_DATA[params.slug];
  if (!data) return { title: "Comparison Not Found" };

  return {
    title: data.title,
    description: data.description,
    keywords: [`${data.competitor} alternative`, `Grafty vs ${data.competitor}`, "best whatsapp bsp", "Grafty"],
    openGraph: {
      title: data.title,
      description: data.description,
      type: 'website',
      url: `https://grafty.pro/compare/${params.slug}`,
    }
  };
}

export async function generateStaticParams() {
  return Object.keys(COMPARISON_DATA).map((slug) => ({
    slug,
  }));
}

export default function ComparisonPage({ params }: Props) {
  const data = COMPARISON_DATA[params.slug];
  if (!data) notFound();

  return (
    <main className="g-body">
      <LandingNavbar />

      {/* Hero */}
      <section className="pt-40 pb-20 lg:pt-56 lg:pb-32 section-white overflow-hidden relative">
        <div className="hero-gradient" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center animate-up">
          <div className="flex justify-center items-center gap-3 text-emerald-600 font-black uppercase tracking-[4px] text-xs mb-8">
            <Zap size={16} /> Market Intelligence v2.0
          </div>
          <h1 className="g-h1 mb-8 max-w-5xl mx-auto">
            Grafty vs <span className="text-gradient">{data.competitor}</span>
          </h1>
          <p className="g-p text-xl mb-12 max-w-3xl mx-auto italic">
            Choosing the right WhatsApp Business Provider determines your long-term ROI. See why Grafty is the preferred choice for data-driven teams.
          </p>
        </div>
      </section>

      {/* Table Section */}
      <section className="pb-32 section-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="g-card !p-0 border-none shadow-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-slate-900 p-8 pt-10 text-white font-black uppercase tracking-widest text-[10px]">
               <div className="opacity-40">Core Capability</div>
               <div className="text-center text-emerald-400">Grafty.pro</div>
               <div className="text-center opacity-40">{data.competitor}</div>
            </div>
            
            {data.comparison.map((row: any, i: number) => (
               <div key={i} className={`grid grid-cols-3 p-8 border-b border-slate-50 items-center ${i % 2 === 0 ? 'bg-slate-50/30' : 'bg-white'}`}>
                  <div className="text-xs font-black uppercase tracking-tight text-slate-800">{row.feature}</div>
                  <div className="text-center">
                     <span className="inline-flex items-center gap-2 text-sm font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                        <Check size={14} className="stroke-[3px]" /> {row.grafty}
                     </span>
                  </div>
                  <div className="text-center text-xs font-bold text-slate-400">{row.competitor}</div>
               </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Grafty Section */}
      <section className="section-gray">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
               <div>
                  <h2 className="g-h2 mb-12 italic tracking-tighter">The Unfair <br/>Advantage.</h2>
                  <div className="space-y-8">
                     {data.whyGrafty.map((point: string, i: number) => (
                        <div key={i} className="flex gap-6 items-start">
                           <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                              <CheckCircle2 size={20} />
                           </div>
                           <p className="text-lg font-bold text-slate-700 leading-tight pt-2">{point}</p>
                        </div>
                     ))}
                  </div>
               </div>
               
               <div className="g-card !p-12 border-none bg-slate-900 text-white relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 p-10 text-white/5 font-black text-7xl italic uppercase tracking-tighter -mb-4 -mr-4">VERDICT</div>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-6">Expert Verdict</p>
                  <p className="text-xl font-medium leading-relaxed italic opacity-80 mb-10">
                     "{data.summary}"
                  </p>
                  <a href="/register" className="g-btn-primary w-full py-5 group">
                     Switch to Grafty Today <ArrowRight size={18} className="ml-2 group-hover:ml-4 transition-all" />
                  </a>
               </div>
            </div>
         </div>
      </section>

      <LandingFooter />
    </main>
  );
}
