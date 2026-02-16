"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import askHelixContent from "@/helix-wiki/lib/docs-i18n/ask-helix";
import { streamGeminiResponse, resetGeminiChat } from "@/helix-wiki/lib/gemini";

/* ── Knowledge base (simulated) ── */
interface KBEntry {
  q: string[];
  answer: string;
  links: { label: string; href: string }[];
  code?: string;
  codeFile?: string;
  category: string;
  categoryColor: string;
  followUp?: string[];
}

const KB: KBEntry[] = [
  {
    q: ["self-healing", "self heal", "auto repair", "recovery", "crash recovery", "auto-recovery", "healing"],
    answer:
      "Helix's self-healing system is powered by **NEXUS** — an 812K-line AI subsystem. When a module crashes, NEXUS detects the failure via health monitoring, quarantines the module to prevent cascade failures, then attempts automated recovery using a tiered strategy:\n\n1. **Restart** — Simple process restart with fresh state\n2. **State Rollback** — Restore from last checkpoint\n3. **Hot-Swap** — Replace with a known-good version\n4. **Escalation** — If all strategies fail after 3 attempts, the module enters `Zombie` state for manual intervention\n\nThe entire recovery process is driven by ML models that classify failure types and select the optimal recovery strategy based on historical success rates.",
    links: [
      { label: "NEXUS Subsystem", href: "/docs/nexus" },
      { label: "Module Lifecycle", href: "/docs/modules#lifecycle" },
      { label: "Architecture Overview", href: "/docs/architecture" },
    ],
    code: `// Self-healing recovery loop (simplified)
pub fn attempt_recovery(&mut self, module: ModuleId) -> HealingResult {
    let failure = self.classifier.classify(module);
    let strategy = self.action_selector.select(failure);
    
    for attempt in 0..MAX_RETRIES {
        match strategy.execute(module) {
            Ok(()) => return HealingResult::Recovered,
            Err(e) => self.telemetry.log_retry(module, attempt, e),
        }
    }
    self.quarantine.escalate_to_zombie(module);
    HealingResult::Zombie
}`,
    codeFile: "subsystems/nexus/src/healing/self_healer.rs",
    category: "NEXUS",
    categoryColor: "from-purple-500 to-fuchsia-500",
    followUp: ["How does hot-reload work?", "What is NEXUS?", "Explain the module lifecycle"],
  },
  {
    q: ["hot reload", "hot-reload", "hot swap", "hot-swap", "live update", "module replacement", "runtime swap"],
    answer:
      "Hot-reload is a **first-class feature** of Helix OS. Any module can be replaced at runtime without rebooting. The process follows these steps:\n\n1. **Pause** — The module is paused, queuing incoming requests\n2. **Export State** — Current module state is serialized to a checkpoint\n3. **Load New** — New module version is loaded and relocated\n4. **Import State** — Checkpoint state is deserialized into the new module\n5. **Activate** — New module starts serving requests\n6. **Rollback** — If any step fails, the old module is automatically restored\n\nThis enables **zero-downtime kernel upgrades** and is used by NEXUS for self-healing. The ABI versioning system ensures backward compatibility between module versions.",
    links: [
      { label: "Module System", href: "/docs/modules" },
      { label: "Module Lifecycle States", href: "/docs/modules#lifecycle" },
      { label: "NEXUS Healing Engine", href: "/docs/nexus#healing" },
    ],
    code: `pub fn hot_swap(&mut self, old: ModuleId, new_binary: &[u8]) -> Result<(), SwapError> {
    let checkpoint = self.modules.pause_and_export(old)?;
    let new_mod = self.loader.load(new_binary)?;
    self.loader.init(new_mod)?;
    self.modules.import_state(new_mod, checkpoint)?;
    self.modules.activate(new_mod)?;
    self.modules.unload(old)?;
    Ok(())
}`,
    codeFile: "subsystems/nexus/src/healing/hot_swap.rs",
    category: "Modules",
    categoryColor: "from-lime-500 to-green-500",
    followUp: ["How does self-healing work?", "Explain the module lifecycle", "What is the boot sequence?"],
  },
  {
    q: ["syscall", "system call", "syscalls", "dispatch", "syscall table", "sysenter", "sysret"],
    answer:
      "Helix uses a **512-entry syscall dispatch table** with a 6-argument calling convention matching Linux errno semantics. The ABI uses registers `rdi`, `rsi`, `rdx`, `r10`, `r8`, `r9` — identical to Linux x86_64.\n\nKey features:\n- **Pre/post hooks** for tracing, security auditing, and profiling\n- **18 errno-compatible error codes** (`EPERM`, `ENOENT`, `EIO`, etc.)\n- **Single entry point** via `helix_syscall_entry()` — the only `extern \"C\"` function in the path\n- **SYSCALL/SYSRET MSR** based fast system call interface\n- **Capability-gated** — each syscall checks the caller's capability token",
    links: [
      { label: "Syscall Framework", href: "/docs/core#syscalls" },
      { label: "Core Kernel", href: "/docs/core" },
      { label: "Syscall Playground", href: "/playground" },
    ],
    code: `#[no_mangle]
pub extern "C" fn helix_syscall_entry(
    number: u64,
    arg1: u64, arg2: u64, arg3: u64,
    arg4: u64, arg5: u64, arg6: u64,
) -> i64 {
    let args = SyscallArgs {
        number,
        args: [arg1, arg2, arg3, arg4, arg5, arg6],
    };
    DISPATCHER.dispatch(&args)
}`,
    codeFile: "core/src/syscall/gateway.rs",
    category: "Core",
    categoryColor: "from-zinc-400 to-slate-500",
    followUp: ["How does IPC work?", "What is the boot sequence?", "Describe the security model"],
  },
  {
    q: ["boot", "boot process", "startup", "init", "boot sequence", "initialization", "bootloader"],
    answer:
      "Helix boots through **5 phases**, each with rollback on failure:\n\n1. **Boot** — Serial console → Physical memory → Interrupt vectors\n2. **Early** — Timer (`HPET`/`PIT`) → Scheduler (CFS-style, per-CPU run queues)\n3. **Core** — IPC channels → Syscall table → Module registry\n4. **Late** — VFS mount → Network stack → Device enumeration → Security framework\n5. **Runtime** — PID 1 (init process) → Interactive shell (`hsh`)\n\nThe entire boot completes in under **1 second**. If any phase fails, the init subsystem rolls back to the last known-good state. The boot process supports **3 bootloaders**: Limine, Multiboot2, and UEFI direct.",
    links: [
      { label: "Boot Process", href: "/docs/subsystems#init" },
      { label: "Boot Sequence Animation", href: "/boot" },
      { label: "Architecture Overview", href: "/docs/architecture" },
    ],
    category: "Init",
    categoryColor: "from-blue-500 to-cyan-500",
    followUp: ["How does the scheduler work?", "What is the memory subsystem?", "How does self-healing work?"],
  },
  {
    q: ["ipc", "inter-process", "message passing", "event bus", "pub/sub", "communication", "channel"],
    answer:
      "Helix provides **3 IPC mechanisms**:\n\n1. **Shared Memory** — Lock-free ring buffers with atomic operations for high-throughput data transfer (zero-copy)\n2. **Event Bus** — Global pub/sub system with priority ordering (`Critical` → `High` → `Normal` → `Low`) and topic-based routing\n3. **Message Router** — Point-to-point request/response between modules with typed messages and timeout handling\n\nAll IPC is **capability-gated** — a module can only communicate through channels it has explicit permission to use. The event bus supports wildcard subscriptions and dead-letter queuing for unhandled events.",
    links: [
      { label: "IPC System", href: "/docs/core#ipc" },
      { label: "Event Bus", href: "/docs/core#ipc" },
      { label: "Core Kernel", href: "/docs/core" },
    ],
    code: `pub fn publish(&self, event: KernelEvent) -> usize {
    let topic = event.topic();
    let subs = self.subscribers.get(&topic);
    let mut handled = 0;
    for sub in subs.iter().sorted_by_key(|s| s.priority) {
        (sub.handler)(event.clone());
        handled += 1;
    }
    handled
}`,
    codeFile: "core/src/ipc/event_bus.rs",
    category: "Core",
    categoryColor: "from-zinc-400 to-slate-500",
    followUp: ["How do syscalls work?", "What is the security model?", "How does the module system work?"],
  },
  {
    q: ["filesystem", "helixfs", "file system", "fs", "cow", "copy on write", "b+tree", "snapshot", "vfs"],
    answer:
      "HelixFS is a modern **copy-on-write** filesystem with 6 layers:\n\n1. **VFS Layer** — POSIX-compatible API with inodes, dentries, and namespaces\n2. **Transaction Layer** — ACID guarantees via write-ahead log\n3. **Metadata** — B+Tree indexing, radix trees, and snapshot management\n4. **Data** — Extent-based allocation with ARC (Adaptive Replacement Cache)\n5. **Security** — Per-file `AES-256` encryption and Merkle tree integrity\n6. **Block Device** — Sector-aligned I/O with DMA buffer management\n\nKey features: **atomic transactions**, instant snapshots, transparent compression, and hardware-accelerated encryption. The filesystem supports up to **2^64 files** with nanosecond timestamps.",
    links: [
      { label: "HelixFS", href: "/docs/filesystem" },
      { label: "Architecture", href: "/docs/architecture" },
    ],
    category: "Filesystem",
    categoryColor: "from-sky-500 to-indigo-500",
    followUp: ["How does the memory subsystem work?", "What about security?", "What is NEXUS?"],
  },
  {
    q: ["lumina", "gpu", "graphics", "render", "shader", "vulkan", "spirv", "opengl", "metal"],
    answer:
      "**Lumina** is a complete GPU graphics stack — 197K lines across 14 sub-crates + Magma driver. Built entirely in `no_std` Rust with zero external graphics dependencies.\n\nThe stack includes:\n- **Math library** — SIMD-optimized `Vec`/`Mat`/`Quat`\n- **Shader compiler** — Source → IR → SPIR-V with optimization passes\n- **Render graph** — Automatic barriers, pass scheduling, resource lifetime tracking\n- **PBR materials** — Metallic-roughness workflow with IBL\n- **GPU abstraction** — Vulkan/Metal/DX12 backends\n- **Magma driver** — Ring buffer command submission, MMIO, IRQ handling\n- **Scene graph** — ECS-based with frustum culling and LOD",
    links: [
      { label: "Lumina GPU API", href: "/docs/lumina" },
      { label: "Shader Pipeline", href: "/docs/lumina#crates" },
      { label: "Architecture", href: "/docs/architecture" },
    ],
    category: "Graphics",
    categoryColor: "from-pink-500 to-rose-500",
    followUp: ["How does the HAL work?", "What is the architecture overview?", "How does memory management work?"],
  },
  {
    q: ["nexus", "ai", "intelligence", "machine learning", "prediction", "anomaly", "ml"],
    answer:
      "**NEXUS** is Helix's kernel intelligence subsystem — 812K lines of pure Rust ML code. It provides:\n\n- **Anomaly Detection** — Statistical models, time series analysis, pattern matching\n- **Crash Prediction** — ML models estimate per-module crash probability\n- **Self-Healing** — Automated recovery with tiered strategies\n- **Performance Optimization** — Runtime tuning of scheduler, memory, and cache policies\n- **Quarantine** — Isolates failing modules with resource fences\n- **Telemetry** — Lock-free metrics, ring buffer traces, health monitoring\n\nML engines include: `Decision Trees`, `Random Forests`, `Neural Networks`, `K-Means`, `SVMs`, and `Online Learning`. All inference runs in-kernel with zero heap allocation on the hot path.",
    links: [
      { label: "NEXUS Overview", href: "/docs/nexus" },
      { label: "ML Engines", href: "/docs/nexus#ml" },
      { label: "Architecture", href: "/docs/architecture" },
    ],
    category: "NEXUS",
    categoryColor: "from-purple-500 to-fuchsia-500",
    followUp: ["How does self-healing work?", "How does the scheduler adapt?", "What is anomaly detection?"],
  },
  {
    q: ["hal", "hardware abstraction", "abstraction layer", "cpu", "mmu", "architecture", "aarch64", "risc-v", "x86", "arm"],
    answer:
      "The **Hardware Abstraction Layer** (HAL) is ~22K lines that abstracts CPU, MMU, interrupts, firmware, and relocation across 3 architectures:\n\n- **x86_64** — Full support with APIC, HPET, UEFI/BIOS, KASLR\n- **AArch64** — ARM support with GIC, device tree\n- **RISC-V 64** — RISC-V support with PLIC, SBI\n\nEach arch implements a common `Arch` trait, letting the kernel run identically across platforms. The HAL also provides **KASLR** (Kernel Address Space Layout Randomization) via the relocation subsystem.\n\nKey abstractions: `Cpu`, `Mmu`, `InterruptController`, `Timer`, `Firmware`, `SerialPort`.",
    links: [
      { label: "HAL Documentation", href: "/docs/hal" },
      { label: "Architecture Overview", href: "/docs/architecture" },
      { label: "Subsystems", href: "/docs/subsystems" },
    ],
    code: `/// Platform-agnostic architecture trait
pub trait Arch {
    type Cpu: CpuOps;
    type Mmu: MmuOps;
    type Interrupt: InterruptOps;
    type Timer: TimerOps;

    fn init(boot_info: &BootInfo) -> Result<Self, HalError>;
    fn cpu(&self) -> &Self::Cpu;
    fn mmu(&self) -> &Self::Mmu;
    fn name() -> &'static str;
}`,
    codeFile: "hal/src/lib.rs",
    category: "HAL",
    categoryColor: "from-amber-500 to-orange-500",
    followUp: ["What is the memory subsystem?", "How does the boot process work?", "What architectures are supported?"],
  },
  {
    q: ["module", "modules", "crate", "plugin", "extension", "registry", "lifecycle"],
    answer:
      "Helix's module system is the foundation of its extensibility. Every kernel subsystem is a module that can be loaded, unloaded, and **hot-swapped** at runtime.\n\nModule lifecycle: `Unloaded` → `Loading` → `Loaded` → `Initializing` → `Active` → (`Paused`) → `Stopping` → `Unloaded`\n\nFeatures:\n- **ABI versioning** — Modules declare compatible ABI ranges\n- **Dependency resolution** — Automatic loading of required modules\n- **Health monitoring** — NEXUS tracks module health via heartbeats\n- **Error states** — Crashed modules enter `Error` → `Zombie` pipeline\n- **Hot-swap** — Replace modules without restart\n- **Capability tokens** — Per-module security permissions",
    links: [
      { label: "Module System", href: "/docs/modules" },
      { label: "Module Lifecycle", href: "/docs/modules#lifecycle" },
      { label: "Architecture", href: "/docs/architecture" },
    ],
    category: "Modules",
    categoryColor: "from-lime-500 to-green-500",
    followUp: ["How does hot-reload work?", "What is NEXUS?", "How does self-healing work?"],
  },
  {
    q: ["memory", "allocator", "paging", "virtual memory", "physical memory", "frame", "heap", "mmap"],
    answer:
      "Helix's memory subsystem provides:\n\n- **Physical Frame Allocator** — Bitmap-based with buddy allocation for large contiguous regions\n- **Virtual Memory Manager** — 4-level page tables (`PML4`) with demand paging\n- **Kernel Heap** — Slab allocator for small objects, buddy for large\n- **DMA Buffers** — Physically contiguous memory for device I/O\n- **KASLR** — Randomized kernel virtual address layout via relocation subsystem\n- **Memory Advisor** — NEXUS ML model recommends page sizes and compaction triggers\n\nThe VMM supports huge pages (`2MiB`, `1GiB`), copy-on-write forks, and NUMA-aware allocation. All allocators are lock-free on the fast path.",
    links: [
      { label: "Memory Subsystem", href: "/docs/subsystems#memory" },
      { label: "HAL MMU", href: "/docs/hal" },
      { label: "Architecture", href: "/docs/architecture" },
    ],
    code: `/// Physical frame allocator with buddy system
pub fn allocate_frames(&mut self, count: usize) -> Option<PhysFrame> {
    let order = count.next_power_of_two().trailing_zeros() as usize;
    for o in order..MAX_ORDER {
        if let Some(frame) = self.free_lists[o].pop() {
            // Split larger blocks down to requested size
            for split in (order..o).rev() {
                let buddy = frame.offset(1 << split);
                self.free_lists[split].push(buddy);
            }
            return Some(frame);
        }
    }
    None
}`,
    codeFile: "subsystems/memory/src/frame_allocator.rs",
    category: "Memory",
    categoryColor: "from-teal-500 to-emerald-500",
    followUp: ["How does paging work?", "What is KASLR?", "How does HelixFS use memory?"],
  },
  {
    q: ["scheduler", "scheduling", "dis", "process", "thread", "task", "preemptive", "cfs"],
    answer:
      "Helix uses the **DIS** (Dynamic Intelligent Scheduler) — a CFS-inspired scheduler enhanced with NEXUS ML tuning:\n\n- **Per-CPU run queues** with work stealing\n- **Priority classes** — `Real-time`, `System`, `Interactive`, `Batch`, `Idle`\n- **Dynamic time slices** — Adjusted by NEXUS based on workload fingerprinting\n- **CPU affinity** — Soft and hard binding\n- **Load balancing** — Periodic cross-CPU migration with cache-aware placement\n- **Preemptive** — Tick-based preemption with voluntary yield support\n\nThe scheduler uses a **red-black tree** for O(log n) task selection and supports **NUMA-aware scheduling** for multi-socket systems.",
    links: [
      { label: "DIS Scheduler", href: "/docs/subsystems#dis" },
      { label: "Subsystems Overview", href: "/docs/subsystems" },
    ],
    code: `/// Pick next task from the run queue (CFS-style)
pub fn pick_next(&mut self) -> Option<&Task> {
    // Leftmost node in the red-black tree has smallest vruntime
    let task = self.timeline.leftmost()?;
    task.update_vruntime(self.min_granularity);
    self.current = Some(task.id);
    Some(task)
}`,
    codeFile: "subsystems/dis/src/scheduler.rs",
    category: "Scheduler",
    categoryColor: "from-blue-500 to-cyan-500",
    followUp: ["How does NEXUS optimize scheduling?", "What is the memory subsystem?", "How does the boot process initialize the scheduler?"],
  },
  {
    q: ["security", "capability", "permission", "access control", "isolation", "sandbox"],
    answer:
      "Helix uses a **capability-based security model** — every resource access requires an unforgeable capability token:\n\n- **Per-module tokens** — Each module receives a capability set at load time\n- **Hierarchical delegation** — Modules can delegate subsets of their capabilities\n- **Revocation** — Capabilities can be revoked at any time, propagating through the delegation chain\n- **Syscall gating** — Every syscall checks the caller's capability before execution\n- **Memory isolation** — Separate address spaces with guard pages\n- **IPC gating** — Channels are capability-protected\n\nThe security framework integrates with NEXUS for **anomaly-based intrusion detection** — unusual access patterns trigger alerts and automatic quarantine.",
    links: [
      { label: "Security Model", href: "/docs/architecture#security" },
      { label: "Core Kernel", href: "/docs/core" },
      { label: "NEXUS", href: "/docs/nexus" },
    ],
    category: "Security",
    categoryColor: "from-red-500 to-orange-500",
    followUp: ["How does module isolation work?", "What is NEXUS anomaly detection?", "How do syscalls check permissions?"],
  },
  {
    q: ["interrupt", "irq", "exception", "idt", "apic", "gic", "plic", "trap", "fault"],
    answer:
      "Helix's interrupt subsystem provides a **unified interrupt model** across all architectures:\n\n- **x86_64** — IDT with 256 vectors, Local APIC + I/O APIC, MSI/MSI-X support\n- **AArch64** — GICv3 with redistributors, SPI/PPI/SGI classification\n- **RISC-V** — PLIC with priority levels, SBI-based timer/IPI\n\nFeatures:\n- **Nested interrupts** with priority preemption\n- **Deferred processing** — Top-half (fast ack) + bottom-half (workqueue)\n- **Per-CPU interrupt stacks** — IST on x86_64, separate stacks on ARM/RISC-V\n- **Exception handlers** — Page fault (#PF), GP fault (#GP), double fault (#DF) with recovery\n- **Soft IRQs** — Timer, scheduler, network, block device tasklets",
    links: [
      { label: "Interrupts", href: "/docs/core#interrupts" },
      { label: "HAL", href: "/docs/hal" },
      { label: "Architecture", href: "/docs/architecture" },
    ],
    category: "Core",
    categoryColor: "from-zinc-400 to-slate-500",
    followUp: ["How does the HAL abstract interrupts?", "What is the exception handling flow?", "How does the scheduler use timer interrupts?"],
  },
  {
    q: ["relocation", "kaslr", "aslr", "userspace", "elf", "loader", "dynamic linking"],
    answer:
      "Helix's **relocation subsystem** handles both kernel and userspace address space management:\n\n- **KASLR** — Kernel base randomized at boot using hardware RNG\n- **ELF Loader** — Full ELF64 parser with section/segment handling\n- **Dynamic Linking** — GOT/PLT patching for module cross-references\n- **Userspace Setup** — Stack initialization, argument passing, TLS setup\n- **Address Space** — Per-process `PML4` with kernel mapped in upper half\n\nThe relocator supports `R_X86_64_64`, `R_X86_64_PC32`, `R_X86_64_GOTPCREL`, and `R_X86_64_PLT32` relocation types. Module hot-swap uses the relocator to patch all cross-references when swapping module versions.",
    links: [
      { label: "Relocation", href: "/docs/subsystems#relocation" },
      { label: "HAL", href: "/docs/hal" },
      { label: "Module System", href: "/docs/modules" },
    ],
    category: "Subsystem",
    categoryColor: "from-indigo-500 to-violet-500",
    followUp: ["How does the module loader work?", "What is KASLR?", "How does userspace bootstrapping work?"],
  },
];

