
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
                {(() => {
                    const prods = data?.carouselProducts || (data?.productName ? [{
                        name: data.productName,
                        price: data.productPrice,
                        image: data.productImage
                    }] : []);

                    if (prods.length > 0) {
                        return (
                            <div className="space-y-2">
                                {prods.slice(0, 3).map((p: any, i: number) => (
                                    <div key={i} className="flex gap-3 items-center">
                                        {p.image && (
                                            <img src={p.image} className="w-8 h-8 object-cover rounded bg-gray-100" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-gray-900 truncate">{p.name}</div>
                                            <div className="text-[10px] text-gray-500 font-bold">₹{p.price}</div>
                                        </div>
                                    </div>
                                ))}
                                {prods.length > 3 && (
                                    <div className="text-[10px] text-center font-bold text-gray-400 bg-gray-50 py-1 rounded">
                                        + {prods.length - 3} more
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return <div className="text-sm text-gray-400 italic text-center py-2">Select product(s)...</div>;
                })()}
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-gray-400" />
        </div>
    );
};

export default memo(CatalogNode);
