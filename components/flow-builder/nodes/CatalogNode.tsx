import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { ShoppingBag } from 'lucide-react';

const CatalogNode = ({ data, selected }: any) => {
    const prods = data?.carouselProducts || (data?.productName ? [{
        id: data.productId || '1',
        name: data.productName,
        price: data.productPrice,
        image: data.productImage
    }] : []);

    return (
        <div className={`w-[300px] shadow-xl rounded-2xl bg-white border-2 transition-all overflow-hidden ${selected ? 'border-purple-500 shadow-2xl scale-105' : 'border-purple-200'}`}>
            <Handle type="target" position={Position.Top} className="w-3.5 h-3.5 bg-gray-400 border-2 border-white" />

            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-fuchsia-50 border-b border-purple-100">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-500 rounded-lg text-white shadow-sm">
                        <ShoppingBag size={16} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase text-purple-900 tracking-wider">E-Commerce Store</div>
                        <div className="text-xs font-bold text-gray-800">Catalog ({prods.length} Products)</div>
                    </div>
                </div>
                {data.showAnalytics && (
                    <div className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-lg">
                        {data.hits || 0}
                    </div>
                )}
            </div>

            <div className="p-3 space-y-2 max-h-[460px] overflow-y-auto">
                {prods.length > 0 ? (
                    prods.map((p: any, i: number) => (
                        <div key={p.id || i} className="relative flex items-center gap-3 p-2.5 bg-gray-50 hover:bg-purple-50/50 rounded-xl border border-gray-100 transition-colors">
                            {p.image ? (
                                <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-gray-200 shadow-sm flex-shrink-0" />
                            ) : (
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs flex-shrink-0">
                                    🛍️
                                </div>
                            )}
                            <div className="flex-1 min-w-0 pr-2">
                                <div className="text-xs font-bold text-gray-800 truncate">{p.name}</div>
                                <div className="text-[11px] font-black text-purple-700">₹{p.price}</div>
                            </div>

                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`item-sel_${p.id}`}
                                className="w-2.5 h-2.5 bg-purple-500 border-2 border-white -right-1"
                                style={{ top: '50%' }}
                            />
                        </div>
                    ))
                ) : (
                    <div className="text-xs text-gray-400 italic text-center py-4">No products in catalog</div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3.5 h-3.5 bg-purple-500 border-2 border-white" />
        </div>
    );
};

export default memo(CatalogNode);
