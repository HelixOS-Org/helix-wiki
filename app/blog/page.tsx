"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import HelixLogo from "@/helix-wiki/components/HelixLogo";
import LayerStack from "@/helix-wiki/components/diagrams/LayerStack";
import FlowDiagram from "@/helix-wiki/components/diagrams/FlowDiagram";
import StateMachine from "@/helix-wiki/components/diagrams/StateMachine";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import blogContent from "@/helix-wiki/lib/docs-i18n/blog";

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════════ */
interface Article {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  categoryColor: string;
  sc: string;
  icon: string;
  featured?: boolean;
  tags: string[];
  stats: { label: string; value: string }[];
  content: React.ReactNode;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   STARFIELD CANVAS — Constellation background (same style as roadmap/home)
   ═══════════════════════════════════════════════════════════════════════════════ */
function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W = innerWidth, H = innerHeight;

    const resize = () => {
      W = innerWidth; H = Math.max(document.documentElement.scrollHeight, innerHeight);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const starColors = ["#ffffff", "#c8d8ff", "#ffeedd", "#aaccff", "#ffe4b5", "#e8d0ff"];
    interface Star { x: number; y: number; r: number; bright: number; speed: number; phase: number; color: string }
    const count = Math.min(Math.floor(W * H / 4000), 400);
    const stars: Star[] = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 0.3 + Math.random() * 1.4,
        bright: 0.05 + Math.random() * 0.15,
        speed: 0.3 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    // Constellation lines — connect nearby stars
    const lines: { a: number; b: number }[] = [];
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const d = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
        if (d < 100 && Math.random() < 0.15) lines.push({ a: i, b: j });
      }
    }

    let t = 0;
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, W, H);
      t++;

      for (const l of lines) {
        const sa = stars[l.a], sb = stars[l.b];
        ctx.beginPath(); ctx.moveTo(sa.x, sa.y); ctx.lineTo(sb.x, sb.y);
        ctx.strokeStyle = "rgba(123,104,238,0.018)";
        ctx.lineWidth = 0.5; ctx.stroke();
      }

      for (const s of stars) {
        const pulse = Math.sin(t * 0.012 * s.speed + s.phase) * 0.5 + 0.5;
        const a = s.bright * (0.3 + pulse * 0.7);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,200,220,${a})`;
        ctx.fill();
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ARTICLE DATA
   ═══════════════════════════════════════════════════════════════════════════════ */
const ARTICLES: Article[] = [
  {
    slug: "why-rust",
    title: "Why We Chose Rust for an OS Kernel",
    excerpt: "C has ruled systems programming for 50 years. We explain why Rust's ownership model, zero-cost abstractions, and #![no_std] ecosystem made it the right choice for Helix — and what we'd do differently.",
    date: "2025-12-15",
    readTime: "8 min",
    category: "Design",
    categoryColor: "#4A90E2",
    sc: "74,144,226",
    icon: "🦀",
    featured: true,
    tags: ["rust", "safety", "no_std"],
    stats: [
      { label: "Unsafe blocks", value: "< 2%" },
      { label: "CVE classes eliminated", value: "70%" },
      { label: "Architectures", value: "3" },
    ],
    content: (
      <div className="space-y-6">
        <p>When we started Helix in early 2024, the question wasn&apos;t <em>if</em> we should use Rust — it was <em>how far</em> we could push it. The answer: all the way down to ring 0.</p>
        <h3 className="text-lg font-bold text-white mt-8">The Safety Argument (It&apos;s Real)</h3>
        <p>70% of CVEs in major operating systems are memory safety bugs. Buffer overflows, use-after-free, double-free — the classics. Rust eliminates <strong>entire categories</strong> of these bugs at compile time. Our kernel has zero <code className="text-helix-blue bg-helix-blue/10 px-1.5 py-0.5 rounded text-sm">unsafe</code> blocks in business logic.</p>
        <h3 className="text-lg font-bold text-white mt-8">Zero-Cost Abstractions in Kernel Space</h3>
        <p>Traits let us define a <code className="text-helix-blue bg-helix-blue/10 px-1.5 py-0.5 rounded text-sm">HalTrait</code> interface that x86_64, AArch64, and RISC-V all implement. At compile time, the trait dispatch is monomorphized — <strong>zero runtime overhead</strong>.</p>
        <div className="bg-[#0a0a0c] border border-zinc-800/40 rounded-xl p-5 font-mono text-sm">
          <div className="text-zinc-500 mb-2">// The trait that rules them all</div>
          <div><span className="text-helix-purple">pub trait</span> <span className="text-helix-blue">Hal</span> {'{'}</div>
          <div className="pl-4"><span className="text-helix-purple">fn</span> <span className="text-emerald-400">init_interrupts</span>() -&gt; <span className="text-amber-400">Result</span>&lt;(), <span className="text-red-400">HalError</span>&gt;;</div>
          <div className="pl-4"><span className="text-helix-purple">fn</span> <span className="text-emerald-400">enable_paging</span>(root: <span className="text-amber-400">PhysAddr</span>) -&gt; <span className="text-amber-400">Result</span>&lt;(), <span className="text-red-400">HalError</span>&gt;;</div>
          <div className="pl-4"><span className="text-helix-purple">fn</span> <span className="text-emerald-400">context_switch</span>(from: &amp;<span className="text-amber-400">Context</span>, to: &amp;<span className="text-amber-400">Context</span>);</div>
          <div className="pl-4 text-zinc-500">// ... 40+ more methods</div>
          <div>{'}'}</div>
        </div>
        <h3 className="text-lg font-bold text-white mt-8">What We&apos;d Do Differently</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Start with async earlier.</strong> Rust&apos;s async machinery is powerful for I/O-heavy kernel tasks, but retrofitting it is painful.</li>
          <li><strong>Embrace const generics more.</strong> Many of our array sizes are runtime values that could be compile-time constants.</li>
          <li><strong>Custom allocator from day 1.</strong> We started with linked_list_allocator and migrated to a slab allocator later — the transition was non-trivial.</li>
        </ul>
        <h3 className="text-lg font-bold text-white mt-8">The Verdict</h3>
        <p>After 75K lines of Rust kernel code, we can say definitively: <strong>Rust is viable for production kernel development.</strong> The compiler catches bugs that would have been week-long debugging sessions in C. The borrow checker is your most annoying — and most valuable — teammate.</p>
      </div>
    ),
  },
  {
    slug: "self-healing",
    title: "How Self-Healing Works in Helix",
    excerpt: "When a kernel module crashes, Helix doesn't panic — it quarantines, diagnoses, and recovers. Here's the engineering behind our self-healing subsystem.",
    date: "2025-11-28",
    readTime: "10 min",
    category: "Architecture",
    categoryColor: "#22C55E",
    sc: "34,197,94",
    icon: "🛡️",
    tags: ["self-heal", "recovery", "modules"],
    stats: [
      { label: "Recovery time", value: "~15ms" },
      { label: "Data loss", value: "Zero" },
      { label: "TCB size", value: "6.4K LoC" },
    ],
    content: (
      <div className="space-y-6">
        <p>Traditional kernels have one response to a critical module failure: <strong>kernel panic</strong>. Blue screen. Guru meditation. Game over. In Helix, we asked: what if the kernel could <em>heal itself</em>?</p>
        <h3 className="text-lg font-bold text-white mt-8">The Three-Phase Recovery Model</h3>
        <StateMachine
          title="Self-Healing State Machine"
          width={620}
          height={340}
          nodes={[
            { id: "running", label: "Running", x: 80, y: 80, color: "green", type: "start",
              info: { description: "Module is operating normally. Health checks pass. All IPC channels active.", entryActions: ["Resume IPC channels", "Clear fault counter"], invariants: ["Health check passing", "Memory within budget"], duration: "Indefinite" } },
            { id: "quarantine", label: "Quarantine", x: 280, y: 80, color: "red", type: "error",
              info: { description: "The faulting module is immediately isolated. Its memory pages are marked read-only, its IPC channels are drained.", entryActions: ["Mark pages read-only", "Drain IPC channels", "Capture crash dump"], exitActions: ["Send dump to diagnosis engine"], invariants: ["Module fully isolated", "No external calls"], duration: "~2ms" } },
            { id: "diagnosis", label: "Diagnosis", x: 480, y: 80, color: "amber",
              info: { description: "The self-heal engine inspects the crash dump, stack trace, and recent IPC history. Classifies fault as transient or systematic.", entryActions: ["Analyze crash dump", "Inspect stack trace", "Review IPC history"], exitActions: ["Emit RecoveryPlan"], invariants: ["Crash dump valid", "Classification complete"], duration: "~5ms" } },
            { id: "recovery", label: "Recovery", x: 480, y: 240, color: "blue",
              info: { description: "For transient faults, the module is hot-reloaded. For systematic faults, a fallback module is loaded. State is reconstructed from checkpoints.", entryActions: ["Load recovery strategy", "Restore from checkpoint"], exitActions: ["Validate recovered state"], invariants: ["Checkpoint valid", "State consistent"], duration: "~8ms", canSelfHeal: true } },
            { id: "failed", label: "Failed", x: 280, y: 240, color: "pink", type: "error",
              info: { description: "Recovery failed after max retries. Module is permanently quarantined. Manual intervention required.", entryActions: ["Log permanent failure", "Alert operator"], invariants: ["Module frozen", "No auto-recovery"], duration: "Until manual action" } },
          ]}
          transitions={[
            { from: "running", to: "quarantine", label: "fault detected",
              info: { description: "Module crashes or fails a health check", guard: "Panic || health_check_fail", action: "isolate() → capture_dump()", probability: "~2%" } },
            { from: "quarantine", to: "diagnosis", label: "analyze",
              info: { description: "Automatic transition to diagnosis engine", action: "classify_fault(dump)", probability: "Always" } },
            { from: "diagnosis", to: "recovery", label: "plan ready",
              info: { description: "Diagnosis complete, recovery plan generated", guard: "Retries < max", action: "select_strategy()", probability: "~90%" } },
            { from: "recovery", to: "running", label: "success", curved: -60,
              info: { description: "Module recovered successfully, resuming normal operation", guard: "State validated", action: "restore_ipc() → clear_faults()", probability: "~85%" } },
            { from: "recovery", to: "quarantine", label: "retry", curved: 40,
              info: { description: "Recovery attempt failed, re-quarantine for another try", guard: "Retries < max", action: "increment_retry()", probability: "~12%" } },
            { from: "diagnosis", to: "failed", label: "give up", curved: 30,
              info: { description: "Max retries exceeded or systematic unrecoverable fault", guard: "Retries >= max || systematic", action: "permanent_quarantine()", probability: "~3%" } },
          ]}
        />
        <h3 className="text-lg font-bold text-white mt-8">Real-World Example</h3>
        <ol className="list-decimal pl-6 space-y-2 text-sm">
          <li>The FS module detects the corruption via integrity hash</li>
          <li>Self-heal quarantines the FS module (in-flight I/O is buffered)</li>
          <li>Diagnosis determines it&apos;s a data corruption, not a code bug</li>
          <li>The FS module is restarted with the corrupted region marked for repair</li>
          <li>Background repair thread reconstructs the B-tree from journal logs</li>
          <li>Total downtime: <strong>~15ms</strong>. Zero data loss.</li>
        </ol>
        <h3 className="text-lg font-bold text-white mt-8">Limitations</h3>
        <p>Self-healing isn&apos;t magic. If the <strong>core kernel</strong> (TCB) itself is corrupted, we can&apos;t self-heal — that&apos;s a hard panic. The TCB is kept minimal (~6.4K LoC) specifically to reduce this risk.</p>
      </div>
    ),
  },
  {
    slug: "gpu-driver",
    title: "Building a GPU Driver From Scratch",
    excerpt: "17,000 lines of Rust to talk to a GPU. From PCI enumeration to Vulkan-class render graphs — the Magma driver story.",
    date: "2025-10-14",
    readTime: "12 min",
    category: "Drivers",
    categoryColor: "#9B59B6",
    sc: "155,89,182",
    icon: "🎮",
    tags: ["gpu", "magma", "lumina", "pci"],
    stats: [
      { label: "Lines of Rust", value: "17K" },
      { label: "Hardest bug", value: "2 weeks" },
      { label: "Fix", value: "1 instruction" },
    ],
    content: (
      <div className="space-y-6">
        <p>Writing a GPU driver is considered one of the hardest tasks in systems programming. GPU vendors guard their documentation, the hardware is absurdly complex. We did it anyway.</p>
        <h3 className="text-lg font-bold text-white mt-8">The Magma Architecture</h3>
        <LayerStack title="Magma GPU Stack" layers={[
          { label: "Lumina API (User-facing)", detail: "Application", color: "purple",
            description: "High-level rendering API exposed to kernel modules and userspace. Provides scene management, draw calls, and resource creation.",
            info: { components: ["Scene API", "Draw Commands", "Resource Handles"], metrics: [{ label: "Level", value: "High", color: "#7B68EE" }], api: ["draw()", "create_mesh()", "bind_pipeline()"], status: "active" } },
          { label: "Render Graph Engine", detail: "Scheduling", color: "blue",
            description: "Automatic render pass scheduling, resource barrier insertion, and frame graph optimization. Eliminates manual synchronization.",
            info: { components: ["Pass Scheduler", "Barrier Manager", "Resource Tracker"], metrics: [{ label: "Passes", value: "Auto", color: "#4A90E2" }], api: ["add_pass()", "build_graph()", "execute()"], status: "active" } },
          { label: "Command Buffer & Queue Manager", detail: "Submission", color: "emerald",
            description: "Records GPU commands into ring buffers and manages submission queues with fence-based synchronization.",
            info: { components: ["Ring Buffer", "Command Encoder", "Fence Manager"], metrics: [{ label: "Queues", value: "3", color: "#34D399" }], api: ["begin_cmd()", "submit()", "wait_fence()"], status: "active" } },
          { label: "Memory Manager (VRAM + GTT)", detail: "Allocation", color: "amber",
            description: "GPU memory allocator managing VRAM and GTT (Graphics Translation Table). Handles sub-allocation pools, eviction, and DMA mapping.",
            info: { components: ["VRAM Allocator", "GTT Manager", "DMA Mapper"], metrics: [{ label: "Pools", value: "Slab", color: "#F59E0B" }], api: ["alloc_vram()", "map_gtt()", "dma_buf()"], status: "active" } },
          { label: "Hardware Abstraction (MMIO + DMA)", detail: "Hardware", color: "pink",
            description: "Lowest level — direct MMIO register access, DMA transfers, and interrupt handling for GPU hardware communication.",
            info: { components: ["MMIO Registers", "DMA Engine", "IRQ Handler"], metrics: [{ label: "Access", value: "Direct", color: "#EC4899" }, { label: "IRQ", value: "MSI-X" }], api: ["mmio_read()", "dma_transfer()", "irq_register()"], status: "critical" } },
        ]} />
        <h3 className="text-lg font-bold text-white mt-8">The Bug That Took Two Weeks</h3>
        <p>Our worst bug was a <strong>fence synchronization race</strong>. The GPU would signal a fence completion, but the CPU would read the fence value <em>before</em> the memory write propagated through the cache hierarchy. The fix? A single <code className="text-helix-blue bg-helix-blue/10 px-1.5 py-0.5 rounded text-sm">mfence</code> instruction. Two weeks of debugging. One instruction.</p>
        <h3 className="text-lg font-bold text-white mt-8">Lessons Learned</h3>
        <ol className="list-decimal pl-6 space-y-2 text-sm">
          <li><strong>Start with VirtIO GPU.</strong> Real hardware is for phase 2.</li>
          <li><strong>Log everything.</strong> When the GPU hangs, serial logs are your only friend.</li>
          <li><strong>Test with multiple resolutions.</strong> Off-by-one in the framebuffer stride calculation.</li>
        </ol>
      </div>
    ),
  },
  {
    slug: "dis-scheduler",
    title: "Intent-Based Scheduling: Rethinking the CPU Scheduler",
    excerpt: "What if processes could tell the scheduler what they want instead of the scheduler guessing? DIS is our answer.",
    date: "2025-09-20",
    readTime: "7 min",
    category: "Research",
    categoryColor: "#F59E0B",
    sc: "245,158,11",
    icon: "🧠",
    tags: ["scheduler", "dis", "intent", "nexus"],
    stats: [
      { label: "Latency p99", value: "−62%" },
      { label: "Throughput", value: "+18%" },
      { label: "Context switch", value: "3.2μs" },
    ],
    content: (
      <div className="space-y-6">
        <p>Every major OS uses a variation of the same scheduling model: priority queues with preemption. CFS (Linux), ULE (FreeBSD) — they all <em>guess</em> what a process needs. DIS flips this model.</p>
        <h3 className="text-lg font-bold text-white mt-8">The Intent Model</h3>
        <div className="bg-[#0a0a0c] border border-zinc-800/40 rounded-xl p-5 font-mono text-sm">
          <div><span className="text-helix-purple">let</span> intent = <span className="text-amber-400">SchedulingIntent</span> {'{'}</div>
          <div className="pl-4">class: <span className="text-amber-400">IntentClass</span>::<span className="text-emerald-400">Realtime</span>,</div>
          <div className="pl-4">latency_target: <span className="text-amber-400">Duration</span>::from_micros(<span className="text-helix-blue">100</span>),</div>
          <div className="pl-4">throughput_hint: <span className="text-amber-400">ThroughputHint</span>::<span className="text-emerald-400">BurstyCpu</span>,</div>
          <div className="pl-4">energy_preference: <span className="text-amber-400">EnergyPref</span>::<span className="text-emerald-400">Performance</span>,</div>
          <div>{'}'};</div>
        </div>
        <h3 className="text-lg font-bold text-white mt-8">Benchmark Results</h3>
        <div className="grid grid-cols-3 gap-3 my-4">
          {[
            { v: "-62%", l: "Tail latency (p99) vs CFS", c: "#22C55E" },
            { v: "+18%", l: "Throughput batch workloads", c: "#4A90E2" },
            { v: "3.2μs", l: "Avg context switch time", c: "#7B68EE" },
          ].map(s => (
            <div key={s.v} className="p-4 rounded-2xl text-center" style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="text-2xl font-black" style={{ color: s.c }}>{s.v}</div>
              <div className="text-[10px] text-zinc-500 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    slug: "helixfs-cow",
    title: "Copy-on-Write Done Right: Inside HelixFS",
    excerpt: "How we built a filesystem with instant snapshots, zero-copy clones, and crash consistency — without sacrificing write performance.",
    date: "2025-08-05",
    readTime: "9 min",
    category: "Filesystem",
    categoryColor: "#22D3EE",
    sc: "34,211,238",
    icon: "💾",
    tags: ["helixfs", "cow", "btree", "snapshots"],
    stats: [
      { label: "Snapshot time", value: "O(1)" },
      { label: "Write amplification", value: "1.2×" },
      { label: "Crash recovery", value: "< 50ms" },
    ],
    content: (
      <div className="space-y-6">
        <p>Copy-on-Write (CoW) filesystems promise instant snapshots and crash safety. But naive CoW implementations suffer from <strong>write amplification</strong> and <strong>fragmentation</strong>. HelixFS takes a different approach.</p>
        <h3 className="text-lg font-bold text-white mt-8">The Dual-Tree Architecture</h3>
        <p>HelixFS maintains two B+Trees: a <strong>namespace tree</strong> (directory entries → inode) and a <strong>data tree</strong> (inode → extents). Creating a snapshot is simply duplicating the tree roots — an O(1) operation.</p>
        <div className="bg-[#0a0a0c] border border-zinc-800/40 rounded-xl p-5 font-mono text-sm">
          <div className="text-zinc-500">// Creating a snapshot in HelixFS</div>
          <div><span className="text-helix-purple">let</span> snap = fs.<span className="text-emerald-400">create_snapshot</span>(<span className="text-amber-400">&quot;before-update&quot;</span>)?;</div>
          <div className="text-zinc-500">// Cost: 2 atomic pointer writes. Time: ~200ns.</div>
        </div>
        <h3 className="text-lg font-bold text-white mt-8">Crash Consistency</h3>
        <p>HelixFS uses <strong>intent logging</strong> for metadata operations. On crash recovery, the journal is replayed — never more than 50ms of work. Data blocks use CoW semantics, so they&apos;re always consistent.</p>
      </div>
    ),
  },
  {
    slug: "nexus-ml",
    title: "Running ML Models Inside a Kernel",
    excerpt: "NEXUS runs decision trees, neural networks, and anomaly detectors entirely in kernel space with no_std Rust. Here's how.",
    date: "2025-07-12",
    readTime: "11 min",
    category: "NEXUS",
    categoryColor: "#EF4444",
    sc: "239,68,68",
    icon: "🤖",
    tags: ["nexus", "ml", "ai", "prediction"],
    stats: [
      { label: "Inference", value: "~12μs" },
      { label: "Engine size", value: "200KB" },
      { label: "Models", value: "6" },
    ],
    content: (
      <div className="space-y-6">
        <p>Conventional wisdom says ML belongs in userspace. We put it in <strong>ring 0</strong>. Here&apos;s why, and how.</p>
        <h3 className="text-lg font-bold text-white mt-8">The Model Zoo</h3>
        <LayerStack title="NEXUS ML Engine Stack" layers={[
          { label: "🧠 Neural Network (MLP 64→32→8)", detail: "~12μs", color: "blue",
            description: "Crash prediction multi-layer perceptron. 3 layers (64→32→8 neurons), trained on historical fault patterns. Fixed-point Q16.16 arithmetic for kernel-safe inference.",
            info: { components: ["MLP Forward Pass", "Weight Matrix", "Activation (ReLU)"], metrics: [{ label: "Inference", value: "~12μs", color: "#4A90E2" }, { label: "Params", value: "3.3K" }], api: ["predict_crash()", "update_weights()"], status: "active" } },
          { label: "🌳 Random Forests (200 trees, 12 features)", detail: "~8μs", color: "green",
            description: "Anomaly scoring ensemble. 200 decision trees vote on whether current system telemetry represents normal or anomalous behavior.",
            info: { components: ["Tree Ensemble", "Feature Extractor", "Vote Aggregator"], metrics: [{ label: "Inference", value: "~8μs", color: "#22C55E" }, { label: "Trees", value: "200" }], api: ["score_anomaly()", "extract_features()"], status: "active" } },
          { label: "🌲 Decision Trees (Fault Classification)", detail: "~3μs", color: "amber",
            description: "Fast fault classifier. Categorizes faults into transient, systematic, or hardware-induced. Single tree with max depth 12 for predictable latency.",
            info: { components: ["Binary Tree", "Feature Vector", "Leaf Classifier"], metrics: [{ label: "Inference", value: "~3μs", color: "#F59E0B" }, { label: "Depth", value: "12" }], api: ["classify_fault()", "get_confidence()"], status: "active" } },
          { label: "📊 Statistical Models (EWMA + Z-Score)", detail: "~1μs", color: "purple",
            description: "Lightweight trend detection using Exponentially Weighted Moving Average and z-score outlier detection. Zero allocations, pure arithmetic.",
            info: { components: ["EWMA Tracker", "Z-Score Detector", "Trend Analyzer"], metrics: [{ label: "Inference", value: "~1μs", color: "#7B68EE" }, { label: "Allocs", value: "0" }], api: ["update_ewma()", "is_outlier()"], status: "active" } },
        ]} />
        <h3 className="text-lg font-bold text-white mt-8">No-std Constraints</h3>
        <p>No heap allocation during inference. No floating point in hot paths — fixed-point Q16.16 arithmetic. No dynamic dispatch. The entire engine compiles to ~200KB of machine code.</p>
      </div>
    ),
  },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════════ */
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

const CATEGORIES = [...new Set(ARTICLES.map(a => a.category))];
const CAT_COLORS: Record<string, string> = {};
ARTICLES.forEach(a => { CAT_COLORS[a.category] = a.categoryColor; });

/* ═══════════════════════════════════════════════════════════════════════════════
   REVEAL — Intersection Observer animation wrapper (same as homepage)
   ═══════════════════════════════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: `all 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}s` }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ARTICLE CARD — Consistent with homepage feature cards and roadmap cards
   ═══════════════════════════════════════════════════════════════════════════════ */
function ArticleCard({ article, index, isExpanded, onToggle }: {
  article: Article; index: number; isExpanded: boolean; onToggle: () => void;
}) {
  const days = daysSince(article.date);
  const isRecent = days < 90;

  return (
    <Reveal delay={index * 0.06}>
      <article
        className={`group relative rounded-3xl border overflow-hidden transition-all duration-700 cursor-pointer ${isExpanded ? "shadow-2xl" : "hover:shadow-xl"}`}
        onClick={onToggle}
        style={{
          borderColor: isExpanded ? `rgba(${article.sc},0.25)` : "rgba(63,63,70,0.15)",
          background: isExpanded
            ? `linear-gradient(135deg, rgba(${article.sc},0.06), transparent, rgba(${article.sc},0.02))`
            : "rgba(12,12,14,0.6)",
          boxShadow: isExpanded ? `0 0 60px rgba(${article.sc},0.08), 0 25px 50px -12px rgba(0,0,0,0.6)` : "",
        }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full transition-all duration-700" style={{
          background: isExpanded
            ? `linear-gradient(90deg, transparent, ${article.categoryColor}, transparent)`
            : `linear-gradient(90deg, transparent, rgba(${article.sc},0.2), transparent)`,
        }} />

        {/* Header */}
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-5">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-[-8deg]"
              style={{ background: `rgba(${article.sc},0.08)`, border: `1px solid rgba(${article.sc},0.15)` }}>
              {article.icon}
            </div>

            <div className="flex-1 min-w-0">
              {/* Meta row */}
              <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg" style={{
                  color: article.categoryColor,
                  background: `rgba(${article.sc},0.1)`,
                  border: `1px solid rgba(${article.sc},0.2)`,
                }}>
                  {article.category}
                </span>
                <span className="text-[10px] font-mono text-zinc-700">{formatDate(article.date)}</span>
                <span className="text-zinc-800">·</span>
                <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" /><path d="M6 3v3l2 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>
                  {article.readTime}
                </span>
                {isRecent && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                    </span>
                    NEW
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-lg md:text-xl font-black text-white leading-tight transition-all duration-500">{article.title}</h2>

              {/* Excerpt */}
              <p className="text-sm text-zinc-500 mt-2 leading-relaxed line-clamp-2 group-hover:text-zinc-400 transition-colors duration-500">{article.excerpt}</p>
            </div>

            {/* Right — Stats */}
            <div className="shrink-0 text-right hidden sm:block">
              <div className="space-y-2">
                {article.stats.slice(0, 2).map(stat => (
                  <div key={stat.label}>
                    <div className="text-sm font-black tabular-nums" style={{ color: article.categoryColor }}>{stat.value}</div>
                    <div className="text-[9px] text-zinc-700 font-mono uppercase">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tags + expand hint */}
          <div className="flex items-center gap-2 mt-5 pt-4 border-t" style={{ borderColor: "rgba(63,63,70,0.15)" }}>
            {article.tags.map(tag => (
              <span key={tag} className="text-[9px] font-mono px-2 py-0.5 rounded-lg text-zinc-600 bg-zinc-900/50 border border-zinc-800/30">{tag}</span>
            ))}
            <div className="flex-1" />
            <span className="text-[10px] font-bold flex items-center gap-1.5 transition-all" style={{ color: article.categoryColor }}>
              <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {isExpanded ? "Collapse" : "Read article"}
            </span>
          </div>
        </div>

        {/* Expanded content */}
        <div className={`overflow-hidden transition-all duration-700 ease-out ${isExpanded ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="px-6 md:px-8 pb-6 md:pb-8 border-t pt-6 text-zinc-300 text-sm leading-relaxed" style={{ borderColor: "rgba(63,63,70,0.15)" }}>
            {/* Stats bar mobile */}
            <div className="flex items-center gap-5 mb-6 sm:hidden flex-wrap">
              {article.stats.map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-base font-black" style={{ color: article.categoryColor }}>{stat.value}</div>
                  <div className="text-[9px] text-zinc-600 font-mono uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
            {article.content}
          </div>
        </div>

        {/* Hover glow — same pattern as homepage feature cards */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 30% 20%, rgba(${article.sc},0.06), transparent 60%)` }} />
        <div className="absolute top-0 left-[20%] right-[20%] h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, rgba(${article.sc},0.3), transparent)` }} />
      </article>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FEATURED HERO — Large card for latest article (consistent with homepage hero)
   ═══════════════════════════════════════════════════════════════════════════════ */
