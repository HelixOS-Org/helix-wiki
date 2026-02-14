import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/helix-wiki/components/Footer";
import RustCode from "@/helix-wiki/components/RustCode";

export const metadata: Metadata = {
  title: "Download — Bootable ISO for x86_64 · BIOS + UEFI",
  description: "Download the Helix OS minimal profile ISO image. Boot in QEMU or on bare metal — x86_64, BIOS and UEFI compatible. 32 MB, boots in under 1 second, includes serial console and NEXUS AI.",
  alternates: { canonical: "/download" },
  openGraph: {
    title: "Download Helix OS — Try the Bootable ISO",
    description: "32 MB bootable ISO for x86_64 with GRUB Multiboot2. Launch with `qemu-system-x86_64 -cdrom helix-minimal.iso -m 128M` and explore the kernel in seconds.",
    url: "https://helix-wiki.com/download",
  },
};

/* ── Profile config (TOML shown via RustCode for highlighting) ── */
const profileToml = `[profile]
name = "minimal"
version = "1.0.0"
description = "Minimal OS for embedded systems"
target = "embedded"

[profile.features]
multicore = false
hot_reload = false
networking = false
graphics = false

[memory]
heap_size_kb = 256
stack_size_kb = 16
virtual_memory = false

[scheduler]
module = "round_robin"
time_slice_ms = 10
priority_levels = 8

[modules]
static = ["helix-scheduler-round-robin"]
dynamic = []

[debug]
level = "minimal"
panic_behavior = "halt"`;

const bootSample = `// Helix boot sequence — serial output

pub fn kernel_main(boot_info: &BootInfo) -> ! {
    serial_println!("========================================");
    serial_println!("  HELIX OS FRAMEWORK");
    serial_println!("  Minimal Kernel Profile");
    serial_println!("========================================");

    // Phase 1: Core initialization
    let idt = interrupts::init_idt();     // 256 entries
    let gdt = gdt::init_gdt();           // kernel segments
    let pic = pic::remap(32, 40);        // IRQ0-15 → INT 32-47
    let timer = pit::init(100);          // PIT @ 100 Hz

    // Phase 2: Memory subsystem
    let phys = boot_info.memory_map();
    let virt = paging::identity_map_4gb();
    let heap = bump::init(4 * 1024 * 1024); // 4 MB

    // Phase 3: Module system
    let registry = ModuleRegistry::new();
    let scheduler = registry.load::<RoundRobin>();

    // Phase 4: NEXUS Intelligence
    let nexus = Nexus::init();
    nexus.prediction_engine.calibrate();
    nexus.anomaly_detector.start();
    nexus.self_heal.activate();

    serial_println!("All systems nominal.");
    serial_println!("Profile: minimal | Arch: x86_64");

    loop { x86_64::instructions::hlt(); }
}`;

/* ── Spec table data ── */
const specs: { label: string; value: string; color: string }[] = [
  { label: "Format",       value: "ISO 9660 (El Torito)",        color: "text-zinc-300" },
  { label: "Image Size",   value: "~32 MB",                       color: "text-zinc-300" },
  { label: "Kernel Size",  value: "406 KB (ELF 64-bit, stripped)", color: "text-helix-blue" },
  { label: "Architecture", value: "x86_64",                        color: "text-zinc-300" },
  { label: "Bootloader",   value: "GRUB 2 (Multiboot2)",          color: "text-zinc-300" },
  { label: "Boot Mode",    value: "Legacy BIOS + UEFI",           color: "text-helix-purple" },
  { label: "Min RAM",      value: "4 MB (128 MB recommended)",    color: "text-zinc-300" },
  { label: "Heap",         value: "4 MB bump allocator",          color: "text-zinc-300" },
  { label: "Scheduler",    value: "Round-Robin (10 ms slice)",    color: "text-zinc-300" },
  { label: "Profile",      value: "minimal (helix.toml)",         color: "text-helix-accent" },
];

