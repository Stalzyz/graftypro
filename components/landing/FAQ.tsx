
"use client";
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqData = [
    {
        question: "What is Grafty?",
        answer: "Grafty is a next-generation WhatsApp Marketing and Business Solution Platform (BSP) that helps businesses automate sales, support, and marketing using WhatsApp Cloud API."
    },
    {
        question: "Is this compliant with Meta policies?",
        answer: "Yes, Grafty uses the Official WhatsApp Cloud API by Meta. We ensure all campaigns and automation follow Meta's commercial and messaging policies."
    },
    {
        question: "How does the pricing work?",
        answer: "Pricing consists of two parts: Meta's conversation charges and a subscription fee for the Grafty platform. You can calculate your approximate billing using our Messaging Charge Calculator."
    },
    {
        question: "Can I connect my own AI bot?",
        answer: "Absolutely! Grafty provides integrated AI training tools and webhooks to connect with OpenAI (ChatGPT), Dialogflow, or our built-in trained AI Chat Agent."
    },
    {
        question: "Is there a setup fee?",
        answer: "No, there are no hidden setup fees. You can sign up, connect your WhatsApp number, and start within minutes."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-24 relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black mb-6">Frequently <span className="text-gradient">Asked Questions</span></h2>
                    <p className="text-slate-400 text-lg">Everything you need to know about Grafty and WhatsApp Marketing.</p>
                </div>

                <div className="space-y-4">
                    {faqData.map((item, index) => (
                        <div
                            key={index}
                            className="glass-card hover:border-slate-700/50 transition-all cursor-pointer"
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        >
                            <div className="p-6 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">{item.question}</h3>
                                {openIndex === index ? <ChevronUp className="text-wa-green" /> : <ChevronDown className="text-slate-500" />}
                            </div>
                            {openIndex === index && (
                                <div className="px-6 pb-6 text-slate-400 animate-fade-in">
                                    {item.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
