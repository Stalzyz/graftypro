"use client";

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const MessageNode = ({ data, isConnectable }: NodeProps) => {
    return (
        <div className="min-w-[250px] rounded-md border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b bg-green-50 px-3 py-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase text-green-700">WhatsApp Message</span>
                </div>
            </div>

            <div className="p-3">
                <textarea
                    className="w-full resize-none rounded border border-gray-300 p-2 text-sm focus:border-green-500 focus:outline-none"
                    rows={3}
                    placeholder="Type your message..."
                    defaultValue={data.text}
                    onChange={(evt) => data.onChange?.(evt.target.value)}
                />
                <div className="mt-2 flex gap-2">
                    <div className="text-[10px] text-gray-500">Supports: Text, Image, Video</div>
                </div>
            </div>

            <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-gray-400" />
            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 bg-green-500" />
        </div>
    );
};

export default memo(MessageNode);
