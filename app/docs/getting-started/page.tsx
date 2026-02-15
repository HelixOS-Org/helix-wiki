"use client";

import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import Footer from "@/helix-wiki/components/Footer";
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
      <Section title="Prerequisites" id="prerequisites">
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
      <Section title="Installation" id="installation">
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
      <Section title="QEMU" id="qemu">
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
      <Section title="Your First Modification" id="first-mod">
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
      <Section title="Project Structure" id="structure">
        <p>{d("structure.intro")}</p>
        <RustCode filename="helix/" language="text">{`helix/
├── boot/                     # Boot protocol adapters
│   ├── limine/               #   Limine protocol (primary)
│   ├── multiboot2/           #   Multiboot2 (legacy)
│   └── uefi/                 #   UEFI direct boot
├── hal/                      # Hardware Abstraction Layer
│   └── src/arch/             #   x86_64, aarch64, riscv64
├── core/                     # Trusted Computing Base (~6.4K LoC)
│   └── src/                  #   Orchestrator, IPC, syscalls, self-heal
├── subsystems/               # Kernel services
│   ├── memory/               #   Physical/virtual allocators
│   ├── execution/            #   Threads, processes, scheduler
│   ├── dis/                  #   Dynamic Intent Scheduling (~11K LoC)
│   ├── nexus/                #   AI/ML intelligence (~812K LoC)
│   ├── init/                 #   Boot initialization (~17K LoC)
│   ├── userspace/            #   Userspace bridge (~3.4K LoC)
│   └── relocation/           #   KASLR & ELF relocation
├── modules/                  # Module system framework
├── modules_impl/             # Concrete module implementations
│   └── schedulers/round_robin/
├── fs/                       # HelixFS filesystem (~42K LoC)
├── graphics/                 # Lumina GPU stack (~197K LoC)
├── drivers/                  # Device drivers
│   └── gpu/magma/            #   Magma GPU driver (~17K LoC)
├── profiles/                 # OS build profiles
│   ├── minimal/              #   Minimal kernel profile
│   └── common/               #   Shared linker scripts
├── benchmarks/               # Performance benchmarks
└── scripts/                  # Build & run scripts`}</RustCode>

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

      <Footer />
    </div>
  );
}
