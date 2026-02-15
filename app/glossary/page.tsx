import type { Metadata } from "next";
import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import InfoTable from "@/helix-wiki/components/InfoTable";
import Footer from "@/helix-wiki/components/Footer";

export const metadata: Metadata = {
  title: "Glossary — Helix OS Technical Terminology",
  description: "Comprehensive glossary of Helix OS terms: architecture, memory management, scheduling (DIS), filesystem (HelixFS), HAL, IPC, boot process, security, and Rust-specific concepts.",
  alternates: { canonical: "/glossary" },
  openGraph: {
    title: "Helix OS Glossary — 100+ Technical Terms Defined",
    description: "Reference dictionary for Helix OS — architecture, DIS scheduler, HelixFS, HAL, IPC, boot, security, and Rust kernel development terms.",
    url: "https://helix-wiki.com/glossary",
  },
};

interface Term {
  term: string;
  definition: string;
}

function GlossaryGroup({ title, terms }: { title: string; terms: Term[] }) {
  return (
    <div className="mb-10">
      <h3 className="text-xl font-bold text-white mb-5 border-l-4 border-helix-purple pl-4">{title}</h3>
      <dl className="space-y-4">
        {terms.map((t) => (
          <div key={t.term} className="rounded-lg border border-white/10 bg-white/[0.02] px-5 py-4">
            <dt className="font-semibold text-helix-blue">{t.term}</dt>
            <dd className="mt-1 text-gray-300 text-[15px] leading-relaxed">{t.definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function GlossaryPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader
        title="Glossary"
        subtitle="A comprehensive reference of technical terms used throughout Helix OS documentation — from architecture concepts to Rust-specific kernel development vocabulary."
        badge="REFERENCE"
      />

      {/* ── ARCHITECTURE ── */}
      <Section title="Architecture" id="architecture">
        <GlossaryGroup
          title="Kernel Architecture"
          terms={[
            { term: "Capability Broker", definition: "Helix component that manages and distributes capabilities (access-right tokens) to modules, ensuring each module only accesses authorized resources." },
            { term: "Differentiated Intent Scheduler (DIS)", definition: "Helix's custom scheduler using intent classes (Realtime, Interactive, Batch, Background) instead of raw priorities. Tasks declare behavioral requirements and the scheduler optimizes accordingly." },
            { term: "HAL (Hardware Abstraction Layer)", definition: "The helix-hal crate providing trait-based abstractions over CPU, MMU, interrupts, and firmware — enabling platform-independent kernel code." },
            { term: "Helix Core", definition: "The helix-core crate containing IPC, orchestration, interrupt handling, syscall dispatch, and module management." },
            { term: "Higher-Half Kernel", definition: "Kernel mapped to the upper portion of virtual memory (above 0xFFFF_8000_0000_0000 on x86_64), leaving the lower half for user space." },
            { term: "Hot-Reload", definition: "Replacing or updating kernel modules at runtime without rebooting. Helix supports hot-reload for schedulers and other extensible components with automatic rollback on failure." },
            { term: "Orchestrator", definition: "Helix component managing module lifecycle, panic handling, and coordination between kernel subsystems." },
            { term: "Resource Broker", definition: "Component that allocates system resources (memory, I/O ports, IRQs) to modules, preventing conflicts." },
          ]}
        />
      </Section>

      {/* ── MEMORY ── */}
      <Section title="Memory Management" id="memory">
        <GlossaryGroup
          title="Memory"
          terms={[
            { term: "Buddy Allocator", definition: "Allocation algorithm dividing memory into power-of-two blocks. Larger blocks split on allocation; buddy blocks merge when both are free." },
            { term: "Copy-on-Write (CoW)", definition: "Optimization where shared pages are only duplicated when written to — until then, all processes share the same physical page." },
            { term: "Demand Paging", definition: "Pages loaded into memory only on first access, triggering a page fault that loads from disk or allocates a frame." },
            { term: "Frame", definition: "A fixed-size (4 KiB) unit of physical memory. Also called a page frame." },
            { term: "Frame Allocator", definition: "Kernel component managing physical frames. Helix uses bitmap + buddy allocators." },
            { term: "Higher-Half Offset", definition: "Constant (0xFFFF_8000_0000_0000) added to physical addresses to compute their virtual addresses in the higher-half mapping." },
            { term: "Huge Page", definition: "Memory pages larger than 4 KiB (2 MiB or 1 GiB on x86_64). Reduces TLB pressure but increases internal fragmentation." },
            { term: "Page Table", definition: "Hierarchical structure for virtual→physical translation. x86_64 uses 4 levels: PML4 → PDP → PD → PT." },
            { term: "Slab Allocator", definition: "Allocator optimized for frequently allocated fixed-size objects, pre-allocating object 'slabs' to reduce overhead." },
            { term: "TLB (Translation Lookaside Buffer)", definition: "CPU cache for virtual→physical translations. Must be flushed when page tables change." },
          ]}
        />
      </Section>

      {/* ── SCHEDULING ── */}
      <Section title="Scheduling" id="scheduling">
        <GlossaryGroup
          title="DIS & Task Management"
          terms={[
            { term: "Batch Task", definition: "DIS task type for CPU-intensive work. Gets larger time slices but may be delayed for interactive tasks." },
            { term: "Context Switch", definition: "Saving one task's state and loading another's — registers, stack pointer, instruction pointer, and flags." },
            { term: "EDF (Earliest Deadline First)", definition: "Scheduling algorithm running the task with the closest deadline. Optimal for periodic realtime tasks when utilization ≤ 100%." },
            { term: "Intent", definition: "High-level description of a task's behavioral requirements: class (realtime/interactive/batch/background), constraints, and QoS parameters." },
            { term: "Priority Inversion", definition: "Pathological condition where a high-priority task waits for a low-priority one preempted by medium-priority. DIS uses priority inheritance to mitigate." },
            { term: "Quantum", definition: "Maximum continuous CPU time for a task before preemption. Also called a time slice." },
            { term: "Runqueue", definition: "Per-CPU queue of tasks ready to execute. DIS maintains separate runqueues per scheduling class." },
            { term: "Task State", definition: "Ready (in runqueue), Running (executing), Blocked (waiting), Suspended (paused), or Zombie (terminated, awaiting cleanup)." },
          ]}
        />
      </Section>

      {/* ── FILESYSTEM ── */}
      <Section title="Filesystem" id="filesystem">
        <GlossaryGroup
          title="HelixFS"
          terms={[
            { term: "B-Tree", definition: "Self-balancing tree used by HelixFS for directory indexing and extent management. Provides O(log n) operations and is optimized for disk I/O." },
            { term: "Block", definition: "Basic unit of disk I/O, typically 4 KiB in HelixFS." },
            { term: "Extent", definition: "Contiguous range of disk blocks representing file data (e.g., start_block=1000, count=100 = blocks 1000–1099)." },
            { term: "Inode", definition: "Data structure containing file metadata (size, permissions, timestamps) and storage info (extents or inline data)." },
            { term: "Journal", definition: "Log of pending filesystem changes for crash recovery. HelixFS journals metadata changes to ensure consistency after unexpected shutdown." },
            { term: "Snapshot", definition: "Point-in-time copy of filesystem state. HelixFS uses CoW to create space-efficient snapshots." },
            { term: "Superblock", definition: "Root metadata structure: magic number, version, config, root inode, and allocation state." },
            { term: "VFS (Virtual File System)", definition: "Abstraction layer allowing different filesystem implementations to provide a uniform interface." },
          ]}
        />
      </Section>

      {/* ── HARDWARE ── */}
      <Section title="Hardware Abstraction" id="hardware">
        <GlossaryGroup
          title="Hardware & CPU"
          terms={[
            { term: "ACPI", definition: "Advanced Configuration and Power Interface — open standard for hardware discovery, power management, and thermal control." },
            { term: "APIC", definition: "Advanced Programmable Interrupt Controller. Includes Local APIC (per-CPU) and I/O APIC (device interrupts)." },
            { term: "CR3", definition: "x86 control register holding the physical address of the top-level page table (PML4). Changing CR3 switches address spaces." },
            { term: "GDT (Global Descriptor Table)", definition: "x86 structure defining memory segments. In 64-bit mode, primarily used for privilege transitions and TSS." },
            { term: "IDT (Interrupt Descriptor Table)", definition: "x86 structure mapping interrupt vectors to handler functions." },
            { term: "IST (Interrupt Stack Table)", definition: "x86_64 feature allowing specific exceptions to switch to dedicated stacks. Used for double fault handling." },
            { term: "Long Mode", definition: "x86_64 64-bit operating mode. Enables 64-bit registers, larger virtual address space, and modern features." },
            { term: "MSI (Message Signaled Interrupts)", definition: "Modern interrupt delivery where devices write to special memory addresses instead of using interrupt lines." },
            { term: "TSS (Task State Segment)", definition: "x86 structure containing interrupt stack pointers. Required even in 64-bit mode." },
          ]}
        />
      </Section>

      {/* ── IPC & BOOT ── */}
      <Section title="IPC & Boot" id="ipc-boot">
        <GlossaryGroup
          title="Communication & Startup"
          terms={[
            { term: "Channel", definition: "Typed, unidirectional IPC link between two endpoints. Supports synchronous and asynchronous messaging." },
            { term: "Event Bus", definition: "Pub/sub system for decoupled communication. Producers publish events; subscribers receive matching ones." },
            { term: "Multiboot2", definition: "Boot protocol defining how bootloaders pass information (memory map, command line, modules) to kernels." },
            { term: "GRUB", definition: "GRand Unified Bootloader — loads the Helix kernel and passes Multiboot2 info." },
            { term: "Kernel Entry", definition: "The first Rust function (kernel_main) called after boot assembly completes the 32→64 bit transition." },
          ]}
        />
      </Section>

      {/* ── SECURITY ── */}
      <Section title="Security" id="security">
        <GlossaryGroup
          title="Protection & Isolation"
          terms={[
            { term: "Capability", definition: "Transferable token representing the right to perform specific operations. More flexible than traditional permission bits." },
            { term: "Ring", definition: "x86 privilege level (0–3). Kernel runs in Ring 0; user space runs in Ring 3." },
            { term: "SMEP", definition: "Supervisor Mode Execution Prevention — CPU feature preventing Ring 0 from executing code in user-space pages." },
            { term: "SMAP", definition: "Supervisor Mode Access Prevention — CPU feature preventing Ring 0 from reading/writing user-space pages except when explicitly enabled." },
          ]}
        />
      </Section>

      {/* ── RUST ── */}
      <Section title="Rust-Specific" id="rust">
        <GlossaryGroup
          title="Rust Kernel Development"
          terms={[
            { term: "#![no_std]", definition: "Crate attribute indicating code runs without the Rust standard library. Required for kernel development." },
            { term: "Alloc Crate", definition: "Provides heap types (Box, Vec, String) without the full std library." },
            { term: "Global Allocator", definition: "Memory allocator used by the alloc crate. Helix provides a custom #[global_allocator]." },
            { term: "Never Type (!)", definition: "Type representing computations that never complete (infinite loops, panics). Used for diverging functions like the kernel entry point." },
            { term: "Unsafe", definition: "Rust keyword marking code the compiler cannot verify for memory safety. Required for hardware register access, inline assembly, and raw pointer dereference." },
          ]}
        />
      </Section>

      {/* ── ABBREVIATIONS ── */}
      <Section title="Abbreviations" id="abbreviations">
        <InfoTable
          columns={[
            { header: "Abbrev.", key: "abbr" },
            { header: "Full Form", key: "full" },
          ]}
          rows={[
            { abbr: "ACPI", full: "Advanced Configuration and Power Interface" },
            { abbr: "APIC", full: "Advanced Programmable Interrupt Controller" },
            { abbr: "CoW", full: "Copy-on-Write" },
            { abbr: "DIS", full: "Differentiated Intent Scheduler" },
            { abbr: "EDF", full: "Earliest Deadline First" },
            { abbr: "GDT", full: "Global Descriptor Table" },
            { abbr: "HAL", full: "Hardware Abstraction Layer" },
            { abbr: "IDT", full: "Interrupt Descriptor Table" },
            { abbr: "IPC", full: "Inter-Process Communication" },
            { abbr: "IRQ", full: "Interrupt Request" },
            { abbr: "IST", full: "Interrupt Stack Table" },
            { abbr: "MMU", full: "Memory Management Unit" },
            { abbr: "MSI", full: "Message Signaled Interrupts" },
            { abbr: "NMI", full: "Non-Maskable Interrupt" },
            { abbr: "PML4", full: "Page Map Level 4" },
            { abbr: "QEMU", full: "Quick EMUlator" },
            { abbr: "RDTSC", full: "Read Time-Stamp Counter" },
            { abbr: "SMAP", full: "Supervisor Mode Access Prevention" },
            { abbr: "SMEP", full: "Supervisor Mode Execution Prevention" },
            { abbr: "SMP", full: "Symmetric Multi-Processing" },
            { abbr: "TLB", full: "Translation Lookaside Buffer" },
            { abbr: "TSS", full: "Task State Segment" },
            { abbr: "VFS", full: "Virtual File System" },
          ]}
        />
      </Section>

      <Footer />
    </div>
  );
}
