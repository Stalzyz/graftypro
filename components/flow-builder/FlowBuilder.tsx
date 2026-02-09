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
import PaymentNode from './nodes/PaymentNode';
import OrderTrackingNode from './nodes/OrderTrackingNode';
import MetaFlowNode from './nodes/MetaFlowNode';
import GoalNode from './nodes/GoalNode';
import WaitNode from './nodes/WaitNode';
import TimeWindowNode from './nodes/TimeWindowNode';
import ListNode from './nodes/ListNode';
import DripNode from './nodes/DripNode';
import ActionNode from './nodes/ActionNode';
import EndNode from './nodes/EndNode';
import AppointmentNode from './nodes/AppointmentNode';
import FlowSidebar from './FlowSidebar';
import FlowPropertiesPanel from './FlowPropertiesPanel';

// Register Node Types
const nodeTypes = {
    message: MessageNode,
    start: StartNode,
    condition: ConditionNode,
    catalog: CatalogNode,
    payment: PaymentNode,
    order_tracking: OrderTrackingNode,
    meta_flow: MetaFlowNode,
    goal: GoalNode,
    wait: WaitNode,
    time_window: TimeWindowNode,
    list: ListNode,
    drip: DripNode,
    action: ActionNode,
    end: EndNode,
    appointment: AppointmentNode,
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

export default function FlowBuilder({ initialData }: { initialData?: any }) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);

    // Initialize State
    const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || []);
    const [flowName, setFlowName] = useState(initialData?.name || "Untitled Flow");

    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [analyticsMode, setAnalyticsMode] = useState(false);
    const [analyticsData, setAnalyticsData] = useState<any[]>([]);

    // Ensure ID generator is ahead of existing nodes
    useMemo(() => {
        if (initialData?.nodes) {
            const maxId = initialData.nodes.reduce((acc: number, node: any) => {
                const match = node.id.match(/node_(\d+)/);
                if (match) return Math.max(acc, parseInt(match[1]));
                return acc;
            }, 0);
            id = maxId + 1;
        }
    }, [initialData]);

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
                name: flowName,
                trigger_keyword: keyword,
                status: status
            };

            let res;
            if (initialData?.id) {
                // UPDATE
                res = await fetch(`/api/flows/${initialData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(flowData)
                });
            } else {
                // CREATE
                res = await fetch('/api/flows', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(flowData)
                });
            }

            if (res.ok) {
                // Success feedback
                const data = await res.json();
                const targetFlowId = data.flow?.id || initialData?.id;

                alert(`Flow "${flowName}" saved successfully!`);
                window.location.href = '/dashboard/flows';
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.error || "Failed to save flow"}`);
            }

        } catch (e) {
            console.error(e);
            alert("Save failed");
        } finally {
            setSaving(false);
        }
    };

    const toggleAnalytics = async () => {
        if (!analyticsMode) {
            try {
                let flowId = initialData?.id;

                if (!flowId) {
                    // Try to find by keyword (fallback)
                    const startNode = nodes.find(n => n.type === 'start');
                    const keyword = startNode?.data?.label || "HELLO";
                    const fRes = await fetch(`/api/flows?keyword=${keyword}`);
                    const fData = await fRes.json();
                    flowId = fData.data?.[0]?.id;
                }

                if (flowId) {
                    const res = await fetch(`/api/flows/${flowId}/analytics`);
                    const data = await res.json();
                    if (data.data) {
                        setAnalyticsData(data.data);
                        // Enrich nodes with hits
                        setNodes((nds) => nds.map(node => ({
                            ...node,
                            data: {
                                ...node.data,
                                hits: data.data.find((a: any) => a.node_id === node.id)?.hits || 0,
                                showAnalytics: true
                            }
                        })));
                    }
                } else {
                    alert("Please save the flow first to view analytics.");
                }
            } catch (e) {
                console.error(e);
            }
        } else {
            // Clean up node data
            setNodes((nds) => nds.map(node => ({
                ...node,
                data: { ...node.data, showAnalytics: false }
            })));
        }
        setAnalyticsMode(!analyticsMode);
    };

    return (
        <ReactFlowProvider>
            <div className="flex h-full w-full flex-col">
                <div className="h-14 border-b bg-white flex items-center px-4 justify-between">
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            className="text-lg font-semibold text-gray-800 bg-transparent border-none focus:ring-0 placeholder-gray-400"
                            value={flowName}
                            onChange={(e) => setFlowName(e.target.value)}
                            placeholder="Enter Flow Name..."
                        />
                        <button
                            onClick={toggleAnalytics}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${analyticsMode ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${analyticsMode ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></span>
                            {analyticsMode ? 'Analytics: ON' : 'View Analytics'}
                        </button>
                    </div>
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
