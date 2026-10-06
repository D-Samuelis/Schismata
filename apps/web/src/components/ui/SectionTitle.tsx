// apps/web/src/components/ui/SectionTitle.tsx

import type { ReactNode } from "react";

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-2 text-xs font-semibold text-[var(--sc-muted-foreground)]">
      {children}
    </h3>
  );
}
