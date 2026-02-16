"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import HelixLogo from "@/helix-wiki/components/HelixLogo";
import Link from "next/link";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import roadmapContent from "@/helix-wiki/lib/docs-i18n/roadmap";

/* ═══════════════════════════════════════════════════════════════════════════════
   DATA — Helix OS development roadmap, 5 phases, 8 milestones
   ═══════════════════════════════════════════════════════════════════════════════ */
interface RoadmapItem { label: string; done: boolean; detail?: string }
interface PhaseData {
  id: string; num: number; title: string; subtitle: string; codename: string;
  color: string; sc: string; icon: string; glyph: string;
  items: RoadmapItem[];
  milestone?: { version: string; name: string; desc: string; status: "done" | "planned" | "future" };
  stats?: { loc?: string; crates?: string; tests?: string };
}

const PHASES: PhaseData[] = [
  {
    id: "foundation", num: 1, title: "Foundation & Boot", subtitle: "Bare-metal boot infrastructure, HAL, memory management",
    codename: "Genesis", color: "#4A90E2", sc: "74,144,226", icon: "🏗️", glyph: "α",
    stats: { loc: "~87K", crates: "3 boot protocols", tests: "342" },
    milestone: { version: "v0.1", name: "Boot", desc: "Kernel boots, serial output, basic memory", status: "done" },
    items: [
      { label: "Multiboot2 boot stub (32→64 bit)", done: true, detail: "2,670 LoC, MB2 header parsing, 64-bit trampoline" },
      { label: "Limine protocol support", done: true, detail: "6,500 LoC, 18 request types, multi-arch" },
      { label: "UEFI boot support", done: true, detail: "Full UEFI stack: GOP, Secure Boot, TPM 2.0, FAT, GPT" },
      { label: "GDT & TSS setup", done: true },
      { label: "IDT & exception handlers (0-31)", done: true, detail: "256 IDT entries, custom panic handler" },
      { label: "Physical memory manager (bitmap)", done: true, detail: "31,744 frames × 4 KiB for 128 MB" },
      { label: "Virtual memory (4-level page tables)", done: true, detail: "PML4, HHDM at 0xFFFF800000000000" },
      { label: "Heap allocator (bump → slab)", done: true, detail: "16 MB kernel heap, slab classes: 32-4096B" },
      { label: "Serial console output (COM1)", done: true, detail: "115200 baud, 8N1" },
      { label: "x86_64 HAL trait interface", done: true, detail: "~64K LoC, also AArch64 & RISC-V" },
      { label: "KASLR (kernel address randomization)", done: true, detail: "RDSEED/RDRAND/TSC entropy, 2MB-aligned" },
      { label: "Early boot subsystem (8 stages)", done: true, detail: "~23K LoC, PreInit → Handoff pipeline" },
      { label: "Stack guard pages", done: true },
    ],
  },
  {
    id: "core", num: 2, title: "Kernel Core & Subsystems", subtitle: "IPC, scheduling, modules, syscall framework",
    codename: "Pulse", color: "#7B68EE", sc: "123,104,238", icon: "⚙️", glyph: "β",
    stats: { loc: "~45K", crates: "core, modules_impl", tests: "218" },
    milestone: { version: "v0.3", name: "Modules", desc: "Module system with hot-reload & capabilities", status: "done" },
    items: [
      { label: "IPC channels (sync + async)", done: true, detail: "Typed channels, zero-copy fast path" },
      { label: "Event bus (pub/sub)", done: true, detail: "9 topics, 4 priority levels" },
      { label: "Message router", done: true },
      { label: "DIS scheduler (intent-based)", done: true, detail: "Dynamic Intent Scheduler: RT / System / Interactive / Batch / Idle" },
      { label: "Realtime scheduling class (EDF)", done: true, detail: "Earliest Deadline First, deadline guarantees" },
      { label: "Interactive & Batch classes", done: true },
      { label: "Module loading & lifecycle", done: true, detail: "ABI v0.4.0, max 256 modules" },
      { label: "Hot-reload with state transfer", done: true, detail: "Zero-downtime module upgrades" },
      { label: "Capability-based security", done: true, detail: "Mandatory access control, least privilege" },
      { label: "Syscall dispatch framework", done: true, detail: "512 entries, MSR LSTAR fast path" },
      { label: "Kernel panic handler", done: true },
      { label: "Init subsystem (DAG phases)", done: true, detail: "5 phases, Kahn's algorithm dependency resolution" },
      { label: "Orchestrator / resource broker", done: true },
    ],
  },
  {
    id: "advanced", num: 3, title: "Filesystem, Graphics & AI", subtitle: "HelixFS, Lumina GPU, NEXUS intelligence engine",
    codename: "Aurora", color: "#EC4899", sc: "236,72,153", icon: "🧠", glyph: "γ",
    stats: { loc: "~62K", crates: "fs, graphics, modules", tests: "189" },
    milestone: { version: "v0.5", name: "Graphics", desc: "Lumina + Magma GPU driver + NEXUS AI", status: "done" },
    items: [
      { label: "HelixFS on-disk format", done: true, detail: "Superblock, inodes, extents, 64-bit addressing" },
      { label: "B+Tree directory indexing", done: true, detail: "Adaptive Replacement Cache (ARC)" },
      { label: "Extent-based file storage", done: true },
      { label: "Journaling (WAL mode)", done: true, detail: "Write-Ahead Log, metadata + optional data" },
      { label: "Copy-on-Write (CoW) snapshots", done: true },
      { label: "Compression (LZ4 / Zstd)", done: true },
      { label: "Encryption (AES-256-GCM + Merkle)", done: true },
      { label: "Lumina GPU API (OpenGL + Vulkan)", done: true, detail: "Full GPU abstraction layer" },
      { label: "Magma GPU driver", done: true, detail: "17K LoC, 7 crates, command submission" },
      { label: "NEXUS intelligence engine", done: true, detail: "4 ML models: Decision Tree, Random Forest, NN, SVM" },
      { label: "Profile system (OS builder)", done: true, detail: "Custom OS variants from TOML config" },
      { label: "Benchmark suite", done: true, detail: "4K LoC, memory/scheduler/IPC/FS benchmarks" },
    ],
  },
  {
    id: "drivers", num: 4, title: "Drivers & User Space", subtitle: "VirtIO, input, networking, user-space init",
    codename: "Horizon", color: "#F59E0B", sc: "245,158,11", icon: "🌐", glyph: "δ",
    stats: { loc: "planned", crates: "drivers, userspace" },
    milestone: { version: "v0.7", name: "User Space", desc: "ELF loader, init process, shell, POSIX subset", status: "planned" },
    items: [
      { label: "VirtIO block driver", done: false, detail: "Virtqueue, device negotiation, block I/O" },
      { label: "VirtIO network driver", done: false },
      { label: "VirtIO console driver", done: false },
      { label: "PS/2 keyboard driver", done: false, detail: "Scancode set 2, key mapping" },
      { label: "Serial driver (16550 UART)", done: false },
      { label: "Framebuffer driver", done: false, detail: "Mode setting, double buffering" },
      { label: "User-space memory isolation", done: false, detail: "Per-process page tables, Ring 3" },
      { label: "ELF binary loader", done: false, detail: "ELF64, dynamic linking support" },
      { label: "Init process & user shell", done: false, detail: "PID 1, Helix Shell (hsh)" },
      { label: "POSIX-subset syscall API", done: false },
      { label: "AArch64 full boot support", done: false },
      { label: "RISC-V full boot support", done: false },
    ],
  },
  {
    id: "production", num: 5, title: "Hardening, SMP & Release", subtitle: "Multi-core, security hardening, real hardware",
    codename: "Apex", color: "#22C55E", sc: "34,197,94", icon: "🚀", glyph: "Ω",
    stats: { loc: "planned" },
    milestone: { version: "v1.0", name: "Release", desc: "SMP, security hardening, real hardware, stable APIs", status: "future" },
    items: [
      { label: "SMP support (multi-core scheduling)", done: false, detail: "Per-CPU run queues, work stealing" },
      { label: "NUMA-aware memory allocation", done: false },
      { label: "Security audit & hardening", done: false },
      { label: "SMEP / SMAP enforcement", done: false, detail: "Supervisor Mode Execution/Access Prevention" },
      { label: "ASLR (address space randomization)", done: false },
      { label: "Real hardware testing suite", done: false },
      { label: "Performance optimization pass", done: false },
      { label: "Comprehensive documentation", done: false },
      { label: "CI/CD pipeline (QEMU integration)", done: false },
      { label: "Stable API versioning", done: false },
    ],
  },
];

