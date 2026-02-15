"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Footer from "@/helix-wiki/components/Footer";
import Link from "next/link";

/* ── Knowledge base (simulated) ── */
interface KBEntry {
  q: string[];
  answer: string;
  links: { label: string; href: string }[];
  code?: string;
  codeFile?: string;
}

const KB: KBEntry[] = [
  {
    q: ["self-healing", "self heal", "auto repair", "recovery", "crash recovery", "auto-recovery"],
    answer:
      "Helix's self-healing system is powered by NEXUS — an 812K-line AI subsystem. When a module crashes, NEXUS detects the failure via health monitoring, quarantines the module to prevent cascade failures, then attempts automated recovery using a tiered strategy:\n\n1. **Restart** — Simple process restart with fresh state\n2. **State Rollback** — Restore from last checkpoint\n3. **Hot-Swap** — Replace with a known-good version\n4. **Escalation** — If all strategies fail after 3 attempts, the module enters Zombie state for manual intervention\n\nThe entire recovery process is driven by ML models that classify failure types and select the optimal recovery strategy based on historical success rates.",
    links: [
      { label: "NEXUS Subsystem", href: "/docs/nexus" },
      { label: "Module Lifecycle", href: "/docs/modules#lifecycle" },
      { label: "Architecture Overview", href: "/docs/architecture" },
    ],
    code: `// Self-healing recovery loop (simplified)\npub fn attempt_recovery(&mut self, module: ModuleId) -> HealingResult {\n    let failure = self.classifier.classify(module);\n    let strategy = self.action_selector.select(failure);\n    \n    for attempt in 0..MAX_RETRIES {\n        match strategy.execute(module) {\n            Ok(()) => return HealingResult::Recovered,\n            Err(e) => self.telemetry.log_retry(module, attempt, e),\n        }\n    }\n    self.quarantine.escalate_to_zombie(module);\n    HealingResult::Zombie\n}`,
    codeFile: "subsystems/nexus/src/healing/self_healer.rs",
  },
  {
    q: ["hot reload", "hot-reload", "hot swap", "hot-swap", "live update", "module replacement", "runtime swap"],
    answer:
      "Hot-reload is a first-class feature of Helix OS. Any module can be replaced at runtime without rebooting. The process follows these steps:\n\n1. **Pause** — The module is paused, queuing incoming requests\n2. **Export State** — Current module state is serialized to a checkpoint\n3. **Load New** — New module version is loaded and relocated\n4. **Import State** — Checkpoint state is deserialized into the new module\n5. **Activate** — New module starts serving requests\n6. **Rollback** — If any step fails, the old module is automatically restored\n\nThis enables zero-downtime kernel upgrades and is used by NEXUS for self-healing.",
    links: [
      { label: "Module System", href: "/docs/modules" },
      { label: "Module Lifecycle States", href: "/docs/modules#lifecycle" },
      { label: "NEXUS Healing Engine", href: "/docs/nexus#healing" },
    ],
    code: `pub fn hot_swap(&mut self, old: ModuleId, new_binary: &[u8]) -> Result<(), SwapError> {\n    let checkpoint = self.modules.pause_and_export(old)?;\n    let new_mod = self.loader.load(new_binary)?;\n    self.loader.init(new_mod)?;\n    self.modules.import_state(new_mod, checkpoint)?;\n    self.modules.activate(new_mod)?;\n    self.modules.unload(old)?;\n    Ok(())\n}`,
    codeFile: "subsystems/nexus/src/healing/hot_swap.rs",
  },
  {
    q: ["syscall", "system call", "syscalls", "dispatch", "syscall table"],
    answer:
      "Helix uses a 512-entry syscall dispatch table with a 6-argument calling convention matching Linux errno semantics. The ABI uses registers rdi, rsi, rdx, r10, r8, r9 — identical to Linux x86_64.\n\nKey features:\n- **Pre/post hooks** for tracing, security auditing, and profiling\n- **18 errno-compatible error codes** (EPERM, ENOENT, EIO, etc.)\n- **Single entry point** via `helix_syscall_entry()` — the only `extern \"C\"` function in the path\n- **SYSCALL/SYSRET MSR** based fast system call interface",
    links: [
      { label: "Syscall Framework", href: "/docs/core#syscalls" },
      { label: "Core Kernel", href: "/docs/core" },
      { label: "Syscall Playground", href: "/playground" },
    ],
    code: `#[no_mangle]\npub extern "C" fn helix_syscall_entry(\n    number: u64,\n    arg1: u64, arg2: u64, arg3: u64,\n    arg4: u64, arg5: u64, arg6: u64,\n) -> i64 {\n    let args = SyscallArgs {\n        number,\n        args: [arg1, arg2, arg3, arg4, arg5, arg6],\n    };\n    DISPATCHER.dispatch(&args)\n}`,
    codeFile: "core/src/syscall/gateway.rs",
  },
  {
    q: ["boot", "boot process", "startup", "init", "boot sequence", "initialization"],
    answer:
      "Helix boots through 5 phases, each with rollback on failure:\n\n1. **Boot** — Serial console → Physical memory → Interrupt vectors\n2. **Early** — Timer (HPET/PIT) → Scheduler (CFS-style, per-CPU run queues)\n3. **Core** — IPC channels → Syscall table → Module registry\n4. **Late** — VFS mount → Network stack → Device enumeration → Security framework\n5. **Runtime** — PID 1 (init process) → Interactive shell (hsh)\n\nThe entire boot completes in under 1 second. If any phase fails, the init subsystem rolls back to the last known-good state.",
    links: [
      { label: "Boot Process", href: "/docs/subsystems#init" },
      { label: "Boot Sequence Animation", href: "/boot" },
      { label: "Architecture Overview", href: "/docs/architecture" },
    ],
  },
  {
    q: ["ipc", "inter-process", "message passing", "event bus", "pub/sub", "communication"],
    answer:
      "Helix provides 3 IPC mechanisms:\n\n1. **Shared Memory** — Lock-free ring buffers with atomic operations for high-throughput data transfer (zero-copy)\n2. **Event Bus** — Global pub/sub system with priority ordering (Critical → High → Normal → Low) and topic-based routing\n3. **Message Router** — Point-to-point request/response between modules with typed messages and timeout handling\n\nAll IPC is capability-gated — a module can only communicate through channels it has explicit permission to use.",
    links: [
      { label: "IPC System", href: "/docs/core#ipc" },
      { label: "Event Bus", href: "/docs/core#ipc" },
      { label: "Core Kernel", href: "/docs/core" },
    ],
    code: `pub fn publish(&self, event: KernelEvent) -> usize {\n    let topic = event.topic();\n    let subs = self.subscribers.get(&topic);\n    let mut handled = 0;\n    for sub in subs.iter().sorted_by_key(|s| s.priority) {\n        (sub.handler)(event.clone());\n        handled += 1;\n    }\n    handled\n}`,
    codeFile: "core/src/ipc/event_bus.rs",
  },
  {
    q: ["filesystem", "helixfs", "file system", "fs", "cow", "copy on write", "b+tree", "snapshot"],
    answer:
      "HelixFS is a modern copy-on-write filesystem with 6 layers:\n\n1. **VFS Layer** — POSIX-compatible API with inodes, dentries, and namespaces\n2. **Transaction Layer** — ACID guarantees via write-ahead log\n3. **Metadata** — B+Tree indexing, radix trees, and snapshot management\n4. **Data** — Extent-based allocation with ARC (Adaptive Replacement Cache)\n5. **Security** — Per-file AES-256 encryption and Merkle tree integrity\n6. **Block Device** — Sector-aligned I/O with DMA buffer management\n\nKey features: atomic transactions, instant snapshots, transparent compression, and hardware-accelerated encryption.",
    links: [
      { label: "HelixFS", href: "/docs/filesystem" },
      { label: "Architecture", href: "/docs/architecture" },
    ],
  },
  {
    q: ["lumina", "gpu", "graphics", "render", "shader", "vulkan", "spirv"],
    answer:
      "Lumina is a complete GPU graphics stack — 197K lines across 14 sub-crates + Magma driver. Built entirely in `no_std` Rust with zero external graphics dependencies.\n\nThe stack includes:\n- **Math library** (SIMD-optimized Vec/Mat/Quat)\n- **Shader compiler** (Source → IR → SPIR-V with optimization passes)\n- **Render graph** (automatic barriers, pass scheduling)\n- **PBR materials** (metallic-roughness workflow)\n- **GPU abstraction** (Vulkan/Metal/DX12 backends)\n- **Magma driver** (ring buffer command submission, MMIO, IRQ handling)",
    links: [
      { label: "Lumina GPU API", href: "/docs/lumina" },
      { label: "Shader Pipeline", href: "/docs/lumina#crates" },
      { label: "Architecture", href: "/docs/architecture" },
    ],
  },
  {
    q: ["nexus", "ai", "intelligence", "machine learning", "prediction", "anomaly"],
    answer:
      "NEXUS is Helix's kernel intelligence subsystem — 812K lines of pure Rust ML code. It provides:\n\n- **Anomaly Detection** — Statistical models, time series analysis, pattern matching\n- **Crash Prediction** — ML models estimate per-module crash probability\n- **Self-Healing** — Automated recovery with tiered strategies\n- **Performance Optimization** — Runtime tuning of scheduler, memory, and cache policies\n- **Quarantine** — Isolates failing modules with resource fences\n- **Telemetry** — Lock-free metrics, ring buffer traces, health monitoring\n\nML engines include: Decision Trees, Random Forests, Neural Networks, K-Means, SVMs, and Online Learning.",
    links: [
      { label: "NEXUS Overview", href: "/docs/nexus" },
      { label: "ML Engines", href: "/docs/nexus#ml" },
      { label: "Architecture", href: "/docs/architecture" },
    ],
  },
  {
    q: ["hal", "hardware abstraction", "abstraction layer", "cpu", "mmu", "architecture", "aarch64", "risc-v", "x86"],
    answer:
      "The Hardware Abstraction Layer (HAL) is ~22K lines that abstracts CPU, MMU, interrupts, firmware, and relocation across 3 architectures:\n\n- **x86_64** — Full support with APIC, HPET, UEFI/BIOS, KASLR\n- **AArch64** — ARM support with GIC, device tree\n- **RISC-V 64** — RISC-V support with PLIC, SBI\n\nEach arch implements a common `Arch` trait, letting the kernel run identically across platforms. The HAL also provides KASLR (Kernel Address Space Layout Randomization) via the relocation subsystem.",
    links: [
      { label: "HAL Documentation", href: "/docs/hal" },
      { label: "Architecture Overview", href: "/docs/architecture" },
      { label: "Subsystems", href: "/docs/subsystems" },
    ],
  },
  {
    q: ["module", "modules", "crate", "plugin", "extension", "registry"],
    answer:
      "Helix's module system is the foundation of its extensibility. Every kernel subsystem is a module that can be loaded, unloaded, and hot-swapped at runtime.\n\nModule lifecycle: **Unloaded → Loading → Loaded → Initializing → Active → (Paused) → Stopping → Unloaded**\n\nFeatures:\n- **ABI versioning** — Modules declare compatible ABI ranges\n- **Dependency resolution** — Automatic loading of required modules\n- **Health monitoring** — NEXUS tracks module health via heartbeats\n- **Error states** — Crashed modules enter Error → Zombie pipeline\n- **Hot-swap** — Replace modules without restart",
    links: [
      { label: "Module System", href: "/docs/modules" },
      { label: "Module Lifecycle", href: "/docs/modules#lifecycle" },
      { label: "Architecture", href: "/docs/architecture" },
    ],
  },
  {
    q: ["memory", "allocator", "paging", "virtual memory", "physical memory", "frame", "heap"],
    answer:
      "Helix's memory subsystem provides:\n\n- **Physical Frame Allocator** — Bitmap-based with buddy allocation for large contiguous regions\n- **Virtual Memory Manager** — 4-level page tables (PML4) with demand paging\n- **Kernel Heap** — Slab allocator for small objects, buddy for large\n- **DMA Buffers** — Physically contiguous memory for device I/O\n- **KASLR** — Randomized kernel virtual address layout via relocation subsystem\n- **Memory Advisor** — NEXUS ML model recommends page sizes and compaction triggers",
    links: [
      { label: "Memory Subsystem", href: "/docs/subsystems#memory" },
      { label: "HAL MMU", href: "/docs/hal" },
      { label: "Architecture", href: "/docs/architecture" },
    ],
  },
  {
    q: ["scheduler", "scheduling", "dis", "process", "thread", "task", "preemptive"],
    answer:
      "Helix uses the DIS (Dynamic Intelligent Scheduler) — a CFS-inspired scheduler enhanced with NEXUS ML tuning:\n\n- **Per-CPU run queues** with work stealing\n- **Priority classes** — Real-time, System, Interactive, Batch, Idle\n- **Dynamic time slices** — Adjusted by NEXUS based on workload\n- **CPU affinity** — Soft and hard binding\n- **Load balancing** — Periodic cross-CPU migration\n- **Preemptive** — Tick-based preemption with voluntary yield support",
    links: [
      { label: "DIS Scheduler", href: "/docs/subsystems#dis" },
      { label: "Subsystems Overview", href: "/docs/subsystems" },
    ],
  },
];

