import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ACADEMY_ARTICLES } from '../academy-data';
import LandingNavbar from '../../../components/landing-new/LandingNavbar';
import LandingFooter from '../../../components/landing-new/LandingFooter';
import "../../../app/landing/new-grafty.css";
import { ArrowLeft, BookOpen, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = ACADEMY_ARTICLES[params.slug];
  if (!data) return { title: "Article Not Found" };

  return {
    title: `${data.title} | Grafty Academy`,
    description: data.description,
    keywords: ["Grafty Academy", data.category, "WhatsApp Business API", "How-To"],
    openGraph: {
      title: data.title,
      description: data.description,
      type: 'article',
      url: `https://grafty.pro/academy/${params.slug}`,
    }
  };
}

export async function generateStaticParams() {
  return Object.keys(ACADEMY_ARTICLES).map((slug) => ({
    slug,
  }));
}

export default function AcademyArticlePage({ params }: Props) {
  const data = ACADEMY_ARTICLES[params.slug];
  if (!data) notFound();

  const Icon = data.icon;

  return (
    <main className="g-body">
      <LandingNavbar />

      <section className="pt-40 pb-20 lg:pt-56 section-white overflow-hidden relative">
        <div className="hero-gradient" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 animate-up">
           <Link href="/academy" className="inline-flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-[10px] mb-12 hover:gap-4 transition-all">
             <ArrowLeft size={14} /> Back to Academy Hub
           </Link>
           
           <div className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-[4px] text-[10px] mb-8">
             <span className="text-emerald-500">{data.category}</span> • <Clock size={12} /> 6 min read
           </div>
           
           <h1 className="g-h1 mb-10 !text-5xl lg:!text-7xl">{data.title}</h1>
           <p className="g-p text-2xl font-medium italic opacity-70 border-l-4 border-emerald-500 pl-8 mb-16">
             {data.description}
           </p>
        </div>
      </section>

      <section className="pb-32 section-white">
        <div className="max-w-4xl mx-auto px-6">
           <div className="prose prose-slate max-w-none space-y-12">
              {data.content.map((block: any, i: number) => {
                if (block.type === "paragraph") {
                  return <p key={i} className="text-lg text-slate-600 font-medium leading-relaxed italic">{block.text}</p>;
                }
                if (block.type === "heading") {
                  return <h2 key={i} className="text-3xl font-black italic tracking-tighter pt-12 text-slate-900 uppercase border-b border-slate-100 pb-4">{block.text}</h2>;
                }
                if (block.type === "list") {
                  return (
                    <ul key={i} className="space-y-6">
                      {block.items.map((item: string, j: number) => (
                        <li key={j} className="flex gap-4 items-start">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                          <span className="text-lg font-bold text-slate-700 leading-tight">{item}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                return null;
              })}
           </div>
           
           <div className="mt-32 p-12 bg-slate-50 rounded-[3rem] border border-slate-100 divide-y divide-slate-200">
              <div className="pb-8 mb-8">
                 <h4 className="font-black uppercase tracking-widest mb-4">Was this guide helpful?</h4>
                 <p className="text-sm font-medium text-slate-500">Share your thoughts or suggest a topic for the next masterclass.</p>
              </div>
              <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-8">
                 <div className="flex gap-4">
                    <a href="/join" className="g-btn-primary py-4 px-10">Start for Free</a>
                    <a href="/pricing" className="g-btn-outline py-4 px-10">View Pricing</a>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[5px] text-slate-400">Grafty Intelligence Hub © 2026</p>
              </div>
           </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
