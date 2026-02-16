"use client";

import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import nexusContent from "@/helix-wiki/lib/docs-i18n/nexus";
import FileTree from "@/helix-wiki/components/diagrams/FileTree";

export default function NexusPage() {
  const { locale } = useI18n();
  const d = (key: string) => getDocString(nexusContent, locale, key);
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader title={d("header.title")} subtitle={d("header.subtitle")} badge={d("header.badge")} gradient="from-emerald-400 to-cyan-500" />

      {/* ── OVERVIEW ── */}
      <Section title={d("section.overview")} id="overview">
        <p>{d("overview.intro")}</p>

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
      <Section title={d("section.inventory")} id="modules">
        <p>{d("inventory.intro")}</p>
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
      <Section title={d("section.ml")} id="ml">
        <p>{d("ml.intro")}</p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">{d("ml.tree.title")}</h3>
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

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">{d("ml.forest.title")}</h3>
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

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">{d("ml.nn.title")}</h3>
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

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">{d("ml.kmeans.title")}</h3>
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

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">{d("ml.online.title")}</h3>
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
      <Section title={d("section.crash")} id="prediction">
        <p>{d("crash.intro")}</p>
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
      <Section title={d("section.anomaly")} id="anomaly">
        <p>{d("anomaly.intro")}</p>
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
      <Section title={d("section.quarantine")} id="quarantine">
        <p>{d("quarantine.intro")}</p>
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
      <Section title={d("section.roadmap")} id="roadmap">
        <p>{d("roadmap.intro")}</p>
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
      <Section title={d("section.scale")} id="scale">
        <p>Breakdown of the NEXUS codebase by functional domain:</p>
        <FileTree title="subsystems/nexus/" tree={[
          { name: "src", icon: "folder", children: [
            { name: "lib.rs", detail: "Core Nexus struct, levels, state machine",
              info: { loc: 1850, language: "Rust", description: "Main NEXUS entry point: defines NexusLevel enum (L0–L5), NexusState, and the central Nexus struct that orchestrates all subsystems. Contains the main tick() loop and level transition logic.", status: "stable", exports: ["Nexus", "NexusLevel", "NexusState", "NexusConfig"] } },
            { name: "config.rs", detail: "Configuration & thresholds",
              info: { loc: 420, language: "Rust", description: "Runtime-tunable configuration for NEXUS: anomaly thresholds, healing retry limits, prediction confidence thresholds, and telemetry intervals.", status: "stable", exports: ["NexusConfig", "AnomalyThresholds", "HealingConfig"] } },
            { name: "ml", icon: "folder", detail: "Machine Learning engines",
              info: { loc: 8500, description: "Complete no_std ML framework: decision trees, random forests, neural networks, k-means clustering, SVMs, and online learning — all in pure Rust with no external deps.", status: "stable" },
              children: [
              { name: "decision_tree.rs", info: { loc: 1200, language: "Rust", description: "CART-based decision tree with Gini impurity splitting, max-depth pruning, and feature importance tracking.", status: "stable", exports: ["DecisionTree", "TreeNode", "SplitCriterion"] } },
              { name: "random_forest.rs", info: { loc: 1400, language: "Rust", description: "Ensemble of decision trees with bootstrap aggregation (bagging). Supports parallel prediction and out-of-bag error estimation.", status: "stable", exports: ["RandomForest", "ForestConfig", "BaggingStrategy"] } },
              { name: "neural_net.rs", info: { loc: 1800, language: "Rust", description: "Feed-forward neural network with backpropagation. Supports ReLU/Sigmoid/Tanh activations and mini-batch SGD training.", status: "wip", exports: ["NeuralNetwork", "Layer", "Activation", "Optimizer"] } },
              { name: "k_means.rs", info: { loc: 850, language: "Rust", description: "K-means++ clustering with Lloyd's algorithm. Used for anomaly grouping and workload classification.", status: "stable", exports: ["KMeans", "Cluster", "Centroid"] } },
              { name: "svm.rs", info: { loc: 1100, language: "Rust", description: "Support Vector Machine with RBF kernel. Binary and multi-class classification via one-vs-rest.", status: "wip", exports: ["SVM", "Kernel", "HyperPlane"] } },
              { name: "online_learner.rs", info: { loc: 950, language: "Rust", description: "Incremental online learning: updates models with streaming data without full retraining. Key for runtime adaptation.", status: "stable", exports: ["OnlineLearner", "StreamingUpdate"] } },
              { name: "feature_scaling.rs", info: { loc: 600, language: "Rust", description: "Feature normalization (min-max, z-score, robust scaling) and dimensionality reduction via PCA.", status: "stable", exports: ["Scaler", "PCA", "FeatureVector"] } },
            ]},
            { name: "prediction", icon: "folder", detail: "Crash prediction pipeline",
              info: { loc: 4200, description: "Proactive failure prediction: extracts system features, classifies failure types, estimates crash probability, and selects preventive actions.", status: "stable" },
              children: [
              { name: "crash_predictor.rs", info: { loc: 1300, language: "Rust", description: "Main prediction engine: combines ML models with heuristic rules to estimate per-module crash probability within the next N ticks.", status: "stable", exports: ["CrashPredictor", "PredictionResult", "RiskLevel"] } },
              { name: "feature_extractor.rs", info: { loc: 900, language: "Rust", description: "Extracts features from telemetry: CPU usage, memory pressure, syscall rates, error counts, and timing distributions.", status: "stable", exports: ["FeatureExtractor", "SystemSnapshot"] } },
              { name: "failure_classifier.rs", info: { loc: 1100, language: "Rust", description: "Classifies failures into categories (memory, deadlock, resource exhaustion, corruption) to select appropriate recovery strategy.", status: "stable", exports: ["FailureClassifier", "FailureType"] } },
              { name: "action_selector.rs", info: { loc: 900, language: "Rust", description: "Selects preventive/corrective actions based on failure classification and available recovery strategies.", status: "stable", exports: ["ActionSelector", "RecoveryAction"] } },
            ]},
            { name: "anomaly", icon: "folder", detail: "Anomaly detection",
              info: { loc: 3800, description: "Multi-layered anomaly detection: statistical models, time series analysis, and pattern matching detect deviations before they become failures.", status: "stable" },
              children: [
              { name: "detector.rs", info: { loc: 1100, language: "Rust", description: "Central anomaly detector: aggregates signals from statistical, time-series, and pattern engines to produce anomaly scores.", status: "stable", exports: ["AnomalyDetector", "AnomalyScore", "DetectionResult"] } },
              { name: "statistical_model.rs", info: { loc: 900, language: "Rust", description: "Statistical anomaly detection via z-score, MAD (Median Absolute Deviation), and Grubbs' test for outlier identification.", status: "stable", exports: ["StatisticalModel", "OutlierTest"] } },
              { name: "time_series.rs", info: { loc: 1000, language: "Rust", description: "Time series analysis with exponential smoothing, trend detection, and seasonality decomposition for workload patterns.", status: "stable", exports: ["TimeSeries", "TrendDetector", "Seasonality"] } },
              { name: "pattern_matcher.rs", info: { loc: 800, language: "Rust", description: "Pattern-based anomaly detection: matches known failure signatures against current system behavior.", status: "stable", exports: ["PatternMatcher", "FailureSignature"] } },
            ]},
            { name: "quarantine", icon: "folder", detail: "Module isolation",
              info: { loc: 3200, description: "Isolates failing modules to prevent cascade failures: resource fences, capability revocation, and state rollback.", status: "stable" },
              children: [
              { name: "manager.rs", info: { loc: 1000, language: "Rust", description: "Quarantine lifecycle manager: tracks quarantined modules, manages isolation levels, and coordinates recovery attempts.", status: "stable", exports: ["QuarantineManager", "QuarantineEntry"] } },
              { name: "isolation_policy.rs", info: { loc: 700, language: "Rust", description: "Policy engine for isolation decisions: severity thresholds, auto-quarantine rules, and escalation paths.", status: "stable", exports: ["IsolationPolicy", "SeverityLevel"] } },
              { name: "resource_fence.rs", info: { loc: 800, language: "Rust", description: "Hardware-enforced resource limits: memory caps, CPU time quotas, and I/O bandwidth throttling for quarantined modules.", status: "stable", exports: ["ResourceFence", "FenceConfig"] } },
              { name: "rollback.rs", info: { loc: 700, language: "Rust", description: "State rollback engine: restores module state from checkpoints when recovery requires undoing recent changes.", status: "stable", exports: ["RollbackEngine", "Checkpoint"] } },
            ]},
            { name: "healing", icon: "folder", detail: "Self-healing engine",
              info: { loc: 4500, description: "Autonomous recovery: restart, hot-swap, state restoration, and progressive escalation from gentle fixes to full module replacement.", status: "stable" },
              children: [
              { name: "self_healer.rs", info: { loc: 1400, language: "Rust", description: "Central healing orchestrator: selects and executes recovery strategies, tracks success rates, and learns from past recoveries.", status: "stable", exports: ["SelfHealer", "HealingResult", "RecoveryStats"] } },
              { name: "recovery_strategy.rs", info: { loc: 1100, language: "Rust", description: "Recovery strategy definitions: restart, hot-reload, state-restore, dependency-cascade, and full-replacement strategies.", status: "stable", exports: ["RecoveryStrategy", "StrategyType"] } },
              { name: "state_checkpoint.rs", info: { loc: 1000, language: "Rust", description: "Periodic state checkpointing: serializes module state to kernel memory for fast rollback without disk I/O.", status: "stable", exports: ["StateCheckpoint", "CheckpointStore"] } },
              { name: "hot_swap.rs", info: { loc: 1000, language: "Rust", description: "Hot-swap engine: replaces a running module with a new version while preserving connections and in-flight state.", status: "wip", exports: ["HotSwap", "SwapPlan", "MigrationState"] } },
            ]},
            { name: "optimizer", icon: "folder", detail: "Performance optimization",
              info: { loc: 3600, description: "Runtime performance tuning: scheduler parameters, memory allocation policies, and cache eviction strategies — all adapted by ML.", status: "stable" },
              children: [
              { name: "perf_optimizer.rs", info: { loc: 1000, language: "Rust", description: "Central optimizer: collects performance metrics, runs optimization models, and applies tuning recommendations.", status: "stable", exports: ["PerfOptimizer", "OptimizationResult"] } },
              { name: "scheduler_tuner.rs", info: { loc: 900, language: "Rust", description: "Dynamically adjusts scheduler parameters: time slice duration, priority boosts, and CPU affinity based on workload patterns.", status: "stable", exports: ["SchedulerTuner", "SchedulerParams"] } },
              { name: "memory_advisor.rs", info: { loc: 900, language: "Rust", description: "Memory allocation advisor: recommends page sizes, slab configurations, and compaction triggers based on allocation patterns.", status: "stable", exports: ["MemoryAdvisor", "AllocationAdvice"] } },
              { name: "cache_policy.rs", info: { loc: 800, language: "Rust", description: "Adaptive cache eviction: switches between LRU, LFU, and ARC policies based on access pattern analysis.", status: "stable", exports: ["CachePolicy", "EvictionStrategy"] } },
            ]},
            { name: "telemetry", icon: "folder", detail: "Metrics & monitoring",
              info: { loc: 3400, description: "System-wide telemetry: metric collection, event bus integration, ring buffer traces, and real-time health monitoring.", status: "stable" },
              children: [
              { name: "metrics_collector.rs", info: { loc: 1000, language: "Rust", description: "High-performance metrics collector: lock-free counters, histograms, and gauges with per-CPU aggregation.", status: "stable", exports: ["MetricsCollector", "Counter", "Histogram", "Gauge"] } },
              { name: "event_bus.rs", info: { loc: 800, language: "Rust", description: "NEXUS-specific event bus: publishes anomaly detections, healing actions, and optimization recommendations to subscribers.", status: "stable", exports: ["NexusEventBus", "NexusEvent"] } },
              { name: "trace_buffer.rs", info: { loc: 900, language: "Rust", description: "Lock-free ring buffer for execution traces: captures last N events for post-mortem analysis with zero steady-state allocation.", status: "stable", exports: ["TraceBuffer", "TraceEntry"] } },
              { name: "health_monitor.rs", info: { loc: 700, language: "Rust", description: "Continuous health monitoring: heartbeat checks, resource usage tracking, and degradation detection for all kernel modules.", status: "stable", exports: ["HealthMonitor", "HealthStatus", "Heartbeat"] } },
            ]},
            { name: "roadmap", icon: "folder", detail: "450K+ lines of future-phase code",
              info: { loc: 450000, description: "Multi-year evolution roadmap: from hardening (Q1) through cognitive AI (Y2) to symbiotic kernel evolution (Y4).", status: "wip" },
              children: [
              { name: "q1_hardening", icon: "folder", info: { description: "Q1: Stability hardening — fuzzing, stress testing, edge case coverage", status: "wip" } },
              { name: "q2_prediction", icon: "folder", info: { description: "Q2: Advanced prediction — LSTM models, causal inference, failure forecasting", status: "new" } },
              { name: "q3_healing", icon: "folder", info: { description: "Q3: Advanced healing — multi-module coordinated recovery, state migration", status: "new" } },
              { name: "q4_performance", icon: "folder", info: { description: "Q4: Performance evolution — JIT tuning, speculative optimization", status: "new" } },
              { name: "y2_cognition", icon: "folder", info: { description: "Y2: Cognitive kernel — intent inference, natural language kernel queries", status: "new" } },
              { name: "y3_evolution", icon: "folder", info: { description: "Y3: Self-evolution — kernel auto-generates optimization patches", status: "new" } },
              { name: "y4_symbiosis", icon: "folder", info: { description: "Y4: Symbiotic OS — kernel and user co-evolve through feedback loops", status: "new" } },
            ]},
          ]},
          { name: "Cargo.toml", info: { loc: 45, language: "TOML", description: "NEXUS crate manifest: dependencies on core, hal, and ML libraries. Feature flags for prediction levels.", status: "stable" } },
        ]} />
      </Section>

    </div>
  );
}
