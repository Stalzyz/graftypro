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
    "description": `Official WhatsApp Business Solution Provider (BSP) for bulk WhatsApp messages, automation, and retail growth by ${brandName}.`
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Bulk WhatsApp Messaging",
    "provider": {
      "@type": "LocalBusiness",
      "name": brandName
    },
    "areaServed": "Worldwide",
    "description": `Reliable bulk WhatsApp message service with high delivery rates, official API access, and automated flow builder.`
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
        "name": "How to send bulk WhatsApp messages?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `To send bulk WhatsApp messages with ${brandName}, you need an official WhatsApp Business API account. Our platform allows you to upload contacts and send 10k+ messages with a single click while maintaining high delivery rates and Meta compliance.`
        }
      },
      {
        "@type": "Question",
        "name": "What is the official WhatsApp Business API?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The official WhatsApp Business API (WABA) is a scalable communication channel provided by Meta for medium and large businesses to interact with customers globally."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
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
