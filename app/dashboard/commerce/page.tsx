"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
    ShoppingBag,
    RefreshCw,
    Plus,
    CheckCircle2,
    AlertCircle,
    Package,
    ShoppingCart,
    Link as LinkIcon,
    TrendingUp,
    Zap,
    Globe,
    ExternalLink,
    ChevronRight,
    Search,
    Filter,
    ArrowUpRight,
    Wallet,
    Truck,
    Clock,
    Tag,
    Share2,
    MoreHorizontal,
    ShoppingCart as ShoppingCard,
    Edit2,
    Trash2
} from "lucide-react";

interface Store {
    id: string;
    name: string;
    platform: string;
    status: string;
    catalog_id?: string;
    _count?: {
        products: number;
        orders: number;
    };
}

interface Variant {
    id?: string;
    name: string;
    price: string;
    stock: string;
    sku?: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: string;
    compare_at_price?: string;
    sku?: string;
    stock: number;
    image_urls: string[];
    variants?: Variant[];
}

export default function CommercePage() {
    const searchParams = useSearchParams();
    const [stores, setStores] = useState<Store[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState<string | null>(null);
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [savingProduct, setSavingProduct] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const [editStoreId, setEditStoreId] = useState<string | null>(null);
    const [editProductId, setEditProductId] = useState<string | null>(null);
    const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState(false);
    const [logisticsSaving, setLogisticsSaving] = useState(false);
    const [logisticsForm, setLogisticsForm] = useState({ email: "", password: "" });

    // Form States
    const [newStore, setNewStore] = useState({ platform: "NATIVE", credentials: {} as any });
    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        price: "",
        compare_at_price: "",
        store_id: "",
        image_urls: ["", "", ""],
        variants: [] as Variant[]
    });

    // State for Analytics
    const [commerceStats, setCommerceStats] = useState({
        totalRevenue: "₹0",
        activeOrders: "0",
        totalProducts: "0",
        syncStatus: "None",
        abandonedCheckouts: "0" // Added
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    // Recovery State
    const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
    const [recoveries, setRecoveries] = useState<any[]>([]);
    const [isFetchingRecoveries, setIsFetchingRecoveries] = useState(false);
    const [recoveringId, setRecoveringId] = useState<string | null>(null);
    const [isMetaSyncing, setIsMetaSyncing] = useState<string | null>(null);

    useEffect(() => {
        init();
        
        // Remote Trigger Check
        if (searchParams.get('add') === 'true') {
            setIsProductModalOpen(true);
        }
        
        console.log("🚀 [Grafty] COMMERCE COMMAND CENTER V3.1.2 LOADED");
    }, [searchParams]);

    const init = async () => {
        setIsLoading(true);
        await Promise.all([fetchStores(), fetchProducts(), fetchStats()]);
        setIsLoading(false);
    };

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/commerce/stats");
            const data = await res.json();
            if (data.success) {
                setCommerceStats(data.stats);
                setRecentActivity(data.recentActivity);
            }
        } catch (err) {
            console.error("Stats fetch failed", err); // Updated error message
        }
    };

    const fetchRecoveries = async () => {
        setIsFetchingRecoveries(true);
        try {
            const res = await fetch("/api/commerce/recovery/list");
            const data = await res.json();
            if (data.success) {
                setRecoveries(data.recoveries);
            }
        } catch (err) {
            console.error("Recovery fetch failed", err);
        } finally {
            setIsFetchingRecoveries(false);
        }
    };

    const handleRecover = async (orderId: string) => {
        setRecoveringId(orderId);
        try {
            const res = await fetch("/api/commerce/recovery/send", {
                method: "POST",
                body: JSON.stringify({ orderId }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                alert("Recovery message sent successfully!");
                fetchRecoveries();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to send recovery");
            }
        } catch (err) {
            alert("Error sending recovery");
        } finally {
            setRecoveringId(null);
        }
    };

    const fetchStores = async () => {
        try {
            const res = await fetch("/api/commerce/stores");
            const data = await res.json();
            if (Array.isArray(data)) {
                setStores(data);
                if (data.length > 0 && !newProduct.store_id) {
                    setNewProduct(prev => ({ ...prev, store_id: data[0].id }));
                }
            }
        } catch (err) {
            console.error("Store Fetch Error", err);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/commerce/products");
            const resData = await res.json();
            const data = resData.data || resData;
            if (Array.isArray(data)) setProducts(data);
        } catch (err) {
            console.error("Product Fetch Error", err);
        }
    };

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        setConnecting(true);
        try {
            const res = await fetch("/api/commerce/connect", {
                method: "POST",
                body: JSON.stringify({ ...newStore, storeId: editStoreId }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                setIsConnectModalOpen(false);
                setEditStoreId(null);
                fetchStores();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to connect");
            }
        } catch (err) {
            alert("Connection error");
        } finally {
            setConnecting(false);
        }
    };

    const handleDeleteStore = async (id: string) => {
        if (!confirm("Are you sure? This will hide all products linked to this store.")) return;
        try {
            const res = await fetch(`/api/commerce/stores/${id}`, { method: "DELETE" });
            if (res.ok) fetchStores();
        } catch (err) {
            alert("Delete failed");
        }
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProduct(true);
        try {
            const url = editProductId ? `/api/commerce/products/${editProductId}` : "/api/commerce/products";
            const res = await fetch(url, {
                method: editProductId ? "PUT" : "POST",
                body: JSON.stringify({
                    ...newProduct,
                    price: parseFloat(newProduct.price),
                    compare_at_price: newProduct.compare_at_price ? parseFloat(newProduct.compare_at_price) : null,
                    image_urls: newProduct.image_urls.filter(url => url.trim() !== ""),
                    variants: newProduct.variants.map(v => ({
                        ...v,
                        price: parseFloat(v.price),
                        stock: parseInt(v.stock)
                    }))
                }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                setIsProductModalOpen(false);
                setEditProductId(null);
                fetchProducts();
                setNewProduct({ name: "", description: "", price: "", compare_at_price: "", store_id: stores[0]?.id || "", image_urls: ["", "", ""], variants: [] });
            } else {
                const err = await res.json();
                alert(err.error || "Failed to save product");
            }
        } catch (err) {
            alert("Error saving product");
        } finally {
            setSavingProduct(false);
        }
    };

    const handleSync = async (storeId: string) => {
        setIsSyncing(storeId);
        try {
            const res = await fetch("/api/commerce/sync", {
                method: "POST",
                body: JSON.stringify({ storeId }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                const data = await res.json();
                alert(`Successfully synced ${data.syncedCount} products!`);
                await fetchProducts();
            } else {
                alert("Sync failed. Check credentials.");
            }
        } catch (err) {
            alert("Network error during sync");
        } finally {
            setIsSyncing(null);
        }
    };
    
    const handleMetaSync = async (storeId: string) => {
        setIsMetaSyncing(storeId);
        try {
            const res = await fetch("/api/commerce/catalog/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                const data = await res.json();
                alert(`☢️ Nuclear Sync Successful: ${data.synced} products pushed to Meta!`);
                await fetchStores();
            } else {
                const err = await res.json();
                alert(err.error || "Meta Sync failed. Check Catalog ID.");
            }
        } catch (err) {
            alert("Network error during Meta sync");
        } finally {
            setIsMetaSyncing(null);
        }
    };

    const handleImageUpload = async (index: number, file: File) => {
        if (!file) return;
        setUploadingIndex(index);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("module", "ecommerce");

            const res = await fetch("/api/media/upload", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                const updated = [...newProduct.image_urls];
                updated[index] = data.url;
                setNewProduct({ ...newProduct, image_urls: updated });
            } else {
                alert("Upload failed");
            }
        } catch (err) {
            alert("Upload error");
        } finally {
            setUploadingIndex(null);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            const res = await fetch(`/api/commerce/products/${id}`, { method: "DELETE" });
            if (res.ok) fetchProducts();
        } catch (err) {
            alert("Delete failed");
        }
    };

    const handleSaveLogistics = async (e: React.FormEvent) => {
        e.preventDefault();
        const nativeStore = stores.find(s => s.platform === 'NATIVE');
        if (!nativeStore) return alert("Native store not found");

        setLogisticsSaving(true);
        try {
            const res = await fetch("/api/commerce/logistics/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeId: nativeStore.id,
                    ...logisticsForm
                })
            });
            if (res.ok) {
                setIsLogisticsModalOpen(false);
                setLogisticsForm({ email: "", password: "" });
                alert("Logistics configured successfully!");
                fetchStores();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to save configuration");
            }
        } catch (err) {
            alert("Error saving logistics config");
        } finally {
            setLogisticsSaving(false);
        }
    };

    const addVariantField = () => {
        setNewProduct(prev => ({
            ...prev,
            variants: [...prev.variants, { name: "", price: prev.price || "0", stock: "100", sku: "" }]
        }));
    };

    const removeVariantField = (index: number) => {
        setNewProduct(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const updateVariant = (index: number, field: string, value: string) => {
        const updated = [...newProduct.variants];
        updated[index] = { ...updated[index], [field]: value };
        setNewProduct(prev => ({ ...prev, variants: updated }));
    };

    const stats = [
        { label: "Total Revenue", value: "₹2,84,520", icon: Wallet, trend: "+14.2%", color: "emerald" },
        { label: "Active Orders", value: "85", icon: ShoppingCart, trend: "+8.5%", color: "blue" },
        { label: "Sync Status", value: "Healthy", icon: RefreshCw, trend: "Live", color: "purple" },
        { label: "Total Products", value: products.length.toString(), icon: Package, trend: "Live", color: "amber" }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-6 lg:p-10 space-y-10 selection:bg-emerald-500/30 font-inter">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                            <ShoppingBag className="text-emerald-500" size={24} />
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Enterprise Engine</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 flex items-center gap-4">
                        Commerce <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">Command Center</span>
                    </h1>
                    <p className="text-slate-500 mt-3 max-w-2xl font-medium leading-relaxed">
                        The ultimate WhatsApp-first ecommerce engine. Manage native inventory, sync Shopify/WooCommerce, and automate sales recovery.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={init} className="bg-white hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-2xl font-bold border border-slate-200 transition-all flex items-center gap-2 group shadow-sm">
                        <RefreshCw size={18} className={`${isLoading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                        Refresh
                    </button>
                    <button onClick={() => setIsConnectModalOpen(true)} className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:shadow-[0_10px_20px_rgba(16,185,129,0.2)] text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all group active:scale-95">
                        <Globe size={20} className="group-hover:scale-110 transition-transform" />
                        Connect Store
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                    { label: "Total Revenue", value: commerceStats.totalRevenue, icon: Wallet, trend: "Live", color: "emerald" },
                    { label: "Active Orders", value: commerceStats.activeOrders, icon: ShoppingCart, trend: "Pending", color: "blue" },
                    { label: "Sync Status", value: commerceStats.syncStatus, icon: RefreshCw, trend: "API", color: "purple" },
                    { label: "Abandoned", value: commerceStats.abandonedCheckouts, icon: Zap, trend: "Recover", color: "rose" },
                    { label: "Total Products", value: commerceStats.totalProducts, icon: Package, trend: "Stock", color: "amber" }
                ].map((stat, i) => (
                    <div key={i}
                         onClick={stat.label === "Abandoned" ? () => { setIsRecoveryModalOpen(true); fetchRecoveries(); } : undefined}
                         className={`bg-white border border-slate-200 p-6 rounded-[2.5rem] relative overflow-hidden group hover:border-${stat.color}-500/50 transition-all shadow-sm ${stat.label === "Abandoned" ? "cursor-pointer" : ""}`}>
                        <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${stat.color}-500/5 blur-3xl group-hover:bg-${stat.color}-500/10 transition-all duration-700`} />
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 border border-${stat.color}-500/20`}>
                                <stat.icon className={`text-${stat.color}-500`} size={24} />
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-black text-${stat.color}-500 bg-${stat.color}-500/10 px-2 py-1 rounded-lg border border-${stat.color}-500/20 uppercase tracking-widest`}>
                                    {stat.trend}
                                </span>
                            </div>
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                        <h2 className="text-4xl font-black text-slate-900 mt-1 group-hover:scale-105 origin-left transition-transform">{stat.value}</h2>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Store & Order Management */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Stores List */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black flex items-center gap-2 text-slate-900">
                                    <Globe className="text-blue-500" size={20} />
                                    Connected Entities
                                </h3>
                                <p className="text-slate-400 text-xs mt-1">Multi-platform synchronization active</p>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {isLoading ? (
                                <div className="p-20 text-center text-slate-300">
                                    <RefreshCw className="animate-spin mx-auto mb-4" />
                                    Scanning networks...
                                </div>
                            ) : stores.length === 0 ? (
                                <div className="p-20 text-center">
                                    <ShoppingBag size={48} className="mx-auto mb-6 text-slate-200" />
                                    <h4 className="text-xl font-black text-slate-400">No Stores Found</h4>
                                    <button onClick={() => setIsConnectModalOpen(true)} className="mt-8 bg-blue-50 text-blue-600 border border-blue-100 px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest">Connect First Store</button>
                                </div>
                            ) : stores.map((store: any, i) => (
                                <div key={i} className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-500">
                                            {store.platform === 'NATIVE' ? '💎' : store.platform === 'SHOPIFY' ? '👗' : '🎧'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-black text-lg text-slate-900">{store.name}</h4>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${store.platform === 'NATIVE' ? 'border-amber-200 text-amber-600 bg-amber-50' : 'border-blue-200 text-blue-600 bg-blue-50'
                                                    }`}>
                                                    {store.platform}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-xs font-bold mt-0.5 flex items-center gap-3">
                                                <span className="flex items-center gap-1"><Package size={12} className="text-slate-300" /> {store._count?.products || 0} Products</span>
                                                <span className="flex items-center gap-1"><RefreshCw size={12} className="text-slate-300" /> {store.last_sync_at ? 'Synced' : 'Never'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${store.status === 'ACTIVE' ? 'text-emerald-500' : 'text-blue-400 animate-pulse'
                                                }`}>
                                                {store.status}
                                            </span>
                                            <div className="h-1 w-full bg-slate-100 rounded-full mt-2">
                                                <div className={`h-full bg-${store.status === 'ACTIVE' ? 'emerald' : 'blue'}-500 rounded-full w-full`} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    setNewStore({ 
                                                        platform: store.platform, 
                                                        credentials: { 
                                                            name: store.name,
                                                            catalogId: store.catalog_id || "" 
                                                        } 
                                                    });
                                                    setEditStoreId(store.id);
                                                    setIsConnectModalOpen(true);
                                                }}
                                                className="p-3 bg-white border border-slate-200 rounded-xl hover:text-blue-600 transition-all shadow-sm"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStore(store.id)}
                                                className="p-3 bg-white border border-slate-200 rounded-xl hover:text-rose-600 transition-all shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            {store.platform !== 'NATIVE' ? (
                                                <button
                                                    onClick={() => handleSync(store.id)}
                                                    disabled={isSyncing === store.id}
                                                    className="p-3 bg-white border border-slate-200 rounded-xl hover:text-emerald-600 hover:border-emerald-200 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest outline-none disabled:opacity-50 shadow-sm"
                                                >
                                                    <RefreshCw size={14} className={isSyncing === store.id ? "animate-spin" : ""} />
                                                    {isSyncing === store.id ? 'Syncing...' : 'Sync Products'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleMetaSync(store.id)}
                                                    disabled={isMetaSyncing === store.id}
                                                    className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest outline-none disabled:opacity-50 shadow-sm"
                                                >
                                                    <RefreshCw size={14} className={isMetaSyncing === store.id ? "animate-spin" : ""} />
                                                    {isMetaSyncing === store.id ? 'Syncing Meta...' : 'Sync to Meta ☢️'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Native Inventory List */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-black flex items-center gap-2 text-slate-900">
                                <Package className="text-amber-500" size={20} />
                                Inventory Management
                            </h3>
                            <button
                                onClick={() => {
                                    setEditProductId(null);
                                    setNewProduct({ name: "", description: "", price: "", compare_at_price: "", store_id: stores[0]?.id || "", image_urls: ["", "", ""], variants: [] });
                                    setIsProductModalOpen(true);
                                }}
                                className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            >
                                <Plus size={16} /> Add Product
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50/50">
                                    <tr className="text-left">
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Variations</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {products.map((product: any, i) => (
                                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <img
                                                            src={product.image_urls?.[0] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=100&auto=format&fit=crop'}
                                                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-100"
                                                            onError={(e: any) => e.target.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=100&auto=format&fit=crop'}
                                                        />
                                                        {product.image_urls?.length > 1 && (
                                                            <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-white">
                                                                +{product.image_urls.length - 1}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-slate-800 block">{product.name}</span>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{product.sku || 'No SKU'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-emerald-600">₹{parseFloat(product.price).toLocaleString()}</span>
                                                    {product.compare_at_price && (
                                                        <span className="text-[10px] text-slate-400 line-through font-bold">₹{parseFloat(product.compare_at_price).toLocaleString()}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-wrap gap-1">
                                                    {(product.variants || []).slice(0, 3).map((v: any, idx: number) => (
                                                        <span key={idx} className="text-[8px] font-black bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-tighter whitespace-nowrap">
                                                            {v.name} (₹{v.price}) {v.sku ? `| SKU: ${v.sku}` : ''}
                                                        </span>
                                                    ))}
                                                    {(product.variants || []).length > 3 && (
                                                        <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-tighter">
                                                            +{(product.variants || []).length - 3} MORE
                                                        </span>
                                                    )}
                                                    {(product.variants || []).length === 0 && (
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-bold text-slate-400">SINGLE UNIT</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-slate-500 font-bold text-sm">{product.stock} Units</td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setEditProductId(product.id);
                                                            setNewProduct({
                                                                name: product.name,
                                                                description: product.description || "",
                                                                price: String(product.price),
                                                                compare_at_price: product.compare_at_price ? String(product.compare_at_price) : "",
                                                                store_id: product.store_id,
                                                                image_urls: product.image_urls.concat(["", "", ""]).slice(0, 3),
                                                                variants: product.variants || []
                                                            });
                                                            setIsProductModalOpen(true);
                                                        }}
                                                        className="p-2 hover:bg-blue-50 rounded-lg text-slate-300 hover:text-blue-500 transition-all border border-transparent hover:border-blue-100"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteProduct(product.id)} className="p-2 hover:bg-rose-50 rounded-lg text-slate-300 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {products.length === 0 && (
                                <div className="p-20 text-center text-slate-300 font-medium">No products found in the command center.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions & Tools */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Recovery Card */}
                    <div className="bg-gradient-to-br from-rose-600 to-amber-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden group shadow-xl shadow-rose-600/10">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Zap size={120} fill="currentColor" /> {/* Changed to fill="currentColor" */}
                        </div>
                        <h3 className="text-2xl font-black mb-2 relative z-10 flex items-center gap-2">
                            A.I. Recovery
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Pro</span>
                        </h3>
                        <p className="text-white/80 mb-6 relative z-10 text-sm font-medium leading-relaxed">
                            {commerceStats.abandonedCheckouts} high-value carts detected. Reach out now to boost your conversion rate.
                        </p>
                        <button
                            onClick={() => { setIsRecoveryModalOpen(true); fetchRecoveries(); }}
                            className="bg-white text-rose-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg hover:scale-105 active:scale-95 transition-all w-full flex items-center justify-center gap-2 relative z-10 shadow-sm"
                        >
                            View Lost Carts
                            <ArrowUpRight size={16} />
                        </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Zap className="text-emerald-500" size={18} />
                                Live Activity
                            </h3>
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                        </div>

                        <div className="space-y-4">
                            {recentActivity.length === 0 ? (
                                <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-100">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No recent activity detected</p>
                                </div>
                            ) : (
                                recentActivity.map((activity, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs shrink-0">
                                            {activity.customer?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <p className="font-black text-slate-900 text-sm truncate">{activity.customer}</p>
                                                <span className="text-[10px] font-black text-emerald-600">{activity.amount}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] font-bold">
                                                <span className="text-slate-400 uppercase tracking-tighter">{activity.status}</span>
                                                <span className="text-slate-300">
                                                    {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>


                    <div className={`soft-card p-8 space-y-6 transition-all border-2 ${stores.some(s => s.platform === 'NATIVE' && (s as any).shipping_provider) ? 'border-emerald-500 bg-emerald-50/5' : 'border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Truck className="text-emerald-500" size={18} />
                                Logistics Hub
                            </h3>
                            {stores.some(s => s.platform === 'NATIVE' && (s as any).shipping_provider) ? (
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                            ) : (
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">Setup Needed</span>
                            )}
                        </div>

                        <div className="p-4 text-center bg-slate-50 rounded-[2rem] border border-slate-100 italic">
                            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border transition-all ${stores.some(s => s.platform === 'NATIVE' && (s as any).shipping_provider) ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white text-slate-300 border-slate-100'}`}>
                                <Truck size={24} />
                            </div>
                            <h4 className="text-sm font-black text-slate-800 mb-1">
                                {(stores.find(s => s.platform === 'NATIVE' && (s as any).shipping_provider) as any)?.shipping_provider === 'SHIPROCKET'
                                    ? 'Shiprocket Active'
                                    : 'No Provider Linked'}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">Automated shipping <br /> synchronization active</p>
                        </div>

                        <button
                            onClick={() => {
                                const nativeStore = stores.find(s => s.platform === 'NATIVE');
                                if (nativeStore) {
                                    setIsLogisticsModalOpen(true);
                                } else {
                                    alert("Please create a Native store first to link logistics.");
                                }
                            }}
                            className="w-full btn-primary text-xs uppercase tracking-widest font-black py-4 shadow-lg shadow-emerald-500/10"
                        >
                            Configure Logistics
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        <div className="p-10 border-b border-slate-100 relative">
                            <button onClick={() => { setIsProductModalOpen(false); setEditStoreId(null); }} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors">
                                <Plus className="rotate-45" size={28} />
                            </button>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight italic">Establish <span className="text-emerald-500">Native Wealth</span></h3>
                            <p className="text-slate-400 text-sm mt-1">Deploying a new high-quality product to the WhatsApp network.</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/50">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Store</label>
                                        <button onClick={() => setIsConnectModalOpen(true)} className="text-[9px] font-black text-emerald-500 hover:underline">+ NEW STORE</button>
                                    </div>
                                    <select
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                                        value={newProduct.store_id}
                                        onChange={e => setNewProduct({ ...newProduct, store_id: e.target.value })}
                                    >
                                        <option value="">Select a Store</option>
                                        {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.platform})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2 font-bold">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Selling Price</label>
                                            <input
                                                type="number" placeholder="0.00"
                                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                                                value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">MRP Price</label>
                                            <input
                                                type="number" placeholder="0.00"
                                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                                                value={newProduct.compare_at_price} onChange={e => setNewProduct({ ...newProduct, compare_at_price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Visual Assets (Multi-Image)</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {newProduct.image_urls.map((url, idx) => (
                                        <div key={idx} className="relative group flex gap-3">
                                            <div className="relative flex-1">
                                                <input
                                                    type="text" placeholder={`Image URL ${idx + 1}`}
                                                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all pl-12"
                                                    value={url} onChange={e => {
                                                        const updated = [...newProduct.image_urls];
                                                        updated[idx] = e.target.value;
                                                        setNewProduct({ ...newProduct, image_urls: updated });
                                                    }}
                                                />
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                                    <LinkIcon size={18} />
                                                </div>
                                            </div>
                                            <label className="flex items-center justify-center px-6 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all group/upload relative overflow-hidden">
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleImageUpload(idx, file);
                                                    }}
                                                />
                                                {uploadingIndex === idx ? (
                                                    <RefreshCw size={18} className="text-emerald-500 animate-spin" />
                                                ) : (
                                                    <Plus size={18} className="text-slate-400 group-hover/upload:text-emerald-500 transition-colors" />
                                                )}
                                                <span className="ml-2 text-[10px] font-black text-slate-500 group-hover/upload:text-emerald-500">UPLOAD</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Product Identity</label>
                                <input
                                    type="text" placeholder="Product Name"
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all font-black italic"
                                    value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                />
                                <textarea
                                    placeholder="Product Story / Description" rows={3}
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium text-slate-600 outline-none focus:border-emerald-500 transition-all resize-none"
                                    value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Multi-Variation Engine</label>
                                    <button onClick={addVariantField} className="text-emerald-500 text-[10px] font-black hover:underline">+ ADD CUSTOM VARIATION</button>
                                </div>

                                {newProduct.variants.map((v, idx) => (
                                    <div key={idx} className="p-6 bg-slate-50 border border-slate-200 rounded-[2rem] space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Variation #{idx + 1}</span>
                                            <button onClick={() => removeVariantField(idx)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                                <Plus size={18} className="rotate-45" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Display Name</label>
                                                <input
                                                    placeholder="Red / XL / Custom"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 shadow-sm"
                                                    value={v.name} onChange={e => updateVariant(idx, 'name', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-500 uppercase ml-2">SKU (Optional)</label>
                                                <input
                                                    placeholder="PROD-VAR-001"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 shadow-sm"
                                                    value={v.sku} onChange={e => updateVariant(idx, 'sku', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Variation Price</label>
                                                <input
                                                    type="number" placeholder="0.00"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-emerald-600 outline-none focus:border-emerald-500 shadow-sm"
                                                    value={v.price} onChange={e => updateVariant(idx, 'price', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Stock Inventory</label>
                                                <input
                                                    type="number" placeholder="0"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 shadow-sm"
                                                    value={v.stock} onChange={e => updateVariant(idx, 'stock', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {newProduct.variants.length === 0 && (
                                    <div className="text-center p-6 border-2 border-dashed border-slate-800 rounded-[2rem] text-slate-700 text-xs font-bold uppercase tracking-widest">
                                        No dynamic variations added. This is a single-unit product.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-10 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button
                                onClick={handleSaveProduct}
                                disabled={savingProduct}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                {savingProduct ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                {savingProduct ? 'Deploying...' : 'Seal Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Connect Store Modal */}
            {isConnectModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-white/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-slate-100 relative">
                            <button onClick={() => { setIsConnectModalOpen(false); setEditStoreId(null); }} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors">
                                <Plus className="rotate-45" size={24} />
                            </button>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                {editStoreId ? 'Configure' : 'Connect'} <span className="text-emerald-500">Store</span>
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-emerald-500/20 font-black animate-pulse">NUCLEAR V1.0</span>
                            </h3>
                        </div>

                        <form onSubmit={handleConnect} className="p-10 space-y-8">
                            <div className="grid grid-cols-3 gap-4">
                                {["NATIVE", "SHOPIFY", "WOOCOMMERCE"].map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setNewStore({ ...newStore, platform: p as any })}
                                        className={`py-4 rounded-2xl border font-black text-[10px] tracking-widest uppercase transition-all ${newStore.platform === p ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Display Name</label>
                                    <input
                                        type="text" placeholder="Friendly Store Name (e.g. My Shop)"
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all shadow-sm"
                                        value={newStore.credentials.name || ""}
                                        onChange={(e) => setNewStore({ ...newStore, credentials: { ...newStore.credentials, name: e.target.value } })}
                                    />
                                </div>

                                {newStore.platform === "NATIVE" && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Meta Catalog ID (Optional)</label>
                                        <input
                                            type="text" placeholder="Found in Meta Commerce Manager Settings"
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all shadow-sm"
                                            value={newStore.credentials.catalogId || ""}
                                            onChange={(e) => setNewStore({ ...newStore, credentials: { ...newStore.credentials, catalogId: e.target.value } })}
                                        />
                                        <p className="text-[9px] text-slate-400 font-bold px-2 italic">Linking this enables Native WhatsApp Cart & Multi-Product Messages.</p>
                                    </div>
                                )}

                                {newStore.platform !== "NATIVE" && (
                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                                                {newStore.platform === "SHOPIFY" ? "Shopify Shop Domain" : "WordPress URL"}
                                            </label>
                                            <input
                                                type="text" placeholder={newStore.platform === "SHOPIFY" ? "my-store (or my-store.myshopify.com)" : "https://mysite.com"}
                                                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm"
                                                value={newStore.credentials[newStore.platform === "SHOPIFY" ? 'shop' : 'url'] || ""}
                                                onChange={(e) => setNewStore({ ...newStore, credentials: { ...newStore.credentials, [newStore.platform === "SHOPIFY" ? 'shop' : 'url']: e.target.value } })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                                                {newStore.platform === "SHOPIFY" ? "Access Token" : "Consumer Key"}
                                            </label>
                                            <input
                                                type="password" placeholder={newStore.platform === "SHOPIFY" ? "shpat_..." : "ck_..."}
                                                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm"
                                                onChange={(e) => setNewStore({ ...newStore, credentials: { ...newStore.credentials, [newStore.platform === "SHOPIFY" ? 'accessToken' : 'consumerKey']: e.target.value } })}
                                            />
                                        </div>
                                        {newStore.platform === "WOOCOMMERCE" && (
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Consumer Secret</label>
                                                <input
                                                    type="password" placeholder="cs_..."
                                                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm"
                                                    onChange={(e) => setNewStore({ ...newStore, credentials: { ...newStore.credentials, consumerSecret: e.target.value } })}
                                                />
                                            </div>
                                        )}
                                        <p className="text-[10px] text-slate-400 font-medium px-2">Note: For security, existing keys are not shown. Leave blank if not changing.</p>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit" disabled={connecting}
                                className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:shadow-2xl hover:shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {connecting ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                {connecting ? "Connecting..." : "Establish Connection"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Logistics Modal */}
            {isLogisticsModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-white/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-slate-100 relative">
                            <button onClick={() => setIsLogisticsModalOpen(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors">
                                <Plus className="rotate-45" size={28} />
                            </button>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">
                                    <Truck className="text-blue-500" size={24} />
                                </div>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Enterprise Logistics</span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Shiprocket <span className="text-blue-500">Gateway</span></h3>
                            <p className="text-slate-400 text-sm mt-1">Connect your Shiprocket account to track DTDC and Professional Courier orders.</p>
                        </div>

                        <form onSubmit={handleSaveLogistics} className="p-10 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Shiprocket Email</label>
                                    <input
                                        type="email" placeholder="account@shiprocket.in" required
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm"
                                        value={logisticsForm.email}
                                        onChange={(e) => setLogisticsForm({ ...logisticsForm, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Shiprocket Password</label>
                                    <input
                                        type="password" placeholder="••••••••" required
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm"
                                        value={logisticsForm.password}
                                        onChange={(e) => setLogisticsForm({ ...logisticsForm, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit" disabled={logisticsSaving}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:shadow-2xl hover:shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {logisticsSaving ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                {logisticsSaving ? "Saving Config..." : "Activate Logistics"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

             {/* Recovery Modal */}
             {isRecoveryModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-white/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-slate-100 relative">
                            <button onClick={() => setIsRecoveryModalOpen(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors">
                                <Plus className="rotate-45" size={28} />
                            </button>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                                    <Zap className="text-rose-500" size={24} />
                                </div>
                                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Abandonment Recovery</span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Recover <span className="text-rose-500">Sales</span></h3>
                            <p className="text-slate-400 text-sm mt-1">High-value carts detected. Send a personalized WhatsApp reminder to complete the order.</p>
                        </div>

                        <div className="p-10 h-[400px] overflow-y-auto space-y-4">
                            {isFetchingRecoveries ? (
                                <div className="flex items-center justify-center h-full">
                                    <RefreshCw className="animate-spin text-slate-300" size={32} />
                                </div>
                            ) : recoveries.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                    <div className="bg-slate-50 p-6 rounded-full border border-slate-100">
                                        <CheckCircle2 className="text-emerald-500" size={48} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-900">All caught up!</h4>
                                        <p className="text-slate-400 text-sm">No abandoned checkouts detected in the last window.</p>
                                    </div>
                                </div>
                            ) : (
                                recoveries.map((recovery) => (
                                    <div key={recovery.id} className="group p-6 bg-slate-50 hover:bg-white rounded-3xl border border-slate-100 hover:border-emerald-500/30 transition-all flex items-center justify-between shadow-sm hover:shadow-xl hover:shadow-emerald-500/5">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">{recovery.orderNumber}</span>
                                                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-black">{new Date(recovery.time).toLocaleDateString()}</span>
                                            </div>
                                            <p className="font-black text-slate-900 truncate">{recovery.customer}</p>
                                            <p className="text-xs font-bold text-slate-400">{recovery.amount}</p>
                                        </div>
                                        <button
                                            disabled={recoveringId === recovery.id}
                                            onClick={() => handleRecover(recovery.id)}
                                            className="bg-white border border-slate-200 p-3 rounded-2xl text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                        >
                                            {recoveringId === recovery.id ? <RefreshCw className="animate-spin" size={20} /> : <Share2 size={20} />}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-8 bg-slate-50 border-t border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                                WhatsApp API fees may apply per recovery message
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