const MILESTONES = [
  { v: "v0.1", name: "Boot", desc: "Kernel boots, serial output, basic memory management", s: "done" as const, phase: 0 },
  { v: "v0.2", name: "Schedule", desc: "DIS scheduler operational with all 4 intent classes", s: "done" as const, phase: 1 },
  { v: "v0.3", name: "Modules", desc: "Module system with hot-reload & capability security", s: "done" as const, phase: 1 },
  { v: "v0.4", name: "Storage", desc: "HelixFS with B-tree, journaling, CoW, snapshots", s: "done" as const, phase: 2 },
  { v: "v0.5", name: "Graphics", desc: "Lumina + Magma GPU driver, NEXUS intelligence", s: "done" as const, phase: 2 },
  { v: "v0.6", name: "Drivers", desc: "VirtIO block/net, PS/2, serial, framebuffer", s: "planned" as const, phase: 3 },
  { v: "v0.7", name: "User Space", desc: "ELF loader, init process, user shell, POSIX subset", s: "planned" as const, phase: 3 },
  { v: "v1.0", name: "Release", desc: "SMP, security hardening, real hardware, stable APIs", s: "future" as const, phase: 4 },
];

const NON_GOALS = [
  "Full POSIX compliance — Helix aims for a modern, Rust-native API",
  "Linux binary compatibility — no goal to run Linux ELFs",
  "GUI window manager — Lumina provides GPU API, not a desktop environment",
  "Networking stack — beyond VirtIO net driver basics",
  "Package manager — out of scope for the kernel project",
];

