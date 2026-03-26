"use client";

import { useState, useEffect, useRef } from "react";
import {
    Plus,
    Search,
    MoreHorizontal,
    X,
    Upload,
    Filter,
    Layers,
    Users,
    FileText,
    CheckCircle2,
    AlertCircle,
    Phone,
    Mail,
    Tag,
    Trash2,
    Edit2,
    UserPlus,
    Download,
} from "lucide-react";
import Papa from "papaparse";

interface Contact {
    id: string;
    name: string | null;
    phone: string;
    email: string | null;
    tags: string[];
    last_active_at: string;
}

interface Segment {
    id: string;
    name: string;
    filters: any;
}

const TAG_COLORS = [
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
];
const getTagColor = (tag: string) => TAG_COLORS[tag.charCodeAt(0) % TAG_COLORS.length];

function Avatar({ name }: { name: string }) {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    const colors = [
        "from-violet-500 to-purple-600",
        "from-blue-500 to-indigo-600",
        "from-emerald-500 to-green-600",
        "from-amber-500 to-orange-500",
        "from-rose-500 to-pink-600",
        "from-cyan-500 to-sky-600",
    ];
    const color = colors[name.charCodeAt(0) % colors.length];
    return (
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0`}>
            {initials || "?"}
        </div>
    );
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedSegmentId, setSelectedSegmentId] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showSegmentModal, setShowSegmentModal] = useState(false);

    const [importing, setImporting] = useState(false);
    const [importStats, setImportStats] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [newContact, setNewContact] = useState({ phone: "", name: "", email: "", tags: "" });
    const [editForm, setEditForm] = useState<{ id: string, name: string, email: string, tags: string } | null>(null);
    const [newSegment, setNewSegment] = useState({ name: "", tags: "" });
    const [showBulkTagModal, setShowBulkTagModal] = useState(false);
    const [bulkTags, setBulkTags] = useState("");

    useEffect(() => { fetchData(); }, [selectedSegmentId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [contactsRes, segmentsRes] = await Promise.all([
                fetch(`/api/contacts?page=${page}&limit=50&search=${search}&segmentId=${selectedSegmentId}`),
                fetch("/api/segments")
            ]);
            const contactsData = await contactsRes.json();
            const segmentsData = await segmentsRes.json();
            if (contactsData.data) setContacts(contactsData.data);
            if (segmentsData.data) setSegments(segmentsData.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(fetchData, 500);
        return () => clearTimeout(t);
    }, [search, page]);

    const handleAddContact = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/contacts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...newContact,
                tags: newContact.tags.split(",").map(t => t.trim()).filter(Boolean)
            })
        });
        if (res.ok) {
            setShowAddModal(false);
            setNewContact({ phone: "", name: "", email: "", tags: "" });
            fetchData();
        }
    };

    const handleUpdateContact = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm) return;
        const res = await fetch(`/api/contacts/${editForm.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: editForm.name,
                email: editForm.email,
                tags: typeof editForm.tags === "string" ? editForm.tags.split(",").map(t => t.trim()).filter(Boolean) : editForm.tags
            })
        });
        if (res.ok) {
            setEditForm(null);
            fetchData();
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const contactsToImport = results.data.map((row: any) => ({
                    phone: row.phone || row.Phone || row.mobile,
                    name: row.name || row.Name || row.full_name,
                    email: row.email || row.Email,
                    tags: (row.tags || row.Tags || "").split(",").map((t: string) => t.trim()).filter(Boolean)
                }));
                setImporting(true);
                const res = await fetch("/api/contacts/bulk-import", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contacts: contactsToImport })
                });
                const data = await res.json();
                setImportStats(data.stats);
                setImporting(false);
                fetchData();
            }
        });
    };

    const handleDownloadSample = () => {
        const csvContent = "phone,name,email,tags\n15551234567,John Doe,john@example.com,\"vip,customer\"\n15557654321,Jane Smith,jane@example.com,lead";
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "sample_contacts.csv"; a.click();
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.length} contacts?`)) return;
        const res = await fetch("/api/contacts/bulk-delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selectedIds })
        });
        if (res.ok) { setSelectedIds([]); fetchData(); }
    };

    const handleDeleteSingle = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;
        const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
        if (res.ok) fetchData();
    };

    const handleBulkAddTags = async (e: React.FormEvent) => {
        e.preventDefault();
        const tagsArray = bulkTags.split(",").map(t => t.trim()).filter(Boolean);
        if (!tagsArray.length) return;
        const res = await fetch("/api/contacts/bulk-tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selectedIds, tags: tagsArray })
        });
        if (res.ok) {
            setShowBulkTagModal(false);
            setBulkTags("");
            setSelectedIds([]);
            fetchData();
        }
    };

    const handleCreateSegment = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/segments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: newSegment.name,
                filters: { tags: newSegment.tags.split(",").map(t => t.trim()).filter(Boolean) }
            })
        });
        if (res.ok) {
            setShowSegmentModal(false);
            setNewSegment({ name: "", tags: "" });
            fetchData();
        }
    };

    const allSelected = selectedIds.length === contacts.length && contacts.length > 0;

    return (
        <div className="space-y-6 animate-fade-in">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Contacts & Audiences</h1>
                    <p className="text-slate-500 text-sm font-medium mt-0.5">Manage contacts, segments, and bulk imports.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-[#27954D]/40 hover:text-[#27954D] hover:shadow-sm transition-all">
                        <Upload size={14} /> Import CSV
                    </button>
                    <button onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#27954D] to-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-green-200 hover:shadow-lg hover:shadow-green-300 hover:-translate-y-0.5 transition-all">
                        <UserPlus size={14} /> Add Contact
                    </button>
                </div>
            </div>

            <div className="flex gap-6">
                {/* ── Sidebar ── */}
                <div className="w-52 space-y-4 shrink-0">
                    {/* Audiences */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Audiences</h3>
                            <button onClick={() => setShowSegmentModal(true)}
                                className="w-6 h-6 rounded-lg bg-[#27954D]/10 text-[#27954D] flex items-center justify-center hover:bg-[#27954D]/20 transition-all">
                                <Plus size={13} />
                            </button>
                        </div>
                        <div className="space-y-1">
                            <button
                                onClick={() => setSelectedSegmentId("all")}
                                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all ${selectedSegmentId === "all"
                                    ? "bg-[#27954D] text-white shadow-sm shadow-green-200"
                                    : "text-slate-600 hover:bg-slate-50"}`}>
                                <Users size={15} /> All Contacts
                            </button>
                            {segments.map(seg => (
                                <button key={seg.id}
                                    onClick={() => setSelectedSegmentId(seg.id)}
                                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all ${selectedSegmentId === seg.id
                                        ? "bg-[#27954D] text-white shadow-sm shadow-green-200"
                                        : "text-slate-600 hover:bg-slate-50"}`}>
                                    <Layers size={15} /> {seg.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Selection panel */}
                    {selectedIds.length > 0 ? (
                        <div className="bg-gradient-to-br from-[#042F94] to-indigo-700 rounded-2xl p-4 text-white shadow-lg shadow-indigo-200">
                            <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-1">Selected Contacts</div>
                            <div className="text-3xl font-black mb-4">{selectedIds.length}</div>
                            <div className="space-y-2">
                                <button onClick={() => setShowBulkTagModal(true)}
                                    className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all backdrop-blur-sm border border-white/10">
                                    <Tag size={13} /> Add Tags / Segment
                                </button>
                                <button onClick={handleBulkDelete}
                                    className="w-full py-2.5 bg-rose-500/80 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-inner border border-rose-500/50">
                                    <Trash2 size={13} /> Delete Selected
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-[#042F94] to-indigo-700 rounded-2xl p-4 text-white">
                            <div className="text-[10px] font-bold opacity-70 uppercase tracking-wider mb-1">Total Contacts</div>
                            <div className="text-3xl font-black mb-1">{contacts.length}</div>
                            <div className="text-[11px] text-white/60">Across all segments</div>
                        </div>
                    )}
                </div>

                {/* ── Main Table ── */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[580px]">

                    {/* Search bar */}
                    <div className="p-4 border-b border-slate-100 flex gap-3 bg-slate-50/60">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#27954D] focus:ring-2 focus:ring-[#27954D]/10 transition-all"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:border-slate-300 transition-all">
                            <Filter size={14} /> Filters
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/80">
                                    <th className="px-5 py-3.5 w-12">
                                        <input type="checkbox"
                                            className="rounded border-slate-300 text-[#27954D] focus:ring-[#27954D] cursor-pointer"
                                            checked={allSelected}
                                            onChange={() => setSelectedIds(allSelected ? [] : contacts.map(c => c.id))}
                                        />
                                    </th>
                                    <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Contact</th>
                                    <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Phone</th>
                                    <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tags</th>
                                    <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Last Active</th>
                                    <th className="px-4 py-3.5 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-5 py-4"><div className="w-4 h-4 bg-slate-100 rounded" /></td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-slate-100 rounded-xl" />
                                                    <div className="space-y-1.5">
                                                        <div className="w-28 h-3.5 bg-slate-100 rounded" />
                                                        <div className="w-20 h-3 bg-slate-100 rounded" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4"><div className="w-28 h-3.5 bg-slate-100 rounded" /></td>
                                            <td className="px-4 py-4"><div className="w-20 h-5 bg-slate-100 rounded-lg" /></td>
                                            <td className="px-4 py-4"><div className="w-16 h-3.5 bg-slate-100 rounded" /></td>
                                            <td className="px-4 py-4" />
                                        </tr>
                                    ))
                                ) : contacts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="py-20 flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                                                    <Users size={26} className="text-slate-300" />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-700 mb-1">No contacts yet</h3>
                                                <p className="text-sm text-slate-400 mb-5">Add contacts manually or import a CSV file</p>
                                                <div className="flex gap-3">
                                                    <button onClick={() => setShowImportModal(true)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-[#27954D]/40 hover:text-[#27954D] transition-all">
                                                        <Upload size={13} /> Import CSV
                                                    </button>
                                                    <button onClick={() => setShowAddModal(true)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-[#27954D] text-white rounded-xl text-xs font-bold shadow-md shadow-green-200 hover:bg-[#1f7a3f] transition-all">
                                                        <Plus size={13} /> Add Contact
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : contacts.map(contact => (
                                    <tr key={contact.id}
                                        className={`group transition-colors hover:bg-[#27954D]/5 ${selectedIds.includes(contact.id) ? "bg-[#27954D]/5" : ""}`}>
                                        <td className="px-5 py-4">
                                            <input type="checkbox"
                                                className="rounded border-slate-300 text-[#27954D] focus:ring-[#27954D] cursor-pointer"
                                                checked={selectedIds.includes(contact.id)}
                                                onChange={() => setSelectedIds(prev =>
                                                    prev.includes(contact.id) ? prev.filter(id => id !== contact.id) : [...prev, contact.id]
                                                )}
                                            />
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={contact.name || contact.phone} />
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900">{contact.name || "Unknown"}</div>
                                                    {contact.email && <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Mail size={10} />{contact.email}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1.5 text-sm font-mono text-slate-600">
                                                <Phone size={12} className="text-slate-400" />+{contact.phone}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex flex-wrap gap-1.5">
                                                {contact.tags.slice(0, 2).map((t, idx) => (
                                                    <span key={idx} className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${getTagColor(t)}`}>
                                                        {t}
                                                    </span>
                                                ))}
                                                {contact.tags.length > 2 && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500">
                                                        +{contact.tags.length - 2}
                                                    </span>
                                                )}
                                                {contact.tags.length === 0 && (
                                                    <span className="text-[10px] text-slate-300">No tags</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-slate-400">
                                            {contact.last_active_at ? new Date(contact.last_active_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Never"}
                                        </td>
                                        <td className="px-4 py-3.5 text-right flex gap-2 justify-end">
                                            <button onClick={() => setEditForm({ id: contact.id, name: contact.name || "", email: contact.email || "", tags: contact.tags.join(", ") })} className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#27954D] transition-all" title="Edit Contact">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDeleteSingle(contact.id, contact.name || `+${contact.phone}`)} className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 transition-all" title="Delete Contact">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/40">
                        <button disabled={page === 1} onClick={() => setPage(page - 1)}
                            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all">
                            ← Previous
                        </button>
                        <span className="text-xs font-semibold text-slate-400">Page {page}</span>
                        <button onClick={() => setPage(page + 1)}
                            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all">
                            Next →
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Import Modal ── */}
            {showImportModal && (
                <Modal onClose={() => { setShowImportModal(false); setImportStats(null); }} title="Import Contacts via CSV">
                    {!importStats ? (
                        <div className="space-y-5">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 hover:border-[#27954D] hover:bg-[#27954D]/5 rounded-2xl p-10 cursor-pointer transition-all group text-center">
                                <div className="w-14 h-14 bg-slate-100 group-hover:bg-[#27954D]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all">
                                    <FileText size={26} className="text-slate-400 group-hover:text-[#27954D] transition-colors" />
                                </div>
                                <h4 className="font-bold text-slate-800 mb-1">Click to upload CSV</h4>
                                <p className="text-xs text-slate-400">Columns: phone, name, email, tags</p>
                                <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
                            </div>
                            <button onClick={handleDownloadSample}
                                className="w-full flex items-center justify-center gap-2 text-xs font-bold text-[#27954D] hover:text-[#1f7a3f] py-2.5 border border-dashed border-[#27954D]/30 rounded-xl hover:border-[#27954D]/60 transition-all">
                                <Download size={13} /> Download Sample CSV Template
                            </button>
                            <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100">
                                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700">Duplicate phone numbers will be merged. Tags will be added to existing contacts.</p>
                            </div>
                            {importing && (
                                <div className="flex items-center justify-center gap-3 text-[#27954D] font-semibold text-sm py-2">
                                    <div className="w-4 h-4 border-2 border-[#27954D] border-t-transparent rounded-full animate-spin" />
                                    Importing contacts...
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="bg-emerald-50 p-6 rounded-2xl text-center border border-emerald-100">
                                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 size={28} className="text-[#27954D]" />
                                </div>
                                <h4 className="text-lg font-black text-slate-900">Import Complete!</h4>
                                <div className="grid grid-cols-3 gap-3 mt-5">
                                    {[
                                        { label: "New", value: importStats.created, color: "text-[#27954D]" },
                                        { label: "Updated", value: importStats.updated, color: "text-blue-600" },
                                        { label: "Failed", value: importStats.failed, color: "text-red-500" },
                                    ].map(item => (
                                        <div key={item.label} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                            <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                                            <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => { setShowImportModal(false); setImportStats(null); }}
                                className="w-full py-3 bg-gradient-to-r from-[#27954D] to-emerald-500 text-white rounded-xl font-bold text-sm shadow-md shadow-green-200 hover:shadow-lg transition-all">
                                Done
                            </button>
                        </div>
                    )}
                </Modal>
            )}

            {/* ── Segment Modal ── */}
            {showSegmentModal && (
                <Modal onClose={() => setShowSegmentModal(false)} title="Create Audience Segment">
                    <form onSubmit={handleCreateSegment} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Segment Name</label>
                            <input required type="text" value={newSegment.name}
                                onChange={e => setNewSegment({ ...newSegment, name: e.target.value })}
                                placeholder="e.g. VIP Customers"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#27954D] focus:ring-2 focus:ring-[#27954D]/10 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Filter by Tags</label>
                            <input required type="text" value={newSegment.tags}
                                onChange={e => setNewSegment({ ...newSegment, tags: e.target.value })}
                                placeholder="e.g. vip, loyalty, premium"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#27954D] focus:ring-2 focus:ring-[#27954D]/10 transition-all" />
                            <p className="text-xs text-slate-400 mt-1.5">Separate multiple tags with commas</p>
                        </div>
                        <button type="submit"
                            className="w-full py-3 bg-gradient-to-r from-[#27954D] to-emerald-500 text-white rounded-xl font-bold text-sm shadow-md shadow-green-200 hover:shadow-lg transition-all">
                            Create Segment
                        </button>
                    </form>
                </Modal>
            )}

            {/* ── Add Contact Modal ── */}
            {showAddModal && (
                <Modal onClose={() => setShowAddModal(false)} title="Add New Contact">
                    <form onSubmit={handleAddContact} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Phone Number *</label>
                            <div className="relative">
                                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input required type="text" value={newContact.phone}
                                    onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                                    placeholder="e.g. 919876543210"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#27954D] focus:ring-2 focus:ring-[#27954D]/10 transition-all" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Name</label>
                                <input type="text" value={newContact.name}
                                    onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#27954D] focus:ring-2 focus:ring-[#27954D]/10 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email</label>
                                <input type="email" value={newContact.email}
                                    onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                                    placeholder="john@example.com"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#27954D] focus:ring-2 focus:ring-[#27954D]/10 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Tags</label>
                            <div className="relative">
                                <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" value={newContact.tags}
                                    onChange={e => setNewContact({ ...newContact, tags: e.target.value })}
                                    placeholder="customer, vip, nyc"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#27954D] focus:ring-2 focus:ring-[#27954D]/10 transition-all" />
                            </div>
                        </div>
                        <button type="submit"
                            className="w-full py-3 bg-gradient-to-r from-[#27954D] to-emerald-500 text-white rounded-xl font-bold text-sm shadow-md shadow-green-200 hover:shadow-lg hover:-translate-y-0.5 transition-all mt-2">
                            Save Contact
                        </button>
                    </form>
                </Modal>
            )}

            {/* ── Edit Contact Modal ── */}
            {editForm && (
                <Modal onClose={() => setEditForm(null)} title="Edit Contact">
                    <form onSubmit={handleUpdateContact} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Name</label>
                                <input type="text" value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#27954D] focus:ring-2 focus:ring-[#27954D]/10 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email</label>
                                <input type="email" value={editForm.email}
                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    placeholder="john@example.com"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#27954D] focus:ring-2 focus:ring-[#27954D]/10 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Tags</label>
                            <div className="relative">
                                <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" value={editForm.tags}
                                    onChange={e => setEditForm({ ...editForm, tags: e.target.value })}
                                    placeholder="customer, vip, nyc"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#27954D] focus:ring-2 focus:ring-[#27954D]/10 transition-all" />
                            </div>
                        </div>
                        <button type="submit"
                            className="w-full py-3 bg-gradient-to-r from-[#27954D] to-emerald-500 text-white rounded-xl font-bold text-sm shadow-md shadow-green-200 hover:shadow-lg hover:-translate-y-0.5 transition-all mt-2">
                            Save Changes
                        </button>
                    </form>
                </Modal>
            )}

            {/* ── Bulk Tag Modal ── */}
            {showBulkTagModal && (
                <Modal onClose={() => setShowBulkTagModal(false)} title="Apply Tags / Segment">
                    <form onSubmit={handleBulkAddTags} className="space-y-4">
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-4">
                            <p className="text-xs text-indigo-700 font-medium">
                                You are about to apply tags to <strong>{selectedIds.length}</strong> selected contacts. This will automatically include them in matching segments.
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Enter Tags</label>
                            <div className="relative">
                                <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input required type="text" value={bulkTags}
                                    onChange={e => setBulkTags(e.target.value)}
                                    placeholder="e.g. vip, newsletter, priority"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all" />
                            </div>
                            <p className="text-[11px] text-slate-400 mt-2">Separate multiple tags with commas.</p>
                        </div>
                        <button type="submit"
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 transition-all mt-2">
                            Apply to {selectedIds.length} Contacts
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
}

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in overflow-hidden border border-slate-100"
                onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                    <h3 className="text-base font-black text-slate-900">{title}</h3>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}
