// apps/web/src/components/TapeView/tapeConfig.ts

/**
 * Shared constants and types for the tape view.
 */

import { BLANK_SYMBOL } from "../../types/automaton";

/** Width/height of one tape cell in px. */
export const CELL = 36;
/** Cells rendered on each side of the head (the viewport clips what doesn't fit). */
export const HALF = 10;
/** Extra off-screen cells so the slide never reveals a gap. Keep >= 1. */
export const BUFFER = 2;
/** Space above the cells reserved for the head housing + needle. */
export const BADGE_H = 40;
/** Space below the cells for the cell index labels. */
export const INDEX_H = 16;
export const TAPE_HEIGHT = BADGE_H + CELL + INDEX_H;

/** Below this step duration the animation is skipped and the tape just snaps. */
export const MIN_ANIMATED_STEP_MS = 120;

/**
 * One step -> three phases:
 *  read  -> the head "looks" at the cell
 *  write -> the symbol under the head is replaced
 *  move  -> the tape slides under the head
 */
export type Phase = "idle" | "read" | "write" | "move";

export type MachineStatus = "running" | "accept" | "reject";

export interface TapeSnapshot {
  tapes: string[][];
  heads: number[];
  state?: string;
}

/** Symbol at `index`; everything outside the stored array is blank. */
export function cellAt(tape: string[], index: number): string {
  return index >= 0 && index < tape.length ? tape[index] : BLANK_SYMBOL;
}
