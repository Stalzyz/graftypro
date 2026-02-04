"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Phone, MoreVertical, Search, User, FileText, X } from "lucide-react";

interface Message {
    id: string;
    direction: "INBOUND" | "OUTBOUND";
    content: any;
    created_at: string;
    status: string;
}

interface Conversation {
    id: string;
    contact: { name: string | null; phone: string };
    lastMessage: Message | null;
    updatedAt: string;
}

interface Template {
    id: string;
    name: string;
    status: string;
    language: string;
    category: string;
}

export default function ChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Template State
    const [templates, setTemplates] = useState<Template[]>([]);
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    // Load Conversations
    const fetchConversations = async () => {
        try {
            const res = await fetch("/api/chats");
            const data = await res.json();
            if (Array.isArray(data)) setConversations(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Load Templates
    const fetchTemplates = async () => {
        try {
            const res = await fetch("/api/templates");
            const data = await res.json();
            if (data.data) setTemplates(data.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); // Poll list every 10s
        return () => clearInterval(interval);
    }, []);

    // Load Messages when Selected
    useEffect(() => {
        if (!selectedId) return;
        const fetchMessages = async () => {
            const res = await fetch(`/api/chats/${selectedId}/messages`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setMessages(data);
                scrollToBottom();
            }
        };
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll messages every 3s
        return () => clearInterval(interval);
    }, [selectedId]);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const handleSend = async (text: string = inputText, isTemplate: boolean = false, templateName: string = "") => {
        if ((!text.trim() && !isTemplate) || !selectedId) return;

        // Optimistic update
        const tempMsg: Message = {
            id: "temp-" + Date.now(),
            direction: "OUTBOUND",
            content: isTemplate ? { body: `Template: ${templateName}` } : { body: text },
            created_at: new Date().toISOString(),
            status: "SENDING"
        };
        setMessages(prev => [...prev, tempMsg]);
        scrollToBottom();
        setInputText("");

        try {
            const payload = isTemplate
                ? { conversationId: selectedId, type: "template", template: { name: templateName, language: { code: "en" } } }
                : { conversationId: selectedId, text: text };

            const res = await fetch("/api/chats/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed");
            // Real update will come from polling
        } catch (e) {
            console.error(e);
            alert("Failed to send");
        }
    };

    // Determine 24h Window Status
    const lastInbound = messages.filter(m => m.direction === "INBOUND").sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    const isWindowOpen = lastInbound ? (new Date().getTime() - new Date(lastInbound.created_at).getTime() < 24 * 60 * 60 * 1000) : false;

    const selectedConv = conversations.find(c => c.id === selectedId);

    return (
        <div className="flex h-[calc(100vh-theme(spacing.32))] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">

            {/* Template Modal */}
            {showTemplateModal && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Select Template</h3>
                            <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {templates.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">No templates found. Sync them in settings.</div>
                            ) : (
                                <div className="grid gap-2">
                                    {templates.filter(t => t.status === 'APPROVED').map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => {
                                                handleSend("", true, t.name);
                                                setShowTemplateModal(false);
                                            }}
                                            className="text-left p-3 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-colors group"
                                        >
                                            <div className="font-semibold text-gray-900 group-hover:text-blue-700">{t.name}</div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">{t.category} • {t.language}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar List */}
            <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-bold text-lg mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-blue-500" placeholder="Search chats..." />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => setSelectedId(conv.id)}
                            className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedId === conv.id ? "bg-blue-50/50" : ""}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-semibold text-gray-900">{conv.contact.name || conv.contact.phone}</h3>
                                <span className="text-xs text-gray-400">{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1">
                                {conv.lastMessage?.content?.body || conv.lastMessage?.type || "No messages"}
                            </p>
                        </div>
                    ))}
                    {conversations.length === 0 && !loading && (
                        <div className="p-8 text-center text-gray-400 text-sm">No conversations yet</div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {selectedId ? (
                <div className="flex-1 flex flex-col bg-[#efeae2]/30"> {/* WhatsApp-ish bg tint */}
                    {/* Header */}
                    <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedId(null)} className="md:hidden mr-2 text-gray-500">←</button>
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{selectedConv?.contact.name || selectedConv?.contact.phone}</h3>
                                <div className="text-xs text-green-600 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    WhatsApp
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 text-gray-400">
                            <button className="p-2 hover:bg-gray-100 rounded-lg"><Phone size={20} /></button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg"><MoreVertical size={20} /></button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map((msg) => {
                            const isMe = msg.direction === "OUTBOUND";
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] px-4 py-2 rounded-lg shadow-sm text-sm ${isMe ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none'
                                        }`}>
                                        <div className="break-words">
                                            {msg.content?.body || <span className="italic text-gray-500">Media ({msg.content.type || 'unknown'})</span>}
                                        </div>
                                        <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-green-800/60' : 'text-gray-400'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {isMe && <span className="ml-1">{msg.status === 'READ' ? '✓✓' : '✓'}</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="bg-white px-4 py-3 border-t border-gray-200">
                        {!isWindowOpen && messages.length > 0 && (
                            <div className="mb-2 text-xs text-orange-600 bg-orange-50 p-2 rounded flex justify-center">
                                24h Session Closed. You can only send Templates.
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    fetchTemplates();
                                    setShowTemplateModal(true);
                                }}
                                className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors tooltip"
                                title="Send Template"
                            >
                                <FileText size={20} />
                            </button>
                            <input
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-100 border-none rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!inputText.trim()}
                                className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 hidden md:flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <Send size={32} />
                    </div>
                    <p>Select a conversation to start chatting</p>
                </div>
            )}
        </div>
    );
}
