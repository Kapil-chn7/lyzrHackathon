import React, { useCallback, useState } from "react";
import ReactFlow, {
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    Controls,
    MiniMap,
    Handle,
    Position,
} from "reactflow";
import axios from "axios"
import "reactflow/dist/style.css";

// 💎 Diamond node for Conditional Agent
const DiamondNode = ({ data }) => {
    const size = 150;
    const half = size / 2;

    return (
        <div style={{ width: size, height: size, position: "relative" }}>
            <Handle type="target" position={Position.Top} style={{ background: "#555", width: 12, height: 12 }} />
            <Handle type="source" position={Position.Bottom} style={{ background: "#555", width: 12, height: 12 }} />
            <svg width={size} height={size}>
                <polygon
                    points={`${half},0 ${size},${half} ${half},${size} 0,${half}`}
                    fill={data.color || "#FFA500"}
                    stroke="#222"
                    strokeWidth={3}
                />
                <text
                    x={half}
                    y={half}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={16}
                    fontWeight="bold"
                    style={{ pointerEvents: "none", fill: "#fff" }}
                >
                    {data.label}
                </text>
            </svg>
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    textAlign: "center",
                    top: size + 5,
                    fontSize: "12px",
                    color: "#333",
                }}
            >
                {data.id}
            </div>
        </div>
    );
};

// 🟩 Custom Default Node (for all rectangular agents)
const DefaultAgentNode = ({ data }) => {
    return (
        <div
            style={{
                background: data.color,
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid #222",
                fontWeight: "bold",
                textAlign: "center",
                minWidth: "100px",
                position: "relative",
            }}
        >
            <Handle type="target" position={Position.Top} style={{ background: "#555" }} />
            {data.label}
            <Handle type="source" position={Position.Bottom} style={{ background: "#555" }} />
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    textAlign: "center",
                    bottom: "-18px",
                    fontSize: "12px",
                    color: "#333",
                }}
            >
                {data.id}
            </div>
        </div>
    );
};

const nodeTypes = {
    conditional: DiamondNode,
    defaultNode: DefaultAgentNode,
};

// Colors for each agent type
const nodeColorMap = {
    "Normal Agent": "#32CD32",
    "Input Agent": "#1E90FF",
    "Output Agent": "#FF4500",
    "Conditional Agent": "#FFA500",
    "Human Agent": "#9370DB",
};

// Type mapping
const typeMap = {
    "Input Agent": "inputAgent",
    "Output Agent": "outputAgent",
    "Normal Agent": "agent",
    "Conditional Agent": "checkAgent",
    "Human Agent": "human",
};

// Default input/output nodes
const initialNodes = [
    {
        id: "inputAgent",
        position: { x: 50, y: 50 },
        data: { label: "Input Agent", color: nodeColorMap["Input Agent"], id: "inputAgent" },
        type: "defaultNode",
    },
    {
        id: "outputAgent",
        position: { x: 400, y: 50 },
        data: { label: "Output Agent", color: nodeColorMap["Output Agent"], id: "outputAgent" },
        type: "defaultNode",
    },
];

