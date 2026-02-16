"use client";
import Link from "next/link";
import PageHeader from "@/helix-wiki/components/PageHeader";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import blogContent from "@/helix-wiki/lib/docs-i18n/blog";

/* ── Article data ── */
interface Article {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  categoryColor: string;
  icon: string;
  content: React.ReactNode;
}

const ARTICLES: Article[] = [
  {
    slug: "why-rust",
    title: "Why We Chose Rust for an OS Kernel",
    excerpt: "C has ruled systems programming for 50 years. We explain why Rust's ownership model, zero-cost abstractions, and #![no_std] ecosystem made it the right choice for Helix — and what we'd do differently.",
    date: "2025-12-15",
    readTime: "8 min",
    category: "Design",
    categoryColor: "#4A90E2",
    icon: "🦀",
    content: (
      <div className="space-y-6">
        <p>When we started Helix in early 2024, the question wasn&apos;t <em>if</em> we should use Rust — it was <em>how far</em> we could push it. The answer: all the way down to ring 0.</p>

        <h3 className="text-xl font-bold text-white mt-8">The Safety Argument (It&apos;s Real)</h3>
        <p>70% of CVEs in major operating systems are memory safety bugs. Buffer overflows, use-after-free, double-free — the classics. Rust eliminates <strong>entire categories</strong> of these bugs at compile time. Our kernel has zero <code className="text-helix-blue bg-helix-blue/10 px-1.5 py-0.5 rounded text-sm">unsafe</code> blocks in business logic. All unsafe code is confined to HAL primitives (port I/O, MSR access, page table manipulation) and wrapped in safe abstractions.</p>

        <h3 className="text-xl font-bold text-white mt-8">Zero-Cost Abstractions in Kernel Space</h3>
        <p>Traits let us define a <code className="text-helix-blue bg-helix-blue/10 px-1.5 py-0.5 rounded text-sm">HalTrait</code> interface that x86_64, AArch64, and RISC-V all implement. At compile time, the trait dispatch is monomorphized — <strong>zero runtime overhead</strong>. Same performance as C with hand-written per-architecture code, but with a single API surface.</p>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 font-mono text-sm">
          <div className="text-zinc-500 mb-2">// The trait that rules them all</div>
          <div><span className="text-helix-purple">pub trait</span> <span className="text-helix-blue">Hal</span> {'{'}</div>
          <div className="pl-4"><span className="text-helix-purple">fn</span> <span className="text-emerald-400">init_interrupts</span>() -&gt; <span className="text-amber-400">Result</span>&lt;(), <span className="text-red-400">HalError</span>&gt;;</div>
          <div className="pl-4"><span className="text-helix-purple">fn</span> <span className="text-emerald-400">enable_paging</span>(root: <span className="text-amber-400">PhysAddr</span>) -&gt; <span className="text-amber-400">Result</span>&lt;(), <span className="text-red-400">HalError</span>&gt;;</div>
          <div className="pl-4"><span className="text-helix-purple">fn</span> <span className="text-emerald-400">context_switch</span>(from: &amp;<span className="text-amber-400">Context</span>, to: &amp;<span className="text-amber-400">Context</span>);</div>
          <div className="pl-4 text-zinc-500">// ... 40+ more methods</div>
          <div>{'}'}</div>
        </div>

        <h3 className="text-xl font-bold text-white mt-8">The #![no_std] Ecosystem</h3>
        <p>Crates like <code className="text-helix-blue bg-helix-blue/10 px-1.5 py-0.5 rounded text-sm">spin</code>, <code className="text-helix-blue bg-helix-blue/10 px-1.5 py-0.5 rounded text-sm">x86_64</code>, <code className="text-helix-blue bg-helix-blue/10 px-1.5 py-0.5 rounded text-sm">linked_list_allocator</code>, and <code className="text-helix-blue bg-helix-blue/10 px-1.5 py-0.5 rounded text-sm">bitflags</code> are battle-tested in no_std contexts. We don&apos;t have to reinvent a spinlock — we import one that&apos;s been audited by thousands of eyes. Cargo&apos;s dependency management makes this trivial.</p>

        <h3 className="text-xl font-bold text-white mt-8">What We&apos;d Do Differently</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Start with async earlier.</strong> Rust&apos;s async machinery is powerful for I/O-heavy kernel tasks, but retrofitting it is painful.</li>
          <li><strong>Embrace const generics more.</strong> Many of our array sizes are runtime values that could be compile-time constants.</li>
          <li><strong>Custom allocator from day 1.</strong> We started with linked_list_allocator and migrated to a slab allocator later — the transition was non-trivial.</li>
        </ul>

        <h3 className="text-xl font-bold text-white mt-8">The Verdict</h3>
        <p>After 75K lines of Rust kernel code, we can say definitively: <strong>Rust is viable for production kernel development.</strong> The compiler catches bugs that would have been week-long debugging sessions in C. The borrow checker is your most annoying — and most valuable — teammate.</p>
      </div>
    ),
  },
  {
    slug: "self-healing",
    title: "How Self-Healing Works in Helix",
    excerpt: "When a kernel module crashes, Helix doesn't panic — it quarantines, diagnoses, and recovers. Here's the engineering behind our self-healing subsystem and why it changes everything about OS reliability.",
    date: "2025-11-28",
    readTime: "10 min",
    category: "Architecture",
    categoryColor: "#22C55E",
    icon: "🛡️",
    content: (
      <div className="space-y-6">
        <p>Traditional kernels have one response to a critical module failure: <strong>kernel panic</strong>. Blue screen. Guru meditation. Game over. In Helix, we asked: what if the kernel could <em>heal itself</em>?</p>

        <h3 className="text-xl font-bold text-white mt-8">The Three-Phase Recovery Model</h3>
        <p>When a module fault is detected (segfault, watchdog timeout, integrity check failure), Helix doesn&apos;t immediately try to restart it. Instead, it follows a structured recovery pipeline:</p>

        <div className="grid md:grid-cols-3 gap-4 my-6">
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
            <div className="text-2xl mb-2">🔴</div>
            <h4 className="font-bold text-red-400 mb-2">Phase 1: Quarantine</h4>
            <p className="text-sm text-zinc-400">The faulting module is immediately isolated. Its memory pages are marked read-only, its IPC channels are drained, and dependent modules receive a &quot;degraded service&quot; notification.</p>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
            <div className="text-2xl mb-2">🟡</div>
            <h4 className="font-bold text-amber-400 mb-2">Phase 2: Diagnosis</h4>
            <p className="text-sm text-zinc-400">The self-heal engine inspects the crash dump, stack trace, and recent IPC history. It classifies the fault (transient vs. systematic) and determines if a restart is safe.</p>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
            <div className="text-2xl mb-2">🟢</div>
            <h4 className="font-bold text-emerald-400 mb-2">Phase 3: Recovery</h4>
            <p className="text-sm text-zinc-400">For transient faults, the module is hot-reloaded from its last known-good binary. For systematic faults, a fallback module is loaded. All state is reconstructed from checkpoints.</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mt-8">Module Checkpointing</h3>
        <p>Every Helix module periodically writes a state checkpoint. This isn&apos;t a full memory dump — it&apos;s a structured snapshot of the module&apos;s critical state, defined by the module developer using our <code className="text-helix-blue bg-helix-blue/10 px-1.5 py-0.5 rounded text-sm">#[checkpoint]</code> derive macro. When a module is recovered, its state is restored from the last valid checkpoint.</p>

        <h3 className="text-xl font-bold text-white mt-8">Real-World Example</h3>
        <p>Imagine the filesystem driver encounters a corrupted B-tree node. In Linux, this could mean data loss or a panic. In Helix:</p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>The FS module detects the corruption via integrity hash</li>
          <li>Self-heal quarantines the FS module (in-flight I/O is buffered)</li>
          <li>Diagnosis determines it&apos;s a data corruption, not a code bug</li>
          <li>The FS module is restarted with the corrupted region marked for repair</li>
          <li>Background repair thread reconstructs the B-tree from journal logs</li>
          <li>Total downtime: <strong>~15ms</strong>. Zero data loss.</li>
        </ol>

        <h3 className="text-xl font-bold text-white mt-8">Limitations</h3>
        <p>Self-healing isn&apos;t magic. If the <strong>core kernel</strong> (TCB) itself is corrupted, we can&apos;t self-heal — that&apos;s a hard panic. The TCB is kept minimal (~6.4K LoC) specifically to reduce this risk. Self-healing only applies to modules <em>outside</em> the trusted computing base.</p>
      </div>
    ),
  },
  {
    slug: "gpu-driver",
    title: "Building a GPU Driver From Scratch",
    excerpt: "17,000 lines of Rust to talk to a GPU. From PCI enumeration to Vulkan-class render graphs — the Magma driver story, the bugs that haunted us, and what we learned.",
    date: "2025-10-14",
    readTime: "12 min",
    category: "Drivers",
    categoryColor: "#9B59B6",
    icon: "🎮",
    content: (
      <div className="space-y-6">
        <p>Writing a GPU driver is considered one of the hardest tasks in systems programming. GPU vendors guard their documentation, the hardware is absurdly complex, and a single register write can hang the entire system. We did it anyway.</p>

        <h3 className="text-xl font-bold text-white mt-8">The Magma Architecture</h3>
        <p>Magma is Helix&apos;s GPU driver framework. It&apos;s not a single monolithic driver — it&apos;s a layered architecture:</p>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 font-mono text-sm space-y-1">
          <div className="text-zinc-500">┌─────────────────────────────────────┐</div>
          <div className="text-helix-purple">│  Lumina API (User-facing)           │</div>
          <div className="text-zinc-500">├─────────────────────────────────────┤</div>
          <div className="text-helix-blue">│  Render Graph Engine                │</div>
          <div className="text-zinc-500">├─────────────────────────────────────┤</div>
          <div className="text-emerald-400">│  Command Buffer & Queue Manager     │</div>
          <div className="text-zinc-500">├─────────────────────────────────────┤</div>
          <div className="text-amber-400">│  Memory Manager (VRAM + GTT)        │</div>
          <div className="text-zinc-500">├─────────────────────────────────────┤</div>
          <div className="text-red-400">│  Hardware Abstraction (MMIO + DMA)  │</div>
          <div className="text-zinc-500">└─────────────────────────────────────┘</div>
        </div>

        <h3 className="text-xl font-bold text-white mt-8">PCI Enumeration: The First Step</h3>
        <p>Before you can talk to a GPU, you have to <em>find</em> it. PCI enumeration walks the bus, reads configuration space headers, and matches vendor/device IDs. Our implementation supports ECAM (PCIe extended config) and falls back to legacy port I/O for older systems.</p>

        <h3 className="text-xl font-bold text-white mt-8">The Bug That Took Two Weeks</h3>
        <p>Our worst bug was a <strong>fence synchronization race</strong>. The GPU would signal a fence completion, but the CPU would read the fence value <em>before</em> the memory write propagated through the cache hierarchy. The fix? A single <code className="text-helix-blue bg-helix-blue/10 px-1.5 py-0.5 rounded text-sm">mfence</code> instruction after reading the fence register. Two weeks of debugging. One instruction.</p>

        <h3 className="text-xl font-bold text-white mt-8">Render Graphs</h3>
        <p>Modern GPU APIs (Vulkan, Metal, DX12) use render graphs to optimize resource barriers and minimize state changes. Lumina&apos;s render graph implementation:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Automatically inserts memory barriers between passes</li>
          <li>Merges compatible render passes to reduce overhead</li>
          <li>Implements resource aliasing — multiple textures can share the same VRAM if their lifetimes don&apos;t overlap</li>
          <li>Compiles to a flat command buffer with minimal GPU state changes</li>
        </ul>

        <h3 className="text-xl font-bold text-white mt-8">Lessons Learned</h3>
        <ol className="list-decimal pl-6 space-y-2">
          <li><strong>Start with VirtIO GPU.</strong> Real hardware is for phase 2. VirtIO gives you a working rendering pipeline without the vendor-specific pain.</li>
          <li><strong>Log everything.</strong> When the GPU hangs, you have zero debugging tools. Serial logs are your only friend.</li>
          <li><strong>Test with multiple resolutions.</strong> Our driver worked perfectly at 1024x768 and corrupted memory at 1920x1080. Off-by-one in the framebuffer stride calculation.</li>
        </ol>
      </div>
    ),
  },
  {
    slug: "dis-scheduler",
    title: "Intent-Based Scheduling: Rethinking the CPU Scheduler",
    excerpt: "What if processes could tell the scheduler what they want instead of the scheduler guessing? DIS (Deterministic Intent Scheduler) is our answer — and it's changing how we think about OS scheduling.",
    date: "2025-09-20",
    readTime: "7 min",
    category: "Research",
    categoryColor: "#F59E0B",
    icon: "🧠",
    content: (
      <div className="space-y-6">
        <p>Every major OS uses a variation of the same scheduling model: priority queues with preemption. CFS (Linux), ULE (FreeBSD), the Windows scheduler — they all <em>guess</em> what a process needs based on behavior heuristics. DIS flips this model.</p>

        <h3 className="text-xl font-bold text-white mt-8">The Intent Model</h3>
        <p>In Helix, a process declares its <strong>scheduling intent</strong> when it spawns:</p>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 font-mono text-sm">
          <div><span className="text-helix-purple">let</span> intent = <span className="text-amber-400">SchedulingIntent</span> {'{'}</div>
          <div className="pl-4">class: <span className="text-amber-400">IntentClass</span>::<span className="text-emerald-400">Realtime</span>,</div>
          <div className="pl-4">latency_target: <span className="text-amber-400">Duration</span>::from_micros(<span className="text-helix-blue">100</span>),</div>
          <div className="pl-4">throughput_hint: <span className="text-amber-400">ThroughputHint</span>::<span className="text-emerald-400">BurstyCpu</span>,</div>
          <div className="pl-4">energy_preference: <span className="text-amber-400">EnergyPref</span>::<span className="text-emerald-400">Performance</span>,</div>
          <div>{'}'};</div>
          <div className="mt-2"><span className="text-helix-purple">let</span> task = <span className="text-emerald-400">spawn_with_intent</span>(my_function, intent);</div>
        </div>

        <h3 className="text-xl font-bold text-white mt-8">How DIS Decides</h3>
        <p>DIS doesn&apos;t use a single run queue. It maintains <strong>intent classes</strong>, each with its own scheduling policy:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Realtime</strong> — Earliest Deadline First (EDF) within the class. Hard latency guarantees.</li>
          <li><strong>Interactive</strong> — Boost on input events, adaptive time slices. Optimized for responsiveness.</li>
          <li><strong>Throughput</strong> — CFS-like fair scheduling. Maximize CPU utilization.</li>
          <li><strong>Background</strong> — Only runs when no other class has runnable tasks. Zero impact on foreground.</li>
          <li><strong>Energy</strong> — Batches work to minimize P-state transitions. Best for laptops.</li>
        </ul>

        <h3 className="text-xl font-bold text-white mt-8">NEXUS Integration</h3>
        <p>DIS feeds scheduling telemetry to NEXUS (Helix&apos;s AI engine). NEXUS analyzes patterns and can <strong>predict</strong> scheduling needs before they arise. If a process always bursts CPU at 3:00 AM (a cron job), NEXUS pre-promotes its priority class 30 seconds before the burst, reducing latency by 40%.</p>

        <h3 className="text-xl font-bold text-white mt-8">Benchmark Results</h3>
        <div className="grid md:grid-cols-3 gap-4 my-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-emerald-400">-62%</div>
            <div className="text-xs text-zinc-500 mt-1">Tail latency (p99) vs CFS</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-helix-blue">+18%</div>
            <div className="text-xs text-zinc-500 mt-1">Throughput for batch workloads</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-helix-purple">3.2μs</div>
            <div className="text-xs text-zinc-500 mt-1">Average context switch time</div>
          </div>
        </div>
      </div>
    ),
  },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogPage() {
  const { locale } = useI18n();
  const s = (k: string) => getDocString(blogContent, locale, k);

  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader
        title={s("title")}
        subtitle={s("subtitle")}
        badge={s("badge")}
        gradient="from-amber-400 to-orange-500"
      />

      {/* Status badges */}
      <div className="max-w-5xl mx-auto px-6 mb-12">
        <div className="flex flex-wrap items-center gap-3">
          <a href="https://github.com/HelixOS-Org/helix/actions" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            <img src="https://img.shields.io/github/actions/workflow/status/HelixOS-Org/helix/ci.yml?style=flat-square&logo=githubactions&logoColor=white&label=CI&color=22c55e" alt="CI Status" className="h-5" />
          </a>
          <a href="https://github.com/HelixOS-Org/helix" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            <img src="https://img.shields.io/badge/version-0.4.0--aurora-7B68EE?style=flat-square&logo=rust&logoColor=white" alt="Version" className="h-5" />
          </a>
          <a href="https://github.com/HelixOS-Org/helix/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            <img src="https://img.shields.io/github/license/HelixOS-Org/helix?style=flat-square&color=4A90E2&logo=opensourceinitiative&logoColor=white" alt="License" className="h-5" />
          </a>
          <a href="https://github.com/HelixOS-Org/helix/graphs/contributors" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            <img src="https://img.shields.io/github/contributors/HelixOS-Org/helix?style=flat-square&color=9B59B6&logo=github&logoColor=white" alt="Contributors" className="h-5" />
          </a>
          <a href="https://github.com/HelixOS-Org/helix" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            <img src="https://img.shields.io/github/stars/HelixOS-Org/helix?style=flat-square&color=F59E0B&logo=github&logoColor=white" alt="Stars" className="h-5" />
          </a>
        </div>
      </div>

      {/* Articles */}
      <div className="max-w-5xl mx-auto px-6 pb-8">
        <div className="space-y-8">
          {ARTICLES.map((article, i) => (
            <article key={article.slug} id={article.slug} className="group">
              {/* Card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-all duration-300 overflow-hidden">
                {/* Header */}
                <div className="p-8 pb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{article.icon}</span>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider" style={{ background: `${article.categoryColor}15`, color: article.categoryColor, border: `1px solid ${article.categoryColor}30` }}>
                        {article.category}
                      </span>
                      <span className="text-xs text-zinc-600 font-mono">{formatDate(article.date)}</span>
                      <span className="text-xs text-zinc-600">·</span>
                      <span className="text-xs text-zinc-600">{article.readTime} read</span>
                    </div>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-helix-blue group-hover:to-helix-purple transition-all">
                    {article.title}
                  </h2>
                  <p className="text-zinc-400 leading-relaxed max-w-3xl">{article.excerpt}</p>
                </div>

                {/* Expandable content */}
                <details className="group/details">
                  <summary className="cursor-pointer px-8 py-4 bg-white/[0.02] border-t border-white/[0.06] flex items-center gap-2 text-sm font-semibold text-helix-blue hover:text-helix-purple transition-colors select-none list-none">
                    <svg className="w-4 h-4 transition-transform group-open/details:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    {s("read_full_article")}
                    <span className="ml-auto text-[10px] text-zinc-600 font-mono">#{String(i + 1).padStart(2, "0")}</span>
                  </summary>
                  <div className="px-8 py-8 border-t border-white/[0.04] text-zinc-300 leading-relaxed prose prose-invert max-w-none">
                    {article.content}
                  </div>
                </details>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="rounded-2xl border border-helix-purple/20 bg-gradient-to-br from-helix-purple/5 via-black to-helix-blue/5 p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">{s("stay_in_loop")}</h2>
          <p className="text-zinc-400 mb-6 max-w-lg mx-auto">{s("stay_in_loop_desc")}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://github.com/HelixOS-Org/helix" target="_blank" rel="noopener noreferrer"
              className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              {s("star_on_github")}
            </a>
            <Link href="/contributing" className="px-8 py-3 bg-zinc-900 border border-zinc-700 text-white font-bold rounded-full hover:bg-zinc-800 transition-colors">
              {s("contribute")} →
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
