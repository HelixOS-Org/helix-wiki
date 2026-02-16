"use client";

import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import architecturesContent from "@/helix-wiki/lib/docs-i18n/architectures";

export default function ArchitecturesPage() {
  const { locale } = useI18n();
  const d = (key: string) => getDocString(architecturesContent, locale, key);
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader
        title={d("header.title")}
        subtitle={d("header.subtitle")}
        badge={d("header.badge")}
      />

      {/* ── OVERVIEW ── */}
      <Section title={d("section.comparison")} id="comparison">
        <p>{d("comparison.intro")}</p>
        <InfoTable
          columns={[
            { header: "Feature", key: "feature" },
            { header: "x86_64", key: "x86" },
            { header: "AArch64", key: "aarch64" },
            { header: "RISC-V 64", key: "riscv" },
          ]}
          rows={[
            { feature: <strong className="text-white">Status</strong>, x86: <span className="text-green-400">Primary</span>, aarch64: <span className="text-green-400">Active</span>, riscv: <span className="text-green-400">Active</span> },
            { feature: "Interrupt Controller", x86: "APIC / I/O APIC / x2APIC", aarch64: "GICv2 / GICv3", riscv: "PLIC + CLINT" },
            { feature: "Page Table Levels", x86: "4 (+ LA57 5-level)", aarch64: "4-level (4KB/16KB/64KB)", riscv: "Sv39/Sv48/Sv57" },
            { feature: "Privilege Levels", x86: "Ring 0-3", aarch64: "EL0–EL3", riscv: "M / S / U modes" },
            { feature: "SMP Boot", x86: "INIT-SIPI-SIPI", aarch64: "PSCI (SMC/HVC)", riscv: "SBI HSM" },
            { feature: "Timers", x86: "TSC, HPET, APIC, PIT", aarch64: "Generic Timer (CNTPCT)", riscv: "MTIME/MTIMECMP" },
            { feature: "IPI Mechanism", x86: "APIC ICR", aarch64: "SGI via GIC", riscv: "CLINT MSIP" },
            { feature: "TLB Invalidation", x86: "INVLPG + PCID", aarch64: "TLBI + ASID", riscv: "SFENCE.VMA + ASID" },
            { feature: "FPU/SIMD", x86: "SSE/AVX/AVX-512", aarch64: "NEON/SVE/SVE2", riscv: "F/D/V extensions" },
            { feature: "Max CPUs", x86: "256+", aarch64: "256 cores", riscv: "256 harts" },
            { feature: "Est. LoC", x86: "~30K+", aarch64: "~15K+", riscv: "~12K+" },
          ]}
        />
      </Section>

      {/* ── x86_64 ── */}
      <Section title={d("section.x86_64")} id="x86_64">
        <p>{d("x86.intro")}</p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Module Structure</h3>
        <RustCode filename="hal/src/arch/x86_64/" language="text">{`x86_64/
├── core/                   # CPU fundamentals (~5K lines)
│   ├── cpuid.rs            #   CPUID enumeration & feature detection
│   ├── msr.rs              #   Model-Specific Register framework
│   ├── control_regs.rs     #   CR0–CR4, XCR0, EFER
│   ├── features.rs         #   CPU capability detection
│   ├── cache.rs            #   Cache management (WBINVD, CLFLUSH)
│   └── fpu.rs              #   FPU/SSE/AVX state save/restore
│
├── segmentation/           # GDT/TSS/LDT (~3K lines)
│   ├── gdt.rs              #   Per-CPU GDT management
│   ├── tss.rs              #   64-bit TSS with IST entries
│   ├── selectors.rs        #   Type-safe segment selectors
│   └── descriptors.rs      #   Descriptor types
│
├── interrupts/             # IDT/Exceptions/IRQ (~8K lines)
│   ├── idt.rs              #   256-entry IDT management
│   ├── exceptions.rs       #   CPU exception handlers (#PF, #GP, #DF)
│   ├── handlers.rs         #   Handler generation macros
│   ├── ist.rs              #   Interrupt Stack Table
│   └── nmi.rs              #   NMI handling
│
├── apic/                   # APIC subsystem (~6K lines)
│   ├── local_apic.rs       #   xAPIC (MMIO-based)
│   ├── x2apic.rs           #   x2APIC (MSR-based, auto-detected)
│   ├── ioapic.rs           #   I/O APIC redirection
│   ├── msi.rs              #   MSI/MSI-X support
│   └── ipi.rs              #   Inter-Processor Interrupts
│
├── paging/                 # MMU/Paging (~10K lines)
│   ├── level4.rs           #   4-level page tables (PML4)
│   ├── level5.rs           #   5-level (LA57) when available
│   ├── page_table.rs       #   Page table abstraction
│   ├── tlb.rs              #   TLB management with PCID
│   ├── huge_pages.rs       #   2 MiB and 1 GiB pages
│   ├── mapper.rs           #   Virtual → Physical mapping
│   └── walker.rs           #   Page table walker
│
├── timers/                 # Timing subsystem (~4K lines)
│   ├── tsc.rs              #   Invariant TSC (primary)
│   ├── hpet.rs             #   High Precision Event Timer
│   ├── apic_timer.rs       #   Per-CPU APIC timer
│   ├── pit.rs              #   Legacy PIT (for calibration)
│   └── calibration.rs      #   Cross-calibration logic
│
└── smp/                    # Multi-processor (~5K lines)
    ├── ap_boot.rs          #   AP startup (INIT-SIPI-SIPI)
    ├── trampoline.rs       #   Real-mode trampoline code
    ├── per_cpu.rs          #   Per-CPU data via GS base
    ├── barriers.rs         #   Memory barriers (MFENCE, LFENCE)
    └── spinlock.rs         #   Spinlocks with backoff`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Key Concepts</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">🔒 GDT & TSS</h4>
            <p className="text-sm text-zinc-400">Per-CPU Global Descriptor Tables with 64-bit TSS entries. Each CPU gets its own GDT with kernel code/data segments and a TSS containing 7 IST (Interrupt Stack Table) entries for safe stack switching during exceptions.</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">⚡ APIC Detection</h4>
            <p className="text-sm text-zinc-400">The HAL auto-detects x2APIC vs xAPIC via CPUID. x2APIC uses MSR-based access (faster, no MMIO mapping needed), while xAPIC falls back to MMIO at <code className="text-helix-blue">0xFEE00000</code>.</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">📄 5-Level Paging</h4>
            <p className="text-sm text-zinc-400">LA57 (Level 5 Paging) is detected at boot via CPUID.7.ECX[16]. When available, the virtual address space extends from 48 bits (256 TiB) to 57 bits (128 PiB). The kernel supports both transparently.</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">🔄 SMP Boot</h4>
            <p className="text-sm text-zinc-400">Application Processors start in 16-bit real mode via the INIT-SIPI-SIPI protocol. A trampoline at a known physical address (below 1 MB) transitions each AP through protected mode to long mode, then jumps to the Rust entry point.</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">x86_64 Boot Flow</h3>
        <RustCode filename="boot/limine → hal → core">{`// 1. Limine loads kernel to higher half
// 2. HAL x86_64 initialization sequence:

pub fn init_x86_64(boot_info: &BootContext) {
    // Phase 1: CPU fundamentals
    cpuid::detect_features();      // Enumerate CPU capabilities
    gdt::install_per_cpu();        // GDT + TSS for BSP
    idt::install();                // 256 IDT entries

    // Phase 2: Memory
    paging::init_page_tables();    // 4 or 5-level PT
    paging::map_kernel_higher_half();

    // Phase 3: Interrupts
    apic::init_local();            // xAPIC or x2APIC
    apic::init_ioapic();           // I/O APIC redirection

    // Phase 4: Timers
    tsc::calibrate();              // Via HPET or PIT
    apic_timer::init_periodic();

    // Phase 5: SMP
    smp::start_aps();              // INIT-SIPI-SIPI
}`}</RustCode>
      </Section>

      {/* ── AArch64 ── */}
      <Section title={d("section.aarch64")} id="aarch64">
        <p>{d("aarch64.intro")}</p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Framework Overview</h3>
        <InfoTable
          columns={[
            { header: "Framework", key: "fw" },
            { header: "Components", key: "components" },
            { header: "Est. Lines", key: "loc" },
          ]}
          rows={[
            { fw: <strong className="text-white">Core</strong>, components: "System registers, feature detection, cache, FPU/NEON/SVE, barriers", loc: "~2K" },
            { fw: <strong className="text-white">Exception Levels</strong>, components: "EL0–EL3, VBAR, context save/restore, SVC/IRQ/FIQ handlers", loc: "~2.5K" },
            { fw: <strong className="text-white">MMU</strong>, components: "4KB/16KB/64KB granule, 4-level, ASID, TLB, MAIR", loc: "~3K" },
            { fw: <strong className="text-white">GIC</strong>, components: "GICv2 + GICv3 auto-detect, SGI/PPI/SPI/LPI, affinity routing", loc: "~3K" },
            { fw: <strong className="text-white">SMP</strong>, components: "MPIDR topology, PSCI (SMC/HVC), per-CPU TPIDR_EL1, IPI via SGI", loc: "~2K" },
            { fw: <strong className="text-white">Timers</strong>, components: "Generic Timer: physical, virtual, hypervisor counters", loc: "~1.5K" },
          ]}
        />

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Exception Levels</h3>
        <RustCode filename="AArch64 Privilege Model">{`// AArch64 has 4 Exception Levels:
//
// EL3 — Secure Monitor (firmware, TrustZone)
//   │   Controls secure/non-secure world switching
//   ▼
// EL2 — Hypervisor (optional, virtualization)
//   │   Manages VMs, stage-2 translation
//   ▼
// EL1 — Kernel (Helix runs here)
//   │   Full MMU control, interrupt handling
//   ▼
// EL0 — User space (applications)
//       Limited privileges, syscalls via SVC

// Exception vector table (VBAR_EL1):
//   Offset 0x000: Sync  from current EL, SP_EL0
//   Offset 0x080: IRQ   from current EL, SP_EL0
//   Offset 0x100: FIQ   from current EL, SP_EL0
//   Offset 0x180: SError from current EL, SP_EL0
//   Offset 0x200: Sync  from current EL, SP_ELx
//   ... (16 vectors total, 0x80 bytes each)`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">GIC: Generic Interrupt Controller</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">GICv2</h4>
            <p className="text-sm text-zinc-400">Legacy model with Distributor (GICD) and CPU Interface (GICC). Supports up to 8 CPUs, 1020 interrupt IDs. MMIO-based access. Used on older ARM platforms and QEMU virt by default.</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">GICv3</h4>
            <p className="text-sm text-zinc-400">Modern model adding Redistributors (GICR) per CPU and system register access (ICC_*). Supports affinity-based routing, LPIs (MSI), and scales beyond 8 CPUs. Auto-detected at boot.</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Platform Support</h3>
        <InfoTable
          columns={[
            { header: "Platform", key: "platform" },
            { header: "GIC", key: "gic" },
            { header: "Status", key: "status" },
          ]}
          rows={[
            { platform: <strong className="text-white">QEMU virt</strong>, gic: "GICv2 / GICv3 (configurable)", status: <span className="text-green-400">✅ Supported</span> },
            { platform: <strong className="text-white">Raspberry Pi 4/5</strong>, gic: "GICv2 (BCM2711/2712)", status: <span className="text-green-400">✅ Supported</span> },
            { platform: <strong className="text-white">ARM FVP</strong>, gic: "GICv3", status: <span className="text-green-400">✅ Supported</span> },
            { platform: <strong className="text-white">AWS Graviton</strong>, gic: "GICv3", status: <span className="text-green-400">✅ Supported</span> },
            { platform: <strong className="text-white">Ampere Altra</strong>, gic: "GICv3", status: <span className="text-green-400">✅ Supported</span> },
          ]}
        />
      </Section>

      {/* ── RISC-V ── */}
      <Section title={d("section.riscv64")} id="riscv">
        <p>{d("riscv.intro")}</p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Privilege Model</h3>
        <RustCode filename="RISC-V Privilege Levels">{`// RISC-V privilege levels:
//
// M-mode (Machine) — Firmware (OpenSBI / RustSBI)
//   │   Highest privilege, handles timer/IPI via SBI
//   ▼
// S-mode (Supervisor) — Helix Kernel
//   │   Controls paging (SATP), interrupts (sstatus.SIE)
//   ▼
// U-mode (User) — Applications
//       Executes ECALL for syscalls

// Key CSRs for S-mode:
//   sstatus  — Supervisor status (SIE, SPP, FS)
//   stvec    — Trap vector base (direct / vectored)
//   sip/sie  — Interrupt pending / enable
//   satp     — Page table base + ASID + mode (Sv39/48/57)
//   sscratch — Scratch register for trap entry
//   sepc     — Exception program counter
//   scause   — Trap cause (interrupt bit + code)
//   stval    — Trap value (faulting address, instruction)`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Interrupt Architecture</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">CLINT — Core Local Interruptor</h4>
            <p className="text-sm text-zinc-400">Provides per-hart timer interrupts (MTIME/MTIMECMP) and software interrupts (MSIP) for IPI. MMIO-mapped, typically at <code className="text-helix-blue">0x200_0000</code>. Timer access from S-mode goes through SBI ecalls.</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">PLIC — Platform Level Interrupt Controller</h4>
            <p className="text-sm text-zinc-400">Routes external interrupts from devices to harts. MMIO-mapped with per-source priority, per-hart enable bits, and claim/complete protocol. Typically at <code className="text-helix-blue">0xC00_0000</code>.</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">SBI (Supervisor Binary Interface)</h3>
        <p>Helix uses SBI v0.2+ for firmware calls from S-mode. The HAL implements all standard extensions:</p>
        <InfoTable
          columns={[
            { header: "Extension", key: "ext" },
            { header: "EID", key: "eid" },
            { header: "Purpose", key: "purpose" },
          ]}
          rows={[
            { ext: <strong className="text-white">BASE</strong>, eid: <code className="text-helix-blue">0x10</code>, purpose: "SBI version, implementation ID, extensions probe" },
            { ext: <strong className="text-white">TIME</strong>, eid: <code className="text-helix-blue">0x54494D45</code>, purpose: "Set timer (stimecmp equivalent)" },
            { ext: <strong className="text-white">IPI</strong>, eid: <code className="text-helix-blue">0x735049</code>, purpose: "Send inter-processor interrupts" },
            { ext: <strong className="text-white">HSM</strong>, eid: <code className="text-helix-blue">0x48534D</code>, purpose: "Hart State Management (start, stop, suspend)" },
            { ext: <strong className="text-white">RFENCE</strong>, eid: <code className="text-helix-blue">0x52464E43</code>, purpose: "Remote SFENCE.VMA for TLB shootdown" },
            { ext: <strong className="text-white">PMU</strong>, eid: <code className="text-helix-blue">0x504D55</code>, purpose: "Performance counters" },
            { ext: <strong className="text-white">SRST</strong>, eid: <code className="text-helix-blue">0x53525354</code>, purpose: "System reset (shutdown, reboot)" },
          ]}
        />

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Paging: Sv39 / Sv48 / Sv57</h3>
        <RustCode filename="RISC-V Virtual Memory">{`// RISC-V supports three page table formats:
//
// Sv39 — 3 levels, 39-bit VA → 512 GiB address space
//   Most common, sufficient for most workloads
//
// Sv48 — 4 levels, 48-bit VA → 256 TiB address space
//   For larger memory requirements
//
// Sv57 — 5 levels, 57-bit VA → 128 PiB address space
//   Maximum, rarely needed
//
// Mode selection via SATP register:
//   satp = (mode << 60) | (asid << 44) | (ppn)
//   where mode: 0=Bare, 8=Sv39, 9=Sv48, 10=Sv57

// Page sizes: 4 KiB (base), 2 MiB (mega), 1 GiB (giga)
// TLB: SFENCE.VMA with optional ASID filtering
// ASID: 16-bit (up to 65,536 address spaces)`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Platform Support</h3>
        <InfoTable
          columns={[
            { header: "Platform", key: "platform" },
            { header: "SBI", key: "sbi" },
            { header: "Status", key: "status" },
          ]}
          rows={[
            { platform: <strong className="text-white">QEMU virt</strong>, sbi: "OpenSBI", status: <span className="text-green-400">✅ Supported</span> },
            { platform: <strong className="text-white">SiFive HiFive Unmatched</strong>, sbi: "OpenSBI", status: <span className="text-green-400">✅ Supported</span> },
            { platform: <strong className="text-white">RustSBI platforms</strong>, sbi: "RustSBI", status: <span className="text-green-400">✅ Supported</span> },
          ]}
        />
      </Section>

      {/* ── HAL TRAIT ── */}
      <Section title={d("section.unified")} id="hal-trait">
        <p>{d("unified.intro")}</p>
        <RustCode filename="hal/src/lib.rs">{`/// The core HAL trait — every architecture must implement this
pub trait Hal {
    type Cpu: CpuTrait;
    type Mmu: MmuTrait;
    type Interrupts: InterruptControllerTrait;
    type Firmware: FirmwareTrait;
}

/// CPU abstraction
pub trait CpuTrait {
    fn id() -> usize;
    fn enable_interrupts();
    fn disable_interrupts();
    fn halt() -> !;
    fn memory_barrier();
}

/// MMU abstraction
pub trait MmuTrait {
    fn map_page(vaddr: VirtAddr, paddr: PhysAddr, flags: PageFlags);
    fn unmap_page(vaddr: VirtAddr);
    fn translate(vaddr: VirtAddr) -> Option<PhysAddr>;
    fn flush_tlb(vaddr: VirtAddr);
}

/// Interrupt controller abstraction
pub trait InterruptControllerTrait {
    fn enable_irq(irq: u32);
    fn disable_irq(irq: u32);
    fn ack_irq(irq: u32);
    fn send_ipi(target_cpu: usize, vector: u8);
}`}</RustCode>

        <div className="bg-gradient-to-r from-helix-blue/10 to-helix-purple/10 border border-helix-blue/20 rounded-xl p-5 mt-6">
          <h4 className="text-white font-semibold mb-2">🎯 Architecture Selection</h4>
          <p className="text-sm text-zinc-400">The active architecture is selected at <strong className="text-white">compile time</strong> via the Cargo target triple. There is no runtime architecture detection — each build produces a binary for exactly one architecture. Conditional compilation (<code className="text-helix-blue">#[cfg(target_arch)]</code>) selects the correct HAL backend.</p>
        </div>
      </Section>

    </div>
  );
}
