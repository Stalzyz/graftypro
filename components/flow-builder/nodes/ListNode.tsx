"use client";

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { List, ChevronRight, Sparkles, LayoutList } from 'lucide-react';

export default memo(({ data, isConnectable }: any) => {
    const listItems = data.items || [{ id: '1', title: 'Option 1', description: 'Description here' }];

    return (
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-fuchsia-100 min-w-[320px] overflow-hidden group">
            {/* Optional Header Image */}
            {data.headerUrl && (
                <div className="h-32 w-full overflow-hidden border-b border-gray-100">
                    <img src={data.headerUrl} alt="Header" className="w-full h-full object-cover" />
                </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-r from-fuchsia-600 to-purple-700 px-5 py-4 flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl text-white">
                    <LayoutList size={20} />
                </div>
                <div>
                    <div className="text-[10px] font-black text-fuchsia-100 uppercase tracking-widest leading-none mb-1">High Engagement</div>
                    <div className="text-sm font-black text-white tracking-tight leading-none">Interactive List Menu</div>
                </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
                <div className="bg-fuchsia-50/50 rounded-2xl p-4 border border-fuchsia-100 italic text-xs text-gray-700 font-medium">
                    "{data.text || 'Choose an option from the menu below:'}"
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <Sparkles size={14} className="text-fuchsia-500" />
                        <span className="text-[10px] font-black text-fuchsia-600 uppercase tracking-widest">List Items (Max 10)</span>
                    </div>
                    {listItems.map((item: any, idx: number) => (
                        <div key={item.id} className="relative flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-fuchsia-200 hover:shadow-md transition-all group/item">
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-black text-gray-800 truncate">{item.title}</div>
                                <div className="text-[10px] text-gray-400 font-medium truncate">{item.description}</div>
                            </div>
                            <ChevronRight size={14} className="text-fuchsia-300 group-hover/item:text-fuchsia-500 group-hover/item:translate-x-1 transition-all" />

                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`item-${item.id}`}
                                isConnectable={isConnectable}
                                className="w-2.5 h-2.5 bg-fuchsia-500 border-2 border-white -right-1"
                                style={{ top: '50%' }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Handles */}
            <Handle
                type="target"
                position={Position.Left}
                isConnectable={isConnectable}
                className="w-4 h-4 bg-fuchsia-500 border-2 border-white -left-2"
            />

            <div className="px-5 py-3 bg-fuchsia-50/30 border-t border-fuchsia-100 flex justify-between items-center">
                <span className="text-[9px] font-black text-fuchsia-700 uppercase tracking-widest">Section: {data.sectionTitle || 'Menu'}</span>
                <span className="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest">{data.buttonText || 'Open Menu'}</span>
            </div>
        </div>
    );
});
