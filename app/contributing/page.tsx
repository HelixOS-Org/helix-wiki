"use client";
import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import contributingContent from "@/helix-wiki/lib/docs-i18n/contributing";

export default function ContributingPage() {
  const { locale } = useI18n();
  const s = (k: string) => getDocString(contributingContent, locale, k);

  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader
        title={s("title")}
        subtitle={s("subtitle")}
        badge={s("badge")}
      />

      {/* ── DEV ENVIRONMENT ── */}
      <Section title={s("dev_environment")} id="environment">
        <h3 className="text-xl font-semibold text-white mt-4 mb-4">Toolchain</h3>
        <p className="text-gray-300 mb-4">The project pins <strong className="text-white">nightly-2025-01-15</strong> in <code className="text-helix-blue">rust-toolchain.toml</code>. Rustup installs it automatically. Do <strong className="text-white">not</strong> override it — the kernel uses unstable features that may break across nightlies.</p>

        <InfoTable
          columns={[
            { header: "Component", key: "component" },
            { header: "Purpose", key: "purpose" },
          ]}
          rows={[
            { component: <code className="text-helix-blue">rust-src</code>, purpose: "Required for -Zbuild-std (rebuilding core/alloc for bare-metal target)" },
            { component: <code className="text-helix-blue">rustfmt</code>, purpose: "Code formatting — enforced in CI" },
            { component: <code className="text-helix-blue">clippy</code>, purpose: "Linting — enforced in CI" },
            { component: <code className="text-helix-blue">llvm-tools-preview</code>, purpose: "objcopy, objdump, binary inspection" },
          ]}
        />

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">System Dependencies</h3>
        <RustCode filename="Terminal" language="bash">{`# Debian / Ubuntu
sudo apt install qemu-system-x86 lld make git

# Fedora
sudo dnf install qemu-system-x86 lld make git

# Arch
sudo pacman -S qemu-full lld make git`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Setup</h3>
        <RustCode filename="Terminal" language="bash">{`# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/helix.git
cd helix
git remote add upstream https://github.com/helix-os/helix.git

# Verify toolchain
rustc --version   # should show nightly-2025-01-15

# Build & boot
./scripts/build.sh
./scripts/run_qemu.sh`}</RustCode>
      </Section>

      {/* ── CODE STANDARDS ── */}
      <Section title={s("code_standards")} id="standards">
        <p className="text-gray-300 mb-6">These checks run in CI. A PR that fails any of them will <strong className="text-white">not be reviewed</strong>.</p>

        <h3 className="text-xl font-semibold text-white mb-4">Formatting — rustfmt</h3>
        <p className="text-gray-300 mb-3">100-column width, module-level import granularity, Unix line endings. Configured in <code className="text-helix-blue">rustfmt.toml</code>.</p>
        <RustCode filename="Terminal" language="bash">{`cargo fmt --all -- --check    # Check only
cargo fmt --all               # Auto-fix`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Linting — clippy</h3>
        <InfoTable
          columns={[
            { header: "Lint Group", key: "group" },
            { header: "Level", key: "level" },
          ]}
          rows={[
            { group: <code className="text-helix-blue">correctness</code>, level: <span className="text-red-400">Denied (build fails)</span> },
            { group: <code className="text-helix-blue">suspicious, complexity, perf, style</code>, level: <span className="text-yellow-400">Warned</span> },
            { group: <code className="text-helix-blue">unsafe_op_in_unsafe_fn</code>, level: <span className="text-yellow-400">Warned — each unsafe block must be explicit</span> },
            { group: <code className="text-helix-blue">missing_safety_doc</code>, level: <span className="text-yellow-400">Warned — every unsafe fn must have # Safety</span> },
            { group: <code className="text-helix-blue">unwrap_used, todo, unimplemented</code>, level: <span className="text-yellow-400">Warned — handle errors explicitly</span> },
          ]}
        />

        <RustCode filename="Terminal" language="bash">{`cargo clippy --all-targets --all-features -- -D warnings`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Documentation</h3>
        <p className="text-gray-300 mb-3">Every <code className="text-helix-blue">pub</code> item must have a <code className="text-helix-blue">///</code> doc comment explaining what it does, safety contracts, and panic conditions.</p>

        <RustCode filename="Example Documentation">{`/// Allocate a contiguous range of physical frames.
///
/// Returns \`Err(MemError::OutOfMemory)\` if the allocator
/// cannot satisfy the request.
///
/// # Safety
///
/// The caller must ensure \`count > 0\` and that the returned
/// frames are not aliased.
pub unsafe fn alloc_frames(count: usize) -> MemResult<Frame> {
    // ...
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">#![no_std] Rules</h3>
        <ul className="space-y-2 text-gray-300 text-[15px]">
          <li className="flex items-start gap-2"><span className="text-red-400">✕</span>No <code className="text-helix-blue">std::</code> imports — use <code className="text-helix-blue">core::</code> and <code className="text-helix-blue">alloc::</code> only</li>
          <li className="flex items-start gap-2"><span className="text-red-400">✕</span>No hidden allocations — <code className="text-helix-blue">format!()</code>, <code className="text-helix-blue">vec![]</code>, <code className="text-helix-blue">String::from()</code> all allocate. Be deliberate.</li>
          <li className="flex items-start gap-2"><span className="text-red-400">✕</span>No <code className="text-helix-blue">println!()</code> — use the kernel debug console</li>
          <li className="flex items-start gap-2"><span className="text-red-400">✕</span>No <code className="text-helix-blue">unwrap()</code> in production paths — it&apos;s a panic on bare metal</li>
        </ul>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">unsafe Code Rules</h3>
        <ul className="space-y-2 text-gray-300 text-[15px]">
          <li className="flex items-start gap-2"><span className="text-helix-blue">→</span>Minimize the scope of each <code className="text-helix-blue">unsafe</code> block</li>
          <li className="flex items-start gap-2"><span className="text-helix-blue">→</span>Every <code className="text-helix-blue">unsafe fn</code> needs a <code className="text-helix-blue"># Safety</code> doc section</li>
          <li className="flex items-start gap-2"><span className="text-helix-blue">→</span>Every <code className="text-helix-blue">unsafe {"{}"}</code> block needs a <code className="text-helix-blue">// SAFETY: ...</code> comment</li>
          <li className="flex items-start gap-2"><span className="text-helix-blue">→</span>Prefer safe abstractions — wrap raw pointer dances in safe APIs</li>
        </ul>
      </Section>

      {/* ── WORKFLOW ── */}
      <Section title={s("pr_workflow")} id="workflow">
        <RustCode filename="Terminal" language="bash">{`# 1. Create a feature branch
git checkout main && git pull upstream main
git checkout -b feat/my-feature     # or fix/, refactor/, docs/

# 2. Make changes, commit (signed!)
git commit -s -m "feat(hal): add x2APIC MSR-based IPI support"

# 3. Rebase on main before submitting
git fetch upstream && git rebase upstream/main
git push --force-with-lease origin feat/my-feature

# 4. Open PR on GitHub`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Rules</h3>
        <ul className="space-y-2 text-gray-300 text-[15px]">
          <li className="flex items-start gap-2"><span className="text-helix-blue">→</span><strong className="text-white">One PR, one concern.</strong> A scheduler refactor and a typo fix are two separate PRs.</li>
          <li className="flex items-start gap-2"><span className="text-helix-blue">→</span><strong className="text-white">Rebase, never merge.</strong> We do not accept merge commits.</li>
          <li className="flex items-start gap-2"><span className="text-helix-blue">→</span><strong className="text-white">One review minimum.</strong> Every PR requires at least one approving review.</li>
          <li className="flex items-start gap-2"><span className="text-helix-blue">→</span><strong className="text-white">DCO required.</strong> Sign every commit with <code className="text-helix-blue">-s</code>. CI rejects unsigned commits.</li>
        </ul>
      </Section>

      {/* ── COMMITS ── */}
      <Section title={s("commit_conventions")} id="commits">
        <p className="text-gray-300 mb-4">All commits follow <a href="https://www.conventionalcommits.org/" target="_blank" rel="noopener noreferrer" className="text-helix-blue hover:underline">Conventional Commits</a>:</p>

        <RustCode filename="Format" language="text">{`<type>(<scope>): <short description>

[optional body]

[optional footer(s)]`}</RustCode>

        <InfoTable
          columns={[
            { header: "Type", key: "type" },
            { header: "Usage", key: "usage" },
          ]}
          rows={[
            { type: <code className="text-helix-blue">feat</code>, usage: "New feature or module" },
            { type: <code className="text-helix-blue">fix</code>, usage: "Bug fix" },
            { type: <code className="text-helix-blue">refactor</code>, usage: "Restructuring (no behavior change)" },
            { type: <code className="text-helix-blue">docs</code>, usage: "Documentation only" },
            { type: <code className="text-helix-blue">test</code>, usage: "Tests only" },
            { type: <code className="text-helix-blue">perf</code>, usage: "Performance improvement" },
            { type: <code className="text-helix-blue">ci</code>, usage: "CI/CD pipeline changes" },
            { type: <code className="text-helix-blue">chore</code>, usage: "Build scripts, tooling, dependencies" },
          ]}
        />

        <p className="text-gray-300 mt-4">Scope = crate affected: <code className="text-helix-blue">hal</code>, <code className="text-helix-blue">core</code>, <code className="text-helix-blue">execution</code>, <code className="text-helix-blue">memory</code>, <code className="text-helix-blue">fs</code>, <code className="text-helix-blue">nexus</code>, <code className="text-helix-blue">modules</code>, <code className="text-helix-blue">boot/limine</code>, etc.</p>
      </Section>

      {/* ── CI ── */}
      <Section title={s("testing_ci")} id="ci">
        <h3 className="text-xl font-semibold text-white mb-4">Local Pre-Push Checks</h3>
        <RustCode filename="Terminal" language="bash">{`# Run all 4 — mirrors CI exactly
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --target x86_64-unknown-linux-gnu --lib
./scripts/build.sh`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">CI Pipeline</h3>
        <InfoTable
          columns={[
            { header: "Check", key: "check" },
            { header: "Command", key: "command" },
            { header: "Blocks PR", key: "blocks" },
          ]}
          rows={[
            { check: "Format", command: <code className="text-helix-blue">cargo fmt --all -- --check</code>, blocks: <span className="text-red-400">Yes</span> },
            { check: "Lint", command: <code className="text-helix-blue">cargo clippy ... -D warnings</code>, blocks: <span className="text-red-400">Yes</span> },
            { check: "Unit Tests", command: <code className="text-helix-blue">cargo test --lib</code>, blocks: <span className="text-red-400">Yes</span> },
            { check: "Kernel Build", command: <code className="text-helix-blue">./scripts/build.sh</code>, blocks: <span className="text-red-400">Yes</span> },
            { check: "DCO", command: "Signed-off-by trailer present", blocks: <span className="text-red-400">Yes</span> },
          ]}
        />
      </Section>

      {/* ── WHERE TO START ── */}
      <Section title="Where to Start" id="start">
        <p className="text-gray-300 mb-6">The codebase is ~20 Cargo crates. You don&apos;t need to understand them all — pick an area:</p>

        <InfoTable
          columns={[
            { header: "Area", key: "area" },
            { header: "Crate(s)", key: "crates" },
            { header: "What to Do", key: "what" },
          ]}
          rows={[
            { area: <strong className="text-white">New Scheduler</strong>, crates: <code className="text-helix-blue">modules_impl/schedulers/</code>, what: "Implement the Scheduler trait. Use round_robin/ as reference." },
            { area: <strong className="text-white">Drivers</strong>, crates: "New crate", what: "VirtIO block, VirtIO net, PS/2 keyboard. HAL provides IRQ & MMIO." },
            { area: <strong className="text-white">Filesystem</strong>, crates: <code className="text-helix-blue">fs/</code>, what: "Implement ramfs, extend VFS, add CoW snapshot tests." },
            { area: <strong className="text-white">HAL</strong>, crates: <code className="text-helix-blue">hal/</code>, what: "Improve timer calibration, add HPET support, extend ACPI parsing." },
            { area: <strong className="text-white">Benchmarks</strong>, crates: <code className="text-helix-blue">benchmarks/</code>, what: "Add IPC latency, context switch, allocation benchmarks." },
            { area: <strong className="text-white">Documentation</strong>, crates: <code className="text-helix-blue">docs/</code>, what: "Improve module guide, add architecture diagrams, write tutorials." },
            { area: <strong className="text-white">Tests</strong>, crates: "Any crate", what: "Increase test coverage. Every subsystem needs more unit tests." },
          ]}
        />

        <div className="mt-8 rounded-xl border border-helix-blue/30 bg-helix-blue/5 p-6">
          <p className="text-white font-semibold mb-2">Start small.</p>
          <p className="text-gray-300 text-[15px]">A clean, well-tested 50-line patch is worth more than a sprawling 500-line patch with no tests. Look for <code className="text-helix-blue">good first issue</code> and <code className="text-helix-blue">help wanted</code> labels on GitHub.</p>
        </div>
      </Section>
    </div>
  );
}
