"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import faqContent from "@/helix-wiki/lib/docs-i18n/faq-content";

/* ═══════════════════════════════════════════════════════════════════════
   FAQ DATA — Comprehensive Helix OS knowledge organized by category
   ═══════════════════════════════════════════════════════════════════════ */

interface FaqItem {
  q: string;
  a: string;
  tags?: string[];
  links?: { label: string; href: string }[];
  code?: string;
}

interface FaqCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  sc: string;
  count: number;
  items: FaqItem[];
}

const CATEGORIES: FaqCategory[] = [
  {
    id: "general", title: "General", icon: "🌀", color: "#7B68EE", sc: "123,104,238", count: 0,
    items: [
      {
        q: "What is Helix OS?",
        a: "Helix OS is a **modular, research-oriented** operating system kernel written entirely in Rust (`#![no_std]`, zero libc). It features intent-based scheduling (DIS), hot-reloadable modules, capability-based security, an AI-powered intelligence subsystem (NEXUS), and a modern copy-on-write filesystem (HelixFS). With 812K+ lines of pure Rust across 3 architectures, it's one of the most ambitious Rust kernel projects.",
        tags: ["overview", "rust", "kernel"],
        links: [
          { label: "Architecture", href: "/docs/architecture" },
          { label: "Getting Started", href: "/docs/getting-started" },
        ],
      },
      {
        q: "Why build another operating system?",
        a: "Helix serves multiple purposes:\n\n1. **Education** — A clear, well-documented codebase for learning OS internals\n2. **Research** — A platform for experimenting with novel scheduling, memory, and filesystem ideas\n3. **Rust showcase** — Demonstrating that safe systems programming is practical at scale\n4. **Modern design** — Applying decades of OS research to a clean-slate kernel with zero legacy baggage",
        tags: ["motivation", "goals"],
      },
      {
        q: "Is Helix ready for production use?",
        a: "**No.** Helix is a pre-alpha research and educational project (v0.4.0-aurora). It currently lacks complete driver support, hardened security testing, and production workload validation. Use it for learning, experimenting, and contributing to cutting-edge OS research.",
        tags: ["status", "production"],
      },
      {
        q: "What architectures does Helix support?",
        a: "Helix supports **3 architectures** through a unified HAL (Hardware Abstraction Layer):\n\n- **x86_64** — Primary platform with full support (APIC, HPET, UEFI/BIOS, KASLR)\n- **AArch64** — ARM support with GICv3 and device tree\n- **RISC-V 64** — RISC-V support with PLIC and SBI\n\nAll three share a common `Arch` trait interface, letting the kernel run identically across platforms.",
        tags: ["architecture", "platforms"],
        links: [{ label: "HAL Documentation", href: "/docs/hal" }],
      },
      {
        q: "How big is the Helix codebase?",
        a: "The Helix kernel spans **812K+ lines** of pure Rust code:\n\n- **NEXUS AI subsystem** — 812K lines (anomaly detection, ML engines, self-healing)\n- **Lumina GPU stack** — 197K lines (14 sub-crates + Magma driver)\n- **HAL** — ~22K lines (3 architecture backends)\n- **Core kernel** — ~15K lines (syscalls, IPC, interrupts)\n- **HelixFS** — ~12K lines (6-layer filesystem)\n\nEvery line is `no_std` Rust with zero external C dependencies.",
        tags: ["codebase", "statistics"],
      },
      {
        q: "What license is Helix under?",
        a: "Helix OS is open-source. The codebase is publicly available on GitHub, and contributions are welcome from anyone interested in OS development, Rust, or systems programming.",
        tags: ["license", "open-source"],
        links: [{ label: "Contributing Guide", href: "/contributing" }],
      },
    ],
  },
  {
    id: "building", title: "Building & Running", icon: "🔨", color: "#22C55E", sc: "34,197,94", count: 0,
    items: [
      {
        q: "What are the system requirements?",
        a: "You'll need:\n\n- **OS** — Linux, macOS, or Windows (WSL2)\n- **RAM** — 8 GB minimum, 16 GB recommended\n- **Disk** — 2 GB free space\n- **Rust** — Nightly toolchain (managed by `rust-toolchain.toml`)\n- **QEMU** — with x86_64 system emulation\n- **Optional** — GDB (debugging), GRUB 2 + xorriso (ISO creation)",
        tags: ["requirements", "setup"],
      },
      {
        q: "How do I build and run Helix?",
        a: "Three commands to boot Helix in QEMU:",
        tags: ["build", "run", "quickstart"],
        code: `git clone https://github.com/helix-os/helix.git && cd helix
rustup target add x86_64-unknown-none
./scripts/build.sh          # Build the kernel
./scripts/run_qemu.sh       # Launch in QEMU`,
        links: [
          { label: "Getting Started", href: "/docs/getting-started" },
          { label: "Boot Sequence", href: "/boot" },
        ],
      },
      {
        q: "Build fails with \"linker not found\"",
        a: "Install `lld`: `sudo apt install lld`. Helix uses `rust-lld` by default — ensure your `.cargo/config.toml` has `linker = \"rust-lld\"`. On macOS, the default linker should work out of the box.",
        tags: ["troubleshooting", "linker"],
        code: `sudo apt install lld
# Verify .cargo/config.toml contains:
# [target.x86_64-unknown-none]
# linker = "rust-lld"`,
      },
      {
        q: "QEMU won't start or \"KVM permission denied\"",
        a: "Install QEMU and add yourself to the `kvm` group:",
        tags: ["troubleshooting", "qemu", "kvm"],
        code: `sudo apt install qemu-system-x86
sudo usermod -aG kvm $USER
# Log out and back in for group changes to take effect`,
      },
      {
        q: "How do I create a bootable ISO?",
        a: "Run `./scripts/build.sh --iso`. The output is placed at `build/output/helix.iso` and can be written to USB or booted in VirtualBox, VMware, or on real hardware. You'll need `grub-mkrescue` and `xorriso` installed.",
        tags: ["iso", "bootable", "usb"],
        links: [{ label: "Download Page", href: "/download" }],
      },
      {
        q: "Can I run Helix on real hardware?",
        a: "**Experimentally, yes.** Helix can boot on x86_64 hardware via UEFI or legacy BIOS with a bootable ISO. However, driver support is limited — most testing is done in QEMU. If you try real hardware, ensure you have a serial port connection for debugging output.",
        tags: ["hardware", "bare-metal"],
      },
    ],
  },
  {
    id: "architecture", title: "Architecture & Design", icon: "🏛️", color: "#4A90E2", sc: "74,144,226", count: 0,
    items: [
      {
        q: "Why is Helix written in Rust instead of C?",
        a: "Rust offers critical advantages for kernel development:\n\n- **Memory safety** — Prevents buffer overflows, use-after-free, null dereference at compile time\n- **Zero-cost abstractions** — High-level code compiles to efficient machine code\n- **No runtime** — Minimal requirements, perfect for `#![no_std]` bare-metal\n- **Strong type system** — Catches entire classes of bugs before they reach production\n- **Fearless concurrency** — Data races are compile-time errors\n\nThe kernel uses `unsafe` sparingly (~2% of code) and only where hardware interaction demands it.",
        tags: ["rust", "language-choice"],
      },
      {
        q: "Is Helix a microkernel or monolithic?",
        a: "Helix is a **modular monolithic** kernel — a hybrid approach. Subsystems run in kernel space (like Linux) for low IPC overhead, but have clean trait-based interfaces and hot-reloadable modules (like a microkernel). This gives the performance of monolithic with the flexibility of micro.",
        tags: ["kernel-type", "design"],
        links: [
          { label: "Architecture Overview", href: "/docs/architecture" },
          { label: "Compare Kernels", href: "/compare" },
        ],
      },
      {
        q: "What is the DIS (Differentiated Intent Scheduler)?",
        a: "DIS replaces traditional priority numbers with **intent classes**:\n\n- **Realtime** — Hard deadlines, EDF (Earliest Deadline First)\n- **System** — Kernel-critical tasks, high priority FIFO\n- **Interactive** — Low latency, CFS-style with small time slices\n- **Batch** — Throughput-oriented, large time slices\n- **Idle** — Best-effort, runs when nothing else needs CPU\n\nNEXUS ML models dynamically tune time slices based on workload fingerprinting. Per-CPU run queues with work stealing and NUMA-aware placement.",
        tags: ["scheduler", "dis"],
        links: [{ label: "DIS Scheduler", href: "/docs/subsystems#dis" }],
      },
      {
        q: "How does hot-reload work?",
        a: "Any kernel module can be replaced at runtime without rebooting:\n\n1. **Pause** — Old module quiesced, requests queued\n2. **Export** — State serialized to checkpoint\n3. **Load** — New module binary loaded and relocated\n4. **Import** — Checkpoint state deserialized into new module\n5. **Activate** — New module starts serving requests\n6. **Rollback** — If any step fails, old module is restored automatically\n\nAverage swap time: ~3ms. Used by NEXUS for self-healing when modules crash.",
        tags: ["hot-reload", "modules"],
        links: [{ label: "Module System", href: "/docs/modules" }],
      },
      {
        q: "What is the capability-based security model?",
        a: "Every resource access in Helix requires an **unforgeable capability token**:\n\n- **Per-module tokens** — Each module receives a capability set at load time\n- **Hierarchical delegation** — Modules can delegate subsets of their capabilities\n- **Revocation chains** — Capabilities can be revoked, propagating through the delegation chain\n- **Syscall gating** — Every syscall checks the caller's capability before execution\n- **Memory isolation** — Separate address spaces with guard pages between modules\n\nThis is fundamentally more secure than traditional Unix permission bits (rwx).",
        tags: ["security", "capabilities"],
        links: [{ label: "Security Model", href: "/docs/architecture#security" }],
      },
    ],
  },
  {
    id: "nexus", title: "NEXUS & AI", icon: "🧠", color: "#9B59B6", sc: "155,89,182", count: 0,
    items: [
      {
        q: "What is NEXUS?",
        a: "**NEXUS** (Neural EXpert Unified System) is Helix's kernel-integrated AI subsystem — 812K lines of pure Rust ML code. It provides real-time kernel intelligence:\n\n- **Anomaly Detection** — Statistical models and time series analysis spot unusual behavior\n- **Crash Prediction** — ML models estimate per-module crash probability\n- **Self-Healing** — Automated tiered recovery: Restart → Rollback → Hot-Swap → Zombie\n- **Performance Tuning** — Runtime optimization of scheduler, memory, and cache policies\n- **Telemetry** — Lock-free metrics and ring buffer traces",
        tags: ["nexus", "ai", "ml"],
        links: [{ label: "NEXUS Documentation", href: "/docs/nexus" }],
      },
      {
        q: "What ML models does NEXUS use?",
        a: "NEXUS includes **6 ML engine types**, all running in-kernel with zero heap allocation on the hot path:\n\n- **Decision Trees** — 1200-node trees for failure classification\n- **Random Forests** — 50×24 ensembles for crash prediction\n- **Neural Networks** — 3-layer, 128-neuron networks for anomaly scoring\n- **K-Means** — Clustering for workload fingerprinting\n- **SVMs** — Support Vector Machines with RBF kernel for classification\n- **Online Learning** — Continuously adapting models from runtime telemetry",
        tags: ["ml", "models", "engines"],
      },
      {
        q: "How does self-healing work?",
        a: "When a module crashes, NEXUS orchestrates automated recovery:\n\n1. **Detection** — Health monitor detects missing heartbeat or anomalous behavior\n2. **Quarantine** — Failing module isolated with resource fences to prevent cascade\n3. **Classification** — ML models classify the failure type and severity\n4. **Strategy Selection** — Action selector picks optimal recovery based on historical success rates\n5. **Recovery Attempt** — Tiered: Restart → State Rollback → Hot-Swap\n6. **Escalation** — After 3 failed attempts, module enters `Zombie` state for manual intervention\n\nThe entire process is driven by ML models with no human intervention needed.",
        tags: ["self-healing", "recovery"],
        links: [{ label: "NEXUS Healing", href: "/docs/nexus#healing" }],
      },
    ],
  },
  {
    id: "filesystem", title: "HelixFS & Storage", icon: "💾", color: "#22D3EE", sc: "34,211,238", count: 0,
    items: [
      {
        q: "What is HelixFS?",
        a: "HelixFS is a modern **copy-on-write** filesystem with 6 layers:\n\n1. **VFS Layer** — POSIX-compatible API with inodes, dentries, and namespaces\n2. **Transaction Layer** — ACID guarantees via write-ahead log\n3. **Metadata** — B+Tree indexing, radix trees, and snapshot management\n4. **Data** — Extent-based allocation with ARC (Adaptive Replacement Cache)\n5. **Security** — Per-file AES-256 encryption and Merkle tree integrity\n6. **Block Device** — Sector-aligned I/O with DMA buffer management\n\nSupports up to **2^64 files**, nanosecond timestamps, and atomic transactions.",
        tags: ["helixfs", "filesystem"],
        links: [{ label: "HelixFS Documentation", href: "/docs/filesystem" }],
      },
      {
        q: "Why B+Trees in the filesystem?",
        a: "B+Trees are the ideal data structure for filesystems:\n\n- **Minimal seeks** — High fanout (~200 keys/node) means few disk reads\n- **Consistent O(log n)** — Predictable performance for search, insert, delete\n- **Range queries** — Efficient directory listings and extent lookups via leaf pointers\n- **Cache-friendly** — 4KB nodes align perfectly with page sizes\n\nHelixFS uses B+Trees for both directory indexing and extent management.",
        tags: ["btree", "data-structure"],
      },
      {
        q: "Does HelixFS support snapshots?",
        a: "Yes! HelixFS supports **instant snapshots** using copy-on-write semantics. Creating a snapshot is O(1) — it just increments a reference count on the current root. Only modified blocks are duplicated, making snapshots extremely space-efficient. This is the same technique used by ZFS and Btrfs.",
        tags: ["snapshots", "cow"],
      },
    ],
  },
  {
    id: "development", title: "Development & Debugging", icon: "🐛", color: "#F59E0B", sc: "245,158,11", count: 0,
    items: [
      {
        q: "How do I add a new kernel module?",
        a: "Create a crate under `modules_impl/`, implement the `ModuleTrait`, and register it with `register_module!(MyModule)`. The module system handles lifecycle management, dependency resolution, and health monitoring automatically.",
        tags: ["modules", "contributing"],
        links: [
          { label: "Module Guide", href: "/docs/modules" },
          { label: "Contributing", href: "/contributing" },
        ],
      },
      {
        q: "How do I debug with GDB?",
        a: "Helix has first-class GDB support. Start QEMU in debug mode, then attach GDB:",
        tags: ["debugging", "gdb"],
        code: `# Terminal 1: Start debug server
./scripts/run_qemu.sh --debug

# Terminal 2: Attach GDB
gdb build/output/helix-kernel
(gdb) target remote localhost:1234
(gdb) break kernel_main
(gdb) continue`,
        links: [{ label: "Debugging Guide", href: "/docs/debugging" }],
      },
      {
        q: "I get a triple fault! What do I do?",
        a: "Triple faults usually mean invalid page tables, stack overflow, or GDT/IDT corruption. Debug with:\n\n1. Run QEMU with `-d int,cpu_reset -no-reboot` to see the exception chain\n2. Check if the page tables are correctly set up (CR3 pointing to valid PML4)\n3. Verify the stack pointer is in mapped memory\n4. Ensure GDT has valid kernel code/data segments\n5. Check IDT handlers are correctly installed\n\nThe serial console output will usually give you the faulting instruction address.",
        tags: ["troubleshooting", "triple-fault"],
        code: `# See the full exception chain:
qemu-system-x86_64 -d int,cpu_reset -no-reboot -kernel build/output/helix-kernel`,
        links: [{ label: "Debugging Guide", href: "/docs/debugging" }],
      },
      {
        q: "How fast is Helix?",
        a: "Key performance metrics on QEMU:\n\n- **Context switch** — ~2–5 μs\n- **Syscall overhead** — ~1–2 μs\n- **IPC round-trip** — ~3–5 μs\n- **Module hot-swap** — ~3 ms average\n- **Boot to shell** — < 1 second\n- **Event bus publish** — ~200 ns\n\nThese are competitive with mature kernels despite Helix's pre-alpha status.",
        tags: ["performance", "benchmarks"],
        links: [{ label: "Benchmarks", href: "/docs/benchmarks" }],
      },
      {
        q: "How do I run the test suite?",
        a: "Helix has multiple test layers:",
        tags: ["testing", "ci"],
        code: `# Unit tests (runs on host)
cargo test --target x86_64-unknown-linux-gnu --lib

# Full test suite (integration + unit)
./scripts/test.sh

# Format check
cargo fmt --all -- --check

# Lint check
cargo clippy --all-targets --all-features -- -D warnings`,
      },
    ],
  },
  {
    id: "comparisons", title: "Comparisons", icon: "⚖️", color: "#EC4899", sc: "236,72,153", count: 0,
    items: [
      {
        q: "Helix vs. Linux?",
        a: "**Linux**: ~30M lines of C, CFS scheduler, production-grade, runs on everything, 30+ years of maturity.\n\n**Helix**: ~812K lines of Rust, intent-based DIS scheduler, research/education focus, x86_64 primarily.\n\nUse Linux for production workloads. Use Helix for learning OS internals, exploring modern kernel design, and contributing to Rust systems programming research.",
        tags: ["linux", "comparison"],
        links: [{ label: "Kernel Comparison", href: "/compare" }],
      },
      {
        q: "Helix vs. Redox OS?",
        a: "Both are Rust kernels but with different philosophies:\n\n- **Redox** — Microkernel architecture, Unix-like userspace, more mature ecosystem, Scheme shell\n- **Helix** — Modular monolithic, hot-reload modules, intent scheduling (DIS), NEXUS AI engine, HelixFS\n\nRedox aims to be a practical Unix replacement. Helix explores novel kernel ideas like ML-driven self-healing and intent-based scheduling.",
        tags: ["redox", "comparison"],
        links: [{ label: "Kernel Comparison", href: "/compare" }],
      },
      {
        q: "Helix vs. seL4?",
        a: "**seL4** is formally verified with mathematical proofs of correctness — a minimal microkernel (~10K lines) focused on security-critical systems.\n\n**Helix** is much larger, focuses on modularity and novel scheduling, and uses Rust's type system for safety rather than formal methods. seL4 is for verified security; Helix is for kernel research and innovation.",
        tags: ["sel4", "comparison"],
      },
      {
        q: "Can Helix replace my current OS?",
        a: "**Not yet.** Helix lacks userspace applications, a complete driver ecosystem, networking stack, and the thousands of other pieces needed for a daily-driver OS. It's a kernel research project — think of it as a laboratory for OS ideas, not a Linux replacement.",
        tags: ["daily-driver", "practical"],
      },
    ],
  },
  {
    id: "secrets", title: "Easter Eggs", icon: "🔮", color: "#FF6B35", sc: "255,107,53", count: 0,
    items: [
      {
        q: "Is there a secret hidden somewhere on this site?",
        a: "Who knows? Rumor has it that an **ancient code**, known only to true gamers, can unlock something extraordinary on the page where *kernels are compared*. Perhaps the arrows will guide you…",
        tags: ["secret", "easter-egg"],
        links: [{ label: "Compare Page", href: "/compare" }],
      },
      {
        q: "What does the fox say?",
        a: "The fox says `0xDEADBEEF`. At least in kernel space. In userspace, it might say `SEGFAULT`.",
        tags: ["humor"],
      },
    ],
  },
];

