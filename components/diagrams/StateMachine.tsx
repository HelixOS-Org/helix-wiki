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
  /** Rich state information */
  info?: {
    description?: string;
    entryActions?: string[];
    exitActions?: string[];
    invariants?: string[];
    duration?: string;
    canSelfHeal?: boolean;
  };
}

interface Transition {
  from: string;
  to: string;
  label: string;
  curved?: number;
  /** Rich transition info */
  info?: {
    description?: string;
    guard?: string;
    action?: string;
    probability?: string;
  };
}

interface StateMachineProps {
  nodes: StateNode[];
  transitions: Transition[];
  width?: number;
  height?: number;
  title?: string;
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

const typeConfig: Record<string, { badge: string; color: string }> = {
  start: { badge: "▶", color: "#22C55E" },
  end:   { badge: "■", color: "#EF4444" },
  error: { badge: "⚠", color: "#EF4444" },
  normal: { badge: "", color: "" },
};

function getNodePos(nodes: StateNode[], id: string): { x: number; y: number } {
  const n = nodes.find(n => n.id === id);
  return n ? { x: n.x, y: n.y } : { x: 0, y: 0 };
}

function Arrow({ from, to, label, curved = 0, info, nodes, highlighted, dimmed, uid, onHover, onLeave, isHovered }: Transition & {
  nodes: StateNode[]; highlighted: boolean; dimmed: boolean; uid: string;
  onHover: () => void; onLeave: () => void; isHovered: boolean;
}) {
  const f = getNodePos(nodes, from);
  const t = getNodePos(nodes, to);
  const dx = t.x - f.x, dy = t.y - f.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;
  const nx = dx / len, ny = dy / len;
  const r = 30;
  const sx = f.x + nx * r, sy = f.y + ny * r;
  const ex = t.x - nx * r, ey = t.y - ny * r;
  const mx = (sx + ex) / 2 + (-ny * curved);
  const my = (sy + ey) / 2 + (nx * curved);
  const path = curved !== 0 ? `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}` : `M ${sx} ${sy} L ${ex} ${ey}`;
  const lx = curved !== 0 ? mx : (sx + ex) / 2;
  const ly = curved !== 0 ? my : (sy + ey) / 2;
  const baseOpacity = dimmed ? 0.08 : 0.35;
  const strokeColor = highlighted ? "rgba(74,144,226,0.9)" : `rgba(161,161,170,${baseOpacity})`;
  const strokeW = highlighted ? 2.5 : 1.5;

  return (
    <g style={{ transition: "opacity 0.3s" }}
       className="cursor-pointer"
       onMouseEnter={onHover} onMouseLeave={onLeave}>
      {/* Hit area (wider invisible path for easier hover) */}
      <path d={path} stroke="transparent" strokeWidth="12" fill="none" />

      <path d={path} stroke={strokeColor} strokeWidth={strokeW} fill="none"
            markerEnd={`url(#ah-${uid}${highlighted ? "-hl" : ""})`} />
      {highlighted && (
        <path d={path} stroke="rgba(74,144,226,0.6)" strokeWidth={strokeW} fill="none"
              strokeDasharray="6 10" style={{ animation: `flowDash${uid} 0.8s linear infinite` }} />
      )}

      {label && (
        <>
          <rect x={lx - label.length * 3.2 - 6} y={ly - 9} width={label.length * 6.4 + 12} height={18}
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

      {/* Transition info tooltip on hover */}
      {isHovered && info && (info.guard || info.description || info.action) && (
        <foreignObject x={lx - 100} y={ly + 12} width={200} height={80} style={{ pointerEvents: "none", overflow: "visible" }}>
          <div className="bg-zinc-900/95 border border-zinc-700 rounded-lg shadow-2xl p-2 text-[10px] space-y-1 backdrop-blur-sm">
            {info.description && <p className="text-zinc-400">{info.description}</p>}
            {info.guard && <p className="text-amber-400 font-mono">🛡️ Guard: {info.guard}</p>}
            {info.action && <p className="text-blue-400 font-mono">⚡ Action: {info.action}</p>}
            {info.probability && <p className="text-zinc-500">📊 P: {info.probability}</p>}
          </div>
        </foreignObject>
      )}
    </g>
  );
}

export default function StateMachine({ nodes, transitions, width = 700, height = 450, title }: StateMachineProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredTransition, setHoveredTransition] = useState<number | null>(null);
  const uid = useId().replace(/:/g, "");

  const activeNode = selectedNode || hoveredNode;

  const connectedNodes = new Set<string>();
  const connectedTransitions = new Set<number>();
  if (activeNode) {
    connectedNodes.add(activeNode);
    transitions.forEach((t, i) => {
      if (t.from === activeNode || t.to === activeNode) {
        connectedNodes.add(t.from); connectedNodes.add(t.to); connectedTransitions.add(i);
      }
    });
  }

  const handleNodeClick = useCallback((id: string) => setSelectedNode(prev => prev === id ? null : id), []);

  const selectedInfo = selectedNode ? nodes.find(n => n.id === selectedNode) : null;

  return (
    <div className="my-8 flex flex-col items-center">
      <style>{`
        @keyframes flowDash${uid}{0%{stroke-dashoffset:16}100%{stroke-dashoffset:0}}
        @keyframes panelSlide${uid}{0%{opacity:0;transform:translateX(20px)}100%{opacity:1;transform:translateX(0)}}
      `}</style>

      {title && (
        <div className="w-full max-w-3xl flex items-center gap-3 mb-4">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-green-500" />
          <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent" />
          <span className="text-[10px] font-mono text-zinc-600">{nodes.length} states · {transitions.length} transitions</span>
        </div>
      )}

      {/* State type legend */}
      <div className="flex items-center gap-4 mb-3 text-[10px] text-zinc-600">
        <span className="flex items-center gap-1"><span className="text-green-500">▶</span> Initial state</span>
        <span className="flex items-center gap-1"><span className="text-red-500">⚠</span> Error state</span>
        <span className="flex items-center gap-1">
          <svg width="20" height="6"><line x1="0" y1="3" x2="20" y2="3" stroke="rgba(74,144,226,0.6)" strokeWidth="1.5" strokeDasharray="3 2"/></svg>
          Animated flow
        </span>
      </div>

      <div className="flex gap-3 w-full max-w-4xl">
        <div className="overflow-x-auto flex-1">
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="max-w-full">
            <defs>
              <marker id={`ah-${uid}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="rgba(161,161,170,0.5)" /></marker>
              <marker id={`ah-${uid}-hl`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="rgba(74,144,226,0.9)" /></marker>
              {/* Grid */}
              <pattern id={`smgrid-${uid}`} width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(63,63,70,0.07)" strokeWidth="0.5"/></pattern>
              {nodes.map(n => {
                const c = stateColors[n.color] || stateColors.blue;
                return (
                  <filter key={`glow-${n.id}`} id={`glow-${uid}-${n.id}`}>
                    <feGaussianBlur stdDeviation="4" result="blur" /><feFlood floodColor={c.glow} result="color" />
                    <feComposite in="color" in2="blur" operator="in" result="shadow" />
                    <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                );
              })}
            </defs>

            <rect width={width} height={height} fill={`url(#smgrid-${uid})`} />

            {transitions.map((t, i) => {
              const hl = activeNode ? connectedTransitions.has(i) : hoveredTransition === i;
              const dim = activeNode ? !connectedTransitions.has(i) : false;
              return <Arrow key={i} {...t} nodes={nodes} highlighted={hl} dimmed={dim} uid={uid}
                onHover={() => setHoveredTransition(i)} onLeave={() => setHoveredTransition(null)} isHovered={hoveredTransition === i} />;
            })}

            {nodes.map(n => {
              const c = stateColors[n.color] || stateColors.blue;
              const isSpecial = n.type === "start" || n.type === "end";
              const isActive = !activeNode || connectedNodes.has(n.id);
              const isSelected = selectedNode === n.id;
              const isHovered = hoveredNode === n.id;
              const typeInfo = n.type ? typeConfig[n.type] : typeConfig.normal;
              const hasInfo = !!n.info;
              const inCount = transitions.filter(t => t.to === n.id).length;
              const outCount = transitions.filter(t => t.from === n.id).length;

              return (
                <g key={n.id} filter={`url(#glow-${uid}-${n.id})`} className="cursor-pointer"
                   onClick={() => handleNodeClick(n.id)} onMouseEnter={() => setHoveredNode(n.id)} onMouseLeave={() => setHoveredNode(null)}
                   style={{ opacity: isActive ? 1 : 0.2, transition: "opacity 0.3s" }}>

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
                    style={{ transition: "all 0.3s", transform: isHovered ? `scale(1.1)` : "scale(1)", transformOrigin: `${n.x}px ${n.y}px` }} />

                  {/* Type badge */}
                  {typeInfo.badge && (
                    <text x={n.x + 20} y={n.y - 16} textAnchor="middle" fontSize="10" fill={typeInfo.color}>{typeInfo.badge}</text>
                  )}

                  {/* Self-heal indicator */}
                  {n.info?.canSelfHeal && (
                    <g>
                      <circle cx={n.x - 22} cy={n.y - 18} r="6" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.5)" strokeWidth="0.8"/>
                      <text x={n.x - 22} y={n.y - 15} textAnchor="middle" fontSize="7" fill="#22C55E">↻</text>
                    </g>
                  )}

                  <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="11" fontWeight="600"
                        fill={c.text} fontFamily="system-ui, sans-serif" style={{ pointerEvents: "none" }}>
                    {n.label}
                  </text>

                  {/* Info indicator dot */}
                  {hasInfo && (
                    <circle cx={n.x} cy={n.y + 18} r="2" fill={c.stroke} opacity="0.5">
                      <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
                    </circle>
                  )}

                  {/* Degree badges on hover */}
                  {(isHovered || isSelected) && (
                    <>
                      {inCount > 0 && (
                        <g><circle cx={n.x - 24} cy={n.y + 6} r="7" fill="rgba(0,0,0,0.85)" stroke="rgba(74,144,226,0.4)" strokeWidth="0.6"/>
                        <text x={n.x - 24} y={n.y + 9} textAnchor="middle" fontSize="7" fill="#4A90E2" fontFamily="monospace">↓{inCount}</text></g>
                      )}
                      {outCount > 0 && (
                        <g><circle cx={n.x + 24} cy={n.y + 6} r="7" fill="rgba(0,0,0,0.85)" stroke="rgba(123,104,238,0.4)" strokeWidth="0.6"/>
                        <text x={n.x + 24} y={n.y + 9} textAnchor="middle" fontSize="7" fill="#7B68EE" fontFamily="monospace">↑{outCount}</text></g>
                      )}
                    </>
                  )}

                  {/* Tooltip */}
                  {isHovered && n.tooltip && !isSelected && (
                    <g>
                      <rect x={n.x - n.tooltip.length * 3.2 - 8} y={n.y - 52} width={n.tooltip.length * 6.4 + 16} height={22} rx="6" fill="rgba(0,0,0,0.9)" stroke="rgba(63,63,70,0.5)" strokeWidth="0.5" />
                      <text x={n.x} y={n.y - 37} textAnchor="middle" fontSize="10" fill="#d4d4d8" fontFamily="system-ui, sans-serif">{n.tooltip}</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail panel */}
        {selectedInfo?.info && (
          <div className="w-64 shrink-0 bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 backdrop-blur-sm self-start max-h-[450px] overflow-y-auto"
               style={{ animation: `panelSlide${uid} 0.3s ease` }}>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-zinc-800">
              <div className="w-3 h-3 rounded-full" style={{ background: (stateColors[selectedInfo.color]||stateColors.blue).stroke }} />
              <h4 className="text-sm font-bold text-white">{selectedInfo.label}</h4>
              {selectedInfo.type && selectedInfo.type !== "normal" && (
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{
                  background: selectedInfo.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                  color: selectedInfo.type === "error" ? "#EF4444" : "#22C55E",
                }}>{selectedInfo.type === "start" ? "Initial" : selectedInfo.type === "error" ? "Error" : selectedInfo.type}</span>
              )}
              <button onClick={() => setSelectedNode(null)} className="ml-auto text-zinc-600 hover:text-white transition-colors cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>

            {selectedInfo.info.description && <p className="text-xs text-zinc-400 leading-relaxed mb-3">{selectedInfo.info.description}</p>}

            {selectedInfo.info.duration && (
              <div className="mb-3 flex items-center gap-1.5">
                <span className="text-[9px] text-zinc-600">⏱</span>
                <span className="text-[10px] font-mono text-zinc-400">{selectedInfo.info.duration}</span>
              </div>
            )}

            {selectedInfo.info.canSelfHeal && (
              <div className="mb-3 text-[10px] px-2 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                ↻ Self-healing enabled
              </div>
            )}

            {selectedInfo.info.entryActions && selectedInfo.info.entryActions.length > 0 && (
              <div className="mb-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Entry actions</p>
                <ul className="space-y-0.5">
                  {selectedInfo.info.entryActions.map((a, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-[10px] font-mono text-blue-400"><span className="text-[8px]">→</span>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedInfo.info.exitActions && selectedInfo.info.exitActions.length > 0 && (
              <div className="mb-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Exit actions</p>
                <ul className="space-y-0.5">
                  {selectedInfo.info.exitActions.map((a, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400"><span className="text-[8px]">←</span>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedInfo.info.invariants && selectedInfo.info.invariants.length > 0 && (
              <div className="mb-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Invariants</p>
                <ul className="space-y-0.5">
                  {selectedInfo.info.invariants.map((inv, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[10px] text-zinc-400"><span className="mt-0.5 w-1 h-1 rounded-full bg-purple-500 shrink-0" />{inv}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-3 border-t border-zinc-800">
              <div className="flex gap-3 text-center">
                <div><p className="text-sm font-bold text-blue-400">{transitions.filter(t => t.to === selectedInfo.id).length}</p><p className="text-[9px] text-zinc-600">Incoming</p></div>
                <div><p className="text-sm font-bold text-purple-400">{transitions.filter(t => t.from === selectedInfo.id).length}</p><p className="text-[9px] text-zinc-600">Outgoing</p></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-[10px] text-zinc-600 text-center mt-3">
        Click a state to see its details · Hover a transition for its conditions
      </p>
    </div>
  );
}
