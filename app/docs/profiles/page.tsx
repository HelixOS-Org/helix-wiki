"use client";

import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import profilesContent from "@/helix-wiki/lib/docs-i18n/profiles";

export default function ProfilesPage() {
  const { locale } = useI18n();
  const d = (key: string) => getDocString(profilesContent, locale, key);
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader
        title={d("header.title")}
        subtitle={d("header.subtitle")}
        badge={d("header.badge")}
      />

      {/* ── OVERVIEW ── */}
      <Section title={d("section.how")} id="overview">
        <p>{d("how.intro")}</p>
        <div className="grid md:grid-cols-4 gap-4 mt-4">
          {[
            { num: "1", title: "Choose Profile", desc: "minimal, desktop, server, embedded, or secure", color: "helix-blue" },
            { num: "2", title: "Select Modules", desc: "Scheduler, allocator, filesystem, drivers", color: "helix-purple" },
            { num: "3", title: "Configure Policies", desc: "Security, resource limits, boot parameters", color: "helix-accent" },
            { num: "4", title: "Build Kernel", desc: "Cargo compiles your custom kernel binary", color: "green-400" },
          ].map((step) => (
            <div key={step.num} className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5 text-center">
              <div className={`text-3xl font-black text-${step.color} mb-2`}>{step.num}</div>
              <h4 className="text-white font-semibold text-sm">{step.title}</h4>
              <p className="text-xs text-zinc-500 mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── AVAILABLE PROFILES ── */}
      <Section title={d("section.available")} id="profiles">
        <p>{d("available.intro")}</p>
        <InfoTable
          columns={[
            { header: "Profile", key: "profile" },
            { header: "Target", key: "target" },
            { header: "Status", key: "status" },
            { header: "Description", key: "desc" },
          ]}
          rows={[
            { profile: <strong className="text-helix-blue">minimal</strong>, target: "Embedded / Testing", status: <span className="text-green-400">✅ Available</span>, desc: "Bare minimum kernel: serial console, basic memory, round-robin scheduler" },
            { profile: <strong className="text-helix-blue">limine</strong>, target: "Development", status: <span className="text-green-400">✅ Available</span>, desc: "Limine-booted kernel with framebuffer and full HAL" },
            { profile: <strong className="text-helix-blue">uefi</strong>, target: "Modern hardware", status: <span className="text-green-400">✅ Available</span>, desc: "UEFI direct boot with Secure Boot and TPM support" },
            { profile: <strong className="text-helix-purple">desktop</strong>, target: "Desktop OS", status: <span className="text-yellow-400">🔜 Planned</span>, desc: "Full desktop: CFS scheduler, graphics (Lumina), filesystem, networking" },
            { profile: <strong className="text-helix-purple">server</strong>, target: "Server OS", status: <span className="text-yellow-400">🔜 Planned</span>, desc: "Server workloads: priority scheduler, networking stack, no graphics" },
            { profile: <strong className="text-helix-purple">embedded</strong>, target: "IoT / Devices", status: <span className="text-yellow-400">🔜 Planned</span>, desc: "Minimal footprint: cooperative scheduler, static allocation only" },
            { profile: <strong className="text-helix-purple">secure</strong>, target: "Security-critical", status: <span className="text-yellow-400">🔜 Planned</span>, desc: "Hardened kernel: MAC, sandboxing, audit logging, minimal TCB" },
          ]}
        />
      </Section>

      {/* ── HELIX.TOML ── */}
      <Section title={d("section.config")} id="config">
        <p>{d("config.intro")}</p>

        <RustCode filename="profiles/myos/helix.toml" language="toml">{`# ═══════════════════════════════════════════════════════
# Profile Identity
# ═══════════════════════════════════════════════════════
[profile]
name = "myos"
version = "1.0.0"
description = "My custom operating system"
target = "desktop"        # desktop | server | embedded | secure

[profile.arch]
primary = "x86_64"        # Primary target architecture
supported = ["x86_64"]    # All supported architectures

[profile.features]
multicore = true          # SMP support
hot_reload = true         # Module hot-reload capability
userspace = true          # Enable userspace subsystem
networking = true         # Networking stack
filesystem = true         # Filesystem support
graphics = false          # Lumina GPU stack

# ═══════════════════════════════════════════════════════
# Memory Configuration
# ═══════════════════════════════════════════════════════
[memory]
min_ram_mb = 64           # Minimum RAM required
max_ram_mb = 4096         # Maximum RAM supported
heap_size_kb = 4096       # Kernel heap size
virtual_memory = true     # Enable virtual memory
huge_pages = true         # Enable 2M/1G pages

# ═══════════════════════════════════════════════════════
# Scheduler
# ═══════════════════════════════════════════════════════
[scheduler]
module = "cfs"            # cfs | round_robin | realtime | cooperative
time_slice_ms = 4         # Default time quantum
priority_levels = 140     # Number of priority levels
load_balancing = true     # Cross-CPU load balancing

# ═══════════════════════════════════════════════════════
# Memory Allocator
# ═══════════════════════════════════════════════════════
[allocator]
physical = "buddy"        # buddy | bitmap
heap = "slab"             # slab | tlsf | simple

# ═══════════════════════════════════════════════════════
# Modules
# ═══════════════════════════════════════════════════════
[modules.static]
# Modules linked into the kernel at compile time
modules = [
    "helix-scheduler-cfs",
    "helix-allocator-buddy",
    "helix-fs-ramfs",
]

[modules.dynamic]
# Modules loaded at runtime
modules = [
    "helix-driver-virtio",
]

# ═══════════════════════════════════════════════════════
# Boot
# ═══════════════════════════════════════════════════════
[boot]
protocol = "limine"       # limine | uefi | multiboot2
cmdline = "console=serial loglevel=4"
splash = true             # Show boot splash

# ═══════════════════════════════════════════════════════
# Security
# ═══════════════════════════════════════════════════════
[security]
capabilities = true       # Capability-based access control
mac = false               # Mandatory Access Control
sandbox = true            # Module sandboxing
secure_boot = false       # Require Secure Boot
tpm = false               # Use TPM for attestation

# ═══════════════════════════════════════════════════════
# Debugging
# ═══════════════════════════════════════════════════════
[debug]
level = "normal"          # minimal | normal | verbose | trace
symbols = true            # Include debug symbols
stack_traces = true       # Capture stack traces on panic
serial_console = true     # Enable serial output`}</RustCode>
      </Section>

      {/* ── CREATE PROFILE ── */}
      <Section title={d("section.creating")} id="create">
        <p>{d("creating.intro")}</p>

        <h3 className="text-xl font-semibold text-white mt-4 mb-4">Step 1: Directory Structure</h3>
        <RustCode filename="terminal" language="bash">{`# Create your profile directory
mkdir -p profiles/myos/src

# Create the configuration
touch profiles/myos/helix.toml
touch profiles/myos/Cargo.toml
touch profiles/myos/src/main.rs`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Step 2: Cargo.toml</h3>
        <RustCode filename="profiles/myos/Cargo.toml" language="toml">{`[package]
name = "myos"
version = "1.0.0"
edition = "2024"

[dependencies]
helix-core = { path = "../../core" }
helix-hal = { path = "../../hal" }
helix-modules = { path = "../../modules" }

# Choose your boot protocol
helix-boot-limine = { path = "../../boot/limine" }

# Choose your subsystems
helix-memory = { path = "../../subsystems/memory" }
helix-execution = { path = "../../subsystems/execution" }`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Step 3: Entry Point</h3>
        <RustCode filename="profiles/myos/src/main.rs">{`#![no_std]
#![no_main]

use helix_core::Kernel;

#[no_mangle]
pub extern "C" fn kernel_main(boot_info: *const BootInfo) -> ! {
    // Initialize the kernel with your configuration
    let mut kernel = Kernel::new();
    
    kernel.init_early(boot_info);    // HAL + serial
    kernel.init_memory();            // Physical + virtual allocators
    kernel.init_interrupts();        // IDT/GDT or GIC
    kernel.init_scheduler();         // Your chosen scheduler module
    kernel.init_modules();           // Load dynamic modules

    serial_println!("=== MyOS is running! ===");
    
    // Start the system
    kernel.start();
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Step 4: Build & Run</h3>
        <RustCode filename="terminal" language="bash">{`# Build your OS
cargo build --release --target x86_64-unknown-none \\
  --manifest-path profiles/myos/Cargo.toml

# Create ISO and boot
./scripts/build.sh --profile myos
./scripts/run_qemu.sh --profile myos`}</RustCode>
      </Section>

      {/* ── MODULE SELECTION ── */}
      <Section title={d("section.selection")} id="modules">
        <p>{d("selection.intro")}</p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Schedulers</h3>
        <InfoTable
          columns={[
            { header: "Module", key: "mod" },
            { header: "Type", key: "type" },
            { header: "Best For", key: "best" },
            { header: "Status", key: "status" },
          ]}
          rows={[
            { mod: <code className="text-helix-blue">round_robin</code>, type: "Preemptive", best: "Simple workloads, testing", status: <span className="text-green-400">✅ Implemented</span> },
            { mod: <code className="text-helix-blue">cfs</code>, type: "Fair share", best: "Desktop, general purpose", status: <span className="text-yellow-400">🔜 Planned</span> },
            { mod: <code className="text-helix-blue">realtime</code>, type: "FIFO/RR", best: "Real-time systems", status: <span className="text-yellow-400">🔜 Planned</span> },
            { mod: <code className="text-helix-blue">cooperative</code>, type: "Cooperative", best: "Embedded, low-overhead", status: <span className="text-yellow-400">🔜 Planned</span> },
            { mod: <code className="text-helix-blue">edf</code>, type: "Deadline", best: "Time-critical tasks", status: <span className="text-yellow-400">🔜 Planned</span> },
          ]}
        />

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Allocators</h3>
        <InfoTable
          columns={[
            { header: "Module", key: "mod" },
            { header: "Type", key: "type" },
            { header: "Trade-off", key: "tradeoff" },
            { header: "Status", key: "status" },
          ]}
          rows={[
            { mod: <code className="text-helix-blue">buddy</code>, type: "Physical", tradeoff: "Fast allocation, power-of-2 fragmentation", status: <span className="text-green-400">✅ Scaffolded</span> },
            { mod: <code className="text-helix-blue">bitmap</code>, type: "Physical", tradeoff: "Simple, O(n) allocation", status: <span className="text-green-400">✅ Scaffolded</span> },
            { mod: <code className="text-helix-blue">slab</code>, type: "Heap", tradeoff: "Fast fixed-size objects, pre-allocated", status: <span className="text-yellow-400">🔜 Planned</span> },
            { mod: <code className="text-helix-blue">tlsf</code>, type: "Heap", tradeoff: "O(1) alloc/free, deterministic for RT", status: <span className="text-yellow-400">🔜 Planned</span> },
          ]}
        />

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Filesystems</h3>
        <InfoTable
          columns={[
            { header: "Module", key: "mod" },
            { header: "Features", key: "features" },
            { header: "Status", key: "status" },
          ]}
          rows={[
            { mod: <code className="text-helix-blue">helixfs</code>, features: "CoW, B+tree, journal, snapshots, ARC cache, encryption", status: <span className="text-green-400">✅ ~42K LoC</span> },
            { mod: <code className="text-helix-blue">fat32</code>, features: "FAT12/16/32 read/write, long filenames", status: <span className="text-green-400">✅ via UEFI</span> },
            { mod: <code className="text-helix-blue">ramfs</code>, features: "In-memory filesystem, no persistence", status: <span className="text-yellow-400">🔜 Planned</span> },
            { mod: <code className="text-helix-blue">devfs</code>, features: "Device filesystem (/dev)", status: <span className="text-yellow-400">🔜 Planned</span> },
            { mod: <code className="text-helix-blue">procfs</code>, features: "Process filesystem (/proc)", status: <span className="text-yellow-400">🔜 Planned</span> },
          ]}
        />
      </Section>

      {/* ── LINKER SCRIPTS ── */}
      <Section title={d("section.linker")} id="linker">
        <p>{d("linker.intro")}</p>
        <RustCode filename="profiles/common/linker_base.ld" language="text">{`/* Higher-half kernel mapping */
KERNEL_OFFSET = 0xFFFF800000000000;

SECTIONS {
    . = KERNEL_OFFSET + 0x100000;   /* 1 MiB physical offset */

    .text ALIGN(4K) : {
        *(.text .text.*)
    }

    .rodata ALIGN(4K) : {
        *(.rodata .rodata.*)
    }

    .data ALIGN(4K) : {
        *(.data .data.*)
    }

    .bss ALIGN(4K) : {
        __bss_start = .;
        *(.bss .bss.*)
        *(COMMON)
        __bss_end = .;
    }

    /* Stack */
    .stack ALIGN(16) : {
        __stack_bottom = .;
        . += 64K;      /* 64 KiB kernel stack */
        __stack_top = .;
    }
}`}</RustCode>
      </Section>

    </div>
  );
}
