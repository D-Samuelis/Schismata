// apps/web/src/layout/AppLayout.tsx

import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { AUTOMATON_MODES } from "../config/automatonModes";
import { THEMES } from "../theme/themes";
import { useThemeStore } from "../theme/themeStore";
import { useCommandStore } from "../commands/commandStore";
import { useGlobalShortcuts } from "../commands/shortcuts";
import { MenuBar } from "./MenuBar";
import { ActivityBar } from "./ActivityBar";
import { StatusBar } from "./StatusBar";
import { HelpDialog, type HelpView } from "./HelpDialog";

function Logo() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="var(--sc-accent)"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <circle cx={6} cy={12} r={3.5} />
      <circle cx={18} cy={12} r={3.5} />
      <path d="M9.5 12h5" />
    </svg>
  );
}

export default function AppLayout() {
  const { mode = "dfa" } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const themeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);
  const register = useCommandStore((s) => s.register);
  const unregister = useCommandStore((s) => s.unregister);
  const [help, setHelp] = useState<HelpView | null>(null);

  useGlobalShortcuts();

  const modeLabel =
    AUTOMATON_MODES[mode as keyof typeof AUTOMATON_MODES]?.label ?? mode;

  useEffect(() => {
    document.title = `${modeLabel} — Schismata`;
  }, [modeLabel]);

  useEffect(() => {
    const cmds = [
      ...Object.entries(AUTOMATON_MODES).map(([id, { label }], i) => ({
        id: `go.${id}`,
        label,
        shortcut: `Alt+${i + 1}`,
        checked: id === mode,
        run: () => navigate(`/${id}`),
      })),
      ...THEMES.map((t) => ({
        id: `theme.${t.id}`,
        label: t.label,
        checked: t.id === themeId,
        run: () => setTheme(t.id),
      })),
      {
        id: "help.shortcuts",
        label: "Keyboard Shortcuts",
        run: () => setHelp("shortcuts"),
      },
      {
        id: "help.about",
        label: "About Schismata",
        run: () => setHelp("about"),
      },
    ];
    register(cmds);
    return () => unregister(cmds.map((c) => c.id));
  }, [mode, themeId, navigate, setTheme, register, unregister]);

  return (
    <div className="flex h-full flex-col bg-[var(--sc-background)] text-[var(--sc-foreground)]">
      <header className="relative flex h-[30px] shrink-0 items-stretch bg-[var(--sc-title-bar)] text-[var(--sc-title-bar-foreground)]">
        <div className="flex w-12 shrink-0 items-center justify-center">
          <Logo />
        </div>
        <MenuBar />
        <div className="pointer-events-none absolute inset-x-0 flex h-full items-center justify-center text-xs opacity-70">
          {modeLabel} — Schismata
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <ActivityBar mode={mode} />
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">
            <Outlet key={mode} />
          </div>
          <div
            id="footer-portal"
            className="shrink-0 border-t border-[var(--sc-border)] bg-[var(--sc-surface)] px-3 py-1.5 empty:hidden"
          />
        </main>
      </div>

      <StatusBar mode={mode} />
      <HelpDialog view={help} onClose={() => setHelp(null)} />
    </div>
  );
}
