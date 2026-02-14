"use client";

import { useState, useCallback, useMemo } from "react";

interface TreeNode {
  name: string;
  detail?: string;
  children?: TreeNode[];
  icon?: "folder" | "file";
}

interface FileTreeProps {
  tree: TreeNode[];
  title?: string;
}

function countItems(node: TreeNode): number {
  if (!node.children) return 1;
  return node.children.reduce((a, c) => a + countItems(c), 0);
}

function matchesFilter(node: TreeNode, filter: string): boolean {
  if (node.name.toLowerCase().includes(filter)) return true;
  if (node.children) return node.children.some(c => matchesFilter(c, filter));
  return false;
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

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path d="M3.5 1.5H9.79289L12.5 4.20711V14C12.5 14.2761 12.2761 14.5 12 14.5H3.5C3.22386 14.5 3 14.2761 3 14V2C3 1.72386 3.22386 1.5 3.5 1.5Z"
        fill="rgba(161,161,170,0.1)" stroke="rgba(161,161,170,0.4)" strokeWidth="0.8"/>
      <path d="M9.5 1.5V4.5H12.5" stroke="rgba(161,161,170,0.4)" strokeWidth="0.8" fill="none"/>
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

function TreeItem({ node, depth, isLast, filter, collapsedSet, onToggle, selectedPath, onSelect }: {
  node: TreeNode; depth: number; isLast: boolean; filter: string;
  collapsedSet: Set<string>; onToggle: (path: string) => void;
  selectedPath: string | null; onSelect: (path: string | null) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isFolder = node.icon === "folder" || hasChildren;
  const path = `${depth}-${node.name}`;
  const isCollapsed = collapsedSet.has(path);
  const isSelected = selectedPath === path;
  const childCount = hasChildren ? countItems(node) : 0;

  // Filter: hide non-matching nodes
  if (filter && !matchesFilter(node, filter)) return null;

  // Force-expand when filtering
  const showChildren = !!(hasChildren && (filter ? true : !isCollapsed));

  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-[3px] rounded px-1 -mx-1 cursor-pointer select-none"
        style={{
          paddingLeft: `${depth * 20}px`,
          background: isSelected ? "rgba(74,144,226,0.1)" : "transparent",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = isSelected ? "rgba(74,144,226,0.15)" : "rgba(255,255,255,0.03)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = isSelected ? "rgba(74,144,226,0.1)" : "transparent")}
        onClick={() => {
          if (isFolder) onToggle(path);
          onSelect(isSelected ? null : path);
        }}
      >
        {/* Tree lines */}
        {depth > 0 && (
          <svg width="16" height="20" viewBox="0 0 16 20" className="shrink-0 -ml-0.5" fill="none">
            {!isLast && <line x1="4" y1="0" x2="4" y2="20" stroke="rgba(74,144,226,0.2)" strokeWidth="1"/>}
            {isLast && <line x1="4" y1="0" x2="4" y2="10" stroke="rgba(74,144,226,0.2)" strokeWidth="1"/>}
            <line x1="4" y1="10" x2="14" y2="10" stroke="rgba(74,144,226,0.2)" strokeWidth="1"/>
            {isLast && <circle cx="4" cy="10" r="1.5" fill="rgba(74,144,226,0.4)"/>}
          </svg>
        )}

        {/* Chevron for folders */}
        {isFolder && <ChevronIcon open={showChildren} />}
        {!isFolder && <div className="w-3" />}

        {isFolder ? <FolderIcon open={showChildren} /> : <FileIcon />}
        <span className={`text-sm ${isFolder ? "font-semibold text-white" : "text-zinc-300"}`}>
          {filter ? highlightMatch(node.name, filter) : node.name}
        </span>

        {/* Child count badge (collapsed) */}
        {isFolder && isCollapsed && !filter && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700/50">
            {childCount}
          </span>
        )}

        {node.detail && (
          <span className="text-xs text-zinc-500 ml-auto font-mono">{node.detail}</span>
        )}
      </div>

      {/* Children with animated collapse */}
      <div style={{
        maxHeight: showChildren ? `${(hasChildren ? node.children!.length * 200 : 0)}px` : "0px",
        overflow: "hidden",
        transition: "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        {hasChildren && node.children!.map((child, i) => (
          <TreeItem key={i} node={child} depth={depth + 1} isLast={i === node.children!.length - 1}
            filter={filter} collapsedSet={collapsedSet} onToggle={onToggle}
            selectedPath={selectedPath} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function highlightMatch(text: string, filter: string): React.ReactNode {
  if (!filter) return text;
  const idx = text.toLowerCase().indexOf(filter);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-yellow-500/30 text-yellow-300 rounded px-0.5">{text.slice(idx, idx + filter.length)}</span>
      {text.slice(idx + filter.length)}
    </>
  );
}

export default function FileTree({ tree, title }: FileTreeProps) {
  const [collapsedSet, setCollapsedSet] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const totalFiles = useMemo(() => tree.reduce((a, n) => a + countItems(n), 0), [tree]);

  const handleToggle = useCallback((path: string) => {
    setCollapsedSet(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path); else next.add(path);
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    const paths = new Set<string>();
    function walk(nodes: TreeNode[], depth: number) {
      for (const n of nodes) {
        if (n.children && n.children.length > 0) {
          paths.add(`${depth}-${n.name}`);
          walk(n.children, depth + 1);
        }
      }
    }
    walk(tree, 0);
    setCollapsedSet(paths);
  }, [tree]);

  const expandAll = useCallback(() => setCollapsedSet(new Set()), []);

  return (
    <div className="my-8 bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5 overflow-x-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-zinc-800/60">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        {title && <span className="text-xs font-mono text-zinc-500 ml-2">{title}</span>}
        <span className="text-[10px] font-mono text-zinc-600 ml-auto">{totalFiles} items</span>
      </div>

      {/* Toolbar: search + collapse/expand */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Filtrer..."
            value={filter}
            onChange={e => setFilter(e.target.value.toLowerCase())}
            className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-md text-xs text-zinc-300 pl-8 pr-3 py-1.5 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors"
          />
        </div>
        <button onClick={collapseAll} className="text-[10px] text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded border border-zinc-700/40 hover:border-zinc-600/60 transition-colors cursor-pointer">
          Tout réduire
        </button>
        <button onClick={expandAll} className="text-[10px] text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded border border-zinc-700/40 hover:border-zinc-600/60 transition-colors cursor-pointer">
          Tout déplier
        </button>
      </div>

      {/* Tree */}
      {tree.map((node, i) => (
        <TreeItem key={i} node={node} depth={0} isLast={i === tree.length - 1}
          filter={filter} collapsedSet={collapsedSet} onToggle={handleToggle}
          selectedPath={selectedPath} onSelect={setSelectedPath} />
      ))}
    </div>
  );
}
