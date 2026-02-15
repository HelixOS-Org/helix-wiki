"use client";

import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import Footer from "@/helix-wiki/components/Footer";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import modulesContent from "@/helix-wiki/lib/docs-i18n/modules";
import StateMachine from "@/helix-wiki/components/diagrams/StateMachine";

export default function ModulesPage() {
  const { locale } = useI18n();
  const d = (key: string) => getDocString(modulesContent, locale, key);
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader title={d("header.title")} subtitle={d("header.subtitle")} badge={d("header.badge")} gradient="from-violet-400 to-purple-500" />

      {/* ── PHILOSOPHY ── */}
      <Section title="Philosophy" id="philosophy">
        <p>{d("philosophy.intro")}</p>
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">{d("philosophy.mechanism.title")}</h4>
            <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
              <li>IPC channels, event bus, message router</li>
              <li>Syscall dispatch table (512 entries)</li>
              <li>Interrupt routing (256 vectors)</li>
              <li>Capability broker (rights management)</li>
              <li>Self-heal + hot-reload infrastructure</li>
            </ul>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">{d("philosophy.policy.title")}</h4>
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
        <p>{d("types.intro")}</p>
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
        <p>{d("metadata.intro")}</p>
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
        <p>{d("trait.intro")}</p>
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
        <p>{d("registry.intro")}</p>
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
        <p>{d("macro.intro")}</p>
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
        <p>{d("lifecycle.intro")}</p>
        <StateMachine
          title="Module Lifecycle State Machine"
          width={700}
          height={420}
          nodes={[
            { id: "unloaded",     label: "Unloaded",      x: 80,  y: 60,  color: "zinc",   type: "start",
              info: { description: "Module binary exists on disk but is not loaded into kernel memory. No resources allocated.", entryActions: ["Release all handles", "Free memory pages"], exitActions: ["Parse ELF header", "Validate ABI magic"], invariants: ["No kernel memory used", "No registry entry"], duration: "N/A" } },
            { id: "loading",      label: "Loading",       x: 240, y: 60,  color: "blue",
              info: { description: "ELF binary is being parsed, relocated, and prepared for execution. Dependencies are resolved from the module registry.", entryActions: ["Allocate memory pages", "Parse ELF sections", "Apply relocations"], exitActions: ["Verify symbol table", "Lock dependency graph"], invariants: ["Valid ELF in memory", "All relocations applied"], duration: "~10-50 ms" } },
            { id: "loaded",       label: "Loaded",        x: 400, y: 60,  color: "blue",
              info: { description: "Module is in kernel memory with all relocations resolved. Dependencies are verified but init() has not been called yet.", entryActions: ["Register in ModuleRegistry", "Freeze relocations"], exitActions: ["Prepare ModuleContext"], invariants: ["All deps satisfied", "ABI compatible"], duration: "Stable" } },
            { id: "initializing", label: "Initializing",  x: 400, y: 160, color: "purple",
              info: { description: "Module's init() function is executing. The module registers its services, allocates runtime resources, and subscribes to events.", entryActions: ["Call Module::init(ctx)", "Start init timeout (5s)"], exitActions: ["Verify required services registered"], invariants: ["ModuleContext valid", "Timeout not exceeded"], duration: "~50-500 ms" } },
            { id: "active",       label: "Active",        x: 400, y: 260, color: "green",
              info: { description: "Module is fully operational and serving requests. It responds to IPC messages, handles syscalls, and participates in the event bus.", entryActions: ["Mark services as available", "Start health monitoring"], exitActions: ["Drain pending requests"], invariants: ["Health check passing", "Memory within budget"], duration: "Indefinite", canSelfHeal: true } },
            { id: "paused",       label: "Paused",        x: 580, y: 260, color: "amber",
              info: { description: "Module is temporarily suspended. State is preserved in memory but no new requests are processed. Used for hot-upgrade preparation.", entryActions: ["Checkpoint state", "Queue incoming requests"], exitActions: ["Replay queued requests"], invariants: ["State checkpointed", "No active handlers"], duration: "Temporary" } },
            { id: "stopping",     label: "Stopping",      x: 400, y: 360, color: "amber",
              info: { description: "Graceful shutdown in progress. Module drains remaining work, unsubscribes from events, and releases resources in reverse init order.", entryActions: ["Call Module::stop()", "Start shutdown timeout (10s)"], exitActions: ["Unregister from ModuleRegistry"], invariants: ["No new requests accepted", "Shutdown timer active"], duration: "~100-2000 ms" } },
            { id: "error",        label: "Error",         x: 200, y: 260, color: "red",    type: "error",
              info: { description: "Module has crashed or failed a health check. NEXUS quarantines it and attempts automated recovery (restart, rollback, or hot-swap).", entryActions: ["Quarantine module", "Notify NEXUS", "Capture crash dump"], exitActions: ["Attempt recovery strategy"], invariants: ["Module isolated", "Crash dump saved"], duration: "Recovery: ~1-5s", canSelfHeal: true } },
            { id: "zombie",       label: "Zombie",        x: 200, y: 360, color: "pink",   type: "error",
              info: { description: "Recovery failed after maximum retry attempts. Module state is preserved for post-mortem debugging but it cannot be restarted automatically.", entryActions: ["Log final failure", "Preserve state for debug"], exitActions: ["Manual intervention required"], invariants: ["State frozen", "No auto-recovery"], duration: "Until manual action" } },
          ]}
          transitions={[
            { from: "unloaded",     to: "loading",      label: "load()",
              info: { description: "Load module binary from disk into kernel memory", guard: "File exists && ABI version matches", action: "parse_elf() → relocate() → verify()", probability: "Always" } },
            { from: "loading",      to: "loaded",       label: "",
              info: { description: "Automatic transition when loading completes successfully", action: "register_in_registry()", probability: "~95%" } },
            { from: "loaded",       to: "initializing", label: "init()",
              info: { description: "Call module's initialization function with kernel context", guard: "All dependencies active", action: "Module::init(ModuleContext)", probability: "Always" } },
            { from: "initializing", to: "active",       label: "start()",
              info: { description: "Module init completed successfully, now serving requests", guard: "Required services registered", action: "enable_health_monitor()", probability: "~90%" } },
            { from: "initializing", to: "error",        label: "fail", curved: -30,
              info: { description: "Module init() returned an error or timed out (>5s)", guard: "init() error || timeout", action: "quarantine() → notify_nexus()", probability: "~10%" } },
            { from: "active",       to: "paused",       label: "pause()",
              info: { description: "Temporarily suspend module for hot-upgrade or maintenance", guard: "No critical in-flight ops", action: "checkpoint_state() → queue_requests()", probability: "Rare" } },
            { from: "paused",       to: "active",       label: "resume()", curved: -20,
              info: { description: "Resume paused module and replay queued requests", guard: "Checkpoint valid", action: "restore_state() → replay_queue()", probability: "Always" } },
            { from: "active",       to: "stopping",     label: "stop()",
              info: { description: "Begin graceful shutdown sequence", action: "drain_requests() → unsubscribe_events()", probability: "On demand" } },
            { from: "active",       to: "error",        label: "", curved: 30,
              info: { description: "Module crashed or failed health check while active", guard: "Panic || health_check_fail", action: "capture_dump() → quarantine()", probability: "~2%" } },
            { from: "stopping",     to: "unloaded",     label: "cleanup()", curved: 40,
              info: { description: "Final cleanup: release memory, close handles, remove from registry", action: "Module::cleanup() → free_pages()", probability: "~98%" } },
            { from: "error",        to: "zombie",       label: "timeout",
              info: { description: "All recovery strategies exhausted after 3 attempts", guard: "retry_count >= 3", action: "freeze_state() → log_postmortem()", probability: "~5%" } },
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
        <p>{d("example.intro")}</p>
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
