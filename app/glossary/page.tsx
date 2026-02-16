"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import HelixLogo from "@/helix-wiki/components/HelixLogo";
import Link from "next/link";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import glossaryContent from "@/helix-wiki/lib/docs-i18n/glossary";

/* ═══════════════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════════════ */
interface Term {
  term: string;
  definition: string;
  detail?: string;
  related?: string[];
  tag?: string;
}

interface Category {
  id: string; title: string; icon: string; color: string; sc: string; glyph: string;
  terms: Term[];
}

const CATEGORIES: Category[] = [
  {
    id: "arch", title: "Architecture", icon: "🏛️", color: "#7B68EE", sc: "123,104,238", glyph: "◆",
    terms: [
      { term: "Capability Broker", definition: "Manages & distributes capabilities (access-right tokens) to modules, ensuring each only accesses authorized resources.", detail: "Token-based access model: read, write, execute, manage. Capabilities are unforgeable, transferable, and revocable. Implemented in helix-core.", related: ["Capability", "Module", "Resource Broker"], tag: "security" },
      { term: "DIS (Differentiated Intent Scheduler)", definition: "Custom scheduler using intent classes instead of raw priorities. Tasks declare behavioral requirements and the scheduler optimizes accordingly.", detail: "5 classes: Realtime (EDF), System, Interactive (CFS-like), Batch (FIFO), Idle. Per-CPU runqueues, O(1) dispatch. ~8K LoC.", related: ["Intent", "Runqueue", "EDF", "Context Switch"], tag: "scheduler" },
      { term: "HAL (Hardware Abstraction Layer)", definition: "The helix-hal crate (~64K LoC) providing trait-based abstractions over CPU, MMU, interrupts, and firmware.", detail: "Supports x86_64, AArch64, RISC-V. Traits: CpuHal, MmuHal, InterruptHal, TimerHal, FirmwareHal. Platform-specific implementations behind #[cfg].", related: ["APIC", "GDT", "IDT"], tag: "core" },
      { term: "Helix Core", definition: "The helix-core crate containing IPC, orchestration, interrupt handling, syscall dispatch, and module management.", detail: "Central nervous system of the kernel. Manages: event bus (pub/sub, 9 topics), message router, module registry (max 256), panic handler, self-heal.", related: ["Orchestrator", "IPC", "Event Bus"], tag: "core" },
      { term: "Higher-Half Kernel", definition: "Kernel mapped above 0xFFFF_8000_0000_0000 on x86_64, leaving the lower half for user space.", detail: "HHDM (Higher-Half Direct Map) provides identity-like mapping offset by constant. Simplifies virtual↔physical address translation.", related: ["Higher-Half Offset", "Page Table", "HHDM Setup"], tag: "memory" },
      { term: "Hot-Reload", definition: "Replacing or updating kernel modules at runtime without rebooting, with automatic rollback on failure.", detail: "State transfer protocol: serialize old state → load new module → deserialize. Verification: checksum, ABI version, capability re-validation. ~3ms average swap time.", related: ["Module", "Orchestrator"], tag: "modules" },
      { term: "NEXUS", definition: "Kernel-integrated intelligence engine using 4 ML models for anomaly detection, crash prediction, and self-healing.", detail: "Models: Decision Tree (1200 nodes), Random Forest (50×24), Neural Network (3 layers, 128 neurons), SVM (RBF). Health monitoring at 100ms heartbeat. Level L2: Predictive.", related: ["Self-Healer", "Anomaly Detect"], tag: "ai" },
      { term: "Orchestrator", definition: "Manages module lifecycle, panic handling, and coordination between kernel subsystems.", related: ["Helix Core", "Module", "Hot-Reload"], tag: "core" },
      { term: "Resource Broker", definition: "Allocates system resources (memory, I/O ports, IRQs) to modules, preventing conflicts.", related: ["Capability Broker", "Module"], tag: "core" },
    ],
  },
  {
    id: "mem", title: "Memory", icon: "💾", color: "#4A90E2", sc: "74,144,226", glyph: "▣",
    terms: [
      { term: "Buddy Allocator", definition: "Divides memory into power-of-two blocks. Larger blocks split on allocation; buddy blocks merge when freed.", detail: "O(log n) alloc/free. Block sizes: 4 KiB → 4 MiB. Used for physical frame management alongside bitmap allocator.", related: ["Frame Allocator", "Slab Allocator"], tag: "allocator" },
      { term: "Copy-on-Write (CoW)", definition: "Shared pages only duplicated when written to — until then, processes share the same physical page.", detail: "Used by fork(), HelixFS snapshots, and shared library mappings. Triggered by page fault on write to read-only shared page.", related: ["Demand Paging", "Snapshot", "Frame"], tag: "optimization" },
      { term: "Demand Paging", definition: "Pages loaded only on first access, triggering a page fault that loads from disk or allocates a frame.", related: ["Page Table", "Frame Allocator"], tag: "paging" },
      { term: "Frame", definition: "A fixed-size (4 KiB) unit of physical memory, also called a page frame.", detail: "128 MB RAM = 31,744 frames. Tracked by bitmap + buddy allocator. Frame 0 reserved for null guard.", related: ["Frame Allocator", "Page Table"], tag: "unit" },
      { term: "Frame Allocator", definition: "Kernel component managing physical frames using bitmap + buddy allocators.", detail: "Two-phase: bitmap for boot-time (fast, simple), buddy for runtime (efficient merging). Tracks: free, used, reserved, kernel, DMA.", related: ["Frame", "Buddy Allocator"], tag: "allocator" },
      { term: "HHDM (Higher-Half Direct Map)", definition: "Maps all physical memory at offset 0xFFFF_8000_0000_0000, enabling direct physical access from kernel space.", detail: "phys_to_virt(addr) = addr + 0xFFFF_8000_0000_0000. No TLB flush needed for identity-mapped regions. Set up during early boot phase 1.", related: ["Higher-Half Kernel", "Page Table"], tag: "mapping" },
      { term: "Huge Page", definition: "Memory pages larger than 4 KiB (2 MiB or 1 GiB on x86_64). Reduces TLB pressure but increases fragmentation.", related: ["TLB", "Page Table"], tag: "paging" },
      { term: "Page Table", definition: "4-level hierarchy for virtual→physical translation: PML4 → PDP → PD → PT.", detail: "Each level: 512 entries × 8 bytes = 4 KiB. Total addressable: 256 TiB. Flags: Present, Writable, User, NX, Global, PAT.", related: ["CR3", "TLB", "Frame"], tag: "paging" },
      { term: "Slab Allocator", definition: "Optimized for frequently allocated fixed-size objects, pre-allocating object 'slabs' to reduce overhead.", detail: "Classes: 32, 64, 128, 256, 512, 1024, 2048, 4096 bytes. Per-CPU caches for lock-free fast path. Used for kernel heap.", related: ["Buddy Allocator", "Frame Allocator"], tag: "allocator" },
      { term: "TLB (Translation Lookaside Buffer)", definition: "CPU cache for virtual→physical translations. Must be flushed when page tables change.", detail: "L1 dTLB: 64 entries, L2 sTLB: 1536 entries (typical). invlpg flushes single entry; MOV CR3 flushes all non-global entries.", related: ["Page Table", "CR3", "Huge Page"], tag: "cache" },
    ],
  },
  {
    id: "sched", title: "Scheduling", icon: "⏱️", color: "#22D3EE", sc: "34,211,238", glyph: "◎",
    terms: [
      { term: "Batch Task", definition: "DIS task type for CPU-intensive work — larger time slices, may be delayed for interactive tasks.", related: ["DIS", "Quantum", "Intent"], tag: "class" },
      { term: "Context Switch", definition: "Saving one task's state and loading another's — registers, stack, IP, flags.", detail: "Helix context switch: save 15 GPRs + RFLAGS + RSP + RIP + FPU/SSE state (512 bytes via FXSAVE). ~1.2 μs average.", related: ["Task State", "Runqueue"], tag: "mechanism" },
      { term: "EDF (Earliest Deadline First)", definition: "Algorithm running the task with the closest deadline. Optimal for periodic realtime tasks when utilization ≤ 100%.", detail: "Helix EDF implementation: O(log n) using min-heap priority queue. Supports sporadic tasks with replenishment.", related: ["DIS", "Quantum", "Intent"], tag: "algorithm" },
      { term: "Intent", definition: "High-level description of task behavioral requirements: class, constraints, QoS parameters.", detail: "struct Intent { class: SchedClass, priority: u8, quantum_us: u64, deadline: Option<Instant>, cpu_affinity: CpuSet }", related: ["DIS", "Batch Task"], tag: "concept" },
      { term: "Priority Inversion", definition: "High-priority task waits for low-priority one preempted by medium-priority. DIS uses priority inheritance.", related: ["DIS", "Intent"], tag: "problem" },
      { term: "Quantum", definition: "Maximum continuous CPU time for a task before preemption (time slice).", detail: "Defaults: Realtime=1ms, Interactive=4ms, Batch=20ms, Idle=100ms. Adaptive: shrinks under contention.", related: ["DIS", "Context Switch"], tag: "concept" },
      { term: "Runqueue", definition: "Per-CPU queue of ready tasks. DIS maintains separate runqueues per scheduling class.", detail: "5 queues per CPU: RT (EDF heap), System (FIFO), Interactive (RB-tree), Batch (FIFO), Idle (single). Work stealing between CPUs.", related: ["DIS", "Task State"], tag: "structure" },
      { term: "Task State", definition: "Ready (in runqueue), Running (executing), Blocked (waiting), Suspended (paused), or Zombie (terminated).", related: ["Runqueue", "Context Switch"], tag: "concept" },
    ],
  },
  {
    id: "fs", title: "Filesystem", icon: "📁", color: "#22C55E", sc: "34,197,94", glyph: "⬡",
    terms: [
      { term: "ARC (Adaptive Replacement Cache)", definition: "Cache algorithm that balances between recency and frequency, outperforming LRU.", detail: "4 lists: T1 (recent), T2 (frequent), B1 (ghost recent), B2 (ghost frequent). HelixFS ARC: 16 MB default, adaptive.", related: ["B+Tree", "HelixFS"], tag: "cache" },
      { term: "B+Tree", definition: "Self-balancing tree used by HelixFS for directory indexing and extent management.", detail: "O(log n) search/insert/delete. Internal nodes: keys only. Leaf nodes: keys + values + sibling pointers. Fan-out: ~200 per 4KB node.", related: ["Inode", "Extent", "HelixFS"], tag: "structure" },
      { term: "Block", definition: "Basic unit of disk I/O, typically 4 KiB in HelixFS.", related: ["Extent", "Superblock"], tag: "unit" },
      { term: "Extent", definition: "Contiguous range of disk blocks representing file data (e.g., blocks 1000–1099).", detail: "struct Extent { start_block: u64, count: u32, flags: ExtentFlags }. Max extent: 4 GB (2^20 blocks). Inline data for files < 60 bytes.", related: ["B+Tree", "Inode"], tag: "structure" },
      { term: "HelixFS", definition: "Helix's native filesystem with B+tree indexing, journaling, CoW, compression, encryption, and snapshots.", detail: "On-disk format: 4KB superblock, bitmap allocator, inode table, B+tree directories, extent-based data. Max volume: 16 EiB. Max file: 16 TiB.", related: ["VFS", "Journal", "Snapshot"], tag: "filesystem" },
      { term: "Inode", definition: "Structure containing file metadata (size, permissions, timestamps) and storage info (extents or inline data).", detail: "128 bytes. Fields: mode, uid, gid, size, atime/mtime/ctime, nlink, extent_tree_root, flags, xattr_block.", related: ["Extent", "B+Tree"], tag: "structure" },
      { term: "Journal", definition: "WAL (Write-Ahead Log) of pending filesystem changes for crash recovery.", detail: "Modes: metadata-only (default), full data. Circular log with checkpoints. Recovery: replay committed transactions, discard incomplete.", related: ["HelixFS", "Superblock"], tag: "reliability" },
      { term: "Snapshot", definition: "Point-in-time copy of filesystem state using CoW for space efficiency.", related: ["CoW", "HelixFS"], tag: "feature" },
      { term: "Superblock", definition: "Root metadata: magic number, version, config, root inode, allocation state.", detail: "Magic: 0x48454C58 ('HELX'). Checksum: CRC32C. Backup copies at blocks 1 and N-1.", related: ["HelixFS", "Inode"], tag: "structure" },
      { term: "VFS (Virtual File System)", definition: "Abstraction layer providing a uniform interface across different filesystem implementations.", related: ["HelixFS"], tag: "abstraction" },
    ],
  },
  {
    id: "hw", title: "Hardware", icon: "🔧", color: "#F59E0B", sc: "245,158,11", glyph: "⚙",
    terms: [
      { term: "ACPI", definition: "Advanced Configuration and Power Interface — hardware discovery, power management, thermal control.", detail: "Tables: RSDP → RSDT/XSDT → MADT (APIC), FADT (power), HPET (timers), MCFG (PCIe). Parsed during early boot.", related: ["APIC", "HPET"], tag: "firmware" },
      { term: "APIC", definition: "Advanced Programmable Interrupt Controller — Local APIC (per-CPU) + I/O APIC (device IRQs).", detail: "Local APIC at 0xFEE00000: timer, IPI, error. I/O APIC at 0xFEC00000: 24 redirection entries. x2APIC via MSR for >255 CPUs.", related: ["IDT", "MSI", "IRQ"], tag: "interrupt" },
      { term: "CR3", definition: "x86 control register holding the PML4 physical address. Writing CR3 switches address spaces.", detail: "Bits 12-51: PML4 physical address (4KB aligned). PCID (bits 0-11) for TLB tagging. MOV CR3 flushes non-global TLB entries.", related: ["Page Table", "TLB"], tag: "register" },
      { term: "GDT (Global Descriptor Table)", definition: "x86 structure defining memory segments. In 64-bit mode: privilege transitions and TSS.", detail: "Entries: null, kernel code (0x08), kernel data (0x10), user data (0x1B), user code (0x23), TSS (0x28). Loaded via LGDT.", related: ["TSS", "IDT", "Ring"], tag: "table" },
      { term: "HPET (High Precision Event Timer)", definition: "Precision timer providing at least one periodic/one-shot timer with ≥10 MHz frequency.", detail: "MMIO at 0xFED00000. Helix uses Timer 0 for kernel tick (1 kHz). Fallback: PIT 8254 (1.193 MHz).", related: ["ACPI", "APIC"], tag: "timer" },
      { term: "IDT (Interrupt Descriptor Table)", definition: "Maps 256 interrupt vectors to handler functions.", detail: "Entries 0-31: CPU exceptions (DE, DB, NMI, BP, ..., XF). 32-255: device IRQs and software interrupts. Loaded via LIDT.", related: ["APIC", "GDT", "IST"], tag: "table" },
      { term: "IST (Interrupt Stack Table)", definition: "x86_64 feature for switching to dedicated stacks on specific exceptions.", detail: "7 IST entries in TSS. Helix uses IST1 for double fault, IST2 for NMI, IST3 for machine check.", related: ["TSS", "IDT"], tag: "stack" },
      { term: "MSI (Message Signaled Interrupts)", definition: "Modern interrupt delivery via memory writes instead of interrupt lines.", detail: "MSI: 32 vectors per device. MSI-X: 2048 vectors, per-vector masking. Preferred over legacy IRQ for PCIe.", related: ["APIC", "IRQ"], tag: "interrupt" },
      { term: "TSS (Task State Segment)", definition: "Contains interrupt stack pointers (RSP0-2, IST1-7). Required even in 64-bit mode.", detail: "104 bytes. RSP0: kernel stack for Ring 3→0 transitions. I/O permission bitmap optional (64 KB).", related: ["GDT", "IST", "Ring"], tag: "structure" },
    ],
  },
  {
    id: "ipc", title: "IPC & Boot", icon: "🔗", color: "#A78BFA", sc: "167,139,250", glyph: "⇌",
    terms: [
      { term: "Channel", definition: "Typed, unidirectional IPC link between two endpoints, supporting sync and async messaging.", detail: "Bounded (backpressure) or unbounded. Zero-copy for large messages via shared memory. Type-safe: Channel<T> where T: Serialize.", related: ["Event Bus", "IPC Router"], tag: "mechanism" },
      { term: "Event Bus", definition: "Pub/sub system for decoupled communication — producers publish, subscribers receive matching events.", detail: "9 topics, 4 priority levels (Critical, High, Normal, Low). Async delivery with configurable queue depth. ~200ns publish latency.", related: ["Channel", "Helix Core"], tag: "mechanism" },
      { term: "IPC Router", definition: "Routes messages between kernel components based on topic and destination.", related: ["Channel", "Event Bus"], tag: "mechanism" },
      { term: "Multiboot2", definition: "Boot protocol defining how bootloaders pass information (memory map, cmdline, modules) to kernels.", detail: "Tag-based: each info block has type + size. Helix parses: memory map, framebuffer, RSDP, SMBIOS, ELF symbols, cmdline.", related: ["GRUB", "Kernel Entry"], tag: "boot" },
      { term: "Limine", definition: "Modern boot protocol with 18 request types, multi-architecture support, and HHDM.", detail: "6,500 LoC in Helix. Requests: bootloader info, memory map, HHDM, SMP, framebuffer, modules, RSDP, SMBIOS, kernel address.", related: ["Multiboot2", "HHDM"], tag: "boot" },
      { term: "GRUB", definition: "GRand Unified Bootloader — loads the Helix kernel image and passes Multiboot2 info.", related: ["Multiboot2", "Kernel Entry"], tag: "boot" },
      { term: "Kernel Entry", definition: "First Rust function (kernel_main) called after 32→64 bit assembly trampoline.", detail: "Receives: Multiboot2 info pointer or Limine requests. Sets up: serial, memory map, frame allocator, HHDM, page tables, GDT, IDT.", related: ["Multiboot2", "Limine"], tag: "boot" },
      { term: "KASLR", definition: "Kernel Address Space Layout Randomization — randomizes kernel load address for security.", detail: "Entropy: RDSEED/RDRAND/TSC. Alignment: 2 MB. Window: 1 GB. Applied during relocation phase. ~23K LoC subsystem.", related: ["Higher-Half Kernel", "Page Table"], tag: "security" },
    ],
  },
  {
    id: "sec", title: "Security", icon: "🛡️", color: "#EF4444", sc: "239,68,68", glyph: "🔒",
    terms: [
      { term: "Capability", definition: "Transferable token representing the right to perform specific operations. More flexible than permission bits.", detail: "Types: Read, Write, Execute, Manage, Grant, Revoke. Inheritance: explicit grant only. Stored per-module in capability table.", related: ["Capability Broker", "Ring"], tag: "model" },
      { term: "Ring", definition: "x86 privilege level (0–3). Kernel = Ring 0; user space = Ring 3.", detail: "Ring transitions: syscall/sysret (fast), int/iret (legacy). Ring 0: full hardware access. Ring 3: restricted, traps on privileged instructions.", related: ["SMEP", "SMAP", "TSS"], tag: "privilege" },
      { term: "SMEP", definition: "Supervisor Mode Execution Prevention — prevents Ring 0 from executing user-space code.", detail: "Set via CR4 bit 20. Prevents ret2user attacks. Violation triggers #PF with SMEP flag.", related: ["SMAP", "Ring"], tag: "cpu-feature" },
      { term: "SMAP", definition: "Supervisor Mode Access Prevention — prevents Ring 0 from reading/writing user-space pages.", detail: "Set via CR4 bit 21. Temporarily disabled via STAC/CLAC for explicit user-space access in syscall handlers.", related: ["SMEP", "Ring"], tag: "cpu-feature" },
      { term: "Secure Boot", definition: "UEFI feature verifying kernel image signatures before execution.", detail: "Helix UEFI stack: SHA-256 + RSA signature verification. Certificate chain validation. TPM 2.0 PCR measurements.", related: ["KASLR"], tag: "boot-security" },
    ],
  },
  {
    id: "rust", title: "Rust / Kernel Dev", icon: "🦀", color: "#FF6B35", sc: "255,107,53", glyph: "λ",
    terms: [
      { term: "#![no_std]", definition: "Crate attribute for code running without the Rust standard library. Required for kernel development.", detail: "No heap, no threads, no I/O by default. Use core:: for basics, alloc:: for heap types after setting up #[global_allocator].", related: ["Alloc Crate", "Global Allocator"], tag: "attribute" },
      { term: "Alloc Crate", definition: "Provides heap types (Box, Vec, String, Arc, Rc) without the full std library.", related: ["#![no_std]", "Global Allocator"], tag: "crate" },
      { term: "Global Allocator", definition: "Memory allocator used by alloc crate. Helix provides a custom #[global_allocator] (slab-based).", detail: "#[global_allocator] static ALLOC: HelixAllocator = HelixAllocator::new(); — wraps slab allocator with fallback to buddy for large allocs.", related: ["Slab Allocator", "#![no_std]"], tag: "allocator" },
      { term: "Never Type (!)", definition: "Type for computations that never complete (infinite loops, panics). Used for kernel entry point.", detail: "fn kernel_main() -> ! { /* ... */ loop {} } — tells compiler this function diverges.", related: ["#![no_std]"], tag: "type" },
      { term: "Unsafe", definition: "Keyword marking code the compiler cannot verify for memory safety. Required for hardware access.", detail: "Helix unsafe usage: MMIO register access, inline asm (in!/out!), raw pointer deref for page tables, FFI boundaries. Minimized via safe wrappers.", related: ["#![no_std]"], tag: "keyword" },
      { term: "Inline Assembly", definition: "Rust's core::arch::asm! macro for embedding CPU instructions directly in Rust code.", detail: "Used for: port I/O (in/out), special registers (rdmsr/wrmsr), TLB flush (invlpg), halt (hlt), enable/disable interrupts (sti/cli).", related: ["Unsafe"], tag: "feature" },
    ],
  },
];

