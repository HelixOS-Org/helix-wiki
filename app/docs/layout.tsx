import { Suspense } from "react";
import DocsSidebar from "@/helix-wiki/components/DocsSidebar";
import SearchHighlight from "@/helix-wiki/components/SearchHighlight";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <DocsSidebar />
      {/* Content area — offset on desktop to make room for sidebar */}
      <div className="xl:pl-64">
        <div data-docs-content>
          <Suspense>
            <SearchHighlight />
          </Suspense>
          {children}
        </div>
      </div>
    </div>
  );
}
