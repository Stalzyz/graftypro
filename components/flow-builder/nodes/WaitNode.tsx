"use client";

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Clock, Hourglass, BellRing } from 'lucide-react';

export default memo(({ data, isConnectable }: any) => {
    return (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-amber-100 min-w-[250px] overflow-hidden group">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-lg text-white">
                    <Hourglass size={18} className="animate-spin-slow" />
                </div>
                <div>
                    <div className="text-[10px] font-black text-amber-100 uppercase tracking-widest leading-none mb-1">Human Behavior</div>
                    <div className="text-sm font-black text-white tracking-tight leading-none">Smart Delay</div>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-center">
                    <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Duration</div>
                    <div className="text-xl font-black text-amber-900 tracking-tight">
                        {data.delayValue || '0'} {data.delayUnit || 'mins'}
                    </div>
                </div>

                <p className="text-[10px] text-gray-500 font-bold leading-tight px-1">
                    Pauses the flow to simulate human response time or wait for a specific interval.
                </p>

                <div className="flex items-center gap-2 px-1 text-amber-600">
                    <BellRing size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Resumes Automatically</span>
                </div>
            </div>

            {/* Handles */}
            <Handle
                type="target"
                position={Position.Left}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-amber-500 border-2 border-white"
            />

            <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 border-t border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase">After Delay</span>
                <Handle
                    type="source"
                    position={Position.Right}
                    isConnectable={isConnectable}
                    className="w-3 h-3 bg-amber-500 border-2 border-white"
                />
            </div>
        </div>
    );
});
