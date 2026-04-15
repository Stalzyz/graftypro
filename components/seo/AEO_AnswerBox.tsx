import React from 'react';

interface AEOProps {
  question: string;
  answer: string;
  className?: string;
}

export function AEO_AnswerBox({ question, answer, className = "" }: AEOProps) {
  return (
    <div 
      className={`bg-white border border-slate-200 rounded-3xl p-8 shadow-sm ${className}`}
      itemScope 
      itemProp="mainEntity" 
      itemType="https://schema.org/Question"
    >
      <h2 
        className="text-2xl font-black text-slate-900 mb-4" 
        itemProp="name"
      >
        {question}
      </h2>
      <div 
        itemScope 
        itemProp="acceptedAnswer" 
        itemType="https://schema.org/Answer"
      >
        <div itemProp="text" className="text-slate-600 leading-relaxed font-medium">
          {/* We format to strictly allow p-tags, a signal to SGE that this is a definitive explanation. */}
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
}
