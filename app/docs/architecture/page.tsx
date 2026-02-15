"use client";

import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import Footer from "@/helix-wiki/components/Footer";
import LayerStack from "@/helix-wiki/components/diagrams/LayerStack";
import DependencyGraph from "@/helix-wiki/components/diagrams/DependencyGraph";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import architectureContent from "@/helix-wiki/lib/docs-i18n/architecture";

export default function ArchitecturePage() {
  const { locale } = useI18n();
  const d = (key: string) => getDocString(architectureContent, locale, key);
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader
        title={d("header.title")}
        subtitle={d("header.subtitle")}
        badge={d("header.badge")}
      />

      {/* ── LAYER STACK ── */}
      <Section title="Layer Stack" id="layers">
        <p>{d("layers.intro")}</p>
        <LayerStack layers={[
          { label: "Modules (Schedulers, Drivers, Filesystems, Security)", detail: "Policy layer", color: "purple",
            description: "Hot-swappable policy modules implementing scheduling, filesystem, security, and driver logic. All replaceable at runtime via trait-based interfaces.",
            info: { components: ["CFS Scheduler", "EDF Scheduler", "VFS Driver", "Firewall Module", "GPU Driver"], metrics: [{ label: "Modules", value: "12+", color: "#7B68EE" }, { label: "Hot-Swap", value: "Oui", color: "#22C55E" }], api: ["ModuleTrait::init()", "ModuleTrait::cleanup()", "register_module()"], status: "active" } },
          { label: "Subsystems (Memory, Execution, DIS, Init, NEXUS)", detail: "Services", color: "blue",
            description: "Core services bridging hardware abstraction with module policies. Manages memory allocation, process execution, device initialization, and AI-driven optimization.",
            info: { components: ["Memory Manager", "Execution Engine", "DIS (Device Init)", "Init Framework", "NEXUS AI"], metrics: [{ label: "LoC", value: "~200K" }, { label: "Subsystems", value: "6", color: "#4A90E2" }], api: ["alloc_pages()", "spawn_process()", "nexus_predict()"], dependencies: ["core", "hal"], status: "active" } },
          { label: "Core Kernel (Orchestrator, IPC, Syscall, Self-Heal)", detail: "TCB · 6.4K LoC", color: "cyan",
            description: "Minimal Trusted Computing Base — only mechanism, never policy. Provides IPC channels, syscall dispatch, event routing, and self-healing coordination. Entire TCB fits in ~6,400 lines.",
            info: { components: ["Orchestrator", "IPC Engine", "Syscall Table", "Self-Heal Monitor", "Event Router"], metrics: [{ label: "LoC", value: "6,400", color: "#22D3EE" }, { label: "Fichiers", value: "25" }, { label: "Sécurité", value: "TCB", color: "#EF4444" }], api: ["ipc_send()", "ipc_recv()", "syscall_dispatch()", "self_heal()"], status: "critical" } },
          { label: "HAL (CPU, MMU, Interrupts, Firmware, KASLR)", detail: "HW abstraction", color: "amber",
            description: "Hardware Abstraction Layer supporting x86_64, AArch64, and RISC-V. Handles CPU initialization, memory mapping, interrupt routing, firmware queries, and KASLR randomization.",
            info: { components: ["CPU Init", "MMU/Page Tables", "IDT/GDT", "ACPI Parser", "KASLR Engine"], metrics: [{ label: "Arch.", value: "3", color: "#F59E0B" }, { label: "LoC", value: "~61K" }], api: ["map_page()", "handle_interrupt()", "read_msr()"], dependencies: ["boot"], status: "active" } },
          { label: "Boot (Limine / UEFI / Multiboot2)", detail: "Protocol", color: "green",
            description: "Multi-protocol boot support — the kernel can boot via Limine, UEFI, or Multiboot2. Each protocol adapter translates boot info into a unified BootContext structure.",
            info: { components: ["Limine Adapter", "UEFI Adapter", "Multiboot2 Adapter"], metrics: [{ label: "Protocoles", value: "3", color: "#22C55E" }], api: ["BootContext::memory_map()", "BootContext::framebuffer()"], status: "active" } },
        ]} />
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">{d("layers.tcb.title")}</h4>
            <p className="text-sm text-zinc-400">{d("layers.tcb.desc")}</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">{d("layers.hotswap.title")}</h4>
            <p className="text-sm text-zinc-400">{d("layers.hotswap.desc")}</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">{d("layers.ai.title")}</h4>
            <p className="text-sm text-zinc-400">{d("layers.ai.desc")}</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">{d("layers.multiarch.title")}</h4>
            <p className="text-sm text-zinc-400">{d("layers.multiarch.desc")}</p>
          </div>
        </div>
      </Section>

      {/* ── WORKSPACE ── */}
      <Section title="Workspace Structure" id="workspace">
        <p>{d("workspace.intro")}</p>
        <RustCode filename="Cargo.toml" language="toml">{`[workspace]
resolver = "2"

[workspace.package]
version = "0.4.0"          # Codename: "Aurora"
edition = "2024"
license = "MIT OR Apache-2.0"
repository = "https://github.com/AltairMusic/helix"

members = [
    "boot/multiboot2",           # Multiboot2 boot protocol
    "boot/limine",               # Limine Rev 2 protocol (PIE/KASLR)
    "boot/uefi",                 # UEFI boot platform
    "hal",                       # Hardware Abstraction Layer
    "core",                      # Trusted Computing Base
    "subsystems/execution",      # Thread/process management
    "subsystems/memory",         # Physical & virtual memory
    "subsystems/dis",            # Dynamic Intent Scheduler
    "subsystems/init",           # DAG-based init framework
    "subsystems/userspace",      # ELF loader, shell, runtime
    "subsystems/relocation",     # PIE/KASLR relocation engine
    "subsystems/nexus",          # AI/ML intelligence engine
    "modules",                   # Module system framework
    "modules_impl/schedulers/round_robin",
    "benchmarks",                # Performance benchmarks
    "fs",                        # HelixFS filesystem
    "profiles/minimal",          # Minimal bootable profile
]

exclude = ["graphics", "boot/src"]`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("workspace.deps.title")}</h3>
        <p>{d("workspace.deps.intro")}</p>
        <InfoTable
          columns={[
            { header: "Crate", key: "crate" },
            { header: "Version", key: "version" },
            { header: "Purpose", key: "purpose" },
          ]}
          rows={[
            { crate: "spin", version: "0.9", purpose: "Spinlock primitives (no_std)" },
            { crate: "bitflags", version: "2.4", purpose: "Type-safe flag enums" },
            { crate: "log", version: "0.4", purpose: "Logging facade" },
            { crate: "static_assertions", version: "1.1", purpose: "Compile-time size/layout checks" },
            { crate: "cfg-if", version: "1.0", purpose: "Conditional compilation" },
            { crate: "paste", version: "1.0", purpose: "Macro identifier concatenation" },
            { crate: "hashbrown", version: "0.14", purpose: "no_std HashMap / HashSet" },
            { crate: "arrayvec", version: "0.7", purpose: "Stack-allocated Vec (no heap)" },
            { crate: "heapless", version: "0.8", purpose: "Fixed-capacity collections" },
            { crate: "embedded-io", version: "0.6", purpose: "Embedded I/O traits" },
            { crate: "libm", version: "0.2", purpose: "Math for no_std (NEXUS ML engine)" },
          ]}
        />
      </Section>

      {/* ── DEPENDENCY GRAPH ── */}
      <Section title="Crate Dependency Graph" id="deps">
        <p>{d("deps.intro")}</p>
        <DependencyGraph
          title="Crate Dependency Graph"
          width={820}
          height={650}
          nodes={[
            { id: "profiles", label: "profiles/", detail: "Bootable images", x: 340, y: 10, width: 140, height: 40, color: "zinc",
              tooltip: "Build profiles for different targets",
              info: { description: "Bootable image profiles that combine kernel, modules, and configuration into deployable ISO/disk images.", status: "stable", stats: [{ label: "Targets", value: "3" }, { label: "Type", value: "Build" }], features: ["Limine ISO profile", "UEFI disk profile", "QEMU test profile"] } },
            { id: "nexus", label: "nexus", detail: "812K LoC", x: 100, y: 90, width: 130, height: 40, color: "emerald",
              tooltip: "AI/ML-powered kernel intelligence engine",
              info: { description: "NEXUS is the AI brain of Helix — 812K lines of ML models, anomaly detectors, crash predictors, and self-healing logic. Runs entirely in kernel space with no_std.", status: "wip", loc: "812K LoC", stats: [{ label: "ML Models", value: "6" }, { label: "Prédiction", value: "✓" }, { label: "Quarantine", value: "✓" }, { label: "Self-Heal", value: "✓" }], features: ["Decision trees & Random forests", "Neural network inference", "Crash prediction & failure classification", "Anomaly detection via statistical models", "Quarantine isolation & resource fencing", "Hot-swap & live recovery"] } },
            { id: "modules", label: "modules", detail: "framework", x: 345, y: 90, width: 130, height: 40, color: "purple",
              tooltip: "Module system framework & trait definitions",
              info: { description: "The module framework defines ModuleTrait, lifecycle state machine, hot-reload protocol, and module registry. All kernel extensions implement these traits.", status: "stable", stats: [{ label: "Traits", value: "4" }, { label: "États", value: "9" }], features: ["ModuleTrait lifecycle", "Hot-reload protocol", "Module registry", "Capability-based permissions"] } },
            { id: "benchmarks", label: "benchmarks", detail: "", x: 590, y: 90, width: 130, height: 40, color: "zinc",
              tooltip: "Performance benchmarks for kernel components",
              info: { description: "Benchmark suite measuring IPC latency, context switch time, memory allocation throughput, and syscall overhead.", status: "stable", features: ["IPC latency measurement", "Context switch benchmarks", "Allocation throughput tests"] } },
            { id: "subsystems", label: "subsystems/", detail: "memory · execution · dis · init · userspace · relocation", x: 210, y: 180, width: 400, height: 50, color: "blue",
              tooltip: "6 core subsystems bridging HW and modules",
              info: { description: "Six subsystems providing core OS services: virtual memory management, process execution, device initialization, boot sequencing, userspace transition, and binary relocation.", status: "stable", loc: "~200K LoC", stats: [{ label: "Subsystems", value: "6" }, { label: "LoC", value: "~200K" }], features: ["Virtual memory with demand paging", "Multi-core process scheduling", "Ordered device initialization with rollback", "ELF loading & relocation", "Userspace ring-3 transition", "Init dependency graph with phases"] } },
            { id: "core", label: "core", detail: "TCB · 6.4K LoC", x: 340, y: 280, width: 140, height: 42, color: "cyan",
              tooltip: "Trusted Computing Base — minimal kernel core",
              info: { description: "The Trusted Computing Base — only ~6,400 lines of code that must be correct. Implements IPC, syscall dispatch, orchestrator, and event routing. Mechanism only, never policy.", status: "stable", loc: "6.4K LoC", version: "0.1.0", stats: [{ label: "LoC", value: "6,400" }, { label: "Fichiers", value: "25" }, { label: "Sécurité", value: "TCB" }], features: ["Zero-copy IPC channels", "Capability-based syscall dispatch", "Orchestrator trait for module coordination", "Self-healing event monitor", "Minimal attack surface"] } },
            { id: "hal", label: "hal", detail: "HW abstraction", x: 340, y: 370, width: 140, height: 42, color: "amber",
              tooltip: "Hardware Abstraction for x86_64, AArch64, RISC-V",
              info: { description: "Multi-architecture HAL supporting x86_64, AArch64, and RISC-V64. Abstracts CPU init, paging, interrupts, firmware, and KASLR behind unified traits.", status: "stable", loc: "~61K LoC", stats: [{ label: "Architectures", value: "3" }, { label: "LoC", value: "~61K" }], features: ["x86_64 (30K LoC)", "AArch64 (18K LoC)", "RISC-V 64 (13K LoC)", "ACPI/DeviceTree parsing", "KASLR randomization"] } },
            { id: "limine", label: "limine", x: 190, y: 460, width: 110, height: 36, color: "green",
              tooltip: "Limine boot protocol adapter",
              info: { description: "Adapter for the Limine boot protocol. Translates Limine boot info (memory map, framebuffer, kernel address) into unified BootContext.", status: "stable", features: ["Memory map parsing", "Framebuffer setup", "RSDP/ACPI pointer extraction"] } },
            { id: "multiboot2", label: "multiboot2", x: 355, y: 460, width: 110, height: 36, color: "green",
              tooltip: "Multiboot2 boot protocol adapter",
              info: { description: "Multiboot2 specification adapter. Parses Multiboot2 tags for memory, framebuffer, and module information.", status: "stable", features: ["Tag-based info parsing", "Module loading", "GRUB compatibility"] } },
            { id: "uefi", label: "uefi", x: 520, y: 460, width: 110, height: 36, color: "green",
              tooltip: "UEFI boot protocol adapter",
              info: { description: "UEFI boot adapter using UEFI Boot Services and Runtime Services. Handles GOP framebuffer, memory map, and ACPI table discovery.", status: "stable", features: ["UEFI Boot Services", "GOP framebuffer", "Runtime Services bridge"] } },
            { id: "lumina", label: "Lumina", detail: "197K LoC · 14 crates", x: 80, y: 560, width: 180, height: 44, color: "pink",
              tooltip: "GPU graphics engine — independent workspace",
              info: { description: "Lumina is Helix's GPU graphics engine — 14 crates covering shader compilation (GLSL→IR→SPIR-V), render pipeline, material system, and GPU abstraction. Completely independent workspace.", status: "wip", loc: "197K LoC", stats: [{ label: "Crates", value: "14" }, { label: "LoC", value: "197K" }, { label: "Shaders", value: "SPIR-V" }], features: ["Shader compiler (GLSL → IR → SPIR-V)", "Render graph architecture", "PBR material system", "GPU memory suballocator", "Compute pipeline support"] } },
            { id: "helixfs", label: "HelixFS", detail: "42K LoC · 0 deps", x: 560, y: 560, width: 180, height: 44, color: "orange",
              tooltip: "Custom filesystem — zero external dependencies",
              info: { description: "HelixFS is Helix's custom filesystem — 42K lines of pure Rust with zero external dependencies. Features B+Tree indexing, copy-on-write snapshots, and ACID transactions.", status: "wip", loc: "42K LoC", stats: [{ label: "LoC", value: "42K" }, { label: "Deps", value: "0" }, { label: "Index", value: "B+Tree" }], features: ["B+Tree metadata indexing", "Copy-on-write snapshots", "ACID transactions", "Merkle tree integrity", "Extent-based allocation", "ARC caching layer"] } },
          ]}
          edges={[
            { from: "profiles", to: "nexus" },
            { from: "profiles", to: "modules" },
            { from: "profiles", to: "benchmarks" },
            { from: "nexus", to: "subsystems", label: "ML services" },
            { from: "modules", to: "subsystems", label: "module API" },
            { from: "benchmarks", to: "subsystems" },
            { from: "subsystems", to: "core", label: "TCB calls" },
            { from: "core", to: "hal", label: "HW traits" },
            { from: "hal", to: "limine" },
            { from: "hal", to: "multiboot2" },
            { from: "hal", to: "uefi" },
          ]}
        />
        <p className="text-xs text-zinc-500 text-center -mt-4 mb-4 italic">{d("deps.caption")}</p>
      </Section>

      {/* ── METRICS ── */}
      <Section title="Project Metrics" id="metrics">
        <p>{d("metrics.intro")}</p>
        <InfoTable
          columns={[
            { header: "Component", key: "component" },
            { header: "Lines", key: "lines" },
            { header: "Files", key: "files" },
            { header: "Crate Path", key: "crates" },
          ]}
          rows={[
            { component: "Core TCB", lines: "~6,400", files: "25", crates: "core/" },
            { component: "HAL (core traits)", lines: "~3,500", files: "7", crates: "hal/src/*.rs" },
            { component: "HAL (x86_64)", lines: "~30,000", files: "60+", crates: "hal/src/x86_64/" },
            { component: "HAL (AArch64)", lines: "~18,000", files: "40+", crates: "hal/src/aarch64/" },
            { component: "HAL (RISC-V 64)", lines: "~13,000", files: "30+", crates: "hal/src/riscv64/" },
            { component: "Boot (Limine)", lines: "~5,000+", files: "~50", crates: "boot/limine/" },
            { component: "Boot (Multiboot2)", lines: "~3,000+", files: "~30", crates: "boot/multiboot2/" },
            { component: "Boot (UEFI)", lines: "~2,000+", files: "~20", crates: "boot/uefi/" },
            { component: "Early Boot", lines: "~23,800", files: "33", crates: "boot/src/" },
            { component: "Init Framework", lines: "~17,700", files: "23", crates: "subsystems/init/" },
            { component: "Execution", lines: "~2,150", files: "14", crates: "subsystems/execution/" },
            { component: "Memory", lines: "~2,050", files: "12", crates: "subsystems/memory/" },
            { component: "DIS Scheduler", lines: "~11,600", files: "11", crates: "subsystems/dis/" },
            { component: "Relocation", lines: "~4,100", files: "12", crates: "subsystems/relocation/" },
            { component: "Userspace", lines: "~3,400", files: "7", crates: "subsystems/userspace/" },
            { component: "Module System", lines: "~2,560", files: "9", crates: "modules/" },
            { component: "HelixFS", lines: "~42,800", files: "66", crates: "fs/" },
            { component: "NEXUS Intelligence", lines: "~812,000", files: "2,346", crates: "subsystems/nexus/" },
            { component: "Lumina + Magma", lines: "~215,000", files: "335", crates: "graphics/ + drivers/gpu/" },
            { component: "Benchmarks", lines: "~6,300", files: "9", crates: "benchmarks/" },
            { component: "Profiles", lines: "~5,500", files: "12", crates: "profiles/" },
          ]}
        />
        <div className="mt-6 bg-gradient-to-r from-helix-blue/10 to-helix-purple/10 border border-helix-blue/20 rounded-xl p-5">
          <p className="text-lg font-semibold text-white mb-1">{d("metrics.total")}</p>
          <p className="text-sm text-zinc-400">{d("metrics.total.desc")}</p>
        </div>
      </Section>

      {/* ── BUILD PROFILES ── */}
      <Section title="Build Profiles" id="profiles">
        <p>{d("profiles.intro")}</p>
        <InfoTable
          columns={[
            { header: "Profile", key: "profile" },
            { header: "opt-level", key: "opt" },
            { header: "LTO", key: "lto" },
            { header: "Panic", key: "panic" },
            { header: "Strip", key: "strip" },
            { header: "Notes", key: "notes" },
          ]}
          rows={[
            { profile: "dev", opt: "0", lto: "off", panic: "abort", strip: "none", notes: "Default debug build" },
            { profile: "release", opt: "3", lto: "fat", panic: "abort", strip: "symbols", notes: "codegen-units = 1" },
            { profile: "release-with-debug", opt: "3", lto: "fat", panic: "abort", strip: "none", notes: "debug = 2" },
            { profile: "production", opt: "3", lto: "fat", panic: "abort", strip: "debuginfo", notes: "Final deployment" },
            { profile: "bench", opt: "3", lto: "thin", panic: "abort", strip: "none", notes: "Benchmarking" },
            { profile: "test", opt: "1", lto: "off", panic: "unwind", strip: "none", notes: "catch_unwind support" },
          ]}
        />
        <RustCode filename="Cargo.toml — profiles" language="toml">{`[profile.release]
panic = "abort"
opt-level = 3
lto = "fat"
codegen-units = 1
strip = "symbols"

[profile.release-with-debug]
inherits = "release"
debug = 2
strip = "none"

[profile.production]
inherits = "release"
strip = "debuginfo"

[profile.bench]
inherits = "release"
lto = "thin"

[profile.test]
opt-level = 1
lto = false
panic = "unwind"`}</RustCode>
      </Section>

      {/* ── TOOLCHAIN ── */}
      <Section title="Toolchain & Targets" id="toolchain">
        <p>{d("toolchain.intro")}</p>
        <RustCode filename="rust-toolchain.toml" language="toml">{`[toolchain]
channel = "nightly-2025-01-15"
components = [
    "rust-src",              # Source for cross-compilation
    "rustfmt",               # Code formatting
    "clippy",                # Lint checks
    "llvm-tools-preview",    # objcopy, strip, etc.
]
targets = [
    "x86_64-unknown-none",
    "aarch64-unknown-none",
    "riscv64gc-unknown-none-elf",
]`}</RustCode>
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">🖥️ x86_64</h4>
            <p className="text-sm text-zinc-400 mb-2">Primary. Full SMP, APIC, x2APIC, IOAPIC, HPET, PIT, TSC. 4/5-level paging. KASLR with RDRAND/RDSEED.</p>
            <p className="text-xs font-mono text-zinc-600">x86_64-unknown-none</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">📱 AArch64</h4>
            <p className="text-sm text-zinc-400 mb-2">GICv2/v3, PSCI power management, ASID-tagged TLB, EL1/EL2 exception levels, generic timer.</p>
            <p className="text-xs font-mono text-zinc-600">aarch64-unknown-none</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">🔬 RISC-V 64</h4>
            <p className="text-sm text-zinc-400 mb-2">RV64GC + SBI runtime, PLIC/CLINT, Sv39/Sv48/Sv57 paging, S-mode kernel.</p>
            <p className="text-xs font-mono text-zinc-600">riscv64gc-unknown-none-elf</p>
          </div>
        </div>
      </Section>

      {/* ── LINKER ── */}
      <Section title="Linker Scripts" id="linker">
        <p>{d("linker.intro")}</p>
        <RustCode filename="profiles/common/linker_base.ld" language="ld">{`__KERNEL_VMA_BASE = 0xFFFFFFFF80000000;  /* -2 GiB virtual */
__KERNEL_LMA_BASE = 0x0000000000200000;  /* 2 MiB physical */

PHDRS {
    text    PT_LOAD FLAGS(5);   /* R-X — executable code */
    rodata  PT_LOAD FLAGS(4);   /* R-- — read-only data */
    data    PT_LOAD FLAGS(6);   /* RW- — initialized data */
    bss     PT_LOAD FLAGS(6);   /* RW- — zero-initialized */
    dynamic PT_DYNAMIC;         /* For PIE relocation */
    relro   PT_GNU_RELRO;       /* Read-only after reloc */
    gnu_stack PT_GNU_STACK FLAGS(6);  /* NX stack */
}

SECTIONS {
    . = __KERNEL_VMA_BASE;

    .text ALIGN(2M) : AT(__KERNEL_LMA_BASE) {
        __text_start = .;
        *(.text .text.*)
        __text_end = .;
    } :text

    .rodata ALIGN(4K) : { *(.rodata .rodata.*) } :rodata
    .data   ALIGN(4K) : { *(.data .data.*)     } :data

    .bss ALIGN(4K) (NOLOAD) : {
        __bss_start = .;
        *(.bss .bss.* COMMON)
        __bss_end = .;
    } :bss

    __kernel_end = .;
}`}</RustCode>
      </Section>

      {/* ── BOOT SEQUENCE ── */}
      <Section title="Boot Sequence" id="boot">
        <p>{d("boot.intro")}</p>
        <RustCode filename="boot/src/lib.rs">{`pub enum BootStage {
    PreInit,        // Parse boot info, validate environment
    CpuInit,        // GDT, IDT, enable SSE/AVX/NX
    MemoryInit,     // Page tables, physical allocator, heap
    DriverInit,     // Serial, framebuffer, basic I/O
    InterruptInit,  // APIC/GIC/PLIC, register handlers
    TimerInit,      // HPET/PIT/Generic Timer calibration
    SmpInit,        // Wake APs, per-CPU data, IPI routing
    Handoff,        // Transfer to init subsystem
}

pub struct BootConfig {
    pub kaslr_enabled: bool,          // default: true
    pub kaslr_entropy_bits: u8,       // default: 12
    pub smp_enabled: bool,            // default: true
    pub max_cpus: usize,              // default: 256
    pub serial_port: SerialConfig,    // COM1 @ 0x3F8, 115200 8N1
    pub memory_mode: MemoryMode,      // FourLevel
    pub kernel_virt_base: u64,        // 0xFFFF_FFFF_8000_0000
    pub hhdm_offset: u64,            // 0xFFFF_8000_0000_0000
}

pub enum MemoryMode {
    FourLevel,  // x86_64 standard (48-bit VA)
    FiveLevel,  // x86_64 LA57 (57-bit VA)
    Sv39,       // RISC-V 39-bit
    Sv48,       // RISC-V 48-bit
    Sv57,       // RISC-V 57-bit
}

bitflags! {
    pub struct BootCapabilities: u64 {
        const UEFI        = 1 << 0;
        const ACPI        = 1 << 1;
        const SMP         = 1 << 2;
        const KASLR       = 1 << 3;
        const TPM         = 1 << 4;
        const FRAMEBUFFER = 1 << 5;
        const SERIAL      = 1 << 6;
        // ... 19 total capability flags
    }
}`}</RustCode>
        <h3 className="text-xl font-semibold text-white mt-10 mb-4">Minimal Profile Entry Point</h3>
        <p>{d("boot.minimal.intro")}</p>
        <RustCode filename="profiles/minimal/src/main.rs">{`#[no_mangle]
pub extern "C" fn kernel_main(multiboot2_info: *const u8) -> ! {
    // 1. Parse Multiboot2 boot information
    // 2. Initialize framebuffer console (PSF font, 1024x768)
    // 3. Initialize 4 MB bump-allocated kernel heap
    // 4. Initialize physical + virtual memory managers
    // 5. Initialize x86_64 HAL (GDT, IDT, APIC)
    // 6. Initialize DIS scheduler
    // 7. Initialize HelixFS (4 MB RAM disk)
    // 8. Start kernel →
    //    - Hot-reload demo (RoundRobin → Priority swap)
    //    - Self-heal demo (CrasherModule crash + recovery)
    //    - Full NEXUS demo (20-step AI exercise)
    //    - Benchmark suite
    loop { x86_64::instructions::hlt(); }
}`}</RustCode>
      </Section>

      {/* ── BUILD COMMANDS ── */}
      <Section title="Build & Run Commands" id="commands">
        <RustCode filename="terminal" language="bash">{`# ── Building ──
./scripts/build.sh              # Full release build (12 steps)
./scripts/build.sh --debug      # Debug build with DWARF info
./scripts/build.sh --iso        # Create bootable ISO
just build                      # Justfile alternative

# ── Running ──
./scripts/run_qemu.sh           # Boot in QEMU (auto-detects KVM)
./scripts/run_qemu.sh --debug   # QEMU + GDB server on :1234

# ── Testing ──
cargo test --target x86_64-unknown-linux-gnu --lib
./scripts/test.sh               # Full test suite

# ── Quality ──
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
make pre-commit                 # fmt + clippy + tests

# ── Analysis ──
size build/output/helix-kernel
objdump -d build/output/helix-kernel`}</RustCode>
        <h3 className="text-xl font-semibold text-white mt-10 mb-4">QEMU Targets</h3>
        <InfoTable
          columns={[
            { header: "Arch", key: "arch" },
            { header: "Machine", key: "machine" },
            { header: "CPU", key: "cpu" },
            { header: "Devices", key: "devices" },
          ]}
          rows={[
            { arch: "x86_64", machine: "q35", cpu: "host (KVM) / qemu64", devices: "VirtIO, debug 0x402, serial" },
            { arch: "aarch64", machine: "virt", cpu: "cortex-a72", devices: "GIC, PCI, serial" },
            { arch: "riscv64", machine: "virt", cpu: "rv64gc", devices: "PLIC, CLINT, VirtIO" },
          ]}
        />
      </Section>

      <Footer />
    </div>
  );
}
