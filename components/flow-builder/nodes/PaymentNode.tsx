"use client";

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CreditCard } from 'lucide-react';

const PaymentNode = ({ data, selected }: NodeProps) => {
    return (
        <div className={`min-w-[250px] rounded-lg border-2 bg-white shadow-xl transition-all ${selected ? 'border-orange-500 shadow-2xl scale-105' : 'border-orange-100 shadow-lg'}`}>
            <div className="flex items-center justify-between border-b bg-orange-50 px-3 py-2 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <CreditCard className="text-orange-600" size={16} />
                    <span className="text-xs font-black uppercase text-orange-900 tracking-tight">Collect Payment</span>
                </div>
                {data.showAnalytics && (
                    <div className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-lg">
                        {data.hits || 0} HITS
                    </div>
                )}
            </div>

            <div className="p-4 space-y-3">
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount to Collect</div>
                    <div className="text-lg font-black text-gray-900 flex items-baseline gap-1">
                        <span className="text-xs text-gray-500 font-medium">{data.currency || "INR"}</span>
                        {data.amount || "0.00"}
                    </div>
                </div>

                <div className="text-[11px] text-gray-600 font-medium italic">
                    {data.paymentTitle || "No reason specified"}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">
                    <div className="w-1 h-1 bg-blue-600 rounded-full animate-ping"></div>
                    Razorpay Auto-Link
                </div>
            </div>

            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-orange-500 border-2 border-white" />
        </div>
    );
};

export default memo(PaymentNode);