// Compute counts
CATEGORIES.forEach(c => { c.count = c.items.length; });

const TOTAL_QUESTIONS = CATEGORIES.reduce((sum, c) => sum + c.items.length, 0);

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATED CONSTELLATION BACKGROUND
   ═══════════════════════════════════════════════════════════════════════ */

function ConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const nodes: { x: number; y: number; vx: number; vy: number; r: number; pulse: number; speed: number; color: string }[] = [];
    const nodeCount = 35;
    const colors = ["123,104,238", "74,144,226", "155,89,182", "34,197,94", "236,72,153"];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.5 + 0.5,
        pulse: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.012 + 0.004,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += n.speed;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const alpha = (1 - dist / 200) * 0.06;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${nodes[i].color}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const glow = (Math.sin(n.pulse) + 1) / 2;
        const r = n.r + glow * 0.8;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.color}, ${0.15 + glow * 0.3})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}

/* ═══════════════════════════════════════════════════════════════════════
   RICH TEXT RENDERER — bold, code, lists, line breaks
   ═══════════════════════════════════════════════════════════════════════ */

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={j} className="px-1.5 py-0.5 rounded-md bg-helix-purple/10 border border-helix-purple/20 text-helix-purple text-[0.85em] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={j}>{part}</span>;
  });
}

