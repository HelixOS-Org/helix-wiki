import type { Metadata } from "next";
import Link from "next/link";
import { docsNav } from "@/helix-wiki/lib/docsNav";
import Footer from "@/helix-wiki/components/Footer";

export const metadata: Metadata = {
  title: "Documentation — Kernel Architecture, APIs & Guides",
  description: "Complete technical documentation for Helix OS: kernel architecture, core subsystems, HAL, module system, HelixFS, NEXUS AI, and Lumina GPU. Written by and for systems developers.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "Helix OS Documentation — Kernel Architecture, APIs & Guides",
    description: "Deep-dive into every layer of the Helix kernel. Covers architecture, syscalls, IPC, memory management, scheduling, hot-reload modules, filesystem, and AI intelligence.",
    url: "https://helix-wiki.com/docs",
  },
};

export default function DocsIndexPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-helix-purple/10 border border-helix-purple/20 text-helix-purple text-xs font-mono mb-6">
            <span className="w-2 h-2 rounded-full bg-helix-purple animate-pulse" />
            v0.4.0 Aurora
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Helix OS{" "}
            <span className="bg-gradient-to-r from-helix-blue to-helix-purple bg-clip-text text-transparent">
              Documentation
            </span>
          </h1>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Everything you need to understand, use, and contribute to Helix — from architecture
            overview to deep-dive API references for every subsystem.
          </p>
        </div>
      </section>

      {/* Grid of all doc groups */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="space-y-10">
          {docsNav.map((group) => (
            <div key={group.label}>
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 mb-4">
                {group.label}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {group.pages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="group p-5 rounded-xl border border-zinc-800/60 bg-zinc-950/50
                               hover:border-helix-blue/30 hover:bg-helix-blue/[0.03]
                               hover:translate-y-[-1px] transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl">{page.icon}</span>
                      <h3 className="font-bold text-white group-hover:text-helix-blue transition-colors">
                        {page.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {page.sections.map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[11px] text-zinc-500"
                        >
                          {s.title}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
