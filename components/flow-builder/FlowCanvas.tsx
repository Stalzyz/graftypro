"use client";

import React, { useCallback, useRef } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import MessageNode from './nodes/MessageNode';

const nodeTypes = {
    message: MessageNode,
};

const initialNodes = [
    {
        id: '1',
        position: { x: 250, y: 50 },
        data: { text: 'Hello! How can we help you?' },
        type: 'message'
    },
];
const initialEdges: Edge[] = [];

let id = 2;
const getId = () => `${id++}`;

export default function FlowCanvas() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const reactFlowWrapper = useRef(null);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const addNode = () => {
        const newNode = {
            id: getId(),
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: { text: 'New Message', onChange: (txt: string) => console.log(txt) },
            type: 'message',
        };
        setNodes((nds) => nds.concat(newNode));
    };

    return (
        <div className="w-full h-full min-h-[500px] border border-gray-200 rounded-lg bg-gray-50 flex flex-col">
            <div className="p-2 border-b bg-white flex gap-2">
                <button onClick={addNode} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded border">
                    + Add Message
                </button>
            </div>
            <div className="flex-1" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Controls />
                    <MiniMap />
                    <Background gap={12} size={1} />
                </ReactFlow>
            </div>
        </div>
    );
}
