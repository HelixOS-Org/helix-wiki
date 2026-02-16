"use client";

import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import FlowDiagram from "@/helix-wiki/components/diagrams/FlowDiagram";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import benchmarksContent from "@/helix-wiki/lib/docs-i18n/benchmarks";

export default function BenchmarksPage() {
  const { locale } = useI18n();
  const d = (key: string) => getDocString(benchmarksContent, locale, key);
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader
        title={d("header.title")}
        subtitle={d("header.subtitle")}
        badge={d("header.badge")}
      />

      {/* ── ARCHITECTURE ── */}
      <Section title={d("section.suite")} id="architecture">
        <p>{d("suite.intro")}</p>
        <FlowDiagram
          title="Benchmark Suite Architecture"
          phases={[
            { title: "Benchmarks", color: "blue", description: "Individual benchmark modules that register test cases for each kernel subsystem.", nodes: [
              { label: "Scheduler", color: "blue", info: { description: "Context switch, thread lifecycle, and DIS intent benchmarks. 15 registered tests.", priority: "high", outputs: ["RunResult[]"], dependencies: [] } },
              { label: "Memory", color: "blue", info: { description: "Allocation, page ops, TLB flush, and access pattern benchmarks. 22 registered tests.", priority: "high", outputs: ["RunResult[]"] } },
              { label: "IPC", color: "blue", info: { description: "Channel send/recv, event publish, and message routing round-trip latency.", priority: "normal", outputs: ["RunResult[]"] } },
              { label: "IRQ", color: "blue", info: { description: "Interrupt entry, dispatch, and handler latency measurements.", priority: "normal", outputs: ["RunResult[]"] } },
            ]},
            { title: "Engine", color: "purple", description: "Core benchmark execution loop — manages warmup iterations, main measurement, and outlier detection.", nodes: [
              { label: "Warmup", color: "purple", info: { description: "CPU cache priming phase. Default: 1,000 iterations. Ensures stable measurements.", duration: "Variable", priority: "high" } },
              { label: "Iteration", color: "purple", info: { description: "Main measurement loop. Default: 10,000 iterations with RDTSC cycle counting.", duration: "~10K cycles × N", priority: "critical" } },
              { label: "Outlier Filter", color: "purple", info: { description: "Median Absolute Deviation (MAD) based outlier removal. 3σ threshold.", priority: "normal" } },
            ]},
            { title: "Collection", color: "cyan", description: "Statistical analysis engine computing percentiles, standard deviation, and status classification.", nodes: [
              { label: "Stats", color: "cyan", info: { description: "Computes min / max / mean / p50 / p95 / p99 / std_dev from filtered data.", priority: "normal", outputs: ["BenchmarkStats"] } },
              { label: "Classify", color: "cyan", info: { description: "Classifies each benchmark as PASS / WARN / FAIL based on threshold config.", priority: "normal", outputs: ["BenchmarkStatus"] } },
            ]},
            { title: "Report", color: "green", description: "Final report generation with per-category tables, platform info, and comparison data.", nodes: [
              { label: "Format", color: "green", info: { description: "Generates per-category tables with aligned columns, comparisons, and summary.", priority: "normal", outputs: ["BenchmarkReport"] } },
              { label: "Output", color: "green", info: { description: "Renders report to serial console and optional log file.", priority: "low", outputs: ["Serial output", "Log file"] } },
            ]},
          ]}
        />

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Modules</h3>
        <InfoTable
          columns={[
            { header: "Module", key: "module" },
            { header: "Purpose", key: "purpose" },
            { header: "Key Types", key: "types" },
          ]}
          rows={[
            { module: <code className="text-helix-blue">engine</code>, purpose: "Core execution loop, config, warmup / iteration management", types: "BenchmarkConfig, BenchmarkEngine, RunResult" },
            { module: <code className="text-helix-blue">timing</code>, purpose: "RDTSC-based cycle counting, nanosecond conversion", types: "CycleCounter, TimingSource" },
            { module: <code className="text-helix-blue">results</code>, purpose: "Statistical analysis, report formatting (906 LoC)", types: "BenchmarkReport, ResultCollector, ReportFormatter" },
            { module: <code className="text-helix-blue">scheduler</code>, purpose: "Context switch, thread lifecycle, DIS intent benchmarks", types: "15 benchmarks registered" },
            { module: <code className="text-helix-blue">memory</code>, purpose: "Allocation, page ops, TLB flush, access patterns", types: "22 benchmarks registered" },
            { module: <code className="text-helix-blue">ipc</code>, purpose: "Channel send/recv, event publish, message routing", types: "IPC round-trip latency" },
            { module: <code className="text-helix-blue">irq</code>, purpose: "Interrupt entry, dispatch, handler latency", types: "IRQ path benchmarks" },
            { module: <code className="text-helix-blue">stress</code>, purpose: "Concurrent allocation, lock contention, multi-core scaling", types: "Stress test harness" },
          ]}
        />
      </Section>

      {/* ── CONFIGURATION ── */}
      <Section title={d("section.config")} id="config">
        <p>{d("config.intro")}</p>
        <RustCode filename="benchmarks/src/engine.rs">{`use helix_benchmarks::{BenchmarkSuite, BenchmarkConfig};

let config = BenchmarkConfig::default()
    .iterations(10_000)       // Main measurement iterations
    .warmup(1_000)            // Warmup (CPU cache priming)
    .cpu_freq_mhz(3_000)     // For cycle→ns conversion
    .collect_samples(true)    // Keep raw samples for histogram
    .verbose(false);          // Quiet mode

let suite = BenchmarkSuite::new(config);
let results = suite.run_all();
results.print_report();`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Feature Flags</h3>
        <InfoTable
          columns={[
            { header: "Flag", key: "flag" },
            { header: "Effect", key: "effect" },
          ]}
          rows={[
            { flag: <code className="text-helix-blue">default</code>, effect: "Standard benchmark suite — scheduler, memory, IPC, IRQ" },
            { flag: <code className="text-helix-blue">verbose</code>, effect: "Print per-iteration timing, outlier details, debug info" },
            { flag: <code className="text-helix-blue">extended</code>, effect: "Enable additional benchmarks (access patterns, region ops)" },
            { flag: <code className="text-helix-blue">stress</code>, effect: "Enable stress tests — long-running concurrent workloads" },
          ]}
        />
      </Section>

      {/* ── SCHEDULER BENCHMARKS ── */}
      <Section title={d("section.scheduler")} id="scheduler">
        <p>{d("scheduler.intro")}</p>

        <InfoTable
          columns={[
            { header: "Benchmark ID", key: "id" },
            { header: "Measures", key: "measures" },
            { header: "Expected", key: "expected" },
          ]}
          rows={[
            { id: <code className="text-helix-blue">sched.context_switch.null</code>, measures: "Register save/restore only (no actual switch)", expected: "~50–200 cycles" },
            { id: <code className="text-helix-blue">sched.context_switch.full</code>, measures: "GP + segment + control regs + TLB flush", expected: "~500–2000 cycles" },
            { id: <code className="text-helix-blue">sched.context_switch.fpu</code>, measures: "Full switch with XSAVE/XRSTOR of FPU/SSE state", expected: "~800–3000 cycles" },
            { id: <code className="text-helix-blue">sched.thread.create</code>, measures: "TCB allocation, stack setup, runqueue insert", expected: "~1000–5000 cycles" },
            { id: <code className="text-helix-blue">sched.thread.yield</code>, measures: "Voluntary preemption path", expected: "~200–800 cycles" },
            { id: <code className="text-helix-blue">sched.preempt.latency</code>, measures: "Involuntary preemption latency", expected: "~300–1500 cycles" },
            { id: <code className="text-helix-blue">sched.dis.intent_evaluation</code>, measures: "DIS intent class decision logic", expected: "~100–500 cycles" },
            { id: <code className="text-helix-blue">sched.dis.policy_evaluation</code>, measures: "Scheduling policy module dispatch", expected: "~200–800 cycles" },
          ]}
        />

        <RustCode filename="benchmarks/src/scheduler.rs">{`/// Full context switch simulation
fn bench_full_context_switch() -> u64 {
    let start = timing::read_tsc();

    // Save general purpose registers (16)
    let mut gp_regs = [0u64; 16];
    for (i, reg) in gp_regs.iter_mut().enumerate() {
        unsafe { core::ptr::write_volatile(reg, i as u64); }
    }

    // Save segment registers (6)
    let mut seg_regs = [0u16; 6];
    for (i, reg) in seg_regs.iter_mut().enumerate() {
        unsafe { core::ptr::write_volatile(reg, i as u16); }
    }

    // Simulate TLB flush cost
    core::hint::spin_loop();

    // Restore all registers
    let mut sum = 0u64;
    for reg in &gp_regs { sum += unsafe { core::ptr::read_volatile(reg) }; }

    let end = timing::read_tsc();
    core::hint::black_box(sum);
    end - start
}`}</RustCode>
      </Section>

      {/* ── MEMORY BENCHMARKS ── */}
      <Section title={d("section.memory")} id="memory">
        <p>{d("memory.intro")}</p>

        <InfoTable
          columns={[
            { header: "Category", key: "category" },
            { header: "Benchmarks", key: "benchmarks" },
          ]}
          rows={[
            { category: <strong className="text-white">Allocation</strong>, benchmarks: "alloc.small_16, alloc.small_64, alloc.small_256, alloc.medium_4k, alloc.large_64k, alloc.huge_1m" },
            { category: <strong className="text-white">Deallocation</strong>, benchmarks: "free.small, free.large" },
            { category: <strong className="text-white">Page Ops</strong>, benchmarks: "page.map, page.unmap, page.protect, page.fault" },
            { category: <strong className="text-white">TLB</strong>, benchmarks: "tlb.flush_single, tlb.flush_all" },
            { category: <strong className="text-white">Access Patterns</strong>, benchmarks: "access.sequential, access.random, access.stride" },
            { category: <strong className="text-white">Allocator Internals</strong>, benchmarks: "allocator.buddy_split, allocator.buddy_merge, allocator.slab_alloc" },
            { category: <strong className="text-white">Regions</strong>, benchmarks: "region.create, region.lookup, protection.check" },
          ]}
        />
      </Section>

      {/* ── STATISTICAL ENGINE ── */}
      <Section title={d("section.stats")} id="statistics">
        <p>{d("stats.intro")}</p>

        <RustCode filename="benchmarks/src/results.rs">{`pub struct CycleStats {
    pub min: u64,
    pub max: u64,
    pub mean: u64,
    pub median: u64,     // p50
    pub p95: u64,
    pub p99: u64,
    pub std_dev: u64,
}

pub struct TimeStats {
    pub min_ns: u64,
    pub max_ns: u64,
    pub mean_ns: u64,
    pub median_ns: u64,
    pub p95_ns: u64,
    pub p99_ns: u64,
    pub std_dev_ns: u64,
}

// Automatic conversion:  cycles × 1000 / cpu_freq_mhz = nanoseconds`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Outlier Detection</h3>
        <p>When <code className="text-helix-blue">detect_outliers</code> is enabled, samples beyond <code className="text-helix-blue">outlier_threshold</code> standard deviations from the mean are flagged. They are still recorded but excluded from final statistics to prevent interrupt noise from distorting results.</p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Reference Numbers (QEMU, 3 GHz)</h3>
        <InfoTable
          columns={[
            { header: "Operation", key: "op" },
            { header: "Cycles", key: "cycles" },
            { header: "Time", key: "time" },
          ]}
          rows={[
            { op: "Context switch (null)", cycles: "~100–200", time: "~30–70 ns" },
            { op: "Context switch (full)", cycles: "~500–2 000", time: "~170–670 ns" },
            { op: "Syscall entry + exit", cycles: "~300–600", time: "~100–200 ns" },
            { op: "IPC round-trip", cycles: "~900–1 500", time: "~300–500 ns" },
            { op: "Page map (4 KiB)", cycles: "~200–800", time: "~70–270 ns" },
            { op: "Small alloc (16 B)", cycles: "~20–80", time: "~7–27 ns" },
            { op: "Large alloc (64 KiB)", cycles: "~100–400", time: "~33–133 ns" },
            { op: "TLB flush (single)", cycles: "~50–200", time: "~17–67 ns" },
            { op: "IRQ dispatch", cycles: "~150–600", time: "~50–200 ns" },
          ]}
        />
      </Section>

      {/* ── RUNNING ── */}
      <Section title={d("section.running")} id="running">
        <p>{d("running.intro")}</p>
        <RustCode filename="Terminal" language="bash">{`# Build with benchmark support
cargo build --release -p helix-benchmarks

# Run in QEMU (benchmarks run at boot)
./scripts/run_qemu.sh --benchmarks

# Extended suite + verbose output
cargo build --release -p helix-benchmarks --features "extended,verbose"

# Stress tests (long-running)
cargo build --release -p helix-benchmarks --features "stress"`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Interpreting Results</h3>
        <RustCode filename="Sample Output" language="text">{`╔═══════════════════════════════════════════════════════════════╗
║              HELIX KERNEL BENCHMARK REPORT                    ║
╠═══════════════════════════════════════════════════════════════╣
║ Platform: x86_64  │  CPU: 3000 MHz  │  Iterations: 10000     ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  SCHEDULER                         min     mean    p95   p99  ║
║  ─────────────────────────────────────────────────────────── ║
║  sched.context_switch.null          98     142     201    312  ║
║  sched.context_switch.full         523     847    1204   1891  ║
║  sched.thread.create              1102    2341    4012   5921  ║
║  sched.thread.yield                187     312     498    721  ║
║  sched.dis.intent_evaluation       112     198     312    487  ║
║                                                               ║
║  MEMORY                           min     mean    p95   p99  ║
║  ─────────────────────────────────────────────────────────── ║
║  mem.alloc.small_16                 21      38      67    102  ║
║  mem.alloc.medium_4k               87     156     298    412  ║
║  mem.page.map                     198     412     712   1021  ║
║  mem.tlb.flush_single              48      89     142    201  ║
║                                                               ║
║  Status: 37/37 PASSED  │  Outliers: 142 removed              ║
╚═══════════════════════════════════════════════════════════════╝`}</RustCode>
      </Section>

    </div>
  );
}
