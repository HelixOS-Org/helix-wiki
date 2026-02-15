"use client";

import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import Footer from "@/helix-wiki/components/Footer";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import halContent from "@/helix-wiki/lib/docs-i18n/hal";

export default function HalPage() {
  const { locale } = useI18n();
  const d = (key: string) => getDocString(halContent, locale, key);
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader title={d("header.title")} subtitle={d("header.subtitle")} badge={d("header.badge")} gradient="from-emerald-400 to-teal-500" />

      {/* ── CORE TRAIT ── */}
      <Section title="Core HAL Trait" id="hal-trait">
        <p>{d("hal.intro")}</p>
        <RustCode filename="hal/src/lib.rs">{`pub enum HalError {
    NotInitialized,
    NotSupported,
    InvalidArgument,
    HardwareFault,
    Timeout,
    ResourceBusy,
    OutOfMemory,
    PermissionDenied,
    UnknownError,
}

/// The master HAL trait. Each architecture provides a concrete type.
pub trait HardwareAbstractionLayer: Send + Sync {
    type Cpu: CpuAbstraction;
    type Mmu: MmuAbstraction;
    type InterruptController: InterruptController;
    type Firmware: FirmwareInterface;

    fn cpu(&self) -> &Self::Cpu;
    fn mmu(&self) -> &Self::Mmu;
    fn interrupts(&self) -> &Self::InterruptController;
    fn firmware(&self) -> &Self::Firmware;
}

/// Transparent address types — zero-cost wrappers over u64.
#[repr(transparent)]
pub struct PhysAddr(pub u64);

#[repr(transparent)]
pub struct VirtAddr(pub u64);

pub enum PageSize {
    Size4KiB,   // 4,096 bytes
    Size2MiB,   // 2,097,152 bytes (huge page)
    Size1GiB,   // 1,073,741,824 bytes (giant page)
}

/// Global HAL singleton — initialized at boot, immutable after.
pub static GLOBAL_HAL: Once<Mutex<StubHal>> = Once::new();

pub fn init_hal() -> Result<(), HalError>;
pub fn hal() -> &'static Mutex<StubHal>;
pub fn hal_ref() -> &'static StubHal;`}</RustCode>
        <p className="mt-4">{d("hal.features")}</p>
      </Section>

      {/* ── CPU ── */}
      <Section title="CPU Abstraction" id="cpu">
        <p>{d("cpu.intro")}</p>
        <RustCode filename="hal/src/cpu.rs">{`/// ~20 methods covering the entire CPU surface.
pub trait CpuAbstraction: Send + Sync {
    // ── Context ──
    fn save_context(&self) -> CpuContext;
    fn restore_context(&self, ctx: &CpuContext);
    fn switch_context(&self, from: &mut CpuContext, to: &CpuContext);

    // ── Control ──
    fn enable_interrupts(&self);
    fn disable_interrupts(&self);
    fn halt(&self);          // HLT / WFI / WFE
    fn nop(&self);

    // ── Features ──
    fn features(&self) -> CpuFeatures;
    fn topology(&self) -> CpuTopology;
    fn id(&self) -> u32;     // APIC ID / MPIDR / Hart ID

    // ── Performance ──
    fn read_timestamp(&self) -> u64;  // TSC / CNTVCT / rdtime
    fn memory_barrier(&self);
    fn instruction_barrier(&self);
}

pub struct CpuContext {
    pub general_regs: [u64; 16],   // rax-r15 / x0-x30 / x1-x31
    pub rip: u64,                   // Instruction pointer
    pub rsp: u64,                   // Stack pointer
    pub rflags: u64,                // Flags register
    pub segments: SegmentRegs,      // CS, DS, SS, etc.
    pub fpu_state: FpuState,        // SSE/AVX/NEON state
}

pub struct CpuFeatures {
    pub sse: bool,
    pub sse2: bool,
    pub avx: bool,
    pub avx2: bool,
    pub avx512: bool,
    pub aes_ni: bool,
    pub rdrand: bool,
    pub rdseed: bool,
    pub nx_bit: bool,      // No-Execute page protection
    pub pat: bool,         // Page Attribute Table
    pub pcid: bool,        // Process-Context Identifiers
    pub la57: bool,        // 5-level paging (x86_64)
    pub fsgsbase: bool,    // Fast GS/FS base access
}

pub struct CpuTopology {
    pub physical_cores: u32,
    pub logical_cores: u32,
    pub sockets: u32,
    pub numa_nodes: u32,
    pub cache_line_size: u32,
    pub l1_cache_size: u32,
    pub l2_cache_size: u32,
    pub l3_cache_size: u32,
}

pub trait FpuContext: Send + Sync {
    fn save(&self) -> FpuState;
    fn restore(&self, state: &FpuState);
    fn init(&self);          // Initialize FPU for a new thread
}`}</RustCode>
      </Section>

      {/* ── MMU ── */}
      <Section title="MMU & Page Tables" id="mmu">
        <p>{d("mmu.intro")}</p>
        <RustCode filename="hal/src/mmu.rs">{`bitflags! {
    pub struct PageFlags: u64 {
        const PRESENT        = 1 << 0;   // Page is mapped
        const WRITABLE       = 1 << 1;   // Read-write
        const USER           = 1 << 2;   // User-mode accessible
        const WRITE_THROUGH  = 1 << 3;   // Write-through caching
        const CACHE_DISABLED = 1 << 4;   // No caching (MMIO)
        const ACCESSED       = 1 << 5;   // Page was read
        const DIRTY          = 1 << 6;   // Page was written
        const HUGE_PAGE      = 1 << 7;   // 2 MiB / 1 GiB page
        const GLOBAL         = 1 << 8;   // Not flushed on CR3 switch
        const NO_EXECUTE     = 1 << 63;  // NX bit — W^X enforcement
    }
}

/// Predefined flag combinations for common use cases:
impl PageFlags {
    pub const KERNEL_CODE: Self  = Self::PRESENT | Self::GLOBAL;
    pub const KERNEL_DATA: Self  = Self::PRESENT | Self::WRITABLE | Self::GLOBAL | Self::NO_EXECUTE;
    pub const KERNEL_RODATA: Self = Self::PRESENT | Self::GLOBAL | Self::NO_EXECUTE;
    pub const USER_CODE: Self    = Self::PRESENT | Self::USER;
    pub const USER_DATA: Self    = Self::PRESENT | Self::WRITABLE | Self::USER | Self::NO_EXECUTE;
    pub const MMIO: Self         = Self::PRESENT | Self::WRITABLE | Self::CACHE_DISABLED | Self::NO_EXECUTE;
}`}</RustCode>

        <RustCode filename="hal/src/mmu.rs — traits">{`pub trait MmuAbstraction: Send + Sync {
    /// Map a virtual address to a physical address with given flags.
    fn map_page(&self, virt: VirtAddr, phys: PhysAddr,
                size: PageSize, flags: PageFlags) -> Result<(), HalError>;

    /// Unmap a virtual address. Returns the physical address it was mapped to.
    fn unmap_page(&self, virt: VirtAddr, size: PageSize)
        -> Result<PhysAddr, HalError>;

    /// Query the mapping for a virtual address.
    fn translate(&self, virt: VirtAddr)
        -> Option<(PhysAddr, PageFlags)>;

    /// Modify flags on an existing mapping without unmapping.
    fn update_flags(&self, virt: VirtAddr, flags: PageFlags)
        -> Result<(), HalError>;

    /// Flush a single TLB entry.
    fn flush_tlb(&self, virt: VirtAddr);

    /// Flush the entire TLB (expensive — avoid if possible).
    fn flush_tlb_all(&self);
}

pub trait PageTable: Send + Sync {
    fn new() -> Self;
    fn map(&mut self, virt: VirtAddr, phys: PhysAddr,
           flags: PageFlags) -> Result<(), HalError>;
    fn unmap(&mut self, virt: VirtAddr) -> Result<(), HalError>;
    fn translate(&self, virt: VirtAddr) -> Option<PhysAddr>;

    /// Get the physical address of the root page table (CR3 / TTBR0).
    fn root_address(&self) -> PhysAddr;

    /// Make this page table active on the current CPU.
    fn activate(&self);
}

pub trait TlbManager: Send + Sync {
    fn flush_page(&self, virt: VirtAddr);
    fn flush_all(&self);
    fn flush_range(&self, start: VirtAddr, end: VirtAddr);

    /// Broadcast TLB shootdown to other CPUs via IPI.
    fn broadcast_flush(&self, virt: VirtAddr);
}`}</RustCode>
      </Section>

      {/* ── INTERRUPTS ── */}
      <Section title="Interrupt Controller" id="interrupts">
        <p>{d("interrupts.intro")}</p>
        <RustCode filename="hal/src/interrupts.rs">{`/// ~18 methods covering the full interrupt lifecycle.
pub trait InterruptController: Send + Sync {
    fn init(&mut self) -> Result<(), HalError>;
    fn enable(&mut self);
    fn disable(&mut self);

    // ── IRQ management ──
    fn enable_irq(&mut self, irq: u32) -> Result<(), HalError>;
    fn disable_irq(&mut self, irq: u32) -> Result<(), HalError>;
    fn set_irq_priority(&mut self, irq: u32, priority: u8)
        -> Result<(), HalError>;
    fn acknowledge_irq(&mut self, irq: u32);
    fn end_of_interrupt(&mut self, irq: u32);

    // ── IPI (Inter-Processor Interrupt) ──
    fn send_ipi(&mut self, target: IpiTarget, vector: u8)
        -> Result<(), HalError>;

    // ── Info ──
    fn max_irqs(&self) -> u32;
    fn pending_irqs(&self) -> u64;
    fn is_irq_enabled(&self, irq: u32) -> bool;
}

pub enum IpiTarget {
    Cpu(u32),         // Specific CPU by ID
    AllExceptSelf,    // Broadcast minus sender
    All,              // Broadcast to all CPUs
    Self_,            // Self-IPI
}

/// CPU exception classification (vectors 0-31).
pub enum Exception {
    DivisionError,           // #DE  (0)
    Debug,                   // #DB  (1)
    NonMaskableInterrupt,    // NMI  (2)
    Breakpoint,              // #BP  (3)
    Overflow,                // #OF  (4)
    BoundRangeExceeded,      // #BR  (5)
    InvalidOpcode,           // #UD  (6)
    DeviceNotAvailable,      // #NM  (7)
    DoubleFault,             // #DF  (8)
    InvalidTSS,              // #TS  (10)
    SegmentNotPresent,       // #NP  (11)
    StackSegmentFault,       // #SS  (12)
    GeneralProtectionFault,  // #GP  (13)
    PageFault(PageFaultInfo),// #PF  (14)
    X87FloatingPoint,        // #MF  (16)
    AlignmentCheck,          // #AC  (17)
    MachineCheck,            // #MC  (18)
    SimdFloatingPoint,       // #XM  (19)
    VirtualizationException, // #VE  (20)
    SecurityException,       // #SX  (30)
}

pub struct PageFaultInfo {
    pub address: VirtAddr,     // CR2 / FAR_EL1
    pub was_write: bool,       // Write access?
    pub was_user: bool,        // From user mode?
    pub was_instruction: bool, // Instruction fetch?
    pub was_present: bool,     // Page was present?
}`}</RustCode>
      </Section>

      {/* ── FIRMWARE ── */}
      <Section title="Firmware Interface" id="firmware">
        <p>{d("firmware.intro")}</p>
        <RustCode filename="hal/src/firmware.rs">{`pub trait FirmwareInterface: Send + Sync {
    fn firmware_type(&self) -> FirmwareType;
    fn version(&self) -> &str;

    // ── Power management ──
    fn shutdown(&self) -> !;
    fn reboot(&self) -> !;
    fn suspend(&self) -> Result<(), HalError>;

    // ── System info ──
    fn total_memory(&self) -> u64;
    fn cpu_count(&self) -> u32;
    fn boot_time(&self) -> u64;

    // ── ACPI ──
    fn acpi_rsdp(&self) -> Option<PhysAddr>;
    fn acpi_table(&self, signature: &[u8; 4]) -> Option<&[u8]>;

    // ── Timers ──
    fn timer_frequency(&self) -> u64;
    fn monotonic_time(&self) -> u64;
}

pub enum FirmwareType {
    Bios,      // Legacy BIOS
    Uefi,      // UEFI firmware
    DeviceTree,// FDT (ARM, RISC-V)
    Sbi,       // SBI (RISC-V)
    Unknown,
}

pub struct SystemInfo {
    pub architecture: Architecture,
    pub firmware: FirmwareType,
    pub total_ram: u64,
    pub cpu_count: u32,
    pub boot_protocol: &'static str,
    pub command_line: Option<String>,
}

pub struct MemoryRegion {
    pub base: PhysAddr,
    pub length: u64,
    pub region_type: MemoryRegionType,
}

pub enum MemoryRegionType {
    Usable,           // Free RAM
    Reserved,         // BIOS/firmware
    AcpiReclaimable,  // ACPI tables
    AcpiNvs,          // ACPI NVS memory
    BadMemory,        // Defective
    BootloaderReclaimable,
    KernelAndModules,
    Framebuffer,
}`}</RustCode>
      </Section>

      {/* ── KASLR ── */}
      <Section title="KASLR" id="kaslr">
        <p>{d("kaslr.intro")}</p>
        <RustCode filename="hal/src/kaslr.rs">{`pub struct KaslrConfig {
    pub min_address: u64,     // Lowest allowed kernel base
    pub max_address: u64,     // Highest allowed kernel base
    pub alignment: u64,       // 2 MiB (huge page aligned)
    pub entropy_bits: u8,     // Default: 18 bits of randomness
}

/// Hardware entropy sources, ordered by quality.
pub enum EntropySource {
    RDRAND,          // Intel/AMD hardware RNG
    RDSEED,          // True hardware entropy
    TSC,             // Time Stamp Counter
    ArchPerfCounter, // Performance counter jitter
    JitterEntropy,   // CPU timing jitter
    Custom(u64),     // User-provided seed
}

pub enum EntropyQuality {
    Cryptographic,   // RDSEED — true hardware entropy
    High,            // RDRAND — DRBG-seeded
    Medium,          // TSC + jitter mixing
    Low,             // Single counter sample
    None,            // No entropy available
}

/// Collect entropy from all available sources.
pub fn collect_entropy() -> (u64, EntropyQuality);

/// Mix multiple entropy sources via XOR-shift cascade.
pub fn mix_entropy(sources: &[u64]) -> u64;

/// Generate a randomized kernel base address.
pub fn randomize_base(config: &KaslrConfig) -> Result<u64, HalError>;

/// Apply KASLR to a loaded kernel image.
pub fn apply_kaslr(
    kernel_base: u64,
    kernel_size: u64,
    config: &KaslrConfig,
) -> Result<u64, HalError>;

/// Parse KASLR settings from kernel command line.
/// Recognizes: "nokaslr", "kaslr_entropy=N"
pub fn parse_cmdline(cmdline: &str) -> KaslrConfig;

/// Global KASLR state — set once during early boot.
static KASLR_OFFSET: AtomicU64 = AtomicU64::new(0);
static KASLR_INITIALIZED: AtomicBool = AtomicBool::new(false);`}</RustCode>
      </Section>

      {/* ── RELOCATION ── */}
      <Section title="ELF Relocation Engine" id="relocation">
        <p>{d("relocation.intro")}</p>
        <RustCode filename="hal/src/relocation.rs">{`pub enum RelocationType {
    Relative,      // R_X86_64_RELATIVE — base + addend
    Absolute64,    // R_X86_64_64 — S + A
    Absolute32,    // R_X86_64_32 — S + A (truncated)
    Signed32,      // R_X86_64_32S — S + A (sign-extended)
    Pc32,          // R_X86_64_PC32 — S + A - P
    Pc64,          // R_X86_64_PC64 — S + A - P
    GotPcRel,      // R_X86_64_GOTPCREL — GOT + A - P
    GlobDat,       // R_X86_64_GLOB_DAT — S
    JumpSlot,      // R_X86_64_JUMP_SLOT — S
    TlsGd,         // R_X86_64_TLSGD — thread-local GD
    TlsLd,         // R_X86_64_TLSLD — thread-local LD
    None,
}

/// Parsed ELF64 structures with validation:
pub struct ElfHeader { /* 64 bytes, magic validated */ }
pub struct ProgramHeader { /* 56 bytes per entry */ }
pub struct SectionHeader { /* 64 bytes per entry */ }
pub struct Rela { pub offset: u64, pub info: u64, pub addend: i64 }
pub struct Sym { pub name: u32, pub info: u8, pub value: u64, pub size: u64 }
pub struct Dyn { pub tag: i64, pub val: u64 }

/// Apply all relocations to a loaded kernel image.
pub fn apply_relocations(
    base: u64,
    rela: &[Rela],
    symbols: &[Sym],
    got: Option<&mut [u64]>,
) -> Result<RelocStats, RelocationError>;

/// Validate ELF integrity before relocation.
pub fn validate_elf(data: &[u8]) -> Result<ElfInfo, RelocationError>;

pub struct RelocStats {
    pub total: usize,
    pub applied: usize,
    pub skipped: usize,
    pub errors: usize,
}`}</RustCode>
      </Section>

      {/* ── BACKENDS ── */}
      <Section title="Architecture Backends" id="backends">
        <p>{d("backends.intro")}</p>
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-6">
            <h4 className="text-white font-bold mb-3 text-lg">🖥️ x86_64 <span className="text-xs text-zinc-500 font-mono ml-2">~30K LoC / 60+ files</span></h4>
            <InfoTable
              columns={[{ header: "Module", key: "module" }, { header: "Contents", key: "contents" }]}
              rows={[
                { module: "apic/", contents: "Local APIC, IOAPIC, x2APIC, MSI, IPI" },
                { module: "cpu/", contents: "CPUID, MSR, CR access, FPU, features" },
                { module: "interrupts/", contents: "IDT, handlers, vectors, stack frames" },
                { module: "paging_v2/", contents: "4/5-level page tables, TLB, walker" },
                { module: "segmentation/", contents: "GDT, TSS, per-CPU selectors" },
                { module: "smp/", contents: "AP startup, barriers, per-CPU data" },
                { module: "timers/", contents: "APIC timer, HPET, PIT, TSC" },
                { module: "top-level", contents: "context, syscall, userspace, task" },
              ]}
            />
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-6">
            <h4 className="text-white font-bold mb-3 text-lg">📱 AArch64 <span className="text-xs text-zinc-500 font-mono ml-2">~18K LoC / 40+ files</span></h4>
            <InfoTable
              columns={[{ header: "Module", key: "module" }, { header: "Contents", key: "contents" }]}
              rows={[
                { module: "cpu/", contents: "System regs, barriers, cache, FPU" },
                { module: "exception/", contents: "EL1/EL2 handlers, vectors, SVC" },
                { module: "gic/", contents: "GICv2, GICv3, distributor, redist" },
                { module: "paging/", contents: "4K/2M/1G pages, ASID, TTBR" },
                { module: "smp/", contents: "PSCI, MPIDR, per-CPU, IPI" },
                { module: "timers/", contents: "Generic timer, virtual timer" },
              ]}
            />
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-6">
            <h4 className="text-white font-bold mb-3 text-lg">🔬 RISC-V 64 <span className="text-xs text-zinc-500 font-mono ml-2">~13K LoC / 30+ files</span></h4>
            <InfoTable
              columns={[{ header: "Module", key: "module" }, { header: "Contents", key: "contents" }]}
              rows={[
                { module: "cpu/", contents: "CSRs, barriers, cache, features" },
                { module: "interrupts/", contents: "PLIC, CLINT, IRQ routing" },
                { module: "paging/", contents: "Sv39/Sv48/Sv57, SATP, ASID" },
                { module: "privilege/", contents: "S/M mode, traps, SVC, vectors" },
                { module: "sbi/", contents: "Base, HSM, IPI, timer, PMU, rfence" },
                { module: "smp/", contents: "Hart ID, per-CPU, startup" },
                { module: "timers/", contents: "mtime, sstimer" },
              ]}
            />
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
}
