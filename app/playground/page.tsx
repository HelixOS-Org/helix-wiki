"use client";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import HelixLogo from "@/helix-wiki/components/HelixLogo";
import Link from "next/link";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import playgroundContent from "@/helix-wiki/lib/docs-i18n/playground";

/* ═══════════════════════════════════════════════════════════════════════════════
   SYSCALL DEFINITIONS — All Helix OS system calls with full metadata
   ═══════════════════════════════════════════════════════════════════════════════ */
interface SyscallDef {
  id: string; name: string; number: number; category: string; color: string;
  description: string; args: { name: string; type: string; desc: string }[];
  returnType: string; returnDesc: string; example?: string; errno?: string[];
  complexity?: "O(1)" | "O(log n)" | "O(n)"; privilege?: "Ring 0" | "Ring 3";
  latency?: string;
}

const SYSCALLS: SyscallDef[] = [
  {
    id: "write", name: "sys_write", number: 1, category: "I/O", color: "#4A90E2",
    description: "Write bytes to a file descriptor. Transfers data from the user buffer to the kernel-managed resource.",
    args: [
      { name: "fd", type: "u64", desc: "File descriptor (0=stdin, 1=stdout, 2=stderr)" },
      { name: "buf", type: "*const u8", desc: "Pointer to the user buffer containing data" },
      { name: "count", type: "usize", desc: "Number of bytes to write" },
    ],
    returnType: "isize", returnDesc: "Number of bytes written on success, negative errno on failure",
    example: 'sys_write(1, "Hello, Helix!\\n", 14)',
    errno: ["EBADF (9): Bad file descriptor", "EFAULT (14): Bad address", "EINVAL (22): Invalid argument"],
    complexity: "O(n)", privilege: "Ring 3", latency: "~1.2μs",
  },
  {
    id: "read", name: "sys_read", number: 0, category: "I/O", color: "#4A90E2",
    description: "Read bytes from a file descriptor into a user buffer.",
    args: [
      { name: "fd", type: "u64", desc: "File descriptor to read from" },
      { name: "buf", type: "*mut u8", desc: "Pointer to destination buffer" },
      { name: "count", type: "usize", desc: "Maximum number of bytes to read" },
    ],
    returnType: "isize", returnDesc: "Number of bytes read, 0 on EOF, negative errno on failure",
    errno: ["EBADF (9): Bad file descriptor", "EFAULT (14): Bad address"],
    complexity: "O(n)", privilege: "Ring 3", latency: "~0.8μs",
  },
  {
    id: "open", name: "sys_open", number: 2, category: "File System", color: "#22C55E",
    description: "Open a file at the given path. Returns a new file descriptor or an error.",
    args: [
      { name: "path", type: "*const u8", desc: "Null-terminated path string" },
      { name: "flags", type: "u32", desc: "O_RDONLY=0, O_WRONLY=1, O_RDWR=2, O_CREAT=0x40" },
      { name: "mode", type: "u32", desc: "Permission bits if creating (e.g. 0o644)" },
    ],
    returnType: "isize", returnDesc: "File descriptor on success, negative errno on failure",
    example: 'sys_open("/etc/helix.conf", O_RDONLY, 0)',
    errno: ["ENOENT (2): No such file", "EACCES (13): Permission denied", "EMFILE (24): Too many open files"],
    complexity: "O(log n)", privilege: "Ring 3", latency: "~3.4μs",
  },
  {
    id: "close", name: "sys_close", number: 3, category: "File System", color: "#22C55E",
    description: "Close a file descriptor, releasing associated kernel resources.",
    args: [{ name: "fd", type: "u64", desc: "File descriptor to close" }],
    returnType: "isize", returnDesc: "0 on success, negative errno on failure",
    errno: ["EBADF (9): Bad file descriptor"],
    complexity: "O(1)", privilege: "Ring 3", latency: "~0.3μs",
  },
  {
    id: "mmap", name: "sys_mmap", number: 9, category: "Memory", color: "#7B68EE",
    description: "Map memory pages into the calling process's address space.",
    args: [
      { name: "addr", type: "*mut u8", desc: "Hint address (NULL for kernel-chosen)" },
      { name: "length", type: "usize", desc: "Size to map (rounded up to page)" },
      { name: "prot", type: "u32", desc: "PROT_READ=1, PROT_WRITE=2, PROT_EXEC=4" },
      { name: "flags", type: "u32", desc: "MAP_PRIVATE=2, MAP_ANON=0x20" },
    ],
    returnType: "*mut u8", returnDesc: "Pointer to mapped region, or MAP_FAILED on error",
    example: "sys_mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_ANON|MAP_PRIVATE)",
    errno: ["ENOMEM (12): Out of memory", "EINVAL (22): Invalid flags"],
    complexity: "O(log n)", privilege: "Ring 0", latency: "~5.1μs",
  },
  {
    id: "munmap", name: "sys_munmap", number: 11, category: "Memory", color: "#7B68EE",
    description: "Unmap previously mapped memory pages.",
    args: [
      { name: "addr", type: "*mut u8", desc: "Start address (page-aligned)" },
      { name: "length", type: "usize", desc: "Size to unmap" },
    ],
    returnType: "isize", returnDesc: "0 on success, negative errno on failure",
    errno: ["EINVAL (22): Invalid address or length"],
    complexity: "O(log n)", privilege: "Ring 0", latency: "~2.7μs",
  },
  {
    id: "fork", name: "sys_fork", number: 57, category: "Process", color: "#F59E0B",
    description: "Create a child process. Both parent and child continue from the return of fork.",
    args: [],
    returnType: "isize", returnDesc: "Child PID in parent, 0 in child, negative errno on failure",
    errno: ["ENOMEM (12): Out of memory", "EAGAIN (11): Resource temporarily unavailable"],
    complexity: "O(n)", privilege: "Ring 0", latency: "~45μs",
  },
  {
    id: "exec", name: "sys_execve", number: 59, category: "Process", color: "#F59E0B",
    description: "Replace the current process image with a new program.",
    args: [
      { name: "path", type: "*const u8", desc: "Path to executable" },
      { name: "argv", type: "*const *const u8", desc: "Argument array (null-terminated)" },
      { name: "envp", type: "*const *const u8", desc: "Environment array (null-terminated)" },
    ],
    returnType: "isize", returnDesc: "Does not return on success, negative errno on failure",
    example: 'sys_execve("/bin/hsh", argv, envp)',
    errno: ["ENOENT (2): No such file", "EACCES (13): Permission denied", "ENOEXEC (8): Bad format"],
    complexity: "O(n)", privilege: "Ring 0", latency: "~120μs",
  },
  {
    id: "exit", name: "sys_exit", number: 60, category: "Process", color: "#F59E0B",
    description: "Terminate the calling process immediately.",
    args: [{ name: "status", type: "i32", desc: "Exit code (0 = success)" }],
    returnType: "!", returnDesc: "Does not return",
    complexity: "O(1)", privilege: "Ring 0", latency: "~0.1μs",
  },
  {
    id: "konami", name: "sys_kernel_wars", number: 1337, category: "????", color: "#EF4444",
    description: "[CLASSIFIED] Activates the hidden kernel battlefield. Only those who know the ancient input sequence on /compare can invoke this.",
    args: [{ name: "code", type: "*const u8", desc: "The sacred sequence: ↑↑↓↓←→←→BA" }],
    returnType: "!", returnDesc: "Launches Kernel Wars — does not return to normal reality",
    example: 'sys_kernel_wars("↑↑↓↓←→←→BA")',
    errno: ["ENOWAR (1337): The kernels are not ready", "EHIDDEN (404): Secret not yet discovered"],
    complexity: "O(1)", privilege: "Ring 0", latency: "∞",
  },
  {
    id: "ipc_send", name: "sys_ipc_send", number: 200, category: "IPC", color: "#EC4899",
    description: "Send a message to another process via Helix's IPC subsystem.",
    args: [
      { name: "dest_pid", type: "u64", desc: "Destination process ID" },
      { name: "msg", type: "*const u8", desc: "Pointer to message buffer" },
      { name: "len", type: "usize", desc: "Message length in bytes" },
      { name: "priority", type: "u8", desc: "Priority: 0=low, 1=normal, 2=high, 3=critical" },
    ],
    returnType: "isize", returnDesc: "0 on success, negative errno on failure",
    errno: ["ESRCH (3): No such process", "EINVAL (22): Invalid priority", "ENOMEM (12): Kernel buffer full"],
    complexity: "O(1)", privilege: "Ring 3", latency: "~1.8μs",
  },
  {
    id: "ipc_recv", name: "sys_ipc_recv", number: 201, category: "IPC", color: "#EC4899",
    description: "Receive a pending IPC message. Blocks if no message available.",
    args: [
      { name: "buf", type: "*mut u8", desc: "Destination buffer" },
      { name: "max_len", type: "usize", desc: "Buffer capacity" },
      { name: "timeout_ms", type: "u64", desc: "Timeout in ms (0 = infinite)" },
    ],
    returnType: "isize", returnDesc: "Message length on success, negative errno on failure",
    errno: ["ETIMEDOUT (110): Timed out", "EINTR (4): Interrupted"],
    complexity: "O(1)", privilege: "Ring 3", latency: "~0.5μs",
  },
  {
    id: "nexus_query", name: "sys_nexus_query", number: 300, category: "NEXUS", color: "#22D3EE",
    description: "Query the NEXUS AI subsystem for system health, predictions, or anomaly reports.",
    args: [
      { name: "query_type", type: "u32", desc: "0=health, 1=predict, 2=anomalies, 3=recommendations" },
      { name: "buf", type: "*mut u8", desc: "Output buffer for JSON response" },
      { name: "buf_len", type: "usize", desc: "Buffer capacity" },
    ],
    returnType: "isize", returnDesc: "Response length in bytes, negative errno on failure",
    example: "sys_nexus_query(0, buf, 4096)",
    errno: ["ENOSYS (38): NEXUS not available", "ENOMEM (12): Buffer too small"],
    complexity: "O(1)", privilege: "Ring 3", latency: "~12μs",
  },
  {
    id: "cap_grant", name: "sys_cap_grant", number: 400, category: "Security", color: "#F97316",
    description: "Grant a capability token to a module or process. Capabilities are unforgeable access-right tokens.",
    args: [
      { name: "target_pid", type: "u64", desc: "Target process/module ID" },
      { name: "cap_type", type: "u32", desc: "0=read, 1=write, 2=execute, 3=manage" },
      { name: "resource_id", type: "u64", desc: "Resource identifier (fd, port, IRQ, etc.)" },
    ],
    returnType: "isize", returnDesc: "Capability token ID on success, negative errno on failure",
    errno: ["EPERM (1): Operation not permitted", "ESRCH (3): No such process"],
    complexity: "O(1)", privilege: "Ring 0", latency: "~2.1μs",
  },
  {
    id: "sched_yield", name: "sys_sched_yield", number: 24, category: "Scheduler", color: "#A855F7",
    description: "Voluntarily yield the CPU, allowing the DIS scheduler to pick the next task based on intent class.",
    args: [],
    returnType: "isize", returnDesc: "0 on success",
    complexity: "O(1)", privilege: "Ring 3", latency: "~0.2μs",
  },
];

