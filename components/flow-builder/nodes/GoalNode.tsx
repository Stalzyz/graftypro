"use client";

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Trophy, Target, TrendingUp, Sparkles } from 'lucide-react';

export default memo(({ data, isConnectable }: any) => {
    return (
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-emerald-100 min-w-[300px] overflow-hidden group hover:scale-105 transition-transform duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-4 flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl text-white animate-pulse">
                    <Trophy size={20} />
                </div>
                <div>
                    <div className="text-[10px] font-black text-emerald-100 uppercase tracking-widest leading-none mb-1">Conversion Hook</div>
                    <div className="text-sm font-black text-white tracking-tight leading-none">Goal Completion</div>
                </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
                <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Sparkles size={40} className="text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <Target size={14} className="text-emerald-600" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Goal</span>
                    </div>
                    <p className="text-xs text-gray-700 font-bold leading-relaxed">
                        {data.goalName || 'Link this flow to a Goal in Settings to track ROI.'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Value</div>
                        <div className="text-sm font-black text-emerald-600">ROI Event</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">State</div>
                        <div className="text-sm font-black text-gray-700">Finished</div>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-1 text-emerald-600">
                    <TrendingUp size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Attributed to Primary Goal</span>
                </div>
            </div>

            {/* Handles */}
            <Handle
                type="target"
                position={Position.Left}
                isConnectable={isConnectable}
                className="w-4 h-4 bg-emerald-500 border-2 border-white -left-2"
            />

            <div className="px-5 py-3 bg-emerald-50/30 border-t border-emerald-100 text-center">
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Flow Ends Here</span>
            </div>
        </div>
    );
});
