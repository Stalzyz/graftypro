
import React, { useState, useEffect } from "react";
import { Bot, MessageCircle } from "lucide-react";

export default function FloatingAction() {
    const [whatsappNumber, setWhatsappNumber] = useState("919789359407"); // Default fallback

    useEffect(() => {
        fetch("/api/config/public")
            .then(res => res.json())
            .then(data => {
                if (data.fab_whatsapp_number) {
                    setWhatsappNumber(data.fab_whatsapp_number.replace(/\D/g, ''));
                }
            })
            .catch(err => console.error("Failed to load FAB config:", err));
    }, []);

    return (
        <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-[200] w-14 h-14 bg-[#27954D] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all animate-bounce-subtle group"
            title="Chat with Support"
        >
            <div className="relative">
                <MessageCircle size={30} fill="currentColor" className="text-white group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-[#27954D] rounded-full animate-ping" />
            </div>
        </a>
    );
}
