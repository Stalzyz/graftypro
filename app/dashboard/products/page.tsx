"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Package, Search, MoreVertical, ShoppingBag, ShoppingCart } from "lucide-react";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            if (data.data) setProducts(data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filtered = products.filter((p: any) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight italic">E-commerce</h1>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Connect and manage your digital storefront.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
                        <ShoppingBag size={16} className="text-[#96BF48]" /> Shopify
                    </button>
                    <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
                        <ShoppingCart size={16} className="text-[#3C434A]" /> WooCommerce
                    </button>
                    <Link href="/dashboard/products/new">
                        <button className="bg-gradient-to-r from-[#27954D] to-[#042F94] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all active:scale-95">
                            <Plus size={16} /> Add Product
                        </button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search products by name or SKU..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading catalog...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 dashed-border">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
                    <p className="text-gray-500 mb-6">Start selling by adding your first product.</p>
                    <Link href="/dashboard/products/new">
                        <button className="text-blue-600 font-medium hover:underline">Create Product</button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((product: any) => (
                        <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Package className="text-gray-300" size={48} />
                                )}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="bg-white p-2 rounded-lg shadow-sm text-gray-600 hover:text-blue-600">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-900 truncate pr-4" title={product.name}>{product.name}</h3>
                                    <span className="font-bold text-gray-900">₹{product.price}</span>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-4">
                                    {product.description || "No description provided."}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                                    <span>SKU: {product.sku || "N/A"}</span>
                                    <span className={`px-2 py-1 rounded-full ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {product.is_active ? "Active" : "Draft"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
