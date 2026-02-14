import HelixLogo from "@/helix-wiki/components/HelixLogo";
import FeatureCard from "@/helix-wiki/components/FeatureCard";
import Footer from "@/helix-wiki/components/Footer";
import Link from "next/link";

const sections = [
  { href: "/docs/architecture", icon: "🏗️", title: "Architecture", desc: "Layer stack, design philosophy, and crate dependency graph." },
  { href: "/docs/core", icon: "🧬", title: "Core Kernel", desc: "Trusted Computing Base: orchestrator, syscalls, IPC, interrupts, self-heal, hot-reload." },
  { href: "/docs/hal", icon: "⚙️", title: "HAL", desc: "Hardware Abstraction Layer: CPU, MMU, interrupts, firmware, KASLR — multi-arch." },
  { href: "/docs/subsystems", icon: "📦", title: "Subsystems", desc: "Memory management, execution engine, DIS scheduler, init phases, userspace." },
  { href: "/docs/modules", icon: "🔌", title: "Modules", desc: "Hot-reload registry, ABI versioning, module metadata, and development API." },
  { href: "/docs/filesystem", icon: "💾", title: "HelixFS", desc: "CoW filesystem with journaling, B+Tree, snapshots, ARC cache, and encryption." },
  { href: "/docs/nexus", icon: "🧠", title: "NEXUS", desc: "812K lines of kernel intelligence: prediction, anomaly detection, quarantine." },
  { href: "/docs/lumina", icon: "🎨", title: "Lumina", desc: "Vulkan-class GPU API: render graphs, shader compilation, PBR materials." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-helix-purple/40 overflow-hidden">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="fixed top-[-200px] left-[-200px] w-[600px] h-[600px] bg-helix-blue/15 rounded-full blur-[150px] animate-pulse-slow pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-helix-purple/15 rounded-full blur-[150px] animate-pulse-slow pointer-events-none" />

      <main className="relative">
        {/* HERO */}
        <section className="min-h-screen flex items-center justify-center pt-16">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-helix-purple/10 border border-helix-purple/20 text-helix-purple text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-helix-purple animate-pulse" />
                v0.4.0 &ldquo;Aurora&rdquo; · Pre-Alpha
              </div>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.1]">
                Systems
                <br />
                Built To{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-helix-blue via-helix-purple to-helix-accent">Evolve</span>
                <span className="sr-only"> — Helix OS: Modular Rust Kernel with Hot-Reload, Self-Healing &amp; AI</span>
              </h1>
              <p className="text-xl text-zinc-400 max-w-lg leading-relaxed">
                A modular, capability-based OS kernel written entirely in Rust. Every crate is{" "}
                <code className="text-helix-blue bg-helix-blue/10 px-1.5 py-0.5 rounded text-sm">#![no_std]</code>, every subsystem is a trait,
                every implementation is hot-swappable.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/docs/architecture" className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
                  Explore Architecture →
                </Link>
                <a href="https://github.com/HelixOS-Org/helix" target="_blank" className="px-8 py-4 bg-zinc-900 border border-zinc-700 text-white font-bold rounded-full hover:bg-zinc-800 transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  Source Code
                </a>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-800/50">
                <div><div className="text-2xl font-bold text-helix-blue">~6.4K</div><div className="text-xs text-zinc-500 mt-1">Core TCB lines</div></div>
                <div><div className="text-2xl font-bold text-helix-purple">~20</div><div className="text-xs text-zinc-500 mt-1">Workspace crates</div></div>
                <div><div className="text-2xl font-bold text-helix-accent">3</div><div className="text-xs text-zinc-500 mt-1">Architectures</div></div>
              </div>
            </div>
            <div className="relative flex items-center justify-center animate-float">
              <div className="absolute inset-0 bg-gradient-to-tr from-helix-blue/20 to-helix-purple/20 blur-[80px] rounded-full" />
              <HelixLogo className="w-full max-w-[500px] drop-shadow-[0_0_60px_rgba(123,104,238,0.25)]" />
            </div>
          </div>
        </section>

        {/* PHILOSOPHY */}
        <section className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" aria-label="Helix OS Design Philosophy: Mechanism, Not Policy">Mechanism, <span className="text-helix-blue">Not</span> Policy</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              The kernel is not a monolith that happens to be extensible. It is an <strong className="text-white">extensible framework</strong> that happens to be a kernel.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard title="Trait-Based Everything" description="Every subsystem is a Rust trait. Scheduling, allocation, filesystem — all swappable at runtime through trait objects." icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>} />
            <FeatureCard title="Hot-Reload First" description="Modules replaced at runtime: pause → export state → init new → import state → activate. Automatic rollback on failure." icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} />
            <FeatureCard title="Self-Healing" description="Crashed subsystems are detected and restarted automatically. The kernel monitors health and escalates recovery actions." icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
            <FeatureCard title="Bare Metal Rust" description="#![no_std] everywhere. Targets x86_64, AArch64, and RISC-V 64. Zero libc, zero runtime." icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>} />
            <FeatureCard title="Capability Security" description="Fine-grained permission model. Every resource access goes through capability validation. Least privilege by default." icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>} />
            <FeatureCard title="AI-Powered Kernel" description="NEXUS: 812K lines of intelligence. Crash prediction, anomaly detection, micro-rollback, quarantine escalation." icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
          </div>
        </section>

        {/* EXPLORE */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-10 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-helix-blue to-helix-purple rounded-full" />
            Explore the Kernel
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {sections.map((s) => (
              <Link key={s.href} href={s.href} className="group p-6 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:border-helix-purple/40 hover:bg-zinc-900/70 transition-all">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-helix-blue transition-colors">{s.title}</h3>
                    <p className="text-sm text-zinc-500 mt-1">{s.desc}</p>
                  </div>
                  <svg className="w-5 h-5 text-zinc-700 group-hover:text-helix-purple ml-auto mt-1 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* TRY IT — ISO Download */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="relative rounded-2xl border border-helix-blue/20 bg-gradient-to-br from-helix-blue/5 via-black to-helix-purple/5 overflow-hidden">
            {/* Glow accents */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-helix-blue/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-helix-purple/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              {/* Left: Info */}
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-helix-blue/10 border border-helix-blue/20 text-helix-blue text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Bootable ISO · x86_64 · BIOS + UEFI
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Try It{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-helix-blue to-helix-purple">Now</span>
                </h2>
                <p className="text-zinc-400 leading-relaxed max-w-lg">
                  Download the <strong className="text-white">minimal</strong> profile ISO and launch it in QEMU. Serial console, graphical framebuffer, NEXUS AI — everything works out-of-the-box.
                </p>

                {/* QEMU command */}
                <div className="bg-[#0d1117] border border-zinc-800/60 rounded-lg p-4 font-mono text-sm">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs mb-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Terminal
                  </div>
                  <code className="text-green-400">$</code>
                  <code className="text-zinc-300"> qemu-system-x86_64 -cdrom helix-minimal.iso -m 128M</code>
                </div>

                {/* Specs */}
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-helix-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                    Kernel 406 Ko
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-helix-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" /></svg>
                    ISO 32 Mo
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-helix-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Boot &lt; 1s
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    GRUB Multiboot2
                  </span>
                </div>
              </div>

              {/* Right: Download button */}
              <div className="flex flex-col items-center gap-4">
                <a href="/demos/helix-minimal.iso" download
                   className="group relative px-10 py-5 rounded-2xl bg-gradient-to-r from-helix-blue to-helix-purple text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-helix-purple/20 flex items-center gap-3">
                  <svg className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download ISO
                </a>
                <span className="text-[11px] text-zinc-600 font-mono">helix-minimal.iso · 32 MB</span>
                <Link href="/download" className="text-xs text-helix-blue hover:text-helix-purple transition-colors mt-1">
                  See full details →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
