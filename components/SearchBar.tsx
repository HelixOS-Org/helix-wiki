"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/helix-wiki/lib/i18n";

/* ═══════════════════════════════════════════════════════════════════════════════
   DEEP SEARCH INDEX
   Every searchable item: page, section, concept, API, type, code identifier.
   Each entry links to a specific heading anchor on its page.
   ═══════════════════════════════════════════════════════════════════════════════ */

interface SearchEntry {
  /** Display title */
  title: string;
  /** URL with anchor */
  href: string;
  /** Parent page name */
  page: string;
  /** Category for grouping */
  category: "page" | "section" | "api" | "concept" | "type" | "code";
  /** Icon */
  icon: string;
  /** One-line description */
  desc: string;
  /** All searchable text (lowercased at build time) */
  corpus: string;
}

function e(
  title: string,
  href: string,
  page: string,
  category: SearchEntry["category"],
  icon: string,
  desc: string,
  keywords: string[] = []
): SearchEntry {
  const corpus = [title, page, desc, ...keywords].join(" ").toLowerCase();
  return { title, href, page, category, icon, desc, corpus };
}

const index: SearchEntry[] = [
  /* ── Pages ── */
  e("Home", "/", "Home", "page", "🏠", "Overview of Helix OS — Systems Built To Evolve", ["overview", "introduction", "start", "helix"]),
  e("Architecture", "/docs/architecture", "Architecture", "page", "🏗️", "Layered kernel design, crate dependency graph, build system", ["architecture", "layers", "workspace", "cargo", "crates", "build", "toolchain"]),
  e("Core Kernel", "/docs/core", "Core", "page", "⚙️", "TCB orchestrator, syscalls, IPC, self-heal, hot-reload", ["core", "kernel", "tcb", "trusted computing base"]),
  e("HAL", "/docs/hal", "HAL", "page", "🔧", "Hardware Abstraction Layer — CPU, MMU, interrupts, KASLR", ["hal", "hardware", "abstraction", "layer"]),
  e("Subsystems", "/docs/subsystems", "Subsystems", "page", "🧩", "Memory, Execution, DIS Scheduler, Init boot phases", ["subsystem", "memory", "execution", "scheduler"]),
  e("Module System", "/docs/modules", "Modules", "page", "🔌", "Hot-swappable modules, ABI versioning, KernelModule trait", ["module", "plugin", "hot-swap", "abi"]),
  e("HelixFS", "/docs/filesystem", "HelixFS", "page", "💾", "CoW filesystem with journaling, B+Tree, ARC cache, snapshots", ["filesystem", "helixfs", "storage", "file"]),
  e("NEXUS", "/docs/nexus", "NEXUS", "page", "🧠", "AI intelligence — crash prediction, anomaly detection, quarantine", ["nexus", "ai", "intelligence", "machine learning"]),
  e("Lumina", "/docs/lumina", "Lumina", "page", "🎨", "Vulkan-class GPU API, render graphs, shader compilation", ["lumina", "graphics", "gpu", "vulkan"]),
  e("Donate", "/donate", "Donate", "page", "💖", "Support Helix OS development", ["donate", "sponsor", "support", "funding"]),
  e("Download", "/download", "Download", "page", "⬇️", "Download the bootable ISO — minimal profile", ["download", "iso", "qemu", "demo", "try"]),

  /* ── Architecture sections ── */
  e("Layer Stack", "/docs/architecture#layers", "Architecture", "section", "📐", "5-layer kernel architecture: HAL → Core → Subsystems → Modules → Userspace", ["layer", "stack", "separation", "ring", "privilege"]),
  e("Workspace Structure", "/docs/architecture#workspace", "Architecture", "section", "📁", "Cargo workspace layout — ~20 crates with strict dependency rules", ["workspace", "cargo", "crate", "directory", "folder", "structure"]),
  e("Crate Dependency Graph", "/docs/architecture#deps", "Architecture", "section", "🔗", "Inter-crate dependency visualization and rules", ["dependency", "graph", "crate", "depends"]),
  e("Project Metrics", "/docs/architecture#metrics", "Architecture", "section", "📊", "Lines of code, crate counts, binary sizes", ["metrics", "loc", "lines", "code", "size", "statistics"]),
  e("Build Profiles", "/docs/architecture#profiles", "Architecture", "section", "🎯", "helix.toml profile system — minimal, standard, full", ["profile", "toml", "minimal", "standard", "full", "build"]),
  e("Toolchain", "/docs/architecture#toolchain", "Architecture", "section", "🛠️", "Rust nightly toolchain, target triples, compiler flags", ["toolchain", "rust", "nightly", "target", "triple", "compiler"]),
  e("Linker Scripts", "/docs/architecture#linker", "Architecture", "section", "📜", "Custom linker scripts for kernel memory layout", ["linker", "script", "ld", "memory", "layout", "elf"]),
  e("Boot Sequence", "/docs/architecture#boot", "Architecture", "section", "🚀", "GRUB → Multiboot2 → kernel_main → init phases", ["boot", "sequence", "grub", "multiboot", "startup"]),
  e("Build Commands", "/docs/architecture#commands", "Architecture", "section", "💻", "cargo build, scripts/build.sh, QEMU launch", ["build", "command", "cargo", "qemu", "make"]),

  /* ── Core sections ── */
  e("Module Map", "/docs/core#map", "Core", "section", "🗺️", "Core crate file structure — 7 modules, strict separation of concerns", ["module", "map", "file", "structure", "organization"]),
  e("Kernel Types", "/docs/core#types", "Core", "type", "📦", "KernelError, KernelResult, SubsystemId, ModuleId, CapabilityId", ["kernel", "types", "error", "result", "subsystem", "id"]),
  e("KernelComponent Trait", "/docs/core#component", "Core", "api", "🔌", "Uniform lifecycle trait — init, start, stop, health, stats for every subsystem", ["kernel", "component", "trait", "lifecycle", "init", "health"]),
  e("Orchestrator", "/docs/core#orchestrator", "Core", "section", "🎼", "Subsystem lifecycle, dependency ordering, capability brokering", ["orchestrator", "lifecycle", "dependency", "subsystem"]),
  e("Lifecycle Manager", "/docs/core#orchestrator", "Core", "concept", "♻️", "Startup/shutdown ordering with dependency-aware scheduling", ["lifecycle", "manager", "startup", "shutdown", "ordering"]),
  e("Capability Broker", "/docs/core#orchestrator", "Core", "concept", "🔐", "Fine-grained access control with recursive revocation", ["capability", "broker", "access", "control", "permission", "revocation"]),
  e("Resource Broker", "/docs/core#orchestrator", "Core", "concept", "📊", "Resource allocation and accounting across subsystems", ["resource", "broker", "allocation"]),
  e("Syscall Framework", "/docs/core#syscalls", "Core", "api", "📞", "512-entry dispatch table, 6-arg convention, Linux errno semantics", ["syscall", "dispatch", "table", "handler", "errno", "convention"]),
  e("Hook System", "/docs/core#syscalls", "Core", "concept", "🪝", "Pre/post hooks for tracing, security auditing, profiling", ["hook", "pre", "post", "trace", "audit", "profiling"]),
  e("IPC", "/docs/core#ipc", "Core", "section", "📡", "Three lock-free IPC primitives — channels, event bus, message router", ["ipc", "inter-process", "communication", "message", "channel"]),
  e("Channels", "/docs/core#ipc", "Core", "api", "📨", "Bounded MPSC ring buffers — lock-free producer/consumer", ["channel", "mpsc", "ring", "buffer", "lock-free"]),
  e("Event Bus", "/docs/core#ipc", "Core", "api", "📢", "Pub/Sub with 8 priority levels and wildcard subscriptions", ["event", "bus", "pubsub", "subscribe", "publish", "priority"]),
  e("Message Router", "/docs/core#ipc", "Core", "api", "🔀", "Request/Response pattern with async routing", ["message", "router", "request", "response", "routing"]),
  e("Self-Heal", "/docs/core#selfheal", "Core", "section", "🏥", "Health monitoring, crash detection, automatic recovery", ["self-heal", "health", "monitor", "crash", "recovery", "restart"]),
  e("Hot-Reload", "/docs/core#hotreload", "Core", "section", "🔥", "Live module replacement — pause, export state, swap, import, activate", ["hot-reload", "live", "swap", "module", "replace", "state"]),
  e("Interrupts", "/docs/core#interrupts", "Core", "section", "⚡", "256-entry IDT with routing modes and exception handling", ["interrupt", "idt", "exception", "handler", "irq", "fault"]),
  e("Debug Console", "/docs/core#debug", "Core", "code", "🖨️", "serial_println! and framebuffer output macros", ["debug", "console", "serial", "print", "framebuffer", "output"]),
  e("Panic Handler", "/docs/core#panic", "Core", "code", "🚨", "Custom panic with configurable halt/reboot/dump behavior", ["panic", "handler", "halt", "reboot", "dump", "crash"]),

  /* ── HAL sections ── */
  e("Core HAL Trait", "/docs/hal#hal-trait", "HAL", "api", "🧬", "HardwareAbstraction trait — the contract every arch backend implements", ["hal", "trait", "hardware", "abstraction", "contract"]),
  e("CPU Abstraction", "/docs/hal#cpu", "HAL", "api", "🖥️", "Register access, feature detection (SSE/AVX/NEON), interrupt enable/disable", ["cpu", "register", "sse", "avx", "neon", "feature", "detection"]),
  e("MMU & Page Table", "/docs/hal#mmu", "HAL", "api", "📄", "4-level page tables, TLB management, identity mapping, virtual memory", ["mmu", "page", "table", "tlb", "virtual", "memory", "paging", "cr3"]),
  e("Interrupt Controller", "/docs/hal#interrupts", "HAL", "api", "⚡", "PIC/APIC/GIC abstraction — register, mask, acknowledge, EOI", ["interrupt", "controller", "pic", "apic", "gic", "irq", "eoi"]),
  e("Firmware Interface", "/docs/hal#firmware", "HAL", "api", "🔌", "ACPI/UEFI/Device Tree abstraction for hardware discovery", ["firmware", "acpi", "uefi", "device", "tree", "dtb"]),
  e("KASLR", "/docs/hal#kaslr", "HAL", "concept", "🎲", "Kernel Address Space Layout Randomization — entropy from RDRAND/TSC", ["kaslr", "randomization", "aslr", "address", "space", "layout", "security"]),
  e("ELF Relocation", "/docs/hal#relocation", "HAL", "concept", "🔀", "Dynamic ELF relocation for position-independent kernel", ["elf", "relocation", "pie", "position", "independent"]),
  e("Architecture Backends", "/docs/hal#backends", "HAL", "section", "🏗️", "x86_64, AArch64, RISC-V 64 implementations", ["x86", "x86_64", "aarch64", "arm", "riscv", "risc-v", "architecture", "backend"]),

  /* ── Subsystems sections ── */
  e("Memory Subsystem", "/docs/subsystems#memory", "Subsystems", "section", "🧠", "Physical frame allocator, virtual memory manager, heap allocator", ["memory", "allocator", "frame", "physical", "virtual", "heap", "bump"]),
  e("Execution Engine", "/docs/subsystems#execution", "Subsystems", "section", "▶️", "Thread creation, context switching, CPU-local storage", ["execution", "thread", "context", "switch", "cpu", "local"]),
  e("DIS Scheduler", "/docs/subsystems#dis", "Subsystems", "section", "📋", "Dynamic Intelligent Scheduling — pluggable scheduling policies", ["dis", "scheduler", "scheduling", "round-robin", "priority", "time-slice"]),
  e("Init Subsystem", "/docs/subsystems#init", "Subsystems", "section", "🏁", "5-phase boot: early → arch → core → sub → user", ["init", "boot", "phase", "startup", "initialization"]),
  e("Relocation Engine", "/docs/subsystems#relocation", "Subsystems", "section", "📍", "Runtime address relocation for KASLR-enabled kernel", ["relocation", "runtime", "address", "kaslr"]),
  e("Userspace Bridge", "/docs/subsystems#userspace", "Subsystems", "section", "👤", "Ring 3 transition, privilege separation, user/kernel boundary", ["userspace", "ring3", "privilege", "separation", "user", "bridge"]),
  e("Early Boot", "/docs/subsystems#earlyboot", "Subsystems", "section", "⚡", "Pre-heap, pre-allocator initialization — serial, GDT, IDT", ["early", "boot", "gdt", "idt", "serial", "pre-heap"]),

  /* ── Module System sections ── */
  e("Module Philosophy", "/docs/modules#philosophy", "Modules", "concept", "💡", "Mechanism not policy — kernel as an extensible framework", ["philosophy", "mechanism", "policy", "framework", "extensible"]),
  e("Module Types", "/docs/modules#types", "Modules", "type", "📦", "Static vs dynamic modules — compiled-in or runtime-loaded", ["module", "types", "static", "dynamic", "compiled", "runtime"]),
  e("Module Metadata", "/docs/modules#metadata", "Modules", "type", "🏷️", "Name, version, capabilities, dependencies, ABI version", ["metadata", "name", "version", "capability", "dependency", "abi"]),
  e("KernelModule Trait", "/docs/modules#trait", "Modules", "api", "🔌", "init, start, stop, status, export_state, import_state", ["kernel", "module", "trait", "init", "start", "stop", "export", "import"]),
  e("Module Registry", "/docs/modules#registry", "Modules", "api", "📚", "Registration, lookup, lifecycle management, dependency resolution", ["registry", "registration", "lookup", "lifecycle"]),
  e("define_module! Macro", "/docs/modules#macro", "Modules", "code", "🔧", "Declarative macro for zero-boilerplate module definition", ["define_module", "macro", "declarative", "boilerplate"]),
  e("Module Lifecycle", "/docs/modules#lifecycle", "Modules", "concept", "♻️", "Load → Init → Active → Pausing → Stopped → Unload", ["lifecycle", "load", "init", "active", "pausing", "stopped", "unload"]),
  e("Round-Robin Scheduler", "/docs/modules#example", "Modules", "code", "🔄", "Complete example module implementing the scheduler trait", ["round-robin", "scheduler", "example", "implementation"]),

  /* ── HelixFS sections ── */
  e("FS Constants", "/docs/filesystem#constants", "HelixFS", "type", "📐", "Block size 4096, magic 0x484C5846, max name 255, inode structure", ["constant", "block", "size", "magic", "name", "inode"]),
  e("On-Disk Layout", "/docs/filesystem#layout", "HelixFS", "section", "💿", "Superblock → bitmap → inode table → journal → data blocks", ["disk", "layout", "superblock", "bitmap", "inode", "journal"]),
  e("Inode Structure", "/docs/filesystem#inodes", "HelixFS", "type", "📋", "128-byte inodes with direct/indirect block pointers", ["inode", "structure", "pointer", "direct", "indirect", "block"]),
  e("POSIX File API", "/docs/filesystem#posix", "HelixFS", "api", "📂", "open, read, write, close, stat, mkdir, rmdir, unlink", ["posix", "file", "api", "open", "read", "write", "close", "stat", "mkdir"]),
  e("Copy-on-Write", "/docs/filesystem#cow", "HelixFS", "concept", "📝", "CoW blocks — write to new location, update inode, free old", ["cow", "copy-on-write", "block", "write", "snapshot"]),
  e("Journal", "/docs/filesystem#journal", "HelixFS", "section", "📓", "Write-ahead logging with transaction IDs and crash recovery", ["journal", "logging", "transaction", "crash", "recovery", "wal"]),
  e("B+Tree Index", "/docs/filesystem#btree", "HelixFS", "concept", "🌲", "Ordered key-value index with O(log n) lookup for directory entries", ["btree", "b+tree", "index", "key", "value", "lookup", "directory"]),
  e("ARC Cache", "/docs/filesystem#arc", "HelixFS", "concept", "⚡", "Adaptive Replacement Cache — better than LRU for mixed workloads", ["arc", "cache", "adaptive", "replacement", "lru", "eviction"]),

  /* ── NEXUS sections ── */
  e("NEXUS Architecture", "/docs/nexus#overview", "NEXUS", "section", "🧬", "812K lines of kernel intelligence across 9 subsystems", ["nexus", "architecture", "overview", "intelligence"]),
  e("NEXUS Modules", "/docs/nexus#modules", "NEXUS", "section", "📦", "Cognitive engine, resource optimizer, thermal manager, power governor", ["cognitive", "engine", "resource", "optimizer", "thermal", "power"]),
  e("ML Framework", "/docs/nexus#ml", "NEXUS", "section", "🤖", "Custom no_std ML — tensor ops, gradient descent, model inference", ["ml", "machine", "learning", "tensor", "gradient", "descent", "model", "inference"]),
  e("Crash Prediction", "/docs/nexus#prediction", "NEXUS", "concept", "🔮", "Predictive analysis using telemetry patterns to prevent failures", ["crash", "prediction", "predictive", "analysis", "telemetry", "failure"]),
  e("Anomaly Detection", "/docs/nexus#anomaly", "NEXUS", "concept", "🚨", "Statistical outlier detection on syscall patterns and memory usage", ["anomaly", "detection", "outlier", "statistical", "pattern"]),
  e("Quarantine System", "/docs/nexus#quarantine", "NEXUS", "concept", "🔒", "Isolate misbehaving modules — sandbox, rate-limit, kill, ban", ["quarantine", "isolate", "sandbox", "rate-limit", "ban"]),
  e("NEXUS Roadmap", "/docs/nexus#roadmap", "NEXUS", "section", "🗺️", "Development phases — v0.4 through v1.0 feature targets", ["roadmap", "development", "phase", "timeline", "feature"]),

  /* ── Lumina sections ── */
  e("Lumina Architecture", "/docs/lumina#overview", "Lumina", "section", "🏗️", "Vulkan-inspired GPU abstraction — 350K lines of graphics code", ["lumina", "architecture", "vulkan", "gpu", "graphics"]),
  e("Sub-Crate Inventory", "/docs/lumina#crates", "Lumina", "section", "📦", "8 graphics sub-crates — core, math, pipeline, shaders, magma", ["crate", "sub-crate", "inventory", "graphics"]),
  e("Handle System", "/docs/lumina#handles", "Lumina", "api", "🔑", "Type-safe GPU resource handles with generational indices", ["handle", "resource", "gpu", "type-safe", "generational", "index"]),
  e("Math Library", "/docs/lumina#math", "Lumina", "api", "📐", "Vec2/3/4, Mat4, Quaternion — SIMD-ready math for graphics", ["math", "vector", "matrix", "quaternion", "simd", "vec3", "mat4"]),
  e("Render Pipeline", "/docs/lumina#pipeline", "Lumina", "section", "🎯", "Builder pattern for GPU pipeline state — shaders, blending, depth", ["render", "pipeline", "builder", "shader", "blending", "depth"]),
  e("Render Graph", "/docs/lumina#rendergraph", "Lumina", "concept", "📊", "DAG-based render pass scheduling with automatic barrier insertion", ["render", "graph", "dag", "pass", "barrier", "scheduling"]),
  e("Shader Compilation", "/docs/lumina#shaders", "Lumina", "section", "🔧", "GLSL/HLSL → SPIR-V compilation pipeline with reflection", ["shader", "compilation", "glsl", "hlsl", "spirv", "spir-v", "reflection"]),
  e("Magma GPU Driver", "/docs/lumina#magma", "Lumina", "section", "🌋", "Low-level GPU driver abstraction — command buffers, queues", ["magma", "gpu", "driver", "command", "buffer", "queue"]),
  e("GPU Synchronization", "/docs/lumina#sync", "Lumina", "concept", "🔒", "Fences, semaphores, barriers — safe GPU/CPU synchronization", ["gpu", "synchronization", "fence", "semaphore", "barrier"]),
];

