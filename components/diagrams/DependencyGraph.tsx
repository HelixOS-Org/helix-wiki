"use client";

import { useState, useCallback, useMemo, useId, useRef, useEffect } from "react";

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
  info?: {
    description?: string;
    stats?: { label: string; value: string }[];
    features?: string[];
    status?: "stable" | "wip" | "planned" | "experimental";
    version?: string;
    loc?: string;
    deps?: number;
  };
}

interface GraphEdge {
  from: string;
  to: string;
  label?: string;
  type?: "strong" | "weak" | "optional";
}

interface DependencyGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width?: number;
  height?: number;
  title?: string;
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

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  stable:       { label: "Stable",       color: "#22C55E", bg: "rgba(34,197,94,0.15)" },
  wip:          { label: "WIP",          color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  planned:      { label: "Planned",      color: "#6366F1", bg: "rgba(99,102,241,0.15)" },
  experimental: { label: "Experimental", color: "#EC4899", bg: "rgba(236,72,153,0.15)" },
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
    if (dy > 0) { sy = from.y + from.height; ey = to.y; } else { sy = from.y; ey = to.y + to.height; }
    const ratioS = (sy - fc.y) / dy;
    sx = fc.x + dx * ratioS;
    sx = Math.max(from.x, Math.min(from.x + from.width, sx));
    const ratioE = (ey - tc.y) / dy;
    ex = tc.x + dx * ratioE;
    ex = Math.max(to.x, Math.min(to.x + to.width, ex));
  } else {
    if (dx > 0) { sx = from.x + from.width; ex = to.x; } else { sx = from.x; ex = to.x + to.width; }
  }
  return { sx, sy, ex, ey };
}

