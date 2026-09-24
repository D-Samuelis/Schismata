import { useState, useRef, useCallback } from "react";
import type {
  ModeId,
  AutomatonState,
  AutomatonTransition,
  TapeDirection,
} from "../types/automaton";
import { BLANK_SYMBOL } from "../types/automaton";
import { DEFAULT_TM_TAPE_COUNT } from "../config/automatonModes";

export type Status = "idle" | "running" | "paused" | "done";

/** Grows or shrinks an array to length `n`, padding new slots with `fill`. */
function resized<T>(arr: T[] | undefined, n: number, fill: T): T[] {
  const base = arr ?? [];
  if (base.length === n) return base;
  return Array.from({ length: n }, (_, i) => base[i] ?? fill);
}

export function useSimulation(modeId: ModeId) {
  const initialTapeCount = modeId === "tm" ? DEFAULT_TM_TAPE_COUNT : 0;

  const [status, setStatus] = useState<Status>("idle");
  const [speed, setSpeed] = useState(5);
  const [currentState, setCurrentState] = useState<string | undefined>();
  const [startState, setStartState] = useState<string | undefined>();
  const [states, setStates] = useState<AutomatonState[]>([]);
  const [transitions, setTransitions] = useState<AutomatonTransition[]>([]);
  const [tapeCount, setTapeCountState] = useState(initialTapeCount);
  const [tapes, setTapes] = useState<string[][]>(() =>
    Array.from({ length: initialTapeCount }, () => []),
  );
  const [heads, setHeads] = useState<number[]>(() =>
    Array(initialTapeCount).fill(0),
  );
  const [input, setInput] = useState("");

  const timerRef = useRef<number | null>(null);
  const transitionCounter = useRef(0);

  // --- tape count (TM only — changing it resizes tapes/heads and every
  // transition's per-tape reads/writes/moves rather than discarding them) ---

  const setTapeCount = useCallback((n: number) => {
    setTapeCountState(n);
    setTapes((prev) => resized(prev, n, []));
    setHeads((prev) => resized(prev, n, 0));
    setTransitions((prev) =>
      prev.map((t) => ({
        ...t,
        reads: resized(t.reads, n, BLANK_SYMBOL),
        writes: t.writes ? resized(t.writes, n, BLANK_SYMBOL) : t.writes,
        moves: t.moves ? resized(t.moves, n, "R" as TapeDirection) : t.moves,
      })),
    );
  }, []);

  // --- graph editing ---

  const addState = useCallback(
    (id: string, position: { x: number; y: number }) => {
      setStates((prev) => [...prev, { id, x: position.x, y: position.y }]);
    },
    [],
  );

  const moveState = useCallback(
    (id: string, position: { x: number; y: number }) => {
      setStates((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, x: position.x, y: position.y } : s,
        ),
      );
    },
    [],
  );

  const toggleAccept = useCallback((id: string) => {
    setStates((prev) =>
      prev.map((s) => (s.id === id ? { ...s, accept: !s.accept } : s)),
    );
  }, []);

  const renameState = useCallback((oldId: string, newId: string) => {
    setStates((prev) =>
      prev.map((s) => (s.id === oldId ? { ...s, id: newId } : s)),
    );
    setTransitions((prev) =>
      prev.map((t) => ({
        ...t,
        source: t.source === oldId ? newId : t.source,
        target: t.target === oldId ? newId : t.target,
      })),
    );
    setStartState((prev) => (prev === oldId ? newId : prev));
  }, []);

  const addTransition = useCallback(
    (source: string, target: string) => {
      // TODO: replace window.prompt with a Mantine modal (one field per tape). Kept as
      // prompt() for now, same as before — just shape-aware so TM tapes aren't lost.
      const id = `t${transitionCounter.current++}`;
      if (tapeCount === 0) {
        const symbol = window.prompt("Transition symbol:", "a") ?? "a";
        setTransitions((prev) => [
          ...prev,
          { id, source, target, reads: [symbol] },
        ]);
        return;
      }
      const reads = Array.from(
        { length: tapeCount },
        (_, i) =>
          window.prompt(`Tape ${i + 1} — read symbol:`, BLANK_SYMBOL) ??
          BLANK_SYMBOL,
      );
      const writes = Array.from(
        { length: tapeCount },
        (_, i) =>
          window.prompt(`Tape ${i + 1} — write symbol:`, reads[i]) ?? reads[i],
      );
      const moves = Array.from(
        { length: tapeCount },
        (_, i) =>
          (
            window.prompt(`Tape ${i + 1} — move (L/R/S):`, "R") ?? "R"
          ).toUpperCase() as TapeDirection,
      );
      setTransitions((prev) => [
        ...prev,
        { id, source, target, reads, writes, moves },
      ]);
    },
    [tapeCount],
  );

  /** Patches one transition's reads/writes/moves — covers both the simple DFA/NFA
   *  symbol edit and per-tape TM edits from TransitionTable. */
  const updateTransition = useCallback(
    (id: string, patch: Partial<AutomatonTransition>) => {
      setTransitions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      );
    },
    [],
  );

  const deleteElement = useCallback((id: string) => {
    setStates((prev) => prev.filter((s) => s.id !== id));
    setTransitions((prev) =>
      prev.filter((t) => t.id !== id && t.source !== id && t.target !== id),
    );
    setStartState((prev) => (prev === id ? undefined : prev));
  }, []);

  /** Replaces the whole graph in one go — used by the regex → NFA generator. */
  const loadGraph = useCallback(
    (next: {
      states: AutomatonState[];
      transitions: AutomatonTransition[];
      startState?: string;
    }) => {
      setStates(next.states);
      setTransitions(next.transitions);
      setStartState(next.startState);
    },
    [],
  );

  // --- tape editing (idle only — see TapeView) ---

  const setTapeContent = useCallback((tapeIndex: number, value: string) => {
    setTapes((prev) =>
      prev.map((t, i) => (i === tapeIndex ? value.split("") : t)),
    );
  }, []);

  // --- simulation playback ---

  const step = useCallback(() => {
    // TODO: pull next value from @schismata/core generator; update currentState/tapes/heads
  }, []);

  const play = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current); // guard against a second interval stacking up
    setStatus("running");
    timerRef.current = window.setInterval(step, 1000 / speed);
  }, [step, speed]);

  const pause = useCallback(() => {
    setStatus("paused");
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setCurrentState(undefined);
    // tape 0 (the input tape) is seeded from `input`; any further tapes start blank
    setTapes(
      Array.from({ length: tapeCount }, (_, i) =>
        i === 0 ? input.split("") : [],
      ),
    );
    setHeads(Array(tapeCount).fill(0));
    if (timerRef.current) clearInterval(timerRef.current);
  }, [tapeCount, input]);

  return {
    status,
    speed,
    setSpeed,
    currentState,
    startState,
    setStartState,
    states,
    transitions,
    setTransitions,
    tapeCount,
    setTapeCount,
    tapes,
    heads,
    input,
    setInput,
    addState,
    moveState,
    toggleAccept,
    renameState,
    addTransition,
    updateTransition,
    setTapeContent,
    deleteElement,
    loadGraph,
    step,
    play,
    pause,
    reset,
  };
}
