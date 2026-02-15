"use client";

import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import Footer from "@/helix-wiki/components/Footer";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import subsystemsContent from "@/helix-wiki/lib/docs-i18n/subsystems";

import FlowDiagram from "@/helix-wiki/components/diagrams/FlowDiagram";

export default function SubsystemsPage() {
  const { locale } = useI18n();
  const d = (key: string) => getDocString(subsystemsContent, locale, key);
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader title={d("header.title")} subtitle={d("header.subtitle")} badge={d("header.badge")} gradient="from-orange-400 to-rose-500" />

      {/* ── MEMORY ── */}
      <Section title="Memory Subsystem" id="memory">
        <p>{d("memory.intro")}</p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">{d("memory.errors.title")}</h3>
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

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("memory.physical.title")}</h3>
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

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("memory.virtual.title")}</h3>
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

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("memory.heap.title")}</h3>
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
        <p>{d("execution.intro")}</p>

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

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("execution.scheduler.title")}</h3>
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
        <p>{d("dis.intro")}</p>

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

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("dis.core.title")}</h3>
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

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("dis.mapping.title")}</h3>
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

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("dis.modules.title")}</h3>
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
        <p>{d("init.intro")}</p>

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

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("init.dag.title")}</h3>
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

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("init.builtins.title")}</h3>
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
          title="Init Subsystem Boot Sequence"
          note="◄── rollback direction (on failure) ──►"
          phases={[
            { title: "Boot", color: "blue", description: "Earliest kernel initialization — serial console, physical memory manager, and interrupt vectors must be online before anything else.", nodes: [
              { label: "serial", color: "blue", info: { description: "Serial console driver (COM1/COM2). Provides the first output channel for early boot diagnostics and panic messages.", duration: "~2 ms", priority: "critical", dependencies: [], outputs: ["kprint!()", "COM1 port"], errorHandler: "Triple-fault (no fallback)" } },
              { label: "memory", color: "blue", info: { description: "Physical memory manager: parses memory map from bootloader, initializes frame allocator and page tables.", duration: "~15 ms", priority: "critical", dependencies: ["serial"], outputs: ["FrameAllocator", "PageTable", "HHDM mapping"], errorHandler: "Panic — cannot continue without memory" } },
              { label: "interrupts", color: "blue", info: { description: "Sets up IDT (Interrupt Descriptor Table), programs PIC/APIC, and registers exception handlers (page fault, GPF, etc.).", duration: "~5 ms", priority: "critical", dependencies: ["memory"], outputs: ["IDT", "APIC", "Exception handlers"], errorHandler: "Panic — unhandled interrupts cause triple-fault" } },
            ]},
            { title: "Early", color: "cyan", description: "Timer and scheduler are needed before any concurrent work can happen. These enable preemptive multitasking.", nodes: [
              { label: "timer", color: "cyan", info: { description: "Configures HPET/PIT/APIC timer for periodic ticks. Drives the scheduler and provides kernel time source.", duration: "~3 ms", priority: "high", dependencies: ["interrupts"], outputs: ["Tick source", "sleep()", "Uptime counter"], errorHandler: "Fallback to PIT if HPET unavailable" } },
              { label: "scheduler", color: "cyan", info: { description: "Initializes the CFS-style scheduler with per-CPU run queues, idle tasks, and priority management.", duration: "~8 ms", priority: "high", dependencies: ["timer", "memory"], outputs: ["spawn()", "yield_now()", "Run queues"], errorHandler: "Panic — kernel requires a scheduler" } },
            ]},
            { title: "Core", color: "purple", description: "Inter-process communication, system calls, and the module framework form the kernel's service backbone.", nodes: [
              { label: "ipc", color: "purple", info: { description: "Initializes IPC channels, event bus (pub/sub), and message router for inter-module communication.", duration: "~4 ms", priority: "high", dependencies: ["scheduler"], outputs: ["EventBus", "MessageRouter", "SharedMemory"], errorHandler: "Degrade to synchronous-only IPC" } },
              { label: "syscalls", color: "purple", info: { description: "Registers the 512-entry syscall dispatch table and installs the SYSCALL/SYSRET MSR handlers.", duration: "~2 ms", priority: "high", dependencies: ["ipc"], outputs: ["SyscallDispatcher", "512 syscall entries"], errorHandler: "Panic — userspace requires syscalls" } },
              { label: "modules", color: "purple", info: { description: "Module registry and loader: resolves module dependencies, verifies ABI compatibility, and initializes the module lifecycle state machine.", duration: "~10 ms", priority: "high", dependencies: ["syscalls", "ipc"], outputs: ["ModuleRegistry", "load()/unload() API"], errorHandler: "Log warning, continue without optional modules" } },
            ]},
            { title: "Late", color: "amber", description: "Higher-level services: filesystem, networking, device drivers, and security framework are brought online.", nodes: [
              { label: "vfs", color: "amber", info: { description: "Virtual File System layer: mounts root filesystem, initializes inode cache, dentry cache, and POSIX file operations.", duration: "~20 ms", priority: "normal", dependencies: ["modules"], outputs: ["VFS", "mount()", "open()/read()/write()"], errorHandler: "Mount ramfs as fallback root" } },
              { label: "network", color: "amber", info: { description: "Network stack initialization: loopback interface, TCP/IP stack, socket layer, and DNS resolver.", duration: "~12 ms", priority: "normal", dependencies: ["modules", "vfs"], outputs: ["Socket API", "TCP/UDP", "Loopback"], errorHandler: "Skip — network is optional at boot" } },
              { label: "devices", color: "amber", info: { description: "Device enumeration: PCI bus scan, USB controller init, and driver matching via the module system.", duration: "~25 ms", priority: "normal", dependencies: ["modules"], outputs: ["DeviceTree", "PCI devices", "USB stack"], errorHandler: "Log missing drivers, continue" } },
              { label: "security", color: "amber", info: { description: "Security framework: capability system, MAC policy engine, audit logging, and secure random initialization.", duration: "~8 ms", priority: "normal", dependencies: ["vfs", "modules"], outputs: ["Capabilities", "MAC policy", "Audit log"], errorHandler: "Default to permissive mode with warnings" } },
            ]},
            { title: "Runtime", color: "green", description: "Userspace is launched and the interactive shell starts — the kernel is fully operational.", nodes: [
              { label: "userspace", color: "green", info: { description: "Creates the initial userspace process (PID 1 / init), sets up user page tables, and transitions to Ring 3.", duration: "~30 ms", priority: "high", dependencies: ["vfs", "syscalls", "security"], outputs: ["PID 1", "User page tables", "Ring 3 execution"], errorHandler: "Kernel panic — no init process" } },
              { label: "shell", color: "green", info: { description: "Launches the Helix interactive shell (hsh) as the first user-facing process with stdio connected to serial/VGA.", duration: "~15 ms", priority: "low", dependencies: ["userspace"], outputs: ["hsh process", "stdio streams"], errorHandler: "Respawn shell on crash (3 attempts)" } },
            ]},
          ]}
        />
      </Section>

      {/* ── RELOCATION ── */}
      <Section title="Relocation Subsystem" id="relocation">
        <p>{d("relocation.intro")}</p>
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
        <p>{d("userspace.intro")}</p>
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

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("userspace.modules.title")}</h3>
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
        <p>{d("earlyboot.intro")}</p>
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

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("earlyboot.perarch.title")}</h3>
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
