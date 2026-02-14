import type { Metadata } from "next";
import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import Footer from "@/helix-wiki/components/Footer";
import LayerStack from "@/helix-wiki/components/diagrams/LayerStack";
import DependencyGraph from "@/helix-wiki/components/diagrams/DependencyGraph";

export const metadata: Metadata = {
  title: "Architecture — 5-Layer Kernel Design & Crate Dependency Graph",
  description: "Explore the Helix OS 5-layer architecture: HAL → Core → Subsystems → Modules → Userspace. ~20 Rust crates, strict dependency rules, and custom linker scripts for bare-metal targets.",
  alternates: { canonical: "/docs/architecture" },
  openGraph: {
    title: "Helix OS Architecture — Layered Kernel Design in Rust",
    description: "5-layer separation of concerns: HAL for hardware abstraction, Core for TCB orchestration, Subsystems for memory and scheduling, Modules for extensibility, and Userspace bridge.",
    url: "https://helix-wiki.com/docs/architecture",
  },
};

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader
        title="Architecture"
        subtitle="Helix follows a strict layered architecture where each layer only depends on the one below it. 1.37 million lines of Rust across ~3,300 files — zero external C dependencies, pure no_std."
        badge="DESIGN PHILOSOPHY"
      />

      {/* ── LAYER STACK ── */}
      <Section title="Layer Stack" id="layers">
        <p>The kernel is composed of five major layers. Each layer is a separate crate (or group of crates) in the Cargo workspace, with clear dependency boundaries. The golden rule: <strong className="text-white">mechanism, not policy</strong>. The core kernel never decides <em>what</em> to do — it only provides the tools for modules to decide.</p>
        <LayerStack layers={[
          { label: "Modules (Schedulers, Drivers, Filesystems, Security)", detail: "Policy layer", color: "purple" },
          { label: "Subsystems (Memory, Execution, DIS, Init, NEXUS)", detail: "Services", color: "blue" },
          { label: "Core Kernel (Orchestrator, IPC, Syscall, Self-Heal)", detail: "TCB · 6.4K LoC", color: "cyan" },
          { label: "HAL (CPU, MMU, Interrupts, Firmware, KASLR)", detail: "HW abstraction", color: "amber" },
          { label: "Boot (Limine / UEFI / Multiboot2)", detail: "Protocol", color: "green" },
        ]} />
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">🔒 Trusted Computing Base</h4>
            <p className="text-sm text-zinc-400">Only the Core crate (~6,400 lines) is trusted. It defines IPC, syscall dispatch, the orchestrator trait, and event routing — but never implements scheduling policies, allocation strategies, or filesystem logic.</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">🔌 Hot-Swappable Everything</h4>
            <p className="text-sm text-zinc-400">Schedulers, memory allocators, and even filesystem drivers can be replaced at runtime via the hot-reload system. Modules save state → new version loads → state is restored — zero downtime.</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">🧠 AI-Integrated</h4>
            <p className="text-sm text-zinc-400">NEXUS (812K lines) provides crash prediction, anomaly detection, self-healing, and ML-based optimization. The kernel doesn&apos;t just run — it <em>learns</em>.</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">🏗️ Multi-Architecture</h4>
            <p className="text-sm text-zinc-400">x86_64 (primary, APIC/IOAPIC/x2APIC), AArch64 (GICv2/v3, PSCI), RISC-V 64 (PLIC/CLINT, SBI). Same HAL trait — different backends.</p>
          </div>
        </div>
      </Section>

      {/* ── WORKSPACE ── */}
      <Section title="Workspace Structure" id="workspace">
        <p>The project is a Cargo workspace with <strong className="text-white">15 active member crates</strong> and 2 excluded (graphics workspace + boot/src):</p>
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

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">Workspace Dependencies</h3>
        <p>All crates share pinned dependency versions through the workspace — ensuring consistency and reproducibility:</p>
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
        <p>Each arrow means &quot;depends on&quot;. The boot layer is at the bottom; modules at the top. The TCB (<code className="text-helix-blue">core</code>) has minimal dependencies:</p>
        <DependencyGraph
          width={820}
          height={650}
          nodes={[
            { id: "profiles", label: "profiles/", detail: "Bootable images", x: 340, y: 10, width: 140, height: 40, color: "zinc" },
            { id: "nexus", label: "nexus", detail: "812K LoC", x: 100, y: 90, width: 130, height: 40, color: "emerald" },
            { id: "modules", label: "modules", detail: "framework", x: 345, y: 90, width: 130, height: 40, color: "purple" },
            { id: "benchmarks", label: "benchmarks", detail: "", x: 590, y: 90, width: 130, height: 40, color: "zinc" },
            { id: "subsystems", label: "subsystems/", detail: "memory · execution · dis · init · userspace · relocation", x: 210, y: 180, width: 400, height: 50, color: "blue" },
            { id: "core", label: "core", detail: "TCB · 6.4K LoC", x: 340, y: 280, width: 140, height: 42, color: "cyan" },
            { id: "hal", label: "hal", detail: "HW abstraction", x: 340, y: 370, width: 140, height: 42, color: "amber" },
            { id: "limine", label: "limine", x: 190, y: 460, width: 110, height: 36, color: "green" },
            { id: "multiboot2", label: "multiboot2", x: 355, y: 460, width: 110, height: 36, color: "green" },
            { id: "uefi", label: "uefi", x: 520, y: 460, width: 110, height: 36, color: "green" },
            { id: "lumina", label: "Lumina", detail: "197K LoC · 14 crates", x: 80, y: 560, width: 180, height: 44, color: "pink" },
            { id: "helixfs", label: "HelixFS", detail: "42K LoC · 0 deps", x: 560, y: 560, width: 180, height: 44, color: "orange" },
          ]}
          edges={[
            { from: "profiles", to: "nexus" },
            { from: "profiles", to: "modules" },
            { from: "profiles", to: "benchmarks" },
            { from: "nexus", to: "subsystems" },
            { from: "modules", to: "subsystems" },
            { from: "benchmarks", to: "subsystems" },
            { from: "subsystems", to: "core" },
            { from: "core", to: "hal" },
            { from: "hal", to: "limine" },
            { from: "hal", to: "multiboot2" },
            { from: "hal", to: "uefi" },
          ]}
        />
        <p className="text-xs text-zinc-500 text-center -mt-4 mb-4 italic">Separate workspaces shown at bottom — Lumina (graphics) and HelixFS are independent crate trees.</p>
      </Section>

      {/* ── METRICS ── */}
      <Section title="Project Metrics" id="metrics">
        <p>Lines of code measured across all member crates:</p>
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
          <p className="text-lg font-semibold text-white mb-1">Total: ~1,370,000 lines of Rust across ~3,300 files</p>
          <p className="text-sm text-zinc-400">Zero external C dependencies. Pure <code className="text-helix-blue">no_std</code> Rust with <code className="text-helix-blue">panic = &quot;abort&quot;</code>. No standard library, no libc, no allocator by default.</p>
        </div>
      </Section>

      {/* ── BUILD PROFILES ── */}
      <Section title="Build Profiles" id="profiles">
        <p>Six Cargo profiles cover every build scenario:</p>
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
        <p>Helix requires Rust nightly for unstable features like <code className="text-helix-blue">abi_x86_interrupt</code>, <code className="text-helix-blue">naked_functions</code>, and <code className="text-helix-blue">alloc_error_handler</code>:</p>
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
        <p>Each profile provides a linker script controlling the kernel memory layout. The higher-half kernel maps at <code className="text-helix-blue">0xFFFFFFFF80000000</code> (-2 GiB):</p>
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
        <p>The build pipeline is a 12-step process orchestrated by <code className="text-helix-blue">scripts/build.sh</code> (874 lines). At runtime, the kernel executes an 8-stage hardware initialization:</p>
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
        <p>The <code className="text-helix-blue">profiles/minimal</code> crate demonstrates the full boot-to-demo flow — parsing Multiboot2 info, initializing a 4 MB bump-allocated heap, and launching demo subsystems:</p>
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
