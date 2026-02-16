"use client";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import HelixLogo from "@/helix-wiki/components/HelixLogo";
import Link from "next/link";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import compareContent from "@/helix-wiki/lib/docs-i18n/compare";

/* ═══════════════════════════════════════════════════════════════════════════════
   DATA TYPES & RATING META
   ═══════════════════════════════════════════════════════════════════════════════ */
type Rating = "excellent" | "good" | "moderate" | "limited" | "none";

const RATING: Record<Rating, { label: string; value: number; color: string; glow: string; bg: string; border: string }> = {
  excellent: { label: "Excellent", value: 4, color: "#22C55E", glow: "rgba(34,197,94,0.5)",   bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.35)" },
  good:      { label: "Good",      value: 3, color: "#4A90E2", glow: "rgba(74,144,226,0.5)",  bg: "rgba(74,144,226,0.12)", border: "rgba(74,144,226,0.35)" },
  moderate:  { label: "Moderate",   value: 2, color: "#F59E0B", glow: "rgba(245,158,11,0.5)",  bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
  limited:   { label: "Limited",    value: 1, color: "#F97316", glow: "rgba(249,115,22,0.5)",  bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.35)" },
  none:      { label: "None",       value: 0, color: "#52525B", glow: "rgba(82,82,91,0.3)",    bg: "rgba(82,82,91,0.08)",   border: "rgba(82,82,91,0.25)" },
};

interface FeatureEntry {
  name: string;
  helix: { rating: Rating; detail: string };
  linux: { rating: Rating; detail: string };
  zircon: { rating: Rating; detail: string };
  sel4: { rating: Rating; detail: string };
}
interface Category { category: string; icon: string; features: FeatureEntry[]; }

/* ═══════════════════════════════════════════════════════════════════════════════
   COMPARISON DATA — 8 categories, 22 features
   ═══════════════════════════════════════════════════════════════════════════════ */
const DATA: Category[] = [
  { category: "Kernel Architecture", icon: "🏗️", features: [
    { name: "Kernel Type",        helix: { rating: "excellent", detail: "Modular hybrid — trait-based, everything is swappable" }, linux: { rating: "good", detail: "Monolithic with loadable modules" }, zircon: { rating: "good", detail: "Microkernel — minimal kernel, services in userspace" }, sel4: { rating: "excellent", detail: "Formally verified microkernel — mathematically proven" } },
    { name: "Hot-Reload Modules", helix: { rating: "excellent", detail: "First-class: pause → export state → swap → import → activate" }, linux: { rating: "moderate", detail: "Loadable kernel modules (insmod/rmmod), no state migration" }, zircon: { rating: "limited", detail: "Userspace services can be restarted, no kernel module swap" }, sel4: { rating: "none", detail: "Static kernel — no module loading by design" } },
    { name: "Self-Healing",       helix: { rating: "excellent", detail: "NEXUS AI: crash prediction, quarantine, auto-recovery, hot-swap" }, linux: { rating: "limited", detail: "Kernel oops + panic, watchdog timers, kexec for fast reboot" }, zircon: { rating: "moderate", detail: "Process isolation — crashed services restart independently" }, sel4: { rating: "moderate", detail: "Isolation guarantees prevent cascade, but no auto-recovery" } },
    { name: "Language / Safety",  helix: { rating: "excellent", detail: "100% Rust, no_std, zero unsafe in module API surface" }, linux: { rating: "moderate", detail: "C + growing Rust support, memory safety depends on discipline" }, zircon: { rating: "good", detail: "C++ core, strong coding standards, sanitizers" }, sel4: { rating: "excellent", detail: "C + formal verification in Isabelle/HOL — proven correct" } },
  ]},
  { category: "Security Model", icon: "🛡️", features: [
    { name: "Capability System",      helix: { rating: "excellent", detail: "Fine-grained capabilities for every resource access" }, linux: { rating: "moderate", detail: "POSIX caps + LSM (SELinux, AppArmor), coarse-grained" }, zircon: { rating: "excellent", detail: "Object capabilities — all access via handles" }, sel4: { rating: "excellent", detail: "Capability-based access control — formally verified" } },
    { name: "KASLR",                  helix: { rating: "good", detail: "Full KASLR via relocation subsystem (4K+ lines)" }, linux: { rating: "excellent", detail: "Mature KASLR, per-boot randomization, kASLR+fgKASLR" }, zircon: { rating: "good", detail: "KASLR for kernel and userspace" }, sel4: { rating: "limited", detail: "Static addresses by design — not a priority" } },
    { name: "Filesystem Encryption",  helix: { rating: "excellent", detail: "Per-file AES-256 + Merkle tree integrity in HelixFS" }, linux: { rating: "good", detail: "fscrypt (ext4/f2fs), dm-crypt, LUKS" }, zircon: { rating: "moderate", detail: "Fxfs supports encryption, still maturing" }, sel4: { rating: "none", detail: "No filesystem — pure microkernel" } },
  ]},
  { category: "System Calls & IPC", icon: "📡", features: [
    { name: "Syscall Interface", helix: { rating: "good", detail: "512-entry table, 6-arg ABI, Linux-compatible errno" }, linux: { rating: "excellent", detail: "~450 syscalls, decades of stability, POSIX compliant" }, zircon: { rating: "good", detail: "~170 syscalls, object-oriented, handle-based" }, sel4: { rating: "moderate", detail: "~12 syscalls — extreme minimality by design" } },
    { name: "IPC Mechanisms",    helix: { rating: "excellent", detail: "3 types: shared memory (lock-free), event bus (pub/sub), message router" }, linux: { rating: "excellent", detail: "Pipes, sockets, shared mem, signals, futex, io_uring" }, zircon: { rating: "excellent", detail: "Channels, sockets, FIFOs, ports, VMOs — rich IPC" }, sel4: { rating: "good", detail: "Synchronous IPC + notifications — fast but simple" } },
    { name: "Async I/O",         helix: { rating: "good", detail: "Event-driven with async kernel tasks" }, linux: { rating: "excellent", detail: "io_uring — best-in-class async I/O" }, zircon: { rating: "good", detail: "Port-based async notifications" }, sel4: { rating: "limited", detail: "No built-in async — synchronous by design" } },
  ]},
  { category: "Memory Management", icon: "🧠", features: [
    { name: "Virtual Memory",    helix: { rating: "good", detail: "4-level page tables, demand paging, CoW" }, linux: { rating: "excellent", detail: "5-level paging, THP, NUMA, KSM, memory cgroups" }, zircon: { rating: "good", detail: "VMOs (Virtual Memory Objects), CoW, pager support" }, sel4: { rating: "moderate", detail: "Minimal — address spaces, untyped memory, manual page tables" } },
    { name: "ML-Powered Tuning", helix: { rating: "excellent", detail: "NEXUS optimizes allocator, cache, scheduler in real-time" }, linux: { rating: "limited", detail: "Static heuristics (vm.swappiness, etc.), no ML" }, zircon: { rating: "none", detail: "No ML integration" }, sel4: { rating: "none", detail: "No ML integration — minimality focus" } },
  ]},
  { category: "Scheduling", icon: "⚡", features: [
    { name: "Scheduler Type",     helix: { rating: "excellent", detail: "DIS — CFS-inspired with ML tuning, per-CPU queues, work stealing" }, linux: { rating: "excellent", detail: "CFS + EEVDF (6.6+), SCHED_DEADLINE, BPF scheduler" }, zircon: { rating: "good", detail: "Fair scheduler with priority inheritance" }, sel4: { rating: "moderate", detail: "Fixed-priority round-robin — simple but predictable" } },
    { name: "Real-Time Support",  helix: { rating: "moderate", detail: "Priority classes (RT, System, Interactive, Batch, Idle)" }, linux: { rating: "excellent", detail: "PREEMPT_RT, SCHED_FIFO/RR, latency guarantees" }, zircon: { rating: "moderate", detail: "Priority profiles, fair scheduling" }, sel4: { rating: "excellent", detail: "Formally verified worst-case execution time guarantees" } },
  ]},
  { category: "Graphics & GPU", icon: "🎨", features: [
    { name: "GPU Stack",        helix: { rating: "excellent", detail: "Lumina: 197K lines, 14 crates, shader compiler, render graph" }, linux: { rating: "excellent", detail: "DRM/KMS + Mesa, Vulkan, OpenGL — mature ecosystem" }, zircon: { rating: "moderate", detail: "Magma GPU driver, Scenic compositor, Vulkan via virtio" }, sel4: { rating: "none", detail: "No graphics — pure microkernel" } },
    { name: "Shader Compiler",  helix: { rating: "excellent", detail: "Built-in: Source → IR → SPIR-V with optimization passes" }, linux: { rating: "excellent", detail: "Mesa NIR, LLVM AMDGPU, Intel compiler — userspace" }, zircon: { rating: "limited", detail: "Relies on external compilers" }, sel4: { rating: "none", detail: "N/A" } },
  ]},
  { category: "Architecture Support", icon: "🔧", features: [
    { name: "Supported Architectures", helix: { rating: "good", detail: "x86_64, AArch64, RISC-V 64 — via HAL trait abstraction" }, linux: { rating: "excellent", detail: "30+ architectures — unmatched breadth" }, zircon: { rating: "moderate", detail: "x86_64, ARM64" }, sel4: { rating: "good", detail: "x86_64, ARM, RISC-V — verified on ARM" } },
    { name: "Multi-Core",             helix: { rating: "good", detail: "SMP with per-CPU run queues and work stealing" }, linux: { rating: "excellent", detail: "Full SMP, NUMA, CPU hotplug, cgroup cpusets" }, zircon: { rating: "good", detail: "SMP support with CPU affinity" }, sel4: { rating: "moderate", detail: "SMP verified on ARM, not all platforms" } },
  ]},
  { category: "AI / Intelligence", icon: "🤖", features: [
    { name: "Kernel AI Subsystem", helix: { rating: "excellent", detail: "NEXUS: 812K lines — prediction, anomaly, healing, optimization" }, linux: { rating: "limited", detail: "BPF-based observability, no built-in AI" }, zircon: { rating: "none", detail: "No AI subsystem" }, sel4: { rating: "none", detail: "No AI — formal methods focus" } },
    { name: "Crash Prediction",    helix: { rating: "excellent", detail: "ML models: Decision Tree, Random Forest, Neural Net, SVM" }, linux: { rating: "none", detail: "No prediction — reactive only" }, zircon: { rating: "none", detail: "No prediction" }, sel4: { rating: "none", detail: "Crashes are formally impossible (for verified components)" } },
  ]},
];

const OS_META = {
  helix:  { name: "Helix OS",   type: "Modular Hybrid",      lang: "Rust",         year: "2024", lines: "~1M",   icon: "🧬", color: "#7B68EE", sc: "123,104,238", tagline: "Systems Built to Evolve" },
  linux:  { name: "Linux",      type: "Monolithic",           lang: "C / Rust",     year: "1991", lines: "~36M",  icon: "🐧", color: "#F59E0B", sc: "245,158,11",  tagline: "The World Runs On It" },
  zircon: { name: "Zircon",     type: "Microkernel",          lang: "C++",          year: "2016", lines: "~2M",   icon: "💎", color: "#EC4899", sc: "236,72,153",  tagline: "Google's Next-Gen Kernel" },
  sel4:   { name: "seL4",       type: "Verified μkernel",     lang: "C / Isabelle", year: "2009", lines: "~10K",  icon: "🔒", color: "#22C55E", sc: "34,197,94",   tagline: "Mathematically Proven" },
} as const;
type OSKey = keyof typeof OS_META;
const OS_KEYS: OSKey[] = ["helix", "linux", "zircon", "sel4"];

/* Inline helix SVG for canvas rendering (simplified, no animations) */
const HELIX_SVG_DATA = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><defs><linearGradient id="gL" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4A90E2"/><stop offset="100%" stop-color="#7B68EE"/></linearGradient><linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7B68EE"/><stop offset="100%" stop-color="#9B59B6"/></linearGradient><linearGradient id="gU" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#4A90E2" stop-opacity="0.5"/><stop offset="50%" stop-color="#7B68EE" stop-opacity="0.9"/><stop offset="100%" stop-color="#9B59B6" stop-opacity="0.5"/></linearGradient><radialGradient id="gA" cx="50%" cy="50%" r="40%"><stop offset="0%" stop-color="#7B68EE" stop-opacity="0.25"/><stop offset="100%" stop-color="#4A90E2" stop-opacity="0"/></radialGradient></defs><circle cx="512" cy="512" r="420" fill="url(#gA)"/><g transform="translate(512,512)"><path d="M -192.5,-258.5 Q -247.5,-148.5 -203.5,-5.5 Q -159.5,148.5 -247.5,258.5" stroke="url(#gL)" stroke-width="30" fill="none" stroke-linecap="round" opacity="0.95"/><path d="M 192.5,-258.5 Q 247.5,-148.5 203.5,-5.5 Q 159.5,148.5 247.5,258.5" stroke="url(#gR)" stroke-width="30" fill="none" stroke-linecap="round" opacity="0.95"/><path d="M -192.5,-258.5 Q -247.5,-148.5 -203.5,-5.5 Q -159.5,148.5 -247.5,258.5" stroke="#7EB8FF" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.5"/><path d="M 192.5,-258.5 Q 247.5,-148.5 203.5,-5.5 Q 159.5,148.5 247.5,258.5" stroke="#C9A0FF" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.5"/><line x1="-172" y1="-195" x2="172" y2="-195" stroke="url(#gU)" stroke-width="10" stroke-linecap="round"/><line x1="-196" y1="-100" x2="196" y2="-100" stroke="url(#gU)" stroke-width="12" stroke-linecap="round"/><line x1="-200" y1="0" x2="200" y2="0" stroke="url(#gU)" stroke-width="14" stroke-linecap="round"/><line x1="-196" y1="100" x2="196" y2="100" stroke="url(#gU)" stroke-width="12" stroke-linecap="round"/><line x1="-220" y1="195" x2="220" y2="195" stroke="url(#gU)" stroke-width="10" stroke-linecap="round"/><circle cx="-172" cy="-195" r="7" fill="#4A90E2" opacity="0.8"/><circle cx="172" cy="-195" r="7" fill="#9B59B6" opacity="0.8"/><circle cx="-196" cy="-100" r="7" fill="#4A90E2" opacity="0.8"/><circle cx="196" cy="-100" r="7" fill="#9B59B6" opacity="0.8"/><circle cx="-200" cy="0" r="7" fill="#7B68EE" opacity="0.8"/><circle cx="200" cy="0" r="7" fill="#7B68EE" opacity="0.8"/><circle cx="-196" cy="100" r="7" fill="#4A90E2" opacity="0.8"/><circle cx="196" cy="100" r="7" fill="#9B59B6" opacity="0.8"/><circle cx="-220" cy="195" r="7" fill="#4A90E2" opacity="0.8"/><circle cx="220" cy="195" r="7" fill="#9B59B6" opacity="0.8"/></g></svg>`)}`;

/* Render OS icon: animated HelixLogo for Helix, emoji for others */
function OsIcon({ os, className = "w-[1em] h-[1em]", inline = true }: { os: string; className?: string; inline?: boolean }) {
  if (os === "helix") return <HelixLogo className={`${className} ${inline ? "inline-block align-middle" : ""}`} />;
  return <>{OS_META[os as OSKey]?.icon ?? "?"}</>;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════════════════════════ */
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useCounter(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const { ref, visible } = useReveal(0.3);
  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, target, duration]);
  return { ref, val };
}

