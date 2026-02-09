"use client";

import { useState, useEffect, useRef } from "react";
import {
    Search,
    Send,
    MoreVertical,
    Check,
    CheckCheck,
    User,
    Tag,
    Clock,
    Phone,
    Info,
    Hash,
    Paperclip,
    Image as ImageIcon,
    FileText,
    X,
    Archive,
    Trash2,
    CheckSquare,
    Square,
    Command,
    Sparkles,
    Loader2,
    MessageSquare,
    Video,
    Mic
} from "lucide-react";

export default function SharedInbox() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [replyText, setReplyText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [attachedFile, setAttachedFile] = useState<any>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [fetchingSuggestions, setFetchingSuggestions] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedId) {
            fetchMessages(selectedId);
            setSuggestions([]);
            const interval = setInterval(() => fetchMessages(selectedId), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedId]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(scrollToBottom, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await fetch("/api/conversations");
            const data = await res.json();
            if (data.data) setConversations(data.data);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchMessages = async (id: string) => {
        try {
            const res = await fetch(`/api/conversations/${id}/messages`);
            const data = await res.json();
            if (data.data) setMessages(data.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchAISuggestions = async () => {
        if (!selectedId) return;
        setFetchingSuggestions(true);
        try {
            const res = await fetch(`/api/conversations/${selectedId}/suggest-reply`, { method: "POST" });
            const data = await res.json();
            if (data.suggestions) setSuggestions(data.suggestions);
        } catch (e) {
            console.error(e);
        } finally {
            setFetchingSuggestions(false);
        }
    };

    const handleSend = async (e?: any) => {
        if (e) e.preventDefault();
        if ((!replyText.trim() && !attachedFile) || !selectedId) return;

        setSending(true);
        try {
            const payload: any = {
                text: replyText,
                mediaUrl: attachedFile?.url,
                mediaType: attachedFile?.type?.includes("image") ? "IMAGE" : "DOCUMENT",
                filename: attachedFile?.filename
            };

            const res = await fetch(`/api/conversations/${selectedId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setReplyText("");
                setAttachedFile(null);
                setSuggestions([]);
                fetchMessages(selectedId);
                fetchConversations();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/media/upload", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                setAttachedFile(data);
            }
        } catch (err) {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const toggleBulkSelect = (id: string) => {
        setBulkSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkAction = async (action: string) => {
        if (bulkSelectedIds.length === 0) return;

        const confirmMsg = action === 'delete' ? 'Delete selected conversations?' : `Perform ${action} on selected items?`;
        if (!confirm(confirmMsg)) return;

        try {
            const res = await fetch("/api/conversations/bulk-update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: bulkSelectedIds, action })
            });
            if (res.ok) {
                setBulkSelectedIds([]);
                fetchConversations();
                setSelectedId(null);
            }
        } catch (e) {
            alert("Action failed");
        }
    };

    const activeConversation = conversations.find(c => c.id === selectedId);

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-green-100/20 overflow-hidden relative animate-fade-in">

            {/* Bulk Action Bar overlay */}
            {bulkSelectedIds.length > 0 && (
                <div className="absolute top-0 left-0 right-0 h-16 bg-[#042f94] z-50 flex items-center justify-between px-8 text-white animate-in slide-in-from-top">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setBulkSelectedIds([])} className="hover:bg-black/10 p-2 rounded-full">
                            <X size={20} />
                        </button>
                        <span className="font-bold">{bulkSelectedIds.length} Selected</span>
                    </div>
                    <div className="flex gap-4 text-xs font-bold">
                        <button onClick={() => handleBulkAction('archive')} className="flex items-center gap-2 hover:bg-black/10 px-4 py-2 rounded-lg transition-colors">
                            <Archive size={16} /> Archive
                        </button>
                        <button onClick={() => handleBulkAction('delete')} className="flex items-center gap-2 hover:bg-black/10 px-4 py-2 rounded-lg transition-colors text-red-100">
                            <Trash2 size={16} /> Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Sidebar: Chat List */}
            <div className="w-[380px] border-r border-gray-100 flex flex-col bg-[#fdfdfd]">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Chats</h2>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                            <MessageSquare size={18} className="text-[#27954D]" />
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search or start new chat"
                            className="w-full bg-gray-100/50 border-none rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#27954D]/30 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pb-6 px-3 space-y-1">
                    {conversations.map((chat) => (
                        <div
                            key={chat.id}
                            className={`p-4 rounded-[1.5rem] cursor-pointer transition-all flex gap-3 items-center group relative ${selectedId === chat.id ? 'bg-[#27954D]/10 shadow-sm' : 'hover:bg-gray-50'}`}
                            onClick={(e) => {
                                if ((e.target as any).closest('.bulk-check')) return;
                                setSelectedId(chat.id);
                            }}
                        >
                            <div className={`bulk-check absolute left-1 opacity-0 group-hover:opacity-100 transition-opacity ${bulkSelectedIds.includes(chat.id) ? 'opacity-100' : ''}`} onClick={(e) => { e.stopPropagation(); toggleBulkSelect(chat.id); }}>
                                {bulkSelectedIds.includes(chat.id) ? <CheckSquare className="text-[#27954D]" size={18} /> : <Square className="text-gray-200" size={18} />}
                            </div>

                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-gray-500 font-bold border border-gray-100 shrink-0 group-hover:translate-x-6 transition-all bg-gradient-to-br from-gray-50 to-white shadow-sm overflow-hidden ${selectedId === chat.id ? 'translate-x-6 ring-2 ring-[#27954D]' : ''}`}>
                                {chat.contact.name?.[0] || <User size={20} />}
                            </div>

                            <div className={`flex-1 min-w-0 transition-all ${selectedId === chat.id ? 'ml-6' : 'group-hover:ml-6'}`}>
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h4 className="text-sm font-bold text-gray-800 truncate">{chat.contact.name || chat.contact.phone}</h4>
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        {new Date(chat?.updated_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <p className="text-xs text-gray-500 truncate">
                                        {(chat.messages?.[0]?.content as any)?.body || "No messages yet"}
                                    </p>
                                </div>
                            </div>

                            {chat.unreadCount > 0 && (
                                <div className="w-5 h-5 bg-[#27954D] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                                    {chat.unreadCount}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main: Chat Window */}
            <div className="flex-1 flex flex-col bg-[#f0f2f5] bg-opacity-30 relative">
                {/* Wallpaper Overlay (Subtle Pattern) */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat" />

                {selectedId ? (
                    <>
                        <div className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#27954D] to-[#042f94] rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-green-100">
                                    {activeConversation?.contact.name?.[0] || "U"}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800">{activeConversation?.contact.name || activeConversation?.contact.phone}</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-[#27954D] rounded-full animate-pulse" />
                                        <p className="text-[10px] text-[#27954D] font-bold uppercase tracking-wider">Live</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-400">
                                <Video size={20} className="hover:text-gray-600 cursor-pointer" />
                                <Phone size={18} className="hover:text-gray-600 cursor-pointer" />
                                <MoreVertical size={20} className="hover:text-gray-600 cursor-pointer" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth z-10 no-scrollbar">
                            {messages.map((msg, i) => {
                                const isOutbound = msg.direction === "OUTBOUND";
                                return (
                                    <div key={msg.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-[1.25rem] px-4 py-2 shadow-sm ${isOutbound
                                            ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none'
                                            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                            }`}>
                                            {msg.type === 'IMAGE' && (
                                                <div className="mb-2 -mx-1 -mt-1">
                                                    <img src={msg.content.link} className="rounded-xl max-h-64 h-full w-full object-cover border border-black/5" />
                                                </div>
                                            )}
                                            {msg.type === 'DOCUMENT' && (
                                                <div className="flex items-center gap-3 bg-black/5 p-3 rounded-xl mb-2 hover:bg-black/10 transition-colors cursor-pointer">
                                                    <FileText size={20} className="text-red-500" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs font-bold truncate">{msg.content.filename}</div>
                                                        <div className="text-[10px] text-gray-500">Document • PDF</div>
                                                    </div>
                                                </div>
                                            )}
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{(msg.content as any).body || (msg.content as any).caption}</p>
                                            <div className="mt-1 flex items-center gap-1.5 justify-end">
                                                <span className="text-[9px] font-medium text-gray-500">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isOutbound && (
                                                    msg.status === 'READ' ? <CheckCheck size={14} className="text-blue-500" /> : <Check size={14} className="text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply Area */}
                        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-10">
                            {/* Suggestions */}
                            {suggestions.length > 0 && (
                                <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setReplyText(s)}
                                            className="shrink-0 px-4 py-2 bg-[#27954D]/5 hover:bg-[#27954D]/10 text-[#042f94] rounded-2xl text-xs font-medium border border-[#27954D]/10 transition-all flex items-center gap-2 group"
                                        >
                                            <Sparkles size={12} className="group-hover:animate-pulse" /> {s}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {attachedFile && (
                                <div className="mb-3 p-3 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100 animate-in slide-in-from-bottom-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white rounded-xl border flex items-center justify-center shadow-sm">
                                            {attachedFile.type.includes('image') ? <ImageIcon size={20} className="text-[#27954D]" /> : <FileText size={20} className="text-blue-500" />}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-800 truncate max-w-[200px]">{attachedFile.filename}</div>
                                            <div className="text-[10px] text-gray-400 font-medium">Ready to upload</div>
                                        </div>
                                    </div>
                                    <button onClick={() => setAttachedFile(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                        <X size={16} className="text-gray-500" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-end gap-3 max-w-5xl mx-auto">
                                <div className="flex items-center gap-1 pb-1">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-3 text-gray-500 hover:text-[#27954D] hover:bg-gray-50 rounded-full transition-all"
                                    >
                                        <Paperclip size={24} className={uploading ? "animate-spin" : ""} />
                                        <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={fetchAISuggestions}
                                        disabled={fetchingSuggestions}
                                        className={`p-3 rounded-full transition-all ${fetchingSuggestions ? 'text-[#27954D] animate-pulse' : 'text-gray-500 hover:text-[#27954D] hover:bg-gray-50'}`}
                                    >
                                        <Sparkles size={24} />
                                    </button>
                                </div>

                                <div className="flex-1 bg-gray-100/80 border border-transparent focus-within:bg-white focus-within:border-[#27954D]/20 rounded-[1.5rem] flex items-end transition-all shadow-inner">
                                    <textarea
                                        rows={1}
                                        value={replyText}
                                        onChange={e => {
                                            setReplyText(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                        }}
                                        onKeyDown={onKeyDown}
                                        placeholder="Type a message..."
                                        className="w-full bg-transparent border-none px-5 py-3 text-sm focus:ring-0 outline-none resize-none font-medium placeholder:text-gray-400"
                                    />
                                    <button className="p-3 text-gray-400 hover:text-gray-600">
                                        <Mic size={20} />
                                    </button>
                                </div>

                                <button
                                    onClick={handleSend}
                                    disabled={sending || (!replyText.trim() && !attachedFile)}
                                    className="bg-[#27954D] text-white p-4 rounded-full hover:bg-[#042f94] hover:scale-105 disabled:bg-gray-200 disabled:scale-100 transition-all flex items-center justify-center shadow-lg shadow-green-100 active:scale-95"
                                >
                                    {sending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} fill="currentColor" />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 z-10">
                        <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl shadow-green-100/20 flex items-center justify-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#27954D] to-[#042f94] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200">
                                <MessageSquare size={32} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Select a Chat</h3>
                        <p className="text-sm text-gray-500 mt-3 max-w-xs leading-relaxed font-medium">
                            Choose a conversation from the sidebar to start messaging. Your official WhatsApp API is ready.
                        </p>
                        <div className="mt-8 flex gap-2">
                            <div className="px-4 py-2 bg-white border border-gray-100 rounded-2xl text-[10px] font-bold text-gray-400 uppercase tracking-widest shadow-sm">
                                <Command size={10} className="inline mr-1" /> K to search
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
