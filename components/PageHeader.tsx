import React from "react";

interface Props {
  title: string;
  subtitle?: string;
  gradient?: string;
  badge?: string;
}

export default function PageHeader({ title, subtitle, gradient = "from-helix-blue to-helix-purple", badge }: Props) {
  return (
    <div className="pt-32 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        {badge && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-helix-purple/10 border border-helix-purple/20 text-helix-purple text-xs font-mono mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-helix-purple animate-pulse" />
            {badge}
          </div>
        )}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>{title}</span>
        </h1>
        {subtitle && <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed">{subtitle}</p>}
      </div>
    </div>
  );
}
