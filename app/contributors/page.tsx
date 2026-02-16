"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import HelixLogo from "@/helix-wiki/components/HelixLogo";
import Link from "next/link";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import contributorsContent from "@/helix-wiki/lib/docs-i18n/contributors";

/* ═══════════════════════════════════════════════════════════════════════════════
   GITHUB API TYPES & HELPERS
   ═══════════════════════════════════════════════════════════════════════════════ */
const REPO_OWNER = "HelixOS-Org";
const REPO_NAME = "helix";
const CACHE_KEY = "helix-wiki-gh-contributors";
const CACHE_TTL = 1000 * 60 * 30; // 30 min

interface GitHubContributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string; // "User" or "Organization" or "Bot"
}

interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  type: string;
}

interface GitHubRepo {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  language: string | null;
  subscribers_count: number;
}

interface EnrichedContributor {
  login: string;
  name: string;
  avatar: string;
  url: string;
  bio: string;
  location: string;
  company: string;
  blog: string;
  twitter: string;
  publicRepos: number;
  followers: number;
  following: number;
  contributions: number;
  joinedGitHub: string;
  type: string;
}

interface CachedData {
  contributors: EnrichedContributor[];
  repo: { stars: number; forks: number; openIssues: number; size: number; watchers: number };
  languages: Record<string, number>;
  timestamp: number;
}

async function ghFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

