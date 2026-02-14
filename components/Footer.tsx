import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <span className="text-zinc-600 text-sm">© 2026 Helix OS Organization · MIT License</span>
        <div className="flex gap-6 text-sm text-zinc-500">
          <a href="https://github.com/HelixOS-Org/helix" className="hover:text-white transition-colors">GitHub</a>
          <a href="https://github.com/HelixOS-Org/helix/blob/main/CONTRIBUTING.md" className="hover:text-white transition-colors">Contributing</a>
          <a href="/donate" className="hover:text-pink-400 transition-colors">♥ Donate</a>
        </div>
      </div>
    </footer>
  );
}
