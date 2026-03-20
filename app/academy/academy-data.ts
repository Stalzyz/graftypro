import { 
  BookOpen, 
  Lightbulb, 
  Settings, 
  Target, 
  Rocket, 
  ShieldCheck,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

export const ACADEMY_ARTICLES: Record<string, any> = {
  "how-to-verify-meta-business": {
    title: "The Ultimate Guide to Meta Business Verification",
    slug: "how-to-verify-meta-business",
    category: "Technical",
    icon: ShieldCheck,
    description: "Learn the step-by-step process to get your Meta Business Manager verified for high-volume WhatsApp messaging.",
    content: [
      {
        type: "paragraph",
        text: "Meta Business Verification is the gateway to unlocking the full potential of the WhatsApp Business API. Without it, you are limited to a trial tier with restricted messaging volumes."
      },
      {
        type: "heading",
        text: "Mandatory Documents for Verification"
      },
      {
        type: "list",
        items: [
          "Business Registration (GST, Incorporation Certificate, or Trade License)",
          "Proof of Business Address (Utility bills or Bank statements)",
          "Website Domain Ownership (Must match business details)",
          "Professional Email (admin@yourbusiness.com)"
        ]
      },
      {
        type: "heading",
        text: "The Step-by-Step Execution"
      },
      {
        type: "paragraph",
        text: "1. Navigate to Meta Business Suite -> Settings -> Business Info.\n2. Click 'View Details' in the Business Verification Status section.\n3. Upload your documents precisely. Ensure the name on the document matches your Meta Business name exactly."
      }
    ]
  },
  "whatsapp-automation-for-real-estate-guide": {
    title: "How WhatsApp Automation Transforms Real Estate Growth",
    slug: "whatsapp-automation-for-real-estate-guide",
    category: "Industry Intelligence",
    icon: Target,
    description: "Discover how real estate developers use WhatsApp to qualify leads 24/7 and increase site visits by 400%.",
    content: [
      {
        type: "paragraph",
        text: "In real estate, lead response time is the difference between a sale and a lost opportunity. Automation allows you to be 'always on' without hiring a massive call center."
      },
      {
        type: "heading",
        text: "Key Automation Use Cases"
      },
      {
        type: "list",
        items: [
          "Instant Brochure Delivery: Send high-res property PDFs via automated reply.",
          "Qualification Bots: Ask about budget and preferred location before involving a sales agent.",
          "Site Visit Reminders: Automated follow-ups 24 hours before a scheduled visit.",
          "Virtual Tour Links: Deliver 360-degree tour links directly in chat."
        ]
      },
      {
        type: "heading",
        text: "The ROI Equation"
      },
      {
        type: "paragraph",
        text: "By filtering out 'unqualified' window shoppers using an AI bot, agents spend 100% of their time on high-intent buyers, leading to higher closing rates."
      }
    ]
  },
  "ecommerce-whatsapp-marketing-playbook": {
    title: "The E-commerce WhatsApp Marketing Playbook",
    slug: "ecommerce-whatsapp-marketing-playbook",
    category: "Industry Intelligence",
    icon: Rocket,
    description: "Scale your retail brand with abandoned cart flows, automated order tracking, and personalized marketing drips.",
    content: [
      {
        type: "paragraph",
        text: "Modern shoppers ignore emails and delete SMS. WhatsApp has a 98% open rate, making it the highest ROI channel for D2C brands."
      },
      {
        type: "heading",
        text: "The 3 Pillars of E-commerce Automation"
      },
      {
        type: "list",
        items: [
          "Recovery: Automated abandoned cart reminders with dynamic discount codes.",
          "Retention: Shipping updates and 'Out for Delivery' alerts to reduce WISMO (Where Is My Order) calls.",
          "Growth: Re-engagement campaigns based on past purchase behavior."
        ]
      },
      {
        type: "heading",
        text: "Conversion Optimization"
      },
      {
        type: "paragraph",
        text: "Using 'Quick Reply' buttons instead of requiring users to type increases interaction rates by over 50%."
      }
    ]
  },
  "how-to-use-whatsapp-flows": {
    title: "Mastering WhatsApp Interactive Flows",
    slug: "how-to-use-whatsapp-flows",
    category: "Technical",
    icon: Settings,
    description: "A deep dive into building non-linear automation trees using the Grafty Flow Builder.",
    content: [
      {
        type: "paragraph",
        text: "WhatsApp Flows allow you to create rich, app-like experiences inside the chat. This guide covers how to structure your logic."
      },
      {
        type: "heading",
        text: "Logical Nodes Explained"
      },
      {
        type: "list",
        items: [
          "Message Node: Standard text or media output.",
          "Condition Node: If/Else logic based on user input or CRM data.",
          "API Node: Fetch data from external servers during the chat.",
          "Jump Node: Loop users back to specific points in the conversation."
        ]
      },
      {
        type: "paragraph",
        text: "Pro Tip: Always include an 'agent fallback' node so users can reach a human if the automation doesn't solve their query."
      }
    ]
  }
};

export const ACADEMY_CATEGORIES = [
  { name: "Technical", icon: Settings, desc: "Configuration & API Handshakes" },
  { name: "Industry Intelligence", icon: Target, desc: "Vertical-Specific Strategies" },
  { name: "Marketing Strategy", icon: TrendingUp, desc: "ROI & Conversion Tactics" }
];
