
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { GitBranch } from 'lucide-react';

const ConditionNode = ({ data, selected }: any) => {
    return (
        <div className={`w-[200px] shadow-md rounded-lg bg-white border-2 transition-all ${selected ? 'border-orange-500 shadow-lg' : 'border-orange-200'}`}>

            {/* Input Handle */}
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />

            <div className="flex items-center gap-3 px-3 py-2 bg-orange-50 rounded-t-md border-b border-orange-100">
                <GitBranch className="text-orange-500" size={16} />
                <div className="text-xs font-bold text-orange-900 uppercase">Condition</div>
            </div>

            <div className="p-3">
                <div className="text-sm font-medium text-gray-800 text-center">
                    {data.label || "Check Condition"}
                </div>
                <div className="text-xs text-center text-gray-500 mt-1">
                    {data.conditionType ? `${data.conditionType} ${data.operator} ${data.value}` : "Click to configure"}
                </div>
            </div>

            {/* Output Handles */}
            <div className="relative h-4 mt-2 mb-[-8px]">
                {/* True Handle - Right or Bottom Left */}
                <div className="absolute left-4 bottom-0 flex flex-col items-center">
                    <span className="text-[10px] text-green-600 font-bold mb-1">YES</span>
                    <Handle
                        type="source"
                        position={Position.Bottom}
                        id="true"
                        className="w-3 h-3 bg-green-500 !relative !transform-none !left-auto !bottom-auto"
                    />
                </div>

                {/* False Handle - Left or Bottom Right */}
                <div className="absolute right-4 bottom-0 flex flex-col items-center">
                    <span className="text-[10px] text-red-600 font-bold mb-1">NO</span>
                    <Handle
                        type="source"
                        position={Position.Bottom}
                        id="false"
                        className="w-3 h-3 bg-red-500 !relative !transform-none !left-auto !bottom-auto"
                    />
                </div>
            </div>
            <div className="h-2"></div>
        </div>
    );
};

export default memo(ConditionNode);
