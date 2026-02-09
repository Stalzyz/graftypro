"use client";

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Truck, Search, Info } from 'lucide-react';

export default memo(({ data, isConnectable }: any) => {
    return (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-100 min-w-[280px] overflow-hidden group">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-3 flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-lg text-white">
                    <Truck size={18} />
                </div>
                <div>
                    <div className="text-[10px] font-black text-orange-100 uppercase tracking-widest leading-none mb-1">E-Commerce Action</div>
                    <div className="text-sm font-black text-white tracking-tight leading-none">Order Tracking</div>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
                <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Search size={14} className="text-orange-600" />
                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Logic Source</span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
                        This node will use the <span className="text-orange-700">last user message</span> as the Order ID and fetch real-time carrier status.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mock Provider</label>
                    <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[11px] font-bold text-gray-700">
                        Global Logistics (Simulated)
                    </div>
                </div>

                <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                    <Info size={14} className="text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-blue-700 font-bold leading-tight">
                        Success path follows if order is found. Failure path follows if ID is invalid.
                    </p>
                </div>
            </div>

            {/* Handles */}
            <Handle
                type="target"
                position={Position.Left}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-orange-500 border-2 border-white"
            />

            <div className="flex flex-col gap-4 py-2 bg-gray-50/50 border-t border-gray-100">
                <div className="flex items-center justify-between px-4">
                    <span className="text-[10px] font-black text-green-600 uppercase">If Found</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="found"
                        isConnectable={isConnectable}
                        className="w-3 h-3 bg-green-500 border-2 border-white"
                    />
                </div>
                <div className="flex items-center justify-between px-4">
                    <span className="text-[10px] font-black text-red-600 uppercase">Not Found</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="failed"
                        isConnectable={isConnectable}
                        className="w-3 h-3 bg-red-500 border-2 border-white"
                    />
                </div>
            </div>
        </div>
    );
});
