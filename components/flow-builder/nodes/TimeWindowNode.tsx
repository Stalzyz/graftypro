"use client";

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Calendar, Clock, Moon, Sun } from 'lucide-react';

export default memo(({ data, isConnectable }: any) => {
    return (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-100 min-w-[280px] overflow-hidden group">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-4 py-3 flex items-center gap-3">
                <div className="p-1.5 bg-white/10 rounded-lg text-white">
                    <Calendar size={18} />
                </div>
                <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Business Logic</div>
                    <div className="text-sm font-black text-white tracking-tight leading-none">Operating Hours</div>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-slate-600" />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Window</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">GMT+5:30</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                        <div className="text-center">
                            <div className="text-[8px] font-black text-slate-400">START</div>
                            <div className="text-xs font-black text-slate-700">{data.startTime || '09:00'}</div>
                        </div>
                        <div className="h-4 w-[1px] bg-slate-200"></div>
                        <div className="text-center">
                            <div className="text-[8px] font-black text-slate-400">END</div>
                            <div className="text-xs font-black text-slate-700">{data.endTime || '18:00'}</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                        <Sun size={12} className="text-emerald-600" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase">Within</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-rose-50 rounded-lg border border-rose-100 opacity-50">
                        <Moon size={12} className="text-rose-600" />
                        <span className="text-[10px] font-black text-rose-700 uppercase tracking-tight">Outside</span>
                    </div>
                </div>
            </div>

            {/* Handles */}
            <Handle
                type="target"
                position={Position.Left}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-slate-500 border-2 border-white"
            />

            <div className="space-y-1 py-1">
                <div className="flex items-center justify-between px-4 py-2 hover:bg-emerald-50 transition-colors">
                    <span className="text-[10px] font-black text-emerald-600 uppercase">Is Within Window</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="within"
                        isConnectable={isConnectable}
                        className="w-3 h-3 bg-emerald-500 border-2 border-white"
                        style={{ top: '68%' }}
                    />
                </div>
                <div className="flex items-center justify-between px-4 py-2 hover:bg-rose-50 transition-colors">
                    <span className="text-[10px] font-black text-rose-600 uppercase">Is Outside</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="outside"
                        isConnectable={isConnectable}
                        className="w-3 h-3 bg-rose-500 border-2 border-white"
                        style={{ top: '88%' }}
                    />
                </div>
            </div>
        </div>
    );
});
