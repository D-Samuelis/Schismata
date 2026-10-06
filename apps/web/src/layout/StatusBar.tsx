// apps/web/src/layout/StatusBar.tsx

import { AUTOMATON_MODES } from "../config/automatonModes";
import { useDfaStore, useNfaStore, useTmStore } from "../store/stores";
import { useActiveTheme } from "../theme/themeStore";
import { ThemeMenu } from "../components/ui/ThemeMenu";

const STATUS_TEXT = {
  idle: "Ready",
  running: "Running",
  paused: "Paused",
  done: "Finished",
} as const;

// Primitive selectors only, so each store re-renders the bar only when one of
// these three values actually changes.
function useCounts(store: typeof useDfaStore) {
  const states = store((s) => s.states.length);
  const transitions = store((s) => s.transitions.length);
  const status = store((s) => s.status);
  return { states, transitions, status };
}

const ITEM = "flex items-center px-2.5 transition-colors";

export function StatusBar({ mode }: { mode: string }) {
  const dfa = useCounts(useDfaStore);
  const nfa = useCounts(useNfaStore);
  const tm = useCounts(useTmStore);
  const c = mode === "nfa" ? nfa : mode === "tm" ? tm : dfa;

  const theme = useActiveTheme();
  const label = AUTOMATON_MODES[mode as keyof typeof AUTOMATON_MODES]?.label ?? mode;

  return (
    <footer className="flex h-6 shrink-0 select-none items-stretch justify-between bg-[var(--sc-status-bar)] text-xs text-[var(--sc-status-bar-foreground)]">
      <div className="flex items-stretch">
        <span className={`${ITEM} bg-black/20 font-medium`}>{label}</span>
        <span className={ITEM}>States: {c.states}</span>
        <span className={ITEM}>Transitions: {c.transitions}</span>
      </div>
      <div className="flex items-stretch">
        <span className={ITEM}>{STATUS_TEXT[c.status]}</span>
        <ThemeMenu position="top-end">
          <button
            type="button"
            title="Select color theme"
            className={`${ITEM} hover:bg-white/15`}
          >
            {theme.label}
          </button>
        </ThemeMenu>
      </div>
    </footer>
  );
}
