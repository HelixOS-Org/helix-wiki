"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Footer from "@/helix-wiki/components/Footer";
import Link from "next/link";

/* ── Boot phases ── */
interface BootLine {
  text: string;
  color?: string;
  delay?: number; // ms before showing this line
  icon?: string;
}

interface BootPhase {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  duration: number; // total ms for this phase
  lines: BootLine[];
}

const PHASES: BootPhase[] = [
  {
    id: "bios", title: "BIOS / UEFI", subtitle: "Firmware Initialization", color: "#A1A1AA", icon: "⚡",
    duration: 2400,
    lines: [
      { text: "American Megatrends BIOS v2.20.1271", color: "#A1A1AA", delay: 0 },
      { text: "Copyright (C) 2026 QEMU Virtual Platform", color: "#71717A", delay: 200 },
      { text: "", delay: 300 },
      { text: "CPU: QEMU Virtual CPU @ 2.00GHz", color: "#F59E0B", delay: 400 },
      { text: "RAM: 128 MB OK", color: "#22C55E", delay: 600 },
      { text: "USB: No devices found", color: "#71717A", delay: 800 },
      { text: "PCI: Scanning bus 0...", color: "#4A90E2", delay: 1000 },
      { text: "  Bus 0, Device 0: Host bridge [QEMU]", color: "#71717A", delay: 1100 },
      { text: "  Bus 0, Device 1: ISA bridge", color: "#71717A", delay: 1200 },
      { text: "  Bus 0, Device 2: VGA controller [bochs-display]", color: "#71717A", delay: 1300 },
      { text: "Boot order: CD-ROM, Hard Disk, Network", color: "#A1A1AA", delay: 1600 },
      { text: "Booting from CD-ROM...", color: "#22C55E", delay: 2000 },
    ],
  },
  {
    id: "grub", title: "GRUB Multiboot2", subtitle: "Bootloader Stage", color: "#F59E0B", icon: "📀",
    duration: 2200,
    lines: [
      { text: "GRUB loading...", color: "#F59E0B", delay: 0 },
      { text: "                    GNU GRUB  version 2.06", color: "#FFFFFF", delay: 300 },
      { text: "", delay: 400 },
      { text: " ┌────────────────────────────────────────────┐", color: "#F59E0B", delay: 500 },
      { text: " │  Helix OS v0.4.0 \"Aurora\"                  │", color: "#FFFFFF", delay: 600 },
      { text: " │  Helix OS (Debug Mode)                     │", color: "#71717A", delay: 700 },
      { text: " │  Helix OS (Recovery)                       │", color: "#71717A", delay: 800 },
      { text: " └────────────────────────────────────────────┘", color: "#F59E0B", delay: 900 },
      { text: "", delay: 1000 },
      { text: "Loading kernel: /boot/helix-kernel ... 406 KB", color: "#22C55E", delay: 1100 },
      { text: "Multiboot2 header found at offset 0x1000", color: "#4A90E2", delay: 1400 },
      { text: "Passing memory map, framebuffer, RSDP to kernel", color: "#4A90E2", delay: 1600 },
      { text: "Jumping to kernel entry point 0xFFFF800000100000", color: "#7B68EE", delay: 2000 },
    ],
  },
  {
    id: "early", title: "Early Kernel Init", subtitle: "Phase 1: Boot", color: "#4A90E2", icon: "🔧",
    duration: 2600,
    lines: [
      { text: "[  0.000000] helix: Kernel entry point reached", color: "#4A90E2", delay: 0 },
      { text: "[  0.000001] helix: HelixOS v0.4.0-aurora (x86_64)", color: "#FFFFFF", delay: 100 },
      { text: "[  0.000002] helix: Built with rustc 1.82.0-nightly", color: "#71717A", delay: 200 },
      { text: "[  0.000010] serial: COM1 initialized at 0x3F8 (115200 baud)", color: "#22C55E", delay: 400 },
      { text: "[  0.000011] serial: Debug output active on COM1", color: "#22C55E", delay: 500 },
      { text: "[  0.000100] memory: Parsing Multiboot2 memory map...", color: "#4A90E2", delay: 700 },
      { text: "[  0.000150] memory: Physical: 128 MB total, 124 MB usable", color: "#22C55E", delay: 900 },
      { text: "[  0.000200] memory: Frame allocator: 31744 frames (4 KiB each)", color: "#4A90E2", delay: 1100 },
      { text: "[  0.000300] memory: HHDM base: 0xFFFF800000000000", color: "#71717A", delay: 1200 },
      { text: "[  0.000500] paging: PML4 table at 0xFFFF800000001000", color: "#4A90E2", delay: 1400 },
      { text: "[  0.000600] paging: Kernel mapped: 0xFFFF800000000000..0xFFFF800008000000", color: "#4A90E2", delay: 1500 },
      { text: "[  0.001000] idt: Interrupt Descriptor Table loaded (256 entries)", color: "#22C55E", delay: 1800 },
      { text: "[  0.001100] idt: Exception handlers registered (0-31)", color: "#22C55E", delay: 1900 },
      { text: "[  0.001200] apic: Local APIC at 0xFEE00000 (xAPIC mode)", color: "#4A90E2", delay: 2100 },
      { text: "[  0.001300] apic: I/O APIC at 0xFEC00000, GSI base 0", color: "#4A90E2", delay: 2200 },
      { text: "[  0.001400] ✓ Phase 1 (Boot) complete: serial + memory + interrupts", color: "#22C55E", delay: 2400, icon: "✓" },
    ],
  },
  {
    id: "core", title: "Core Services", subtitle: "Phases 2-3: Early + Core", color: "#7B68EE", icon: "⚙️",
    duration: 3000,
    lines: [
      { text: "[  0.002000] hpet: HPET found at 0xFED00000 (3 timers)", color: "#7B68EE", delay: 0 },
      { text: "[  0.002100] hpet: Timer 0 configured: 1 ms period (1000 Hz)", color: "#7B68EE", delay: 200 },
      { text: "[  0.002200] timer: Kernel tick source: HPET (fallback: PIT)", color: "#22C55E", delay: 400 },
      { text: "[  0.003000] sched: DIS scheduler initialized", color: "#7B68EE", delay: 600 },
      { text: "[  0.003100] sched: CPU 0 run queue created (idle task: PID 0)", color: "#4A90E2", delay: 800 },
      { text: "[  0.003200] sched: Time slice: 10ms, classes: RT/System/Interactive/Batch/Idle", color: "#71717A", delay: 900 },
      { text: "[  0.003500] ✓ Phase 2 (Early) complete: timer + scheduler", color: "#22C55E", delay: 1100, icon: "✓" },
      { text: "[  0.004000] ipc: Event bus initialized (9 topics, 4 priority levels)", color: "#7B68EE", delay: 1300 },
      { text: "[  0.004100] ipc: Message router started (0 modules registered)", color: "#7B68EE", delay: 1500 },
      { text: "[  0.004200] ipc: Shared memory pool: 4 MB reserved", color: "#71717A", delay: 1600 },
      { text: "[  0.005000] syscall: Dispatch table loaded (512 entries)", color: "#7B68EE", delay: 1800 },
      { text: "[  0.005100] syscall: MSR LSTAR = 0xFFFF800000050000 (SYSCALL entry)", color: "#4A90E2", delay: 2000 },
      { text: "[  0.006000] modules: Module registry initialized", color: "#7B68EE", delay: 2200 },
      { text: "[  0.006100] modules: ABI version: 0.4.0, max modules: 256", color: "#71717A", delay: 2400 },
      { text: "[  0.006200] ✓ Phase 3 (Core) complete: ipc + syscalls + modules", color: "#22C55E", delay: 2700, icon: "✓" },
    ],
  },
  {
    id: "late", title: "Late Services", subtitle: "Phase 4: Late", color: "#22D3EE", icon: "🌐",
    duration: 2800,
    lines: [
      { text: "[  0.010000] vfs: Virtual File System initialized", color: "#22D3EE", delay: 0 },
      { text: "[  0.010500] helixfs: Mounting root filesystem (HelixFS v1.0)", color: "#22D3EE", delay: 200 },
      { text: "[  0.011000] helixfs: B+Tree index loaded, 0 inodes", color: "#4A90E2", delay: 400 },
      { text: "[  0.011500] helixfs: ARC cache: 16 MB (ghost lists enabled)", color: "#71717A", delay: 500 },
      { text: "[  0.012000] helixfs: Transaction log initialized (WAL mode)", color: "#71717A", delay: 600 },
      { text: "[  0.015000] net: Loopback interface UP (127.0.0.1)", color: "#22D3EE", delay: 900 },
      { text: "[  0.016000] net: TCP/IP stack initialized", color: "#22D3EE", delay: 1100 },
      { text: "[  0.020000] pci: Device enumeration complete (3 devices)", color: "#22D3EE", delay: 1400 },
      { text: "[  0.021000] gpu: Bochs VGA detected (1024x768, 32bpp)", color: "#EC4899", delay: 1600 },
      { text: "[  0.025000] security: Capability system active (permissive mode)", color: "#F59E0B", delay: 1900 },
      { text: "[  0.025100] security: Audit logging enabled", color: "#F59E0B", delay: 2100 },
      { text: "[  0.026000] ✓ Phase 4 (Late) complete: vfs + net + devices + security", color: "#22C55E", delay: 2500, icon: "✓" },
    ],
  },
  {
    id: "nexus", title: "NEXUS AI Init", subtitle: "Intelligence Subsystem", color: "#EC4899", icon: "🧠",
    duration: 2200,
    lines: [
      { text: "[  0.030000] nexus: NEXUS Intelligence Engine v0.4.0 starting...", color: "#EC4899", delay: 0 },
      { text: "[  0.030500] nexus: Loading ML models...", color: "#EC4899", delay: 300 },
      { text: "[  0.031000] nexus/ml: Decision Tree       ✓  (1,200 nodes)", color: "#22C55E", delay: 500 },
      { text: "[  0.031500] nexus/ml: Random Forest        ✓  (50 trees)", color: "#22C55E", delay: 700 },
      { text: "[  0.032000] nexus/ml: Neural Network       ✓  (3 layers, 128 neurons)", color: "#22C55E", delay: 900 },
      { text: "[  0.033000] nexus: Anomaly detector online (4 engines)", color: "#EC4899", delay: 1100 },
      { text: "[  0.033500] nexus: Crash predictor active (confidence: 0.87)", color: "#EC4899", delay: 1300 },
      { text: "[  0.034000] nexus: Health monitor started (heartbeat: 100ms)", color: "#22C55E", delay: 1500 },
      { text: "[  0.034500] nexus: Self-healer ready (strategies: 4, max retries: 3)", color: "#22C55E", delay: 1700 },
      { text: "[  0.035000] nexus: ✓ NEXUS fully operational (Level L2: Predictive)", color: "#EC4899", delay: 2000, icon: "✓" },
    ],
  },
  {
    id: "runtime", title: "Runtime", subtitle: "Phase 5: Userspace", color: "#22C55E", icon: "🚀",
    duration: 2000,
    lines: [
      { text: "[  0.040000] init: Creating initial process (PID 1)", color: "#22C55E", delay: 0 },
      { text: "[  0.040500] init: User page tables configured", color: "#4A90E2", delay: 200 },
      { text: "[  0.041000] init: Switching to Ring 3...", color: "#7B68EE", delay: 400 },
      { text: "[  0.042000] init: PID 1 running in userspace", color: "#22C55E", delay: 700 },
      { text: "[  0.050000] hsh: Helix Shell v0.4.0 starting...", color: "#22C55E", delay: 1000 },
      { text: "[  0.050100] hsh: stdio connected to COM1", color: "#71717A", delay: 1100 },
      { text: "", delay: 1300 },
      { text: "═══════════════════════════════════════════════════════", color: "#7B68EE", delay: 1400 },
      { text: "  Helix OS v0.4.0 \"Aurora\" — Boot complete in 50ms", color: "#FFFFFF", delay: 1500 },
      { text: "  Kernel: 406 KB · Modules: 0 · NEXUS: Level 2", color: "#71717A", delay: 1600 },
      { text: "═══════════════════════════════════════════════════════", color: "#7B68EE", delay: 1700 },
      { text: "", delay: 1800 },
      { text: "helix@localhost:~$ █", color: "#22C55E", delay: 1900 },
    ],
  },
];