function FeaturedHero({ article, onClick }: { article: Article; onClick: () => void }) {
  return (
    <Reveal>
      <div className="relative rounded-3xl border overflow-hidden cursor-pointer group transition-all duration-700 hover:shadow-2xl mb-10"
        onClick={onClick}
        style={{
          background: "rgba(255,255,255,0.01)",
          border: `1px solid rgba(${article.sc},0.12)`,
          boxShadow: `0 0 120px rgba(${article.sc},0.04), 0 0 60px rgba(123,104,238,0.03), inset 0 1px 0 rgba(255,255,255,0.04)`,
        }}>
        {/* Ambient glows — same as homepage TryIt section */}
        <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full blur-[100px] pointer-events-none" style={{ background: `rgba(${article.sc},0.06)` }} />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full blur-[100px] pointer-events-none" style={{ background: "rgba(123,104,238,0.06)" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-helix-blue/[.02] via-transparent to-helix-purple/[.02]" />

        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-start gap-8">
          <div className="flex-1 space-y-5">
            {/* Badges */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono"
                style={{ background: `rgba(${article.sc},0.08)`, border: `1px solid rgba(${article.sc},0.15)`, color: article.categoryColor }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: article.categoryColor }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: article.categoryColor }} />
                </span>
                Featured · {article.category}
              </div>
              <span className="text-[10px] text-zinc-700 font-mono">{formatDate(article.date)} · {article.readTime} read</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.1]">{article.title}</h2>

            {/* Excerpt */}
            <p className="text-zinc-400 text-base leading-relaxed max-w-xl">{article.excerpt}</p>

            {/* CTA — Same as homepage Explore Architecture button */}
            <div className="flex items-center gap-4 pt-2">
              <span className="group/btn relative px-7 py-3.5 rounded-xl font-bold text-sm overflow-hidden transition-all duration-300 hover:scale-105 active:scale-[.97] inline-flex items-center gap-2.5"
                style={{ background: `linear-gradient(135deg, ${article.categoryColor}, #7B68EE, #9B59B6)`, boxShadow: `0 4px 40px rgba(${article.sc},0.3), inset 0 1px 0 rgba(255,255,255,0.15)` }}>
                <div className="absolute inset-[1px] rounded-[10px] bg-[#050507] group-hover/btn:bg-transparent transition-all duration-500" />
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-white/80 to-white/60 group-hover/btn:text-white transition-all duration-500">
                  Read full article
                </span>
                <svg className="w-4 h-4 relative text-zinc-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>

          {/* Right — Icon + Stats */}
          <div className="flex flex-col items-center gap-5 shrink-0 md:pt-4">
            <div className="text-7xl select-none group-hover:scale-110 transition-transform duration-500"
              style={{ filter: `drop-shadow(0 0 20px rgba(${article.sc},0.25))` }}>
              {article.icon}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {article.stats.map(stat => (
                <div key={stat.label} className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="text-sm font-black text-white">{stat.value}</div>
                  <div className="text-[8px] text-zinc-600 uppercase tracking-wider mt-0.5 font-mono">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {article.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-lg text-[9px] font-mono text-zinc-500" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CATEGORY FILTER — Pill buttons matching homepage style
   ═══════════════════════════════════════════════════════════════════════════════ */
function CategoryFilter({ active, onChange }: { active: string | null; onChange: (cat: string | null) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button onClick={() => onChange(null)}
        className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
        style={{
          background: !active ? "rgba(123,104,238,0.1)" : "rgba(255,255,255,0.02)",
          color: !active ? "#7B68EE" : "#52525B",
          border: `1px solid ${!active ? "rgba(123,104,238,0.2)" : "rgba(255,255,255,0.04)"}`,
        }}>
        All
      </button>
      {CATEGORIES.map(cat => (
        <button key={cat} onClick={() => onChange(active === cat ? null : cat)}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          style={{
            background: active === cat ? `${CAT_COLORS[cat]}12` : "rgba(255,255,255,0.02)",
            color: active === cat ? CAT_COLORS[cat] : "#52525B",
            border: `1px solid ${active === cat ? `${CAT_COLORS[cat]}25` : "rgba(255,255,255,0.04)"}`,
          }}>
          <span className="w-1.5 h-1.5 rounded-full transition-opacity duration-300" style={{ background: CAT_COLORS[cat], opacity: active === cat ? 1 : 0.3 }} />
          {cat}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   OVERALL STATS — Glass morphism counters (same pattern as homepage)
   ═══════════════════════════════════════════════════════════════════════════════ */
function OverallStats() {
  const totalWords = ARTICLES.length * 1200;
  const avgReadTime = Math.round(ARTICLES.reduce((a, b) => a + parseInt(b.readTime), 0) / ARTICLES.length);

  const stats = [
    { label: "Articles", value: String(ARTICLES.length), color: "#7B68EE" },
    { label: "~Words", value: `${Math.round(totalWords / 1000)}K`, color: "#4A90E2" },
    { label: "Avg Read", value: `${avgReadTime} min`, color: "#22C55E" },
    { label: "Categories", value: String(CATEGORIES.length), color: "#F59E0B" },
  ];

  return (
    <Reveal>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl overflow-hidden relative mb-12"
        style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.04)", boxShadow: "0 0 100px rgba(123,104,238,.03), inset 0 0 60px rgba(123,104,238,.02), inset 0 1px 0 rgba(255,255,255,.04)" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-helix-blue/[.03] via-transparent to-helix-purple/[.03]" />
        {stats.map(s => (
          <div key={s.label} className="relative text-center group/stat">
            <p className="text-3xl md:text-4xl font-black tabular-nums transition-all duration-300 group-hover/stat:scale-110" style={{ color: s.color, textShadow: `0 0 30px ${s.color}40` }}>
              {s.value}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1.5 font-medium tracking-wider uppercase">{s.label}</p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SCROLL PROGRESS — Gradient progress bar
   ═══════════════════════════════════════════════════════════════════════════════ */
function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handle = () => {
      const st = document.documentElement.scrollTop;
      const sh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setProgress(sh > 0 ? st / sh : 0);
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-50">
      <div className="h-full transition-[width] duration-150" style={{
        width: `${progress * 100}%`,
        background: "linear-gradient(90deg, #4A90E2, #7B68EE, #9B59B6)",
        boxShadow: "0 0 10px rgba(123,104,238,0.4)",
      }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN BLOG PAGE
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function BlogPage() {
  const { locale } = useI18n();
  const s = useCallback((k: string) => getDocString(blogContent, locale, k), [locale]);

  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const featured = ARTICLES.find(a => a.featured) || ARTICLES[0];
  const remaining = ARTICLES.filter(a => a !== featured);
  const filtered = activeCategory
    ? remaining.filter(a => a.category === activeCategory)
    : remaining;

  const handleFeaturedClick = useCallback(() => {
    setExpandedSlug(prev => prev === featured.slug ? null : featured.slug);
  }, [featured.slug]);

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-helix-purple/30 overflow-x-hidden">
      <style>{`
        @keyframes shimmer{0%{background-position:-300% 0}100%{background-position:300% 0}}
        @keyframes pulseRing{0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,.25)}50%{box-shadow:0 0 0 12px rgba(249,115,22,0)}}
        @keyframes slideTag{0%{opacity:0;transform:translateX(-10px)}100%{opacity:1;transform:translateX(0)}}
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
      `}</style>

      <ScrollProgress />
      <StarfieldCanvas />

      {/* ── HERO HEADER — Same structure as homepage hero ── */}
      <header className="relative pt-32 pb-20 px-6 overflow-hidden z-10">
        {/* Ambient blurs — matching PageHeader */}
        <div className="absolute -top-40 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none opacity-[.04]"
          style={{ background: "radial-gradient(circle, #7B68EE, transparent 70%)" }} />
        <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full pointer-events-none opacity-[.03]"
          style={{ background: "radial-gradient(circle, #4A90E2, transparent 70%)" }} />

        {/* Top line accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(123,104,238,.15), rgba(74,144,226,.15), transparent)" }} />

        <div className={`max-w-5xl mx-auto transition-all duration-700 ease-out ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {/* Back link */}
          <Link href="/"
            className="group inline-flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-10"
            style={{ animation: "slideTag .6s ease .1s both" }}>
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>

          {/* Badge — same style as homepage badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-mono mb-8"
            style={{ background: "rgba(249,115,22,.08)", border: "1px solid rgba(249,115,22,.2)", color: "#F97316", animation: "slideTag .6s ease .3s both, pulseRing 3s ease-in-out infinite" }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
            {s("badge")}
          </div>

          {/* Title — shimmer gradient, matching homepage */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(90deg,#F59E0B,#F97316,#EF4444,#F59E0B)", backgroundSize: "300% auto", animation: "shimmer 6s linear infinite" }}>
              {s("title")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-lg text-zinc-400 max-w-2xl leading-relaxed transition-all duration-700 delay-150 ease-out ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            {s("subtitle")}
          </p>

          {/* Tag line — same as PageHeader */}
          <div className={`mt-8 flex items-center gap-3 transition-all duration-700 delay-300 ease-out ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="h-[1px] w-12" style={{ background: "linear-gradient(90deg, rgba(249,115,22,.4), transparent)" }} />
            <span className="text-[10px] font-mono text-zinc-600 tracking-[.3em] uppercase">Engineering Blog</span>
          </div>

          {/* Shields — same style as homepage */}
          <div className={`flex flex-wrap items-center gap-2 mt-6 transition-all duration-700 delay-400 ease-out ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            {[
              { href: "https://github.com/HelixOS-Org/helix/actions", src: "https://img.shields.io/github/actions/workflow/status/HelixOS-Org/helix/ci.yml?style=flat-square&logo=githubactions&logoColor=white&label=CI&color=22c55e", alt: "CI" },
              { href: "https://github.com/HelixOS-Org/helix", src: "https://img.shields.io/badge/v0.4.0--aurora-7B68EE?style=flat-square&logo=rust&logoColor=white", alt: "Version" },
              { href: "https://github.com/HelixOS-Org/helix", src: "https://img.shields.io/github/stars/HelixOS-Org/helix?style=flat-square&color=F59E0B&logo=github", alt: "Stars" },
            ].map(b => (
              <a key={b.alt} href={b.href} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <img src={b.src} alt={b.alt} className="h-[18px]" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#050507] to-transparent pointer-events-none" />
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pb-8">
        {/* Stats bar */}
        <OverallStats />

        {/* Featured article */}
        <FeaturedHero article={featured} onClick={handleFeaturedClick} />

        {/* Expanded featured content */}
        {expandedSlug === featured.slug && (
          <Reveal>
            <div className="mb-12 rounded-2xl border overflow-hidden" style={{ background: "rgba(12,12,14,0.6)", borderColor: `rgba(${featured.sc},0.15)` }}>
              <div className="px-6 md:px-8 py-8 text-zinc-300 text-sm leading-relaxed">
                {featured.content}
              </div>
            </div>
          </Reveal>
        )}

        {/* Section heading — same pattern as homepage */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1 h-9 rounded-full" style={{ background: "linear-gradient(180deg, #F59E0B, #EF4444, #9B59B6)" }} />
            <h2 className="text-2xl md:text-3xl font-black">All Articles</h2>
          </div>
          <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
        </div>

        {/* Article grid */}
        <div className="space-y-5">
          {filtered.map((article, i) => (
            <ArticleCard
              key={article.slug}
              article={article}
              index={i}
              isExpanded={expandedSlug === article.slug}
              onToggle={() => setExpandedSlug(prev => prev === article.slug ? null : article.slug)}
            />
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-20 rounded-3xl" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-900/50 border border-dashed border-zinc-800/40 flex items-center justify-center mb-4">
                <span className="text-2xl">📭</span>
              </div>
              <p className="text-zinc-500 text-sm font-medium">No articles in this category yet.</p>
              <button onClick={() => setActiveCategory(null)}
                className="mt-4 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                style={{ background: "rgba(123,104,238,0.1)", border: "1px solid rgba(123,104,238,0.2)", color: "#7B68EE" }}>
                Show all articles →
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── CTA FOOTER — Same design as playground CTA footer ── */}
      <Reveal>
        <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
          <div className="rounded-3xl border overflow-hidden relative"
            style={{ background: "rgba(255,255,255,.01)", border: "1px solid rgba(123,104,238,.12)", boxShadow: "0 0 120px rgba(123,104,238,.04), 0 0 60px rgba(74,144,226,.03), inset 0 1px 0 rgba(255,255,255,.04)" }}>
            {/* Ambient */}
            <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full blur-[100px] pointer-events-none" style={{ background: "rgba(74,144,226,.06)" }} />
            <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full blur-[100px] pointer-events-none" style={{ background: "rgba(123,104,238,.06)" }} />
            <div className="absolute inset-0 bg-gradient-to-br from-helix-blue/[.02] via-transparent to-helix-purple/[.02]" />

            <div className="relative p-8 md:p-14 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4 text-center md:text-left">
                <HelixLogo className="w-12 h-12 opacity-25 mx-auto md:mx-0" />
                <h2 className="text-2xl md:text-3xl font-black">{s("stay_in_loop")}</h2>
                <p className="text-sm text-zinc-500 max-w-md mx-auto md:mx-0 leading-relaxed">{s("stay_in_loop_desc")}</p>
              </div>

              {/* CTA buttons — matching homepage hero exactly */}
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <a href="https://github.com/HelixOS-Org/helix" target="_blank" rel="noopener noreferrer"
                  className="group relative px-8 py-4 rounded-xl font-bold text-sm overflow-hidden transition-all duration-300 hover:scale-105 active:scale-[.97] flex items-center gap-2.5"
                  style={{ background: "linear-gradient(135deg,#4A90E2,#7B68EE,#9B59B6)", boxShadow: "0 4px 40px rgba(123,104,238,.3), inset 0 1px 0 rgba(255,255,255,.15)" }}>
                  <div className="absolute inset-[1px] rounded-[10px] bg-[#050507] group-hover:bg-transparent transition-all duration-500" />
                  <svg className="w-5 h-5 relative group-hover:rotate-[360deg] transition-transform duration-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-helix-blue via-helix-purple to-helix-accent group-hover:text-white transition-all duration-500">
                    {s("star_on_github")}
                  </span>
                </a>
                <Link href="/contributing"
                  className="group px-8 py-4 rounded-xl border font-bold text-sm transition-all duration-300 flex items-center gap-2.5 hover:scale-105 active:scale-[.97]"
                  style={{ background: "rgba(255,255,255,.03)", borderColor: "rgba(255,255,255,.08)" }}>
                  {s("contribute")}
                  <svg className="w-4 h-4 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
