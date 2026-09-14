import { Paper, Stack, UnstyledButton, Text } from '@mantine/core'
import { useClickOutside } from '@mantine/hooks'
import { IconPlayerPlay, IconTarget, IconArrowRight, IconEdit, IconTrash } from '@tabler/icons-react'

interface StateContextMenuProps {
  id: string
  kind: 'node' | 'edge'
  x: number
  y: number
  onClose: () => void
  onSetStart: () => void
  onToggleAccept: () => void
  onRename: () => void
  onDelete: () => void
}

export function StateContextMenu({ id, kind, x, y, onClose, onSetStart, onToggleAccept, onRename, onDelete }: StateContextMenuProps) {
  const ref = useClickOutside(onClose)
  const wrap = (fn: () => void) => () => { fn(); onClose() }

  return (
    <Paper ref={ref} shadow="md" p={4} withBorder style={{ position: 'fixed', top: y, left: x, zIndex: 300 }}>
      <Stack gap={2}>
        <Text size="xs" c="dimmed" px={8} pt={4}>{id}</Text>
        {kind === 'node' && (
          <>
            <UnstyledButton px={8} py={4} onClick={wrap(onSetStart)}><IconPlayerPlay size={14} /> Set as Start State</UnstyledButton>
            <UnstyledButton px={8} py={4} onClick={wrap(onToggleAccept)}><IconTarget size={14} /> Toggle Accepting</UnstyledButton>
            <UnstyledButton px={8} py={4} onClick={onClose}><IconArrowRight size={14} /> Add Transition from here</UnstyledButton>
            <UnstyledButton px={8} py={4} onClick={wrap(onRename)}><IconEdit size={14} /> Rename</UnstyledButton>
          </>
        )}
        <UnstyledButton px={8} py={4} c="red" onClick={wrap(onDelete)}><IconTrash size={14} /> Delete {kind === 'node' ? 'State' : 'Transition'}</UnstyledButton>
      </Stack>
    </Paper>
  )
}