/* ── QEMU commands ── */
const qemuCmds = [
  { label: "Quick Start",        cmd: "qemu-system-x86_64 -cdrom helix-minimal.iso -m 128M" },
  { label: "With Serial Output",  cmd: "qemu-system-x86_64 -cdrom helix-minimal.iso -m 128M -serial stdio" },
  { label: "Multi-Core Debug",    cmd: "qemu-system-x86_64 -cdrom helix-minimal.iso -m 256M -smp 2 -serial stdio" },
  { label: "Headless (no GUI)",   cmd: "qemu-system-x86_64 -cdrom helix-minimal.iso -m 128M -nographic" },
];

/* ── What's inside ── */
const included = [
  {
    icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    title: "Serial Console",
    desc: "Full serial output at 115200 baud — debug every boot phase from your host terminal.",
  },
  {
    icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    title: "Framebuffer Graphics",
    desc: "1024×768 @ 32bpp linear framebuffer via Multiboot2 — pixel-level rendering ready.",
  },
  {
    icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    title: "NEXUS Intelligence",
    desc: "Prediction engine, anomaly detection, self-healing monitor, and telemetry — all active.",
  },
  {
    icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    title: "Round-Robin Scheduler",
    desc: "Modular scheduler with 10 ms time slicing, 8 priority levels, fully swappable at runtime.",
  },
  {
    icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>,
    title: "HelixFS RAM Disk",
    desc: "Copy-on-write filesystem with journaling, mounted at root. Superblock + B+Tree index.",
  },
  {
    icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    title: "Full IDT + GDT",
    desc: "256-entry IDT, kernel GDT with code/data segments, PIC remapped to INT 32–47.",
  },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-helix-purple/40 overflow-hidden">
      {/* Background — identical to homepage */}
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="fixed top-[-200px] left-[-200px] w-[600px] h-[600px] bg-helix-blue/15 rounded-full blur-[150px] animate-pulse-slow pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-helix-purple/15 rounded-full blur-[150px] animate-pulse-slow pointer-events-none" />

      <main className="relative">
        {/* ── Hero ── */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-helix-blue/[0.04] blur-[120px]" />
          <div className="absolute top-40 left-1/3 w-[400px] h-[400px] rounded-full bg-helix-purple/[0.06] blur-[100px]" />

          <div className="relative max-w-4xl mx-auto px-6 text-center">
            {/* Animated icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-helix-blue/10 border border-helix-blue/20 mb-8 animate-float">
              <svg className="w-10 h-10 text-helix-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              Download{" "}
              <span className="bg-gradient-to-r from-helix-blue via-helix-purple to-helix-accent bg-clip-text text-transparent">
                Helix OS
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              A bootable ISO of the <strong className="text-white">minimal profile</strong> — serial console,
              framebuffer, NEXUS AI, and a 406 KB kernel. Boot it in QEMU in under 10 seconds.
            </p>

            {/* Stats row — matching donate page */}
            <div className="mt-10 flex flex-wrap justify-center gap-8 text-center">
              {[
                { value: "406 KB", label: "Kernel Binary" },
                { value: "~32 MB", label: "ISO Image" },
                { value: "<1s", label: "Boot Time" },
                { value: "x86_64", label: "Architecture" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Primary download CTA */}
            <div className="mt-12 flex flex-col items-center gap-4">
              <a
                href="/demos/helix-minimal.iso"
                download
                className="group relative px-12 py-5 rounded-full bg-gradient-to-r from-helix-blue to-helix-purple text-white font-bold text-lg hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_60px_rgba(74,144,226,0.15)] flex items-center gap-3"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-helix-blue to-helix-purple opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500" />
                <svg className="w-6 h-6 relative group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="relative">Download ISO</span>
              </a>
              <div className="flex items-center gap-3 text-sm text-zinc-500 font-mono">
                <span>helix-minimal.iso</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>32 MB</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>v0.4.0 Aurora</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── What's Inside — FeatureCard-style grid ── */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">What&apos;s Inside</h2>
            <p className="text-zinc-500 mt-2">Everything running out-of-the-box in the minimal profile.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {included.map((item) => (
              <div
                key={item.title}
                className="group relative p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-helix-purple/50 transition-all duration-300 hover:bg-zinc-900/80"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-helix-blue/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="relative z-10">
                  <div className="mb-4 text-helix-blue group-hover:text-helix-purple transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-helix-blue group-hover:to-helix-purple transition-all">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Run with QEMU ── */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full" />
            Run with QEMU
          </h2>
          <p className="text-zinc-500 mb-8 ml-5">Copy any command below to launch the ISO in a virtual machine.</p>

          <div className="space-y-3">
            {qemuCmds.map((q) => (
              <div key={q.label} className="rounded-xl bg-zinc-950/50 border border-zinc-800/60 hover:border-zinc-700/60 transition-colors overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4">
                  <span className="text-xs text-zinc-500 font-medium w-40 shrink-0">{q.label}</span>
                  <code className="flex-1 text-sm font-mono text-zinc-300 overflow-x-auto">
                    <span className="text-green-400">$ </span>{q.cmd}
                  </code>
                </div>
              </div>
            ))}
          </div>

          {/* Prerequisites */}
          <div className="mt-6 p-6 rounded-2xl border border-zinc-800/40 bg-zinc-950/30">
            <h3 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-helix-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Prerequisites
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { os: "Debian / Ubuntu", cmd: "sudo apt install qemu-system-x86" },
                { os: "Arch Linux", cmd: "sudo pacman -S qemu-full" },
                { os: "macOS", cmd: "brew install qemu" },
              ].map((p) => (
                <div key={p.os} className="px-4 py-3 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
                  <div className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1.5">{p.os}</div>
                  <code className="text-xs text-helix-blue font-mono">{p.cmd}</code>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Boot Sequence — syntax highlighted ── */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-helix-blue to-helix-purple rounded-full" />
            Boot Sequence
          </h2>
          <p className="text-zinc-500 mb-8 ml-5">What happens under the hood when the kernel starts.</p>

          <RustCode filename="kernel/src/main.rs" language="rust">
            {bootSample}
          </RustCode>
        </section>

        {/* ── Technical Specifications ── */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-helix-purple to-helix-accent rounded-full" />
            Technical Specifications
          </h2>
          <p className="text-zinc-500 mb-8 ml-5">Full breakdown of the ISO contents and runtime configuration.</p>

          <div className="rounded-2xl overflow-hidden border border-zinc-800/60 bg-zinc-950/50">
            {specs.map((s, i) => (
              <div
                key={s.label}
                className={`flex items-center px-6 py-4 ${i !== specs.length - 1 ? "border-b border-zinc-800/40" : ""} ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}
              >
                <span className="text-sm text-zinc-500 font-medium w-40 shrink-0">{s.label}</span>
                <span className={`text-sm font-mono ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Profile Configuration — syntax highlighted ── */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
            Profile Configuration
          </h2>
          <p className="text-zinc-500 mb-8 ml-5">
            The <code className="text-helix-blue bg-helix-blue/10 px-1.5 py-0.5 rounded text-xs">helix.toml</code> that
            defines what gets compiled into this ISO.
          </p>

          <RustCode filename="profiles/minimal/helix.toml" language="toml">
            {profileToml}
          </RustCode>
        </section>

        {/* ── Build Your Own — CTA matching homepage pattern ── */}
        <section className="max-w-4xl mx-auto px-6 pb-24">
          <div className="rounded-2xl border border-zinc-800/40 bg-zinc-950/30 p-10 text-center">
            <h2 className="text-2xl font-bold mb-4">Want to build your own profile?</h2>
            <p className="text-zinc-400 mb-8 max-w-lg mx-auto leading-relaxed">
              Every subsystem is a Rust trait. Every module is hot-swappable.
              Create a custom <code className="text-helix-blue bg-helix-blue/10 px-1.5 py-0.5 rounded text-xs">helix.toml</code> and
              compile exactly the kernel you need.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/docs/architecture"
                className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
              >
                Explore Architecture →
              </Link>
              <Link
                href="/docs/modules"
                className="px-8 py-4 bg-zinc-900 border border-zinc-700 text-white font-bold rounded-full hover:bg-zinc-800 transition-colors"
              >
                Module Guide
              </Link>
              <a
                href="https://github.com/HelixOS-Org/helix"
                target="_blank"
                className="px-8 py-4 bg-zinc-900 border border-zinc-700 text-white font-bold rounded-full hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                Source Code
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
