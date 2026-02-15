"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import HelixLogo from "./HelixLogo";
import SearchBar from "./SearchBar";
import { useI18n, LOCALES, type Locale } from "@/helix-wiki/lib/i18n";

const TOOL_LINKS = [
  { href: "/ask-helix", icon: "✨", labelKey: "tool.ask_helix", descKey: "tool.ask_helix_desc", hoverColor: "group-hover/item:text-helix-purple" },
  { href: "/compare", icon: "📊", labelKey: "tool.compare", descKey: "tool.compare_desc", hoverColor: "group-hover/item:text-helix-blue" },
  { href: "/boot", icon: "⚡", labelKey: "tool.boot", descKey: "tool.boot_desc", hoverColor: "group-hover/item:text-emerald-400" },
  { href: "/playground", icon: "🔧", labelKey: "tool.playground", descKey: "tool.playground_desc", hoverColor: "group-hover/item:text-amber-400" },
  { href: "/roadmap", icon: "🗺️", labelKey: "tool.roadmap", descKey: "tool.roadmap_desc", hoverColor: "group-hover/item:text-cyan-400" },
  { href: "/faq", icon: "❓", labelKey: "tool.faq", descKey: "tool.faq_desc", hoverColor: "group-hover/item:text-orange-400" },
  { href: "/glossary", icon: "📖", labelKey: "tool.glossary", descKey: "tool.glossary_desc", hoverColor: "group-hover/item:text-pink-400" },
  { href: "/contributing", icon: "🤝", labelKey: "tool.contributing", descKey: "tool.contributing_desc", hoverColor: "group-hover/item:text-green-400" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const pathname = usePathname();
  const isDocsPage = pathname.startsWith("/docs");
  const toolsRef = useRef<HTMLDivElement>(null);
  const toolsBtnRef = useRef<HTMLButtonElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const langBtnRef = useRef<HTMLButtonElement>(null);
  const { t, locale, setLocale } = useI18n();

  const currentLocaleInfo = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  /* Close dropdowns on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) setToolsOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    }
    if (toolsOpen || langOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [toolsOpen, langOpen]);

  /* Close dropdown on Escape */
  const handleToolsKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setToolsOpen(false); toolsBtnRef.current?.focus(); }
  }, []);

  const handleLangKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setLangOpen(false); langBtnRef.current?.focus(); }
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header role="banner" className="fixed top-0 w-full z-50">
      {/* Skip-to-content — a11y */}
      <a href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-helix-purple focus:text-white focus:rounded-lg focus:text-sm focus:font-bold focus:outline-none">
        {t("nav.skip")}
      </a>

      <nav aria-label="Primary navigation"
        className="backdrop-blur-xl border-b border-white/[0.06] bg-black/70 supports-[backdrop-filter]:bg-black/50">
        <div className="max-w-7xl mx-auto px-6 h-[4.5rem] flex items-center justify-between gap-6">
          {/* ── Logo ── */}
          <Link href="/" aria-label="Helix OS — Home"
            className="flex items-center gap-3 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-purple focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg">
            <div className="w-8 h-8 transition-transform group-hover:scale-105" aria-hidden="true"><HelixLogo /></div>
            <span className="text-xl font-bold tracking-widest select-none">
              HELIX{" "}
              <span className="text-xs text-helix-blue align-top font-semibold tracking-wider">OS</span>
            </span>
          </Link>

          {/* ── Search — Desktop ── */}
          <div className="hidden lg:block w-64 ml-2 mr-auto" role="search" aria-label="Search documentation">
            <SearchBar />
          </div>

          {/* ── Desktop nav ── */}
          <div className="hidden lg:flex items-center gap-1.5 text-[15px] shrink-0" role="menubar" aria-label="Main menu">
            {/* Docs */}
            <Link href="/docs" role="menuitem"
              className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-purple
                ${isDocsPage
                  ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(123,104,238,0.25)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              {t("nav.docs")}
            </Link>

            {/* ── Tools dropdown ── */}
            <div ref={toolsRef} className="relative" onKeyDown={handleToolsKeyDown}>
              <button ref={toolsBtnRef} onClick={() => setToolsOpen(o => !o)}
                aria-expanded={toolsOpen} aria-haspopup="true" aria-controls="tools-menu"
                className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-purple">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
                {t("nav.tools")}
                <svg className={`w-3 h-3 ml-0.5 transition-transform duration-200 ${toolsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div id="tools-menu" role="menu" aria-label={t("nav.interactive_tools")}
                className={`absolute top-full right-0 mt-2 w-72 z-50 transition-all duration-200 origin-top-right ${toolsOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"}`}>
                <div className="bg-zinc-900/95 backdrop-blur-2xl border border-zinc-700/40 rounded-2xl shadow-2xl shadow-black/50 p-2.5 space-y-0.5">
                  {TOOL_LINKS.map(tl => (
                    <Link key={tl.href} href={tl.href} role="menuitem" onClick={() => setToolsOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-colors group/item focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-purple focus-visible:ring-inset ${pathname === tl.href ? "bg-white/[0.04]" : ""}`}>
                      <span className="text-lg" aria-hidden="true">{tl.icon}</span>
                      <div>
                        <p className={`text-sm font-bold text-white ${tl.hoverColor} transition-colors`}>{t(tl.labelKey)}</p>
                        <p className="text-[10px] text-zinc-500 leading-tight">{t(tl.descKey)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* GitHub */}
            <a href="https://github.com/HelixOS-Org/helix" target="_blank" rel="noopener noreferrer"
              aria-label="Helix OS on GitHub (opens in new tab)"
              className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-purple">
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.333-1.723-1.333-1.723-1.089-.73.083-.716.083-.716 1.205.083 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.535-1.497.105-3.121 0 0 1.005-.316 3.3 1.209A11.707 11.707 0 0112 6.844c1.02.005 2.047.135 3.005.397 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.245 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56C20.565 21.917 24 17.495 24 12.292 24 5.78 18.627.5 12 .5z"/></svg>
              {t("nav.github")}
            </a>

            {/* ── Language selector dropdown ── */}
            <div ref={langRef} className="relative" onKeyDown={handleLangKeyDown}>
              <button ref={langBtnRef} onClick={() => setLangOpen(o => !o)}
                aria-expanded={langOpen} aria-haspopup="true" aria-controls="lang-menu"
                aria-label={t("nav.language")}
                className="px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-purple text-sm">
                <span aria-hidden="true">{currentLocaleInfo.flag}</span>
                <span className="uppercase font-semibold text-xs tracking-wider">{locale}</span>
                <svg className={`w-3 h-3 ml-0.5 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div id="lang-menu" role="menu" aria-label={t("nav.language")}
                className={`absolute top-full right-0 mt-2 w-48 z-50 transition-all duration-200 origin-top-right ${langOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"}`}>
                <div className="bg-zinc-900/95 backdrop-blur-2xl border border-zinc-700/40 rounded-2xl shadow-2xl shadow-black/50 p-2 max-h-80 overflow-y-auto space-y-0.5">
                  {LOCALES.map((loc) => (
                    <button key={loc.code} role="menuitem"
                      onClick={() => { setLocale(loc.code as Locale); setLangOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-purple focus-visible:ring-inset
                        ${locale === loc.code ? "bg-helix-purple/15 text-white" : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"}`}>
                      <span className="text-base" aria-hidden="true">{loc.flag}</span>
                      <span className="text-sm font-medium">{loc.label}</span>
                      {locale === loc.code && (
                        <svg className="w-3.5 h-3.5 ml-auto text-helix-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Download */}
            <Link href="/download" aria-label="Download Helix OS ISO"
              className={`ml-1 px-5 py-2.5 rounded-full border text-sm font-bold transition-all duration-300 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-blue focus-visible:ring-offset-2 focus-visible:ring-offset-black
                ${pathname === "/download"
                  ? "border-helix-blue/50 bg-helix-blue/20 text-blue-300"
                  : "border-helix-blue/30 bg-helix-blue/10 text-helix-blue hover:bg-helix-blue/20 hover:border-helix-blue/50 hover:text-blue-300"
                }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t("nav.download")}
            </Link>

            {/* Donate */}
            <Link href="/donate" aria-label="Support Helix OS — Donate"
              className="ml-1 px-5 py-2.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400 text-sm font-bold hover:bg-pink-500/20 hover:border-pink-500/50 hover:text-pink-300 transition-all duration-300 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              {t("nav.donate")}
            </Link>
          </div>

          {/* ── Mobile: search + hamburger ── */}
          <div className="flex lg:hidden items-center gap-3">
            <div role="search" aria-label="Search documentation"><SearchBar /></div>
            <button onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="mobile-menu"
              aria-label={open ? t("nav.close_menu") : t("nav.open_menu")}
              className="p-2.5 text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-purple">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {open
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <div id="mobile-menu" role="menu" aria-label="Mobile navigation"
          className={`lg:hidden border-t border-white/[0.06] bg-black/95 backdrop-blur-xl transition-all duration-300 overflow-hidden ${open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="px-6 py-5 space-y-1">
            <Link href="/" role="menuitem" onClick={() => setOpen(false)}
              className={`block px-4 py-3.5 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-purple ${pathname === "/" ? "text-white bg-white/[0.06]" : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"}`}>
              {t("nav.home")}
            </Link>
            <Link href="/docs" role="menuitem" onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-3.5 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-purple
                ${isDocsPage ? "text-white bg-white/[0.06]" : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              {t("nav.documentation")}
            </Link>
            <div className="px-4 pt-3 pb-1.5" role="separator"><span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{t("nav.interactive_tools")}</span></div>
            {TOOL_LINKS.map(tl => (
              <Link key={tl.href} href={tl.href} role="menuitem" onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-purple ${pathname === tl.href ? "text-white bg-white/[0.04]" : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"}`}>
                <span aria-hidden="true">{tl.icon}</span><span>{t(tl.labelKey)}</span>
              </Link>
            ))}
            <hr className="border-zinc-800/60 my-2" role="separator" />

            {/* ── Mobile Language Selector ── */}
            <div className="px-4 pt-2 pb-1.5" role="separator"><span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{t("nav.language")}</span></div>
            <div className="grid grid-cols-2 gap-1 px-2">
              {LOCALES.map((loc) => (
                <button key={loc.code} role="menuitem"
                  onClick={() => { setLocale(loc.code as Locale); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-purple
                    ${locale === loc.code ? "bg-helix-purple/15 text-white" : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"}`}>
                  <span className="text-sm" aria-hidden="true">{loc.flag}</span>
                  <span className="text-xs font-medium truncate">{loc.label}</span>
                </button>
              ))}
            </div>
            <hr className="border-zinc-800/60 my-2" role="separator" />

            <a href="https://github.com/HelixOS-Org/helix" target="_blank" rel="noopener noreferrer" role="menuitem" onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-purple">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.333-1.723-1.333-1.723-1.089-.73.083-.716.083-.716 1.205.083 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.535-1.497.105-3.121 0 0 1.005-.316 3.3 1.209A11.707 11.707 0 0112 6.844c1.02.005 2.047.135 3.005.397 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.245 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56C20.565 21.917 24 17.495 24 12.292 24 5.78 18.627.5 12 .5z"/></svg>
              {t("nav.github")} <span className="text-[10px] text-zinc-700 ml-auto" aria-hidden="true">↗</span>
            </a>
            <Link href="/download" role="menuitem" onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-3.5 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helix-blue
                ${pathname === "/download" ? "text-helix-blue bg-helix-blue/10" : "text-helix-blue hover:text-blue-300 hover:bg-helix-blue/10"}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              {t("nav.download")}
            </Link>
            <Link href="/donate" role="menuitem" onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              {t("nav.donate")}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
