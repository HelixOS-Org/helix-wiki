# 🧬 Helix Wiki — Official Documentation Hub

[![Deploy](https://github.com/HelixOS-Org/helix-wiki/actions/workflows/deploy.yml/badge.svg)](https://github.com/HelixOS-Org/helix-wiki/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/HelixOS-Org/helix-wiki?style=social)](https://github.com/HelixOS-Org/helix-wiki)

**Helix Wiki** is the official documentation website for **Helix OS** — a modular, self‑healing operating system written in Rust. The site delivers fast, searchable, visually rich documentation with interactive diagrams and deep technical content.

🌐 **Live site:** https://helix-wiki.com

![Helix Wiki Preview](public/og-image.png)

---

## ✨ Highlights

- ⚡ Ultra-fast static site export (Next.js App Router)
- 🔍 Global search with deep content matching (Ctrl+K)
- 📊 Interactive diagrams and beautiful data visualizations
- 🎨 Dark, premium design system with brand‑consistent theming
- 🧬 Animated Helix DNA logo and custom SVG iconography
- 🧠 Rich technical docs for kernel, HAL, subsystems, NEXUS, Lumina
- 🛡️ Hardened CI/CD pipeline with FTPS deployment and integrity checks

---

## 🧰 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Syntax Highlighting:** Prism / custom components
- **Hosting:** Static export + Hostinger FTP

---

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- npm 10+

### Install & Run

```bash
git clone https://github.com/HelixOS-Org/helix-wiki.git
cd helix-wiki
npm install
npm run dev
```

Open http://localhost:3000

---

## 🛠️ Scripts

```bash
npm run dev     # Start dev server
npm run build   # Production build + static export
npm run start   # Start production server (not used in FTP hosting)
npm run lint    # Lint the codebase
```

---

## 📦 Static Export & Hosting

This project is configured for **static export**:

- `output: "export"` in next.config.ts
- `trailingSlash: true` for directory-style URLs
- `images: { unoptimized: true }`

The build output is generated to the `out/` directory and deployed via **FTPS** to Hostinger shared hosting.

---

## 🔐 CI/CD Deployment

The pipeline:

1. Security + lint + TypeScript checks
2. Build static export (`out/`)
3. Integrity hash verification (SHA-256)
4. FTPS deploy to Hostinger
5. Health + SEO checks
6. Discord notification

Secrets required:

- `FTP_HOST`
- `FTP_USERNAME`
- `FTP_PASSWORD`
- `FTP_REMOTE_PATH`
- `DISCORD_WEBHOOK_URL` (optional)

---

## 🧭 Project Structure

```
helix-wiki/
├── app/                 # App Router pages
├── components/          # UI components
├── lib/                 # Utilities & data
├── public/              # Static assets
├── .github/workflows/   # CI/CD pipeline
└── out/                 # Static export output (generated)
```

---

## 🤝 Contributing

We love contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

---

## 🔒 Security

If you discover a security issue, please follow [SECURITY.md](SECURITY.md).

---

## 📜 License

MIT License — see [LICENSE](LICENSE).

---

## 💙 Credits

Built and maintained by the **HelixOS Organization** and the community.