export default function DragDrop() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState([]);
    const [showConfig, setShowConfig] = useState(false);
    const [nodeConfig, setNodeConfig] = useState({});
    const [flowName, setFlowName] = useState("");

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

    const onConnect = useCallback(
        (params) => {
            const sourceNode = nodes.find((n) => n.id === params.source);
            const color = sourceNode?.data?.color || "#000";
            const newEdge = {
                id: `${params.source}-${params.target}-${Math.random().toString(36).substr(2, 5)}`,
                source: params.source,
                target: params.target,
                type: "smoothstep",
                animated: true,
                style: { stroke: color, strokeWidth: 3 },
                markerEnd: { type: "arrowclosed", color },
            };
            setEdges((eds) => [...eds, newEdge]);
        },
        [nodes]
    );

    const addNode = (type, label) => {
        if (label === "Input Agent" && nodes.some((n) => n.data.label === "Input Agent")) {
            alert("Only one Input Agent allowed!");
            return;
        }
        if (label === "Output Agent" && nodes.some((n) => n.data.label === "Output Agent")) {
            alert("Only one Output Agent allowed!");
            return;
        }

        const idBase = typeMap[label] || "agent";
        const count = nodes.filter((n) => n.data.label === label).length + 1;
        const id = `${idBase}${count}`;

        const newNode = {
            id,
            data: { label, color: nodeColorMap[label], id },
            position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
            type: label === "Conditional Agent" ? "conditional" : "defaultNode",
        };

        setNodes((nds) => [...nds, newNode]);
    };

    const saveWorkflow = async (workflow) => {
        try {
            const response = await axios.post("http://localhost:8000/api/workflows/createworkflow", workflow, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            console.log("✅ Workflow saved successfully:", response.data);
            alert("Workflow saved successfully to backend!");
            return response.data;
        } catch (error) {
            console.error("❌ Error saving workflow:", error);
            alert("Failed to save workflow. Check console for details.");
        }
    };
    const saveConfig = async () => {
        if (!flowName) {
            const name = prompt("Enter Agentic Flow name:");
            if (!name) return;
            setFlowName(name);
        }

        const nodeData = nodes.map((n) => ({
            id: n.id,
            type: typeMap[n.data.label] || "agent",
            config: nodeConfig[n.id] || {},
        }));

        const groupedEdges = {};
        edges.forEach((e) => {
            if (!groupedEdges[e.source]) {
                groupedEdges[e.source] = {
                    source: e.source,
                    type: typeMap[nodes.find((n) => n.id === e.source)?.data?.label] || "agent",
                    target: [],
                };
            }
            groupedEdges[e.source].target.push(e.target);
        });

        const edgeData = Object.values(groupedEdges);

        const workflow = {
            workFlow_id: flowName || "uid_" + Math.random().toString(36).substring(2, 8),
            nodes: nodeData,
            edges: edgeData,
        };

        localStorage.setItem("agenticFlow", JSON.stringify(workflow, null, 2));
        console.log("💾 Full Workflow JSON:", workflow);

        await saveWorkflow(workflow);
        alert("Agentic Flow saved successfully!");
        setShowConfig(false);
    };

    const loadSavedFlow = () => {
        const saved = localStorage.getItem("agenticFlow");
        if (!saved) {
            alert("No saved flow found!");
            return;
        }
        const wf = JSON.parse(saved);
        alert(`Loaded saved flow: ${wf.workFlow_id}`);
        console.log("Loaded Flow:", wf);
    };

    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            {/* Buttons */}
            <div style={{ position: "absolute", zIndex: 10, left: 10, top: 10, display: "flex", flexDirection: "column", gap: "5px" }}>
                <button onClick={() => addNode("default", "Normal Agent")}>Add Normal Agent</button>
                <button onClick={() => addNode("default", "Input Agent")}>Add Input Agent</button>
                <button onClick={() => addNode("default", "Output Agent")}>Add Output Agent</button>
                <button onClick={() => addNode("conditional", "Conditional Agent")}>Add Conditional Agent</button>
                <button onClick={() => addNode("default", "Human Agent")}>Add Human Agent</button>
                <button onClick={() => setShowConfig(true)} style={{ background: "#222", color: "#fff" }}>
                    Config Table
                </button>
            </div>

            {/* Config Table */}
            {showConfig && (
                <div
                    style={{
                        position: "absolute",
                        top: "10%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#fff",
                        padding: "20px",
                        borderRadius: "10px",
                        zIndex: 20,
                        width: "80%",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    }}
                >
                    <h3 style={{ marginBottom: "10px" }}>Agentic Flow Configuration</h3>

                    {/* Workflow Name */}
                    <div style={{ marginBottom: "15px" }}>
                        {flowName ? (
                            <div>
                                <strong>Flow Name:</strong> {flowName}
                            </div>
                        ) : (
                            <input
                                type="text"
                                placeholder="Enter Flow Name"
                                onChange={(e) => setFlowName(e.target.value)}
                                style={{ padding: "5px", width: "300px" }}
                            />
                        )}
                    </div>

                    {/* Table */}
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f0f0f0" }}>
                                <th>ID</th>
                                <th>Type</th>
                                <th>URL</th>
                                <th>Headers</th>
                                <th>Params</th>
                            </tr>
                        </thead>
                        <tbody>
                            {nodes.map((node) => (
                                <tr key={node.id}>
                                    <td>{node.id}</td>
                                    <td>{typeMap[node.data.label] || "agent"}</td>
                                    <td>
                                        <input
                                            type="text"
                                            placeholder="Enter URL"
                                            value={nodeConfig[node.id]?.endpoint || ""}
                                            onChange={(e) =>
                                                setNodeConfig((prev) => ({
                                                    ...prev,
                                                    [node.id]: { ...prev[node.id], endpoint: e.target.value },
                                                }))
                                            }
                                            style={{ width: "100%" }}
                                        />
                                    </td>
                                    <td>
                                        <textarea
                                            placeholder="Headers"
                                            value={nodeConfig[node.id]?.headers || ""}
                                            onChange={(e) =>
                                                setNodeConfig((prev) => ({
                                                    ...prev,
                                                    [node.id]: { ...prev[node.id], headers: e.target.value },
                                                }))
                                            }
                                            style={{ width: "100%", height: "40px" }}
                                        />
                                    </td>
                                    <td>
                                        <textarea
                                            placeholder="Params"
                                            value={nodeConfig[node.id]?.params || ""}
                                            onChange={(e) =>
                                                setNodeConfig((prev) => ({
                                                    ...prev,
                                                    [node.id]: { ...prev[node.id], params: e.target.value },
                                                }))
                                            }
                                            style={{ width: "100%", height: "40px" }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ marginTop: "15px", textAlign: "right" }}>
                        <button onClick={() => setShowConfig(false)} style={{ marginRight: "10px" }}>
                            Cancel
                        </button>
                        <button onClick={saveConfig} style={{ background: "#222", color: "#fff", marginRight: "10px" }}>
                            Save Config
                        </button>
                        <button onClick={loadSavedFlow} style={{ background: "#008000", color: "#fff" }}>
                            Load Saved Flow
                        </button>
                    </div>
                </div>
            )}

            {/* Overlay */}
            {showConfig && (
                <div
                    style={{
                        position: "absolute",
                        width: "100vw",
                        height: "100vh",
                        top: 0,
                        left: 0,
                        background: "rgba(0,0,0,0.3)",
                        zIndex: 15,
                    }}
                    onClick={() => setShowConfig(false)}
                ></div>
            )}

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
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}
