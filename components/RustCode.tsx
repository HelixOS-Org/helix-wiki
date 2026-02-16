"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";

interface Props {
  children: string;
  filename?: string;
  language?: string;
}

/* ═══════════════════════════════════════════════
   TOKEN TYPES & SYNTAX HIGHLIGHTING
   ═══════════════════════════════════════════════ */
type TT =
  | "kw" | "ctrl" | "ty" | "bi" | "str" | "chr"
  | "cmt" | "num" | "mac" | "attr" | "lt"
  | "op" | "punc" | "fn" | "cst" | "slf" | "plain";

const C: Record<TT, string> = {
  kw: "#C678DD", ctrl: "#C678DD", ty: "#E5C07B", bi: "#56B6C2",
  str: "#98C379", chr: "#98C379", cmt: "#5C6370", num: "#D19A66",
  mac: "#61AFEF", attr: "#D19A66", lt: "#E06C75", op: "#56B6C2",
  punc: "#ABB2BF", fn: "#61AFEF", cst: "#D19A66", slf: "#E06C75",
  plain: "#ABB2BF",
};

const KW = new Set(["fn","let","mut","const","static","struct","enum","trait","impl","type","where","pub","crate","mod","use","super","as","in","ref","move","unsafe","extern","async","await","dyn","box","union","macro"]);
const CT = new Set(["if","else","match","for","while","loop","break","continue","return","yield"]);
const BI = new Set(["Some","None","Ok","Err","Result","Option","Vec","Box","Arc","Rc","String","Copy","Clone","Debug","Display","Default","Send","Sync","Sized","Unpin","Drop","Fn","FnMut","FnOnce","Iterator","IntoIterator","From","Into","TryFrom","TryInto","AsRef","AsMut","Deref","DerefMut","Read","Write","true","false","PhantomData","HashMap","BTreeMap","Mutex","RwLock","Cell","RefCell","Pin","Cow","Weak"]);
const TY = new Set(["u8","u16","u32","u64","u128","usize","i8","i16","i32","i64","i128","isize","f32","f64","bool","char","str","Self"]);

