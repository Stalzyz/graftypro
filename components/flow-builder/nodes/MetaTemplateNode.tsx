"use client";

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { FileCode, Globe, CheckCircle2, ChevronRight } from 'lucide-react';

export default memo(({ data, isConnectable }: any) => {
    return (
        <div className="bg-white rounded-[1.5rem] shadow-xl border-2 border-emerald-100 min-w-[320px] overflow-hidden group hover:border-emerald-300 transition-all p-1 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 pointer-events-none" />

            {/* Header */}
            <div className="bg-white relative z-10 rounded-[1.25rem] border border-gray-100 px-5 py-4 flex items-center justify-between mb-2 shadow-sm pointer-events-none">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200">
                        <FileCode size={20} className="text-white" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1 flex items-center gap-1">
                            <Globe size={10} /> Meta Network
                        </div>
                        <h3 className="text-[15px] font-black tracking-tight text-gray-900 leading-none">Cloud Template</h3>
                    </div>
                </div>
                {data.templateName && <CheckCircle2 size={18} className="text-emerald-500" />}
            </div>

            {/* Content Area */}
            <div className="bg-white relative z-10 rounded-[1.25rem] border border-gray-100 p-4 shadow-sm mb-2 pointer-events-none">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Template Selected</span>
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-bold text-[9px] uppercase tracking-widest">
                        {data.language || 'en_US'}
                    </span>
                </div>
                {data.templateName ? (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <p className="text-[13px] font-bold text-gray-800 break-words mb-1">{data.templateName}</p>
                        <p className="text-[11px] font-medium text-gray-500 line-clamp-2">{data.bodyText || 'No preview available'}</p>
                    </div>
                ) : (
                    <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100 text-center flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mb-2">
                            <FileCode size={14} />
                        </div>
                        <p className="text-[11px] font-bold text-orange-700">No template configured</p>
                        <p className="text-[10px] text-orange-600/70 font-medium uppercase tracking-widest mt-1">Click to select</p>
                    </div>
                )}
            </div>

            {/* Target Handle (Input) */}
            <Handle
                type="target"
                position={Position.Left}
                isConnectable={isConnectable}
                className="w-4 h-4 bg-white border-4 border-emerald-500 rounded-full !-left-2 z-20"
            />

            {/* Source Handle (Output) */}
            <div className="bg-white relative z-10 rounded-[1.25rem] border border-gray-100 p-3 shadow-sm flex items-center justify-between group-hover:bg-slate-50 transition-colors">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 ml-2">Next Step <ChevronRight size={12} className="text-gray-300" /></span>
                <Handle
                    type="source"
                    position={Position.Right}
                    isConnectable={isConnectable}
                    className="w-4 h-4 bg-white border-4 border-slate-300 hover:border-emerald-500 rounded-full !-right-2 z-20 transition-all"
                />
            </div>
        </div>
    );
});
