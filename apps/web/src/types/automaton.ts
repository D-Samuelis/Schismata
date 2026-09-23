import type { ComponentType } from 'react'

/** Symbol shown for an untouched tape cell. */
export const BLANK_SYMBOL = '␣'

export type TapeDirection = 'L' | 'R' | 'S'

export interface AutomatonState {
  id: string
  x: number
  y: number
  accept?: boolean
}

/**
 * A single transition of the automaton.
 *
 * - DFA / NFA / the NFA a regex compiles to: only `reads` is used, length 1
 *   (`reads[0]` is the symbol). `writes` / `moves` stay undefined.
 * - Turing machines (any tape count): `reads`, `writes` and `moves` all have
 *   one entry per tape, e.g. for 2 tapes: δ(q, a₁, a₂) = (q', b₁, b₂, R, L).
 *
 * Rendering/editing code should branch on `isTM(config)`, not on whether
 * `writes`/`moves` happen to be present, so a mode's shape is always
 * consistent.
 */
export interface AutomatonTransition {
  id: string
  source: string
  target: string
  reads: string[]
  writes?: string[]
  moves?: TapeDirection[]
}

/** Which editing surface Workspace mounts for a mode. */
export type EditorKind = 'graph' | 'text'

/** Interaction mode for the graph canvas toolbar (independent of automaton mode). */
export type EditMode = 'select' | 'add-state' | 'add-transition' | 'delete'

export interface ModeConfig {
  label: string
  icon: ComponentType<{ size?: number }>
  /** 0 = no tape (DFA/NFA/Regex). >=1 = Turing machine variant with that many tapes. */
  tapeCount: number
  editorKind: EditorKind
}

export type ModeId = 'dfa' | 'nfa' | 'regex' | 'tm' | 'tm-arithmetic'

export function isTM(config: ModeConfig): boolean {
  return config.tapeCount > 0
}
