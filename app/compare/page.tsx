"use client";
import { useState, useMemo } from "react";
import Footer from "@/helix-wiki/components/Footer";
import Link from "next/link";

/* ── Data ── */
type Rating = "excellent" | "good" | "moderate" | "limited" | "none";
interface Feature {
  category: string;
  features: {
    name: string;
    helix: { rating: Rating; detail: string };
    linux: { rating: Rating; detail: string };
    zircon: { rating: Rating; detail: string };
    sel4: { rating: Rating; detail: string };
  }[];
}

const ratingColors: Record<Rating, { bg: string; text: string; border: string; label: string; bar: string }> = {
  excellent: { bg: "rgba(34,197,94,0.1)",   text: "#22C55E", border: "rgba(34,197,94,0.3)",   label: "Excellent", bar: "bg-emerald-500" },
  good:      { bg: "rgba(74,144,226,0.1)",  text: "#4A90E2", border: "rgba(74,144,226,0.3)",  label: "Good",      bar: "bg-blue-500" },
  moderate:  { bg: "rgba(245,158,11,0.1)",  text: "#F59E0B", border: "rgba(245,158,11,0.3)",  label: "Moderate",  bar: "bg-amber-500" },
  limited:   { bg: "rgba(249,115,22,0.1)",  text: "#F97316", border: "rgba(249,115,22,0.3)",  label: "Limited",   bar: "bg-orange-500" },
  none:      { bg: "rgba(161,161,170,0.05)",text: "#52525B", border: "rgba(161,161,170,0.15)",label: "None",      bar: "bg-zinc-700" },
};

const ratingValue: Record<Rating, number> = { excellent: 4, good: 3, moderate: 2, limited: 1, none: 0 };

