// apps/web/src/types/automaton.ts

import type { ComponentType } from 'react'

export const BLANK_SYMBOL = '␣'

export type TapeDirection = 'L' | 'R' | 'S'

export interface AutomatonState {
  id: string
  x: number
  y: number
  accept?: boolean
}

export interface AutomatonTransition {
  id: string
  source: string
  target: string
  reads: string[]
  writes?: string[]
  moves?: TapeDirection[]
}

export type EditMode = 'select' | 'add-state' | 'add-transition' | 'delete'

export interface ModeConfig {
  label: string
  icon: ComponentType<{ size?: number }>
}

export type ModeId = 'dfa' | 'nfa' | 'tm'

export function isTM(modeId: ModeId): boolean {
  return modeId === 'tm'
}