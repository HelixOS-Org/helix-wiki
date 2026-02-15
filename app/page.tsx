"use client";
import HelixLogo from "@/helix-wiki/components/HelixLogo";
import FeatureCard from "@/helix-wiki/components/FeatureCard";
import Footer from "@/helix-wiki/components/Footer";
import Link from "next/link";
import { useI18n } from "@/helix-wiki/lib/i18n";

const sections = [
  { href: "/docs/getting-started", icon: "🚀", titleKey: "doc.getting_started", desc: "Prerequisites, installation, building, and first boot in QEMU." },
  { href: "/docs/architecture", icon: "🏗️", titleKey: "doc.architecture", desc: "Layer stack, design philosophy, and crate dependency graph." },
  { href: "/docs/core", icon: "🧬", titleKey: "doc.core", desc: "Trusted Computing Base: orchestrator, syscalls, IPC, interrupts, self-heal, hot-reload." },
  { href: "/docs/hal", icon: "⚙️", titleKey: "doc.hal", desc: "Hardware Abstraction Layer: CPU, MMU, interrupts, firmware, KASLR — multi-arch." },
  { href: "/docs/subsystems", icon: "📦", titleKey: "doc.subsystems", desc: "Memory management, execution engine, DIS scheduler, init phases, userspace." },
  { href: "/docs/modules", icon: "🔌", titleKey: "doc.modules", desc: "Hot-reload registry, ABI versioning, module metadata, and development API." },
  { href: "/docs/filesystem", icon: "💾", titleKey: "doc.filesystem", desc: "CoW filesystem with journaling, B+Tree, snapshots, ARC cache, and encryption." },
  { href: "/docs/nexus", icon: "🧠", titleKey: "doc.nexus", desc: "812K lines of kernel intelligence: prediction, anomaly detection, quarantine." },
  { href: "/docs/lumina", icon: "🎨", titleKey: "doc.lumina", desc: "Vulkan-class GPU API: render graphs, shader compilation, PBR materials." },
  { href: "/docs/drivers", icon: "🖧", titleKey: "doc.drivers", desc: "Magma GPU driver (17K LoC), VirtIO planned support, driver module framework." },
  { href: "/docs/benchmarks", icon: "📊", titleKey: "doc.benchmarks", desc: "Deterministic kernel benchmarks: scheduler, memory, IPC, IRQ with statistical analysis." },
  { href: "/docs/architectures", icon: "🖥️", titleKey: "doc.architectures", desc: "Deep dive into x86_64, AArch64, and RISC-V 64 HAL implementations." },
  { href: "/docs/debugging", icon: "🐛", titleKey: "doc.debugging", desc: "GDB, serial console, QEMU flags, crash analysis, and memory debugging." },
  { href: "/docs/profiles", icon: "📋", titleKey: "doc.profiles", desc: "Build profiles, helix.toml config, custom OS creation, module selection." },
];

