# 🔒 Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| Latest  | ✅ Yes             |
| Older   | ❌ No              |

We only provide security updates for the latest deployed version of the Helix Wiki.

---

## Reporting a Vulnerability

We take the security of the Helix Wiki seriously. If you discover a security vulnerability, we appreciate your responsible disclosure.

### 📧 How to Report

**Please DO NOT open a public GitHub issue for security vulnerabilities.**

Instead, report vulnerabilities through one of these channels:

1. **GitHub Security Advisory** — [Create a private advisory](https://github.com/HelixOS-Org/helix-wiki/security/advisories/new)
2. **Email** — Send details to the project maintainers via the contact information on the [HelixOS Organization](https://github.com/HelixOS-Org) profile

### 📋 What to Include

When reporting a vulnerability, please provide:

- **Description** — A clear description of the vulnerability
- **Impact** — What an attacker could achieve by exploiting it
- **Steps to Reproduce** — Detailed steps to reproduce the issue
- **Affected Component** — Which part of the wiki is affected (e.g., search, navigation, deployment)
- **Suggested Fix** — If you have a recommendation (optional)

### ⏱️ Response Timeline

| Step                     | Timeframe         |
|--------------------------|-------------------|
| Acknowledgment           | Within 48 hours   |
| Initial Assessment       | Within 1 week     |
| Fix Development          | Within 2 weeks    |
| Public Disclosure (if applicable) | After fix is deployed |

### 🏆 Recognition

We believe in recognizing security researchers for their contributions:

- Your name (or alias) will be credited in our security acknowledgments
- Significant findings may be highlighted in release notes
- We follow the principle of responsible disclosure

---

## Security Best Practices

This project follows these security practices:

- **Dependencies** — Regular dependency updates and vulnerability scanning
- **CI/CD Pipeline** — Hardened GitHub Actions with [step-security/harden-runner](https://github.com/step-security/harden-runner)
- **Secret Scanning** — Automated secret detection with [TruffleHog](https://github.com/trufflesecurity/trufflehog)
- **Build Integrity** — SHA-256 hash verification between build and deployment stages
- **Encrypted Transfers** — FTPS (TLS) for all deployment operations
- **No Credentials in Logs** — All secrets are masked in CI/CD output
- **Static Export** — No server-side code execution reduces attack surface

---

## Scope

The following are **in scope** for security reports:

- ✅ Cross-site scripting (XSS) in the wiki content
- ✅ Dependency vulnerabilities with known exploits
- ✅ CI/CD pipeline security issues
- ✅ Leaked credentials or sensitive data
- ✅ Open redirect vulnerabilities

The following are **out of scope**:

- ❌ Issues in third-party services (GitHub, Hostinger, etc.)
- ❌ Denial of service (DoS) attacks against the hosting provider
- ❌ Social engineering attacks
- ❌ Issues requiring physical access

---

Thank you for helping keep the Helix Wiki and its users safe! 💙
