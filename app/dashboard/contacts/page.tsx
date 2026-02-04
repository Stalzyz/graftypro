"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Tag, MoreHorizontal, CheckSquare, X } from "lucide-react";

interface Contact {
    id: string;
    name: string | null;
    phone: string;
    email: string | null;
    tags: string[];
    last_active_at: string;
}

interface DripCampaign {
    id: string;
    name: string;
    status: string;
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    // Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newContact, setNewContact] = useState({ phone: "", name: "", email: "", tags: "" });

    // Drip Enrollment State
    const [showDripModal, setShowDripModal] = useState(false);
    const [drips, setDrips] = useState<DripCampaign[]>([]);
    const [selectedDripId, setSelectedDripId] = useState<string>("");
    const [enrolling, setEnrolling] = useState(false);

    // Fetch Contacts
    const fetchContacts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                search: search
            });
            const res = await fetch(`/api/contacts?${params}`);
            const data = await res.json();
            if (data.data) {
                setContacts(data.data);
                setSelectedIds([]); // Clear selection on refresh
            }
        } catch (error) {
            console.error("Failed to fetch contacts", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Drips
    const fetchDrips = async () => {
        try {
            const res = await fetch('/api/drips');
            if (res.ok) {
                const data = await res.json();
                setDrips(data.data || []);
            }
        } catch (e) {
            console.error("Failed to fetch drips", e);
        }
    };

    // Create Contact Function
    const handleAddContact = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const tagsArray = newContact.tags.split(",").map(t => t.trim()).filter(Boolean);

            const res = await fetch("/api/contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newContact,
                    tags: tagsArray
                })
            });

            if (res.ok) {
                setShowAddModal(false);
                setNewContact({ phone: "", name: "", email: "", tags: "" });
                fetchContacts(); // Refresh list
            } else {
                alert("Failed to create contact");
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Handle Bulk Enrollment (Submit)
    const handleBulkEnroll = async () => {
        if (!selectedDripId) return alert("Please select a campaign");

        setEnrolling(true);
        try {
            const res = await fetch(`/api/drips/${selectedDripId}/enroll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contact_ids: selectedIds })
            });

            const data = await res.json();
            if (res.ok) {
                alert(`Successfully enrolled ${selectedIds.length} contacts!`);
                setShowDripModal(false);
                setSelectedIds([]);
            } else {
                alert(data.error || "Enrollment failed");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred during enrollment.");
        } finally {
            setEnrolling(false);
        }
    };

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchContacts();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, page]);

    // Handle Checkbox Toggle
    const toggleSelectAll = () => {
        if (selectedIds.length === contacts.length && contacts.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(contacts.map(c => c.id));
        }
    };

    const toggleSelectOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    return (
        <div className="space-y-6">

            {/* --- Modals --- */}

            {/* Add Contact Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Contact</h2>
                        <form onSubmit={handleAddContact} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number (Required)</label>
                                <input
                                    required
                                    placeholder="e.g. 15551234567"
                                    value={newContact.phone}
                                    onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    placeholder="John Doe"
                                    value={newContact.name}
                                    onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    placeholder="john@example.com"
                                    value={newContact.email}
                                    onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tags (Comma separated)</label>
                                <input
                                    placeholder="VIP, Lead, NYC"
                                    value={newContact.tags}
                                    onChange={e => setNewContact({ ...newContact, tags: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Save Contact
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Drip Enrollment Modal */}
            {showDripModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Enroll in Drip Campaign</h2>
                            <button onClick={() => setShowDripModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-gray-500 mb-6 text-sm">
                            You are about to enroll <span className="font-semibold text-gray-800">{selectedIds.length}</span> contacts into a drip sequence.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Campaign</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={selectedDripId}
                                    onChange={(e) => setSelectedDripId(e.target.value)}
                                >
                                    <option value="">-- Choose a Campaign --</option>
                                    {drips.map(d => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.status})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    onClick={() => setShowDripModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkEnroll}
                                    disabled={enrolling || !selectedDripId}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {enrolling ? 'Enrolling...' : 'Start Campaign'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Main Content --- */}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
                    <p className="text-gray-500">Manage your audience and relationships.</p>
                </div>
                <div className="flex gap-2">
                    {/* Bulk Actions Button - Only visible when items selected */}
                    {selectedIds.length > 0 && (
                        <button
                            onClick={() => {
                                fetchDrips();
                                setShowDripModal(true);
                            }}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 shadow-sm animate-in fade-in"
                        >
                            <CheckSquare size={18} />
                            Enroll {selectedIds.length} in Drip
                        </button>
                    )}

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 shadow-sm"
                    >
                        <Plus size={18} />
                        Add Contact
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium text-xs uppercase">
                        <tr>
                            <th className="px-6 py-3 w-4">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={contacts.length > 0 && selectedIds.length === contacts.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Phone</th>
                            <th className="px-6 py-3">Tags</th>
                            <th className="px-6 py-3">Last Active</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading contacts...</td>
                            </tr>
                        ) : contacts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No contacts found. Try searching or add a new one.
                                </td>
                            </tr>
                        ) : (
                            contacts.map((contact) => (
                                <tr key={contact.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(contact.id) ? 'bg-blue-50/30' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedIds.includes(contact.id)}
                                            onChange={() => toggleSelectOne(contact.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{contact.name || "Unknown"}</div>
                                        <div className="text-sm text-gray-400">{contact.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">
                                        {contact.phone}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {contact.tags.map((tag, idx) => (
                                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                                                    {tag}
                                                </span>
                                            ))}
                                            {contact.tags.length === 0 && <span className="text-gray-400 text-sm">-</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(contact.last_active_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="hover:text-blue-600 disabled:opacity-50 transition-colors"
                    >
                        Previous
                    </button>
                    <span>Page {page}</span>
                    <button
                        onClick={() => setPage(page + 1)}
                        className="hover:text-blue-600 transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
