// apps/web/src/layout/ActivityBar.tsx

import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@mantine/core";
import {
  IconCircleDot,
  IconCpu,
  IconGitBranch,
  IconPalette,
} from "@tabler/icons-react";
import { AUTOMATON_MODES } from "../config/automatonModes";
import { useCommandStore } from "../commands/commandStore";
import { ThemeMenu } from "../components/ui/ThemeMenu";

const MODE_ICONS: Record<string, ReactNode> = {
  dfa: <IconCircleDot size={24} stroke={1.5} />,
  nfa: <IconGitBranch size={24} stroke={1.5} />,
  tm: <IconCpu size={24} stroke={1.5} />,
};

export function ActivityBar({ mode }: { mode: string }) {
  const navigate = useNavigate();
  const commands = useCommandStore((s) => s.commands);

  return (
    <nav
      aria-label="Automaton type"
      className="flex w-12 shrink-0 flex-col items-center justify-between bg-[var(--sc-activity-bar)] text-[var(--sc-activity-bar-foreground)]"
    >
      <div className="flex flex-col">
        {Object.entries(AUTOMATON_MODES).map(([id, { label }]) => {
          const active = id === mode;
          const shortcut = commands[`go.${id}`]?.shortcut;
          return (
            <Tooltip
              key={id}
              position="right"
              label={shortcut ? `${label} (${shortcut})` : label}
            >
              <button
                type="button"
                aria-label={label}
                aria-current={active ? "page" : undefined}
                onClick={() => navigate(`/${id}`)}
                className={`relative flex h-12 w-12 items-center justify-center transition-opacity ${
                  active ? "opacity-100" : "opacity-50 hover:opacity-100"
                }`}
              >
                {active && (
                  <span className="absolute bottom-2 left-0 top-2 w-0.5 bg-[var(--sc-activity-bar-foreground)]" />
                )}
                {MODE_ICONS[id] ?? <IconCircleDot size={24} stroke={1.5} />}
              </button>
            </Tooltip>
          );
        })}
      </div>

      <ThemeMenu position="right-end">
        <button
          type="button"
          aria-label="Color theme"
          className="flex h-12 w-12 items-center justify-center opacity-50 transition-opacity hover:opacity-100"
        >
          <IconPalette size={22} stroke={1.5} />
        </button>
      </ThemeMenu>
    </nav>
  );
}
