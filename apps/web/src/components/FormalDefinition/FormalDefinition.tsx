import { Paper, Stack, Text, Title } from '@mantine/core'
import type { AutomatonState, AutomatonTransition } from '../../hooks/useSimulation'

export function FormalDefinition({ states, transitions, startState }: {
  states: AutomatonState[]; transitions: AutomatonTransition[]; startState?: string
}) {
  const Q = states.map((s) => s.id).join(', ') || '∅'
  const sigma = [...new Set(transitions.map((t) => t.symbol))].join(', ') || '∅'
  const F = states.filter((s) => s.accept).map((s) => s.id).join(', ') || '∅'

  return (
    <Paper withBorder p="md">
      <Title order={5} mb="sm">Formal Definition</Title>
      <Stack gap={4} ff="monospace">
        <Text size="sm">M = (Q, Σ, δ, q₀, F)</Text>
        <Text size="sm">Q = {'{'}{Q}{'}'}</Text>
        <Text size="sm">Σ = {'{'}{sigma}{'}'}</Text>
        <Text size="sm">q₀ = {startState ?? '—'}</Text>
        <Text size="sm">F = {'{'}{F}{'}'}</Text>
      </Stack>
    </Paper>
  )
}