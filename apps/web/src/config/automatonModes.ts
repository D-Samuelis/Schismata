import { IconGraph, IconBinaryTree, IconMathFunction, IconCpu } from '@tabler/icons-react'
import type { ModeConfig, ModeId } from '../types/automaton'

export const AUTOMATON_MODES: Record<ModeId, ModeConfig> = {
  dfa: { label: 'DFA', icon: IconGraph, tapeCount: 0, editorKind: 'graph' },
  nfa: { label: 'NFA', icon: IconBinaryTree, tapeCount: 0, editorKind: 'graph' },
  // Editing surface is a pattern input, not the state-graph editor — see RegexEditor.
  // The graph is still shown, read-only, as the NFA Thompson's construction derives from it.
  regex: { label: 'Regular Expressions', icon: IconMathFunction, tapeCount: 0, editorKind: 'text' },
  tm: { label: 'Turing Machines', icon: IconCpu, tapeCount: 1, editorKind: 'graph' },
  // TODO: pin down the exact arithmetic TM construction before the thesis writeup —
  // unary vs binary encoding changes the tape layout. 3 assumes two operand tapes
  // + one output tape; drop to 2 if you go with an in-place construction instead.
  'tm-arithmetic': { label: 'TM: Arithmetic', icon: IconCpu, tapeCount: 3, editorKind: 'graph' },
}
