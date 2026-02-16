"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import donateContent from "@/helix-wiki/lib/docs-i18n/donate";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Data
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const tiers = [
  {
    name: "Supporter",
    emoji: "☕",
    price: "$5",
    period: "one-time",
    tagline: "Buy the team a coffee",
    description: "Every dollar keeps the lights on and the compiler running.",
    perks: ["Name in CREDITS.md", "Supporter badge on Discord", "Our eternal gratitude"],
    gradient: "from-zinc-400 to-zinc-500",
    accent: "#a1a1aa",
    ring: "ring-zinc-700/40 hover:ring-zinc-400/60",
    bg: "bg-zinc-900/40",
    iconBg: "from-zinc-500 to-zinc-600",
  },
  {
    name: "Contributor",
    emoji: "⚡",
    price: "$25",
    period: "/ month",
    tagline: "Fuel continuous development",
    description: "Directly fund kernel engineering, CI infrastructure, and documentation.",
    perks: ["Everything in Supporter", "Early access to releases", "Contributor role on Discord", "Vote on feature priorities"],
    gradient: "from-helix-blue to-helix-purple",
    accent: "#4A90E2",
    ring: "ring-helix-blue/25 hover:ring-helix-blue/60",
    bg: "bg-helix-blue/[0.03]",
    iconBg: "from-helix-blue to-blue-600",
  },
  {
    name: "Sponsor",
    emoji: "💎",
    price: "$100",
    period: "/ month",
    tagline: "Core sponsorship",
    description: "Your brand on the README, the website, and every release.",
    perks: ["Everything in Contributor", "Logo on GitHub README", "Logo on helix-wiki homepage", "Direct access to maintainers", "Quarterly progress reports"],
    gradient: "from-helix-purple to-helix-accent",
    accent: "#7B68EE",
    ring: "ring-helix-purple/30 hover:ring-helix-purple/70",
    bg: "bg-helix-purple/[0.04]",
    iconBg: "from-helix-purple to-fuchsia-600",
    popular: true,
  },
  {
    name: "Platinum",
    emoji: "🚀",
    price: "$500",
    period: "/ month",
    tagline: "Enterprise partnership",
    description: "Shape the future of open-source operating systems.",
    perks: ["Everything in Sponsor", "Large logo placement", "Feature request priority", "Monthly 1:1 with core team", "Custom integration support", "Mentioned in release notes"],
    gradient: "from-amber-400 to-orange-500",
    accent: "#f59e0b",
    ring: "ring-amber-500/25 hover:ring-amber-500/60",
    bg: "bg-amber-500/[0.03]",
    iconBg: "from-amber-400 to-orange-500",
  },
];

const quickAmounts = [
  { amount: "$10", emoji: "🧋", label: "Boba Tea", color: "text-emerald-400", glow: "group-hover:shadow-emerald-500/20" },
  { amount: "$50", emoji: "🍕", label: "Pizza Night", color: "text-blue-400", glow: "group-hover:shadow-blue-500/20" },
  { amount: "$250", emoji: "🖥️", label: "Server Costs", color: "text-purple-400", glow: "group-hover:shadow-purple-500/20" },
  { amount: "$1,000", emoji: "🏗️", label: "Milestone Fund", color: "text-amber-400", glow: "group-hover:shadow-amber-500/20" },
];

const milestones = [
  { goal: "$500 / mo", label: "Dedicated CI runners", progress: 72, color: "from-helix-blue to-helix-purple", icon: "🔄", raised: "$360" },
  { goal: "$2,000 / mo", label: "Part-time maintainer", progress: 28, color: "from-helix-purple to-helix-accent", icon: "👩‍💻", raised: "$560" },
  { goal: "$5,000 / mo", label: "Full-time engineer", progress: 8, color: "from-amber-400 to-orange-500", icon: "🚀", raised: "$400" },
];

const impactStats = [
  { icon: "🔩", value: 812000, label: "Lines of Rust", suffix: "+", sub: "100% #![no_std]" },
  { icon: "📦", value: 20, label: "Workspace Crates", suffix: "+", sub: "All hot-swappable" },
  { icon: "🏗️", value: 3, label: "Architectures", suffix: "", sub: "x86_64 · AArch64 · RISC-V" },
  { icon: "🤝", value: 0, label: "Corporate Owners", suffix: "", sub: "Community-driven forever" },
];

