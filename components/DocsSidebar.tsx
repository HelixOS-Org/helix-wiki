"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { docsNav } from "@/helix-wiki/lib/docsNav";
import type { DocSection } from "@/helix-wiki/lib/docsNav";

/* ──────────────── Active Section Tracker ──────────────── */
function useActiveSection(sections: DocSection[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (sections.length === 0) return;

    const visibleSet = new Map<string, IntersectionObserverEntry>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleSet.set(entry.target.id, entry);
          } else {
            visibleSet.delete(entry.target.id);
          }
        }
        if (visibleSet.size === 0) return;
        let best: string | null = null;
        let bestTop = Infinity;
        for (const [id, entry] of visibleSet) {
          const top = entry.boundingClientRect.top;
          if (top < bestTop) { bestTop = top; best = id; }
        }
        if (best) setActive(best);
      },
      { rootMargin: "-80px 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }

    const onScroll = () => {
      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      if (docHeight - scrollBottom < 50 && sections.length > 0) {
        setActive(sections[sections.length - 1].id);
        return;
      }
      if (window.scrollY < 100 && sections.length > 0) {
        setActive(sections[0].id);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, [sections]);

  return active;
}

/* ──────────────── Sidebar Component ──────────────── */
export default function DocsSidebar() {
  const rawPathname = usePathname();
  const pathname = rawPathname.endsWith("/") && rawPathname !== "/" ? rawPathname.slice(0, -1) : rawPathname;
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage = docsNav.flatMap((g) => g.pages).find((p) => pathname === p.href);
  const currentSections = currentPage?.sections ?? [];
  const activeSection = useActiveSection(currentSections);

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
              style={{ background: "linear-gradient(135deg, rgba(123,104,238,.2), rgba(74,144,226,.2))", border: "1px solid rgba(123,104,238,.2)" }}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-helix-blue to-helix-purple">H</span>
            </div>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[.15em] text-zinc-400">Docs</span>
          <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded text-zinc-600"
            style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.04)" }}>
            v0.4
          </span>
        </div>
      </div>

      <div className="mx-4 h-[1px]" style={{ background: "linear-gradient(90deg, rgba(123,104,238,.12), transparent)" }} />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 sidebar-scroll">
        {docsNav.map((group) => {
          const groupHasActive = group.pages.some((p) => pathname === p.href);
          return (
            <div key={group.label}>
              <div className={`px-2.5 mb-2 text-[10px] font-bold uppercase tracking-[.18em] transition-colors duration-300 flex items-center gap-2 ${groupHasActive ? "text-helix-purple" : "text-zinc-600"}`}>
                {groupHasActive && <span className="w-1 h-1 rounded-full bg-helix-purple animate-pulse" style={{ boxShadow: "0 0 6px rgba(123,104,238,.6)" }} />}
                {group.label}
              </div>
              <ul className="space-y-0.5">
                {group.pages.map((page) => {
                  const isActive = pathname === page.href;
                  return (
                    <li key={page.href}>
                      <Link
                        href={page.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 relative
                          ${isActive
                            ? "text-white"
                            : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[.03]"
                          }`}
                        style={isActive ? {
                          background: "linear-gradient(135deg, rgba(74,144,226,.08), rgba(123,104,238,.06))",
                          border: "1px solid rgba(123,104,238,.12)",
                          boxShadow: "0 0 20px rgba(123,104,238,.05)",
                        } : undefined}
                      >
                        {/* Active indicator bar */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full"
                            style={{ background: "linear-gradient(180deg, #4A90E2, #7B68EE)", boxShadow: "0 0 8px rgba(74,144,226,.5)" }} />
                        )}
                        <span className={`text-sm leading-none transition-transform duration-300 ${isActive ? "scale-110" : ""}`}>{page.icon}</span>
                        <span>{page.title}</span>
                      </Link>

                      {/* Section anchors for active page */}
                      {isActive && page.sections.length > 0 && (
                        <ul className="mt-1 ml-6 pl-3 space-y-0.5 relative">
                          {/* Vertical track */}
                          <div className="absolute left-0 top-0 bottom-0 w-[1px]" style={{ background: "linear-gradient(180deg, rgba(123,104,238,.15), rgba(123,104,238,.05))" }} />
                          {page.sections.map((section) => {
                            const isSectionActive = activeSection === section.id;
                            return (
                              <li key={section.id} className="relative">
                                {/* Active dot */}
                                {isSectionActive && (
                                  <div className="absolute -left-[calc(0.75rem+1px)] top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full"
                                    style={{ background: "#4A90E2", boxShadow: "0 0 10px rgba(74,144,226,.6)" }} />
                                )}
                                <a
                                  href={`#${section.id}`}
                                  className={`block px-2.5 py-1.5 rounded-md text-[12px] transition-all duration-300
                                    ${isSectionActive
                                      ? "text-helix-blue font-medium"
                                      : "text-zinc-600 hover:text-zinc-300"
                                    }`}
                                  style={isSectionActive ? {
                                    background: "rgba(74,144,226,.06)",
                                  } : undefined}
                                >
                                  {section.title}
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer links */}
      <div className="mx-4 h-[1px]" style={{ background: "linear-gradient(90deg, rgba(255,255,255,.04), transparent)" }} />
      <div className="px-4 py-4 space-y-1">
        <a
          href="https://github.com/HelixOS-Org/helix"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-zinc-500 hover:text-white hover:bg-white/[0.03] transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.333-1.723-1.333-1.723-1.089-.73.083-.716.083-.716 1.205.083 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.535-1.497.105-3.121 0 0 1.005-.316 3.3 1.209A11.707 11.707 0 0112 6.844c1.02.005 2.047.135 3.005.397 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.245 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56C20.565 21.917 24 17.495 24 12.292 24 5.78 18.627.5 12 .5z" /></svg>
          Edit on GitHub
        </a>
        <Link
          href="/donate"
          className="flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-pink-400/60 hover:text-pink-400 hover:bg-pink-500/[0.04] transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
          Support Helix
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="xl:hidden fixed bottom-5 left-5 z-40 flex items-center gap-2
                   px-4 py-2.5 rounded-full
                   bg-zinc-900/90 backdrop-blur-xl border border-white/[0.08]
                   text-sm text-zinc-300 font-medium
                   shadow-[0_4px_24px_rgba(0,0,0,0.5),0_0_0_1px_rgba(123,104,238,.05)]
                   hover:bg-zinc-800/90 hover:text-white hover:border-helix-purple/20 transition-all"
        aria-label="Open documentation menu"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
        </svg>
        Menu
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="xl:hidden fixed inset-0 z-[90]" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 left-0 bottom-0 w-72
                       bg-[#0a0a0c]/98 backdrop-blur-2xl border-r
                       shadow-[4px_0_40px_rgba(0,0,0,0.6)]"
            style={{ borderColor: "rgba(123,104,238,.08)" }}
          >
            <div className="flex items-center justify-between px-4 pt-4">
              <span className="text-xs font-semibold uppercase tracking-[.15em] text-zinc-500">Docs</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden xl:block fixed top-16 left-0 bottom-0 w-72 z-20 border-r bg-[#060608] backdrop-blur-xl"
        style={{ borderColor: "rgba(255,255,255,.04)" }}>
        {sidebarContent}
      </aside>
    </>
  );
}
