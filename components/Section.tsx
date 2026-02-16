"use client";

import React, { useEffect, useRef, useState } from "react";

interface Props {
  children: React.ReactNode;
  title: string;
  id?: string;
}

export default function Section({ children, title, id }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} className={`max-w-5xl mx-auto px-6 py-14 transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      {/* Section header with gradient accent */}
      <div className="flex items-center gap-4 mb-10 group">
        <div className="relative">
          <div className="w-1 h-9 rounded-full bg-gradient-to-b from-helix-blue to-helix-purple" />
          <div className="absolute inset-0 w-1 rounded-full bg-gradient-to-b from-helix-blue to-helix-purple blur-md opacity-50" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h2>
        {id && (
          <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-helix-blue ml-1" aria-label={`Link to ${title}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
          </a>
        )}
      </div>

      {/* Content area */}
      <div className="text-zinc-300 leading-relaxed space-y-6 pl-5 border-l border-zinc-800/40">
        {children}
      </div>

      {/* Section divider */}
      <div className="mt-14 h-[1px]" style={{ background: "linear-gradient(90deg, rgba(123,104,238,.1), rgba(74,144,226,.08), transparent)" }} />
    </section>
  );
}