/* ── Suggestion cards ── */
const SUGGESTIONS = [
  { text: "How does self-healing work?", icon: "🧬", color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/20 hover:border-emerald-400/40" },
  { text: "Explain the boot sequence", icon: "🚀", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/20 hover:border-blue-400/40" },
  { text: "How does hot-reload work?", icon: "🔥", color: "from-orange-500/20 to-amber-500/20", border: "border-orange-500/20 hover:border-orange-400/40" },
  { text: "What is NEXUS?", icon: "🧠", color: "from-purple-500/20 to-fuchsia-500/20", border: "border-purple-500/20 hover:border-purple-400/40" },
  { text: "Describe the syscall ABI", icon: "⚙️", color: "from-zinc-500/20 to-slate-500/20", border: "border-zinc-500/20 hover:border-zinc-400/40" },
  { text: "How does HelixFS work?", icon: "📸", color: "from-sky-500/20 to-indigo-500/20", border: "border-sky-500/20 hover:border-sky-400/40" },
  { text: "What GPU APIs does Lumina provide?", icon: "🎨", color: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/20 hover:border-pink-400/40" },
  { text: "How does the scheduler work?", icon: "⏱️", color: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/20 hover:border-cyan-400/40" },
  { text: "Explain the security model", icon: "🛡️", color: "from-red-500/20 to-orange-500/20", border: "border-red-500/20 hover:border-red-400/40" },
  { text: "What is the HAL?", icon: "🔧", color: "from-amber-500/20 to-yellow-500/20", border: "border-amber-500/20 hover:border-amber-400/40" },
  { text: "How does memory management work?", icon: "🗄️", color: "from-teal-500/20 to-emerald-500/20", border: "border-teal-500/20 hover:border-teal-400/40" },
  { text: "Explain the module lifecycle", icon: "♻️", color: "from-lime-500/20 to-green-500/20", border: "border-lime-500/20 hover:border-lime-400/40" },
];

const STATS = [
  { value: "812K", label: "Lines of Rust", icon: "🦀" },
  { value: "15", label: "Topics Indexed", icon: "📚" },
  { value: "<1s", label: "Response Time", icon: "⚡" },
  { value: "3", label: "Architectures", icon: "🏗️" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
  links?: { label: string; href: string }[];
  code?: string;
  codeFile?: string;
  timestamp: number;
  category?: string;
  categoryColor?: string;
  followUp?: string[];
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
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  return bestScore > 2 ? best : null;
}

/* ── Rich text renderer (bold, code, lists) ── */
function RichText({ text, colorClass }: { text: string; colorClass: string }) {
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
              <span className="text-helix-purple font-mono text-xs mt-0.5 min-w-[1.25rem] text-right opacity-60">{num}.</span>
              <span className={colorClass}>{renderInline(rest)}</span>
            </div>
          );
        }

        if (trimmed.startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2.5 items-start pl-1">
              <span className="text-helix-purple mt-2 text-[6px]">●</span>
              <span className={colorClass}>{renderInline(trimmed.slice(2))}</span>
            </div>
          );
        }

        if (trimmed === "") return <div key={i} className="h-1" />;

        return (
          <p key={i} className={colorClass}>
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={j} className="px-1.5 py-0.5 rounded-md bg-helix-purple/10 border border-helix-purple/20 text-helix-purple text-[0.8em] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={j}>{part}</span>;
  });
}

/* ── Code block with copy button ── */
function CodeBlock({ code, codeFile }: { code: string; codeFile?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-zinc-700/40 shadow-lg shadow-black/30 group/code">
      {codeFile && (
        <div className="px-4 py-2 bg-zinc-800/70 border-b border-zinc-700/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
            <svg className="w-3.5 h-3.5 text-orange-400/70" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
            </svg>
            <span className="text-[10px] font-mono text-zinc-400">{codeFile}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-700/40 hover:bg-zinc-600/50 text-zinc-400 hover:text-white text-[10px] font-mono transition-all cursor-pointer opacity-0 group-hover/code:opacity-100"
          >
            {copied ? (
              <>
                <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 bg-[#0a0e14] overflow-x-auto text-xs font-mono text-emerald-300/90 leading-relaxed">{code}</pre>
        {!codeFile && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-400 hover:text-white text-[10px] font-mono transition-all cursor-pointer opacity-0 group-hover/code:opacity-100 backdrop-blur-sm"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Neural Network Canvas (with data pulse) ── */
function NeuralCanvas({ pulse }: { pulse: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulseRef = useRef(pulse);

  useEffect(() => {
    pulseRef.current = pulse;
  }, [pulse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const nodes: { x: number; y: number; vx: number; vy: number; r: number; pulse: number; speed: number }[] = [];
    const nodeCount = 50;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.8,
        pulse: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.015 + 0.006,
      });
    }

    let lastPulse = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const currentPulse = pulseRef.current;
      const hasPulse = currentPulse !== lastPulse;
      if (hasPulse) lastPulse = currentPulse;

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.pulse += n.speed;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        if (hasPulse) { n.vx += (Math.random() - 0.5) * 0.5; n.vy += (Math.random() - 0.5) * 0.5; }
        n.vx *= 0.999; n.vy *= 0.999;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const alpha = (1 - dist / 180) * (hasPulse ? 0.2 : 0.08);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            const grad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            grad.addColorStop(0, `rgba(123, 104, 238, ${alpha})`);
            grad.addColorStop(1, `rgba(74, 144, 226, ${alpha})`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        const glow = (Math.sin(n.pulse) + 1) / 2;
        const r = n.r + glow * 1.2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(123, 104, 238, ${0.2 + glow * 0.35})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(123, 104, 238, ${glow * 0.04})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}

/* ── Timestamp ── */
function TimeStamp({ ts }: { ts: number }) {
  const str = useMemo(() => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [ts]);
  return <span className="text-[9px] text-zinc-600 font-mono mt-1.5 block select-none">{str}</span>;
}

/* ══════════════════════════════════════════════════════════════
   ██  MAIN PAGE
   ══════════════════════════════════════════════════════════════ */
export default function AskHelixPage() {
  const { locale } = useI18n();
  const s = (k: string) => getDocString(askHelixContent, locale, k);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<Message | null>(null);
  const [dataPulse, setDataPulse] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [apiKey, setApiKey] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [geminiEnabled, setGeminiEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* Load API key from localStorage on mount */
  useEffect(() => {
    const stored = localStorage.getItem("helix-gemini-key");
    if (stored) {
      setApiKey(stored);
      setGeminiEnabled(true);
      setKeyInput(stored);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, displayedText]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const typeWriter = useCallback((msg: Message) => {
    const text = msg.content;
    let idx = 0;
    setCurrentAnswer(msg);
    setDisplayedText("");
    const interval = setInterval(() => {
      idx += 3;
      if (idx >= text.length) {
        setDisplayedText(null);
        setCurrentAnswer(null);
        setMessages(prev => [...prev, msg]);
        setIsTyping(false);
        clearInterval(interval);
      } else {
        setDisplayedText(text.slice(0, idx));
      }
    }, 10);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { role: "user", content: text.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setShowWelcome(false);
    setDataPulse(p => p + 1);

    /* ── Gemini streaming mode ── */
    if (geminiEnabled && apiKey) {
      try {
        setCurrentAnswer({ role: "assistant", content: "", timestamp: Date.now(), category: "NEXUS", categoryColor: "from-purple-500 to-fuchsia-500" });
        setDisplayedText("");

        let fullText = "";
        for await (const chunk of streamGeminiResponse(apiKey, text.trim())) {
          fullText += chunk;
          setDisplayedText(fullText);
        }

        // Extract any documentation links from Gemini's response
        const linkMap: Record<string, string> = {
          "/docs/architecture": "Architecture", "/docs/core": "Core Kernel", "/docs/nexus": "NEXUS",
          "/docs/modules": "Module System", "/docs/hal": "HAL", "/docs/subsystems": "Subsystems",
          "/docs/filesystem": "HelixFS", "/docs/lumina": "Lumina GPU", "/boot": "Boot Sequence",
          "/playground": "Syscall Playground",
        };
        const detectedLinks: { label: string; href: string }[] = [];
        for (const [href, label] of Object.entries(linkMap)) {
          if (fullText.toLowerCase().includes(href) || fullText.toLowerCase().includes(label.toLowerCase())) {
            detectedLinks.push({ label, href });
          }
        }

        const finalMsg: Message = {
          role: "assistant", content: fullText, timestamp: Date.now(),
          links: detectedLinks.length > 0 ? detectedLinks.slice(0, 4) : undefined,
          category: "NEXUS", categoryColor: "from-purple-500 to-fuchsia-500",
        };
        setDisplayedText(null);
        setCurrentAnswer(null);
        setMessages(prev => [...prev, finalMsg]);
        setIsTyping(false);
      } catch (err) {
        console.error("Gemini error, falling back to KB:", err);
        setDisplayedText(null);
        setCurrentAnswer(null);
        // Fallback to KB on error
        fallbackToKB(text);
      }
      return;
    }

    /* ── KB fallback mode ── */
    fallbackToKB(text);
  }, [isTyping, geminiEnabled, apiKey, typeWriter]);

  const fallbackToKB = useCallback((text: string) => {
    setTimeout(() => {
      const kb = findAnswer(text);
      const response: Message = kb
        ? {
            role: "assistant", content: kb.answer, links: kb.links,
            code: kb.code, codeFile: kb.codeFile, timestamp: Date.now(),
            category: kb.category, categoryColor: kb.categoryColor, followUp: kb.followUp,
          }
        : {
            role: "assistant",
            content: `I don't have a specific answer for "${text.trim()}" yet, but here are some areas you can explore:\n\n- **Architecture** — Overall system design and crate dependencies\n- **Core Kernel** — Syscalls, IPC, interrupts, self-healing\n- **NEXUS** — AI-powered kernel intelligence (812K lines)\n- **Modules** — Hot-swappable module system with ABI versioning\n- **HelixFS** — Copy-on-write filesystem with snapshots\n- **Lumina** — Full GPU graphics stack (197K lines)\n- **HAL** — Hardware abstraction for x86_64, AArch64, RISC-V\n\nTry asking about a specific topic like "self-healing", "scheduler", "security", or "memory management".`,
            links: [
              { label: "Architecture", href: "/docs/architecture" },
              { label: "Core Kernel", href: "/docs/core" },
              { label: "NEXUS", href: "/docs/nexus" },
            ],
            timestamp: Date.now(),
            followUp: ["How does self-healing work?", "What is NEXUS?", "Explain the module system"],
          };
      typeWriter(response);
    }, 500 + Math.random() * 600);
  }, [typeWriter]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };

  const messageCount = messages.filter(m => m.role === "user").length;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-helix-purple/40">
      <NeuralCanvas pulse={dataPulse} />

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-helix-purple/[0.05] blur-[160px] animate-pulse-slow" />
        <div className="absolute top-[50%] right-[10%] w-[400px] h-[400px] rounded-full bg-helix-blue/[0.05] blur-[140px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-[5%] left-[40%] w-[600px] h-[600px] rounded-full bg-indigo-500/[0.03] blur-[180px] animate-pulse-slow" style={{ animationDelay: "4s" }} />
      </div>

      <style>{`
        @keyframes fadeUp { 0% { opacity: 0; transform: translateY(16px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { 0% { opacity: 0; transform: translateX(-20px); } 100% { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { 0% { opacity: 0; transform: translateX(20px); } 100% { opacity: 1; transform: translateX(0); } }
        @keyframes brainPulse { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(123,104,238,0.25)); } 50% { transform: scale(1.04); filter: drop-shadow(0 0 24px rgba(123,104,238,0.5)); } }
        @keyframes orbFloat { 0%, 100% { transform: translateY(0) rotate(0deg); } 33% { transform: translateY(-8px) rotate(2deg); } 66% { transform: translateY(4px) rotate(-1deg); } }
        @keyframes typingPulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes shineSlide { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes ringPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(123,104,238,0.25); } 50% { box-shadow: 0 0 0 10px rgba(123,104,238,0); } }
        @keyframes countUp { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
        .msg-enter-left { animation: slideInLeft 0.45s cubic-bezier(0.16, 1, 0.3, 1); }
        .msg-enter-right { animation: slideInRight 0.45s cubic-bezier(0.16, 1, 0.3, 1); }
        .msg-enter { animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .suggestion-card { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .suggestion-card:hover { transform: translateY(-3px) scale(1.02); }
        .shine-effect { position: relative; overflow: hidden; }
        .shine-effect::after {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent);
          animation: shineSlide 4s ease-in-out infinite;
        }
        .gradient-text-animated { background-size: 200% 200%; animation: gradientShift 4s ease infinite; }
        .cursor-blink::after { content: '▊'; animation: typingPulse 1s ease infinite; color: #7B68EE; }
        .stat-item { animation: countUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
        .follow-up-btn { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
        .follow-up-btn:hover { transform: translateX(4px); }
      `}</style>

      <main className="relative flex flex-col min-h-screen" style={{ zIndex: 2 }}>
        {/* ── Header ── */}
        <div className="pt-24 pb-3 px-6">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-5 inline-flex items-center gap-1.5 group">
              <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {s("back_home")}
            </Link>

            <div className="flex items-center gap-4 mb-2">
              <div className="relative">
                <div className="absolute inset-[-5px] rounded-2xl border border-helix-purple/15" style={{ animation: "ringPulse 3s ease infinite" }} />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-helix-purple via-indigo-500 to-helix-blue flex items-center justify-center shadow-2xl shadow-helix-purple/25"
                     style={{ animation: "brainPulse 3s ease infinite" }}>
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white via-helix-purple to-helix-blue bg-clip-text text-transparent gradient-text-animated bg-[length:200%_200%]">
                    {s("title")}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {s("badge")}
                  </span>
                  {geminiEnabled && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                      Gemini
                    </span>
                  )}
                  <button
                    onClick={() => setShowSettings(true)}
                    className="w-6 h-6 rounded-lg bg-zinc-800/60 border border-zinc-700/30 hover:border-zinc-600/50 hover:bg-zinc-700/60 flex items-center justify-center transition-all cursor-pointer group/settings"
                    title="API Settings"
                  >
                    <svg className="w-3 h-3 text-zinc-500 group-hover/settings:text-zinc-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  {messageCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800/60 border border-zinc-700/30 text-zinc-500 text-[9px] font-mono">
                      {messageCount} {messageCount === 1 ? s("query") : s("queries")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-600 mt-0.5">
                  {geminiEnabled
                    ? s("powered_by_gemini")
                    : `Trained on 812K+ lines of Helix kernel source · ${KB.length} topics · 3 architectures`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Chat area ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="max-w-4xl mx-auto space-y-5">

            {/* Welcome screen */}
            {showWelcome && messages.length === 0 && !isTyping && (
              <div className="py-10 space-y-10 msg-enter">
                <div className="text-center space-y-5">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-helix-purple/8 to-helix-blue/8 border border-helix-purple/15 text-helix-purple text-[10px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-helix-purple animate-pulse" />
                    Contextual AI · Source Code + Docs · {KB.length} Topics
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                    {s("welcome_title")}{" "}
                    <span className="bg-gradient-to-r from-helix-blue via-helix-purple to-indigo-400 bg-clip-text text-transparent gradient-text-animated bg-[length:200%_200%]">
                      {s("welcome_helix")}
                    </span>
                    <span className="text-helix-purple">?</span>
                  </h2>
                  <p className="text-zinc-500 max-w-lg mx-auto text-sm leading-relaxed">
                    {s("welcome_desc")}
                  </p>
                </div>

                {/* Stats ribbon */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-5 px-6 py-3 rounded-2xl bg-zinc-900/30 border border-zinc-800/30 backdrop-blur-sm">
                    {STATS.map((s, i) => (
                      <div key={s.label} className="flex items-center gap-2.5 stat-item" style={{ animationDelay: `${i * 100}ms` }}>
                        {i > 0 && <div className="w-px h-7 bg-zinc-800/50" />}
                        <span className="text-base">{s.icon}</span>
                        <div>
                          <div className="text-base font-bold text-white leading-none">{s.value}</div>
                          <div className="text-[9px] text-zinc-600 whitespace-nowrap mt-0.5">{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggestion cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-w-3xl mx-auto">
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} onClick={() => sendMessage(s.text)}
                      className={`suggestion-card group relative p-3.5 rounded-xl bg-gradient-to-br ${s.color} border ${s.border} backdrop-blur-sm text-left cursor-pointer shine-effect`}>
                      <span className="text-xl mb-1.5 block group-hover:scale-110 transition-transform">{s.icon}</span>
                      <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors leading-snug block">{s.text}</span>
                    </button>
                  ))}
                </div>

                {/* Capabilities */}
                <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2">
                  {[
                    { icon: "📖", title: "Deep Documentation", desc: "Searches all doc pages with semantic matching across every subsystem", gradient: "from-blue-500/5 to-cyan-500/5", border: "border-blue-500/8" },
                    { icon: "🦀", title: "Real Rust Code", desc: "References actual code from the kernel codebase — no hallucinated snippets", gradient: "from-orange-500/5 to-red-500/5", border: "border-orange-500/8" },
                    { icon: "🔗", title: "Smart Navigation", desc: "Links directly to relevant docs, source files, and interactive tools", gradient: "from-emerald-500/5 to-teal-500/5", border: "border-emerald-500/8" },
                  ].map((c) => (
                    <div key={c.title} className={`p-4 rounded-xl bg-gradient-to-br ${c.gradient} border ${c.border} text-center space-y-2 backdrop-blur-sm`}>
                      <span className="text-2xl block">{c.icon}</span>
                      <h3 className="text-xs font-bold text-white">{c.title}</h3>
                      <p className="text-[10px] text-zinc-600 leading-relaxed">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Rendered messages ── */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end msg-enter-right" : "justify-start msg-enter-left"}`}>
                {msg.role === "assistant" && (
                  <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-helix-purple to-helix-blue flex items-center justify-center shrink-0 mt-1 mr-3 shadow-lg shadow-helix-purple/15">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === "user"
                  ? "bg-gradient-to-br from-helix-purple/15 to-indigo-500/10 border border-helix-purple/20 rounded-2xl rounded-tr-sm px-5 py-3 shadow-lg shadow-helix-purple/5"
                  : "bg-zinc-900/60 border border-zinc-800/40 rounded-2xl rounded-tl-sm px-5 py-4 backdrop-blur-xl shadow-lg shadow-black/15"
                }`}>
                  {/* Category badge */}
                  {msg.role === "assistant" && msg.category && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-0.5 rounded-md bg-gradient-to-r ${msg.categoryColor} text-[9px] font-bold text-white uppercase tracking-wider`}>
                        {msg.category}
                      </span>
                    </div>
                  )}

                  <div className="text-sm leading-relaxed">
                    {msg.role === "user"
                      ? <span className="text-white">{msg.content}</span>
                      : <RichText text={msg.content} colorClass="text-zinc-300" />
                    }
                  </div>

                  {msg.code && <CodeBlock code={msg.code} codeFile={msg.codeFile} />}

                  {msg.links && msg.links.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-zinc-800/20 flex flex-wrap gap-1.5">
                      {msg.links.map((link) => (
                        <Link key={link.href} href={link.href}
                          className="group/link inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-helix-blue/8 border border-helix-blue/12 text-helix-blue text-[11px] font-medium hover:bg-helix-blue/20 hover:border-helix-blue/30 transition-all">
                          <svg className="w-2.5 h-2.5 group-hover/link:rotate-[-10deg] transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Follow-up suggestions */}
                  {msg.role === "assistant" && msg.followUp && msg.followUp.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-800/20 space-y-1">
                      <span className="text-[9px] text-zinc-600 uppercase tracking-wider font-semibold block mb-1.5">Related questions</span>
                      {msg.followUp.map((q, j) => (
                        <button key={j} onClick={() => sendMessage(q)} disabled={isTyping}
                          className="follow-up-btn w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-800/40 text-zinc-500 hover:text-zinc-300 text-xs transition-all group/fu disabled:opacity-30 cursor-pointer">
                          <svg className="w-3 h-3 text-helix-purple/50 group-hover/fu:text-helix-purple shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {q}
                          <svg className="w-3 h-3 ml-auto opacity-0 group-hover/fu:opacity-60 text-zinc-500 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}

                  <TimeStamp ts={msg.timestamp} />
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center shrink-0 mt-1 ml-3 shadow-lg">
                    <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}

            {/* Live typewriter */}
            {displayedText !== null && currentAnswer && (
              <div className="flex justify-start msg-enter-left">
                <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-helix-purple to-helix-blue flex items-center justify-center shrink-0 mt-1 mr-3 shadow-lg shadow-helix-purple/15">
                  <svg className="w-4 h-4 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div className="max-w-[80%] bg-zinc-900/60 border border-zinc-800/40 rounded-2xl rounded-tl-sm px-5 py-4 backdrop-blur-xl shadow-lg shadow-black/15">
                  {currentAnswer.category && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-0.5 rounded-md bg-gradient-to-r ${currentAnswer.categoryColor} text-[9px] font-bold text-white uppercase tracking-wider`}>
                        {currentAnswer.category}
                      </span>
                    </div>
                  )}
                  <div className="text-sm leading-relaxed">
                    <RichText text={displayedText} colorClass="text-zinc-300" />
                    <span className="cursor-blink" />
                  </div>
                </div>
              </div>
            )}

            {/* Thinking indicator */}
            {isTyping && displayedText === null && (
              <div className="flex items-start gap-3 msg-enter-left">
                <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-helix-purple to-helix-blue flex items-center justify-center shrink-0 shadow-lg shadow-helix-purple/15">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800/40 rounded-2xl rounded-tl-sm px-5 py-3.5 flex items-center gap-3 backdrop-blur-xl">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-helix-purple" style={{ animation: "typingPulse 1.4s ease infinite" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-helix-purple" style={{ animation: "typingPulse 1.4s ease infinite 0.2s" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-helix-purple" style={{ animation: "typingPulse 1.4s ease infinite 0.4s" }} />
                  </div>
                  <span className="text-[10px] text-zinc-600 font-mono">{geminiEnabled ? "Thinking with Gemini..." : "Searching kernel source..."}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Input bar ── */}
        <div className="sticky bottom-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-8 pb-5 px-6" style={{ zIndex: 10 }}>
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-helix-purple/20 via-helix-blue/20 to-helix-purple/20 blur-sm transition-opacity duration-300"
                   style={{ opacity: input.length > 0 ? 0.8 : 0 }} />

              <div className="relative flex items-center bg-zinc-900/70 border border-zinc-800/40 rounded-2xl px-4 py-1 focus-within:border-helix-purple/30 focus-within:shadow-[0_0_30px_rgba(123,104,238,0.08)] transition-all backdrop-blur-xl">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-helix-purple/15 to-helix-blue/15 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-helix-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder={s("input_placeholder")}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-600 px-3 py-3 text-sm"
                  disabled={isTyping} />
                <button type="submit" disabled={!input.trim() || isTyping}
                  className="w-9 h-9 rounded-xl bg-gradient-to-r from-helix-purple to-helix-blue hover:from-helix-purple/90 hover:to-helix-blue/90 flex items-center justify-center transition-all disabled:opacity-15 cursor-pointer shrink-0 shadow-lg shadow-helix-purple/15 hover:shadow-helix-purple/25 hover:scale-105 active:scale-95">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2.5 mt-2.5">
              <p className="text-[9px] text-zinc-700">
                {geminiEnabled ? s("powered_by_gemini") : s("powered_by_kb")}
              </p>
              <span className="text-zinc-800">·</span>
              <p className="text-[9px] text-zinc-700">
                {geminiEnabled ? "Streaming responses from Gemini 2.0 Flash" : "Answers from indexed knowledge base — not a live AI model"}
              </p>
            </div>
          </form>
        </div>

        {/* ── Settings Modal ── */}
        {showSettings && (
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 100 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
              {/* Modal header */}
              <div className="px-6 py-4 border-b border-zinc-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-helix-purple to-helix-blue flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">NEXUS Settings</h3>
                    <p className="text-[10px] text-zinc-500">Configure AI backend</p>
                  </div>
                </div>
                <button onClick={() => setShowSettings(false)} className="w-7 h-7 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/60 flex items-center justify-center transition-colors cursor-pointer">
                  <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal body */}
              <div className="px-6 py-5 space-y-5">
                {/* Status */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/40">
                  <div className={`w-2.5 h-2.5 rounded-full ${geminiEnabled ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`} />
                  <span className="text-xs text-zinc-300">
                    {geminiEnabled ? "Gemini 2.0 Flash connected — real AI answers" : "Knowledge base mode — offline answers only"}
                  </span>
                </div>

                {/* API Key input */}
                <div className="space-y-2">
                  <label className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Google Gemini API Key</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={keyInput}
                      onChange={e => setKeyInput(e.target.value)}
                      placeholder="AIza..."
                      className="w-full bg-zinc-800/50 border border-zinc-700/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-helix-purple/40 focus:shadow-[0_0_20px_rgba(123,104,238,0.08)] transition-all font-mono"
                    />
                    {keyInput && (
                      <button
                        onClick={() => setKeyInput("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-600 leading-relaxed">
                    Get a free key from{" "}
                    <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-helix-purple hover:text-helix-purple/80 underline underline-offset-2">
                      Google AI Studio
                    </a>
                    . Your key is stored locally in your browser — never sent to our servers.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      if (keyInput.trim()) {
                        setApiKey(keyInput.trim());
                        setGeminiEnabled(true);
                        localStorage.setItem("helix-gemini-key", keyInput.trim());
                        resetGeminiChat();
                      }
                      setShowSettings(false);
                    }}
                    disabled={!keyInput.trim()}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-helix-purple to-helix-blue text-white text-xs font-bold hover:from-helix-purple/90 hover:to-helix-blue/90 transition-all disabled:opacity-30 cursor-pointer shadow-lg shadow-helix-purple/15"
                  >
                    {geminiEnabled ? "Update Key" : "Connect Gemini"}
                  </button>
                  {geminiEnabled && (
                    <button
                      onClick={() => {
                        setApiKey("");
                        setGeminiEnabled(false);
                        setKeyInput("");
                        localStorage.removeItem("helix-gemini-key");
                        resetGeminiChat();
                        setShowSettings(false);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all cursor-pointer"
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </div>

              {/* Modal footer */}
              <div className="px-6 py-3 border-t border-zinc-800/40 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <span className="text-[10px] text-zinc-600">API calls are made directly from your browser. No data is stored on our servers.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
