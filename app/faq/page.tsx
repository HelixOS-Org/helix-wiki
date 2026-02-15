import type { Metadata } from "next";
import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import Footer from "@/helix-wiki/components/Footer";

export const metadata: Metadata = {
  title: "FAQ — Helix OS Frequently Asked Questions",
  description: "Answers to common questions about Helix OS: architecture, building, debugging, scheduling, filesystem, performance, comparisons with Linux & Redox, and troubleshooting.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Helix OS FAQ — Your Questions Answered",
    description: "Comprehensive FAQ covering Helix OS design, development, building, debugging, comparisons, and troubleshooting.",
    url: "https://helix-wiki.com/faq",
  },
};

interface FaqItem {
  q: string;
  a: React.ReactNode;
}

function FaqCategory({ title, items }: { title: string; items: FaqItem[] }) {
  return (
    <div className="mb-10">
      <h3 className="text-xl font-bold text-white mb-6 border-l-4 border-helix-blue pl-4">
        {title}
      </h3>
      <div className="space-y-6">
        {items.map((item, i) => (
          <details
            key={i}
            className="group rounded-xl border border-white/10 bg-white/[0.02] transition-colors hover:border-helix-blue/40"
          >
            <summary className="cursor-pointer select-none px-6 py-4 font-semibold text-white list-none flex items-center justify-between">
              <span>{item.q}</span>
              <span className="ml-4 text-helix-blue transition-transform group-open:rotate-45 text-xl">+</span>
            </summary>
            <div className="px-6 pb-5 text-gray-300 leading-relaxed prose prose-invert max-w-none text-[15px]">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about Helix OS — from first build to kernel internals."
        badge="FAQ"
      />

      <Section title="General" id="general">
        <FaqCategory
          title="About Helix"
          items={[
            {
              q: "What is Helix OS?",
              a: (
                <>
                  <p>Helix OS is a <strong>modular, research-oriented</strong> operating system kernel written entirely in Rust. It explores modern OS design: intent-based scheduling (DIS), hot-reloadable modules, capability-based security, and a B-tree journaled copy-on-write filesystem (HelixFS).</p>
                  <p className="mt-2">Helix is designed for learning, experimentation, and demonstrating Rust&apos;s viability for systems programming.</p>
                </>
              ),
            },
            {
              q: "Why another operating system?",
              a: (
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Education</strong> — clear, well-documented codebase for learning OS internals</li>
                  <li><strong>Research</strong> — platform for experimenting with novel scheduling, memory, and FS ideas</li>
                  <li><strong>Rust showcase</strong> — demonstrating that safe systems programming is practical</li>
                  <li><strong>Modern design</strong> — applying decades of OS research to a clean-slate kernel</li>
                </ul>
              ),
            },
            {
              q: "Is Helix ready for production?",
              a: <p><strong>No.</strong> Helix is a research and educational project. It currently lacks complete driver support, hardened security, extensive testing, and production workload validation. Use it for learning and experimentation.</p>,
            },
            {
              q: "What platforms does Helix support?",
              a: (
                <p><strong>x86_64</strong> is the primary supported architecture (QEMU + real hardware). <strong>AArch64</strong> and <strong>RISC-V 64</strong> HAL implementations exist but are at earlier stages. All three share a common HAL trait interface.</p>
              ),
            },
          ]}
        />
      </Section>

      <Section title="Building & Running" id="building">
        <FaqCategory
          title="Setup & Build"
          items={[
            {
              q: "What are the system requirements?",
              a: (
                <ul className="list-disc pl-5 space-y-1">
                  <li>Linux / macOS (WSL2 works on Windows)</li>
                  <li>8 GB RAM minimum, 16 GB recommended</li>
                  <li>2 GB free disk space</li>
                  <li>Rust nightly (managed by <code className="text-helix-blue">rust-toolchain.toml</code>)</li>
                  <li>QEMU with x86_64 support</li>
                  <li>Optional: GDB, GRUB 2, xorriso</li>
                </ul>
              ),
            },
            {
              q: "How do I build and run Helix?",
              a: (
                <pre className="bg-black/50 p-4 rounded-lg text-sm overflow-x-auto mt-2"><code>{`git clone https://github.com/helix-os/helix.git && cd helix
rustup target add x86_64-unknown-none
./scripts/build.sh          # Build the kernel
./scripts/run_qemu.sh       # Launch in QEMU`}</code></pre>
              ),
            },
            {
              q: "Build fails with \"linker not found\"",
              a: (
                <p>Install <code className="text-helix-blue">lld</code>: <code className="text-helix-blue">sudo apt install lld</code>. Helix uses <code className="text-helix-blue">rust-lld</code> by default — ensure your <code className="text-helix-blue">.cargo/config.toml</code> has <code className="text-helix-blue">linker = &quot;rust-lld&quot;</code>.</p>
              ),
            },
            {
              q: "QEMU won't start / KVM permission denied",
              a: (
                <pre className="bg-black/50 p-4 rounded-lg text-sm overflow-x-auto mt-2"><code>{`sudo apt install qemu-system-x86
sudo usermod -aG kvm $USER   # Then log out & back in`}</code></pre>
              ),
            },
            {
              q: "How do I create a bootable ISO?",
              a: <p>Run <code className="text-helix-blue">./scripts/build.sh --iso</code>. The output is placed at <code className="text-helix-blue">build/output/helix.iso</code> and can be written to USB or booted in VirtualBox/VMware.</p>,
            },
          ]}
        />
      </Section>

      <Section title="Architecture & Design" id="architecture">
        <FaqCategory
          title="Kernel Design"
          items={[
            {
              q: "Why is Helix written in Rust?",
              a: (
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Memory safety</strong> — prevents buffer overflows, use-after-free, null dereference</li>
                  <li><strong>Zero-cost abstractions</strong> — high-level code compiles to efficient machine code</li>
                  <li><strong>No runtime</strong> — minimal requirements, perfect for <code className="text-helix-blue">#![no_std]</code></li>
                  <li><strong>Strong type system</strong> — catches errors at compile time</li>
                  <li>The kernel uses <code className="text-helix-blue">unsafe</code> sparingly and only where absolutely necessary.</li>
                </ul>
              ),
            },
            {
              q: "What is the Differentiated Intent Scheduler (DIS)?",
              a: (
                <>
                  <p>DIS replaces traditional priority numbers with <strong>intent classes</strong>: Realtime (hard deadlines, EDF), Interactive (low latency), Batch (throughput-oriented), and Background (best-effort). The scheduler uses these intents plus constraints (CPU affinity, deadlines) to make intelligent scheduling decisions.</p>
                </>
              ),
            },
            {
              q: "Is Helix a microkernel?",
              a: (
                <p>No — Helix is a <strong>modular monolithic</strong> kernel. Subsystems run in kernel space (like Linux) but have clean interfaces and hot-reloadable modules (like a microkernel). This gives low IPC overhead while keeping flexibility.</p>
              ),
            },
            {
              q: "How does hot-reloading work?",
              a: (
                <p>Load new module → pause old module (quiesce) → transfer state → activate new → unload old. If the new module fails verification, the system rolls back automatically.</p>
              ),
            },
            {
              q: "Why B-trees in the filesystem?",
              a: (
                <p>B-trees minimize disk seeks (high fanout), give consistent O(log n) performance, support efficient range queries (directory listings, extent lookup), and are cache-friendly (nodes fit in pages). HelixFS uses them for both directory indexing and extent management.</p>
              ),
            },
          ]}
        />
      </Section>

      <Section title="Development" id="development">
        <FaqCategory
          title="Contributing & Debugging"
          items={[
            {
              q: "How do I add a new module?",
              a: (
                <p>Create a crate under <code className="text-helix-blue">modules_impl/</code>, implement the <code className="text-helix-blue">ModuleTrait</code>, and register it with <code className="text-helix-blue">register_module!(MyModule)</code>. See the <a href="/docs/modules" className="text-helix-blue hover:underline">Modules documentation</a> for details.</p>
              ),
            },
            {
              q: "How do I debug with GDB?",
              a: (
                <pre className="bg-black/50 p-4 rounded-lg text-sm overflow-x-auto mt-2"><code>{`./scripts/run_qemu.sh --debug              # Start debug server
gdb build/output/helix-kernel              # In another terminal
(gdb) target remote localhost:1234
(gdb) break kernel_main
(gdb) continue`}</code></pre>
              ),
            },
            {
              q: "I get a triple fault!",
              a: (
                <p>Triple faults usually mean invalid page tables, stack overflow, or GDT/IDT issues. Run <code className="text-helix-blue">qemu-system-x86_64 -d int,cpu_reset -no-reboot</code> to see the exception chain. See the <a href="/docs/debugging" className="text-helix-blue hover:underline">Debugging guide</a>.</p>
              ),
            },
            {
              q: "How fast is Helix?",
              a: (
                <p>On QEMU: context switch ~2–5 μs, syscall overhead ~1–2 μs, IPC round-trip ~3–5 μs. See the <a href="/docs/benchmarks" className="text-helix-blue hover:underline">Benchmarks page</a> for the full suite.</p>
              ),
            },
          ]}
        />
      </Section>

      <Section title="Comparisons" id="comparisons">
        <FaqCategory
          title="Helix vs. Other Kernels"
          items={[
            {
              q: "Helix vs. Linux?",
              a: (
                <p>Linux: ~30M lines of C, CFS scheduler, production-grade, runs on everything. Helix: ~75K lines of Rust, intent-based scheduling, research/education focus, x86_64 primarily. Use Linux for production; use Helix for learning and experimentation.</p>
              ),
            },
            {
              q: "Helix vs. Redox OS?",
              a: (
                <p>Both are Rust kernels. Redox is a <strong>microkernel</strong> with a Unix-like user space and more mature ecosystem. Helix is <strong>modular monolithic</strong> with hot-reload, intent scheduling, and HelixFS — more research-oriented.</p>
              ),
            },
            {
              q: "Helix vs. seL4?",
              a: (
                <p>seL4 is <strong>formally verified</strong> with mathematical proofs of correctness — a minimal microkernel focused on security. Helix is larger, focuses on modularity and novel scheduling, and uses Rust&apos;s type system for safety rather than formal methods.</p>
              ),
            },
          ]}
        />
      </Section>

      <Footer />
    </div>
  );
}
