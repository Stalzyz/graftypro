"use client";

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Image, Video, FileText, Mic, MousePointer2, ExternalLink, Phone } from 'lucide-react';

const MessageNode = ({ data, isConnectable }: NodeProps) => {
    const renderMediaIcon = () => {
        switch (data.contentType) {
            case 'IMAGE': return <Image size={16} className="text-blue-500" />;
            case 'VIDEO': return <Video size={16} className="text-purple-500" />;
            case 'DOCUMENT': return <FileText size={16} className="text-amber-500" />;
            case 'VOICE': return <Mic size={16} className="text-rose-500" />;
            default: return null;
        }
    };

    return (
        <div className="min-w-[280px] rounded-2xl border-2 border-gray-100 bg-white shadow-xl overflow-hidden group hover:border-green-400 transition-all duration-300">
            <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-500 rounded-lg text-white shadow-sm">
                        <MousePointer2 size={14} />
                    </div>
                    <span className="text-[10px] font-black uppercase text-green-700 tracking-wider">Outgoing Node</span>
                </div>
                {data.showAnalytics && (
                    <div className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-bounce shadow-lg">
                        {data.hits || 0} HITS
                    </div>
                )}
            </div>

            <div className="p-4 space-y-3">
                {/* Media Preview Area */}
                {data.contentType && data.contentType !== 'TEXT' && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-dashed border-gray-200 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                            {renderMediaIcon()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{data.contentType}</div>
                            <div className="text-xs text-gray-600 truncate font-medium">{data.mediaUrl || 'No URL provided'}</div>
                        </div>
                    </div>
                )}

                {/* Body Text */}
                <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm min-h-[60px]">
                    <p className="text-sm text-gray-800 font-bold leading-relaxed whitespace-pre-wrap">
                        {data.content || data.text || 'Empty message...'}
                    </p>
                </div>

                {/* Buttons Preview */}
                {data.buttons && data.buttons.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Interactive Buttons</div>
                        {data.buttons.map((btn: any) => (
                            <div key={btn.id} className="flex items-center justify-between bg-gray-50/50 hover:bg-gray-100 border border-gray-100 rounded-xl px-3 py-2 transition-colors">
                                <span className="text-xs font-bold text-gray-700">{btn.title}</span>
                                {btn.type === 'url' && <ExternalLink size={10} className="text-blue-500" />}
                                {btn.type === 'call' && <Phone size={10} className="text-green-500" />}
                                {btn.type === 'reply' && <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-4 h-4 bg-gray-100 border-2 border-white -left-2 shadow-md" />
            <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-4 h-4 bg-green-500 border-2 border-white -right-2 shadow-md" />
        </div>
    );
};

export default memo(MessageNode);
