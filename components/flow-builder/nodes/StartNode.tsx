"use client";
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap } from 'lucide-react';

const StartNode = ({ data, isConnectable }: NodeProps) => {
    return (
        <div className="min-w-[200px] rounded-full border-2 border-orange-400 bg-white shadow-md flex items-center p-2 mb-2">
            <div className="bg-orange-100 p-2 rounded-full mr-3 text-orange-600">
                <Zap size={20} fill="currentColor" />
            </div>
            <div>
                <div className="text-xs font-bold text-gray-800 uppercase">Start Trigger</div>
                <div className="text-[10px] text-gray-500">{data.label || "Keyword Trigger"}</div>
            </div>
            {/* Logic: Only Source handle (Bottom) */}
            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 bg-orange-500 border-2 border-white" />
        </div>
    );
};

export default memo(StartNode);