function RichAnswer({ text, color }: { text: string; color: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        if (/^\d+\.\s/.test(trimmed)) {
          const num = trimmed.match(/^(\d+)\./)?.[1];
          const rest = trimmed.replace(/^\d+\.\s*/, "");
          return (
            <div key={i} className="flex gap-2.5 items-start pl-1">
              <span className="font-mono text-xs mt-0.5 min-w-[1.25rem] text-right opacity-50" style={{ color }}>{num}.</span>
              <span className="text-zinc-300">{renderInline(rest)}</span>
            </div>
          );
        }

        if (trimmed.startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2.5 items-start pl-1">
              <span className="mt-2 text-[6px]" style={{ color }}>●</span>
              <span className="text-zinc-300">{renderInline(trimmed.slice(2))}</span>
            </div>
          );
        }

        if (trimmed === "") return <div key={i} className="h-1.5" />;

        return (
          <p key={i} className="text-zinc-300">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CODE BLOCK WITH COPY BUTTON
   ═══════════════════════════════════════════════════════════════════════ */

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-zinc-800/50 shadow-lg shadow-black/20 group/code">
      <div className="px-4 py-2 bg-zinc-900/60 border-b border-zinc-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/40" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
            <div className="w-2 h-2 rounded-full bg-green-500/40" />
          </div>
          <span className="text-[9px] font-mono text-zinc-600">terminal</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-800/40 hover:bg-zinc-700/50 text-zinc-500 hover:text-white text-[10px] font-mono transition-all cursor-pointer opacity-0 group-hover/code:opacity-100"
        >
          {copied ? (
            <><svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span className="text-emerald-400">Copied!</span></>
          ) : (
            <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
          )}
        </button>
      </div>
      <pre className="p-4 bg-[#08090c] overflow-x-auto text-xs font-mono text-emerald-300/80 leading-relaxed">{code}</pre>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FAQ ITEM — Accordion with smooth expand animation
   ═══════════════════════════════════════════════════════════════════════ */

function FaqItemCard({ item, color, sc, isOpen, onToggle, index }: {
  item: FaqItem; color: string; sc: string; isOpen: boolean; onToggle: () => void; index: number;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div
      className="group/faq relative rounded-2xl transition-all duration-500"
      style={{
        background: isOpen ? `rgba(${sc}, 0.03)` : "rgba(255,255,255,0.01)",
        border: `1px solid ${isOpen ? `rgba(${sc}, 0.2)` : "rgba(255,255,255,0.04)"}`,
        boxShadow: isOpen ? `0 0 40px rgba(${sc}, 0.05), inset 0 1px 0 rgba(255,255,255,0.03)` : "none",
      }}
    >
      {/* Top glow line on open */}
      <div
        className="absolute top-0 left-[10%] right-[10%] h-[1px] transition-opacity duration-500"
        style={{
          opacity: isOpen ? 1 : 0,
          background: `linear-gradient(90deg, transparent, rgba(${sc}, 0.4), transparent)`,
        }}
      />

      {/* Question */}
      <button
        onClick={onToggle}
        className="w-full text-left px-6 py-5 flex items-center gap-4 cursor-pointer group/btn"
      >
        {/* Number */}
        <span
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold font-mono transition-all duration-300"
          style={{
            background: isOpen ? `rgba(${sc}, 0.15)` : "rgba(255,255,255,0.03)",
            color: isOpen ? color : "rgba(161,161,170,0.5)",
            border: `1px solid ${isOpen ? `rgba(${sc}, 0.25)` : "rgba(255,255,255,0.05)"}`,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Question text */}
        <span className={`flex-1 font-semibold text-[15px] leading-snug transition-colors duration-300 ${isOpen ? "text-white" : "text-zinc-400 group-hover/btn:text-zinc-200"}`}>
          {item.q}
        </span>

        {/* Tags */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          {item.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-md text-[9px] font-mono tracking-wide uppercase"
              style={{
                background: `rgba(${sc}, 0.06)`,
                color: `rgba(${sc.split(",").map(v => Math.min(255, parseInt(v) + 60)).join(",")}, 0.7)`,
                border: `1px solid rgba(${sc}, 0.1)`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Toggle icon */}
        <div
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500"
          style={{
            background: isOpen ? `rgba(${sc}, 0.12)` : "rgba(255,255,255,0.03)",
            border: `1px solid ${isOpen ? `rgba(${sc}, 0.2)` : "rgba(255,255,255,0.05)"}`,
            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          <svg className="w-3.5 h-3.5 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke={isOpen ? color : "#71717a"} strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </button>

      {/* Answer — smooth height animation */}
      <div
        className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ maxHeight: height }}
      >
        <div ref={contentRef} className="px-6 pb-6 pt-0">
          {/* Divider */}
          <div className="mb-4 h-[1px]" style={{ background: `linear-gradient(90deg, rgba(${sc}, 0.15), transparent)` }} />

          {/* Rich answer */}
          <div className="text-sm leading-relaxed pl-12">
            <RichAnswer text={item.a} color={color} />

            {/* Code block */}
            {item.code && <CodeBlock code={item.code} />}

            {/* Links */}
            {item.links && item.links.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {item.links.map(link => (
                  <Link key={link.href} href={link.href}
                    className="group/link inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:brightness-125"
                    style={{
                      background: `rgba(${sc}, 0.06)`,
                      border: `1px solid rgba(${sc}, 0.1)`,
                      color: color,
                    }}
                  >
                    <svg className="w-2.5 h-2.5 group-hover/link:rotate-[-10deg] transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   REVEAL ANIMATION WRAPPER
   ═══════════════════════════════════════════════════════════════════════ */

function Reveal({ children, delay = 0, from = "bottom" }: { children: React.ReactNode; delay?: number; from?: "bottom" | "left" | "right" | "scale" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05, rootMargin: "0px 0px -30px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const transforms: Record<string, string> = {
    bottom: "translateY(30px)",
    left: "translateX(-30px)",
    right: "translateX(30px)",
    scale: "scale(0.95)",
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transforms[from],
        transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ██  MAIN FAQ PAGE
   ═══════════════════════════════════════════════════════════════════════ */

export default function FaqPage() {
  const { locale } = useI18n();
  const s = (k: string) => getDocString(faqContent, locale, k);

  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleItem = useCallback((key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Global question index for numbering
  let globalIndex = 0;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-helix-purple/40">
      <ConstellationCanvas />

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] rounded-full bg-helix-purple/[0.04] blur-[160px]" />
        <div className="absolute top-[60%] right-[5%] w-[400px] h-[400px] rounded-full bg-helix-blue/[0.04] blur-[140px]" />
        <div className="absolute bottom-[10%] left-[35%] w-[500px] h-[500px] rounded-full bg-indigo-500/[0.03] blur-[180px]" />
      </div>

      <style>{`
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes countUp { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        @keyframes pulseRing { 0%, 100% { box-shadow: 0 0 0 0 rgba(123,104,238,0.2); } 50% { box-shadow: 0 0 0 8px rgba(123,104,238,0); } }
        @keyframes floatSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .gradient-text-animated { background-size: 200% 200%; animation: gradientShift 4s ease infinite; }
        .stat-item { animation: countUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
        .shimmer-text { background-size: 200% auto; animation: shimmer 3s linear infinite; }
        .float-slow { animation: floatSlow 6s ease-in-out infinite; }
      `}</style>

      <main className="relative" style={{ zIndex: 2 }}>

        {/* ═══════════════════════════════════════════════════════
           HERO HEADER
           ═══════════════════════════════════════════════════════ */}
        <header className="relative pt-32 pb-16 px-6 overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[1px]"
            style={{ background: "linear-gradient(90deg, transparent, rgba(123,104,238,.15), rgba(74,144,226,.15), transparent)" }} />

          <div className="max-w-5xl mx-auto">
            <Reveal>
              <div className="flex flex-col items-center text-center space-y-6">

                {/* Badge */}
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-mono"
                  style={{ background: "rgba(123,104,238,.08)", border: "1px solid rgba(123,104,238,.15)", color: "#9B8AFF" }}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-helix-purple opacity-40" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-helix-purple" />
                  </span>
                  {s("badge")} · {TOTAL_QUESTIONS} {s("questions")} · {CATEGORIES.length} {s("categories")}
                </div>

                {/* Decorative icon */}
                <div className="relative float-slow">
                  <div className="absolute inset-[-8px] rounded-3xl border border-helix-purple/10" style={{ animation: "pulseRing 3s ease infinite" }} />
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-helix-purple via-indigo-500 to-helix-blue flex items-center justify-center shadow-2xl shadow-helix-purple/20">
                    <span className="text-3xl">❓</span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-helix-purple to-helix-blue gradient-text-animated bg-[length:200%_200%]"
                    style={{ filter: "drop-shadow(0 0 40px rgba(123,104,238,.15))" }}>
                    {s("title_line1")}
                  </span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-helix-blue via-helix-purple to-indigo-400 shimmer-text"
                    style={{ backgroundImage: "linear-gradient(90deg,#4A90E2,#7B68EE,#9B59B6,#4A90E2)" }}>
                    {s("title_line2")}
                  </span>
                </h1>

                <p className="text-zinc-500 max-w-xl text-base leading-relaxed">
                  {s("subtitle")}
                </p>

                {/* Stats ribbon */}
                <div className="inline-flex items-center gap-6 px-7 py-3.5 rounded-2xl bg-zinc-900/30 border border-zinc-800/30 backdrop-blur-sm mt-2">
                  {[
                    { icon: "📚", value: String(TOTAL_QUESTIONS), label: "Questions" },
                    { icon: "🏷️", value: String(CATEGORIES.length), label: "Categories" },
                    { icon: "🦀", value: "812K+", label: "Lines of Rust" },
                    { icon: "🏗️", value: "3", label: "Architectures" },
                  ].map((s, i) => (
                    <div key={s.label} className="flex items-center gap-2.5 stat-item" style={{ animationDelay: `${i * 100}ms` }}>
                      {i > 0 && <div className="w-px h-7 bg-zinc-800/50" />}
                      <span className="text-base">{s.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-white leading-none">{s.value}</div>
                        <div className="text-[9px] text-zinc-600 whitespace-nowrap mt-0.5">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════
           FAQ CONTENT
           ═══════════════════════════════════════════════════════ */}
        <div ref={scrollRef} className="max-w-5xl mx-auto px-6 py-12">

          {/* Category sections */}
          <div className="space-y-14">
            {CATEGORIES.map((cat, catIdx) => {
              const startIndex = globalIndex;
              globalIndex += cat.items.length;
              return (
                <Reveal key={cat.id} delay={catIdx * 0.05}>
                  <section>
                    {/* Category header */}
                    <div className="flex items-center gap-4 mb-6 group" id={cat.id}>
                      {/* Icon */}
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform duration-500 group-hover:scale-110"
                        style={{
                          background: `rgba(${cat.sc}, 0.08)`,
                          border: `1px solid rgba(${cat.sc}, 0.15)`,
                          boxShadow: `0 0 20px rgba(${cat.sc}, 0.05)`,
                        }}
                      >
                        {cat.icon}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-bold text-white tracking-tight">{cat.title}</h2>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono"
                            style={{ background: `rgba(${cat.sc}, 0.08)`, color: cat.color, border: `1px solid rgba(${cat.sc}, 0.12)` }}>
                            {cat.items.length} {cat.items.length === 1 ? "question" : "questions"}
                          </span>
                        </div>
                        <div className="mt-1 h-[1px] w-full" style={{ background: `linear-gradient(90deg, rgba(${cat.sc}, 0.2), transparent 60%)` }} />
                      </div>

                      {/* Anchor link */}
                      <a href={`#${cat.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-700 hover:text-zinc-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                      </a>
                    </div>

                    {/* Items */}
                    <div className="space-y-2.5 pl-0 sm:pl-3">
                      {cat.items.map((item, i) => {
                        const key = `${cat.id}-${i}`;
                        return (
                          <FaqItemCard
                            key={key}
                            item={item}
                            color={cat.color}
                            sc={cat.sc}
                            isOpen={openItems.has(key)}
                            onToggle={() => toggleItem(key)}
                            index={startIndex + i}
                          />
                        );
                      })}
                    </div>
                  </section>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
           BOTTOM CTA — Ask NEXUS
           ═══════════════════════════════════════════════════════ */}
        <Reveal>
          <div className="max-w-5xl mx-auto px-6 pb-20 pt-8">
            <div
              className="relative rounded-3xl overflow-hidden p-8 md:p-12 text-center"
              style={{
                background: "rgba(255,255,255,0.01)",
                border: "1px solid rgba(123,104,238,0.1)",
                boxShadow: "0 0 80px rgba(123,104,238,0.04), inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              {/* Ambient */}
              <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-[100px] pointer-events-none" style={{ background: "rgba(74,144,226,0.06)" }} />
              <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full blur-[100px] pointer-events-none" style={{ background: "rgba(123,104,238,0.06)" }} />
              <div className="absolute top-0 left-[15%] right-[15%] h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(123,104,238,0.25), transparent)" }} />

              <div className="relative space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-mono"
                  style={{ background: "rgba(123,104,238,0.08)", border: "1px solid rgba(123,104,238,0.15)", color: "#9B8AFF" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-helix-purple animate-pulse" />
                  Powered by NEXUS AI
                </div>

                <h3 className="text-2xl md:text-3xl font-black text-white">
                  Still have questions?
                </h3>
                <p className="text-zinc-500 max-w-md mx-auto text-sm leading-relaxed">
                  Ask <span className="text-white font-semibold">NEXUS</span>, our AI assistant trained on 812K+ lines of Helix kernel source code. Get instant, context-rich answers with real code examples.
                </p>

                <Link
                  href="/ask-helix"
                  className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-105 active:scale-[0.97]"
                  style={{
                    background: "linear-gradient(135deg, #7B68EE, #4A90E2)",
                    boxShadow: "0 8px 40px rgba(123,104,238,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Ask NEXUS
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>

                {/* Quick links */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  {[
                    { href: "/docs/getting-started", label: "Getting Started", icon: "🚀" },
                    { href: "/docs/architecture", label: "Architecture", icon: "🏗️" },
                    { href: "/compare", label: "Compare Kernels", icon: "⚖️" },
                  ].map(link => (
                    <Link key={link.href} href={link.href}
                      className="text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors flex items-center gap-1.5">
                      <span>{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Easter egg hint */}
        <div aria-hidden="true" className="select-none pointer-events-none text-center pb-6">
          <p className="text-[8px] text-zinc-900/15 tracking-[.5em] font-mono" title="↑↑↓↓←→←→BA">
            ▲ ▲ ▼ ▼ ◄ ► ◄ ► Ⓑ Ⓐ
          </p>
        </div>
      </main>
    </div>
  );
}
