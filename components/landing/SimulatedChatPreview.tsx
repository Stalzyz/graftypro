"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Menu, Phone, MoreVertical, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
    id: string;
    text: string;
    sender: "bot" | "user";
    type?: "text" | "image" | "buttons";
    options?: string[];
    delay?: number;
};

const DEMO_FLOW: Record<string, Message[]> = {
    start: [
        { id: "1", text: "Hi there! 👋 Welcome to Grafty Business.", sender: "bot", delay: 500 },
        { id: "2", text: "I can help you grow your business on WhatsApp. What would you like to explore?", sender: "bot", type: "buttons", options: ["Automate Sales 🚀", "Recover Carts 🛒", "Support Agents 🎧"], delay: 1500 }
    ],
    "Automate Sales 🚀": [
        { id: "3", text: "Great choice! 🚀", sender: "bot", delay: 500 },
        { id: "4", text: "With Grafty, you can build automated sales funnels that qualify leads 24/7.", sender: "bot", delay: 1500 },
        { id: "5", text: "Would you like to see a live revenue report?", sender: "bot", type: "buttons", options: ["Show Me Money 💰", "Maybe Later"], delay: 2500 }
    ],
    "Recover Carts 🛒": [
        { id: "6", text: "Smart move! 💡", sender: "bot", delay: 500 },
        { id: "7", text: "We automatically detect abandoned checkouts and send timely reminders.", sender: "bot", delay: 1500 },
        { id: "8", text: "Our users see a 25% recovery rate on average.", sender: "bot", type: "buttons", options: ["Start Free Trial", "How it works?"], delay: 2500 }
    ],
    "Support Agents 🎧": [
        { id: "9", text: "Efficiency is key! 🔑", sender: "bot", delay: 500 },
        { id: "10", text: "Route chats to human agents only when needed, or let AI handle the FAQs.", sender: "bot", type: "buttons", options: ["See Inbox", "AI Features"], delay: 1500 }
    ],
    "Show Me Money 💰": [
        { id: "11", text: "Here is a sample weekly report for a fashion brand using Grafty:", sender: "bot", type: "image", delay: 1000 },
        { id: "12", text: "Ready to scale?", sender: "bot", type: "buttons", options: ["Sign Up Now ⚡️"], delay: 2000 }
    ],
    default: [
        { id: "99", text: "That's just a glimpse! Create your account to build this exact flow in minutes.", sender: "bot", type: "buttons", options: ["Get Started Free"], delay: 1000 }
    ]
};

export default function SimulatedChatPreview() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [choices, setChoices] = useState<string[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        triggerSequence("start");
    }, []);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const triggerSequence = async (key: string) => {
        const sequence = DEMO_FLOW[key] || DEMO_FLOW["default"];
        setChoices([]); // Hide previous options

        for (const msg of sequence) {
            setIsTyping(true);
            await new Promise(r => setTimeout(r, msg.delay || 1000));

            setIsTyping(false);
            setMessages(prev => [...prev, { ...msg, id: Math.random().toString() }]);

            if (msg.type === "buttons" && msg.options) {
                setChoices(msg.options);
            }
        }
    };

    const handleUserChoice = (choice: string) => {
        if (choice === "Sign Up Now ⚡️" || choice === "Get Started Free" || choice === "Start Free Trial") {
            window.location.href = "/register";
            return;
        }

        // Add user message immediately
        setMessages(prev => [...prev, { id: Math.random().toString(), text: choice, sender: "user" }]);
        setChoices([]); // Clear buttons

        // Trigger bot response
        triggerSequence(choice);
    };

    return (
        <div className="relative w-full max-w-[380px] mx-auto bg-slate-900 border-[8px] border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden h-[600px] flex flex-col font-sans">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-slate-800 rounded-b-xl z-20"></div>

            {/* Header */}
            <div className="bg-[#075E54] p-4 pt-10 text-white flex items-center gap-3 shadow-md z-10">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">WB</div>
                <div className="flex-1">
                    <h3 className="font-bold text-sm">Grafty Business</h3>
                    <p className="text-[10px] opacity-80">Typically replies instantly</p>
                </div>
                <div className="flex gap-3 text-white/80">
                    <Phone size={16} />
                    <MoreVertical size={16} />
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-[#0b141a] p-4 overflow-y-auto space-y-4 relative scrollbar-hide">
                <style jsx>{`
                    .scrollbar-hide::-webkit-scrollbar { display: none; }
                `}</style>

                {/* Chat Background Pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}
                />

                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[80%] rounded-lg p-3 text-sm shadow-sm relative ${msg.sender === "user"
                                ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none"
                                : "bg-[#202c33] text-[#e9edef] rounded-tl-none"
                                }`}>
                                {msg.type === 'image' ? (
                                    <div className="mb-2 bg-white/10 h-32 w-full rounded flex items-center justify-center text-xs text-slate-400">
                                        [Chart Image Placeholder]
                                    </div>
                                ) : null}
                                {msg.text}
                                <span className="text-[9px] text-white/50 block text-right mt-1">
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-[#202c33] px-4 py-2 rounded-full rounded-tl-none flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                        </div>
                    </motion.div>
                )}

                {/* Choices */}
                {choices.length > 0 && !isTyping && (
                    <div className="flex flex-col gap-2 mt-4 items-center">
                        {choices.map((choice, i) => (
                            <motion.button
                                key={choice}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => handleUserChoice(choice)}
                                className="w-full bg-[#202c33] hover:bg-[#2a3942] text-[#00a884] font-medium py-2.5 px-4 rounded-lg text-sm transition-colors shadow-md border border-[#2a3942]"
                            >
                                {choice}
                            </motion.button>
                        ))}
                    </div>
                )}

                <div ref={bottomRef} className="h-4" />
            </div>

            {/* Input Area (Fake) */}
            <div className="bg-[#202c33] p-3 flex items-center gap-3 border-t border-slate-800 z-10">
                <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center">
                    <span className="text-lg">😊</span>
                </div>
                <div className="flex-1 bg-[#2a3942] rounded-lg h-9 px-3 flex items-center text-slate-500 text-sm">
                    Type a message
                </div>
                <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-lg">
                    <Send size={18} />
                </div>
            </div>
        </div>
    );
}
