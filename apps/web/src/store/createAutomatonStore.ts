// apps/web/src/store/createAutomatonStore.ts

import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { temporal } from "zundo";
import type {
  AutomatonState,
  AutomatonTransition,
  TapeDirection,
} from "../types/automaton";
import { BLANK_SYMBOL } from "../types/automaton";

export type Status = "idle" | "running" | "paused" | "done";

export interface AutomatonStore {
  status: Status;
  speed: number;
  currentState?: string;
  startState?: string;
  states: AutomatonState[];
  transitions: AutomatonTransition[];
  tapeCount: number;
  tapes: string[][];
  heads: number[];
  input: string;
  transitionCounter: number;

  addState: (id: string, position: { x: number; y: number }) => void;
  moveState: (id: string, position: { x: number; y: number }) => void;
  toggleAccept: (id: string) => void;
  renameState: (oldId: string, newId: string) => void;
  addTransition: (source: string, target: string) => void;
  updateTransition: (id: string, patch: Partial<AutomatonTransition>) => void;
  deleteElement: (id: string) => void;
  loadGraph: (graph: {
    states: AutomatonState[];
    transitions: AutomatonTransition[];
    startState?: string;
  }) => void;
  setStartState: (id?: string) => void;
  setTapeCount: (n: number) => void;
  setTapeContent: (tapeIndex: number, value: string) => void;
  setInput: (value: string) => void;
  setSpeed: (speed: number) => void;
  step: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
}

function resized<T>(arr: T[] | undefined, n: number, fill: T): T[] {
  const base = arr ?? [];
  if (base.length === n) return base;
  return Array.from({ length: n }, (_, i) => base[i] ?? fill);
}

export function createAutomatonStore(name: string, initialTapeCount: number) {
  let timer: ReturnType<typeof setInterval> | null = null;

  const useStore = create<AutomatonStore>()(
    devtools(
      persist(
        temporal(
          (set, get) => ({
            status: "idle",
            speed: 5,
            currentState: undefined,
            startState: undefined,
            states: [],
            transitions: [],
            tapeCount: initialTapeCount,
            tapes: Array.from({ length: initialTapeCount }, () => []),
            heads: Array(initialTapeCount).fill(0),
            input: "",
            transitionCounter: 0,

            addState: (id, position) =>
              set((s) => ({
                states: [...s.states, { id, x: position.x, y: position.y }],
              })),

            moveState: (id, position) =>
              set((s) => ({
                states: s.states.map((st) =>
                  st.id === id ? { ...st, x: position.x, y: position.y } : st,
                ),
              })),

            toggleAccept: (id) =>
              set((s) => ({
                states: s.states.map((st) =>
                  st.id === id ? { ...st, accept: !st.accept } : st,
                ),
              })),

            renameState: (oldId, newId) =>
              set((s) => ({
                states: s.states.map((st) =>
                  st.id === oldId ? { ...st, id: newId } : st,
                ),
                transitions: s.transitions.map((t) => ({
                  ...t,
                  source: t.source === oldId ? newId : t.source,
                  target: t.target === oldId ? newId : t.target,
                })),
                startState: s.startState === oldId ? newId : s.startState,
              })),

            addTransition: (source, target) => {
              const { tapeCount, transitionCounter } = get();
              const id = `t${transitionCounter}`;
              if (tapeCount === 0) {
                const symbol = window.prompt("Transition symbol:", "a") ?? "a";
                set((s) => ({
                  transitions: [
                    ...s.transitions,
                    { id, source, target, reads: [symbol] },
                  ],
                  transitionCounter: s.transitionCounter + 1,
                }));
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
                  window.prompt(`Tape ${i + 1} — write symbol:`, reads[i]) ??
                  reads[i],
              );
              const moves = Array.from(
                { length: tapeCount },
                (_, i) =>
                  (
                    window.prompt(`Tape ${i + 1} — move (L/R/S):`, "R") ?? "R"
                  ).toUpperCase() as TapeDirection,
              );
              set((s) => ({
                transitions: [
                  ...s.transitions,
                  { id, source, target, reads, writes, moves },
                ],
                transitionCounter: s.transitionCounter + 1,
              }));
            },

            updateTransition: (id, patch) =>
              set((s) => ({
                transitions: s.transitions.map((t) =>
                  t.id === id ? { ...t, ...patch } : t,
                ),
              })),

            deleteElement: (id) =>
              set((s) => ({
                states: s.states.filter((st) => st.id !== id),
                transitions: s.transitions.filter(
                  (t) => t.id !== id && t.source !== id && t.target !== id,
                ),
                startState: s.startState === id ? undefined : s.startState,
              })),

            loadGraph: (graph) =>
              set({
                states: graph.states,
                transitions: graph.transitions,
                startState: graph.startState,
              }),

            setStartState: (id) => set({ startState: id }),

            setTapeCount: (n) =>
              set((s) => ({
                tapeCount: n,
                tapes: resized(s.tapes, n, []),
                heads: resized(s.heads, n, 0),
                transitions: s.transitions.map((t) => ({
                  ...t,
                  reads: resized(t.reads, n, BLANK_SYMBOL),
                  writes: t.writes
                    ? resized(t.writes, n, BLANK_SYMBOL)
                    : t.writes,
                  moves: t.moves
                    ? resized(t.moves, n, "R" as TapeDirection)
                    : t.moves,
                })),
              })),

            setTapeContent: (tapeIndex, value) =>
              set((s) => ({
                tapes: s.tapes.map((t, i) =>
                  i === tapeIndex ? value.split("") : t,
                ),
              })),

            setInput: (value) => set({ input: value }),
            setSpeed: (speed) => set({ speed }),

            step: () => {
              // TODO
              // Pull next value from generator; update currentState/tapes/heads
            },

            play: () => {
              if (timer) clearInterval(timer);
              set({ status: "running" });
              timer = setInterval(() => get().step(), 1000 / get().speed);
            },

            pause: () => {
              set({ status: "paused" });
              if (timer) clearInterval(timer);
            },

            reset: () => {
              const { tapeCount, input } = get();
              if (timer) clearInterval(timer);
              set({
                status: "idle",
                currentState: undefined,
                tapes: Array.from({ length: tapeCount }, (_, i) =>
                  i === 0 ? input.split("") : [],
                ),
                heads: Array(tapeCount).fill(0),
              });
            },
          }),
          {
            partialize: (s) => ({
              states: s.states,
              transitions: s.transitions,
              startState: s.startState,
              tapeCount: s.tapeCount,
            }),
            equality: shallow,
            limit: 100,
          },
        ),
        {
          name: `schismata-${name}`,
          storage: createJSONStorage(() => localStorage),
          partialize: (s) => ({
            states: s.states,
            transitions: s.transitions,
            startState: s.startState,
            tapeCount: s.tapeCount,
            input: s.input,
            speed: s.speed,
            transitionCounter: s.transitionCounter,
          }),
        },
      ),
      { name: `Schismata/${name}` },
    ),
  );

  return useStore;
}

export type AutomatonStoreHook = ReturnType<typeof createAutomatonStore>;
