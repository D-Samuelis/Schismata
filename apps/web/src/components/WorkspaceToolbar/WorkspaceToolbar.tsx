// apps/web/src/components/WorkspaceToolbar/WorkspaceToolbar.tsx
//
// Slim bar under the title bar. Panel toggling lives in the View menu
// (see config/menus.ts), so this only holds undo/redo and mode-specific tools.

import { Group, NumberInput, Tooltip, Button, Text } from "@mantine/core";
import {
  IconMathFunction,
  IconArrowRight,
  IconArrowBackUp,
  IconArrowForwardUp,
} from "@tabler/icons-react";
import { MAX_TAPE_COUNT } from "../../config/automatonModes";
import type { ModeId } from "../../types/automaton";
import { ToolButton } from "../ui/ToolButton";

interface WorkspaceToolbarProps {
  modeId: ModeId;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  regexOpen: boolean;
  onToggleRegex: () => void;
  onConvertToDfa: () => void;
  tapeCount: number;
  onTapeCountChange: (n: number) => void;
}

export function WorkspaceToolbar({
  modeId,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  regexOpen,
  onToggleRegex,
  onConvertToDfa,
  tapeCount,
  onTapeCountChange,
}: WorkspaceToolbarProps) {
  return (
    <div className="flex h-9 shrink-0 items-center justify-between gap-2 border-b border-[var(--sc-border)] bg-[var(--sc-surface)] px-2">
      <div className="flex items-center gap-1">
        <ToolButton
          label="Undo"
          commandId="edit.undo"
          icon={<IconArrowBackUp size={16} />}
          disabled={!canUndo}
          onClick={onUndo}
        />
        <ToolButton
          label="Redo"
          commandId="edit.redo"
          icon={<IconArrowForwardUp size={16} />}
          disabled={!canRedo}
          onClick={onRedo}
        />
      </div>

      <Group gap="xs">
        {modeId === "nfa" && (
          <>
            <ToolButton
              label="Generate from regular expression"
              icon={<IconMathFunction size={16} />}
              active={regexOpen}
              onClick={onToggleRegex}
            />
            <Tooltip label="Needs @schismata/core's subset construction — not implemented yet">
              <Button
                variant="light"
                size="compact-sm"
                rightSection={<IconArrowRight size={14} />}
                disabled
                onClick={onConvertToDfa}
              >
                Convert to DFA
              </Button>
            </Tooltip>
          </>
        )}
        {modeId === "tm" && (
          <Group gap={6} wrap="nowrap">
            <Text size="xs" c="dimmed">
              Tapes
            </Text>
            <NumberInput
              size="xs"
              aria-label="Number of tapes"
              value={tapeCount}
              onChange={(v) => onTapeCountChange(typeof v === "number" ? v : 1)}
              min={1}
              max={MAX_TAPE_COUNT}
              w={64}
            />
          </Group>
        )}
      </Group>
    </div>
  );
}