const ABBREVIATIONS = [
  { a: "ACPI", f: "Advanced Configuration and Power Interface" },
  { a: "APIC", f: "Advanced Programmable Interrupt Controller" },
  { a: "ARC", f: "Adaptive Replacement Cache" },
  { a: "CoW", f: "Copy-on-Write" },
  { a: "DIS", f: "Differentiated Intent Scheduler" },
  { a: "EDF", f: "Earliest Deadline First" },
  { a: "GDT", f: "Global Descriptor Table" },
  { a: "HAL", f: "Hardware Abstraction Layer" },
  { a: "HHDM", f: "Higher-Half Direct Map" },
  { a: "HPET", f: "High Precision Event Timer" },
  { a: "IDT", f: "Interrupt Descriptor Table" },
  { a: "IPC", f: "Inter-Process Communication" },
  { a: "IRQ", f: "Interrupt Request" },
  { a: "IST", f: "Interrupt Stack Table" },
  { a: "KASLR", f: "Kernel Address Space Layout Randomization" },
  { a: "MMU", f: "Memory Management Unit" },
  { a: "MSI", f: "Message Signaled Interrupts" },
  { a: "NMI", f: "Non-Maskable Interrupt" },
  { a: "PML4", f: "Page Map Level 4" },
  { a: "QEMU", f: "Quick EMUlator" },
  { a: "RDTSC", f: "Read Time-Stamp Counter" },
  { a: "SMAP", f: "Supervisor Mode Access Prevention" },
  { a: "SMEP", f: "Supervisor Mode Execution Prevention" },
  { a: "SMP", f: "Symmetric Multi-Processing" },
  { a: "TLB", f: "Translation Lookaside Buffer" },
  { a: "TSS", f: "Task State Segment" },
  { a: "VFS", f: "Virtual File System" },
  { a: "WAL", f: "Write-Ahead Log" },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   NEURAL NET CANVAS — Background with interconnected knowledge nodes
   ═══════════════════════════════════════════════════════════════════════════════ */
function NeuralCanvas({ activeCategory }: { activeCategory: string }) {
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

    const catIdx = CATEGORIES.findIndex(c => c.id === activeCategory);
    const rgb = catIdx >= 0 ? CATEGORIES[catIdx].sc.split(",").map(Number) : [123, 104, 238];

    interface Node { x: number; y: number; r: number; vx: number; vy: number; cat: number; pulse: number }
    const count = Math.min(Math.floor(W * H / 18000), 120);
    const nodes: Node[] = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 0.5 + Math.random() * 1.5, vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15,
        cat: Math.floor(Math.random() * CATEGORIES.length), pulse: Math.random() * Math.PI * 2,
      });
    }

    let t = 0;
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, W, H);
      t++;
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }
      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d > 100) continue;
          const same = nodes[i].cat === nodes[j].cat;
          const active = nodes[i].cat === catIdx || nodes[j].cat === catIdx;
          const a = (1 - d / 100) * (active ? 0.06 : same ? 0.015 : 0.005);
          ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = active ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})` : `rgba(100,100,120,${a})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      // Nodes
      for (const n of nodes) {
        const pulse = Math.sin(t * 0.02 + n.pulse) * 0.5 + 0.5;
        const active = n.cat === catIdx;
        const crgb = CATEGORIES[n.cat]?.sc.split(",").map(Number) || [100, 100, 100];
        const a = active ? 0.3 + pulse * 0.4 : 0.05 + pulse * 0.05;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (active ? 1 + pulse * 0.4 : 1), 0, Math.PI * 2);
        ctx.fillStyle = active ? `rgba(${crgb[0]},${crgb[1]},${crgb[2]},${a})` : `rgba(80,80,90,${a})`;
        ctx.fill();
        if (active && n.r > 1) {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${crgb[0]},${crgb[1]},${crgb[2]},${a * 0.06})`; ctx.fill();
        }
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [activeCategory]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   TERM CARD — Expandable definition with details, related terms, tags
   ═══════════════════════════════════════════════════════════════════════════════ */
function TermCard({ term, color, expanded, onToggle, onNavigate, highlight }: {
  term: Term; color: string; expanded: boolean; onToggle: () => void; onNavigate: (t: string) => void; highlight: string;
}) {
  const hlt = useCallback((text: string) => {
    if (!highlight) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((p, i) => regex.test(p) ? <mark key={i} className="bg-yellow-500/20 text-yellow-300 rounded px-0.5">{p}</mark> : p);
  }, [highlight]);

  return (
    <div className={`group rounded-2xl border overflow-hidden transition-all duration-500 ${expanded ? "shadow-xl" : "hover:shadow-lg"}`}
      style={{
        borderColor: expanded ? `${color}35` : "rgba(63,63,70,0.12)",
        background: expanded ? `linear-gradient(135deg, ${color}05, transparent)` : "rgba(12,12,14,0.5)",
        boxShadow: expanded ? `0 0 40px ${color}08` : "",
      }}>
      <button onClick={onToggle} className="w-full px-5 py-4 text-left flex items-start gap-3 cursor-pointer group/btn">
        {/* Indicator dot */}
        <div className="mt-1.5 shrink-0">
          <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${expanded ? "scale-125" : "group-hover/btn:scale-110"}`}
            style={{ background: expanded ? color : `${color}40`, boxShadow: expanded ? `0 0 8px ${color}50` : "none" }} />
        </div>
        <div className="flex-1 min-w-0">
          <dt className="font-bold text-[15px] transition-colors duration-300" style={{ color: expanded ? color : "white" }}>{hlt(term.term)}</dt>
          <dd className="text-sm text-zinc-400 mt-1 leading-relaxed">{hlt(term.definition)}</dd>
        </div>
        <svg className={`w-4 h-4 text-zinc-600 shrink-0 mt-1.5 transition-transform duration-300 ${expanded ? "rotate-180 text-zinc-400" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {/* Expanded content */}
      <div className={`overflow-hidden transition-all duration-500 ${expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-5 pb-5 ml-5 border-t border-zinc-800/30 pt-4 space-y-3">
          {term.detail && <p className="text-xs text-zinc-400 leading-relaxed font-mono bg-zinc-900/40 rounded-xl px-4 py-3 border border-zinc-800/20">{term.detail}</p>}
          {term.related && term.related.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-wider">Related:</span>
              {term.related.map(r => (
                <button key={r} onClick={(e) => { e.stopPropagation(); onNavigate(r); }}
                  className="text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer hover:scale-105"
                  style={{ color, borderColor: `${color}25`, background: `${color}08` }}>
                  {r}
                </button>
              ))}
            </div>
          )}
          {term.tag && (
            <span className="inline-block text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-800/40 text-zinc-600">#{term.tag}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function GlossaryPage() {
  const { locale } = useI18n();
  const s = (k: string) => getDocString(glossaryContent, locale, k);

  const [activeCat, setActiveCat] = useState("arch");
  const [search, setSearch] = useState("");
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"categories" | "all" | "abbrev">("categories");
  const searchRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "Escape") { setSearch(""); searchRef.current?.blur(); }
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);

  const totalTerms = CATEGORIES.reduce((s, c) => s + c.terms.length, 0);

  // Flatten all terms for search
  const allTerms = useMemo(() => CATEGORIES.flatMap(c => c.terms.map(t => ({ ...t, catId: c.id, catTitle: c.title, catColor: c.color, catIcon: c.icon }))), []);

  // Filtered terms
  const filtered = useMemo(() => {
    if (!search.trim()) return allTerms;
    const q = search.toLowerCase();
    return allTerms.filter(t =>
      t.term.toLowerCase().includes(q) ||
      t.definition.toLowerCase().includes(q) ||
      (t.detail && t.detail.toLowerCase().includes(q)) ||
      (t.tag && t.tag.toLowerCase().includes(q)) ||
      (t.related && t.related.some(r => r.toLowerCase().includes(q)))
    );
  }, [search, allTerms]);

  const toggleTerm = useCallback((key: string) => {
    setExpandedTerms(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }, []);

  const navigateToTerm = useCallback((termName: string) => {
    const found = allTerms.find(t => t.term.toLowerCase() === termName.toLowerCase());
    if (found) {
      setSearch(""); setActiveCat(found.catId); setView("categories");
      setExpandedTerms(new Set([`${found.catId}-${found.term}`]));
      setTimeout(() => {
        const el = document.getElementById(`term-${found.term.replace(/[^a-zA-Z0-9]/g, "-")}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } else {
      setSearch(termName);
    }
  }, [allTerms]);

  const expandAll = useCallback(() => {
    const cat = CATEGORIES.find(c => c.id === activeCat);
    if (!cat) return;
    const all = new Set(cat.terms.map(t => `${cat.id}-${t.term}`));
    setExpandedTerms(prev => {
      const allExpanded = cat.terms.every(t => prev.has(`${cat.id}-${t.term}`));
      return allExpanded ? new Set() : all;
    });
  }, [activeCat]);

  const activeCatData = CATEGORIES.find(c => c.id === activeCat);

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-helix-purple/40">
      <NeuralCanvas activeCategory={activeCat} />

      <style>{`
        @keyframes fsi{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes pulse-ring{0%{transform:scale(0.8);opacity:0.5}100%{transform:scale(1.4);opacity:0}}
        @keyframes glow{0%,100%{opacity:0.4}50%{opacity:0.8}}
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
      `}</style>

      <main className="relative z-10">
        {/* ── HERO ── */}
        <div className="pt-28 pb-12 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-8 inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              {s("back_home")}
            </Link>

            <div className="flex items-center justify-center gap-3 mb-6">
              <HelixLogo className="w-10 h-10" />
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-helix-purple/10 border border-helix-purple/20 text-helix-purple text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-helix-purple animate-pulse" />
                {s("badge")} · {totalTerms} {s("terms")}
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-5">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-helix-blue via-helix-purple to-pink-500">{s("title")}</span>
            </h1>
            <p className="text-base md:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-10">
              {s("subtitle")}
              <span className="text-zinc-600"> Searchable, cross-referenced, and deeply detailed.</span>
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto relative">
              <div className="relative group">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-helix-purple transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={s("search_placeholder")}
                  className="w-full pl-12 pr-20 py-4 rounded-2xl bg-[#0c0c0e] border border-zinc-800/60 text-white text-sm placeholder-zinc-600 outline-none focus:border-helix-purple/40 focus:ring-2 focus:ring-helix-purple/10 transition-all" />
                <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded-lg bg-zinc-800/60 border border-zinc-700/40 text-[10px] font-mono text-zinc-500">
                  ⌘K
                </kbd>
              </div>
              {search && (
                <div className="absolute left-0 right-0 mt-2 text-left">
                  <span className="text-[11px] text-zinc-600 font-mono">{filtered.length} result{filtered.length !== 1 ? "s" : ""} for &quot;{search}&quot;</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── CATEGORY STATS ── */}
        <div className="max-w-6xl mx-auto px-6 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {CATEGORIES.map((c, i) => (
              <button key={c.id} onClick={() => { setActiveCat(c.id); setView("categories"); setSearch(""); }}
                className={`group relative p-3 rounded-xl border text-center transition-all duration-500 cursor-pointer hover:scale-[1.03] ${activeCat === c.id && !search ? "scale-[1.03]" : ""}`}
                style={{
                  borderColor: activeCat === c.id && !search ? `${c.color}40` : "rgba(63,63,70,0.12)",
                  background: activeCat === c.id && !search ? `${c.color}08` : "rgba(12,12,14,0.5)",
                  boxShadow: activeCat === c.id && !search ? `0 0 20px ${c.color}10` : "",
                  animation: `fsi 0.3s ease ${i * 0.04}s both`,
                }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" style={{ background: `radial-gradient(circle, ${c.color}08, transparent 70%)` }} />
                <span className="text-lg relative">{c.icon}</span>
                <p className="text-[10px] font-bold text-white mt-1 relative truncate">{c.title}</p>
                <p className="text-[9px] font-mono relative" style={{ color: c.color }}>{c.terms.length}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── VIEW TABS ── */}
        <div className="max-w-5xl mx-auto px-6 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-zinc-900/60 border border-zinc-800/40 rounded-xl overflow-hidden">
              {(["categories", "all", "abbrev"] as const).map(v => (
                <button key={v} onClick={() => { setView(v); setSearch(""); }}
                  className={`px-4 py-2 text-[11px] font-bold transition-all cursor-pointer ${view === v ? "bg-helix-purple/15 text-helix-purple" : "text-zinc-600 hover:text-white"}`}>
                  {v === "categories" ? s("categories") : v === "all" ? s("all_terms") : s("abbreviations")}
                </button>
              ))}
            </div>
            {view === "categories" && !search && (
              <button onClick={expandAll} className="ml-auto text-[10px] font-bold text-zinc-600 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800/30 hover:border-zinc-700/40 transition-all cursor-pointer">
                Toggle All
              </button>
            )}
            {search && (
              <button onClick={() => setSearch("")} className="ml-auto text-[10px] font-bold text-zinc-600 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800/30 hover:border-zinc-700/40 transition-all cursor-pointer flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Clear search
              </button>
            )}
          </div>
        </div>

        {/* ── SEARCH RESULTS ── */}
        {search && (
          <div className="max-w-5xl mx-auto px-6 pb-16">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-4xl mb-4 block">🔍</span>
                <p className="text-zinc-500">No terms matching &quot;{search}&quot;</p>
                <p className="text-zinc-700 text-xs mt-1">Try a different keyword or browse by category</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(t => (
                  <div key={`${t.catId}-${t.term}`} id={`term-${t.term.replace(/[^a-zA-Z0-9]/g, "-")}`}
                    style={{ animation: "fsi 0.25s ease" }}>
                    <div className="flex items-center gap-2 mb-0.5 ml-5">
                      <span className="text-[9px]">{t.catIcon}</span>
                      <span className="text-[9px] font-mono text-zinc-700">{t.catTitle}</span>
                    </div>
                    <TermCard term={t} color={t.catColor} expanded={expandedTerms.has(`${t.catId}-${t.term}`)}
                      onToggle={() => toggleTerm(`${t.catId}-${t.term}`)} onNavigate={navigateToTerm} highlight={search} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CATEGORY VIEW ── */}
        {!search && view === "categories" && activeCatData && (
          <div className="max-w-5xl mx-auto px-6 pb-16" style={{ animation: "fsi 0.3s ease" }}>
            {/* Category header */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-zinc-800/30">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: `${activeCatData.color}10`, border: `1px solid ${activeCatData.color}25` }}>
                {activeCatData.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white">{activeCatData.title}</h2>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg" style={{ color: activeCatData.color, background: `${activeCatData.color}12` }}>
                    {activeCatData.glyph} {activeCatData.terms.length} terms
                  </span>
                </div>
                <p className="text-sm text-zinc-500 mt-0.5">Click any term to reveal details, related terms, and internal documentation.</p>
              </div>
            </div>

            {/* Term list */}
            <div className="space-y-2">
              {activeCatData.terms.map((t, i) => (
                <div key={`${activeCatData.id}-${t.term}`} id={`term-${t.term.replace(/[^a-zA-Z0-9]/g, "-")}`}
                  style={{ animation: `fsi 0.25s ease ${i * 0.03}s both` }}>
                  <TermCard term={t} color={activeCatData.color}
                    expanded={expandedTerms.has(`${activeCatData.id}-${t.term}`)}
                    onToggle={() => toggleTerm(`${activeCatData.id}-${t.term}`)}
                    onNavigate={navigateToTerm} highlight="" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ALL TERMS VIEW ── */}
        {!search && view === "all" && (
          <div className="max-w-5xl mx-auto px-6 pb-16" style={{ animation: "fsi 0.3s ease" }}>
            <p className="text-sm text-zinc-600 mb-6 font-mono">{totalTerms} terms across {CATEGORIES.length} categories — alphabetical order</p>
            <div className="space-y-2">
              {[...allTerms].sort((a, b) => a.term.localeCompare(b.term)).map((t, i) => (
                <div key={`${t.catId}-${t.term}`} id={`term-${t.term.replace(/[^a-zA-Z0-9]/g, "-")}`}
                  style={{ animation: `fsi 0.2s ease ${Math.min(i * 0.015, 0.5)}s both` }}>
                  <div className="flex items-center gap-2 mb-0.5 ml-5">
                    <span className="text-[9px]">{t.catIcon}</span>
                    <span className="text-[9px] font-mono text-zinc-700">{t.catTitle}</span>
                  </div>
                  <TermCard term={t} color={t.catColor} expanded={expandedTerms.has(`${t.catId}-${t.term}`)}
                    onToggle={() => toggleTerm(`${t.catId}-${t.term}`)} onNavigate={navigateToTerm} highlight="" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ABBREVIATIONS ── */}
        {!search && view === "abbrev" && (
          <div className="max-w-4xl mx-auto px-6 pb-16" style={{ animation: "fsi 0.3s ease" }}>
            <p className="text-sm text-zinc-600 mb-6 font-mono">{ABBREVIATIONS.length} abbreviations</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ABBREVIATIONS.map((ab, i) => (
                <div key={ab.a} className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-800/20 bg-[#0c0c0e] hover:border-zinc-700/30 hover:bg-zinc-900/40 transition-all cursor-default"
                  style={{ animation: `fsi 0.2s ease ${Math.min(i * 0.02, 0.5)}s both` }}>
                  <span className="font-mono font-black text-helix-purple text-sm w-14 text-right shrink-0">{ab.a}</span>
                  <div className="w-px h-5 bg-zinc-800/40" />
                  <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">{ab.f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── KNOWLEDGE MAP ── */}
        {!search && (
          <div className="max-w-5xl mx-auto px-6 pb-16">
            <div className="rounded-3xl border border-zinc-800/30 bg-[#0c0c0e] overflow-hidden">
              <div className="p-8 text-center border-b border-zinc-800/20">
                <span className="text-xs font-mono text-zinc-600 tracking-widest uppercase">Knowledge Map</span>
                <h2 className="text-2xl font-black text-white mt-2">Term Connections</h2>
                <p className="text-sm text-zinc-500 mt-1">How Helix OS concepts relate to each other</p>
              </div>
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {CATEGORIES.map((c, i) => {
                    const relCount = c.terms.reduce((s, t) => s + (t.related?.length || 0), 0);
                    return (
                      <div key={c.id} className="group p-4 rounded-xl border border-zinc-800/20 hover:border-zinc-700/30 transition-all cursor-pointer text-center"
                        onClick={() => { setActiveCat(c.id); setView("categories"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        style={{ animation: `fsi 0.3s ease ${i * 0.05}s both` }}>
                        <span className="text-2xl block mb-2">{c.icon}</span>
                        <p className="text-xs font-bold text-white">{c.title}</p>
                        <p className="text-[10px] font-mono mt-1" style={{ color: c.color }}>{c.terms.length} terms · {relCount} links</p>
                        <div className="mt-2 flex justify-center gap-0.5">
                          {c.terms.slice(0, 5).map((_, j) => (
                            <div key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: c.color, opacity: 0.3 + j * 0.14 }} />
                          ))}
                          {c.terms.length > 5 && <span className="text-[7px] text-zinc-700 ml-0.5">+{c.terms.length - 5}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <div className="rounded-3xl border border-helix-purple/15 bg-gradient-to-br from-helix-purple/5 to-transparent p-10 text-center">
            <HelixLogo className="w-14 h-14 mx-auto mb-5 opacity-25" />
            <h2 className="text-xl md:text-2xl font-black text-white mb-3">Missing a term?</h2>
            <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">Helix OS is evolving. If you encounter a term not listed here, let us know or contribute to the documentation.</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/docs/architecture" className="px-5 py-2.5 rounded-xl bg-helix-purple/10 border border-helix-purple/20 text-helix-purple font-bold text-sm hover:bg-helix-purple/20 transition-all">
                Architecture Docs →
              </Link>
              <Link href="/contributing" className="px-5 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/40 text-zinc-400 font-bold text-sm hover:text-white hover:border-zinc-700 transition-all">
                Contribute
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
