"use client";
import { useState, useCallback, useRef } from "react";
import Footer from "@/helix-wiki/components/Footer";
import Link from "next/link";

/* ── Syscall definitions ── */
interface SyscallDef {
  id: string;
  name: string;
  number: number;
  category: string;
  color: string;
  description: string;
  args: { name: string; type: string; desc: string }[];
  returnType: string;
  returnDesc: string;
  example?: string;
  errno?: string[];
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
    returnType: "isize",
    returnDesc: "Number of bytes written on success, negative errno on failure",
    example: 'sys_write(1, "Hello, Helix!\\n", 14)',
    errno: ["EBADF (9): Bad file descriptor", "EFAULT (14): Bad address", "EINVAL (22): Invalid argument"],
  },
  {
    id: "read", name: "sys_read", number: 0, category: "I/O", color: "#4A90E2",
    description: "Read bytes from a file descriptor into a user buffer.",
    args: [
      { name: "fd", type: "u64", desc: "File descriptor to read from" },
      { name: "buf", type: "*mut u8", desc: "Pointer to destination buffer" },
      { name: "count", type: "usize", desc: "Maximum number of bytes to read" },
    ],
    returnType: "isize",
    returnDesc: "Number of bytes read, 0 on EOF, negative errno on failure",
    errno: ["EBADF (9): Bad file descriptor", "EFAULT (14): Bad address"],
  },
  {
    id: "open", name: "sys_open", number: 2, category: "File System", color: "#22C55E",
    description: "Open a file at the given path. Returns a new file descriptor or an error.",
    args: [
      { name: "path", type: "*const u8", desc: "Null-terminated path string" },
      { name: "flags", type: "u32", desc: "O_RDONLY=0, O_WRONLY=1, O_RDWR=2, O_CREAT=0x40" },
      { name: "mode", type: "u32", desc: "Permission bits if creating (e.g. 0o644)" },
    ],
    returnType: "isize",
    returnDesc: "File descriptor on success, negative errno on failure",
    example: 'sys_open("/etc/helix.conf", O_RDONLY, 0)',
    errno: ["ENOENT (2): No such file", "EACCES (13): Permission denied", "EMFILE (24): Too many open files"],
  },
  {
    id: "close", name: "sys_close", number: 3, category: "File System", color: "#22C55E",
    description: "Close a file descriptor, releasing associated kernel resources.",
    args: [{ name: "fd", type: "u64", desc: "File descriptor to close" }],
    returnType: "isize",
    returnDesc: "0 on success, negative errno on failure",
    errno: ["EBADF (9): Bad file descriptor"],
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
    returnType: "*mut u8",
    returnDesc: "Pointer to mapped region, or MAP_FAILED on error",
    example: "sys_mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_ANON|MAP_PRIVATE)",
    errno: ["ENOMEM (12): Out of memory", "EINVAL (22): Invalid flags"],
  },
  {
    id: "munmap", name: "sys_munmap", number: 11, category: "Memory", color: "#7B68EE",
    description: "Unmap previously mapped memory pages.",
    args: [
      { name: "addr", type: "*mut u8", desc: "Start address (page-aligned)" },
      { name: "length", type: "usize", desc: "Size to unmap" },
    ],
    returnType: "isize",
    returnDesc: "0 on success, negative errno on failure",
    errno: ["EINVAL (22): Invalid address or length"],
  },
  {
    id: "fork", name: "sys_fork", number: 57, category: "Process", color: "#F59E0B",
    description: "Create a child process. Both parent and child continue from the return of fork.",
    args: [],
    returnType: "isize",
    returnDesc: "Child PID in parent, 0 in child, negative errno on failure",
    errno: ["ENOMEM (12): Out of memory", "EAGAIN (11): Resource temporarily unavailable"],
  },
  {
    id: "exec", name: "sys_execve", number: 59, category: "Process", color: "#F59E0B",
    description: "Replace the current process image with a new program.",
    args: [
      { name: "path", type: "*const u8", desc: "Path to executable" },
      { name: "argv", type: "*const *const u8", desc: "Argument array (null-terminated)" },
      { name: "envp", type: "*const *const u8", desc: "Environment array (null-terminated)" },
    ],
    returnType: "isize",
    returnDesc: "Does not return on success, negative errno on failure",
    example: 'sys_execve("/bin/hsh", argv, envp)',
    errno: ["ENOENT (2): No such file", "EACCES (13): Permission denied", "ENOEXEC (8): Bad format"],
  },
  {
    id: "exit", name: "sys_exit", number: 60, category: "Process", color: "#F59E0B",
    description: "Terminate the calling process immediately.",
    args: [{ name: "status", type: "i32", desc: "Exit code (0 = success)" }],
    returnType: "!",
    returnDesc: "Does not return",
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
    returnType: "isize",
    returnDesc: "0 on success, negative errno on failure",
    errno: ["ESRCH (3): No such process", "EINVAL (22): Invalid priority", "ENOMEM (12): Kernel buffer full"],
  },
  {
    id: "ipc_recv", name: "sys_ipc_recv", number: 201, category: "IPC", color: "#EC4899",
    description: "Receive a pending IPC message. Blocks if no message available.",
    args: [
      { name: "buf", type: "*mut u8", desc: "Destination buffer" },
      { name: "max_len", type: "usize", desc: "Buffer capacity" },
      { name: "timeout_ms", type: "u64", desc: "Timeout in ms (0 = infinite)" },
    ],
    returnType: "isize",
    returnDesc: "Message length on success, negative errno on failure",
    errno: ["ETIMEDOUT (110): Timed out", "EINTR (4): Interrupted"],
  },
  {
    id: "nexus_query", name: "sys_nexus_query", number: 300, category: "NEXUS", color: "#22D3EE",
    description: "Query the NEXUS AI subsystem for system health, predictions, or anomaly reports.",
    args: [
      { name: "query_type", type: "u32", desc: "0=health, 1=predict, 2=anomalies, 3=recommendations" },
      { name: "buf", type: "*mut u8", desc: "Output buffer for JSON response" },
      { name: "buf_len", type: "usize", desc: "Buffer capacity" },
    ],
    returnType: "isize",
    returnDesc: "Response length in bytes, negative errno on failure",
    example: "sys_nexus_query(0, buf, 4096)  // get health report",
    errno: ["ENOSYS (38): NEXUS not available", "ENOMEM (12): Buffer too small"],
  },
];

