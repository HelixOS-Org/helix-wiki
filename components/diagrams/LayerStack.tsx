"use client";

import { useState, useCallback, useId } from "react";

interface Layer {
  label: string;
  detail: string;
  color: string;
  description?: string;
  /** Rich layer information */
  info?: {
    components?: string[];
    metrics?: { label: string; value: string; color?: string }[];
    api?: string[];
    dependencies?: string[];
    status?: "active" | "passive" | "critical";
  };
}

interface LayerStackProps {
  layers: Layer[];
  title?: string;
}

const colorMap: Record<string, { bg: string; border: string; glow: string; text: string; hoverBg: string; gradient: string }> = {
  blue:    { bg: "rgba(74,144,226,0.12)",  border: "rgba(74,144,226,0.4)",  glow: "rgba(74,144,226,0.15)",  text: "#4A90E2",  hoverBg: "rgba(74,144,226,0.22)", gradient: "from-blue-500/20 to-blue-600/5" },
  purple:  { bg: "rgba(123,104,238,0.12)", border: "rgba(123,104,238,0.4)", glow: "rgba(123,104,238,0.15)", text: "#7B68EE",  hoverBg: "rgba(123,104,238,0.22)", gradient: "from-purple-500/20 to-purple-600/5" },
  cyan:    { bg: "rgba(34,211,238,0.12)",  border: "rgba(34,211,238,0.4)",  glow: "rgba(34,211,238,0.15)",  text: "#22D3EE",  hoverBg: "rgba(34,211,238,0.22)", gradient: "from-cyan-500/20 to-cyan-600/5" },
  amber:   { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.4)",  glow: "rgba(245,158,11,0.15)",  text: "#F59E0B",  hoverBg: "rgba(245,158,11,0.22)", gradient: "from-amber-500/20 to-amber-600/5" },
  green:   { bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.4)",   glow: "rgba(34,197,94,0.15)",   text: "#22C55E",  hoverBg: "rgba(34,197,94,0.22)", gradient: "from-green-500/20 to-green-600/5" },
  pink:    { bg: "rgba(236,72,153,0.12)",  border: "rgba(236,72,153,0.4)",  glow: "rgba(236,72,153,0.15)",  text: "#EC4899",  hoverBg: "rgba(236,72,153,0.22)", gradient: "from-pink-500/20 to-pink-600/5" },
  rose:    { bg: "rgba(244,63,94,0.12)",   border: "rgba(244,63,94,0.4)",   glow: "rgba(244,63,94,0.15)",   text: "#F43F5E",  hoverBg: "rgba(244,63,94,0.22)", gradient: "from-rose-500/20 to-rose-600/5" },
  orange:  { bg: "rgba(249,115,22,0.12)",  border: "rgba(249,115,22,0.4)",  glow: "rgba(249,115,22,0.15)",  text: "#F97316",  hoverBg: "rgba(249,115,22,0.22)", gradient: "from-orange-500/20 to-orange-600/5" },
  zinc:    { bg: "rgba(161,161,170,0.08)", border: "rgba(161,161,170,0.3)", glow: "rgba(161,161,170,0.08)", text: "#A1A1AA",  hoverBg: "rgba(161,161,170,0.15)", gradient: "from-zinc-400/20 to-zinc-500/5" },
  indigo:  { bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.4)",  glow: "rgba(99,102,241,0.15)",  text: "#6366F1",  hoverBg: "rgba(99,102,241,0.22)", gradient: "from-indigo-500/20 to-indigo-600/5" },
  emerald: { bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.4)",  glow: "rgba(52,211,153,0.15)",  text: "#34D399",  hoverBg: "rgba(52,211,153,0.22)", gradient: "from-emerald-500/20 to-emerald-600/5" },
  teal:    { bg: "rgba(20,184,166,0.12)",  border: "rgba(20,184,166,0.4)",  glow: "rgba(20,184,166,0.15)",  text: "#14B8A6",  hoverBg: "rgba(20,184,166,0.22)", gradient: "from-teal-500/20 to-teal-600/5" },
};

