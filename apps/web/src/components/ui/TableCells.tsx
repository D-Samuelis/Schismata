// apps/web/src/components/ui/TableCells.tsx

import type { ReactNode } from "react";

export const TABLE = "w-full border-collapse text-[13px]";
export const TH =
  "sticky top-0 z-[1] border-b border-r border-[var(--sc-border)] bg-[var(--sc-surface)] px-2 py-1 text-left text-xs font-semibold text-[var(--sc-muted-foreground)] last:border-r-0";
export const TD =
  "border-b border-r border-[var(--sc-border)] p-0 last:border-r-0";
export const TR = "hover:bg-[var(--sc-hover)]";

const CELL =
  "w-full bg-transparent px-2 py-1 font-mono text-[13px] text-[var(--sc-foreground)] outline-none focus:bg-[var(--sc-accent-soft)] focus:shadow-[inset_0_0_0_1px_var(--sc-accent)]";

export function TableFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded border border-[var(--sc-border)]">
      {children}
    </div>
  );
}

/** Small text button used above tables ("Add state", ...). */
export const TABLE_ACTION =
  "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs text-[var(--sc-muted-foreground)] transition-colors hover:bg-[var(--sc-hover-strong)] hover:text-[var(--sc-foreground)] disabled:pointer-events-none disabled:opacity-40";

export function CellInput({
  value,
  onCommit,
  label,
  align = "center",
  dataKey,
}: {
  value: string;
  /** Return false to reject the edit; the cell snaps back to `value`. */
  onCommit: (v: string) => boolean | void;
  label: string;
  align?: "left" | "center";
  /** Exposed as data-cell so callers can focus the cell programmatically. */
  dataKey?: string;
}) {
  return (
    <input
      // Remount when the stored value changes (undo/redo, rename elsewhere) so a
      // defaultValue-based input never shows stale text.
      key={value}
      defaultValue={value}
      aria-label={label}
      data-cell={dataKey}
      spellCheck={false}
      className={`${CELL} ${align === "center" ? "text-center" : "text-left"}`}
      onBlur={(e) => {
        const next = e.currentTarget.value;
        if (next === value) return;
        if (onCommit(next) === false) e.currentTarget.value = value;
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          e.currentTarget.value = value;
          e.currentTarget.blur();
        }
      }}
    />
  );
}

export function DraftInput({
  value,
  onChange,
  onEnter,
  label,
  placeholder,
  dataKey,
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  label: string;
  placeholder?: string;
  dataKey?: string;
}) {
  return (
    <input
      value={value}
      aria-label={label}
      data-cell={dataKey}
      placeholder={placeholder}
      spellCheck={false}
      className={`${CELL} text-center placeholder:text-[var(--sc-muted-foreground)] placeholder:opacity-60`}
      onChange={(e) => onChange(e.currentTarget.value)}
      onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
    />
  );
}

export function CellSelect({
  value,
  options,
  onCommit,
  label,
  placeholder,
}: {
  value: string;
  options: string[];
  onCommit: (v: string) => void;
  label: string;
  /** When set, an empty value ("") shows this muted text instead of an option. */
  placeholder?: string;
}) {
  const empty = placeholder !== undefined && value === "";
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onCommit(e.currentTarget.value)}
      className={`${CELL} cursor-pointer text-center [&>option]:bg-[var(--sc-surface)] [&>option]:text-[var(--sc-foreground)] ${
        empty ? "text-[var(--sc-muted-foreground)]" : ""
      }`}
    >
      {placeholder !== undefined && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
