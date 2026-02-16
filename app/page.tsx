"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import HelixLogo from "@/helix-wiki/components/HelixLogo";
import Link from "next/link";
import { useI18n } from "@/helix-wiki/lib/i18n";

/* ═══════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════ */

const FEATURES = [
  { icon: "🧬", color: "#7B68EE", titleKey: "feat.trait_title", descKey: "feat.trait_desc", glyph: "trait T { }" },
  { icon: "🔄", color: "#4A90E2", titleKey: "feat.hotreload_title", descKey: "feat.hotreload_desc", glyph: "hot_swap!()" },
  { icon: "🛡️", color: "#22C55E", titleKey: "feat.selfheal_title", descKey: "feat.selfheal_desc", glyph: "self_heal()" },
  { icon: "⚡", color: "#F59E0B", titleKey: "feat.baremetal_title", descKey: "feat.baremetal_desc", glyph: "#![no_std]" },
  { icon: "🔐", color: "#EC4899", titleKey: "feat.capability_title", descKey: "feat.capability_desc", glyph: "cap::grant()" },
  { icon: "🧠", color: "#9B59B6", titleKey: "feat.ai_title", descKey: "feat.ai_desc", glyph: "nexus::predict()" },
];

const DOCS = [
  { href: "/docs/getting-started", icon: "🚀", titleKey: "doc.getting_started", desc: "Prerequisites, installation, building, and first boot in QEMU.", color: "#22C55E" },
  { href: "/docs/architecture", icon: "🏗️", titleKey: "doc.architecture", desc: "Layer stack, design philosophy, and crate dependency graph.", color: "#7B68EE" },
  { href: "/docs/core", icon: "🧬", titleKey: "doc.core", desc: "Trusted Computing Base: orchestrator, syscalls, IPC, interrupts, self-heal.", color: "#4A90E2" },
  { href: "/docs/hal", icon: "⚙️", titleKey: "doc.hal", desc: "Hardware Abstraction Layer: CPU, MMU, interrupts — multi-arch.", color: "#F59E0B" },
  { href: "/docs/subsystems", icon: "📦", titleKey: "doc.subsystems", desc: "Memory management, execution engine, DIS scheduler, init phases.", color: "#22D3EE" },
  { href: "/docs/modules", icon: "🔌", titleKey: "doc.modules", desc: "Hot-reload registry, ABI versioning, module metadata.", color: "#EC4899" },
  { href: "/docs/filesystem", icon: "💾", titleKey: "doc.filesystem", desc: "CoW filesystem with journaling, B+Tree, snapshots, encryption.", color: "#9B59B6" },
  { href: "/docs/nexus", icon: "🧠", titleKey: "doc.nexus", desc: "Kernel intelligence: prediction, anomaly detection, quarantine.", color: "#EF4444" },
  { href: "/docs/lumina", icon: "🎨", titleKey: "doc.lumina", desc: "Vulkan-class GPU API: render graphs, shaders, PBR materials.", color: "#F97316" },
  { href: "/docs/drivers", icon: "🖧", titleKey: "doc.drivers", desc: "Magma GPU driver, VirtIO support, driver module framework.", color: "#14B8A6" },
  { href: "/docs/benchmarks", icon: "📊", titleKey: "doc.benchmarks", desc: "Deterministic kernel benchmarks with statistical analysis.", color: "#A78BFA" },
  { href: "/docs/architectures", icon: "🖥️", titleKey: "doc.architectures", desc: "Deep dive into x86_64, AArch64, and RISC-V 64 HAL.", color: "#FFD700" },
  { href: "/docs/debugging", icon: "🐛", titleKey: "doc.debugging", desc: "GDB, serial console, QEMU flags, crash analysis.", color: "#EF4444" },
  { href: "/docs/profiles", icon: "📋", titleKey: "doc.profiles", desc: "Build profiles, helix.toml config, custom OS creation.", color: "#22C55E" },
];

const TOOLS = [
  { href: "/ask-helix", icon: "✨", titleKey: "itool.ask_helix", descKey: "itool.ask_helix_desc", ctaKey: "itool.ask_helix_cta", color: "#7B68EE" },
  { href: "/compare", icon: "📊", titleKey: "itool.compare", descKey: "itool.compare_desc", ctaKey: "itool.compare_cta", color: "#4A90E2" },
  { href: "/boot", icon: "⚡", titleKey: "itool.boot", descKey: "itool.boot_desc", ctaKey: "itool.boot_cta", color: "#22C55E" },
  { href: "/playground", icon: "🔧", titleKey: "itool.playground", descKey: "itool.playground_desc", ctaKey: "itool.playground_cta", color: "#F59E0B" },
];

/* ═══════════════════════════════════════════════════════════════════
   UNIVERSE CANVAS — Stars, galaxies, nebulae, planets, warp speed
   ═══════════════════════════════════════════════════════════════════ */

function UniverseCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W = 0, H = 0, raf = 0;

    const resize = () => {
      W = innerWidth; H = innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // ── Stars (3 depth layers) ──
    interface Star { x: number; y: number; z: number; r: number; bright: number; twinkleSpeed: number; twinklePhase: number; color: string }
    const starColors = ["#ffffff", "#c8d8ff", "#ffeedd", "#aaccff", "#ffe4b5", "#e8d0ff"];
    const starCount = Math.min(Math.floor(W * H / 2200), 600);
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H * 5,
        z: Math.random(), r: Math.random() * 1.6 + 0.3,
        bright: Math.random() * 0.6 + 0.4,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    // ── Nebulae (gaseous clouds) ──
    interface Nebula { x: number; y: number; rx: number; ry: number; rot: number; c1: string; c2: string; opacity: number }
    const nebulae: Nebula[] = [
      { x: W * 0.15, y: H * 0.3, rx: 280, ry: 180, rot: 20, c1: "rgba(123,104,238,0.04)", c2: "rgba(74,144,226,0.01)", opacity: 1 },
      { x: W * 0.8, y: H * 0.7, rx: 320, ry: 200, rot: -35, c1: "rgba(155,89,182,0.035)", c2: "rgba(236,72,153,0.01)", opacity: 1 },
      { x: W * 0.5, y: H * 1.5, rx: 350, ry: 250, rot: 10, c1: "rgba(74,144,226,0.04)", c2: "rgba(34,197,94,0.01)", opacity: 1 },
      { x: W * 0.2, y: H * 2.3, rx: 260, ry: 190, rot: -20, c1: "rgba(239,68,68,0.025)", c2: "rgba(249,115,22,0.01)", opacity: 1 },
      { x: W * 0.75, y: H * 3.2, rx: 300, ry: 220, rot: 40, c1: "rgba(123,104,238,0.03)", c2: "rgba(155,89,182,0.01)", opacity: 1 },
    ];

    // ── Galaxies (spiral shapes) ──
    interface Galaxy { x: number; y: number; size: number; arms: number; rot: number; rotSpeed: number; color: string; opacity: number }
    const galaxies: Galaxy[] = [
      { x: W * 0.82, y: H * 0.22, size: 50, arms: 3, rot: 0, rotSpeed: 0.001, color: "#7B68EE", opacity: 0.12 },
      { x: W * 0.12, y: H * 1.1, size: 65, arms: 4, rot: 45, rotSpeed: -0.0008, color: "#4A90E2", opacity: 0.1 },
      { x: W * 0.65, y: H * 2.0, size: 45, arms: 2, rot: 120, rotSpeed: 0.0012, color: "#9B59B6", opacity: 0.08 },
      { x: W * 0.3, y: H * 3.5, size: 55, arms: 3, rot: 200, rotSpeed: -0.001, color: "#EC4899", opacity: 0.09 },
    ];

    // ── Planets ──
    interface Planet { x: number; y: number; r: number; color: string; ring: boolean; glowColor: string }
    const planets: Planet[] = [
      { x: W * 0.88, y: H * 0.55, r: 14, color: "#4A90E2", ring: true, glowColor: "rgba(74,144,226,0.15)" },
      { x: W * 0.08, y: H * 1.7, r: 10, color: "#F59E0B", ring: false, glowColor: "rgba(245,158,11,0.12)" },
      { x: W * 0.72, y: H * 2.8, r: 18, color: "#9B59B6", ring: true, glowColor: "rgba(155,89,182,0.15)" },
      { x: W * 0.35, y: H * 4.0, r: 12, color: "#22C55E", ring: false, glowColor: "rgba(34,197,94,0.12)" },
    ];

    // ── Warp particles (speed streaks) ──
    interface WarpParticle { x: number; y: number; z: number; speed: number; color: string; length: number }
    const warpCount = 80;
    const warps: WarpParticle[] = [];
    const warpColors = ["rgba(123,104,238,", "rgba(74,144,226,", "rgba(155,89,182,", "rgba(255,255,255,"];
    for (let i = 0; i < warpCount; i++) {
      warps.push({
        x: (Math.random() - 0.5) * W * 3,
        y: (Math.random() - 0.5) * H * 3,
        z: Math.random() * 1500 + 100,
        speed: Math.random() * 4 + 2,
        color: warpColors[Math.floor(Math.random() * warpColors.length)],
        length: Math.random() * 30 + 10,
      });
    }

    const onScroll = () => { scrollRef.current = window.scrollY; };
    const onMouse = (e: MouseEvent) => { mouseRef.current = { x: e.clientX / W, y: e.clientY / H }; };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });

    let time = 0;

    const drawGalaxy = (g: Galaxy, t: number, scroll: number) => {
      const sy = g.y - scroll * 0.15;
      if (sy < -150 || sy > H + 150) return;
      const rot = g.rot + t * g.rotSpeed * 60;
      ctx.save();
      ctx.translate(g.x, sy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.globalAlpha = g.opacity;

      // Core glow
      const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, g.size * 0.4);
      coreGrad.addColorStop(0, g.color + "60");
      coreGrad.addColorStop(1, "transparent");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, g.size * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Spiral arms
      for (let a = 0; a < g.arms; a++) {
        const armAngle = (a / g.arms) * Math.PI * 2;
        ctx.beginPath();
        for (let s = 0; s < 80; s++) {
          const dist = (s / 80) * g.size;
          const angle = armAngle + (s / 80) * Math.PI * 2.5;
          const px = Math.cos(angle) * dist;
          const py = Math.sin(angle) * dist;
          if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = g.color + "40";
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Arm stars
      for (let a = 0; a < g.arms; a++) {
        const armAngle = (a / g.arms) * Math.PI * 2;
        for (let s = 0; s < 12; s++) {
          const dist = (s / 12) * g.size * 0.9 + 5;
          const angle = armAngle + (s / 12) * Math.PI * 2.5 + Math.sin(t * 0.01 + s) * 0.05;
          const px = Math.cos(angle) * dist + (Math.random() - 0.5) * 6;
          const py = Math.sin(angle) * dist + (Math.random() - 0.5) * 6;
          ctx.beginPath();
          ctx.arc(px, py, Math.random() * 0.8 + 0.3, 0, Math.PI * 2);
          ctx.fillStyle = g.color + "90";
          ctx.fill();
        }
      }
      ctx.restore();
    };

    const drawPlanet = (p: Planet, scroll: number, t: number) => {
      const sy = p.y - scroll * 0.2;
      if (sy < -50 || sy > H + 50) return;
      ctx.save();

      // Glow
      const glow = ctx.createRadialGradient(p.x, sy, p.r * 0.5, p.x, sy, p.r * 3);
      glow.addColorStop(0, p.glowColor);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, sy, p.r * 3, 0, Math.PI * 2);
      ctx.fill();

      // Body
      const bodyGrad = ctx.createRadialGradient(p.x - p.r * 0.3, sy - p.r * 0.3, 0, p.x, sy, p.r);
      bodyGrad.addColorStop(0, p.color);
      bodyGrad.addColorStop(1, p.color + "40");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(p.x, sy, p.r, 0, Math.PI * 2);
      ctx.fill();

      // Ring
      if (p.ring) {
        ctx.beginPath();
        ctx.ellipse(p.x, sy, p.r * 2.2, p.r * 0.5, Math.PI * 0.15, 0, Math.PI * 2);
        ctx.strokeStyle = p.color + "35";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.restore();
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      time++;
      const scroll = scrollRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.fillStyle = "#050507";
      ctx.fillRect(0, 0, W, H);

      // ── Nebulae ──
      for (const n of nebulae) {
        const ny = n.y - scroll * 0.1;
        if (ny < -400 || ny > H + 400) continue;
        ctx.save();
        ctx.translate(n.x + (mx - 0.5) * 15, ny);
        ctx.rotate((n.rot * Math.PI) / 180);
        ctx.globalAlpha = n.opacity;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, n.rx);
        grad.addColorStop(0, n.c1);
        grad.addColorStop(0.6, n.c2);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, n.rx, n.ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── Stars ──
      for (const s of stars) {
        const depth = 0.3 + s.z * 0.7;
        const sy = s.y - scroll * depth * 0.25;
        const sx = s.x + (mx - 0.5) * 10 * depth;
        const screenY = ((sy % (H * 5)) + H * 5) % (H * 5);
        if (screenY > H + 10) continue;
        const twinkle = Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.3 + 0.7;
        const alpha = s.bright * twinkle;
        ctx.beginPath();
        ctx.arc(sx, screenY, s.r * (0.5 + s.z * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        // Cross sparkle on bright stars
        if (s.r > 1.2 && twinkle > 0.85) {
          ctx.globalAlpha = alpha * 0.3;
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 0.3;
          const cr = s.r * 4;
          ctx.beginPath(); ctx.moveTo(sx - cr, screenY); ctx.lineTo(sx + cr, screenY); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(sx, screenY - cr); ctx.lineTo(sx, screenY + cr); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // ── Galaxies ──
      for (const g of galaxies) drawGalaxy(g, time, scroll);

      // ── Planets ──
      for (const p of planets) drawPlanet(p, scroll, time);

      // ── Warp speed particles (only in hero viewport) ──
      if (scroll < H * 1.5) {
        const warpIntensity = Math.max(0, 1 - scroll / (H * 1.2));
        const cx = W / 2 + (mx - 0.5) * 40;
        const cy = H / 2 + (my - 0.5) * 40;

        for (const w of warps) {
          w.z -= w.speed;
          if (w.z <= 1) {
            w.x = (Math.random() - 0.5) * W * 3;
            w.y = (Math.random() - 0.5) * H * 3;
            w.z = 1500;
          }

          const sx = (w.x / w.z) * 500 + cx;
          const sy = (w.y / w.z) * 500 + cy;
          const pz = w.z + w.speed * w.length * 0.15;
          const px = (w.x / pz) * 500 + cx;
          const py = (w.y / pz) * 500 + cy;

          if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) continue;

          const alpha = Math.max(0, (1 - w.z / 1500)) * 0.5 * warpIntensity;
          const lineW = Math.max(0.1, (1 - w.z / 1500) * 2);

          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = `${w.color}${alpha})`;
          ctx.lineWidth = lineW;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(sx, sy, lineW * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `${w.color}${alpha * 1.5})`;
          ctx.fill();
        }
      }

      // ── Shooting stars (rare) ──
      if (Math.random() < 0.003 && scroll < H * 2) {
        const sx = Math.random() * W;
        const sy = Math.random() * H * 0.6;
        const angle = Math.PI * 0.2 + Math.random() * 0.3;
        const len = 80 + Math.random() * 120;
        const grad = ctx.createLinearGradient(sx, sy, sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
        grad.addColorStop(0, "rgba(255,255,255,0.8)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    };

    raf = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}

/* ═══════════════════════════════════════════════════════════════════
   SCROLL-REVEAL with 3D depth + slide directions
   ═══════════════════════════════════════════════════════════════════ */

function Reveal({ children, className = "", delay = 0, from = "bottom" }: {
  children: React.ReactNode; className?: string; delay?: number;
  from?: "bottom" | "left" | "right" | "scale" | "flip" | "zoom";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShow(true); io.disconnect(); }
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden: Record<string, string> = {
    bottom: "translate3d(0,80px,0) rotateX(8deg)",
    left: "translate3d(-100px,0,0) rotateY(10deg)",
    right: "translate3d(100px,0,0) rotateY(-10deg)",
    scale: "scale3d(.85,.85,.85) rotateX(5deg)",
    flip: "rotateY(90deg) scale3d(.8,.8,.8)",
    zoom: "scale3d(.5,.5,.5) rotateX(15deg)",
  };

  return (
    <div ref={ref} className={className} style={{
      perspective: "1400px", transformStyle: "preserve-3d",
      opacity: show ? 1 : 0,
      transform: show ? "translate3d(0,0,0) rotate3d(0,0,0,0deg) scale3d(1,1,1)" : hidden[from],
      transition: `all .9s cubic-bezier(.16,1,.3,1) ${delay}s`,
      willChange: "transform, opacity",
    }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════════ */

function Counter({ to, label, color, prefix = "" }: { to: number; label: string; color: string; prefix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        const t0 = performance.now();
        const run = (now: number) => {
          const p = Math.min((now - t0) / 1600, 1);
          setN(Math.round(to * (1 - Math.pow(1 - p, 4))));
          if (p < 1) requestAnimationFrame(run);
        };
        requestAnimationFrame(run);
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return (
    <div ref={ref} className="text-center group">
      <p className="text-4xl md:text-5xl font-black tabular-nums transition-all duration-300 group-hover:scale-110" style={{ color, textShadow: `0 0 30px ${color}40` }}>
        {prefix}{n.toLocaleString()}
      </p>
      <p className="text-[11px] text-zinc-500 mt-2 font-medium tracking-wider uppercase">{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function Home() {
  const { t } = useI18n();
  const [scrollY, setScrollY] = useState(0);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onMouse = (e: MouseEvent) => setMouse({ x: e.clientX / innerWidth, y: e.clientY / innerHeight });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("mousemove", onMouse); };
  }, []);

  const heroY = Math.min(scrollY * 0.4, 300);
  const heroOp = Math.max(1 - scrollY / 600, 0);
  const logoRx = (mouse.y - 0.5) * -20;
  const logoRy = (mouse.x - 0.5) * 20;

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-helix-purple/30 overflow-x-hidden">
      <UniverseCanvas />

      <style>{`
        @keyframes heroIn{0%{opacity:0;transform:translateY(40px) scale(.94)}100%{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes logoOrbit{0%,100%{transform:translateY(0px) rotateZ(0deg)}25%{transform:translateY(-18px) rotateZ(1deg)}50%{transform:translateY(-8px) rotateZ(-1deg)}75%{transform:translateY(-22px) rotateZ(0.5deg)}}
        @keyframes glowPulse{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.7;transform:scale(1.1)}}
        @keyframes ringOrbit{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes ringReverse{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
        @keyframes shimmer{0%{background-position:-300% 0}100%{background-position:300% 0}}
        @keyframes pulseRing{0%,100%{box-shadow:0 0 0 0 rgba(123,104,238,.25)}50%{box-shadow:0 0 0 12px rgba(123,104,238,0)}}
        @keyframes slideTag{0%{opacity:0;transform:translateX(-10px)}100%{opacity:1;transform:translateX(0)}}
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
      `}</style>

      <main className="relative z-10">

        {/* ════════════════════════════════════════════════════════
           HERO — Full screen with HelixLogo + warp speed backdrop
           ════════════════════════════════════════════════════════ */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 w-full pt-24 pb-28 flex flex-col lg:flex-row items-center gap-16 lg:gap-12"
            style={{ opacity: heroOp, transform: `translate3d(0,${heroY}px,0)` }}>

            {/* Left — Text */}
            <div className="flex-1 space-y-7 z-10" style={{ animation: "heroIn 1s cubic-bezier(.16,1,.3,1) .1s both" }}>

              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-mono"
                style={{ background: "rgba(123,104,238,.08)", border: "1px solid rgba(123,104,238,.2)", color: "#7B68EE", animation: "slideTag .6s ease .3s both, pulseRing 3s ease-in-out infinite" }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-helix-purple opacity-50" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-helix-purple" />
                </span>
                {t("home.hero.badge")}
              </div>

              {/* Title */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight leading-[1.05]">
                <span className="block text-white drop-shadow-[0_0_30px_rgba(255,255,255,.1)]">{t("home.hero.title_1")}</span>
                <span className="block text-white">{t("home.hero.title_2")}{" "}
                  <span className="text-transparent bg-clip-text"
                    style={{ backgroundImage: "linear-gradient(90deg,#4A90E2,#7B68EE,#9B59B6,#EC4899,#7B68EE,#4A90E2)", backgroundSize: "300% auto", animation: "shimmer 6s linear infinite" }}>
                    {t("home.hero.title_3")}
                  </span>
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-zinc-400 max-w-xl leading-relaxed">
                {t("home.hero.subtitle")}{" "}
                <code className="text-helix-blue bg-helix-blue/10 px-2 py-0.5 rounded text-sm font-bold border border-helix-blue/15">#![no_std]</code>
                {t("home.hero.subtitle_2")}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/docs/architecture"
                  className="group relative px-8 py-4 rounded-xl font-bold text-sm overflow-hidden transition-all duration-300 hover:scale-105 active:scale-[.97]"
                  style={{ background: "linear-gradient(135deg,#4A90E2,#7B68EE,#9B59B6)", boxShadow: "0 4px 40px rgba(123,104,238,.3), inset 0 1px 0 rgba(255,255,255,.15)" }}>
                  <div className="absolute inset-[1px] rounded-[10px] bg-[#050507] group-hover:bg-transparent transition-all duration-500" />
                  <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-helix-blue via-helix-purple to-helix-accent group-hover:text-white transition-all duration-500">
                    {t("home.hero.cta")}
                  </span>
                </Link>
                <a href="https://github.com/HelixOS-Org/helix" target="_blank" rel="noopener noreferrer"
                  className="group px-8 py-4 rounded-xl border font-bold text-sm transition-all duration-300 flex items-center gap-2.5 hover:scale-105 active:scale-[.97]"
                  style={{ background: "rgba(255,255,255,.03)", borderColor: "rgba(255,255,255,.08)" }}>
                  <svg className="w-5 h-5 group-hover:rotate-[360deg] transition-transform duration-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  {t("home.hero.source")}
                </a>
              </div>

              {/* Shields */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {[
                  { href: "https://github.com/HelixOS-Org/helix/actions", src: "https://img.shields.io/github/actions/workflow/status/HelixOS-Org/helix/ci.yml?style=flat-square&logo=githubactions&logoColor=white&label=CI&color=22c55e", alt: "CI" },
                  { href: "https://github.com/HelixOS-Org/helix", src: "https://img.shields.io/badge/v0.4.0--aurora-7B68EE?style=flat-square&logo=rust&logoColor=white", alt: "Version" },
                  { href: "https://github.com/HelixOS-Org/helix/blob/main/LICENSE", src: "https://img.shields.io/github/license/HelixOS-Org/helix?style=flat-square&color=4A90E2", alt: "License" },
                  { href: "https://github.com/HelixOS-Org/helix", src: "https://img.shields.io/github/stars/HelixOS-Org/helix?style=flat-square&color=F59E0B&logo=github", alt: "Stars" },
                ].map(b => (
                  <a key={b.alt} href={b.href} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.src} alt={b.alt} className="h-[18px]" />
                  </a>
                ))}
              </div>
            </div>

            {/* Right — HelixLogo 3D */}
            <div className="relative flex-shrink-0 flex items-center justify-center" style={{ perspective: "1000px", animation: "heroIn 1.1s cubic-bezier(.16,1,.3,1) .2s both" }}>
              {/* Big glow */}
              <div className="absolute w-[380px] h-[380px] md:w-[480px] md:h-[480px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(123,104,238,.12) 0%, rgba(74,144,226,.05) 40%, transparent 70%)", animation: "glowPulse 5s ease-in-out infinite" }} />

              {/* Orbit ring 1 */}
              <div className="absolute w-[330px] h-[330px] md:w-[420px] md:h-[420px] rounded-full pointer-events-none"
                style={{ border: "1px solid rgba(123,104,238,.06)", animation: "ringOrbit 30s linear infinite" }}>
                <div className="absolute -top-1 left-1/2 w-3 h-3 rounded-full" style={{ background: "radial-gradient(circle, rgba(123,104,238,.5), transparent)", boxShadow: "0 0 8px rgba(123,104,238,.3)" }} />
                <div className="absolute -bottom-1 left-1/2 w-2 h-2 rounded-full bg-helix-blue/20" />
              </div>

              {/* Orbit ring 2 */}
              <div className="absolute w-[400px] h-[400px] md:w-[520px] md:h-[520px] rounded-full pointer-events-none"
                style={{ border: "1px solid rgba(74,144,226,.04)", animation: "ringReverse 45s linear infinite" }}>
                <div className="absolute top-1/2 -right-1 w-2 h-2 rounded-full bg-helix-accent/20" />
                <div className="absolute top-0 left-1/4 w-1.5 h-1.5 rounded-full bg-pink-400/15" />
              </div>

              {/* Logo — mouse parallax tilt + float */}
              <div style={{
                animation: "logoOrbit 8s ease-in-out infinite",
                transform: `rotateX(${logoRx}deg) rotateY(${logoRy}deg)`,
                transformStyle: "preserve-3d",
                transition: "transform .12s ease-out",
                filter: "drop-shadow(0 0 60px rgba(123,104,238,.35)) drop-shadow(0 0 120px rgba(74,144,226,.15))",
              }}>
                <HelixLogo className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-[24rem] lg:h-[24rem]" />
              </div>

              {/* Reflection */}
              <div className="absolute bottom-[-20px] w-48 h-4 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(ellipse, rgba(123,104,238,.1), transparent 70%)", animation: "glowPulse 5s ease-in-out infinite 1.5s" }} />
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none" style={{ opacity: heroOp }}>
            <span className="text-[9px] font-mono text-zinc-700 tracking-[.3em] uppercase">Scroll</span>
            <div className="w-5 h-9 rounded-full border border-zinc-700/30 flex items-start justify-center p-1.5">
              <div className="w-1 h-2.5 rounded-full bg-helix-purple/60 animate-bounce" />
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
           STATS — Glass morphism counters
           ════════════════════════════════════════════════════════ */}
        <Reveal from="zoom">
          <section className="max-w-4xl mx-auto px-6 py-24">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-10 rounded-3xl overflow-hidden relative"
              style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.04)", boxShadow: "0 0 100px rgba(123,104,238,.03), inset 0 0 60px rgba(123,104,238,.02), inset 0 1px 0 rgba(255,255,255,.04)" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-helix-blue/[.03] via-transparent to-helix-purple/[.03]" />
              <Counter to={6400} label={t("home.hero.stat_tcb")} color="#4A90E2" prefix="~" />
              <Counter to={20} label={t("home.hero.stat_crates")} color="#7B68EE" prefix="~" />
              <Counter to={3} label={t("home.hero.stat_arch")} color="#9B59B6" />
              <Counter to={47} label="Boot time (ms)" color="#22C55E" />
            </div>
          </section>
        </Reveal>

        {/* ════════════════════════════════════════════════════════
           PHILOSOPHY — Feature cards with 3D hover
           ════════════════════════════════════════════════════════ */}
        <Reveal from="bottom">
          <section className="max-w-6xl mx-auto px-6 py-24">
            <div className="text-center mb-16">
              <span className="text-[10px] font-mono text-helix-purple/50 tracking-[.4em] uppercase">Philosophy</span>
              <h2 className="text-4xl md:text-5xl font-black mt-4 leading-tight">
                {t("home.philosophy.title_1")}{" "}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg,#4A90E2,#7B68EE,#9B59B6,#4A90E2)", backgroundSize: "300% auto", animation: "shimmer 5s linear infinite" }}>{t("home.philosophy.not")}</span>{" "}
                {t("home.philosophy.title_2")}
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto mt-5 leading-relaxed">
                {t("home.philosophy.subtitle")} <strong className="text-white">{t("home.philosophy.subtitle_strong")}</strong> {t("home.philosophy.subtitle_2")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => (
                <Reveal key={i} from={i % 3 === 0 ? "left" : i % 3 === 1 ? "bottom" : "right"} delay={i * .08}>
                  <div className="group relative p-7 rounded-2xl overflow-hidden cursor-default transition-all duration-500 hover:scale-[1.04] hover:translate-y-[-4px]"
                    style={{ background: "rgba(255,255,255,.015)", border: "1px solid rgba(255,255,255,.04)", boxShadow: "0 4px 30px rgba(0,0,0,.2)" }}>
                    {/* Hover glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700"
                      style={{ background: `radial-gradient(ellipse at 30% 20%, ${f.color}12, transparent 60%)` }} />
                    {/* Top border glow */}
                    <div className="absolute top-0 left-[20%] right-[20%] h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `linear-gradient(90deg, transparent, ${f.color}50, transparent)` }} />

                    <div className="relative flex items-start justify-between mb-5">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-[-8deg]"
                        style={{ background: `${f.color}10`, border: `1px solid ${f.color}18`, boxShadow: `0 0 20px ${f.color}00`, ["--hover-shadow" as string]: `0 0 30px ${f.color}20` }}>
                        {f.icon}
                      </div>
                      <code className="text-[10px] font-mono px-2.5 py-1 rounded-lg text-zinc-700 group-hover:text-zinc-400 transition-all duration-500 group-hover:border-white/[.06] group-hover:bg-white/[.02]"
                        style={{ border: "1px solid transparent" }}>
                        {f.glyph}
                      </code>
                    </div>
                    <h3 className="relative font-bold text-white text-base mb-2.5 transition-all duration-500">
                      {t(f.titleKey)}
                    </h3>
                    <p className="relative text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors duration-500">{t(f.descKey)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ════════════════════════════════════════════════════════
           EXPLORE DOCS — Sliding grid
           ════════════════════════════════════════════════════════ */}
        <Reveal from="left">
          <section className="max-w-6xl mx-auto px-6 py-24">
            <div className="text-center mb-14">
              <span className="text-[10px] font-mono text-helix-blue/40 tracking-[.4em] uppercase">Documentation</span>
              <h2 className="text-3xl md:text-4xl font-black mt-4 flex items-center justify-center gap-3">
                <span className="w-1 h-9 rounded-full" style={{ background: "linear-gradient(180deg, #4A90E2, #7B68EE, #9B59B6)" }} />
                {t("home.explore")}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {DOCS.map((d, i) => (
                <Reveal key={d.href} from={i % 2 === 0 ? "left" : "right"} delay={i * .03}>
                  <Link href={d.href}
                    className="group relative flex items-start gap-4 p-5 rounded-2xl overflow-hidden transition-all duration-500 hover:translate-x-1"
                    style={{ background: "rgba(255,255,255,.01)", border: "1px solid rgba(255,255,255,.03)" }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${d.color}06, transparent 50%)` }} />
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: `linear-gradient(90deg, ${d.color}30, transparent)` }} />
                    <div className="relative w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all duration-500 group-hover:scale-115 group-hover:rotate-[-5deg]"
                      style={{ background: `${d.color}0c`, border: `1px solid ${d.color}12` }}>
                      {d.icon}
                    </div>
                    <div className="relative flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm transition-all">{t(d.titleKey)}</h3>
                      <p className="text-[12px] text-zinc-600 mt-1 group-hover:text-zinc-500 transition-colors line-clamp-1">{d.desc}</p>
                    </div>
                    <svg className="relative w-4 h-4 text-zinc-800 group-hover:text-zinc-400 group-hover:translate-x-2 transition-all duration-300 mt-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ════════════════════════════════════════════════════════
           INTERACTIVE TOOLS — Cards with depth
           ════════════════════════════════════════════════════════ */}
        <Reveal from="right">
          <section className="max-w-6xl mx-auto px-6 py-24">
            <div className="text-center mb-14">
              <span className="text-[10px] font-mono text-helix-accent/40 tracking-[.4em] uppercase">Interactive</span>
              <h2 className="text-3xl md:text-4xl font-black mt-4 flex items-center justify-center gap-3">
                <span className="w-1 h-9 rounded-full" style={{ background: "linear-gradient(180deg, #7B68EE, #9B59B6, #EC4899)" }} />
                {t("home.interactive")}
              </h2>
              <p className="text-zinc-500 text-sm mt-3 max-w-md mx-auto">{t("home.interactive_sub")}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TOOLS.map((tool, i) => (
                <Reveal key={tool.href} from="scale" delay={i * .08}>
                  <Link href={tool.href}
                    className="group relative flex flex-col items-center text-center p-5 rounded-xl overflow-hidden transition-all duration-500 hover:translate-y-[-4px] h-full"
                    style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)" }}>
                    {/* Glow */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                      style={{ background: `radial-gradient(circle at 50% 0%, ${tool.color}12, transparent 70%)` }} />
                    <div className="absolute top-0 left-[15%] right-[15%] h-[1px] opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: `linear-gradient(90deg, transparent, ${tool.color}50, transparent)` }} />
                    {/* Icon */}
                    <div className="relative w-11 h-11 rounded-lg flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform duration-500"
                      style={{ background: `${tool.color}10`, border: `1px solid ${tool.color}20` }}>
                      {tool.icon}
                    </div>
                    {/* Content */}
                    <h3 className="relative font-bold text-white text-sm">{t(tool.titleKey)}</h3>
                    <p className="relative text-[12px] text-zinc-500 mt-1.5 leading-relaxed">{t(tool.descKey)}</p>
                    <span className="relative inline-flex items-center gap-1 text-[11px] mt-auto pt-3 font-mono group-hover:gap-2 transition-all duration-500" style={{ color: tool.color }}>
                      {t(tool.ctaKey)}
                      <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ════════════════════════════════════════════════════════
           COMMUNITY
           ════════════════════════════════════════════════════════ */}
        <Reveal from="bottom">
          <section className="max-w-6xl mx-auto px-6 py-24">
            <div className="text-center mb-14">
              <span className="text-[10px] font-mono text-emerald-500/40 tracking-[.4em] uppercase">Community</span>
              <h2 className="text-3xl md:text-4xl font-black mt-4">Beyond the Code</h2>
              <p className="text-sm text-zinc-500 mt-3">Explore the community around Helix OS.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { href: "/contributors", icon: "👥", label: "Contributors", desc: "The humans behind the kernel.", color: "#EC4899" },
                { href: "/roadmap", icon: "🗺️", label: "Roadmap", desc: "Genesis to Apex.", color: "#7B68EE" },
                { href: "/glossary", icon: "📚", label: "Glossary", desc: "73 terms, 8 categories.", color: "#4A90E2" },
                { href: "/blog", icon: "📝", label: "Blog", desc: "Updates & deep dives.", color: "#22C55E" },
                { href: "/faq", icon: "❓", label: "FAQ", desc: "Quick answers.", color: "#F59E0B" },
                { href: "/contributing", icon: "🤝", label: "Contributing", desc: "First issue to PR.", color: "#9B59B6" },
              ].map((c, i) => (
                <Reveal key={c.href} from="scale" delay={i * .05}>
                  <Link href={c.href}
                    className="group flex flex-col items-center text-center p-4 rounded-xl transition-all duration-400 hover:translate-y-[-3px]"
                    style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.04)" }}>
                    <span className="text-2xl mb-2 group-hover:scale-110 inline-block transition-transform duration-400">{c.icon}</span>
                    <h3 className="font-semibold text-white text-xs">{c.label}</h3>
                    <p className="text-[10px] text-zinc-600 mt-1 leading-snug">{c.desc}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ════════════════════════════════════════════════════════
           TRY IT — ISO Download
           ════════════════════════════════════════════════════════ */}
        <Reveal from="zoom">
          <section className="max-w-5xl mx-auto px-6 py-24">
            <div className="relative rounded-3xl overflow-hidden"
              style={{ background: "rgba(255,255,255,.01)", border: "1px solid rgba(74,144,226,.12)", boxShadow: "0 0 120px rgba(74,144,226,.04), 0 0 60px rgba(123,104,238,.03), inset 0 1px 0 rgba(255,255,255,.04)" }}>
              {/* Ambient glows */}
              <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full blur-[100px] pointer-events-none" style={{ background: "rgba(74,144,226,.06)" }} />
              <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full blur-[100px] pointer-events-none" style={{ background: "rgba(123,104,238,.06)" }} />
              <div className="absolute inset-0 bg-gradient-to-br from-helix-blue/[.02] via-transparent to-helix-purple/[.02]" />

              <div className="relative p-8 md:p-14 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono"
                    style={{ background: "rgba(74,144,226,.08)", border: "1px solid rgba(74,144,226,.15)", color: "#4A90E2" }}>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    Bootable ISO · x86_64 · BIOS + UEFI
                  </div>

                  <h2 className="text-3xl md:text-4xl font-black">
                    {t("home.try_it")}{" "}
                    <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg,#4A90E2,#7B68EE,#9B59B6,#4A90E2)", backgroundSize: "300% auto", animation: "shimmer 4s linear infinite" }}>{t("home.try_it_now")}</span>
                  </h2>

                  <p className="text-zinc-400 leading-relaxed max-w-lg">
                    {t("home.try_desc")} <strong className="text-white">{t("home.try_profile")}</strong> {t("home.try_desc_2")}
                  </p>

                  {/* Terminal */}
                  <div className="rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,.3)", border: "1px solid rgba(255,255,255,.04)" }}>
                    <div className="flex items-center gap-1.5 px-4 py-2.5 border-b" style={{ background: "rgba(255,255,255,.02)", borderColor: "rgba(255,255,255,.03)" }}>
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                      <span className="text-[9px] font-mono text-zinc-700 ml-2">terminal</span>
                    </div>
                    <div className="p-4 font-mono text-[12px]">
                      <span className="text-emerald-400">$</span>
                      <span className="text-zinc-300"> qemu-system-x86_64 -cdrom helix-minimal.iso -m 128M</span>
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="flex flex-wrap gap-5 text-xs text-zinc-500">
                    {[
                      { c: "#4A90E2", l: "Kernel 406 Ko" }, { c: "#7B68EE", l: "ISO 32 Mo" },
                      { c: "#22C55E", l: "Boot < 1s" }, { c: "#F59E0B", l: "GRUB Multiboot2" },
                    ].map(s => (
                      <span key={s.l} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.c, boxShadow: `0 0 6px ${s.c}50` }} />
                        {s.l}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Download */}
                <div className="flex flex-col items-center gap-5 shrink-0">
                  <a href="/demos/helix-minimal.iso" download
                    className="group relative px-10 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 overflow-hidden transition-all duration-300 hover:scale-105 active:scale-[.97]"
                    style={{ background: "linear-gradient(135deg,#4A90E2,#7B68EE,#9B59B6)", boxShadow: "0 8px 50px rgba(123,104,238,.3), inset 0 1px 0 rgba(255,255,255,.15)" }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-helix-accent via-pink-500 to-helix-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <svg className="w-6 h-6 relative group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="relative">Download ISO</span>
                  </a>
                  <span className="text-[11px] text-zinc-600 font-mono">helix-minimal.iso · 32 MB</span>
                  <Link href="/download" className="text-xs text-helix-blue hover:text-helix-purple transition-colors">{t("home.details")}</Link>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Easter egg hint */}
        <div aria-hidden="true" className="select-none pointer-events-none text-center pb-4">
          <p className="text-[8px] text-zinc-900/15 tracking-[.5em] font-mono" title="↑↑↓↓←→←→BA">
            ▲ ▲ ▼ ▼ ◄ ► ◄ ► Ⓑ Ⓐ
          </p>
        </div>
      </main>
    </div>
  );
}
