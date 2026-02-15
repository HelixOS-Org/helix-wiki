/* ──────────────── Navigation Tree Data ──────────────── */
/* This file has NO "use client" — safe to import in Server Components */

export interface DocSection {
  id: string;
  title: string;
}

export interface DocPage {
  href: string;
  title: string;
  icon: string;
  sections: DocSection[];
}

export interface DocGroup {
  label: string;
  pages: DocPage[];
}

export const docsNav: DocGroup[] = [
  {
    label: "Getting Started",
    pages: [
      {
        href: "/docs/getting-started",
        title: "Quick Start",
        icon: "🚀",
        sections: [
          { id: "prerequisites", title: "Prerequisites" },
          { id: "installation", title: "Installation" },
          { id: "build", title: "Building the Kernel" },
          { id: "qemu", title: "Running in QEMU" },
          { id: "first-mod", title: "First Modification" },
          { id: "structure", title: "Project Structure" },
        ],
      },
    ],
  },
  {
    label: "Overview",
    pages: [
      {
        href: "/docs/architecture",
        title: "Architecture",
        icon: "🏗️",
        sections: [
          { id: "layers", title: "Layer Stack" },
          { id: "workspace", title: "Workspace Structure" },
          { id: "deps", title: "Crate Dependency Graph" },
          { id: "metrics", title: "Project Metrics" },
          { id: "profiles", title: "Build Profiles" },
          { id: "toolchain", title: "Toolchain" },
          { id: "linker", title: "Linker Scripts" },
          { id: "boot", title: "Boot Sequence" },
          { id: "commands", title: "Build Commands" },
        ],
      },
      {
        href: "/docs/architectures",
        title: "CPU Architectures",
        icon: "🖥️",
        sections: [
          { id: "comparison", title: "Architecture Comparison" },
          { id: "x86_64", title: "x86_64" },
          { id: "aarch64", title: "AArch64" },
          { id: "riscv", title: "RISC-V 64" },
          { id: "hal-trait", title: "HAL Trait Unification" },
        ],
      },
    ],
  },
  {
    label: "Kernel",
    pages: [
      {
        href: "/docs/core",
        title: "Core Kernel",
        icon: "⚙️",
        sections: [
          { id: "map", title: "Module Map" },
          { id: "types", title: "Kernel Types" },
          { id: "component", title: "KernelComponent Trait" },
          { id: "orchestrator", title: "Orchestrator" },
          { id: "syscalls", title: "Syscall Framework" },
          { id: "ipc", title: "IPC" },
          { id: "selfheal", title: "Self-Heal" },
          { id: "hotreload", title: "Hot-Reload" },
          { id: "interrupts", title: "Interrupts" },
          { id: "debug", title: "Debug Console" },
          { id: "panic", title: "Panic Handler" },
        ],
      },
      {
        href: "/docs/hal",
        title: "HAL",
        icon: "🔧",
        sections: [
          { id: "hal-trait", title: "Core HAL Trait" },
          { id: "cpu", title: "CPU Abstraction" },
          { id: "mmu", title: "MMU & Page Table" },
          { id: "interrupts", title: "Interrupt Controller" },
          { id: "firmware", title: "Firmware Interface" },
          { id: "kaslr", title: "KASLR" },
          { id: "relocation", title: "ELF Relocation" },
          { id: "backends", title: "Architecture Backends" },
        ],
      },
    ],
  },
  {
    label: "Subsystems",
    pages: [
      {
        href: "/docs/subsystems",
        title: "Subsystems",
        icon: "🧩",
        sections: [
          { id: "memory", title: "Memory Subsystem" },
          { id: "execution", title: "Execution" },
          { id: "dis", title: "DIS Scheduler" },
          { id: "init", title: "Init Subsystem" },
          { id: "relocation", title: "Relocation" },
          { id: "userspace", title: "Userspace" },
          { id: "earlyboot", title: "Early Boot" },
        ],
      },
      {
        href: "/docs/modules",
        title: "Module System",
        icon: "🔌",
        sections: [
          { id: "philosophy", title: "Philosophy" },
          { id: "types", title: "Module Types" },
          { id: "metadata", title: "Module Metadata" },
          { id: "trait", title: "Module Trait" },
          { id: "registry", title: "Module Registry" },
          { id: "macro", title: "define_module! Macro" },
          { id: "lifecycle", title: "Module Lifecycle" },
          { id: "example", title: "Example: Scheduler" },
        ],
      },
    ],
  },
  {
    label: "Storage",
    pages: [
      {
        href: "/docs/filesystem",
        title: "HelixFS",
        icon: "💾",
        sections: [
          { id: "constants", title: "Constants & Architecture" },
          { id: "layout", title: "On-Disk Layout" },
          { id: "inodes", title: "Inode Structure" },
          { id: "posix", title: "POSIX File API" },
          { id: "cow", title: "Copy-on-Write" },
          { id: "journal", title: "Journal" },
          { id: "btree", title: "B+Tree Index" },
          { id: "arc", title: "ARC Cache" },
          { id: "features", title: "Feature Summary" },
        ],
      },
    ],
  },
  {
    label: "Intelligence",
    pages: [
      {
        href: "/docs/nexus",
        title: "NEXUS",
        icon: "🧠",
        sections: [
          { id: "overview", title: "Architecture Overview" },
          { id: "modules", title: "Module Inventory" },
          { id: "ml", title: "ML Framework" },
          { id: "prediction", title: "Crash Prediction" },
          { id: "anomaly", title: "Anomaly Detection" },
          { id: "quarantine", title: "Quarantine System" },
          { id: "roadmap", title: "Development Roadmap" },
          { id: "scale", title: "Subsystem Scale" },
        ],
      },
    ],
  },
  {
    label: "Graphics",
    pages: [
      {
        href: "/docs/lumina",
        title: "Lumina",
        icon: "🎨",
        sections: [
          { id: "overview", title: "Architecture Overview" },
          { id: "crates", title: "Sub-Crate Inventory" },
          { id: "handles", title: "Handle System" },
          { id: "math", title: "Math Library" },
          { id: "pipeline", title: "Render Pipeline" },
          { id: "rendergraph", title: "Render Graph" },
          { id: "shaders", title: "Shader Compilation" },
          { id: "magma", title: "Magma GPU Driver" },
          { id: "sync", title: "GPU Synchronization" },
          { id: "scale", title: "Codebase Scale" },
        ],
      },
    ],
  },
  {
    label: "Drivers & Performance",
    pages: [
      {
        href: "/docs/drivers",
        title: "Device Drivers",
        icon: "🔌",
        sections: [
          { id: "overview", title: "Driver Architecture" },
          { id: "magma", title: "Magma GPU Driver" },
          { id: "planned", title: "Planned Drivers" },
          { id: "writing", title: "Writing a Driver" },
        ],
      },
      {
        href: "/docs/benchmarks",
        title: "Benchmarks",
        icon: "📊",
        sections: [
          { id: "architecture", title: "Suite Architecture" },
          { id: "config", title: "Configuration" },
          { id: "scheduler", title: "Scheduler Benchmarks" },
          { id: "memory", title: "Memory Benchmarks" },
          { id: "statistics", title: "Statistical Analysis" },
          { id: "running", title: "Running Benchmarks" },
        ],
      },
    ],
  },
  {
    label: "Development",
    pages: [
      {
        href: "/docs/debugging",
        title: "Debugging",
        icon: "🐛",
        sections: [
          { id: "overview", title: "Debug Architecture" },
          { id: "build", title: "Debug Build" },
          { id: "serial", title: "Serial Console" },
          { id: "qemu", title: "QEMU Debugging" },
          { id: "gdb", title: "GDB Integration" },
          { id: "crash", title: "Crash Analysis" },
          { id: "memory", title: "Memory Debugging" },
          { id: "tools", title: "Debug Tools" },
        ],
      },
      {
        href: "/docs/profiles",
        title: "OS Builder Profiles",
        icon: "📦",
        sections: [
          { id: "overview", title: "Overview" },
          { id: "profiles", title: "Available Profiles" },
          { id: "config", title: "helix.toml Reference" },
          { id: "create", title: "Creating a Profile" },
          { id: "modules", title: "Module Selection" },
          { id: "linker", title: "Linker Scripts" },
        ],
      },
    ],
  },
];