function getCached(): CachedData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data: CachedData = JSON.parse(raw);
    if (Date.now() - data.timestamp > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function setCache(data: CachedData) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* quota */ }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatSize(kb: number): string {
  if (kb > 1000) return `${(kb / 1000).toFixed(0)} MB`;
  return `${kb} KB`;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   STATIC DATA (non-API)
   ═══════════════════════════════════════════════════════════════════════════════ */
interface Area {
  name: string; icon: string; color: string;
  desc: string; detail: string; difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
}

const AREAS: Area[] = [
  { name: "Kernel Core", icon: "🧬", color: "#7B68EE", desc: "TCB, syscalls, IPC, interrupts, orchestrator", detail: "The beating heart of Helix. Work on the trusted computing base, inter-process communication, interrupt handling, and module orchestration.", difficulty: "advanced", tags: ["helix-core", "security", "ipc"] },
  { name: "HAL", icon: "⚙️", color: "#4A90E2", desc: "x86_64, AArch64, RISC-V hardware abstraction", detail: "Platform-independent traits for CPU, MMU, timers, and interrupts. Add new architecture support or improve existing implementations.", difficulty: "advanced", tags: ["helix-hal", "x86_64", "aarch64", "riscv"] },
  { name: "Memory", icon: "📦", color: "#22C55E", desc: "Frame allocator, VMM, slab allocator, CoW, HHDM", detail: "Physical and virtual memory management. Improve the buddy allocator, implement huge page support, or optimize the slab allocator.", difficulty: "advanced", tags: ["memory", "allocator", "paging"] },
  { name: "Scheduler (DIS)", icon: "⏱️", color: "#22D3EE", desc: "Intent-based scheduling, real-time, EDF, energy modes", detail: "The Differentiated Intent Scheduler. Work on scheduling classes, CPU affinity, SMP support, or NEXUS-driven predictive scheduling.", difficulty: "advanced", tags: ["scheduler", "dis", "smp"] },
  { name: "HelixFS", icon: "💾", color: "#9B59B6", desc: "B+Tree filesystem, journaling, snapshots, encryption", detail: "A modern filesystem with B+tree indexing, write-ahead logging, copy-on-write snapshots, AES-256-GCM encryption, and LZ4/Zstd compression.", difficulty: "intermediate", tags: ["helixfs", "filesystem", "storage"] },
  { name: "Lumina / GPU", icon: "🎨", color: "#EF4444", desc: "Vulkan-class API, render graphs, compute shaders", detail: "GPU abstraction layer with OpenGL and Vulkan-style APIs. Work on the Magma driver, shader compilation, or render graph optimization.", difficulty: "advanced", tags: ["lumina", "magma", "gpu", "graphics"] },
  { name: "NEXUS AI", icon: "🧠", color: "#EC4899", desc: "ML models, anomaly detection, self-healing", detail: "Kernel-integrated intelligence. ML models for anomaly detection, crash prediction, and self-healing.", difficulty: "advanced", tags: ["nexus", "ml", "ai"] },
  { name: "Drivers", icon: "🔌", color: "#F59E0B", desc: "VirtIO, PS/2, serial, framebuffer, USB", detail: "Device drivers for QEMU and real hardware. VirtIO block/net/console, PS/2 keyboard, 16550 UART, framebuffer. Great entry point!", difficulty: "intermediate", tags: ["drivers", "virtio", "device"] },
  { name: "Documentation", icon: "📖", color: "#A78BFA", desc: "Wiki, API docs, tutorials, architecture guides", detail: "Help others understand Helix. Write tutorials, improve API docs, create diagrams, or translate documentation. No kernel experience needed!", difficulty: "beginner", tags: ["docs", "wiki", "tutorial"] },
  { name: "Testing", icon: "🧪", color: "#14B8A6", desc: "Unit tests, integration tests, QEMU tests, benchmarks", detail: "Ensure kernel reliability. Write unit tests, create QEMU integration tests, build benchmark suites, or set up fuzzing infrastructure.", difficulty: "beginner", tags: ["testing", "benchmark", "ci"] },
];

const STEPS = [
  { num: 1, title: "Fork & Clone", icon: "🍴", desc: "Fork the repo, clone locally, set up Rust nightly + QEMU.", cmd: "git clone https://github.com/YOUR_USER/helix.git && cd helix && make setup", time: "~5 min" },
  { num: 2, title: "Build & Boot", icon: "🚀", desc: "Build the kernel and watch it boot in QEMU. See the magic happen.", cmd: "make build && make run", time: "~2 min" },
  { num: 3, title: "Pick an Issue", icon: "🎯", desc: "Find a 'good first issue' or 'help wanted' — or propose your own idea.", cmd: "# Browse: github.com/HelixOS-Org/helix/issues", time: "~5 min" },
  { num: 4, title: "Code & Test", icon: "⚡", desc: "Write your code, add tests, run cargo test and make pre-commit.", cmd: "cargo test --target x86_64-unknown-linux-gnu && make pre-commit", time: "varies" },
  { num: 5, title: "Submit PR", icon: "🎉", desc: "Push your branch, open a PR. We review within 48h with constructive feedback.", cmd: "git push origin my-feature && # Open PR on GitHub", time: "~48h review" },
];

const WHY_CONTRIBUTE = [
  { icon: "🦀", title: "100% Rust", desc: "No C, no unsafe spaghetti — a modern kernel in a modern language. Learn low-level Rust in a real project.", color: "#DEA584" },
  { icon: "🧩", title: "Modular Architecture", desc: "Swap, hot-reload, or replace any kernel module at runtime. Understand every piece independently.", color: "#7B68EE" },
  { icon: "🧠", title: "AI-Integrated Kernel", desc: "NEXUS brings ML models inside the kernel — anomaly detection, predictive scheduling, self-healing. Cutting-edge OS research.", color: "#EC4899" },
  { icon: "📖", title: "Exceptionally Documented", desc: "Every module, every API, every design decision is documented. Wiki, inline docs, architecture guides — you'll never feel lost.", color: "#A78BFA" },
  { icon: "🏗️", title: "Multi-Architecture", desc: "x86_64, AArch64, RISC-V — work on real hardware abstraction across 3 architectures with a clean HAL.", color: "#4A90E2" },
  { icon: "🎮", title: "GPU & Graphics", desc: "Lumina brings Vulkan-class GPU abstraction to the kernel. Shaders, render graphs, compute — in a kernel context.", color: "#EF4444" },
];

/* Role colors based on contribution rank */
const ROLE_COLORS = [
  "#FFD700", "#C0C0C0", "#CD7F32", "#7B68EE", "#4A90E2",
  "#22C55E", "#EC4899", "#F59E0B", "#14B8A6", "#A78BFA",
  "#EF4444", "#9B59B6", "#22D3EE", "#F97316",
];
function roleColor(i: number) { return ROLE_COLORS[i % ROLE_COLORS.length]; }
function roleLabel(i: number, type: string) {
  if (type === "Bot") return "Bot";
  if (i === 0) return "Creator & Lead";
  if (i === 1) return "Core Contributor";
  if (i < 5) return "Contributor";
  return "Contributor";
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CONSTELLATION CANVAS
   ═══════════════════════════════════════════════════════════════════════════════ */
function ConstellationCanvas() {
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
    let W = innerWidth, H = Math.max(document.documentElement.scrollHeight, innerHeight);
    const resize = () => {
      W = innerWidth; H = Math.max(document.documentElement.scrollHeight, innerHeight);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    interface Star { x: number; y: number; r: number; pulse: number; sp: number }
    const count = Math.min(Math.floor(W * H / 15000), 180);
    const stars: Star[] = [];
    for (let i = 0; i < count; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H, r: 0.3 + Math.random() * 1.6, pulse: Math.random() * Math.PI * 2, sp: 0.5 + Math.random() * 1 });
    }
    const links: { a: number; b: number }[] = [];
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const d = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
        if (d < 90 && Math.random() < 0.25) links.push({ a: i, b: j });
      }
    }

    let t = 0;
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, W, H);
      t++;
      for (const l of links) {
        const sa = stars[l.a], sb = stars[l.b];
        const flicker = Math.sin(t * 0.01 + sa.pulse) * 0.5 + 0.5;
        ctx.beginPath(); ctx.moveTo(sa.x, sa.y); ctx.lineTo(sb.x, sb.y);
        ctx.strokeStyle = `rgba(123,104,238,${0.015 + flicker * 0.015})`; ctx.lineWidth = 0.5; ctx.stroke();
      }
      for (const s of stars) {
        const p = Math.sin(t * 0.015 * s.sp + s.pulse) * 0.5 + 0.5;
        const a = 0.08 + p * 0.15;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (1 + p * 0.2), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,170,220,${a})`; ctx.fill();
        if (s.r > 1.2) {
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(123,104,238,${a * 0.06})`; ctx.fill();
        }
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LOADING SKELETON
   ═══════════════════════════════════════════════════════════════════════════════ */
