import { Suspense } from "react";
import DocsSidebar from "@/helix-wiki/components/DocsSidebar";
import SearchHighlight from "@/helix-wiki/components/SearchHighlight";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <DocsSidebar />

      {/* Content area — offset on desktop for sidebar */}
      <div className="xl:pl-72">
        <div data-docs-content className="relative">
          {/* Subtle top ambient */}
          <div className="absolute top-0 left-0 right-0 h-[400px] pointer-events-none opacity-30"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(123,104,238,.06), transparent)" }} />
          <Suspense>
            <SearchHighlight />
          </Suspense>
          {children}
        </div>
      </div>
    </div>
  );
}
