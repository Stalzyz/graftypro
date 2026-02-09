
"use client";
import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, PhoneCall } from 'lucide-react';
import Link from 'next/link';

export default function InteractiveWidgets() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hi! I am the WAVO AI assistant. How can I help you grow your business on WhatsApp today?' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        const newMsg = { role: 'user', text: input };
        setMessages([...messages, newMsg]);
        setInput('');

        // Simulate AI Response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: "That's a great question about WhatsApp automation! Our platform can help you with that using the Cloud API. Would you like to speak with a human expert via WhatsApp?"
            }]);
        }, 1000);
    };

    return (
        <>
            {/* WhatsApp Floating FAB */}
            <Link
                href="https://wa.me/919789359407"
                target="_blank"
                className="fixed bottom-8 right-24 w-16 h-16 bg-[#25d366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-[9998] group"
            >
                <MessageCircle size={32} fill="white" />
                <span className="absolute right-full mr-4 bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                    Chat with an Expert
                </span>
            </Link>

            {/* AI Chat Bot Widget */}
            <div className={`fixed bottom-8 right-6 z-[9999] transition-all duration-300 ${isChatOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}`}>
                <div className="w-[380px] h-[500px] bg-slate-900 border border-slate-700/50 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-wa-green to-blue-600 p-6 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                <Bot className="text-white" size={20} />
                            </div>
                            <div>
                                <div className="text-white font-black text-sm tracking-tight">WAVO AI Bot</div>
                                <div className="text-white/70 text-[10px] font-bold uppercase">Online & Learning</div>
                            </div>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${m.role === 'user'
                                    ? 'bg-wa-green text-white rounded-tr-none'
                                    : 'bg-slate-800 text-slate-300 rounded-tl-none'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer / Input */}
                    <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type your doubt here..."
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-wa-green"
                            />
                            <button onClick={handleSend} className="w-11 h-11 bg-wa-green text-white rounded-xl flex items-center justify-center shrink-0">
                                <Send size={18} />
                            </button>
                        </div>
                        <Link
                            href="https://wa.me/919789359407"
                            className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase text-wa-green hover:underline"
                        >
                            <PhoneCall size={12} /> Talk to an Expert
                        </Link>
                    </div>
                </div>
            </div>

            {/* AI Toggle Button */}
            {!isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-8 right-6 w-16 h-16 bg-gradient-to-br from-wa-green to-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-[9998] animate-bounce-soft"
                >
                    <Bot size={32} />
                </button>
            )}
        </>
    );
}