function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-zinc-800/20 bg-[#0c0c0e] p-6 md:p-8 animate-pulse">
      <div className="flex items-start gap-5">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-zinc-800/60 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-40 bg-zinc-800/60 rounded" />
          <div className="h-3 w-28 bg-zinc-800/40 rounded" />
          <div className="h-4 w-64 bg-zinc-800/40 rounded mt-3" />
          <div className="flex gap-4 mt-4">
            <div className="h-10 w-16 bg-zinc-800/40 rounded" />
            <div className="h-10 w-16 bg-zinc-800/40 rounded" />
            <div className="h-10 w-16 bg-zinc-800/40 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PROFILE CARD — Real GitHub data
   ═══════════════════════════════════════════════════════════════════════════════ */
function ProfileCard({ c, index, color, label }: { c: EnrichedContributor; index: number; color: string; label: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group relative rounded-3xl border overflow-hidden transition-all duration-700"
      style={{
        borderColor: expanded ? `${color}35` : "rgba(63,63,70,0.15)",
        background: `linear-gradient(135deg, ${color}04, rgba(12,12,14,0.7))`,
        boxShadow: expanded ? `0 0 60px ${color}10, 0 25px 50px -12px rgba(0,0,0,0.5)` : "",
        animation: `fsi 0.5s ease ${index * 0.1}s both`,
      }}>
      {/* Glow top bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

      <div className="p-6 md:p-8">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <a href={c.url} target="_blank" rel="noopener noreferrer" className="relative shrink-0 group/avatar">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${color}30, transparent)`, filter: "blur(8px)" }} />
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all duration-500 group-hover/avatar:scale-105"
                style={{ borderColor: `${color}40` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.avatar} alt={c.name || c.login} width={96} height={96} className="w-full h-full object-cover" loading="lazy" />
              </div>
              {index < 3 && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#09090b] flex items-center justify-center"
                  style={{ background: color }}>
                  <span className="text-[10px]">{index === 0 ? "👑" : index === 1 ? "⭐" : "🔥"}</span>
                </div>
              )}
            </div>
          </a>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="font-black text-xl text-white hover:underline decoration-2 underline-offset-4 transition-colors" style={{ textDecorationColor: color }}>
                {c.name || c.login}
              </a>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0" style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
                {label}
              </span>
              {c.type === "Bot" && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-800/60 text-zinc-500 border border-zinc-700/30">BOT</span>
              )}
            </div>
            <p className="text-xs text-zinc-500 font-mono mb-1">
              @{c.login}
              {c.location && <> · 📍 {c.location}</>}
              {c.joinedGitHub && <> · GitHub since {c.joinedGitHub}</>}
            </p>
            {c.bio && <p className="text-sm text-zinc-400 mt-2 leading-relaxed line-clamp-2">{c.bio}</p>}

            {/* Quick stats row */}
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <div className="text-center">
                <p className="text-lg font-black tabular-nums" style={{ color }}>{c.contributions.toLocaleString()}</p>
                <p className="text-[9px] text-zinc-600">commits</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black tabular-nums text-zinc-300">{c.followers.toLocaleString()}</p>
                <p className="text-[9px] text-zinc-600">followers</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black tabular-nums text-zinc-300">{c.publicRepos}</p>
                <p className="text-[9px] text-zinc-600">public repos</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black tabular-nums text-zinc-300">{c.following}</p>
                <p className="text-[9px] text-zinc-600">following</p>
              </div>
            </div>
          </div>

          {/* Rank badge */}
          <div className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black tabular-nums border"
            style={{ borderColor: `${color}25`, background: `${color}08`, color }}>
            #{index + 1}
          </div>
        </div>

        {/* Expand button */}
        <button onClick={() => setExpanded(!expanded)}
          className="mt-5 text-[10px] font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5"
          style={{ borderColor: `${color}25`, color, background: expanded ? `${color}08` : "transparent" }}>
          {expanded ? "Less" : "Full Profile"}
          <svg className={`w-3 h-3 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>

        {/* Expanded section */}
        <div className={`overflow-hidden transition-all duration-700 ${expanded ? "max-h-[500px] opacity-100 mt-6" : "max-h-0 opacity-0"}`}>
          <div className="space-y-4 border-t border-zinc-800/30 pt-5">
            {/* Bio full */}
            {c.bio && <p className="text-sm text-zinc-400 leading-relaxed">{c.bio}</p>}

            {/* Details grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {c.company && (
                <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/20">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Company</p>
                  <p className="text-sm text-zinc-300 font-medium">{c.company}</p>
                </div>
              )}
              {c.location && (
                <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/20">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Location</p>
                  <p className="text-sm text-zinc-300 font-medium">{c.location}</p>
                </div>
              )}
              {c.blog && (
                <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/20">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Website</p>
                  <a href={c.blog.startsWith("http") ? c.blog : `https://${c.blog}`} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline truncate block" style={{ color }}>
                    {c.blog.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              {c.twitter && (
                <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/20">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Twitter / X</p>
                  <a href={`https://x.com/${c.twitter}`} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline" style={{ color }}>
                    @{c.twitter}
                  </a>
                </div>
              )}
              <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/20">
                <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">GitHub Since</p>
                <p className="text-sm text-zinc-300 font-medium">{c.joinedGitHub || "N/A"}</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/20">
                <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Account Type</p>
                <p className="text-sm text-zinc-300 font-medium">{c.type}</p>
              </div>
            </div>

            {/* Contribution share bar */}
            <div>
              <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Share of Commits</h4>
              <div className="h-2.5 rounded-full bg-zinc-800/60 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: "100%", background: color }} />
              </div>
              <p className="text-[9px] text-zinc-600 mt-1 font-mono">{c.contributions.toLocaleString()} contributions to {REPO_OWNER}/{REPO_NAME}</p>
            </div>

            {/* Link to GitHub profile */}
            <a href={c.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all hover:scale-[1.02]"
              style={{ borderColor: `${color}25`, color, background: `${color}06` }}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
              View Full GitHub Profile →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   AREA CARD
   ═══════════════════════════════════════════════════════════════════════════════ */
function AreaCard({ area, index }: { area: Area; index: number }) {
  const [hovered, setHovered] = useState(false);
  const diffColor = { beginner: "#22C55E", intermediate: "#F59E0B", advanced: "#EF4444" };
  const diffLabel = { beginner: "Beginner Friendly", intermediate: "Intermediate", advanced: "Advanced" };

  return (
    <div className="group relative rounded-2xl border overflow-hidden transition-all duration-500 hover:scale-[1.02] cursor-default"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        borderColor: hovered ? `${area.color}35` : "rgba(63,63,70,0.12)",
        background: hovered ? `linear-gradient(135deg, ${area.color}06, transparent)` : "rgba(12,12,14,0.5)",
        boxShadow: hovered ? `0 0 30px ${area.color}08` : "",
        animation: `fsi 0.3s ease ${index * 0.04}s both`,
      }}>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all duration-500"
            style={{ background: `${area.color}10`, border: `1px solid ${area.color}20`, transform: hovered ? "scale(1.1) rotate(-5deg)" : "" }}>
            {area.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white text-sm">{area.name}</h3>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider" style={{ background: `${diffColor[area.difficulty]}15`, color: diffColor[area.difficulty] }}>
                {diffLabel[area.difficulty]}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">{area.desc}</p>
          </div>
        </div>
        <div className={`overflow-hidden transition-all duration-500 ${hovered ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0"}`}>
          <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">{area.detail}</p>
          <div className="flex flex-wrap gap-1.5">
            {area.tags.map(tag => (
              <span key={tag} className="text-[9px] font-mono px-2 py-0.5 rounded-lg border border-zinc-800/30 bg-zinc-900/40 text-zinc-600">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   STEP CARD
   ═══════════════════════════════════════════════════════════════════════════════ */
function StepCard({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(step.cmd).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }, [step.cmd]);

  return (
    <div className="relative" style={{ animation: `fsi 0.4s ease ${index * 0.08}s both` }}>
      {index < STEPS.length - 1 && (
        <div className="absolute left-6 top-16 bottom-0 w-px hidden md:block" style={{ background: "linear-gradient(to bottom, rgba(123,104,238,0.3), rgba(123,104,238,0.05))" }} />
      )}
      <div className="relative flex gap-5">
        <div className="shrink-0 relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-helix-purple/20 to-helix-blue/10 border border-helix-purple/20 flex items-center justify-center text-xl shadow-lg shadow-helix-purple/10">{step.icon}</div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-helix-purple text-white text-[10px] font-black flex items-center justify-center">{step.num}</div>
        </div>
        <div className="flex-1 min-w-0 pb-8">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-bold text-white">{step.title}</h3>
            <span className="text-[9px] font-mono text-zinc-700">~{step.time}</span>
          </div>
          <p className="text-sm text-zinc-400 mb-3">{step.desc}</p>
          <div className="group/term relative rounded-xl bg-[#0a0a0c] border border-zinc-800/40 overflow-hidden hover:border-zinc-700/40 transition-colors">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900/60 border-b border-zinc-800/30">
              <div className="w-2 h-2 rounded-full bg-red-500/70" /><div className="w-2 h-2 rounded-full bg-yellow-500/70" /><div className="w-2 h-2 rounded-full bg-green-500/70" />
              <span className="text-[9px] font-mono text-zinc-700 ml-2">terminal</span>
            </div>
            <div className="p-3 font-mono text-[11px] text-zinc-400 overflow-x-auto"><span className="text-emerald-400">$ </span>{step.cmd}</div>
            <button onClick={copy} className="absolute top-2 right-2 opacity-0 group-hover/term:opacity-100 transition-opacity px-2 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/40 text-[9px] font-mono text-zinc-400 cursor-pointer hover:text-white hover:bg-zinc-700/80">
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LANGUAGES BAR — from repo languages API
   ═══════════════════════════════════════════════════════════════════════════════ */
const LANG_COLORS: Record<string, string> = {
  Rust: "#DEA584", Assembly: "#6E4C13", Shell: "#89E051", Makefile: "#427819",
  Nix: "#7e7eff", Dockerfile: "#384d54", Python: "#3572A5", C: "#555555",
  "C++": "#F34B7D", TypeScript: "#3178C6", JavaScript: "#F7DF1E", GLSL: "#5686A5",
  "Linker Script": "#8B8B8B", Zig: "#EC915C", NASM: "#4A90E2",
};
function langColor(name: string) { return LANG_COLORS[name] || "#6B7280"; }

function LanguagesBar({ languages }: { languages: Record<string, number> }) {
  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  const sorted = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 8);
  const otherBytes = sorted.slice(8).reduce((a, [, v]) => a + v, 0);
  if (otherBytes > 0) top.push(["Other", otherBytes]);

  return (
    <div>
      <div className="h-3 rounded-full overflow-hidden flex">
        {top.map(([name, bytes], i) => (
          <div key={name} className="h-full transition-all duration-700 hover:brightness-125 cursor-default" title={`${name}: ${((bytes / total) * 100).toFixed(1)}%`}
            style={{ width: `${(bytes / total) * 100}%`, background: langColor(name), marginLeft: i > 0 ? "1px" : 0 }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {top.map(([name, bytes]) => (
          <span key={name} className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
            <span className="w-2 h-2 rounded-full" style={{ background: langColor(name) }} />
            {name} <span className="text-zinc-700">{((bytes / total) * 100).toFixed(1)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function ContributorsPage() {
  const { locale } = useI18n();
  const s = (k: string) => getDocString(contributorsContent, locale, k);

  const [contributors, setContributors] = useState<EnrichedContributor[]>([]);
  const [repoStats, setRepoStats] = useState<CachedData["repo"] | null>(null);
  const [languages, setLanguages] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  /* ─── Fetch from GitHub API ─── */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Try cache first
      const cached = getCached();
      if (cached) {
        if (!cancelled) {
          setContributors(cached.contributors);
          setRepoStats(cached.repo);
          setLanguages(cached.languages);
          setLastFetch(new Date(cached.timestamp).toLocaleString());
          setLoading(false);
        }
        return;
      }

      try {
        // 1. Fetch contributors list (paginated, up to 100)
        const contribRes = await ghFetch<GitHubContributor[]>(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contributors?per_page=100`
        );
        if (!contribRes) throw new Error("Failed to fetch contributors");

        // 2. Fetch repo stats
        const repoRes = await ghFetch<GitHubRepo>(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`
        );

        // 3. Fetch languages
        const langRes = await ghFetch<Record<string, number>>(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/languages`
        );

        // 4. Enrich each contributor with user profile (batched to avoid rate limits)
        const enriched: EnrichedContributor[] = [];
        for (const gc of contribRes) {
          const user = await ghFetch<GitHubUser>(`https://api.github.com/users/${gc.login}`);
          enriched.push({
            login: gc.login,
            name: user?.name || gc.login,
            avatar: gc.avatar_url,
            url: gc.html_url,
            bio: user?.bio || "",
            location: user?.location || "",
            company: user?.company || "",
            blog: user?.blog || "",
            twitter: user?.twitter_username || "",
            publicRepos: user?.public_repos || 0,
            followers: user?.followers || 0,
            following: user?.following || 0,
            contributions: gc.contributions,
            joinedGitHub: user?.created_at ? formatDate(user.created_at) : "",
            type: gc.type,
          });
        }

        const repo = repoRes ? {
          stars: repoRes.stargazers_count,
          forks: repoRes.forks_count,
          openIssues: repoRes.open_issues_count,
          size: repoRes.size,
          watchers: repoRes.subscribers_count,
        } : { stars: 0, forks: 0, openIssues: 0, size: 0, watchers: 0 };

        const langs = langRes || {};

        if (!cancelled) {
          setContributors(enriched);
          setRepoStats(repo);
          setLanguages(langs);
          const now = Date.now();
          setLastFetch(new Date(now).toLocaleString());
          setLoading(false);
          setCache({ contributors: enriched, repo, languages: langs, timestamp: now });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "API error");
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ⌘K keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearch("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Compute dynamic stats
  const totalCommits = contributors.reduce((a, c) => a + c.contributions, 0);
  const totalLangBytes = Object.values(languages).reduce((a, b) => a + b, 0);

  // Filter contributors by search
  const q = search.toLowerCase().trim();
  const filtered = q
    ? contributors.filter(c =>
        c.login.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q)
      )
    : contributors;
  const searchMatch = q && filtered.length > 0;
  const searchNoResult = q && filtered.length === 0;

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-helix-purple/40">
      <ConstellationCanvas />
      <style>{`
        @keyframes fsi{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes shimmer{0%,100%{opacity:0.3}50%{opacity:1}}
        @keyframes slide{0%{opacity:0;transform:translateX(20px)}100%{opacity:1;transform:translateX(0)}}
        @keyframes countUp{0%{opacity:0;transform:scale(0.5)}100%{opacity:1;transform:scale(1)}}
        @keyframes goldPulse{0%,100%{box-shadow:0 0 20px rgba(255,215,0,0.15),0 0 60px rgba(255,215,0,0.05)}50%{box-shadow:0 0 30px rgba(255,215,0,0.25),0 0 80px rgba(255,215,0,0.1)}}
        @keyframes crownBounce{0%,100%{transform:translateY(0) rotate(0deg)}25%{transform:translateY(-3px) rotate(-3deg)}75%{transform:translateY(-3px) rotate(3deg)}}
        @keyframes searchGlow{0%,100%{box-shadow:0 0 15px rgba(123,104,238,0.1), 0 0 40px rgba(123,104,238,0.03)}50%{box-shadow:0 0 25px rgba(123,104,238,0.2), 0 0 60px rgba(123,104,238,0.06)}}
        @keyframes foundPulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)}70%{box-shadow:0 0 0 12px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                {s("badge")}
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-helix-purple to-helix-blue">
                {s("title_line1")}
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-helix-blue via-helix-purple to-pink-400">
                {s("title_line2")}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-12">
              Real data, fetched live from the GitHub API.{" "}
              <span className="text-zinc-600">Every avatar, every commit count, every profile — straight from GitHub.</span>
            </p>

            {/* Dynamic stats strip */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 max-w-4xl mx-auto">
              {[
                { label: "Contributors", value: loading ? "—" : contributors.length.toString(), color: "#EC4899" },
                { label: "Total Commits", value: loading ? "—" : totalCommits.toLocaleString(), color: "#7B68EE" },
                { label: "Stars", value: loading ? "—" : (repoStats?.stars.toLocaleString() || "—"), color: "#FFD700" },
                { label: "Forks", value: loading ? "—" : (repoStats?.forks.toLocaleString() || "—"), color: "#4A90E2" },
                { label: "Open Issues", value: loading ? "—" : (repoStats?.openIssues.toLocaleString() || "—"), color: "#F59E0B" },
                { label: "Languages", value: loading ? "—" : Object.keys(languages).length.toString(), color: "#22C55E" },
              ].map((s, i) => (
                <div key={i} className="group relative p-4 rounded-2xl border border-zinc-800/20 bg-[#0c0c0e] text-center hover:scale-[1.05] transition-all cursor-default overflow-hidden"
                  style={{ animation: `fsi 0.3s ease ${i * 0.06}s both` }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle, ${s.color}08, transparent 70%)` }} />
                  <p className="text-xl md:text-2xl font-black tabular-nums relative" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[9px] text-zinc-600 font-medium relative">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Last fetched info + refresh */}
            {lastFetch && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <p className="text-[10px] text-zinc-700 font-mono">
                  Last updated: {lastFetch} · Cached 30 min
                </p>
                <button onClick={() => {
                  localStorage.removeItem(CACHE_KEY);
                  window.location.reload();
                }} className="text-[10px] font-bold text-helix-purple hover:underline cursor-pointer">
                  🔄 Refresh
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── LANGUAGES BAR ── */}
        {Object.keys(languages).length > 0 && (
          <div className="max-w-4xl mx-auto px-6 mb-16">
            <div className="p-6 rounded-2xl border border-zinc-800/20 bg-[#0c0c0e]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Repository Languages</h3>
                <span className="text-[10px] font-mono text-zinc-600">{(totalLangBytes / 1024).toFixed(0)} KB total • {repoStats ? formatSize(repoStats.size) : ""} repo</span>
              </div>
              <LanguagesBar languages={languages} />
            </div>
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {error && (
          <div className="max-w-3xl mx-auto px-6 mb-12">
            <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
              <p className="text-red-400 font-bold mb-2">⚠️ GitHub API Error</p>
              <p className="text-sm text-zinc-400 mb-4">{error}</p>
              <p className="text-xs text-zinc-600">The GitHub API has a rate limit of 60 requests/hour for unauthenticated requests. Try again later or refresh the page.</p>
              <button onClick={() => { localStorage.removeItem(CACHE_KEY); window.location.reload(); }}
                className="mt-4 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold cursor-pointer hover:bg-red-500/20 transition-colors">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* ── TOP CONTRIBUTOR ── */}
        {!loading && contributors.length > 0 && (() => {
          const top = contributors[0];
          const commitPct = totalCommits > 0 ? ((top.contributions / totalCommits) * 100).toFixed(1) : "0";
          return (
            <div className="max-w-4xl mx-auto px-6 mb-20">
              <div className="text-center mb-10">
                <span className="text-xs font-mono text-zinc-600 tracking-widest uppercase">👑 Top Contributor</span>
                <h2 className="text-3xl md:text-4xl font-black text-white mt-2">#1 Contributor</h2>
                <p className="text-sm text-zinc-500 mt-2">The driving force behind Helix OS.</p>
              </div>

              <div className="relative rounded-3xl overflow-hidden" style={{ animation: "fsi 0.6s ease both, goldPulse 3s ease-in-out infinite" }}>
                {/* Golden gradient border */}
                <div className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(135deg, #FFD700, #FFA500, #FFD700, #FFC107)", padding: "2px" }}>
                  <div className="w-full h-full rounded-3xl bg-[#0c0c0e]" />
                </div>

                <div className="relative p-8 md:p-10">
                  {/* Crown floating */}
                  <div className="absolute top-4 right-6 text-4xl" style={{ animation: "crownBounce 3s ease infinite" }}>👑</div>

                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Large avatar */}
                    <a href={top.url} target="_blank" rel="noopener noreferrer" className="relative shrink-0 group/top">
                      <div className="absolute -inset-3 rounded-3xl opacity-40 group-hover/top:opacity-70 transition-opacity duration-700" style={{ background: "radial-gradient(circle, rgba(255,215,0,0.3), transparent 70%)" }} />
                      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-3 transition-all duration-500 group-hover/top:scale-105"
                        style={{ borderColor: "rgba(255,215,0,0.5)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={top.avatar} alt={top.name || top.login} width={160} height={160} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-lg font-black text-white shadow-xl shadow-amber-500/30 border-2 border-[#0c0c0e]">#1</div>
                    </a>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start mb-2">
                        <a href={top.url} target="_blank" rel="noopener noreferrer" className="font-black text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:underline decoration-amber-400 decoration-2 underline-offset-4">
                          {top.name || top.login}
                        </a>
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">Creator & Lead</span>
                      </div>
                      <p className="text-sm text-zinc-500 font-mono mb-3">
                        @{top.login}
                        {top.location && <> · 📍 {top.location}</>}
                        {top.joinedGitHub && <> · GitHub since {top.joinedGitHub}</>}
                      </p>
                      {top.bio && <p className="text-sm text-zinc-400 leading-relaxed mb-5 max-w-lg">{top.bio}</p>}

                      {/* Big stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/15 text-center">
                          <p className="text-2xl md:text-3xl font-black tabular-nums text-amber-400">{top.contributions.toLocaleString()}</p>
                          <p className="text-[10px] text-zinc-600 font-medium mt-1">commits</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/30 text-center">
                          <p className="text-2xl md:text-3xl font-black tabular-nums text-white">{commitPct}%</p>
                          <p className="text-[10px] text-zinc-600 font-medium mt-1">of all commits</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/30 text-center">
                          <p className="text-2xl md:text-3xl font-black tabular-nums text-zinc-300">{top.followers.toLocaleString()}</p>
                          <p className="text-[10px] text-zinc-600 font-medium mt-1">followers</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/30 text-center">
                          <p className="text-2xl md:text-3xl font-black tabular-nums text-zinc-300">{top.publicRepos}</p>
                          <p className="text-[10px] text-zinc-600 font-medium mt-1">public repos</p>
                        </div>
                      </div>

                      {/* Links */}
                      <div className="flex items-center gap-3 mt-5 flex-wrap justify-center md:justify-start">
                        <a href={top.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-amber-500/20">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                          View Profile
                        </a>
                        {top.blog && (
                          <a href={top.blog.startsWith("http") ? top.blog : `https://${top.blog}`} target="_blank" rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/40 text-zinc-400 text-sm font-bold hover:text-white hover:border-zinc-700 transition-all">
                            🌐 {top.blog.replace(/^https?:\/\//, "")}
                          </a>
                        )}
                        {top.twitter && (
                          <a href={`https://x.com/${top.twitter}`} target="_blank" rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/40 text-zinc-400 text-sm font-bold hover:text-white hover:border-zinc-700 transition-all">
                            𝕏 @{top.twitter}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── ALL CONTRIBUTORS ── */}
        <div className="max-w-5xl mx-auto px-6 mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-mono text-zinc-600 tracking-widest uppercase">
              {loading ? "Loading from GitHub..." : `${contributors.length} Contributors`}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-2">All Contributors</h2>
            <p className="text-sm text-zinc-500 mt-2 max-w-lg mx-auto">
              Everyone who has contributed to Helix — ranked by commits. Real data from GitHub.
            </p>
          </div>

          {/* ── SEARCH BAR ── */}
          {!loading && contributors.length > 0 && (
            <div className="mb-8">
              <div className={`relative group/search max-w-2xl mx-auto transition-all duration-500 ${searchFocused ? "scale-[1.02]" : ""}`}>
                {/* Outer glow */}
                <div className={`absolute -inset-1 rounded-3xl transition-all duration-700 ${searchFocused ? "opacity-100" : "opacity-0"}`}
                  style={{ background: "linear-gradient(135deg, rgba(123,104,238,0.15), rgba(74,144,226,0.1), rgba(236,72,153,0.1))", filter: "blur(12px)", animation: searchFocused ? "searchGlow 2s ease-in-out infinite" : "none" }} />

                <div className={`relative flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-500 bg-[#0c0c0e] ${
                  searchFocused
                    ? "border-helix-purple/40 shadow-lg shadow-helix-purple/5"
                    : searchMatch
                    ? "border-emerald-500/30 shadow-lg shadow-emerald-500/5"
                    : searchNoResult
                    ? "border-red-500/20"
                    : "border-zinc-800/30 hover:border-zinc-700/40"
                }`}>
                  {/* Search icon / status icon */}
                  <div className="shrink-0 transition-all duration-300">
                    {searchNoResult ? (
                      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : searchMatch ? (
                      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className={`w-5 h-5 transition-colors duration-300 ${searchFocused ? "text-helix-purple" : "text-zinc-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>

                  {/* Input */}
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Search contributors by username, name, location..."
                    className="flex-1 bg-transparent text-white placeholder:text-zinc-600 text-sm font-medium outline-none caret-helix-purple"
                    spellCheck={false}
                    autoComplete="off"
                  />

                  {/* Clear button */}
                  {search && (
                    <button onClick={() => { setSearch(""); searchRef.current?.focus(); }}
                      className="shrink-0 w-6 h-6 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center transition-all cursor-pointer">
                      <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}

                  {/* Keyboard shortcut badge */}
                  {!search && (
                    <div className="hidden md:flex items-center gap-1 shrink-0">
                      <kbd className="px-1.5 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/40 text-[10px] font-mono text-zinc-500">⌘</kbd>
                      <kbd className="px-1.5 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/40 text-[10px] font-mono text-zinc-500">K</kbd>
                    </div>
                  )}
                </div>

                {/* Search result count */}
                {q && (
                  <div className="flex items-center justify-center gap-2 mt-3" style={{ animation: "fsi 0.2s ease both" }}>
                    {searchMatch ? (
                      <p className="text-xs font-medium text-emerald-400">
                        ✨ {filtered.length === 1 ? "Found!" : `${filtered.length} contributors found`}
                        {filtered.length === 1 && (
                          <span className="text-zinc-500"> — Ranked #{contributors.indexOf(filtered[0]) + 1} with {filtered[0].contributions.toLocaleString()} commits</span>
                        )}
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-500">
                        No contributor matching &ldquo;<span className="text-red-400 font-bold">{search}</span>&rdquo; —{" "}
                        <a href={`https://github.com/${REPO_OWNER}/${REPO_NAME}`} target="_blank" rel="noopener noreferrer" className="text-helix-purple hover:underline">maybe it&apos;s time to contribute?</a> 🚀
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── FOUND SPOTLIGHT — when exactly 1 result ── */}
          {searchMatch && filtered.length === 1 && (() => {
            const c = filtered[0];
            const rank = contributors.indexOf(c) + 1;
            const clr = roleColor(rank - 1);
            return (
              <div className="mb-6 p-6 rounded-2xl border-2 overflow-hidden relative" style={{
                borderColor: `${clr}40`,
                background: `linear-gradient(135deg, ${clr}08, transparent)`,
                animation: "fsi 0.3s ease both, foundPulse 1s ease 0.3s",
              }}>
                <div className="absolute top-3 right-4 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Match found
                </div>
                <div className="flex items-center gap-5">
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.avatar} alt={c.name || c.login} width={72} height={72} className="w-18 h-18 rounded-2xl border-2 hover:scale-105 transition-transform" style={{ borderColor: `${clr}40` }} loading="lazy" />
                  </a>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="font-black text-xl text-white hover:underline" style={{ textDecorationColor: clr }}>
                        {c.name || c.login}
                      </a>
                      <span className="text-xs font-mono text-zinc-500">@{c.login}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black" style={{ background: `${clr}15`, color: clr, border: `1px solid ${clr}25` }}>Rank #{rank}</span>
                    </div>
                    {c.bio && <p className="text-sm text-zinc-400 mt-1 line-clamp-1">{c.bio}</p>}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm font-black tabular-nums" style={{ color: clr }}>{c.contributions.toLocaleString()} <span className="text-[10px] text-zinc-600 font-normal">commits</span></span>
                      <span className="text-sm text-zinc-400 tabular-nums">{c.followers.toLocaleString()} <span className="text-[10px] text-zinc-600">followers</span></span>
                      <span className="text-sm text-zinc-400 tabular-nums">{c.publicRepos} <span className="text-[10px] text-zinc-600">repos</span></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="space-y-4">
            {/* Loading skeletons */}
            {loading && !error && (
              <>
                <SkeletonCard /><SkeletonCard /><SkeletonCard />
              </>
            )}

            {/* Filtered contributor cards */}
            {!loading && (q ? filtered : contributors).map((c, i) => {
              const realIndex = contributors.indexOf(c);
              return <ProfileCard key={c.login} c={c} index={realIndex} color={roleColor(realIndex)} label={roleLabel(realIndex, c.type)} />;
            })}

            {/* YOUR NAME HERE — Call to action card */}
            {!loading && (
              <div className="relative rounded-3xl border-2 border-dashed overflow-hidden transition-all duration-700 hover:border-solid group/cta"
                style={{ borderColor: "rgba(123,104,238,0.25)", background: "linear-gradient(135deg, rgba(123,104,238,0.03), transparent)", animation: "fsi 0.5s ease 0.3s both" }}>
                <div className="absolute inset-0 opacity-0 group-hover/cta:opacity-100 transition-opacity duration-700" style={{ background: "radial-gradient(circle at center, rgba(123,104,238,0.06), transparent 60%)" }} />
                <div className="p-8 md:p-10 text-center relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-2xl border-2 border-dashed border-helix-purple/30 flex items-center justify-center group-hover/cta:border-helix-purple/50 group-hover/cta:bg-helix-purple/5 transition-all"
                    style={{ animation: "float 4s ease infinite" }}>
                    <span className="text-4xl md:text-5xl">🚀</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-3">Your Name Here</h3>
                  <p className="text-sm text-zinc-400 max-w-lg mx-auto mb-6 leading-relaxed">
                    Contribute to Helix and your profile will appear here automatically — fetched live from GitHub.
                    <span className="text-zinc-600"> Every commit counts.</span>
                  </p>
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <a href={`https://github.com/${REPO_OWNER}/${REPO_NAME}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-helix-purple to-helix-blue text-white font-bold text-sm hover:scale-105 transition-all shadow-xl shadow-helix-purple/20 hover:shadow-helix-purple/30">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                      Start Contributing
                    </a>
                    <Link href="/contributing" className="px-6 py-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/40 text-zinc-400 font-bold text-sm hover:text-white hover:border-zinc-700 transition-all">
                      Contributing Guide →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── CONTRIBUTION AREAS ── */}
        <div className="max-w-5xl mx-auto px-6 mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-mono text-zinc-600 tracking-widest uppercase">Where to Help</span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-2">{s("contribution_areas")}</h2>
            <p className="text-sm text-zinc-500 mt-2 max-w-lg mx-auto">Helix is a large project with many subsystems. Find what excites you — hover for details.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {AREAS.map((a, i) => <AreaCard key={a.name} area={a} index={i} />)}
          </div>
        </div>

        {/* ── HOW TO GET STARTED ── */}
        <div className="max-w-3xl mx-auto px-6 mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-mono text-zinc-600 tracking-widest uppercase">5 Steps</span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-2">{s("how_to_contribute")}</h2>
            <p className="text-sm text-zinc-500 mt-2 max-w-lg mx-auto">From zero to your first PR — every command you need.</p>
          </div>
          <div className="space-y-0">
            {STEPS.map((s, i) => <StepCard key={s.num} step={s} index={i} />)}
          </div>
        </div>

        {/* ── WHY CONTRIBUTE ── */}
        <div className="max-w-5xl mx-auto px-6 mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-mono text-zinc-600 tracking-widest uppercase">Why Helix</span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-2">{s("why_contribute")}</h2>
            <p className="text-sm text-zinc-500 mt-2 max-w-lg mx-auto">What makes this project unique — and why it&apos;s worth your time.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHY_CONTRIBUTE.map((w, i) => (
              <div key={i} className="group relative p-6 rounded-2xl border border-zinc-800/20 bg-[#0c0c0e] hover:scale-[1.02] transition-all duration-500 cursor-default overflow-hidden"
                style={{ animation: `fsi 0.3s ease ${i * 0.06}s both` }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at top left, ${w.color}08, transparent 60%)` }} />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110 group-hover:rotate-[-5deg] duration-500"
                    style={{ background: `${w.color}10`, border: `1px solid ${w.color}20` }}>
                    {w.icon}
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">{w.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FINAL CTA ── */}
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <div className="relative rounded-3xl border border-helix-purple/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-helix-purple/5 via-transparent to-pink-500/5" />
            <div className="relative p-10 md:p-14 text-center">
              <HelixLogo className="w-16 h-16 mx-auto mb-6 opacity-20" />
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to build the future?</h2>
              <p className="text-base text-zinc-400 max-w-xl mx-auto mb-8 leading-relaxed">
                Helix OS is more than a kernel — it&apos;s a community of passionate developers pushing the boundaries of what an operating system can be.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <a href={`https://github.com/${REPO_OWNER}/${REPO_NAME}`} target="_blank" rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-helix-purple to-pink-500 text-white font-bold hover:scale-105 transition-all shadow-xl shadow-helix-purple/25 hover:shadow-helix-purple/35">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                  Fork on GitHub
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </a>
                <Link href="/contributing" className="px-7 py-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/40 text-zinc-400 font-bold text-sm hover:text-white hover:border-zinc-700 transition-all">
                  Contributing Guide →
                </Link>
                <Link href="/roadmap" className="px-7 py-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/40 text-zinc-400 font-bold text-sm hover:text-white hover:border-zinc-700 transition-all">
                  View Roadmap →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
