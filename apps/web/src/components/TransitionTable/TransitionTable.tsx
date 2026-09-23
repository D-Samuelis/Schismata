import { Paper, Stack, Title, TextInput, Group, ActionIcon, Divider, Select } from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
import type { AutomatonState, AutomatonTransition, ModeConfig, TapeDirection } from '../../types/automaton'
import { isTM } from '../../types/automaton'

interface TransitionTableProps {
  config: ModeConfig
  states: AutomatonState[]
  transitions: AutomatonTransition[]
  onRenameState: (oldId: string, newId: string) => void
  onDeleteState: (id: string) => void
  onUpdateTransition: (id: string, patch: Partial<AutomatonTransition>) => void
  onDeleteTransition: (id: string) => void
}

function withReadAt(reads: string[], i: number, v: string) {
  const next = [...reads]
  next[i] = v
  return next
}
function withWriteAt(writes: string[] | undefined, tapeCount: number, i: number, v: string) {
  const next = writes ? [...writes] : Array(tapeCount).fill('')
  next[i] = v
  return next
}
function withMoveAt(moves: TapeDirection[] | undefined, tapeCount: number, i: number, v: TapeDirection) {
  const next: TapeDirection[] = moves ? [...moves] : Array(tapeCount).fill('R')
  next[i] = v
  return next
}

export function TransitionTable({ config, states, transitions, onRenameState, onDeleteState, onUpdateTransition, onDeleteTransition }: TransitionTableProps) {
  const tm = isTM(config)

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
            {t.reads.map((r, i) => (
              <TextInput
                key={`read-${i}`}
                size="xs"
                w={36}
                defaultValue={r}
                onBlur={(e) => onUpdateTransition(t.id, { reads: withReadAt(t.reads, i, e.target.value) })}
              />
            ))}
            <TextInput size="xs" style={{ flex: 1 }} value={`) → ${t.target}`} readOnly />
            {tm && (
              <>
                <TextInput size="xs" value="/" readOnly w={16} style={{ textAlign: 'center' }} />
                {Array.from({ length: config.tapeCount }, (_, i) => (
                  <TextInput
                    key={`write-${i}`}
                    size="xs"
                    w={36}
                    defaultValue={t.writes?.[i] ?? ''}
                    onBlur={(e) => onUpdateTransition(t.id, { writes: withWriteAt(t.writes, config.tapeCount, i, e.target.value) })}
                  />
                ))}
                {Array.from({ length: config.tapeCount }, (_, i) => (
                  <Select
                    key={`move-${i}`}
                    size="xs"
                    w={56}
                    data={['L', 'R', 'S']}
                    value={t.moves?.[i] ?? 'R'}
                    onChange={(v) => v && onUpdateTransition(t.id, { moves: withMoveAt(t.moves, config.tapeCount, i, v as TapeDirection) })}
                  />
                ))}
              </>
            )}
            <ActionIcon size="sm" color="red" variant="subtle" onClick={() => onDeleteTransition(t.id)}><IconTrash size={14} /></ActionIcon>
          </Group>
        ))}
      </Stack>
    </Paper>
  )
}
