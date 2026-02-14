import React from "react";

interface Props {
  children: React.ReactNode;
  title: string;
  id?: string;
}

export default function Section({ children, title, id }: Props) {
  return (
    <section id={id} className="max-w-5xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <span className="w-1 h-8 bg-gradient-to-b from-helix-blue to-helix-purple rounded-full" />
        {title}
      </h2>
      <div className="text-zinc-300 leading-relaxed space-y-6">{children}</div>
    </section>
  );
}
