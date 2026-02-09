
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { ShoppingBag } from 'lucide-react';

const CatalogNode = ({ data, selected }: any) => {
    return (
        <div className={`w-[250px] shadow-md rounded-lg bg-white border-2 transition-all ${selected ? 'border-purple-500 shadow-lg' : 'border-purple-200'}`}>

            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />

            <div className="flex items-center justify-between px-3 py-2 bg-purple-50 rounded-t-md border-b border-purple-100">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="text-purple-500" size={16} />
                    <div className="text-xs font-bold text-purple-900 uppercase">Send Product</div>
                </div>
                {data.showAnalytics && (
                    <div className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-lg">
                        {data.hits || 0}
                    </div>
                )}
            </div>

            <div className="p-3">
                {data.productName ? (
                    <div className="flex gap-3 items-center">
                        {data.productImage && (
                            <img src={data.productImage} className="w-10 h-10 object-cover rounded bg-gray-100" />
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{data.productName}</div>
                            <div className="text-xs text-gray-500 font-bold">₹{data.productPrice}</div>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-400 italic text-center py-2">Select a product...</div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-gray-400" />
        </div>
    );
};

export default memo(CatalogNode);
