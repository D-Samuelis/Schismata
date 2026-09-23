import type { CSSProperties } from 'react'
import { Group, Paper, Stack, Text, TextInput } from '@mantine/core'
import { BLANK_SYMBOL } from '../../types/automaton'

// Cells shown either side of the head. Fine for a first pass; for tapes that
// grow large during simulation, consider virtualizing instead of rendering a
// wide static window.
const WINDOW = 21

interface TapeViewProps {
  tapes: string[][]
  heads: number[]
  /** Allow editing the initial tape content — only meaningful while status === 'idle'. */
  editable?: boolean
  onEditTape?: (tapeIndex: number, value: string) => void
}

function cellAt(tape: string[], index: number): string {
  return index >= 0 && index < tape.length ? tape[index] : BLANK_SYMBOL
}

const cellStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  border: '1px solid var(--mantine-color-gray-4)',
  fontFamily: 'var(--mono, monospace)',
  flexShrink: 0,
}

export function TapeView({ tapes, heads, editable, onEditTape }: TapeViewProps) {
  if (tapes.length === 0) return null

  return (
    <Stack gap="xs">
      {tapes.map((tape, tapeIndex) => {
        const head = heads[tapeIndex] ?? 0
        const half = Math.floor(WINDOW / 2)
        const cellIndices = Array.from({ length: WINDOW }, (_, i) => head - half + i)

        return (
          <Paper key={tapeIndex} withBorder p={4}>
            <Group gap={2} wrap="nowrap" style={{ overflowX: 'auto' }}>
              <Text size="xs" c="dimmed" w={50} style={{ flexShrink: 0 }}>
                {tapes.length > 1 ? `Tape ${tapeIndex + 1}` : 'Tape'}
              </Text>
              {cellIndices.map((cellIndex) => (
                <div
                  key={cellIndex}
                  style={{
                    ...cellStyle,
                    background: cellIndex === head ? 'var(--accent-bg, rgba(170,59,255,0.1))' : undefined,
                    borderColor: cellIndex === head ? 'var(--accent, #aa3bff)' : undefined,
                    borderWidth: cellIndex === head ? 2 : 1,
                  }}
                >
                  {cellAt(tape, cellIndex)}
                </div>
              ))}
            </Group>
            {editable && (
              <TextInput
                mt={4}
                size="xs"
                placeholder="initial tape content"
                defaultValue={tape.join('')}
                onBlur={(e) => onEditTape?.(tapeIndex, e.currentTarget.value)}
              />
            )}
          </Paper>
        )
      })}
    </Stack>
  )
}
