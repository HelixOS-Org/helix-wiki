"use client";
import React from "react";
import Link from "next/link";
import { useI18n } from "@/helix-wiki/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer role="contentinfo" aria-label="Site footer" className="border-t border-zinc-800/60 py-14 mt-0 bg-black/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-600 text-sm" data-secret="↑↑↓↓←→←→BA → /compare" data-hint="kernel-wars">
            {t("footer.copyright")}
            <span className="sr-only"> — The ancient sequence awaits on the battlefield of kernels.</span>
          </p>
          <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-500">
            <a href="https://github.com/HelixOS-Org/helix" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-purple focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded">{t("footer.github")}</a>
            <Link href="/blog" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-purple focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded">Blog</Link>
            <Link href="/contributors" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-purple focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded">Contributors</Link>
            <a href="https://github.com/HelixOS-Org/helix/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-purple focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded">{t("footer.contributing")}</a>
            <Link href="/donate" className="hover:text-pink-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded"><span aria-hidden="true">♥ </span>{t("footer.donate")}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
