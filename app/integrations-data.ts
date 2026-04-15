import { Webhook, ShoppingCart, Users, Database, Globe } from 'lucide-react';

export const INTEGRATIONS_DATA: Record<string, any> = {
  'shopify': {
    slug: 'shopify',
    title: 'WhatsApp Automation for Shopify',
    description: 'Connect your Shopify store to Grafty. Automate abandoned cart recoveries, order confirmations, and shipping updates directly via WhatsApp.',
    heroTitle: 'Recover <span className="text-emerald-500">Shopify</span> Sales on WhatsApp.',
    icon: ShoppingCart,
    useCases: [
      { title: 'Abandoned Cart Recovery', desc: 'Send automated WhatsApp reminders with checkout links immediately after cart abandonment.', icon: ShoppingCart },
      { title: 'Order Tracking', desc: 'Trigger WhatsApp messages automatically when order status changes in Shopify API.', icon: Webhook }
    ],
    schema: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Shopify WhatsApp Integration by Grafty",
      "applicationCategory": "BusinessApplication"
    }
  },
  'hubspot': {
    slug: 'hubspot',
    title: 'HubSpot WhatsApp CRM Integration',
    description: 'Sync your HubSpot CRM with Grafty Meta BSP. Automate sales follow-ups and log complete WhatsApp conversation histories natively in HubSpot.',
    heroTitle: 'Supercharge <span className="text-emerald-500">HubSpot</span> with WhatsApp.',
    icon: Users,
    useCases: [
      { title: 'Contact Sync', desc: 'Automatically push incoming WhatsApp leads directly into your HubSpot Contacts list.', icon: Database },
      { title: 'Workflow Automation', desc: 'Trigger HubSpot workflows based on specific WhatsApp flow interactions or keyword replies.', icon: Globe }
    ],
    schema: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "HubSpot WhatsApp Integration by Grafty",
      "applicationCategory": "BusinessApplication"
    }
  }
};
