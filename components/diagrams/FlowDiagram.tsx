"use client";

import { useState, useId } from "react";

interface FlowNode {
  label: string;
  color: string;
  tooltip?: string;
  /** Rich node info */
  info?: {
    description?: string;
    duration?: string;
    priority?: "critical" | "high" | "normal" | "low";
    dependencies?: string[];
    outputs?: string[];
    errorHandler?: string;
  };
}

interface FlowPhase {
  title: string;
  color: string;
  nodes: FlowNode[];
  /** Phase description shown when selected */
  description?: string;
}

interface FlowDiagramProps {
  phases: FlowPhase[];
  note?: string;
  title?: string;
}

const phaseColors: Record<string, { bg: string; border: string; text: string; dot: string; hoverBg: string; gradientFrom: string; gradientTo: string }> = {
  blue:    { bg: "rgba(74,144,226,0.1)",  border: "rgba(74,144,226,0.3)",  text: "#4A90E2",  dot: "#4A90E2",  hoverBg: "rgba(74,144,226,0.25)", gradientFrom: "rgba(74,144,226,0.15)", gradientTo: "rgba(74,144,226,0)" },
  purple:  { bg: "rgba(123,104,238,0.1)", border: "rgba(123,104,238,0.3)", text: "#7B68EE",  dot: "#7B68EE",  hoverBg: "rgba(123,104,238,0.25)", gradientFrom: "rgba(123,104,238,0.15)", gradientTo: "rgba(123,104,238,0)" },
  cyan:    { bg: "rgba(34,211,238,0.1)",  border: "rgba(34,211,238,0.3)",  text: "#22D3EE",  dot: "#22D3EE",  hoverBg: "rgba(34,211,238,0.25)", gradientFrom: "rgba(34,211,238,0.15)", gradientTo: "rgba(34,211,238,0)" },
  amber:   { bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)",  text: "#F59E0B",  dot: "#F59E0B",  hoverBg: "rgba(245,158,11,0.25)", gradientFrom: "rgba(245,158,11,0.15)", gradientTo: "rgba(245,158,11,0)" },
  green:   { bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)",   text: "#22C55E",  dot: "#22C55E",  hoverBg: "rgba(34,197,94,0.25)", gradientFrom: "rgba(34,197,94,0.15)", gradientTo: "rgba(34,197,94,0)" },
  emerald: { bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.3)",  text: "#34D399",  dot: "#34D399",  hoverBg: "rgba(52,211,153,0.25)", gradientFrom: "rgba(52,211,153,0.15)", gradientTo: "rgba(52,211,153,0)" },
};

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "Critique", color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
  high:     { label: "Haute",    color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  normal:   { label: "Normal",   color: "#22C55E", bg: "rgba(34,197,94,0.15)" },
  low:      { label: "Basse",    color: "#6366F1", bg: "rgba(99,102,241,0.15)" },
};