const statusIcons: Record<string, { icon: string; label: string; color: string }> = {
  active:   { icon: "●", label: "Actif",    color: "#22C55E" },
  passive:  { icon: "○", label: "Passif",   color: "#F59E0B" },
  critical: { icon: "◆", label: "Critique", color: "#EF4444" },
};

export default function LayerStack({ layers, title }: LayerStackProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<Set<number>>(new Set());
  const uid = useId().replace(/:/g, "");

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => s === null ? 0 : Math.min(s + 1, layers.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelected(s => s === null ? layers.length - 1 : Math.max(s - 1, 0)); }
    else if (e.key === "Escape") { setSelected(null); setExpandedDetails(new Set()); }
    else if (e.key === "Enter" && selected !== null) {
      setExpandedDetails(prev => { const next = new Set(prev); if (next.has(selected)) next.delete(selected); else next.add(selected); return next; });
    }
  }, [layers.length, selected]);

  const toggleDetails = useCallback((i: number) => {
    setExpandedDetails(prev => { const next = new Set(prev); if (next.has(i)) next.delete(i); else next.add(i); return next; });
    setSelected(i);
  }, []);

  return (
    <div className="my-8" onKeyDown={handleKey} tabIndex={0} role="list" aria-label={title || "Layer stack"}>
      <style>{`
        @keyframes dataFlow${uid}{0%{background-position:0% 0%}100%{background-position:0% 200%}}
        @keyframes expandIn${uid}{0%{opacity:0;max-height:0;transform:translateY(-8px)}100%{opacity:1;max-height:600px;transform:translateY(0)}}
        @keyframes pulseBar${uid}{0%,100%{opacity:0.5}50%{opacity:1}}
      `}</style>

      {/* Header */}
      {title && (
        <div className="flex items-center gap-3 mb-5 max-w-2xl mx-auto">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{title}</p>
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent" />
          <span className="text-[10px] font-mono text-zinc-600">{layers.length} couches</span>
        </div>
      )}

      <div className="relative max-w-2xl mx-auto">
        {/* Animated vertical data flow line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 z-0 overflow-hidden rounded-full">
          <div className="w-full h-[200%]" style={{
            background: "linear-gradient(to bottom, transparent, rgba(74,144,226,0.6), rgba(123,104,238,0.6), rgba(34,211,238,0.6), transparent, transparent)",
            backgroundSize: "100% 50%",
            animation: `dataFlow${uid} 3s linear infinite`,
          }} />
        </div>

        {/* Layer depth indicator (left side) */}
        <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col items-center justify-between py-4 z-0">
          <span className="text-[8px] font-mono text-zinc-700 -rotate-90 whitespace-nowrap">USER SPACE</span>
          <div className="flex-1 w-px mx-auto bg-gradient-to-b from-zinc-800 to-zinc-700/30" />
          <span className="text-[8px] font-mono text-zinc-700 -rotate-90 whitespace-nowrap">HARDWARE</span>
        </div>

        <div className="relative z-10 flex flex-col gap-1 pl-8">
          {layers.map((layer, i) => {
            const c = colorMap[layer.color] || colorMap.blue;
            const isSelected = selected === i;
            const isHovered = hovered === i;
            const isDimmed = (selected !== null || hovered !== null) && !isSelected && !isHovered;
            const isExpanded = expandedDetails.has(i);
            const hasInfo = !!(layer.info || layer.description);
            const statusInfo = layer.info?.status ? statusIcons[layer.info.status] : null;

            return (
              <div key={i} role="listitem">
                <div
                  className="relative rounded-lg border px-5 py-3 flex items-center justify-between cursor-pointer select-none group"
                  onClick={() => toggleDetails(i)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: isSelected || isHovered ? c.hoverBg : c.bg,
                    borderColor: isSelected ? c.text : c.border,
                    boxShadow: isSelected ? `0 0 30px ${c.glow}, 0 0 60px ${c.glow}` : `0 0 20px ${c.glow}`,
                    opacity: isDimmed ? 0.35 : 1,
                    transform: isSelected ? "scale(1.03)" : isHovered ? "scale(1.02)" : "scale(1)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {isSelected && (
                    <div className="absolute inset-0 rounded-lg border-2 animate-ping pointer-events-none" style={{ borderColor: c.text, opacity: 0.2 }} />
                  )}

                  <div className="flex items-center gap-3">
                    {/* Layer depth badge */}
                    <span className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border"
                          style={{ borderColor: c.border, color: c.text, background: c.bg }}>
                      {i}
                    </span>

                    {/* Status indicator */}
                    {statusInfo && (
                      <span className="text-[10px]" style={{ color: statusInfo.color }} title={statusInfo.label}>
                        {statusInfo.icon}
                      </span>
                    )}

                    <div>
                      <span className="font-semibold text-sm text-white">{layer.label}</span>
                      {/* Quick info badges */}
                      {layer.info?.components && (
                        <span className="ml-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/60 text-zinc-500 border border-zinc-700/40">
                          {layer.info.components.length} modules
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: c.text }}>{layer.detail}</span>

                    {/* Info indicator */}
                    {hasInfo && (
                      <span className="text-[9px] text-zinc-600 group-hover:text-zinc-400 transition-colors">ⓘ</span>
                    )}

                    {/* Expand chevron */}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                         style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>
                      <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke={c.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  {/* Connector dot */}
                  {i < layers.length - 1 && (
                    <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full z-20"
                         style={{ background: c.border, boxShadow: `0 0 6px ${c.glow}` }} />
                  )}
                </div>

                {/* Expandable rich detail panel */}
                <div style={{
                  maxHeight: isExpanded && hasInfo ? "600px" : "0px",
                  opacity: isExpanded && hasInfo ? 1 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
                }}>
                  <div className="mx-4 mt-1 mb-2 rounded-lg border overflow-hidden" style={{ borderColor: c.border, background: "rgba(0,0,0,0.3)" }}>
                    {/* Description */}
                    {layer.description && (
                      <div className="px-4 py-3 text-xs leading-relaxed text-zinc-400 border-b" style={{ borderColor: `${c.border}40` }}>
                        {layer.description}
                      </div>
                    )}

                    {layer.info && (
                      <div className="p-4 space-y-3">
                        {/* Metrics */}
                        {layer.info.metrics && layer.info.metrics.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-2">Métriques</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                              {layer.info.metrics.map((m, mi) => (
                                <div key={mi} className="bg-zinc-800/40 rounded-md px-3 py-2 border border-zinc-700/30">
                                  <p className="text-[9px] text-zinc-600 uppercase">{m.label}</p>
                                  <p className="text-sm font-bold" style={{ color: m.color || c.text }}>{m.value}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Components */}
                        {layer.info.components && layer.info.components.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-2">Composants</p>
                            <div className="flex flex-wrap gap-1.5">
                              {layer.info.components.map((comp, ci) => (
                                <span key={ci} className="text-[10px] font-mono px-2 py-1 rounded-md border" style={{ background: c.bg, borderColor: c.border, color: c.text }}>
                                  {comp}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* API */}
                        {layer.info.api && layer.info.api.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-2">API exposée</p>
                            <ul className="space-y-0.5">
                              {layer.info.api.map((a, ai) => (
                                <li key={ai} className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                                  <span className="w-1 h-1 rounded-full" style={{ background: c.text }} />
                                  {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Dependencies */}
                        {layer.info.dependencies && layer.info.dependencies.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-2">Dépendances</p>
                            <div className="flex flex-wrap gap-1">
                              {layer.info.dependencies.map((dep, di) => (
                                <span key={di} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/60 text-zinc-500 border border-zinc-700/30">
                                  {dep}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-6 text-[10px] text-zinc-600">
            <span>↑↓ naviguer</span>
            <span>Entrée développer</span>
            <span>Esc fermer</span>
            <span className="text-zinc-700">·</span>
            <span>Cliquer une couche pour voir les détails</span>
          </div>
        </div>
      </div>
    </div>
  );
}
