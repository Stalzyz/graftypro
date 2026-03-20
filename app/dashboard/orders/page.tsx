"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, ChevronDown, ChevronUp, Package } from "lucide-react";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [trackingLoading, setTrackingLoading] = useState<string | null>(null);
    const [trackingData, setTrackingData] = useState<any>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/orders");
            const data = await res.json();
            if (data.data) setOrders(data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        if (expandedOrder === id) {
            setExpandedOrder(null);
            setTrackingData(null);
        }
        else setExpandedOrder(id);
    };

    const handleTrack = async (order: any) => {
        if (!order.tracking_id) return alert("No tracking ID assigned to this order.");
        
        setTrackingLoading(order.id);
        setTrackingData(null);
        try {
            const res = await fetch(`/api/commerce/logistics/track/${order.id}`);
            const data = await res.json();
            if (data.success) {
                setTrackingData(data.tracking);
                fetchOrders(); // Refresh order status in list
            } else {
                alert(data.error || "Failed to fetch tracking details");
            }
        } catch (e) {
            alert("Error tracking order");
        } finally {
            setTrackingLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-500">Track and fulfill your WhatsApp store orders.</p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 dashed-border">
                    <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No orders yet</h3>
                    <p className="text-gray-500">Orders placed by customers will appear here.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order: any) => (
                                    <>
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-gray-600">#{order.id.slice(0, 8)}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{order.contact?.name || "Guest"}</div>
                                                <div className="text-xs text-gray-400">{order.contact?.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">₹{order.total_amount}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => toggleExpand(order.id)}
                                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                                                >
                                                    {expandedOrder === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                            </td>
                                        </tr>
                                        {/* Expanded Details */}
                                        {expandedOrder === order.id && (
                                            <tr className="bg-gray-50">
                                                <td colSpan={6} className="px-6 py-4">
                                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                                            <Package size={14} /> Order Items
                                                        </h4>
                                                        <ul className="space-y-3">
                                                            {order.items.map((item: any) => (
                                                                <li key={item.id} className="flex justify-between items-center text-sm border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 overflow-hidden">
                                                                            {item.product?.image_url ? (
                                                                                <img src={item.product.image_url} className="w-full h-full object-cover" />
                                                                            ) : <ShoppingBag size={16} />}
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-medium text-gray-900 block">{item.product?.name || item.name}</span>
                                                                            <span className="text-gray-500 text-xs">Qty: {item.quantity}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="font-medium text-gray-800">
                                                                        ₹{item.price}
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>

                                                        {order.tracking_id && (
                                                            <div className="mt-6 pt-6 border-t border-gray-100">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <div>
                                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Logistics Provider</span>
                                                                        <span className="text-sm font-bold text-gray-900">{order.courier_name || "Shiprocket"}</span>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleTrack(order)}
                                                                        disabled={trackingLoading === order.id}
                                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                                                                    >
                                                                        <Package size={14} />
                                                                        {trackingLoading === order.id ? "Tracking..." : "Track Order"}
                                                                    </button>
                                                                </div>

                                                                {trackingData && expandedOrder === order.id && (
                                                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                                                                        <div className="flex items-center justify-between mb-3">
                                                                            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Live Status</span>
                                                                            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                                                                                {trackingData.status}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-sm font-medium text-gray-700">{trackingData.last_location_address || "In Transit"}</p>
                                                                        <p className="text-[10px] text-gray-400 mt-1">Last Update: {trackingData.updated_at}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
