import React from 'react';

interface SchemaProps {
  brandName?: string;
  baseUrl?: string;
  logoUrl?: string;
}

export function SchemaScripts({ brandName = "Platform", baseUrl = "", logoUrl = "" }: SchemaProps) {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": brandName,
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
    "description": `Enterprise-grade WhatsApp Business Solution Provider (BSP) platform for automation, commerce, and growth by ${brandName}.`
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": brandName,
    "url": baseUrl,
    "logo": logoUrl || `${baseUrl}/icon.svg`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "",
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
          "text": "To get a WhatsApp Green Tick (Official Business Account), you must have a verified Facebook Business Manager and exhibit a high level of brand authority and searchability."
        }
      },
      {
        "@type": "Question",
        "name": "Does this platform support automated flows?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we feature a comprehensive WhatsApp Flow builder that allows you to automate lead generation, feedback, and commerce directly within the chat."
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
