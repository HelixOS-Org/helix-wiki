"use client";

import { useState, useCallback, useId } from "react";

interface StateNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  type?: "normal" | "error" | "start" | "end";
  tooltip?: string;
}

interface Transition {
  from: string;
  to: string;
  label: string;
  curved?: number;
}

interface StateMachineProps {
  nodes: StateNode[];
  transitions: Transition[];
  width?: number;
  height?: number;
}

const stateColors: Record<string, { fill: string; stroke: string; text: string; glow: string; hoverFill: string }> = {
  blue:   { fill: "rgba(74,144,226,0.15)",  stroke: "#4A90E2",  text: "#4A90E2",  glow: "rgba(74,144,226,0.3)",  hoverFill: "rgba(74,144,226,0.3)" },
  purple: { fill: "rgba(123,104,238,0.15)", stroke: "#7B68EE",  text: "#7B68EE",  glow: "rgba(123,104,238,0.3)", hoverFill: "rgba(123,104,238,0.3)" },
  green:  { fill: "rgba(34,197,94,0.15)",   stroke: "#22C55E",  text: "#22C55E",  glow: "rgba(34,197,94,0.3)",   hoverFill: "rgba(34,197,94,0.3)" },
  amber:  { fill: "rgba(245,158,11,0.15)",  stroke: "#F59E0B",  text: "#F59E0B",  glow: "rgba(245,158,11,0.3)",  hoverFill: "rgba(245,158,11,0.3)" },
  red:    { fill: "rgba(239,68,68,0.15)",   stroke: "#EF4444",  text: "#EF4444",  glow: "rgba(239,68,68,0.3)",   hoverFill: "rgba(239,68,68,0.3)" },
  zinc:   { fill: "rgba(161,161,170,0.1)",  stroke: "#71717A",  text: "#A1A1AA",  glow: "rgba(161,161,170,0.2)", hoverFill: "rgba(161,161,170,0.2)" },
  cyan:   { fill: "rgba(34,211,238,0.15)",  stroke: "#22D3EE",  text: "#22D3EE",  glow: "rgba(34,211,238,0.3)",  hoverFill: "rgba(34,211,238,0.3)" },
  pink:   { fill: "rgba(236,72,153,0.15)",  stroke: "#EC4899",  text: "#EC4899",  glow: "rgba(236,72,153,0.3)",  hoverFill: "rgba(236,72,153,0.3)" },
};

function getNodePos(nodes: StateNode[], id: string): { x: number; y: number } {
  const n = nodes.find(n => n.id === id);
  return n ? { x: n.x, y: n.y } : { x: 0, y: 0 };
}

function Arrow({ from, to, label, curved = 0, nodes, highlighted, dimmed, uid }: Transition & { nodes: StateNode[]; highlighted: boolean; dimmed: boolean; uid: string }) {
  const f = getNodePos(nodes, from);
  const t = getNodePos(nodes, to);

  const dx = t.x - f.x;
  const dy = t.y - f.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;
  const nx = dx / len;
  const ny = dy / len;

  const r = 30;
  const sx = f.x + nx * r;
  const sy = f.y + ny * r;
  const ex = t.x - nx * r;
  const ey = t.y - ny * r;

  const mx = (sx + ex) / 2 + (-ny * curved);
  const my = (sy + ey) / 2 + (nx * curved);

  const path = curved !== 0
    ? `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`
    : `M ${sx} ${sy} L ${ex} ${ey}`;

  const lx = curved !== 0 ? mx : (sx + ex) / 2;
  const ly = curved !== 0 ? my : (sy + ey) / 2;

  const baseOpacity = dimmed ? 0.08 : 0.35;
  const strokeColor = highlighted ? "rgba(74,144,226,0.9)" : `rgba(161,161,170,${baseOpacity})`;
  const strokeW = highlighted ? 2.5 : 1.5;

  return (
    <g style={{ transition: "opacity 0.3s" }}>
      {/* Base path */}
      <path d={path} stroke={strokeColor} strokeWidth={strokeW} fill="none"
            markerEnd={`url(#ah-${uid}${highlighted ? "-hl" : ""})`} />

      {/* Animated dash overlay when highlighted */}
      {highlighted && (
        <path d={path} stroke="rgba(74,144,226,0.6)" strokeWidth={strokeW} fill="none"
              strokeDasharray="6 10"
              style={{ animation: `flowDash${uid} 0.8s linear infinite` }} />
      )}

      {label && (
        <>
          <rect x={lx - label.length * 3.2 - 4} y={ly - 8} width={label.length * 6.4 + 8} height={16}
                rx="4" fill={highlighted ? "rgba(74,144,226,0.15)" : "rgba(0,0,0,0.85)"}
                stroke={highlighted ? "rgba(74,144,226,0.4)" : "rgba(63,63,70,0.4)"} strokeWidth="0.5"
                style={{ transition: "all 0.3s" }} />
          <text x={lx} y={ly + 3.5} textAnchor="middle" fontSize="9"
                fill={highlighted ? "#4A90E2" : (dimmed ? "#52525b" : "#A1A1AA")}
                fontFamily="monospace" style={{ transition: "fill 0.3s" }}>
            {label}
          </text>
        </>
      )}
    </g>
  );
}

