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
    AlertCircle
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

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedSegmentId, setSelectedSegmentId] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showSegmentModal, setShowSegmentModal] = useState(false);

    // Import state
    const [importing, setImporting] = useState(false);
    const [importStats, setImportStats] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form states
    const [newContact, setNewContact] = useState({ phone: "", name: "", email: "", tags: "" });
    const [newSegment, setNewSegment] = useState({ name: "", tags: "" });

    useEffect(() => {
        fetchData();
    }, [selectedSegmentId]);

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

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Contacts & Audiences</h1>
                    <p className="text-gray-500 text-sm">Manage contacts, segments, and bulk imports.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="btn-secondary"
                    >
                        <Upload size={16} /> Import CSV
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary"
                    >
                        <Plus size={16} /> Add Contact
                    </button>
                </div>
            </div>

            <div className="flex gap-6">
                {/* Sidebar: Segments */}
                <div className="w-56 space-y-4 shrink-0">
                    <div className="soft-card p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase">Audiences</h3>
                            <button onClick={() => setShowSegmentModal(true)} className="text-[#27954D] hover:bg-[#27954D]/10 p-1.5 rounded-lg transition-all">
                                <Plus size={14} />
                            </button>
                        </div>
                        <div className="space-y-1">
                            <button
                                onClick={() => setSelectedSegmentId("all")}
                                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${selectedSegmentId === "all" ? "bg-[#27954D]/10 text-[#042f94]" : "text-gray-600 hover:bg-gray-50"}`}
                            >
                                <Users size={16} /> All Contacts
                            </button>
                            {segments.map(seg => (
                                <button
                                    key={seg.id}
                                    onClick={() => setSelectedSegmentId(seg.id)}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${selectedSegmentId === seg.id ? "bg-[#27954D]/10 text-[#042f94]" : "text-gray-600 hover:bg-gray-50"}`}
                                >
                                    <Layers size={16} /> {seg.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Selection Stats */}
                    <div className="bg-gradient-to-br from-[#27954D] to-[#042f94] rounded-2xl p-5 text-white shadow-lg shadow-green-200/30">
                        <div className="text-xs font-medium opacity-80 uppercase mb-1">Selected</div>
                        <div className="text-2xl font-bold mb-3">{selectedIds.length}</div>
                        <button
                            disabled={selectedIds.length === 0}
                            className="w-full py-2 bg-white/20 hover:bg-white/30 disabled:opacity-30 rounded-xl text-xs font-semibold transition-all"
                        >
                            Bulk Action
                        </button>
                    </div>
                </div>

                {/* Main: Contact List */}
                <div className="flex-1">
                    <div className="soft-card overflow-hidden flex flex-col min-h-[600px]">
                        <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name or phone..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="input pl-10"
                                />
                            </div>
                            <button className="btn-secondary text-xs">
                                <Filter size={14} /> Filters
                            </button>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3 w-12">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-[#27954D] focus:ring-[#27954D]"
                                                checked={selectedIds.length === contacts.length && contacts.length > 0}
                                                onChange={() => setSelectedIds(selectedIds.length === contacts.length ? [] : contacts.map(c => c.id))}
                                            />
                                        </th>
                                        <th className="px-5 py-3 text-xs font-medium text-gray-500">Contact</th>
                                        <th className="px-5 py-3 text-xs font-medium text-gray-500">Phone</th>
                                        <th className="px-5 py-3 text-xs font-medium text-gray-500">Tags</th>
                                        <th className="px-5 py-3 text-xs font-medium text-gray-500">Last Active</th>
                                        <th className="px-5 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-5 py-4"><div className="w-4 h-4 bg-gray-100 rounded"></div></td>
                                                <td className="px-5 py-4"><div className="w-32 h-4 bg-gray-100 rounded"></div></td>
                                                <td className="px-5 py-4"><div className="w-24 h-4 bg-gray-100 rounded"></div></td>
                                                <td className="px-5 py-4"><div className="w-40 h-4 bg-gray-100 rounded"></div></td>
                                                <td className="px-5 py-4"><div className="w-20 h-4 bg-gray-100 rounded"></div></td>
                                                <td className="px-5 py-4"></td>
                                            </tr>
                                        ))
                                    ) : contacts.map(contact => (
                                        <tr key={contact.id} className={`hover:bg-[#27954D]/5 transition-colors group ${selectedIds.includes(contact.id) ? 'bg-[#27954D]/5' : ''}`}>
                                            <td className="px-5 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-[#27954D] focus:ring-[#27954D]"
                                                    checked={selectedIds.includes(contact.id)}
                                                    onChange={() => setSelectedIds(prev => prev.includes(contact.id) ? prev.filter(id => id !== contact.id) : [...prev, contact.id])}
                                                />
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-gray-800">{contact.name || "Unknown"}</div>
                                                <div className="text-xs text-gray-400">{contact.email || "No email"}</div>
                                            </td>
                                            <td className="px-5 py-4 font-mono text-xs text-gray-600">
                                                +{contact.phone}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {contact.tags.slice(0, 3).map((t, idx) => (
                                                        <span key={idx} className="badge badge-neutral text-[10px]">
                                                            {t}
                                                        </span>
                                                    ))}
                                                    {contact.tags.length > 3 && (
                                                        <span className="badge badge-info text-[10px]">
                                                            +{contact.tags.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-gray-400">
                                                {new Date(contact.last_active_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg transition-all">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {contacts.length === 0 && !loading && (
                                <div className="py-16 flex flex-col items-center justify-center text-center">
                                    <div className="w-14 h-14 bg-[#27954D]/10 text-[#27954D] rounded-2xl flex items-center justify-center mb-4">
                                        <Users size={24} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">No contacts found</h3>
                                    <p className="text-sm text-gray-400 mt-1">Try changing your search or segment filter.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 hover:text-gray-900 disabled:opacity-30 transition-colors">
                                Previous
                            </button>
                            <span>Page {page}</span>
                            <button onClick={() => setPage(page + 1)} className="px-3 py-1.5 hover:text-gray-900 transition-colors">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <Modal onClose={() => { setShowImportModal(false); setImportStats(null); }} title="Import CSV">
                    {!importStats ? (
                        <div className="space-y-6 text-center">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-200 hover:border-[#27954D] hover:bg-[#27954D]/5 rounded-2xl p-10 cursor-pointer transition-all group"
                            >
                                <FileText size={40} className="mx-auto text-gray-300 group-hover:text-[#27954D] transition-colors mb-4" />
                                <h4 className="font-semibold text-gray-800">Click to upload or drag and drop</h4>
                                <p className="text-xs text-gray-400 mt-2">CSV with headers: phone, name, tags</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                />
                            </div>
                            <div className="flex items-start gap-3 text-left bg-amber-50 p-4 rounded-xl border border-amber-100">
                                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700">Duplicate phone numbers will be merged. Tags will be added to existing ones.</p>
                            </div>
                            {importing && (
                                <div className="flex items-center justify-center gap-3 text-[#27954D] font-medium animate-pulse">
                                    <div className="w-4 h-4 border-2 border-[#27954D] border-t-transparent rounded-full animate-spin"></div>
                                    Importing contacts...
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-[#27954D]/10 p-6 rounded-2xl text-center">
                                <CheckCircle2 size={40} className="mx-auto text-[#27954D] mb-4" />
                                <h4 className="text-lg font-bold text-gray-800">Import Complete!</h4>
                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div className="bg-white p-3 rounded-xl">
                                        <div className="text-xs text-gray-500">New</div>
                                        <div className="text-xl font-bold text-[#27954D]">{importStats.created}</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl">
                                        <div className="text-xs text-gray-500">Updated</div>
                                        <div className="text-xl font-bold text-blue-600">{importStats.updated}</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl">
                                        <div className="text-xs text-gray-500">Failed</div>
                                        <div className="text-xl font-bold text-red-500">{importStats.failed}</div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowImportModal(false); setImportStats(null); }}
                                className="btn-primary w-full"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </Modal>
            )}

            {/* Segment Modal */}
            {showSegmentModal && (
                <Modal onClose={() => setShowSegmentModal(false)} title="Create Audience">
                    <form onSubmit={handleCreateSegment} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Segment Name</label>
                            <input
                                required
                                type="text"
                                value={newSegment.name}
                                onChange={e => setNewSegment({ ...newSegment, name: e.target.value })}
                                placeholder="e.g. VIP Customers"
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Filter by Tags (comma separated)</label>
                            <input
                                required
                                type="text"
                                value={newSegment.tags}
                                onChange={e => setNewSegment({ ...newSegment, tags: e.target.value })}
                                placeholder="e.g. vip, loyalty"
                                className="input"
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full">
                            Create Segment
                        </button>
                    </form>
                </Modal>
            )}

            {/* Add Contact Modal */}
            {showAddModal && (
                <Modal onClose={() => setShowAddModal(false)} title="New Contact">
                    <form onSubmit={handleAddContact} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone Number</label>
                            <input
                                required
                                type="text"
                                value={newContact.phone}
                                onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                                placeholder="e.g. 15551234567"
                                className="input"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Name</label>
                                <input
                                    type="text"
                                    value={newContact.name}
                                    onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                                    placeholder="John Doe"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={newContact.email}
                                    onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                                    placeholder="john@doe.com"
                                    className="input"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={newContact.tags}
                                onChange={e => setNewContact({ ...newContact, tags: e.target.value })}
                                placeholder="customer, nyc"
                                className="input"
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full">
                            Save Contact
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
}

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
