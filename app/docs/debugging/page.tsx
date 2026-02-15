"use client";

import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import Footer from "@/helix-wiki/components/Footer";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import debuggingContent from "@/helix-wiki/lib/docs-i18n/debugging";

export default function DebuggingPage() {
  const { locale } = useI18n();
  const d = (key: string) => getDocString(debuggingContent, locale, key);
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader
        title={d("header.title")}
        subtitle={d("header.subtitle")}
        badge={d("header.badge")}
      />

      {/* ── OVERVIEW ── */}
      <Section title="Debugging Architecture" id="overview">
        <p>Helix&apos;s debugging infrastructure has three layers that work together:</p>
        <RustCode filename="Debug Architecture" language="text">{`┌─────────────────────────────────────────────────────────┐
│                     HOST SYSTEM                          │
│                                                          │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐     │
│  │    GDB     │    │  Serial    │    │ Log Files  │     │
│  │ (debugger) │    │  Terminal  │    │            │     │
│  └─────┬──────┘    └─────┬──────┘    └────────────┘     │
│        │ TCP:1234        │ stdio          ▲              │
├────────┼─────────────────┼───────────────┼──────────────┤
│        ▼                 ▼               │              │
│  ┌──────────────────────────────────────────────┐       │
│  │                   QEMU                        │       │
│  │  GDB Server ←→ Serial Port ←→ Log Output     │       │
│  └──────────────────────────────────────────────┘       │
│        │                 │               │              │
├────────┼─────────────────┼───────────────┼──────────────┤
│        ▼                 ▼               ▼              │
│  ┌──────────────────────────────────────────────┐       │
│  │              HELIX KERNEL                     │       │
│  │  Breakpoints   serial_print!   Debug Logs     │       │
│  │  Watchpoints   serial_println  Trace Events   │       │
│  └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘`}</RustCode>
      </Section>

      {/* ── DEBUG BUILD ── */}
      <Section title="Debug Build Configuration" id="build">
        <p>{d("debug_build.intro")}</p>
        <RustCode filename="Cargo.toml" language="toml">{`[profile.dev]
opt-level = 0           # No optimization — accurate debugging
debug = true            # Full DWARF debug symbols
debug-assertions = true # Runtime assertion checks
overflow-checks = true  # Integer overflow panics
lto = false             # No link-time optimization
panic = "abort"         # Abort on panic (no unwinding in kernel)

# Release with debug symbols (for profiling)
[profile.release-with-debug]
inherits = "release"
debug = true

# Feature flags for extra debugging
[features]
debug = ["debug-console", "verbose-logging"]
debug-console = []      # Enable serial debug console
verbose-logging = []    # Extra log output
trace-scheduling = []   # Log every scheduler decision
trace-memory = []       # Log every page allocation
trace-interrupts = []   # Log every interrupt`}</RustCode>

        <RustCode filename="terminal" language="bash">{`# Build with debug symbols
./scripts/build.sh --debug

# Build with specific trace features
cargo build --features "debug,trace-scheduling,trace-memory"`}</RustCode>
      </Section>

      {/* ── SERIAL CONSOLE ── */}
      <Section title="Serial Console" id="serial">
        <p>{d("serial.intro")}</p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Debug Macros</h3>
        <RustCode filename="core/src/debug.rs">{`/// Print to serial console (no newline)
macro_rules! serial_print {
    ($($arg:tt)*) => {
        $crate::debug::_serial_print(format_args!($($arg)*));
    };
}

/// Print to serial console with newline
macro_rules! serial_println {
    () => ($crate::serial_print!("\\n"));
    ($($arg:tt)*) => {
        $crate::serial_print!("{}\\n", format_args!($($arg)*));
    };
}

// Usage in kernel code:
serial_println!("Memory: {} frames free", free_frames);
serial_println!("[BOOT] Phase {}: {}", phase, description);
serial_println!("[WARN] Page fault at {:#x}", fault_addr);`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Log Levels</h3>
        <InfoTable
          columns={[
            { header: "Level", key: "level" },
            { header: "Prefix", key: "prefix" },
            { header: "Use", key: "use" },
          ]}
          rows={[
            { level: <span className="text-red-400 font-bold">ERROR</span>, prefix: <code className="text-red-400">[ERROR]</code>, use: "Fatal errors, unrecoverable states" },
            { level: <span className="text-yellow-400 font-bold">WARN</span>, prefix: <code className="text-yellow-400">[WARN]</code>, use: "Unexpected but handled situations" },
            { level: <span className="text-green-400 font-bold">INFO</span>, prefix: <code className="text-green-400">[INFO]</code>, use: "Major lifecycle events" },
            { level: <span className="text-blue-400 font-bold">DEBUG</span>, prefix: <code className="text-blue-400">[DEBUG]</code>, use: "Detailed debugging (feature-gated)" },
            { level: <span className="text-zinc-400 font-bold">TRACE</span>, prefix: <code className="text-zinc-400">[TRACE]</code>, use: "Per-event tracing (very verbose)" },
          ]}
        />
      </Section>

      {/* ── QEMU DEBUGGING ── */}
      <Section title="QEMU Debugging" id="qemu">
        <p>{d("qemu.intro")}</p>

        <RustCode filename="terminal" language="bash">{`# Basic debugging output
qemu-system-x86_64 -cdrom helix.iso -m 128M \\
  -serial stdio \\          # Serial to terminal
  -no-reboot \\             # Don't reboot on crash
  -d int,cpu_reset \\       # Log interrupts & CPU resets
  -D qemu.log              # Write debug log to file

# Full debug setup with GDB
qemu-system-x86_64 -cdrom helix.iso -m 128M \\
  -serial stdio \\
  -no-reboot -no-shutdown \\
  -s \\                     # GDB server on localhost:1234
  -S \\                     # Freeze CPU at startup (wait for GDB)
  -d int,cpu_reset,in_asm  # Log everything

# Monitor console (Ctrl+Alt+2 in QEMU window)
# Useful commands:
#   info registers       — dump CPU registers
#   info mem             — show memory mappings
#   info mtree           — memory-mapped devices
#   xp /16xg 0x1000      — dump physical memory
#   gdbserver tcp::1234  — start GDB server`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">QEMU Debug Flags</h3>
        <InfoTable
          columns={[
            { header: "Flag", key: "flag" },
            { header: "Description", key: "desc" },
          ]}
          rows={[
            { flag: <code className="text-helix-blue">-d int</code>, desc: "Log all interrupts and exceptions" },
            { flag: <code className="text-helix-blue">-d cpu_reset</code>, desc: "Log CPU resets (triple faults)" },
            { flag: <code className="text-helix-blue">-d in_asm</code>, desc: "Disassemble executed instructions" },
            { flag: <code className="text-helix-blue">-d guest_errors</code>, desc: "Log guest architecture violations" },
            { flag: <code className="text-helix-blue">-d mmu</code>, desc: "Log MMU/page table operations" },
            { flag: <code className="text-helix-blue">-d unimp</code>, desc: "Log unimplemented features accessed" },
            { flag: <code className="text-helix-blue">-D logfile</code>, desc: "Write debug output to file instead of stderr" },
            { flag: <code className="text-helix-blue">-monitor stdio</code>, desc: "QEMU monitor on terminal (instead of serial)" },
          ]}
        />
      </Section>

      {/* ── GDB ── */}
      <Section title="GDB Integration" id="gdb">
        <p>{d("gdb.intro")}</p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Setup</h3>
        <RustCode filename="terminal — Tab 1" language="bash">{`# Start QEMU with GDB server (paused)
qemu-system-x86_64 -cdrom helix.iso -m 128M \\
  -serial stdio -no-reboot \\
  -s -S`}</RustCode>

        <RustCode filename="terminal — Tab 2" language="bash">{`# Connect GDB to QEMU
gdb build/output/helix-kernel \\
  -ex "target remote localhost:1234" \\
  -ex "set architecture i386:x86-64" \\
  -ex "break kernel_main" \\
  -ex "continue"`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Essential GDB Commands</h3>
        <InfoTable
          columns={[
            { header: "Command", key: "cmd" },
            { header: "Description", key: "desc" },
          ]}
          rows={[
            { cmd: <code className="text-helix-blue">break kernel_main</code>, desc: "Set breakpoint on function" },
            { cmd: <code className="text-helix-blue">break *0xFFFF800000100000</code>, desc: "Breakpoint at address" },
            { cmd: <code className="text-helix-blue">watch *(uint64_t*)0xaddr</code>, desc: "Hardware watchpoint on memory write" },
            { cmd: <code className="text-helix-blue">info registers</code>, desc: "Dump all CPU registers" },
            { cmd: <code className="text-helix-blue">info registers eflags</code>, desc: "Show flags register" },
            { cmd: <code className="text-helix-blue">x/16xg $rsp</code>, desc: "Examine 16 quadwords at stack pointer" },
            { cmd: <code className="text-helix-blue">bt</code>, desc: "Backtrace (if debug symbols present)" },
            { cmd: <code className="text-helix-blue">layout asm</code>, desc: "TUI assembly view" },
            { cmd: <code className="text-helix-blue">stepi</code>, desc: "Step one instruction" },
            { cmd: <code className="text-helix-blue">next</code>, desc: "Step one source line" },
            { cmd: <code className="text-helix-blue">continue</code>, desc: "Resume execution" },
            { cmd: <code className="text-helix-blue">print/x $cr3</code>, desc: "Print page table base (CR3)" },
          ]}
        />

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">GDB Init File</h3>
        <RustCode filename=".gdbinit">{`# Auto-connect to QEMU
target remote localhost:1234
set architecture i386:x86-64

# Load kernel symbols
file build/output/helix-kernel

# Useful aliases
define regs
  info registers rax rbx rcx rdx rsi rdi rbp rsp
  info registers r8 r9 r10 r11 r12 r13 r14 r15
  info registers rip rflags cs ss
end

define pg
  print/x *(uint64_t[512]*)($cr3 & ~0xFFF)
end

# Break on panic
break rust_begin_unwind
break _panic_handler`}</RustCode>
      </Section>

      {/* ── CRASH ANALYSIS ── */}
      <Section title="Crash Analysis" id="crash">
        <p>{d("crash.intro")}</p>

        <RustCode filename="Panic Output Example" language="text">{`╔══════════════════════════════════════════════════╗
║               KERNEL PANIC                        ║
╠══════════════════════════════════════════════════╣
║                                                   ║
║  Message: page fault in kernel space              ║
║  Location: core/src/memory/vmm.rs:342             ║
║                                                   ║
║  Registers:                                       ║
║    RAX=0000000000000000  RBX=FFFF800000234000     ║
║    RCX=0000000000001000  RDX=0000000000000003     ║
║    RSI=DEAD000000000000  RDI=FFFF80000010A230     ║
║    RBP=FFFF80000020FE80  RSP=FFFF80000020FE30     ║
║    RIP=FFFF800000102A48                           ║
║    CR2=DEAD000000000000  (faulting address)       ║
║    CR3=0000000000104000  (page table base)        ║
║                                                   ║
║  Stack Trace:                                     ║
║    #0 vmm::map_page      (core/src/memory/vmm.rs) ║
║    #1 heap::grow          (core/src/memory/heap.rs)║
║    #2 alloc::alloc        (alloc/src/alloc.rs)    ║
║    #3 kernel_main         (core/src/lib.rs)       ║
║                                                   ║
║  Error Code: 0x02 (write, not-present, kernel)    ║
║                                                   ║
╚══════════════════════════════════════════════════╝`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Common Crash Types</h3>
        <InfoTable
          columns={[
            { header: "Exception", key: "exc" },
            { header: "Vector", key: "vec" },
            { header: "Common Cause", key: "cause" },
            { header: "Fix", key: "fix" },
          ]}
          rows={[
            { exc: <strong className="text-red-400">#PF Page Fault</strong>, vec: "14", cause: "Unmapped address, wrong permissions", fix: "Check CR2, verify page table mappings" },
            { exc: <strong className="text-red-400">#GP General Protection</strong>, vec: "13", cause: "Segment violation, bad MSR access", fix: "Check error code, verify GDT/IDT" },
            { exc: <strong className="text-red-400">#DF Double Fault</strong>, vec: "8", cause: "Exception during exception handling", fix: "Check IST stack, review #PF handler" },
            { exc: <strong className="text-red-400">Triple Fault</strong>, vec: "—", cause: "Exception during #DF handling", fix: "QEMU resets — check -d int log" },
            { exc: <strong className="text-yellow-400">#SS Stack Fault</strong>, vec: "12", cause: "Stack overflow, bad SS selector", fix: "Increase stack size, check TSS" },
            { exc: <strong className="text-yellow-400">#UD Invalid Opcode</strong>, vec: "6", cause: "SSE without CR0/CR4 setup", fix: "Ensure FPU/SSE initialization" },
          ]}
        />
      </Section>

      {/* ── MEMORY DEBUGGING ── */}
      <Section title="Memory Debugging" id="memory">
        <p>{d("memory_debug.intro")}</p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">🔍 Poison Patterns</h4>
            <p className="text-sm text-zinc-400">Freed memory is filled with <code className="text-helix-blue">0xDEADBEEF</code>. Uninitialized allocations use <code className="text-helix-blue">0xCAFEBABE</code>. If you see these values in a crash, you&apos;re accessing freed or uninitialized memory.</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">🛡️ Guard Pages</h4>
            <p className="text-sm text-zinc-400">Stack guard pages (unmapped page below each stack) catch stack overflows with a clean #PF instead of silent corruption. Heap allocations can also have guard pages in debug mode.</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">📊 Allocation Tracking</h4>
            <p className="text-sm text-zinc-400">With <code className="text-helix-blue">trace-memory</code> enabled, every <code className="text-helix-blue">alloc_pages()</code> and <code className="text-helix-blue">free_pages()</code> call is logged with caller location, size, and the returned address.</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">🗺️ Page Table Dump</h4>
            <p className="text-sm text-zinc-400">Use GDB to inspect page tables: <code className="text-helix-blue">print/x $cr3</code> gives the PML4 base. Walk 4 levels of 512-entry tables (8 bytes each) to find any mapping.</p>
          </div>
        </div>
      </Section>

      {/* ── TOOLS ── */}
      <Section title="Binary Tools" id="tools">
        <p>{d("tools.intro")}</p>
        <RustCode filename="terminal" language="bash">{`# Show kernel sections and sizes
size build/output/helix-kernel

# Disassemble a function
objdump -d build/output/helix-kernel | grep -A 30 "<kernel_main>"

# List symbols sorted by size
nm --size-sort --radix=d build/output/helix-kernel | tail -20

# Show section headers
readelf -S build/output/helix-kernel

# Display ELF program headers (load segments)
readelf -l build/output/helix-kernel

# Check for debug info
readelf --debug-dump=info build/output/helix-kernel | head -20`}</RustCode>
      </Section>

      <Footer />
    </div>
  );
}
