"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import HelixLogo from "@/helix-wiki/components/HelixLogo";
import Link from "next/link";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import bootContent from "@/helix-wiki/lib/docs-i18n/boot";

/* ═══════════════════════════════════════════════════════════════════════════════
   BOOT DATA — Complete Helix OS boot sequence with realistic kernel logs,
   memory maps, CPU state, hardware discovery, DAG services.
   ═══════════════════════════════════════════════════════════════════════════════ */
interface BootLine { text: string; color?: string; delay: number; icon?: string; type?: "info" | "ok" | "warn" | "error" | "header" | "progress"; }
interface BootPhase {
  id: string; title: string; subtitle: string; color: string; sc: string; icon: string; duration: number;
  lines: BootLine[];
  services: { name: string; deps: string[]; essential: boolean }[];
  hwDiscoveries?: { name: string; type: string; addr: string; detail: string }[];
  memoryEvents?: { action: "alloc" | "map" | "free" | "reserve"; addr: string; size: string; label: string }[];
  cpuState?: Record<string, string>;
  metrics?: { label: string; value: string; unit: string }[];
}

const PHASES: BootPhase[] = [
  {
    id: "firmware", title: "BIOS / UEFI", subtitle: "Firmware Initialization", color: "#A1A1AA", sc: "161,161,170", icon: "⚡", duration: 3200,
    services: [
      { name: "POST", deps: [], essential: true },
      { name: "PCI Scan", deps: ["POST"], essential: true },
      { name: "Memory Test", deps: ["POST"], essential: true },
      { name: "USB Enum", deps: ["PCI Scan"], essential: false },
      { name: "Boot Select", deps: ["PCI Scan", "Memory Test"], essential: true },
    ],
    hwDiscoveries: [
      { name: "QEMU CPU", type: "CPU", addr: "LAPIC 0xFEE00000", detail: "Virtual CPU @ 2.00GHz, 1 core" },
      { name: "RAM DIMM", type: "Memory", addr: "0x00000000", detail: "128 MB DDR4 (QEMU)" },
      { name: "ISA Bridge", type: "Bridge", addr: "PCI 0:1.0", detail: "PIIX3/PIIX4" },
      { name: "VGA Display", type: "GPU", addr: "PCI 0:2.0", detail: "bochs-display 1024×768" },
    ],
    cpuState: { RAX: "0x0000000000000000", RBX: "0x0000000000000000", RCX: "0x0000000000000000", RDX: "0x0000000000000663", RSP: "0x00007C00", RBP: "0x0000000000000000", RIP: "0x00007C00", RFLAGS: "0x0000000000000202", CR0: "0x0000000000000010", CR3: "0x0000000000000000", CR4: "0x0000000000000000", CS: "0x0000", DS: "0x0000" },
    metrics: [{ label: "POST Time", value: "340", unit: "ms" }, { label: "Devices", value: "4", unit: "" }, { label: "RAM", value: "128", unit: "MB" }],
    lines: [
      { text: "American Megatrends BIOS v2.20.1271", color: "#A1A1AA", delay: 0, type: "header" },
      { text: "Copyright (C) 2026 QEMU Virtual Platform", color: "#71717A", delay: 200 },
      { text: "", delay: 300 },
      { text: "POST: CPU . . . . . . . . . . . . . . OK", color: "#22C55E", delay: 400, type: "ok" },
      { text: "POST: Memory test 128 MB . . . . . . . OK", color: "#22C55E", delay: 700, type: "ok" },
      { text: "POST: PCI bus 0 scan . . . . . . . . . OK", color: "#22C55E", delay: 1000, type: "ok" },
      { text: "  Bus 0, Device 0: Host bridge [QEMU]", color: "#71717A", delay: 1100 },
      { text: "  Bus 0, Device 1: ISA bridge [PIIX3]", color: "#71717A", delay: 1200 },
      { text: "  Bus 0, Device 2: VGA controller [bochs-display]", color: "#71717A", delay: 1300 },
      { text: "USB: No devices found", color: "#71717A", delay: 1600 },
      { text: "Boot order: CD-ROM, Hard Disk, Network", color: "#A1A1AA", delay: 2000 },
      { text: "Booting from CD-ROM...", color: "#22C55E", delay: 2600, type: "ok" },
    ],
  },
  {
    id: "grub", title: "GRUB Multiboot2", subtitle: "Bootloader Stage", color: "#F59E0B", sc: "245,158,11", icon: "📀", duration: 2800,
    services: [
      { name: "GRUB Core", deps: [], essential: true },
      { name: "Config Parse", deps: ["GRUB Core"], essential: true },
      { name: "Kernel Load", deps: ["Config Parse"], essential: true },
      { name: "MB2 Header", deps: ["Kernel Load"], essential: true },
      { name: "Handoff", deps: ["MB2 Header"], essential: true },
    ],
    cpuState: { RAX: "0x2BADB002", RBX: "0x00010000", RCX: "0x0000000000000000", RDX: "0x0000000000000000", RSP: "0x0007FF00", RBP: "0x0007FF00", RIP: "0x00100000", RFLAGS: "0x0000000000000002", CR0: "0x0000000060000011", CR3: "0x0000000000001000", CR4: "0x00000000000000A0", CS: "0x0008", DS: "0x0010" },
    metrics: [{ label: "Kernel Size", value: "406", unit: "KB" }, { label: "Load Time", value: "12", unit: "ms" }, { label: "MB2 Tags", value: "8", unit: "" }],
    memoryEvents: [
      { action: "alloc", addr: "0x00100000", size: "406 KB", label: "Kernel image" },
      { action: "reserve", addr: "0x00010000", size: "4 KB", label: "Multiboot2 info struct" },
    ],
    lines: [
      { text: "GRUB loading...", color: "#F59E0B", delay: 0, type: "header" },
      { text: "                    GNU GRUB  version 2.06", color: "#FFFFFF", delay: 300 },
      { text: "", delay: 400 },
      { text: " ┌────────────────────────────────────────────────┐", color: "#F59E0B", delay: 500 },
      { text: " │  ► Helix OS v0.4.0 \"Aurora\"                    │", color: "#FFFFFF", delay: 600 },
      { text: " │    Helix OS (Debug Mode)                       │", color: "#71717A", delay: 700 },
      { text: " │    Helix OS (Recovery)                         │", color: "#71717A", delay: 800 },
      { text: " └────────────────────────────────────────────────┘", color: "#F59E0B", delay: 900 },
      { text: "", delay: 1000 },
      { text: "Loading kernel: /boot/helix-kernel ... 406 KB", color: "#22C55E", delay: 1100, type: "progress" },
      { text: "Multiboot2 header found at offset 0x1000", color: "#4A90E2", delay: 1500 },
      { text: "MB2 tags: memmap, fb, rsdp, smbios, elf, cmdline, loader, end", color: "#71717A", delay: 1800 },
      { text: "Passing memory map, framebuffer, RSDP to kernel", color: "#4A90E2", delay: 2100 },
      { text: "Jumping to kernel entry 0xFFFF800000100000", color: "#7B68EE", delay: 2500, type: "ok" },
    ],
  },
  {
    id: "boot", title: "Early Kernel Init", subtitle: "Phase 0-1: Boot + Early", color: "#4A90E2", sc: "74,144,226", icon: "🔧", duration: 3600,
    services: [
      { name: "Serial Console", deps: [], essential: true },
      { name: "Memory Map Parse", deps: ["Serial Console"], essential: true },
      { name: "Frame Allocator", deps: ["Memory Map Parse"], essential: true },
      { name: "HHDM Setup", deps: ["Frame Allocator"], essential: true },
      { name: "Page Tables", deps: ["HHDM Setup", "Frame Allocator"], essential: true },
      { name: "GDT", deps: [], essential: true },
      { name: "IDT", deps: ["GDT"], essential: true },
      { name: "Exception Handlers", deps: ["IDT"], essential: true },
      { name: "APIC Init", deps: ["IDT", "Page Tables"], essential: true },
    ],
    hwDiscoveries: [
      { name: "COM1 Serial", type: "Serial", addr: "0x3F8", detail: "115200 baud, 8N1" },
      { name: "Local APIC", type: "Interrupt", addr: "0xFEE00000", detail: "xAPIC mode" },
      { name: "I/O APIC", type: "Interrupt", addr: "0xFEC00000", detail: "24 IRQ lines, GSI 0" },
    ],
    memoryEvents: [
      { action: "map", addr: "0xFFFF800000000000", size: "128 MB", label: "HHDM (Higher-Half Direct Map)" },
      { action: "alloc", addr: "0xFFFF800000001000", size: "4 KB", label: "PML4 table" },
      { action: "map", addr: "0xFFFF800000000000..0x08000000", size: "128 MB", label: "Kernel address space" },
      { action: "reserve", addr: "0xFEE00000", size: "4 KB", label: "Local APIC MMIO" },
      { action: "reserve", addr: "0xFEC00000", size: "4 KB", label: "I/O APIC MMIO" },
    ],
    cpuState: { RAX: "0xFFFF800000100000", RBX: "0x0000000000010000", RCX: "0x0000000000000000", RDX: "0x0000000000000000", RSP: "0xFFFF800000200000", RBP: "0xFFFF800000200000", RIP: "0xFFFF800000100000", RFLAGS: "0x0000000000000202", CR0: "0x0000000080050033", CR3: "0xFFFF800000001000", CR4: "0x00000000000206A0", CS: "0x0008", DS: "0x0010" },
    metrics: [{ label: "Physical RAM", value: "128", unit: "MB" }, { label: "Usable", value: "124", unit: "MB" }, { label: "Frames", value: "31744", unit: "" }, { label: "IDT Entries", value: "256", unit: "" }],
    lines: [
      { text: "[  0.000000] helix: Kernel entry point reached", color: "#4A90E2", delay: 0, type: "header" },
      { text: "[  0.000001] helix: HelixOS v0.4.0-aurora (x86_64)", color: "#FFFFFF", delay: 80 },
      { text: "[  0.000002] helix: Built with rustc 1.82.0-nightly", color: "#71717A", delay: 160 },
      { text: "[  0.000010] serial: COM1 initialized at 0x3F8 (115200,8N1)", color: "#22C55E", delay: 300, type: "ok" },
      { text: "[  0.000011] serial: Debug output active on COM1", color: "#22C55E", delay: 400 },
      { text: "[  0.000100] memory: Parsing Multiboot2 memory map...", color: "#4A90E2", delay: 600, type: "progress" },
      { text: "[  0.000110] memory: Region 0x00000000..0x0009FBFF (639 KB) — Usable", color: "#71717A", delay: 700 },
      { text: "[  0.000111] memory: Region 0x00100000..0x07FDFFFF (126 MB) — Usable", color: "#71717A", delay: 750 },
      { text: "[  0.000112] memory: Region 0x07FE0000..0x07FFFFFF (128 KB) — Reserved", color: "#F59E0B", delay: 800 },
      { text: "[  0.000150] memory: Physical: 128 MB total, 124 MB usable", color: "#22C55E", delay: 1000, type: "ok" },
      { text: "[  0.000200] memory: Frame allocator: 31744 frames × 4 KiB", color: "#4A90E2", delay: 1200 },
      { text: "[  0.000300] hhdm: Base address 0xFFFF800000000000", color: "#4A90E2", delay: 1400 },
      { text: "[  0.000500] paging: PML4 table at 0xFFFF800000001000", color: "#4A90E2", delay: 1600 },
      { text: "[  0.000600] paging: Kernel mapped 0xFFFF800000000000..0xFFFF800008000000", color: "#4A90E2", delay: 1800 },
      { text: "[  0.000800] gdt: Global Descriptor Table reloaded (5 entries)", color: "#22C55E", delay: 2000, type: "ok" },
      { text: "[  0.001000] idt: Interrupt Descriptor Table loaded (256 entries)", color: "#22C55E", delay: 2200, type: "ok" },
      { text: "[  0.001100] idt: Exception handlers 0-31 registered", color: "#22C55E", delay: 2400 },
      { text: "[  0.001200] apic: Local APIC at 0xFEE00000 (xAPIC mode)", color: "#4A90E2", delay: 2600 },
      { text: "[  0.001300] apic: I/O APIC at 0xFEC00000, 24 IRQs, GSI base 0", color: "#4A90E2", delay: 2800 },
      { text: "[  0.001400] ✓ Phase 0-1 (Boot+Early) complete", color: "#22C55E", delay: 3200, type: "ok", icon: "✓" },
    ],
  },
  {
    id: "core", title: "Core Services", subtitle: "Phase 2: Core", color: "#7B68EE", sc: "123,104,238", icon: "⚙️", duration: 3400,
    services: [
      { name: "Heap Allocator", deps: [], essential: true },
      { name: "HPET Timer", deps: ["Heap Allocator"], essential: true },
      { name: "DIS Scheduler", deps: ["HPET Timer"], essential: true },
      { name: "Idle Task", deps: ["DIS Scheduler"], essential: true },
      { name: "Event Bus", deps: ["Heap Allocator"], essential: true },
      { name: "IPC Router", deps: ["Event Bus", "DIS Scheduler"], essential: true },
      { name: "Shared Memory", deps: ["Heap Allocator"], essential: false },
      { name: "Syscall Table", deps: [], essential: true },
      { name: "MSR Setup", deps: ["Syscall Table"], essential: true },
      { name: "Module Registry", deps: ["Heap Allocator", "IPC Router"], essential: true },
    ],
    hwDiscoveries: [
      { name: "HPET", type: "Timer", addr: "0xFED00000", detail: "3 timers, 1 ms period (1000 Hz)" },
    ],
    memoryEvents: [
      { action: "alloc", addr: "0xFFFF800001000000", size: "16 MB", label: "Kernel heap" },
      { action: "alloc", addr: "0xFFFF800002000000", size: "4 MB", label: "IPC shared memory pool" },
    ],
    cpuState: { RAX: "0x0000000000000000", RBX: "0x0000000000000001", RCX: "0x0000000000000200", RDX: "0x0000000000000000", RSP: "0xFFFF800000200000", RBP: "0xFFFF800000200000", RIP: "0xFFFF800000120000", RFLAGS: "0x0000000000000202", CR0: "0x0000000080050033", CR3: "0xFFFF800000001000", CR4: "0x00000000000206A0", CS: "0x0008", DS: "0x0010" },
    metrics: [{ label: "Heap", value: "16", unit: "MB" }, { label: "Scheduler", value: "DIS", unit: "" }, { label: "IPC Topics", value: "9", unit: "" }, { label: "Syscalls", value: "512", unit: "" }],
    lines: [
      { text: "[  0.002000] heap: Kernel heap initialized at 0xFFFF800001000000 (16 MB)", color: "#7B68EE", delay: 0, type: "ok" },
      { text: "[  0.002100] hpet: HPET found at 0xFED00000 (3 timers)", color: "#7B68EE", delay: 200 },
      { text: "[  0.002200] hpet: Timer 0 configured: 1 ms period (1000 Hz)", color: "#7B68EE", delay: 400 },
      { text: "[  0.002300] timer: Kernel tick source: HPET (fallback: PIT 8254)", color: "#22C55E", delay: 600, type: "ok" },
      { text: "[  0.003000] sched: DIS (Dynamic Intent Scheduler) initialized", color: "#7B68EE", delay: 800, type: "progress" },
      { text: "[  0.003100] sched: CPU 0 run queue created", color: "#4A90E2", delay: 1000 },
      { text: "[  0.003200] sched: Classes: RT / System / Interactive / Batch / Idle", color: "#71717A", delay: 1100 },
      { text: "[  0.003300] sched: Idle task created (PID 0, priority 255)", color: "#22C55E", delay: 1200, type: "ok" },
      { text: "[  0.004000] ipc: Event bus initialized (9 topics, 4 priority levels)", color: "#7B68EE", delay: 1500 },
      { text: "[  0.004100] ipc: Message router started", color: "#7B68EE", delay: 1700 },
      { text: "[  0.004200] ipc: Shared memory pool: 4 MB reserved", color: "#71717A", delay: 1800 },
      { text: "[  0.005000] syscall: Dispatch table loaded (512 entries)", color: "#7B68EE", delay: 2000 },
      { text: "[  0.005100] syscall: MSR LSTAR = 0xFFFF800000050000", color: "#4A90E2", delay: 2200 },
      { text: "[  0.006000] modules: Module registry online (ABI v0.4.0, max 256)", color: "#7B68EE", delay: 2500 },
      { text: "[  0.006200] ✓ Phase 2 (Core) complete", color: "#22C55E", delay: 3000, type: "ok", icon: "✓" },
    ],
  },
  {
    id: "late", title: "Late Services", subtitle: "Phase 3: Late", color: "#22D3EE", sc: "34,211,238", icon: "🌐", duration: 3200,
    services: [
      { name: "VFS Layer", deps: [], essential: true },
      { name: "HelixFS Mount", deps: ["VFS Layer"], essential: true },
      { name: "B+Tree Index", deps: ["HelixFS Mount"], essential: true },
      { name: "ARC Cache", deps: ["HelixFS Mount"], essential: false },
      { name: "Journal (WAL)", deps: ["HelixFS Mount"], essential: true },
      { name: "Encryption", deps: ["HelixFS Mount"], essential: false },
      { name: "Loopback Net", deps: [], essential: false },
      { name: "TCP/IP Stack", deps: ["Loopback Net"], essential: false },
      { name: "PCI Enum", deps: [], essential: true },
      { name: "GPU Driver", deps: ["PCI Enum"], essential: false },
      { name: "Security (CAP)", deps: [], essential: true },
      { name: "Audit Log", deps: ["Security (CAP)"], essential: false },
    ],
    hwDiscoveries: [
      { name: "Bochs VGA", type: "GPU", addr: "PCI 0:2.0", detail: "1024×768, 32bpp framebuffer" },
      { name: "Loopback", type: "Network", addr: "127.0.0.1", detail: "lo0 — UP" },
    ],
    memoryEvents: [
      { action: "alloc", addr: "0xFFFF800003000000", size: "16 MB", label: "ARC cache" },
      { action: "map", addr: "0xFD000000", size: "3 MB", label: "VGA framebuffer MMIO" },
    ],
    cpuState: { RAX: "0x0000000000000000", RBX: "0x0000000000000003", RCX: "0x0000000000000000", RDX: "0x0000000000000000", RSP: "0xFFFF800000200000", RBP: "0xFFFF800000200000", RIP: "0xFFFF800000140000", RFLAGS: "0x0000000000000202", CR0: "0x0000000080050033", CR3: "0xFFFF800000001000", CR4: "0x00000000000206A0", CS: "0x0008", DS: "0x0010" },
    metrics: [{ label: "FS Cache", value: "16", unit: "MB" }, { label: "PCI Devices", value: "3", unit: "" }, { label: "GPU", value: "1024×768", unit: "" }, { label: "Security", value: "CAP", unit: "" }],
    lines: [
      { text: "[  0.010000] vfs: Virtual File System initialized", color: "#22D3EE", delay: 0, type: "ok" },
      { text: "[  0.010500] helixfs: Mounting root filesystem (HelixFS v1.0)", color: "#22D3EE", delay: 200, type: "progress" },
      { text: "[  0.011000] helixfs: B+Tree index loaded, 0 inodes", color: "#4A90E2", delay: 400 },
      { text: "[  0.011500] helixfs: ARC cache: 16 MB (ghost lists enabled)", color: "#71717A", delay: 600 },
      { text: "[  0.012000] helixfs: Transaction log initialized (WAL mode)", color: "#71717A", delay: 800 },
      { text: "[  0.012500] helixfs: Encryption: AES-256-GCM + Merkle", color: "#22C55E", delay: 1000, type: "ok" },
      { text: "[  0.015000] net: Loopback interface UP (127.0.0.1)", color: "#22D3EE", delay: 1300 },
      { text: "[  0.016000] net: TCP/IP stack initialized", color: "#22D3EE", delay: 1500 },
      { text: "[  0.020000] pci: Enumeration complete (3 devices)", color: "#22D3EE", delay: 1800 },
      { text: "[  0.021000] gpu: Bochs VGA detected (1024×768, 32bpp)", color: "#EC4899", delay: 2000 },
      { text: "[  0.022000] gpu: Framebuffer mapped at 0xFD000000 (3 MB)", color: "#EC4899", delay: 2200 },
      { text: "[  0.025000] security: Capability system active (permissive)", color: "#F59E0B", delay: 2500 },
      { text: "[  0.025100] security: Audit logging enabled", color: "#F59E0B", delay: 2700 },
      { text: "[  0.026000] ✓ Phase 3 (Late) complete", color: "#22C55E", delay: 2900, type: "ok", icon: "✓" },
    ],
  },
  {
    id: "nexus", title: "NEXUS AI", subtitle: "Intelligence Engine", color: "#EC4899", sc: "236,72,153", icon: "🧠", duration: 2800,
    services: [
      { name: "NEXUS Core", deps: [], essential: true },
      { name: "Decision Tree", deps: ["NEXUS Core"], essential: true },
      { name: "Random Forest", deps: ["NEXUS Core"], essential: true },
      { name: "Neural Network", deps: ["NEXUS Core"], essential: true },
      { name: "SVM Classifier", deps: ["NEXUS Core"], essential: false },
      { name: "Anomaly Detect", deps: ["Decision Tree", "Random Forest", "Neural Network"], essential: true },
      { name: "Crash Predict", deps: ["Anomaly Detect"], essential: true },
      { name: "Health Monitor", deps: ["Crash Predict"], essential: true },
      { name: "Self-Healer", deps: ["Health Monitor", "Anomaly Detect"], essential: true },
    ],
    memoryEvents: [
      { action: "alloc", addr: "0xFFFF800005000000", size: "8 MB", label: "ML model weights" },
      { action: "alloc", addr: "0xFFFF800005800000", size: "2 MB", label: "Anomaly detector buffers" },
    ],
    cpuState: { RAX: "0x0000000000000087", RBX: "0x0000000000000004", RCX: "0x0000000000000003", RDX: "0x0000000000000080", RSP: "0xFFFF800000200000", RBP: "0xFFFF800000200000", RIP: "0xFFFF800000160000", RFLAGS: "0x0000000000000202", CR0: "0x0000000080050033", CR3: "0xFFFF800000001000", CR4: "0x00000000000206A0", CS: "0x0008", DS: "0x0010" },
    metrics: [{ label: "ML Models", value: "4", unit: "" }, { label: "Confidence", value: "87", unit: "%" }, { label: "Heartbeat", value: "100", unit: "ms" }, { label: "Strategies", value: "4", unit: "" }],
    lines: [
      { text: "[  0.030000] nexus: NEXUS Intelligence Engine v0.4.0 starting...", color: "#EC4899", delay: 0, type: "header" },
      { text: "[  0.030500] nexus: Loading ML models...", color: "#EC4899", delay: 300, type: "progress" },
      { text: "[  0.031000] nexus/ml: Decision Tree       ✓  (1,200 nodes)", color: "#22C55E", delay: 600, type: "ok" },
      { text: "[  0.031500] nexus/ml: Random Forest        ✓  (50 trees × 24 depth)", color: "#22C55E", delay: 900, type: "ok" },
      { text: "[  0.032000] nexus/ml: Neural Network       ✓  (3 layers, 128 neurons)", color: "#22C55E", delay: 1100, type: "ok" },
      { text: "[  0.032500] nexus/ml: SVM Classifier       ✓  (RBF kernel)", color: "#22C55E", delay: 1300, type: "ok" },
      { text: "[  0.033000] nexus: Anomaly detector online (4 engines)", color: "#EC4899", delay: 1600 },
      { text: "[  0.033500] nexus: Crash predictor active (confidence: 0.87)", color: "#EC4899", delay: 1800 },
      { text: "[  0.034000] nexus: Health monitor started (heartbeat: 100ms)", color: "#22C55E", delay: 2000, type: "ok" },
      { text: "[  0.034500] nexus: Self-healer ready (4 strategies, max 3 retries)", color: "#22C55E", delay: 2200, type: "ok" },
      { text: "[  0.035000] nexus: ✓ NEXUS fully operational — Level L2: Predictive", color: "#EC4899", delay: 2500, type: "ok", icon: "✓" },
    ],
  },
  {
    id: "runtime", title: "Userspace", subtitle: "Phase 4: Runtime", color: "#22C55E", sc: "34,197,94", icon: "🚀", duration: 2400,
    services: [
      { name: "Init Process", deps: [], essential: true },
      { name: "User Page Tables", deps: ["Init Process"], essential: true },
      { name: "Ring 3 Switch", deps: ["User Page Tables"], essential: true },
      { name: "Helix Shell", deps: ["Ring 3 Switch"], essential: true },
      { name: "stdio Connect", deps: ["Helix Shell"], essential: false },
    ],
    memoryEvents: [
      { action: "alloc", addr: "0x0000000000400000", size: "4 MB", label: "PID 1 user pages" },
      { action: "map", addr: "0x00007FFFFFFFE000", size: "8 KB", label: "User stack" },
    ],
    cpuState: { RAX: "0x0000000000000000", RBX: "0x0000000000000001", RCX: "0x0000000000000000", RDX: "0x0000000000000000", RSP: "0x00007FFFFFFFE000", RBP: "0x00007FFFFFFFE000", RIP: "0x0000000000400000", RFLAGS: "0x0000000000000202", CR0: "0x0000000080050033", CR3: "0x0000000008000000", CR4: "0x00000000000206A0", CS: "0x001B", DS: "0x0023" },
    metrics: [{ label: "PID", value: "1", unit: "" }, { label: "Ring", value: "3", unit: "" }, { label: "Boot Time", value: "50", unit: "ms" }, { label: "Modules", value: "0", unit: "" }],
    lines: [
      { text: "[  0.040000] init: Creating initial process (PID 1)", color: "#22C55E", delay: 0, type: "ok" },
      { text: "[  0.040500] init: User page tables configured", color: "#4A90E2", delay: 200 },
      { text: "[  0.041000] init: Switching to Ring 3...", color: "#7B68EE", delay: 400, type: "progress" },
      { text: "[  0.042000] init: PID 1 running in userspace ✓", color: "#22C55E", delay: 700, type: "ok" },
      { text: "[  0.050000] hsh: Helix Shell v0.4.0 starting...", color: "#22C55E", delay: 1000 },
      { text: "[  0.050100] hsh: stdio connected to COM1", color: "#71717A", delay: 1100 },
      { text: "", delay: 1300 },
      { text: "══════════════════════════════════════════════════════════════", color: "#7B68EE", delay: 1500 },
      { text: "  🧬 Helix OS v0.4.0 \"Aurora\" — Boot complete in 50ms", color: "#FFFFFF", delay: 1600 },
      { text: "  Kernel: 406 KB · Modules: 0 · NEXUS: Level 2 (Predictive)", color: "#71717A", delay: 1700 },
      { text: "══════════════════════════════════════════════════════════════", color: "#7B68EE", delay: 1800 },
      { text: "", delay: 1900 },
      { text: "helix@localhost:~$ █", color: "#22C55E", delay: 2100 },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   BACKGROUND — Circuit board canvas with data packets
   ═══════════════════════════════════════════════════════════════════════════════ */
function BootCanvas({ phase, isPlaying }: { phase: number; isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const visRef = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = window.innerWidth, H = window.innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    interface Node { x: number; y: number; r: number; alpha: number; connections: number[]; pulse: number; active: boolean }
    const nodes: Node[] = [];
    const count = Math.min(Math.floor(W * H / 20000), 70);
    for (let i = 0; i < count; i++) {
      nodes.push({ x: Math.random() * W, y: Math.random() * H, r: 1.2 + Math.random() * 2, alpha: 0.1 + Math.random() * 0.25, connections: [], pulse: Math.random() * Math.PI * 2, active: false });
    }
    for (let i = 0; i < nodes.length; i++) {
      const dists = nodes.map((n, j) => ({ j, d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y) }))
        .filter(({ j }) => j !== i).sort((a, b) => a.d - b.d);
      nodes[i].connections = dists.slice(0, 2 + Math.floor(Math.random() * 2)).filter(d => d.d < 280).map(d => d.j);
    }
    interface Pkt { from: number; to: number; p: number; sp: number; r: number; g: number; b: number }
    const pkts: Pkt[] = [];
    let time = 0;
    const phaseRgb = (ph: number) => {
      const c = [
        [161, 161, 170], [245, 158, 11], [74, 144, 226], [123, 104, 238], [34, 211, 238], [236, 72, 153], [34, 197, 94],
      ]; return c[Math.max(0, Math.min(ph, 6))];
    };

    const obs = new IntersectionObserver(([e]) => { visRef.current = e.isIntersecting; }, { threshold: 0 });
    obs.observe(canvas);
    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener("resize", resize);

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      if (!visRef.current) return;
      ctx.clearRect(0, 0, W, H);
      time++;
      const ratio = phase >= 0 ? Math.min((phase + 1) / 7, 1) : 0;
      const rgb = phaseRgb(phase);
      for (let i = 0; i < nodes.length; i++) nodes[i].active = i / nodes.length < ratio;
      if (isPlaying && time % 10 === 0) {
        const ai = nodes.findIndex((n, idx) => n.active && n.connections.length > 0 && Math.random() < 0.3);
        if (ai >= 0) {
          const to = nodes[ai].connections[Math.floor(Math.random() * nodes[ai].connections.length)];
          pkts.push({ from: ai, to, p: 0, sp: 0.012 + Math.random() * 0.02, r: rgb[0], g: rgb[1], b: rgb[2] });
        }
      }
      for (const n of nodes) {
        for (const ci of n.connections) {
          const n2 = nodes[ci];
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = n.active && n2.active ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.04)` : "rgba(63,63,70,0.015)";
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      for (let i = pkts.length - 1; i >= 0; i--) {
        const pk = pkts[i]; pk.p += pk.sp;
        if (pk.p >= 1) { pkts.splice(i, 1); continue; }
        const n1 = nodes[pk.from], n2 = nodes[pk.to];
        const px = n1.x + (n2.x - n1.x) * pk.p, py = n1.y + (n2.y - n1.y) * pk.p;
        const a = 1 - Math.abs(pk.p - 0.5) * 2;
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pk.r},${pk.g},${pk.b},${a * 0.6})`; ctx.fill();
        ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pk.r},${pk.g},${pk.b},${a * 0.1})`; ctx.fill();
      }
      for (const n of nodes) {
        const pulse = Math.sin(time * 0.025 + n.pulse) * 0.5 + 0.5;
        const a = n.active ? n.alpha * (0.5 + pulse * 0.5) : n.alpha * 0.1;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (n.active ? 1 + pulse * 0.2 : 1), 0, Math.PI * 2);
        ctx.fillStyle = n.active ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})` : `rgba(100,100,110,${a})`;
        ctx.fill();
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); obs.disconnect(); window.removeEventListener("resize", resize); };
  }, [phase, isPlaying]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   DAG — Animated dependency graph per phase
   ═══════════════════════════════════════════════════════════════════════════════ */
