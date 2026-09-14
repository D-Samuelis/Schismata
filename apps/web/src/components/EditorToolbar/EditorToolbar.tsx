import { SegmentedControl } from '@mantine/core'
import { IconPointer, IconCircle, IconArrowRight, IconTrash } from '@tabler/icons-react'

export type EditMode = 'select' | 'add-state' | 'add-transition' | 'delete'

export function EditorToolbar({ mode, onModeChange }: { mode: EditMode; onModeChange: (m: EditMode) => void }) {
  return (
    <SegmentedControl
      value={mode}
      onChange={(v) => onModeChange(v as EditMode)}
      data={[
        { label: <IconPointer size={18} />, value: 'select' },
        { label: <IconCircle size={18} />, value: 'add-state' },
        { label: <IconArrowRight size={18} />, value: 'add-transition' },
        { label: <IconTrash size={18} />, value: 'delete' },
      ]}
    />
  )
}