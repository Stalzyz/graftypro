"use client";

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Calendar, Clock, CheckCircle, Sparkles } from 'lucide-react';

export default memo(({ data, isConnectable }: any) => {
    return (
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-100 min-w-[300px] overflow-hidden group hover:scale-105 transition-transform duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-4 flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl text-white">
                    <Calendar size={20} />
                </div>
                <div>
                    <div className="text-[10px] font-black text-blue-100 uppercase tracking-widest leading-none mb-1">Commerce Engine</div>
                    <div className="text-sm font-black text-white tracking-tight leading-none">Appointment Booking</div>
                </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Sparkles size={40} className="text-blue-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={14} className="text-blue-600" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Self-Service Scheduling</span>
                    </div>
                    <p className="text-xs text-gray-700 font-bold leading-relaxed">
                        Trigger calendar picker and capture Slot ID for instant booking.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</div>
                        <div className="text-sm font-black text-blue-600">Pending</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Action</div>
                        <div className="text-sm font-black text-gray-700">Slot Lock</div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Success Path</span>
                    </div>
                </div>
            </div>

            {/* Handles */}
            <Handle
                type="target"
                position={Position.Left}
                isConnectable={isConnectable}
                className="w-4 h-4 bg-blue-500 border-2 border-white -left-2"
            />

            {/* Success Handle (True) */}
            <Handle
                type="source"
                position={Position.Right}
                id="true"
                isConnectable={isConnectable}
                className="w-4 h-4 bg-green-500 border-2 border-white -right-2 top-1/3 shadow-lg"
            />

            {/* Failed Handle (False) */}
            <Handle
                type="source"
                position={Position.Right}
                id="false"
                isConnectable={isConnectable}
                className="w-4 h-4 bg-red-500 border-2 border-white -right-2 top-2/3 shadow-lg"
            />

            <div className="px-5 py-3 bg-blue-50/30 border-t border-blue-100 text-center">
                <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest">Proceed After Booking</span>
            </div>
        </div>
    );
});
