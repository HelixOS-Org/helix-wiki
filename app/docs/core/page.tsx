"use client";

import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import FileTree from "@/helix-wiki/components/diagrams/FileTree";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import coreContent from "@/helix-wiki/lib/docs-i18n/core";

export default function CorePage() {
  const { locale } = useI18n();
  const d = (key: string) => getDocString(coreContent, locale, key);
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader title={d("header.title")} subtitle={d("header.subtitle")} badge={d("header.badge")} gradient="from-blue-400 to-indigo-500" />

      {/* ── MODULE MAP ── */}
      <Section title={d("section.map")} id="map">
        <p>{d("map.intro")}</p>
        <FileTree title="core/src/" tree={[
          { name: "core/src", icon: "folder",
            info: { loc: 6400, description: "Trusted Computing Base — minimal kernel core providing IPC, syscalls, orchestration, self-healing, and hot-reload.", status: "stable" },
            children: [
              { name: "lib.rs", detail: "KernelState, KernelError, KernelComponent",
                info: { loc: 300, description: "Root module — kernel state machine, version, error types, and component trait definitions.", status: "stable", exports: ["KernelState", "KernelError", "KernelComponent", "CURRENT_VERSION"] } },
              { name: "interrupts", icon: "folder", detail: "Interrupt dispatch & routing",
                info: { loc: 369, description: "256-vector interrupt dispatcher with routing modes, default handlers (timer, PF, GPF, DF), and exception trait.", status: "stable" },
                children: [
                  { name: "mod.rs", detail: "InterruptDispatcher (256-vector table)", info: { loc: 99, status: "stable", exports: ["InterruptDispatcher"] } },
                  { name: "router.rs", detail: "RoutingMode, InterruptRouter", info: { loc: 92, status: "stable", exports: ["RoutingMode", "InterruptRouter"] } },
                  { name: "handlers.rs", detail: "Default handlers (timer, PF, GPF, DF)", info: { loc: 65, status: "stable" } },
                  { name: "exceptions.rs", detail: "ExceptionHandler trait, 32-slot dispatcher", info: { loc: 113, status: "stable", exports: ["ExceptionHandler"] } },
                ] },
              { name: "ipc", icon: "folder", detail: "Inter-process communication",
                info: { loc: 1417, description: "IPC subsystem — bounded MPSC ring-buffer channels, pub-sub event bus with priority subscriptions, and point-to-point message router.", status: "stable" },
                children: [
                  { name: "mod.rs", detail: "IpcError enum, IpcResult", info: { loc: 88, status: "stable", exports: ["IpcError", "IpcResult"] } },
                  { name: "channel.rs", detail: "Bounded MPSC ring-buffer channels", info: { loc: 407, status: "stable", exports: ["Channel", "Sender", "Receiver"] } },
                  { name: "event_bus.rs", detail: "Pub-sub EventBus (priority subscriptions)", info: { loc: 437, status: "stable", exports: ["EventBus", "Subscription"] } },
                  { name: "message_router.rs", detail: "Point-to-point MessageRouter (BTreeMap)", info: { loc: 485, status: "stable", exports: ["MessageRouter"] } },
                ] },
              { name: "syscall", icon: "folder", detail: "System call framework",
                info: { loc: 680, description: "512-entry syscall dispatch table, 6-argument ABI, extern C gateway, pre/post hooks, and user pointer validation.", status: "stable" },
                children: [
                  { name: "mod.rs", detail: "SyscallArgs (6-arg ABI), SyscallError", info: { loc: 163, status: "stable", exports: ["SyscallArgs", "SyscallError"] } },
                  { name: "gateway.rs", detail: "helix_syscall_entry() — extern \"C\"", info: { loc: 101, status: "stable" } },
                  { name: "dispatcher.rs", detail: "SyscallDispatcher (pre/post hooks)", info: { loc: 103, status: "stable", exports: ["SyscallDispatcher"] } },
                  { name: "registry.rs", detail: "SyscallRegistry (table[512]), define_syscall!", info: { loc: 186, status: "stable", exports: ["SyscallRegistry", "define_syscall!"] } },
                  { name: "validation.rs", detail: "validate_user_ptr/string/fd/flags", info: { loc: 127, status: "stable" } },
                ] },
              { name: "orchestrator", icon: "folder", detail: "Kernel orchestration",
                info: { loc: 1274, description: "Kernel orchestrator managing subsystem lifecycle, capability brokering, resource provisioning, and panic handling.", status: "stable" },
                children: [
                  { name: "mod.rs", detail: "KernelOrchestrator, Subsystem trait", info: { loc: 334, status: "stable", exports: ["KernelOrchestrator", "Subsystem"] } },
                  { name: "lifecycle.rs", detail: "LifecycleStage (5), ShutdownReason", info: { loc: 177, status: "stable", exports: ["LifecycleStage", "ShutdownReason"] } },
                  { name: "capability_broker.rs", detail: "CapabilityRights (10 bitflags)", info: { loc: 345, status: "stable", exports: ["CapabilityRights", "CapabilityBroker"] } },
                  { name: "resource_broker.rs", detail: "ResourceClass (8), ResourceProvider", info: { loc: 280, status: "stable", exports: ["ResourceClass", "ResourceProvider"] } },
                  { name: "panic_handler.rs", detail: "PanicAction, kernel_assert!", info: { loc: 138, status: "stable", exports: ["PanicAction", "kernel_assert!"] } },
                ] },
              { name: "selfheal.rs", detail: "SelfHealingManager, HealthStatus (6)",
                info: { loc: 555, description: "Self-healing manager — monitors module health, quarantines failures, and orchestrates recovery strategies.", status: "stable", exports: ["SelfHealingManager", "HealthStatus", "RecoveryAction"] } },
              { name: "hotreload", icon: "folder", detail: "Hot-reload framework",
                info: { loc: 1528, description: "Live module replacement framework — hot-swap modules without reboot. Includes test crasher module and scheduler implementations.", status: "stable" },
                children: [
                  { name: "mod.rs", detail: "HotReloadableModule, hot_swap()", info: { loc: 694, status: "stable", exports: ["HotReloadableModule", "hot_swap"] } },
                  { name: "crasher.rs", detail: "CrasherModule (test module)", info: { loc: 181, status: "stable" } },
                  { name: "schedulers.rs", detail: "RoundRobin + Priority with hot-reload", info: { loc: 653, status: "stable" } },
                ] },
              { name: "debug", icon: "folder", detail: "Debug interface",
                info: { loc: 204, description: "Debug command trait and serial console macros (kprint!, kprintln!, kdebug!, kinfo!, kwarn!).", status: "stable" },
                children: [
                  { name: "mod.rs", detail: "DebugCommand trait, DebugInterface", info: { loc: 87, status: "stable", exports: ["DebugCommand", "DebugInterface"] } },
                  { name: "console.rs", detail: "kprint!/kprintln!/kdebug!/kinfo!/kwarn!", info: { loc: 117, status: "stable" } },
                ] },
            ] },
        ]} />
      </Section>

      {/* ── KERNEL TYPES ── */}
      <Section title={d("section.types")} id="types">
        <p>{d("types.intro")}</p>
        <RustCode filename="core/src/lib.rs">{`pub struct KernelVersion {
    pub major: u8,
    pub minor: u8,
    pub patch: u8,
    pub pre_release: &'static str,
}

pub const CURRENT_VERSION: KernelVersion = KernelVersion {
    major: 0, minor: 1, patch: 0,
    pre_release: "alpha",
};

/// The six states a kernel can be in during its lifetime.
pub enum KernelState {
    Booting,       // Hardware initialization in progress
    Initializing,  // Subsystems coming online
    Running,       // Normal operation
    Degraded,      // Some components failed, self-healing active
    ShuttingDown,  // Graceful shutdown in progress
    Halted,        // Terminal state — CPU halted
}

/// Every failure in the core is one of these variants.
/// No stringly-typed errors — no anyhow, no thiserror.
pub enum KernelError {
    NotInitialized,
    AlreadyInitialized,
    InvalidState,
    ResourceNotFound,
    ResourceExhausted,
    PermissionDenied,
    InvalidArgument,
    OperationFailed,
    Timeout,
    NotSupported,
    CapabilityError(CapabilityError),
    ModuleError(String),
}

/// Events emitted by the kernel for listeners.
pub enum KernelEvent {
    Boot,
    Shutdown,
    ModuleLoaded(String),
    ModuleUnloaded(String),
    Error(KernelError),
    HealthCheck,
    Custom(String),
}

pub trait KernelEventListener: Send + Sync {
    fn on_event(&self, event: &KernelEvent);
}`}</RustCode>
      </Section>

      {/* ── KERNEL COMPONENT ── */}
      <Section title={d("section.component")} id="component">
        <p>{d("component.intro")}</p>
        <RustCode filename="core/src/lib.rs">{`/// The universal contract for all kernel components.
/// This is the core abstraction — every subsystem, every module,
/// every driver must implement this to participate in the kernel.
pub trait KernelComponent: Send + Sync {
    /// Human-readable name for logging and diagnostics.
    fn name(&self) -> &str;

    /// Called once during boot. Must be idempotent-safe.
    fn initialize(&mut self) -> Result<(), KernelError>;

    /// Graceful shutdown. Release resources, flush buffers.
    fn shutdown(&mut self) -> Result<(), KernelError>;

    /// Non-blocking health probe. Called periodically by self-heal.
    fn health_check(&self) -> ComponentHealth;

    /// Runtime statistics for monitoring dashboards.
    fn stats(&self) -> ComponentStats;
}

pub enum ComponentHealth {
    Healthy,
    Degraded { reason: &'static str },
    Unhealthy { reason: &'static str },
}

pub struct ComponentStats {
    pub operations: u64,
    pub errors: u64,
    pub load_percent: u8,   // 0-100
    pub memory_bytes: usize,
    pub uptime_ticks: u64,
}`}</RustCode>
      </Section>

      {/* ── ORCHESTRATOR ── */}
      <Section title={d("section.orchestrator")} id="orchestrator">
        <p>{d("orchestrator.intro")}</p>
        <RustCode filename="core/src/orchestrator/mod.rs">{`/// Every subsystem must implement this trait.
/// The orchestrator uses it to manage boot ordering and shutdown.
pub trait Subsystem: Send + Sync {
    fn name(&self) -> &'static str;
    fn version(&self) -> &'static str;

    /// Declare dependencies (names of other subsystems).
    /// The orchestrator resolves them via topological sort.
    fn dependencies(&self) -> &[&str];

    fn init(&mut self) -> Result<(), KernelError>;
    fn shutdown(&mut self) -> Result<(), KernelError>;
    fn suspend(&mut self) -> Result<(), KernelError>;
    fn resume(&mut self) -> Result<(), KernelError>;
    fn is_healthy(&self) -> bool;
}

pub struct BootConfiguration {
    pub command_line: Option<String>,
    pub memory_map: Vec<MemoryMapEntry>,
    pub boot_modules: Vec<BootModule>,
    pub debug_mode: bool,
    pub verbose: bool,
    pub cpu_count: u32,
    pub custom: BTreeMap<String, String>,
}

pub struct KernelOrchestrator {
    subsystems: Vec<Box<dyn Subsystem>>,
    lifecycle: LifecycleManager,
    capability_broker: CapabilityBroker,
    resource_broker: ResourceBroker,
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("orchestrator.lifecycle.title")}</h3>
        <RustCode filename="core/src/orchestrator/lifecycle.rs">{`pub enum LifecycleStage {
    PreBoot,    // Before any subsystem init
    EarlyInit,  // Critical subsystems (memory, interrupts)
    LateInit,   // Non-critical subsystems (fs, network)
    Running,    // Normal operation
    Shutdown,   // Graceful shutdown in progress
}

pub enum ShutdownReason {
    UserRequest,
    Panic,
    PowerOff,
    Reboot,
    WatchdogTimeout,
}

pub struct LifecycleManager {
    stage: LifecycleStage,
    shutdown_hooks: Vec<Box<dyn Fn() + Send>>,
    boot_time: u64,
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("orchestrator.capability.title")}</h3>
        <p>{d("orchestrator.capability.intro")}</p>
        <RustCode filename="core/src/orchestrator/capability_broker.rs">{`bitflags! {
    pub struct CapabilityRights: u32 {
        const READ        = 1 << 0;
        const WRITE       = 1 << 1;
        const EXECUTE     = 1 << 2;
        const CREATE      = 1 << 3;
        const DELETE      = 1 << 4;
        const GRANT       = 1 << 5;  // Can delegate to others
        const REVOKE      = 1 << 6;  // Can revoke delegated
        const ADMIN       = 1 << 7;
        const MOUNT       = 1 << 8;
        const NETWORK     = 1 << 9;
    }
}

pub enum ResourceType {
    Memory, File, Device, Process, Thread,
    Socket, Pipe, SharedMemory, Semaphore, Timer,
}

pub struct CapabilityBroker {
    // Tree-based capability storage with recursive revocation
    capabilities: BTreeMap<CapabilityId, Capability>,
    delegation_tree: BTreeMap<CapabilityId, Vec<CapabilityId>>,
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("orchestrator.resource.title")}</h3>
        <RustCode filename="core/src/orchestrator/resource_broker.rs">{`pub enum ResourceClass {
    PhysicalMemory, VirtualMemory,
    InterruptLine, IoPort, DmaChannel,
    Timer, Cpu, Device,
}

/// Modules register as resource providers.
/// The broker matches requests to providers.
pub trait ResourceProvider: Send + Sync {
    fn resource_class(&self) -> ResourceClass;
    fn allocate(&mut self, request: &ResourceRequest)
        -> Result<ResourceHandle, KernelError>;
    fn release(&mut self, handle: ResourceHandle)
        -> Result<(), KernelError>;
}`}</RustCode>
      </Section>

      {/* ── SYSCALLS ── */}
      <Section title={d("section.syscalls")} id="syscalls">
        <p>{d("syscalls.intro")}</p>
        <RustCode filename="core/src/syscall/mod.rs">{`/// 6-register argument pack — matches the x86_64 ABI:
/// rdi, rsi, rdx, r10, r8, r9
pub struct SyscallArgs {
    pub number: u64,
    pub args: [u64; 6],
}

/// 18 errno-compatible error codes.
pub enum SyscallError {
    Success = 0,
    PermissionDenied = 1,   // EPERM
    NotFound = 2,           // ENOENT
    IoError = 5,            // EIO
    BadFileDescriptor = 9,  // EBADF
    OutOfMemory = 12,       // ENOMEM
    PermissionFault = 13,   // EACCES
    FileExists = 17,        // EEXIST
    NotADirectory = 20,     // ENOTDIR
    InvalidArgument = 22,   // EINVAL
    TooManyFiles = 24,      // EMFILE
    NoSpace = 28,           // ENOSPC
    Pipe = 32,              // EPIPE
    WouldBlock = 35,        // EAGAIN
    InProgress = 36,        // EINPROGRESS
    TimedOut = 110,         // ETIMEDOUT
    NotSupported = 95,      // ENOTSUP
    Internal = 255,
}`}</RustCode>

        <RustCode filename="core/src/syscall/gateway.rs">{`/// The raw syscall entry point — called from assembly stubs.
/// This is the ONLY extern "C" function in the syscall path.
#[no_mangle]
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
}`}</RustCode>

        <RustCode filename="core/src/syscall/registry.rs">{`pub struct SyscallRegistry {
    table: [Option<Box<dyn SyscallHandler>>; 512],
    count: usize,
}

/// Declarative syscall registration:
define_syscall! {
    name: "sys_read",
    number: 0,
    handler: |args, ctx| { /* ... */ },
    validator: |args| {
        ArgValidator::new()
            .arg_not_null(args.args[0])     // fd
            .arg_not_null(args.args[1])     // buffer pointer
            .arg_in_range(args.args[2], 1, MAX_READ_SIZE)  // count
            .validate()
    },
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("syscalls.hooks.title")}</h3>
        <RustCode filename="core/src/syscall/dispatcher.rs">{`pub struct SyscallDispatcher {
    registry: SyscallRegistry,
    pre_hooks: Vec<Box<dyn SyscallHook>>,
    post_hooks: Vec<Box<dyn SyscallHook>>,
}

pub trait SyscallHook: Send + Sync {
    /// Called BEFORE the handler. Return Some() to short-circuit.
    fn pre_syscall(&self, number: u64, args: &SyscallArgs,
                   ctx: &CallerContext) -> Option<i64>;

    /// Called AFTER the handler with the result.
    fn post_syscall(&self, number: u64, result: i64,
                    ctx: &CallerContext);
}

pub struct CallerContext {
    pub pid: u64,
    pub tid: u64,
    pub uid: u32,
    pub gid: u32,
    pub from_user: bool,  // true = user-mode, false = kernel
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("syscalls.validation.title")}</h3>
        <RustCode filename="core/src/syscall/validation.rs">{`/// Fluent builder for syscall argument validation.
pub struct ArgValidator { errors: Vec<SyscallError> }

impl ArgValidator {
    pub fn new() -> Self;
    pub fn arg_not_null(self, val: u64) -> Self;
    pub fn arg_aligned(self, val: u64, align: usize) -> Self;
    pub fn arg_in_range(self, val: u64, min: u64, max: u64) -> Self;
    pub fn arg_valid_fd(self, fd: u64) -> Self;
    pub fn arg_valid_flags(self, flags: u64, mask: u64) -> Self;
    pub fn validate(self) -> Result<(), SyscallError>;
}

/// Standalone validation helpers:
pub fn validate_user_ptr(ptr: u64, len: usize) -> Result<(), SyscallError>;
pub fn validate_user_string(ptr: u64, max_len: usize) -> Result<&str, SyscallError>;
pub fn validate_fd(fd: u64) -> Result<(), SyscallError>;`}</RustCode>
      </Section>

      {/* ── IPC ── */}
      <Section title={d("section.ipc")} id="ipc">
        <p>{d("ipc.intro")}</p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">{d("ipc.channels.title")}</h3>
        <RustCode filename="core/src/ipc/channel.rs">{`/// Create a bounded multi-producer single-consumer channel.
/// Backed by a lock-free ring buffer.
pub fn channel<T: Send>(capacity: usize) -> (Sender<T>, Receiver<T>);

/// Default capacity: 32 slots.
pub fn default_channel<T: Send>() -> (Sender<T>, Receiver<T>);

/// One-shot channel: exactly one message, then closes.
pub fn oneshot<T: Send>() -> (OneShotSender<T>, OneShotReceiver<T>);

impl<T: Send> Sender<T> {
    pub fn send(&self, msg: T) -> Result<(), IpcError>;
    pub fn try_send(&self, msg: T) -> Result<(), IpcError>;
    pub fn is_full(&self) -> bool;
    pub fn capacity(&self) -> usize;
}

impl<T: Send> Receiver<T> {
    pub fn recv(&self) -> Result<T, IpcError>;
    pub fn try_recv(&self) -> Result<T, IpcError>;
    pub fn is_empty(&self) -> bool;
    pub fn len(&self) -> usize;
}

pub enum IpcError {
    ChannelFull,
    ChannelEmpty,
    ChannelClosed,
    Timeout,
    InvalidMessage,
    PermissionDenied,
    BufferTooSmall,
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("ipc.eventbus.title")}</h3>
        <RustCode filename="core/src/ipc/event_bus.rs">{`pub enum EventTopic {
    System, Memory, Scheduler, Module, Device,
    Network, FileSystem, Security, Custom(u16),
}

pub enum EventPriority {
    Critical = 0,  // Handled first
    High = 1,
    Normal = 2,
    Low = 3,
}

/// Global kernel event bus singleton.
pub static EVENT_BUS: Lazy<Mutex<KernelEventBus>> = ...;

pub struct KernelEventBus {
    subscribers: BTreeMap<EventTopic, Vec<Subscription>>,
    event_count: u64,
}

impl KernelEventBus {
    /// Subscribe with priority ordering. Higher priority = called first.
    pub fn subscribe(
        &mut self,
        name: &'static str,
        topics: &[EventTopic],
        handler: EventHandler,
        priority: EventPriority,
    ) -> SubscriberId;

    /// Publish an event. Returns number of handlers invoked.
    pub fn publish(&self, event: KernelEvent) -> usize;

    /// Unsubscribe by ID.
    pub fn unsubscribe(&mut self, id: SubscriberId) -> bool;
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("ipc.router.title")}</h3>
        <RustCode filename="core/src/ipc/message_router.rs">{`/// Point-to-point inter-module communication.
/// Each module registers a callback; others send typed requests.
pub struct MessageRouter {
    modules: BTreeMap<ModuleId, MessageCallback>,
    pending: BTreeMap<RequestId, PendingRequest>,
}

impl MessageRouter {
    /// Register a module's message handler.
    pub fn register_module(
        &mut self,
        name: &'static str,
        handler: MessageCallback,
    ) -> ModuleId;

    /// Send a request to a specific module. Blocks until response.
    pub fn send_request(
        &self,
        target: ModuleId,
        request: Request,
    ) -> Response;

    /// Send a request to ALL registered modules.
    pub fn broadcast(&self, request: Request) -> Vec<Response>;

    /// Unregister a module.
    pub fn unregister(&mut self, id: ModuleId) -> bool;
}

pub struct Request {
    pub msg_type: u32,
    pub payload: Vec<u8>,
    pub sender: ModuleId,
}

pub struct Response {
    pub status: ResponseStatus,
    pub payload: Vec<u8>,
}`}</RustCode>
      </Section>

      {/* ── SELF HEAL ── */}
      <Section title={d("section.selfheal")} id="selfheal">
        <p>{d("selfheal.intro")}</p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">{d("selfheal.manager.title")}</h3>
        <RustCode filename="core/src/selfheal.rs">{`pub enum HealthStatus {
    Healthy,        // Normal operation
    Degraded,       // Partial functionality
    Warning,        // Approaching failure
    Critical,       // Imminent failure
    Failed,         // Module has crashed
    Unknown,        // Cannot determine health
}

pub enum RecoveryAction {
    Restart,         // Kill + restart the module
    Rollback,        // Restore previous version
    Isolate,         // Quarantine the module
    Escalate,        // Notify orchestrator
    Ignore,          // Log and continue
}

/// Tracks per-module crash history and triggers recovery.
pub struct SelfHealingManager {
    modules: BTreeMap<String, ModuleHealth>,
    recovery_factories: BTreeMap<String, Box<dyn Fn() -> Box<dyn KernelComponent>>>,
    crash_threshold: u32,       // Max crashes before quarantine
    health_check_interval: u64, // Ticks between health probes
}

impl SelfHealingManager {
    /// Register a module with its recovery factory.
    pub fn register(
        &mut self,
        name: &str,
        module: Box<dyn KernelComponent>,
        factory: Box<dyn Fn() -> Box<dyn KernelComponent>>,
    );

    /// Called on every timer tick. Probes all modules.
    pub fn health_tick(&mut self);

    /// Called when a module crashes. Attempts recovery.
    pub fn handle_crash(&mut self, name: &str) -> RecoveryAction;

    /// Get the current health report for all modules.
    pub fn health_report(&self) -> Vec<(String, HealthStatus)>;
}

struct ModuleHealth {
    status: HealthStatus,
    crash_count: u32,
    last_crash: Option<u64>,
    last_health_check: u64,
    saved_state: Option<Vec<u8>>,
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("selfheal.hotreload.title")}</h3>
        <RustCode filename="core/src/hotreload/mod.rs">{`/// Module categories that support hot-reload.
pub enum ModuleType {
    Scheduler,       // DIS, Round-Robin, Priority
    MemoryManager,   // Allocator strategies
    FileSystem,      // VFS backends
    NetworkStack,    // Protocol handlers
    DeviceDriver,    // Hardware drivers
    SecurityModule,  // IDS, firewall
    Logger,          // Log backends
    Custom(String),
}

/// Any module that supports live replacement must implement this.
pub trait HotReloadableModule: Send + Sync {
    fn module_type(&self) -> ModuleType;
    fn version(&self) -> &str;

    /// Serialize the module's current state for transfer.
    fn save_state(&self) -> Result<Vec<u8>, KernelError>;

    /// Restore state from a previous version's serialization.
    fn restore_state(&mut self, state: &[u8]) -> Result<(), KernelError>;

    /// Called before the swap — prepare for shutdown.
    fn prepare_swap(&mut self) -> Result<(), KernelError>;

    /// Called after the swap — finalize activation.
    fn finalize_swap(&mut self) -> Result<(), KernelError>;
}

/// The 5-step atomic hot-swap sequence:
///
/// 1. old.save_state()       → serialized state
/// 2. old.prepare_swap()     → quiesce the old module
/// 3. new.restore_state()    → inject state into new module
/// 4. ATOMIC POINTER SWAP    → replace the module reference
/// 5. new.finalize_swap()    → activate the new module
///
/// If any step fails, the old module is restored.
pub fn hot_swap(
    registry: &mut HotReloadRegistry,
    module_type: ModuleType,
    new_module: Box<dyn HotReloadableModule>,
) -> Result<(), KernelError>;

pub struct HotReloadRegistry {
    modules: BTreeMap<String, Box<dyn HotReloadableModule>>,
    swap_count: u64,
    rollback_count: u64,
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">{d("selfheal.example.title")}</h3>
        <RustCode filename="core/src/hotreload/schedulers.rs">{`/// Both RoundRobinScheduler and PriorityScheduler implement
/// HotReloadableModule, enabling live scheduler replacement.
///
/// Demo sequence (from profiles/minimal):
/// 1. Start with RoundRobinScheduler (FIFO, equal time slices)
/// 2. Run some tasks, verify round-robin behavior
/// 3. hot_swap() to PriorityScheduler
///    - RR saves its ready queue → serializes thread list
///    - Priority restores → rebuilds priority heap from same threads
///    - ATOMIC SWAP → zero dropped tasks
/// 4. Continue running — now with priority scheduling
/// 5. Verify all threads still alive, no interruption

pub struct RoundRobinScheduler {
    ready_queue: VecDeque<ThreadId>,
    current: Option<ThreadId>,
    time_slice: u64,
}

pub struct PriorityScheduler {
    priority_queues: [VecDeque<ThreadId>; 8],  // 8 priority levels
    current: Option<ThreadId>,
    preemption_enabled: bool,
}`}</RustCode>
      </Section>

      {/* ── INTERRUPTS ── */}
      <Section title={d("section.interrupts")} id="interrupts">
        <p>{d("interrupts.intro")}</p>
        <RustCode filename="core/src/interrupts/mod.rs">{`/// 256-vector interrupt dispatch table.
/// Vectors 0-31: CPU exceptions (page fault, GPF, double fault, etc.)
/// Vectors 32-255: External interrupts (timer, keyboard, etc.)
pub struct InterruptDispatcher {
    handlers: [Option<Box<dyn InterruptHandler>>; 256],
    stats: [InterruptStats; 256],
}

impl InterruptDispatcher {
    pub fn register(&mut self, vector: u8, handler: Box<dyn InterruptHandler>);
    pub fn unregister(&mut self, vector: u8);
    pub fn dispatch(&mut self, vector: u8, frame: &InterruptFrame);
    pub fn stats(&self, vector: u8) -> &InterruptStats;
}

pub struct InterruptStats {
    pub count: u64,
    pub last_ns: u64,
    pub total_ns: u64,
    pub max_ns: u64,
}`}</RustCode>

        <RustCode filename="core/src/interrupts/router.rs">{`/// How interrupts are delivered to handlers.
pub enum RoutingMode {
    Direct,          // Fixed vector → handler
    Balanced,        // Distribute across CPUs
    AffinityBased,   // Route to specific CPU
    Priority,        // Handle highest priority first
}

pub struct InterruptRouter {
    mode: RoutingMode,
    cpu_affinity: BTreeMap<u8, CpuId>,
    priority_map: BTreeMap<u8, u8>,
}`}</RustCode>

        <RustCode filename="core/src/interrupts/exceptions.rs">{`/// Dedicated exception handling for CPU vectors 0-31.
pub trait ExceptionHandler: Send + Sync {
    fn handle(&self, vector: u8, frame: &InterruptFrame, error_code: Option<u64>);
    fn name(&self) -> &'static str;
}

pub struct ExceptionDispatcher {
    handlers: [Option<Box<dyn ExceptionHandler>>; 32],
}

// Default handlers registered at boot:
// Vector 0:  Division Error
// Vector 6:  Invalid Opcode
// Vector 8:  Double Fault (IST stack)
// Vector 13: General Protection Fault
// Vector 14: Page Fault (with CR2 address)
// Vector 32: Timer interrupt (triggers scheduler tick)`}</RustCode>
      </Section>

      {/* ── DEBUG ── */}
      <Section title={d("section.debug")} id="debug">
        <p>{d("debug.intro")}</p>
        <RustCode filename="core/src/debug/console.rs">{`/// Print macros — work in no_std, route through DebugInterface.
///
/// kprint!("hello");              // No newline
/// kprintln!("count: {}", 42);    // With newline
/// kdebug!("ptr: {:#x}", addr);   // Debug-only (stripped in release)
/// kinfo!("boot complete");       // Info level
/// kwarn!("low memory");          // Warning level
/// kerror!("page fault at {:#x}", cr2);  // Error level

pub trait DebugInterface: Send + Sync {
    fn write_str(&self, s: &str);
    fn write_char(&self, c: char);
    fn set_color(&self, fg: Color, bg: Color);
    fn clear(&self);
}

pub trait DebugCommand: Send + Sync {
    fn name(&self) -> &'static str;
    fn help(&self) -> &'static str;
    fn execute(&self, args: &[&str]) -> Result<String, KernelError>;
}`}</RustCode>
      </Section>

      {/* ── PANIC ── */}
      <Section title={d("section.panic")} id="panic">
        <p>{d("panic.intro")}</p>
        <RustCode filename="core/src/orchestrator/panic_handler.rs">{`pub enum PanicAction {
    Halt,           // Halt CPU forever
    Reboot,         // Triple-fault reboot
    DebugBreak,     // INT3 for debugger
    StackDump,      // Print backtrace then halt
    SelfHeal,       // Attempt recovery via self-heal manager
}

/// Custom assertion macros with panic actions:
///
/// kernel_assert!(condition, "message");
///     → panics with StackDump action
///
/// kernel_debug_assert!(condition, "message");
///     → only checked in debug builds
///
/// kernel_unreachable!("should never reach here");
///     → always panics — marks unreachable code paths`}</RustCode>
      </Section>

    </div>
  );
}