const CATEGORIES = [...new Set(SYSCALLS.map(s => s.category))];
const CATEGORY_COLORS: Record<string, string> = {};
SYSCALLS.forEach(s => { CATEGORY_COLORS[s.category] = s.color; });

interface QueuedSyscall {
  id: string;
  syscall: SyscallDef;
  argValues: Record<string, string>;
  result?: { success: boolean; value: string; errno?: string; duration: number };
}

const REGISTERS = ["rdi", "rsi", "rdx", "r10", "r8", "r9"] as const;

export default function PlaygroundPage() {
  const [queue, setQueue] = useState<QueuedSyscall[]>([]);
  const [selectedSyscall, setSelectedSyscall] = useState<SyscallDef | null>(null);
  const [argDraft, setArgDraft] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentExec, setCurrentExec] = useState(-1);
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const queueRef = useRef<HTMLDivElement>(null);

  const addToQueue = useCallback(() => {
    if (!selectedSyscall) return;
    const entry: QueuedSyscall = {
      id: `${selectedSyscall.id}-${Date.now()}`,
      syscall: selectedSyscall,
      argValues: { ...argDraft },
    };
    setQueue(prev => [...prev, entry]);
    setArgDraft({});
    setTimeout(() => queueRef.current?.scrollTo({ top: queueRef.current.scrollHeight, behavior: "smooth" }), 50);
  }, [selectedSyscall, argDraft]);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(q => q.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentExec(-1);
  }, []);

  const executeQueue = useCallback(async () => {
    setIsRunning(true);
    for (let i = 0; i < queue.length; i++) {
      setCurrentExec(i);
      const entry = queue[i];
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

      const success = Math.random() > 0.15; // 85% success rate
      const duration = Math.round(0.1 + Math.random() * 2.5);
      const result = success
        ? { success: true, value: simulateReturn(entry.syscall), duration }
        : {
            success: false,
            value: "-1",
            errno: entry.syscall.errno?.[Math.floor(Math.random() * (entry.syscall.errno?.length || 1))] || "ENOSYS (38)",
            duration,
          };

      setQueue(prev => prev.map((q, qi) => qi === i ? { ...q, result } : q));
    }
    setCurrentExec(-1);
    setIsRunning(false);
  }, [queue]);

  function simulateReturn(sc: SyscallDef): string {
    switch (sc.id) {
      case "write": return "14";
      case "read": return "256";
      case "open": return "3";
      case "close": return "0";
      case "mmap": return "0x7f4a2c000000";
      case "munmap": return "0";
      case "fork": return "1234";
      case "exec": return "(does not return)";
      case "exit": return "(terminated)";
      case "ipc_send": return "0";
      case "ipc_recv": return "128";
      case "nexus_query": return "2048";
      default: return "0";
    }
  }

  const filtered = filterCat ? SYSCALLS.filter(s => s.category === filterCat) : SYSCALLS;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-helix-purple/40">
      <div className="fixed inset-0 bg-grid opacity-5 pointer-events-none" />

      <style>{`
        @keyframes slideIn { 0% { opacity:0; transform:translateX(-8px); } 100% { opacity:1; transform:translateX(0); } }
        @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(123,104,238,0.4); } 100% { box-shadow: 0 0 0 12px rgba(123,104,238,0); } }
        .slide-in { animation: slideIn 0.2s ease; }
        .exec-pulse { animation: pulse-ring 0.8s ease infinite; }
      `}</style>

      <main className="relative">
        {/* Header */}
        <div className="pt-28 pb-8 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-6 inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Home
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-helix-purple/10 border border-helix-purple/20 text-helix-purple text-xs font-mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-helix-purple animate-pulse" />
              Interactive Sandbox
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-helix-purple via-helix-blue to-helix-accent">Syscall Playground</span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Build syscall sequences, set register arguments, and simulate kernel execution — all from your browser.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pb-16">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Syscall palette */}
            <div className="lg:w-72 shrink-0 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-sm font-bold text-zinc-300">Syscall Table</h2>
                <span className="text-[10px] text-zinc-600 font-mono">{SYSCALLS.length}/512</span>
              </div>

              {/* Category filter */}
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setFilterCat(null)}
                  className={`px-2.5 py-1 text-[10px] font-mono rounded-md border transition-colors cursor-pointer ${!filterCat ? "bg-white/10 border-white/20 text-white" : "border-zinc-800 text-zinc-600 hover:text-white"}`}>
                  All
                </button>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setFilterCat(filterCat === cat ? null : cat)}
                    className="px-2.5 py-1 text-[10px] font-mono rounded-md border transition-colors cursor-pointer"
                    style={{
                      borderColor: filterCat === cat ? CATEGORY_COLORS[cat] + "50" : "#27272a",
                      background: filterCat === cat ? CATEGORY_COLORS[cat] + "15" : "transparent",
                      color: filterCat === cat ? CATEGORY_COLORS[cat] : "#71717A",
                    }}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* Syscall list */}
              <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
                {filtered.map(sc => {
                  const isSelected = selectedSyscall?.id === sc.id;
                  return (
                    <button key={sc.id} onClick={() => { setSelectedSyscall(sc); setArgDraft({}); }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-zinc-900/80 border-zinc-700/60 shadow-lg"
                          : "bg-zinc-950/30 border-zinc-900/30 hover:bg-zinc-900/40 hover:border-zinc-800"
                      }`}>
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-right text-[10px] font-mono text-zinc-600">{sc.number}</span>
                        <span className="text-xs font-bold font-mono" style={{ color: sc.color }}>{sc.name}</span>
                      </div>
                      <p className="text-[9px] text-zinc-600 mt-0.5 ml-8 truncate">{sc.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Center: Detail + Args */}
            <div className="flex-1 space-y-4">
              {!selectedSyscall ? (
                <div className="flex items-center justify-center h-64 rounded-xl border border-zinc-800/40 bg-zinc-900/20">
                  <div className="text-center space-y-3">
                    <div className="text-3xl">🔍</div>
                    <p className="text-zinc-600 text-sm">Select a syscall from the palette to inspect it</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Syscall detail card */}
                  <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-5 slide-in">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ color: selectedSyscall.color, background: selectedSyscall.color + "15", border: `1px solid ${selectedSyscall.color}30` }}>
                            #{selectedSyscall.number}
                          </span>
                          <span className="text-[10px] text-zinc-600 font-mono">{selectedSyscall.category}</span>
                        </div>
                        <h3 className="text-lg font-bold font-mono mt-1" style={{ color: selectedSyscall.color }}>{selectedSyscall.name}</h3>
                      </div>
                      <button onClick={addToQueue}
                        className="px-4 py-2 rounded-lg bg-helix-purple/20 border border-helix-purple/30 text-helix-purple text-xs font-bold hover:bg-helix-purple/30 transition-colors flex items-center gap-1.5 cursor-pointer">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        Add to Queue
                      </button>
                    </div>
                    <p className="text-sm text-zinc-400 mb-4">{selectedSyscall.description}</p>

                    {/* Args form */}
                    {selectedSyscall.args.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Arguments</p>
                        {selectedSyscall.args.map((arg, i) => (
                          <div key={arg.name} className="flex items-center gap-3 bg-black/30 rounded-lg p-2.5 border border-zinc-800/30">
                            <div className="flex items-center gap-2 w-32 shrink-0">
                              <span className="text-[9px] text-zinc-700 font-mono">{REGISTERS[i] || `stack[${i - 6}]`}</span>
                              <span className="text-xs font-mono font-bold text-white">{arg.name}</span>
                            </div>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">{arg.type}</span>
                            <input
                              placeholder={arg.desc}
                              value={argDraft[arg.name] || ""}
                              onChange={e => setArgDraft(prev => ({ ...prev, [arg.name]: e.target.value }))}
                              className="flex-1 bg-zinc-900/50 border border-zinc-800/50 rounded px-2.5 py-1.5 text-xs font-mono text-white placeholder:text-zinc-700 focus:outline-none focus:border-helix-purple/50 transition-colors"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Return + errno */}
                    <div className="flex gap-4 text-[10px]">
                      <div>
                        <span className="text-zinc-600">Returns: </span>
                        <span className="font-mono text-emerald-400">{selectedSyscall.returnType}</span>
                        <span className="text-zinc-600 ml-1">— {selectedSyscall.returnDesc}</span>
                      </div>
                    </div>
                    {selectedSyscall.errno && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {selectedSyscall.errno.map(e => (
                          <span key={e} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400">{e}</span>
                        ))}
                      </div>
                    )}
                    {selectedSyscall.example && (
                      <div className="mt-3 bg-black/40 rounded-lg p-3 border border-zinc-800/30">
                        <p className="text-[9px] text-zinc-600 mb-1">Example</p>
                        <code className="text-xs font-mono text-helix-blue">{selectedSyscall.example}</code>
                      </div>
                    )}
                  </div>

                  {/* Register preview */}
                  <div className="rounded-xl border border-zinc-800/40 bg-zinc-900/20 p-4">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3">Register State (x86_64 System V ABI)</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <div className="bg-black/40 rounded-lg p-2 border border-zinc-800/30">
                        <span className="text-[9px] font-mono text-zinc-600">rax</span>
                        <p className="text-xs font-mono font-bold text-amber-400 mt-0.5">0x{selectedSyscall.number.toString(16).padStart(2, "0")}</p>
                        <p className="text-[8px] text-zinc-700 mt-0.5">syscall number</p>
                      </div>
                      {REGISTERS.map((reg, i) => {
                        const arg = selectedSyscall.args[i];
                        const val = arg ? (argDraft[arg.name] || "—") : "—";
                        return (
                          <div key={reg} className="bg-black/40 rounded-lg p-2 border border-zinc-800/30">
                            <span className="text-[9px] font-mono text-zinc-600">{reg}</span>
                            <p className={`text-xs font-mono font-bold mt-0.5 truncate ${arg ? "text-white" : "text-zinc-800"}`}>{val}</p>
                            <p className="text-[8px] text-zinc-700 mt-0.5">{arg?.name || "unused"}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right: Execution queue */}
            <div className="lg:w-80 shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-zinc-300">Execution Queue</h2>
                  <span className="text-[10px] text-zinc-600 font-mono">{queue.length} syscalls</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {queue.length > 0 && (
                    <button onClick={clearQueue} className="text-[10px] text-zinc-600 hover:text-red-400 transition-colors cursor-pointer px-2 py-1">
                      Clear
                    </button>
                  )}
                  <button onClick={executeQueue} disabled={queue.length === 0 || isRunning}
                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      queue.length > 0 && !isRunning
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20"
                        : "bg-zinc-900 text-zinc-700 cursor-not-allowed"
                    }`}>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    {isRunning ? "Running..." : "Execute"}
                  </button>
                </div>
              </div>

              <div ref={queueRef} className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                {queue.length === 0 && (
                  <div className="flex items-center justify-center h-40 rounded-xl border border-dashed border-zinc-800/40 bg-zinc-900/10">
                    <div className="text-center space-y-2">
                      <p className="text-zinc-700 text-xs">Add syscalls from the palette →</p>
                      <p className="text-zinc-800 text-[10px]">Then hit Execute to simulate</p>
                    </div>
                  </div>
                )}

                {queue.map((entry, i) => {
                  const isExec = currentExec === i;
                  const isDone = entry.result !== undefined;
                  return (
                    <div key={entry.id}
                      className={`rounded-lg border p-3 transition-all ${
                        isExec
                          ? "bg-zinc-900/80 border-helix-purple/40 exec-pulse"
                          : isDone
                          ? entry.result?.success
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : "bg-red-500/5 border-red-500/20"
                          : "bg-zinc-900/20 border-zinc-800/30"
                      }`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-zinc-700 font-mono">#{i + 1}</span>
                          <span className="text-xs font-mono font-bold" style={{ color: entry.syscall.color }}>{entry.syscall.name}</span>
                        </div>
                        {!isRunning && !isDone && (
                          <button onClick={() => removeFromQueue(entry.id)} className="text-zinc-700 hover:text-red-400 transition-colors cursor-pointer p-0.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                      </div>

                      {/* Args summary */}
                      {Object.keys(entry.argValues).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {Object.entries(entry.argValues).filter(([, v]) => v).map(([k, v]) => (
                            <span key={k} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/50 text-zinc-500">
                              {k}={v}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Execution indicator */}
                      {isExec && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-helix-purple animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1 h-1 rounded-full bg-helix-purple animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1 h-1 rounded-full bg-helix-purple animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                          <span className="text-[9px] text-helix-purple font-mono">SYSCALL → kernel</span>
                        </div>
                      )}

                      {/* Result */}
                      {isDone && entry.result && (
                        <div className={`mt-2 p-2 rounded-md text-[10px] font-mono ${entry.result.success ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                          <div className="flex items-center justify-between">
                            <span className={entry.result.success ? "text-emerald-400" : "text-red-400"}>
                              {entry.result.success ? "✓" : "✗"} rax = {entry.result.value}
                            </span>
                            <span className="text-zinc-600">{entry.result.duration}μs</span>
                          </div>
                          {entry.result.errno && (
                            <p className="text-red-400/70 mt-1">errno: {entry.result.errno}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
