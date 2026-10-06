// apps/web/src/components/EditorToolbar/EditorToolbar.tsx

import type { ReactNode } from "react";
import {
  IconPointer,
  IconCircle,
  IconArrowRight,
  IconTrash,
} from "@tabler/icons-react";
import type { EditMode } from "../../types/automaton";
import { ToolButton } from "../ui/ToolButton";

const TOOLS: {
  mode: EditMode;
  label: string;
  commandId: string;
  icon: ReactNode;
}[] = [
  {
    mode: "select",
    label: "Select",
    commandId: "tool.select",
    icon: <IconPointer size={18} />,
  },
  {
    mode: "add-state",
    label: "Add State",
    commandId: "tool.addState",
    icon: <IconCircle size={18} />,
  },
  {
    mode: "add-transition",
    label: "Add Transition",
    commandId: "tool.addTransition",
    icon: <IconArrowRight size={18} />,
  },
  {
    mode: "delete",
    label: "Delete",
    commandId: "tool.delete",
    icon: <IconTrash size={18} />,
  },
];

export function EditorToolbar({
  mode,
  onModeChange,
}: {
  mode: EditMode;
  onModeChange: (m: EditMode) => void;
}) {
  return (
    <div
      role="toolbar"
      aria-label="Editing tools"
      className="flex flex-col gap-0.5 rounded-md border border-[var(--sc-border)] bg-[var(--sc-surface)] p-1 shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
    >
      {TOOLS.map((t) => (
        <ToolButton
          key={t.mode}
          label={t.label}
          commandId={t.commandId}
          icon={t.icon}
          active={mode === t.mode}
          tooltipPosition="right"
          onClick={() => onModeChange(t.mode)}
        />
      ))}
    </div>
  );
}