export default function Home() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-black text-white selection:bg-helix-purple/40 overflow-hidden">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" aria-hidden="true" />
      <div className="fixed top-[-200px] left-[-200px] w-[600px] h-[600px] bg-helix-blue/15 rounded-full blur-[150px] animate-pulse-slow pointer-events-none" aria-hidden="true" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-helix-purple/15 rounded-full blur-[150px] animate-pulse-slow pointer-events-none" aria-hidden="true" />

      <main className="relative">
        {/* HERO */}
        <section aria-labelledby="hero-heading" className="min-h-screen flex items-center justify-center pt-16">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-helix-purple/10 border border-helix-purple/20 text-helix-purple text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-helix-purple animate-pulse" />
                {t("home.hero.badge")}
              </div>
              <h1 id="hero-heading" className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.1]">
                {t("home.hero.title_1")}
                <br />
                {t("home.hero.title_2")}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-helix-blue via-helix-purple to-helix-accent">{t("home.hero.title_3")}</span>
                <span className="sr-only"> — Helix OS: Modular Rust Kernel with Hot-Reload, Self-Healing &amp; AI</span>
              </h1>
              <p className="text-xl text-zinc-400 max-w-lg leading-relaxed">
                {t("home.hero.subtitle")}{" "}
                <code className="text-helix-blue bg-helix-blue/10 px-1.5 py-0.5 rounded text-sm">#![no_std]</code>
                {t("home.hero.subtitle_2")}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/docs/architecture" className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
                  {t("home.hero.cta")}
                </Link>
                <a href="https://github.com/HelixOS-Org/helix" target="_blank" className="px-8 py-4 bg-zinc-900 border border-zinc-700 text-white font-bold rounded-full hover:bg-zinc-800 transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  {t("home.hero.source")}
                </a>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-800/50">
                <div><div className="text-2xl font-bold text-helix-blue">~6.4K</div><div className="text-xs text-zinc-500 mt-1">{t("home.hero.stat_tcb")}</div></div>
                <div><div className="text-2xl font-bold text-helix-purple">~20</div><div className="text-xs text-zinc-500 mt-1">{t("home.hero.stat_crates")}</div></div>
                <div><div className="text-2xl font-bold text-helix-accent">3</div><div className="text-xs text-zinc-500 mt-1">{t("home.hero.stat_arch")}</div></div>
              </div>
            </div>
            <div className="relative flex items-center justify-center animate-float" aria-hidden="true">
              <div className="absolute inset-0 bg-gradient-to-tr from-helix-blue/20 to-helix-purple/20 blur-[80px] rounded-full" />
              <HelixLogo className="w-full max-w-[500px] drop-shadow-[0_0_60px_rgba(123,104,238,0.25)]" />
            </div>
          </div>
        </section>

        {/* PHILOSOPHY */}
        <section aria-labelledby="philosophy-heading" className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 id="philosophy-heading" className="text-4xl md:text-5xl font-bold mb-6">{t("home.philosophy.title_1")} <span className="text-helix-blue">{t("home.philosophy.not")}</span> {t("home.philosophy.title_2")}</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              {t("home.philosophy.subtitle")} <strong className="text-white">{t("home.philosophy.subtitle_strong")}</strong> {t("home.philosophy.subtitle_2")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard title={t("feat.trait_title")} description={t("feat.trait_desc")} icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>} />
            <FeatureCard title={t("feat.hotreload_title")} description={t("feat.hotreload_desc")} icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} />
            <FeatureCard title={t("feat.selfheal_title")} description={t("feat.selfheal_desc")} icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
            <FeatureCard title={t("feat.baremetal_title")} description={t("feat.baremetal_desc")} icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>} />
            <FeatureCard title={t("feat.capability_title")} description={t("feat.capability_desc")} icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>} />
            <FeatureCard title={t("feat.ai_title")} description={t("feat.ai_desc")} icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
          </div>
        </section>

        {/* EXPLORE */}
        <section aria-labelledby="explore-heading" className="max-w-5xl mx-auto px-6 py-16">
          <h2 id="explore-heading" className="text-3xl font-bold mb-10 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-helix-blue to-helix-purple rounded-full" />
            {t("home.explore")}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {sections.map((s) => (
              <Link key={s.href} href={s.href} className="group p-6 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:border-helix-purple/40 hover:bg-zinc-900/70 transition-all">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-helix-blue transition-colors">{t(s.titleKey)}</h3>
                    <p className="text-sm text-zinc-500 mt-1">{s.desc}</p>
                  </div>
                  <svg className="w-5 h-5 text-zinc-700 group-hover:text-helix-purple ml-auto mt-1 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* INTERACTIVE TOOLS */}
        <section aria-labelledby="tools-heading" className="max-w-5xl mx-auto px-6 py-16">
          <h2 id="tools-heading" className="text-3xl font-bold mb-3 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-helix-purple to-helix-accent rounded-full" />
            {t("home.interactive")}
          </h2>
          <p className="text-zinc-500 text-sm mb-8 ml-5">{t("home.interactive_sub")}</p>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/ask-helix" className="group relative p-6 rounded-xl bg-gradient-to-br from-helix-purple/5 to-transparent border border-zinc-800/60 hover:border-helix-purple/40 hover:bg-zinc-900/70 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-helix-purple/5 rounded-full blur-[40px] pointer-events-none" />
              <div className="relative">
                <span className="text-2xl">✨</span>
                <h3 className="font-bold text-white mt-3 group-hover:text-helix-purple transition-colors">{t("itool.ask_helix")}</h3>
                <p className="text-sm text-zinc-500 mt-1">{t("itool.ask_helix_desc")}</p>
                <span className="inline-flex items-center gap-1 text-xs text-helix-purple mt-3 font-mono group-hover:gap-2 transition-all">{t("itool.ask_helix_cta")} <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></span>
              </div>
            </Link>
            <Link href="/compare" className="group relative p-6 rounded-xl bg-gradient-to-br from-helix-blue/5 to-transparent border border-zinc-800/60 hover:border-helix-blue/40 hover:bg-zinc-900/70 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-helix-blue/5 rounded-full blur-[40px] pointer-events-none" />
              <div className="relative">
                <span className="text-2xl">📊</span>
                <h3 className="font-bold text-white mt-3 group-hover:text-helix-blue transition-colors">{t("itool.compare")}</h3>
                <p className="text-sm text-zinc-500 mt-1">{t("itool.compare_desc")}</p>
                <span className="inline-flex items-center gap-1 text-xs text-helix-blue mt-3 font-mono group-hover:gap-2 transition-all">{t("itool.compare_cta")} <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></span>
              </div>
            </Link>
            <Link href="/boot" className="group relative p-6 rounded-xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-zinc-800/60 hover:border-emerald-500/40 hover:bg-zinc-900/70 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />
              <div className="relative">
                <span className="text-2xl">⚡</span>
                <h3 className="font-bold text-white mt-3 group-hover:text-emerald-400 transition-colors">{t("itool.boot")}</h3>
                <p className="text-sm text-zinc-500 mt-1">{t("itool.boot_desc")}</p>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-3 font-mono group-hover:gap-2 transition-all">{t("itool.boot_cta")} <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></span>
              </div>
            </Link>
            <Link href="/playground" className="group relative p-6 rounded-xl bg-gradient-to-br from-amber-500/5 to-transparent border border-zinc-800/60 hover:border-amber-500/40 hover:bg-zinc-900/70 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none" />
              <div className="relative">
                <span className="text-2xl">🔧</span>
                <h3 className="font-bold text-white mt-3 group-hover:text-amber-400 transition-colors">{t("itool.playground")}</h3>
                <p className="text-sm text-zinc-500 mt-1">{t("itool.playground_desc")}</p>
                <span className="inline-flex items-center gap-1 text-xs text-amber-400 mt-3 font-mono group-hover:gap-2 transition-all">{t("itool.playground_cta")} <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></span>
              </div>
            </Link>
          </div>
        </section>

        {/* TRY IT — ISO Download */}
        <section aria-labelledby="download-heading" className="max-w-5xl mx-auto px-6 py-16">
          <div className="relative rounded-2xl border border-helix-blue/20 bg-gradient-to-br from-helix-blue/5 via-black to-helix-purple/5 overflow-hidden">
            {/* Glow accents */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-helix-blue/10 rounded-full blur-[80px] pointer-events-none" aria-hidden="true" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-helix-purple/10 rounded-full blur-[80px] pointer-events-none" aria-hidden="true" />

            <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              {/* Left: Info */}
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-helix-blue/10 border border-helix-blue/20 text-helix-blue text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Bootable ISO · x86_64 · BIOS + UEFI
                </div>
                <h2 id="download-heading" className="text-3xl md:text-4xl font-bold">
                  {t("home.try_it")}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-helix-blue to-helix-purple">{t("home.try_it_now")}</span>
                </h2>
                <p className="text-zinc-400 leading-relaxed max-w-lg">
                  {t("home.try_desc")} <strong className="text-white">{t("home.try_profile")}</strong> {t("home.try_desc_2")}
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
                  {t("home.details")}
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
