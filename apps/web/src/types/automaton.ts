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
 * Rendering/editing code should branch on `isTM(modeId)`, not on whether
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

/** Interaction mode for the graph canvas toolbar (independent of automaton mode). */
export type EditMode = 'select' | 'add-state' | 'add-transition' | 'delete'

export interface ModeConfig {
  label: string
  icon: ComponentType<{ size?: number }>
}

/**
 * Every mode shares one graph-editing surface now: DFA/NFA are 0-tape automata,
 * TM is any tape count (1 for the classic construction, more for e.g. the
 * arithmetic constructions) — tape count is a runtime choice within the TM
 * page (see useSimulation's setTapeCount), not a separate mode per arity.
 * Regex isn't a mode at all; it's a generator panel available from the NFA
 * page (see RegexEditor + Workspace) that produces an NFA via Thompson's
 * construction and hands the result to the same graph editor.
 */
export type ModeId = 'dfa' | 'nfa' | 'tm'

export function isTM(modeId: ModeId): boolean {
  return modeId === 'tm'
}