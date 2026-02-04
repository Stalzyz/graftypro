"use client";

import { useState, useEffect } from "react";
import { Search, MoreHorizontal, UserPlus } from "lucide-react";

export default function ContactsPage() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In real app, use SWR or React Query
        fetch("/api/contacts")
            .then((res) => res.json())
            .then((data) => {
                setContacts(data.data || []);
                setLoading(false);
            });
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
                    <p className="text-gray-500">Manage your audience.</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    <UserPlus size={18} />
                    Add Contact
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-700">
                    <option>All Segments</option>
                    <option>VIP Customers</option>
                    <option>New Leads</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-900 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Name</th>
                            <th className="px-6 py-4 font-semibold">Phone</th>
                            <th className="px-6 py-4 font-semibold">Tags</th>
                            <th className="px-6 py-4 font-semibold">Last Active</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr>
                        ) : contacts.map((c: any) => (
                            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{c.name || "Unknown"}</td>
                                <td className="px-6 py-4 text-gray-500">{c.phone}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium border border-blue-100">
                                        Lead
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-400">2 days ago</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && contacts.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        No contacts found.
                    </div>
                )}
            </div>
        </div>
    );
}
