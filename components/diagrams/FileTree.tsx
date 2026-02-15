"use client";

import { useState, useCallback, useMemo } from "react";

interface TreeNode {
  name: string;
  detail?: string;
  children?: TreeNode[];
  icon?: "folder" | "file";
  /** Rich file info */
  info?: {
    loc?: number;
    language?: string;
    description?: string;
    size?: string;
    status?: "stable" | "wip" | "new" | "deprecated";
    exports?: string[];
  };
}

interface FileTreeProps {
  tree: TreeNode[];
  title?: string;
}

const langColors: Record<string, { color: string; bg: string; icon: string }> = {
  rust:   { color: "#DEA584", bg: "rgba(222,165,132,0.12)", icon: "🦀" },
  toml:   { color: "#9B8578", bg: "rgba(155,133,120,0.12)", icon: "⚙️" },
  asm:    { color: "#6E4C13", bg: "rgba(110,76,19,0.12)",  icon: "📟" },
  md:     { color: "#083FA1", bg: "rgba(8,63,161,0.12)",   icon: "📝" },
  json:   { color: "#292929", bg: "rgba(41,41,41,0.2)",    icon: "📋" },
  default:{ color: "#A1A1AA", bg: "rgba(161,161,170,0.08)", icon: "📄" },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  stable:     { label: "Stable",     color: "#22C55E", bg: "rgba(34,197,94,0.15)" },
  wip:        { label: "WIP",        color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  new:        { label: "Nouveau",    color: "#4A90E2", bg: "rgba(74,144,226,0.15)" },
  deprecated: { label: "Obsolète",   color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
};

function countItems(node: TreeNode): number {
  if (!node.children) return 1;
  return node.children.reduce((a, c) => a + countItems(c), 0);
}

function countLoc(node: TreeNode): number {
  let total = node.info?.loc || 0;
  if (node.children) for (const c of node.children) total += countLoc(c);
  return total;
}

function matchesFilter(node: TreeNode, filter: string): boolean {
  if (node.name.toLowerCase().includes(filter)) return true;
  if (node.children) return node.children.some(c => matchesFilter(c, filter));
  return false;
}

function detectLanguage(name: string): string {
  if (name.endsWith(".rs")) return "rust";
  if (name.endsWith(".toml") || name === "Cargo.toml") return "toml";
  if (name.endsWith(".asm") || name.endsWith(".s")) return "asm";
  if (name.endsWith(".md")) return "md";
  if (name.endsWith(".json")) return "json";
  return "default";
}

function FolderIcon({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" style={{ transition: "transform 0.2s" }}>
      {open ? (
        <path d="M1.5 3C1.5 2.44772 1.94772 2 2.5 2H6.29289L7.64645 3.35355C7.74021 3.44732 7.86739 3.5 8 3.5H13.5C14.0523 3.5 14.5 3.94772 14.5 4.5V5.5H3.5L1.5 12.5V3Z M3.5 5.5H14.5L12.5 12.5C12.3 13.1 11.8 13.5 11.2 13.5H2.5C1.94772 13.5 1.5 13.0523 1.5 12.5L3.5 5.5Z"
          fill="rgba(74,144,226,0.4)" stroke="rgba(74,144,226,0.8)" strokeWidth="0.7"/>
      ) : (
        <path d="M1.5 3C1.5 2.44772 1.94772 2 2.5 2H6.29289L7.64645 3.35355C7.74021 3.44732 7.86739 3.5 8 3.5H13.5C14.0523 3.5 14.5 3.94772 14.5 4.5V12.5C14.5 13.0523 14.0523 13.5 13.5 13.5H2.5C1.94772 13.5 1.5 13.0523 1.5 12.5V3Z"
          fill="rgba(74,144,226,0.3)" stroke="rgba(74,144,226,0.7)" strokeWidth="0.8"/>
      )}
    </svg>
  );
}

function FileIcon({ lang }: { lang: string }) {
  const l = langColors[lang] || langColors.default;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path d="M3.5 1.5H9.79289L12.5 4.20711V14C12.5 14.2761 12.2761 14.5 12 14.5H3.5C3.22386 14.5 3 14.2761 3 14V2C3 1.72386 3.22386 1.5 3.5 1.5Z"
        fill={l.bg} stroke={l.color} strokeWidth="0.8" strokeOpacity="0.6"/>
      <path d="M9.5 1.5V4.5H12.5" stroke={l.color} strokeWidth="0.8" strokeOpacity="0.6" fill="none"/>
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0"
         style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
      <path d="M4 2.5L8 6L4 9.5" stroke="rgba(74,144,226,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function highlightMatch(text: string, filter: string): React.ReactNode {
  if (!filter) return text;
  const idx = text.toLowerCase().indexOf(filter);
  if (idx === -1) return text;
  return (<>{text.slice(0, idx)}<span className="bg-yellow-500/30 text-yellow-300 rounded px-0.5">{text.slice(idx, idx + filter.length)}</span>{text.slice(idx + filter.length)}</>);
}

function TreeItem({ node, depth, isLast, filter, collapsedSet, onToggle, selectedPath, onSelect, breadcrumb }: {
  node: TreeNode; depth: number; isLast: boolean; filter: string;
  collapsedSet: Set<string>; onToggle: (path: string) => void;
  selectedPath: string | null; onSelect: (path: string | null, node: TreeNode, breadcrumb: string[]) => void;
  breadcrumb: string[];
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isFolder = node.icon === "folder" || hasChildren;
  const path = `${depth}-${node.name}`;
  const isCollapsed = collapsedSet.has(path);
  const isSelected = selectedPath === path;
  const childCount = hasChildren ? countItems(node) : 0;
  const lang = !isFolder ? detectLanguage(node.name) : "default";
  const langInfo = langColors[lang] || langColors.default;
  const statusInfo = node.info?.status ? statusConfig[node.info.status] : null;
  const currentBreadcrumb = [...breadcrumb, node.name];

  if (filter && !matchesFilter(node, filter)) return null;

  const showChildren = !!(hasChildren && (filter ? true : !isCollapsed));

  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-[3px] rounded px-1 -mx-1 cursor-pointer select-none group"
        style={{
          paddingLeft: `${depth * 20}px`,
          background: isSelected ? "rgba(74,144,226,0.1)" : "transparent",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = isSelected ? "rgba(74,144,226,0.15)" : "rgba(255,255,255,0.03)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = isSelected ? "rgba(74,144,226,0.1)" : "transparent")}
        onClick={() => {
          if (isFolder) onToggle(path);
          onSelect(isSelected ? null : path, node, currentBreadcrumb);
        }}
      >
        {depth > 0 && (
          <svg width="16" height="20" viewBox="0 0 16 20" className="shrink-0 -ml-0.5" fill="none">
            {!isLast && <line x1="4" y1="0" x2="4" y2="20" stroke="rgba(74,144,226,0.2)" strokeWidth="1"/>}
            {isLast && <line x1="4" y1="0" x2="4" y2="10" stroke="rgba(74,144,226,0.2)" strokeWidth="1"/>}
            <line x1="4" y1="10" x2="14" y2="10" stroke="rgba(74,144,226,0.2)" strokeWidth="1"/>
            {isLast && <circle cx="4" cy="10" r="1.5" fill="rgba(74,144,226,0.4)"/>}
          </svg>
        )}

        {isFolder && <ChevronIcon open={showChildren} />}
        {!isFolder && <div className="w-3" />}

        {isFolder ? <FolderIcon open={showChildren} /> : <FileIcon lang={lang} />}

        <span className={`text-sm ${isFolder ? "font-semibold text-white" : "text-zinc-300"}`}>
          {filter ? highlightMatch(node.name, filter) : node.name}
        </span>

        {/* Language badge for files */}
        {!isFolder && lang !== "default" && (
          <span className="text-[8px] font-mono px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: langInfo.bg, color: langInfo.color }}>
            {langInfo.icon}
          </span>
        )}

        {/* Status badge */}
        {statusInfo && (
          <span className="text-[8px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: statusInfo.bg, color: statusInfo.color }}>
            {statusInfo.label}
          </span>
        )}

        {/* LoC badge */}
        {node.info?.loc && (
          <span className="text-[9px] font-mono text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
            {node.info.loc.toLocaleString()} LoC
          </span>
        )}

        {/* Info indicator */}
        {node.info?.description && (
          <span className="text-[9px] text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity">ⓘ</span>
        )}

        {isFolder && isCollapsed && !filter && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700/50">
            {childCount}
          </span>
        )}

        {/* Folder LoC total */}
        {isFolder && (() => { const loc = countLoc(node); return loc > 0 ? (
          <span className="text-[8px] font-mono text-zinc-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            Σ {loc.toLocaleString()} LoC
          </span>
        ) : null; })()}

        {node.detail && !node.info?.loc && (
          <span className="text-xs text-zinc-500 ml-auto font-mono">{node.detail}</span>
        )}
        {node.detail && node.info?.loc && (
          <span className="text-xs text-zinc-500 font-mono">{node.detail}</span>
        )}
      </div>

      <div style={{
        maxHeight: showChildren ? `${(hasChildren ? node.children!.length * 200 : 0)}px` : "0px",
        overflow: "hidden",
        transition: "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        {hasChildren && node.children!.map((child, i) => (
          <TreeItem key={i} node={child} depth={depth + 1} isLast={i === node.children!.length - 1}
            filter={filter} collapsedSet={collapsedSet} onToggle={onToggle}
            selectedPath={selectedPath} onSelect={onSelect} breadcrumb={currentBreadcrumb} />
        ))}
      </div>
    </div>
  );
}

export default function FileTree({ tree, title }: FileTreeProps) {
  const [collapsedSet, setCollapsedSet] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);

  const totalFiles = useMemo(() => tree.reduce((a, n) => a + countItems(n), 0), [tree]);
  const totalLoc = useMemo(() => tree.reduce((a, n) => a + countLoc(n), 0), [tree]);

  const handleToggle = useCallback((path: string) => {
    setCollapsedSet(prev => { const next = new Set(prev); if (next.has(path)) next.delete(path); else next.add(path); return next; });
  }, []);

  const collapseAll = useCallback(() => {
    const paths = new Set<string>();
    function walk(nodes: TreeNode[], depth: number) {
      for (const n of nodes) { if (n.children && n.children.length > 0) { paths.add(`${depth}-${n.name}`); walk(n.children, depth + 1); } }
    }
    walk(tree, 0);
    setCollapsedSet(paths);
  }, [tree]);

  const expandAll = useCallback(() => setCollapsedSet(new Set()), []);

  const handleSelect = useCallback((path: string | null, node: TreeNode, bc: string[]) => {
    setSelectedPath(path);
    setSelectedNode(path ? node : null);
    setBreadcrumb(bc);
  }, []);

  return (
    <div className="my-8 flex gap-3">
      <div className="flex-1 bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5 overflow-x-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-zinc-800/60">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          {title && <span className="text-xs font-mono text-zinc-500 ml-2">{title}</span>}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[10px] font-mono text-zinc-600">{totalFiles} fichiers</span>
            {totalLoc > 0 && (
              <>
                <span className="text-zinc-700">·</span>
                <span className="text-[10px] font-mono text-zinc-600">{totalLoc.toLocaleString()} LoC</span>
              </>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Filtrer les fichiers..." value={filter} onChange={e => setFilter(e.target.value.toLowerCase())}
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-md text-xs text-zinc-300 pl-8 pr-3 py-1.5 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors" />
          </div>
          <button onClick={collapseAll} className="text-[10px] text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded border border-zinc-700/40 hover:border-zinc-600/60 transition-colors cursor-pointer">Réduire</button>
          <button onClick={expandAll} className="text-[10px] text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded border border-zinc-700/40 hover:border-zinc-600/60 transition-colors cursor-pointer">Déplier</button>
        </div>

        {/* Tree */}
        {tree.map((node, i) => (
          <TreeItem key={i} node={node} depth={0} isLast={i === tree.length - 1}
            filter={filter} collapsedSet={collapsedSet} onToggle={handleToggle}
            selectedPath={selectedPath} onSelect={handleSelect} breadcrumb={[]} />
        ))}
      </div>

      {/* Detail panel */}
      {selectedNode?.info && (
        <div className="w-64 shrink-0 bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-4 self-start max-h-[500px] overflow-y-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 mb-3 flex-wrap">
            {breadcrumb.map((seg, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-[8px] text-zinc-700">/</span>}
                <span className={`text-[10px] font-mono ${i === breadcrumb.length - 1 ? "text-blue-400" : "text-zinc-600"}`}>{seg}</span>
              </span>
            ))}
          </div>

          {/* File name */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-zinc-800">
            {selectedNode.icon === "folder" || selectedNode.children ? <FolderIcon open={true} /> : <FileIcon lang={detectLanguage(selectedNode.name)} />}
            <div>
              <h4 className="text-sm font-bold text-white">{selectedNode.name}</h4>
              {selectedNode.detail && <p className="text-[10px] font-mono text-zinc-500">{selectedNode.detail}</p>}
            </div>
          </div>

          {/* Status */}
          {selectedNode.info.status && (
            <div className="mb-3">
              <span className="text-[10px] font-medium px-2 py-1 rounded-full" style={{ background: statusConfig[selectedNode.info.status].bg, color: statusConfig[selectedNode.info.status].color }}>
                {statusConfig[selectedNode.info.status].label}
              </span>
            </div>
          )}

          {/* Description */}
          {selectedNode.info.description && (
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">{selectedNode.info.description}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {selectedNode.info.loc && (
              <div className="bg-zinc-800/40 rounded-md px-2.5 py-1.5 border border-zinc-700/30">
                <p className="text-[9px] text-zinc-600 uppercase">Lignes</p>
                <p className="text-sm font-bold text-white">{selectedNode.info.loc.toLocaleString()}</p>
              </div>
            )}
            {selectedNode.info.language && (
              <div className="bg-zinc-800/40 rounded-md px-2.5 py-1.5 border border-zinc-700/30">
                <p className="text-[9px] text-zinc-600 uppercase">Langage</p>
                <p className="text-sm font-bold" style={{ color: (langColors[selectedNode.info.language] || langColors.default).color }}>
                  {langColors[selectedNode.info.language]?.icon || "📄"} {selectedNode.info.language}
                </p>
              </div>
            )}
            {selectedNode.info.size && (
              <div className="bg-zinc-800/40 rounded-md px-2.5 py-1.5 border border-zinc-700/30">
                <p className="text-[9px] text-zinc-600 uppercase">Taille</p>
                <p className="text-sm font-bold text-white">{selectedNode.info.size}</p>
              </div>
            )}
          </div>

          {/* Exports */}
          {selectedNode.info.exports && selectedNode.info.exports.length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Exports</p>
              <div className="flex flex-wrap gap-1">
                {selectedNode.info.exports.map((exp, i) => (
                  <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{exp}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