export default function BootPage() {
  const [currentPhase, setCurrentPhase] = useState(-1);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [speed, setSpeed] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const playPhase = useCallback((phaseIndex: number) => {
    if (phaseIndex >= PHASES.length) {
      setIsComplete(true);
      setIsPlaying(false);
      return;
    }
    const phase = PHASES[phaseIndex];
    setCurrentPhase(phaseIndex);

    phase.lines.forEach((line, li) => {
      const t = setTimeout(() => {
        setVisibleLines(prev => [...prev, phaseIndex * 1000 + li]);
        scrollToBottom();
      }, (line.delay || 0) / speed);
      timersRef.current.push(t);
    });

    const t = setTimeout(() => playPhase(phaseIndex + 1), phase.duration / speed);
    timersRef.current.push(t);
  }, [speed, scrollToBottom]);

  const startBoot = useCallback(() => {
    clearTimers();
    setVisibleLines([]);
    setCurrentPhase(-1);
    setIsComplete(false);
    setIsPlaying(true);
    setTimeout(() => playPhase(0), 500 / speed);
  }, [clearTimers, playPhase, speed]);

  const jumpToPhase = useCallback((index: number) => {
    clearTimers();
    setIsPlaying(false);
    setIsComplete(false);
    setCurrentPhase(index);
    // Show all lines up to and including this phase
    const lines: number[] = [];
    for (let p = 0; p <= index; p++) {
      PHASES[p].lines.forEach((_, li) => lines.push(p * 1000 + li));
    }
    setVisibleLines(lines);
    setTimeout(scrollToBottom, 50);
  }, [clearTimers, scrollToBottom]);

  useEffect(() => { return clearTimers; }, [clearTimers]);

  const allLines = PHASES.flatMap((phase, pi) =>
    phase.lines.map((line, li) => ({ ...line, phaseIndex: pi, lineKey: pi * 1000 + li }))
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-helix-purple/40">
      <div className="fixed inset-0 bg-grid opacity-5 pointer-events-none" />

      <style>{`
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
        @keyframes fadeIn { 0% { opacity: 0; transform: translateY(4px); } 100% { opacity: 1; transform: translateY(0); } }
        .crt-scanline { animation: scanline 8s linear infinite; }
        .cursor-blink { animation: blink 1s step-end infinite; }
        .line-enter { animation: fadeIn 0.15s ease; }
      `}</style>

      <main className="relative">
        {/* Header */}
        <div className="pt-28 pb-8 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-6 inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Home
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Interactive Boot Simulation
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-helix-blue to-helix-purple">Boot Sequence</span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Watch Helix OS boot from BIOS firmware through GRUB to a fully operational kernel with NEXUS AI — step by step with real kernel logs.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="max-w-5xl mx-auto px-6 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={startBoot}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-sm hover:from-emerald-500 hover:to-emerald-400 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              {isPlaying ? "Restart" : isComplete ? "Replay" : "Start Boot"}
            </button>

            <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 rounded-lg px-2 py-1">
              <span className="text-[10px] text-zinc-500 font-mono mr-1">Speed:</span>
              {[0.5, 1, 2, 4].map(s => (
                <button key={s} onClick={() => setSpeed(s)}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${speed === s ? "bg-helix-purple/20 text-helix-purple" : "text-zinc-500 hover:text-white"}`}>
                  {s}x
                </button>
              ))}
            </div>

            {isComplete && (
              <span className="ml-auto text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Boot complete · 50ms
              </span>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 pb-16">
          <div className="flex gap-4">
            {/* Phase sidebar */}
            <div className="hidden md:block w-56 shrink-0 space-y-1.5">
              {PHASES.map((phase, i) => {
                const isActive = currentPhase === i;
                const isDone = currentPhase > i;
                return (
                  <button key={phase.id} onClick={() => jumpToPhase(i)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-zinc-900/80 border-zinc-700/60 shadow-lg"
                        : isDone
                        ? "bg-zinc-900/30 border-zinc-800/30"
                        : "bg-zinc-950/30 border-zinc-900/20 opacity-50 hover:opacity-75"
                    }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{phase.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${isActive ? "text-white" : isDone ? "text-zinc-400" : "text-zinc-600"}`}>{phase.title}</p>
                        <p className="text-[9px] text-zinc-600 truncate">{phase.subtitle}</p>
                      </div>
                      {isDone && <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                      {isActive && <span className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: phase.color }} />}
                    </div>
                    {isActive && (
                      <div className="mt-1.5 h-0.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ background: phase.color, width: "100%", animation: `barGrow ${phase.duration / speed}ms linear` }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Terminal */}
            <div className="flex-1 rounded-xl border border-zinc-800/60 overflow-hidden bg-[#0a0a0a] shadow-2xl">
              {/* Terminal titlebar */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <span className="text-[10px] font-mono text-zinc-600 ml-2">qemu-system-x86_64 — helix-minimal.iso</span>
                {currentPhase >= 0 && (
                  <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded" style={{ color: PHASES[currentPhase].color, background: `${PHASES[currentPhase].color}15`, border: `1px solid ${PHASES[currentPhase].color}30` }}>
                    {PHASES[currentPhase].title}
                  </span>
                )}
              </div>

              {/* Terminal output */}
              <div ref={scrollRef} className="relative h-[500px] overflow-y-auto p-4 font-mono text-xs leading-relaxed">
                {/* CRT scanline effect */}
                {isPlaying && (
                  <div className="absolute inset-0 pointer-events-none z-10">
                    <div className="w-full h-px bg-white/[0.03] crt-scanline" />
                  </div>
                )}

                {currentPhase < 0 && !isComplete && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <div className="text-4xl">⚡</div>
                      <p className="text-zinc-600 text-sm">Press <strong className="text-zinc-400">Start Boot</strong> to begin the simulation</p>
                      <p className="text-zinc-700 text-[10px]">Or click any phase on the left to jump directly</p>
                    </div>
                  </div>
                )}

                {allLines.map(({ text, color, phaseIndex, lineKey }) => {
                  if (!visibleLines.includes(lineKey)) return null;
                  return (
                    <div key={lineKey} className="line-enter" style={{ color: color || "#A1A1AA" }}>
                      {text || "\u00A0"}
                      {phaseIndex === PHASES.length - 1 && lineKey === (PHASES.length - 1) * 1000 + PHASES[PHASES.length - 1].lines.length - 1 && (
                        <span className="cursor-blink">█</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Status bar */}
              <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900/60 border-t border-zinc-800/30 text-[10px] font-mono text-zinc-600">
                <span>QEMU x86_64</span>
                <span>128 MB RAM</span>
                <span>VGA 1024x768</span>
                <span className="ml-auto">
                  {isPlaying ? `Phase ${currentPhase + 1}/${PHASES.length}` : isComplete ? "Boot complete" : "Ready"}
                </span>
              </div>
            </div>
          </div>

          {/* Phase details (shown when complete) */}
          {isComplete && (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3" style={{ animation: "fadeIn 0.5s ease" }}>
              {PHASES.map((phase) => (
                <div key={phase.id} className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/40 text-center">
                  <span className="text-lg">{phase.icon}</span>
                  <p className="text-[10px] font-bold text-white mt-1">{phase.title}</p>
                  <p className="text-[9px] text-zinc-600">{phase.lines.length} events</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