function DagGraph({ services, color, progress }: { services: BootPhase["services"]; color: string; progress: number }) {
  const positions = useMemo(() => {
    const layers: string[][] = [];
    const placed = new Set<string>();
    let cur = services.filter(s => s.deps.length === 0).map(s => s.name);
    while (cur.length > 0) {
      layers.push(cur);
      cur.forEach(n => placed.add(n));
      const next: string[] = [];
      for (const s of services) { if (!placed.has(s.name) && s.deps.every(d => placed.has(d))) next.push(s.name); }
      cur = next;
    }
    const pos: Record<string, { x: number; y: number }> = {};
    layers.forEach((layer, li) => {
      layer.forEach((name, ni) => {
        pos[name] = {
          x: 28 + (li / Math.max(layers.length - 1, 1)) * 230,
          y: 18 + (layer.length === 1 ? 40 : (ni / Math.max(layer.length - 1, 1)) * 80),
        };
      });
    });
    return pos;
  }, [services]);

  const order = useMemo(() => {
    const o: string[] = []; const done = new Set<string>();
    let cur = services.filter(s => s.deps.length === 0).map(s => s.name);
    while (cur.length) { o.push(...cur); cur.forEach(n => done.add(n)); const next: string[] = []; for (const s of services) { if (!done.has(s.name) && s.deps.every(d => done.has(d))) next.push(s.name); } cur = next; }
    return o;
  }, [services]);

  const activeSet = new Set(order.slice(0, Math.floor(progress * services.length)));
  const maxY = Math.max(...Object.values(positions).map(p => p.y)) + 28;

  return (
    <svg viewBox={`0 0 280 ${Math.max(maxY, 100)}`} className="w-full">
      <defs>
        <marker id={`ah-${color.slice(1)}`} markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill={color} opacity={0.5} />
        </marker>
      </defs>
      {services.map(s => s.deps.map(dep => {
        const from = positions[dep], to = positions[s.name];
        if (!from || !to) return null;
        const on = activeSet.has(dep) && activeSet.has(s.name);
        return <line key={`${dep}-${s.name}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
          stroke={on ? color : "#3f3f46"} strokeWidth={on ? 1.5 : 0.5} strokeDasharray={on ? "none" : "3,3"} opacity={on ? 0.6 : 0.15}
          markerEnd={on ? `url(#ah-${color.slice(1)})` : undefined} className="transition-all duration-500" />;
      }))}
      {services.map(s => {
        const p = positions[s.name]; if (!p) return null;
        const on = activeSet.has(s.name);
        return (
          <g key={s.name}>
            {on && <circle cx={p.x} cy={p.y} r="13" fill={color} opacity={0.06}><animate attributeName="r" values="13;17;13" dur="2s" repeatCount="indefinite" /></circle>}
            <circle cx={p.x} cy={p.y} r="7" fill={on ? color : "#27272a"} stroke={on ? color : "#3f3f46"} strokeWidth={on ? 1.5 : 0.8} opacity={on ? 1 : 0.35} className="transition-all duration-500" />
            {on && <circle cx={p.x} cy={p.y} r="2.5" fill="white" opacity={0.7} />}
            <text x={p.x} y={p.y + 15} textAnchor="middle" className="transition-all duration-500" style={{ fontSize: "5.5px", fontWeight: on ? 700 : 400, fill: on ? color : "#52525b" }}>{s.name.length > 15 ? s.name.slice(0, 13) + "…" : s.name}</text>
            {s.essential && on && <text x={p.x + 9} y={p.y - 7} textAnchor="middle" style={{ fontSize: "5px", fill: "#F59E0B" }}>★</text>}
          </g>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MEMORY MAP
   ═══════════════════════════════════════════════════════════════════════════════ */
function MemoryMap({ events }: { events: NonNullable<BootPhase["memoryEvents"]> }) {
  const ac: Record<string, string> = { alloc: "#22C55E", map: "#4A90E2", free: "#EF4444", reserve: "#F59E0B" };
  return (
    <div className="space-y-1.5">
      {events.map((ev, i) => (
        <div key={i} className="flex items-center gap-2 text-[10px] font-mono" style={{ animation: `fsi 0.3s ease ${i * 0.1}s both` }}>
          <span className="w-14 text-right shrink-0 font-bold" style={{ color: ac[ev.action] }}>{ev.action.toUpperCase()}</span>
          <div className="flex-1 min-w-0 px-2 py-1.5 rounded bg-zinc-900/50 border border-zinc-800/30 hover:border-zinc-700/50 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="text-zinc-400 truncate">{ev.label}</span>
              <span className="text-zinc-600 shrink-0">{ev.size}</span>
            </div>
            <span className="text-zinc-700 text-[9px]">{ev.addr}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HARDWARE DISCOVERY
   ═══════════════════════════════════════════════════════════════════════════════ */
function HwPanel({ discoveries }: { discoveries: NonNullable<BootPhase["hwDiscoveries"]> }) {
  const icons: Record<string, string> = { CPU: "🔲", Memory: "💾", Bridge: "🔗", GPU: "🖥️", Serial: "📡", Interrupt: "⚡", Timer: "⏱️", Network: "🌐" };
  return (
    <div className="space-y-1.5">
      {discoveries.map((hw, i) => (
        <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-zinc-900/40 border border-zinc-800/30 hover:border-zinc-700/40 transition-all"
          style={{ animation: `fsi 0.3s ease ${i * 0.1}s both` }}>
          <span className="text-sm">{icons[hw.type] || "🔧"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-white truncate">{hw.name}</p>
            <p className="text-[9px] text-zinc-600 truncate">{hw.detail}</p>
          </div>
          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/50 text-zinc-600 shrink-0">{hw.addr}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CPU STATE
   ═══════════════════════════════════════════════════════════════════════════════ */
function CpuRegs({ regs, prev }: { regs: Record<string, string>; prev?: Record<string, string> }) {
  const gprs = ["RAX", "RBX", "RCX", "RDX", "RSP", "RBP", "RIP", "RFLAGS"];
  const crs = ["CR0", "CR3", "CR4", "CS", "DS"];
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {gprs.map(r => {
          const ch = prev && prev[r] !== regs[r];
          return (
            <div key={r} className="flex items-center gap-1 font-mono text-[9px]">
              <span className="w-8 text-zinc-600 font-bold">{r}</span>
              <span className={`flex-1 truncate transition-colors duration-500 ${ch ? "text-yellow-400" : "text-zinc-400"}`}>{regs[r]}</span>
              {ch && <span className="text-yellow-500 text-[7px]">●</span>}
            </div>
          );
        })}
      </div>
      <div className="h-px bg-zinc-800/50" />
      <div className="grid grid-cols-3 gap-x-3 gap-y-0.5">
        {crs.map(r => {
          const ch = prev && prev[r] !== regs[r];
          return (
            <div key={r} className="flex items-center gap-1 font-mono text-[9px]">
              <span className="w-6 text-zinc-600 font-bold text-[8px]">{r}</span>
              <span className={`flex-1 truncate transition-colors duration-500 ${ch ? "text-yellow-400" : "text-zinc-500"}`}>{regs[r]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   METRICS
   ═══════════════════════════════════════════════════════════════════════════════ */
function MetricsDash({ metrics, color }: { metrics: NonNullable<BootPhase["metrics"]>; color: string }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {metrics.map((m, i) => (
        <div key={i} className="px-2.5 py-2 rounded-lg border border-zinc-800/40 bg-zinc-900/30 text-center" style={{ animation: `fsi 0.3s ease ${i * 0.08}s both` }}>
          <p className="text-lg font-black tabular-nums" style={{ color }}>{m.value}<span className="text-[10px] text-zinc-600 ml-0.5">{m.unit}</span></p>
          <p className="text-[9px] text-zinc-600 font-medium">{m.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   TIMELINE
   ═══════════════════════════════════════════════════════════════════════════════ */
function Timeline({ cur, onJump }: { cur: number; onJump: (i: number) => void }) {
  return (
    <div className="flex items-center gap-0 w-full">
      {PHASES.map((p, i) => {
        const done = cur > i, active = cur === i;
        return (
          <div key={p.id} className="flex-1 flex items-center">
            <button onClick={() => onJump(i)} className="relative group cursor-pointer flex flex-col items-center w-full" title={p.title}>
              {i > 0 && <div className="absolute top-3.5 right-1/2 w-full h-0.5 -z-10" style={{ background: done || active ? `linear-gradient(90deg, ${PHASES[i - 1].color}, ${p.color})` : "rgba(63,63,70,0.25)" }} />}
              <div className={`relative w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${active ? "scale-125" : "group-hover:scale-110"}`}
                style={{ borderColor: done || active ? p.color : "rgba(63,63,70,0.35)", background: done ? p.color : active ? `${p.color}20` : "rgba(9,9,11,0.8)", boxShadow: active ? `0 0 20px ${p.color}40, 0 0 40px ${p.color}15` : done ? `0 0 8px ${p.color}20` : "none" }}>
                {done ? <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <span className="text-[10px]">{p.icon}</span>}
                {active && <div className="absolute inset-0 rounded-full animate-ping" style={{ border: `1px solid ${p.color}`, opacity: 0.3 }} />}
              </div>
              <span className={`mt-1.5 text-[8px] md:text-[9px] font-bold truncate max-w-full px-0.5 ${active ? "text-white" : done ? "text-zinc-500" : "text-zinc-700"}`}>{p.title}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   KERNEL TERMINAL
   ═══════════════════════════════════════════════════════════════════════════════ */
function Terminal({ lines, visible, playing, scrollRef }: {
  lines: { text: string; color?: string; type?: string; phaseIndex: number; lineKey: number }[];
  visible: Set<number>; playing: boolean; scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const lastKey = lines.filter(l => visible.has(l.lineKey)).pop()?.lineKey ?? -1;
  return (
    <div ref={scrollRef} className="relative h-[380px] md:h-[480px] overflow-y-auto p-4 font-mono text-[10.5px] md:text-xs leading-[1.75] scroll-smooth">
      {playing && <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden"><div className="w-full h-px bg-white/[0.02]" style={{ animation: "scanline 6s linear infinite" }} /></div>}
      <div className="absolute inset-0 pointer-events-none z-10" style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.35)" }} />
      {!visible.size ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-5">
            <div className="relative w-20 h-20 mx-auto">
              <HelixLogo className="w-20 h-20 opacity-25" />
              <div className="absolute inset-0 rounded-full" style={{ animation: "pulse 2s ease-in-out infinite", background: "radial-gradient(circle, rgba(123,104,238,0.12) 0%, transparent 70%)" }} />
            </div>
            <div>
              <p className="text-zinc-500 text-sm font-medium">Ready to boot</p>
              <p className="text-zinc-700 text-[10px] mt-1">Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-mono text-[9px]">Start Boot</kbd> or click any phase</p>
            </div>
          </div>
        </div>
      ) : (
        lines.map(({ text, color, type, lineKey }) => {
          if (!visible.has(lineKey)) return null;
          return (
            <div key={lineKey} className={`relative group transition-colors duration-100 ${hovered === lineKey ? "bg-white/[0.015]" : ""}`}
              style={{ animation: "lineEnter 0.12s ease" }} onMouseEnter={() => setHovered(lineKey)} onMouseLeave={() => setHovered(null)}>
              <span className="inline-block w-5 text-right mr-3 text-zinc-800 text-[9px] select-none tabular-nums">{lineKey % 1000 + 1}</span>
              {type === "ok" && <span className="text-emerald-500 mr-1">●</span>}
              {type === "warn" && <span className="text-yellow-500 mr-1">▲</span>}
              {type === "error" && <span className="text-red-500 mr-1">✖</span>}
              {type === "progress" && <span className="text-blue-400 mr-1">◌</span>}
              {type === "header" && <span className="text-zinc-600 mr-1">═</span>}
              <span style={{ color: color || "#A1A1AA" }}>{text || "\u00A0"}</span>
              {lineKey === lastKey && <span style={{ animation: "blink 1s step-end infinite" }}>█</span>}
            </div>
          );
        })
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   INSPECTOR PANEL — Tabbed sidebar: DAG, Memory, Hardware, CPU, Metrics
   ═══════════════════════════════════════════════════════════════════════════════ */
type ITab = "dag" | "memory" | "hardware" | "cpu" | "metrics";
function Inspector({ phase, prev, progress }: { phase: BootPhase | null; prev: BootPhase | null; progress: number }) {
  const [tab, setTab] = useState<ITab>("dag");
  const tabs: { id: ITab; label: string; icon: string; ok: boolean }[] = [
    { id: "dag", label: "DAG", icon: "🔗", ok: !!phase?.services.length },
    { id: "metrics", label: "Stats", icon: "📊", ok: !!phase?.metrics?.length },
    { id: "memory", label: "Memory", icon: "💾", ok: !!phase?.memoryEvents?.length },
    { id: "hardware", label: "HW", icon: "🔧", ok: !!phase?.hwDiscoveries?.length },
    { id: "cpu", label: "CPU", icon: "🔲", ok: !!phase?.cpuState },
  ];
  if (!phase) return <div className="h-full flex items-center justify-center p-6"><p className="text-zinc-700 text-sm text-center">Select a phase to inspect<br /><span className="text-zinc-800 text-[10px]">DAG · Memory · Hardware · CPU</span></p></div>;
  const at = tabs.find(t => t.id === tab && t.ok) ? tab : tabs.find(t => t.ok)?.id || "dag";
  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2.5 border-b border-zinc-800/40 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm">{phase.icon}</span>
          <div className="flex-1 min-w-0"><p className="text-xs font-bold text-white truncate">{phase.title}</p><p className="text-[9px] text-zinc-600">{phase.subtitle}</p></div>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: phase.color }} />
        </div>
        <div className="mt-2 h-1 rounded-full bg-zinc-800/60 overflow-hidden"><div className="h-full rounded-full transition-all duration-300 ease-out" style={{ background: phase.color, width: `${progress * 100}%` }} /></div>
      </div>
      <div className="flex border-b border-zinc-800/30 shrink-0">
        {tabs.filter(t => t.ok).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 px-1.5 py-2 text-[9px] font-bold transition-all cursor-pointer ${at === t.id ? "text-white border-b-2" : "text-zinc-600 hover:text-zinc-400"}`} style={at === t.id ? { borderColor: phase.color } : {}}>
            <span className="text-[10px]">{t.icon}</span><span className="hidden lg:inline ml-1">{t.label}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-3 min-h-0">
        {at === "dag" && <DagGraph services={phase.services} color={phase.color} progress={progress} />}
        {at === "memory" && phase.memoryEvents && <MemoryMap events={phase.memoryEvents} />}
        {at === "hardware" && phase.hwDiscoveries && <HwPanel discoveries={phase.hwDiscoveries} />}
        {at === "cpu" && phase.cpuState && <CpuRegs regs={phase.cpuState} prev={prev?.cpuState} />}
        {at === "metrics" && phase.metrics && <MetricsDash metrics={phase.metrics} color={phase.color} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   BOOT SUMMARY
   ═══════════════════════════════════════════════════════════════════════════════ */
function Summary() {
  const ts = PHASES.reduce((s, p) => s + p.services.length, 0);
  const tl = PHASES.reduce((s, p) => s + p.lines.length, 0);
  const th = PHASES.reduce((s, p) => s + (p.hwDiscoveries?.length || 0), 0);
  const tm = PHASES.reduce((s, p) => s + (p.memoryEvents?.length || 0), 0);
  return (
    <div className="mt-8 space-y-6" style={{ animation: "fsi 0.8s ease" }}>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {PHASES.map(p => (
          <div key={p.id} className="relative p-3 rounded-xl border overflow-hidden group hover:scale-[1.02] transition-all cursor-default"
            style={{ borderColor: `${p.color}25`, background: `linear-gradient(135deg, ${p.color}06, transparent)` }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle, ${p.color}10, transparent 70%)` }} />
            <div className="relative"><span className="text-lg">{p.icon}</span><p className="text-[10px] font-bold text-white mt-1">{p.title}</p><p className="text-[9px] text-zinc-600">{p.services.length} services</p></div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-6 px-6 py-5 rounded-2xl border border-zinc-800/30 bg-zinc-900/20">
        {[
          { l: "Boot Time", v: "50ms", c: "#22C55E" }, { l: "Services", v: String(ts), c: "#7B68EE" }, { l: "Log Events", v: String(tl), c: "#4A90E2" },
          { l: "Hardware", v: String(th), c: "#F59E0B" }, { l: "Memory Ops", v: String(tm), c: "#22D3EE" }, { l: "Kernel", v: "406 KB", c: "#EC4899" }, { l: "NEXUS", v: "L2", c: "#EC4899" },
        ].map((s, i) => (
          <div key={i} className="text-center" style={{ animation: `fsi 0.4s ease ${i * 0.05}s both` }}>
            <p className="text-xl font-black tabular-nums" style={{ color: s.c }}>{s.v}</p><p className="text-[9px] text-zinc-600 font-medium">{s.l}</p>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Link href="/docs/architecture" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-helix-purple/10 border border-helix-purple/20 text-helix-purple text-sm font-bold hover:bg-helix-purple/20 transition-all">
          Explore the Architecture →
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function BootPage() {
  const { locale } = useI18n();
  const s = (k: string) => getDocString(bootContent, locale, k);

  const [cur, setCur] = useState(-1);
  const [visible, setVisible] = useState<Set<number>>(new Set());
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [prog, setProg] = useState(0);
  const [inspector, setInspector] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const progRaf = useRef(0);

  const clear = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; cancelAnimationFrame(progRaf.current); }, []);
  const scrollBot = useCallback(() => { requestAnimationFrame(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }); }, []);

  const playPhase = useCallback((pi: number) => {
    if (pi >= PHASES.length) { setComplete(true); setPlaying(false); setProg(1); return; }
    const phase = PHASES[pi]; setCur(pi); setProg(0);
    const t0 = performance.now(), dur = phase.duration / speed;
    const anim = () => { const p = Math.min((performance.now() - t0) / dur, 1); setProg(p); if (p < 1) progRaf.current = requestAnimationFrame(anim); };
    progRaf.current = requestAnimationFrame(anim);
    phase.lines.forEach((l, li) => { const t = setTimeout(() => { setVisible(prev => { const n = new Set(prev); n.add(pi * 1000 + li); return n; }); scrollBot(); }, (l.delay || 0) / speed); timers.current.push(t); });
    timers.current.push(setTimeout(() => playPhase(pi + 1), phase.duration / speed));
  }, [speed, scrollBot]);

  const start = useCallback(() => { clear(); setVisible(new Set()); setCur(-1); setComplete(false); setPlaying(true); setProg(0); timers.current.push(setTimeout(() => playPhase(0), 350 / speed)); }, [clear, playPhase, speed]);

  const jump = useCallback((i: number) => {
    clear(); setPlaying(false); setComplete(false); setCur(i); setProg(1);
    const n = new Set<number>(); for (let p = 0; p <= i; p++) PHASES[p].lines.forEach((_, li) => n.add(p * 1000 + li));
    setVisible(n); setTimeout(scrollBot, 50);
  }, [clear, scrollBot]);

  useEffect(() => clear, [clear]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.code === "Space" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) { e.preventDefault(); start(); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [start]);

  const allLines = useMemo(() => PHASES.flatMap((p, pi) => p.lines.map((l, li) => ({ text: l.text, color: l.color, type: l.type, phaseIndex: pi, lineKey: pi * 1000 + li }))), []);
  const ap = cur >= 0 && cur < PHASES.length ? PHASES[cur] : null;
  const pp = cur > 0 ? PHASES[cur - 1] : null;

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-helix-purple/40">
      <BootCanvas phase={cur} isPlaying={playing} />
      <style>{`
        @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        @keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}}
        @keyframes lineEnter{0%{opacity:0;transform:translateX(-4px)}100%{opacity:1;transform:translateX(0)}}
        @keyframes fsi{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.15;transform:scale(1)}50%{opacity:.35;transform:scale(1.1)}}
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
      `}</style>

      <main className="relative z-10">
        {/* HERO */}
        <div className="pt-28 pb-6 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-6 inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              {s("back_home")}
            </Link>
            <div className="flex items-center justify-center gap-3 mb-6">
              <HelixLogo className="w-10 h-10" />
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{s("badge")}
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-helix-blue to-helix-purple">{s("title")}</span>
            </h1>
            <p className="text-base md:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              {s("subtitle")}
              <span className="text-zinc-600"> Every phase. Every service. Every byte.</span>
            </p>
          </div>
        </div>

        {/* TIMELINE */}
        <div className="max-w-5xl mx-auto px-6 mb-6"><Timeline cur={cur} onJump={jump} /></div>

        {/* CONTROLS */}
        <div className="max-w-7xl mx-auto px-6 mb-5">
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={start} className="px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-sm hover:from-emerald-500 hover:to-emerald-400 transition-all flex items-center gap-2.5 cursor-pointer shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              {playing ? "Restart" : complete ? "Replay" : "Start Boot"}
            </button>
            <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800/60 rounded-xl px-3 py-2">
              <span className="text-[10px] text-zinc-500 font-mono mr-1.5">Speed</span>
              {[0.5, 1, 2, 4].map(s => (
                <button key={s} onClick={() => setSpeed(s)} className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${speed === s ? "bg-helix-purple/20 text-helix-purple" : "text-zinc-500 hover:text-white hover:bg-zinc-800/40"}`}>{s}x</button>
              ))}
            </div>
            <button onClick={() => setInspector(!inspector)} className={`px-3 py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${inspector ? "bg-helix-purple/10 border-helix-purple/30 text-helix-purple" : "bg-zinc-900/60 border-zinc-800/40 text-zinc-500"}`}>🔍 Inspector</button>
            <div className="ml-auto flex items-center gap-3">
              {playing && ap && <div className="flex items-center gap-2 text-[11px] font-mono"><span className="w-2 h-2 rounded-full animate-pulse" style={{ background: ap.color }} /><span style={{ color: ap.color }}>{ap.title}</span><span className="text-zinc-600">Phase {cur + 1}/{PHASES.length}</span></div>}
              {complete && <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Boot complete · 50ms · {PHASES.reduce((s, p) => s + p.services.length, 0)} services</span>}
            </div>
          </div>
          <p className="text-[9px] text-zinc-800 mt-2 font-mono">Press <kbd className="px-1 py-0.5 rounded bg-zinc-800/60 border border-zinc-800/40 text-zinc-600">SPACE</kbd> to {playing || complete ? "restart" : "start"}</p>
        </div>

        {/* MAIN: Terminal + Inspector */}
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <div className="flex gap-4">
            <div className={`${inspector ? "flex-1 min-w-0" : "w-full"} rounded-2xl border border-zinc-800/50 overflow-hidden bg-[#0c0c0e] shadow-2xl shadow-black/40`}>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800/40">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/80" /><div className="w-3 h-3 rounded-full bg-yellow-500/80" /><div className="w-3 h-3 rounded-full bg-green-500/80" /></div>
                <div className="flex-1 flex items-center justify-center"><span className="text-[10px] font-mono text-zinc-600">qemu-system-x86_64 — helix-minimal.iso</span></div>
                {ap && <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg font-bold" style={{ color: ap.color, background: `${ap.color}10`, border: `1px solid ${ap.color}25` }}>{ap.icon} {ap.title}</span>}
              </div>
              <Terminal lines={allLines} visible={visible} playing={playing} scrollRef={scrollRef} />
              <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900/50 border-t border-zinc-800/30 text-[10px] font-mono text-zinc-600">
                <span className="flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${playing ? "bg-emerald-500 animate-pulse" : complete ? "bg-emerald-500" : "bg-zinc-700"}`} />{playing ? "RUNNING" : complete ? "COMPLETE" : "READY"}</span>
                <span>QEMU x86_64</span><span>128 MB</span><span>VGA 1024×768</span>
                <span className="ml-auto tabular-nums">{visible.size} / {allLines.length} events</span>
              </div>
            </div>
            {inspector && <div className="hidden md:block w-72 lg:w-80 shrink-0 rounded-2xl border border-zinc-800/50 bg-[#0c0c0e] shadow-2xl shadow-black/40 overflow-hidden" style={{ animation: "fsi 0.3s ease" }}><Inspector phase={ap} prev={pp} progress={prog} /></div>}
          </div>
        </div>

        {/* SUMMARY */}
        {complete && <div className="max-w-7xl mx-auto px-6 pb-16"><Summary /></div>}

        {/* PHASE DEEP-DIVE */}
        {!playing && !complete && cur >= 0 && (
          <div className="max-w-7xl mx-auto px-6 pb-16" style={{ animation: "fsi 0.5s ease" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-zinc-800/40 bg-zinc-900/20 p-4">
                <h3 className="text-sm font-bold text-white mb-3">🔗 Services ({ap?.services.length})</h3>
                <div className="space-y-1.5">
                  {ap?.services.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px]">
                      <span className="text-emerald-500">✓</span><span className="text-white font-medium">{s.name}</span>
                      {s.essential && <span className="text-[8px] text-yellow-500/70 font-bold">ESSENTIAL</span>}
                      {s.deps.length > 0 && <span className="text-[8px] text-zinc-700">← {s.deps.join(", ")}</span>}
                    </div>
                  ))}
                </div>
              </div>
              {ap?.memoryEvents && <div className="rounded-xl border border-zinc-800/40 bg-zinc-900/20 p-4"><h3 className="text-sm font-bold text-white mb-3">💾 Memory Operations</h3><MemoryMap events={ap.memoryEvents} /></div>}
              {ap?.hwDiscoveries && <div className="rounded-xl border border-zinc-800/40 bg-zinc-900/20 p-4"><h3 className="text-sm font-bold text-white mb-3">🔧 Hardware Discovered</h3><HwPanel discoveries={ap.hwDiscoveries} /></div>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