const DATA: Feature[] = [
  {
    category: "Kernel Architecture",
    features: [
      {
        name: "Kernel Type",
        helix:  { rating: "excellent", detail: "Modular hybrid — trait-based, everything is swappable" },
        linux:  { rating: "good",      detail: "Monolithic with loadable modules" },
        zircon: { rating: "good",      detail: "Microkernel — minimal kernel, services in userspace" },
        sel4:   { rating: "excellent", detail: "Formally verified microkernel — mathematically proven" },
      },
      {
        name: "Hot-Reload Modules",
        helix:  { rating: "excellent", detail: "First-class: pause → export state → swap → import → activate" },
        linux:  { rating: "moderate",  detail: "Loadable kernel modules (insmod/rmmod), no state migration" },
        zircon: { rating: "limited",   detail: "Userspace services can be restarted, no kernel module swap" },
        sel4:   { rating: "none",      detail: "Static kernel — no module loading by design" },
      },
      {
        name: "Self-Healing",
        helix:  { rating: "excellent", detail: "NEXUS AI: crash prediction, quarantine, auto-recovery, hot-swap" },
        linux:  { rating: "limited",   detail: "Kernel oops + panic, watchdog timers, kexec for fast reboot" },
        zircon: { rating: "moderate",  detail: "Process isolation — crashed services restart independently" },
        sel4:   { rating: "moderate",  detail: "Isolation guarantees prevent cascade, but no auto-recovery" },
      },
      {
        name: "Language / Safety",
        helix:  { rating: "excellent", detail: "100% Rust, no_std, zero unsafe in module API surface" },
        linux:  { rating: "moderate",  detail: "C + growing Rust support, memory safety depends on discipline" },
        zircon: { rating: "good",      detail: "C++ core, strong coding standards, sanitizers" },
        sel4:   { rating: "excellent", detail: "C + formal verification in Isabelle/HOL — proven correct" },
      },
    ],
  },
  {
    category: "Security Model",
    features: [
      {
        name: "Capability System",
        helix:  { rating: "excellent", detail: "Fine-grained capabilities for every resource access" },
        linux:  { rating: "moderate",  detail: "POSIX caps + LSM (SELinux, AppArmor), coarse-grained" },
        zircon: { rating: "excellent", detail: "Object capabilities — all access via handles" },
        sel4:   { rating: "excellent", detail: "Capability-based access control — formally verified" },
      },
      {
        name: "KASLR",
        helix:  { rating: "good",      detail: "Full KASLR via relocation subsystem (4K+ lines)" },
        linux:  { rating: "excellent", detail: "Mature KASLR, per-boot randomization, kASLR+fgKASLR" },
        zircon: { rating: "good",      detail: "KASLR for kernel and userspace" },
        sel4:   { rating: "limited",   detail: "Static addresses by design — not a priority" },
      },
      {
        name: "Filesystem Encryption",
        helix:  { rating: "excellent", detail: "Per-file AES-256 + Merkle tree integrity in HelixFS" },
        linux:  { rating: "good",      detail: "fscrypt (ext4/f2fs), dm-crypt, LUKS" },
        zircon: { rating: "moderate",  detail: "Fxfs supports encryption, still maturing" },
        sel4:   { rating: "none",      detail: "No filesystem — pure microkernel" },
      },
    ],
  },
  {
    category: "System Calls & IPC",
    features: [
      {
        name: "Syscall Interface",
        helix:  { rating: "good",      detail: "512-entry table, 6-arg ABI, Linux-compatible errno" },
        linux:  { rating: "excellent", detail: "~450 syscalls, decades of stability, POSIX compliant" },
        zircon: { rating: "good",      detail: "~170 syscalls, object-oriented, handle-based" },
        sel4:   { rating: "moderate",  detail: "~12 syscalls — extreme minimality by design" },
      },
      {
        name: "IPC Mechanisms",
        helix:  { rating: "excellent", detail: "3 types: shared memory (lock-free), event bus (pub/sub), message router" },
        linux:  { rating: "excellent", detail: "Pipes, sockets, shared mem, signals, futex, io_uring" },
        zircon: { rating: "excellent", detail: "Channels, sockets, FIFOs, ports, VMOs — rich IPC" },
        sel4:   { rating: "good",      detail: "Synchronous IPC + notifications — fast but simple" },
      },
      {
        name: "Async I/O",
        helix:  { rating: "good",      detail: "Event-driven with async kernel tasks" },
        linux:  { rating: "excellent", detail: "io_uring — best-in-class async I/O" },
        zircon: { rating: "good",      detail: "Port-based async notifications" },
        sel4:   { rating: "limited",   detail: "No built-in async — synchronous by design" },
      },
    ],
  },
  {
    category: "Memory Management",
    features: [
      {
        name: "Virtual Memory",
        helix:  { rating: "good",      detail: "4-level page tables, demand paging, CoW" },
        linux:  { rating: "excellent", detail: "5-level paging, THP, NUMA, KSM, memory cgroups" },
        zircon: { rating: "good",      detail: "VMOs (Virtual Memory Objects), CoW, pager support" },
        sel4:   { rating: "moderate",  detail: "Minimal — address spaces, untyped memory, manual page tables" },
      },
      {
        name: "ML-Powered Tuning",
        helix:  { rating: "excellent", detail: "NEXUS optimizes allocator, cache, scheduler in real-time" },
        linux:  { rating: "limited",   detail: "Static heuristics (vm.swappiness, etc.), no ML" },
        zircon: { rating: "none",      detail: "No ML integration" },
        sel4:   { rating: "none",      detail: "No ML integration — minimality focus" },
      },
    ],
  },
  {
    category: "Scheduling",
    features: [
      {
        name: "Scheduler Type",
        helix:  { rating: "excellent", detail: "DIS — CFS-inspired with ML tuning, per-CPU queues, work stealing" },
        linux:  { rating: "excellent", detail: "CFS + EEVDF (6.6+), SCHED_DEADLINE, BPF scheduler" },
        zircon: { rating: "good",      detail: "Fair scheduler with priority inheritance" },
        sel4:   { rating: "moderate",  detail: "Fixed-priority round-robin — simple but predictable" },
      },
      {
        name: "Real-Time Support",
        helix:  { rating: "moderate",  detail: "Priority classes (RT, System, Interactive, Batch, Idle)" },
        linux:  { rating: "excellent", detail: "PREEMPT_RT, SCHED_FIFO/RR, latency guarantees" },
        zircon: { rating: "moderate",  detail: "Priority profiles, fair scheduling" },
        sel4:   { rating: "excellent", detail: "Formally verified worst-case execution time guarantees" },
      },
    ],
  },
  {
    category: "Graphics & GPU",
    features: [
      {
        name: "GPU Stack",
        helix:  { rating: "excellent", detail: "Lumina: 197K lines, 14 crates, shader compiler, render graph" },
        linux:  { rating: "excellent", detail: "DRM/KMS + Mesa, Vulkan, OpenGL — mature ecosystem" },
        zircon: { rating: "moderate",  detail: "Magma GPU driver, Scenic compositor, Vulkan via virtio" },
        sel4:   { rating: "none",      detail: "No graphics — pure microkernel" },
      },
      {
        name: "Shader Compiler",
        helix:  { rating: "excellent", detail: "Built-in: Source → IR → SPIR-V with optimization passes" },
        linux:  { rating: "excellent", detail: "Mesa NIR, LLVM AMDGPU, Intel compiler — userspace" },
        zircon: { rating: "limited",   detail: "Relies on external compilers" },
        sel4:   { rating: "none",      detail: "N/A" },
      },
    ],
  },
  {
    category: "Architecture Support",
    features: [
      {
        name: "Supported Architectures",
        helix:  { rating: "good",      detail: "x86_64, AArch64, RISC-V 64 — via HAL trait abstraction" },
        linux:  { rating: "excellent", detail: "30+ architectures — unmatched breadth" },
        zircon: { rating: "moderate",  detail: "x86_64, ARM64" },
        sel4:   { rating: "good",      detail: "x86_64, ARM, RISC-V — verified on ARM" },
      },
      {
        name: "Multi-Core",
        helix:  { rating: "good",      detail: "SMP with per-CPU run queues and work stealing" },
        linux:  { rating: "excellent", detail: "Full SMP, NUMA, CPU hotplug, cgroup cpusets" },
        zircon: { rating: "good",      detail: "SMP support with CPU affinity" },
        sel4:   { rating: "moderate",  detail: "SMP verified on ARM, not all platforms" },
      },
    ],
  },
  {
    category: "AI / Intelligence",
    features: [
      {
        name: "Kernel AI Subsystem",
        helix:  { rating: "excellent", detail: "NEXUS: 812K lines — prediction, anomaly, healing, optimization" },
        linux:  { rating: "limited",   detail: "BPF-based observability, no built-in AI" },
        zircon: { rating: "none",      detail: "No AI subsystem" },
        sel4:   { rating: "none",      detail: "No AI — formal methods focus" },
      },
      {
        name: "Crash Prediction",
        helix:  { rating: "excellent", detail: "ML models: Decision Tree, Random Forest, Neural Net, SVM" },
        linux:  { rating: "none",      detail: "No prediction — reactive only" },
        zircon: { rating: "none",      detail: "No prediction" },
        sel4:   { rating: "none",      detail: "Crashes are formally impossible (for verified components)" },
      },
    ],
  },
];