/* ═══════════════════════════════════════════════════════════════════════════════
   STARFIELD CANVAS — Constellation background with phase-colored stars
   ═══════════════════════════════════════════════════════════════════════════════ */
function StarfieldCanvas({ activePhase }: { activePhase: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W = innerWidth, H = document.documentElement.scrollHeight;
    const resize = () => {
      W = innerWidth; H = Math.max(document.documentElement.scrollHeight, innerHeight);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    interface Star { x: number; y: number; r: number; phase: number; base: number; sp: number }
    const count = Math.min(Math.floor(W * H / 8000), 250);
    const stars: Star[] = [];
    for (let i = 0; i < count; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H, r: 0.3 + Math.random() * 1.8, phase: Math.floor(Math.random() * 5), base: 0.05 + Math.random() * 0.2, sp: 0.3 + Math.random() * 1.5 });
    }
    // Constellation lines — connect nearby same-phase stars
    const lines: { a: number; b: number }[] = [];
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        if (stars[i].phase !== stars[j].phase) continue;
        const d = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
        if (d < 120 && Math.random() < 0.3) lines.push({ a: i, b: j });
      }
    }

    const phaseRgb = [
      [74, 144, 226], [123, 104, 238], [236, 72, 153], [245, 158, 11], [34, 197, 94],
    ];
    let t = 0;
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, W, H);
      t++;
      for (const l of lines) {
        const sa = stars[l.a], sb = stars[l.b];
        const on = sa.phase === activePhase;
        const rgb = phaseRgb[sa.phase];
        ctx.beginPath(); ctx.moveTo(sa.x, sa.y); ctx.lineTo(sb.x, sb.y);
        ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${on ? 0.06 : 0.012})`;
        ctx.lineWidth = 0.5; ctx.stroke();
      }
      for (const s of stars) {
        const pulse = Math.sin(t * 0.015 * s.sp + s.x) * 0.5 + 0.5;
        const on = s.phase === activePhase;
        const rgb = phaseRgb[s.phase];
        const a = on ? s.base * (0.6 + pulse * 0.6) : s.base * (0.15 + pulse * 0.1);
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (on ? 1 + pulse * 0.3 : 1), 0, Math.PI * 2);
        ctx.fillStyle = on ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})` : `rgba(200,200,210,${a * 0.5})`;
        ctx.fill();
        if (on && s.r > 1.2) {
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a * 0.08})`;
          ctx.fill();
        }
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [activePhase]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ORBIT PROGRESS — Circular progress ring for a phase
   ═══════════════════════════════════════════════════════════════════════════════ */
function OrbitRing({ pct, color, size = 80, active }: { pct: number; color: string; size?: number; active: boolean }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width={size} height={size} className={`transition-transform duration-700 ${active ? "scale-110" : "scale-100"}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(63,63,70,0.2)" strokeWidth={3} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={active ? 4 : 3}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-1000 ease-out" style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", filter: active ? `drop-shadow(0 0 6px ${color}60)` : "none" }} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
        className="font-black tabular-nums" style={{ fontSize: size * 0.22, fill: active ? color : "#71717a" }}>
        {pct}%
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PHASE CARD — Expandable phase with items, detail tooltips, animations
   ═══════════════════════════════════════════════════════════════════════════════ */
