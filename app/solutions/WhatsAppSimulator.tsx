"use client";
import React, { useState, useEffect } from "react";
import { Send, Check, CheckCheck, User, MoreVertical, Phone, Video, Search, ChevronRight, Zap } from "lucide-react";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  time: string;
  type?: 'text' | 'button' | 'image' | 'video';
  options?: string[];
}

interface WhatsAppSimulatorProps {
  industry: string;
}

const INDUSTRY_FLOWS: Record<string, Message[]> = {
  education: [
    { id: 1, text: "Welcome to BrightFuture Academy! 🎓 What course are you interested in today?", isBot: true, time: "10:00 AM" },
    { id: 2, text: "UI/UX Design", isBot: false, time: "10:01 AM" },
    { id: 3, text: "Great choice! 🎨 Here's our curriculum PDF. Would you like to schedule a free demo session?", isBot: true, time: "10:01 AM", type: 'button', options: ["Yes, Schedule Demo", "Ask a Question"] }
  ],
  ecommerce: [
    { id: 1, text: "Hi! You left items in your cart. 🛒 We've reserved them for you!", isBot: true, time: "02:15 PM" },
    { id: 2, text: "I was busy! Can I get a discount?", isBot: false, time: "02:20 PM" },
    { id: 3, text: "Sure! Use code SAVE10 for 10% OFF. 🎁 Click below to checkout now.", isBot: true, time: "02:20 PM", type: 'button', options: ["Complete Order", "Not Now"] }
  ],
  "real-estate": [
    { id: 1, text: "Hi! You enquired about 'VILLA SIERRA'. 🏡 Would you like to see the virtual tour?", isBot: true, time: "09:30 AM" },
    { id: 2, text: "Yes, please!", isBot: false, time: "09:31 AM" },
    { id: 3, text: "🎬 [Video Sent] - It's even better in person! Would you like to book a site visit this Saturday?", isBot: true, time: "09:31 AM", type: 'button', options: ["Book Site Visit", "Talk to Broker"] }
  ],
  "gym-fitness": [
    { id: 1, text: "Hi Alex! Your membership at APEX GYM expires in 3 days. 🏋️‍♂️ Renew now for a 5% early-bird discount!", isBot: true, time: "11:00 AM" },
    { id: 2, text: "I'll do it now!", isBot: false, time: "11:05 AM" },
    { id: 3, text: "Awesome! 💳 Use this link for 1-click Razorpay payment. See you at the rack!", isBot: true, time: "11:05 AM", type: 'button', options: ["Renew Membership", "Remind Later"] }
  ],
  "saloon-spa": [
    { id: 1, text: "Welcome to GlowUp Spa! ✨ Ready for your 24/7 self-service booking?", isBot: true, time: "06:00 PM" },
    { id: 2, text: "I need a haircut from Marco", isBot: false, time: "06:05 PM" },
    { id: 3, text: "Marco is available at 11:00 AM & 02:00 PM tomorrow. 💇‍♂️ Which slot works best?", isBot: true, time: "06:05 AM", type: 'button', options: ["11:00 AM", "02:00 PM"] }
  ],
  restaurants: [
    { id: 1, text: "Table 4 - Welcome to SpiceRoute! 🥘 Scanned successfully. Ready to order?", isBot: true, time: "08:15 PM" },
    { id: 2, text: "Show Menu", isBot: false, time: "08:16 PM" },
    { id: 3, text: "🍕 [Menu Displayed] - Direct ordering active. What can we cook for you?", isBot: true, time: "08:16 PM", type: 'button', options: ["Order Online", "Call Waiter"] }
  ],
  agencies: [
    { id: 1, text: "Lead Qualified: Sarah Jones (UI/UX) 🎯 ROI tracking activated for your client.", isBot: true, time: "01:00 PM" },
    { id: 2, text: "Sync to HubSpot?", isBot: false, time: "01:05 PM" },
    { id: 3, text: "✅ Done! All data pushed to client CRM. ROI increased by 450% across this campaign.", isBot: true, time: "01:05 PM" }
  ]
};

export function WhatsAppSimulator({ industry }: WhatsAppSimulatorProps) {
  const messages = INDUSTRY_FLOWS[industry] || INDUSTRY_FLOWS.education;
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset and start animation
    setVisibleMessages([]);
    setCurrentIndex(0);
    
    // Animation logic
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev < messages.length) {
          setVisibleMessages(m => [...m, messages[prev]]);
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [industry]);

  return (
    <div className="w-full max-w-[360px] mx-auto bg-slate-900 rounded-[50px] p-4 shadow-2xl border-[8px] border-slate-800 relative h-[650px] overflow-hidden group">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20" />
      
      {/* Search/Icons Header Overlay */}
      <div className="absolute top-8 left-0 right-0 h-14 bg-emerald-700 flex items-center px-6 gap-3 text-white z-10 shadow-lg">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <User size={18} />
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-black tracking-tight">{industry.toUpperCase()} OFFICIAL</h4>
            <p className="text-[10px] opacity-80 font-bold">online</p>
        </div>
        <Video size={18} className="opacity-60" />
        <Phone size={16} className="opacity-60" />
        <MoreVertical size={18} className="opacity-60" />
      </div>

      {/* Screen / Content */}
      <div className="bg-[#e5ddd5] h-full pt-28 pb-20 px-4 overflow-y-auto overflow-x-hidden relative flex flex-col gap-4 custom-scrollbar">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}></div>

        {visibleMessages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.isBot ? 'items-start' : 'items-end'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
            {/* Bubble */}
            <div className={`relative max-w-[85%] p-3 rounded-2xl text-xs font-semibold shadow-sm ${msg.isBot ? 'bg-white text-slate-800 rounded-tl-none' : 'bg-[#dcf8c6] text-slate-800 rounded-tr-none'}`}>
              {msg.text}
              <div className="flex justify-end items-center gap-1 mt-1">
                <span className="text-[8px] opacity-40">{msg.time}</span>
                {!msg.isBot && <CheckCheck size={10} className="text-[#34b7f1]" />}
              </div>

              {/* Arrow */}
              <div className={`absolute top-0 w-3 h-3 ${msg.isBot ? 'left-[-8px] bg-white' : 'right-[-8px] bg-[#dcf8c6]'}`} style={{ clipPath: msg.isBot ? 'polygon(100% 0, 0 0, 100% 100%)' : 'polygon(0 0, 0 100%, 100% 0)' }}></div>
            </div>

            {/* Buttons UI */}
            {msg.type === 'button' && msg.options && (
              <div className="flex flex-col gap-2 mt-2 w-full max-w-[85%]">
                {msg.options.map((opt, oi) => (
                  <button key={oi} className="w-full bg-white text-[#0693e3] p-2 rounded-xl text-[11px] font-black border border-slate-100 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group/btn">
                    {opt} <ChevronRight size={10} className="group-hover/btn:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#f0f2f5] px-4 flex items-center gap-3">
        <div className="flex-1 bg-white h-11 rounded-full px-5 flex items-center text-slate-400 text-xs font-bold gap-3">
            <Zap size={14} className="text-emerald-500" /> Message...
        </div>
        <div className="w-11 h-11 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg">
            <Send size={18} />
        </div>
      </div>
    </div>
  );
}
