import type { Metadata } from "next";
import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import Footer from "@/helix-wiki/components/Footer";

export const metadata: Metadata = {
  title: "Module System — Hot-Swappable Plugins, ABI Versioning & KernelModule Trait",
  description: "Build hot-swappable kernel modules for Helix OS. Learn the KernelModule trait, define_module! macro, lifecycle states, ABI versioning, capability requirements, and the module registry API.",
  alternates: { canonical: "/docs/modules" },
  openGraph: {
    title: "Helix Module System — Hot-Reload Kernel Plugins in Rust",
    description: "Complete guide to extending the Helix kernel: module metadata, lifecycle management, state export/import for live replacement, dependency resolution, and the declarative define_module! macro.",
    url: "https://helix-wiki.com/docs/modules",
  },
};
import StateMachine from "@/helix-wiki/components/diagrams/StateMachine";

export default function ModulesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader title="Module System" subtitle="2,559 lines across 9 files — a hot-swappable, capability-gated module framework with ABI versioning, dependency resolution, and a full lifecycle state machine." badge="MODULE FRAMEWORK" gradient="from-violet-400 to-purple-500" />

      {/* ── PHILOSOPHY ── */}
      <Section title="Philosophy" id="philosophy">
        <p>In Helix, the core kernel provides <em>mechanisms</em> — the module system provides <em>policy</em>. Schedulers, filesystems, drivers, and security modules are all loadable/unloadable at runtime:</p>
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">🔧 Mechanism (Core)</h4>
            <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
              <li>IPC channels, event bus, message router</li>
              <li>Syscall dispatch table (512 entries)</li>
              <li>Interrupt routing (256 vectors)</li>
              <li>Capability broker (rights management)</li>
              <li>Self-heal + hot-reload infrastructure</li>
            </ul>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">📋 Policy (Modules)</h4>
            <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
              <li>Which scheduling algorithm to use</li>
              <li>How to allocate memory</li>
              <li>Which filesystem to mount</li>
              <li>Network stack behavior</li>
              <li>Security and access control rules</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* ── CORE TYPES ── */}
      <Section title="Core Types" id="types">
        <p>Every module has an identity, version, state, and a set of capability flags:</p>
        <RustCode filename="modules/src/lib.rs">{`pub struct ModuleId(u64);  // Auto-incrementing atomic counter

pub struct ModuleVersion {
    pub major: u16,
    pub minor: u16,
    pub patch: u16,
}

/// 10 capability flags that control what a module can do.
bitflags! {
    pub struct ModuleFlags: u32 {
        const ESSENTIAL       = 1 << 0;  // Cannot be unloaded
        const HOT_RELOADABLE  = 1 << 1;  // Supports live swap
        const USERSPACE       = 1 << 2;  // Runs in user mode
        const DRIVER          = 1 << 3;  // Hardware driver
        const FILESYSTEM      = 1 << 4;  // FS implementation
        const SCHEDULER       = 1 << 5;  // Scheduling policy
        const ALLOCATOR       = 1 << 6;  // Memory allocator
        const SECURITY        = 1 << 7;  // Security module
        const EXPERIMENTAL    = 1 << 8;  // Not production-ready
        const DEPRECATED      = 1 << 9;  // Scheduled for removal
    }
}

/// The 9-state lifecycle of a module.
pub enum ModuleState {
    Unloaded,       // Not loaded into memory
    Loading,        // Being loaded (ELF parsing, relocation)
    Loaded,         // In memory, not initialized
    Initializing,   // init() in progress
    Active,         // Running normally
    Paused,         // Temporarily suspended
    Stopping,       // stop() in progress
    Error,          // Failed — awaiting recovery
    Zombie,         // Crashed, state preserved for debug
}

pub enum ModuleError {
    NotFound,
    AlreadyLoaded,
    AlreadyInitialized,
    NotLoaded,
    DependencyMissing(String),
    DependencyCycle,
    InitializationFailed(String),
    VersionMismatch,
    AbiIncompatible,
    PermissionDenied,
    InvalidState,
    ResourceExhausted,
}`}</RustCode>
      </Section>

      {/* ── METADATA ── */}
      <Section title="Module Metadata" id="metadata">
        <p>Rich metadata describes each module — used by the registry for dependency resolution, version checking, and capability negotiation:</p>
        <RustCode filename="modules/src/metadata.rs">{`pub struct ModuleMetadata {
    pub name: String,
    pub version: ModuleVersion,
    pub author: Option<String>,
    pub description: Option<String>,
    pub license: Option<String>,
    pub flags: ModuleFlags,
    pub dependencies: Vec<ModuleDependency>,
    pub provides: Vec<String>,           // Capabilities this module provides
    pub abi_version: AbiVersion,
}

pub struct ModuleDependency {
    pub name: String,
    pub min_version: Option<ModuleVersion>,
    pub max_version: Option<ModuleVersion>,
    pub optional: bool,
}

pub struct AbiVersion {
    pub major: u16,  // Breaking changes
    pub minor: u16,  // Backwards-compatible additions
}

impl AbiVersion {
    /// ABI compatibility: same major, consumer minor <= provider minor.
    pub fn is_compatible_with(&self, other: &AbiVersion) -> bool {
        self.major == other.major && self.minor <= other.minor
    }
}`}</RustCode>
      </Section>

      {/* ── MODULE TRAIT ── */}
      <Section title="Module Trait" id="trait">
        <p>The core module trait — every module must implement this. It covers the full lifecycle from init to cleanup, plus health monitoring and state serialization for hot-reload:</p>
        <RustCode filename="modules/src/lib.rs">{`pub trait Module: Send + Sync {
    /// Return this module's metadata.
    fn metadata(&self) -> &ModuleMetadata;

    /// Initialize the module. Called once after loading.
    /// Receives a context for accessing kernel services.
    fn init(&mut self, ctx: &mut ModuleContext) -> ModuleResult<()>;

    /// Start the module — begin active operation.
    fn start(&mut self) -> ModuleResult<()>;

    /// Stop the module — cease operation, keep state.
    fn stop(&mut self) -> ModuleResult<()>;

    /// Full cleanup — release all resources, prepare for unload.
    fn cleanup(&mut self) -> ModuleResult<()>;

    /// Health probe — called periodically by self-heal manager.
    fn is_healthy(&self) -> bool;

    /// Serialize state for hot-reload transfer.
    fn get_state(&self) -> Option<Vec<u8>>;

    /// Restore state from a previous module version.
    fn restore_state(&mut self, state: &[u8]) -> ModuleResult<()>;

    /// Handle an inter-module message.
    fn handle_message(&mut self, msg: &ModuleMessage)
        -> ModuleResult<Option<ModuleMessage>>;
}

pub struct ModuleContext {
    pub module_id: ModuleId,
    pub event_bus: &'static EventBus,
    pub message_router: &'static MessageRouter,
    pub capabilities: CapabilitySet,
}

pub struct ModuleMessage {
    pub sender: ModuleId,
    pub msg_type: u32,
    pub payload: Vec<u8>,
    pub requires_response: bool,
}`}</RustCode>
      </Section>

      {/* ── REGISTRY ── */}
      <Section title="Module Registry" id="registry">
        <p>The registry manages module loading, dependency resolution, and state tracking:</p>
        <RustCode filename="modules/src/registry.rs">{`pub struct ModuleRegistry {
    modules: BTreeMap<ModuleId, ModuleEntry>,
    name_index: BTreeMap<String, ModuleId>,
    next_id: AtomicU64,
}

struct ModuleEntry {
    module: Box<dyn Module>,
    state: ModuleState,
    loaded_at: u64,
    error_count: u32,
    last_health_check: u64,
}

impl ModuleRegistry {
    /// Load a module into the registry.
    /// Validates ABI, resolves dependencies, assigns an ID.
    pub fn load(&mut self, module: Box<dyn Module>)
        -> ModuleResult<ModuleId>;

    /// Initialize a loaded module.
    pub fn init(&mut self, id: ModuleId) -> ModuleResult<()>;

    /// Start a module (transitions: Loaded → Active).
    pub fn start(&mut self, id: ModuleId) -> ModuleResult<()>;

    /// Stop a module (transitions: Active → Loaded).
    pub fn stop(&mut self, id: ModuleId) -> ModuleResult<()>;

    /// Unload a module — full cleanup + removal.
    pub fn unload(&mut self, id: ModuleId) -> ModuleResult<()>;

    /// Find a module by name.
    pub fn find(&self, name: &str) -> Option<ModuleId>;

    /// List all modules with their states.
    pub fn list(&self) -> Vec<(ModuleId, &str, ModuleState)>;

    /// Check if all dependencies are satisfied.
    fn resolve_dependencies(&self, meta: &ModuleMetadata)
        -> ModuleResult<()>;
}`}</RustCode>
      </Section>

      {/* ── DEFINE MACRO ── */}
      <Section title="define_module! Macro" id="macro">
        <p>Declarative module definition — generates metadata and boilerplate:</p>
        <RustCode filename="modules/src/lib.rs">{`/// Declare a module with all its metadata in one block.
define_module! {
    name: "round_robin_scheduler",
    version: (1, 0, 0),
    flags: SCHEDULER | HOT_RELOADABLE,
    dependencies: [
        { name: "execution", min: (0, 1, 0) },
    ],
    provides: ["scheduler", "thread_management"],
}

// Expands to:
// - impl ModuleMetadata for YourModule
// - Static MODULE_INFO with name, version, flags
// - Dependency list with version constraints
// - Capability declarations`}</RustCode>
      </Section>

      {/* ── LIFECYCLE ── */}
      <Section title="Module Lifecycle" id="lifecycle">
        <p>The complete 9-phase state machine with valid transitions:</p>
        <StateMachine
          width={700}
          height={420}
          nodes={[
            { id: "unloaded",     label: "Unloaded",      x: 80,  y: 60,  color: "zinc",   type: "start" },
            { id: "loading",      label: "Loading",       x: 240, y: 60,  color: "blue" },
            { id: "loaded",       label: "Loaded",        x: 400, y: 60,  color: "blue" },
            { id: "initializing", label: "Initializing",  x: 400, y: 160, color: "purple" },
            { id: "active",       label: "Active",        x: 400, y: 260, color: "green" },
            { id: "paused",       label: "Paused",        x: 580, y: 260, color: "amber" },
            { id: "stopping",     label: "Stopping",      x: 400, y: 360, color: "amber" },
            { id: "error",        label: "Error",         x: 200, y: 260, color: "red",    type: "error" },
            { id: "zombie",       label: "Zombie",        x: 200, y: 360, color: "pink",   type: "error" },
          ]}
          transitions={[
            { from: "unloaded",     to: "loading",      label: "load()" },
            { from: "loading",      to: "loaded",       label: "" },
            { from: "loaded",       to: "initializing", label: "init()" },
            { from: "initializing", to: "active",       label: "start()" },
            { from: "initializing", to: "error",        label: "fail", curved: -30 },
            { from: "active",       to: "paused",       label: "pause()" },
            { from: "paused",       to: "active",       label: "resume()", curved: -20 },
            { from: "active",       to: "stopping",     label: "stop()" },
            { from: "active",       to: "error",        label: "", curved: 30 },
            { from: "stopping",     to: "unloaded",     label: "cleanup()", curved: 40 },
            { from: "error",        to: "zombie",       label: "timeout" },
          ]}
        />
        <InfoTable
          columns={[
            { header: "Phase", key: "phase" },
            { header: "Trigger", key: "trigger" },
            { header: "Description", key: "desc" },
          ]}
          rows={[
            { phase: "Unloaded → Loading", trigger: "registry.load()", desc: "ELF parsing, relocation, ABI validation" },
            { phase: "Loading → Loaded", trigger: "automatic", desc: "Dependencies resolved, module in memory" },
            { phase: "Loaded → Initializing", trigger: "registry.init()", desc: "Module.init() called with ModuleContext" },
            { phase: "Initializing → Active", trigger: "Module.start()", desc: "Module is fully operational" },
            { phase: "Active → Paused", trigger: "Module.pause()", desc: "Temporarily suspended, state preserved" },
            { phase: "Paused → Active", trigger: "Module.resume()", desc: "Resuming from pause" },
            { phase: "Active → Stopping", trigger: "Module.stop()", desc: "Graceful shutdown in progress" },
            { phase: "Stopping → Unloaded", trigger: "Module.cleanup()", desc: "Resources released, removed from registry" },
            { phase: "Any → Error", trigger: "failure", desc: "Module crashed, awaiting recovery" },
            { phase: "Error → Zombie", trigger: "timeout", desc: "Recovery failed, state preserved for debug" },
          ]}
        />
      </Section>

      {/* ── EXAMPLE ── */}
      <Section title="Example: Round-Robin Scheduler" id="example">
        <p>The <code className="text-helix-blue">modules_impl/schedulers/round_robin</code> crate demonstrates a complete module implementation with hot-reload support:</p>
        <RustCode filename="modules_impl/schedulers/round_robin/src/lib.rs">{`pub struct RoundRobinScheduler {
    ready_queue: VecDeque<ThreadId>,
    current: Option<ThreadId>,
    quantum: u64,            // Time slice in ticks
    tick_count: u64,
}

impl Module for RoundRobinScheduler {
    fn metadata(&self) -> &ModuleMetadata {
        &ModuleMetadata {
            name: "round_robin".into(),
            version: ModuleVersion { major: 1, minor: 0, patch: 0 },
            flags: ModuleFlags::SCHEDULER | ModuleFlags::HOT_RELOADABLE,
            dependencies: vec![
                ModuleDependency {
                    name: "execution".into(),
                    min_version: Some(ModuleVersion { major: 0, minor: 1, patch: 0 }),
                    ..Default::default()
                },
            ],
            provides: vec!["scheduler".into()],
            ..Default::default()
        }
    }

    fn init(&mut self, _ctx: &mut ModuleContext) -> ModuleResult<()> {
        self.quantum = 10;  // 10 ticks default
        Ok(())
    }

    fn start(&mut self) -> ModuleResult<()> { Ok(()) }
    fn stop(&mut self) -> ModuleResult<()> { Ok(()) }
    fn cleanup(&mut self) -> ModuleResult<()> {
        self.ready_queue.clear();
        Ok(())
    }

    fn is_healthy(&self) -> bool { true }

    /// Serialize ready queue for hot-reload transfer.
    fn get_state(&self) -> Option<Vec<u8>> {
        let thread_ids: Vec<u64> = self.ready_queue.iter()
            .map(|id| id.0)
            .collect();
        Some(serialize(&thread_ids))
    }

    /// Restore ready queue from serialized state.
    fn restore_state(&mut self, state: &[u8]) -> ModuleResult<()> {
        let thread_ids: Vec<u64> = deserialize(state)?;
        self.ready_queue = thread_ids.into_iter()
            .map(ThreadId)
            .collect();
        Ok(())
    }
}

impl Scheduler for RoundRobinScheduler {
    fn next_thread(&mut self) -> Option<ThreadId> {
        // FIFO: pop front, push to back
        let next = self.ready_queue.pop_front()?;
        self.ready_queue.push_back(next);
        self.current = Some(next);
        Some(next)
    }

    fn tick(&mut self) {
        self.tick_count += 1;
        if self.tick_count % self.quantum == 0 {
            self.yield_current();
        }
    }
}`}</RustCode>
      </Section>

      <Footer />
    </div>
  );
}
