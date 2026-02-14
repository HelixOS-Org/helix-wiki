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
    const observer = new IntersectionObserver(
      (entries) => {
        // pick the first one that's intersecting
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return active;
}

/* ──────────────── Sidebar Component ──────────────── */
export default function DocsSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Find current page's sections
  const currentPage = docsNav
    .flatMap((g) => g.pages)
    .find((p) => pathname === p.href);
  const currentSections = currentPage?.sections ?? [];
  const activeSection = useActiveSection(currentSections);

  // Close mobile sidebar on route change
  useEffect(() => {
    const close = () => setMobileOpen(false);
    close();
  }, [pathname]);

  // Lock body scroll when mobile sidebar open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-white/[0.06]">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Documentation</h2>
      </div>

      {/* Nav tree */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5 sidebar-scroll">
        {docsNav.map((group) => (
          <div key={group.label}>
            <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.pages.map((page) => {
                const isActive = pathname === page.href;
                return (
                  <li key={page.href}>
                    {/* Page link */}
                    <Link
                      href={page.href}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive
                          ? "bg-white/[0.07] text-white shadow-[inset_0_0_0_1px_rgba(123,104,238,0.2)]"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                        }`}
                    >
                      <span className="text-base leading-none">{page.icon}</span>
                      {page.title}
                    </Link>

                    {/* Section anchors — only show for active page */}
                    {isActive && page.sections.length > 0 && (
                      <ul className="mt-1 ml-4 pl-3 border-l border-white/[0.06] space-y-0.5">
                        {page.sections.map((section) => {
                          const isSectionActive = activeSection === section.id;
                          return (
                            <li key={section.id}>
                              <a
                                href={`#${section.id}`}
                                className={`block px-2.5 py-1.5 rounded-md text-[13px] transition-all duration-200
                                  ${isSectionActive
                                    ? "text-helix-blue bg-helix-blue/[0.08] font-medium"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                                  }`}
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
        ))}
      </nav>

      {/* Footer links */}
      <div className="px-4 py-4 border-t border-white/[0.06] space-y-1.5">
        <a
          href="https://github.com/HelixOS-Org/helix"
          target="_blank"
          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.333-1.723-1.333-1.723-1.089-.73.083-.716.083-.716 1.205.083 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.535-1.497.105-3.121 0 0 1.005-.316 3.3 1.209A11.707 11.707 0 0112 6.844c1.02.005 2.047.135 3.005.397 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.245 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56C20.565 21.917 24 17.495 24 12.292 24 5.78 18.627.5 12 .5z"/></svg>
          Edit on GitHub
        </a>
        <Link
          href="/donate"
          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-pink-400/70 hover:text-pink-400 hover:bg-pink-500/[0.06] transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          Support Helix
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile toggle ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="xl:hidden fixed bottom-5 left-5 z-40 flex items-center gap-2
                   px-4 py-2.5 rounded-full
                   bg-zinc-900/90 backdrop-blur-lg border border-white/[0.1]
                   text-sm text-zinc-300 font-medium
                   shadow-[0_4px_24px_rgba(0,0,0,0.5)]
                   hover:bg-zinc-800/90 hover:text-white transition-all"
        aria-label="Open documentation menu"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
        </svg>
        Menu
      </button>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="xl:hidden fixed inset-0 z-[90]" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 left-0 bottom-0 w-72
                       bg-zinc-950/95 backdrop-blur-2xl border-r border-white/[0.06]
                       shadow-[4px_0_40px_rgba(0,0,0,0.5)]
                       sidebar-enter"
          >
            <div className="flex items-center justify-between px-4 pt-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Docs</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all"
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

      {/* ── Desktop sidebar ── */}
      <aside className="hidden xl:block fixed top-16 left-0 bottom-0 w-64 border-r border-white/[0.04] bg-black/40">
        {sidebarContent}
      </aside>
    </>
  );
}