export default function StateMachine({ nodes, transitions, width = 700, height = 450 }: StateMachineProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const uid = useId().replace(/:/g, "");

  const activeNode = selectedNode || hoveredNode;

  // Compute connected nodes/transitions
  const connectedNodes = new Set<string>();
  const connectedTransitions = new Set<number>();
  if (activeNode) {
    connectedNodes.add(activeNode);
    transitions.forEach((t, i) => {
      if (t.from === activeNode || t.to === activeNode) {
        connectedNodes.add(t.from);
        connectedNodes.add(t.to);
        connectedTransitions.add(i);
      }
    });
  }

  const handleNodeClick = useCallback((id: string) => {
    setSelectedNode(prev => prev === id ? null : id);
  }, []);

  return (
    <div className="my-8 flex flex-col items-center">
      <style>{`
        @keyframes flowDash${uid} {
          0% { stroke-dashoffset: 16; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes pulseRing${uid} {
          0%, 100% { r: 30; opacity: 0.3; }
          50% { r: 36; opacity: 0; }
        }
      `}</style>

      <div className="overflow-x-auto">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="max-w-full">
          <defs>
            <marker id={`ah-${uid}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="rgba(161,161,170,0.5)" />
            </marker>
            <marker id={`ah-${uid}-hl`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="rgba(74,144,226,0.9)" />
            </marker>
            {nodes.map(n => {
              const c = stateColors[n.color] || stateColors.blue;
              return (
                <filter key={`glow-${n.id}`} id={`glow-${uid}-${n.id}`}>
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feFlood floodColor={c.glow} result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="shadow" />
                  <feMerge>
                    <feMergeNode in="shadow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              );
            })}
          </defs>

          {/* Transitions */}
          {transitions.map((t, i) => {
            const hl = activeNode ? connectedTransitions.has(i) : false;
            const dim = activeNode ? !connectedTransitions.has(i) : false;
            return <Arrow key={i} {...t} nodes={nodes} highlighted={hl} dimmed={dim} uid={uid} />;
          })}

          {/* Nodes */}
          {nodes.map(n => {
            const c = stateColors[n.color] || stateColors.blue;
            const isSpecial = n.type === "start" || n.type === "end";
            const isActive = !activeNode || connectedNodes.has(n.id);
            const isSelected = selectedNode === n.id;
            const isHovered = hoveredNode === n.id;

            return (
              <g key={n.id}
                 filter={`url(#glow-${uid}-${n.id})`}
                 className="cursor-pointer"
                 onClick={() => handleNodeClick(n.id)}
                 onMouseEnter={() => setHoveredNode(n.id)}
                 onMouseLeave={() => setHoveredNode(null)}
                 style={{ opacity: isActive ? 1 : 0.2, transition: "opacity 0.3s" }}
              >
                {/* Pulse ring for selected */}
                {isSelected && (
                  <circle cx={n.x} cy={n.y} r={30} fill="none" stroke={c.stroke} strokeWidth="1.5">
                    <animate attributeName="r" values="30;38;30" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                <circle cx={n.x} cy={n.y} r={isSpecial ? 26 : 28}
                  fill={isSelected || isHovered ? c.hoverFill : c.fill}
                  stroke={c.stroke}
                  strokeWidth={isSelected ? "3" : isSpecial ? "2" : "1.5"}
                  strokeDasharray={n.type === "error" ? "4 2" : undefined}
                  style={{ transition: "all 0.3s", transform: isHovered ? `scale(1.1)` : "scale(1)", transformOrigin: `${n.x}px ${n.y}px` }}
                />

                <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="11" fontWeight="600"
                      fill={c.text} fontFamily="system-ui, sans-serif"
                      style={{ pointerEvents: "none" }}>
                  {n.label}
                </text>

                {/* Tooltip on hover */}
                {isHovered && n.tooltip && (
                  <g>
                    <rect x={n.x - n.tooltip.length * 3.2 - 8} y={n.y - 52}
                          width={n.tooltip.length * 6.4 + 16} height={22}
                          rx="6" fill="rgba(0,0,0,0.9)" stroke="rgba(63,63,70,0.5)" strokeWidth="0.5" />
                    <text x={n.x} y={n.y - 37} textAnchor="middle" fontSize="10"
                          fill="#d4d4d8" fontFamily="system-ui, sans-serif">
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
        Cliquer sur un état pour mettre en surbrillance ses transitions · Cliquer à nouveau pour déselectionner
      </p>
    </div>
  );
}
