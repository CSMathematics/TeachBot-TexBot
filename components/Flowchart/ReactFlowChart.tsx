import React, { useEffect, useMemo, useCallback } from 'react';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, MarkerType, Position, Node, Edge, Handle, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { Download, Printer, FileJson } from 'lucide-react';

// Node Types
const ProcessNode = ({ data }: any) => {
    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 w-full min-w-[150px] text-center relative">
            <Handle type="target" position={Position.Top} className="!bg-slate-500" />
            <div className="font-bold text-xs mb-1 text-slate-500 uppercase tracking-wider">Process</div>
            <div className="text-sm font-medium">
                <Latex>{data.label}</Latex>
            </div>
            <Handle type="source" position={Position.Bottom} className="!bg-slate-500" />
        </div>
    );
};

const DecisionNode = ({ data }: any) => {
    return (
        <div className="px-6 py-4 shadow-md rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 w-full min-w-[180px] text-center transform rotate-0 relative">
            <Handle type="target" position={Position.Top} className="!bg-indigo-500" />
            <div className="font-bold text-xs mb-1 text-indigo-500 uppercase tracking-wider">Decision</div>
            <div className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                <Latex>{data.label}</Latex>
            </div>
            <Handle type="source" position={Position.Bottom} className="!bg-indigo-500" />
            <Handle type="source" position={Position.Right} id="right" className="!bg-indigo-500" />
            <Handle type="source" position={Position.Left} id="left" className="!bg-indigo-500" />
        </div>
    );
};

const StartNode = ({ data }: any) => {
    return (
        <div className="px-4 py-2 shadow-md rounded-full bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-400 dark:border-emerald-600 min-w-[120px] text-center relative">
            <div className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                <Latex>{data.label}</Latex>
            </div>
            <Handle type="source" position={Position.Bottom} className="!bg-emerald-500" />
        </div>
    );
};

const EndNode = ({ data }: any) => {
    return (
        <div className="px-4 py-2 shadow-md rounded-full bg-rose-100 dark:bg-rose-900/30 border-2 border-rose-400 dark:border-rose-600 min-w-[120px] text-center relative">
            <Handle type="target" position={Position.Top} className="!bg-rose-500" />
            <div className="text-sm font-bold text-rose-800 dark:text-rose-200">
                <Latex>{data.label}</Latex>
            </div>
        </div>
    );
};

const nodeTypes = {
    process: ProcessNode,
    decision: DecisionNode,
    start: StartNode,
    end: EndNode,
};

// Layout Helper
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 220;
    const nodeHeight = 80;

    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            targetPosition: Position.Top,
            sourcePosition: Position.Bottom,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

interface ReactFlowChartProps {
    initialNodes: any[];
    initialEdges: any[];
}

const ReactFlowChart: React.FC<ReactFlowChartProps> = ({ initialNodes, initialEdges }) => {
    // Convert API nodes/edges to React Flow format
    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
        const nodes = initialNodes.map(n => ({
            ...n,
            id: n.id,
            type: n.type || 'process', // default to process
            data: { label: n.label },
            position: { x: 0, y: 0 } // handled by dagre
        }));

        const edges = initialEdges.map(e => ({
            ...e,
            id: e.id,
            source: e.source,
            target: e.target,
            label: e.label,
            type: 'smoothstep',
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: '#94a3b8',
            },
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            labelStyle: { fill: '#64748b', fontWeight: 500, fontSize: 12 },
            labelBgStyle: { fill: '#f1f5f9', opacity: 0.8 },
        }));

        return getLayoutedElements(nodes, edges);
    }, [initialNodes, initialEdges]);

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    // Update layout when prompts change
    useEffect(() => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

    const onDownload = useCallback(() => {
        const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
        if (!viewport) return;

        toPng(viewport, {
            backgroundColor: '#ffffff',
            width: viewport.scrollWidth,
            height: viewport.scrollHeight,
            style: {
                width: viewport.scrollWidth + 'px',
                height: viewport.scrollHeight + 'px',
            }
        }).then((dataUrl) => {
            saveAs(dataUrl, 'flowchart.png');
        });
    }, []);

    const onExport = useCallback(() => {
        const flowData = { nodes, edges };
        const blob = new Blob([JSON.stringify(flowData, null, 2)], { type: 'application/json' });
        saveAs(blob, 'flowchart.json');
    }, [nodes, edges]);

    const onPrint = useCallback(() => {
        const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
        if (!viewport) return;

        toPng(viewport, {
            backgroundColor: '#ffffff',
            width: viewport.scrollWidth,
            height: viewport.scrollHeight,
            style: {
                width: viewport.scrollWidth + 'px',
                height: viewport.scrollHeight + 'px',
            }
        }).then((dataUrl) => {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Print Flowchart</title>
                            <style>
                                body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                                img { max-width: 100%; max-height: 100%; }
                            </style>
                        </head>
                        <body>
                            <img src="${dataUrl}" onload="window.print();window.close()" />
                        </body>
                    </html>
                `);
                printWindow.document.close();
            }
        });
    }, []);

    return (
        <div style={{ height: '100%', width: '100%' }} className="min-h-[500px] border rounded-lg bg-slate-50 dark:bg-slate-950 relative group">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background color="#ccc" gap={16} />
                <Controls />
                <Panel position="top-right" className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 flex gap-2">
                    <button onClick={onDownload} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" title="Download PNG">
                        <Download className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <button onClick={onPrint} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" title="Print">
                        <Printer className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <button onClick={onExport} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" title="Export JSON">
                        <FileJson className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    );
};

export default ReactFlowChart;
