"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef, Suspense } from "react";
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
    Mic,
    ChevronRight,
    Filter,
    Calendar,
    Star,
    Zap,
    PlusCircle,
    UserPlus,
    CreditCard,
    FilePlus,
    Bell,
    Settings,
    LayoutDashboard,
    AlertCircle,
    Camera,
    Mail,
    Users,
    GitBranch,
    ShoppingBag,
    Globe,
    Bug,
    CornerUpLeft,
    ExternalLink
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import LeadScoreBadge from "../../../components/crm/LeadScoreBadge";
import DripEnrollModal from "../../../components/crm/DripEnrollModal";
import FollowUpModal from "../../../components/crm/FollowUpModal";

const safeFormat = (dateValue: any, formatStr: string, fallback = "--:--") => {
    try {
        if (!dateValue || dateValue === "null") return fallback;
        const d = new Date(dateValue);
        if (isNaN(d.getTime())) return fallback;
        return format(d, formatStr);
    } catch (e) {
        return fallback;
    }
};

export default function SharedInbox() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen bg-white dark:bg-black">
                <Loader2 className="animate-spin text-green-600" size={32} />
            </div>
        }>
            <SharedInboxContent />
        </Suspense>
    );
}

function SharedInboxContent() {
    // -- UI State --
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
    const [generatingMeet, setGeneratingMeet] = useState(false);
    const [agents, setAgents] = useState<any[]>([]);
    const [chatFilter, setChatFilter] = useState("all");
    const [assigning, setAssigning] = useState(false);
    const [showCRM, setShowCRM] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isMobileListOpen, setIsMobileListOpen] = useState(true);
    const [newChatPhone, setNewChatPhone] = useState("");
    const [startingChat, setStartingChat] = useState(false);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [hasNewMessages, setHasNewMessages] = useState(false);

    // -- Modal States --
    const [showDripModal, setShowDripModal] = useState(false);
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);
    const [contactNotes, setContactNotes] = useState<any[]>([]);
    const [contactFollowUps, setContactFollowUps] = useState<any[]>([]);
    const [newNote, setNewNote] = useState("");
    const [savingNote, setSavingNote] = useState(false);
    const [isChatActionOpen, setIsChatActionOpen] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [templateSearch, setTemplateSearch] = useState("");
    const [sendingTemplate, setSendingTemplate] = useState(false);

    const fetchTemplates = async () => {
        try {
            const res = await fetch("/api/templates");
            const data = await res.json();
            const approved = (data.data || []).filter((t: any) => t.status === "APPROVED");
            setTemplates(approved);
        } catch (e) {
            console.error("Failed to fetch templates");
        }
    };

    const handleGenerateMeet = async () => {
        if (!selectedId) return;
        setGeneratingMeet(true);
        try {
            const res = await fetch("/api/integrations/google-calendar/meet", { method: "POST" });
            const data = await res.json();
            if (data.link) {
                setReplyText(prev => `${prev}\n\nJoin our meeting here: ${data.link}`.trim());
                toast.success("Google Meet link generated!");
            } else {
                toast.error(data.error || "Please connect Google Calendar in Settings first.");
            }
        } catch (e) {
            toast.error("Failed to generate meeting link");
        } finally {
            setGeneratingMeet(false);
        }
    };

    const handleSendTemplate = async (template: any) => {
        if (!selectedId) return;
        setSendingTemplate(true);
        try {
            const res = await fetch(`/api/conversations/${selectedId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ templateName: template.name, langCode: template.language })
            });
            if (res.ok) {
                setShowTemplateModal(false);
                fetchMessages(selectedId);
                fetchConversations();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to send template");
            }
        } catch (e) {
            alert("Network error sending template");
        } finally {
            setSendingTemplate(false);
        }
    };

    const handleClearConversation = async () => {
        if (!selectedId || !confirm("Clear all messages in this conversation?")) return;
        try {
            const res = await fetch(`/api/conversations/${selectedId}/messages`, { method: "DELETE" });
            if (res.ok) {
                setMessages([]);
                setIsChatActionOpen(false);
            }
        } catch (e) {
            alert("Failed to clear conversation");
        }
    };

    const handleDeleteConversation = async () => {
        if (!selectedId || !confirm("Delete this conversation?")) return;
        try {
            const res = await fetch(`/api/conversations/${selectedId}`, { method: "DELETE" });
            if (res.ok) {
                setSelectedId(null);
                setIsChatActionOpen(false);
                fetchConversations();
            }
        } catch (e) {
            alert("Failed to delete conversation");
        }
    };

    const activeConversation = conversations.find(c => c.id === selectedId);

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const phoneParam = searchParams.get("phone");

    // -- Refs --
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const el = messagesContainerRef.current;
            const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
            setShowScrollButton(!isNearBottom);
            if (isNearBottom) setHasNewMessages(false);
        }
    };

    const scrollToBottom = (force = false) => {
        if (messagesContainerRef.current) {
            const el = messagesContainerRef.current;
            // 150px threshold allows a little leeway while reading to still auto-scroll
            const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
            if (force || isNearBottom) {
                el.scrollTop = el.scrollHeight;
                setHasNewMessages(false);
            } else if (!force) {
                // If not forced and NOT near bottom, mark as having new messages
                setHasNewMessages(true);
            }
        }
    };

    // Auto-scroll on new messages ONLY if already near the bottom
    useEffect(() => {
        const timer = setTimeout(() => scrollToBottom(false), 100);
        return () => clearTimeout(timer);
    }, [messages]);

    // Force scroll when opening a completely new conversation
    useEffect(() => {
        const timer = setTimeout(() => {
            scrollToBottom(true);
            setHasNewMessages(false);
        }, 100);
        return () => clearTimeout(timer);
    }, [selectedId]);

    useEffect(() => {
        fetchConversations();
        fetchAgents();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, [chatFilter, searchQuery]);

    useEffect(() => {
        if (selectedId) {
            fetchMessages(selectedId);
            fetchCRMData(activeConversation?.contact_id);
            setSuggestions([]);
            const interval = setInterval(() => fetchMessages(selectedId), 2000);
            return () => clearInterval(interval);
        }
    }, [selectedId]);

    const fetchCRMData = async (contactId: string) => {
        if (!contactId) return;
        try {
            const [notesRes, followUpsRes] = await Promise.all([
                fetch(`/api/crm/notes?contactId=${contactId}`),
                fetch(`/api/crm/follow-ups?contactId=${contactId}`)
            ]);
            const notesData = await notesRes.json();
            const followUpsData = await followUpsRes.json();
            if (notesData.data) setContactNotes(notesData.data);
            if (followUpsData.data) setContactFollowUps(followUpsData.data);
        } catch (e) {
            console.error("CRM Data Fetch Error:", e);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim() || !activeConversation?.contact_id) return;
        setSavingNote(true);
        try {
            const res = await fetch("/api/crm/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contactId: activeConversation?.contact_id,
                    content: newNote
                })
            });
            if (res.ok) {
                setNewNote("");
                if (activeConversation?.contact_id) {
                    fetchCRMData(activeConversation.contact_id);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSavingNote(false);
        }
    };

    const fetchConversations = async () => {
        try {
            const res = await fetch(`/api/conversations?filter=${chatFilter}&q=${searchQuery}`);
            const data = await res.json();
            if (data.data) {
                setConversations(data.data);
                // Auto-select by phone parameter if present
                if (phoneParam && !selectedId) {
                    const found = data.data.find((c: any) => c.contact?.phone && (c.contact.phone.includes(phoneParam) || phoneParam.includes(c.contact.phone)));
                    if (found) {
                        setSelectedId(found.id);
                        setIsMobileListOpen(false);
                    }
                }
            }
        } catch (e) {
            console.error("Fetch Conversations Error:", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchAgents = async () => {
        try {
            const res = await fetch("/api/settings/users");
            const data = await res.json();
            if (data.data) setAgents(data.data);
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

    // -- Handlers --
    const handleSend = async (e?: any) => {
        if (e) e.preventDefault();
        if ((!replyText.trim() && !attachedFile) || !selectedId) return;

        setSending(true);
        try {
            const fileType = attachedFile?.type || "";
            const payload: any = {
                text: replyText,
                mediaUrl: attachedFile?.url,
                mediaType: fileType.includes("image") ? "IMAGE" : 
                           fileType.includes("video") ? "VIDEO" : 
                           fileType.includes("audio") ? "AUDIO" : "DOCUMENT",
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
            } else {
                const errData = await res.json();
                alert(errData.error || "Failed to send message");
            }
        } catch (e) {
            console.error(e);
            alert("Network error while sending message");
        } finally {
            setSending(false);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
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
        formData.append("module", "general");

        try {
            const res = await fetch("/api/uploads", {
                method: "POST",
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                setAttachedFile({
                    url: data.url,
                    filename: data.originalName,
                    type: data.mime,
                    size: data.size
                });
            } else {
                alert(`Upload failed: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert("Upload failed due to network error");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleAssign = async (agentId: string) => {
        if (!selectedId) return;
        setAssigning(true);
        try {
            const res = await fetch(`/api/conversations/${selectedId}/assign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ agentId })
            });
            if (res.ok) {
                fetchConversations();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setAssigning(false);
        }
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

    const toggleBulkSelect = (id: string) => {
        setBulkSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleNewChat = () => {
        setNewChatPhone("");
        setIsNewChatModalOpen(true);
    };

    const handleInitializeChat = async () => {
        if (!newChatPhone.trim()) return;
        setStartingChat(true);
        try {
            const res = await fetch("/api/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: newChatPhone })
            });
            const data = await res.json();
            if (data.data) {
                setIsNewChatModalOpen(false);
                setNewChatPhone("");
                await fetchConversations();
                setSelectedId(data.data.id);
                setIsMobileListOpen(false);
            } else {
                alert(data.error || "Failed to start conversation");
            }
        } catch (e) {
            console.error(e);
            alert("Error starting conversation");
        } finally {
            setStartingChat(false);
        }
    };

    const handleMessageAction = async (messageId: string, mode: 'me' | 'all') => {
        try {
            const res = await fetch('/api/chats/messages/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId, deleteForAll: mode === 'all' }),
            });
            if (res.ok) {
                setMessages(prev => prev.map(m => m.id === messageId ? { ...m, _deleted: true } : m));
            } else {
                const data = await res.json();
                if (typeof window !== 'undefined') alert(data.error || "Delete failed");
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };
    return (
        <div className="flex h-screen bg-white overflow-hidden relative font-inter border-l border-slate-100 animate-in fade-in duration-700">


            {/* 2️⃣ MIDDLE PANEL: Intelligent Chat List */}
            <div className={`w-full md:w-[320px] lg:w-[360px] border-r border-slate-100 bg-white flex flex-col z-20 shrink-0 ${!isMobileListOpen && 'hidden md:flex'}`}>
                {/* Search & Header */}
                <div className="p-6 pb-4 space-y-4 bg-white">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <h2 className="text-3xl font-[900] text-indigo-950 tracking-tighter">Live Chat</h2>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all border border-slate-100 hover:border-slate-200"><Filter size={18} /></button>
                            <button onClick={handleNewChat} className="p-2.5 text-white bg-slate-900 hover:bg-black rounded-xl transition-all shadow-lg shadow-slate-200"><PlusCircle size={18} /></button>
                        </div>
                    </div>

                    {/* Search Field */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search leads, tags or messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-100/80 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white rounded-[1.25rem] pl-12 pr-4 py-3.5 text-[13px] font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 shadow-inner"
                        />
                    </div>

                    {/* Horizontal Context Filters */}
                    <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                        {[
                            { id: 'all', label: 'All', count: 0 },
                            { id: 'me', label: 'Mine', count: 0 },
                            { id: 'unassigned', label: 'New', count: 0 },
                            { id: 'unread', label: 'Unread', count: 0 },
                            { id: 'follow_up', label: 'Follow Up', count: 0 }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setChatFilter(f.id)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${chatFilter === f.id ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bulk Action Strip */}
                {bulkSelectedIds.length > 0 && (
                    <div className="mx-4 mb-2 p-2 bg-green-50 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2">
                        <span className="text-xs font-bold text-green-700 ml-2">{bulkSelectedIds.length} selected</span>
                        <div className="flex gap-1">
                            <button onClick={() => handleBulkAction('archive')} className="p-1.5 text-green-600 hover:bg-white rounded-lg"><Archive size={14} /></button>
                            <button onClick={() => handleBulkAction('delete')} className="p-1.5 text-red-600 hover:bg-white rounded-lg"><Trash2 size={14} /></button>
                            <button onClick={() => setBulkSelectedIds([])} className="p-1.5 text-gray-400 hover:bg-white rounded-lg"><X size={14} /></button>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-4 space-y-1.5 bg-slate-50/30">
                    {conversations.length === 0 && !loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                <MessageSquare size={32} />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900">No messages found</h3>
                            <p className="text-xs text-gray-400 mt-1">Try changing your filters or searching for someone else.</p>
                        </div>
                    ) : (
                        conversations.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => {
                                    setSelectedId(chat.id);
                                    setIsMobileListOpen(false);
                                }}
                                className={`p-4 rounded-[1.75rem] cursor-pointer transition-all flex gap-4 items-center group relative border ${selectedId === chat.id ? 'bg-white border-green-200 shadow-lg shadow-green-100/50 transform scale-[1.02] z-10' : chat.unreadCount > 0 ? 'bg-green-50/80 border-green-200/60 hover:bg-green-50 hover:scale-[1.01]' : 'bg-transparent border-transparent hover:bg-gray-50/80 hover:scale-[1.01]'}`}
                            >
                                {/* Multiselect Checkbox */}
                                <div
                                    onClick={(e) => { e.stopPropagation(); toggleBulkSelect(chat.id); }}
                                    className={`shrink-0 transition-all ${bulkSelectedIds.includes(chat.id) || bulkSelectedIds.length > 0 ? 'w-5 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}
                                >
                                    {bulkSelectedIds.includes(chat.id) ? <CheckSquare className="text-green-600" size={18} /> : <Square className="text-gray-300" size={18} />}
                                </div>

                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <div className={`w-14 h-14 rounded-[1.25rem] overflow-hidden border-2 flex items-center justify-center font-black text-xl uppercase tracking-tighter shadow-sm transition-all ${selectedId === chat.id ? 'border-green-200 bg-green-50 text-green-600' : 'border-white bg-white text-gray-400'}`}>
                                        {chat.contact?.avatar_url ? (
                                            <img src={chat.contact.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            chat.contact?.name?.[0] || <User size={26} />
                                        )}
                                    </div>
                                    <div className={`absolute -right-1 -bottom-1 w-5 h-5 rounded-full border-[3px] border-white shadow-sm ${chat.status === 'OPEN' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className={`text-[14px] font-black truncate leading-tight ${selectedId === chat.id ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {chat.contact?.name || chat.contact?.phone}
                                        </h4>
                                        <span className="text-[10px] text-gray-400 font-bold tabular-nums ml-2">
                                            {safeFormat(chat?.updated_at || Date.now(), "HH:mm")}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <p className={`text-[12px] truncate flex-1 leading-relaxed ${chat.unreadCount > 0 ? 'text-gray-900 font-black' : 'text-gray-400 font-medium'}`}>
                                            {(() => {
                                                const rawMsg = chat.messages?.[0]?.content;
                                                if (!rawMsg) return "No messages yet";
                                                try {
                                                    const parsed = typeof rawMsg === 'string' ? JSON.parse(rawMsg) : rawMsg;
                                                    // Extract text based on interactive types or standards
                                                    return parsed.body?.text ||
                                                        parsed.text?.body ||
                                                        parsed.text ||
                                                        parsed.body ||
                                                        parsed.button_reply?.title ||
                                                        parsed.list_reply?.title ||
                                                        parsed.nfm_reply?.body ||
                                                        (parsed.media_id || parsed.link ? "Media Message" : "Message");
                                                } catch (e) { return String(rawMsg); }
                                            })()}
                                        </p>
                                        {chat.unreadCount > 0 && (
                                            <div className="px-2 h-5 bg-green-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-sm">
                                                {chat.unreadCount}
                                            </div>
                                        )}
                                    </div>

                                    {/* CRM Indicators in Sidebar */}
                                    <div className="flex gap-1.5 mt-2 items-center">
                                        {chat.contact?.tags?.length > 0 && (
                                            <div className="flex gap-1">
                                                {chat.contact?.tags?.slice(0, 1).map((tag: any, idx: number) => (
                                                    <span key={idx} className="px-2 py-0.5 rounded-lg bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest border border-green-100">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {chat.assigned_to && (
                                            <div className="w-4 h-4 rounded-lg bg-slate-900 flex items-center justify-center text-white" title="Assigned">
                                                <User size={8} fill="currentColor" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-50">
                            <Loader2 className="animate-spin text-green-600" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live synchronization...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 3️⃣ RIGHT PANEL: Chat Window & CRM */}
            <div className={`flex-1 flex flex-col bg-white relative overflow-hidden ${isMobileListOpen && 'hidden md:flex'}`}>
                {/* Wallpaper Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat z-0" />

                {selectedId ? (
                    <div className="flex-1 flex overflow-hidden z-10 relative">
                        {/* Main Chat Thread */}
                        <div className="flex-1 flex flex-col min-w-0">
                            {/* Chat Header */}
                            <div className="h-[72px] bg-white border-b border-gray-100 px-6 flex items-center justify-between shrink-0 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setIsMobileListOpen(true)} className="md:hidden p-2 -ml-2 text-gray-400"><ChevronRight className="rotate-180" /></button>
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-green-100 overflow-hidden relative group">
                                        {activeConversation?.contact?.avatar_url ? (
                                            <img src={activeConversation.contact.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            activeConversation?.contact?.name?.[0] || <User />
                                        )}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <ImageIcon size={16} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-[15px] font-black text-gray-900 tracking-tight leading-none mb-1.5">{activeConversation?.contact?.name || activeConversation?.contact?.phone || "Contact"}</h3>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{activeConversation?.contact?.phone || "No Phone"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Assignment Quick Dropdown */}
                                    <div className="hidden lg:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 hover:bg-gray-100 transition-all cursor-pointer">
                                        <UserPlus size={14} className="text-gray-400" />
                                        <select
                                            value={activeConversation?.assigned_to || ""}
                                            onChange={(e) => handleAssign(e.target.value)}
                                            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-gray-600 outline-none focus:ring-0 cursor-pointer p-0"
                                        >
                                            <option value="">Assign</option>
                                            {agents.map(a => <option key={a.id} value={a.id}>{a.first_name || a.email}</option>)}
                                        </select>
                                    </div>

                                    <div className="h-8 w-[1px] bg-gray-100 hidden sm:block" />

                                    <div className="flex items-center gap-2 text-gray-400">
                                        <button
                                            onClick={handleGenerateMeet}
                                            disabled={generatingMeet}
                                            className={`p-2.5 rounded-xl transition-all ${generatingMeet ? 'bg-gray-100 text-gray-400' : 'hover:bg-slate-50 text-slate-400 hover:text-blue-600'}`}
                                            title="Generate Google Meet Link"
                                        >
                                            {generatingMeet ? <Loader2 className="animate-spin" size={18} /> : <Video size={18} />}
                                        </button>

                                        <button
                                            onClick={() => setShowCRM(!showCRM)}
                                            className={`p-2.5 rounded-xl transition-all ${showCRM ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'hover:bg-gray-50 hover:text-indigo-600'}`}
                                            title="Perfil CRM"
                                        >
                                            <Info size={18} />
                                        </button>

                                        {/* Individual Chat Actions */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setIsChatActionOpen(!isChatActionOpen)}
                                                className="p-2.5 hover:bg-gray-50 text-gray-400 hover:text-gray-900 rounded-xl transition-all"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {isChatActionOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-[100]" onClick={() => setIsChatActionOpen(false)} />
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[101] animate-in fade-in zoom-in-95 duration-150">
                                                        <button
                                                            onClick={handleDeleteConversation}
                                                            className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                                                        >
                                                            <Trash2 size={14} /> Delete Chat
                                                        </button>
                                                        <button
                                                            onClick={handleClearConversation}
                                                            className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                                        >
                                                            <Square size={14} /> Clear Conversation
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                handleBulkAction('archive');
                                                                setIsChatActionOpen(false);
                                                            }}
                                                            className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                                        >
                                                            <Archive size={14} /> Archive Lead
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div 
                                ref={messagesContainerRef} 
                                onScroll={handleScroll}
                                className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 backdrop-blur-sm no-scrollbar relative scroll-smooth"
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />
                                {messages.filter(m => !m._deleted).map((msg, i) => {
                                    const isOutbound = msg.direction === "OUTBOUND";
                                    const isTemplate = msg.type === "TEMPLATE";

                                    return (
                                        <div key={msg.id} id={`msg-${msg.id}`} className={`flex flex-col mb-4 relative group/msg ${isOutbound ? 'items-end pr-2' : 'items-start pl-2 animate-in slide-in-from-left-4'}`}>
                                            {(() => {
                                                const type = msg.type?.toUpperCase();
                                                const rawContent = msg.content;
                                                let content: any = {};
                                                try {
                                                    content = typeof rawContent === 'string' ? JSON.parse(rawContent) : (rawContent || {});
                                                } catch (e) {
                                                    content = { body: String(rawContent) };
                                                }

                                                // 🚀 MONSTER PHASE 3: Prioritize Persistent Metadata
                                                // @ts-ignore
                                                const persistentUrl = msg.media_url || "";
                                                // @ts-ignore
                                                const persistentMime = msg.mime_type || "";
                                                // @ts-ignore
                                                const persistentName = msg.file_name || "";

                                                // Monster Media Discovery (Legacy Fallback)
                                                const findMediaLink = (obj: any, depth = 0): string => {
                                                    if (persistentUrl) return persistentUrl;
                                                    if (!obj || depth > 15) return "";
                                                    
                                                    // 1. Prioritize numeric media_id (Always proxy-first)
                                                    if (typeof obj === 'object') {
                                                        if (obj.media_id) return `/api/whatsapp/media/${obj.media_id}`;
                                                        if (obj.image?.id) return `/api/whatsapp/media/${obj.image.id}`;
                                                        if (obj.video?.id) return `/api/whatsapp/media/${obj.video.id}`;
                                                        if (obj.document?.id) return `/api/whatsapp/media/${obj.document.id}`;
                                                        if (obj.audio?.id) return `/api/whatsapp/media/${obj.audio.id}`;
                                                    }

                                                    // 2. Filename extraction (wa_media_ fallback)
                                                    const str = JSON.stringify(obj);
                                                    if (str.includes("wa_media_")) {
                                                        const match = str.match(/wa_media_[a-z0-0_.]+/i);
                                                        if (match) return `/api/whatsapp/media/${match[0]}`;
                                                    }

                                                    if (typeof obj === 'object') {
                                                        // 3. Direct Keys
                                                        const keys = ['link', 'url', 'media_url', 'image_url', 'thumbnail_url', 'image', 'video', 'document'];
                                                        for (const k of keys) {
                                                            if (obj[k] && typeof obj[k] === 'string') {
                                                                let url = obj[k].trim();
                                                                if (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:image')) return url;
                                                            }
                                                            if (obj[k] && typeof obj[k] === 'object') {
                                                                const res = findMediaLink(obj[k], depth + 1);
                                                                if (res) return res;
                                                            }
                                                        }

                                                        // Deep dive into raw/interactive
                                                        if (obj.raw || obj.interactive) {
                                                            const res = findMediaLink(obj.raw || obj.interactive, depth + 1);
                                                            if (res) return res;
                                                        }
                                                    }

                                                    // 4. Nuclear Regex Fallback
                                                    const urlMatch = str.match(/https?:\/\/[^\s"']+(\.jpg|\.jpeg|\.png|\.gif|\.webp|\.mp4|\.pdf)/i);
                                                    if (urlMatch) return urlMatch[0];

                                                    return "";
                                                };

                                                const link = persistentUrl || findMediaLink(content);
                                                const proxyMediaLink = (url: string) => {
                                                    if (!url) return "";
                                                    
                                                    // Handle persistent local paths (e.g., /uploads/...)
                                                    if (url.startsWith('/uploads/')) return url;

                                                    // Handle wa_media_ filenames directly via proxy
                                                    if (url.includes('wa_media_')) {
                                                        const filename = url.split('/').pop();
                                                        return `/api/whatsapp/media/${filename}`;
                                                    }

                                                    // If it's already a local/proxy URL, leave it
                                                    if (url.startsWith('/') || url.startsWith('data:')) return url;
                                                    
                                                    // Handle Meta/Facebook CDN URLs
                                                    if (url.includes('lookaside.fbsbx.com') || url.includes('fbcdn.net')) {
                                                        const mId = content.media_id || content.image?.id || content.video?.id;
                                                        if (mId) return `/api/whatsapp/media/${mId}`;
                                                        return `/api/media/proxy?url=${encodeURIComponent(url)}`; 
                                                    }
                                                    return url;
                                                };

                                                const isImage = (url: string) => persistentMime.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|heic|avif|bmp|tiff)(\?.*)?$/i.test(url) || url.includes('fbcdn.net') || url.includes('pps.whatsapp.net') || url.includes('cloudinary') || type === 'IMAGE';
                                                const isVideo = (url: string) => persistentMime.startsWith('video/') || /\.(mp4|webm|mov|3gp)(\?.*)?$/i.test(url) || type === 'VIDEO';
                                                const isDoc = (url: string) => persistentMime.includes('pdf') || persistentMime.includes('document') || persistentMime.includes('application/') || /\.(pdf|doc|docx|xls|xlsx|txt|ppt|pptx)(\?.*)?$/i.test(url) || type === 'DOCUMENT';
                                                const isAudio = (url: string) => persistentMime.startsWith('audio/') || /\.(mp3|ogg|wav|m4a|weba|opus|aac)(\?.*)?$/i.test(url) || type === 'AUDIO';

                                                const isCarousel = content.interactiveType === 'carousel' || content.type === 'carousel' || content.action?.cards || content.raw?.interactive?.action?.cards;
                                                const isProduct = type === 'PRODUCT' || type === 'INTERACTIVE' && (content.type?.includes('product') || content.product_reply || content.interactiveType?.includes('product') || content.raw?.interactive?.type?.includes('product')) || content.catalog_id || content.product_retailer_id;

                                                let contentType = isCarousel ? 'CAROUSEL' : isProduct ? 'PRODUCT' : isImage(link) ? 'IMAGE' : isVideo(link) ? 'VIDEO' : isDoc(link) ? 'DOCUMENT' : isAudio(link) ? 'AUDIO' : (content.contentType?.toUpperCase() || '');
                                                if (!contentType && link) contentType = 'IMAGE';

                                                const finalMediaUrl = proxyMediaLink(link);

                                                return (
                                                    <div className={`max-w-[75%] relative flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}>
                                                        {/* Hover Action Toolbar */}
                                                        <div className={`absolute top-0 flex items-center gap-1 opacity-0 group-hover/msg:opacity-100 transition-all z-50 ${isOutbound ? '-left-[80px]' : '-right-[40px]'}`}>
                                                            {!isOutbound && (
                                                                <button
                                                                    onClick={() => { document.getElementById('chat-composer')?.focus(); }}
                                                                    className="p-1.5 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-indigo-600 hover:border-indigo-200 shadow-xl transition-all hover:scale-110"
                                                                    title="Reply"
                                                                >
                                                                    <CornerUpLeft size={14} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => { if (confirm("Permanently delete for you?")) handleMessageAction(msg.id, 'me'); }}
                                                                className="p-1.5 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-red-500 hover:border-red-200 shadow-xl transition-all hover:scale-110"
                                                                title="Delete Me"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                            {isOutbound && (
                                                                <button
                                                                    onClick={() => { if (confirm("Recall from everyone's phone?")) handleMessageAction(msg.id, 'all'); }}
                                                                    className="p-1.5 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-red-600 hover:border-red-300 shadow-xl transition-all hover:scale-110"
                                                                    title="Delete for Everyone"
                                                                >
                                                                    <Globe size={14} />
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className={`px-4 py-3 rounded-2xl shadow-sm relative overflow-hidden ${isOutbound
                                                            ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-tr-none'
                                                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                                                            }`}>

                                                            {/* Media Rendering */}
                                                            {contentType === 'IMAGE' && link && (
                                                                <div className="mb-2 -mx-4 -mt-3 overflow-hidden bg-slate-100 relative group/media">
                                                                    <img src={finalMediaUrl} onClick={() => setZoomedImage(finalMediaUrl)} className="w-full h-auto max-h-80 object-cover cursor-zoom-in hover:opacity-90 transition-opacity" alt="Media" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x300/f8fafc/64748b?text=Media+Not+Found` }} />
                                                                    <div className="absolute top-1 left-1 bg-black/50 text-white text-[7px] font-bold px-1 rounded uppercase tracking-tighter shadow-sm">{contentType}</div>
                                                                </div>
                                                            )}

                                                            {contentType === 'VIDEO' && link && (
                                                                <div className="mb-2 -mx-4 -mt-3 overflow-hidden bg-black relative group/media rounded-t-2xl">
                                                                    <video src={finalMediaUrl} controls className="w-full h-auto max-h-80 object-contain" />
                                                                    <div className="absolute top-1 left-1 bg-black/50 text-white text-[7px] font-bold px-1 rounded uppercase tracking-tighter shadow-sm">VIDEO</div>
                                                                </div>
                                                            )}

                                                            {contentType === 'AUDIO' && link && (
                                                                <div className="mb-2 p-2 bg-slate-50/10 rounded-xl relative">
                                                                    <audio src={finalMediaUrl} controls className="w-full h-10" />
                                                                </div>
                                                            )}

                                                            {contentType === 'DOCUMENT' && link && (
                                                                <a href={finalMediaUrl} target="_blank" rel="noreferrer" className={`mb-2 p-3 flex items-center gap-3 rounded-xl border transition-colors group/doc relative overflow-hidden ${isOutbound ? 'bg-black/10 border-white/20 hover:bg-black/20 text-white' : 'bg-slate-50 hover:bg-indigo-50 border-slate-200'}`}>
                                                                    <div className={`p-2 rounded-lg shadow-sm transition-colors ${isOutbound ? 'bg-white/20' : 'bg-white group-hover/doc:text-indigo-600'}`}>
                                                                        <FileText size={20} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="text-[12px] font-black tracking-tight truncate">{persistentName || content.filename || content.document?.filename || "Document"}</div>
                                                                        <div className={`text-[10px] font-bold uppercase tracking-tighter mt-0.5 transition-colors ${isOutbound ? 'text-white/60' : 'text-slate-400 group-hover/doc:text-indigo-400'}`}>Click to View</div>
                                                                    </div>
                                                                </a>
                                                            )}

                                                            {contentType === 'CAROUSEL' && (
                                                                <div className="mb-2 -mx-4 -mt-3 flex overflow-x-auto no-scrollbar gap-2 p-2 bg-slate-50 border-b">
                                                                    {(content.action?.cards || content.raw?.interactive?.action?.cards || []).map((card: any, idx: number) => {
                                                                        const cardLink = findMediaLink(card);
                                                                        return (
                                                                            <div key={idx} className="min-w-[150px] bg-white rounded-lg border shadow-sm overflow-hidden text-slate-800">
                                                                                {cardLink && <img src={proxyMediaLink(cardLink)} onClick={() => setZoomedImage(proxyMediaLink(cardLink))} className="h-20 w-full object-cover cursor-zoom-in hover:opacity-90 transition-opacity" />}
                                                                                <div className="p-2">
                                                                                    <div className="text-[10px] font-bold truncate">{card.title || card.header?.text}</div>
                                                                                    <div className="text-[8px] text-slate-400 line-clamp-1">{card.description || card.body?.text}</div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}

                                                            {contentType === 'PRODUCT' && (
                                                                <div className="mb-2 -mx-4 -mt-3 bg-slate-50 border-b overflow-hidden">
                                                                    {link ? (
                                                                        <div className="relative aspect-square">
                                                                            <img src={proxyMediaLink(link)} onClick={() => setZoomedImage(proxyMediaLink(link))} className="w-full h-full object-cover cursor-zoom-in hover:opacity-90 transition-opacity" alt="Product" />
                                                                            <div className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-full shadow-sm">
                                                                                <ShoppingBag size={14} className="text-purple-600" />
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                                                                            <ShoppingBag size={24} />
                                                                            <div className="text-[9px] font-black uppercase tracking-widest">Catalog Item</div>
                                                                        </div>
                                                                    )}
                                                                    <div className="p-3">
                                                                        {(content.product_retailer_id || content.product_reply?.product_retailer_id || content.action?.catalog_id) && <div className="text-[9px] font-bold text-slate-400 mb-1">ID: {content.product_retailer_id || content.product_reply?.product_retailer_id || content.action?.catalog_id}</div>}
                                                                        <div className="text-[12px] font-black text-slate-800">{content.product_reply?.title || content.body || content.text || "View Product"}</div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {type === 'ORDER' && (
                                                                <div className="p-3 bg-orange-50 rounded-xl mb-2 border border-orange-100 min-w-[200px]">
                                                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-orange-200/50">
                                                                        <ShoppingBag className="text-orange-600" size={16} />
                                                                        <div className="text-[11px] font-black uppercase text-orange-900">Order Received</div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        {(content.product_items || []).map((item: any, idx: number) => (
                                                                            <div key={idx} className="flex justify-between text-[11px] font-bold text-slate-800">
                                                                                <span className="truncate mr-2" title={item.product_retailer_id || item.item_retailer_id || item.id || item.retailer_id}>
                                                                                    {item.product_retailer_id || item.item_retailer_id || item.id || item.retailer_id || 'Unknown Product'} (x{item.quantity})
                                                                                </span>
                                                                                <span className="text-orange-600">₹{item.item_price || '0'}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {type === 'CONTACTS' && (content.contacts || []).length > 0 && (
                                                                <div className={`p-3 rounded-xl mb-3 border min-w-[220px] shadow-sm transition-all hover:shadow-md ${isOutbound ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-200'}`}>
                                                                    {(content.contacts || []).map((c: any, ci: number) => (
                                                                        <div key={ci} className="space-y-3">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className={`p-2.5 rounded-full shadow-inner ${isOutbound ? 'bg-white/20 text-white' : 'bg-indigo-600 text-white'}`}>
                                                                                    <User size={18} />
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className={`text-[13px] font-black truncate ${isOutbound ? 'text-white' : 'text-slate-900'}`}>{c.name}</div>
                                                                                    <div className={`text-[10px] font-bold opacity-70 ${isOutbound ? 'text-white' : 'text-slate-500'}`}>{c.phone}</div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex gap-2 pt-1">
                                                                                <button 
                                                                                    onClick={() => { setReplyText(`Hi ${c.name}, `); document.getElementById('chat-composer')?.focus(); }}
                                                                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all active:scale-95 flex items-center justify-center gap-1.5 ${isOutbound ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 shadow-sm'}`}
                                                                                >
                                                                                    <MessageSquare size={12} /> Chat
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Text Body */}
                                                            <div className="text-[14px] leading-relaxed whitespace-pre-wrap break-words font-medium">
                                                                {content.nfm_reply?.body || content.nfm_reply?.name ||
                                                                    content.button_reply?.title || content.list_reply?.title ||
                                                                    content.body || content.text || content.caption ||
                                                                    content.raw?.interactive?.body?.text ||
                                                                    content.raw?.text?.body ||
                                                                    (type === 'INTERACTIVE' ? <span className="text-[10px] italic opacity-50">Interactive Meta Workflow Message</span> : "")}
                                                            </div>

                                                            {/* Flow Form Submission Data (NFM Reply) */}
                                                            {content.nfm_reply?.response_json && (
                                                                <div className={`mt-3 p-3 rounded-xl border ${isOutbound ? 'bg-white/10 border-white/20' : 'bg-emerald-50 border-emerald-100'}`}>
                                                                    <div className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5 opacity-70">
                                                                        <CheckSquare size={12} /> Form Submitted
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        {(() => {
                                                                            try {
                                                                                const formData = JSON.parse(content.nfm_reply.response_json);
                                                                                return Object.entries(formData)
                                                                                    .filter(([key]) => key !== 'flow_token')
                                                                                    .sort(([a], [b]) => {
                                                                                        // Sort by the original index suffix e.g., _4 vs _5
                                                                                        const numA = parseInt(a.match(/_(\d+)$/)?.[1] || "0");
                                                                                        const numB = parseInt(b.match(/_(\d+)$/)?.[1] || "0");
                                                                                        return numA - numB;
                                                                                    })
                                                                                    .map(([key, val]: [string, any]) => {
                                                                                        // Clean up key: screen_0_Whats_Your_Name_4 -> Whats Your Name
                                                                                        const cleanKey = key.replace(/^screen_\d+_/i, '').replace(/_\d+$/, '').replace(/_/g, ' ');
                                                                                        
                                                                                        // Clean up value: "1_Afternoon" or ["1_Afternoon"] -> "Afternoon"
                                                                                        let cleanVal = "";
                                                                                        if (Array.isArray(val)) {
                                                                                            cleanVal = val.map(v => String(v).replace(/^\d+_/i, '').replace(/_/g, ' ')).join(', ');
                                                                                        } else {
                                                                                            cleanVal = String(val).replace(/^\d+_/i, '').replace(/_/g, ' ');
                                                                                        }
                                                                                        
                                                                                        return (
                                                                                            <div key={key} className="flex flex-col">
                                                                                                <span className="text-[9px] font-bold opacity-60 uppercase">{cleanKey}</span>
                                                                                                <span className="text-[12px] font-semibold">{cleanVal}</span>
                                                                                            </div>
                                                                                        );
                                                                                    });
                                                                            } catch (e) {
                                                                                return <span className="text-[10px] font-mono">{content.nfm_reply.response_json}</span>;
                                                                            }
                                                                        })()}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Interactive Buttons / CTAs */}
                                                            {(content.buttons || content.raw?.interactive?.action?.buttons || content.action?.name === 'cta_url' || content.action?.name === 'call_number') && (
                                                                <div className="mt-3 space-y-1.5">
                                                                    {/* Standard Buttons */}
                                                                    {(content.buttons || content.raw?.interactive?.action?.buttons || []).map((b: any, bi: number) => (
                                                                        <div key={bi} className={`py-1.5 px-3 rounded-lg border text-[10px] font-black uppercase text-center cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center gap-1 ${isOutbound ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                                                                            {b.reply?.title || b.title || b}
                                                                        </div>
                                                                    ))}

                                                                    {/* CTA URL */}
                                                                    {content.action?.name === 'cta_url' && (
                                                                        <div className={`py-1.5 px-3 rounded-lg border text-[10px] font-black uppercase text-center cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center gap-1.5 ${isOutbound ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                                                                            <ExternalLink size={10} /> {content.action.parameters?.display_text || 'Link'}
                                                                        </div>
                                                                    )}

                                                                    {/* CTA Call */}
                                                                    {content.action?.name === 'call_number' && (
                                                                        <div className={`py-1.5 px-3 rounded-lg border text-[10px] font-black uppercase text-center cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center gap-1.5 ${isOutbound ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                                                                            <Phone size={10} /> {content.action.parameters?.display_text || 'Call'}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Status line */}
                                                            <div className="mt-1 flex items-center justify-end gap-1 opacity-60">
                                                                <span className="text-[9px] font-bold">{safeFormat(msg.created_at, "HH:mm")}</span>
                                                                {isOutbound && (msg.status === 'READ' ? <CheckCheck size={10} className="text-blue-200" /> : <Check size={10} />)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />

                                {/* New Message / Scroll to Bottom Button */}
                                {(showScrollButton || hasNewMessages) && (
                                    <div className="sticky bottom-4 left-0 right-0 flex justify-center z-50 pointer-events-none">
                                        <button 
                                            onClick={() => scrollToBottom(true)}
                                            className={`pointer-events-auto flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl transition-all border animate-in slide-in-from-bottom-4 duration-300 ${hasNewMessages ? 'bg-emerald-600 text-white border-emerald-500 scale-105 ring-4 ring-emerald-500/20' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}
                                        >
                                            {hasNewMessages ? (
                                                <>
                                                    <Sparkles size={16} className="animate-pulse" />
                                                    <span className="text-xs font-black uppercase tracking-widest">New message below</span>
                                                    <ChevronRight className="rotate-90" size={16} />
                                                </>
                                            ) : (
                                                <ChevronRight className="rotate-90" size={18} />
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Advanced Composer Box */}
                            <div className="p-6 bg-white border-t border-gray-100 shrink-0">

                                {/* Suggestion Bar */}
                                {suggestions.length > 0 && (
                                    <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar py-1">
                                        {suggestions.map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setReplyText(s)}
                                                className="shrink-0 px-4 py-2 bg-green-50/50 hover:bg-green-100 text-green-700 rounded-2xl text-[12px] font-black uppercase tracking-tight border border-green-100 transition-all flex items-center gap-2 group whitespace-nowrap"
                                            >
                                                <Sparkles size={12} className="text-green-500 group-hover:animate-spin" /> {s}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Attachment Preview */}
                                {attachedFile && (
                                    <div className="mb-4 p-4 bg-gray-50 rounded-3xl flex items-center justify-between border-2 border-dashed border-gray-200 animate-in slide-in-from-bottom-2 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-white rounded-2xl border border-emerald-100 flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
                                                {attachedFile.type.includes('image') ? <ImageIcon size={24} className="text-emerald-500" /> : <FileText size={24} className="text-blue-500" />}
                                            </div>
                                            <div>
                                                <div className="text-[13px] font-black text-gray-800 truncate max-w-[200px]">{attachedFile.filename}</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Waiting to send</div>
                                                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                                    <div className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Ready</div>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setAttachedFile(null)} className="p-3 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm">
                                            <X size={20} />
                                        </button>
                                    </div>
                                )}

                                <div className="flex items-end gap-3 w-full">
                                    <div className="flex items-center gap-1 pb-1">
                                        <button
                                            title="Attach file"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-2xl transition-all active:scale-90"
                                        >
                                            <Paperclip size={22} className={uploading ? "animate-spin" : ""} />
                                            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                                        </button>
                                        <button
                                            title="AI Suggestion"
                                            onClick={fetchAISuggestions}
                                            disabled={fetchingSuggestions}
                                            className={`p-3 rounded-2xl transition-all ${fetchingSuggestions ? 'text-green-600 animate-pulse' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                                        >
                                            <Sparkles size={22} />
                                        </button>
                                        <button className="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-2xl transition-all hidden sm:flex">
                                            <Mic size={22} />
                                        </button>
                                    </div>

                                    <div className="flex-1 bg-slate-100/80 border border-slate-200 focus-within:bg-white focus-within:border-emerald-500/30 rounded-[1.25rem] flex items-end transition-all shadow-sm relative group overflow-hidden">
                                        <textarea
                                            id="chat-composer"
                                            rows={1}
                                            value={replyText}
                                            onChange={e => {
                                                setReplyText(e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                                            }}
                                            onKeyDown={onKeyDown}
                                            placeholder="Type your message here..."
                                            className="w-full bg-transparent border-none px-6 py-4 text-[14px] focus:ring-0 outline-none resize-none font-medium placeholder:text-gray-400"
                                        />
                                        <div className="absolute right-4 bottom-3 opacity-30 group-focus-within:opacity-100 transition-opacity">
                                            <Command size={14} className="text-gray-400" />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSend}
                                        disabled={sending || (!replyText.trim() && !attachedFile)}
                                        className="bg-emerald-600 text-white p-4 rounded-xl hover:bg-emerald-700 active:bg-emerald-800 transition-all flex items-center justify-center shadow-lg shadow-emerald-200 disabled:bg-slate-200 disabled:shadow-none h-14 w-14 shrink-0 group"
                                    >
                                        {sending ? <Loader2 size={24} className="animate-spin" /> : <Send size={22} fill="currentColor" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                    </button>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2.5 items-center justify-center sm:justify-start border-t border-slate-50 pt-4">
                                    <button onClick={() => setShowDripModal(true)} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#5C5CFF] bg-[#5C5CFF]/5 hover:bg-[#5C5CFF]/10 px-3 py-2 rounded-lg transition-all border border-[#5C5CFF]/10">
                                        <Zap size={10} fill="currentColor" /> Enroll in Drip
                                    </button>
                                    <button onClick={() => setShowFollowUpModal(true)} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-all border border-emerald-100">
                                        <Calendar size={10} /> Schedule Follow Up
                                    </button>
                                    <button onClick={() => { setShowTemplateModal(true); fetchTemplates(); }} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-2 rounded-lg transition-all border border-violet-100">
                                        <FilePlus size={10} /> Template
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* CRM SIDE PANEL: Perfil & Detalhes */}
                        {
                            showCRM && (
                                <div className="hidden xl:flex w-[340px] bg-white border-l border-slate-100 flex flex-col overflow-y-auto no-scrollbar shrink-0 relative animate-in slide-in-from-right-10 duration-700 shadow-[20px_0_40px_rgba(0,0,0,0.02)]">
                                    <div className="p-8 space-y-8">
                                        {/* CRM Header */}
                                        <div className="text-center space-y-4">
                                            <div className="w-24 h-24 mx-auto bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 flex items-center justify-center relative group">
                                                {activeConversation?.contact?.avatar_url ? (
                                                    <img src={activeConversation.contact.avatar_url} alt="" className="w-full h-full object-cover rounded-[2.5rem]" />
                                                ) : (
                                                    <User size={40} className="text-gray-200" />
                                                )}
                                                <button className="absolute -right-2 -bottom-2 p-2.5 bg-green-600 text-white rounded-2xl shadow-lg border-2 border-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
                                                    <Camera size={16} />
                                                </button>
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-xl font-black text-gray-900 tracking-tight">{activeConversation?.contact?.name || activeConversation?.contact?.phone || "Contact"}</h4>
                                                <div className="flex justify-center">
                                                    <LeadScoreBadge score={85} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Info size={14} /> Contact Information
                                            </h5>
                                            <div className="grid gap-3">
                                                {[
                                                    { icon: Phone, label: 'WhatsApp', value: activeConversation?.contact?.phone || '—' },
                                                    { icon: Mail, label: 'Email', value: activeConversation?.contact?.email || '—' },
                                                    { icon: LayoutDashboard, label: 'Workspace', value: 'Default Workspace' },
                                                    { icon: Clock, label: 'Created', value: safeFormat(activeConversation?.contact?.created_at, "MMM d, yyyy", '—') },
                                                ].map((field, idx) => (
                                                    <div key={idx} className="bg-white px-5 py-4 rounded-2xl border border-gray-100 flex items-center gap-4 hover:border-green-100 transition-colors shadow-sm">
                                                        <field.icon size={16} className="text-gray-400" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{field.label}</p>
                                                            <p className="text-[12px] font-bold text-gray-800 truncate">{field.value}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Tags / Labels */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Tag size={14} /> Labels & Segmentation
                                                </h5>
                                                <button className="text-[9px] font-black text-green-600 hover:bg-green-50 px-2 py-1 rounded-lg">EDIT</button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {activeConversation?.contact?.tags?.map((tag: any, i: number) => (
                                                    <span key={i} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-[10px] font-bold rounded-xl shadow-sm hover:border-green-600 hover:text-green-600 cursor-pointer transition-all">
                                                        {tag}
                                                    </span>
                                                ))}
                                                <button className="w-8 h-8 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:text-green-600 hover:border-green-600 transition-all">
                                                    <PlusCircle size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Internal Notes */}
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <FileText size={14} /> Internal Notes
                                            </h5>
                                            <div className="space-y-3">
                                                <div className="relative">
                                                    <textarea
                                                        value={newNote}
                                                        onChange={e => setNewNote(e.target.value)}
                                                        placeholder="Add a private note..."
                                                        className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-xs font-medium outline-none focus:border-green-600/30 transition-all resize-none shadow-sm"
                                                        rows={2}
                                                    />
                                                    <button
                                                        onClick={handleAddNote}
                                                        disabled={savingNote || !newNote.trim()}
                                                        className="absolute right-2 bottom-2 p-1.5 bg-green-600 text-white rounded-xl hover:bg-slate-900 transition-all disabled:opacity-50"
                                                    >
                                                        {savingNote ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                                    </button>
                                                </div>
                                                <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar">
                                                    {contactNotes.map((note, i) => (
                                                        <div key={i} className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                                                            <p className="text-[11px] text-gray-700 font-medium leading-relaxed">{note.content}</p>
                                                            <div className="flex justify-between items-center mt-2">
                                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{note.user?.first_name || 'Agent'}</span>
                                                                <span className="text-[9px] text-gray-400 font-bold">{safeFormat(note.created_at, "MMM d, HH:mm", "...")}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Follow Up Section */}
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Calendar size={14} /> Follow Up
                                            </h5>
                                            {contactFollowUps.length > 0 ? (
                                                contactFollowUps.filter(f => f.status === "PENDING").map((fu, i) => (
                                                    <div key={i} className="bg-green-600 rounded-[1.5rem] p-5 text-white shadow-xl shadow-green-100 relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer">
                                                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-125 transition-transform" />
                                                        <div className="relative">
                                                            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Next Contact</p>
                                                            <h4 className="text-lg font-black tracking-tight">{safeFormat(fu.scheduled_at, "MMM d, yyyy", "TBD")}</h4>
                                                            <p className="text-[11px] font-medium opacity-90 mt-2">“{fu.notes || 'No notes'}”</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div onClick={() => setShowFollowUpModal(true)} className="bg-white border-2 border-dashed border-gray-200 rounded-[1.5rem] p-6 text-center group cursor-pointer hover:border-green-600 transition-all">
                                                    <Calendar className="mx-auto text-gray-300 group-hover:text-green-600 transition-colors mb-2" size={24} />
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-green-600">No Follow Up Scheduled</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Active Automation */}
                                        <div className="space-y-4 pb-20">
                                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Zap size={14} /> Automation Activity
                                            </h5>
                                            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm"><Zap size={20} /></div>
                                                        <div>
                                                            <p className="text-[11px] font-black text-gray-800">Drip: Onboarding v2</p>
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active • Step 3/5</p>
                                                        </div>
                                                    </div>
                                                    <button className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 rounded-xl transition-all">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="w-[60%] h-full bg-indigo-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 z-10">
                        <div className="w-32 h-32 bg-white rounded-[3.5rem] shadow-2xl shadow-green-100/50 flex items-center justify-center mb-10 relative">
                            <div className="absolute inset-0 bg-green-600 blur-3xl opacity-10 animate-pulse" />
                            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-800 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-green-200 relative">
                                <MessageSquare size={40} fill="currentColor" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">Ready for Sales?</h3>
                        <p className="text-sm text-gray-400 mt-4 max-w-sm leading-relaxed font-bold uppercase tracking-wide">
                            Select a conversation to start closing deals. Your WhatsApp command center is ready.
                        </p>

                        <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md">
                            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center gap-2">
                                <div className="text-2xl font-black text-green-600">24</div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Open</div>
                            </div>
                            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center gap-2">
                                <div className="text-2xl font-black text-amber-500">8</div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Urgent</div>
                            </div>
                        </div>

                        <div className="mt-12 flex gap-3">
                            <div className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-xl shadow-slate-200 flex items-center gap-2">
                                <Command size={12} /> Press K to search
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showDripModal && <DripEnrollModal contact={activeConversation?.contact} onClose={() => setShowDripModal(false)} />}
            {showFollowUpModal && <FollowUpModal contact={activeConversation?.contact} onClose={() => setShowFollowUpModal(false)} />}

            {
                isNewChatModalOpen && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-10 text-center">
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <UserPlus size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Start Conversation</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">Establish Live Connection</p>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Phone number (e.g. 5511...)"
                                        value={newChatPhone}
                                        onChange={(e) => setNewChatPhone(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-emerald-500/50 focus:bg-white transition-all"
                                    />
                                    <button
                                        onClick={handleInitializeChat}
                                        disabled={startingChat || !newChatPhone.trim()}
                                        className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {startingChat ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Initialize Chat Engine"}
                                    </button>
                                    <button onClick={() => setIsNewChatModalOpen(false)} className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                                        Dismiss Request
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Image Zoom Lightbox */}
            {zoomedImage && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setZoomedImage(null)}>
                    <button className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors" onClick={() => setZoomedImage(null)}>
                        <X size={24} />
                    </button>
                    <img src={zoomedImage} alt="Zoomed Media" className="max-w-full max-h-[90vh] object-contain cursor-zoom-out shadow-2xl rounded-lg" onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            {/* Template Picker Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShowTemplateModal(false)}>
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-black text-slate-900 text-lg">Send Template</h3>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Select an approved template to send</p>
                            </div>
                            <button onClick={() => setShowTemplateModal(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-900">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="px-6 pt-4">
                            <div className="relative">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search templates..."
                                    value={templateSearch}
                                    onChange={(e) => setTemplateSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-300 transition-all"
                                />
                            </div>
                        </div>
                        <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
                            {templates.filter(t => t.name.toLowerCase().includes(templateSearch.toLowerCase())).length === 0 ? (
                                <div className="text-center py-10 text-slate-400">
                                    <FilePlus size={32} className="mx-auto mb-3 opacity-30" />
                                    <p className="font-bold text-sm">No approved templates found.</p>
                                    <p className="text-xs mt-1">Go to Templates to create and submit one for approval.</p>
                                </div>
                            ) : (
                                templates
                                    .filter(t => t.name.toLowerCase().includes(templateSearch.toLowerCase()))
                                    .map((t) => {
                                        const bodyComp = t.components?.find((c: any) => c.type === "BODY");
                                        return (
                                            <div key={t.id} className="group border border-slate-100 rounded-2xl p-4 hover:border-violet-200 hover:bg-violet-50/50 transition-all cursor-pointer" onClick={() => handleSendTemplate(t)}>
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 bg-violet-100 px-2 py-0.5 rounded-md">{t.category || "MARKETING"}</span>
                                                            <span className="text-[10px] font-bold text-slate-400">{t.language}</span>
                                                        </div>
                                                        <p className="font-black text-slate-900 text-sm truncate">{t.name}</p>
                                                        {bodyComp && <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">{bodyComp.text}</p>}
                                                    </div>
                                                    <button
                                                        disabled={sendingTemplate}
                                                        className="shrink-0 flex items-center gap-1.5 bg-violet-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl hover:bg-violet-700 transition-all disabled:opacity-50 group-hover:scale-105"
                                                    >
                                                        {sendingTemplate ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                                        Send
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SidebarLink({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active: boolean }) {
    return (
        <Link
            href={href}
            title={label}
            className={`p-4 rounded-2xl transition-all relative group ${active ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}
        >
            <Icon size={22} />
            {active && (
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-emerald-400 rounded-l-full shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
            )}
        </Link>
    );
}
