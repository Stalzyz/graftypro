"use client";
import React from "react";
import { MessageCircle } from "lucide-react";

export const FloatingSupport = () => {
    const whatsappNumber = "919999999999"; // Replace with real support number
    const message = "Hello Grafty Support, I need assistance with my account.";
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-[999] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all active:scale-95 group flex items-center gap-3 overflow-hidden max-w-[60px] hover:max-w-[200px]"
        >
            <MessageCircle size={24} />
            <span className="font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Contact Support
            </span>
        </a>
    );
};
