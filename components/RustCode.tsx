"use client";

import React, { useState, useCallback, useMemo } from "react";

interface Props {
  children: string;
  filename?: string;
  language?: string;
}

/* ═══════════════ Token Types ═══════════════ */
type TT =
  | "kw" | "ctrl" | "ty" | "bi" | "str" | "chr"
  | "cmt" | "num" | "mac" | "attr" | "lt"
  | "op" | "punc" | "fn" | "cst" | "slf" | "plain";

const C: Record<TT, string> = {
  kw:   "#C678DD", ctrl: "#C678DD", ty:  "#E5C07B", bi:   "#56B6C2",
  str:  "#98C379", chr:  "#98C379", cmt: "#5C6370", num:  "#D19A66",
  mac:  "#61AFEF", attr: "#D19A66", lt:  "#E06C75", op:   "#56B6C2",
  punc: "#ABB2BF", fn:   "#61AFEF", cst: "#D19A66", slf:  "#E06C75",
  plain:"#ABB2BF",
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

    // Comments
    if (ch === "/" && code[i+1] === "/") {
      let e = code.indexOf("\n", i); if (e === -1) e = len;
      out.push({ t: "cmt", v: code.slice(i, e) }); i = e; continue;
    }
    if (ch === "/" && code[i+1] === "*") {
      let d = 1, j = i + 2;
      while (j < len && d > 0) { if (code[j]==="/" && code[j+1]==="*") { d++; j+=2; } else if (code[j]==="*" && code[j+1]==="/") { d--; j+=2; } else j++; }
      out.push({ t: "cmt", v: code.slice(i, j) }); i = j; continue;
    }

    // Attributes
    if (ch === "#" && (code[i+1] === "[" || (code[i+1] === "!" && code[i+2] === "["))) {
      let d = 0, j = i;
      while (j < len) { if (code[j]==="[") d++; else if (code[j]==="]") { d--; if (d===0) { j++; break; } } j++; }
      out.push({ t: "attr", v: code.slice(i, j) }); i = j; continue;
    }

    // Strings
    if (ch === '"') {
      let j = i + 1;
      while (j < len && !(code[j] === '"' && code[j-1] !== "\\")) j++;
      out.push({ t: "str", v: code.slice(i, j+1) }); i = j + 1; continue;
    }
    if (ch === "r" && code[i+1] === "#" && code[i+2] === '"') {
      let j = i + 3;
      while (j < len && !(code[j] === '"' && code[j+1] === "#")) j++;
      out.push({ t: "str", v: code.slice(i, j+2) }); i = j + 2; continue;
    }

    // Lifetime
    if (ch === "'" && /[a-zA-Z_]/.test(code[i+1]||"")) {
      let j = i + 1;
      while (j < len && /[a-zA-Z0-9_]/.test(code[j])) j++;
      out.push({ t: "lt", v: code.slice(i, j) }); i = j; continue;
    }

    // Char literal
    if (ch === "'" && i+2 < len && code[i+2] === "'" && code[i+1] !== "'") {
      out.push({ t: "chr", v: code.slice(i, i+3) }); i += 3; continue;
    }

    // Numbers
    if (/[0-9]/.test(ch)) {
      let j = i;
      if (code[j]==="0" && "xXbBoO".includes(code[j+1]||"")) {
        const base = code[j+1].toLowerCase();
        j += 2;
        const pat = base==="x" ? /[0-9a-fA-F_]/ : base==="b" ? /[01_]/ : /[0-7_]/;
        while (j < len && pat.test(code[j])) j++;
      } else {
        while (j < len && /[0-9_]/.test(code[j])) j++;
        if (code[j]==="." && /[0-9]/.test(code[j+1]||"")) { j++; while (j < len && /[0-9_]/.test(code[j])) j++; }
        if ((code[j]==="e"||code[j]==="E")) { j++; if (code[j]==="+"||code[j]==="-") j++; while (j < len && /[0-9_]/.test(code[j])) j++; }
      }
      const sf = code.slice(j).match(/^(u8|u16|u32|u64|u128|usize|i8|i16|i32|i64|i128|isize|f32|f64)/);
      if (sf) j += sf[1].length;
      out.push({ t: "num", v: code.slice(i, j) }); i = j; continue;
    }

    // Identifiers
    if (/[a-zA-Z_]/.test(ch)) {
      let j = i;
      while (j < len && /[a-zA-Z0-9_]/.test(code[j])) j++;
      const w = code.slice(i, j);
      if (code[j] === "!") { out.push({ t: "mac", v: w+"!" }); i = j+1; continue; }
      const tt: TT = (w==="self"||w==="Self") ? "slf" : KW.has(w) ? "kw" : CT.has(w) ? "ctrl" : TY.has(w) ? "ty" : BI.has(w) ? "bi" : /^[A-Z][A-Z0-9_]+$/.test(w)&&w.length>1 ? "cst" : /^[A-Z]/.test(w) ? "ty" : code[j]==="(" ? "fn" : "plain";
      out.push({ t: tt, v: w }); i = j; continue;
    }

    // Operators
    if ("=<>!&|+-*/%^~?".includes(ch)) {
      let op = ch;
      if (i+1 < len && ["=>","->","::","==","!=","<=",">=","&&","||","<<",">>","+=","-=","*=","/="].includes(ch+code[i+1])) op = ch+code[i+1];
      out.push({ t: "op", v: op }); i += op.length; continue;
    }
    if (ch === ":" && code[i+1] === ":") { out.push({ t: "punc", v: "::" }); i += 2; continue; }
    if (ch === "." && code[i+1] === ".") {
      if (code[i+2] === ".") { out.push({ t: "op", v: "..." }); i += 3; } else { out.push({ t: "op", v: ".." }); i += 2; }
      continue;
    }
    if ("{}[]().,;:@".includes(ch)) { out.push({ t: "punc", v: ch }); i++; continue; }

    // Whitespace
    if (ch === "\n") { out.push({ t: "plain", v: "\n" }); i++; continue; }
    if (/\s/.test(ch)) {
      let j = i; while (j < len && /\s/.test(code[j]) && code[j] !== "\n") j++;
      out.push({ t: "plain", v: code.slice(i, j) }); i = j; continue;
    }

    out.push({ t: "plain", v: ch }); i++;
  }
  return out;
}