/* ═══════════════ Tokenizer ═══════════════ */
function tok(code: string): { t: TT; v: string }[] {
  const out: { t: TT; v: string }[] = [];
  let i = 0;
  const len = code.length;
  while (i < len) {
    const ch = code[i];
    if (ch === "/" && code[i + 1] === "/") { let e = code.indexOf("\n", i); if (e === -1) e = len; out.push({ t: "cmt", v: code.slice(i, e) }); i = e; continue; }
    if (ch === "/" && code[i + 1] === "*") { let d = 1, j = i + 2; while (j < len && d > 0) { if (code[j] === "/" && code[j + 1] === "*") { d++; j += 2; } else if (code[j] === "*" && code[j + 1] === "/") { d--; j += 2; } else j++; } out.push({ t: "cmt", v: code.slice(i, j) }); i = j; continue; }
    if (ch === "#" && (code[i + 1] === "[" || (code[i + 1] === "!" && code[i + 2] === "["))) { let d = 0, j = i; while (j < len) { if (code[j] === "[") d++; else if (code[j] === "]") { d--; if (d === 0) { j++; break; } } j++; } out.push({ t: "attr", v: code.slice(i, j) }); i = j; continue; }
    if (ch === '"') { let j = i + 1; while (j < len && !(code[j] === '"' && code[j - 1] !== "\\")) j++; out.push({ t: "str", v: code.slice(i, j + 1) }); i = j + 1; continue; }
    if (ch === "r" && code[i + 1] === "#" && code[i + 2] === '"') { let j = i + 3; while (j < len && !(code[j] === '"' && code[j + 1] === "#")) j++; out.push({ t: "str", v: code.slice(i, j + 2) }); i = j + 2; continue; }
    if (ch === "'" && /[a-zA-Z_]/.test(code[i + 1] || "")) { let j = i + 1; while (j < len && /[a-zA-Z0-9_]/.test(code[j])) j++; out.push({ t: "lt", v: code.slice(i, j) }); i = j; continue; }
    if (ch === "'" && i + 2 < len && code[i + 2] === "'" && code[i + 1] !== "'") { out.push({ t: "chr", v: code.slice(i, i + 3) }); i += 3; continue; }
    if (/[0-9]/.test(ch)) { let j = i; if (code[j] === "0" && "xXbBoO".includes(code[j + 1] || "")) { const base = code[j + 1].toLowerCase(); j += 2; const pat = base === "x" ? /[0-9a-fA-F_]/ : base === "b" ? /[01_]/ : /[0-7_]/; while (j < len && pat.test(code[j])) j++; } else { while (j < len && /[0-9_]/.test(code[j])) j++; if (code[j] === "." && /[0-9]/.test(code[j + 1] || "")) { j++; while (j < len && /[0-9_]/.test(code[j])) j++; } if ((code[j] === "e" || code[j] === "E")) { j++; if (code[j] === "+" || code[j] === "-") j++; while (j < len && /[0-9_]/.test(code[j])) j++; } } const sf = code.slice(j).match(/^(u8|u16|u32|u64|u128|usize|i8|i16|i32|i64|i128|isize|f32|f64)/); if (sf) j += sf[1].length; out.push({ t: "num", v: code.slice(i, j) }); i = j; continue; }
    if (/[a-zA-Z_]/.test(ch)) { let j = i; while (j < len && /[a-zA-Z0-9_]/.test(code[j])) j++; const w = code.slice(i, j); if (code[j] === "!") { out.push({ t: "mac", v: w + "!" }); i = j + 1; continue; } const tt: TT = (w === "self" || w === "Self") ? "slf" : KW.has(w) ? "kw" : CT.has(w) ? "ctrl" : TY.has(w) ? "ty" : BI.has(w) ? "bi" : /^[A-Z][A-Z0-9_]+$/.test(w) && w.length > 1 ? "cst" : /^[A-Z]/.test(w) ? "ty" : code[j] === "(" ? "fn" : "plain"; out.push({ t: tt, v: w }); i = j; continue; }
    if ("=<>!&|+-*/%^~?".includes(ch)) { let op = ch; if (i + 1 < len && ["=>", "->", "::", "==", "!=", "<=", ">=", "&&", "||", "<<", ">>", "+=", "-=", "*=", "/="].includes(ch + code[i + 1])) op = ch + code[i + 1]; out.push({ t: "op", v: op }); i += op.length; continue; }
    if (ch === ":" && code[i + 1] === ":") { out.push({ t: "punc", v: "::" }); i += 2; continue; }
    if (ch === "." && code[i + 1] === ".") { if (code[i + 2] === ".") { out.push({ t: "op", v: "..." }); i += 3; } else { out.push({ t: "op", v: ".." }); i += 2; } continue; }
    if ("{}[]().,;:@".includes(ch)) { out.push({ t: "punc", v: ch }); i++; continue; }
    if (ch === "\n") { out.push({ t: "plain", v: "\n" }); i++; continue; }
    if (/\s/.test(ch)) { let j = i; while (j < len && /\s/.test(code[j]) && code[j] !== "\n") j++; out.push({ t: "plain", v: code.slice(i, j) }); i = j; continue; }
    out.push({ t: "plain", v: ch }); i++;
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════
   DEEP SEMANTIC ANALYZER — Full contextual understanding
   ═══════════════════════════════════════════════════════════ */

interface FieldInfo {
  name: string;
  type: string;
  comment?: string;
  visibility: string;
}

interface VariantInfo {
  name: string;
  data?: string;
  comment?: string;
}

interface MethodInfo {
  name: string;
  signature: string;
  returnType?: string;
  isUnsafe: boolean;
  isAsync: boolean;
  visibility: string;
  comment?: string;
}

interface ParamInfo {
  name: string;
  type: string;
  isMut: boolean;
  isSelf: boolean;
}

interface CodeSymbol {
  kind: "struct" | "enum" | "trait" | "impl" | "fn" | "const" | "mod" | "type" | "macro" | "use" | "static" | "union";
  name: string;
  line: number;
  endLine: number;
  visibility: "pub" | "pub(crate)" | "pub(super)" | "private";
  isUnsafe: boolean;
  isAsync: boolean;
  returnType?: string;
  generics?: string;
  traitImpl?: string;
  supertraits?: string[];
  doc?: string;
  fields?: FieldInfo[];
  variants?: VariantInfo[];
  methods?: MethodInfo[];
  params?: ParamInfo[];
  attributes?: string[];
  constValue?: string;
  constType?: string;
  typeAlias?: string;
  whyItExists: string;
  howItWorks: string;
  designPattern?: string;
  memoryNote?: string;
  safetyNote?: string;
  relationships: string[];
}

const ICON: Record<CodeSymbol["kind"], string> = {
  struct: "◈", enum: "◇", trait: "◆", impl: "▣",
  fn: "ƒ", const: "∅", mod: "▤", type: "⊡",
  macro: "⚡", use: "↗", static: "●", union: "⊞",
};

const COLOR: Record<CodeSymbol["kind"], string> = {
  struct: "#E5C07B", enum: "#56B6C2", trait: "#C678DD", impl: "#61AFEF",
  fn: "#61AFEF", const: "#D19A66", mod: "#98C379", type: "#E5C07B",
  macro: "#61AFEF", use: "#ABB2BF", static: "#D19A66", union: "#E5C07B",
};

/* ══════════ Smart Explanation Engine ══════════
   Generates contextual "why" & "how" from code patterns */

function inferWhy(sym: CodeSymbol, allSyms: CodeSymbol[]): string {
  const n = sym.name;
  const doc = sym.doc;
  if (doc) return doc;

  switch (sym.kind) {
    case "struct": {
      if (n.endsWith("Config") || n.endsWith("Configuration"))
        return `Centralizes configuration parameters for ${n.replace(/Config(uration)?$/, "")} into a single, validated data structure. Grouping related settings prevents configuration sprawl and enables atomic validation.`;
      if (n.endsWith("Error"))
        return `Structured error type that captures specific failure modes for ${n.replace(/Error$/, "")} operations. Enables callers to match on error variants and choose appropriate recovery strategies.`;
      if (n.endsWith("Context"))
        return `Bundles execution-relevant state needed by ${n.replace(/Context$/, "")} operations. Passing context as a struct avoids long parameter lists and makes the API extensible without breaking changes.`;
      if (n.endsWith("Stats") || n.endsWith("Statistics") || n.endsWith("Metrics"))
        return `Runtime metrics collector for ${n.replace(/(Stats|Statistics|Metrics)$/, "")}. These counters enable observability, performance monitoring, and health diagnostics without intrusive logging.`;
      if (n.endsWith("Manager"))
        return `Lifecycle coordinator that owns and orchestrates ${n.replace(/Manager$/, "")} resources. Encapsulates creation, state transitions, and cleanup into a single responsible entity (Single Responsibility Principle).`;
      if (n.endsWith("Registry"))
        return `Central repository that maps identifiers to ${n.replace(/Registry$/, "")} instances. Provides O(1) lookup, registration, and iteration — essential for dynamic dispatch in modular architectures.`;
      if (n.endsWith("Builder"))
        return `Step-by-step constructor that validates each parameter before creating the final ${n.replace(/Builder$/, "")} instance. Prevents partially-initialized objects and makes the construction API self-documenting.`;
      if (n.endsWith("Entry"))
        return `Internal bookkeeping record within a registry or collection. Wraps a ${n.replace(/Entry$/, "")} value with metadata (status, timestamps, references) needed for management operations.`;
      if (n.endsWith("Dispatcher") || n.endsWith("Router"))
        return `Routes incoming ${n.replace(/(Dispatcher|Router)$/, "")} requests to appropriate handlers. Decouples producers from consumers, enabling extensibility and priority-based processing.`;
      if (n.endsWith("Info") || n.endsWith("Descriptor"))
        return `Read-only snapshot of ${n.replace(/(Info|Descriptor)$/, "")} metadata. Provides a stable view of properties without exposing mutable internals or locking.`;
      if (n.endsWith("Allocator"))
        return `Memory allocation strategy for ${n.replace(/Allocator$/, "")}. Implements a specific allocation algorithm optimized for the kernel's access patterns and fragmentation constraints.`;
      if (n.endsWith("Id"))
        return `Strongly-typed identifier that prevents accidental misuse of raw integer IDs. The newtype pattern ensures compile-time safety — you cannot accidentally pass a ${n} where another ID type is expected.`;
      if (n.endsWith("Version"))
        return `Semantic version descriptor that enables compatibility checking between components. Structured versioning is critical for safe hot-reload and module dependency resolution.`;
      if (n.endsWith("Request") || n.endsWith("Response"))
        return `Message type for structured ${n.endsWith("Request") ? "request" : "response"} communication. Typed messages replace untyped byte buffers, enabling compile-time protocol validation.`;
      if (sym.fields?.some(f => f.name === "sender" || f.name === "receiver"))
        return `Channel endpoint wrapper that enables typed, inter-component communication. Ownership of the endpoint controls who can send or receive, enforced at compile time.`;
      const fc = sym.fields?.length ?? 0;
      if (fc > 0)
        return `Aggregates ${fc} related field${fc > 1 ? "s" : ""} into a cohesive data unit. Grouping these values ensures they travel together and maintains invariants between them.`;
      return `Named data type that gives domain-specific meaning to its contents, improving code readability and type safety.`;
    }

    case "enum": {
      if (n.endsWith("Error"))
        return `Exhaustive error catalog for ${n.replace(/Error$/, "")} operations. Each variant maps to a distinct failure mode, enabling callers to pattern-match and implement targeted error recovery.`;
      if (n.endsWith("State") || n.endsWith("Status"))
        return `Finite state machine encoding for ${n.replace(/(State|Status)$/, "")}. The compiler enforces exhaustive matching, guaranteeing every state is handled — preventing impossible state bugs.`;
      if (n.endsWith("Event"))
        return `Discriminated event type for ${n.replace(/Event$/, "")} notifications. Subscribers can pattern-match to react only to events they care about, enabling efficient event-driven architectures.`;
      if (n.endsWith("Action") || n.endsWith("Command"))
        return `Command pattern encoding: each variant represents a distinct operation that can be queued, serialized, or dispatched. Enables undo/redo, logging, and asynchronous execution.`;
      if (n.endsWith("Kind") || n.endsWith("Type") || n.endsWith("Class") || n.endsWith("Category"))
        return `Classification tag that partitions ${n.replace(/(Kind|Type|Class|Category)$/, "")} instances into categories. Enables branching logic, priority ordering, and category-specific behavior.`;
      if (n.endsWith("Reason"))
        return `Explanation tag that documents why a particular transition occurred. Critical for debugging, audit trails, and understanding system behavior in post-mortem analysis.`;
      if (n.endsWith("Mode"))
        return `Operational mode selector that alters behavior without changing the interface. Enables runtime flexibility while keeping the API surface stable and predictable.`;
      if (n.endsWith("Stage") || n.endsWith("Phase"))
        return `Sequential lifecycle phase within ${n.replace(/(Stage|Phase)$/, "")}. Defines an ordered progression where each stage must complete before the next can begin.`;
      if (n.endsWith("Priority"))
        return `Priority tier classification that determines scheduling order. Higher-priority items are processed first, enabling QoS guarantees and latency-sensitive handling.`;
      if (n.endsWith("Rights") || n.endsWith("Flags") || n.endsWith("Permissions"))
        return `Bit-flag set for fine-grained ${n.replace(/(Rights|Flags|Permissions)$/, "")} control. Each flag is independently togglable, enabling combinatorial permission models.`;
      const vc = sym.variants?.length ?? 0;
      if (vc > 0)
        return `Sum type with ${vc} distinct variant${vc > 1 ? "s" : ""}, each representing a mutually exclusive case. The compiler ensures all variants are handled wherever this enum is matched.`;
      return `Algebraic data type that models a closed set of possibilities, ensuring exhaustive handling at compile time.`;
    }

    case "trait": {
      if (n.endsWith("Abstraction"))
        return `Hardware abstraction interface that decouples kernel logic from specific hardware. Implementations provide platform-specific behavior while the kernel programs against this stable contract.`;
      if (n === "Module" || n.endsWith("Module"))
        return `Plugin contract that all loadable modules must fulfill. Standardizing this interface enables the kernel to manage module lifecycle (load → init → run → unload) uniformly.`;
      if (n.endsWith("Provider") || n.endsWith("Source"))
        return `Dependency injection interface: consumers declare what they need via this trait, and the system supplies concrete implementations at runtime. Enables testing with mocks and runtime swapping.`;
      if (n.endsWith("Handler"))
        return `Callback contract for handling incoming ${n.replace(/Handler$/, "")} events. Implementations define the response behavior while the dispatch framework handles routing and scheduling.`;
      if (n.endsWith("Scheduler"))
        return `Scheduling policy interface that determines execution order. Different implementations (round-robin, priority, CFS) can be hot-swapped at runtime without kernel restart.`;
      if (n.endsWith("Validator"))
        return `Validation contract that ensures data integrity before processing. Separating validation logic into a trait enables composable, reusable validation chains.`;
      const mc = sym.methods?.length ?? 0;
      if (mc > 0)
        return `Behavioral contract with ${mc} method${mc > 1 ? "s" : ""} that implementors must provide. This trait defines a capability that can be polymorphically dispatched, enabling loose coupling between components.`;
      return `Interface contract that defines a set of behaviors any implementing type must provide. Enables polymorphism, dependency inversion, and testability.`;
    }

    case "impl": {
      if (sym.traitImpl) {
        return `Connects ${sym.name} to the ${sym.traitImpl} contract, proving that ${sym.name} satisfies all required behaviors. This enables ${sym.name} to be used anywhere a ${sym.traitImpl} is expected — critical for polymorphic dispatch and trait object usage.`;
      }
      const mc = sym.methods?.length ?? 0;
      if (mc > 0)
        return `Inherent methods for ${sym.name} — ${mc} function${mc > 1 ? "s" : ""} that operate on this type's data. These are the primary API surface that other code calls to interact with ${sym.name} instances.`;
      return `Defines the methods and associated functions available on ${sym.name}. Inherent impls are the idiomatic Rust way to give behavior to data types.`;
    }

    case "fn": {
      if (n === "new" || n === "default")
        return `Constructor that creates a valid ${n === "new" ? "configured" : "default"} instance. Rust lacks constructors, so convention uses associated functions named \`new\` or \`default\` to control initialization.`;
      if (n.startsWith("init") || n.startsWith("setup") || n.startsWith("bootstrap"))
        return `Initialization entry point that establishes required state before the subsystem becomes operational. Called once during startup, sets up invariants that the rest of the system depends on.`;
      if (n.startsWith("get_") || n.startsWith("fetch_"))
        return `Accessor that retrieves ${n.replace(/^(get_|fetch_)/, "")} data. Returns a reference or copy without modifying internal state, safe to call concurrently.`;
      if (n.startsWith("set_") || n.startsWith("update_"))
        return `Mutator that modifies ${n.replace(/^(set_|update_)/, "")} state. Takes &mut self, ensuring the borrow checker prevents concurrent mutation — race condition free by construction.`;
      if (n.startsWith("is_") || n.startsWith("has_") || n.startsWith("can_") || n.startsWith("should_"))
        return `Predicate query that tests a condition without side effects. Returns bool, enabling use in conditional expressions and guard clauses.`;
      if (n.startsWith("try_"))
        return `Fallible operation that may fail gracefully. Returns Result<T, E> instead of panicking, allowing callers to choose their error handling strategy.`;
      if (n.startsWith("register") || n.startsWith("add_") || n.startsWith("insert"))
        return `Registration method that adds a new entry to an internal collection. Typically validates the input, assigns an ID, and stores the entry for later retrieval.`;
      if (n.startsWith("remove") || n.startsWith("unregister") || n.startsWith("delete"))
        return `Removal method that deregisters an entry and cleans up associated resources. May fail if the entry doesn't exist or is currently in use.`;
      if (n.startsWith("handle_") || n.startsWith("on_") || n.startsWith("process_"))
        return `Event handler that reacts to incoming ${n.replace(/^(handle_|on_|process_)/, "")} events. Dispatched by the event loop when the corresponding event occurs.`;
      if (n.startsWith("validate") || n.startsWith("check_") || n.startsWith("verify"))
        return `Validation function that ensures data meets required constraints before processing. Returns an error if validation fails, preventing invalid state from propagating.`;
      if (n.startsWith("allocate") || n.startsWith("alloc"))
        return `Memory allocation routine that reserves a region of memory for use. Must be paired with a corresponding deallocation to prevent memory leaks.`;
      if (n.startsWith("free") || n.startsWith("dealloc") || n.startsWith("release"))
        return `Resource deallocation function that returns previously acquired resources to the free pool. Critical for preventing leaks in long-running kernel operations.`;
      if (n.startsWith("send") || n.startsWith("emit") || n.startsWith("publish") || n.startsWith("dispatch"))
        return `Message emission function that pushes data to consumers. Decouples the sender from receivers, enabling asynchronous and multi-subscriber communication patterns.`;
      if (n.startsWith("recv") || n.startsWith("receive") || n.startsWith("subscribe"))
        return `Message reception function that waits for or polls incoming data. May block or return a future depending on the channel implementation.`;
      if (n === "start" || n === "run" || n === "execute")
        return `Execution entry point that begins the main operational loop. Typically called after initialization is complete and the component is ready to process work.`;
      if (n === "stop" || n === "shutdown" || n === "halt")
        return `Graceful shutdown procedure that stops operations, flushes pending work, and releases held resources. Ensures clean termination without data loss.`;
      if (n.includes("_to_") || n.startsWith("from_") || n.startsWith("into_") || n.startsWith("as_"))
        return `Type conversion function that transforms between representations. Follows Rust's From/Into/AsRef conventions for idiomatic interoperability.`;
      if (sym.returnType) {
        if (sym.returnType.includes("Result"))
          return `Fallible operation that returns ${sym.returnType}. Callers must handle the error case, which the compiler enforces — unused Results trigger warnings.`;
        if (sym.returnType.includes("Option"))
          return `Lookup function that may or may not find a result. Returns None instead of panicking when the item doesn't exist, enabling safe chaining with \`?\` or \`.unwrap_or()\`.`;
        if (sym.returnType === "!" || sym.returnType === "-> !")
          return `Diverging function that never returns. Used for kernel entry points, infinite loops, or panic handlers where control flow doesn't continue past this point.`;
        if (sym.returnType === "bool")
          return `Boolean predicate that tests a condition. Side-effect-free query used in guards, assertions, and conditional logic.`;
      }
      if (sym.isUnsafe)
        return `Unsafe function that bypasses Rust's safety guarantees. The caller must uphold invariants (valid pointers, no aliasing, correct alignment) that the compiler cannot verify.`;
      if (sym.isAsync)
        return `Asynchronous operation that may yield execution. Returns a Future that the async runtime polls to completion, enabling non-blocking concurrent execution.`;
      if (sym.params && sym.params.length === 0)
        return `Parameterless function — either a constructor, a global query, or a trigger for an internal operation.`;
      return `Function that encapsulates a specific unit of work. Takes ${sym.params?.length ?? 0} parameter(s) and ${sym.returnType ? "returns " + sym.returnType : "returns nothing (unit type)"}.`;
    }

    case "const": {
      if (n.startsWith("MAX_") || n.startsWith("MIN_"))
        return `Boundary constant that defines a hard limit. Used in bounds checking, array sizing, and capacity planning. Changing this value affects all dependent allocation and validation logic.`;
      if (n.startsWith("DEFAULT_"))
        return `Default configuration value used when no explicit value is provided. Centralizing defaults here makes the system's assumptions explicit and auditable.`;
      if (n.includes("SIZE") || n.includes("LEN") || n.includes("COUNT"))
        return `Size constant that determines memory layout or capacity. Compile-time constant ensures zero-overhead usage — the value is inlined at every use site.`;
      if (n.includes("MASK") || n.includes("FLAG") || n.includes("BIT"))
        return `Bit manipulation constant for hardware register programming or flag operations. Used with bitwise AND/OR/XOR to set, clear, or test individual bits.`;
      if (n.includes("VERSION"))
        return `Version identifier that enables compatibility checking. Compared during module loading and IPC handshakes to prevent protocol mismatches.`;
      if (n.includes("TIMEOUT") || n.includes("INTERVAL") || n.includes("DELAY"))
        return `Timing constant that defines a duration threshold. Used for watchdog timers, retry logic, and scheduling decisions.`;
      return `Named compile-time constant. Using a named const instead of a magic number makes the code self-documenting and centralizes the value for easy updates.`;
    }

    case "static": {
      if (n.includes("GLOBAL") || n.includes("INSTANCE"))
        return `Global singleton providing process-wide access to a shared resource. Wrapped in synchronization primitives (Mutex/RwLock/Once) to ensure thread-safe access in the concurrent kernel environment.`;
      return `Static variable with 'static lifetime — lives for the entire program execution. Typically guarded by Mutex or atomic operations to ensure thread safety.`;
    }

    case "type":
      return `Type alias that creates a semantic name for ${sym.typeAlias ?? "a complex type"}. Reduces visual noise and makes function signatures self-documenting without runtime cost.`;

    case "mod":
      return `Module boundary that encapsulates related functionality. Controls visibility (what's pub vs private), organizes code into logical units, and defines compilation boundaries.`;

    case "union":
      return `Unsafe union type for interfacing with C code or hardware registers. Only one field is valid at a time — reading the wrong field is undefined behavior. Requires unsafe to access.`;

    case "macro":
      return `Metaprogramming construct that generates code at compile time. Macros eliminate boilerplate by pattern-matching on syntax and producing expanded code, without runtime overhead.`;

    case "use":
      return `Import declaration that brings external symbols into scope. Shortens qualified paths and documents which external APIs this module depends on.`;

    default:
      return `Code definition that provides functionality for the ${sym.name} component.`;
  }
}

function inferHow(sym: CodeSymbol): string {
  switch (sym.kind) {
    case "struct": {
      const fc = sym.fields?.length ?? 0;
      const parts: string[] = [];

      // Layout analysis
      if (sym.attributes?.includes("repr(C)"))
        parts.push("Uses C-compatible memory layout (#[repr(C)]) for FFI interop — fields are laid out in declaration order with C alignment rules.");
      else if (sym.attributes?.includes("repr(transparent)"))
        parts.push("Zero-cost newtype wrapper (#[repr(transparent)]) — identical memory layout to its inner type, so conversions are free.");
      else if (sym.attributes?.includes("repr(packed)"))
        parts.push("Packed layout (#[repr(packed)]) eliminates padding between fields. Accesses may be unaligned, requiring careful handling on some architectures.");
      
      // Derive analysis
      const derives = sym.attributes?.find(a => a.startsWith("derive("));
      if (derives) {
        const traits = derives.match(/derive\(([^)]+)\)/)?.[1]?.split(",").map(t => t.trim()) ?? [];
        if (traits.includes("Clone") && traits.includes("Copy"))
          parts.push("Marked Copy + Clone: instances are duplicated by simple bitwise copy (stack-only, no heap allocation). This is ideal for small, fixed-size types.");
        if (traits.includes("Debug"))
          parts.push("Debug trait provides {:?} formatting for logging and error messages — essential for kernel diagnostics.");
        if (traits.includes("Default"))
          parts.push("Default trait provides a zero-value constructor via ::default(), enabling use in generic contexts and struct update syntax.");
        if (traits.includes("Serialize") || traits.includes("Deserialize"))
          parts.push("Serialization support enables this type to be converted to/from wire formats for IPC, persistence, or network transmission.");
        if (traits.includes("PartialEq") || traits.includes("Eq"))
          parts.push("Equality comparison enables this type to be compared with == and used as HashMap keys (when Hash is also derived).");
        if (traits.includes("Hash"))
          parts.push("Hash implementation enables O(1) lookup when used as a key in HashMap or HashSet collections.");
        if (traits.includes("PartialOrd") || traits.includes("Ord"))
          parts.push("Ordering enables sorting, use in BTreeMap, and comparison operations like min/max.");
      }

      if (fc > 0) {
        const pubCount = sym.fields?.filter(f => f.visibility === "pub").length ?? 0;
        if (pubCount === fc)
          parts.push(`All ${fc} fields are public — this is a transparent data carrier where callers directly access fields.`);
        else if (pubCount === 0)
          parts.push(`All fields are private — access is controlled through methods, enforcing invariants on every mutation.`);
        else
          parts.push(`Mixed visibility: ${pubCount} public, ${fc - pubCount} private. Public fields are safe to access directly; private fields maintain internal invariants.`);
      }

      // Generics
      if (sym.generics)
        parts.push(`Generic over <${sym.generics}> — monomorphized at compile time for each concrete type, giving zero-cost abstraction with full type safety.`);

      return parts.length > 0 ? parts.join(" ") : `Standard Rust struct allocated on the stack (or heap via Box). Fields are stored contiguously in memory. Access is O(1) by field offset.`;
    }

    case "enum": {
      const vc = sym.variants?.length ?? 0;
      const parts: string[] = [];

      // Check for data-carrying variants
      const hasData = sym.variants?.some(v => v.data) ?? false;
      if (hasData)
        parts.push(`Tagged union: the compiler stores a discriminant tag + the largest variant's data. Memory = size_of(tag) + size_of(largest_variant) + alignment padding.`);
      else if (vc > 0)
        parts.push(`Fieldless enum stored as a single integer discriminant (typically ${vc <= 256 ? "u8" : vc <= 65536 ? "u16" : "u32"}). Zero heap allocation, minimal stack footprint.`);

      if (sym.attributes?.includes("repr(u8)") || sym.attributes?.includes("repr(u16)") || sym.attributes?.includes("repr(u32)") || sym.attributes?.includes("repr(u64)"))
        parts.push("Explicit repr ensures ABI-stable discriminant size for FFI or hardware register mapping.");

      // Error enum detection
      const isError = sym.name.endsWith("Error");
      if (isError && vc > 0)
        parts.push(`Exhaustive match required — the compiler rejects any \`match\` that doesn't handle all ${vc} error cases, preventing unhandled errors at compile time.`);

      // Flag-like enum
      const hasNumericComment = sym.variants?.some(v => v.comment?.match(/0x[0-9a-f]+|^\d+$/i));
      if (hasNumericComment)
        parts.push("Variants map to numeric codes (visible in comments) — these values are part of the ABI contract with userspace or hardware.");

      if (sym.generics)
        parts.push(`Generic parameter <${sym.generics}> enables this enum to wrap different data types while maintaining a uniform interface.`);

      return parts.length > 0 ? parts.join(" ") : `Rust enum — a discriminated union where the compiler tracks which variant is active. Pattern matching provides safe, exhaustive handling.`;
    }

    case "trait": {
      const parts: string[] = [];
      const mc = sym.methods?.length ?? 0;

      if (sym.supertraits && sym.supertraits.length > 0)
        parts.push(`Requires implementors to also implement ${sym.supertraits.join(" + ")} — these are supertrait bounds that guarantee additional capabilities.`);

      if (mc > 0) {
        const required = sym.methods?.filter(m => !m.signature.includes("default")).length ?? mc;
        if (required < mc)
          parts.push(`${required} required method${required !== 1 ? "s" : ""}, ${mc - required} provided with default implementations. Implementors can override defaults for custom behavior.`);
        else
          parts.push(`${mc} required method${mc !== 1 ? "s" : ""} — every implementor must provide all of them, ensuring a complete behavioral contract.`);
      }

      // Check for associated types
      const hasAssocTypes = sym.methods?.some(m => m.name.startsWith("type "));
      if (hasAssocTypes)
        parts.push("Uses associated types to let implementors specify concrete types. This avoids generic parameter explosion while maintaining full type safety.");

      // Object safety check
      const selfInReturn = sym.methods?.some(m => m.returnType?.includes("Self"));
      if (selfInReturn)
        parts.push("Returns Self in some methods — this makes the trait NOT object-safe (cannot use dyn Trait). Must be used with static dispatch (generics/impl Trait).");
      else if (mc > 0)
        parts.push("Object-safe — can be used as `dyn ${sym.name}` for dynamic dispatch via vtable. This enables runtime polymorphism at the cost of one pointer indirection.");

      return parts.length > 0 ? parts.join(" ") : `Trait = interface contract. The compiler generates a vtable for dynamic dispatch (dyn), or monomorphizes for static dispatch (impl/generics).`;
    }

    case "impl": {
      const parts: string[] = [];

      if (sym.traitImpl) {
        parts.push(`This impl block satisfies the ${sym.traitImpl} contract for ${sym.name}. The compiler verifies all required methods are provided with correct signatures.`);
        if (sym.traitImpl.includes("Send") || sym.traitImpl.includes("Sync"))
          parts.push("Send/Sync: marker traits asserting this type can safely cross thread boundaries. Usually auto-implemented; manual impl is unsafe and requires careful review.");
        if (sym.traitImpl.includes("Drop"))
          parts.push("Custom Drop: destructor called automatically when the value goes out of scope. Handles resource cleanup (closing handles, freeing memory, releasing locks).");
        if (sym.traitImpl.includes("From") || sym.traitImpl.includes("Into"))
          parts.push("Conversion trait: enables the ? operator for automatic error conversion and .into() for ergonomic type transformations.");
        if (sym.traitImpl.includes("Display"))
          parts.push("Display: provides user-facing string formatting via fmt::Display. Used by println!(\"{}\"), format!(), and .to_string().");
        if (sym.traitImpl.includes("Iterator"))
          parts.push("Iterator implementation enables use in for loops and the entire iterator combinator chain (.map(), .filter(), .collect(), etc).");
        if (sym.traitImpl.includes("Deref"))
          parts.push("Deref coercion enables transparent method delegation to the inner type. The compiler automatically dereferences when resolving method calls.");
      } else {
        const mc = sym.methods?.length ?? 0;
        if (mc > 0) {
          const pubMethods = sym.methods?.filter(m => m.visibility === "pub").length ?? 0;
          parts.push(`Inherent impl with ${mc} method${mc !== 1 ? "s" : ""} (${pubMethods} public). Public methods form the API; private methods are internal helpers.`);
        }
        const hasNew = sym.methods?.some(m => m.name === "new");
        if (hasNew)
          parts.push("Contains a `new()` constructor — Rust convention for the primary way to create instances. May validate inputs and set up internal state.");
      }

      return parts.length > 0 ? parts.join(" ") : `Implementation block that attaches methods to ${sym.name}. Methods are resolved at compile time (no vtable overhead for inherent impls).`;
    }

    case "fn": {
      const parts: string[] = [];

      if (sym.isUnsafe)
        parts.push("⚠️ Marked unsafe — the caller must guarantee preconditions the compiler cannot check: valid pointers, no data races, correct alignment, no aliasing violations.");
      if (sym.isAsync)
        parts.push("Async function: returns an opaque Future that must be .await'd or spawned on an executor. The function body is transformed into a state machine by the compiler.");
      if (sym.params && sym.params.length > 0) {
        const selfParam = sym.params.find(p => p.isSelf);
        if (selfParam) {
          if (selfParam.type === "&self")
            parts.push("Takes &self (shared reference) — can be called concurrently from multiple threads. Does not modify the receiver.");
          else if (selfParam.type === "&mut self")
            parts.push("Takes &mut self (exclusive reference) — the borrow checker ensures no other references exist during this call, preventing data races at compile time.");
          else if (selfParam.type === "self")
            parts.push("Takes self by value — consumes the instance. After this call, the original variable is moved and can no longer be used (ownership transfer).");
        }
        const nonSelfParams = sym.params.filter(p => !p.isSelf);
        if (nonSelfParams.length > 0)
          parts.push(`Accepts ${nonSelfParams.length} parameter${nonSelfParams.length > 1 ? "s" : ""}: ${nonSelfParams.map(p => p.name).join(", ")}.`);
      }
      if (sym.returnType) {
        if (sym.returnType.includes("Result"))
          parts.push("Returns Result — forces callers to handle the error case. The ? operator provides ergonomic early-return on error.");
        else if (sym.returnType.includes("Option"))
          parts.push("Returns Option — signals the value may be absent. .unwrap() panics if None; prefer .map(), .unwrap_or(), or ? for safe handling.");
        else if (sym.returnType === "!")
          parts.push("Diverging (-> !) — this function never returns. The compiler uses this for type-level reasoning: unreachable code after a diverging call is eliminated.");
        else
          parts.push(`Returns ${sym.returnType}.`);
      }
      if (sym.generics)
        parts.push(`Generic over <${sym.generics}> — the compiler generates a specialized version for each concrete type used, with full optimizations and zero dynamic dispatch overhead.`);
      if (sym.attributes?.includes("no_mangle"))
        parts.push("#[no_mangle]: preserves the symbol name in the binary. Required for functions called from assembly, C code, or bootloader entry points.");
      if (sym.attributes?.some(a => a.includes("extern")))
        parts.push("extern \"C\" ABI: uses the C calling convention (System V on x86_64). Parameters passed in rdi, rsi, rdx, rcx, r8, r9; return in rax.");

      return parts.length > 0 ? parts.join(" ") : `Standard function call — compiled to a direct CALL instruction. Parameters passed on registers (System V ABI on x86_64), return value in rax.`;
    }

    case "const":
      if (sym.constType?.includes("usize") || sym.constType?.includes("u32") || sym.constType?.includes("u64"))
        return `Compile-time integer constant. Evaluated at compilation and inlined at every use site — zero runtime cost, no memory allocation. The value exists only in the instruction stream.`;
      if (sym.constType?.includes("&str") || sym.constType?.includes("str"))
        return `String constant stored in the binary's read-only .rodata section. References to it are thin pointers — just an address and length.`;
      return `Compile-time constant evaluated during compilation. The value is substituted directly at each use site by the compiler — no storage, no indirection, zero overhead.`;

    case "static":
      return `Global variable stored in the .data (initialized) or .bss (zero-initialized) section of the binary. Lives for the entire program lifetime ('static). Thread-safe access requires synchronization (Mutex, atomic, Once).`;

    case "type":
      return `Type alias resolved at compile time — no runtime representation. Wherever ${sym.name} appears, the compiler substitutes the underlying type. Zero cost, pure ergonomics.`;

    case "mod":
      return `Module = compilation unit + namespace. Items are private by default; only pub items are visible outside. The module tree controls access patterns and compilation parallelism.`;

    case "union":
      return `Union shares memory between all fields — only one is valid at a time. Size = max(field sizes). All field access is unsafe because the compiler cannot track which variant is active.`;

    case "macro":
      return `Expanded at compile time by the macro processor. The generated code is type-checked after expansion, so errors may reference expanded code. Use cargo expand to see output.`;

    case "use":
      return `Resolved at compile time — creates a local name binding to an external path. No runtime cost. Affects only name resolution, not linking or loading.`;

    default:
      return `Processed by the Rust compiler into optimized machine code.`;
  }
}

function inferDesignPattern(sym: CodeSymbol): string | undefined {
  const n = sym.name;
  if (sym.kind === "struct") {
    if (n.endsWith("Builder")) return "🏗️ Builder Pattern";
    if (n.endsWith("Factory")) return "🏭 Factory Pattern";
    if (n.endsWith("Registry")) return "📇 Registry Pattern";
    if (n.endsWith("Dispatcher") || n.endsWith("Router")) return "🔀 Dispatcher Pattern";
    if (n.endsWith("Manager")) return "🎛️ Manager / Façade";
    if (n.endsWith("Allocator")) return "📦 Allocator / Pool";
    if (n.endsWith("Context")) return "🎯 Context Object";
    if (n.endsWith("Observer") || n.endsWith("Listener")) return "👁️ Observer Pattern";
    if (sym.fields?.length === 1 && sym.attributes?.some(a => a.includes("repr(transparent)"))) return "🔒 Newtype Pattern";
    if (sym.fields?.some(f => f.name === "inner" || f.name === "wrapped")) return "🎁 Wrapper / Decorator";
  }
  if (sym.kind === "trait") {
    if (n.endsWith("Handler") || n.endsWith("Listener")) return "👁️ Observer / Handler";
    if (n.endsWith("Provider") || n.endsWith("Source")) return "💉 Dependency Injection";
    if (n.endsWith("Visitor")) return "🚶 Visitor Pattern";
    if (n.endsWith("Strategy") || n.endsWith("Scheduler")) return "♟️ Strategy Pattern";
  }
  if (sym.kind === "enum") {
    if (n.endsWith("Command") || n.endsWith("Action")) return "📨 Command Pattern";
    if (n.endsWith("State") || n.endsWith("Status")) return "🔄 State Machine";
    if (n.endsWith("Event")) return "📡 Event-Driven";
  }
  if (sym.kind === "impl" && sym.traitImpl) return "📐 Trait Implementation";
  return undefined;
}

function inferMemoryNote(sym: CodeSymbol): string | undefined {
  if (sym.kind === "struct") {
    const hasArc = sym.fields?.some(f => f.type.includes("Arc<"));
    const hasMutex = sym.fields?.some(f => f.type.includes("Mutex<") || f.type.includes("RwLock<"));
    const hasVec = sym.fields?.some(f => f.type.includes("Vec<") || f.type.includes("String"));
    const hasBox = sym.fields?.some(f => f.type.includes("Box<"));
    const parts: string[] = [];
    if (hasArc) parts.push("Arc<> = atomic reference counting (heap-allocated, thread-safe shared ownership)");
    if (hasMutex) parts.push("Mutex/RwLock = runtime-checked exclusive access (blocks on contention)");
    if (hasVec) parts.push("Vec/String = heap-allocated growable buffer (amortized O(1) push)");
    if (hasBox) parts.push("Box<> = heap-allocated owned pointer (single ownership, freed on drop)");
    if (sym.attributes?.includes("repr(transparent)")) parts.push("repr(transparent): zero-cost wrapper, identical layout to inner type");
    if (parts.length > 0) return parts.join(". ") + ".";
  }
  if (sym.kind === "enum") {
    const hasBoxedVariants = sym.variants?.some(v => v.data?.includes("Box<"));
    if (hasBoxedVariants) return "Some variants use Box<> to avoid inflating the enum's stack size — keeps the common case small.";
  }
  return undefined;
}

function inferSafetyNote(sym: CodeSymbol): string | undefined {
  if (sym.isUnsafe) {
    if (sym.kind === "fn") return "Caller must uphold invariants: valid pointers, no aliasing, correct alignment. Document safety requirements at call sites.";
    if (sym.kind === "trait") return "Implementing this trait is unsafe — the implementor must guarantee behavioral contracts that the compiler cannot verify.";
    if (sym.kind === "impl") return "Unsafe impl asserts that the type meets safety requirements the compiler cannot check automatically.";
  }
  if (sym.kind === "union") return "All field access is unsafe. The programmer must track which field is currently valid. Reading an inactive field is undefined behavior.";
  if (sym.kind === "static") return "Global mutable state requires synchronization. Unsynchronized access from multiple threads is a data race (undefined behavior).";
  if (sym.attributes?.some(a => a.includes("no_mangle")))
    return "no_mangle symbol is visible to the linker. Name collisions with other crates or C libraries will cause link errors or silent shadowing.";
  return undefined;
}

function inferRelationships(sym: CodeSymbol, allSyms: CodeSymbol[]): string[] {
  const rels: string[] = [];
  const otherNames = new Set(allSyms.filter(s => s.name !== sym.name).map(s => s.name));

  if (sym.kind === "impl" && sym.traitImpl) {
    if (otherNames.has(sym.traitImpl.replace(/<.*>/, "")))
      rels.push(`Implements ◆ ${sym.traitImpl}`);
  }

  if (sym.kind === "trait" && sym.supertraits) {
    for (const st of sym.supertraits) {
      rels.push(`Extends ◆ ${st}`);
    }
  }

  // Check if any impl block targets this type
  if (sym.kind === "struct" || sym.kind === "enum") {
    const impls = allSyms.filter(s => s.kind === "impl" && s.name === sym.name);
    for (const imp of impls) {
      if (imp.traitImpl) rels.push(`Has impl ▣ ${imp.traitImpl}`);
      else rels.push(`Has inherent impl (${imp.methods?.length ?? 0} methods)`);
    }
  }

  // Check field types for references to other symbols
  if (sym.fields) {
    for (const f of sym.fields) {
      for (const other of otherNames) {
        if (f.type.includes(other)) rels.push(`Field ${f.name} uses ◈ ${other}`);
      }
    }
  }

  // Check method return types / params
  if (sym.methods) {
    for (const m of sym.methods) {
      for (const other of otherNames) {
        if (m.returnType?.includes(other) || m.signature.includes(other))
          rels.push(`Method ${m.name}() references ${other}`);
      }
    }
  }

  return [...new Set(rels)].slice(0, 6);
}

/* ═══════════════════════════════════════════════
   DEEP CODE ANALYSIS
   ═══════════════════════════════════════════════ */

function findBlockEnd(lines: string[], startLine: number): number {
  let depth = 0;
  let foundOpen = false;
  for (let j = startLine; j < lines.length; j++) {
    for (const c of lines[j]) {
      if (c === "{") { depth++; foundOpen = true; }
      if (c === "}") depth--;
    }
    if (foundOpen && depth <= 0) return j;
    // Single-line definitions (no braces)
    if (lines[j].trim().endsWith(";") && !foundOpen) return j;
  }
  return Math.min(startLine + 1, lines.length - 1);
}

function extractFields(lines: string[], startLine: number, endLine: number): FieldInfo[] {
  const fields: FieldInfo[] = [];
  for (let j = startLine + 1; j <= endLine; j++) {
    const line = lines[j]?.trim();
    if (!line || line === "{" || line === "}") continue;
    // Skip doc comments as standalone lines but capture inline
    if (line.startsWith("///") || line.startsWith("//")) continue;

    const m = line.match(/^(pub(?:\([^)]*\))?\s+)?(\w+)\s*:\s*(.+?),?\s*(?:\/\/\s*(.+))?$/);
    if (m) {
      fields.push({
        visibility: m[1]?.trim() ?? "private",
        name: m[2],
        type: m[3].replace(/,$/, "").trim(),
        comment: m[4]?.trim(),
      });
    }
  }
  return fields;
}

