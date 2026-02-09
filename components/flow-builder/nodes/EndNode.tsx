"use client";
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Flag } from 'lucide-react';

const EndNode = ({ data, isConnectable, selected }: NodeProps) => {
    return (
        <div className={`min-w-[150px] rounded-full border-2 bg-white shadow-md flex items-center p-2 pr-4 transition-all ${selected ? 'border-gray-800' : 'border-gray-200'}`}>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-gray-400" />

            <div className="bg-gray-100 p-2 rounded-full mr-3 text-gray-600">
                <Flag size={18} fill="currentColor" />
            </div>
            <div>
                <div className="text-xs font-bold text-gray-800 uppercase">End Flow</div>
            </div>

            {data.showAnalytics && (
                <div className="ml-auto bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-lg">
                    {data.hits || 0}
                </div>
            )}

            {/* End Node has no source handle */}
        </div>
    );
};

export default memo(EndNode);
