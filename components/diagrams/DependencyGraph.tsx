"use client";

import { useState, useCallback, useMemo, useId } from "react";

interface GraphNode {
  id: string;
  label: string;
  detail?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  tooltip?: string;
}

interface GraphEdge {
  from: string;
  to: string;
}

interface DependencyGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width?: number;
  height?: number;
}

const nodeColors: Record<string, { fill: string; stroke: string; text: string; detail: string; hoverFill: string; hlStroke: string }> = {
  blue:    { fill: "rgba(74,144,226,0.12)",  stroke: "rgba(74,144,226,0.5)",   text: "#4A90E2",  detail: "rgba(74,144,226,0.6)",  hoverFill: "rgba(74,144,226,0.25)", hlStroke: "#4A90E2" },
  purple:  { fill: "rgba(123,104,238,0.12)", stroke: "rgba(123,104,238,0.5)",  text: "#7B68EE",  detail: "rgba(123,104,238,0.6)", hoverFill: "rgba(123,104,238,0.25)", hlStroke: "#7B68EE" },
  cyan:    { fill: "rgba(34,211,238,0.12)",  stroke: "rgba(34,211,238,0.5)",   text: "#22D3EE",  detail: "rgba(34,211,238,0.6)",  hoverFill: "rgba(34,211,238,0.25)", hlStroke: "#22D3EE" },
  amber:   { fill: "rgba(245,158,11,0.12)",  stroke: "rgba(245,158,11,0.5)",   text: "#F59E0B",  detail: "rgba(245,158,11,0.6)",  hoverFill: "rgba(245,158,11,0.25)", hlStroke: "#F59E0B" },
  green:   { fill: "rgba(34,197,94,0.12)",   stroke: "rgba(34,197,94,0.5)",    text: "#22C55E",  detail: "rgba(34,197,94,0.6)",   hoverFill: "rgba(34,197,94,0.25)", hlStroke: "#22C55E" },
  pink:    { fill: "rgba(236,72,153,0.12)",  stroke: "rgba(236,72,153,0.5)",   text: "#EC4899",  detail: "rgba(236,72,153,0.6)",  hoverFill: "rgba(236,72,153,0.25)", hlStroke: "#EC4899" },
  zinc:    { fill: "rgba(161,161,170,0.08)", stroke: "rgba(161,161,170,0.3)",  text: "#A1A1AA",  detail: "rgba(161,161,170,0.5)", hoverFill: "rgba(161,161,170,0.15)", hlStroke: "#A1A1AA" },
  emerald: { fill: "rgba(52,211,153,0.12)",  stroke: "rgba(52,211,153,0.5)",   text: "#34D399",  detail: "rgba(52,211,153,0.6)",  hoverFill: "rgba(52,211,153,0.25)", hlStroke: "#34D399" },
  orange:  { fill: "rgba(249,115,22,0.12)",  stroke: "rgba(249,115,22,0.5)",   text: "#F97316",  detail: "rgba(249,115,22,0.6)",  hoverFill: "rgba(249,115,22,0.25)", hlStroke: "#F97316" },
};

function getCenter(n: GraphNode) {
  return { x: n.x + n.width / 2, y: n.y + n.height / 2 };
}

function getEdgePoint(from: GraphNode, to: GraphNode) {
  const fc = getCenter(from);
  const tc = getCenter(to);
  const dx = tc.x - fc.x;
  const dy = tc.y - fc.y;

  let sx = fc.x, sy = fc.y, ex = tc.x, ey = tc.y;

  if (Math.abs(dy) > 0.01) {
    if (dy > 0) { sy = from.y + from.height; ey = to.y; }
    else { sy = from.y; ey = to.y + to.height; }
    const ratioS = (sy - fc.y) / dy;
    sx = fc.x + dx * ratioS;
    sx = Math.max(from.x, Math.min(from.x + from.width, sx));
    const ratioE = (ey - tc.y) / dy;
    ex = tc.x + dx * ratioE;
    ex = Math.max(to.x, Math.min(to.x + to.width, ex));
  } else {
    if (dx > 0) { sx = from.x + from.width; ex = to.x; }
    else { sx = from.x; ex = to.x + to.width; }
  }

  return { sx, sy, ex, ey };
}

