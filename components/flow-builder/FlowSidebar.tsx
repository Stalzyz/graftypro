"use client";

import { MessageSquare, GitBranch, Flag, Zap, ShoppingBag } from "lucide-react";

export default function FlowSidebar() {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col pt-4">
            <h2 className="px-4 text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Components</h2>

            <div className="px-2 space-y-2">
                <DraggableItem type="message" label="Send Message" icon={<MessageSquare size={16} />} onDragStart={onDragStart} />
                <DraggableItem type="condition" label="Condition (Yes/No)" icon={<GitBranch size={16} />} onDragStart={onDragStart} />
                <DraggableItem type="catalog" label="Send Product" icon={<ShoppingBag size={16} />} onDragStart={onDragStart} />
                <DraggableItem type="start" label="Start Trigger" icon={<Zap size={16} />} onDragStart={onDragStart} />
                <DraggableItem type="action" label="Perform Action" icon={<Zap size={16} />} onDragStart={onDragStart} />
                <DraggableItem type="end" label="End Flow" icon={<Flag size={16} />} onDragStart={onDragStart} />
            </div>

            <div className="mt-8 px-4">
                <p className="text-xs text-gray-400">Drag items to the canvas to add them to your flow.</p>
            </div>
        </aside>
    );
}

function DraggableItem({ type, label, icon, onDragStart }: any) {
    return (
        <div
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-500 hover:shadow-sm transition-all text-sm font-medium text-gray-700"
            onDragStart={(event) => onDragStart(event, type)}
            draggable
        >
            <div className="text-gray-500">{icon}</div>
            {label}
        </div>
    )
}