const SUGGESTIONS = [
  "Comment fonctionne le self-healing ?",
  "Explain the boot sequence",
  "How does hot-reload work?",
  "What is NEXUS?",
  "Describe the syscall ABI",
  "How does HelixFS handle snapshots?",
  "What GPU APIs does Lumina provide?",
  "Explain the module lifecycle",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  links?: { label: string; href: string }[];
  code?: string;
  codeFile?: string;
  thinking?: boolean;
}

function findAnswer(query: string): KBEntry | null {
  const q = query.toLowerCase();
  let best: KBEntry | null = null;
  let bestScore = 0;
  for (const entry of KB) {
    let score = 0;
    for (const keyword of entry.q) {
      if (q.includes(keyword)) score += keyword.length;
    }
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  return bestScore > 2 ? best : null;
}

export default function AskHelixPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate thinking
    setTimeout(() => {
      const kb = findAnswer(text);
      const response: Message = kb
        ? { role: "assistant", content: kb.answer, links: kb.links, code: kb.code, codeFile: kb.codeFile }
        : {
            role: "assistant",
            content: `I don't have a specific answer for "${text.trim()}" yet, but here are some areas you can explore in the Helix documentation:\n\n- **Architecture** — Overall system design and crate dependencies\n- **Core Kernel** — Syscalls, IPC, interrupts, self-healing\n- **NEXUS** — AI-powered kernel intelligence (812K lines)\n- **Modules** — Hot-swappable module system\n- **HelixFS** — Copy-on-write filesystem\n\nTry asking about specific topics like "self-healing", "hot-reload", "syscalls", or "boot process".`,
            links: [
              { label: "Architecture", href: "/docs/architecture" },
              { label: "Core Kernel", href: "/docs/core" },
              { label: "NEXUS", href: "/docs/nexus" },
            ],
          };
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  }, [isTyping]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-helix-purple/40">
      <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="fixed top-[-200px] right-[-100px] w-[500px] h-[500px] bg-helix-purple/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-200px] left-[-100px] w-[500px] h-[500px] bg-helix-blue/10 rounded-full blur-[150px] pointer-events-none" />

      <style>{`
        @keyframes fadeUp { 0% { opacity: 0; transform: translateY(12px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 20px rgba(123,104,238,0.15); } 50% { box-shadow: 0 0 40px rgba(123,104,238,0.3); } }
        @keyframes typingDot { 0%, 60%, 100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-4px); } }
        .msg-enter { animation: fadeUp 0.4s ease; }
        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.3s; }
      `}</style>

      <main className="relative flex flex-col min-h-screen">
        {/* Header */}
        <div className="pt-24 pb-4 px-6">
          <div className="max-w-3xl mx-auto">
            <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-4 inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Home
            </Link>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-helix-purple to-helix-blue flex items-center justify-center shadow-lg shadow-helix-purple/20" style={{ animation: "pulseGlow 3s ease infinite" }}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Ask Helix</h1>
                <p className="text-sm text-zinc-500">AI assistant trained on the entire Helix OS documentation & source code</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="py-16 space-y-10 msg-enter">
                {/* Welcome */}
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-helix-purple/10 border border-helix-purple/20 text-helix-purple text-xs font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-helix-purple animate-pulse" />
                    Contextual AI · Documentation + Source Code
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold">
                    What do you want to know about{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-helix-blue to-helix-purple">Helix OS</span>?
                  </h2>
                  <p className="text-zinc-500 max-w-lg mx-auto">
                    Ask anything about the kernel architecture, subsystems, APIs, or internals. I&apos;ll answer with relevant code snippets and documentation links.
                  </p>
                </div>

                {/* Suggestion chips */}
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => sendMessage(s)}
                      className="px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-sm text-zinc-400 hover:text-white hover:border-helix-purple/40 hover:bg-zinc-800/60 transition-all duration-200 cursor-pointer">
                      {s}
                    </button>
                  ))}
                </div>

                {/* Capabilities */}
                <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  {[
                    { icon: "📖", title: "Documentation", desc: "Searches all 8 doc pages with deep content matching" },
                    { icon: "🦀", title: "Source Code", desc: "References real Rust code from the kernel codebase" },
                    { icon: "🔗", title: "Smart Links", desc: "Links directly to relevant docs sections and source files" },
                  ].map((c) => (
                    <div key={c.title} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40 text-center space-y-2">
                      <span className="text-2xl">{c.icon}</span>
                      <h3 className="text-sm font-bold text-white">{c.title}</h3>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`msg-enter flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-helix-purple to-helix-blue flex items-center justify-center shrink-0 mt-1 mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                  </div>
                )}
                <div className={`max-w-[85%] ${msg.role === "user"
                  ? "bg-helix-purple/15 border border-helix-purple/20 rounded-2xl rounded-tr-md px-5 py-3"
                  : "bg-zinc-900/60 border border-zinc-800/60 rounded-2xl rounded-tl-md px-5 py-4"
                }`}>
                  {/* Message content */}
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    {msg.content.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
                      part.startsWith("**") && part.endsWith("**")
                        ? <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>
                        : <span key={j} className={msg.role === "user" ? "text-white" : "text-zinc-300"}>{part}</span>
                    )}
                  </div>

                  {/* Code block */}
                  {msg.code && (
                    <div className="mt-4 rounded-lg overflow-hidden border border-zinc-800/60">
                      {msg.codeFile && (
                        <div className="px-3 py-1.5 bg-zinc-800/50 border-b border-zinc-800/60 flex items-center gap-2">
                          <svg className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/></svg>
                          <span className="text-[10px] font-mono text-zinc-500">{msg.codeFile}</span>
                        </div>
                      )}
                      <pre className="p-4 bg-[#0d1117] overflow-x-auto text-xs font-mono text-zinc-300 leading-relaxed">{msg.code}</pre>
                    </div>
                  )}

                  {/* Links */}
                  {msg.links && msg.links.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-zinc-800/40 flex flex-wrap gap-2">
                      {msg.links.map((link) => (
                        <Link key={link.href} href={link.href}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-helix-blue/10 border border-helix-blue/20 text-helix-blue text-xs font-medium hover:bg-helix-blue/20 hover:border-helix-blue/40 transition-all">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 mt-1 ml-3">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start gap-3 msg-enter">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-helix-purple to-helix-blue flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl rounded-tl-md px-5 py-4 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-helix-purple typing-dot" style={{ animation: "typingDot 1.4s ease infinite" }} />
                  <div className="w-2 h-2 rounded-full bg-helix-purple typing-dot" style={{ animation: "typingDot 1.4s ease infinite" }} />
                  <div className="w-2 h-2 rounded-full bg-helix-purple typing-dot" style={{ animation: "typingDot 1.4s ease infinite" }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input bar */}
        <div className="sticky bottom-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-8 pb-6 px-6">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative flex items-center bg-zinc-900/80 border border-zinc-800/60 rounded-2xl px-4 py-1 focus-within:border-helix-purple/40 focus-within:shadow-[0_0_30px_rgba(123,104,238,0.1)] transition-all">
              <svg className="w-5 h-5 text-zinc-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about Helix OS..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-600 px-3 py-3 text-sm"
                disabled={isTyping}
              />
              <button type="submit" disabled={!input.trim() || isTyping}
                className="w-9 h-9 rounded-xl bg-helix-purple/80 hover:bg-helix-purple flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-helix-purple/80 cursor-pointer shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
              </button>
            </div>
            <p className="text-center text-[10px] text-zinc-700 mt-2">
              Responses generated from Helix OS documentation and source code · Not a live AI model
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
