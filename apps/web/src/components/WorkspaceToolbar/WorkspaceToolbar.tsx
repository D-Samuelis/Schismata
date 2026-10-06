// apps/web/src/components/WorkspaceToolbar/WorkspaceToolbar.tsx

import {
  Group,
  ActionIcon,
  NumberInput,
  Tooltip,
  Chip,
  Button,
} from "@mantine/core";
import {
  IconMathFunction,
  IconArrowRight,
  IconArrowBackUp,
  IconArrowForwardUp,
} from "@tabler/icons-react";
import { MAX_TAPE_COUNT } from "../../config/automatonModes";
import type { PanelId } from "../../config/workspaceLayout";
import type { ModeId } from "../../types/automaton";

interface PanelOption {
  value: PanelId;
  label: string;
}

function panelOptionsFor(modeId: ModeId): PanelOption[] {
  const shared: PanelOption[] = [
    { value: "graph", label: "Graph" },
    { value: "formalDefinition", label: "Formal Definition" },
    { value: "transitionTable", label: "Transitions" },
  ];
  return modeId === "tm"
    ? [shared[0], { value: "tape", label: "Tape" }, shared[1], shared[2]]
    : shared;
}

interface WorkspaceToolbarProps {
  modeId: ModeId;
  openPanels: PanelId[];
  onTogglePanel: (id: PanelId, shouldBeOpen: boolean) => void;
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
  openPanels,
  onTogglePanel,
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
  const panelOptions = panelOptionsFor(modeId);

  return (
    <Group gap="xs" wrap="wrap" justify="space-between">
      <Group gap="xs">
        {/* Can be removed - technicaly moved to the top toolbar
        <Chip.Group
          multiple
          value={openPanels}
          onChange={(v) => {
            const next = v as PanelId[];
            panelOptions.forEach((o) =>
              onTogglePanel(o.value, next.includes(o.value)),
            );
          }}
        >
          <Group gap={6}>
            {panelOptions.map((o) => (
              <Chip key={o.value} value={o.value} size="xs">
                {o.label}
              </Chip>
            ))}
          </Group>
        </Chip.Group> 
        */}
        <Tooltip label="Undo">
          <ActionIcon
            variant="default"
            size="lg"
            disabled={!canUndo}
            onClick={onUndo}
          >
            <IconArrowBackUp size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Redo">
          <ActionIcon
            variant="default"
            size="lg"
            disabled={!canRedo}
            onClick={onRedo}
          >
            <IconArrowForwardUp size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Group gap="xs">
        {modeId === "nfa" && (
          <>
            <Tooltip label="Generate from regular expression">
              <ActionIcon
                variant={regexOpen ? "filled" : "default"}
                size="lg"
                onClick={onToggleRegex}
              >
                <IconMathFunction size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Needs @schismata/core's subset construction — not implemented yet">
              <Button
                variant="light"
                rightSection={<IconArrowRight size={16} />}
                disabled
                onClick={onConvertToDfa}
              >
                Convert to DFA
              </Button>
            </Tooltip>
          </>
        )}
        {modeId === "tm" && (
          <NumberInput
            label="Tapes"
            value={tapeCount}
            onChange={(v) => onTapeCountChange(typeof v === "number" ? v : 1)}
            min={1}
            max={MAX_TAPE_COUNT}
            w={90}
          />
        )}
      </Group>
    </Group>
  );
}
