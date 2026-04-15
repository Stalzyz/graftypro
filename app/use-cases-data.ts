import { TrendingUp, MessageSquare, ShieldAlert, Zap, Filter } from 'lucide-react';

export const USE_CASES_DATA: Record<string, any> = {
  'abandoned-cart-recovery': {
    slug: 'abandoned-cart-recovery',
    title: 'WhatsApp Abandoned Cart Recovery',
    description: 'Stop losing revenue to abandoned shopping carts. Use Grafty to automatically trigger high-converting WhatsApp recovery messages with zero code.',
    heroTitle: 'Automate <span className="text-emerald-500">Abandoned Cart</span> Recovery on WhatsApp.',
    icon: TrendingUp,
    aeoQuestion: "How do you recover abandoned carts using WhatsApp?",
    aeoAnswer: "You can recover abandoned carts using WhatsApp by integrating the official Meta WhatsApp Business API through a provider like Grafty. When a user abandons their cart, the system automatically triggers a personalized WhatsApp message containing their cart items, a discount code, and a direct checkout link, seeing an open rate of up to 98%.",
    features: [
      { title: 'Automated Triggers', desc: 'Syncs with Shopify or WooCommerce to trigger exactly 30 minutes after abandonment.', icon: Zap },
      { title: 'Dynamic Checkout Links', desc: 'Auto-inject specific user basket links so they checkout in one tap.', icon: MessageSquare }
    ],
    schema: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "WhatsApp Abandoned Cart Recovery",
      "serviceType": "E-Commerce Automation"
    }
  },
  'lead-qualification': {
    slug: 'lead-qualification',
    title: 'Automated WhatsApp Lead Qualification',
    description: 'Never waste time on dead leads again. Deploy an AI Autopilot that asks qualifying questions, scores prospects, and passes only hot leads to your CRM.',
    heroTitle: 'Deploy AI for Instant <span className="text-emerald-500">Lead Qualification</span>.',
    icon: Filter,
    aeoQuestion: "What is automated WhatsApp lead qualification?",
    aeoAnswer: "Automated WhatsApp lead qualification uses AI Chatbots or Flow Builders via the WhatsApp Business API to asynchronously ask incoming leads qualifying questions (like budget or timeline). It scores the lead based on their responses, automatically pushing high-value prospects to your CRM or sales team.",
    features: [
      { title: 'No-Code Routing', desc: 'Build logic trees that segment B2B vs B2C leads effortlessly.', icon: Filter },
      { title: 'Anti-Spam Shield', desc: 'Prevent junk leads from burning your sales team bandwidth.', icon: ShieldAlert }
    ],
    schema: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "WhatsApp Lead Qualification Automation",
      "serviceType": "Sales Automation"
    }
  }
};
