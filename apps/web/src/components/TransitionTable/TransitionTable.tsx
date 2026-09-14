import { Paper, Stack, Title, TextInput, Group, ActionIcon, Divider } from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
import type { AutomatonState, AutomatonTransition } from '../../hooks/useSimulation'

interface TransitionTableProps {
  states: AutomatonState[]
  transitions: AutomatonTransition[]
  onRenameState: (oldId: string, newId: string) => void
  onDeleteState: (id: string) => void
  onEditSymbol: (id: string, symbol: string) => void
  onDeleteTransition: (id: string) => void
}

export function TransitionTable({ states, transitions, onRenameState, onDeleteState, onEditSymbol, onDeleteTransition }: TransitionTableProps) {
  return (
    <Paper withBorder p="md">
      <Title order={5} mb="sm">States</Title>
      <Stack gap={6}>
        {states.map((s) => (
          <Group key={s.id} gap={6}>
            <TextInput size="xs" defaultValue={s.id} onBlur={(e) => e.target.value !== s.id && onRenameState(s.id, e.target.value)} />
            <ActionIcon size="sm" color="red" variant="subtle" onClick={() => onDeleteState(s.id)}><IconTrash size={14} /></ActionIcon>
          </Group>
        ))}
      </Stack>
      <Divider my="md" />
      <Title order={5} mb="sm">Transition Function δ</Title>
      <Stack gap={6}>
        {transitions.map((t) => (
          <Group key={t.id} gap={6} wrap="nowrap">
            <TextInput size="xs" style={{ flex: 1 }} value={`δ(${t.source}, `} readOnly />
            <TextInput size="xs" w={50} defaultValue={t.symbol} onBlur={(e) => onEditSymbol(t.id, e.target.value)} />
            <TextInput size="xs" style={{ flex: 1 }} value={`) → ${t.target}`} readOnly />
            <ActionIcon size="sm" color="red" variant="subtle" onClick={() => onDeleteTransition(t.id)}><IconTrash size={14} /></ActionIcon>
          </Group>
        ))}
      </Stack>
    </Paper>
  )
}