// apps/web/src/components/TapeView/useTapeAnimation.ts
//
// Turns "previous configuration -> new configuration" into a timed
// read -> write -> move sequence. Pure presentation: it never decides what a
// step is, it only replays what the simulator already did.

import { useEffect, useRef, useState } from "react";
import {
  MIN_ANIMATED_STEP_MS,
  cellAt,
  type Phase,
  type TapeSnapshot,
} from "./tapeConfig";

interface Input {
  tapes: string[][];
  heads: number[];
  state?: string;
  /** Optional simulation step counter; if given, animation only plays when it grows by exactly 1. */
  stepCount?: number;
  /** Total duration of one step in ms. */
  speedMs: number;
}

interface Output {
  /** What should be drawn right now (may be a half-finished step). */
  shown: TapeSnapshot;
  phase: Phase;
  /** Per tape: -1 head moved left, 0 stayed, 1 moved right (valid during an animated step). */
  directions: number[];
  /** Duration of the read / write phases in ms. */
  phaseMs: number;
  /** Duration of the CSS slide in ms. */
  moveMs: number;
}

/** One TM step: every head moved by <= 1 and only the old head cells changed. */
function isSingleStep(a: TapeSnapshot, b: TapeSnapshot): boolean {
  if (a.tapes.length !== b.tapes.length) return false;
  return a.tapes.every((ta, t) => {
    const tb = b.tapes[t];
    if (Math.abs(b.heads[t] - a.heads[t]) > 1) return false;
    const len = Math.max(ta.length, tb.length);
    for (let i = 0; i < len; i++) {
      if (cellAt(ta, i) !== cellAt(tb, i) && i !== a.heads[t]) return false;
    }
    return true;
  });
}

export function useTapeAnimation({
  tapes,
  heads,
  state,
  stepCount,
  speedMs,
}: Input): Output {
  const [shown, setShown] = useState<TapeSnapshot>({ tapes, heads, state });
  const [phase, setPhase] = useState<Phase>("idle");
  const [directions, setDirections] = useState<number[]>([]);

  const prev = useRef({ tapes, heads, state, stepCount });
  // Read speed through a ref so changing the slider mid-step doesn't cancel the running animation.
  const speedRef = useRef(speedMs);
  speedRef.current = speedMs;

  useEffect(() => {
    const before = prev.current;
    if (
      before.tapes === tapes &&
      before.heads === heads &&
      before.state === state &&
      before.stepCount === stepCount
    ) {
      return; // nothing new (also covers React StrictMode's double effect on mount)
    }
    prev.current = { tapes, heads, state, stepCount };

    const after: TapeSnapshot = { tapes, heads, state };
    const speed = speedRef.current;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const stepOk =
      stepCount === undefined ||
      before.stepCount === undefined ||
      stepCount === before.stepCount + 1;
    const animate =
      !reduced &&
      speed >= MIN_ANIMATED_STEP_MS &&
      stepOk &&
      isSingleStep(before, after);

    if (!animate) {
      // reset / undo / jump / edit / very fast playback: snap
      setShown(after);
      setPhase("idle");
      setDirections([]);
      return;
    }

    const d = speed / 3;
    // 1. read: show the configuration before the step
    setShown({ tapes: before.tapes, heads: before.heads, state: before.state });
    setDirections(heads.map((h, i) => Math.sign(h - (before.heads[i] ?? h))));
    setPhase("read");

    const timers = [
      setTimeout(() => {
        // 2. write: new symbols appear, head still on the old cell
        setShown((s) => ({ ...s, tapes }));
        setPhase("write");
      }, d),
      setTimeout(() => {
        // 3. move: head index + state change, CSS transition slides the track
        setShown((s) => ({ ...s, heads, state }));
        setPhase("move");
      }, 2 * d),
      setTimeout(() => setPhase("idle"), 3 * d),
    ];
    return () => timers.forEach(clearTimeout);
  }, [tapes, heads, state, stepCount]);

  return {
    shown,
    phase,
    directions,
    phaseMs: speedMs / 3,
    moveMs: Math.max(60, speedMs / 3 - 40),
  };
}
