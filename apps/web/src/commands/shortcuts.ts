// apps/web/src/commands/shortcuts.ts

import { useEffect } from "react";
import { useCommandStore } from "./commandStore";

export function matchesShortcut(e: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.split("+");
  const key = parts.pop() ?? "";
  return (
    (e.ctrlKey || e.metaKey) === parts.includes("Ctrl") &&
    e.shiftKey === parts.includes("Shift") &&
    e.altKey === parts.includes("Alt") &&
    e.key.toLowerCase() === key.toLowerCase()
  );
}

function isEditable(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  return t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
}

/**
 * Registers a global keydown listener that runs commands with matching shortcuts.
 * Commands are looked up in the command store, so they must be registered there first.
 */
export function useGlobalShortcuts(): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const typing = isEditable(e.target);
      const hasModifier = e.ctrlKey || e.metaKey || e.altKey;
      // Never steal plain keys from text fields, and leave native text-undo alone.
      if (typing && !hasModifier) return;
      if (typing && (e.ctrlKey || e.metaKey) && /^[zy]$/i.test(e.key)) return;

      for (const cmd of Object.values(useCommandStore.getState().commands)) {
        if (!cmd.shortcut || cmd.enabled === false) continue;
        if (matchesShortcut(e, cmd.shortcut)) {
          e.preventDefault();
          cmd.run();
          return;
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
