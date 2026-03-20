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
  DollarSign
} from 'lucide-react';

export const SOLUTIONS_DATA: Record<string, any> = {
  "ecommerce": {
    title: "WhatsApp for E-commerce & Retail",
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
  "real-estate": {
    title: "WhatsApp for Real Estate & Prop-Tech",
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
  "saas-automation": {
    title: "WhatsApp for SaaS & IT Automation",
    slug: "saas-automation",
    icon: Cpu,
    description: "Integrate your technical stack with WhatsApp for alerts, onboarding, and developer support.",
    heroTitle: "Programmable <br/><span className='text-gradient'>Communication Infrastructure.</span>",
    problem: "Platform alerts hidden in dashboards are ignored. Critical system notifications and onboarding steps need urgent attention.",
    solution: "Use the Grafty API to bridge your backend to WhatsApp. Send server alerts, auth tokens, and interactive onboarding flows.",
    features: [
      {
        title: "REST API Integration",
        desc: "Connect your existing backend via our robust API. Trigger messages based on any system event.",
        icon: Zap
      },
      {
        title: "2FA & Security",
        desc: "Deliver high-speed authentication codes at a fraction of the cost of international SMS providers.",
        icon: ShieldCheck
      },
      {
        title: "Onboarding Flows",
        desc: "Guide new users through your platform features with interactive WhatsApp-based training.",
        icon: Users
      }
    ],
    caseStudy: {
      client: "Fintech Platform",
      result: "99% Delivery Rate",
      quote: "Global SMS was inconsistent for our OTPs. Switching to Grafty's WhatsApp Auth saved us 40% in costs and improved delivery speeds."
    }
  },
  "healthcare": {
    title: "WhatsApp for Healthcare & Appointments",
    slug: "healthcare",
    icon: Stethoscope,
    description: "Manage patient communications, appointment reminders, and digital reports with high-trust automation.",
    heroTitle: "Care beyond the clinic. <br/><span className='text-gradient'>Sync with patients on WhatsApp.</span>",
    problem: "Missed appointments cost clinics thousands. Manual calling for reminders is repetitive. Patients struggle to access digital reports and prescriptions.",
    solution: "Automate appointment reminders with 'Confirm' buttons. Deliver HIPAA-compliant notification links and handle prescription refills via AI bots.",
    features: [
      {
        title: "Appointment Reminders",
        desc: "2nd day and 2hr reminders with automated rescheduling logic. Reduce no-show rates by 60%.",
        icon: Calendar
      },
      {
        title: "Digital Report Delivery",
        desc: "Send secure links to laboratory reports and prescriptions directly to the patient's WhatsApp.",
        icon: ShieldCheck
      },
      {
        title: "Telehealth Triage",
        desc: "Automated symptom checkers that guide patients to the right specialist or emergency care.",
        icon: MessageSquare
      }
    ],
    caseStudy: {
      client: "City Health Hospital",
      result: "70% Reduction in No-Shows",
      quote: "Grafty transformed our patient experience. The automated reminders alone paid for the platform in the first month."
    }
  },
  "education": {
    title: "WhatsApp for Education & EdTech",
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
  "ctwa-ads": {
    title: "Meta Click-to-WhatsApp (CTWA) Ad Automation",
    slug: "ctwa-ads",
    icon: Zap,
    description: "Convert ad clicks into conversational leads instantly. Leverage Meta's 72-hour free messaging window to maximize ROI.",
    heroTitle: "Stop letting ad clicks wither. <br/><span className='text-gradient'>Converge on WhatsApp instantly.</span>",
    problem: "Marketing spend is wasted on high-friction landing pages. Users drop off before filling forms. Advertisers pay Meta for every conversation, eating into margins.",
    solution: "Grafty optimizes CTWA ads by triggering the 72-hour free messaging window. Our Flow Builder captures lead data immediately, ensuring 100% attribution and zero dead-leads.",
    features: [
      {
        title: "72-Hour Free Window",
        desc: "Meta waives conversation charges for chats started via CTWA. Grafty uses this window for multi-day nurturing at zero cost.",
        icon: DollarSign
      },
      {
        title: "Precision Attribution",
        desc: "Identify exactly which ad creative or campaign triggered the chat. Optimize your spend based on chat quality, not just clicks.",
        icon: TrendingUp
      },
      {
        title: "Instant Verification",
        desc: "The moment a user clicks your ad, Grafty verifies their name and phone number, populating your CRM automatically.",
        icon: ShieldCheck
      }
    ],
    caseStudy: {
      client: "Premium Auto Dealer",
      result: "60% Lower Cost Per Lead",
      quote: "Switching from lead forms to Grafty-powered CTWA ads changed everything. The 72-hour free window allowed us to follow up 5 times without paying Meta a cent."
    }
  }
};