/* ═══════════════════════════════════════════════════════════════════════════════
   DEEP SPACE CANVAS — Immersive universe with mouse-reactive parallax
   3 star layers · nebula clouds · shooting stars · cursor glow · twinkling
   ═══════════════════════════════════════════════════════════════════════════════ */
function DeepSpace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 });
  const visibleRef = useRef(true);

  useEffect(() => {
    /* Skip heavy canvas on mobile or reduced-motion preference */
    if (window.innerWidth < 768 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let W = 0, H = 0;

    /* IntersectionObserver — pause when offscreen */
    const observer = new IntersectionObserver(([entry]) => { visibleRef.current = entry.isIntersecting; }, { threshold: 0.05 });
    observer.observe(canvas);

    /* ── TYPES ── */
    interface Star { x: number; y: number; r: number; base: number; color: string; twinkle: number; twinkleSpeed: number; layer: number; }
    interface Nebula { x: number; y: number; rx: number; ry: number; color: string; alpha: number; layer: number; angle: number; }
    interface Shooting { x: number; y: number; vx: number; vy: number; len: number; life: number; maxLife: number; color: string; }

    const stars: Star[] = [];
    const nebulae: Nebula[] = [];
    const shootings: Shooting[] = [];

    /* ── STAR COLORS ── */
    const starColors = [
      "255,255,255",   // white
      "200,210,255",   // blue-white
      "170,180,255",   // blue
      "123,104,238",   // helix purple
      "255,220,180",   // warm
      "180,220,255",   // ice blue
      "236,72,153",    // pink
      "74,144,226",    // blue
    ];

    /* ── NEBULA PALETTES ── */
    const nebColors = [
      "123,104,238",  // helix purple
      "74,144,226",   // blue
      "236,72,153",   // pink
      "155,89,182",   // violet
      "34,197,94",    // green
      "99,80,210",    // deep purple
      "52,120,200",   // ocean
    ];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const init = () => {
      resize();
      stars.length = 0; nebulae.length = 0;

      /* 3 parallax layers: far(0), mid(1), close(2) */
      const counts = [350, 200, 100];
      const sizes  = [[0.3, 1.0], [0.8, 1.8], [1.5, 3.2]];
      for (let layer = 0; layer < 3; layer++) {
        for (let i = 0; i < counts[layer]; i++) {
          const r = sizes[layer][0] + Math.random() * (sizes[layer][1] - sizes[layer][0]);
          stars.push({
            x: Math.random() * W, y: Math.random() * H,
            r, base: r,
            color: starColors[Math.floor(Math.random() * starColors.length)],
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.01 + Math.random() * 0.04,
            layer,
          });
        }
      }

      /* Nebula clouds */
      for (let i = 0; i < 7; i++) {
        nebulae.push({
          x: Math.random() * W, y: Math.random() * H,
          rx: 150 + Math.random() * 350, ry: 100 + Math.random() * 250,
          color: nebColors[i % nebColors.length],
          alpha: 0.012 + Math.random() * 0.025,
          layer: Math.floor(Math.random() * 3),
          angle: Math.random() * Math.PI * 2,
        });
      }
    };

    init();
    window.addEventListener("resize", init);

    /* ── MOUSE TRACKING ── */
    const onMove = (e: MouseEvent) => {
      mouse.current.tx = e.clientX / window.innerWidth;
      mouse.current.ty = e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    /* ── SPAWN SHOOTING STAR ── */
    let nextShoot = 60 + Math.random() * 200;
    const spawnShooting = () => {
      const fromLeft = Math.random() > 0.5;
      const angle = (Math.random() * 0.4 + 0.15) * (fromLeft ? 1 : -1);
      const speed = 4 + Math.random() * 6;
      const colors = ["123,104,238", "200,210,255", "236,72,153", "74,144,226"];
      shootings.push({
        x: fromLeft ? -20 : W + 20,
        y: Math.random() * H * 0.6,
        vx: Math.cos(angle) * speed * (fromLeft ? 1 : -1),
        vy: Math.sin(angle) * speed,
        len: 60 + Math.random() * 100,
        life: 0, maxLife: 60 + Math.random() * 50,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    /* ── DRAW LOOP ── */
    let time = 0;
    const draw = () => {
      /* Skip rendering when offscreen */
      if (!visibleRef.current) { raf = requestAnimationFrame(draw); return; }
      time++;

      /* smooth mouse lerp */
      const m = mouse.current;
      m.x += (m.tx - m.x) * 0.04;
      m.y += (m.ty - m.y) * 0.04;
      const mx = (m.x - 0.5) * 2; // -1..1
      const my = (m.y - 0.5) * 2;

      /* parallax offsets per layer */
      const parallax = [8, 22, 50]; // pixels of movement per layer

      ctx.clearRect(0, 0, W, H);

      /* ── NEBULAE ── */
      for (const n of nebulae) {
        const px = mx * parallax[n.layer] * 0.6;
        const py = my * parallax[n.layer] * 0.6;
        const grad = ctx.createRadialGradient(
          n.x + px, n.y + py, 0,
          n.x + px, n.y + py, Math.max(n.rx, n.ry)
        );
        // Pulsing nebula alpha
        const pulse = 1 + Math.sin(time * 0.008 + n.angle) * 0.3;
        grad.addColorStop(0, `rgba(${n.color},${n.alpha * pulse * 1.5})`);
        grad.addColorStop(0.4, `rgba(${n.color},${n.alpha * pulse * 0.6})`);
        grad.addColorStop(1, `rgba(${n.color},0)`);
        ctx.save();
        ctx.translate(n.x + px, n.y + py);
        ctx.rotate(n.angle + time * 0.0003);
        ctx.scale(1, n.ry / n.rx);
        ctx.beginPath();
        ctx.arc(0, 0, n.rx, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      /* ── STARS ── */
      for (const s of stars) {
        s.twinkle += s.twinkleSpeed;
        const twinkleVal = 0.5 + 0.5 * Math.sin(s.twinkle);
        const alpha = (0.3 + 0.7 * twinkleVal) * (s.layer === 0 ? 0.4 : s.layer === 1 ? 0.7 : 1);
        const r = s.base * (0.8 + 0.4 * twinkleVal);
        const px = mx * parallax[s.layer];
        const py = my * parallax[s.layer];
        const sx = ((s.x + px) % W + W) % W;
        const sy = ((s.y + py) % H + H) % H;

        /* glow for larger stars */
        if (r > 1.5) {
          const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 4);
          glow.addColorStop(0, `rgba(${s.color},${alpha * 0.3})`);
          glow.addColorStop(1, `rgba(${s.color},0)`);
          ctx.beginPath();
          ctx.arc(sx, sy, r * 4, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        /* core */
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color},${alpha})`;
        ctx.fill();

        /* cross-sparkle on brightest stars */
        if (r > 2.2 && twinkleVal > 0.75) {
          ctx.save();
          ctx.globalAlpha = alpha * 0.4 * (twinkleVal - 0.75) * 4;
          ctx.strokeStyle = `rgba(${s.color},0.6)`;
          ctx.lineWidth = 0.5;
          const spLen = r * 6;
          ctx.beginPath(); ctx.moveTo(sx - spLen, sy); ctx.lineTo(sx + spLen, sy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(sx, sy - spLen); ctx.lineTo(sx, sy + spLen); ctx.stroke();
          ctx.restore();
        }
      }

      /* ── SHOOTING STARS ── */
      nextShoot--;
      if (nextShoot <= 0) { spawnShooting(); nextShoot = 80 + Math.random() * 300; }
      for (let i = shootings.length - 1; i >= 0; i--) {
        const sh = shootings[i];
        sh.x += sh.vx; sh.y += sh.vy; sh.life++;
        const progress = sh.life / sh.maxLife;
        const fade = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
        if (sh.life >= sh.maxLife) { shootings.splice(i, 1); continue; }

        /* Trail */
        const tailX = sh.x - (sh.vx / Math.sqrt(sh.vx * sh.vx + sh.vy * sh.vy)) * sh.len;
        const tailY = sh.y - (sh.vy / Math.sqrt(sh.vx * sh.vx + sh.vy * sh.vy)) * sh.len;
        const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
        grad.addColorStop(0, `rgba(${sh.color},${0.9 * fade})`);
        grad.addColorStop(0.3, `rgba(${sh.color},${0.3 * fade})`);
        grad.addColorStop(1, `rgba(${sh.color},0)`);
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y); ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.stroke();

        /* Head glow */
        const hg = ctx.createRadialGradient(sh.x, sh.y, 0, sh.x, sh.y, 8);
        hg.addColorStop(0, `rgba(255,255,255,${0.8 * fade})`);
        hg.addColorStop(0.5, `rgba(${sh.color},${0.3 * fade})`);
        hg.addColorStop(1, `rgba(${sh.color},0)`);
        ctx.beginPath(); ctx.arc(sh.x, sh.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = hg; ctx.fill();
      }

      /* ── CURSOR GLOW ORB ── */
      const cx = m.x * W, cy = m.y * H;
      const cursorGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 220);
      cursorGrad.addColorStop(0, `rgba(123,104,238,${0.06 + Math.sin(time * 0.02) * 0.02})`);
      cursorGrad.addColorStop(0.3, `rgba(123,104,238,0.02)`);
      cursorGrad.addColorStop(0.6, `rgba(74,144,226,0.008)`);
      cursorGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(cx, cy, 220, 0, Math.PI * 2);
      ctx.fillStyle = cursorGrad; ctx.fill();

      /* tiny highlight ring */
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(123,104,238,${0.15 + Math.sin(time * 0.05) * 0.08})`;
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(raf); observer.disconnect(); window.removeEventListener("resize", init); window.removeEventListener("mousemove", onMove); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   🎮 KERNEL WARS — Secret Easter Egg Game
   Trigger: Konami Code (↑↑↓↓←→←→BA)
   You are Helix 🧬 — destroy enemy kernels in deep space combat!
   ═══════════════════════════════════════════════════════════════════════════════ */
function KernelWars({ onExit }: { onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<{
    running: boolean;
    player: { x: number; y: number; hp: number; maxHp: number; speed: number; shootCd: number; invincible: number; combo: number; bestCombo: number };
    enemies: { x: number; y: number; hp: number; maxHp: number; speed: number; icon: string; name: string; color: string; sc: string; size: number; shootCd: number; angle: number; pattern: number; time: number; flash: number }[];
    bullets: { x: number; y: number; vx: number; vy: number; dmg: number; isEnemy: boolean; color: string; size: number }[];
    particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number }[];
    explosions: { x: number; y: number; time: number; maxTime: number; color: string; size: number }[];
    stars: { x: number; y: number; r: number; speed: number; alpha: number }[];
    powerups: { x: number; y: number; type: string; time: number }[];
    score: number;
    wave: number;
    waveTimer: number;
    phase: "playing" | "victory" | "gameover" | "intro";
    phaseTimer: number;
    keys: Set<string>;
    shakeTime: number;
    shakeIntensity: number;
    kills: number;
    totalEnemies: number;
    bossMode: boolean;
    powerLevel: number;
    time: number;
    W: number; H: number;
  }>(null!);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth; const H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    type Phase = "playing" | "victory" | "gameover" | "intro";
    const G = {
      running: true,
      player: { x: W / 2, y: H - 120, hp: 5, maxHp: 5, speed: 6, shootCd: 0, invincible: 0, combo: 0, bestCombo: 0 },
      enemies: [] as typeof gameRef.current.enemies,
      bullets: [] as typeof gameRef.current.bullets,
      particles: [] as typeof gameRef.current.particles,
      explosions: [] as typeof gameRef.current.explosions,
      stars: [] as typeof gameRef.current.stars,
      powerups: [] as typeof gameRef.current.powerups,
      score: 0, wave: 0, waveTimer: 120, phase: "intro" as Phase, phaseTimer: 0,
      keys: new Set<string>(),
      shakeTime: 0, shakeIntensity: 0, kills: 0, totalEnemies: 0, bossMode: false, powerLevel: 1,
      time: 0, W, H,
    };
    gameRef.current = G;

    // Stars
    for (let i = 0; i < 200; i++) {
      G.stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.5 + 0.3, speed: 0.3 + Math.random() * 1.5, alpha: 0.3 + Math.random() * 0.7 });
    }

    // Pre-render Helix logo as an Image for canvas drawing
    const helixImg = new Image();
    helixImg.src = HELIX_SVG_DATA;

    const ENEMY_TYPES = [
      { icon: "🐧", name: "Linux", color: "#F59E0B", sc: "245,158,11", hp: 3, speed: 1.5, size: 28 },
      { icon: "💎", name: "Zircon", color: "#EC4899", sc: "236,72,153", hp: 4, speed: 2, size: 26 },
      { icon: "🔒", name: "seL4", color: "#22C55E", sc: "34,197,94", hp: 5, speed: 1, size: 24 },
    ];

    const BOSS = { icon: "☠️", name: "MEGA KERNEL", color: "#EF4444", sc: "239,68,68", hp: 50, speed: 0.8, size: 50 };

    const spawnWave = () => {
      G.wave++;
      G.waveTimer = 180;
      G.bossMode = G.wave % 5 === 0;

      if (G.bossMode) {
        G.enemies.push({
          x: W / 2, y: -60, hp: BOSS.hp + G.wave * 5, maxHp: BOSS.hp + G.wave * 5,
          speed: BOSS.speed, icon: BOSS.icon, name: BOSS.name, color: BOSS.color, sc: BOSS.sc,
          size: BOSS.size, shootCd: 0, angle: 0, pattern: 0, time: 0, flash: 0,
        });
        G.totalEnemies++;
      } else {
        const count = Math.min(3 + G.wave, 10);
        for (let i = 0; i < count; i++) {
          const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
          const hpMul = 1 + (G.wave - 1) * 0.3;
          G.enemies.push({
            x: 60 + Math.random() * (W - 120), y: -40 - Math.random() * 200,
            hp: Math.ceil(type.hp * hpMul), maxHp: Math.ceil(type.hp * hpMul),
            speed: type.speed + G.wave * 0.1, icon: type.icon, name: type.name,
            color: type.color, sc: type.sc, size: type.size,
            shootCd: 60 + Math.random() * 120, angle: Math.random() * Math.PI * 2,
            pattern: Math.floor(Math.random() * 3), time: 0, flash: 0,
          });
          G.totalEnemies++;
        }
      }
    };

    const spawnParticles = (x: number, y: number, color: string, count: number, speed: number) => {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = speed * (0.5 + Math.random());
        G.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, maxLife: 20 + Math.random() * 30, color, size: 1 + Math.random() * 3 });
      }
    };

    const playerShoot = () => {
      if (G.player.shootCd > 0) return;
      const p = G.player;
      G.player.shootCd = G.powerLevel >= 3 ? 4 : G.powerLevel >= 2 ? 6 : 8;
      const bColor = "123,104,238";
      G.bullets.push({ x: p.x, y: p.y - 20, vx: 0, vy: -12, dmg: 1 + Math.floor(G.powerLevel / 2), isEnemy: false, color: bColor, size: 3 });
      if (G.powerLevel >= 2) {
        G.bullets.push({ x: p.x - 12, y: p.y - 15, vx: -1, vy: -11, dmg: 1, isEnemy: false, color: bColor, size: 2 });
        G.bullets.push({ x: p.x + 12, y: p.y - 15, vx: 1, vy: -11, dmg: 1, isEnemy: false, color: bColor, size: 2 });
      }
      if (G.powerLevel >= 4) {
        G.bullets.push({ x: p.x - 20, y: p.y - 10, vx: -2.5, vy: -10, dmg: 1, isEnemy: false, color: "236,72,153", size: 2 });
        G.bullets.push({ x: p.x + 20, y: p.y - 10, vx: 2.5, vy: -10, dmg: 1, isEnemy: false, color: "236,72,153", size: 2 });
      }
    };

    /* ── MAIN GAME LOOP ── */
    const loop = () => {
      if (!G.running) return;
      G.time++;
      ctx.clearRect(0, 0, W, H);

      // Screen shake
      let sx = 0, sy = 0;
      if (G.shakeTime > 0) {
        G.shakeTime--;
        sx = (Math.random() - 0.5) * G.shakeIntensity;
        sy = (Math.random() - 0.5) * G.shakeIntensity;
        G.shakeIntensity *= 0.9;
      }
      ctx.save();
      ctx.translate(sx, sy);

      // BG gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#030010"); bg.addColorStop(0.5, "#080020"); bg.addColorStop(1, "#000008");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // Stars scrolling
      for (const s of G.stars) {
        s.y += s.speed;
        if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,210,255,${s.alpha})`; ctx.fill();
      }

      if (G.phase === "intro") {
        G.phaseTimer++;
        ctx.textAlign = "center";

        // Title
        const titleAlpha = Math.min(G.phaseTimer / 60, 1);
        ctx.globalAlpha = titleAlpha;
        ctx.font = "bold 72px system-ui"; ctx.fillStyle = "#7B68EE";
        ctx.shadowColor = "rgba(123,104,238,0.8)"; ctx.shadowBlur = 30;
        ctx.fillText("KERNEL WARS", W / 2, H / 2 - 80);
        ctx.shadowBlur = 0;

        ctx.font = "24px system-ui"; ctx.fillStyle = "#a0a0c0";
        if (helixImg.complete && helixImg.naturalWidth > 0) {
          ctx.fillText("Helix vs The World", W / 2 + 16, H / 2 - 30);
          ctx.drawImage(helixImg, W / 2 - 148, H / 2 - 50, 32, 32);
        } else {
          ctx.fillText("🧬 Helix vs The World", W / 2, H / 2 - 30);
        }

        // Enemy showcase
        if (G.phaseTimer > 40) {
          const ea = Math.min((G.phaseTimer - 40) / 40, 1);
          ctx.globalAlpha = ea;
          ctx.font = "40px system-ui";
          ctx.fillText("🐧  💎  🔒", W / 2, H / 2 + 40);
          ctx.font = "14px system-ui"; ctx.fillStyle = "#666";
          ctx.fillText("Linux · Zircon · seL4", W / 2, H / 2 + 70);
        }

        // Controls
        if (G.phaseTimer > 80) {
          const ca = Math.min((G.phaseTimer - 80) / 40, 1);
          ctx.globalAlpha = ca;
          ctx.font = "16px system-ui"; ctx.fillStyle = "#888";
          ctx.fillText("WASD / Arrows = Move  ·  Space = Shoot  ·  ESC = Exit", W / 2, H / 2 + 130);

          if (G.phaseTimer % 60 < 40) {
            ctx.font = "bold 20px system-ui"; ctx.fillStyle = "#7B68EE";
            ctx.fillText("[ Press SPACE to Start ]", W / 2, H / 2 + 180);
          }
        }

        ctx.globalAlpha = 1;
        if (G.keys.has(" ")) { G.phase = "playing"; G.phaseTimer = 0; spawnWave(); }
        ctx.restore();
        raf = requestAnimationFrame(loop);
        return;
      }

      if (G.phase === "gameover" || G.phase === "victory") {
        G.phaseTimer++;
        // Still draw particles
        for (let i = G.particles.length - 1; i >= 0; i--) {
          const p = G.particles[i]; p.x += p.vx; p.y += p.vy; p.vx *= 0.98; p.vy *= 0.98; p.life++;
          if (p.life >= p.maxLife) { G.particles.splice(i, 1); continue; }
          const a = 1 - p.life / p.maxLife;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color},${a})`; ctx.fill();
        }

        ctx.textAlign = "center";
        const fa = Math.min(G.phaseTimer / 60, 1);
        ctx.globalAlpha = fa;

        if (G.phase === "gameover") {
          ctx.font = "bold 64px system-ui"; ctx.fillStyle = "#EF4444";
          ctx.shadowColor = "rgba(239,68,68,0.6)"; ctx.shadowBlur = 20;
          ctx.fillText("SYSTEM CRASH", W / 2, H / 2 - 60);
          ctx.shadowBlur = 0;
          if (helixImg.complete) ctx.drawImage(helixImg, W / 2 - 20, H / 2 - 130, 40, 40);
          ctx.font = "20px system-ui"; ctx.fillStyle = "#888";
          ctx.fillText(`Score: ${G.score}  ·  Wave: ${G.wave}  ·  Kills: ${G.kills}`, W / 2, H / 2);
          ctx.fillText(`Best Combo: ${G.player.bestCombo}x`, W / 2, H / 2 + 30);
        } else {
          ctx.font = "bold 64px system-ui"; ctx.fillStyle = "#22C55E";
          ctx.shadowColor = "rgba(34,197,94,0.6)"; ctx.shadowBlur = 20;
          ctx.fillText("KERNEL DOMINANCE", W / 2, H / 2 - 60);
          ctx.shadowBlur = 0;
          if (helixImg.complete) ctx.drawImage(helixImg, W / 2 - 24, H / 2 - 140, 48, 48);
          ctx.font = "20px system-ui"; ctx.fillStyle = "#888";
          ctx.fillText(`Score: ${G.score}  ·  Kills: ${G.kills}`, W / 2, H / 2);
        }

        if (G.phaseTimer > 60) {
          if (G.phaseTimer % 60 < 40) {
            ctx.font = "bold 18px system-ui"; ctx.fillStyle = "#7B68EE";
            ctx.fillText("[ SPACE = Restart  ·  ESC = Exit ]", W / 2, H / 2 + 90);
          }
          if (G.keys.has(" ")) {
            // Reset
            G.player = { x: W / 2, y: H - 120, hp: 5, maxHp: 5, speed: 6, shootCd: 0, invincible: 0, combo: 0, bestCombo: 0 };
            G.enemies = []; G.bullets = []; G.particles = []; G.explosions = []; G.powerups = [];
            G.score = 0; G.wave = 0; G.waveTimer = 120; G.phase = "playing";
            G.phaseTimer = 0; G.kills = 0; G.totalEnemies = 0; G.bossMode = false; G.powerLevel = 1;
            spawnWave();
          }
        }

        ctx.globalAlpha = 1;
        ctx.restore();
        raf = requestAnimationFrame(loop);
        return;
      }

      /* ── PLAYING PHASE ── */
      const p = G.player;

      // Input
      const left = G.keys.has("a") || G.keys.has("arrowleft");
      const right = G.keys.has("d") || G.keys.has("arrowright");
      const up = G.keys.has("w") || G.keys.has("arrowup");
      const down = G.keys.has("s") || G.keys.has("arrowdown");
      if (left) p.x -= p.speed;
      if (right) p.x += p.speed;
      if (up) p.y -= p.speed;
      if (down) p.y += p.speed;
      p.x = Math.max(20, Math.min(W - 20, p.x));
      p.y = Math.max(40, Math.min(H - 40, p.y));

      if (G.keys.has(" ")) playerShoot();
      if (p.shootCd > 0) p.shootCd--;
      if (p.invincible > 0) p.invincible--;

      // Wave management
      if (G.enemies.length === 0 && G.waveTimer > 0) {
        G.waveTimer--;
        if (G.waveTimer <= 0) {
          if (G.wave >= 15) { G.phase = "victory"; G.phaseTimer = 0; }
          else spawnWave();
        }
      }

      /* ── ENEMIES ── */
      for (const e of G.enemies) {
        e.time++;
        if (e.flash > 0) e.flash--;

        // Movement patterns
        if (e.name === "MEGA KERNEL") {
          // Boss: sweep side to side at top
          if (e.y < 100) e.y += e.speed;
          else {
            e.x += Math.sin(e.time * 0.02) * 3;
            e.y = 100 + Math.sin(e.time * 0.01) * 30;
          }
          // Boss shoots more
          e.shootCd--;
          if (e.shootCd <= 0) {
            e.shootCd = 15;
            const angles = e.hp < e.maxHp / 2 ? 8 : 5;
            for (let i = 0; i < angles; i++) {
              const a = (Math.PI * 2 * i) / angles + e.time * 0.05;
              G.bullets.push({ x: e.x, y: e.y + e.size, vx: Math.cos(a) * 4, vy: Math.sin(a) * 4, dmg: 1, isEnemy: true, color: e.sc, size: 4 });
            }
          }
        } else {
          // Normal enemies
          switch (e.pattern) {
            case 0: // Zigzag down
              e.y += e.speed * 0.5;
              e.x += Math.sin(e.time * 0.03 + e.angle) * 2;
              break;
            case 1: // Circle
              e.y += e.speed * 0.3;
              e.x += Math.cos(e.time * 0.04 + e.angle) * 3;
              break;
            case 2: // Dive toward player
              if (e.y < H * 0.4) { e.y += e.speed; }
              else {
                const dx = p.x - e.x; const dy = p.y - e.y;
                const d = Math.sqrt(dx * dx + dy * dy) || 1;
                e.x += (dx / d) * e.speed * 0.5;
                e.y += (dy / d) * e.speed * 0.3;
              }
              break;
          }

          e.shootCd--;
          if (e.shootCd <= 0 && e.y > 0) {
            e.shootCd = 80 + Math.random() * 60;
            const dx = p.x - e.x; const dy = p.y - e.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            G.bullets.push({ x: e.x, y: e.y + e.size, vx: (dx / d) * 5, vy: (dy / d) * 5, dmg: 1, isEnemy: true, color: e.sc, size: 3 });
          }
        }

        // Remove if off screen
        if (e.y > H + 60) { G.enemies.splice(G.enemies.indexOf(e), 1); continue; }

        // Draw enemy
        // Shield ring
        ctx.beginPath(); ctx.arc(e.x, e.y, e.size + 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${e.sc},${0.15 + (e.flash > 0 ? 0.4 : 0)})`; ctx.lineWidth = 2; ctx.stroke();

        // Glow
        const eg = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 2);
        eg.addColorStop(0, `rgba(${e.sc},${e.flash > 0 ? 0.3 : 0.1})`); eg.addColorStop(1, `rgba(${e.sc},0)`);
        ctx.beginPath(); ctx.arc(e.x, e.y, e.size * 2, 0, Math.PI * 2); ctx.fillStyle = eg; ctx.fill();

        // Icon
        ctx.font = `${e.size * 1.5}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(e.icon, e.x, e.y);

        // HP bar
        const bw = e.size * 2;
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(e.x - bw / 2, e.y - e.size - 14, bw, 5);
        ctx.fillStyle = e.color; ctx.fillRect(e.x - bw / 2, e.y - e.size - 14, bw * (e.hp / e.maxHp), 5);

        // Name
        ctx.font = "bold 9px system-ui"; ctx.fillStyle = e.color;
        ctx.fillText(e.name, e.x, e.y - e.size - 20);
      }

      /* ── BULLETS ── */
      for (let i = G.bullets.length - 1; i >= 0; i--) {
        const b = G.bullets[i]; b.x += b.vx; b.y += b.vy;
        if (b.x < -10 || b.x > W + 10 || b.y < -10 || b.y > H + 10) { G.bullets.splice(i, 1); continue; }

        // Hit detection
        if (!b.isEnemy) {
          for (let j = G.enemies.length - 1; j >= 0; j--) {
            const e = G.enemies[j];
            const dx = b.x - e.x; const dy = b.y - e.y;
            if (dx * dx + dy * dy < (e.size + b.size) * (e.size + b.size)) {
              e.hp -= b.dmg; e.flash = 6;
              G.bullets.splice(i, 1);
              spawnParticles(b.x, b.y, e.sc, 5, 3);
              if (e.hp <= 0) {
                G.kills++; p.combo++;
                if (p.combo > p.bestCombo) p.bestCombo = p.combo;
                const pts = e.name === "MEGA KERNEL" ? 500 : 100;
                G.score += pts * Math.min(p.combo, 10);
                spawnParticles(e.x, e.y, e.sc, 30, 6);
                G.explosions.push({ x: e.x, y: e.y, time: 0, maxTime: 40, color: e.sc, size: e.size * 3 });
                G.shakeTime = 15; G.shakeIntensity = e.name === "MEGA KERNEL" ? 20 : 8;
                // Power-up drop
                if (Math.random() < 0.3) {
                  const types = ["⚡", "❤️", "🔥"];
                  G.powerups.push({ x: e.x, y: e.y, type: types[Math.floor(Math.random() * types.length)], time: 0 });
                }
                G.enemies.splice(j, 1);
              }
              break;
            }
          }
        } else {
          // Enemy bullet hits player
          const dx = b.x - p.x; const dy = b.y - p.y;
          if (dx * dx + dy * dy < 400 && p.invincible <= 0) {
            p.hp -= b.dmg; p.invincible = 60; p.combo = 0;
            G.bullets.splice(i, 1);
            G.shakeTime = 10; G.shakeIntensity = 12;
            spawnParticles(p.x, p.y, "123,104,238", 15, 5);
            if (p.hp <= 0) { G.phase = "gameover"; G.phaseTimer = 0; spawnParticles(p.x, p.y, "123,104,238", 50, 8); }
            continue;
          }
        }

        // Draw bullet
        const bg2 = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.size * 3);
        bg2.addColorStop(0, `rgba(${b.color},0.8)`); bg2.addColorStop(1, `rgba(${b.color},0)`);
        ctx.beginPath(); ctx.arc(b.x, b.y, b.size * 3, 0, Math.PI * 2); ctx.fillStyle = bg2; ctx.fill();
        ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fillStyle = b.isEnemy ? `rgba(${b.color},0.9)` : "rgba(200,190,255,0.95)"; ctx.fill();
      }

      /* ── POWER-UPS ── */
      for (let i = G.powerups.length - 1; i >= 0; i--) {
        const pw = G.powerups[i]; pw.y += 1.5; pw.time++;
        if (pw.y > H + 30) { G.powerups.splice(i, 1); continue; }
        const dx = pw.x - p.x; const dy = pw.y - p.y;
        if (dx * dx + dy * dy < 900) {
          if (pw.type === "❤️") p.hp = Math.min(p.hp + 1, p.maxHp);
          else if (pw.type === "⚡") p.speed = Math.min(p.speed + 0.5, 10);
          else if (pw.type === "🔥") G.powerLevel = Math.min(G.powerLevel + 1, 5);
          G.powerups.splice(i, 1);
          spawnParticles(pw.x, pw.y, "255,215,0", 10, 4);
          continue;
        }
        // Draw
        const bob = Math.sin(pw.time * 0.08) * 4;
        ctx.font = "24px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(pw.type, pw.x, pw.y + bob);
        ctx.beginPath(); ctx.arc(pw.x, pw.y + bob, 18, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,215,0,0.3)"; ctx.lineWidth = 1; ctx.stroke();
      }

      /* ── PARTICLES ── */
      for (let i = G.particles.length - 1; i >= 0; i--) {
        const pt = G.particles[i]; pt.x += pt.vx; pt.y += pt.vy; pt.vx *= 0.97; pt.vy *= 0.97; pt.life++;
        if (pt.life >= pt.maxLife) { G.particles.splice(i, 1); continue; }
        const a = 1 - pt.life / pt.maxLife;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size * a, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pt.color},${a})`; ctx.fill();
      }

      /* ── EXPLOSIONS ── */
      for (let i = G.explosions.length - 1; i >= 0; i--) {
        const ex = G.explosions[i]; ex.time++;
        if (ex.time >= ex.maxTime) { G.explosions.splice(i, 1); continue; }
        const prog = ex.time / ex.maxTime;
        const r = ex.size * (0.3 + prog * 0.7);
        const alpha = (1 - prog) * 0.6;
        const eg2 = ctx.createRadialGradient(ex.x, ex.y, 0, ex.x, ex.y, r);
        eg2.addColorStop(0, `rgba(255,255,255,${alpha})`); eg2.addColorStop(0.3, `rgba(${ex.color},${alpha * 0.8})`); eg2.addColorStop(1, `rgba(${ex.color},0)`);
        ctx.beginPath(); ctx.arc(ex.x, ex.y, r, 0, Math.PI * 2); ctx.fillStyle = eg2; ctx.fill();
        // Shockwave ring
        ctx.beginPath(); ctx.arc(ex.x, ex.y, r * 1.3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ex.color},${alpha * 0.4})`; ctx.lineWidth = 2; ctx.stroke();
      }

      /* ── DRAW PLAYER ── */
      if (p.invincible <= 0 || G.time % 4 < 2) {
        // Engine trail
        const tg = ctx.createRadialGradient(p.x, p.y + 25, 0, p.x, p.y + 25, 20);
        tg.addColorStop(0, "rgba(123,104,238,0.6)"); tg.addColorStop(0.5, "rgba(123,104,238,0.15)"); tg.addColorStop(1, "rgba(123,104,238,0)");
        ctx.beginPath(); ctx.arc(p.x, p.y + 25, 20, 0, Math.PI * 2); ctx.fillStyle = tg; ctx.fill();

        // Shield ring
        ctx.beginPath(); ctx.arc(p.x, p.y, 24, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(123,104,238,${0.2 + Math.sin(G.time * 0.1) * 0.1})`; ctx.lineWidth = 2; ctx.stroke();

        // Icon — Helix DNA logo
        if (helixImg.complete && helixImg.naturalWidth > 0) {
          ctx.drawImage(helixImg, p.x - 20, p.y - 20, 40, 40);
        } else {
          ctx.font = "36px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("🧬", p.x, p.y);
        }
      }

      /* ── HUD ── */
      ctx.textAlign = "left"; ctx.textBaseline = "top";
      // HP
      ctx.font = "bold 14px system-ui"; ctx.fillStyle = "#888"; ctx.fillText("HP", 20, 20);
      for (let i = 0; i < p.maxHp; i++) {
        const hx = 50 + i * 22;
        ctx.fillStyle = i < p.hp ? "#7B68EE" : "rgba(123,104,238,0.15)";
        ctx.fillRect(hx, 20, 18, 12); ctx.strokeStyle = "rgba(123,104,238,0.3)"; ctx.strokeRect(hx, 20, 18, 12);
      }
      // Score
      ctx.font = "bold 14px system-ui"; ctx.fillStyle = "#7B68EE";
      ctx.fillText(`SCORE: ${G.score}`, 20, 45);
      // Combo
      if (p.combo > 1) {
        ctx.fillStyle = p.combo >= 10 ? "#EC4899" : p.combo >= 5 ? "#F59E0B" : "#4A90E2";
        ctx.fillText(`COMBO: ${p.combo}x`, 20, 65);
      }
      // Wave
      ctx.textAlign = "right";
      ctx.font = "bold 14px system-ui"; ctx.fillStyle = "#666";
      ctx.fillText(`WAVE ${G.wave}/15`, W - 20, 20);
      // Power level
      ctx.fillStyle = "#7B68EE";
      ctx.fillText(`PWR ${"█".repeat(G.powerLevel)}${"░".repeat(5 - G.powerLevel)}`, W - 20, 40);
      // Kills
      ctx.fillStyle = "#555";
      ctx.fillText(`KILLS: ${G.kills}`, W - 20, 60);

      // Wave announcement
      if (G.waveTimer > 120) {
        ctx.textAlign = "center";
        ctx.globalAlpha = Math.min((G.waveTimer - 120) / 30, 1);
        ctx.font = "bold 32px system-ui";
        ctx.fillStyle = G.bossMode ? "#EF4444" : "#7B68EE";
        ctx.shadowColor = G.bossMode ? "rgba(239,68,68,0.5)" : "rgba(123,104,238,0.5)"; ctx.shadowBlur = 15;
        ctx.fillText(G.bossMode ? `⚠️ BOSS WAVE ${G.wave} ⚠️` : `WAVE ${G.wave}`, W / 2, H / 2 - 30);
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      }

      ctx.restore();
      raf = requestAnimationFrame(loop);
    };

    /* ── KEYBOARD ── */
    const onKeyDown = (e: KeyboardEvent) => {
      G.keys.add(e.key.toLowerCase());
      if (e.key === "Escape") { G.running = false; onExit(); }
      e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => { G.keys.delete(e.key.toLowerCase()); };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    loop();
    return () => { G.running = false; cancelAnimationFrame(raf); window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); };
  }, [onExit]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <button onClick={onExit} className="absolute top-4 right-4 z-10 px-4 py-2 text-xs font-bold text-zinc-500 hover:text-white border border-zinc-800 hover:border-helix-purple/40 rounded-lg transition-all bg-black/50 backdrop-blur-sm cursor-pointer">
        ESC — Exit Game
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   RADAR CHART (enhanced with gradients + pulsing dots)
   ═══════════════════════════════════════════════════════════════════════════════ */
function RadarChart({ scores, hoveredOS }: { scores: Record<OSKey, Record<string, number>>; hoveredOS: OSKey | null }) {
  const cats = DATA.map(d => d.category);
  const n = cats.length;
  const cx = 170, cy = 170, R = 130;
  const pt = useCallback((i: number, v: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + (v / 4) * R * Math.cos(a), y: cy + (v / 4) * R * Math.sin(a) };
  }, [n]);
  const poly = useCallback((os: OSKey) => cats.map((c, i) => { const p = pt(i, scores[os][c] || 0); return `${p.x},${p.y}`; }).join(" "), [cats, pt, scores]);

  return (
    <svg viewBox="0 0 340 340" className="w-full max-w-[340px] mx-auto drop-shadow-[0_0_40px_rgba(123,104,238,0.08)]">
      <defs>
        {OS_KEYS.map(os => (
          <radialGradient key={os} id={`rg-${os}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={OS_META[os].color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={OS_META[os].color} stopOpacity={0.02} />
          </radialGradient>
        ))}
      </defs>
      {[1, 2, 3, 4].map(lv => (
        <polygon key={lv} fill="none" stroke={lv === 4 ? "rgba(123,104,238,0.12)" : "rgba(113,113,122,0.1)"} strokeWidth={lv === 4 ? 1 : 0.5} strokeDasharray={lv < 4 ? "3,3" : "none"}
          points={cats.map((_, i) => { const p = pt(i, lv); return `${p.x},${p.y}`; }).join(" ")} />
      ))}
      {cats.map((_, i) => { const p = pt(i, 4); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(113,113,122,0.08)" strokeWidth={0.5} />; })}
      {cats.map((cat, i) => {
        const p = pt(i, 5.2);
        return (
          <g key={cat}>
            <text x={p.x} y={p.y - 6} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "12px" }}>{DATA[i].icon}</text>
            <text x={p.x} y={p.y + 8} textAnchor="middle" dominantBaseline="middle" className="fill-zinc-500 font-medium" style={{ fontSize: "6.5px" }}>
              {cat.length > 16 ? cat.slice(0, 14) + "…" : cat}
            </text>
          </g>
        );
      })}
      {OS_KEYS.map(os => {
        const hov = hoveredOS === os;
        const dim = hoveredOS !== null && !hov;
        return (
          <polygon key={os} points={poly(os)}
            fill={hov ? `url(#rg-${os})` : OS_META[os].color} fillOpacity={hov ? 1 : dim ? 0.01 : 0.06}
            stroke={OS_META[os].color} strokeWidth={hov ? 3 : dim ? 0.3 : 1.5} strokeOpacity={dim ? 0.1 : 1}
            strokeLinejoin="round" className="transition-all duration-700 ease-out"
            style={hov ? { filter: `drop-shadow(0 0 12px rgba(${OS_META[os].sc},0.4))` } : {}} />
        );
      })}
      {OS_KEYS.map(os => {
        const dim = hoveredOS !== null && hoveredOS !== os;
        if (dim) return null;
        return cats.map((c, i) => {
          const p = pt(i, scores[os][c] || 0);
          const hov = hoveredOS === os;
          return (
            <g key={`${os}-${i}`}>
              {hov && <circle cx={p.x} cy={p.y} r={10} fill={OS_META[os].color} opacity={0.15} className="animate-ping" style={{ transformOrigin: `${p.x}px ${p.y}px` }} />}
              <circle cx={p.x} cy={p.y} r={hov ? 5 : 3} fill={OS_META[os].color}
                className="transition-all duration-500" style={hov ? { filter: `drop-shadow(0 0 6px ${OS_META[os].color})` } : {}} />
            </g>
          );
        });
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════════ */
function Badge({ rating, glow, size = "sm" }: { rating: Rating; glow?: boolean; size?: "sm" | "lg" }) {
  const m = RATING[rating];
  const lg = size === "lg";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg font-bold tracking-wide transition-all duration-500 ${lg ? "px-3 py-1.5 text-xs" : "px-2.5 py-1 text-[11px]"}`}
      style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}`, boxShadow: glow ? `0 0 24px ${m.glow}, 0 0 0 1px ${m.border}` : "none" }}>
      <span className={`rounded-full ${lg ? "w-2 h-2" : "w-1.5 h-1.5"}`} style={{ background: m.color, boxShadow: glow ? `0 0 8px ${m.color}` : "none" }} />
      {m.label}
    </span>
  );
}

function WinnerCrown() {
  return (
    <span className="absolute -top-2.5 -right-2.5 text-sm drop-shadow-[0_0_8px_rgba(255,215,0,0.5)] animate-bounce" style={{ animationDuration: "2s" }}>
      👑
    </span>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  const { ref, val } = useCounter(value);
  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl md:text-4xl font-black tabular-nums" style={{ color }}>{val}</p>
      <p className="text-[11px] text-zinc-500 mt-1 font-medium">{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function ComparePage() {
  const { locale } = useI18n();
  const s = (k: string) => getDocString(compareContent, locale, k);

  const [hoveredOS, setHoveredOS] = useState<OSKey | null>(null);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [selectedFeat, setSelectedFeat] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [heroReady, setHeroReady] = useState(false);
  const [gameActive, setGameActive] = useState(false);

  useEffect(() => { const t = setTimeout(() => setHeroReady(true), 100); return () => clearTimeout(t); }, []);

  /* ── KONAMI CODE: ↑↑↓↓←→←→BA ── */
  useEffect(() => {
    const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let seq: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      if (gameActive) return;
      seq.push(e.key);
      if (seq.length > KONAMI.length) seq = seq.slice(-KONAMI.length);
      if (seq.length === KONAMI.length && seq.every((k, i) => k === KONAMI[i])) {
        setGameActive(true); seq = [];
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameActive]);

  const { catScores, totals, maxScore, catWinners } = useMemo(() => {
    const catScores: Record<OSKey, Record<string, number>> = { helix: {}, linux: {}, zircon: {}, sel4: {} };
    const totals: Record<OSKey, number> = { helix: 0, linux: 0, zircon: 0, sel4: 0 };
    let maxScore = 0;
    const catWinners: Record<string, OSKey> = {};

    for (const cat of DATA) {
      for (const os of OS_KEYS) catScores[os][cat.category] = 0;
      for (const f of cat.features) {
        for (const os of OS_KEYS) {
          const v = RATING[f[os].rating].value;
          catScores[os][cat.category] += v / cat.features.length;
          totals[os] += v;
        }
      }
      maxScore += cat.features.length * 4;
      let best: OSKey = "helix"; let bestVal = 0;
      for (const os of OS_KEYS) { if (catScores[os][cat.category] > bestVal) { bestVal = catScores[os][cat.category]; best = os; } }
      catWinners[cat.category] = best;
    }
    return { catScores, totals, maxScore, catWinners };
  }, []);

  const sortedOS = useMemo(() => [...OS_KEYS].sort((a, b) => totals[b] - totals[a]), [totals]);
  const totalFeatures = DATA.reduce((s, c) => s + c.features.length, 0);

  const reveal1 = useReveal(0.08);
  const reveal2 = useReveal(0.08);
  const reveal3 = useReveal(0.05);
  const reveal5 = useReveal(0.08);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-helix-purple/40 overflow-x-hidden">

      {/* ═══════════════ DEEP SPACE BACKGROUND ═══════════════ */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 120% 80% at 50% 40%, rgba(10,5,30,1) 0%, rgba(0,0,0,1) 100%)" }}>
        <DeepSpace />
      </div>

      <main className="relative">

        {/* ═══════════════════════════════════════════════════════════════
            ██  HERO — Cinematic entry
            ═══════════════════════════════════════════════════════════════ */}
        <div className="relative pt-28 pb-20 px-6 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(rgba(123,104,238,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(123,104,238,0.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

          <div className={`max-w-5xl mx-auto text-center transition-all duration-[1.5s] ease-out ${heroReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
            <Link href="/" className="inline-flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-300 transition-all duration-300 mb-10 group">
              <svg className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              {s("back_home")}
            </Link>

            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border backdrop-blur-xl mb-10 transition-all duration-1000 delay-300 ${heroReady ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
              style={{ background: "linear-gradient(135deg, rgba(123,104,238,0.08), rgba(74,144,226,0.08))", borderColor: "rgba(123,104,238,0.2)" }}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-helix-purple opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-helix-purple shadow-[0_0_8px_rgba(123,104,238,0.6)]" />
              </span>
              <span className="text-helix-purple text-xs font-bold tracking-wider uppercase">{s("badge")}</span>
            </div>

            <h1 className={`text-7xl md:text-[8rem] font-black tracking-tighter leading-[0.85] mb-8 transition-all duration-[1.8s] delay-200 ${heroReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}>
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600">
                {s("title_kernel")}
              </span>
              <span className="relative inline-block my-2">
                <span className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-helix-blue via-helix-purple to-pink-500 italic tracking-normal"
                  style={{ filter: "drop-shadow(0 0 30px rgba(123,104,238,0.3))" }}>
                  {s("title_vs")}
                </span>
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600">
                {s("title_kernel")}
              </span>
            </h1>

            <p className={`text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-14 transition-all duration-[2s] delay-500 ${heroReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              {s("subtitle")}
              <br className="hidden md:block" />
              <span className="text-zinc-300">4 kernels</span> · <span className="text-zinc-300">8 categories</span> · <span className="text-zinc-300">{totalFeatures} features</span> · <span className="text-zinc-300">{s("interactive_analysis")}</span>
            </p>

            {/* Hero stats bar */}
            <div className={`inline-flex flex-wrap justify-center items-center gap-8 md:gap-14 px-10 py-6 rounded-3xl border backdrop-blur-xl transition-all duration-[2s] delay-700 ${heroReady ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}`}
              style={{ background: "rgba(9,9,11,0.6)", borderColor: "rgba(63,63,70,0.3)", boxShadow: "0 0 80px rgba(123,104,238,0.06), inset 0 1px 0 rgba(255,255,255,0.03)" }}>
              {sortedOS.map((os, i) => {
                const m = OS_META[os];
                const pct = Math.round((totals[os] / maxScore) * 100);
                return (
                  <div key={os} className="flex items-center gap-3 group cursor-pointer" onMouseEnter={() => setHoveredOS(os)} onMouseLeave={() => setHoveredOS(null)}>
                    <div className="relative">
                      <span className={`text-3xl transition-transform duration-500 block ${hoveredOS === os ? "scale-125" : "group-hover:scale-110"}`}><OsIcon os={os} className="w-[1em] h-[1em]" /></span>
                      {i === 0 && <span className="absolute -top-2 -right-2 text-[10px]">👑</span>}
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">#{i + 1}</p>
                      <p className="text-lg font-black tabular-nums transition-all duration-300" style={{ color: m.color, textShadow: hoveredOS === os ? `0 0 20px rgba(${m.sc},0.5)` : "none" }}>
                        {pct}<span className="text-sm">%</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            ██  OS BATTLE CARDS — Hover to illuminate
            ═══════════════════════════════════════════════════════════════ */}
        <div ref={reveal1.ref} className={`max-w-7xl mx-auto px-6 mb-20 transition-all duration-1000 delay-100 ${reveal1.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{s("meet_contenders")}</h2>
            <p className="text-sm text-zinc-500">{s("meet_contenders_desc")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {OS_KEYS.map((os, i) => {
              const m = OS_META[os];
              const pct = Math.round((totals[os] / maxScore) * 100);
              const hov = hoveredOS === os;
              const rank = sortedOS.indexOf(os);
              const wins = Object.values(catWinners).filter(w => w === os).length;

              return (
                <div key={os}
                  onMouseEnter={() => setHoveredOS(os)}
                  onMouseLeave={() => setHoveredOS(null)}
                  className="group relative rounded-3xl border p-6 transition-all duration-700 cursor-pointer overflow-hidden"
                  style={{
                    borderColor: hov ? `rgba(${m.sc},0.5)` : "rgba(63,63,70,0.2)",
                    background: hov ? `linear-gradient(145deg, rgba(${m.sc},0.08), rgba(${m.sc},0.02))` : "rgba(15,15,18,0.6)",
                    boxShadow: hov
                      ? `0 0 80px rgba(${m.sc},0.15), 0 0 160px rgba(${m.sc},0.05), inset 0 1px 0 rgba(${m.sc},0.1)`
                      : "inset 0 1px 0 rgba(255,255,255,0.02)",
                    transform: hov ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
                    transitionDelay: reveal1.visible ? `${i * 80}ms` : "0ms",
                  }}>

                  <div className={`absolute -top-20 -right-20 w-44 h-44 rounded-full transition-all duration-700 ${hov ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
                    style={{ background: `radial-gradient(circle, rgba(${m.sc},0.25) 0%, transparent 65%)` }} />

                  <div className={`absolute top-0 left-6 right-6 h-[2px] rounded-full transition-all duration-700 ${hov ? "opacity-100" : "opacity-0"}`}
                    style={{ background: `linear-gradient(90deg, transparent, ${m.color}, transparent)` }} />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-5">
                      <div className="relative">
                        <span className={`text-5xl block transition-all duration-700 ${hov ? "scale-110" : ""}`}
                          style={hov ? { filter: `drop-shadow(0 0 20px rgba(${m.sc},0.4))` } : {}}><OsIcon os={os} className="w-[1em] h-[1em]" /></span>
                        {rank === 0 && <WinnerCrown />}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Rank</span>
                        <p className={`text-3xl font-black tabular-nums transition-all duration-500 ${hov ? "scale-110" : ""}`}
                          style={{ color: m.color, textShadow: hov ? `0 0 20px rgba(${m.sc},0.5)` : "none" }}>
                          #{rank + 1}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-white mb-1 tracking-tight">{m.name}</h3>
                    <p className="text-[11px] text-zinc-500 italic mb-4">{m.tagline}</p>

                    <div className="grid grid-cols-3 gap-2 mb-5 text-center">
                      <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/40 py-2 px-1">
                        <p className="text-[10px] text-zinc-600 font-medium">Type</p>
                        <p className="text-[11px] text-zinc-300 font-bold mt-0.5 leading-tight">{m.type}</p>
                      </div>
                      <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/40 py-2 px-1">
                        <p className="text-[10px] text-zinc-600 font-medium">Lang</p>
                        <p className="text-[11px] text-zinc-300 font-bold mt-0.5">{m.lang}</p>
                      </div>
                      <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/40 py-2 px-1">
                        <p className="text-[10px] text-zinc-600 font-medium">Code</p>
                        <p className="text-[11px] text-zinc-300 font-bold mt-0.5">{m.lines}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] mb-4">
                      <span className="text-zinc-500">Since <span className="text-zinc-300 font-bold">{m.year}</span></span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: `rgba(${m.sc},0.1)`, color: m.color }}>
                        {wins} category {wins === 1 ? "win" : "wins"}
                      </span>
                    </div>

                    <div className="relative">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-zinc-600 font-semibold uppercase tracking-wider">Overall Score</span>
                        <span className="text-sm font-black tabular-nums" style={{ color: m.color }}>{pct}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-zinc-800/80 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ease-out ${reveal1.visible ? "duration-[1.5s]" : "duration-0"}`}
                          style={{
                            width: reveal1.visible ? `${pct}%` : "0%",
                            background: `linear-gradient(90deg, ${m.color}, ${m.color}99)`,
                            boxShadow: hov ? `0 0 16px rgba(${m.sc},0.6), 0 0 40px rgba(${m.sc},0.2)` : "none",
                            transitionDelay: reveal1.visible ? `${500 + i * 200}ms` : "0ms",
                          }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            ██  STATS STRIP
            ═══════════════════════════════════════════════════════════════ */}
        <div className="max-w-5xl mx-auto px-6 mb-20">
          <div className="flex flex-wrap justify-center gap-10 md:gap-20 py-8 px-8 rounded-3xl border border-zinc-800/30 bg-zinc-950/30 backdrop-blur-sm">
            <Stat label="Kernels Compared" value={4} color="#7B68EE" />
            <Stat label="Categories" value={8} color="#4A90E2" />
            <Stat label="Features" value={totalFeatures} color="#EC4899" />
            <Stat label="Data Points" value={totalFeatures * 4} color="#22C55E" />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            ██  RADAR CHART
            ═══════════════════════════════════════════════════════════════ */}
        <div ref={reveal2.ref} className={`max-w-6xl mx-auto px-6 mb-20 transition-all duration-1000 delay-200 ${reveal2.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="rounded-3xl border border-zinc-800/40 bg-zinc-950/40 backdrop-blur-sm overflow-hidden"
            style={{ boxShadow: "0 0 80px rgba(123,104,238,0.03), inset 0 1px 0 rgba(255,255,255,0.02)" }}>
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-8 md:p-12 flex items-center justify-center relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-helix-purple/[0.03] blur-[60px]" />
                <RadarChart scores={catScores} hoveredOS={hoveredOS} />
              </div>
              <div className="lg:w-80 p-8 md:p-10 border-t lg:border-t-0 lg:border-l border-zinc-800/30 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-helix-purple/10 flex items-center justify-center border border-helix-purple/20">
                    <span className="text-sm">📊</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Capability Radar</h3>
                </div>
                <p className="text-[12px] text-zinc-500 mb-8 leading-relaxed">Hover any OS card or legend entry to isolate its performance shape across all 8 categories.</p>

                <div className="space-y-2">
                  {OS_KEYS.map(os => {
                    const m = OS_META[os];
                    const hov = hoveredOS === os;
                    return (
                      <button key={os}
                        onMouseEnter={() => setHoveredOS(os)}
                        onMouseLeave={() => setHoveredOS(null)}
                        className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-500 cursor-pointer text-left
                          ${hov ? "scale-[1.02]" : "hover:bg-zinc-800/20"}`}
                        style={{
                          background: hov ? `rgba(${m.sc},0.08)` : "transparent",
                          borderLeft: hov ? `3px solid ${m.color}` : "3px solid transparent",
                          boxShadow: hov ? `0 0 20px rgba(${m.sc},0.08)` : "none",
                        }}>
                        <span className={`w-3.5 h-3.5 rounded-full shrink-0 transition-all duration-500 ${hov ? "scale-125" : ""}`}
                          style={{ background: m.color, boxShadow: hov ? `0 0 12px ${m.color}` : "none" }} />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-zinc-200 block">{m.name}</span>
                          <span className="text-[10px] text-zinc-500 block truncate">{m.type}</span>
                        </div>
                        <span className="text-sm font-black tabular-nums shrink-0" style={{ color: m.color }}>
                          {Math.round((totals[os] / maxScore) * 100)}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            ██  VIEW MODE + SECTION HEADER
            ═══════════════════════════════════════════════════════════════ */}
        <div className="max-w-6xl mx-auto px-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-helix-purple/15 to-helix-blue/15 flex items-center justify-center border border-helix-purple/15">
                <svg className="w-5 h-5 text-helix-purple" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              Feature Breakdown
            </h2>
            <p className="text-sm text-zinc-500 mt-1 ml-[52px]">Click any feature for detailed comparison</p>
          </div>
          <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/50 backdrop-blur-sm">
            {(["table", "cards"] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer
                  ${viewMode === mode
                    ? "bg-helix-purple/15 text-helix-purple shadow-[0_0_15px_rgba(123,104,238,0.1)] border border-helix-purple/20"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"}`}>
                {mode === "table" ? "⊞ Table" : "▦ Cards"}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            ██  COMPARISON CATEGORIES
            ═══════════════════════════════════════════════════════════════ */}
        <div ref={reveal3.ref} className={`max-w-6xl mx-auto px-6 pb-20 transition-all duration-1000 ${reveal3.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="space-y-5">
            {DATA.map((cat, ci) => {
              const isOpen = openCat === cat.category || openCat === null;
              const winner = catWinners[cat.category];
              const wm = OS_META[winner];

              return (
                <div key={cat.category}
                  className="rounded-3xl border overflow-hidden backdrop-blur-sm transition-all duration-500"
                  style={{
                    borderColor: isOpen ? "rgba(63,63,70,0.25)" : "rgba(63,63,70,0.15)",
                    background: isOpen ? "rgba(9,9,11,0.5)" : "rgba(9,9,11,0.3)",
                    boxShadow: isOpen ? "inset 0 1px 0 rgba(255,255,255,0.02)" : "none",
                    transitionDelay: reveal3.visible ? `${ci * 60}ms` : "0ms",
                  }}>

                  {/* Category header */}
                  <button onClick={() => setOpenCat(openCat === cat.category ? null : cat.category)}
                    className="w-full px-7 py-6 flex items-center justify-between hover:bg-white/[0.015] transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center gap-5">
                      <span className={`text-3xl transition-all duration-500 ${isOpen ? "scale-110" : "group-hover:scale-105"}`}
                        style={isOpen ? { filter: "drop-shadow(0 0 8px rgba(123,104,238,0.3))" } : {}}>{cat.icon}</span>
                      <div className="text-left">
                        <h3 className="font-black text-white text-lg tracking-tight">{cat.category}</h3>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{cat.features.length} features · <span style={{ color: wm.color }} className="inline-flex items-center gap-1"><OsIcon os={winner} className="w-3.5 h-3.5" /> {wm.name} leads</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="hidden md:flex items-center gap-3">
                        {OS_KEYS.map(os => {
                          const avg = catScores[os][cat.category] || 0;
                          const hov = hoveredOS === os;
                          return (
                            <div key={os} className={`flex items-center gap-1.5 transition-all duration-300 ${hoveredOS !== null && !hov ? "opacity-20" : ""}`}>
                              <span className="text-sm"><OsIcon os={os} className="w-3.5 h-3.5" /></span>
                              <div className="w-14 h-2 rounded-full bg-zinc-800/60 overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700"
                                  style={{
                                    width: `${(avg / 4) * 100}%`,
                                    background: OS_META[os].color,
                                    boxShadow: hov ? `0 0 8px rgba(${OS_META[os].sc},0.5)` : "none",
                                  }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border"
                        style={{ background: `rgba(${wm.sc},0.08)`, color: wm.color, borderColor: `rgba(${wm.sc},0.2)` }}>
                        <OsIcon os={winner} className="w-3 h-3" /> Winner
                      </span>
                      <svg className={`w-5 h-5 text-zinc-600 transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </button>

                  {/* Features content */}
                  <div className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
                    {viewMode === "table" ? (
                      <div>
                        <div className="hidden md:grid grid-cols-[1.3fr_1fr_1fr_1fr_1fr] gap-px px-7 py-3.5 bg-zinc-900/20 border-t border-zinc-800/20">
                          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">Feature</div>
                          {OS_KEYS.map(os => (
                            <div key={os} className="text-[10px] font-bold uppercase tracking-[0.15em] text-center flex items-center justify-center gap-1.5"
                              style={{ color: OS_META[os].color }}>
                              <span><OsIcon os={os} className="w-3.5 h-3.5" /></span> {OS_META[os].name}
                            </div>
                          ))}
                        </div>

                        {cat.features.map((feat, fi) => {
                          const fid = `${ci}-${fi}`;
                          const isSel = selectedFeat === fid;
                          const bestRating = Math.max(...OS_KEYS.map(os => RATING[feat[os].rating].value));
                          const featWinners = OS_KEYS.filter(os => RATING[feat[os].rating].value === bestRating);

                          return (
                            <div key={feat.name}>
                              <button onClick={() => setSelectedFeat(isSel ? null : fid)}
                                className={`w-full grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr_1fr_1fr] gap-4 md:gap-2 px-7 py-5 border-t transition-all duration-300 cursor-pointer text-left
                                  ${isSel ? "bg-zinc-900/40 border-zinc-700/30" : "border-zinc-800/15 hover:bg-zinc-900/20"}`}>
                                <div className="text-sm font-bold text-zinc-200 flex items-center gap-3">
                                  <svg className={`w-4 h-4 text-zinc-600 transition-all duration-300 shrink-0 ${isSel ? "rotate-90 text-helix-purple" : ""}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                  {feat.name}
                                </div>
                                {OS_KEYS.map(os => {
                                  const dim = hoveredOS !== null && hoveredOS !== os;
                                  const isWinner = featWinners.includes(os) && featWinners.length < 4;
                                  return (
                                    <div key={os} className={`flex items-center justify-center gap-2 transition-all duration-500 ${dim ? "opacity-15 scale-90" : "opacity-100"}`}>
                                      <Badge rating={feat[os].rating} glow={hoveredOS === os || (isSel && isWinner)} />
                                      {isWinner && !dim && <span className="text-[10px] hidden md:inline" title="Category winner">👑</span>}
                                    </div>
                                  );
                                })}
                              </button>

                              {isSel && (
                                <div className="px-7 py-6 border-t border-zinc-800/15 bg-gradient-to-b from-zinc-900/20 to-transparent">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {OS_KEYS.map(os => {
                                      const m = OS_META[os];
                                      const r = feat[os];
                                      const isWinner = featWinners.includes(os) && featWinners.length < 4;
                                      return (
                                        <div key={os} className="relative rounded-2xl p-5 border transition-all duration-500 hover:scale-[1.02] group/detail"
                                          style={{
                                            background: `linear-gradient(145deg, rgba(${m.sc},0.04), transparent)`,
                                            borderColor: isWinner ? `rgba(${m.sc},0.3)` : `rgba(${m.sc},0.1)`,
                                            boxShadow: isWinner ? `0 0 30px rgba(${m.sc},0.08)` : "none",
                                          }}>
                                          {isWinner && (
                                            <div className="absolute -top-1.5 left-4 px-2 py-0.5 rounded-md text-[9px] font-bold border"
                                              style={{ background: `rgba(${m.sc},0.15)`, color: m.color, borderColor: `rgba(${m.sc},0.3)` }}>
                                              👑 BEST
                                            </div>
                                          )}
                                          <div className="flex items-center justify-between mb-4 mt-1">
                                            <div className="flex items-center gap-2.5">
                                              <span className="text-2xl"><OsIcon os={os} className="w-[1em] h-[1em]" /></span>
                                              <span className="text-sm font-black" style={{ color: m.color }}>{m.name}</span>
                                            </div>
                                            <Badge rating={r.rating} size="lg" glow={isWinner} />
                                          </div>
                                          <p className="text-[13px] text-zinc-400 leading-relaxed">{r.detail}</p>
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
                    ) : (
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-800/15">
                        {cat.features.map(feat => {
                          const bestRating = Math.max(...OS_KEYS.map(os => RATING[feat[os].rating].value));
                          return (
                            <div key={feat.name} className="rounded-2xl border border-zinc-800/30 bg-zinc-900/15 p-5 hover:bg-zinc-900/30 transition-all duration-300 hover:border-zinc-700/30">
                              <h4 className="text-base font-bold text-white mb-4">{feat.name}</h4>
                              <div className="space-y-3">
                                {OS_KEYS.map(os => {
                                  const m = OS_META[os];
                                  const r = feat[os];
                                  const w = (RATING[r.rating].value / 4) * 100;
                                  const isWinner = RATING[r.rating].value === bestRating && bestRating > 0;
                                  return (
                                    <div key={os} className={`flex items-center gap-3 transition-all duration-300 ${hoveredOS !== null && hoveredOS !== os ? "opacity-20" : ""}`}>
                                      <span className="text-lg w-6 text-center"><OsIcon os={os} className="w-5 h-5" /></span>
                                      <span className="text-[12px] font-semibold w-16 text-zinc-400 shrink-0">{m.name}</span>
                                      <div className="flex-1 h-2.5 rounded-full bg-zinc-800/60 overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700"
                                          style={{
                                            width: `${w}%`,
                                            background: `linear-gradient(90deg, ${m.color}, ${m.color}88)`,
                                            boxShadow: isWinner ? `0 0 8px rgba(${m.sc},0.4)` : "none",
                                          }} />
                                      </div>
                                      <Badge rating={r.rating} />
                                      {isWinner && <span className="text-xs">👑</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            ██  HELIX ADVANTAGE — Spotlight section
            ═══════════════════════════════════════════════════════════════ */}
        <div ref={reveal5.ref} className={`max-w-6xl mx-auto px-6 pb-20 transition-all duration-1000 ${reveal5.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="rounded-3xl border overflow-hidden"
            style={{ borderColor: "rgba(123,104,238,0.15)", background: "linear-gradient(145deg, rgba(123,104,238,0.04), rgba(9,9,11,0.6))", boxShadow: "0 0 120px rgba(123,104,238,0.06), inset 0 1px 0 rgba(255,255,255,0.03)" }}>
            <div className="px-8 pt-10 pb-6 text-center border-b border-zinc-800/20">
              <span className="mb-4 block" style={{ filter: "drop-shadow(0 0 20px rgba(123,104,238,0.3))" }}><HelixLogo className="w-16 h-16 mx-auto" /></span>
              <h3 className="text-2xl md:text-3xl font-black mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-helix-purple via-helix-blue to-pink-500">The Helix Advantage</span>
              </h3>
              <p className="text-sm text-zinc-500 max-w-lg mx-auto">What makes Helix OS the most exciting kernel project for modern developers</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800/10">
              {[
                { icon: "🔄", title: "Hot-Reload Modules", desc: "Swap kernel modules at runtime without rebooting — no other kernel can do this natively." },
                { icon: "🤖", title: "Built-in AI (NEXUS)", desc: "812K lines of ML-powered prediction, anomaly detection, and self-healing — industry first." },
                { icon: "🦀", title: "100% Rust", desc: "Memory-safe from day one. Zero unsafe in the module API surface — safer than any C kernel." },
                { icon: "🎨", title: "Lumina GPU Stack", desc: "197K-line graphics subsystem with a built-in shader compiler — unmatched for a new kernel." },
                { icon: "🛡️", title: "Per-File Encryption", desc: "AES-256 + Merkle tree integrity built into HelixFS — security by default, not by extension." },
                { icon: "🧠", title: "ML-Tuned Scheduler", desc: "DIS scheduler with real-time ML optimization adapts to workloads automatically." },
              ].map((adv, i) => (
                <div key={i} className="p-7 hover:bg-white/[0.02] transition-all duration-300 group cursor-default"
                  style={{ transitionDelay: reveal5.visible ? `${i * 80}ms` : "0ms" }}>
                  <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform duration-500"
                    style={{ filter: "drop-shadow(0 0 8px rgba(123,104,238,0.2))" }}>{adv.icon}</span>
                  <h4 className="text-base font-black text-white mb-2 tracking-tight">{adv.title}</h4>
                  <p className="text-[13px] text-zinc-500 leading-relaxed">{adv.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            ██  FINAL RANKINGS — Podium
            ═══════════════════════════════════════════════════════════════ */}
        {(() => {
          const revealFinal = reveal5; // reuse since it's nearby
          return (
            <div className="max-w-6xl mx-auto px-6 pb-24">
              <div className="rounded-3xl border border-zinc-800/30 overflow-hidden"
                style={{ background: "linear-gradient(180deg, rgba(9,9,11,0.6) 0%, rgba(9,9,11,0.3) 100%)", boxShadow: "0 0 100px rgba(123,104,238,0.04), inset 0 1px 0 rgba(255,255,255,0.02)" }}>

                <div className="px-8 pt-10 pb-6 text-center border-b border-zinc-800/20">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-helix-purple/15 to-helix-blue/15 border border-helix-purple/15 mb-4">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2">Overall Rankings</h3>
                  <p className="text-sm text-zinc-500">Aggregate scores across all {DATA.length} categories and {totalFeatures} features</p>
                </div>

                <div className="p-8 space-y-4">
                  {sortedOS.map((os, rank) => {
                    const m = OS_META[os];
                    const pct = Math.round((totals[os] / maxScore) * 100);
                    const isFirst = rank === 0;
                    const hov = hoveredOS === os;
                    const wins = Object.values(catWinners).filter(w => w === os).length;

                    return (
                      <div key={os}
                        onMouseEnter={() => setHoveredOS(os)}
                        onMouseLeave={() => setHoveredOS(null)}
                        className={`relative flex items-center gap-5 md:gap-6 p-5 md:p-6 rounded-2xl border transition-all duration-500 cursor-pointer group
                          ${hov ? "scale-[1.015]" : ""}`}
                        style={{
                          borderColor: hov ? `rgba(${m.sc},0.4)` : isFirst ? `rgba(${m.sc},0.2)` : "rgba(63,63,70,0.15)",
                          background: hov ? `linear-gradient(135deg, rgba(${m.sc},0.06), rgba(${m.sc},0.02))` : isFirst ? `rgba(${m.sc},0.02)` : "transparent",
                          boxShadow: hov ? `0 0 40px rgba(${m.sc},0.1), 0 0 80px rgba(${m.sc},0.03)` : isFirst ? `0 0 30px rgba(${m.sc},0.05)` : "none",
                        }}>

                        <span className={`text-3xl md:text-4xl font-black w-12 text-center tabular-nums shrink-0 transition-all duration-300 ${isFirst ? "" : "text-zinc-700"} ${hov ? "scale-110" : ""}`}
                          style={isFirst ? { color: m.color, textShadow: `0 0 20px rgba(${m.sc},0.4)` } : {}}>
                          {rank + 1}
                        </span>

                        <div className="relative shrink-0">
                          <span className={`text-4xl block transition-all duration-500 ${hov ? "scale-110" : ""}`}
                            style={hov ? { filter: `drop-shadow(0 0 16px rgba(${m.sc},0.4))` } : {}}><OsIcon os={os} className="w-[1em] h-[1em]" /></span>
                          {isFirst && <span className="absolute -top-2 -right-2 text-sm animate-bounce" style={{ animationDuration: "2s" }}>👑</span>}
                        </div>

                        <div className="w-32 md:w-40 shrink-0">
                          <p className="font-black text-lg" style={{ color: m.color }}>{m.name}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{m.type} · {wins} {wins === 1 ? "win" : "wins"}</p>
                        </div>

                        <div className="flex-1 min-w-0 hidden sm:block">
                          <div className="h-5 rounded-full bg-zinc-800/40 overflow-hidden relative">
                            <div className={`absolute inset-y-0 left-0 rounded-full transition-all ease-out ${revealFinal.visible ? "duration-[2s]" : "duration-0"}`}
                              style={{
                                width: revealFinal.visible ? `${pct}%` : "0%",
                                background: `linear-gradient(90deg, ${m.color}dd, ${m.color}66)`,
                                boxShadow: hov ? `0 0 20px rgba(${m.sc},0.5), inset 0 1px 0 rgba(255,255,255,0.15)` : "none",
                                transitionDelay: revealFinal.visible ? `${300 + rank * 250}ms` : "0ms",
                              }} />
                            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white/80 tabular-nums">
                              {pct}%
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 w-20 sm:w-24">
                          <p className="text-2xl md:text-3xl font-black tabular-nums" style={{ color: m.color, textShadow: hov ? `0 0 15px rgba(${m.sc},0.4)` : "none" }}>
                            {pct}<span className="text-base">%</span>
                          </p>
                          <p className="text-[10px] text-zinc-600 font-mono">{totals[os]}/{maxScore} pts</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-8 pb-8 text-center">
                  <p className="text-[11px] text-zinc-600 italic leading-relaxed max-w-lg mx-auto">
                    Scores reflect feature richness within each category — not an absolute quality ranking.
                    Each kernel excels in its own design philosophy and target use case.
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </main>

      {/* 🎮 SECRET: Konami Code → ↑↑↓↓←→←→BA */}
      {gameActive && <KernelWars onExit={() => setGameActive(false)} />}
    </div>
  );
}
