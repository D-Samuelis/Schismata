// apps/web/src/components/ui/ToolButton.tsx

import type { ReactNode } from "react";
import { Tooltip } from "@mantine/core";
import { useCommandStore } from "../../commands/commandStore";

interface ToolButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  commandId?: string;
  active?: boolean;
  disabled?: boolean;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
}

export function ToolButton({
  label,
  icon,
  onClick,
  commandId,
  active,
  disabled,
  tooltipPosition = "bottom",
}: ToolButtonProps) {
  const shortcut = useCommandStore((s) =>
    commandId ? s.commands[commandId]?.shortcut : undefined,
  );

  return (
    <Tooltip
      label={shortcut ? `${label} (${shortcut})` : label}
      position={tooltipPosition}
      openDelay={400}
    >
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        className={`inline-flex h-7 w-7 items-center justify-center rounded transition-colors disabled:pointer-events-none disabled:opacity-35 ${
          active
            ? "bg-[var(--sc-accent)] text-[var(--sc-accent-foreground)]"
            : "text-[var(--sc-muted-foreground)] hover:bg-[var(--sc-hover-strong)] hover:text-[var(--sc-foreground)]"
        }`}
      >
        {icon}
      </button>
    </Tooltip>
  );
}
