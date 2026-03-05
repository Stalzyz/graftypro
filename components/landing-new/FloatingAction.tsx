"use client";
import React from "react";
import { Bot } from "lucide-react";

export default function FloatingAction() {
    return (
        <a
            href="https://wa.me/917304128557"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-[200] w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all animate-bounce-subtle"
            title="Chat with AI"
        >
            <Bot size={30} fill="none" strokeWidth={2.5} />
        </a>
    );
}
