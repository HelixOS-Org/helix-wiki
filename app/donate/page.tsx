import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/helix-wiki/components/Footer";

export const metadata: Metadata = {
  title: "Donate — Support Open Source OS Development",
  description:
    "Support Helix OS development. Every contribution funds kernel engineering, documentation, CI infrastructure, and community growth. Choose your tier and help build the future of operating systems.",
  alternates: { canonical: "/donate" },
  openGraph: {
    title: "Support Helix OS — Fund Open Source Kernel Development",
    description:
      "Helix OS is built by the community, for the community. Donate to support full-time kernel engineering, documentation, and multi-architecture hardware testing.",
    url: "https://helix-wiki.com/donate",
  },
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Tier data
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const tiers = [
  {
    name: "Supporter",
    emoji: "☕",
    price: "$5",
    period: "one-time",
    tagline: "Buy the team a coffee",
    description: "Every single dollar keeps the lights on and the compiler running.",
    perks: ["Name in CREDITS.md", "Supporter badge on Discord", "Our eternal gratitude"],
    gradient: "from-zinc-400 to-zinc-500",
    ring: "ring-zinc-700/40 hover:ring-zinc-500/60",
    bg: "bg-zinc-900/40",
    glow: "",
  },
  {
    name: "Contributor",
    emoji: "⚡",
    price: "$25",
    period: "/ month",
    tagline: "Fuel continuous development",
    description: "Directly fund kernel engineering, CI infrastructure, and documentation.",
    perks: [
      "Everything in Supporter",
      "Early access to releases",
      "Contributor role on Discord",
      "Vote on feature priorities",
    ],
    gradient: "from-helix-blue to-helix-purple",
    ring: "ring-helix-blue/25 hover:ring-helix-blue/60",
    bg: "bg-helix-blue/[0.03]",
    glow: "hover:shadow-[0_0_60px_rgba(74,144,226,0.08)]",
  },
  {
    name: "Sponsor",
    emoji: "💎",
    price: "$100",
    period: "/ month",
    tagline: "Core sponsorship",
    description: "Your brand on the README, the website, and every release announcement.",
    perks: [
      "Everything in Contributor",
      "Logo on GitHub README",
      "Logo on helix-wiki homepage",
      "Direct access to maintainers",
      "Quarterly progress reports",
    ],
    gradient: "from-helix-purple to-helix-accent",
    ring: "ring-helix-purple/30 hover:ring-helix-purple/70",
    bg: "bg-helix-purple/[0.04]",
    glow: "hover:shadow-[0_0_80px_rgba(123,104,238,0.1)]",
    popular: true,
  },
  {
    name: "Platinum",
    emoji: "🚀",
    price: "$500",
    period: "/ month",
    tagline: "Enterprise partnership",
    description: "For organizations that want to shape the future of open-source operating systems.",
    perks: [
      "Everything in Sponsor",
      "Large logo placement",
      "Feature request priority",
      "Monthly 1:1 with core team",
      "Custom integration support",
      "Mentioned in release notes",
    ],
    gradient: "from-amber-400 to-orange-500",
    ring: "ring-amber-500/25 hover:ring-amber-500/60",
    bg: "bg-amber-500/[0.03]",
    glow: "hover:shadow-[0_0_100px_rgba(245,158,11,0.07)]",
  },
];

const quickAmounts = [
  { amount: "$10", emoji: "🧋", label: "Boba Tea", color: "text-emerald-400" },
  { amount: "$50", emoji: "🍕", label: "Pizza Night", color: "text-blue-400" },
  { amount: "$250", emoji: "🖥️", label: "Server Costs", color: "text-purple-400" },
  { amount: "$1,000", emoji: "🏗️", label: "Milestone Fund", color: "text-amber-400" },
];

const milestones = [
  { goal: "$500 / mo", label: "Dedicated CI runners", progress: 72, color: "from-helix-blue to-helix-purple" },
  { goal: "$2,000 / mo", label: "Part-time maintainer", progress: 28, color: "from-helix-purple to-helix-accent" },
  { goal: "$5,000 / mo", label: "Full-time engineer", progress: 8, color: "from-amber-400 to-orange-500" },
];

const impactStats = [
  { icon: "🔩", value: "812K+", label: "Lines of Rust", sub: "100% #![no_std]" },
  { icon: "📦", value: "20+", label: "Workspace Crates", sub: "All hot-swappable" },
  { icon: "🏗️", value: "3", label: "Architectures", sub: "x86_64 · AArch64 · RISC-V" },
  { icon: "🤝", value: "0", label: "Corporate Owners", sub: "Community-driven forever" },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Page
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function DonatePage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-pink-500/30 overflow-hidden">
      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-[-10%] left-[20%] w-[700px] h-[700px] rounded-full bg-pink-600/[0.04] blur-[160px] animate-pulse-slow" />
        <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] rounded-full bg-helix-purple/[0.05] blur-[140px] animate-pulse-slow" />
        <div className="absolute bottom-[0%] left-[40%] w-[600px] h-[600px] rounded-full bg-helix-blue/[0.04] blur-[150px] animate-pulse-slow" />
      </div>

      <main className="relative">
        {/* ═══════════════════════════════════════════════════════
            HERO
           ═══════════════════════════════════════════════════════ */}
        <section className="relative pt-36 pb-24">
          <div className="max-w-5xl mx-auto px-6 text-center">
            {/* Floating heart with pulse ring */}
            <div className="relative inline-flex mb-10">
              <div className="absolute inset-0 rounded-3xl bg-pink-500/20 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500/20 to-rose-600/20 border border-pink-500/30 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-10 h-10 text-pink-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/8 border border-pink-500/20 text-pink-400 text-xs font-mono mb-8">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              Open Source · Community Funded · Zero Ads
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              Help Us Build the{" "}
              <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-helix-purple bg-clip-text text-transparent">
                Future
              </span>
              <br className="hidden sm:block" />
              <span className="text-zinc-400 text-4xl sm:text-5xl lg:text-6xl"> of Operating Systems</span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Helix OS is built in the open, by passionate engineers, for everyone.
              No investors. No corporate agenda. Just{" "}
              <strong className="text-white">Rust, caffeine, and your support</strong>.
            </p>

            {/* CTA Scroll */}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="#tiers"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-pink-500/20 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                Become a Sponsor
              </a>
              <a
                href="https://github.com/sponsors/HelixOS-Org"
                target="_blank"
                className="px-8 py-4 rounded-full border border-zinc-700 text-white font-bold hover:bg-zinc-900 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub Sponsors
              </a>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            IMPACT STATS — Horizontal ribbon
           ═══════════════════════════════════════════════════════ */}
        <section className="relative border-y border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {impactStats.map((s) => (
              <div key={s.label} className="text-center group">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-3xl font-extrabold text-white">{s.value}</div>
                <div className="text-sm text-zinc-400 mt-1 font-medium">{s.label}</div>
                <div className="text-[11px] text-zinc-600 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            WHERE FUNDS GO
           ═══════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-helix-blue/10 border border-helix-blue/20 text-helix-blue text-xs font-mono mb-4">
              💰 Transparency
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Where Your Money{" "}
              <span className="bg-gradient-to-r from-helix-blue to-helix-purple bg-clip-text text-transparent">
                Actually Goes
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { pct: "40%", icon: "🖥️", title: "Infrastructure", desc: "CI runners, servers, domain & hosting, multi-arch hardware for testing." },
              { pct: "30%", icon: "👩‍💻", title: "Engineering", desc: "Contributor stipends, bounty programs, and part-time maintainer funding." },
              { pct: "20%", icon: "📚", title: "Documentation", desc: "Technical writing, diagrams, tutorials, and video content production." },
              { pct: "10%", icon: "🌍", title: "Community", desc: "Conference sponsorships, swag, Discord bots, and outreach programs." },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative p-6 rounded-2xl border border-zinc-800/50 bg-zinc-950/40 hover:border-zinc-700/60 transition-all duration-300"
              >
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-zinc-700 to-zinc-800 absolute top-4 right-5">
                  {item.pct}
                </div>
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-white text-lg">{item.title}</h3>
                <p className="text-sm text-zinc-500 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FUNDING MILESTONES
           ═══════════════════════════════════════════════════════ */}
        <section className="max-w-4xl mx-auto px-6 pb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Funding Milestones</h2>
            <p className="text-zinc-500 mt-2">Help us hit the next goal — every dollar brings us closer.</p>
          </div>

          <div className="space-y-6">
            {milestones.map((m) => (
              <div key={m.label} className="p-5 rounded-2xl border border-zinc-800/50 bg-zinc-950/40">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-bold text-white">{m.label}</span>
                    <span className="text-sm text-zinc-500 ml-3">{m.goal}</span>
                  </div>
                  <span className={`text-sm font-mono font-bold bg-gradient-to-r ${m.color} bg-clip-text text-transparent`}>
                    {m.progress}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-zinc-800/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-1000`}
                    style={{ width: `${m.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SPONSORSHIP TIERS
           ═══════════════════════════════════════════════════════ */}
        <section id="tiers" className="scroll-mt-24 max-w-7xl mx-auto px-6 pb-24">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-helix-purple/10 border border-helix-purple/20 text-helix-purple text-xs font-mono mb-4">
              ✨ Tiers
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-helix-purple to-pink-400 bg-clip-text text-transparent">
                Level of Impact
              </span>
            </h2>
            <p className="text-zinc-500 mt-3 max-w-lg mx-auto">
              Recurring subscriptions give us stability. One-time gifts are equally welcome.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative group rounded-3xl ring-1 p-[1px] transition-all duration-500 hover:translate-y-[-4px]
                            ${tier.ring} ${tier.glow}`}
              >
                {/* Popular badge */}
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <div className="px-4 py-1 rounded-full bg-gradient-to-r from-helix-purple to-pink-500 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-helix-purple/30">
                      ★ Most Popular
                    </div>
                  </div>
                )}

                <div className={`h-full rounded-3xl ${tier.bg} backdrop-blur-sm p-7 flex flex-col`}>
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                      {tier.emoji}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                      <p className="text-[11px] text-zinc-500 font-medium">{tier.tagline}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-4">
                    <span className={`text-4xl font-black bg-gradient-to-r ${tier.gradient} bg-clip-text text-transparent`}>
                      {tier.price}
                    </span>
                    <span className="text-sm text-zinc-500">{tier.period}</span>
                  </div>

                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">{tier.description}</p>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent mb-6" />

                  {/* Perks */}
                  <ul className="space-y-3 flex-1">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2.5 text-sm text-zinc-300">
                        <svg
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            tier.popular ? "text-helix-purple" : "text-helix-blue"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {perk}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <a
                    href="https://github.com/sponsors/HelixOS-Org"
                    target="_blank"
                    className={`mt-8 block w-full py-3 rounded-xl text-center text-sm font-bold
                                transition-all duration-300 ${
                      tier.popular
                        ? "bg-gradient-to-r from-helix-purple to-pink-500 text-white shadow-lg shadow-helix-purple/20 hover:shadow-helix-purple/40 hover:scale-[1.02]"
                        : "border border-zinc-700/60 text-zinc-300 hover:bg-zinc-800/60 hover:text-white hover:border-zinc-600"
                    }`}
                  >
                    {tier.period === "one-time" ? "Donate Now" : "Subscribe"} →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            QUICK ONE-TIME AMOUNTS
           ═══════════════════════════════════════════════════════ */}
        <section className="max-w-4xl mx-auto px-6 pb-24">
          <div className="rounded-3xl border border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm overflow-hidden">
            {/* Header band */}
            <div className="px-8 py-5 border-b border-zinc-800/50 bg-zinc-900/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/15 flex items-center justify-center text-lg">🎁</div>
                <div>
                  <h3 className="text-lg font-bold text-white">Quick One-Time Donation</h3>
                  <p className="text-xs text-zinc-500">No subscription — just a gift from the heart.</p>
                </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickAmounts.map((t) => (
                <a
                  key={t.amount}
                  href="https://github.com/sponsors/HelixOS-Org"
                  target="_blank"
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl
                             border border-zinc-800/40 bg-zinc-900/20
                             hover:border-pink-500/30 hover:bg-pink-500/[0.04]
                             transition-all duration-300 hover:translate-y-[-2px]"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{t.emoji}</span>
                  <span className={`text-2xl font-black ${t.color} transition-colors`}>{t.amount}</span>
                  <span className="text-xs text-zinc-500 font-medium">{t.label}</span>
                </a>
              ))}
            </div>

            <div className="px-8 pb-6 text-center">
              <a
                href="https://github.com/sponsors/HelixOS-Org"
                target="_blank"
                className="inline-flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300 transition-colors font-medium"
              >
                Or enter a custom amount on GitHub Sponsors
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            OTHER WAYS TO SUPPORT
           ═══════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">
              No Money?{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                No Problem.
              </span>
            </h2>
            <p className="text-zinc-500 mt-2">There are many ways to support Helix without spending a dime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
                  </svg>
                ),
                title: "Star on GitHub",
                description: "Free but powerful. Stars boost visibility and attract contributors who make Helix better.",
                link: "https://github.com/HelixOS-Org/helix",
                cta: "Star the Repo",
                color: "text-amber-400",
                hoverBorder: "hover:border-amber-500/30",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                ),
                title: "Contribute Code",
                description: "Fix bugs, add features, improve docs. Every pull request moves the kernel forward.",
                link: "https://github.com/HelixOS-Org/helix/blob/main/CONTRIBUTING.md",
                cta: "Read the Guide",
                color: "text-helix-blue",
                hoverBorder: "hover:border-helix-blue/30",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                ),
                title: "Spread the Word",
                description: "Tweet about Helix, write a blog post, tell a friend. Awareness is everything for open source.",
                link: "https://twitter.com/intent/tweet?text=Check%20out%20Helix%20OS%20%E2%80%94%20a%20modular%20kernel%20written%20entirely%20in%20Rust!%20https%3A%2F%2Fgithub.com%2FHelixOS-Org%2Fhelix",
                cta: "Share on X",
                color: "text-sky-400",
                hoverBorder: "hover:border-sky-500/30",
              },
            ].map((item) => (
              <a
                key={item.title}
                href={item.link}
                target="_blank"
                className={`group relative p-7 rounded-3xl border border-zinc-800/50 bg-zinc-950/40
                           ${item.hoverBorder} hover:translate-y-[-3px]
                           transition-all duration-300`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800/60 flex items-center justify-center mb-5 ${item.color} group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-helix-blue transition-colors">{item.title}</h3>
                <p className="text-sm text-zinc-500 mt-2 leading-relaxed">{item.description}</p>
                <span className={`inline-flex items-center gap-1.5 mt-5 text-sm font-semibold ${item.color} group-hover:gap-2.5 transition-all`}>
                  {item.cta}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FULL TRANSPARENCY — Bottom banner
           ═══════════════════════════════════════════════════════ */}
        <section className="max-w-4xl mx-auto px-6 pb-28">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient border glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-helix-blue/20 via-helix-purple/20 to-pink-500/20 blur-sm" />

            <div className="relative m-[1px] rounded-3xl bg-zinc-950 p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-helix-blue/15 to-helix-purple/15 border border-helix-blue/20 flex items-center justify-center shrink-0">
                  <span className="text-3xl">🔍</span>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-bold text-white mb-2">Full Transparency, Always</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Helix OS is MIT-licensed and will <strong className="text-white">always</strong> be free and open-source.
                    Donations go directly to infrastructure costs, development tooling, and contributor stipends.
                    We publish a quarterly spending report in our{" "}
                    <Link href="https://github.com/HelixOS-Org/helix/discussions" className="text-helix-blue hover:underline">
                      GitHub Discussions
                    </Link>
                    {" "}— because trust is earned, not assumed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