const fundingBreakdown = [
  { pct: 40, icon: "🖥️", title: "Infrastructure", desc: "CI runners, servers, domain & hosting, multi-arch hardware for testing.", color: "#4A90E2" },
  { pct: 30, icon: "👩‍💻", title: "Engineering", desc: "Contributor stipends, bounty programs, and part-time maintainer funding.", color: "#7B68EE" },
  { pct: 20, icon: "📚", title: "Documentation", desc: "Technical writing, diagrams, tutorials, and video content.", color: "#10b981" },
  { pct: 10, icon: "🌍", title: "Community", desc: "Conference sponsorships, swag, Discord bots, and outreach.", color: "#f59e0b" },
];


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Animated Heart Particles Canvas
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function HeartParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; decay: number; hue: number }[] = [];

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const spawnHeart = () => {
      if (particles.length > 40) return;
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 20,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -(Math.random() * 1.2 + 0.5),
        size: Math.random() * 12 + 6,
        alpha: Math.random() * 0.3 + 0.1,
        decay: Math.random() * 0.001 + 0.0005,
        hue: Math.random() > 0.5 ? 340 : 280,
      });
    };

    const drawHeart = (x: number, y: number, size: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      const s = size / 15;
      ctx.moveTo(0, -3 * s);
      ctx.bezierCurveTo(-5 * s, -15 * s, -22 * s, -10 * s, -15 * s, 2 * s);
      ctx.bezierCurveTo(-10 * s, 10 * s, 0, 16 * s, 0, 22 * s);
      ctx.bezierCurveTo(0, 16 * s, 10 * s, 10 * s, 15 * s, 2 * s);
      ctx.bezierCurveTo(22 * s, -10 * s, 5 * s, -15 * s, 0, -3 * s);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.04) spawnHeart();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx + Math.sin(p.y * 0.01) * 0.3;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0 || p.y < -50) { particles.splice(i, 1); continue; }
        drawHeart(p.x, p.y, p.size, `hsla(${p.hue}, 80%, 65%, ${p.alpha})`);
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }} />;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Animated Counter Hook
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end, duration]);

  return { count, ref };
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Scroll Reveal Hook
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Interactive Donut Chart
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function DonutChart({ items, activeIdx, onHover }: {
  items: typeof fundingBreakdown;
  activeIdx: number;
  onHover: (i: number) => void;
}) {
  const pad = 20;
  const size = 220;
  const full = size + pad * 2;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = full / 2;
  const cy = full / 2;
  let cumulative = 0;

  return (
    <svg width={full} height={full} viewBox={`0 0 ${full} ${full}`} className="transform -rotate-90" style={{ overflow: "visible" }}>
      {items.map((item, i) => {
        const dashLen = (item.pct / 100) * circumference;
        const dashOffset = -(cumulative / 100) * circumference;
        cumulative += item.pct;
        const isActive = activeIdx === i;
        return (
          <circle
            key={item.title}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={item.color}
            strokeWidth={isActive ? stroke + 4 : stroke}
            strokeDasharray={`${dashLen} ${circumference - dashLen}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            opacity={activeIdx === -1 ? 0.85 : isActive ? 1 : 0.3}
            style={{ transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)", cursor: "pointer" }}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(-1)}
          />
        );
      })}
      {/* Center text */}
      <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="central"
        className="fill-white text-3xl font-black" transform={`rotate(90 ${cx} ${cy})`}>
        {activeIdx >= 0 ? `${items[activeIdx].pct}%` : "100%"}
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" dominantBaseline="central"
        className="fill-zinc-500 text-[11px]" transform={`rotate(90 ${cx} ${cy})`}>
        {activeIdx >= 0 ? items[activeIdx].title : "Total Budget"}
      </text>
    </svg>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   3D Tilt Card
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function TiltCard({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (y - 0.5) * -8;
    const rotateY = (x - 0.5) * 8;
    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  }, []);

  const handleLeave = useCallback(() => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg)");
  }, []);

  return (
    <div ref={cardRef} onMouseMove={handleMove} onMouseLeave={handleLeave}
      className={`relative ${className}`}
      style={{ transform, transition: "transform 0.4s cubic-bezier(0.03, 0.98, 0.52, 0.99)" }}>
      {children}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Stats Counter Card
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function StatCard({ icon, value, label, suffix, sub, delay }: {
  icon: string; value: number; label: string; suffix: string; sub: string; delay: number;
}) {
  const { count, ref } = useCountUp(value, 2000);
  const formatNumber = (n: number) => {
    if (n >= 1000) return `${Math.floor(n / 1000)}K`;
    return String(n);
  };

  return (
    <div ref={ref} className="group relative text-center p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/30 backdrop-blur-sm hover:border-zinc-700/50 transition-all duration-500 hover:bg-zinc-900/50"
      style={{ animationDelay: `${delay}ms` }}>
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-pink-500/5 via-transparent to-helix-purple/5" />
      <div className="relative">
        <div className="text-3xl mb-3 group-hover:scale-125 transition-transform duration-500">{icon}</div>
        <div className="text-4xl font-black text-white tabular-nums">{formatNumber(count)}{suffix}</div>
        <div className="text-sm text-zinc-400 mt-1.5 font-medium">{label}</div>
        <div className="text-[11px] text-zinc-600 mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Page
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function DonatePage() {
  const { locale } = useI18n();
  const s = (k: string) => getDocString(donateContent, locale, k);

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [activeDonut, setActiveDonut] = useState(-1);
  const formRef = useRef<HTMLFormElement>(null);

  // Scroll reveal for each section
  const heroReveal = useReveal();
  const statsReveal = useReveal();
  const fundsReveal = useReveal();
  const milestonesReveal = useReveal();
  const tiersReveal = useReveal();
  const quickReveal = useReveal();
  const newsletterReveal = useReveal();
  const supportReveal = useReveal();

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || subscribing) return;
    setSubscribing(true);
    setTimeout(() => { setSubscribed(true); setSubscribing(false); }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-pink-500/30 overflow-x-hidden overflow-y-auto">
      {/* Floating hearts background */}
      <HeartParticles />

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 bg-grid opacity-15" />
        <div className="absolute top-[-10%] left-[20%] w-[min(800px,100vw)] h-[min(800px,100vh)] rounded-full bg-pink-600/[0.04] blur-[200px] animate-pulse-slow" />
        <div className="absolute top-[35%] right-[5%] w-[min(600px,90vw)] h-[min(600px,90vh)] rounded-full bg-helix-purple/[0.05] blur-[180px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-[-5%] left-[30%] w-[min(700px,100vw)] h-[min(700px,100vh)] rounded-full bg-rose-500/[0.03] blur-[200px] animate-pulse-slow" style={{ animationDelay: "4s" }} />
        <div className="absolute top-[60%] left-[5%] w-[min(400px,80vw)] h-[min(400px,80vh)] rounded-full bg-helix-blue/[0.04] blur-[160px] animate-pulse-slow" style={{ animationDelay: "3s" }} />
      </div>

      <style>{`
        @keyframes heartFloat { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-12px) scale(1.1); } }
        @keyframes progressGrow { 0% { width: 0%; } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes checkPop { 0% { transform: scale(0) rotate(-180deg); opacity: 0; } 50% { transform: scale(1.3) rotate(10deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
        @keyframes confetti1 { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-120px) translateX(30px) rotate(360deg); opacity: 0; } }
        @keyframes confetti2 { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-100px) translateX(-40px) rotate(-300deg); opacity: 0; } }
        @keyframes confetti3 { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-130px) translateX(50px) rotate(400deg); opacity: 0; } }
        @keyframes confetti4 { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-90px) translateX(-60px) rotate(-250deg); opacity: 0; } }
        @keyframes borderGlow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes revealUp { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes revealScale { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(236,72,153,0.4); } 70% { box-shadow: 0 0 0 15px rgba(236,72,153,0); } 100% { box-shadow: 0 0 0 0 rgba(236,72,153,0); } }
        @keyframes gradientFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

        .reveal { opacity: 0; transform: translateY(40px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-scale { opacity: 0; transform: scale(0.92); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal-scale.visible { opacity: 1; transform: scale(1); }
        .stagger-1 { transition-delay: 100ms; }
        .stagger-2 { transition-delay: 200ms; }
        .stagger-3 { transition-delay: 300ms; }
        .stagger-4 { transition-delay: 400ms; }
        .shimmer-line { position: relative; overflow: hidden; }
        .shimmer-line::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); animation: shimmer 2s ease-in-out infinite; }
        .gradient-flow { background-size: 200% 200%; animation: gradientFlow 4s ease infinite; }
        .glow-border { position: relative; overflow: hidden; }
        .glow-border::before { content: ''; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(135deg, rgba(236,72,153,0.3), rgba(123,104,238,0.3), rgba(74,144,226,0.3)); z-index: -1; animation: borderGlow 3s ease infinite; filter: blur(2px); }
        .card-3d { transition: all 0.4s cubic-bezier(0.03, 0.98, 0.52, 0.99); will-change: transform; }
        .card-3d:hover { transform: translateY(-6px); }
      `}</style>

      <main className="relative overflow-x-hidden" style={{ zIndex: 2 }}>

        {/* ═══════════════════════════════════════════════════════
            HERO — Cinematic
           ═══════════════════════════════════════════════════════ */}
        <section ref={heroReveal.ref} className={`relative pt-36 pb-28 reveal ${heroReveal.visible ? "visible" : ""}`}>
          <div className="max-w-5xl mx-auto px-6 text-center">
            {/* Animated heart icon with pulse rings */}
            <div className="relative inline-flex mb-10">
              <div className="absolute inset-[-12px] rounded-[28px] bg-pink-500/10" style={{ animation: "pulseRing 2s ease infinite" }} />
              <div className="absolute inset-[-6px] rounded-[24px] bg-pink-500/15" style={{ animation: "pulseRing 2s ease infinite 0.4s" }} />
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500/25 to-rose-600/25 border border-pink-500/30 flex items-center justify-center backdrop-blur-xl"
                   style={{ animation: "heartFloat 3s ease-in-out infinite" }}>
                <svg className="w-12 h-12 text-pink-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-[1.05] break-words">
              {s("title_line1")}{" "}
              <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-helix-purple bg-clip-text text-transparent gradient-flow bg-[length:200%_200%]">
                  {s("title_future")}
                </span>
              <br />
              <span className="text-zinc-500 text-4xl sm:text-5xl lg:text-6xl font-bold">{s("title_line2")}</span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Helix OS is built in the open, by passionate engineers, for everyone.
              No investors. No corporate agenda. Just{" "}
              <strong className="text-white">Rust, caffeine, and your support</strong>.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a href="#tiers"
                className="group relative px-6 sm:px-10 py-4 sm:py-4.5 rounded-full font-bold text-white overflow-hidden transition-transform hover:scale-105 active:scale-95">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 gradient-flow bg-[length:200%_200%]" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500" />
                <span className="relative flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  {s("become_sponsor")}
                </span>
              </a>
              <a href="https://github.com/sponsors/HelixOS-Org" target="_blank"
                className="px-6 sm:px-10 py-4 sm:py-4.5 rounded-full border border-zinc-700/60 text-white font-bold hover:bg-zinc-900 hover:border-zinc-600 transition-all flex items-center gap-2 backdrop-blur-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub Sponsors
              </a>
            </div>

            {/* Scroll indicator */}
            <div className="mt-20 flex justify-center">
              <div className="w-7 h-11 rounded-full border-2 border-zinc-700/60 flex justify-center pt-2.5">
                <div className="w-1.5 h-3 rounded-full bg-pink-400/60 animate-bounce" />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            IMPACT STATS — Animated counters
           ═══════════════════════════════════════════════════════ */}
        <section ref={statsReveal.ref} className={`relative py-16 reveal ${statsReveal.visible ? "visible" : ""}`}>
          <div className="absolute inset-0 border-y border-zinc-800/40 bg-zinc-950/40 backdrop-blur-md" />
          <div className="relative max-w-6xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
            {impactStats.map((s, i) => (
              <StatCard key={s.label} {...s} delay={i * 150} />
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            WHERE FUNDS GO — Interactive Donut
           ═══════════════════════════════════════════════════════ */}
        <section ref={fundsReveal.ref} className={`max-w-6xl mx-auto px-6 py-28 reveal ${fundsReveal.visible ? "visible" : ""}`}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-helix-blue/10 border border-helix-blue/20 text-helix-blue text-xs font-mono mb-5">
              💰 Full Transparency
            </div>
            <h2 className="text-3xl sm:text-5xl font-black">
              {s("where_funds_go")}{" "}
              <span className="bg-gradient-to-r from-helix-blue to-helix-purple bg-clip-text text-transparent">
                Actually Goes
              </span>
            </h2>
            <p className="text-zinc-500 mt-4 max-w-lg mx-auto text-lg">
              Every dollar is tracked and reported quarterly. Hover the chart to explore.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Donut chart */}
            <div className="shrink-0 flex justify-center">
              <DonutChart items={fundingBreakdown} activeIdx={activeDonut} onHover={setActiveDonut} />
            </div>

            {/* Breakdown list */}
            <div className="flex-1 space-y-4 w-full">
              {fundingBreakdown.map((item, i) => (
                <div key={item.title}
                  className={`group relative p-5 rounded-2xl border backdrop-blur-sm cursor-pointer transition-all duration-400 ${
                    activeDonut === i
                      ? "border-zinc-600/60 bg-zinc-900/60 scale-[1.02] shadow-lg"
                      : "border-zinc-800/30 bg-zinc-950/30 hover:border-zinc-700/50 hover:bg-zinc-900/40"
                  }`}
                  onMouseEnter={() => setActiveDonut(i)}
                  onMouseLeave={() => setActiveDonut(-1)}>
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full shrink-0 shadow-lg" style={{ backgroundColor: item.color, boxShadow: activeDonut === i ? `0 0 16px ${item.color}` : "none" }} />
                    <div className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white text-lg">{item.title}</h3>
                        <span className="text-xl font-black" style={{ color: item.color }}>{item.pct}%</span>
                      </div>
                      <p className="text-sm text-zinc-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  {/* Animated bar */}
                  <div className="mt-3 h-1.5 rounded-full bg-zinc-800/50 overflow-hidden">
                    <div className="h-full rounded-full shimmer-line"
                      style={{
                        width: fundsReveal.visible ? `${item.pct}%` : "0%",
                        backgroundColor: item.color,
                        transition: `width 1.5s ease ${i * 200}ms`,
                      }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FUNDING MILESTONES — Visual timeline
           ═══════════════════════════════════════════════════════ */}
        <section ref={milestonesReveal.ref} className={`max-w-4xl mx-auto px-6 pb-28 reveal ${milestonesReveal.visible ? "visible" : ""}`}>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-5">
              🎯 Funding Goals
            </div>
            <h2 className="text-3xl sm:text-5xl font-black">Milestones</h2>
            <p className="text-zinc-500 mt-4 text-lg">Every dollar brings us closer to the next goal.</p>
          </div>

          <div className="space-y-6">
            {milestones.map((m, i) => (
              <div key={m.label} className={`card-3d p-7 rounded-3xl border border-zinc-800/40 bg-zinc-950/50 backdrop-blur-sm stagger-${i + 1} ${milestonesReveal.visible ? "" : "opacity-0 translate-y-4"}`}
                style={{ transition: `all 0.6s ease ${i * 150}ms`, opacity: milestonesReveal.visible ? 1 : 0, transform: milestonesReveal.visible ? "translateY(0)" : "translateY(20px)" }}>
                <div className="flex items-center gap-5 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800/60 flex items-center justify-center text-2xl shrink-0">{m.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">{m.label}</h3>
                      <div className="text-right">
                        <span className={`text-2xl font-black bg-gradient-to-r ${m.color} bg-clip-text text-transparent`}>{m.progress}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-sm text-zinc-500">{m.raised} raised</span>
                      <span className="text-sm text-zinc-600">{m.goal}</span>
                    </div>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-3.5 rounded-full bg-zinc-800/60 overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${m.color} shimmer-line`}
                    style={{ width: milestonesReveal.visible ? `${m.progress}%` : "0%", transition: `width 1.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 300}ms` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SPONSORSHIP TIERS — 3D Tilt Cards
           ═══════════════════════════════════════════════════════ */}
        <section id="tiers" ref={tiersReveal.ref} className={`scroll-mt-24 relative pb-28 overflow-x-clip reveal ${tiersReveal.visible ? "visible" : ""}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/40 to-transparent pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-helix-purple/10 border border-helix-purple/20 text-helix-purple text-xs font-mono mb-5">
                ✨ {s("choose_tier")}
              </div>
              <h2 className="text-3xl sm:text-5xl font-black">
                Choose Your{" "}
                <span className="bg-gradient-to-r from-helix-purple to-pink-400 bg-clip-text text-transparent">Level of Impact</span>
              </h2>
              <p className="text-zinc-500 mt-4 max-w-lg mx-auto text-lg">
                Recurring subscriptions give us stability. One-time gifts are equally welcome.
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-7">
              {tiers.map((tier, i) => (
                <TiltCard key={tier.name} className="group">
                  <div className={`relative rounded-3xl ring-1 p-[1px] transition-all duration-500 ${tier.ring} ${tier.popular ? "mt-5" : ""}`}
                    style={{ opacity: tiersReveal.visible ? 1 : 0, transform: tiersReveal.visible ? "translateY(0)" : "translateY(30px)", transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms` }}>
                    {/* Popular badge — positioned above card with mt-5 spacing */}
                    {tier.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <div className="px-5 py-1.5 rounded-full bg-gradient-to-r from-helix-purple to-pink-500 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl shadow-helix-purple/30 gradient-flow bg-[length:200%_200%] whitespace-nowrap">
                          ★ Most Popular
                        </div>
                      </div>
                    )}

                    <div className={`h-full rounded-3xl ${tier.bg} backdrop-blur-xl p-7 flex flex-col relative overflow-hidden`}>
                      {/* Hover glow — clipped by overflow-hidden */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: `radial-gradient(300px circle at 50% 30%, ${tier.accent}15, transparent 70%)` }} />
                      {/* Background shimmer */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                      {/* Header */}
                      <div className="flex items-center gap-3 mb-5">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tier.iconBg} flex items-center justify-center text-2xl shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                          {tier.emoji}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                          <p className="text-[11px] text-zinc-500 font-medium">{tier.tagline}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-1.5 mb-4">
                        <span className={`text-5xl font-black bg-gradient-to-r ${tier.gradient} bg-clip-text text-transparent`}>{tier.price}</span>
                        <span className="text-sm text-zinc-500">{tier.period}</span>
                      </div>

                      <p className="text-sm text-zinc-400 leading-relaxed mb-6">{tier.description}</p>
                      <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent mb-6" />

                      {/* Perks */}
                      <ul className="space-y-3 flex-1">
                        {tier.perks.map((perk) => (
                          <li key={perk} className="flex items-start gap-2.5 text-sm text-zinc-300">
                            <svg className={`w-4 h-4 shrink-0 mt-0.5 ${tier.popular ? "text-helix-purple" : "text-helix-blue"}`}
                              fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            {perk}
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <a href="https://github.com/sponsors/HelixOS-Org" target="_blank"
                        className={`mt-8 block w-full py-4 rounded-xl text-center text-sm font-bold transition-all duration-300
                          ${tier.popular
                            ? "bg-gradient-to-r from-helix-purple to-pink-500 text-white shadow-xl shadow-helix-purple/20 hover:shadow-helix-purple/40 hover:scale-[1.03] gradient-flow bg-[length:200%_200%]"
                            : "border border-zinc-700/50 text-zinc-300 hover:bg-zinc-800/60 hover:text-white hover:border-zinc-500"
                          }`}>
                        {tier.period === "one-time" ? "Donate Now" : "Subscribe"} →
                      </a>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            QUICK ONE-TIME — Enhanced
           ═══════════════════════════════════════════════════════ */}
        <section ref={quickReveal.ref} className={`max-w-4xl mx-auto px-6 pb-28 reveal ${quickReveal.visible ? "visible" : ""}`}>
          <div className="glow-border rounded-3xl">
            <div className="rounded-3xl bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/40 overflow-hidden">
              <div className="px-8 py-7 border-b border-zinc-800/40 bg-gradient-to-r from-pink-500/[0.03] to-rose-500/[0.03]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/15 border border-pink-500/20 flex items-center justify-center text-2xl">🎁</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{s("quick_donate")}</h3>
                    <p className="text-sm text-zinc-500">No subscription — just a gift from the heart.</p>
                  </div>
                </div>
              </div>

              <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-5">
                {quickAmounts.map((t, i) => (
                  <a key={t.amount} href="https://github.com/sponsors/HelixOS-Org" target="_blank"
                    className={`group flex flex-col items-center gap-3 p-4 sm:p-7 rounded-2xl border border-zinc-800/30 bg-zinc-900/20 hover:border-pink-500/20 hover:bg-pink-500/[0.03] transition-all duration-400 card-3d ${t.glow} hover:shadow-lg`}
                    style={{ opacity: quickReveal.visible ? 1 : 0, transform: quickReveal.visible ? "translateY(0)" : "translateY(15px)", transition: `all 0.5s ease ${i * 80}ms` }}>
                    <span className="text-4xl group-hover:scale-125 group-hover:-rotate-12 transition-all duration-400">{t.emoji}</span>
                    <span className={`text-3xl font-black ${t.color}`}>{t.amount}</span>
                    <span className="text-xs text-zinc-500 font-medium">{t.label}</span>
                  </a>
                ))}
              </div>

              <div className="px-8 pb-8 text-center">
                <a href="https://github.com/sponsors/HelixOS-Org" target="_blank"
                  className="inline-flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300 transition-colors font-medium group">
                  Or enter a custom amount on GitHub Sponsors
                  <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            NEWSLETTER — Premium glassmorphism
           ═══════════════════════════════════════════════════════ */}
        <section ref={newsletterReveal.ref} className={`max-w-4xl mx-auto px-6 pb-28 reveal ${newsletterReveal.visible ? "visible" : ""}`}>
          <div className="relative rounded-3xl overflow-hidden">
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-helix-blue via-helix-purple to-pink-500 gradient-flow bg-[length:200%_200%] p-[1px]">
              <div className="w-full h-full rounded-3xl bg-zinc-950" />
            </div>

            <div className="relative rounded-3xl overflow-hidden">
              {/* Top gradient band */}
              <div className="h-1 bg-gradient-to-r from-helix-blue via-helix-purple to-pink-500 gradient-flow bg-[length:200%_200%]" />

              <div className="p-8 md:p-14 bg-zinc-950">
                <div className="flex flex-col md:flex-row items-center gap-12">
                  {/* Left */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-helix-purple/10 border border-helix-purple/20 text-helix-purple text-xs font-mono mb-6">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      Newsletter
                    </div>

                    <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                      Stay in the{" "}
                      <span className="bg-gradient-to-r from-helix-blue to-helix-purple bg-clip-text text-transparent">Loop</span>
                    </h3>
                    <p className="text-zinc-400 leading-relaxed mb-8 max-w-md text-lg">
                      Monthly updates on kernel development, new features, and community highlights. Zero spam.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: "📬", text: "Monthly digest" },
                        { icon: "🚀", text: "Release announcements" },
                        { icon: "🗺️", text: "Roadmap updates" },
                        { icon: "🎯", text: "Milestone alerts" },
                      ].map((b) => (
                        <div key={b.text} className="flex items-center gap-2.5 text-sm text-zinc-400 group">
                          <span className="text-lg group-hover:scale-110 transition-transform">{b.icon}</span>
                          {b.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right — Form */}
                  <div className="w-full md:w-auto md:min-w-[clamp(300px,40vw,380px)]">
                    {subscribed ? (
                      <div className="text-center py-10 space-y-5 relative">
                        {/* Confetti */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          <div className="absolute top-1/2 left-1/2 w-3 h-3 rounded-sm bg-pink-400" style={{ animation: "confetti1 1s ease forwards" }} />
                          <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 rounded-sm bg-helix-purple" style={{ animation: "confetti2 1.1s ease forwards 0.1s" }} />
                          <div className="absolute top-1/2 left-1/2 w-3.5 h-3.5 rounded-sm bg-helix-blue" style={{ animation: "confetti3 0.9s ease forwards 0.2s" }} />
                          <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-sm bg-amber-400" style={{ animation: "confetti4 1.2s ease forwards 0.15s" }} />
                          <div className="absolute top-1/2 left-1/2 w-3 h-3 rounded-sm bg-emerald-400" style={{ animation: "confetti1 1s ease forwards 0.3s" }} />
                          <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 rounded-sm bg-rose-400" style={{ animation: "confetti2 1.1s ease forwards 0.25s" }} />
                        </div>

                        <div className="inline-flex w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center" style={{ animation: "checkPop 0.7s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                          <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white">You&apos;re subscribed!</h4>
                          <p className="text-sm text-zinc-500 mt-1.5">Welcome to the Helix community. 🎉</p>
                        </div>
                      </div>
                    ) : (
                      <form ref={formRef} onSubmit={handleNewsletter} className="space-y-5">
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-zinc-600 group-focus-within:text-helix-purple transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                          </div>
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com" required
                            className="w-full pl-12 pr-4 py-4.5 bg-zinc-900/60 border border-zinc-800/50 rounded-xl text-white placeholder-zinc-600 text-sm outline-none focus:border-helix-purple/50 focus:shadow-[0_0_30px_rgba(123,104,238,0.12)] transition-all backdrop-blur-sm" />
                        </div>

                        <button type="submit" disabled={subscribing}
                          className="w-full py-4.5 rounded-xl bg-gradient-to-r from-helix-blue via-helix-purple to-pink-500 text-white font-bold text-sm hover:scale-[1.02] hover:shadow-xl hover:shadow-helix-purple/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 gradient-flow bg-[length:200%_200%]">
                          {subscribing ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Subscribing...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                              </svg>
                              {s("subscribe")}
                            </>
                          )}
                        </button>

                        <p className="text-[10px] text-zinc-700 text-center">
                          Unsubscribe anytime · No spam · We respect your privacy
                        </p>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            OTHER WAYS TO SUPPORT
           ═══════════════════════════════════════════════════════ */}
        <section ref={supportReveal.ref} className={`max-w-5xl mx-auto px-6 pb-28 reveal ${supportReveal.visible ? "visible" : ""}`}>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-5">
              🤝 More Ways to Help
            </div>
            <h2 className="text-3xl sm:text-5xl font-black">
              No Money?{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">No Problem.</span>
            </h2>
            <p className="text-zinc-500 mt-4 text-lg">Support Helix without spending a dime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-7">
            {[
              {
                icon: <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" /></svg>,
                title: "Star on GitHub",
                description: "Free but powerful. Stars boost visibility and attract contributors.",
                link: "https://github.com/HelixOS-Org/helix",
                cta: "Star the Repo",
                color: "text-amber-400",
                hoverBorder: "hover:border-amber-500/40",
                gradient: "from-amber-500/8 to-orange-500/8",
                iconGlow: "group-hover:shadow-amber-500/20",
              },
              {
                icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>,
                title: "Contribute Code",
                description: "Fix bugs, add features, improve docs. Every PR moves us forward.",
                link: "https://github.com/HelixOS-Org/helix/blob/main/CONTRIBUTING.md",
                cta: "Read the Guide",
                color: "text-helix-blue",
                hoverBorder: "hover:border-helix-blue/40",
                gradient: "from-helix-blue/8 to-blue-500/8",
                iconGlow: "group-hover:shadow-helix-blue/20",
              },
              {
                icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>,
                title: "Spread the Word",
                description: "Tweet, blog, tell a friend. Awareness is everything for open source.",
                link: "https://twitter.com/intent/tweet?text=Check%20out%20Helix%20OS%20%E2%80%94%20a%20modular%20kernel%20written%20entirely%20in%20Rust!%20https%3A%2F%2Fgithub.com%2FHelixOS-Org%2Fhelix",
                cta: "Share on X",
                color: "text-sky-400",
                hoverBorder: "hover:border-sky-500/40",
                gradient: "from-sky-500/8 to-cyan-500/8",
                iconGlow: "group-hover:shadow-sky-500/20",
              },
            ].map((item, i) => (
              <a key={item.title} href={item.link} target="_blank"
                className={`group relative p-8 rounded-3xl border border-zinc-800/40 bg-gradient-to-br ${item.gradient} backdrop-blur-sm ${item.hoverBorder} card-3d`}
                style={{ opacity: supportReveal.visible ? 1 : 0, transform: supportReveal.visible ? "translateY(0)" : "translateY(20px)", transition: `all 0.6s ease ${i * 120}ms` }}>
                <div className={`w-14 h-14 rounded-2xl bg-zinc-900/80 border border-zinc-800/50 flex items-center justify-center mb-6 ${item.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${item.iconGlow} group-hover:shadow-lg`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-helix-blue transition-colors">{item.title}</h3>
                <p className="text-sm text-zinc-500 mt-3 leading-relaxed">{item.description}</p>
                <span className={`inline-flex items-center gap-2 mt-6 text-sm font-semibold ${item.color} group-hover:gap-3 transition-all`}>
                  {item.cta}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            TRANSPARENCY BANNER
           ═══════════════════════════════════════════════════════ */}
        <section className="max-w-4xl mx-auto px-6 pb-28">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-helix-blue/20 via-helix-purple/20 to-pink-500/20 blur-sm" />
            <div className="relative m-[1px] rounded-3xl bg-zinc-950 p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-helix-blue/15 to-helix-purple/15 border border-helix-blue/20 flex items-center justify-center shrink-0">
                  <span className="text-4xl">🔍</span>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-black text-white mb-3">Full Transparency, Always</h3>
                  <p className="text-zinc-400 leading-relaxed">
                    Helix OS is MIT-licensed and will <strong className="text-white">always</strong> be free and open-source.
                    Donations go directly to infrastructure, tooling, and contributor stipends.
                    We publish a quarterly spending report in our{" "}
                    <Link href="https://github.com/HelixOS-Org/helix/discussions" className="text-helix-blue hover:underline">
                      GitHub Discussions
                    </Link>
                    {" "}— because trust is earned, not assumed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
