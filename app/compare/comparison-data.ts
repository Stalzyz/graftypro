import { 
  ShieldCheck, 
  Zap, 
  DollarSign, 
  Cpu, 
  Users, 
  TrendingUp,
  XCircle,
  CheckCircle2
} from 'lucide-react';

export const COMPARISON_DATA: Record<string, any> = {
  "wati": {
    competitor: "WATI",
    title: "Grafty vs WATI: The Better Alternative for High-Growth Brands",
    slug: "wati",
    description: "Looking for a WATI alternative? See why Grafty's goal-driven architecture and transparent pricing are preferred by enterprise teams.",
    comparison: [
      { feature: "Pricing Model", grafty: "Usage-Based / Credits", competitor: "High Monthly Base Fee" },
      { feature: "Flow Builder", grafty: "Advanced / Goal-Driven", competitor: "Basic Visual Builder" },
      { feature: "API Access", grafty: "Full / No Extra Cost", competitor: "Limited on Starter Plans" },
      { feature: "CTWA Automation", grafty: "Native Support", competitor: "Complex Integration" },
      { feature: "Team Seats", grafty: "Unlimited (Pro Tier)", competitor: "Extra Charge per Agent" }
    ],
    summary: "WATI is a great tool for beginners, but Grafty provides the industrial infrastructure needed for teams that want to scale through automation rather than just manual chatting.",
    whyGrafty: [
      "No hidden 'per-agent' fees. Scale your team without scaling your invoice.",
      "Atomic credit economy. Pay only for what you send.",
      "72-hour free window automation for CTWA ads comes built-in."
    ]
  },
  "interakt": {
    competitor: "Interakt",
    title: "Grafty vs Interakt: Enterprise WhatsApp Marketing Comparison",
    slug: "interakt",
    description: "Compare Interakt and Grafty. Discover why serious business operators choose Grafty for advanced flow logic and better ROI tracking.",
    comparison: [
      { feature: "UI Design", grafty: "High-Performance Authority", competitor: "Standard Business SaaS" },
      { feature: "Custom Integration", grafty: "Full REST API / Webhooks", competitor: "Limited External Hooks" },
      { feature: "Cost Efficiency", grafty: "Unified Credit Engine", competitor: "Multiple Subscription Tiers" },
      { feature: "Flow Depth", grafty: "Nested Infinite Logic", competitor: "Standard Tree Logic" },
      { feature: "White-Labeling", grafty: "Professional Options", competitor: "Not Available" }
    ],
    summary: "Interakt is reliable for standard marketing, but Grafty is built for 'Orchestration'. If you need to connect WhatsApp to complex internal systems, Grafty is the clear winner.",
    whyGrafty: [
        "Advanced CRM features like 'Vendor Highlights' and 'Follow-up Scheduler' are included.",
        "Developer-first API documentation for technical teams.",
        "Faster server response times on the official BSP infrastructure."
    ]
  },
  "aisensy": {
    competitor: "AiSensy",
    title: "Grafty vs AiSensy: Choosing the Right WhatsApp BSP",
    slug: "aisensy",
    description: "AiSensy vs Grafty comparison. Learn which platform offers more power for automated campaigns and green tick assistance.",
    comparison: [
      { feature: "Ad Attribution", grafty: "UTM / Dynamic Tracking", competitor: "Standard Tracking" },
      { feature: "Green Tick Help", grafty: "Expert Audit Included", competitor: "Self-Serve Application" },
      { feature: "User Interface", grafty: "Premium Modern UX", competitor: "Legacy Dashboard" },
      { feature: "Marketing Tiers", grafty: "Native Scaling Logic", competitor: "Tier-based limits" },
      { feature: "Support SLA", grafty: "Priority 2h Response", competitor: "Email Only" }
    ],
    summary: "Grafty offers a more premium, high-speed experience for brands that value their user experience and want priority support for high-volume campaigns.",
    whyGrafty: [
        "Modern, glassmorphism UI that teams actually enjoy using daily.",
        "Deep integration with Shopify and Meta Ads Manager.",
        "Expert strategic consultation for Green Badge verification."
    ]
  }
};
