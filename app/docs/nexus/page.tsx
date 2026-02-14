import type { Metadata } from "next";
import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import Footer from "@/helix-wiki/components/Footer";

export const metadata: Metadata = {
  title: "NEXUS — AI-Powered Kernel Intelligence: Prediction, Detection & Quarantine",
  description: "NEXUS: 812K lines of kernel intelligence. Custom no_std ML framework for crash prediction, anomaly detection, resource optimization, thermal management, and module quarantine.",
  alternates: { canonical: "/docs/nexus" },
  openGraph: {
    title: "NEXUS — Machine Learning Inside the Kernel",
    description: "The AI brain of Helix OS: tensor operations, gradient descent, predictive crash analysis, statistical outlier detection, and automatic quarantine escalation — all running at ring 0.",
    url: "https://helix-wiki.com/docs/nexus",
  },
};
import FileTree from "@/helix-wiki/components/diagrams/FileTree";

export default function NexusPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader title="NEXUS" subtitle="812,081 lines across 2,346 files — the AI-driven self-healing intelligence layer. 90+ modules spanning machine learning, crash prediction, anomaly detection, quarantine, and autonomous optimization." badge="AI ENGINE" gradient="from-emerald-400 to-cyan-500" />

      {/* ── OVERVIEW ── */}
      <Section title="Architecture Overview" id="overview">
        <p>NEXUS is a kernel-integrated AI subsystem that monitors every facet of the operating system — predicting failures before they happen, detecting anomalies in real time, quarantining misbehaving components, and autonomously healing the system. It operates across 7 intelligence levels:</p>

        <RustCode filename="subsystems/nexus/src/lib.rs">{`pub struct Nexus {
    level: NexusLevel,
    state: NexusState,
    components: BTreeMap<ComponentId, ComponentInfo>,
    predictor: CrashPredictor,
    anomaly_detector: AnomalyDetector,
    quarantine: QuarantineManager,
    healer: SelfHealer,
    optimizer: PerformanceOptimizer,
}

pub enum NexusLevel {
    L0_Monitoring,    // Passive telemetry only
    L1_Detection,     // Anomaly detection active
    L2_Prediction,    // Crash prediction active
    L3_Prevention,    // Proactive failure prevention
    L4_Healing,       // Autonomous self-healing
    L5_Optimization,  // Performance optimization
    L6_Evolution,     // Self-modifying AI
}

pub enum NexusState {
    Initializing,
    Active,
    Degraded,     // Some modules failed
    Emergency,    // Critical failure mode
    Shutdown,
}

pub type ComponentId = u64;

pub struct NexusDecision {
    pub action: Action,
    pub confidence: f64,        // 0.0 .. 1.0
    pub reasoning: &'static str,
    pub component: ComponentId,
    pub timestamp: u64,
}

pub enum Action {
    None,
    Monitor,            // Increase telemetry rate
    Warn,               // Log a warning
    Throttle,           // Reduce component resources
    Quarantine,         // Isolate the component
    Restart,            // Kill and restart
    HotReload,          // Swap module in place
}

impl Nexus {
    pub fn new() -> Self;
    pub fn tick(&mut self);                        // Main loop
    pub fn evaluate(&self, id: ComponentId) -> NexusDecision;
    pub fn escalate_level(&mut self, level: NexusLevel);
    pub fn register_component(&mut self, id: ComponentId, info: ComponentInfo);
    pub fn unregister_component(&mut self, id: ComponentId);
}`}</RustCode>
      </Section>

      {/* ── MODULES ── */}
      <Section title="Module Inventory" id="modules">
        <p>NEXUS is the largest subsystem in Helix — 90+ modules organized into functional domains. Here is a representative sample:</p>
        <InfoTable
          columns={[
            { header: "Domain", key: "domain" },
            { header: "Key Modules", key: "modules" },
            { header: "Lines", key: "lines" },
          ]}
          rows={[
            { domain: "Core", modules: "nexus, config, state, lifecycle, registry", lines: "~15K" },
            { domain: "ML Framework", modules: "decision_tree, random_forest, neural_net, k_means, svm, online_learner", lines: "~85K" },
            { domain: "Prediction", modules: "crash_predictor, feature_extractor, failure_classifier, action_selector", lines: "~45K" },
            { domain: "Anomaly", modules: "anomaly_detector, statistical_model, time_series, pattern_matcher", lines: "~60K" },
            { domain: "Quarantine", modules: "quarantine_manager, isolation_policy, resource_fence, rollback", lines: "~30K" },
            { domain: "Healing", modules: "self_healer, recovery_strategy, state_checkpoint, hot_swap", lines: "~40K" },
            { domain: "Optimization", modules: "perf_optimizer, scheduler_tuner, memory_advisor, cache_policy", lines: "~55K" },
            { domain: "Telemetry", modules: "metrics_collector, event_bus, trace_buffer, health_monitor", lines: "~35K" },
            { domain: "Roadmap", modules: "q1_hardening, q2_prediction, q3_healing, q4_performance, y2_cognition, y3_evolution, y4_symbiosis", lines: "~450K" },
          ]}
        />
      </Section>

      {/* ── ML FRAMEWORK ── */}
      <Section title="Machine Learning Framework" id="ml">
        <p>NEXUS includes a complete, <code className="text-helix-blue">no_std</code> machine learning framework built from scratch — no TensorFlow, no Python, no external dependencies. All inference runs in kernel space:</p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Decision Tree</h3>
        <RustCode filename="subsystems/nexus/src/ml/decision_tree.rs">{`pub struct DecisionTree {
    root: Option<Box<TreeNode>>,
    max_depth: usize,
    min_samples_split: usize,
    feature_count: usize,
}

enum TreeNode {
    Internal {
        feature_index: usize,     // Which feature to split on
        threshold: f64,           // Split threshold
        left: Box<TreeNode>,      // ≤ threshold
        right: Box<TreeNode>,     // > threshold
        impurity_decrease: f64,
    },
    Leaf {
        prediction: f64,          // Class or regression value
        sample_count: usize,
        confidence: f64,
    },
}

impl DecisionTree {
    pub fn fit(&mut self, features: &[Vec<f64>], labels: &[f64]);
    pub fn predict(&self, sample: &[f64]) -> f64;
    pub fn predict_proba(&self, sample: &[f64]) -> Vec<f64>;
    pub fn feature_importance(&self) -> Vec<f64>;
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Random Forest</h3>
        <RustCode filename="subsystems/nexus/src/ml/random_forest.rs">{`pub struct RandomForest {
    trees: Vec<DecisionTree>,
    n_estimators: usize,        // Number of trees (default: 100)
    max_features: usize,        // Features sampled per tree
    bootstrap: bool,            // Use bootstrap sampling
}

impl RandomForest {
    pub fn new(n_estimators: usize) -> Self;
    pub fn fit(&mut self, features: &[Vec<f64>], labels: &[f64]);

    /// Predict by majority vote across all trees.
    pub fn predict(&self, sample: &[f64]) -> f64;

    /// Average probability across trees.
    pub fn predict_proba(&self, sample: &[f64]) -> Vec<f64>;

    /// Out-of-bag error estimate.
    pub fn oob_score(&self) -> f64;
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Neural Network</h3>
        <RustCode filename="subsystems/nexus/src/ml/neural_net.rs">{`pub struct NeuralNetwork {
    layers: Vec<Layer>,
    learning_rate: f64,
    loss_fn: LossFunction,
}

pub struct Layer {
    weights: Vec<Vec<f64>>,      // [output × input]
    biases: Vec<f64>,            // [output]
    activation: Activation,
    input_size: usize,
    output_size: usize,
}

pub enum Activation {
    ReLU,
    Sigmoid,
    Tanh,
    Softmax,
    LeakyReLU(f64),              // α parameter
    Linear,
}

pub enum LossFunction {
    MSE,                          // Mean Squared Error
    CrossEntropy,
    BinaryCrossEntropy,
    Huber(f64),                   // δ parameter
}

impl NeuralNetwork {
    pub fn new() -> Self;
    pub fn add_layer(&mut self, input: usize, output: usize, activation: Activation);
    pub fn forward(&self, input: &[f64]) -> Vec<f64>;
    pub fn backward(&mut self, input: &[f64], target: &[f64]) -> f64;
    pub fn train(&mut self, data: &[(Vec<f64>, Vec<f64>)], epochs: usize);
    pub fn predict(&self, input: &[f64]) -> Vec<f64>;
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">K-Means Clustering</h3>
        <RustCode filename="subsystems/nexus/src/ml/k_means.rs">{`pub struct KMeans {
    k: usize,                    // Number of clusters
    centroids: Vec<Vec<f64>>,
    max_iterations: usize,
    tolerance: f64,              // Convergence threshold
}

impl KMeans {
    pub fn new(k: usize) -> Self;
    pub fn fit(&mut self, data: &[Vec<f64>]);
    pub fn predict(&self, sample: &[f64]) -> usize;  // Cluster ID
    pub fn inertia(&self) -> f64;                      // Sum of squared distances
    pub fn silhouette_score(&self, data: &[Vec<f64>]) -> f64;
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Online Learner</h3>
        <RustCode filename="subsystems/nexus/src/ml/online_learner.rs">{`/// Incremental learning — update models with single samples in real-time.
/// Critical for kernel use: no batch training needed, adapts continuously.
pub trait OnlineLearner {
    fn partial_fit(&mut self, sample: &[f64], label: f64);
    fn predict(&self, sample: &[f64]) -> f64;
    fn reset(&mut self);
    fn samples_seen(&self) -> usize;
}`}</RustCode>
      </Section>

      {/* ── CRASH PREDICTION ── */}
      <Section title="Crash Prediction" id="prediction">
        <p>The crash predictor uses a 13-feature model to predict failures before they occur. Features are extracted from live kernel telemetry — memory pressure, CPU temperature, error rates, and more:</p>
        <RustCode filename="subsystems/nexus/src/prediction/crash_predictor.rs">{`pub struct CrashPredictor {
    model: RandomForest,           // 100-tree ensemble
    feature_extractor: FeatureExtractor,
    history: RingBuffer<PredictionResult>,
    threshold: f64,                // Confidence threshold (default: 0.8)
}

pub struct PredictionResult {
    pub failure_probability: f64,   // 0.0 .. 1.0
    pub failure_class: FailureClass,
    pub recommended_action: Action,
    pub time_to_failure: Option<u64>, // Estimated ticks
    pub features: [f64; 13],
    pub confidence: f64,
}

pub enum FailureClass {
    None,
    MemoryExhaustion,
    StackOverflow,
    DeadlockDetected,
    LivelockDetected,
    ResourceLeak,
    CorruptState,
    HardwareFault,
    DriverCrash,
    InfiniteLoop,
}

impl CrashPredictor {
    pub fn predict(&self, component: ComponentId) -> PredictionResult;
    pub fn train_online(&mut self, sample: FeatureSample, outcome: bool);
    pub fn accuracy(&self) -> f64;
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Feature Vector</h3>
        <InfoTable
          columns={[
            { header: "#", key: "idx" },
            { header: "Feature", key: "feature" },
            { header: "Source", key: "source" },
          ]}
          rows={[
            { idx: "0", feature: "Memory pressure", source: "free_pages / total_pages" },
            { idx: "1", feature: "CPU utilization", source: "busy_ticks / total_ticks" },
            { idx: "2", feature: "Page fault rate", source: "faults / second" },
            { idx: "3", feature: "Interrupt rate", source: "interrupts / second" },
            { idx: "4", feature: "Error count (recent)", source: "errors in last 1000 ticks" },
            { idx: "5", feature: "Error count (total)", source: "lifetime error counter" },
            { idx: "6", feature: "Heap fragmentation", source: "1 − (largest_free / total_free)" },
            { idx: "7", feature: "Stack usage", source: "current_sp / stack_bottom" },
            { idx: "8", feature: "Lock contention", source: "spin_cycles / acquire_attempts" },
            { idx: "9", feature: "IPC queue depth", source: "pending_messages / queue_capacity" },
            { idx: "10", feature: "Module restart count", source: "restarts in last epoch" },
            { idx: "11", feature: "Uptime", source: "ticks since last restart" },
            { idx: "12", feature: "Temperature (if available)", source: "CPU thermal sensor reading" },
          ]}
        />
      </Section>

      {/* ── ANOMALY DETECTION ── */}
      <Section title="Anomaly Detection" id="anomaly">
        <p>Real-time anomaly detection using statistical models and time-series analysis. Tracks per-component behavior baselines and flags deviations:</p>
        <RustCode filename="subsystems/nexus/src/anomaly/detector.rs">{`pub struct AnomalyDetector {
    baselines: BTreeMap<ComponentId, Baseline>,
    sensitivity: f64,           // Standard deviations for threshold
    window_size: usize,         // Sliding window size
    cooldown: u64,              // Min ticks between alerts
}

pub struct Baseline {
    mean: f64,
    variance: f64,
    sample_count: usize,
    min_observed: f64,
    max_observed: f64,
    last_update: u64,
}

pub struct Anomaly {
    pub component: ComponentId,
    pub metric: MetricType,
    pub observed: f64,
    pub expected: f64,
    pub deviation: f64,         // In standard deviations
    pub severity: AnomalySeverity,
    pub timestamp: u64,
}

pub enum AnomalySeverity {
    Low,        // 2-3 σ deviation
    Medium,     // 3-4 σ deviation
    High,       // 4-5 σ deviation
    Critical,   // > 5 σ deviation
}

pub enum MetricType {
    CpuUsage,
    MemoryUsage,
    ErrorRate,
    Latency,
    Throughput,
    QueueDepth,
    Custom(u32),
}

impl AnomalyDetector {
    /// Update baseline with new observation.
    pub fn observe(&mut self, id: ComponentId, metric: MetricType, value: f64);

    /// Check if latest observation is anomalous.
    pub fn check(&self, id: ComponentId, metric: MetricType) -> Option<Anomaly>;

    /// Check all tracked components.
    pub fn scan_all(&self) -> Vec<Anomaly>;

    /// Reset baseline for a component (after known changes).
    pub fn reset_baseline(&mut self, id: ComponentId);
}`}</RustCode>
      </Section>

      {/* ── QUARANTINE ── */}
      <Section title="Quarantine System" id="quarantine">
        <p>When NEXUS detects a misbehaving component, it can isolate it in a quarantine zone — limiting resources and preventing cascading failures while keeping the rest of the system running:</p>
        <RustCode filename="subsystems/nexus/src/quarantine/manager.rs">{`pub struct QuarantineManager {
    quarantined: BTreeMap<ComponentId, QuarantineEntry>,
    policies: Vec<IsolationPolicy>,
    max_quarantined: usize,
}

pub struct QuarantineEntry {
    pub component: ComponentId,
    pub reason: QuarantineReason,
    pub entered_at: u64,
    pub resource_limits: ResourceLimits,
    pub state_snapshot: Option<StateSnapshot>,
    pub recovery_attempts: u32,
    pub max_recovery_attempts: u32,
}

pub enum QuarantineReason {
    AnomalyDetected(Anomaly),
    CrashPredicted(PredictionResult),
    ManualQuarantine,
    RepeatedFailures,
    ResourceAbuse,
    SecurityViolation,
}

pub struct ResourceLimits {
    pub max_memory: usize,      // Bytes
    pub max_cpu_percent: u8,    // 0-100
    pub max_io_ops: u32,        // Per second
    pub max_ipc_messages: u32,  // Per second
    pub network_access: bool,
}

impl QuarantineManager {
    /// Isolate a component with resource limits.
    pub fn quarantine(&mut self, id: ComponentId, reason: QuarantineReason)
        -> Result<(), NexusError>;

    /// Release from quarantine (after healing or manual override).
    pub fn release(&mut self, id: ComponentId) -> Result<(), NexusError>;

    /// Attempt recovery for a quarantined component.
    pub fn attempt_recovery(&mut self, id: ComponentId)
        -> Result<RecoveryResult, NexusError>;

    /// Is this component currently quarantined?
    pub fn is_quarantined(&self, id: ComponentId) -> bool;

    /// List all quarantined components.
    pub fn list(&self) -> Vec<&QuarantineEntry>;
}`}</RustCode>
      </Section>

      {/* ── ROADMAP ── */}
      <Section title="Development Roadmap" id="roadmap">
        <p>NEXUS is designed with a 4-year evolution roadmap. Each phase builds on the previous, progressively increasing the AI&apos;s autonomy and capability:</p>
        <InfoTable
          columns={[
            { header: "Phase", key: "phase" },
            { header: "Codename", key: "name" },
            { header: "Focus", key: "focus" },
            { header: "Key Features", key: "features" },
          ]}
          rows={[
            { phase: "Q1", name: "Hardening", focus: "Foundation stability", features: "Error taxonomy, metric collection, component registry, baseline profiling" },
            { phase: "Q2", name: "Prediction", focus: "Failure forecasting", features: "Feature extraction, decision tree training, crash prediction, confidence scoring" },
            { phase: "Q3", name: "Healing", focus: "Autonomous recovery", features: "State checkpointing, hot-swap, rollback, quarantine enforcement" },
            { phase: "Q4", name: "Performance", focus: "Optimization", features: "Scheduler tuning, memory advisor, cache policy, load balancing" },
            { phase: "Y2", name: "Cognition", focus: "Learning systems", features: "Online learning, neural networks, transfer learning, model compression" },
            { phase: "Y3", name: "Evolution", focus: "Self-modification", features: "Code generation, module synthesis, policy evolution, architecture search" },
            { phase: "Y4", name: "Symbiosis", focus: "Human-AI collaboration", features: "Intent inference, natural language, proactive suggestions, trust calibration" },
          ]}
        />
        <div className="mt-6 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-5">
          <p className="text-lg font-semibold text-white mb-1">812,081 lines · 2,346 files · 90+ modules</p>
          <p className="text-sm text-zinc-400">NEXUS is the largest subsystem in Helix OS, representing the project&apos;s vision of a truly intelligent operating system. The Y3-Y4 roadmap features (evolution, symbiosis) represent long-term research goals.</p>
        </div>
      </Section>

      {/* ── SCALE ── */}
      <Section title="Subsystem Scale" id="scale">
        <p>Breakdown of the NEXUS codebase by functional domain:</p>
        <FileTree title="subsystems/nexus/" tree={[
          { name: "src", icon: "folder", children: [
            { name: "lib.rs", detail: "Core Nexus struct, levels, state machine" },
            { name: "config.rs", detail: "Configuration & thresholds" },
            { name: "ml", icon: "folder", children: [
              { name: "decision_tree.rs" },
              { name: "random_forest.rs" },
              { name: "neural_net.rs" },
              { name: "k_means.rs" },
              { name: "svm.rs" },
              { name: "online_learner.rs" },
              { name: "feature_scaling.rs" },
            ]},
            { name: "prediction", icon: "folder", children: [
              { name: "crash_predictor.rs" },
              { name: "feature_extractor.rs" },
              { name: "failure_classifier.rs" },
              { name: "action_selector.rs" },
            ]},
            { name: "anomaly", icon: "folder", children: [
              { name: "detector.rs" },
              { name: "statistical_model.rs" },
              { name: "time_series.rs" },
              { name: "pattern_matcher.rs" },
            ]},
            { name: "quarantine", icon: "folder", children: [
              { name: "manager.rs" },
              { name: "isolation_policy.rs" },
              { name: "resource_fence.rs" },
              { name: "rollback.rs" },
            ]},
            { name: "healing", icon: "folder", children: [
              { name: "self_healer.rs" },
              { name: "recovery_strategy.rs" },
              { name: "state_checkpoint.rs" },
              { name: "hot_swap.rs" },
            ]},
            { name: "optimizer", icon: "folder", children: [
              { name: "perf_optimizer.rs" },
              { name: "scheduler_tuner.rs" },
              { name: "memory_advisor.rs" },
              { name: "cache_policy.rs" },
            ]},
            { name: "telemetry", icon: "folder", children: [
              { name: "metrics_collector.rs" },
              { name: "event_bus.rs" },
              { name: "trace_buffer.rs" },
              { name: "health_monitor.rs" },
            ]},
            { name: "roadmap", icon: "folder", detail: "450K+ lines of future-phase code", children: [
              { name: "q1_hardening", icon: "folder" },
              { name: "q2_prediction", icon: "folder" },
              { name: "q3_healing", icon: "folder" },
              { name: "q4_performance", icon: "folder" },
              { name: "y2_cognition", icon: "folder" },
              { name: "y3_evolution", icon: "folder" },
              { name: "y4_symbiosis", icon: "folder" },
            ]},
          ]},
          { name: "Cargo.toml" },
        ]} />
      </Section>

      <Footer />
    </div>
  );
}
