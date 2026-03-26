"use client";

import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import {
    Download, Upload, Save, Zap, Undo2, Redo2, Play,
    CheckCircle2, AlertTriangle, X, Bug, Eye, Settings,
    ChevronRight, Send, MessageSquare, BarChart3
} from "lucide-react";
import ReactFlow, {
    MiniMap, Controls, Background, useNodesState, useEdgesState,
    addEdge, Connection, Edge, ReactFlowProvider, Node, Panel,
    useReactFlow, BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';

import MessageNode from './nodes/MessageNode';
import StartNode from './nodes/StartNode';
import ConditionNode from './nodes/ConditionNode';
import CatalogNode from './nodes/CatalogNode';
import PaymentNode from './nodes/PaymentNode';
import OrderTrackingNode from './nodes/OrderTrackingNode';
import MetaFlowNode from './nodes/MetaFlowNode';
import WaitNode from './nodes/WaitNode';
import TimeWindowNode from './nodes/TimeWindowNode';
import ListNode from './nodes/ListNode';
import DripNode from './nodes/DripNode';
import ActionNode from './nodes/ActionNode';
import EndNode from './nodes/EndNode';
import AppointmentNode from './nodes/AppointmentNode';
import OrderSummaryNode from './nodes/OrderSummaryNode';
import MetaTemplateNode from './nodes/MetaTemplateNode';
import LocationNode from './nodes/LocationNode';
import FlowSidebar from './FlowSidebar';
import FlowPropertiesPanel from './FlowPropertiesPanel';

// ── Node Registry ────────────────────────────────────────────────────────────
const nodeTypes = {
    message: MessageNode,
    start: StartNode,
    condition: ConditionNode,
    catalog: CatalogNode,
    payment: PaymentNode,
    order_tracking: OrderTrackingNode,
    meta_flow: MetaFlowNode,
    wait: WaitNode,
    time_window: TimeWindowNode,
    list: ListNode,
    drip: DripNode,
    action: ActionNode,
    end: EndNode,
    appointment: AppointmentNode,
    order_summary: OrderSummaryNode,
    meta_template: MetaTemplateNode,
    location: LocationNode,
};

// ── Default Canvas ───────────────────────────────────────────────────────────
const DEFAULT_NODES: Node[] = [
    {
        id: 'start-1',
        type: 'start',
        position: { x: 250, y: 150 },
        data: { label: 'Welcome Trigger', text: 'START' },
    },
];

// ── ID Generator ─────────────────────────────────────────────────────────────
let nodeIdCounter = 1;
const genId = () => `node_${nodeIdCounter++}`;

// ── Validation ───────────────────────────────────────────────────────────────
interface ValidationError { nodeId?: string; message: string; severity: 'error' | 'warning'; }

function validateFlow(nodes: Node[], edges: Edge[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const startNodes = nodes.filter(n => n.type === 'start');

    if (startNodes.length === 0) errors.push({ message: 'Flow must have at least one Start Trigger node', severity: 'error' });
    if (startNodes.length > 1) errors.push({ message: 'Multiple Start nodes detected — only one is recommended', severity: 'warning' });

    const connectedTargets = new Set(edges.map(e => e.target));
    const connectedSources = new Set(edges.map(e => e.source));

    nodes.forEach(node => {
        if (node.type === 'start') return; // Start nodes don't need incoming edges
        if (!connectedTargets.has(node.id)) {
            errors.push({ nodeId: node.id, message: `Node "${node.data?.label || node.id}" is not connected (no incoming edge)`, severity: 'warning' });
        }
    });

    // Check for nodes with no outgoing edges (except end nodes)
    nodes.forEach(node => {
        const nodeEdges = edges.filter(e => e.source === node.id);
        if (nodeEdges.length === 0 && node.type !== 'end' && node.type !== 'list' && node.type !== 'condition') {
            // message nodes with reply buttons also don't need explicit outgoing edges
        }
    });

    return errors;
}

// ── Simulator ────────────────────────────────────────────────────────────────
interface SimButton { id: string; title: string; type: string; value?: string; }
interface SimListItem { id: string; title: string; description?: string; }

interface SimMessage {
    role: 'bot' | 'user';
    text: string;
    mediaUrl?: string;
    buttons?: SimButton[];
    listItems?: SimListItem[];
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function FlowBuilder({ initialData }: { initialData?: any }) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);

    // Sync ID counter
    useMemo(() => {
        if (initialData?.nodes) {
            const maxId = initialData.nodes.reduce((acc: number, node: any) => {
                const m = node.id.match(/node_(\d+)/);
                return m ? Math.max(acc, parseInt(m[1])) : acc;
            }, 0);
            nodeIdCounter = maxId + 1;
        }
    }, [initialData]);

    // ── Core State ────────────────────────────────────────────────────────────
    const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || DEFAULT_NODES);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || []);
    const [flowName, setFlowName] = useState(initialData?.name || "Untitled Flow");

    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    // ── Save State ───────────────────────────────────────────────────────────
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedRef = useRef<string>('');

    // ── UI State ─────────────────────────────────────────────────────────────
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [analyticsMode, setAnalyticsMode] = useState(false);
    const [analyticsData, setAnalyticsData] = useState<any[]>([]);
    const [showValidation, setShowValidation] = useState(false);
    const [showSimulator, setShowSimulator] = useState(false);
    const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

    // ── Undo/Redo Stack ───────────────────────────────────────────────────────
    const historyRef = useRef<{ nodes: Node[]; edges: Edge[] }[]>([{ nodes: DEFAULT_NODES, edges: [] }]);
    const historyIndexRef = useRef(0);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // Simulator
    const [simInput, setSimInput] = useState('');
    const [simMessages, setSimMessages] = useState<SimMessage[]>([]);
    const [simCurrentNodeId, setSimCurrentNodeId] = useState<string | null>(null);

    // ── API Errors ───────────────────────────────────────────────────────────
    const [apiErrors, setApiErrors] = useState<ValidationError[]>([]);

    // ── Validation ───────────────────────────────────────────────────────────
    const validationErrors = useMemo(() => {
        const local = validateFlow(nodes, edges);
        return [...local, ...apiErrors];
    }, [nodes, edges, apiErrors]);

    const hasErrors = validationErrors.some(e => e.severity === 'error');
    const hasWarnings = validationErrors.some(e => e.severity === 'warning');

    // ── Auto-save Logic ───────────────────────────────────────────────────────
    const triggerAutoSave = useCallback(() => {
        setSaveStatus('unsaved');
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => {
            const snapshot = JSON.stringify({ nodes, edges, name: flowName });
            if (snapshot !== lastSavedRef.current && initialData?.id) {
                handleSave('DRAFT', true); // silent auto-save
            }
        }, 30_000); // 30 seconds
    }, [nodes, edges, flowName, initialData?.id]);

    useEffect(() => {
        triggerAutoSave();
        // Clear API errors when flow changes manually
        if (apiErrors.length > 0) setApiErrors([]);
    }, [nodes, edges, flowName]);

    // ── Push to History ───────────────────────────────────────────────────────
    const pushHistory = useCallback((snapshot: { nodes: Node[]; edges: Edge[] }) => {
        const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
        newHistory.push(snapshot);
        if (newHistory.length > 50) newHistory.shift(); // max 50 undo steps
        historyRef.current = newHistory;
        historyIndexRef.current = newHistory.length - 1;
        setCanUndo(historyIndexRef.current > 0);
        setCanRedo(false);
    }, []);

    const handleUndo = useCallback(() => {
        if (historyIndexRef.current <= 0) return;
        historyIndexRef.current--;
        const { nodes: n, edges: e } = historyRef.current[historyIndexRef.current];
        setNodes(n);
        setEdges(e);
        setCanUndo(historyIndexRef.current > 0);
        setCanRedo(true);
    }, []);

    const handleRedo = useCallback(() => {
        if (historyIndexRef.current >= historyRef.current.length - 1) return;
        historyIndexRef.current++;
        const { nodes: n, edges: e } = historyRef.current[historyIndexRef.current];
        setNodes(n);
        setEdges(e);
        setCanUndo(true);
        setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }, []);

    // ── Keyboard Shortcuts ────────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const isCtrl = e.ctrlKey || e.metaKey;
            if (isCtrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); }
            if (isCtrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); handleRedo(); }
            if (isCtrl && e.key === 's') { e.preventDefault(); handleSave('DRAFT'); }
            if (e.key === 'Escape') { setSelectedNode(null); setShowSimulator(false); }
            if (isCtrl && e.key === '?') { e.preventDefault(); setShowKeyboardShortcuts(p => !p); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleUndo, handleRedo]);

    // ── Connections ───────────────────────────────────────────────────────────
    const onConnect = useCallback((params: Connection) => {
        const newEdge = { ...params, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 }, animated: false };
        setEdges((eds) => {
            const updated = addEdge(newEdge, eds);
            pushHistory({ nodes, edges: updated });
            return updated;
        });
    }, [setEdges, nodes, pushHistory]);

    // ── Drag/Drop ─────────────────────────────────────────────────────────────
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        const actionTypeFromDrag = event.dataTransfer.getData('application/action-type');

        if (!type || !reactFlowInstance) return;

        const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
        const newNode: Node = {
            id: genId(),
            type,
            position,
            data: {
                label: type.charAt(0).toUpperCase() + type.slice(1),
                text: '',
                actionType: actionTypeFromDrag || undefined
            },
        };
        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        pushHistory({ nodes: newNodes, edges });
        setSelectedNode(newNode);
    }, [reactFlowInstance, nodes, edges, setNodes, pushHistory]);

    // ── Node Editing ──────────────────────────────────────────────────────────
    const onNodeClick = useCallback((event: any, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    const onNodeUpdate = useCallback((id: string, newData: any) => {
        setNodes((nds) => {
            const updated = nds.map((node) => node.id === id ? { ...node, data: newData } : node);
            pushHistory({ nodes: updated, edges });
            return updated;
        });
        setSelectedNode((prev) => prev ? { ...prev, data: newData } : null);
    }, [setNodes, edges, pushHistory]);

    const onDeleteNode = useCallback((id: string) => {
        const newNodes = nodes.filter(n => n.id !== id);
        const newEdges = edges.filter(e => e.source !== id && e.target !== id);
        setNodes(newNodes);
        setEdges(newEdges);
        pushHistory({ nodes: newNodes, edges: newEdges });
        setSelectedNode(null);
    }, [nodes, edges, setNodes, setEdges, pushHistory]);

    const onDuplicateNode = useCallback((node: Node) => {
        const newNode: Node = {
            ...node,
            id: genId(),
            position: { x: node.position.x + 40, y: node.position.y + 40 },
            data: { ...node.data },
        };
        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        pushHistory({ nodes: newNodes, edges });
    }, [nodes, edges, setNodes, pushHistory]);

    // ── Save Flow ─────────────────────────────────────────────────────────────
    const handleSave = async (status: 'DRAFT' | 'PUBLISHED' = 'DRAFT', silent = false) => {
        if (saving) return;
        setSaving(true);
        setSaveStatus('saving');

        try {
            const startNode = nodes.find(n => n.type === 'start');
            // 🎯 FIX: Prioritize data.text (Trigger Keyword) over data.label (Internal Name)
            const keyword = startNode?.data?.text || startNode?.data?.label || 'HELLO';
            
            const payload = { nodes, edges, name: flowName, trigger_keyword: keyword, status };
            const url = initialData?.id ? `/api/flows/${initialData.id}` : '/api/flows';
            const method = initialData?.id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                lastSavedRef.current = JSON.stringify(payload);
                setSaveStatus('saved');

                if (!silent) {
                    if (status === 'PUBLISHED') {
                        window.location.href = '/dashboard/flows';
                    } else {
                        // If new flow, redirect to edit URL with ID
                        const newId = data?.flow?.id;
                        if (newId && !initialData?.id) {
                            window.location.href = `/dashboard/flows/${newId}`;
                        }
                    }
                }
            } else {
                const resData = await res.json();
                setSaveStatus('unsaved');
                
                if (resData.details && Array.isArray(resData.details)) {
                    // Extract structured errors from server strings
                    const mappedErrors: ValidationError[] = resData.details.map((msg: string) => {
                        // Extract "node_xxx" from strings like "Message node node_1 must have text"
                        const match = msg.match(/(node|Edge)\s+([^\s]+)/i);
                        return {
                            nodeId: match ? match[2] : undefined,
                            message: msg,
                            severity: 'error'
                        };
                    });
                    setApiErrors(mappedErrors);
                    setShowValidation(true);
                } else if (!silent) {
                    alert(`Save failed: ${resData.error || 'Unknown error'}`);
                }
            }
        } catch (e) {
            setSaveStatus('unsaved');
            if (!silent) alert('Save failed. Check your connection.');
        } finally {
            setSaving(false);
        }
    };

    // ── Analytics Mode ────────────────────────────────────────────────────────
    const toggleAnalytics = async () => {
        if (!analyticsMode && initialData?.id) {
            try {
                const res = await fetch(`/api/flows/${initialData.id}/analytics`);
                const data = await res.json();
                if (data.data) {
                    setAnalyticsData(data.data);
                    setNodes(nds => nds.map(n => ({
                        ...n,
                        data: { ...n.data, hits: data.data.find((a: any) => a.node_id === n.id)?.hits || 0, showAnalytics: true }
                    })));
                }
            } catch (e) { console.error(e); }
        } else {
            setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, showAnalytics: false } })));
        }
        setAnalyticsMode(!analyticsMode);
    };

    // ── Template Load ─────────────────────────────────────────────────────────
    const handleUseScenario = (flowData: any) => {
        if (confirm("This will replace the current canvas. Continue?")) {
            setNodes(flowData.nodes || []);
            setEdges(flowData.edges || []);
            pushHistory({ nodes: flowData.nodes || [], edges: flowData.edges || [] });
        }
    };

    // ── Import/Export ─────────────────────────────────────────────────────────
    const exportFlow = () => {
        const data = JSON.stringify({ name: flowName, nodes, edges }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${flowName.replace(/\s+/g, '_')}.json`;
        a.click();
    };

    const importFlow = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = JSON.parse(ev.target?.result as string);
                if (parsed.nodes && parsed.edges && confirm("Import will replace the current canvas. Continue?")) {
                    setFlowName(parsed.name || 'Imported Flow');
                    setNodes(parsed.nodes);
                    setEdges(parsed.edges);
                    pushHistory({ nodes: parsed.nodes, edges: parsed.edges });
                }
            } catch { alert('Invalid JSON file.'); }
        };
        reader.readAsText(file);
    };

    // ── Flow Simulator ────────────────────────────────────────────────────────
    const runSimulator = () => {
        const startNode = nodes.find(n => n.type === 'start');
        if (!startNode) { alert('Add a Start node first'); return; }
        setSimMessages([{
            role: 'bot',
            text: startNode.data.text || `Welcome! Send "${startNode.data.label || 'HELLO'}" to start.`
        }]);
        setSimCurrentNodeId(startNode.id);
        setShowSimulator(true);
    };

    const sendSimInput = () => {
        if (!simInput.trim() || !simCurrentNodeId) return;
        const userMsg = simInput.trim();
        const displayMsg = userMsg.startsWith('LIST_SELECT_ID:') ? userMsg.replace('LIST_SELECT_ID:', 'Selected: ') : userMsg;
        setSimMessages(prev => [...prev, { role: 'user', text: displayMsg }]);
        setSimInput('');

        // Try exact match or sourceHandle match (like the backend Does)
        let handleId = null;
        if (userMsg.startsWith('LIST_SELECT_ID:')) {
            const itemId = userMsg.replace('LIST_SELECT_ID:', '');
            handleId = `item-${itemId}`;
        } else {
            // Simulator: Button title is often the userMsg, but sourceHandle in scenarios is `button-${button.id}`
            // Let's find the matching button title in current node
            const currNode = nodes.find(n => n.id === simCurrentNodeId);
            if (currNode && currNode.data.buttons) {
                const btn = currNode.data.buttons.find((b: any) => b.title === userMsg || b.id === userMsg);
                if (btn) handleId = `button-${btn.id}`;
            } else if (currNode && currNode.data.items) {
                const itm = currNode.data.items.find((i: any) => i.title === userMsg || i.id === userMsg);
                if (itm) handleId = `item-${itm.id}`;
            }
        }

        let edge = edges.find(e => e.source === simCurrentNodeId && (e.sourceHandle === handleId || e.sourceHandle === userMsg));
        if (!edge) edge = edges.find(e => e.source === simCurrentNodeId); // Fallback to first available edge

        if (edge) {
            const nextNode = nodes.find(n => n.id === edge.target);
            if (nextNode) {
                setTimeout(() => {
                    let botText = nextNode.data.text || nextNode.data.label || `[${nextNode.type} node]`;
                    let mediaUrl = nextNode.data.mediaUrl || nextNode.data.headerUrl;
                    let simNodeButtons = [];
                    let simListItems = [];

                    if (nextNode.type === 'message' && nextNode.data.buttons) {
                        simNodeButtons = nextNode.data.buttons;
                    } else if (nextNode.type === 'list' && nextNode.data.items) {
                        simListItems = nextNode.data.items;
                        botText = nextNode.data.text || "Please select an option:";
                    } else if (nextNode.type === 'payment') {
                        botText = `💳 Payment Request: ${nextNode.data.currency || 'USD'} ${nextNode.data.amount}`;
                    } else if (nextNode.type === 'catalog') {
                        botText = `🛍️ View Catalog`;
                    } else if (nextNode.type === 'drip' || nextNode.type === 'action') {
                        // Skip non-interactive nodes and follow their edge immediately
                        const skipEdge = edges.find(e => e.source === nextNode.id);
                        if (skipEdge) {
                            const skipNext = nodes.find(n => n.id === skipEdge.target);
                            if (skipNext) {
                                let txt = skipNext.data.text || skipNext.data.label;
                                setSimMessages(prev => [...prev, { role: 'bot', text: txt, buttons: skipNext.data.buttons || [], listItems: skipNext.data.items || [] }]);
                                setSimCurrentNodeId(skipNext.id);
                                return;
                            }
                        }
                    }

                    setSimMessages(prev => [...prev, {
                        role: 'bot',
                        text: botText,
                        mediaUrl,
                        buttons: simNodeButtons,
                        listItems: simListItems
                    }]);
                    setSimCurrentNodeId(nextNode.id);
                }, 600);
            } else {
                setSimMessages(prev => [...prev, { role: 'bot', text: '✅ Flow ended.' }]);
                setSimCurrentNodeId(null);
            }
        } else {
            setSimMessages(prev => [...prev, { role: 'bot', text: '✅ Flow ended — no further nodes.' }]);
            setSimCurrentNodeId(null);
        }
    };

    // ── Save Status indicator ─────────────────────────────────────────────────
    const saveStatusDisplay = () => {
        if (saveStatus === 'saving') return <span className="text-[10px] text-amber-600 font-black flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />Saving...</span>;
        if (saveStatus === 'saved') return <span className="text-[10px] text-emerald-600 font-black flex items-center gap-1"><CheckCircle2 size={11} />Saved</span>;
        return <span className="text-[10px] text-orange-500 font-black flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-orange-400" />Unsaved changes</span>;
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <ReactFlowProvider>
            <div className="flex h-full w-full flex-col bg-white">

                {/* ── TOP BAR ────────────────────────────────────────────────── */}
                <div className="h-14 border-b border-gray-100 bg-white flex items-center px-3 gap-2 shrink-0 z-20">

                    {/* Left: Sidebar toggle + Flow name */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 shrink-0"
                            title="Toggle Sidebar"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>
                        </button>

                        <div className="w-px h-5 bg-gray-200" />

                        <input
                            type="text"
                            className="text-sm font-black text-gray-900 bg-transparent border-none focus:ring-0 outline-none placeholder-gray-300 min-w-0 max-w-xs"
                            value={flowName}
                            onChange={(e) => setFlowName(e.target.value)}
                            placeholder="Flow Name..."
                        />

                        {saveStatusDisplay()}
                    </div>

                    {/* Center: Undo / Redo */}
                    <div className="flex items-center gap-1">
                        <button onClick={handleUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors text-gray-500">
                            <Undo2 size={15} />
                        </button>
                        <button onClick={handleRedo} disabled={!canRedo} title="Redo (Ctrl+Y)" className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors text-gray-500">
                            <Redo2 size={15} />
                        </button>
                    </div>

                    <div className="w-px h-5 bg-gray-200" />

                    {/* Analytics */}
                    <button
                        onClick={toggleAnalytics}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${analyticsMode ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <BarChart3 size={13} />
                        Analytics
                    </button>

                    {/* Validation */}
                    <button
                        onClick={() => setShowValidation(!showValidation)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${hasErrors ? 'bg-red-50 text-red-600 border border-red-200' : hasWarnings ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'text-gray-500 hover:bg-gray-100'}`}
                        title="Flow Validation"
                    >
                        {hasErrors ? <AlertTriangle size={13} /> : hasWarnings ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
                        {hasErrors ? `${validationErrors.filter(e => e.severity === 'error').length} Error${validationErrors.filter(e => e.severity === 'error').length > 1 ? 's' : ''}` : hasWarnings ? `${validationErrors.length} Warning${validationErrors.length > 1 ? 's' : ''}` : 'Valid'}
                    </button>

                    {/* Simulator */}
                    <button
                        onClick={runSimulator}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all border border-emerald-200"
                        title="Test Flow"
                    >
                        <Play size={12} />
                        Test
                    </button>

                    <div className="w-px h-5 bg-gray-200" />

                    {/* Import / Export */}
                    <input type="file" accept=".json" id="import-json" className="hidden" onChange={importFlow} />
                    <button onClick={() => document.getElementById('import-json')?.click()} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Import JSON">
                        <Upload size={14} />
                    </button>
                    <button onClick={exportFlow} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Export JSON">
                        <Download size={14} />
                    </button>

                    <div className="w-px h-5 bg-gray-200" />

                    {/* Save Draft */}
                    <button
                        onClick={() => handleSave('DRAFT')}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        <Save size={14} />
                        Save
                    </button>

                    {/* Publish */}
                    <button
                        onClick={() => {
                            if (hasErrors) { setShowValidation(true); alert('Fix validation errors before publishing.'); return; }
                            if (confirm(`Publish "${flowName}"?\n\nThis will make it live for all users.`)) handleSave('PUBLISHED');
                        }}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-black text-white bg-gray-900 hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-sm"
                    >
                        <Zap size={14} />
                        {saving ? 'Saving...' : 'Publish'}
                    </button>
                </div>

                {/* ── VALIDATION PANEL ──────────────────────────────────────── */}
                {showValidation && validationErrors.length > 0 && (
                    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
                        <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                        <div className="flex-1 space-y-1">
                            {validationErrors.map((err, i) => (
                                <p key={i} className={`text-xs font-medium ${err.severity === 'error' ? 'text-red-700' : 'text-amber-700'}`}>
                                    {err.severity === 'error' ? '🔴' : '🟡'} {err.message}
                                </p>
                            ))}
                        </div>
                        <button onClick={() => setShowValidation(false)} className="text-amber-500 hover:text-amber-700">
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* ── MAIN BODY ──────────────────────────────────────────────── */}
                <div className="flex flex-1 overflow-hidden relative">

                    {/* Left Sidebar */}
                    {isSidebarOpen && (
                        <FlowSidebar
                            onUseScenario={handleUseScenario}
                            nodeCount={nodes.length}
                        />
                    )}

                    {/* Canvas */}
                    <div
                        className="flex-1 h-full bg-gray-50 relative"
                        ref={reactFlowWrapper}
                    >
                        <ReactFlow
                            nodes={nodes.map(n => {
                                const err = validationErrors.find(e => e.nodeId === n.id && e.severity === 'error');
                                return {
                                    ...n,
                                    className: err ? 'ring-4 ring-red-500 ring-offset-4 rounded-2xl animate-pulse' : n.className
                                };
                            })}
                            edges={edges.map(e => {
                                const err = validationErrors.find(eErr => eErr.nodeId === e.id && eErr.severity === 'error');
                                return {
                                    ...e,
                                    animated: err ? true : e.animated,
                                    style: err ? { ...e.style, stroke: '#ef4444', strokeWidth: 4 } : e.style
                                };
                            })}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onInit={setReactFlowInstance}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                            onNodeClick={onNodeClick}
                            onPaneClick={onPaneClick}
                            nodeTypes={nodeTypes}
                            defaultEdgeOptions={{ type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } }}
                            fitView
                            fitViewOptions={{ padding: 0.15 }}
                            minZoom={0.2}
                            maxZoom={2}
                            snapToGrid
                            snapGrid={[16, 16]}
                        >
                            <Controls className="!shadow-sm !rounded-xl !border !border-gray-100 !bg-white" />
                            <MiniMap
                                className="!rounded-xl !shadow-sm !border !border-gray-100 !bg-white"
                                nodeColor={(n) => {
                                    if (n.type === 'start') return '#10b981';
                                    if (n.type === 'end') return '#ef4444';
                                    if (n.type === 'condition') return '#8b5cf6';
                                    return '#e2e8f0';
                                }}
                                maskColor="rgba(0,0,0,0.04)"
                            />
                            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />

                            {/* Canvas action hint when empty */}
                            {nodes.length <= 1 && (
                                <Panel position="top-center" className="pointer-events-none">
                                    <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm text-center mt-4">
                                        <p className="text-[13px] font-bold text-gray-500">
                                            ← Drag nodes from the left panel to build your flow
                                        </p>
                                    </div>
                                </Panel>
                            )}
                        </ReactFlow>
                    </div>

                    {/* Right: Properties Panel */}
                    {selectedNode && (
                        <FlowPropertiesPanel
                            selectedNode={selectedNode}
                            onChange={onNodeUpdate}
                            onClose={() => setSelectedNode(null)}
                            onDelete={() => {
                                if (confirm('Delete this node?')) onDeleteNode(selectedNode.id);
                            }}
                            onDuplicate={() => onDuplicateNode(selectedNode)}
                        />
                    )}
                </div>

                {/* ── FLOW SIMULATOR SLIDE-OVER ─────────────────────────────── */}
                {showSimulator && (
                    <div className="absolute bottom-4 right-4 w-80 h-[480px] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
                        {/* Sim Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white">
                                <MessageSquare size={16} />
                                <span className="text-[12px] font-black">Flow Simulator</span>
                                <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                                    {simCurrentNodeId ? nodes.find(n => n.id === simCurrentNodeId)?.type || 'unknown' : 'ended'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => { setSimMessages([]); setSimCurrentNodeId(null); runSimulator(); }} className="text-white/80 hover:text-white text-[10px] font-bold">↺ Reset</button>
                                <button onClick={() => setShowSimulator(false)} className="text-white/80 hover:text-white"><X size={14} /></button>
                            </div>
                        </div>

                        {/* Phone frame */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#ECE5DD]">
                            {simMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-[12px] font-medium shadow-sm ${msg.role === 'user' ? 'bg-[#DCF8C6] text-gray-800 rounded-tr-sm' : 'bg-white text-gray-800 rounded-tl-sm'}`}>
                                        {msg.mediaUrl && (
                                            <div className="mb-2 w-full h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                <img src={msg.mediaUrl} alt="Media" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        {msg.text}

                                        {msg.buttons && msg.buttons.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                {msg.buttons.map((b: SimButton, bIdx: number) => (
                                                    <div key={bIdx} className="w-full bg-blue-50/50 hover:bg-blue-100 border border-blue-100 text-blue-600 text-center py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                                        onClick={() => {
                                                            if (b.type === 'reply') {
                                                                setSimInput(b.title || b.id || 'Button');
                                                                setTimeout(sendSimInput, 10);
                                                            } else {
                                                                alert(`Action: ${b.type} -> ${b.value}`);
                                                            }
                                                        }}>
                                                        {b.title} {b.type === 'url' ? '↗' : b.type === 'call' ? '📞' : ''}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {msg.listItems && msg.listItems.length > 0 && (
                                            <div className="mt-2 space-y-1 border-t pt-2">
                                                <div className="text-[10px] font-bold text-gray-500 mb-1">List Menu:</div>
                                                {msg.listItems.map((li: SimListItem, lIdx: number) => (
                                                    <div key={lIdx} className="w-full bg-fuchsia-50 hover:bg-fuchsia-100 border border-fuchsia-100 text-fuchsia-700 p-1.5 rounded-lg text-[10px] cursor-pointer transition-colors flex flex-col"
                                                        onClick={() => {
                                                            setSimInput(`LIST_SELECT_ID:${li.id}`);
                                                            setTimeout(sendSimInput, 10);
                                                        }}>
                                                        <span className="font-bold">{li.title}</span>
                                                        {li.description && <span className="font-normal text-[9px] opacity-70 truncate">{li.description}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="text-[9px] text-gray-400 text-right mt-0.5">
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                </div>
                            ))}
                            {simMessages.length === 0 && (
                                <div className="text-center py-10 text-gray-400 text-[11px]">Press Reset to start simulation</div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-2 border-t border-gray-100 bg-white flex gap-2">
                            <input
                                type="text"
                                value={simInput}
                                onChange={(e) => setSimInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendSimInput()}
                                placeholder="Type a message..."
                                className="flex-1 text-[12px] border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
                            />
                            <button onClick={sendSimInput} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl p-2 transition-colors">
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </ReactFlowProvider>
    );
}
