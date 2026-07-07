"use client";

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Layout, FormInput, Database, Info } from 'lucide-react';

export default memo(({ data, isConnectable }: any) => {
    return (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-indigo-100 min-w-[280px] overflow-hidden group">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-700 px-4 py-3 flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-lg text-white">
                    <Layout size={18} />
                </div>
                <div>
                    <div className="text-[10px] font-black text-indigo-100 uppercase tracking-widest leading-none mb-1">Native Feature</div>
                    <div className="text-sm font-black text-white tracking-tight leading-none">Meta Form Flow</div>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
                <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <FormInput size={14} className="text-indigo-600" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Internal Form</span>
                        </div>
                        {data.formFields && data.formFields.length > 0 ? (
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">{data.formFields.length} Fields</span>
                        ) : (
                            <span className="text-[10px] font-bold text-indigo-400">#{data.flowId || 'UNSET'}</span>
                        )}
                    </div>
                    {data.formFields && data.formFields.length > 0 ? (
                        <div className="space-y-1">
                            {data.formFields.slice(0, 3).map((f: any, i: number) => (
                                <div key={i} className="text-[9px] text-indigo-800 font-bold bg-white px-2 py-1 rounded border border-indigo-50 truncate">
                                    {f.label} <span className="text-indigo-400 font-normal">({f.type})</span>
                                </div>
                            ))}
                            {data.formFields.length > 3 && (
                                <div className="text-[9px] text-indigo-400 font-bold px-2 py-0.5">
                                    + {data.formFields.length - 3} more fields
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
                            {data.flowName || 'Build a native form or select an existing Meta Flow.'}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 px-1">
                    <Database size={14} className="text-gray-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Auto-Map to CRM</span>
                </div>

                <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                    <Info size={14} className="text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-blue-700 font-bold leading-tight">
                        Launches a native form inside WhatsApp. Captured data is saved to contact attributes.
                    </p>
                </div>
            </div>

            {/* Handles */}
            <Handle
                type="target"
                position={Position.Left}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-indigo-500 border-2 border-white"
            />

            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-t border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase">On Submit</span>
                <Handle
                    type="source"
                    position={Position.Right}
                    isConnectable={isConnectable}
                    className="w-3 h-3 bg-indigo-500 border-2 border-white"
                />
            </div>
        </div>
    );
});
