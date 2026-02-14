"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import HelixLogo from "./HelixLogo";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isDocsPage = pathname.startsWith("/docs");

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-white/5 bg-black/60">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-7 h-7"><HelixLogo /></div>
          <span className="text-lg font-bold tracking-widest">
            HELIX{" "}
            <span className="text-xs text-helix-blue align-top font-semibold">OS</span>
          </span>
        </Link>

        {/* Search — Desktop */}
        <div className="hidden md:block max-w-xs ml-2 mr-auto">
          <SearchBar />
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 text-sm shrink-0">
          <Link
            href="/docs"
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2
              ${isDocsPage
                ? "bg-white/[0.07] text-white shadow-[inset_0_0_0_1px_rgba(123,104,238,0.2)]"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Documentation
          </Link>
          <a
            href="https://github.com/HelixOS-Org/helix"
            target="_blank"
            className="ml-2 px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.333-1.723-1.333-1.723-1.089-.73.083-.716.083-.716 1.205.083 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.535-1.497.105-3.121 0 0 1.005-.316 3.3 1.209A11.707 11.707 0 0112 6.844c1.02.005 2.047.135 3.005.397 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.245 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56C20.565 21.917 24 17.495 24 12.292 24 5.78 18.627.5 12 .5z"/></svg>
            GitHub
          </a>
          <Link
            href="/download"
            className={`ml-1 px-4 py-2 rounded-full border border-helix-blue/30 bg-helix-blue/10
                       text-helix-blue text-xs font-bold
                       hover:bg-helix-blue/20 hover:border-helix-blue/50 hover:text-blue-300
                       transition-all duration-300 flex items-center gap-1.5
                       ${pathname === "/download" ? "bg-helix-blue/20 border-helix-blue/50 text-blue-300" : ""}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </Link>
          <Link
            href="/donate"
            className="ml-1 px-4 py-2 rounded-full border border-pink-500/30 bg-pink-500/10
                       text-pink-400 text-xs font-bold
                       hover:bg-pink-500/20 hover:border-pink-500/50 hover:text-pink-300
                       transition-all duration-300 flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            Donate
          </Link>
        </div>

        {/* Mobile: search + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <SearchBar />
          <button onClick={() => setOpen(!open)} className="p-2 text-zinc-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl">
          <div className="px-6 py-4 space-y-1">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Home
            </Link>
            <Link
              href="/docs"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all
                ${isDocsPage ? "text-white bg-white/[0.06]" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              Documentation
            </Link>
            <a
              href="https://github.com/HelixOS-Org/helix"
              target="_blank"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.333-1.723-1.333-1.723-1.089-.73.083-.716.083-.716 1.205.083 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.535-1.497.105-3.121 0 0 1.005-.316 3.3 1.209A11.707 11.707 0 0112 6.844c1.02.005 2.047.135 3.005.397 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.245 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56C20.565 21.917 24 17.495 24 12.292 24 5.78 18.627.5 12 .5z"/></svg>
              GitHub
            </a>
            <Link
              href="/download"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all
                ${pathname === "/download" ? "text-helix-blue bg-helix-blue/10" : "text-helix-blue hover:text-blue-300 hover:bg-helix-blue/10"}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </Link>
            <Link
              href="/donate"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              Donate
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
