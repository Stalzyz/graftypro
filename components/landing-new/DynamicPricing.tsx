"use client";

import React from 'react';
import DynamicPricingSection from "./DynamicPricingSection";

export default function DynamicPricing() {
    return (
        <section className="py-24 bg-white relative overflow-hidden" id="pricing">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Simple, Transparent Pricing</h2>
                    <p className="text-slate-500 text-lg font-medium">Choose the perfect infrastructure node for your business growth.</p>
                </div>
                <DynamicPricingSection />
            </div>
        </section>
    );
}