export default function DependencyGraph({ nodes, edges, width = 820, height = 620 }: DependencyGraphProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const uid = useId().replace(/:/g, "");

  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  // Build adjacency for ancestors/descendants
  const { ancestors, descendants } = useMemo(() => {
    const childrenOf = new Map<string, Set<string>>();
    const parentsOf = new Map<string, Set<string>>();
    for (const n of nodes) {
      childrenOf.set(n.id, new Set());
      parentsOf.set(n.id, new Set());
    }
    for (const e of edges) {
      childrenOf.get(e.from)?.add(e.to);
      parentsOf.get(e.to)?.add(e.from);
    }

    function collectDown(id: string, visited: Set<string>): Set<string> {
      if (visited.has(id)) return visited;
      visited.add(id);
      for (const c of childrenOf.get(id) || []) collectDown(c, visited);
      return visited;
    }
    function collectUp(id: string, visited: Set<string>): Set<string> {
      if (visited.has(id)) return visited;
      visited.add(id);
      for (const p of parentsOf.get(id) || []) collectUp(p, visited);
      return visited;
    }

    return { ancestors: collectUp, descendants: collectDown };
  }, [nodes, edges]);

  const activeNode = selectedNode || hoveredNode;

  const connectedNodes = useMemo(() => {
    if (!activeNode) return null;
    const up = ancestors(activeNode, new Set<string>());
    const down = descendants(activeNode, new Set<string>());
    return new Set([...up, ...down]);
  }, [activeNode, ancestors, descendants]);

  const connectedEdges = useMemo(() => {
    if (!connectedNodes) return null;
    const set = new Set<number>();
    edges.forEach((e, i) => {
      if (connectedNodes.has(e.from) && connectedNodes.has(e.to)) set.add(i);
    });
    return set;
  }, [connectedNodes, edges]);

  const handleClick = useCallback((id: string) => {
    setSelectedNode(prev => prev === id ? null : id);
  }, []);

  return (
    <div className="my-8 flex flex-col items-center">
      <style>{`
        @keyframes edgeFlow${uid} {
          0% { stroke-dashoffset: 20; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>

      <div className="overflow-x-auto">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="max-w-full">
          <defs>
            <marker id={`da-${uid}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="rgba(161,161,170,0.45)" />
            </marker>
            <marker id={`da-${uid}-hl`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="rgba(74,144,226,0.9)" />
            </marker>
            <filter id={`ng-${uid}`}>
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feFlood floodColor="rgba(74,144,226,0.15)" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="shadow" />
              <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {edges.map((e, i) => {
            const fromNode = nodeMap.get(e.from);
            const toNode = nodeMap.get(e.to);
            if (!fromNode || !toNode) return null;
            const { sx, sy, ex, ey } = getEdgePoint(fromNode, toNode);
            const my = (sy + ey) / 2;
            const path = `M ${sx} ${sy} C ${sx} ${my}, ${ex} ${my}, ${ex} ${ey}`;
            const hl = connectedEdges?.has(i) ?? false;
            const dim = activeNode ? !hl : false;

            return (
              <g key={i}>
                <path d={path}
                  stroke={hl ? "rgba(74,144,226,0.7)" : `rgba(161,161,170,${dim ? 0.06 : 0.2})`}
                  strokeWidth={hl ? 2.5 : 1.5} fill="none"
                  markerEnd={`url(#da-${uid}${hl ? "-hl" : ""})`}
                  style={{ transition: "stroke 0.3s, stroke-width 0.3s" }} />
                {hl && (
                  <path d={path} stroke="rgba(74,144,226,0.5)" strokeWidth={2.5} fill="none"
                    strokeDasharray="4 16"
                    style={{ animation: `edgeFlow${uid} 1s linear infinite` }} />
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map(n => {
            const c = nodeColors[n.color] || nodeColors.blue;
            const isConnected = !activeNode || connectedNodes?.has(n.id);
            const isActive = selectedNode === n.id || hoveredNode === n.id;

            return (
              <g key={n.id}
                 filter={`url(#ng-${uid})`}
                 className="cursor-pointer"
                 onClick={() => handleClick(n.id)}
                 onMouseEnter={() => setHoveredNode(n.id)}
                 onMouseLeave={() => setHoveredNode(null)}
                 style={{
                   opacity: isConnected ? 1 : 0.15,
                   transition: "opacity 0.3s",
                 }}
              >
                {/* Selection ring */}
                {selectedNode === n.id && (
                  <rect x={n.x - 3} y={n.y - 3} width={n.width + 6} height={n.height + 6}
                    rx="10" fill="none" stroke={c.hlStroke} strokeWidth="1.5" strokeDasharray="4 4">
                    <animate attributeName="stroke-dashoffset" values="8;0" dur="0.6s" repeatCount="indefinite" />
                  </rect>
                )}

                <rect x={n.x} y={n.y} width={n.width} height={n.height}
                  rx="8"
                  fill={isActive ? c.hoverFill : c.fill}
                  stroke={isActive ? c.hlStroke : c.stroke}
                  strokeWidth={isActive ? "2" : "1.2"}
                  style={{
                    transition: "all 0.3s",
                    transform: isActive ? "scale(1.05)" : "scale(1)",
                    transformOrigin: `${n.x + n.width/2}px ${n.y + n.height/2}px`,
                  }}
                />

                <text x={n.x + n.width / 2} y={n.y + (n.detail ? n.height / 2 - 2 : n.height / 2 + 4)}
                  textAnchor="middle" fontSize="12" fontWeight="700" fill={c.text}
                  fontFamily="system-ui, sans-serif" style={{ pointerEvents: "none" }}>
                  {n.label}
                </text>
                {n.detail && (
                  <text x={n.x + n.width / 2} y={n.y + n.height / 2 + 12}
                    textAnchor="middle" fontSize="9" fill={c.detail}
                    fontFamily="monospace" style={{ pointerEvents: "none" }}>
                    {n.detail}
                  </text>
                )}

                {/* Tooltip on hover */}
                {hoveredNode === n.id && n.tooltip && (
                  <g>
                    <rect x={n.x + n.width / 2 - n.tooltip.length * 3.2 - 8} y={n.y - 30}
                          width={n.tooltip.length * 6.4 + 16} height={22}
                          rx="6" fill="rgba(0,0,0,0.92)" stroke="rgba(63,63,70,0.5)" strokeWidth="0.5" />
                    <text x={n.x + n.width / 2} y={n.y - 15} textAnchor="middle" fontSize="10"
                          fill="#d4d4d8" fontFamily="system-ui, sans-serif" style={{ pointerEvents: "none" }}>
                      {n.tooltip}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-[10px] text-zinc-600 text-center mt-2">
        Cliquer sur un nœud pour voir ses dépendances · Cliquer à nouveau pour déselectionner
      </p>
    </div>
  );
}
