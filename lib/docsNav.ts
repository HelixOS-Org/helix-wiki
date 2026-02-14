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
];