/* ═══════════════ Component ═══════════════ */
export default function RustCode({ children, filename, language = "rust" }: Props) {
  const [copied, setCopied] = useState(false);
  const tokens = useMemo(() => tok(children), [children]);
  const lineCount = children.split("\n").length;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [children]);

  return (
    <div className="rounded-xl overflow-hidden bg-[#0d1117] border border-zinc-800/60 shadow-2xl font-mono text-sm my-6 group relative">
      {filename && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800/60 bg-[#161b22]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="ml-2 text-zinc-500 text-xs font-mono">{filename}</span>
          <span className="ml-auto text-zinc-600 text-[10px] uppercase tracking-wider mr-2">{language}</span>
          <button onClick={handleCopy}
            className="text-zinc-600 hover:text-zinc-300 transition-colors text-xs px-2 py-0.5 rounded border border-zinc-800/60 hover:border-zinc-600/60 hover:bg-zinc-800/40 cursor-pointer">
            {copied ? "✓ Copié" : "Copier"}
          </button>
        </div>
      )}
      <div className="flex overflow-x-auto">
        <div className="select-none py-4 pl-4 pr-3 text-right border-r border-zinc-800/40 sticky left-0 bg-[#0d1117]">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="text-[11px] leading-relaxed text-zinc-700 hover:text-zinc-500 transition-colors">{i + 1}</div>
          ))}
        </div>
        <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed flex-1 min-w-0">
          <code>{tokens.map((tk, i) => (
            <span key={i} style={{ color: C[tk.t], fontStyle: tk.t === "cmt" ? "italic" : undefined }}>{tk.v}</span>
          ))}</code>
        </pre>
      </div>
    </div>
  );
}