function PhaseCard({ phase, active, onActivate }: { phase: PhaseData; active: boolean; onActivate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const done = phase.items.filter(i => i.done).length;
  const total = phase.items.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div id={`phase-${phase.num}`} className={`group relative rounded-3xl border overflow-hidden transition-all duration-700 ${active ? "shadow-2xl" : "hover:shadow-xl"}`}
      style={{
        borderColor: active ? `${phase.color}40` : "rgba(63,63,70,0.15)",
        background: active ? `linear-gradient(135deg, ${phase.color}08, transparent, ${phase.color}03)` : "rgba(12,12,14,0.6)",
        boxShadow: active ? `0 0 60px ${phase.color}12, 0 25px 50px -12px rgba(0,0,0,0.6)` : "",
      }}>
      {/* Glow bar top */}
      <div className="h-1 w-full transition-all duration-700" style={{ background: active ? `linear-gradient(90deg, transparent, ${phase.color}, transparent)` : `linear-gradient(90deg, transparent, ${phase.color}20, transparent)` }} />

      {/* Phase header */}
      <div className="p-6 md:p-8 cursor-pointer" onClick={onActivate}>
        <div className="flex items-start gap-5">
          {/* Orbit Ring */}
          <div className="shrink-0 hidden sm:block"><OrbitRing pct={pct} color={phase.color} active={active} /></div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg transition-all" style={{ color: phase.color, background: `${phase.color}15`, border: `1px solid ${phase.color}25` }}>
                PHASE {phase.num} — {phase.glyph}
              </span>
              <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">Codename: {phase.codename}</span>
              {pct === 100 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">✓ COMPLETE</span>}
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white mt-2 flex items-center gap-2">
              <span className="text-2xl">{phase.icon}</span> {phase.title}
            </h3>
            <p className="text-sm text-zinc-500 mt-1">{phase.subtitle}</p>
            {phase.stats && (
              <div className="flex items-center gap-4 mt-3">
                {phase.stats.loc && <span className="text-[10px] font-mono text-zinc-600"><span className="text-zinc-500 font-bold">{phase.stats.loc}</span> LoC</span>}
                {phase.stats.crates && <span className="text-[10px] font-mono text-zinc-600">{phase.stats.crates}</span>}
                {phase.stats.tests && <span className="text-[10px] font-mono text-zinc-600"><span className="text-zinc-500 font-bold">{phase.stats.tests}</span> tests</span>}
              </div>
            )}
          </div>

          {/* Done counter */}
          <div className="shrink-0 text-right">
            <div className="text-2xl font-black tabular-nums" style={{ color: phase.color }}>{done}<span className="text-zinc-700 text-lg">/{total}</span></div>
            <p className="text-[10px] text-zinc-700 font-mono">completed</p>
            <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="mt-3 text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1"
              style={{ borderColor: `${phase.color}30`, color: phase.color, background: expanded ? `${phase.color}10` : "transparent" }}>
              {expanded ? "Collapse" : "Details"}
              <svg className={`w-3 h-3 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 h-1.5 rounded-full bg-zinc-800/60 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${pct}%`, background: pct === 100 ? "#22C55E" : `linear-gradient(90deg, ${phase.color}, ${phase.color}CC)` }}>
            {pct < 100 && pct > 0 && <div className="absolute right-0 top-0 bottom-0 w-8 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${phase.color})`, animation: "shimmer 2s ease infinite" }} />}
          </div>
        </div>
      </div>

      {/* Expandable items */}
      <div className={`overflow-hidden transition-all duration-700 ease-out ${expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-6 md:px-8 pb-6 md:pb-8 border-t border-zinc-800/30 pt-5">
          <ul className="grid gap-2 sm:grid-cols-2">
            {phase.items.map((item, i) => (
              <li key={i} className="relative group/item flex items-start gap-2.5 text-sm py-1.5 px-2.5 rounded-lg transition-all hover:bg-white/[0.02] cursor-default"
                onMouseEnter={() => setHoveredItem(i)} onMouseLeave={() => setHoveredItem(null)}
                style={{ animation: expanded ? `fsi 0.3s ease ${i * 0.03}s both` : "none" }}>
                <span className={`mt-0.5 text-sm shrink-0 transition-transform duration-200 ${hoveredItem === i ? "scale-125" : ""}`}>
                  {item.done ? <span style={{ color: phase.color }}>✓</span> : <span className="text-zinc-700">○</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <span className={`${item.done ? "text-zinc-300" : "text-zinc-600"} leading-snug`}>{item.label}</span>
                  {item.detail && hoveredItem === i && (
                    <p className="text-[10px] text-zinc-600 mt-0.5 leading-snug" style={{ animation: "fsi 0.15s ease" }}>{item.detail}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MILESTONE TIMELINE — Horizontal scrollable milestone highway
   ═══════════════════════════════════════════════════════════════════════════════ */
function MilestoneTimeline() {
  const sc: Record<string, string> = { done: "#22C55E", planned: "#F59E0B", future: "#71717A" };
  const sl: Record<string, string> = { done: "✓ Complete", planned: "🔜 Planned", future: "⏳ Future" };
  return (
    <div className="relative">
      {/* Central line */}
      <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-zinc-800 to-transparent md:-translate-x-px" />

      <div className="space-y-8 md:space-y-12 relative">
        {MILESTONES.map((m, i) => {
          const left = i % 2 === 0;
          return (
            <div key={m.v} className={`relative flex items-center gap-6 ${left ? "md:flex-row" : "md:flex-row-reverse"}`} style={{ animation: `fsi 0.4s ease ${i * 0.06}s both` }}>
              {/* Content card */}
              <div className={`flex-1 ${left ? "md:text-right" : ""} pl-14 md:pl-0`}>
                <div className={`inline-block p-4 rounded-2xl border transition-all hover:scale-[1.02] cursor-default ${m.s === "done" ? "border-emerald-500/20 bg-emerald-500/[0.03]" : m.s === "planned" ? "border-yellow-500/20 bg-yellow-500/[0.03]" : "border-zinc-800/30 bg-zinc-900/20"}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-black text-lg" style={{ color: sc[m.s] }}>{m.v}</span>
                    <span className="text-white font-bold text-sm">— {m.name}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed max-w-xs">{m.desc}</p>
                  <span className="inline-block text-[10px] font-bold mt-2 px-2 py-0.5 rounded-full" style={{ color: sc[m.s], background: `${sc[m.s]}15` }}>{sl[m.s]}</span>
                </div>
              </div>

              {/* Node on line */}
              <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 w-5 h-5 rounded-full border-[3px] z-10 transition-all"
                style={{ borderColor: sc[m.s], background: m.s === "done" ? sc[m.s] : "#09090b", boxShadow: m.s === "done" ? `0 0 12px ${sc[m.s]}40` : "none" }}>
                {m.s === "done" && <svg className="w-full h-full p-0.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>

              {/* Other side (empty on mobile) */}
              <div className="flex-1 hidden md:block" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   OVERALL STATS BAR
   ═══════════════════════════════════════════════════════════════════════════════ */
function OverallStats() {
  const totalItems = PHASES.reduce((s, p) => s + p.items.length, 0);
  const doneItems = PHASES.reduce((s, p) => s + p.items.filter(i => i.done).length, 0);
  const pct = Math.round((doneItems / totalItems) * 100);
  const donePhases = PHASES.filter(p => p.items.every(i => i.done)).length;
  const doneMilestones = MILESTONES.filter(m => m.s === "done").length;

  const stats = [
    { label: "Overall Progress", value: `${pct}%`, color: "#7B68EE", big: true },
    { label: "Tasks Done", value: `${doneItems}/${totalItems}`, color: "#4A90E2" },
    { label: "Phases Complete", value: `${donePhases}/${PHASES.length}`, color: "#22C55E" },
    { label: "Milestones Hit", value: `${doneMilestones}/${MILESTONES.length}`, color: "#EC4899" },
    { label: "Codebase", value: "~194K LoC", color: "#F59E0B" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {stats.map((s, i) => (
        <div key={i} className={`relative overflow-hidden rounded-2xl border border-zinc-800/30 bg-[#0c0c0e] p-5 text-center group hover:scale-[1.02] transition-all cursor-default ${s.big ? "col-span-2 md:col-span-1" : ""}`}
          style={{ animation: `fsi 0.4s ease ${i * 0.08}s both` }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle at center, ${s.color}08, transparent 70%)` }} />
          <p className="text-2xl md:text-3xl font-black tabular-nums relative" style={{ color: s.color }}>{s.value}</p>
          <p className="text-[10px] text-zinc-600 font-medium mt-1 relative">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PHASE NAV — Floating navigation dots
   ═══════════════════════════════════════════════════════════════════════════════ */
function PhaseNav({ active, onChange }: { active: number; onChange: (i: number) => void }) {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-3">
      {PHASES.map((p, i) => (
        <button key={p.id} onClick={() => onChange(i)} title={`Phase ${p.num}: ${p.title}`}
          className="group relative cursor-pointer" >
          <div className={`w-3 h-3 rounded-full border-2 transition-all duration-500 ${active === i ? "scale-150" : "group-hover:scale-125"}`}
            style={{ borderColor: active === i ? p.color : "rgba(63,63,70,0.4)", background: active === i ? p.color : "transparent", boxShadow: active === i ? `0 0 10px ${p.color}50` : "none" }} />
          <span className={`absolute right-6 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${active === i ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"}`}
            style={{ color: p.color, background: `${p.color}15`, border: `1px solid ${p.color}25` }}>
            Phase {p.num}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function RoadmapPage() {
  const { locale } = useI18n();
  const s = (k: string) => getDocString(roadmapContent, locale, k);

  const [activePhase, setActivePhase] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll spy
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const idx = sectionRefs.current.indexOf(e.target as HTMLDivElement);
          if (idx >= 0) setActivePhase(idx);
        }
      }
    }, { threshold: 0.3, rootMargin: "-100px 0px -40% 0px" });
    sectionRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = useCallback((i: number) => {
    setActivePhase(i);
    const el = document.getElementById(`phase-${i + 1}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const totalItems = PHASES.reduce((s, p) => s + p.items.length, 0);
  const doneItems = PHASES.reduce((s, p) => s + p.items.filter(i => i.done).length, 0);
  const overallPct = Math.round((doneItems / totalItems) * 100);

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-helix-purple/40">
      <StarfieldCanvas activePhase={activePhase} />
      <PhaseNav active={activePhase} onChange={scrollTo} />

      <style>{`
        @keyframes fsi{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%,100%{opacity:0.3}50%{opacity:1}}
        @keyframes glow-pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
      `}</style>

      <main className="relative z-10">
        {/* ── HERO ── */}
        <div className="pt-28 pb-16 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-8 inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              {s("back_home")}
            </Link>

            <div className="flex items-center justify-center gap-3 mb-8">
              <HelixLogo className="w-12 h-12" />
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-helix-purple/10 border border-helix-purple/20 text-helix-purple text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-helix-purple animate-pulse" />
                {s("badge")}
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-helix-blue via-helix-purple to-pink-500">
                {s("title")}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-10">
              {s("subtitle")}{" "}
              <span className="text-zinc-600">5 phases, 8 milestones, {totalItems} tasks.</span>
            </p>

            {/* Grand progress bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-zinc-600">{s("overall_progress")}</span>
                <span className="text-sm font-black font-mono text-helix-purple">{overallPct}%</span>
              </div>
              <div className="h-3 rounded-full bg-zinc-800/60 overflow-hidden shadow-inner">
                <div className="h-full rounded-full relative" style={{ width: `${overallPct}%`, background: "linear-gradient(90deg, #4A90E2, #7B68EE, #EC4899)" }}>
                  <div className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(90deg, transparent 60%, rgba(255,255,255,0.15))", animation: "shimmer 3s ease infinite" }} />
                </div>
              </div>
              <div className="flex justify-between mt-3">
                {PHASES.map((p, i) => {
                  const phaseDone = p.items.filter(x => x.done).length;
                  const phasePct = Math.round((phaseDone / p.items.length) * 100);
                  return (
                    <button key={p.id} onClick={() => scrollTo(i)} className="group cursor-pointer text-center" title={`Phase ${p.num}: ${p.title}`}>
                      <div className="w-1 h-3 mx-auto mb-1 rounded-full transition-all" style={{ background: phasePct === 100 ? p.color : `${p.color}30` }} />
                      <span className="text-[8px] font-mono text-zinc-700 group-hover:text-zinc-400 transition-colors">{p.glyph}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="max-w-5xl mx-auto px-6 mb-16"><OverallStats /></div>

        {/* ── PHASES ── */}
        <div className="max-w-5xl mx-auto px-6 space-y-8 mb-20">
          {PHASES.map((p, i) => (
            <div key={p.id} ref={el => { sectionRefs.current[i] = el; }}>
              <PhaseCard phase={p} active={activePhase === i} onActivate={() => setActivePhase(i)} />
            </div>
          ))}
        </div>

        {/* ── MILESTONES ── */}
        <div className="max-w-4xl mx-auto px-6 mb-20">
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-zinc-600 tracking-widest uppercase">Release History</span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-3">{s("milestones")}</h2>
            <p className="text-sm text-zinc-500 mt-2 max-w-lg mx-auto">From first boot to production release — every step of the journey.</p>
          </div>
          <MilestoneTimeline />
        </div>

        {/* ── NON-GOALS ── */}
        <div className="max-w-4xl mx-auto px-6 mb-20">
          <div className="rounded-2xl border border-zinc-800/30 bg-[#0c0c0e] overflow-hidden">
            <div className="p-6 md:p-8 border-b border-zinc-800/20">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span className="text-red-400">⊘</span> {s("non_goals")}
              </h2>
              <p className="text-sm text-zinc-500 mt-1">To stay focused, the following are explicitly <strong className="text-white">out of scope</strong>:</p>
            </div>
            <ul className="p-6 md:p-8 space-y-3">
              {NON_GOALS.map((ng, i) => (
                <li key={i} className="flex items-start gap-3 text-sm" style={{ animation: `fsi 0.3s ease ${i * 0.05}s both` }}>
                  <span className="text-red-400/70 mt-0.5 shrink-0">✕</span>
                  <span className="text-zinc-400">{ng}</span>
                </li>
              ))}
              <li className="flex items-start gap-3 text-sm opacity-[0.06] hover:opacity-100 transition-opacity duration-1000 cursor-help" title="Or is it? Try the ancient code where kernels clash...">
                <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                <span className="text-zinc-400">Hidden kernel wars easter egg — <span className="text-zinc-500 text-xs">↑↑↓↓←→←→BA on /compare</span></span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <div className="rounded-3xl border border-helix-purple/20 bg-gradient-to-br from-helix-purple/5 to-transparent p-10 text-center">
            <HelixLogo className="w-16 h-16 mx-auto mb-6 opacity-30" />
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Want to contribute?</h2>
            <p className="text-sm text-zinc-500 max-w-lg mx-auto mb-6">Helix OS is open source. Pick a task from Phase 4 or 5 and help shape the future of operating systems.</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/contributing" className="px-6 py-3 rounded-xl bg-helix-purple/10 border border-helix-purple/20 text-helix-purple font-bold text-sm hover:bg-helix-purple/20 transition-all">
                Contributing Guide →
              </Link>
              <a href="https://github.com/HelixOS-Project/helix" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800/40 text-zinc-400 font-bold text-sm hover:text-white hover:border-zinc-700 transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
