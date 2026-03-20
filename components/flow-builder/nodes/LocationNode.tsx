"use client";

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MapPin, Navigation, Send } from 'lucide-react';

const LocationNode = ({ id, data, isConnectable }: NodeProps) => {
    const isRequest = data.locationType === 'REQUEST';

    return (
        <div className="min-w-[240px] max-w-[280px] rounded-2xl border-2 border-gray-100 bg-white shadow-xl overflow-hidden group hover:border-purple-400 transition-all duration-300">
            <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="p-1 bg-purple-500 rounded-lg text-white shadow-sm">
                        <MapPin size={12} />
                    </div>
                    <span className="text-[9px] font-black uppercase text-purple-700 tracking-wider">
                        {isRequest ? 'Location Request' : 'Send Location'}
                    </span>
                </div>
            </div>

            <div className="p-3 space-y-3">
                <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center border border-dashed border-gray-200 gap-2 text-center">
                    {isRequest ? (
                        <>
                            <Navigation size={24} className="text-purple-500 animate-pulse" />
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-gray-800 uppercase tracking-tight">Request Current Location</p>
                                <p className="text-[10px] text-gray-500 font-medium leading-tight">Customer will see a button to share their GPS location.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-full h-24 bg-purple-100 rounded-lg flex items-center justify-center relative overflow-hidden border border-purple-200">
                                <MapPin size={32} className="text-purple-600 z-10 drop-shadow-md" />
                                <div className="absolute inset-0 opacity-20 pointer-events-none">
                                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                                        <path d="M0 20 H100 M0 40 H100 M0 60 H100 M0 80 H100 M20 0 V100 M40 0 V100 M60 0 V100 M80 0 V100" stroke="currentColor" strokeWidth="0.5" fill="none" />
                                    </svg>
                                </div>
                            </div>
                            <div className="w-full text-left space-y-1">
                                <p className="text-[11px] font-black text-gray-800 truncate uppercase mt-1">{data.name || 'Store Name'}</p>
                                <p className="text-[10px] text-gray-500 font-medium leading-tight line-clamp-2">{data.address || 'No address specified'}</p>
                            </div>
                        </>
                    )}
                </div>

                {isRequest && (
                    <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-xl border border-purple-100">
                        <Send size={12} className="text-purple-600" />
                        <span className="text-[10px] font-bold text-purple-700">Location shared by customer</span>
                        <div className="flex-1" />
                        <Handle
                            type="source"
                            position={Position.Right}
                            id="onLocationReceived"
                            isConnectable={isConnectable}
                            className="w-3 h-3 bg-purple-500 border-2 border-white -right-2 shadow-sm"
                        />
                    </div>
                )}
            </div>

            <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-4 h-4 bg-gray-100 border-2 border-white -left-2 shadow-md" />

            {/* Standard source handle for SEND LOCATION */}
            {!isRequest && (
                <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-4 h-4 bg-purple-500 border-2 border-white -right-2 shadow-md" />
            )}
        </div>
    );
};

export default memo(LocationNode);
