import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { ShoppingCart } from 'lucide-react';

const OrderSummaryNode = ({ data, selected }: any) => {
    return (
        <div className={`px-4 py-3 shadow-xl rounded-2xl bg-white border-2 transition-all w-64 ${selected ? 'border-orange-500 scale-105 shadow-orange-200' : 'border-orange-100 hover:border-orange-300'}`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-orange-500 border-2 border-white" />

            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <ShoppingCart size={18} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-gray-800 tracking-tight uppercase">Order Summary</h3>
                    <p className="text-[10px] font-bold text-orange-500 tracking-widest uppercase">AUTO-GENERATED</p>
                </div>
            </div>

            <div className="space-y-1 bg-orange-50/50 p-2 rounded-xl border border-orange-100/50">
                <p className="text-[11px] text-gray-700 font-bold leading-tight">
                    {data.text || "Bot will display a summary of items in the cart and total amount."}
                </p>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                <span>Branch: Next Step</span>
                <span className="text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">CONTINUE</span>
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-orange-500 border-2 border-white" />
        </div>
    );
};

export default memo(OrderSummaryNode);
