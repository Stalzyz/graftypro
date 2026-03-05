"use client";
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap } from 'lucide-react';

const ActionNode = ({ data, isConnectable, selected }: NodeProps) => {
    return (
        <div className={`min-w-[200px] rounded-lg border-2 bg-white shadow-md flex flex-col p-0 transition-all ${selected ? 'border-amber-500 shadow-lg' : 'border-amber-200'}`}>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-gray-400" />

            <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-t-md border-b border-amber-100">
                <div className="bg-white p-1.5 rounded-full text-amber-600 shadow-sm border border-amber-100">
                    <Zap size={16} fill="currentColor" />
                </div>
                <div>
                    <div className="text-xs font-bold text-amber-900 uppercase">Action</div>
                </div>
                {data.showAnalytics && (
                    <div className="ml-auto bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-lg">
                        {data.hits || 0}
                    </div>
                )}
            </div>

            <div className="p-3">
                <div className="text-sm font-medium text-gray-700">
                    {data.actionType === 'start_drip' ? 'Start Drip Campaign' :
                        data.actionType === 'stop_drip' ? 'Stop Drip Campaign' :
                            data.actionType === 'webhook' ? 'Trigger Outbound Webhook' :
                                data.actionType === 'save_to_crm' ? 'Sync to CRM (Lead)' :
                                    data.actionType === 'google_sheet' ? 'Append to Google Sheet' :
                                        data.actionType === 'send_email' ? 'Send Notification Email' :
                                            'Select Action'}
                </div>
                {data.actionType === 'start_drip' && data.dripName && (
                    <div className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded mt-1 truncate">
                        {data.dripName}
                    </div>
                )}
                {data.actionType === 'send_email' && data.emailAddress && (
                    <div className="text-[10px] bg-blue-100 text-blue-800 px-2 py-1 shadow-sm rounded mt-1 truncate font-bold">
                        📧 {data.emailAddress}
                    </div>
                )}
                {data.actionType === 'google_sheet' && (data.spreadsheetId || data.sheetName) && (
                    <div className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 shadow-sm rounded mt-1 truncate font-bold">
                        📊 {data.sheetName || 'Sheet'} [{data.spreadsheetId ? data.spreadsheetId.substring(0, 6) : '...'}...]
                    </div>
                )}
                {data.actionType === 'webhook' && data.webhookUrl && (
                    <div className="text-[10px] bg-slate-100 text-slate-800 px-2 py-1 shadow-sm rounded mt-1 truncate font-bold">
                        🔗 {data.webhookUrl}
                    </div>
                )}
                {data.actionType === 'stop_drip' && (
                    <div className="text-[10px] text-gray-500 mt-1">
                        Unsubscribe from all drips
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 bg-amber-500" />
        </div>
    );
};

export default memo(ActionNode);