export default function DependencyGraph({ nodes, edges, width = 820, height = 620, title }: DependencyGraphProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapDrag = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { panRef.current = panOffset; }, [panOffset]);
  const uid = useId().replace(/:/g, "");
  const minimapW = 150;
  const minimapH = 150 * height / width;

  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  const { ancestors, descendants } = useMemo(() => {
    const childrenOf = new Map<string, Set<string>>();
    const parentsOf = new Map<string, Set<string>>();
    for (const n of nodes) { childrenOf.set(n.id, new Set()); parentsOf.set(n.id, new Set()); }
    for (const e of edges) { childrenOf.get(e.from)?.add(e.to); parentsOf.get(e.to)?.add(e.from); }
    function collectDown(id: string, visited: Set<string>): Set<string> {
      if (visited.has(id)) return visited; visited.add(id);
      for (const c of childrenOf.get(id) || []) collectDown(c, visited); return visited;
    }
    function collectUp(id: string, visited: Set<string>): Set<string> {
      if (visited.has(id)) return visited; visited.add(id);
      for (const p of parentsOf.get(id) || []) collectUp(p, visited); return visited;
    }
    return { ancestors: collectUp, descendants: collectDown };
  }, [nodes, edges]);

  const activeNode = selectedNode || hoveredNode;

  const connectedNodes = useMemo(() => {
    if (!activeNode) return null;
    return new Set([...ancestors(activeNode, new Set<string>()), ...descendants(activeNode, new Set<string>())]);
  }, [activeNode, ancestors, descendants]);

  const connectedEdges = useMemo(() => {
    if (!connectedNodes) return null;
    const set = new Set<number>();
    edges.forEach((e, i) => { if (connectedNodes.has(e.from) && connectedNodes.has(e.to)) set.add(i); });
    return set;
  }, [connectedNodes, edges]);

  const stats = useMemo(() => {
    const inDeg = new Map<string, number>(), outDeg = new Map<string, number>();
    for (const n of nodes) { inDeg.set(n.id, 0); outDeg.set(n.id, 0); }
    for (const e of edges) { outDeg.set(e.from, (outDeg.get(e.from) || 0) + 1); inDeg.set(e.to, (inDeg.get(e.to) || 0) + 1); }
    return { inDeg, outDeg };
  }, [nodes, edges]);

  const handleClick = useCallback((id: string) => setSelectedNode(prev => prev === id ? null : id), []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".no-pan")) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY, px: panOffset.x, py: panOffset.y };
  }, [panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    setPanOffset({ x: panStart.current.px + e.clientX - panStart.current.x, y: panStart.current.py + e.clientY - panStart.current.y });
  }, []);

  const handleMouseUp = useCallback(() => { isPanning.current = false; }, []);

  // Native wheel handler — zooms toward cursor position
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const oldZoom = zoomRef.current;
      const newZoom = Math.max(0.5, Math.min(2.5, oldZoom - e.deltaY * 0.001));
      if (newZoom === oldZoom) return;
      // Mouse position relative to the container element
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      // Adjust pan so the graph-space point under the cursor stays fixed
      const pan = panRef.current;
      const newPanX = mouseX - (mouseX - pan.x) * (newZoom / oldZoom);
      const newPanY = mouseY - (mouseY - pan.y) * (newZoom / oldZoom);
      setZoom(newZoom);
      setPanOffset({ x: newPanX, y: newPanY });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // Minimap drag handlers
  const handleMinimapMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    minimapDrag.current = true;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const graphX = (e.clientX - rect.left) * scaleX;
    const graphY = (e.clientY - rect.top) * scaleY;
    setPanOffset({ x: -(graphX - width / zoom / 2) * zoom, y: -(graphY - height / zoom / 2) * zoom });
  }, [width, height, zoom]);

  const handleMinimapMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!minimapDrag.current) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const graphX = (e.clientX - rect.left) * scaleX;
    const graphY = (e.clientY - rect.top) * scaleY;
    setPanOffset({ x: -(graphX - width / zoom / 2) * zoom, y: -(graphY - height / zoom / 2) * zoom });
  }, [width, height, zoom]);

  const handleMinimapMouseUp = useCallback(() => { minimapDrag.current = false; }, []);

  const resetView = useCallback(() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }, []);

  const usedColors = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const n of nodes) { if (!map.has(n.color)) map.set(n.color, []); map.get(n.color)!.push(n.label); }
    return map;
  }, [nodes]);

  const selectedInfo = selectedNode ? nodeMap.get(selectedNode) : null;

  return (
    <div className="my-8 flex flex-col items-center">
      <style>{`
        @keyframes edgeFlow${uid}{0%{stroke-dashoffset:20}100%{stroke-dashoffset:0}}
        @keyframes panelSlide${uid}{0%{opacity:0;transform:translateX(20px)}100%{opacity:1;transform:translateX(0)}}
        @keyframes fadeIn${uid}{0%{opacity:0}100%{opacity:1}}
      `}</style>

      {title && (
        <div className="w-full max-w-4xl flex items-center gap-3 mb-4">
          <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
          <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent" />
          <span className="text-[10px] font-mono text-zinc-600">{nodes.length} nodes · {edges.length} edges</span>
        </div>
      )}

      <div className="relative w-full max-w-5xl">
        {/* Toolbar */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 rounded-lg px-1.5 py-1">
            <button onClick={() => setZoom(z => Math.min(2.5, z + 0.2))} className="no-pan w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors text-sm font-mono cursor-pointer">+</button>
            <span className="text-[10px] font-mono text-zinc-500 px-1 min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="no-pan w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors text-sm font-mono cursor-pointer">−</button>
            <div className="w-px h-4 bg-zinc-700 mx-0.5" />
            <button onClick={resetView} className="no-pan w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer" title="Reset">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6a5 5 0 019.34-2.5M11 6a5 5 0 01-9.34 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M10.5 1v2.5H8M1.5 11V8.5H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          <button onClick={() => setShowMinimap(v => !v)} className={`no-pan h-7 px-2.5 flex items-center gap-1.5 rounded-lg border text-[10px] font-medium transition-colors cursor-pointer ${showMinimap ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-zinc-900/80 border-zinc-800 text-zinc-500 hover:text-zinc-300"}`}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="0.5" y="0.5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="0.8"/><rect x="3" y="3" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.4"/></svg>
            Minimap
          </button>
          <button onClick={() => setShowLegend(v => !v)} className={`no-pan h-7 px-2.5 flex items-center gap-1.5 rounded-lg border text-[10px] font-medium transition-colors cursor-pointer ${showLegend ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : "bg-zinc-900/80 border-zinc-800 text-zinc-500 hover:text-zinc-300"}`}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="0.5" y="1" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.6"/><line x1="5" y1="2" x2="9.5" y2="2" stroke="currentColor" strokeWidth="0.8"/><rect x="0.5" y="4.5" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.4"/><line x1="5" y1="5.5" x2="9.5" y2="5.5" stroke="currentColor" strokeWidth="0.8"/></svg>
            Legend
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-600">
            {nodes.some(n => n.info?.status === "stable") && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{nodes.filter(n => n.info?.status === "stable").length} stable</span>}
            {nodes.some(n => n.info?.status === "wip") && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{nodes.filter(n => n.info?.status === "wip").length} wip</span>}
          </div>
        </div>

        {showLegend && (
          <div className="mb-3 bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 backdrop-blur-sm" style={{ animation: `fadeIn${uid} 0.2s ease` }}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Color Legend</p>
            <div className="flex flex-wrap gap-3">
              {Array.from(usedColors.entries()).map(([color, labels]) => {
                const c = nodeColors[color] || nodeColors.blue;
                return (<div key={color} className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: c.fill, border: `1px solid ${c.stroke}` }} /><span className="text-[10px] text-zinc-400">{labels.join(", ")}</span></div>);
              })}
            </div>
            <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-zinc-800">
              <div className="flex items-center gap-2"><svg width="30" height="8"><line x1="0" y1="4" x2="30" y2="4" stroke="rgba(161,161,170,0.4)" strokeWidth="1.5"/></svg><span className="text-[10px] text-zinc-500">Direct dependency</span></div>
              <div className="flex items-center gap-2"><svg width="30" height="8"><line x1="0" y1="4" x2="30" y2="4" stroke="rgba(161,161,170,0.4)" strokeWidth="1.5" strokeDasharray="4 3"/></svg><span className="text-[10px] text-zinc-500">Optional dependency</span></div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <div ref={containerRef} className="flex-1 overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/50 backdrop-blur-sm"
               style={{ cursor: isPanning.current ? "grabbing" : "grab" }}
               onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <svg width="100%" height={height} viewBox={`${-panOffset.x / zoom} ${-panOffset.y / zoom} ${width / zoom} ${height / zoom}`} className="max-w-full" preserveAspectRatio="xMidYMid meet">
              <defs>
                <marker id={`da-${uid}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="rgba(161,161,170,0.45)" /></marker>
                <marker id={`da-${uid}-hl`} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><polygon points="0 0, 10 4, 0 8" fill="rgba(74,144,226,0.9)" /></marker>
                <filter id={`ng-${uid}`}><feGaussianBlur stdDeviation="6" result="blur" /><feFlood floodColor="rgba(74,144,226,0.15)" result="color" /><feComposite in="color" in2="blur" operator="in" result="shadow" /><feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                <pattern id={`grid-${uid}`} width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(63,63,70,0.1)" strokeWidth="0.5"/></pattern>
              </defs>
              <rect width={width * 3} height={height * 3} x={-width} y={-height} fill={`url(#grid-${uid})`} />

              {edges.map((e, i) => {
                const fromNode = nodeMap.get(e.from), toNode = nodeMap.get(e.to);
                if (!fromNode || !toNode) return null;
                const { sx, sy, ex, ey } = getEdgePoint(fromNode, toNode);
                const my = (sy + ey) / 2;
                const path = `M ${sx} ${sy} C ${sx} ${my}, ${ex} ${my}, ${ex} ${ey}`;
                const hl = connectedEdges?.has(i) ?? false;
                const dim = activeNode ? !hl : false;
                return (
                  <g key={i}>
                    <path d={path} stroke={hl ? "rgba(74,144,226,0.7)" : `rgba(161,161,170,${dim ? 0.06 : 0.2})`} strokeWidth={hl ? 2.5 : 1.5} fill="none"
                      strokeDasharray={e.type === "optional" ? "6 4" : e.type === "weak" ? "2 2" : undefined}
                      markerEnd={`url(#da-${uid}${hl ? "-hl" : ""})`} style={{ transition: "stroke 0.3s, stroke-width 0.3s" }} />
                    {hl && <path d={path} stroke="rgba(74,144,226,0.5)" strokeWidth={2.5} fill="none" strokeDasharray="4 16" style={{ animation: `edgeFlow${uid} 1s linear infinite` }} />}
                    {e.label && hl && (
                      <g><rect x={(sx+ex)/2 - e.label.length*3 - 6} y={(sy+ey)/2 - 8} width={e.label.length*6 + 12} height={16} rx="4" fill="rgba(0,0,0,0.9)" stroke="rgba(74,144,226,0.3)" strokeWidth="0.5"/>
                      <text x={(sx+ex)/2} y={(sy+ey)/2+3} textAnchor="middle" fontSize="8" fill="#4A90E2" fontFamily="monospace">{e.label}</text></g>
                    )}
                  </g>
                );
              })}

              {nodes.map(n => {
                const c = nodeColors[n.color] || nodeColors.blue;
                const isConnected = !activeNode || connectedNodes?.has(n.id);
                const isActive = selectedNode === n.id || hoveredNode === n.id;
                const inDeg = stats.inDeg.get(n.id) || 0;
                const outDeg = stats.outDeg.get(n.id) || 0;
                const status = n.info?.status ? statusConfig[n.info.status] : null;
                return (
                  <g key={n.id} filter={`url(#ng-${uid})`} className="cursor-pointer no-pan"
                     onClick={() => handleClick(n.id)} onMouseEnter={() => setHoveredNode(n.id)} onMouseLeave={() => setHoveredNode(null)}
                     style={{ opacity: isConnected ? 1 : 0.12, transition: "opacity 0.3s" }}>
                    {selectedNode === n.id && (
                      <rect x={n.x-4} y={n.y-4} width={n.width+8} height={n.height+8} rx="12" fill="none" stroke={c.hlStroke} strokeWidth="1.5" strokeDasharray="4 4">
                        <animate attributeName="stroke-dashoffset" values="8;0" dur="0.6s" repeatCount="indefinite" />
                      </rect>
                    )}
                    <rect x={n.x} y={n.y} width={n.width} height={n.height} rx="8"
                      fill={isActive ? c.hoverFill : c.fill} stroke={isActive ? c.hlStroke : c.stroke}
                      strokeWidth={isActive ? "2" : "1.2"}
                      style={{ transition: "all 0.3s", transform: isActive ? "scale(1.05)" : "scale(1)", transformOrigin: `${n.x+n.width/2}px ${n.y+n.height/2}px` }} />
                    {status && <circle cx={n.x+n.width-8} cy={n.y+8} r="3.5" fill={status.color} opacity="0.8"><animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/></circle>}
                    <text x={n.x+n.width/2} y={n.y+(n.detail ? n.height/2-2 : n.height/2+4)} textAnchor="middle" fontSize="12" fontWeight="700" fill={c.text} fontFamily="system-ui, sans-serif" style={{ pointerEvents:"none" }}>{n.label}</text>
                    {n.detail && <text x={n.x+n.width/2} y={n.y+n.height/2+12} textAnchor="middle" fontSize="9" fill={c.detail} fontFamily="monospace" style={{ pointerEvents:"none" }}>{n.detail}</text>}
                    {isActive && inDeg > 0 && <g><circle cx={n.x} cy={n.y} r="8" fill="rgba(0,0,0,0.85)" stroke="rgba(74,144,226,0.5)" strokeWidth="0.8"/><text x={n.x} y={n.y+3} textAnchor="middle" fontSize="7" fill="#4A90E2" fontFamily="monospace">{inDeg}</text></g>}
                    {isActive && outDeg > 0 && <g><circle cx={n.x+n.width} cy={n.y+n.height} r="8" fill="rgba(0,0,0,0.85)" stroke="rgba(123,104,238,0.5)" strokeWidth="0.8"/><text x={n.x+n.width} y={n.y+n.height+3} textAnchor="middle" fontSize="7" fill="#7B68EE" fontFamily="monospace">{outDeg}</text></g>}
                    {hoveredNode === n.id && (
                      <foreignObject x={n.x+n.width/2-130} y={n.y-(n.info ? 100 : 40)} width={260} height={n.info ? 95 : 35} style={{ pointerEvents:"none", overflow:"visible" }}>
                        <div className="bg-zinc-900/95 border border-zinc-700/80 rounded-lg shadow-2xl backdrop-blur-sm p-2.5" style={{ animation: `fadeIn${uid} 0.15s ease` }}>
                          {n.tooltip && <p className="text-[11px] text-zinc-300 mb-1">{n.tooltip}</p>}
                          {n.info ? (
                            <div className="space-y-1">
                              {n.info.loc && <p className="text-[10px] font-mono text-zinc-500">📦 {n.info.loc}</p>}
                              {n.info.version && <p className="text-[10px] font-mono text-zinc-500">🏷️ v{n.info.version}</p>}
                              {status && <span className="inline-block text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ background:status.bg, color:status.color }}>{status.label}</span>}
                              <p className="text-[9px] text-zinc-600">↓{outDeg} dependencies · ↑{inDeg} dependents</p>
                            </div>
                          ) : (
                            !n.tooltip && <p className="text-[10px] text-zinc-500">↓{outDeg} deps · ↑{inDeg} dependents</p>
                          )}
                        </div>
                      </foreignObject>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {selectedInfo?.info && (
            <div className="w-72 shrink-0 bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 backdrop-blur-sm self-start max-h-[600px] overflow-y-auto"
                 style={{ animation: `panelSlide${uid} 0.3s ease` }}>
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-zinc-800">
                <div className="w-3 h-3 rounded" style={{ background: (nodeColors[selectedInfo.color]||nodeColors.blue).fill, border: `1.5px solid ${(nodeColors[selectedInfo.color]||nodeColors.blue).stroke}` }} />
                <div><h4 className="text-sm font-bold text-white">{selectedInfo.label}</h4>{selectedInfo.detail && <p className="text-[10px] font-mono text-zinc-500">{selectedInfo.detail}</p>}</div>
                <button onClick={() => setSelectedNode(null)} className="ml-auto text-zinc-600 hover:text-white transition-colors cursor-pointer"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></button>
              </div>
              {selectedInfo.info.status && (
                <div className="mb-3">
                  <span className="text-[10px] font-medium px-2 py-1 rounded-full" style={{ background: statusConfig[selectedInfo.info.status].bg, color: statusConfig[selectedInfo.info.status].color }}>{statusConfig[selectedInfo.info.status].label}</span>
                  {selectedInfo.info.version && <span className="text-[10px] font-mono text-zinc-600 ml-2">v{selectedInfo.info.version}</span>}
                </div>
              )}
              {selectedInfo.info.description && <p className="text-xs text-zinc-400 leading-relaxed mb-3">{selectedInfo.info.description}</p>}
              {selectedInfo.info.stats && selectedInfo.info.stats.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Statistics</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {selectedInfo.info.stats.map((s, i) => (<div key={i} className="bg-zinc-800/50 rounded-md px-2 py-1.5"><p className="text-[9px] text-zinc-600 uppercase">{s.label}</p><p className="text-xs font-bold text-white">{s.value}</p></div>))}
                  </div>
                </div>
              )}
              {selectedInfo.info.features && selectedInfo.info.features.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Features</p>
                  <ul className="space-y-1">
                    {selectedInfo.info.features.map((f, i) => (<li key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-400"><span className="mt-0.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />{f}</li>))}
                  </ul>
                </div>
              )}
              <div className="pt-3 border-t border-zinc-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Connections</p>
                <div className="flex gap-3">
                  <div className="text-center"><p className="text-lg font-bold text-blue-400">{stats.inDeg.get(selectedInfo.id)||0}</p><p className="text-[9px] text-zinc-600">Dependents</p></div>
                  <div className="text-center"><p className="text-lg font-bold text-purple-400">{stats.outDeg.get(selectedInfo.id)||0}</p><p className="text-[9px] text-zinc-600">Dependencies</p></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {showMinimap && (
          <div className="absolute bottom-3 right-3 bg-zinc-900/90 border border-zinc-800 rounded-lg p-2 backdrop-blur-sm no-pan" style={{ animation: `fadeIn${uid} 0.2s ease` }}>
            <svg width={minimapW} height={minimapH} viewBox={`0 0 ${width} ${height}`} className="cursor-crosshair select-none"
                 onMouseDown={handleMinimapMouseDown} onMouseMove={handleMinimapMouseMove} onMouseUp={handleMinimapMouseUp} onMouseLeave={handleMinimapMouseUp}>
              <rect width={width} height={height} fill="rgba(0,0,0,0.3)" rx="4"/>
              {edges.map((e, i) => { const fn=nodeMap.get(e.from),tn=nodeMap.get(e.to); if(!fn||!tn) return null; return <line key={i} x1={fn.x+fn.width/2} y1={fn.y+fn.height/2} x2={tn.x+tn.width/2} y2={tn.y+tn.height/2} stroke="rgba(161,161,170,0.15)" strokeWidth="1"/>; })}
              {nodes.map(n => { const c=nodeColors[n.color]||nodeColors.blue; return <rect key={n.id} x={n.x} y={n.y} width={n.width} height={n.height} rx="3" fill={selectedNode===n.id?c.hlStroke:c.fill} stroke={c.stroke} strokeWidth="1"/>; })}
              <rect x={-panOffset.x/zoom} y={-panOffset.y/zoom} width={width/zoom} height={height/zoom} stroke="rgba(74,144,226,0.5)" strokeWidth="2" fill="rgba(74,144,226,0.08)" rx="2" className="pointer-events-none"/>
            </svg>
          </div>
        )}
      </div>

      <p className="text-[10px] text-zinc-600 text-center mt-3">
        Click a node to see its dependencies · Scroll to zoom · Drag to navigate
      </p>
    </div>
  );
}
