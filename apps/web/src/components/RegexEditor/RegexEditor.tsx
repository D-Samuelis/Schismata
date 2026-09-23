import { useState } from 'react'
import { Paper, Stack, TextInput, Title, Text } from '@mantine/core'

interface RegexEditorProps {
  pattern: string
  onPatternChange: (v: string) => void
}

export function RegexEditor({ pattern, onPatternChange }: RegexEditorProps) {
  const [error, setError] = useState<string | null>(null)

  return (
    <Paper withBorder p="md">
      <Title order={5} mb="sm">Regular Expression</Title>
      <Stack gap={8}>
        <TextInput
          ff="monospace"
          placeholder="e.g. (a|b)*abb"
          value={pattern}
          onChange={(e) => {
            onPatternChange(e.currentTarget.value)
            // TODO: validate against @schismata/core's regex grammar once parsing lands;
            // clearing the error optimistically for now.
            setError(null)
          }}
          error={error}
        />
        <Text size="xs" c="dimmed">
          {/* TODO: wire up @schismata/core once regex → NFA (Thompson's construction) is implemented.
              The graph below should then populate read-only from the compiled NFA. */}
          The graph below shows the equivalent NFA, generated via Thompson&apos;s construction.
        </Text>
      </Stack>
    </Paper>
  )
}
