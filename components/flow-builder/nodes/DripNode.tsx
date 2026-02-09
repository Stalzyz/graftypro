
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Clock, Zap } from 'lucide-react';

export default memo(({ data, selected }: any) => {
    return (
        <div className={`px-4 py-3 shadow-lg rounded-xl bg-white border-2 transition-all ${selected ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-100'
            }`}>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Clock size={18} />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Drip Automation</p>
                    <h3 className="text-sm font-bold text-gray-800">{data.dripName || 'Select Sequence...'}</h3>
                </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                <Zap size={10} className="text-gray-400" />
                <span className="text-[9px] font-bold text-gray-500 uppercase">Enrolls Contact</span>
            </div>

            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-indigo-400 border-2 border-white"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-indigo-400 border-2 border-white"
            />
        </div>
    );
});