const CATEGORIES = [...new Set(SYSCALLS.map(s => s.category))];
const CATEGORY_COLORS: Record<string, string> = {};
const CATEGORY_ICONS: Record<string, string> = {
  "I/O": "📝", "File System": "📂", "Memory": "🧠", "Process": "⚙️",
  "????": "🎮", "IPC": "📡", "NEXUS": "🤖", "Security": "🛡️", "Scheduler": "⏱️",
};
SYSCALLS.forEach(s => { CATEGORY_COLORS[s.category] = s.color; });

interface QueuedSyscall {
  id: string; syscall: SyscallDef; argValues: Record<string, string>;
  result?: { success: boolean; value: string; errno?: string; duration: number; kernelLog: string[] };
}

const REGISTERS = ["rdi", "rsi", "rdx", "r10", "r8", "r9"] as const;

/* ═══════════════════════════════════════════════════════════════════════════════
   CIRCUIT BOARD BACKGROUND CANVAS
   ═══════════════════════════════════════════════════════════════════════════════ */
function CircuitCanvas() {
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

    interface Node { x: number; y: number; r: number; alpha: number; connections: number[]; pulse: number }
    const nodes: Node[] = [];
    const count = Math.min(Math.floor(W * H / 25000), 50);
    for (let i = 0; i < count; i++) {
      nodes.push({ x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 1.5, alpha: 0.08 + Math.random() * 0.15, connections: [], pulse: Math.random() * Math.PI * 2 });
    }
    for (let i = 0; i < nodes.length; i++) {
      const dists = nodes.map((n, j) => ({ j, d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y) }))
        .filter(({ j }) => j !== i).sort((a, b) => a.d - b.d);
      nodes[i].connections = dists.slice(0, 2).filter(d => d.d < 300).map(d => d.j);
    }
    interface Pkt { from: number; to: number; p: number; sp: number; color: string }
    const pkts: Pkt[] = [];
    let time = 0;
    const colors = ["#7B68EE", "#4A90E2", "#22C55E", "#EC4899", "#22D3EE"];

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
      if (time % 20 === 0 && pkts.length < 8) {
        const i = Math.floor(Math.random() * nodes.length);
        if (nodes[i].connections.length > 0) {
          const to = nodes[i].connections[Math.floor(Math.random() * nodes[i].connections.length)];
          pkts.push({ from: i, to, p: 0, sp: 0.008 + Math.random() * 0.015, color: colors[Math.floor(Math.random() * colors.length)] });
        }
      }
      for (const n of nodes) {
        for (const ci of n.connections) {
          const n2 = nodes[ci];
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = "rgba(123,104,238,0.025)"; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      for (let i = pkts.length - 1; i >= 0; i--) {
        const pk = pkts[i]; pk.p += pk.sp;
        if (pk.p >= 1) { pkts.splice(i, 1); continue; }
        const n1 = nodes[pk.from], n2 = nodes[pk.to];
        const px = n1.x + (n2.x - n1.x) * pk.p, py = n1.y + (n2.y - n1.y) * pk.p;
        const a = 1 - Math.abs(pk.p - 0.5) * 2;
        const [r, g, b] = hexToRgb(pk.color);
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${a * 0.5})`;
        ctx.fill();
        ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${a * 0.08})`;
        ctx.fill();
      }
      for (const n of nodes) {
        const pulse = Math.sin(time * 0.02 + n.pulse) * 0.5 + 0.5;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (1 + pulse * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(123,104,238,${n.alpha * (0.3 + pulse * 0.5)})`;
        ctx.fill();
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); obs.disconnect(); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

/* ═══════════════════════════════════════════════════════════════════════════════
   KERNEL TERMINAL — CRT-style execution output with scanline effect
   ═══════════════════════════════════════════════════════════════════════════════ */
function KernelTerminal({ logs }: { logs: string[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  return (
    <div className="relative rounded-2xl border border-zinc-800/50 bg-[#0a0a0c] overflow-hidden">
      {/* Terminal chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800/40 bg-zinc-900/30">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="text-[10px] font-mono text-zinc-600 flex-1 text-center">helix-kernel · syscall-trace</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-mono text-emerald-500/60">LIVE</span>
        </div>
      </div>
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-[0.03]">
        <div className="w-full h-px bg-white" style={{ animation: "scanline 4s linear infinite" }} />
      </div>
      {/* Terminal content */}
      <div ref={scrollRef} className="h-[200px] overflow-y-auto p-3 font-mono text-[10px] leading-[1.8] scroll-smooth">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <span className="text-zinc-800 text-lg">⏳</span>
              <p className="text-zinc-700">Waiting for syscall execution...</p>
            </div>
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} style={{ animation: "termLine 0.15s ease" }}>
              <span className="text-zinc-700 mr-2 select-none">{String(i + 1).padStart(3, " ")}</span>
              <span className={
                log.includes("\u2713") ? "text-emerald-400" :
                log.includes("\u2717") ? "text-red-400" :
                log.includes("SYSCALL") ? "text-helix-purple" :
                log.includes("\u2192") ? "text-helix-blue" :
                log.startsWith("[") ? "text-zinc-500" :
                "text-zinc-400"
              }>{log}</span>
            </div>
          ))
        )}
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.5)" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SYSCALL FLOW DIAGRAM — Visual userspace -> kernel transition
   ═══════════════════════════════════════════════════════════════════════════════ */
function SyscallFlowDiagram({ syscall, isExecuting, result }: {
  syscall: SyscallDef; isExecuting: boolean; result?: QueuedSyscall["result"];
}) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!isExecuting) { setPhase(result ? 5 : 0); return; }
    const phases = [1, 2, 3, 4];
    let i = 0;
    const timer = setInterval(() => {
      if (i < phases.length) { setPhase(phases[i]); i++; }
      else clearInterval(timer);
    }, 200);
    return () => clearInterval(timer);
  }, [isExecuting, result]);

  const stages = [
    { label: "User Space", sub: "Ring 3", icon: "\uD83D\uDC64", color: "#4A90E2" },
    { label: "SYSCALL", sub: "int 0x80 / syscall", icon: "\u26A1", color: "#F59E0B" },
    { label: "Kernel", sub: "Ring 0", icon: "\uD83D\uDD12", color: "#7B68EE" },
    { label: "Handler", sub: syscall.name, icon: "\u2699\uFE0F", color: syscall.color },
    { label: "Return", sub: "iret / sysret", icon: "\u21A9\uFE0F", color: "#22C55E" },
  ];

  return (
    <div className="flex items-center gap-1 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {stages.map((st, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all duration-300 min-w-[72px] ${
            phase > i ? "scale-100 opacity-100" : phase === i ? "scale-105 opacity-100" : "scale-95 opacity-30"
          }`} style={{
            borderColor: phase >= i ? st.color + "40" : "rgba(63,63,70,0.2)",
            background: phase === i ? st.color + "12" : phase > i ? st.color + "06" : "transparent",
            boxShadow: phase === i ? `0 0 20px ${st.color}20` : "none",
          }}>
            {phase === i && <div className="absolute inset-0 rounded-xl animate-pulse" style={{ border: `1px solid ${st.color}30` }} />}
            <span className="text-sm">{st.icon}</span>
            <span className="text-[8px] font-bold text-white">{st.label}</span>
            <span className="text-[7px] text-zinc-600 truncate max-w-[60px]">{st.sub}</span>
          </div>
          {i < stages.length - 1 && (
            <div className="flex items-center">
              <div className={`w-4 h-0.5 rounded-full transition-all duration-300 ${phase > i ? "bg-gradient-to-r" : "bg-zinc-800"}`}
                style={phase > i ? { backgroundImage: `linear-gradient(90deg, ${st.color}, ${stages[i + 1].color})` } : {}} />
              <svg className={`w-2 h-2 transition-all duration-300 ${phase > i ? "opacity-100" : "opacity-20"}`} fill={phase > i ? stages[i + 1].color : "#3f3f46"} viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   EXECUTION STATS — Live performance counters
   ═══════════════════════════════════════════════════════════════════════════════ */
function ExecutionStats({ queue }: { queue: QueuedSyscall[] }) {
  const completed = queue.filter(q => q.result);
  const successes = completed.filter(q => q.result?.success);
  const totalLatency = completed.reduce((s, q) => s + (q.result?.duration || 0), 0);
  const avgLatency = completed.length > 0 ? (totalLatency / completed.length).toFixed(1) : "\u2014";
  const rate = completed.length > 0 ? Math.round((successes.length / completed.length) * 100) : 0;

  const stats = [
    { label: "Executed", value: `${completed.length}/${queue.length}`, color: "#7B68EE", icon: "\u26A1" },
    { label: "Success", value: completed.length > 0 ? `${rate}%` : "\u2014", color: rate >= 80 ? "#22C55E" : rate >= 50 ? "#F59E0B" : "#EF4444", icon: rate >= 80 ? "\u2713" : "\u26A0" },
    { label: "Avg Latency", value: completed.length > 0 ? `${avgLatency}\u03BCs` : "\u2014", color: "#4A90E2", icon: "\u23F1" },
    { label: "Categories", value: String(new Set(queue.map(q => q.syscall.category)).size), color: "#EC4899", icon: "\uD83D\uDCCA" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((s, i) => (
        <div key={i} className="relative p-2.5 rounded-xl border border-zinc-800/30 bg-zinc-900/20 text-center overflow-hidden group hover:border-zinc-700/40 transition-all">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle, ${s.color}08, transparent 70%)` }} />
          <div className="relative">
            <span className="text-[10px]">{s.icon}</span>
            <p className="text-sm font-black font-mono tabular-nums mt-0.5" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[8px] text-zinc-600 mt-0.5">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN PLAYGROUND PAGE
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function PlaygroundPage() {
  const { locale } = useI18n();
  const s = (k: string) => getDocString(playgroundContent, locale, k);

  const [queue, setQueue] = useState<QueuedSyscall[]>([]);
  const [selectedSyscall, setSelectedSyscall] = useState<SyscallDef | null>(null);
  const [argDraft, setArgDraft] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentExec, setCurrentExec] = useState(-1);
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [execActive, setExecActive] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalExecutions, setTotalExecutions] = useState(0);
  const queueRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const t = setTimeout(() => setHeroReady(true), 100); return () => clearTimeout(t); }, []);

  const addToQueue = useCallback(() => {
    if (!selectedSyscall) return;
    setQueue(prev => [...prev, {
      id: `${selectedSyscall.id}-${Date.now()}`,
      syscall: selectedSyscall, argValues: { ...argDraft },
    }]);
    setArgDraft({});
    setTimeout(() => queueRef.current?.scrollTo({ top: queueRef.current.scrollHeight, behavior: "smooth" }), 50);
  }, [selectedSyscall, argDraft]);

  const removeFromQueue = useCallback((id: string) => setQueue(prev => prev.filter(q => q.id !== id)), []);
  const clearQueue = useCallback(() => { setQueue([]); setCurrentExec(-1); setTerminalLogs([]); }, []);

  const executeQueue = useCallback(async () => {
    setIsRunning(true);
    setExecActive(true);
    setTerminalLogs(["[kernel] syscall trace started", `[kernel] ${queue.length} syscalls queued for execution`, ""]);

    for (let i = 0; i < queue.length; i++) {
      setCurrentExec(i);
      const entry = queue[i];
      const argsStr = Object.entries(entry.argValues).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join(", ");

      setTerminalLogs(prev => [...prev,
        `[${new Date().toISOString().slice(11, 23)}] SYSCALL #${entry.syscall.number} \u2192 ${entry.syscall.name}(${argsStr})`,
        `  \u2192 rax = 0x${entry.syscall.number.toString(16).padStart(4, "0")}`,
        `  \u2192 ring3 \u2192 syscall instruction \u2192 ring0`,
      ]);

      await new Promise(r => setTimeout(r, 500 + Math.random() * 500));

      const success = Math.random() > 0.12;
      const duration = parseFloat((0.1 + Math.random() * 3).toFixed(1));
      const kernelLog: string[] = [];

      if (success) {
        const val = simulateReturn(entry.syscall);
        kernelLog.push(`  \u2713 ${entry.syscall.name} returned ${val} (${duration}\u03BCs)`);
        setQueue(prev => prev.map((q, qi) => qi === i ? { ...q, result: { success: true, value: val, duration, kernelLog } } : q));
      } else {
        const errno = entry.syscall.errno?.[Math.floor(Math.random() * (entry.syscall.errno?.length || 1))] || "ENOSYS (38)";
        kernelLog.push(`  \u2717 ${entry.syscall.name} failed: ${errno} (${duration}\u03BCs)`);
        setQueue(prev => prev.map((q, qi) => qi === i ? { ...q, result: { success: false, value: "-1", errno, duration, kernelLog } } : q));
      }

      setTerminalLogs(prev => [...prev, ...kernelLog, ""]);
    }

    setTerminalLogs(prev => [...prev,
      `[kernel] execution complete: ${queue.length} syscalls processed`,
      `[kernel] trace ended`,
    ]);
    setCurrentExec(-1);
    setIsRunning(false);
    setTotalExecutions(prev => prev + queue.length);
    setTimeout(() => setExecActive(false), 1000);
  }, [queue]);

  function simulateReturn(sc: SyscallDef): string {
    const returns: Record<string, string> = {
      write: "14", read: "256", open: "3", close: "0",
      mmap: "0x7f4a2c000000", munmap: "0", fork: `${1000 + Math.floor(Math.random() * 8000)}`,
      exec: "(replaced)", exit: "(terminated)", konami: "\uD83C\uDFAE",
      ipc_send: "0", ipc_recv: `${32 + Math.floor(Math.random() * 224)}`,
      nexus_query: `${256 + Math.floor(Math.random() * 2048)}`,
      cap_grant: `0x${Math.floor(Math.random() * 0xFFFF).toString(16).padStart(4, "0")}`,
      sched_yield: "0",
    };
    return returns[sc.id] || "0";
  }

  const filtered = useMemo(() => {
    let list = filterCat ? SYSCALLS.filter(s => s.category === filterCat) : SYSCALLS;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    }
    return list;
  }, [filterCat, searchQuery]);

  const successRate = useMemo(() => {
    const done = queue.filter(q => q.result);
    if (done.length === 0) return 0;
    return Math.round((done.filter(q => q.result?.success).length / done.length) * 100);
  }, [queue]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-helix-purple/40 overflow-x-hidden">
      <CircuitCanvas />

      {/* Ambient lighting */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] rounded-full bg-helix-purple/[0.03] blur-[180px]" />
        <div className="absolute bottom-[15%] right-[10%] w-[500px] h-[500px] rounded-full bg-helix-blue/[0.03] blur-[160px]" />
        {execActive && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-emerald-500/[0.02] blur-[200px] transition-opacity duration-1000" />}
      </div>

      <style>{`
        @keyframes scanline { 0% { transform: translateY(-100vh); } 100% { transform: translateY(100vh); } }
        @keyframes termLine { 0% { opacity: 0; transform: translateX(-4px); } 100% { opacity: 1; transform: translateX(0); } }
        @keyframes slideUp { 0% { opacity: 0; transform: translateY(12px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes fadeScale { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes pulseRing { 0%,100% { box-shadow: 0 0 0 0 rgba(123,104,238,0.3); } 50% { box-shadow: 0 0 0 8px rgba(123,104,238,0); } }
        @keyframes execGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.3); } 50% { box-shadow: 0 0 20px 4px rgba(34,197,94,0.15); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .slide-up { animation: slideUp 0.3s ease both; }
        .fade-scale { animation: fadeScale 0.4s ease both; }
        .exec-glow { animation: execGlow 1.5s ease infinite; }
        .shimmer-bg { background: linear-gradient(90deg, transparent, rgba(123,104,238,0.05), transparent); background-size: 200% 100%; animation: shimmer 3s linear infinite; }
        .overflow-x-auto::-webkit-scrollbar { display: none; }
      `}</style>

      <main className="relative overflow-hidden" style={{ zIndex: 2 }}>

        {/* ═══════════════════════════════════════════════════════
            HERO — Immersive header with animated badge
            ═══════════════════════════════════════════════════════ */}
        <header className="relative pt-24 pb-12 px-6">
          <div className={`max-w-6xl mx-auto text-center transition-all duration-[1.5s] ease-out ${heroReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="mb-10">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-200 transition-all duration-300 group">
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                {s("back_home")}
              </Link>
            </div>

            <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full border backdrop-blur-xl mb-8 transition-all duration-1000 delay-200 ${heroReady ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
              style={{ background: "linear-gradient(135deg, rgba(123,104,238,0.08), rgba(74,144,226,0.08))", borderColor: "rgba(123,104,238,0.2)" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-helix-purple opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-helix-purple shadow-[0_0_8px_rgba(123,104,238,0.6)]" />
              </span>
              <span className="text-helix-purple text-xs font-bold tracking-wider uppercase">{s("badge")}</span>
              <span className="text-zinc-700 text-[10px] font-mono">{SYSCALLS.length}/512 syscalls</span>
            </div>

            <h1 className={`text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-6 transition-all duration-[1.8s] delay-300 ${heroReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-helix-purple via-helix-blue to-cyan-400" style={{ filter: "drop-shadow(0 0 40px rgba(123,104,238,0.2))" }}>
                {s("title")}
              </span>
            </h1>

            <p className={`text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8 transition-all duration-[2s] delay-500 ${heroReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              {s("subtitle")}
            </p>

            {/* Quick stats */}
            <div className={`inline-flex flex-wrap justify-center items-center gap-6 px-8 py-4 rounded-2xl border border-zinc-800/30 bg-zinc-900/20 backdrop-blur-sm transition-all duration-[2s] delay-700 ${heroReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              {[
                { icon: "\u26A1", value: `${SYSCALLS.length}`, label: "Syscalls" },
                { icon: "\uD83D\uDCCA", value: `${CATEGORIES.length}`, label: "Categories" },
                { icon: "\uD83D\uDD27", value: "x86_64", label: "ABI" },
                { icon: "\uD83E\uDDEC", value: "6 regs", label: "System V" },
              ].map((st, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  {i > 0 && <div className="w-px h-5 bg-zinc-800/50" />}
                  <span className="text-sm">{st.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-white">{st.value}</div>
                    <div className="text-[8px] text-zinc-600">{st.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════
            MAIN WORKSPACE — 3-column layout
            ═══════════════════════════════════════════════════════ */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 pb-20">
          <div className="flex flex-col xl:flex-row gap-5">

            {/* -- LEFT: Syscall Palette -- */}
            <div className="xl:w-[280px] shrink-0 space-y-4">
              <div className="rounded-2xl border border-zinc-800/40 bg-[#0a0a0c]/80 backdrop-blur-xl overflow-hidden">
                {/* Palette header */}
                <div className="px-4 py-3 border-b border-zinc-800/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{"\uD83D\uDCE1"}</span>
                    <h2 className="text-xs font-bold text-white">{s("syscall_table")}</h2>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-helix-purple/10 border border-helix-purple/20 text-helix-purple">{SYSCALLS.length}/512</span>
                </div>

                {/* Search */}
                <div className="px-3 py-2 border-b border-zinc-800/20">
                  <div className="relative">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search syscalls..."
                      className="w-full pl-8 pr-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800/40 text-[11px] font-mono text-white placeholder-zinc-700 outline-none focus:border-helix-purple/40 transition-colors" />
                  </div>
                </div>

                {/* Category chips */}
                <div className="px-3 py-2 border-b border-zinc-800/20 flex flex-wrap gap-1.5">
                  <button onClick={() => setFilterCat(null)}
                    className={`px-2 py-1 text-[9px] font-bold rounded-lg border transition-all cursor-pointer ${!filterCat ? "bg-white/10 border-white/20 text-white" : "border-zinc-800/40 text-zinc-600 hover:text-white hover:border-zinc-700/40"}`}>
                    All
                  </button>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setFilterCat(filterCat === cat ? null : cat)}
                      className="px-2 py-1 text-[9px] font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1"
                      style={{
                        borderColor: filterCat === cat ? CATEGORY_COLORS[cat] + "50" : "rgba(39,39,42,0.4)",
                        background: filterCat === cat ? CATEGORY_COLORS[cat] + "12" : "transparent",
                        color: filterCat === cat ? CATEGORY_COLORS[cat] : "#71717A",
                      }}>
                      <span className="text-[8px]">{CATEGORY_ICONS[cat] || "\uD83D\uDCE6"}</span>
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Syscall list */}
                <div className="max-h-[55vh] overflow-y-auto">
                  {filtered.map((sc, i) => {
                    const isSelected = selectedSyscall?.id === sc.id;
                    return (
                      <button key={sc.id} onClick={() => { setSelectedSyscall(sc); setArgDraft({}); }}
                        className={`w-full text-left px-3 py-2.5 border-b border-zinc-800/15 transition-all cursor-pointer group ${
                          isSelected ? "bg-zinc-800/30" : "hover:bg-zinc-900/40"
                        }`} style={{ animation: `slideUp 0.2s ease ${i * 0.02}s both` }}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-mono font-black shrink-0"
                            style={{ background: sc.color + "12", color: sc.color, border: `1px solid ${sc.color}25` }}>
                            {sc.number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold font-mono text-white group-hover:text-white/90 truncate">{sc.name}</span>
                              {sc.privilege === "Ring 0" && (
                                <span className="text-[7px] px-1 py-0.5 rounded bg-amber-500/10 text-amber-500/60 font-mono shrink-0">R0</span>
                              )}
                            </div>
                            <p className="text-[9px] text-zinc-600 truncate mt-0.5">{sc.description.slice(0, 60)}...</p>
                          </div>
                          {isSelected && <div className="w-1 h-7 rounded-full shrink-0" style={{ background: sc.color }} />}
                        </div>
                      </button>
                    );
                  })}
                  {filtered.length === 0 && (
                    <div className="p-8 text-center">
                      <span className="text-2xl block mb-2">{"\uD83D\uDD0D"}</span>
                      <p className="text-zinc-600 text-xs">No matching syscalls</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* -- CENTER: Detail + Flow + Registers + Terminal -- */}
            <div className="flex-1 min-w-0 space-y-5">
              {!selectedSyscall ? (
                /* Empty state */
                <div className="rounded-2xl border border-zinc-800/30 bg-[#0a0a0c]/60 backdrop-blur-xl overflow-hidden">
                  <div className="flex items-center justify-center min-h-[500px]">
                    <div className="text-center space-y-6 px-8">
                      <div className="relative w-24 h-24 mx-auto" style={{ animation: "float 4s ease-in-out infinite" }}>
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-helix-purple/10 to-helix-blue/10 border border-helix-purple/10" style={{ animation: "pulseRing 3s ease infinite" }} />
                        <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-helix-purple via-indigo-500 to-helix-blue flex items-center justify-center shadow-2xl shadow-helix-purple/20">
                          <svg className="w-10 h-10 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">{s("select_syscall")}</h3>
                        <p className="text-sm text-zinc-600 max-w-sm mx-auto">Browse the syscall palette, inspect arguments, build execution sequences, and simulate kernel behavior.</p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {CATEGORIES.slice(0, 5).map(cat => (
                          <button key={cat} onClick={() => { setFilterCat(cat); setSelectedSyscall(SYSCALLS.find(sc => sc.category === cat) || null); }}
                            className="px-3 py-1.5 rounded-lg border border-zinc-800/30 text-[10px] font-bold text-zinc-500 hover:text-white hover:border-zinc-700/40 transition-all cursor-pointer flex items-center gap-1.5">
                            <span>{CATEGORY_ICONS[cat]}</span>{cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Syscall detail card */}
                  <div className="rounded-2xl border border-zinc-800/40 bg-[#0a0a0c]/80 backdrop-blur-xl overflow-hidden fade-scale">
                    {/* Header bar */}
                    <div className="px-5 py-4 border-b border-zinc-800/30 flex items-start justify-between gap-4" style={{ background: `linear-gradient(135deg, ${selectedSyscall.color}06, transparent)` }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg" style={{ color: selectedSyscall.color, background: selectedSyscall.color + "15", border: `1px solid ${selectedSyscall.color}25` }}>
                            #{selectedSyscall.number}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-600 px-2 py-0.5 rounded-md bg-zinc-800/40">{selectedSyscall.category}</span>
                          {selectedSyscall.privilege && (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${selectedSyscall.privilege === "Ring 0" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"}`}>
                              {selectedSyscall.privilege}
                            </span>
                          )}
                          {selectedSyscall.complexity && <span className="text-[9px] font-mono text-zinc-600 px-2 py-0.5 rounded-md bg-zinc-800/30">{selectedSyscall.complexity}</span>}
                          {selectedSyscall.latency && <span className="text-[9px] font-mono text-cyan-500/60 px-2 py-0.5 rounded-md bg-cyan-500/5">{"\u23F1"} {selectedSyscall.latency}</span>}
                        </div>
                        <h3 className="text-xl font-black font-mono" style={{ color: selectedSyscall.color }}>{selectedSyscall.name}</h3>
                        <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">{selectedSyscall.description}</p>
                      </div>
                      <button onClick={addToQueue}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-helix-purple/20 to-helix-blue/20 border border-helix-purple/25 text-white text-xs font-bold hover:from-helix-purple/30 hover:to-helix-blue/30 transition-all flex items-center gap-2 cursor-pointer shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                        style={{ boxShadow: "0 0 20px rgba(123,104,238,0.1)" }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        {s("add_to_queue")}
                      </button>
                    </div>

                    {/* Syscall flow diagram */}
                    <div className="px-5 py-2 border-b border-zinc-800/20 bg-zinc-900/10">
                      <SyscallFlowDiagram syscall={selectedSyscall} isExecuting={currentExec >= 0 && queue[currentExec]?.syscall.id === selectedSyscall.id} result={queue.find(q => q.syscall.id === selectedSyscall.id)?.result} />
                    </div>

                    {/* Arguments form */}
                    {selectedSyscall.args.length > 0 && (
                      <div className="px-5 py-4 border-b border-zinc-800/20">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                          {s("arguments")} <span className="text-zinc-700">({selectedSyscall.args.length})</span>
                        </p>
                        <div className="space-y-2">
                          {selectedSyscall.args.map((arg, i) => (
                            <div key={arg.name} className="flex items-center gap-3 bg-zinc-900/30 rounded-xl p-3 border border-zinc-800/25 hover:border-zinc-700/30 transition-all group"
                              style={{ animation: `slideUp 0.2s ease ${i * 0.05}s both` }}>
                              <div className="flex flex-col items-center w-10 shrink-0">
                                <span className="text-[8px] font-mono text-zinc-700 px-1.5 py-0.5 rounded bg-zinc-800/40">{REGISTERS[i] || `stk${i - 6}`}</span>
                              </div>
                              <div className="w-20 shrink-0">
                                <span className="text-xs font-mono font-bold text-white">{arg.name}</span>
                                <span className="block text-[8px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/50 text-zinc-600 mt-0.5 w-fit">{arg.type}</span>
                              </div>
                              <input placeholder={arg.desc} value={argDraft[arg.name] || ""}
                                onChange={e => setArgDraft(prev => ({ ...prev, [arg.name]: e.target.value }))}
                                className="flex-1 bg-black/30 border border-zinc-800/40 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-700 focus:outline-none focus:border-helix-purple/40 focus:ring-1 focus:ring-helix-purple/10 transition-all" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Return info + errno + example */}
                    <div className="px-5 py-4 space-y-3">
                      <div className="flex flex-wrap gap-3">
                        <div className="flex-1 min-w-[200px] p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                          <span className="text-[9px] text-emerald-500/60 font-bold uppercase">Returns</span>
                          <p className="text-sm font-mono font-bold text-emerald-400 mt-1">{selectedSyscall.returnType}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{selectedSyscall.returnDesc}</p>
                        </div>
                        {selectedSyscall.errno && (
                          <div className="flex-1 min-w-[200px] p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                            <span className="text-[9px] text-red-500/60 font-bold uppercase">Possible Errors</span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {selectedSyscall.errno.map(e => (
                                <span key={e} className="text-[9px] font-mono px-2 py-0.5 rounded-lg bg-red-500/8 border border-red-500/15 text-red-400/80">{e}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {selectedSyscall.example && (
                        <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/30">
                          <span className="text-[9px] text-zinc-600 font-bold uppercase">Example</span>
                          <code className="block text-xs font-mono text-helix-blue mt-1.5">{selectedSyscall.example}</code>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CPU Register visualization */}
                  <div className="rounded-2xl border border-zinc-800/40 bg-[#0a0a0c]/80 backdrop-blur-xl overflow-hidden fade-scale" style={{ animationDelay: "0.1s" }}>
                    <div className="px-5 py-3 border-b border-zinc-800/30 flex items-center gap-2">
                      <span className="text-sm">{"\uD83D\uDD32"}</span>
                      <h3 className="text-xs font-bold text-white">CPU Registers</h3>
                      <span className="text-[9px] text-zinc-600 font-mono ml-auto">x86_64 System V ABI</span>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {/* RAX — syscall number */}
                        <div className="relative p-3 rounded-xl border overflow-hidden group"
                          style={{ borderColor: `${selectedSyscall.color}25`, background: `${selectedSyscall.color}06` }}>
                          <div className="absolute inset-0 shimmer-bg opacity-50" />
                          <div className="relative">
                            <span className="text-[9px] font-mono font-bold text-zinc-500">rax</span>
                            <p className="text-sm font-mono font-black mt-0.5" style={{ color: selectedSyscall.color }}>0x{selectedSyscall.number.toString(16).padStart(4, "0")}</p>
                            <p className="text-[8px] text-zinc-600 mt-0.5">syscall #</p>
                          </div>
                        </div>
                        {/* Argument registers */}
                        {REGISTERS.map((reg, i) => {
                          const arg = selectedSyscall.args[i];
                          const val = arg ? (argDraft[arg.name] || "\u2014") : "\u2014";
                          const hasValue = arg && argDraft[arg.name];
                          return (
                            <div key={reg} className={`p-3 rounded-xl border transition-all ${hasValue ? "border-zinc-700/40 bg-zinc-800/15" : "border-zinc-800/20 bg-zinc-900/15"}`}>
                              <span className="text-[9px] font-mono font-bold text-zinc-600">{reg}</span>
                              <p className={`text-xs font-mono font-bold mt-0.5 truncate ${hasValue ? "text-white" : arg ? "text-zinc-700" : "text-zinc-800"}`}>{val}</p>
                              <p className="text-[8px] text-zinc-700 mt-0.5 truncate">{arg?.name || "unused"}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Kernel Terminal */}
              <div className="fade-scale" style={{ animationDelay: "0.2s" }}>
                <KernelTerminal logs={terminalLogs} />
              </div>
            </div>

            {/* -- RIGHT: Execution Queue + Stats -- */}
            <div className="xl:w-[320px] shrink-0 space-y-4">
              {/* Stats */}
              <ExecutionStats queue={queue} />

              {/* Queue panel */}
              <div className="rounded-2xl border border-zinc-800/40 bg-[#0a0a0c]/80 backdrop-blur-xl overflow-hidden">
                {/* Queue header */}
                <div className="px-4 py-3 border-b border-zinc-800/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{"\uD83D\uDE80"}</span>
                    <h2 className="text-xs font-bold text-white">{s("execution_queue")}</h2>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-zinc-800/40 text-zinc-500">{queue.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {queue.length > 0 && (
                      <button onClick={clearQueue} className="text-[10px] text-zinc-600 hover:text-red-400 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-red-500/5">
                        {s("clear")}
                      </button>
                    )}
                    <button onClick={executeQueue} disabled={queue.length === 0 || isRunning}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        queue.length > 0 && !isRunning
                          ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
                          : "bg-zinc-900 text-zinc-700 cursor-not-allowed"
                      }`}>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      {isRunning ? s("running") : s("execute")}
                    </button>
                  </div>
                </div>

                {/* Queue items */}
                <div ref={queueRef} className="max-h-[55vh] overflow-y-auto">
                  {queue.length === 0 ? (
                    <div className="flex items-center justify-center py-16 px-6">
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-900/50 border border-dashed border-zinc-800/40 flex items-center justify-center">
                          <svg className="w-6 h-6 text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                        </div>
                        <div>
                          <p className="text-zinc-600 text-xs font-medium">Add syscalls from the palette</p>
                          <p className="text-zinc-800 text-[10px] mt-0.5">Then hit Execute to simulate</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1.5">
                      {queue.map((entry, i) => {
                        const isExec = currentExec === i;
                        const isDone = entry.result !== undefined;
                        return (
                          <div key={entry.id}
                            className={`rounded-xl border p-3 transition-all ${
                              isExec ? "bg-helix-purple/5 border-helix-purple/30 exec-glow" :
                              isDone ? entry.result?.success ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
                              : "bg-zinc-900/20 border-zinc-800/25 hover:border-zinc-700/30"
                            }`} style={{ animation: `slideUp 0.2s ease ${i * 0.03}s both` }}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-mono font-black"
                                  style={{ background: entry.syscall.color + "15", color: entry.syscall.color }}>
                                  {i + 1}
                                </div>
                                <span className="text-[11px] font-mono font-bold" style={{ color: entry.syscall.color }}>{entry.syscall.name}</span>
                              </div>
                              {!isRunning && !isDone && (
                                <button onClick={() => removeFromQueue(entry.id)} className="text-zinc-700 hover:text-red-400 transition-colors cursor-pointer p-1 rounded-lg hover:bg-red-500/5">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              )}
                            </div>

                            {/* Args */}
                            {Object.keys(entry.argValues).length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {Object.entries(entry.argValues).filter(([, v]) => v).map(([k, v]) => (
                                  <span key={k} className="text-[8px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-800/40 text-zinc-500">
                                    {k}=<span className="text-zinc-400">{v}</span>
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Executing animation */}
                            {isExec && (
                              <div className="flex items-center gap-2 mt-2 px-2 py-1.5 rounded-lg bg-helix-purple/5 border border-helix-purple/15">
                                <div className="flex gap-1">
                                  {[0, 1, 2].map(j => (
                                    <span key={j} className="w-1.5 h-1.5 rounded-full bg-helix-purple animate-bounce" style={{ animationDelay: `${j * 150}ms` }} />
                                  ))}
                                </div>
                                <span className="text-[9px] text-helix-purple font-mono">ring3 {"\u2192"} syscall {"\u2192"} ring0</span>
                              </div>
                            )}

                            {/* Result */}
                            {isDone && entry.result && (
                              <div className={`mt-2 p-2.5 rounded-lg text-[10px] font-mono ${entry.result.success ? "bg-emerald-500/8 border border-emerald-500/15" : "bg-red-500/8 border border-red-500/15"}`}>
                                <div className="flex items-center justify-between">
                                  <span className={entry.result.success ? "text-emerald-400" : "text-red-400"}>
                                    {entry.result.success ? "\u2713" : "\u2717"} rax = {entry.result.value}
                                  </span>
                                  <span className="text-zinc-600">{entry.result.duration}{"\u03BC"}s</span>
                                </div>
                                {entry.result.errno && <p className="text-red-400/60 mt-1 text-[9px]">errno: {entry.result.errno}</p>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Queue footer with totals */}
                {queue.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-zinc-800/30 flex items-center justify-between">
                    <span className="text-[9px] text-zinc-600 font-mono">{queue.filter(q => q.result).length}/{queue.length} executed</span>
                    {successRate > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 rounded-full bg-zinc-800/60 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${successRate}%`, background: successRate >= 80 ? "#22C55E" : successRate >= 50 ? "#F59E0B" : "#EF4444" }} />
                        </div>
                        <span className="text-[9px] font-mono" style={{ color: successRate >= 80 ? "#22C55E" : successRate >= 50 ? "#F59E0B" : "#EF4444" }}>{successRate}%</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Total session stats */}
              {totalExecutions > 0 && (
                <div className="rounded-2xl border border-zinc-800/30 bg-zinc-900/20 p-4 text-center">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">Session Total</p>
                  <p className="text-2xl font-black text-helix-purple mt-1">{totalExecutions}</p>
                  <p className="text-[10px] text-zinc-600">syscalls executed</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            CTA FOOTER
            ═══════════════════════════════════════════════════════ */}
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <div className="rounded-3xl border border-helix-purple/15 bg-gradient-to-br from-helix-purple/5 to-transparent p-10 text-center">
            <HelixLogo className="w-14 h-14 mx-auto mb-5 opacity-25" />
            <h2 className="text-xl md:text-2xl font-black text-white mb-3">Dive Deeper</h2>
            <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
              Explore the syscall framework source code, the kernel architecture, or learn how to implement your own system calls.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/docs/core" className="px-5 py-2.5 rounded-xl bg-helix-purple/10 border border-helix-purple/20 text-helix-purple font-bold text-sm hover:bg-helix-purple/20 transition-all">
                Syscall Framework {"\u2192"}
              </Link>
              <Link href="/docs/architecture" className="px-5 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/40 text-zinc-400 font-bold text-sm hover:text-white hover:border-zinc-700 transition-all">
                Architecture Docs
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
