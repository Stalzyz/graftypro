import { 
  ShoppingBag, 
  Home, 
  GraduationCap, 
  Stethoscope, 
  Cpu, 
  Building2,
  Users,
  Calendar,
  MessageSquare,
  Zap,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Dumbbell,
  Scissors,
  BarChart3,
  Utensils,
  Smartphone,
  Mail,
  FileText,
  CreditCard
} from 'lucide-react';

export const SOLUTIONS_DATA: Record<string, any> = {
  "ecommerce": {
    title: "E-commerce & Retail",
    slug: "ecommerce",
    icon: ShoppingBag,
    description: "Scale your storefront with automated recovery and high-conversion marketing flows directly inside WhatsApp.",
    heroTitle: "Turn WhatsApp into your <br/><span className='text-gradient'>Highest Volume Channel.</span>",
    problem: "Email open rates are dying. SMS is expensive and untrusted. E-commerce brands need a direct, high-trust channel to recover lost revenue.",
    solution: "Grafty connects your store to the WhatsApp API, allowing for instant abandoned cart recovery, automated tracking updates, and one-click payment links.",
    features: [
      {
        title: "Abandoned Cart Recovery",
        desc: "Automated flows that trigger when a user leaves checkout. 45% recovery rate vs 5% on email.",
        icon: TrendingUp
      },
      {
        title: "Order Status & Tracking",
        desc: "Reduce 'Where is my order' tickets by 80% with proactive WhatsApp notifications.",
        icon: Zap
      },
      {
        title: "Drip Marketing",
        desc: "Segment your audience and send personalized product offers based on past purchases.",
        icon: Users
      }
    ],
    caseStudy: {
      client: "Luxury Watch Retailer",
      result: "32% increase in ROI",
      quote: "Grafty replaced our email marketing for abandoned carts and the results were immediate. Our customers prefer chatting over reading emails."
    }
  },
  "gym-fitness": {
    title: "Gyms & Fitness Centers",
    slug: "gym-fitness",
    icon: Dumbbell,
    description: "Drive member retention and automate renewal follow-ups with high-engagement WhatsApp sequences.",
    heroTitle: "Build a <br/><span className='text-gradient'>Loyal Fitness Community.</span>",
    problem: "Gyms lose 60% of their members due to inconsistent engagement. Manual follow-ups for renewals and nutrition upsells are impossible at scale.",
    solution: "Grafty automates the member lifecycle: from lead qualification and trial reminders to automated renewal payments and supplement store upsells.",
    features: [
      {
        title: "Renewal Automations",
        desc: "Intelligent reminders sent before membership expiry with integrated 1-click payment links.",
        icon: CreditCard
      },
      {
        title: "Attendance-Based Drips",
        desc: "Reach out automatically to members who haven't visited in 5 days to keep them motivated.",
        icon: Mail
      },
      {
        title: "Nutrition Store",
        desc: "Launch an in-chat supplement store. Members can buy protein or gear by typing 'STORE'.",
        icon: ShoppingBag
      }
    ],
    caseStudy: {
      client: "IronBody Gym Chain",
      result: "40% Higher Renewal Rate",
      quote: "Grafty's automated reminders for renewals saved us hundreds of man-hours each month while increasing our revenue significantly."
    }
  },
  "saloon-spa": {
    title: "Saloons & Wellness Spas",
    slug: "saloon-spa",
    icon: Scissors,
    description: "24/7 self-service booking, stylist commission tracking, and automated loyalty rewards via WhatsApp.",
    heroTitle: "Automated Booking <br/><span className='text-gradient'>While You Are Closed.</span>",
    problem: "Receptionists are over-burdened with calls. Peak-hour appointments are missed, and no-shows cost saloons thousands in lost stylist time.",
    solution: "Grafty provides a complete self-service booking flow. Customers pick services, select their favorite stylist, and pay an advance to confirm—all in WhatsApp.",
    features: [
      {
        title: "Stylist Management",
        desc: "Dynamic flows that check live stylist availability and allow customers to book their preferred pro.",
        icon: Users
      },
      {
        title: "No-Show Protection",
        desc: "Collect advance payments to secure bookings. Send 1-hour automated confirmation reminders.",
        icon: ShieldCheck
      },
      {
        title: "Membership Program",
        desc: "Tag loyal customers. Automatically apply discounts and VIP perks based on their visit history.",
        icon: TrendingUp
      }
    ],
    caseStudy: {
      client: "GlowUp Wellness",
      result: "95% Reduction in No-Shows",
      quote: "Clients love the convenience of booking at midnight via WhatsApp. It has completely offloaded our front desk staff."
    }
  },
  "real-estate": {
    title: "Real Estate & Prop-Tech",
    slug: "real-estate",
    icon: Home,
    description: "Qualify leads instantly, schedule site visits, and share brochures via automated WhatsApp bots.",
    heroTitle: "Leads don't wait. <br/><span className='text-gradient'>Close faster on WhatsApp.</span>",
    problem: "Real estate leads cool down in minutes. Missing a call or failing to send a brochure instantly means losing a high-ticket client.",
    solution: "Automate the entire top-of-funnel. Let our AI bot qualify interest, collect budget info, and send PDF brochures 24/7.",
    features: [
      {
        title: "Instant Lead Qualification",
        desc: "Bots ask the right questions: Budget, Location, BHK. Only high-intent leads reach your agents.",
        icon: ShieldCheck
      },
      {
        title: "Site Visit Scheduler",
        desc: "Integrated calendar flows allow users to book site visits directly within the chat.",
        icon: Calendar
      },
      {
        title: "Brochure Automation",
        desc: "Deliver high-res property PDFs and virtual tour links instantly when a user expresses interest.",
        icon: MessageSquare
      }
    ],
    caseStudy: {
      client: "Global Reality Group",
      result: "4x increase in Site Visits",
      quote: "The bot kvalifies users while my team sleeps. By the time my agents start work, they have a list of confirmed appointments."
    }
  },
  "education": {
    title: "Education & EdTech",
    slug: "education",
    icon: GraduationCap,
    description: "Scale student admissions, fee reminders, and course updates with conversational automation.",
    heroTitle: "Enrollment at scale. <br/><span className='text-gradient'>Educate on the go.</span>",
    problem: "Admissions leads go cold quickly. Manual fee follow-ups are time-consuming for staff. Students miss critical course updates on email.",
    solution: "Use WhatsApp for instant lead qualification, automated fee payment links, and high-engagement course notification drips.",
    features: [
      {
        title: "Admission Lead Bot",
        desc: "Instant responses to course inquiries. Collect student data and qualify leads 24/7.",
        icon: Users
      },
      {
        title: "Fee Reminder Flows",
        desc: "Automated billing alerts with integrated payment links. Improve collection speed by 40%.",
        icon: Zap
      },
      {
        title: "Student Engagement",
        desc: "Daily lesson summaries, quiz bots, and critical exam notifications delivered where students are active.",
        icon: MessageSquare
      }
    ],
    caseStudy: {
      client: "BrightFuture Academy",
      result: "25% Increase in Admissions",
      quote: "Our admission team can now focus on counseling high-intent students while the Grafty bot handles the basic inquiries."
    }
  },
  "agencies": {
    title: "Digital Marketing Agencies",
    slug: "agencies",
    icon: BarChart3,
    description: "Scale your clients' ROI with white-labeled lead nurturing and automated CRM synchronization.",
    heroTitle: "The ROI Engine <br/><span className='text-gradient'>For Modern Agencies.</span>",
    problem: "Agencies generate leads, but clients fail to follow up. Proving value is hard when leads aren't being converted into meetings or sales.",
    solution: "Grafty gives agencies a white-label engine to nurture leads for their clients. Automate the qualification and booking, then hand over a hot lead.",
    features: [
      {
        title: "White Label Dashboard",
        desc: "Resell Grafty under your own agency branding. Set your own margins and build proprietary tech value.",
        icon: Building2
      },
      {
        title: "CRM Bridge Sync",
        desc: "Native integration with Salesforce, HubSpot, and Google Sheets for multi-client lead management.",
        icon: Zap
      },
      {
        title: "Custom CTWA Flows",
        desc: "Build high-converting Click-to-WhatsApp landing pages that maximize your clients' ad spend.",
        icon: Smartphone
      }
    ],
    caseStudy: {
      client: "GrowthPulse Agency",
      result: "3x Higher Client Retention",
      quote: "Grafty allowed us to go from being 'just another agency' to a technology partner that actually delivers closed deals."
    }
  },
  "restaurants": {
    title: "Restaurants & QSRs",
    slug: "restaurants",
    icon: Utensils,
    description: "Official Scan-to-Order menu, automated table booking, and direct marketing without the 30% commission.",
    heroTitle: "Your Own <br/><span className='text-gradient'>Direct Ordering System.</span>",
    problem: "Delivery apps take huge commissions. Staffing shortages lead to slow table service. Customer data is lost to third-party platforms.",
    solution: "Grafty's QR-to-WhatsApp system lets customers browse the menu, order, and pay at their table. You own the data and keep 100% of the revenue.",
    features: [
      {
        title: "Digital QR Ordering",
        desc: "Interactive menus in WhatsApp. Faster ordering for customers and reduced labor for you.",
        icon: ShoppingBag
      },
      {
        title: "Loyalty & Rewards",
        desc: "Automated 'Thank You' flows that track points and drive repeat visits via broadcast offers.",
        icon: Users
      },
      {
        title: "Table Reservations",
        desc: "Handle bookings 24/7 without a phone operator. Sync availability with your physical floor plan.",
        icon: Calendar
      }
    ],
    caseStudy: {
      client: "SpiceRoute Kitchen",
      result: "15% Margin Increase",
      quote: "Switching from Swiggy to our own WhatsApp ordering saved us huge commission fees and helped us build a loyal customer list."
    }
  },
  "ctwa-ads": {
    title: "CTWA Ad Automation",
    slug: "ctwa-ads",
    icon: Zap,
    description: "Convert ad clicks into conversational leads instantly. Leverage Meta's 72-hour free messaging window.",
    heroTitle: "Stop letting ad clicks wither. <br/><span className='text-gradient'>Converge on WhatsApp instantly.</span>",
    problem: "Marketing spend is wasted on high-friction landing pages. Users drop off before filling forms. Advertisers pay Meta for every conversation.",
    solution: "Grafty optimizes CTWA ads by triggering the 72-hour free messaging window. Our Flow Builder captures lead data immediately.",
    features: [
      {
        title: "72-Hour Free Window",
        desc: "Meta waives conversation charges for chats started via CTWA. Grafty uses this window for zero-cost follow-ups.",
        icon: DollarSign
      },
      {
        title: "Precision Attribution",
        desc: "Identify exactly which ad creative or campaign triggered the chat. Optimize your spend accurately.",
        icon: TrendingUp
      },
      {
        title: "Instant Verification",
        desc: "The moment a user clicks your ad, Grafty verifies their name and phone number automatically.",
        icon: ShieldCheck
      }
    ],
    caseStudy: {
      client: "Premium Auto Dealer",
      result: "60% Lower Cost Per Lead",
      quote: "The 72-hour free window allowed us to follow up 5 times without paying Meta a cent. Our conversion rates tripled."
    }
  }
};
