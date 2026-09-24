import { useLayoutEffect, useState, type ReactNode } from "react";
import { Paper, Stack, UnstyledButton, Text, Divider } from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import {
  IconPlayerPlay,
  IconTarget,
  IconArrowRight,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";

interface StateContextMenuProps {
  id: string;
  kind: "node" | "edge";
  x: number;
  y: number;
  onClose: () => void;
  onSetStart: () => void;
  onToggleAccept: () => void;
  onAddTransitionFrom: () => void;
  onRename: () => void;
  onDelete: () => void;
}

function MenuItem({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <UnstyledButton
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
        danger
          ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
      }`}
    >
      {icon}
      {label}
    </UnstyledButton>
  );
}

const MENU_WIDTH = 200;

export function StateContextMenu({
  id,
  kind,
  x,
  y,
  onClose,
  onSetStart,
  onToggleAccept,
  onAddTransitionFrom,
  onRename,
  onDelete,
}: StateContextMenuProps) {
  const ref = useClickOutside(onClose);
  const wrap = (fn: () => void) => () => {
    fn();
    onClose();
  };

  // Right-click position is the raw cursor coordinate, which can place the menu
  // partly off-screen near the right/bottom edge. Clamp once we know the
  // rendered height (width is fixed via MENU_WIDTH).
  const [pos, setPos] = useState({ top: y, left: x });
  useLayoutEffect(() => {
    const el = ref.current;
    const height = el?.getBoundingClientRect().height ?? 0;
    setPos({
      left: Math.min(x, window.innerWidth - MENU_WIDTH - 8),
      top: Math.min(y, window.innerHeight - height - 8),
    });
    // Only recompute when a new menu opens at a new position, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, y]);

  return (
    <Paper
      ref={ref}
      shadow="md"
      radius="md"
      withBorder
      w={MENU_WIDTH}
      p={4}
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 300 }}
    >
      <Text size="xs" c="dimmed" px={8} py={4}>
        {id}
      </Text>
      <Divider mb={4} />
      <Stack gap={2}>
        {kind === "node" && (
          <>
            <MenuItem
              icon={<IconPlayerPlay size={14} />}
              label="Set as Start State"
              onClick={wrap(onSetStart)}
            />
            <MenuItem
              icon={<IconTarget size={14} />}
              label="Toggle Accepting"
              onClick={wrap(onToggleAccept)}
            />
            <MenuItem
              icon={<IconArrowRight size={14} />}
              label="Add Transition from here"
              onClick={wrap(onAddTransitionFrom)}
            />
            <MenuItem
              icon={<IconEdit size={14} />}
              label="Rename"
              onClick={wrap(onRename)}
            />
            <Divider my={2} />
          </>
        )}
        <MenuItem
          icon={<IconTrash size={14} />}
          label={`Delete ${kind === "node" ? "State" : "Transition"}`}
          danger
          onClick={wrap(onDelete)}
        />
      </Stack>
    </Paper>
  );
}
