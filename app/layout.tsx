import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/helix-wiki/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://helix-wiki.com";
const SITE_NAME = "Helix OS";
const SITE_DESCRIPTION =
  "A modular, capability-based operating system kernel written entirely in Rust. Hot-swappable modules, self-healing subsystems, AI-powered intelligence — open source and bare metal.";

export const metadata: Metadata = {
  /* ── Core ── */
  title: {
    default: "Helix OS — A Modular Rust Kernel · Open Source",
    template: "%s | Helix OS",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Helix OS",
    "operating system",
    "Rust kernel",
    "open source OS",
    "modular kernel",
    "capability-based OS",
    "no_std Rust",
    "hot-reload kernel",
    "self-healing OS",
    "bare metal Rust",
    "x86_64 kernel",
    "AArch64 kernel",
    "RISC-V kernel",
    "OS development",
    "kernel documentation",
    "Rust OS tutorial",
    "microkernel",
    "NEXUS AI kernel",
    "HelixFS filesystem",
    "Lumina GPU API",
  ],
  authors: [{ name: "HelixOS Organization", url: "https://github.com/HelixOS-Org" }],
  creator: "HelixOS Organization",
  publisher: "HelixOS Organization",

  /* ── Canonical ── */
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },

  /* ── Open Graph (Facebook, Discord, LinkedIn) ── */
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Helix OS — A Modular Rust Kernel · Open Source",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Helix OS — Systems Built To Evolve",
        type: "image/png",
      },
    ],
  },

  /* ── Twitter / X Card ── */
  twitter: {
    card: "summary_large_image",
    title: "Helix OS — A Modular Rust Kernel · Open Source",
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@HelixOS_Org",
  },

  /* ── Icons ── */
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  /* ── Robots ── */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  /* ── Category ── */
  category: "technology",
};

/* ── JSON-LD Structured Data ── */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Helix OS",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Bare Metal (x86_64, AArch64, RISC-V 64)",
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  license: "https://github.com/HelixOS-Org/helix/blob/main/LICENSE",
  isAccessibleForFree: true,
  programmingLanguage: "Rust",
  codeRepository: "https://github.com/HelixOS-Org/helix",
  author: {
    "@type": "Organization",
    name: "HelixOS Organization",
    url: "https://github.com/HelixOS-Org",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  softwareVersion: "0.4.0-aurora",
  releaseNotes: "Pre-Alpha release featuring hot-reload modules, self-healing subsystems, AI-powered NEXUS intelligence, and HelixFS filesystem.",
  featureList: [
    "Hot-swappable kernel modules at runtime",
    "Self-healing subsystem recovery",
    "AI-powered crash prediction (NEXUS)",
    "Capability-based security model",
    "Copy-on-Write filesystem (HelixFS)",
    "Vulkan-class GPU API (Lumina)",
    "Multi-architecture: x86_64, AArch64, RISC-V 64",
    "100% Rust, #![no_std], zero libc",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
