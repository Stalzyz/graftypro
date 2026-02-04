"use client";

import React, { useCallback, useRef, useState, useMemo } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    ReactFlowProvider,
    Node,
    Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import MessageNode from './nodes/MessageNode';
import StartNode from './nodes/StartNode';
import ConditionNode from './nodes/ConditionNode';
import CatalogNode from './nodes/CatalogNode';
import FlowSidebar from './FlowSidebar';
import FlowPropertiesPanel from './FlowPropertiesPanel';

// Register Node Types
const nodeTypes = {
    message: MessageNode,
    start: StartNode,
    condition: ConditionNode,
    catalog: CatalogNode,
};

const initialNodes: Node[] = [
    {
        id: 'start-1',
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: 'HELLO' },
    },
];

let id = 1;
const getId = () => `node_${id++}`;

export default function FlowBuilder() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (typeof type === 'undefined' || !type) return;

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: getId(),
                type,
                position,
                data: { label: `New ${type}`, text: '' },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    const onNodeClick = useCallback((event: any, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    const onNodeUpdate = (id: string, newData: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    node.data = newData;
                }
                return node;
            })
        );
        setSelectedNode((prev) => prev ? { ...prev, data: newData } : null);
    };

    const handleSave = async (status: 'DRAFT' | 'PUBLISHED' = 'DRAFT') => {
        setSaving(true);
        try {
            // Find Start Node to get Trigger Keyword
            const startNode = nodes.find(n => n.type === 'start');
            const keyword = startNode?.data?.label || "HELLO";

            const flowData = {
                nodes: nodes,
                edges: edges,
                name: "My Awesome Flow",
                trigger_keyword: keyword,
                status: status
            };

            const res = await fetch('/api/flows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(flowData)
            });

            if (res.ok) alert(`Flow saved as ${status}!`);
            else alert("Error saving flow");

        } catch (e) {
            console.error(e);
            alert("Save failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ReactFlowProvider>
            <div className="flex h-full w-full flex-col">
                <div className="h-14 border-b bg-white flex items-center px-4 justify-between">
                    <h1 className="font-semibold text-gray-800">Visual Flow Builder</h1>
                    <div className="flex gap-2">
                        <button onClick={() => handleSave('DRAFT')} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50">
                            Save Draft
                        </button>
                        <button onClick={() => handleSave('PUBLISHED')} className="bg-zinc-900 text-white px-4 py-2 rounded text-sm hover:bg-zinc-700">
                            {saving ? 'Publishing...' : 'Publish Flow'}
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <FlowSidebar />

                    <div className="flex-1 h-full bg-gray-50 relative" ref={reactFlowWrapper}>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onInit={setReactFlowInstance}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                            onNodeClick={onNodeClick}
                            onPaneClick={onPaneClick}
                            nodeTypes={nodeTypes}
                            fitView
                        >
                            <Controls />
                            <MiniMap />
                            <Background gap={12} size={1} />
                        </ReactFlow>
                    </div>

                    {selectedNode && (
                        <FlowPropertiesPanel
                            selectedNode={selectedNode}
                            onChange={onNodeUpdate}
                            onClose={() => setSelectedNode(null)}
                        />
                    )}
                </div>
            </div>
        </ReactFlowProvider>
    );
}
