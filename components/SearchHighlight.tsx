"use client";

import { useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";

/**
 * SearchHighlight — reads `?highlight=<terms>` from the URL and highlights
 * matching text on the page using DOM TreeWalker. Automatically scrolls to
 * the first match and cleans up highlights on unmount or URL change.
 *
 * Placed in the docs layout so every doc page gets highlighting for free.
 */
export default function SearchHighlight() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const highlight = searchParams.get("highlight");

  useEffect(() => {
    if (!highlight?.trim()) return;

    const terms = highlight
      .toLowerCase()
      .split(/\s+/)
      .filter(t => t.length >= 2);
    if (terms.length === 0) return;

    // Small delay to let the page render + anchor scroll first
    const timeout = setTimeout(() => {
      applyHighlights(terms);
    }, 400);

    return () => {
      clearTimeout(timeout);
      removeHighlights();
    };
  }, [highlight, pathname]);

  return null;
}

const MARK_CLASS = "search-page-highlight";

/** Walk the DOM and wrap matching text nodes in <mark> tags */
function applyHighlights(terms: string[]) {
  removeHighlights();

  // Build a regex that matches any of the terms
  const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");

  // Only highlight inside the main content area
  const container = document.querySelector("[data-docs-content]") || document.querySelector("main") || document.body;

  // Collect all text nodes first (to avoid modifying during traversal)
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      // Skip script, style, code blocks, already-highlighted marks, and input elements
      const tag = parent.tagName.toLowerCase();
      if (["script", "style", "noscript", "textarea", "input"].includes(tag)) {
        return NodeFilter.FILTER_REJECT;
      }
      // Skip code/pre blocks — don't highlight inside code
      if (parent.closest("pre, code")) return NodeFilter.FILTER_REJECT;
      // Skip existing highlights
      if (parent.classList.contains(MARK_CLASS)) return NodeFilter.FILTER_REJECT;
      // Only process nodes that actually match
      if (!regex.test(node.textContent || "")) return NodeFilter.FILTER_REJECT;
      regex.lastIndex = 0; // reset after test
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node: Node | null;
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text);
  }

  let firstMark: HTMLElement | null = null;

  for (const textNode of textNodes) {
    const text = textNode.textContent || "";
    regex.lastIndex = 0;

    const parts: (string | { match: string })[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push({ match: match[0] });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    // If no matches were found (shouldn't happen but safety), skip
    if (parts.length <= 1 && typeof parts[0] === "string") continue;

    const parent = textNode.parentNode;
    if (!parent) continue;

    const fragment = document.createDocumentFragment();
    for (const part of parts) {
      if (typeof part === "string") {
        fragment.appendChild(document.createTextNode(part));
      } else {
        const mark = document.createElement("mark");
        mark.className = MARK_CLASS;
        mark.textContent = part.match;
        // Inline styles so we don't need global CSS
        mark.style.cssText =
          "background: rgba(123, 104, 238, 0.25); color: white; border-radius: 3px; padding: 1px 3px; box-shadow: 0 0 8px rgba(123, 104, 238, 0.2); scroll-margin-top: 100px;";
        fragment.appendChild(mark);
        if (!firstMark) firstMark = mark;
      }
    }

    parent.replaceChild(fragment, textNode);
  }

  // Scroll to first highlight (only if no anchor hash in URL)
  if (firstMark && !window.location.hash) {
    firstMark.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Add a floating badge to dismiss highlights
  if (firstMark) {
    addDismissBadge(textNodes.length);
  }
}

/** Remove all highlights from the page */
function removeHighlights() {
  // Remove dismiss badge
  document.getElementById("search-highlight-badge")?.remove();

  // Unwrap all <mark> elements
  const marks = document.querySelectorAll(`mark.${MARK_CLASS}`);
  marks.forEach(mark => {
    const parent = mark.parentNode;
    if (!parent) return;
    const text = document.createTextNode(mark.textContent || "");
    parent.replaceChild(text, mark);
    // Merge adjacent text nodes
    parent.normalize();
  });
}

/** Floating badge showing match count with dismiss button */
function addDismissBadge(matchCount: number) {
  if (document.getElementById("search-highlight-badge")) return;

  const badge = document.createElement("div");
  badge.id = "search-highlight-badge";
  badge.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 90;
    display: flex; align-items: center; gap: 10px;
    padding: 8px 14px; border-radius: 12px;
    background: rgba(20, 20, 25, 0.92); backdrop-filter: blur(20px);
    border: 1px solid rgba(123, 104, 238, 0.2);
    box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(123,104,238,0.08);
    font-family: system-ui, -apple-system, sans-serif;
    animation: searchFadeIn 200ms ease-out;
  `;

  const text = document.createElement("span");
  text.style.cssText = "font-size: 12px; color: rgba(161, 161, 170, 0.9);";
  text.innerHTML = `<span style="color: rgb(123,104,238); font-weight: 600;">${matchCount}</span> highlight${matchCount !== 1 ? "s" : ""} found`;

  const btn = document.createElement("button");
  btn.style.cssText = `
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px; padding: 3px 10px; font-size: 11px; color: #a1a1aa;
    cursor: pointer; transition: all 150ms;
  `;
  btn.textContent = "Clear";
  btn.onmouseenter = () => { btn.style.background = "rgba(255,255,255,0.1)"; btn.style.color = "#fff"; };
  btn.onmouseleave = () => { btn.style.background = "rgba(255,255,255,0.06)"; btn.style.color = "#a1a1aa"; };
  btn.onclick = () => {
    removeHighlights();
    // Clean URL without reloading
    const url = new URL(window.location.href);
    url.searchParams.delete("highlight");
    window.history.replaceState({}, "", url.toString());
  };

  badge.appendChild(text);
  badge.appendChild(btn);
  document.body.appendChild(badge);
}
