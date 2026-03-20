import React from 'react';

export function SchemaScripts() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Grafty",
    "operatingSystem": "All",
    "applicationCategory": "BusinessApplication",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1250"
    },
    "offers": {
      "@type": "Offer",
      "price": "49.00",
      "priceCurrency": "USD"
    },
    "description": "Enterprise-grade WhatsApp Business Solution Provider (BSP) platform for automation, commerce, and growth."
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Grafty",
    "url": "https://grafty.pro",
    "logo": "https://grafty.pro/icon.svg",
    "sameAs": [
      "https://facebook.com/grafty",
      "https://twitter.com/grafty",
      "https://linkedin.com/company/grafty"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9789359407",
      "contactType": "customer service"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a WhatsApp BSP?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A WhatsApp Business Solution Provider (BSP) is a third-party service provider with expertise on the WhatsApp Business Platform. They help businesses connect with their customers on WhatsApp at scale."
        }
      },
      {
        "@type": "Question",
        "name": "How do I get a WhatsApp green tick?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To get a WhatsApp Green Tick (Official Business Account), you must have a verified Facebook Business Manager and exhibit a high level of brand authority and searchability. Grafty helps you with the application process."
        }
      },
      {
        "@type": "Question",
        "name": "Does Grafty support automated flows?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Grafty features a comprehensive WhatsApp Flow builder that allows you to automate lead generation, feedback, and commerce directly within the chat."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