const OS_COLORS = {
  helix:  { primary: "#7B68EE", bg: "rgba(123,104,238,0.08)", border: "rgba(123,104,238,0.25)", gradient: "from-purple-500 to-blue-500" },
  linux:  { primary: "#F59E0B", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)",  gradient: "from-amber-500 to-yellow-500" },
  zircon: { primary: "#EC4899", bg: "rgba(236,72,153,0.08)",  border: "rgba(236,72,153,0.25)",  gradient: "from-pink-500 to-rose-500" },
  sel4:   { primary: "#22C55E", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.25)",   gradient: "from-emerald-500 to-green-500" },
};

const OS_INFO = {
  helix:  { name: "Helix OS", type: "Modular Hybrid", lang: "Rust", year: "2024", lines: "~1M", icon: "🧬" },
  linux:  { name: "Linux",    type: "Monolithic",     lang: "C/Rust", year: "1991", lines: "~36M", icon: "🐧" },
  zircon: { name: "Zircon",   type: "Microkernel",    lang: "C++",   year: "2016", lines: "~2M",  icon: "💎" },
  sel4:   { name: "seL4",     type: "Verified μkernel", lang: "C/Isabelle", year: "2009", lines: "~10K", icon: "🔒" },
};

type OSKey = keyof typeof OS_INFO;

