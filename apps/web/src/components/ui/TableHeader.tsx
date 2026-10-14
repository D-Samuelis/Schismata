// apps/web/src/components/ui/TableHeader.tsx

import type { ReactNode } from "react";

export function TableHeader({
  title,
  count,
  noun,
  action,
}: {
  title: string;
  count: number;
  /** Singular noun; an "s" is added unless count is 1. */
  noun: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        <h3 className="text-xs font-semibold text-[var(--sc-muted-foreground)]">
          {title}
        </h3>
        <span className="text-xs text-[var(--sc-muted-foreground)] opacity-70">
          {count} {noun}
          {count === 1 ? "" : "s"}
        </span>
      </div>
      {action}
    </div>
  );
}