function extractVariants(lines: string[], startLine: number, endLine: number): VariantInfo[] {
  const variants: VariantInfo[] = [];
  for (let j = startLine + 1; j <= endLine; j++) {
    const line = lines[j]?.trim();
    if (!line || line === "{" || line === "}") continue;
    if (line.startsWith("///") || line.startsWith("//")) continue;

    // Variant with data: Name(Type) or Name { field: Type }
    const m = line.match(/^(\w+)(\([^)]*\)|\s*\{[^}]*\})?,?\s*(?:\/\/\s*(.+))?$/);
    if (m && /^[A-Z]/.test(m[1])) {
      variants.push({
        name: m[1],
        data: m[2]?.trim(),
        comment: m[3]?.trim(),
      });
    }
  }
  return variants;
}

function extractMethods(lines: string[], startLine: number, endLine: number): MethodInfo[] {
  const methods: MethodInfo[] = [];
  let docBuf = "";
  for (let j = startLine + 1; j <= endLine; j++) {
    const line = lines[j]?.trim();
    if (!line) continue;
    if (line.startsWith("///")) {
      docBuf += (docBuf ? " " : "") + line.replace(/^\/\/\/\s?/, "");
      continue;
    }

    let rest = line;
    let vis = "private";
    if (rest.startsWith("pub(crate) ")) { vis = "pub(crate)"; rest = rest.slice(11).trim(); }
    else if (rest.startsWith("pub ")) { vis = "pub"; rest = rest.slice(4).trim(); }
    const isUnsafe = rest.startsWith("unsafe ");
    if (isUnsafe) rest = rest.slice(7).trim();
    const isAsync = rest.startsWith("async ");
    if (isAsync) rest = rest.slice(6).trim();

    const fm = rest.match(/^fn\s+(\w+)\s*(?:<[^>]*>)?\s*\(([^)]*)\)(?:\s*->\s*(.+?))?[\s{;]*$/);
    if (fm) {
      methods.push({
        name: fm[1],
        signature: line,
        returnType: fm[3]?.replace(/[{;]\s*$/, "").trim(),
        isUnsafe,
        isAsync,
        visibility: vis,
        comment: docBuf || undefined,
      });
      docBuf = "";
    } else {
      // Also capture associated types
      const tm = rest.match(/^type\s+(\w+)(?:\s*:\s*(.+))?;?\s*$/);
      if (tm) {
        methods.push({
          name: `type ${tm[1]}`,
          signature: line,
          returnType: tm[2],
          isUnsafe: false,
          isAsync: false,
          visibility: vis,
          comment: docBuf || undefined,
        });
        docBuf = "";
      } else {
        docBuf = "";
      }
    }
  }
  return methods;
}

function extractParams(rest: string): ParamInfo[] {
  const m = rest.match(/\(([^)]*)\)/);
  if (!m) return [];
  const inner = m[1].trim();
  if (!inner) return [];

  const params: ParamInfo[] = [];
  // Split by comma but respect nested generics
  let depth = 0;
  let current = "";
  for (const ch of inner) {
    if (ch === "<" || ch === "(") depth++;
    if (ch === ">" || ch === ")") depth--;
    if (ch === "," && depth === 0) {
      if (current.trim()) params.push(parseParam(current.trim()));
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) params.push(parseParam(current.trim()));
  return params;
}

function parseParam(p: string): ParamInfo {
  if (p === "self" || p === "&self" || p === "&mut self" || p === "mut self")
    return { name: "self", type: p, isMut: p.includes("mut"), isSelf: true };

  const isMut = p.startsWith("mut ");
  const clean = isMut ? p.slice(4).trim() : p;
  const colonIdx = clean.indexOf(":");
  if (colonIdx > 0) {
    return {
      name: clean.slice(0, colonIdx).trim(),
      type: clean.slice(colonIdx + 1).trim(),
      isMut,
      isSelf: false,
    };
  }
  return { name: clean, type: "?", isMut, isSelf: false };
}

function extractAttributes(lines: string[], line: number): string[] {
  const attrs: string[] = [];
  for (let j = line - 1; j >= Math.max(0, line - 10); j--) {
    const t = lines[j]?.trim();
    if (!t) continue;
    if (t.startsWith("#[") || t.startsWith("#![")) {
      attrs.push(t.replace(/^#\[!?\[/, "").replace(/\]$/, ""));
    } else if (!t.startsWith("///") && !t.startsWith("//")) break;
  }
  return attrs;
}

function analyzeCode(code: string): CodeSymbol[] {
  const lines = code.split("\n");
  const symbols: CodeSymbol[] = [];
  let docBuffer = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("///") || trimmed.startsWith("//!")) {
      docBuffer += (docBuffer ? " " : "") + trimmed.replace(/^\/\/[\/!]\s?/, "");
      continue;
    }
    if (trimmed === "") { if (!docBuffer) continue; }

    let vis: CodeSymbol["visibility"] = "private";
    let rest = trimmed;
    if (rest.startsWith("pub(crate)")) { vis = "pub(crate)"; rest = rest.slice(10).trim(); }
    else if (rest.startsWith("pub(super)")) { vis = "pub(super)"; rest = rest.slice(10).trim(); }
    else if (rest.startsWith("pub ")) { vis = "pub"; rest = rest.slice(4).trim(); }

    const isUnsafe = rest.startsWith("unsafe ");
    if (isUnsafe) rest = rest.slice(7).trim();
    const isAsync = rest.startsWith("async ");
    if (isAsync) rest = rest.slice(6).trim();

    let matched = false;
    const attributes = extractAttributes(lines, i);

    // ── struct ──
    const structMatch = rest.match(/^struct\s+([A-Za-z_]\w*)(?:<([^>]*)>)?/);
    if (structMatch) {
      const endLine = findBlockEnd(lines, i);
      const fields = extractFields(lines, i, endLine);
      const sym: CodeSymbol = {
        kind: "struct", name: structMatch[1], line: i, endLine, visibility: vis,
        isUnsafe, isAsync, generics: structMatch[2], doc: docBuffer,
        fields: fields.length > 0 ? fields : undefined, attributes,
        whyItExists: "", howItWorks: "", relationships: [],
      };
      symbols.push(sym);
      matched = true;
    }

    // ── enum ──
    const enumMatch = rest.match(/^enum\s+([A-Za-z_]\w*)(?:<([^>]*)>)?/);
    if (!matched && enumMatch) {
      const endLine = findBlockEnd(lines, i);
      const variants = extractVariants(lines, i, endLine);
      const sym: CodeSymbol = {
        kind: "enum", name: enumMatch[1], line: i, endLine, visibility: vis,
        isUnsafe, isAsync, generics: enumMatch[2], doc: docBuffer,
        variants: variants.length > 0 ? variants : undefined, attributes,
        whyItExists: "", howItWorks: "", relationships: [],
      };
      symbols.push(sym);
      matched = true;
    }

    // ── trait ──
    const traitMatch = rest.match(/^trait\s+([A-Za-z_]\w*)(?:<([^>]*)>)?(?:\s*:\s*(.+?))?\s*\{?\s*$/);
    if (!matched && traitMatch) {
      const endLine = findBlockEnd(lines, i);
      const methods = extractMethods(lines, i, endLine);
      const supertraits = traitMatch[3]?.split("+").map(s => s.trim()).filter(Boolean);
      const sym: CodeSymbol = {
        kind: "trait", name: traitMatch[1], line: i, endLine, visibility: vis,
        isUnsafe, isAsync, generics: traitMatch[2], doc: docBuffer,
        supertraits, methods: methods.length > 0 ? methods : undefined, attributes,
        whyItExists: "", howItWorks: "", relationships: [],
      };
      symbols.push(sym);
      matched = true;
    }

    // ── impl ──
    const implMatch = rest.match(/^impl(?:<([^>]*)>)?\s+(?:([A-Za-z_]\w*(?:<[^>]*>)?)\s+for\s+)?([A-Za-z_]\w*)(?:<([^>]*)>)?/);
    if (!matched && implMatch) {
      const endLine = findBlockEnd(lines, i);
      const methods = extractMethods(lines, i, endLine);
      const sym: CodeSymbol = {
        kind: "impl", name: implMatch[3], line: i, endLine, visibility: vis,
        isUnsafe, isAsync, generics: implMatch[4] || implMatch[1],
        traitImpl: implMatch[2], doc: docBuffer,
        methods: methods.length > 0 ? methods : undefined, attributes,
        whyItExists: "", howItWorks: "", relationships: [],
      };
      symbols.push(sym);
      matched = true;
    }

    // ── fn ──
    const fnMatch = rest.match(/^fn\s+([a-z_]\w*)\s*(?:<([^>]*)>)?\s*\(/);
    if (!matched && fnMatch) {
      const endLine = findBlockEnd(lines, i);
      const arrowMatch = rest.match(/->\s*(.+?)\s*[{;]?\s*$/);
      const params = extractParams(rest);
      const sym: CodeSymbol = {
        kind: "fn", name: fnMatch[1], line: i, endLine, visibility: vis,
        isUnsafe, isAsync, generics: fnMatch[2],
        returnType: arrowMatch?.[1]?.replace(/\s*\{$/, "").trim(),
        params: params.length > 0 ? params : undefined,
        doc: docBuffer, attributes,
        whyItExists: "", howItWorks: "", relationships: [],
      };
      symbols.push(sym);
      matched = true;
    }

    // ── const ──
    const constMatch = rest.match(/^const\s+([A-Z_]\w*)\s*:\s*([^=]+)=\s*(.+?);?\s*$/);
    if (!matched && constMatch) {
      const sym: CodeSymbol = {
        kind: "const", name: constMatch[1], line: i, endLine: i, visibility: vis,
        isUnsafe, isAsync, doc: docBuffer,
        constType: constMatch[2].trim(), constValue: constMatch[3].trim(),
        attributes,
        whyItExists: "", howItWorks: "", relationships: [],
      };
      symbols.push(sym);
      matched = true;
    }

    // ── static ──
    const staticMatch = rest.match(/^static\s+(?:mut\s+)?([A-Z_]\w*)\s*:/);
    if (!matched && staticMatch) {
      const endLine = findBlockEnd(lines, i);
      const sym: CodeSymbol = {
        kind: "static", name: staticMatch[1], line: i, endLine, visibility: vis,
        isUnsafe, isAsync, doc: docBuffer, attributes,
        whyItExists: "", howItWorks: "", relationships: [],
      };
      symbols.push(sym);
      matched = true;
    }

    // ── type ──
    const typeMatch = rest.match(/^type\s+([A-Za-z_]\w*)(?:<([^>]*)>)?\s*=\s*(.+?);?\s*$/);
    if (!matched && typeMatch) {
      const sym: CodeSymbol = {
        kind: "type", name: typeMatch[1], line: i, endLine: i, visibility: vis,
        isUnsafe, isAsync, generics: typeMatch[2], doc: docBuffer,
        typeAlias: typeMatch[3].trim(), attributes,
        whyItExists: "", howItWorks: "", relationships: [],
      };
      symbols.push(sym);
      matched = true;
    }

    // ── mod ──
    const modMatch = rest.match(/^mod\s+([a-z_]\w*)/);
    if (!matched && modMatch) {
      const sym: CodeSymbol = {
        kind: "mod", name: modMatch[1], line: i, endLine: i, visibility: vis,
        isUnsafe, isAsync, doc: docBuffer, attributes,
        whyItExists: "", howItWorks: "", relationships: [],
      };
      symbols.push(sym);
      matched = true;
    }

    // ── union ──
    const unionMatch = rest.match(/^union\s+([A-Za-z_]\w*)/);
    if (!matched && unionMatch) {
      const endLine = findBlockEnd(lines, i);
      const fields = extractFields(lines, i, endLine);
      const sym: CodeSymbol = {
        kind: "union", name: unionMatch[1], line: i, endLine, visibility: vis,
        isUnsafe, isAsync, doc: docBuffer,
        fields: fields.length > 0 ? fields : undefined, attributes,
        whyItExists: "", howItWorks: "", relationships: [],
      };
      symbols.push(sym);
      matched = true;
    }

    if (!trimmed.startsWith("///") && !trimmed.startsWith("//!")) docBuffer = "";
  }

  // Second pass: generate explanations with full context
  for (const sym of symbols) {
    sym.whyItExists = inferWhy(sym, symbols);
    sym.howItWorks = inferHow(sym);
    sym.designPattern = inferDesignPattern(sym);
    sym.memoryNote = inferMemoryNote(sym);
    sym.safetyNote = inferSafetyNote(sym);
    sym.relationships = inferRelationships(sym, symbols);
  }

  return symbols;
}

/* ═══════════════ Reference Map ═══════════════ */
function buildRefMap(code: string, symbols: CodeSymbol[]): Map<string, number[]> {
  const refs = new Map<string, number[]>();
  const lines = code.split("\n");
  const names = new Set(symbols.map(s => s.name));

  for (const name of names) {
    const lineNums: number[] = [];
    const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i])) lineNums.push(i);
    }
    if (lineNums.length > 0) refs.set(name, lineNums);
  }
  return refs;
}

/* ═══════════════════════════════════════════════
   RICH DETAIL PANEL — "Why?" + "How?" + Details
   ═══════════════════════════════════════════════ */

function SymbolBadge({ sym, isExpanded, onClick, refCount }: {
  sym: CodeSymbol; isExpanded: boolean; onClick: () => void; refCount: number;
}) {
  const color = COLOR[sym.kind];
  return (
    <div className="flex items-start gap-2 select-none" style={{ animation: "symbolSlideIn .4s ease-out" }}>
      <button
        onClick={onClick}
        className="shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer"
        style={{
          background: `${color}12`, border: `1px solid ${color}25`, color,
          boxShadow: isExpanded ? `0 0 12px ${color}15` : "none",
        }}
      >
        <span className="text-xs">{ICON[sym.kind]}</span>
        <span>{sym.kind}</span>
        {sym.visibility === "pub" && (
          <span className="ml-0.5 px-1 rounded text-[8px]" style={{ background: `${color}20` }}>pub</span>
        )}
        {sym.isUnsafe && <span className="ml-0.5 px-1 rounded text-[8px] bg-red-500/20 text-red-400">unsafe</span>}
        {sym.isAsync && <span className="ml-0.5 px-1 rounded text-[8px] bg-emerald-500/20 text-emerald-400">async</span>}
        {sym.designPattern && <span className="ml-0.5 text-[8px] opacity-60">{sym.designPattern.split(" ")[0]}</span>}
        <svg className={`w-2.5 h-2.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {refCount > 1 && (
        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono"
          style={{ background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.3)", border: "1px solid rgba(255,255,255,.06)" }}>
          {refCount} refs
        </span>
      )}
    </div>
  );
}

/* ═══════════════ Deep Symbol Detail Panel ═══════════════ */
function SymbolDetail({ sym }: { sym: CodeSymbol }) {
  const color = COLOR[sym.kind];
  const [activeTab, setActiveTab] = useState<"why" | "how" | "details">("why");

  const hasDetails = (sym.fields && sym.fields.length > 0) ||
    (sym.variants && sym.variants.length > 0) ||
    (sym.methods && sym.methods.length > 0) ||
    (sym.params && sym.params.length > 0);

  return (
    <div className="mt-1.5 mb-1 rounded-lg overflow-hidden text-[11px]"
      style={{
        background: `linear-gradient(135deg, ${color}04, rgba(0,0,0,.25))`,
        border: `1px solid ${color}12`,
        animation: "panelExpand .35s ease-out",
      }}>

      {/* ── Header ── */}
      <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-2 flex-wrap"
        style={{ borderBottom: `1px solid ${color}10` }}>
        <span className="font-bold text-[13px]" style={{ color }}>{sym.name}</span>
        {sym.generics && (
          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: "rgba(255,255,255,.03)", color: "#E06C75" }}>
            {"<"}{sym.generics}{">"}
          </span>
        )}
        {sym.designPattern && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-md" style={{ background: "rgba(123,104,238,.08)", color: "#9B8AFF", border: "1px solid rgba(123,104,238,.15)" }}>
            {sym.designPattern}
          </span>
        )}
        {sym.returnType && (
          <span className="flex items-center gap-1 text-[10px]">
            <span className="text-zinc-600">→</span>
            <span className="font-mono" style={{ color: "#E5C07B" }}>{sym.returnType}</span>
          </span>
        )}
        <span className="text-[9px] text-zinc-700 ml-auto">L{sym.line + 1}{sym.endLine > sym.line ? `–${sym.endLine + 1}` : ""}</span>
      </div>

      {/* ── Tabs ── */}
      <div className="flex px-3 pt-1.5 gap-0.5">
        {(["why", "how", ...(hasDetails ? ["details"] : [])] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className="px-2.5 py-1 rounded-t text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
            style={{
              background: activeTab === tab ? `${color}10` : "transparent",
              color: activeTab === tab ? color : "rgba(255,255,255,.25)",
              borderBottom: activeTab === tab ? `2px solid ${color}` : "2px solid transparent",
            }}
          >
            {tab === "why" ? "🎯 Why" : tab === "how" ? "⚙️ How" : "📋 Details"}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="px-3 py-2.5 space-y-2">

        {/* WHY tab */}
        {activeTab === "why" && (
          <div className="space-y-2" style={{ animation: "panelExpand .25s ease-out" }}>
            <p className="text-zinc-300 leading-relaxed" style={{ lineHeight: "1.6" }}>
              {sym.whyItExists}
            </p>

            {/* Relationships */}
            {sym.relationships.length > 0 && (
              <div className="pt-1.5 space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-zinc-600 font-bold">Relations</span>
                <div className="flex flex-wrap gap-1.5">
                  {sym.relationships.map((rel, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(255,255,255,.03)", color: "rgba(255,255,255,.4)", border: "1px solid rgba(255,255,255,.05)" }}>
                      {rel}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* HOW tab */}
        {activeTab === "how" && (
          <div className="space-y-2" style={{ animation: "panelExpand .25s ease-out" }}>
            <p className="text-zinc-300 leading-relaxed" style={{ lineHeight: "1.6" }}>
              {sym.howItWorks}
            </p>

            {/* Memory note */}
            {sym.memoryNote && (
              <div className="flex gap-2 rounded-md px-2.5 py-1.5"
                style={{ background: "rgba(86,182,194,.05)", border: "1px solid rgba(86,182,194,.1)" }}>
                <span className="text-[10px] shrink-0">💾</span>
                <p className="text-[10px] text-cyan-300/70 leading-relaxed">{sym.memoryNote}</p>
              </div>
            )}

            {/* Safety note */}
            {sym.safetyNote && (
              <div className="flex gap-2 rounded-md px-2.5 py-1.5"
                style={{ background: "rgba(224,108,117,.05)", border: "1px solid rgba(224,108,117,.1)" }}>
                <span className="text-[10px] shrink-0">⚠️</span>
                <p className="text-[10px] text-red-300/70 leading-relaxed">{sym.safetyNote}</p>
              </div>
            )}

            {/* Attributes */}
            {sym.attributes && sym.attributes.length > 0 && (
              <div className="pt-1 space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-zinc-600 font-bold">Attributes</span>
                <div className="flex flex-wrap gap-1">
                  {sym.attributes.map((attr, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                      style={{ background: "rgba(209,154,102,.06)", color: "#D19A66", border: "1px solid rgba(209,154,102,.1)" }}>
                      #[{attr}]
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DETAILS tab */}
        {activeTab === "details" && hasDetails && (
          <div className="space-y-2" style={{ animation: "panelExpand .25s ease-out" }}>

            {/* Function params */}
            {sym.params && sym.params.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-zinc-600 font-bold">Parameters</span>
                <div className="rounded-md overflow-hidden" style={{ border: "1px solid rgba(255,255,255,.05)" }}>
                  {sym.params.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 px-2.5 py-1 text-[10px]"
                      style={{ background: i % 2 === 0 ? "rgba(255,255,255,.015)" : "transparent", borderBottom: "1px solid rgba(255,255,255,.03)" }}>
                      <span className="font-mono font-bold" style={{ color: p.isSelf ? "#E06C75" : "#ABB2BF", minWidth: "60px" }}>{p.name}</span>
                      <span className="font-mono" style={{ color: "#E5C07B" }}>{p.type}</span>
                      {p.isMut && <span className="text-[8px] px-1 rounded bg-amber-500/10 text-amber-400">mut</span>}
                      <span className="text-zinc-600 ml-auto text-[9px]">
                        {p.isSelf ? (p.type.includes("mut") ? "Ref. exclusive" : p.type.includes("&") ? "Ref. partagée" : "Par valeur (consommé)")
                          : p.type.includes("&mut") ? "Ref. exclusive"
                          : p.type.includes("&") ? "Ref. partagée"
                          : "Propriété transférée"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Struct fields */}
            {sym.fields && sym.fields.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-zinc-600 font-bold">Fields ({sym.fields.length})</span>
                <div className="rounded-md overflow-hidden" style={{ border: "1px solid rgba(255,255,255,.05)" }}>
                  {sym.fields.map((f, i) => (
                    <div key={i} className="px-2.5 py-1 text-[10px]"
                      style={{ background: i % 2 === 0 ? "rgba(255,255,255,.015)" : "transparent", borderBottom: "1px solid rgba(255,255,255,.03)" }}>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full shrink-0" style={{ background: f.visibility === "pub" ? color : "rgba(255,255,255,.15)" }} />
                        <span className="font-mono font-bold" style={{ color: "#ABB2BF" }}>{f.name}</span>
                        <span className="font-mono" style={{ color: "#E5C07B" }}>{f.type}</span>
                        {f.visibility === "pub" && <span className="text-[8px] px-1 rounded" style={{ background: `${color}15`, color }}>pub</span>}
                      </div>
                      {f.comment && (
                        <p className="text-zinc-500 ml-3 mt-0.5 text-[9px] italic">{f.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enum variants */}
            {sym.variants && sym.variants.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-zinc-600 font-bold">Variants ({sym.variants.length})</span>
                <div className="rounded-md overflow-hidden" style={{ border: "1px solid rgba(255,255,255,.05)" }}>
                  {sym.variants.map((v, i) => (
                    <div key={i} className="px-2.5 py-1 text-[10px]"
                      style={{ background: i % 2 === 0 ? "rgba(255,255,255,.015)" : "transparent", borderBottom: "1px solid rgba(255,255,255,.03)" }}>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full shrink-0" style={{ background: COLOR.enum }} />
                        <span className="font-mono font-bold" style={{ color: COLOR.enum }}>{v.name}</span>
                        {v.data && <span className="font-mono text-zinc-500">{v.data}</span>}
                      </div>
                      {v.comment && (
                        <p className="text-zinc-500 ml-3 mt-0.5 text-[9px] italic">{v.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Methods */}
            {sym.methods && sym.methods.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-zinc-600 font-bold">Methods ({sym.methods.length})</span>
                <div className="rounded-md overflow-hidden" style={{ border: "1px solid rgba(255,255,255,.05)" }}>
                  {sym.methods.map((m, i) => (
                    <div key={i} className="px-2.5 py-1.5 text-[10px]"
                      style={{ background: i % 2 === 0 ? "rgba(255,255,255,.015)" : "transparent", borderBottom: "1px solid rgba(255,255,255,.03)" }}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold" style={{ color: m.name.startsWith("type ") ? "#E5C07B" : "#61AFEF" }}>
                          {m.name.startsWith("type ") ? m.name : `${m.name}()`}
                        </span>
                        {m.returnType && (
                          <span className="flex items-center gap-1">
                            <span className="text-zinc-600">→</span>
                            <span className="font-mono" style={{ color: "#E5C07B" }}>{m.returnType}</span>
                          </span>
                        )}
                        {m.visibility === "pub" && <span className="text-[8px] px-1 rounded" style={{ background: "rgba(97,175,239,.1)", color: "#61AFEF" }}>pub</span>}
                        {m.isUnsafe && <span className="text-[8px] px-1 rounded bg-red-500/10 text-red-400">unsafe</span>}
                        {m.isAsync && <span className="text-[8px] px-1 rounded bg-emerald-500/10 text-emerald-400">async</span>}
                      </div>
                      {m.comment && (
                        <p className="text-zinc-500 ml-0 mt-0.5 text-[9px] italic">{m.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ Minimap ═══════════════ */
function Minimap({ symbols, lineCount, onJump }: { symbols: CodeSymbol[]; lineCount: number; onJump: (line: number) => void }) {
  if (symbols.length === 0) return null;
  return (
    <div className="absolute top-0 right-0 w-1.5 h-full pointer-events-auto z-10" style={{ background: "rgba(0,0,0,.3)" }}>
      {symbols.map((sym, i) => {
        const top = (sym.line / Math.max(lineCount, 1)) * 100;
        return (
          <button key={`${sym.name}-${i}`} onClick={() => onJump(sym.line)}
            className="absolute left-0 w-full h-1 rounded-full transition-all duration-200 hover:w-3 hover:h-1.5 hover:-left-0.5 cursor-pointer"
            style={{ top: `${top}%`, background: COLOR[sym.kind], boxShadow: `0 0 4px ${COLOR[sym.kind]}40` }}
            title={`${sym.kind} ${sym.name}`}
          />
        );
      })}
    </div>
  );
}

/* ═══════════════ Line Token Extractor ═══════════════ */
function tokLine(tokens: { t: TT; v: string }[], lineNum: number): { t: TT; v: string }[] {
  let currentLine = 0;
  const lineTokens: { t: TT; v: string }[][] = [[]];
  for (const tk of tokens) {
    const parts = tk.v.split("\n");
    for (let p = 0; p < parts.length; p++) {
      if (p > 0) { currentLine++; if (!lineTokens[currentLine]) lineTokens[currentLine] = []; }
      if (parts[p].length > 0) {
        if (!lineTokens[currentLine]) lineTokens[currentLine] = [];
        lineTokens[currentLine].push({ t: tk.t, v: parts[p] });
      }
    }
  }
  return lineTokens[lineNum] ?? [];
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

export default function RustCode({ children, filename, language = "rust" }: Props) {
  const [copied, setCopied] = useState(false);
  const [expandedSyms, setExpandedSyms] = useState<Set<number>>(new Set());
  const [highlightName, setHighlightName] = useState<string | null>(null);
  const [showSymbols, setShowSymbols] = useState(true);
  const codeRef = useRef<HTMLDivElement>(null);

  const tokens = useMemo(() => tok(children), [children]);
  const lines = useMemo(() => children.split("\n"), [children]);
  const lineCount = lines.length;
  const symbols = useMemo(() => analyzeCode(children), [children]);
  const refMap = useMemo(() => buildRefMap(children, symbols), [children, symbols]);

  const symByLine = useMemo(() => {
    const map = new Map<number, CodeSymbol>();
    for (const s of symbols) map.set(s.line, s);
    return map;
  }, [symbols]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [children]);

  const toggleSym = useCallback((line: number) => {
    setExpandedSyms(prev => {
      const next = new Set(prev);
      if (next.has(line)) next.delete(line); else next.add(line);
      return next;
    });
  }, []);

  const jumpToLine = useCallback((line: number) => {
    const el = codeRef.current?.querySelector(`[data-line="${line}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const highlightedLines = useMemo(() => {
    if (!highlightName) return new Set<number>();
    return new Set(refMap.get(highlightName) ?? []);
  }, [highlightName, refMap]);

  const stats = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of symbols) m[s.kind] = (m[s.kind] || 0) + 1;
    return m;
  }, [symbols]);

  return (
    <div className="rounded-xl overflow-hidden font-mono text-sm my-8 relative"
      style={{
        background: "linear-gradient(180deg, #0c0e14, #080a10)",
        border: "1px solid rgba(255,255,255,.06)",
        boxShadow: "0 8px 50px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.03)",
      }}>

      <style>{`
        @keyframes symbolSlideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        @keyframes panelExpand{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes refPulse{0%,100%{background:rgba(97,175,239,.04)}50%{background:rgba(97,175,239,.1)}}
      `}</style>

      {/* ── Header ── */}
      {filename && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b"
          style={{ background: "rgba(255,255,255,.015)", borderColor: "rgba(255,255,255,.05)" }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/80" />
          </div>
          <span className="ml-2 text-zinc-500 text-xs">{filename}</span>

          <div className="ml-auto flex items-center gap-2">
            {Object.entries(stats).slice(0, 4).map(([kind, count]) => (
              <span key={kind} className="hidden sm:flex items-center gap-1 text-[9px]"
                style={{ color: COLOR[kind as CodeSymbol["kind"]] || "#888" }}>
                <span>{ICON[kind as CodeSymbol["kind"]]}</span>
                <span>{count}</span>
              </span>
            ))}

            <span className="text-zinc-700 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: "rgba(255,255,255,.03)" }}>{language}</span>

            {symbols.length > 0 && (
              <button onClick={() => setShowSymbols(!showSymbols)}
                className="text-[9px] px-2 py-0.5 rounded-md transition-all cursor-pointer"
                style={{
                  background: showSymbols ? "rgba(123,104,238,.1)" : "rgba(255,255,255,.03)",
                  border: `1px solid ${showSymbols ? "rgba(123,104,238,.2)" : "rgba(255,255,255,.05)"}`,
                  color: showSymbols ? "#9B8AFF" : "#555",
                }}>{showSymbols ? "◈ Analysis" : "◈ Off"}</button>
            )}

            <button onClick={handleCopy}
              className="text-zinc-600 hover:text-zinc-200 transition-all text-xs px-2.5 py-1 rounded-md cursor-pointer"
              style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.05)" }}>
              {copied ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Copied
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Copy
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Code Body ── */}
      <div ref={codeRef} className="relative overflow-x-auto">
        <Minimap symbols={symbols} lineCount={lineCount} onJump={jumpToLine} />

        <div className="py-3">
          {lines.map((_, i) => {
            const sym = symByLine.get(i);
            const isHighlighted = highlightedLines.has(i);
            const lineTokens = tokLine(tokens, i);
            const hasSym = symByLine.has(i);
            const lineNumWidth = String(lineCount).length;

            return (
              <React.Fragment key={i}>
                {/* Annotation row — aligned with code */}
                {sym && showSymbols && (
                  <div className="pr-6 mb-0.5" style={{ paddingLeft: `calc(${lineNumWidth * 0.65 + 1.5}em + 10px)` }} data-line={i}>
                    <SymbolBadge
                      sym={sym}
                      isExpanded={expandedSyms.has(i)}
                      onClick={() => toggleSym(i)}
                      refCount={refMap.get(sym.name)?.length ?? 0}
                    />
                    {expandedSyms.has(i) && <SymbolDetail sym={sym} />}
                  </div>
                )}

                {/* Code row — line number + code on same line */}
                <div className="flex transition-all duration-200"
                  style={{
                    background: isHighlighted ? "rgba(97,175,239,.06)" : undefined,
                    animation: isHighlighted ? "refPulse 2s ease-in-out infinite" : undefined,
                  }}>
                  {/* Line number */}
                  <div className="select-none pl-3 pr-2 text-right shrink-0 sticky left-0 z-[5] border-r"
                    style={{
                      borderColor: "rgba(255,255,255,.04)",
                      background: isHighlighted ? "rgba(97,175,239,.03)" : "rgba(0,0,0,.2)",
                      minWidth: `${lineNumWidth * 0.65 + 1.5}em`,
                    }}>
                    <div className={`text-[11px] leading-relaxed transition-colors ${hasSym && showSymbols ? "font-bold" : ""}`}
                      style={{ color: hasSym && showSymbols ? COLOR[symByLine.get(i)!.kind] : highlightedLines.has(i) ? "rgba(97,175,239,.6)" : "rgba(255,255,255,.12)" }}>
                      {hasSym && showSymbols ? ICON[symByLine.get(i)!.kind] : i + 1}
                    </div>
                  </div>

                  {/* Code content */}
                  <div className="flex-1 min-w-0 pl-2 pr-4 leading-relaxed text-[13px]"
                    style={{
                      whiteSpace: "pre",
                      borderLeft: isHighlighted ? "2px solid rgba(97,175,239,.4)" : "2px solid transparent",
                    }}>
                    {lineTokens.map((tk, j) => {
                      const isClickable = (tk.t === "ty" || tk.t === "fn" || tk.t === "bi" || tk.t === "mac") && refMap.has(tk.v.replace("!", ""));
                      const refName = tk.v.replace("!", "");
                      const isActive = highlightName === refName;

                      return (
                        <span key={j}
                          className={isClickable ? "cursor-pointer hover:underline decoration-dotted underline-offset-2 transition-all" : ""}
                          onClick={isClickable ? (e) => { e.stopPropagation(); setHighlightName(isActive ? null : refName); } : undefined}
                          style={{
                            color: isActive ? "#fff" : C[tk.t],
                            fontStyle: tk.t === "cmt" ? "italic" : undefined,
                            opacity: tk.t === "cmt" ? 0.6 : 1,
                            background: isActive ? `${C[tk.t]}25` : undefined,
                            borderRadius: isActive ? "2px" : undefined,
                            padding: isActive ? "0 2px" : undefined,
                            textShadow: isActive ? `0 0 8px ${C[tk.t]}60` : undefined,
                          }}>
                          {tk.v}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Symbol Index ── */}
      {symbols.length > 0 && showSymbols && (
        <div className="border-t px-4 py-2.5 flex items-center gap-4 flex-wrap"
          style={{ background: "rgba(255,255,255,.01)", borderColor: "rgba(255,255,255,.04)" }}>
          <span className="text-[9px] uppercase tracking-wider text-zinc-700 font-bold">Index</span>
          {symbols.map((sym, i) => (
            <button key={`idx-${i}`}
              onClick={() => { jumpToLine(sym.line); setHighlightName(highlightName === sym.name ? null : sym.name); }}
              className="flex items-center gap-1 text-[10px] transition-all duration-200 hover:opacity-100 cursor-pointer"
              style={{
                color: COLOR[sym.kind],
                opacity: highlightName === sym.name ? 1 : 0.5,
                textShadow: highlightName === sym.name ? `0 0 8px ${COLOR[sym.kind]}40` : "none",
              }}>
              <span>{ICON[sym.kind]}</span>
              <span className="font-medium">{sym.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
