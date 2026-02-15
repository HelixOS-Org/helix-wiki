import type { Metadata } from "next";
import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import Footer from "@/helix-wiki/components/Footer";

export const metadata: Metadata = {
  title: "Roadmap — Helix OS Development Phases & Milestones",
  description: "Helix OS development roadmap: 5 phases from foundation to user space, with progress tracking, milestones, and planned features.",
  alternates: { canonical: "/roadmap" },
  openGraph: {
    title: "Helix OS Roadmap — From Foundation to User Space",
    description: "Track Helix OS development across 5 phases: Foundation, Core Systems, Advanced Subsystems, Drivers & User Space, and Polish.",
    url: "https://helix-wiki.com/roadmap",
  },
};

interface RoadmapItem {
  label: string;
  done: boolean;
}

function Phase({
  number,
  title,
  subtitle,
  items,
}: {
  number: number;
  title: string;
  subtitle: string;
  items: RoadmapItem[];
}) {
  const doneCount = items.filter((i) => i.done).length;
  const pct = Math.round((doneCount / items.length) * 100);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-helix-blue/20 text-helix-blue font-bold text-lg">
          {number}
        </span>
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-gray-400 text-sm">{subtitle}</p>
        </div>
        <span className="ml-auto text-sm font-mono text-gray-400">
          {doneCount}/{items.length} ({pct}%)
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/10 rounded-full mt-3 mb-5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background:
              pct === 100
                ? "#22c55e"
                : "linear-gradient(90deg, #4A90E2, #7B68EE)",
          }}
        />
      </div>

      {/* Checklist */}
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2 text-[15px]">
            <span className={item.done ? "text-green-400" : "text-gray-500"}>
              {item.done ? "✓" : "○"}
            </span>
            <span className={item.done ? "text-gray-300" : "text-gray-500"}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader
        title="Development Roadmap"
        subtitle="Helix OS development is organized in 5 phases — from bare-metal foundation to a complete, polished operating system with user-space applications."
        badge="ROADMAP"
      />

      {/* ── PHASE 1 ── */}
      <Section title="Phase 1 — Foundation" id="phase-1">
        <Phase
          number={1}
          title="Foundation & Boot"
          subtitle="Core boot infrastructure, HAL, memory management basics"
          items={[
            { label: "Multiboot2 boot stub (32→64 bit)", done: true },
            { label: "GDT & TSS setup", done: true },
            { label: "IDT & exception handlers", done: true },
            { label: "Physical memory manager (bitmap)", done: true },
            { label: "Virtual memory (4-level page tables)", done: true },
            { label: "Heap allocator (bump → slab)", done: true },
            { label: "Serial console output (COM1)", done: true },
            { label: "Basic kernel logging", done: true },
            { label: "x86_64 HAL trait interface", done: true },
            { label: "Stack guard pages", done: true },
          ]}
        />
      </Section>

      {/* ── PHASE 2 ── */}
      <Section title="Phase 2 — Core Systems" id="phase-2">
        <Phase
          number={2}
          title="Kernel Core & Subsystems"
          subtitle="IPC, scheduling, module system, syscall framework"
          items={[
            { label: "IPC channels (sync + async)", done: true },
            { label: "Event bus (pub/sub)", done: true },
            { label: "Message router", done: true },
            { label: "DIS scheduler (intent-based)", done: true },
            { label: "Realtime scheduling class (EDF)", done: true },
            { label: "Interactive scheduling class", done: true },
            { label: "Batch scheduling class", done: true },
            { label: "Module loading & lifecycle", done: true },
            { label: "Hot-reload with state transfer", done: true },
            { label: "Capability-based security", done: true },
            { label: "Syscall dispatch framework", done: true },
            { label: "Kernel panic handler", done: true },
            { label: "Orchestrator / resource broker", done: true },
          ]}
        />
      </Section>

      {/* ── PHASE 3 ── */}
      <Section title="Phase 3 — Advanced Subsystems" id="phase-3">
        <Phase
          number={3}
          title="Filesystem, Graphics & Intelligence"
          subtitle="HelixFS, Lumina GPU API, NEXUS intelligence engine"
          items={[
            { label: "HelixFS on-disk format (superblock, inodes)", done: true },
            { label: "B-tree directory indexing", done: true },
            { label: "Extent-based file storage", done: true },
            { label: "Journaling (metadata)", done: true },
            { label: "Copy-on-Write (CoW) support", done: true },
            { label: "Compression (LZ4 / Zstd)", done: true },
            { label: "Snapshot support", done: true },
            { label: "Lumina GPU API (OpenGL + Vulkan)", done: true },
            { label: "Magma GPU driver (17K LoC, 7 crates)", done: true },
            { label: "NEXUS intelligence engine", done: true },
            { label: "Profile system (OS builder)", done: true },
            { label: "Benchmark suite (4K LoC)", done: true },
          ]}
        />
      </Section>

      {/* ── PHASE 4 ── */}
      <Section title="Phase 4 — Drivers & User Space" id="phase-4">
        <Phase
          number={4}
          title="Device Drivers & User Applications"
          subtitle="VirtIO, input, networking, user-space init"
          items={[
            { label: "VirtIO block driver", done: false },
            { label: "VirtIO network driver", done: false },
            { label: "VirtIO console driver", done: false },
            { label: "PS/2 keyboard driver", done: false },
            { label: "Serial driver (16550 UART)", done: false },
            { label: "Framebuffer driver", done: false },
            { label: "User-space memory isolation", done: false },
            { label: "ELF binary loader", done: false },
            { label: "Init process & user shell", done: false },
            { label: "POSIX-subset syscall API", done: false },
            { label: "AArch64 full boot support", done: false },
            { label: "RISC-V full boot support", done: false },
          ]}
        />
      </Section>

      {/* ── PHASE 5 ── */}
      <Section title="Phase 5 — Polish & Production" id="phase-5">
        <Phase
          number={5}
          title="Hardening, SMP & Real Hardware"
          subtitle="Multi-core, security hardening, real hardware testing"
          items={[
            { label: "SMP support (multi-core scheduling)", done: false },
            { label: "NUMA-aware memory allocation", done: false },
            { label: "Security audit & hardening", done: false },
            { label: "SMEP / SMAP enforcement", done: false },
            { label: "ASLR (Address Space Layout Randomization)", done: false },
            { label: "Real hardware testing suite", done: false },
            { label: "Performance optimization pass", done: false },
            { label: "Comprehensive documentation", done: false },
            { label: "CI/CD pipeline (QEMU integration tests)", done: false },
            { label: "Stable API versioning", done: false },
          ]}
        />
      </Section>

      {/* ── MILESTONES ── */}
      <Section title="Milestones" id="milestones">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 text-gray-400 font-medium">Milestone</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Description</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="py-3 px-4 font-semibold text-white">v0.1 — Boot</td>
                <td className="py-3 px-4 text-gray-300">Kernel boots, prints to serial, basic memory management</td>
                <td className="py-3 px-4 text-green-400">✓ Complete</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">v0.2 — Schedule</td>
                <td className="py-3 px-4 text-gray-300">DIS scheduler operational with all 4 intent classes</td>
                <td className="py-3 px-4 text-green-400">✓ Complete</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">v0.3 — Modules</td>
                <td className="py-3 px-4 text-gray-300">Module system with hot-reload and capability security</td>
                <td className="py-3 px-4 text-green-400">✓ Complete</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">v0.4 — Storage</td>
                <td className="py-3 px-4 text-gray-300">HelixFS with B-tree indexing, journaling, CoW, snapshots</td>
                <td className="py-3 px-4 text-green-400">✓ Complete</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">v0.5 — Graphics</td>
                <td className="py-3 px-4 text-gray-300">Lumina API + Magma GPU driver, NEXUS intelligence</td>
                <td className="py-3 px-4 text-green-400">✓ Complete</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">v0.6 — Drivers</td>
                <td className="py-3 px-4 text-gray-300">VirtIO block/net, PS/2, serial, framebuffer drivers</td>
                <td className="py-3 px-4 text-yellow-400">🔜 Planned</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">v0.7 — User Space</td>
                <td className="py-3 px-4 text-gray-300">ELF loader, init process, user shell, POSIX subset</td>
                <td className="py-3 px-4 text-yellow-400">🔜 Planned</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">v1.0 — Release</td>
                <td className="py-3 px-4 text-gray-300">SMP, security hardening, real hardware, stable APIs</td>
                <td className="py-3 px-4 text-gray-500">⏳ Future</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── NON-GOALS ── */}
      <Section title="Non-Goals" id="non-goals">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-gray-300 mb-4">
            To stay focused, the following are explicitly <strong className="text-white">out of scope</strong>:
          </p>
          <ul className="space-y-2 text-gray-400 text-[15px]">
            <li className="flex items-start gap-2"><span className="text-red-400">✕</span>Full POSIX compliance — Helix aims for a modern, Rust-native API</li>
            <li className="flex items-start gap-2"><span className="text-red-400">✕</span>Linux binary compatibility — no goal to run Linux ELFs</li>
            <li className="flex items-start gap-2"><span className="text-red-400">✕</span>GUI window manager — Lumina provides GPU API, not a desktop environment</li>
            <li className="flex items-start gap-2"><span className="text-red-400">✕</span>Networking stack — beyond VirtIO net driver basics</li>
            <li className="flex items-start gap-2"><span className="text-red-400">✕</span>Package manager — out of scope for the kernel project</li>
          </ul>
        </div>
      </Section>

      <Footer />
    </div>
  );
}
