"use client";

import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import FileTree from "@/helix-wiki/components/diagrams/FileTree";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import gettingStartedContent from "@/helix-wiki/lib/docs-i18n/getting-started";

export default function GettingStartedPage() {
  const { locale } = useI18n();
  const d = (key: string) => getDocString(gettingStartedContent, locale, key);

  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader
        title={d("header.title")}
        subtitle={d("header.subtitle")}
        badge={d("header.badge")}
      />

      {/* ── PREREQUISITES ── */}
      <Section title={d("section.prereq")} id="prerequisites">
        <p>{d("prereq.intro")}</p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">{d("prereq.hw.title")}</h3>
        <InfoTable
          columns={[
            { header: d("prereq.hw.component"), key: "component" },
            { header: d("prereq.hw.minimum"), key: "min" },
            { header: d("prereq.hw.recommended"), key: "rec" },
          ]}
          rows={[
            { component: <strong className="text-white">{d("prereq.hw.cpu")}</strong>, min: d("prereq.hw.cpu_min"), rec: d("prereq.hw.cpu_rec") },
            { component: <strong className="text-white">{d("prereq.hw.ram")}</strong>, min: d("prereq.hw.ram_min"), rec: d("prereq.hw.ram_rec") },
            { component: <strong className="text-white">{d("prereq.hw.disk")}</strong>, min: d("prereq.hw.disk_min"), rec: d("prereq.hw.disk_rec") },
            { component: <strong className="text-white">{d("prereq.hw.os")}</strong>, min: d("prereq.hw.os_min"), rec: d("prereq.hw.os_rec") },
          ]}
        />

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">{d("prereq.sw.title")}</h3>
        <InfoTable
          columns={[
            { header: d("prereq.sw.software"), key: "sw" },
            { header: d("prereq.sw.version"), key: "ver" },
            { header: d("prereq.sw.purpose"), key: "purpose" },
          ]}
          rows={[
            { sw: <span className="text-helix-blue font-mono">rustc</span>, ver: d("prereq.sw.rustc_ver"), purpose: d("prereq.sw.rustc_purpose") },
            { sw: <span className="text-helix-blue font-mono">qemu</span>, ver: d("prereq.sw.qemu_ver"), purpose: d("prereq.sw.qemu_purpose") },
            { sw: <span className="text-helix-blue font-mono">make</span>, ver: d("prereq.sw.make_ver"), purpose: d("prereq.sw.make_purpose") },
            { sw: <span className="text-helix-blue font-mono">git</span>, ver: d("prereq.sw.git_ver"), purpose: d("prereq.sw.git_purpose") },
            { sw: <span className="text-helix-blue font-mono">xorriso</span>, ver: d("prereq.sw.xorriso_ver"), purpose: d("prereq.sw.xorriso_purpose") },
          ]}
        />

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">{d("prereq.verify.title")}</h3>
        <RustCode filename="terminal" language="bash">{`# Check Rust
rustc --version        # Expected: rustc 1.XX.X-nightly (...)

# Check QEMU
qemu-system-x86_64 --version

# Check Make & Git
make --version && git --version

# Check xorriso (for ISO creation)
xorriso --version 2>&1 | head -1`}</RustCode>
      </Section>

      {/* ── INSTALLATION ── */}
      <Section title={d("section.install")} id="installation">
        <h3 className="text-xl font-semibold text-white mb-4">{d("install.rust.title")}</h3>
        <p>{d("install.rust.intro")}</p>
        <RustCode filename="terminal" language="bash">{`# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Reload shell
source ~/.bashrc   # or ~/.zshrc

# Verify
rustc --version && cargo --version`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">{d("install.deps.title")}</h3>
        <RustCode filename="terminal — Debian/Ubuntu" language="bash">{`sudo apt install qemu-system-x86 lld make git xorriso grub-pc-bin grub-common`}</RustCode>
        <RustCode filename="terminal — Fedora" language="bash">{`sudo dnf install qemu-system-x86 lld make git xorriso grub2-tools`}</RustCode>
        <RustCode filename="terminal — Arch" language="bash">{`sudo pacman -S qemu-full lld make git libisoburn grub`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">{d("install.clone.title")}</h3>
        <RustCode filename="terminal" language="bash">{`git clone https://github.com/HelixOS-Org/helix.git
cd helix

# The correct Rust nightly installs automatically via rust-toolchain.toml
rustc --version   # should show the pinned nightly`}</RustCode>
      </Section>

      {/* ── BUILD ── */}
      <Section title={d("build.ref.title").includes("Build") ? "Building Helix" : d("build.ref.title")} id="build">
        <p>{d("build.intro")}</p>

        <RustCode filename="terminal" language="bash">{`# Standard release build
./scripts/build.sh

# Debug build (with symbols, slower)
./scripts/build.sh --debug

# Create bootable ISO
./scripts/build.sh --iso`}</RustCode>

        <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5 mt-6">
          <h4 className="text-white font-semibold mb-2">{d("build.info.title")}</h4>
          <ol className="text-sm text-zinc-400 space-y-2 list-decimal list-inside">
            <li>{d("build.info.step1")}</li>
            <li>{d("build.info.step2")}</li>
            <li>{d("build.info.step3")}</li>
            <li>{d("build.info.step4")}</li>
          </ol>
        </div>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">{d("build.ref.title")}</h3>
        <InfoTable
          columns={[
            { header: d("build.ref.command"), key: "cmd" },
            { header: d("build.ref.description"), key: "desc" },
          ]}
          rows={[
            { cmd: <code className="text-helix-blue">./scripts/build.sh</code>, desc: d("build.ref.release") },
            { cmd: <code className="text-helix-blue">./scripts/build.sh --debug</code>, desc: d("build.ref.debug") },
            { cmd: <code className="text-helix-blue">./scripts/build.sh --iso</code>, desc: d("build.ref.iso") },
            { cmd: <code className="text-helix-blue">cargo fmt --all</code>, desc: d("build.ref.fmt") },
            { cmd: <code className="text-helix-blue">cargo clippy --all-targets</code>, desc: d("build.ref.clippy") },
            { cmd: <code className="text-helix-blue">cargo test --target x86_64-unknown-linux-gnu</code>, desc: d("build.ref.test") },
            { cmd: <code className="text-helix-blue">cargo doc --no-deps --document-private-items</code>, desc: d("build.ref.doc") },
          ]}
        />
      </Section>

      {/* ── RUN QEMU ── */}
      <Section title={d("section.qemu")} id="qemu">
        <p>{d("qemu.intro")}</p>
        <RustCode filename="terminal" language="bash">{`# Boot with Limine (default)
./scripts/run_qemu.sh

# Or manually with QEMU
qemu-system-x86_64 \\
  -cdrom build/output/helix.iso \\
  -m 128M \\
  -serial stdio \\
  -no-reboot \\
  -no-shutdown`}</RustCode>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">{d("qemu.serial.title")}</h4>
            <p className="text-sm text-zinc-400">{d("qemu.serial.desc")}</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">{d("qemu.fb.title")}</h4>
            <p className="text-sm text-zinc-400">{d("qemu.fb.desc")}</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">{d("qemu.flags.title")}</h3>
        <InfoTable
          columns={[
            { header: d("qemu.flags.flag"), key: "flag" },
            { header: d("qemu.flags.purpose"), key: "purpose" },
          ]}
          rows={[
            { flag: <code className="text-helix-blue">-m 128M</code>, purpose: d("qemu.flags.m") },
            { flag: <code className="text-helix-blue">-serial stdio</code>, purpose: d("qemu.flags.serial") },
            { flag: <code className="text-helix-blue">-no-reboot</code>, purpose: d("qemu.flags.noreboot") },
            { flag: <code className="text-helix-blue">-no-shutdown</code>, purpose: d("qemu.flags.noshutdown") },
            { flag: <code className="text-helix-blue">-d int,cpu_reset</code>, purpose: d("qemu.flags.dint") },
            { flag: <code className="text-helix-blue">-s -S</code>, purpose: d("qemu.flags.gdb") },
            { flag: <code className="text-helix-blue">-smp 4</code>, purpose: d("qemu.flags.smp") },
            { flag: <code className="text-helix-blue">-enable-kvm</code>, purpose: d("qemu.flags.kvm") },
          ]}
        />
      </Section>

      {/* ── FIRST MODIFICATION ── */}
      <Section title={d("section.firstmod")} id="first-mod">
        <p>{d("firstmod.intro")}</p>

        <RustCode filename="core/src/lib.rs">{`// Find the kernel initialization function and add a message:
use crate::debug::serial_println;

pub fn kernel_main() {
    serial_println!("=== Helix OS v0.4.0 Aurora ===");
    serial_println!("Hello from my modified kernel!");
    
    // ... rest of initialization
}`}</RustCode>

        <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5 mt-6">
          <h4 className="text-white font-semibold mb-2">{d("firstmod.workflow.title")}</h4>
          <ol className="text-sm text-zinc-400 space-y-2 list-decimal list-inside">
            <li>{d("firstmod.workflow.step1")}</li>
            <li>{d("firstmod.workflow.step2")}</li>
            <li>{d("firstmod.workflow.step3")}</li>
            <li>{d("firstmod.workflow.step4")}</li>
            <li>{d("firstmod.workflow.step5")}</li>
            <li>{d("firstmod.workflow.step6")}</li>
          </ol>
        </div>
      </Section>

      {/* ── PROJECT STRUCTURE ── */}
      <Section title={d("section.structure")} id="structure">
        <p>{d("structure.intro")}</p>
        <FileTree title="helix/ — Project Structure" tree={[
          { name: "helix", icon: "folder",
            info: { description: "Helix OS monorepo — Cargo workspace containing kernel, subsystems, modules, drivers, filesystem, and graphics stack.", status: "stable" },
            children: [
              { name: "boot", icon: "folder", detail: "Boot protocol adapters",
                info: { description: "Multi-protocol boot support — Limine (primary), Multiboot2 (legacy), and UEFI direct boot adapters.", status: "stable" },
                children: [
                  { name: "limine", icon: "folder", detail: "Limine protocol (primary)", info: { description: "Primary boot protocol adapter using the Limine boot protocol.", status: "stable" } },
                  { name: "multiboot2", icon: "folder", detail: "Multiboot2 (legacy)", info: { description: "Legacy Multiboot2 boot protocol adapter.", status: "stable" } },
                  { name: "uefi", icon: "folder", detail: "UEFI direct boot", info: { description: "UEFI Boot Services direct boot adapter.", status: "stable" } },
                ] },
              { name: "hal", icon: "folder", detail: "Hardware Abstraction Layer",
                info: { loc: 61000, description: "Multi-architecture HAL — x86_64 (30K), AArch64 (18K), RISC-V 64 (13K). Abstracts CPU, MMU, interrupts, firmware, and KASLR.", status: "stable" },
                children: [
                  { name: "src/arch", icon: "folder", detail: "x86_64, aarch64, riscv64", info: { description: "Architecture-specific implementations behind unified HAL traits." } },
                ] },
              { name: "core", icon: "folder", detail: "Trusted Computing Base (~6.4K LoC)",
                info: { loc: 6400, description: "Minimal kernel core — orchestrator, IPC, syscalls, self-heal. Only mechanism, never policy.", status: "stable" },
                children: [
                  { name: "src", icon: "folder", detail: "Orchestrator, IPC, syscalls, self-heal", info: { description: "Core kernel source — orchestrator, IPC channels/event bus, syscall dispatch, self-healing manager, and hot-reload." } },
                ] },
              { name: "subsystems", icon: "folder", detail: "Kernel services",
                info: { loc: 200000, description: "Six subsystems providing core OS services: memory, execution, DIS scheduling, NEXUS AI, init, userspace, and relocation.", status: "stable" },
                children: [
                  { name: "memory", icon: "folder", detail: "Physical/virtual allocators", info: { description: "Physical frame allocator, virtual memory manager, demand paging, and slab allocator.", status: "stable" } },
                  { name: "execution", icon: "folder", detail: "Threads, processes, scheduler", info: { description: "Process and thread management, context switching, and scheduling infrastructure.", status: "stable" } },
                  { name: "dis", icon: "folder", detail: "Dynamic Intent Scheduling (~11K LoC)", info: { loc: 11000, description: "Intent-based CPU scheduler — processes declare scheduling intents instead of priorities.", status: "stable" } },
                  { name: "nexus", icon: "folder", detail: "AI/ML intelligence (~812K LoC)", info: { loc: 812000, description: "Kernel AI/ML engine — decision trees, neural networks, anomaly detection, all in no_std Rust.", status: "wip" } },
                  { name: "init", icon: "folder", detail: "Boot initialization (~17K LoC)", info: { loc: 17000, description: "Ordered device initialization with dependency resolution and rollback.", status: "stable" } },
                  { name: "userspace", icon: "folder", detail: "Userspace bridge (~3.4K LoC)", info: { loc: 3400, description: "Ring-3 transition, user page tables, and initial process setup.", status: "stable" } },
                  { name: "relocation", icon: "folder", detail: "KASLR & ELF relocation", info: { description: "Kernel Address Space Layout Randomization and ELF binary relocation.", status: "stable" } },
                ] },
              { name: "modules", icon: "folder", detail: "Module system framework",
                info: { loc: 2560, description: "Hot-swappable module framework — ModuleTrait, lifecycle state machine, registry.", status: "stable" } },
              { name: "modules_impl", icon: "folder", detail: "Concrete module implementations",
                info: { description: "Concrete implementations of kernel modules — schedulers, drivers, filesystem policies.", status: "stable" },
                children: [
                  { name: "schedulers/round_robin", icon: "folder", detail: "Round-robin scheduler module", info: { description: "Reference round-robin scheduler implementation." } },
                ] },
              { name: "fs", icon: "folder", detail: "HelixFS filesystem (~42K LoC)",
                info: { loc: 42000, description: "Custom filesystem — B+Tree indexing, copy-on-write snapshots, ACID transactions, zero external dependencies.", status: "wip" } },
              { name: "graphics", icon: "folder", detail: "Lumina GPU stack (~197K LoC)",
                info: { loc: 197000, description: "Complete GPU graphics stack — 14 sub-crates covering math, shaders, rendering, materials, and GPU abstraction.", status: "wip" } },
              { name: "drivers", icon: "folder", detail: "Device drivers",
                info: { loc: 17000, description: "Kernel device drivers — currently the Magma GPU driver.", status: "wip" },
                children: [
                  { name: "gpu/magma", icon: "folder", detail: "Magma GPU driver (~17K LoC)", info: { loc: 17000, description: "Ring buffer command submission, MMIO register access, and IRQ handling for direct GPU communication.", status: "wip" } },
                ] },
              { name: "profiles", icon: "folder", detail: "OS build profiles",
                info: { description: "Bootable image profiles combining kernel, modules, and configuration into deployable images.", status: "stable" },
                children: [
                  { name: "minimal", icon: "folder", detail: "Minimal kernel profile", info: { description: "Stripped-down profile for testing and CI." } },
                  { name: "common", icon: "folder", detail: "Shared linker scripts", info: { description: "Common linker scripts and build configuration shared across profiles." } },
                ] },
              { name: "benchmarks", icon: "folder", detail: "Performance benchmarks",
                info: { loc: 6300, description: "Kernel benchmark suite — scheduler, memory, IPC, and IRQ benchmarks with statistical analysis.", status: "stable" } },
              { name: "scripts", icon: "folder", detail: "Build & run scripts",
                info: { description: "Shell scripts for building, running QEMU, creating ISOs, and running tests." } },
            ] },
        ]} />

        <div className="bg-gradient-to-r from-helix-blue/10 to-helix-purple/10 border border-helix-blue/20 rounded-xl p-5 mt-6">
          <h4 className="text-white font-semibold mb-2">{d("structure.next.title")}</h4>
          <p className="text-sm text-zinc-400">{d("structure.next.intro")}</p>
          <ul className="text-sm text-zinc-400 space-y-1.5 mt-3 list-disc list-inside">
            <li>{d("structure.next.arch")}</li>
            <li>{d("structure.next.core")}</li>
            <li>{d("structure.next.modules")}</li>
            <li>{d("structure.next.debugging")}</li>
            <li>{d("structure.next.contributing")}</li>
          </ul>
        </div>
      </Section>

    </div>
  );
}