export default function FlowDiagram({ phases, note, title }: FlowDiagramProps) {
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const uid = useId().replace(/:/g, "");

  const totalNodes = phases.reduce((a, p) => a + p.nodes.length, 0);
  let globalStepCounter = 0;

  return (
    <div className="my-8">
      <style>{`
        @keyframes flowParticle${uid}{0%{stroke-dashoffset:24}100%{stroke-dashoffset:0}}
        @keyframes expandIn${uid}{0%{opacity:0;max-height:0}100%{opacity:1;max-height:300px}}
        @keyframes progressPulse${uid}{0%,100%{opacity:0.6}50%{opacity:1}}
      `}</style>

      {/* Title */}
      {title && (
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-green-500" />
          <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent" />
          <span className="text-[10px] font-mono text-zinc-600">{phases.length} phases · {totalNodes} étapes</span>
        </div>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-1 mb-4 px-1">
        {phases.map((phase, pi) => {
          const c = phaseColors[phase.color] || phaseColors.blue;
          const isActive = selectedPhase === null || selectedPhase === pi;
          return (
            <div key={pi} className="flex-1 flex flex-col items-center gap-1" style={{ opacity: isActive ? 1 : 0.3, transition: "opacity 0.3s" }}>
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: `${c.border}30` }}>
                <div className="h-full rounded-full" style={{ width: "100%", background: c.dot, opacity: 0.7, animation: isActive ? `progressPulse${uid} 2s ease-in-out infinite` : "none" }} />
              </div>
              <span className="text-[8px] font-mono" style={{ color: c.text }}>{phase.title}</span>
            </div>
          );
        })}
      </div>

      <div className="relative overflow-x-auto pb-4">
        <div className="flex items-stretch gap-0 min-w-max">
          {phases.map((phase, pi) => {
            const c = phaseColors[phase.color] || phaseColors.blue;
            const isActive = selectedPhase === null || selectedPhase === pi;
            const isSelected = selectedPhase === pi;

            return (
              <div key={pi} className="flex items-stretch">
                <div className="flex flex-col items-center min-w-[180px]"
                     style={{ opacity: isActive ? 1 : 0.2, transition: "opacity 0.3s" }}>
                  {/* Phase header */}
                  <div
                    className="rounded-lg border px-4 py-2 mb-3 text-xs font-bold uppercase tracking-wider cursor-pointer select-none relative"
                    onClick={() => setSelectedPhase(isSelected ? null : pi)}
                    style={{
                      background: isSelected ? c.hoverBg : c.bg,
                      borderColor: isSelected ? c.text : c.border,
                      color: c.text,
                      boxShadow: isSelected ? `0 0 20px ${c.bg}` : "none",
                      transform: isSelected ? "scale(1.08)" : "scale(1)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot, boxShadow: isSelected ? `0 0 8px ${c.dot}` : "none" }} />
                      {phase.title}
                      <span className="text-[9px] font-normal opacity-60 ml-1">({phase.nodes.length})</span>
                    </span>
                  </div>

                  {/* Phase description */}
                  {isSelected && phase.description && (
                    <div className="w-full px-2 mb-3" style={{ animation: `expandIn${uid} 0.3s ease` }}>
                      <div className="text-[10px] text-zinc-400 bg-zinc-900/80 border rounded-md px-3 py-2 leading-relaxed" style={{ borderColor: c.border }}>
                        {phase.description}
                      </div>
                    </div>
                  )}

                  {/* Nodes */}
                  <div className="flex flex-col gap-2 w-full px-2">
                    {phase.nodes.map((node, ni) => {
                      const nc = phaseColors[node.color] || phaseColors.blue;
                      const nodeId = `${pi}-${ni}`;
                      const isNodeHovered = hoveredNode === nodeId;
                      const isNodeExpanded = expandedNode === nodeId;
                      const stepNum = ++globalStepCounter;
                      const priority = node.info?.priority ? priorityConfig[node.info.priority] : null;

                      return (
                        <div key={ni} className="relative">
                          <div
                            className="rounded-md border px-3 py-2.5 text-center text-sm font-medium cursor-pointer select-none relative"
                            onClick={() => setExpandedNode(isNodeExpanded ? null : nodeId)}
                            onMouseEnter={() => setHoveredNode(nodeId)}
                            onMouseLeave={() => setHoveredNode(null)}
                            style={{
                              background: isNodeHovered || isNodeExpanded ? nc.hoverBg : nc.bg,
                              borderColor: isNodeHovered || isNodeExpanded ? nc.text : nc.border,
                              color: nc.text,
                              boxShadow: isNodeHovered || isNodeExpanded ? `0 0 20px ${nc.bg}` : `0 0 12px ${nc.bg}`,
                              transform: isNodeHovered ? "scale(1.05)" : "scale(1)",
                              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                          >
                            {/* Step number */}
                            <span className="absolute -left-1 -top-1 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center border"
                                  style={{ background: "rgba(0,0,0,0.8)", borderColor: nc.border, color: nc.text }}>
                              {stepNum}
                            </span>

                            {/* Priority dot */}
                            {priority && (
                              <span className="absolute -right-1 -top-1 w-3 h-3 rounded-full" style={{ background: priority.color }} title={priority.label}>
                                <span className="absolute inset-0 rounded-full animate-ping" style={{ background: priority.color, opacity: 0.3 }} />
                              </span>
                            )}

                            {node.label}

                            {/* Info indicator */}
                            {node.info && (
                              <span className="ml-1.5 text-[9px] opacity-50">ⓘ</span>
                            )}
                          </div>

                          {/* Expanded detail panel */}
                          {isNodeExpanded && node.info && (
                            <div className="mt-1 bg-zinc-900/90 border rounded-lg overflow-hidden" style={{ borderColor: nc.border, animation: `expandIn${uid} 0.3s ease` }}>
                              {node.info.description && (
                                <div className="px-3 py-2 text-[11px] text-zinc-400 leading-relaxed border-b" style={{ borderColor: `${nc.border}40` }}>
                                  {node.info.description}
                                </div>
                              )}
                              <div className="px-3 py-2 space-y-2">
                                {node.info.duration && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] text-zinc-600">⏱</span>
                                    <span className="text-[10px] font-mono text-zinc-400">{node.info.duration}</span>
                                  </div>
                                )}
                                {priority && (
                                  <span className="inline-block text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: priority.bg, color: priority.color }}>
                                    Priorité: {priority.label}
                                  </span>
                                )}
                                {node.info.dependencies && node.info.dependencies.length > 0 && (
                                  <div>
                                    <p className="text-[9px] font-bold uppercase text-zinc-600 mb-1">Requiert</p>
                                    <div className="flex flex-wrap gap-1">
                                      {node.info.dependencies.map((d, di) => (
                                        <span key={di} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/60 text-zinc-500 border border-zinc-700/30">{d}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {node.info.outputs && node.info.outputs.length > 0 && (
                                  <div>
                                    <p className="text-[9px] font-bold uppercase text-zinc-600 mb-1">Produit</p>
                                    <div className="flex flex-wrap gap-1">
                                      {node.info.outputs.map((o, oi) => (
                                        <span key={oi} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/60 text-emerald-500 border border-emerald-700/30">{o}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {node.info.errorHandler && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] text-red-500">⚠</span>
                                    <span className="text-[10px] font-mono text-red-400/80">{node.info.errorHandler}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Tooltip */}
                          {node.tooltip && isNodeHovered && !isNodeExpanded && (
                            <div className="absolute z-50 left-1/2 -translate-x-1/2 -top-2 -translate-y-full pointer-events-none" style={{ animation: "fadeIn 0.15s ease" }}>
                              <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-[11px] text-zinc-300 shadow-xl whitespace-nowrap max-w-[260px]">
                                {node.tooltip}
                              </div>
                              <div className="w-2 h-2 bg-zinc-900 border-r border-b border-zinc-700 rotate-45 mx-auto -mt-1" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Arrow connector */}
                {pi < phases.length - 1 && (
                  <div className="flex items-center px-2 self-center"
                       style={{ opacity: isActive && (selectedPhase === null || selectedPhase === pi + 1 || selectedPhase === pi) ? 1 : 0.2, transition: "opacity 0.3s" }}>
                    <svg width="48" height="20" viewBox="0 0 48 20" fill="none">
                      <defs>
                        <linearGradient id={`ag-${uid}-${pi}`} x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor={c.dot} stopOpacity="0.7" />
                          <stop offset="100%" stopColor={(phaseColors[phases[pi+1].color] || phaseColors.blue).dot} stopOpacity="0.7" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="10" x2="38" y2="10" stroke={`url(#ag-${uid}-${pi})`} strokeWidth="2" strokeOpacity="0.3" />
                      <line x1="0" y1="10" x2="38" y2="10" stroke={`url(#ag-${uid}-${pi})`} strokeWidth="2" strokeDasharray="4 20" style={{ animation: `flowParticle${uid} 1s linear infinite` }} />
                      <polygon points="36,5 44,10 36,15" fill={(phaseColors[phases[pi+1].color] || phaseColors.blue).dot} opacity="0.8" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <button onClick={() => setSelectedPhase(null)} className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
          {selectedPhase !== null ? "✕ Réinitialiser" : "Cliquer sur une phase pour isoler · Cliquer un nœud pour les détails"}
        </button>
      </div>

      {note && <p className="text-xs text-zinc-500 text-center mt-2 italic">{note}</p>}
    </div>
  );
}
