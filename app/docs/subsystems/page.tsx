import type { Metadata } from "next";
import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import Footer from "@/helix-wiki/components/Footer";

export const metadata: Metadata = {
  title: "Subsystems — Memory, Execution, DIS Scheduler & Init Phases",
  description: "Helix kernel subsystems: physical frame allocator, virtual memory manager, heap allocator, execution engine with context switching, DIS pluggable scheduler, and 5-phase init boot sequence.",
  alternates: { canonical: "/docs/subsystems" },
  openGraph: {
    title: "Helix Subsystems — Memory Management & Scheduling",
    description: "Deep dive into the kernel subsystems: buddy allocator, 4-level page tables, thread lifecycle, Dynamic Intelligent Scheduling, and the early-boot to userspace init pipeline.",
    url: "https://helix-wiki.com/docs/subsystems",
  },
};
import FlowDiagram from "@/helix-wiki/components/diagrams/FlowDiagram";

export default function SubsystemsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader title="Subsystems" subtitle="Seven subsystems bridge the gap between the core TCB and the module layer — memory, execution, DIS scheduling, init framework, relocation, userspace, and early boot." badge="SUBSYSTEM SERVICES" gradient="from-orange-400 to-rose-500" />

      {/* ── MEMORY ── */}
      <Section title="Memory Subsystem" id="memory">
        <p>Physical frame allocation + virtual address space mapping — 2,047 lines across 12 files. The subsystem only provides <em>mechanisms</em>; allocation <em>policy</em> lives in pluggable modules.</p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Error Types & Primitives</h3>
        <RustCode filename="subsystems/memory/src/lib.rs">{`pub enum MemError {
    OutOfMemory,
    InvalidAddress,
    AlignmentError,
    FrameNotAvailable,
    PageAlreadyMapped,
    PageNotMapped,
    ProtectionViolation,
    RegionOverlap,
    InvalidSize,
    AllocationFailed,
    NotInitialized,
}

/// A physical frame — the smallest unit of physical memory.
pub struct Frame {
    pub number: usize,  // PhysAddr = number * 4096
}

/// A virtual page — maps to a Frame via page tables.
pub struct Page {
    pub number: usize,  // VirtAddr = number * 4096
}

/// Memory zones for DMA, normal, and high memory.
pub enum MemoryZone {
    DMA,       // 0–16 MiB (legacy ISA DMA)
    Normal,    // 16 MiB – 4 GiB
    HighMem,   // > 4 GiB
    Device,    // Memory-mapped I/O
    Reserved,  // BIOS, firmware, ACPI
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">Physical Allocator</h3>
        <RustCode filename="subsystems/memory/src/physical.rs">{`/// The physical allocator trait — implementations are hot-swappable.
pub trait PhysicalAllocator: Send + Sync {
    /// Allocate 'count' contiguous physical frames.
    fn allocate(&mut self, count: usize) -> Result<PhysAddr, MemError>;

    /// Allocate with specific alignment (e.g., 2 MiB for huge pages).
    fn allocate_aligned(&mut self, count: usize,
                        alignment: usize) -> Result<PhysAddr, MemError>;

    /// Return frames to the free pool.
    fn deallocate(&mut self, addr: PhysAddr, count: usize);

    fn available_frames(&self) -> usize;
    fn total_frames(&self) -> usize;
    fn used_frames(&self) -> usize {
        self.total_frames() - self.available_frames()
    }
}

/// Bitmap allocator: 1 bit per 4 KiB frame.
/// Simple, constant-time for single frames, O(n) for contiguous.
pub struct BitmapAllocator {
    bitmap: Vec<u64>,          // 64 frames per u64
    total_frames: usize,
    free_frames: AtomicUsize,
    search_hint: AtomicUsize,  // Last known free frame
}

/// Buddy allocator: power-of-two coalescing.
/// O(log n) allocation, minimizes external fragmentation.
pub struct BuddyAllocator {
    free_lists: [Vec<PhysAddr>; MAX_ORDER],  // Orders 0–10
    total_frames: usize,
    free_frames: AtomicUsize,
}
// MAX_ORDER = 10 → max allocation = 2^10 * 4K = 4 MiB`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">Virtual Memory Manager</h3>
        <RustCode filename="subsystems/memory/src/virtual_manager.rs">{`pub trait VirtualMapper: Send + Sync {
    fn map(&mut self, virt: VirtAddr, phys: PhysAddr,
           size: PageSize, flags: PageFlags) -> Result<(), MemError>;
    fn unmap(&mut self, virt: VirtAddr, size: PageSize) -> Result<(), MemError>;
    fn query(&self, virt: VirtAddr) -> Option<(PhysAddr, PageFlags)>;

    /// Create a new address space (new page table root).
    fn create_address_space(&mut self) -> Result<AddressSpaceId, MemError>;

    /// Switch to a different address space (write CR3 / TTBR0).
    fn switch_address_space(&mut self, id: AddressSpaceId) -> Result<(), MemError>;
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">Kernel Heap Allocators</h3>
        <RustCode filename="subsystems/memory/src/heap.rs">{`/// Slab allocator: fixed-size object pools.
/// Perfect for frequently allocated kernel objects (threads, inodes, etc.)
pub struct SlabAllocator {
    slabs: BTreeMap<usize, SlabCache>,  // size → cache
}

/// Bump allocator: linear allocation, no individual free.
/// Used during early boot before the heap is initialized.
pub struct BumpAllocator {
    base: *mut u8,
    offset: AtomicUsize,
    capacity: usize,
}

// In profiles/minimal:
// 4 MiB bump-allocated heap, initialized before any other subsystem.
// static HEAP: BumpAllocator = BumpAllocator::new(HEAP_BASE, 4 * 1024 * 1024);`}</RustCode>
      </Section>

      {/* ── EXECUTION ── */}
      <Section title="Execution Subsystem" id="execution">
        <p>Thread and process lifecycle management — 2,150 lines across 14 files. Defines the structures that DIS schedules:</p>

        <RustCode filename="subsystems/execution/src/lib.rs">{`pub struct ThreadId(AtomicU64);   // Auto-incrementing, unique
pub struct ProcessId(AtomicU64);  // Auto-incrementing, unique

pub enum ExecError {
    ThreadCreationFailed,
    InvalidThreadId,
    SchedulerFull,
    StackAllocationFailed,
    ContextSwitchFailed,
    InvalidPriority,
    ProcessNotFound,
    ThreadNotFound,
}`}</RustCode>

        <RustCode filename="subsystems/execution/src/thread.rs">{`pub struct Thread {
    pub id: ThreadId,
    pub name: String,
    pub state: ThreadState,
    pub priority: u8,           // 0 = highest, 255 = lowest
    pub context: CpuContext,    // Saved register state
    pub kernel_stack: VirtAddr, // Each thread gets its own kernel stack
    pub user_stack: Option<VirtAddr>,
    pub process_id: Option<ProcessId>,
    pub cpu_time: u64,          // Total CPU ticks consumed
    pub wake_time: Option<u64>, // For timed sleep
}

pub enum ThreadState {
    Ready,                      // In the run queue
    Running,                    // Currently executing on a CPU
    Blocked(BlockReason),       // Waiting for something
    Sleeping(u64),              // Timed sleep (wake tick)
    Terminated(i32),            // Exit code
}

pub enum BlockReason {
    WaitingForIo,               // I/O completion
    WaitingForEvent(u64),       // Event ID
    WaitingForMutex(u64),       // Mutex ID
    WaitingForSemaphore(u64),   // Semaphore ID
    WaitingForChild(u64),       // Child process/thread ID
    WaitingForMessage,          // IPC message
    WaitingForPage,             // Page fault resolution
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">Scheduler Trait</h3>
        <RustCode filename="subsystems/execution/src/scheduler.rs">{`/// The scheduler trait — DIS and Round-Robin both implement this.
/// Hot-swappable: schedulers can be replaced at runtime.
pub trait Scheduler: Send + Sync {
    fn name(&self) -> &'static str;
    fn version(&self) -> &'static str;

    // ── Thread management ──
    fn add_thread(&mut self, thread: Thread)
        -> Result<(), SchedulerError>;
    fn remove_thread(&mut self, id: ThreadId)
        -> Result<Thread, SchedulerError>;

    // ── Scheduling decisions ──
    fn next_thread(&mut self) -> Option<ThreadId>;
    fn yield_current(&mut self);

    // ── State transitions ──
    fn block_thread(&mut self, id: ThreadId, reason: BlockReason)
        -> Result<(), SchedulerError>;
    fn unblock_thread(&mut self, id: ThreadId)
        -> Result<(), SchedulerError>;
    fn set_priority(&mut self, id: ThreadId, priority: u8)
        -> Result<(), SchedulerError>;

    /// Called on every timer interrupt — the heartbeat.
    fn tick(&mut self);

    fn stats(&self) -> SchedulerStats;
}

pub struct SchedulerStats {
    pub total_threads: usize,
    pub ready_threads: usize,
    pub blocked_threads: usize,
    pub context_switches: u64,
    pub idle_ticks: u64,
}`}</RustCode>
      </Section>

      {/* ── DIS ── */}
      <Section title="DIS — Dynamic Intent Scheduler" id="dis">
        <p>Helix&apos;s crown jewel — 11,573 lines across 11 files. DIS doesn&apos;t schedule threads by priority alone; it understands task <em>intent</em> and adapts in real time. Tasks declare what they <em>want to do</em>, and DIS finds the optimal scheduling strategy:</p>

        <RustCode filename="subsystems/dis/src/intent.rs">{`pub enum IntentClass {
    Interactive,   // Low-latency UI tasks (mouse, keyboard)
    Batch,         // CPU-bound compute work
    RealTime,      // Hard deadline tasks (audio, sensors)
    Background,    // Best-effort, run when idle
    Io,            // I/O-bound tasks (disk, network)
    Critical,      // Kernel-essential work (never preempted)
}

pub struct TaskDescriptor {
    pub thread_id: ThreadId,
    pub intent: IntentClass,
    pub deadline: Option<Deadline>,
    pub cpu_affinity: Option<CpuSet>,
    pub io_priority: IoPriority,
    pub energy_mode: EnergyMode,
    pub context: TaskContext,
    pub security_domain: Option<SecurityDomain>,
}

pub enum EnergyMode {
    Performance,  // Max frequency, all cores
    Balanced,     // Dynamic scaling
    PowerSave,    // Minimum frequency, core parking
}

/// Intent builder — fluent API for task configuration.
pub struct IntentBuilder { /* ... */ }
impl IntentBuilder {
    pub fn new(intent: IntentClass) -> Self;
    pub fn deadline(self, ns: u64) -> Self;
    pub fn affinity(self, cpus: CpuSet) -> Self;
    pub fn energy(self, mode: EnergyMode) -> Self;
    pub fn build(self) -> TaskDescriptor;
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">DIS Scheduler Core</h3>
        <RustCode filename="subsystems/dis/src/scheduler.rs">{`pub struct DisScheduler {
    queues: MultiLevelFeedbackQueue,
    intent_classifier: IntentClassifier,
    security_domains: SecurityDomainManager,
    policy_engine: PolicyEngine,
    adaptive_optimizer: AdaptiveOptimizer,
    stats_collector: StatsCollector,
    config: SchedulerConfig,
}

pub struct SchedulerConfig {
    pub base_quantum: Nanoseconds,    // Default time slice
    pub max_ready_threads: usize,
    pub preemption_enabled: bool,
    pub load_balancing: bool,
    pub energy_aware: bool,
}

impl DisScheduler {
    pub fn new(config: SchedulerConfig) -> Self;

    /// Submit a task with intent metadata.
    pub fn submit_task(&mut self, task: TaskDescriptor)
        -> Result<TaskHandle, DisError>;

    /// Dynamically change a running task's intent.
    pub fn update_intent(&mut self, handle: TaskHandle,
                         new_intent: IntentClass) -> Result<(), DisError>;

    /// Set or update a task's deadline.
    pub fn set_deadline(&mut self, handle: TaskHandle,
                        deadline: Deadline) -> Result<(), DisError>;

    /// Get the next task to run on this CPU.
    pub fn pick_next(&mut self, cpu: CpuId) -> Option<TaskHandle>;

    /// Timer tick — decay priorities, check deadlines, rebalance.
    pub fn tick(&mut self, cpu: CpuId);

    /// Get system-wide scheduling statistics.
    pub fn system_stats(&self) -> SystemStats;
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">Intent-to-Timeslice Mapping</h3>
        <InfoTable
          columns={[
            { header: "Intent", key: "intent" },
            { header: "Time Slice", key: "slice" },
            { header: "Preemptible", key: "preempt" },
            { header: "CPU Affinity", key: "affinity" },
            { header: "Use Case", key: "use" },
          ]}
          rows={[
            { intent: "Critical", slice: "∞ (no preemption)", preempt: "No", affinity: "Pinned", use: "Kernel tasks, interrupt handlers" },
            { intent: "RealTime", slice: "1 ms", preempt: "Only by Critical", affinity: "Preferred", use: "Audio, sensor, deadline tasks" },
            { intent: "Interactive", slice: "4 ms", preempt: "Yes", affinity: "Soft", use: "UI, input processing" },
            { intent: "Io", slice: "8 ms", preempt: "Yes", affinity: "None", use: "Disk, network I/O" },
            { intent: "Batch", slice: "16 ms", preempt: "Yes", affinity: "None", use: "CPU-bound computation" },
            { intent: "Background", slice: "32 ms", preempt: "Yes", affinity: "Any idle", use: "Garbage collection, indexing" },
          ]}
        />

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">DIS Modules</h3>
        <InfoTable
          columns={[
            { header: "Module", key: "module" },
            { header: "Purpose", key: "purpose" },
          ]}
          rows={[
            { module: "scheduler.rs", purpose: "Core DIS scheduler with multi-level feedback queue" },
            { module: "intent.rs", purpose: "IntentClass, TaskDescriptor, IntentBuilder, IntentFlags" },
            { module: "context.rs", purpose: "ExecutionContext — per-task runtime context" },
            { module: "queue.rs", purpose: "MultiLevelQueue — priority-partitioned run queues" },
            { module: "policy.rs", purpose: "PolicyEngine with configurable PolicyRule chains" },
            { module: "optimizer.rs", purpose: "AdaptiveOptimizer — ML-assisted scheduling tuning" },
            { module: "ipc.rs", purpose: "IPCManager — DIS-aware message passing" },
            { module: "isolation.rs", purpose: "Capability-based isolation, SecurityDomain management" },
            { module: "stats.rs", purpose: "StatsCollector — real-time performance metrics" },
          ]}
        />
      </Section>

      {/* ── INIT ── */}
      <Section title="Init Framework" id="init">
        <p>DAG-based initialization system — 17,673 lines across 23 files. Supports up to 512 subsystems with 64-level dependency depth, topological sort, and automatic rollback on failure:</p>

        <RustCode filename="subsystems/init/src/lib.rs">{`pub const MAX_SUBSYSTEMS: usize = 512;
pub const MAX_DEPENDENCY_DEPTH: usize = 64;
pub const DEFAULT_INIT_TIMEOUT_US: u64 = 10_000_000; // 10 seconds

/// 5-phase initialization pipeline.
pub enum InitPhase {
    Boot,     // Hardware basics (serial, memory, interrupts)
    Early,    // Core subsystems (scheduler, allocator)
    Core,     // Kernel services (IPC, syscalls, modules)
    Late,     // Non-critical (filesystem, network)
    Runtime,  // User-facing services (shell, userspace)
}

pub enum InitializationState {
    NotStarted,
    InProgress,
    Complete,
    Failed,
    RollingBack,   // Automatic rollback in progress
    ShuttingDown,
    Shutdown,
}

/// The public API — call once at boot.
pub fn initialize_kernel(config: ExecutorConfig) -> InitResult<()>;
pub fn shutdown_kernel() -> InitResult<()>;
pub fn is_initialized() -> bool;`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">Init Task DAG</h3>
        <RustCode filename="subsystems/init/src/task.rs">{`pub struct InitTask {
    pub name: &'static str,
    pub phase: InitPhase,
    pub dependencies: &[&'static str],  // Must complete before this
    pub timeout: Duration,
    pub init_fn: fn() -> InitResult<()>,
    pub rollback_fn: Option<fn() -> InitResult<()>>,
    pub priority: u8,
}

// Dependency resolution uses topological sort (Kahn's algorithm).
// If a cycle is detected → InitError::DependencyCycle.
// If a task fails → all tasks that depend on it are skipped,
// then rollback functions are called in reverse order.`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">14 Built-in Subsystem Inits</h3>
        <InfoTable
          columns={[
            { header: "Subsystem", key: "subsystem" },
            { header: "Phase", key: "phase" },
            { header: "Dependencies", key: "deps" },
          ]}
          rows={[
            { subsystem: "serial", phase: "Boot", deps: "none" },
            { subsystem: "memory", phase: "Boot", deps: "serial" },
            { subsystem: "interrupts", phase: "Boot", deps: "memory" },
            { subsystem: "timer", phase: "Early", deps: "interrupts" },
            { subsystem: "scheduler", phase: "Early", deps: "memory, timer" },
            { subsystem: "ipc", phase: "Core", deps: "memory, scheduler" },
            { subsystem: "syscalls", phase: "Core", deps: "ipc" },
            { subsystem: "modules", phase: "Core", deps: "syscalls" },
            { subsystem: "vfs", phase: "Late", deps: "modules" },
            { subsystem: "network", phase: "Late", deps: "modules, ipc" },
            { subsystem: "devices", phase: "Late", deps: "interrupts, modules" },
            { subsystem: "security", phase: "Late", deps: "modules" },
            { subsystem: "userspace", phase: "Runtime", deps: "vfs, syscalls" },
            { subsystem: "shell", phase: "Runtime", deps: "userspace" },
          ]}
        />

        <FlowDiagram
          note="◄── rollback direction (on failure) ──►"
          phases={[
            { title: "Boot", color: "blue", nodes: [
              { label: "serial", color: "blue" },
              { label: "memory", color: "blue" },
              { label: "interrupts", color: "blue" },
            ]},
            { title: "Early", color: "cyan", nodes: [
              { label: "timer", color: "cyan" },
              { label: "scheduler", color: "cyan" },
            ]},
            { title: "Core", color: "purple", nodes: [
              { label: "ipc", color: "purple" },
              { label: "syscalls", color: "purple" },
              { label: "modules", color: "purple" },
            ]},
            { title: "Late", color: "amber", nodes: [
              { label: "vfs", color: "amber" },
              { label: "network", color: "amber" },
              { label: "devices", color: "amber" },
              { label: "security", color: "amber" },
            ]},
            { title: "Runtime", color: "green", nodes: [
              { label: "userspace", color: "green" },
              { label: "shell", color: "green" },
            ]},
          ]}
        />
      </Section>

      {/* ── RELOCATION ── */}
      <Section title="Relocation Subsystem" id="relocation">
        <p>PIE/KASLR relocation engine — 4,093 lines across 12 files. Handles the full lifecycle from ELF parsing to runtime relocation:</p>
        <RustCode filename="subsystems/relocation/src/lib.rs">{`pub enum RelocError {
    InvalidElfMagic,
    InvalidElfClass,
    InvalidElfMachine,
    UnsupportedRelocType(u32),
    OutOfBounds(u64),
    Overflow(u64),
    SectionNotFound(&'static str),
    SymbolNotFound(u32),
    NoRelocations,
    TooManyRelocations(usize),
    TooManyErrors(usize),
    IntegrityFailed(&'static str),
    InsufficientEntropy,
    NotInitialized,
    AlreadyFinalized,
    InvalidAddress,
    InvalidKernelLayout,
    MisalignedAccess(u64),
    InvalidAlignment { required: u64, actual: u64 },
}

pub struct RelocationContext {
    pub strategy: RelocationStrategy,
    pub boot_protocol: BootProtocol,
    pub kernel_base: u64,
    pub kernel_size: u64,
    pub kaslr_offset: u64,
}

pub enum RelocationStrategy {
    None,           // No relocation
    Static,         // Fixed base address
    Pie,            // Position-independent
    PieWithKaslr,   // PIE + randomized base
}

pub enum BootProtocol {
    Multiboot2,
    Limine,
    Uefi,
}`}</RustCode>
      </Section>

      {/* ── USERSPACE ── */}
      <Section title="Userspace Subsystem" id="userspace">
        <p>ELF loader, process runtime, and a built-in shell — 3,407 lines across 7 files:</p>
        <RustCode filename="subsystems/userspace/src/lib.rs">{`pub enum UserError {
    ElfError(ElfError),
    InvalidProgram,
    ProgramNotFound,
    PermissionDenied,
    OutOfMemory,
    InvalidArgument,
    ShellError(String),
    RuntimeError(String),
    SyscallError(i32),
    IoError,
    NotImplemented,
}

pub struct UserspaceCapabilities {
    pub can_load_elf: bool,
    pub can_spawn: bool,
    pub has_shell: bool,
    pub can_syscall: bool,
    pub has_network: bool,
    pub has_filesystem: bool,
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">Userspace Modules</h3>
        <InfoTable
          columns={[
            { header: "Module", key: "module" },
            { header: "Purpose", key: "purpose" },
          ]}
          rows={[
            { module: "elf.rs", purpose: "ElfLoader — parse ELF64, validate headers, load segments" },
            { module: "environment.rs", purpose: "EnvVar, Environment — process environment variables" },
            { module: "program.rs", purpose: "Program, ProgramInfo — executable metadata" },
            { module: "runtime.rs", purpose: "Runtime, RuntimeConfig, ProcessHandle — process lifecycle" },
            { module: "shell.rs", purpose: "Shell, ShellCommand, CommandResult — built-in kernel shell" },
            { module: "syscall_table.rs", purpose: "SyscallTable — userspace syscall dispatch" },
          ]}
        />
      </Section>

      {/* ── EARLY BOOT ── */}
      <Section title="Early Boot Subsystem" id="earlyboot">
        <p>The first code that runs after the bootloader — 23,802 lines across 33 files. Handles the transition from bootloader to kernel, including per-architecture hardware initialization:</p>
        <RustCode filename="boot/src/lib.rs">{`pub struct BootConfig {
    pub kaslr_enabled: bool,          // default: true
    pub kaslr_entropy_bits: u8,       // default: 12
    pub smp_enabled: bool,            // default: true
    pub max_cpus: usize,              // default: 256
    pub serial_enabled: bool,         // default: true
    pub serial_port: SerialConfig,    // COM1 @ 0x3F8, 115200 8N1
    pub framebuffer_enabled: bool,    // default: true
    pub memory_mode: MemoryMode,      // FourLevel
    pub kernel_virt_base: u64,        // 0xFFFF_FFFF_8000_0000
    pub hhdm_offset: u64,            // 0xFFFF_8000_0000_0000
}

pub enum Architecture {
    X86_64,
    AArch64,
    RiscV64,
    Unknown,
}

bitflags! {
    pub struct BootCapabilities: u64 {
        const UEFI           = 1 << 0;
        const ACPI           = 1 << 1;
        const SMP            = 1 << 2;
        const KASLR          = 1 << 3;
        const TPM            = 1 << 4;
        const FRAMEBUFFER    = 1 << 5;
        const SERIAL         = 1 << 6;
        // ... 19 total flags
    }

    pub struct BootStatus: u32 {
        const PRE_INIT      = 1 << 0;
        const CPU_INIT      = 1 << 1;
        const MEMORY_INIT   = 1 << 2;
        const DRIVER_INIT   = 1 << 3;
        const INTERRUPT_INIT= 1 << 4;
        const TIMER_INIT    = 1 << 5;
        const SMP_INIT      = 1 << 6;
        const HANDOFF       = 1 << 7;
        const ERROR         = 1 << 31;
    }
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">Per-Architecture Early Boot</h3>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">x86_64</h4>
            <p className="text-sm text-zinc-400">GDT setup → IDT setup → APIC init → PIC disable → Serial COM1 → Paging (4-level) → SMP AP wakeup → TSC calibration</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">AArch64</h4>
            <p className="text-sm text-zinc-400">MMU init → GIC init → PSCI discovery → Serial PL011 → Page tables → SMP via PSCI CPU_ON → Generic timer</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">RISC-V 64</h4>
            <p className="text-sm text-zinc-400">SBI discovery → PLIC init → CLINT init → Serial (SBI console) → SATP setup (Sv39/48) → Hart startup → mtime timer</p>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
}
