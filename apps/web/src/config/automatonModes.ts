import { IconGraph, IconBinaryTree, IconMathFunction, IconCpu } from '@tabler/icons-react'

export type ModeId = 'dfa' | 'nfa' | 'regex' | 'tm' | 'tm-arithmetic'

export const AUTOMATON_MODES: Record<ModeId, { label: string; icon: typeof IconGraph; usesTape: boolean }> = {
  dfa: { label: 'DFA', icon: IconGraph, usesTape: false },
  nfa: { label: 'NFA', icon: IconBinaryTree, usesTape: false },
  regex: { label: 'Regular Expressions', icon: IconMathFunction, usesTape: false },
  tm: { label: 'Turing Machines', icon: IconCpu, usesTape: true },
  'tm-arithmetic': { label: 'TM: Arithmetic', icon: IconCpu, usesTape: true },
}