/* ═══════════════════════════════════════════════════════════════════════════════
   SEARCH ENGINE
   Multi-term fuzzy search with scoring: exact > prefix > includes > fuzzy
   ═══════════════════════════════════════════════════════════════════════════════ */

const CAT_LABELS: Record<SearchEntry["category"], string> = {
  page: "Page",
  section: "Section",
  api: "API",
  concept: "Concept",
  type: "Type",
  code: "Code",
};

const CAT_COLORS: Record<SearchEntry["category"], { bg: string; text: string; border: string }> = {
  page:    { bg: "bg-helix-blue/15",   text: "text-helix-blue",   border: "border-helix-blue/20" },
  section: { bg: "bg-zinc-500/10",     text: "text-zinc-400",     border: "border-zinc-500/20" },
  api:     { bg: "bg-green-500/10",    text: "text-green-400",    border: "border-green-500/20" },
  concept: { bg: "bg-helix-purple/15", text: "text-helix-purple", border: "border-helix-purple/20" },
  type:    { bg: "bg-amber-500/10",    text: "text-amber-400",    border: "border-amber-500/20" },
  code:    { bg: "bg-cyan-500/10",     text: "text-cyan-400",     border: "border-cyan-500/20" },
};

function scoreEntry(query: string, entry: SearchEntry): number {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return 0;

  let total = 0;

  for (const term of terms) {
    let best = 0;
    const t = entry.title.toLowerCase();
    const d = entry.desc.toLowerCase();

    // Exact title match
    if (t === term) best = 200;
    // Title starts with term
    else if (t.startsWith(term)) best = Math.max(best, 150);
    // Title word starts with term
    else if (t.split(/[\s—\-/]+/).some(w => w.startsWith(term))) best = Math.max(best, 120);
    // Title contains term
    else if (t.includes(term)) best = Math.max(best, 100);
    // Description contains
    if (d.includes(term)) best = Math.max(best, 70);
    // Corpus contains
    if (entry.corpus.includes(term)) best = Math.max(best, 50);

    // Character-level fuzzy on title
    if (best === 0) {
      let qi = 0, consecutive = 0, fScore = 0;
      for (let i = 0; i < t.length && qi < term.length; i++) {
        if (t[i] === term[qi]) { qi++; consecutive++; fScore += consecutive * 3; }
        else consecutive = 0;
      }
      if (qi === term.length) best = Math.max(best, Math.min(fScore, 40));
    }

    // If any term has zero match, penalize heavily
    if (best === 0) return 0;
    total += best;
  }

  // Bonus for page-level results
  if (entry.category === "page") total += 30;

  return total / terms.length;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HIGHLIGHT — bold the matching parts
   ═══════════════════════════════════════════════════════════════════════════════ */
function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const regex = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-helix-purple/30 text-white rounded-sm px-0.5">{part}</mark>
      : part
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useI18n();

  // Pages only (shown when no query)
  const pages = useMemo(() => index.filter(e => e.category === "page"), []);

  // Search results — deep search only when typing
  const results = useMemo(() => {
    if (!query.trim()) return pages;
    return index
      .map(entry => ({ entry, score: scoreEntry(query, entry) }))
      .filter(r => r.score > 15)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map(r => r.entry);
  }, [query, pages]);

  // Keyboard shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(p => !p); }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Lock body scroll + focus input
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // Reset search state when opening
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Scroll selected into view (only when navigating with keyboard)
  const isKeyNav = useRef(false);
  useEffect(() => {
    if (!isKeyNav.current) return;
    isKeyNav.current = false;
    const items = listRef.current?.querySelectorAll("[data-search-item]");
    if (items?.[selectedIndex]) {
      (items[selectedIndex] as HTMLElement).scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const navigate = useCallback((href: string, isDeep: boolean) => {
    setOpen(false);
    // For deep results (not main pages), append ?highlight=query to highlight text on page
    if (isDeep && query.trim()) {
      const sep = href.includes("?") ? "&" : "?";
      router.push(`${href}${sep}highlight=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(href);
    }
  }, [router, query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); isKeyNav.current = true; setSelectedIndex(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); isKeyNav.current = true; setSelectedIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && results[selectedIndex]) navigate(results[selectedIndex].href, results[selectedIndex].category !== "page");
  }

  const [isMac, setIsMac] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setIsMac(navigator.platform?.toLowerCase().includes("mac")); }, []);

  return (
    <>
      {/* ── Trigger Button ── */}
      <button
        onClick={() => setOpen(true)}
        className="group relative flex items-center gap-3 h-10 w-full max-w-xs
                   rounded-xl border border-zinc-700/80 bg-zinc-900/80 backdrop-blur-xl
                   px-3.5 text-sm text-zinc-400
                   transition-all duration-200
                   hover:border-helix-purple/40 hover:bg-zinc-800/90 hover:text-zinc-200
                   hover:shadow-[0_0_24px_rgba(123,104,238,0.12)]
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-purple/60
                   cursor-pointer"
      >
        <svg className="w-4 h-4 shrink-0 text-zinc-400 group-hover:text-helix-blue transition-colors duration-200"
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <span className="hidden sm:inline truncate">{t("search.placeholder")}</span>
        <span className="sm:hidden">{t("search.placeholder")}</span>
        <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5
                        rounded-md border border-zinc-600/80 bg-zinc-800/90
                        px-1.5 py-0.5 font-mono text-[10px] text-zinc-400
                        group-hover:border-zinc-500 group-hover:text-zinc-300
                        transition-all duration-200">
          {isMac ? "⌘" : "Ctrl"} K
        </kbd>
      </button>

      {/* ── Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[min(15vh,8rem)]"
          onClick={() => setOpen(false)}
          style={{ animation: "searchFadeIn 150ms ease-out" }}
        >
          {/* Backdrop — heavy dark overlay with strong blur */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" />

          {/* Palette */}
          <div
            onClick={e => e.stopPropagation()}
            className="relative w-[95vw] max-w-2xl rounded-2xl overflow-hidden
                       border border-zinc-700/60
                       bg-zinc-950 backdrop-blur-3xl
                       shadow-[0_0_80px_rgba(123,104,238,0.08),0_30px_60px_rgba(0,0,0,0.8)]"
            style={{ animation: "searchSlideUp 200ms ease-out" }}
          >
            {/* Animated border glow */}
            <div className="pointer-events-none absolute -inset-px rounded-2xl overflow-hidden">
              <div className="absolute inset-0 rounded-2xl opacity-50"
                style={{
                  background: "conic-gradient(from 180deg, transparent 60%, #4A90E220 70%, #7B68EE30 80%, #9B59B620 90%, transparent 100%)",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                  WebkitMaskComposite: "xor",
                  padding: "1px",
                  animation: "searchBorderSpin 4s linear infinite",
                }} />
            </div>

            {/* ── Input Row ── */}
            <div className="flex items-center gap-3 px-5 h-14 border-b border-zinc-800">
              <svg className="w-5 h-5 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder={t("search.placeholder")}
                className="flex-1 bg-transparent text-[15px] text-white placeholder:text-zinc-500
                           outline-none caret-helix-blue"
                spellCheck={false}
                autoComplete="off"
              />
              {query && (
                <button onClick={() => { setQuery(""); setSelectedIndex(0); inputRef.current?.focus(); }}
                  className="text-zinc-500 hover:text-white transition-colors p-1 rounded-md hover:bg-zinc-800">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="rounded-md border border-zinc-700 bg-zinc-800/80
                           px-2 py-0.5 font-mono text-[10px] text-zinc-400
                           hover:text-white hover:bg-zinc-700 transition-all cursor-pointer">
                ESC
              </button>
            </div>

            {/* ── Results ── */}
            <div ref={listRef} className="max-h-[min(55vh,26rem)] overflow-y-auto overscroll-contain py-2 px-2">
              {query.trim() && results.length === 0 ? (
                <div className="py-14 text-center">
                  <div className="text-3xl mb-3">🔍</div>
                  <p className="text-sm text-zinc-300">
                    No results for &ldquo;<span className="text-white font-semibold">{query}</span>&rdquo;
                  </p>
                  <p className="text-xs text-zinc-500 mt-1.5">Try different keywords</p>
                </div>
              ) : (
                <>
                  {query.trim() && (
                    <div className="px-3 py-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                        {results.length} result{results.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                  {!query.trim() && (
                    <div className="px-3 py-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                        Quick links
                      </span>
                    </div>
                  )}
                  {results.map((item, i) => (
                    <ResultItem key={item.href + item.title} item={item} index={i}
                      selected={i === selectedIndex} query={query}
                      onNavigate={navigate} onHover={setSelectedIndex} />
                  ))}    
                </>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center gap-5 px-5 h-10 border-t border-zinc-800 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1">
                <kbd className="inline-flex items-center justify-center w-5 h-5 rounded border border-zinc-700 bg-zinc-800/80 text-[10px] text-zinc-400">↑</kbd>
                <kbd className="inline-flex items-center justify-center w-5 h-5 rounded border border-zinc-700 bg-zinc-800/80 text-[10px] text-zinc-400">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex items-center justify-center w-5 h-5 rounded border border-zinc-700 bg-zinc-800/80 text-[10px] text-zinc-400">↵</kbd>
                Open
              </span>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex items-center justify-center px-1.5 h-5 rounded border border-zinc-700 bg-zinc-800/80 text-[10px] text-zinc-400">Esc</kbd>
                Close
              </span>
              <span className="ml-auto text-zinc-600 hidden sm:inline">
                Deep search across all docs
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Animations — injected once */}
      <SearchAnimations />
    </>
  );
}

/* ── Result Item Component ── */
function ResultItem({ item, index, selected, query, onNavigate, onHover }: {
  item: SearchEntry;
  index: number;
  selected: boolean;
  query: string;
  onNavigate: (href: string, isDeep: boolean) => void;
  onHover: (i: number) => void;
}) {
  const cat = CAT_COLORS[item.category];

  return (
    <button
      data-search-item
      onClick={() => onNavigate(item.href, item.category !== "page")}
      onMouseEnter={() => onHover(index)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-left transition-all duration-150 group/item cursor-pointer
                  ${selected
                    ? "bg-zinc-800/70 shadow-[inset_0_0_0_1px_rgba(123,104,238,0.25)]"
                    : "hover:bg-zinc-800/40"
                  }`}
    >
      {/* Icon */}
      <span className={`text-base w-9 h-9 flex items-center justify-center rounded-lg shrink-0
                        transition-all duration-200
                        ${selected
                          ? "bg-helix-purple/20 shadow-[0_0_16px_rgba(123,104,238,0.12)]"
                          : "bg-zinc-800/60"
                        }`}>
        {item.icon}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate transition-colors
                        ${selected ? "text-white" : "text-zinc-200"}`}>
          {highlightMatch(item.title, query)}
        </div>
        <div className={`text-xs truncate mt-0.5 leading-relaxed transition-colors
                        ${selected ? "text-zinc-400" : "text-zinc-500"}`}>
          {highlightMatch(item.desc, query)}
        </div>
      </div>

      {/* Category badge */}
      <span className={`hidden sm:inline-flex items-center shrink-0 rounded-md border px-2 py-0.5 text-[9px]
                        font-semibold uppercase tracking-wider transition-all
                        ${selected ? `${cat.bg} ${cat.text} ${cat.border}` : "bg-zinc-800/60 text-zinc-500 border-zinc-700/50"}`}>
        {CAT_LABELS[item.category]}
      </span>

      {/* Arrow */}
      <svg className={`w-4 h-4 shrink-0 transition-all duration-200
                      ${selected ? "text-helix-blue opacity-100 translate-x-0" : "text-zinc-600 opacity-0 -translate-x-1"}`}
        fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </button>
  );
}

/* ── Animation Styles (injected via useEffect to avoid jsx global) ── */
function SearchAnimations() {
  useEffect(() => {
    const id = "helix-search-animations";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes searchFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes searchSlideUp {
        from { opacity: 0; transform: translateY(12px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes searchBorderSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);
  return null;
}