export default function ComparePage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [highlightOS, setHighlightOS] = useState<OSKey | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<{ cat: number; feat: number } | null>(null);

  // Compute scores
  const scores = useMemo(() => {
    const s: Record<OSKey, number> = { helix: 0, linux: 0, zircon: 0, sel4: 0 };
    let total = 0;
    for (const cat of DATA) {
      for (const f of cat.features) {
        s.helix  += ratingValue[f.helix.rating];
        s.linux  += ratingValue[f.linux.rating];
        s.zircon += ratingValue[f.zircon.rating];
        s.sel4   += ratingValue[f.sel4.rating];
        total++;
      }
    }
    const max = total * 4;
    return { helix: s.helix, linux: s.linux, zircon: s.zircon, sel4: s.sel4, max };
  }, []);

  const selFeat = selectedFeature ? DATA[selectedFeature.cat]?.features[selectedFeature.feat] : null;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-helix-purple/40">
      <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="fixed top-[-200px] left-[-200px] w-[600px] h-[600px] bg-helix-blue/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-helix-purple/10 rounded-full blur-[150px] pointer-events-none" />

      <style>{`
        @keyframes slideIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes barGrow { 0% { width: 0; } 100% { width: var(--bar-w); } }
        .animate-slide { animation: slideIn 0.3s ease; }
        .bar-animate { animation: barGrow 0.8s ease forwards; }
      `}</style>

      <main className="relative">
        {/* Header */}
        <div className="pt-28 pb-12 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-6 inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Home
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-helix-purple/10 border border-helix-purple/20 text-helix-purple text-xs font-mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-helix-purple animate-pulse" />
              Architecture Comparison Tool
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-helix-blue via-helix-purple to-pink-500">Kernel vs Kernel</span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Compare Helix OS against Linux, Google Zircon (Fuchsia), and seL4 across architecture, security, IPC, scheduling, and AI capabilities.
            </p>
          </div>
        </div>

        {/* OS Cards */}
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.entries(OS_INFO) as [OSKey, typeof OS_INFO.helix][]).map(([key, info]) => {
              const c = OS_COLORS[key];
              const pct = Math.round((scores[key] / scores.max) * 100);
              return (
                <button key={key} onClick={() => setHighlightOS(highlightOS === key ? null : key)}
                  className={`relative p-4 rounded-xl border transition-all duration-300 text-left cursor-pointer ${highlightOS === key ? "scale-[1.03] shadow-lg" : "hover:scale-[1.01]"}`}
                  style={{ background: highlightOS === key ? c.bg : "rgba(24,24,27,0.5)", borderColor: highlightOS === key ? c.border : "rgba(63,63,70,0.3)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{info.icon}</span>
                    <span className="font-bold text-sm" style={{ color: highlightOS === key ? c.primary : "#fff" }}>{info.name}</span>
                  </div>
                  <div className="space-y-1 text-[10px] text-zinc-500">
                    <p>{info.type} · {info.lang}</p>
                    <p>{info.lines} lines · Since {info.year}</p>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full rounded-full bar-animate" style={{ ["--bar-w" as string]: `${pct}%`, background: c.primary }} />
                  </div>
                  <p className="text-[10px] mt-1 font-mono" style={{ color: c.primary }}>{pct}% score</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparison table */}
        <div className="max-w-6xl mx-auto px-6 pb-16">
          <div className="space-y-4">
            {DATA.map((cat, ci) => (
              <div key={cat.category} className="rounded-xl border border-zinc-800/60 overflow-hidden bg-zinc-950/50 backdrop-blur-sm">
                {/* Category header */}
                <button onClick={() => setExpandedCategory(expandedCategory === cat.category ? null : cat.category)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-900/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full bg-gradient-to-b from-helix-blue to-helix-purple" />
                    <h2 className="font-bold text-white text-sm">{cat.category}</h2>
                    <span className="text-[10px] font-mono text-zinc-600">{cat.features.length} features</span>
                  </div>
                  <svg className={`w-4 h-4 text-zinc-600 transition-transform duration-300 ${expandedCategory === cat.category ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {/* Features */}
                {(expandedCategory === cat.category || expandedCategory === null) && (
                  <div className="animate-slide">
                    {/* Column headers */}
                    <div className="hidden md:grid grid-cols-[200px_1fr_1fr_1fr_1fr] gap-px bg-zinc-800/30 px-5 py-2 border-t border-zinc-800/40">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Feature</div>
                      {(Object.entries(OS_INFO) as [OSKey, typeof OS_INFO.helix][]).map(([key, info]) => (
                        <div key={key} className="text-[10px] font-bold uppercase tracking-wider text-center" style={{ color: OS_COLORS[key].primary }}>
                          {info.icon} {info.name}
                        </div>
                      ))}
                    </div>

                    {cat.features.map((feat, fi) => {
                      const isSelected = selectedFeature?.cat === ci && selectedFeature?.feat === fi;
                      return (
                        <div key={feat.name}>
                          <button onClick={() => setSelectedFeature(isSelected ? null : { cat: ci, feat: fi })}
                            className={`w-full grid grid-cols-1 md:grid-cols-[200px_1fr_1fr_1fr_1fr] gap-3 md:gap-px px-5 py-3 border-t border-zinc-800/30 hover:bg-zinc-900/40 transition-colors cursor-pointer ${isSelected ? "bg-zinc-900/60" : ""}`}>
                            <div className="text-xs font-medium text-zinc-300 text-left flex items-center gap-2">
                              {feat.name}
                              <svg className={`w-3 h-3 text-zinc-600 transition-transform ${isSelected ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                            {(["helix", "linux", "zircon", "sel4"] as OSKey[]).map((os) => {
                              const r = feat[os];
                              const rc = ratingColors[r.rating];
                              const dimmed = highlightOS && highlightOS !== os;
                              return (
                                <div key={os} className={`flex items-center justify-center transition-opacity duration-300 ${dimmed ? "opacity-25" : "opacity-100"}`}>
                                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold" style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}>
                                    {rc.label}
                                  </span>
                                </div>
                              );
                            })}
                          </button>

                          {/* Detail panel */}
                          {isSelected && selFeat && (
                            <div className="px-5 py-4 bg-zinc-900/40 border-t border-zinc-800/30 animate-slide">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {(["helix", "linux", "zircon", "sel4"] as OSKey[]).map((os) => {
                                  const r = selFeat[os];
                                  const rc = ratingColors[r.rating];
                                  const oc = OS_COLORS[os];
                                  return (
                                    <div key={os} className="rounded-lg p-3 border" style={{ background: oc.bg, borderColor: oc.border }}>
                                      <div className="flex items-center gap-2 mb-2">
                                        <span>{OS_INFO[os].icon}</span>
                                        <span className="text-xs font-bold" style={{ color: oc.primary }}>{OS_INFO[os].name}</span>
                                        <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: rc.bg, color: rc.text }}>{rc.label}</span>
                                      </div>
                                      <p className="text-[11px] text-zinc-400 leading-relaxed">{r.detail}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Score summary */}
          <div className="mt-12 rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-6 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-4 h-4 text-helix-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Overall Score Breakdown
            </h3>
            <div className="space-y-4">
              {(Object.entries(OS_INFO) as [OSKey, typeof OS_INFO.helix][])
                .sort((a, b) => scores[b[0]] - scores[a[0]])
                .map(([key, info], rank) => {
                  const pct = Math.round((scores[key] / scores.max) * 100);
                  const c = OS_COLORS[key];
                  return (
                    <div key={key} className="flex items-center gap-4">
                      <span className="text-lg font-bold text-zinc-700 w-6 text-center">#{rank + 1}</span>
                      <span className="text-lg">{info.icon}</span>
                      <span className="text-sm font-bold w-24" style={{ color: c.primary }}>{info.name}</span>
                      <div className="flex-1 h-3 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full rounded-full bar-animate" style={{ ["--bar-w" as string]: `${pct}%`, background: `linear-gradient(90deg, ${c.primary}, ${c.primary}aa)` }} />
                      </div>
                      <span className="text-sm font-mono font-bold w-12 text-right" style={{ color: c.primary }}>{pct}%</span>
                      <span className="text-[10px] text-zinc-600 w-16 text-right">{scores[key]}/{scores.max}</span>
                    </div>
                  );
                })}
            </div>
            <p className="text-[10px] text-zinc-700 mt-4 text-center">
              Scores are indicative and reflect feature richness in each category · Not an objective quality ranking
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
