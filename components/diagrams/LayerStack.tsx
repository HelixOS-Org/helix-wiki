"use client";

import { useState, useCallback } from "react";

interface Layer {
  label: string;
  detail: string;
  color: string;
  description?: string;
}

interface LayerStackProps {
  layers: Layer[];
  title?: string;
}

const colorMap: Record<string, { bg: string; border: string; glow: string; text: string; hoverBg: string }> = {
  blue:    { bg: "rgba(74,144,226,0.12)",  border: "rgba(74,144,226,0.4)",  glow: "rgba(74,144,226,0.15)",  text: "#4A90E2",  hoverBg: "rgba(74,144,226,0.22)" },
  purple:  { bg: "rgba(123,104,238,0.12)", border: "rgba(123,104,238,0.4)", glow: "rgba(123,104,238,0.15)", text: "#7B68EE",  hoverBg: "rgba(123,104,238,0.22)" },
  cyan:    { bg: "rgba(34,211,238,0.12)",  border: "rgba(34,211,238,0.4)",  glow: "rgba(34,211,238,0.15)",  text: "#22D3EE",  hoverBg: "rgba(34,211,238,0.22)" },
  amber:   { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.4)",  glow: "rgba(245,158,11,0.15)",  text: "#F59E0B",  hoverBg: "rgba(245,158,11,0.22)" },
  green:   { bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.4)",   glow: "rgba(34,197,94,0.15)",   text: "#22C55E",  hoverBg: "rgba(34,197,94,0.22)" },
  pink:    { bg: "rgba(236,72,153,0.12)",  border: "rgba(236,72,153,0.4)",  glow: "rgba(236,72,153,0.15)",  text: "#EC4899",  hoverBg: "rgba(236,72,153,0.22)" },
  rose:    { bg: "rgba(244,63,94,0.12)",   border: "rgba(244,63,94,0.4)",   glow: "rgba(244,63,94,0.15)",   text: "#F43F5E",  hoverBg: "rgba(244,63,94,0.22)" },
  orange:  { bg: "rgba(249,115,22,0.12)",  border: "rgba(249,115,22,0.4)",  glow: "rgba(249,115,22,0.15)",  text: "#F97316",  hoverBg: "rgba(249,115,22,0.22)" },
  zinc:    { bg: "rgba(161,161,170,0.08)", border: "rgba(161,161,170,0.3)", glow: "rgba(161,161,170,0.08)", text: "#A1A1AA",  hoverBg: "rgba(161,161,170,0.15)" },
  indigo:  { bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.4)",  glow: "rgba(99,102,241,0.15)",  text: "#6366F1",  hoverBg: "rgba(99,102,241,0.22)" },
  emerald: { bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.4)",  glow: "rgba(52,211,153,0.15)",  text: "#34D399",  hoverBg: "rgba(52,211,153,0.22)" },
  teal:    { bg: "rgba(20,184,166,0.12)",  border: "rgba(20,184,166,0.4)",  glow: "rgba(20,184,166,0.15)",  text: "#14B8A6",  hoverBg: "rgba(20,184,166,0.22)" },
};

export default function LayerStack({ layers, title }: LayerStackProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => s === null ? 0 : Math.min(s + 1, layers.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelected(s => s === null ? layers.length - 1 : Math.max(s - 1, 0)); }
    else if (e.key === "Escape") setSelected(null);
    else if (e.key === "Enter") { /* toggle = keep selected to show detail */ }
  }, [layers.length]);

  return (
    <div className="my-8" onKeyDown={handleKey} tabIndex={0} role="list" aria-label={title || "Layer stack"}>
      {title && <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4 text-center">{title}</p>}
      <div className="relative max-w-2xl mx-auto">
        {/* Vertical connecting line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 z-0"
             style={{ background: "linear-gradient(to bottom, transparent, rgba(74,144,226,0.3) 10%, rgba(123,104,238,0.3) 90%, transparent)" }} />

        <div className="relative z-10 flex flex-col gap-1">
          {layers.map((layer, i) => {
            const c = colorMap[layer.color] || colorMap.blue;
            const isSelected = selected === i;
            const isHovered = hovered === i;
            const isDimmed = (selected !== null || hovered !== null) && !isSelected && !isHovered;

            return (
              <div key={i} role="listitem">
                <div
                  className="relative rounded-lg border px-5 py-3 flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setSelected(isSelected ? null : i)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: isSelected || isHovered ? c.hoverBg : c.bg,
                    borderColor: isSelected ? c.text : c.border,
                    boxShadow: isSelected ? `0 0 30px ${c.glow}, 0 0 60px ${c.glow}` : `0 0 20px ${c.glow}`,
                    opacity: isDimmed ? 0.4 : 1,
                    transform: isSelected ? "scale(1.03)" : isHovered ? "scale(1.02)" : "scale(1)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {/* Pulse ring when selected */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-lg border-2 animate-ping pointer-events-none"
                         style={{ borderColor: c.text, opacity: 0.2 }} />
                  )}

                  <div className="flex items-center gap-3">
                    {/* Layer index badge */}
                    <span className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border"
                          style={{ borderColor: c.border, color: c.text, background: c.bg }}>
                      {i}
                    </span>
                    <span className="font-semibold text-sm text-white">{layer.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: c.text }}>{layer.detail}</span>
                    {/* Expand chevron */}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                         style={{ transform: isSelected ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>
                      <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke={c.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  {/* Connector dot */}
                  {i < layers.length - 1 && (
                    <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full z-20"
                         style={{ background: c.border, boxShadow: `0 0 6px ${c.glow}` }} />
                  )}
                </div>

                {/* Expandable detail panel */}
                <div style={{
                  maxHeight: isSelected && layer.description ? "200px" : "0px",
                  opacity: isSelected && layer.description ? 1 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
                }}>
                  {layer.description && (
                    <div className="mx-4 mt-1 mb-2 px-4 py-3 rounded-md border text-xs leading-relaxed"
                         style={{ background: c.bg, borderColor: c.border, color: "#d4d4d8" }}>
                      {layer.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Keyboard hint */}
        <p className="text-[10px] text-zinc-600 text-center mt-3">↑↓ naviguer · Entrée sélectionner · Esc fermer</p>
      </div>
    </div>
  );
}
