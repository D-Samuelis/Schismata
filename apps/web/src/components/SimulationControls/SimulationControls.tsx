import { Group, ActionIcon, Slider, Text, TextInput } from '@mantine/core'
import { IconPlayerPlay, IconPlayerPause, IconPlayerSkipForward, IconRefresh } from '@tabler/icons-react'

interface SimulationControlsProps {
  status: 'idle' | 'running' | 'paused' | 'done'
  input: string
  onInputChange: (v: string) => void
  onStep: () => void
  onPlay: () => void
  onPause: () => void
  onReset: () => void
  speed: number
  onSpeedChange: (v: number) => void
}

export function SimulationControls({
  status, input, onInputChange, onStep, onPlay, onPause, onReset, speed, onSpeedChange,
}: SimulationControlsProps) {
  return (
    <Group>
      <TextInput
        placeholder={'e.g. "0110"'}
        label="Input w ="
        value={input}
        onChange={(e) => onInputChange(e.currentTarget.value)}
        w={200}
      />
      <ActionIcon onClick={onStep} disabled={status === 'running'}><IconPlayerSkipForward /></ActionIcon>
      {status === 'running'
        ? <ActionIcon onClick={onPause}><IconPlayerPause /></ActionIcon>
        : <ActionIcon onClick={onPlay}><IconPlayerPlay /></ActionIcon>}
      <ActionIcon onClick={onReset}><IconRefresh /></ActionIcon>
      <Text size="sm">Speed</Text>
      <Slider value={speed} onChange={onSpeedChange} min={1} max={10} w={120} />
    </Group>
  )
}