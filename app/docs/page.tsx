"use client";

import Link from "next/link";
import { docsNav } from "@/helix-wiki/lib/docsNav";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import docsIndexContent from "@/helix-wiki/lib/docs-i18n/docs-index";
import { useState, useEffect } from "react";

/* ── Animated counter ── */
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let f = 0;
    const dur = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(ease * end));
      if (p < 1) f = requestAnimationFrame(tick);
    };
    f = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(f);
  }, [end]);
  return <>{val.toLocaleString()}{suffix}</>;
}

/* ── Stagger reveal ── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setV(true), delay * 1000 + 100);
    return () => clearTimeout(t);
  }, [delay]);
  return <div className={`transition-all duration-700 ease-out ${v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>{children}</div>;
}

const GROUP_COLORS: Record<string, { gradient: string; glow: string; dot: string }> = {
  "Getting Started": { gradient: "from-emerald-400 to-green-500", glow: "rgba(34,197,94,.08)", dot: "#22C55E" },
  "Overview": { gradient: "from-violet-400 to-purple-500", glow: "rgba(123,104,238,.08)", dot: "#7B68EE" },
  "Kernel": { gradient: "from-blue-400 to-cyan-500", glow: "rgba(74,144,226,.08)", dot: "#4A90E2" },
  "Subsystems": { gradient: "from-orange-400 to-amber-500", glow: "rgba(245,158,11,.08)", dot: "#F59E0B" },
  "Storage": { gradient: "from-amber-400 to-yellow-500", glow: "rgba(234,179,8,.08)", dot: "#EAB308" },
  "Intelligence": { gradient: "from-rose-400 to-pink-500", glow: "rgba(236,72,153,.08)", dot: "#EC4899" },
  "Graphics": { gradient: "from-pink-400 to-rose-500", glow: "rgba(244,114,182,.08)", dot: "#F472B6" },
  "Drivers & Performance": { gradient: "from-teal-400 to-cyan-500", glow: "rgba(45,212,191,.08)", dot: "#2DD4BF" },
  "Development": { gradient: "from-indigo-400 to-blue-500", glow: "rgba(99,102,241,.08)", dot: "#6366F1" },
};

export default function DocsIndexPage() {
  const { locale } = useI18n();
  const d = (key: string) => getDocString(docsIndexContent, locale, key);

  const totalPages = docsNav.reduce((a, g) => a + g.pages.length, 0);
  const totalSections = docsNav.reduce((a, g) => a + g.pages.reduce((b, p) => b + p.sections.length, 0), 0);

  return (
    <div className="min-h-screen text-white">

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Ambient */}
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(123,104,238,.05), transparent 60%)" }} />
        <div className="absolute -top-20 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(74,144,226,.04), transparent 60%)" }} />

        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-mono mb-8"
              style={{ background: "rgba(123,104,238,.08)", border: "1px solid rgba(123,104,238,.15)", color: "#9B8AFF" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-helix-purple opacity-40" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-helix-purple" />
              </span>
              {d("hero.badge")}
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
              {d("hero.title.1")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-helix-blue via-helix-purple to-helix-accent"
                style={{ filter: "drop-shadow(0 0 40px rgba(123,104,238,.2))" }}>
                {d("hero.title.2")}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-5 text-lg text-zinc-400 max-w-2xl leading-relaxed">
              {d("hero.subtitle")}
            </p>
          </Reveal>

          {/* Stats bar */}
          <Reveal delay={0.2}>
            <div className="mt-10 inline-flex items-center gap-8 px-6 py-3 rounded-xl"
              style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)" }}>
              {[
                { val: docsNav.length, label: "Categories", color: "#7B68EE" },
                { val: totalPages, label: "Pages", color: "#4A90E2" },
                { val: totalSections, label: "Sections", color: "#22C55E" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}50` }} />
                  <span className="text-white font-bold text-sm"><Counter end={s.val} /></span>
                  <span className="text-zinc-500 text-xs">{s.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </section>

      {/* ═══ GRID ═══ */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <div className="space-y-16">
          {docsNav.map((group, gi) => {
            const colors = GROUP_COLORS[group.label] || { gradient: "from-zinc-400 to-zinc-500", glow: "rgba(255,255,255,.04)", dot: "#aaa" };
            return (
              <Reveal key={group.label} delay={gi * 0.06}>
                <div>
                  {/* Group header */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-2 h-2 rounded-full" style={{ background: colors.dot, boxShadow: `0 0 10px ${colors.dot}40` }} />
                    <h2 className={`text-xs font-bold uppercase tracking-[.2em] text-transparent bg-clip-text bg-gradient-to-r ${colors.gradient}`}>
                      {group.label}
                    </h2>
                    <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(90deg, ${colors.dot}20, transparent)` }} />
                    <span className="text-[10px] text-zinc-700 font-mono">{group.pages.length} page{group.pages.length > 1 ? "s" : ""}</span>
                  </div>

                  {/* Cards */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {group.pages.map((page, pi) => (
                      <Link
                        key={page.href}
                        href={page.href}
                        className="group relative rounded-xl overflow-hidden transition-all duration-500 hover:translate-y-[-2px]"
                        style={{
                          background: "rgba(255,255,255,.015)",
                          border: "1px solid rgba(255,255,255,.05)",
                        }}
                      >
                        {/* Top accent line */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{ background: `linear-gradient(90deg, transparent, ${colors.dot}50, transparent)` }} />

                        {/* Hover glow */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                          style={{ background: `radial-gradient(ellipse at 50% 0%, ${colors.glow}, transparent 70%)` }} />

                        <div className="relative p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-xl group-hover:scale-110 inline-block transition-transform duration-400">{page.icon}</span>
                            <h3 className="font-bold text-white text-[15px] transition-all duration-400">
                              {page.title}
                            </h3>
                            <svg className="w-4 h-4 text-zinc-800 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all duration-300 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>

                          {/* Section tags */}
                          <div className="flex flex-wrap gap-1.5">
                            {page.sections.slice(0, 6).map((s) => (
                              <span
                                key={s.id}
                                className="px-2 py-0.5 rounded-md text-[10px] text-zinc-500 transition-colors duration-300 group-hover:text-zinc-400"
                                style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.04)" }}
                              >
                                {s.title}
                              </span>
                            ))}
                            {page.sections.length > 6 && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] text-zinc-600"
                                style={{ background: "rgba(255,255,255,.02)" }}>
                                +{page.sections.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
    </div>
  );
}
