# 🤝 Contributing to Helix Wiki

First off, thank you for considering contributing to the Helix Wiki! 🎉

This is the official documentation site for [Helix OS](https://github.com/HelixOS-Org/helix) — a modular, self-healing operating system written in Rust. Every contribution helps make the documentation clearer, more accurate, and more accessible.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)
- [Documentation Guidelines](#documentation-guidelines)
- [Need Help?](#need-help)

---

## 📜 Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold a welcoming, inclusive, and harassment-free environment.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 22 or later
- **npm** 10 or later
- **Git** 2.30+

### Development Setup

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/helix-wiki.git
cd helix-wiki

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev

# 5. Open http://localhost:3000 in your browser
```

The site will hot-reload as you make changes.

---

## 📁 Project Structure

```
helix-wiki/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (SEO, metadata, fonts)
│   ├── page.tsx            # Homepage
│   ├── docs/               # Documentation pages
│   │   ├── page.tsx        # Docs hub
│   │   ├── architecture/   # Architecture documentation
│   │   ├── core/           # Core kernel documentation
│   │   ├── hal/            # HAL documentation
│   │   ├── subsystems/     # Subsystems documentation
│   │   ├── modules/        # Module system documentation
│   │   ├── filesystem/     # HelixFS documentation
│   │   ├── nexus/          # NEXUS profiling documentation
│   │   └── lumina/         # Lumina graphics documentation
│   ├── donate/             # Donate page
│   └── download/           # Download page
├── components/             # Reusable React components
│   ├── Navbar.tsx          # Navigation bar
│   ├── SearchBar.tsx       # Global search (Ctrl+K)
│   ├── HelixLogo.tsx       # Animated DNA logo
│   ├── Footer.tsx          # Site footer
│   ├── CodeBlock.tsx       # Syntax-highlighted code blocks
│   └── diagrams/           # Interactive Recharts diagrams
├── lib/                    # Utilities and data
├── public/                 # Static assets (favicon, OG image, ISO)
└── .github/workflows/      # CI/CD deployment pipeline
```

---

## 💡 How to Contribute

### 🐛 Reporting Bugs

Found a broken link, rendering issue, or factual error?

1. Check [existing issues](https://github.com/HelixOS-Org/helix-wiki/issues) to avoid duplicates
2. [Open a new issue](https://github.com/HelixOS-Org/helix-wiki/issues/new) with:
   - A clear, descriptive title
   - Steps to reproduce (if applicable)
   - Expected vs. actual behavior
   - Screenshots (if visual)
   - Browser and OS information

### 📝 Improving Documentation

Documentation improvements are always welcome:

- Fix typos, grammar, or unclear explanations
- Add missing information or examples
- Improve code samples
- Update outdated content
- Add diagrams or visual aids

### ✨ Adding Features

Want to add a new feature to the wiki site?

1. Open an issue first to discuss the idea
2. Wait for approval before starting work
3. Follow the [Style Guide](#style-guide) below
4. Submit a PR with a clear description

### 🌐 Translations

We welcome translations! If you'd like to translate the wiki:

1. Open an issue proposing the language
2. We'll discuss the implementation approach
3. Coordinate with us to avoid duplicated effort

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] Your code builds without errors (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] You've tested your changes locally
- [ ] New components follow existing patterns
- [ ] Documentation is updated if needed

### PR Guidelines

1. **Fork & Branch** — Create a feature branch from `main`
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Commit Messages** — Use [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add interactive memory diagram to subsystems page
   fix: correct broken link in HAL documentation
   docs: improve NEXUS profiling explanation
   style: align code blocks in core page
   ```

3. **PR Title** — Use the same format as commit messages

4. **PR Description** — Include:
   - What changes were made and why
   - Screenshots for visual changes
   - Related issue number (e.g., `Closes #42`)

5. **Review** — A maintainer will review your PR. Please be patient and responsive to feedback.

### What Happens Next

1. A maintainer reviews the PR
2. They may request changes — please address them promptly
3. Once approved, the PR is merged to `main`
4. The CI/CD pipeline automatically deploys to production

---

## 🎨 Style Guide

### TypeScript / React

- **TypeScript** — All code must be TypeScript (no `.js` / `.jsx`)
- **Functional Components** — Use function components with hooks
- **Naming** — PascalCase for components, camelCase for functions/variables
- **Imports** — Group: React → Next.js → third-party → local
- **No `any`** — Use proper types. `unknown` is acceptable when truly unknown

### Tailwind CSS

- Use Tailwind utility classes — avoid custom CSS when possible
- Follow the dark theme design system:
  - Background: `#000000`
  - Primary blue: `#4A90E2`
  - Purple accent: `#7B68EE`
  - Accent: `#9B59B6`
- Use responsive classes (`sm:`, `md:`, `lg:`)
- Prefer `gap-*` over margin for spacing in flex/grid layouts

### File Organization

- One component per file
- Co-locate related files (component + types + utils)
- Use the `components/` directory for reusable components
- Page-specific components can live in the page directory

---

## 📖 Documentation Guidelines

When writing documentation content:

- **Accuracy** — Verify technical details against the [Helix OS source](https://github.com/HelixOS-Org/helix)
- **Clarity** — Write for developers who may be new to OS internals
- **Code Examples** — Include Rust code examples where relevant
- **Diagrams** — Use interactive Recharts diagrams for data visualization
- **Structure** — Use clear headings (H2 for sections, H3 for subsections)
- **Links** — Cross-reference related documentation pages

---

## ❓ Need Help?

- 💬 [Open a Discussion](https://github.com/HelixOS-Org/helix-wiki/discussions)
- 🐛 [Report an Issue](https://github.com/HelixOS-Org/helix-wiki/issues)
- 📖 [Read the Helix OS Wiki](https://github.com/HelixOS-Org/helix/wiki)

---

Thank you for making the Helix Wiki better! Every contribution matters. 💙🧬
