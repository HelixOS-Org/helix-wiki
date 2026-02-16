"use client";

import React, { useEffect, useRef, useState } from "react";

interface Props {
  title: string;
  subtitle?: string;
  gradient?: string;
  badge?: string;
}

export default function PageHeader({ title, subtitle, gradient = "from-helix-blue to-helix-purple", badge }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <header className="relative pt-32 pb-20 px-6 overflow-hidden" role="banner" aria-label={title}>
      {/* Ambient blurs */}
      <div className="absolute -top-40 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none opacity-[.04]"
        style={{ background: "radial-gradient(circle, #7B68EE, transparent 70%)" }} />
      <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full pointer-events-none opacity-[.03]"
        style={{ background: "radial-gradient(circle, #4A90E2, transparent 70%)" }} />

      {/* Horizontal line accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: "linear-gradient(90deg, transparent, rgba(123,104,238,.15), rgba(74,144,226,.15), transparent)" }} />

      <div className={`max-w-5xl mx-auto transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        {badge && (
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full mb-8 text-xs font-mono"
            style={{ background: "rgba(123,104,238,.08)", border: "1px solid rgba(123,104,238,.15)", color: "#9B8AFF" }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-helix-purple opacity-40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-helix-purple" />
            </span>
            {badge}
          </div>
        )}

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}
            style={{ filter: "drop-shadow(0 0 40px rgba(123,104,238,.15))" }}>
            {title}
          </span>
        </h1>

        {subtitle && (
          <p className={`mt-5 text-lg text-zinc-400 max-w-2xl leading-relaxed transition-all duration-700 delay-150 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            {subtitle}
          </p>
        )}

        {/* Decorative tag line */}
        <div className={`mt-8 flex items-center gap-3 transition-all duration-700 delay-300 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="h-[1px] w-12" style={{ background: "linear-gradient(90deg, rgba(123,104,238,.4), transparent)" }} />
          <span className="text-[10px] font-mono text-zinc-600 tracking-[.3em] uppercase">Documentation</span>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </header>
  );
}
