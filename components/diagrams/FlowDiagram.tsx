"use client";

import { useState, useId } from "react";

interface FlowNode {
  label: string;
  color: string;
  tooltip?: string;
}

interface FlowPhase {
  title: string;
  color: string;
  nodes: FlowNode[];
}

interface FlowDiagramProps {
  phases: FlowPhase[];
  note?: string;
}

const phaseColors: Record<string, { bg: string; border: string; text: string; dot: string; hoverBg: string }> = {
  blue:    { bg: "rgba(74,144,226,0.1)",  border: "rgba(74,144,226,0.3)",  text: "#4A90E2",  dot: "#4A90E2",  hoverBg: "rgba(74,144,226,0.25)" },
  purple:  { bg: "rgba(123,104,238,0.1)", border: "rgba(123,104,238,0.3)", text: "#7B68EE",  dot: "#7B68EE",  hoverBg: "rgba(123,104,238,0.25)" },
  cyan:    { bg: "rgba(34,211,238,0.1)",  border: "rgba(34,211,238,0.3)",  text: "#22D3EE",  dot: "#22D3EE",  hoverBg: "rgba(34,211,238,0.25)" },
  amber:   { bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)",  text: "#F59E0B",  dot: "#F59E0B",  hoverBg: "rgba(245,158,11,0.25)" },
  green:   { bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)",   text: "#22C55E",  dot: "#22C55E",  hoverBg: "rgba(34,197,94,0.25)" },
  emerald: { bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.3)",  text: "#34D399",  dot: "#34D399",  hoverBg: "rgba(52,211,153,0.25)" },
};

export default function FlowDiagram({ phases, note }: FlowDiagramProps) {
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const uid = useId().replace(/:/g, "");

  return (
    <div className="my-8">
      {/* CSS for flowing particle animation */}
      <style>{`
        @keyframes flowParticle${uid} {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>

      <div className="relative overflow-x-auto pb-4">
        <div className="flex items-stretch gap-0 min-w-max">
          {phases.map((phase, pi) => {
            const c = phaseColors[phase.color] || phaseColors.blue;
            const isActive = selectedPhase === null || selectedPhase === pi;
            const isSelected = selectedPhase === pi;

            return (
              <div key={pi} className="flex items-stretch">
                {/* Phase column */}
                <div className="flex flex-col items-center min-w-[160px]"
                     style={{ opacity: isActive ? 1 : 0.25, transition: "opacity 0.3s" }}>
                  {/* Phase header */}
                  <div
                    className="rounded-lg border px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-wider cursor-pointer select-none"
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
                    </span>
                  </div>

                  {/* Nodes */}
                  <div className="flex flex-col gap-2 w-full px-2">
                    {phase.nodes.map((node, ni) => {
                      const nc = phaseColors[node.color] || phaseColors.blue;
                      const nodeId = `${pi}-${ni}`;
                      const isNodeHovered = hoveredNode === nodeId;

                      return (
                        <div key={ni} className="relative">
                          <div
                            className="rounded-md border px-3 py-2 text-center text-sm font-medium cursor-pointer select-none"
                            onClick={() => setSelectedPhase(isSelected ? null : pi)}
                            onMouseEnter={() => setHoveredNode(nodeId)}
                            onMouseLeave={() => setHoveredNode(null)}
                            style={{
                              background: isNodeHovered ? nc.hoverBg : nc.bg,
                              borderColor: isNodeHovered ? nc.text : nc.border,
                              color: nc.text,
                              boxShadow: isNodeHovered ? `0 0 20px ${nc.bg}` : `0 0 12px ${nc.bg}`,
                              transform: isNodeHovered ? "scale(1.08)" : "scale(1)",
                              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                          >
                            {node.label}
                          </div>

                          {/* Tooltip */}
                          {node.tooltip && isNodeHovered && (
                            <div className="absolute z-50 left-1/2 -translate-x-1/2 -top-2 -translate-y-full pointer-events-none"
                                 style={{ animation: "fadeIn 0.15s ease" }}>
                              <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-[11px] text-zinc-300 shadow-xl whitespace-nowrap max-w-[240px]">
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

                {/* Animated arrow connector between phases */}
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
                      {/* Base line */}
                      <line x1="0" y1="10" x2="38" y2="10" stroke={`url(#ag-${uid}-${pi})`} strokeWidth="2" strokeOpacity="0.3" />
                      {/* Animated flowing particles */}
                      <line x1="0" y1="10" x2="38" y2="10"
                        stroke={`url(#ag-${uid}-${pi})`} strokeWidth="2"
                        strokeDasharray="4 20"
                        style={{ animation: `flowParticle${uid} 1s linear infinite` }} />
                      <polygon points="36,5 44,10 36,15" fill={(phaseColors[phases[pi+1].color] || phaseColors.blue).dot} opacity="0.8" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <button
          onClick={() => setSelectedPhase(null)}
          className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          {selectedPhase !== null ? "✕ Réinitialiser" : "Cliquer sur une phase pour isoler"}
        </button>
      </div>

      {note && <p className="text-xs text-zinc-500 text-center mt-2 italic">{note}</p>}
    </div>
  );
}
