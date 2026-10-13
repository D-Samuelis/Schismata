// apps/web/src/components/TapeView/TapeView.tsx

import { useEffect, useRef, useState } from "react";
import { Paper, Stack, Text, TextInput } from "@mantine/core";
import { BLANK_SYMBOL } from "../../types/automaton";

const CELL = 28; // px, matches the old w-7 / h-7
const HALF = 10; // cells rendered each side of the head (old WINDOW = 21)
const BUFFER = 2; // extra cells so the slide never reveals a gap

type Phase = "idle" | "read" | "write" | "move";
interface Snapshot {
  tapes: string[][];
  heads: number[];
}

interface TapeViewProps {
  tapes: string[][];
  heads: number[];
  /** Simulation step counter. Animation plays only when it grows by exactly 1. */
  stepCount?: number;
  /** Total duration of one step in ms; below ~120 the animation is skipped. */
  speedMs?: number;
  editable?: boolean;
  onEditTape?: (tapeIndex: number, value: string) => void;
}

function cellAt(tape: string[], index: number): string {
  return index >= 0 && index < tape.length ? tape[index] : BLANK_SYMBOL;
}

/** True if going from `a` to `b` is one TM step: heads moved <= 1, only a's head cells changed. */
function isSingleStep(a: Snapshot, b: Snapshot): boolean {
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

const CELL_BASE =
  "absolute flex items-center justify-center font-mono border border-gray-300 dark:border-gray-600 transition-[background-color,transform] duration-150";
const CELL_FLASH = "scale-110 bg-amber-300/40 dark:bg-amber-300/30";
const HEAD_BASE =
  "pointer-events-none absolute top-0 border-2 transition-colors duration-150";
const HEAD_IDLE =
  "border-[#aa3bff] bg-[#aa3bff]/10 dark:border-[#c084fc] dark:bg-[#c084fc]/15";
const HEAD_READ = "border-amber-400 bg-amber-400/10";

export function TapeView({
  tapes,
  heads,
  stepCount,
  speedMs = 450,
  editable,
  onEditTape,
}: TapeViewProps) {
  const [shown, setShown] = useState<Snapshot>({ tapes, heads });
  const [phase, setPhase] = useState<Phase>("idle");
  const prev = useRef({ tapes, heads, stepCount });

  useEffect(() => {
    const before = prev.current;
    const after: Snapshot = { tapes, heads };
    prev.current = { tapes, heads, stepCount };

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const animate =
      !reduced &&
      speedMs >= 120 &&
      stepCount !== undefined &&
      before.stepCount !== undefined &&
      stepCount === before.stepCount + 1 &&
      isSingleStep(before, after);

    if (!animate) {
      setShown(after);
      setPhase("idle");
      return;
    }

    const d = speedMs / 3;
    setShown({ tapes: before.tapes, heads: before.heads }); // 1. read
    setPhase("read");
    const timers = [
      setTimeout(() => {
        setShown((s) => ({ ...s, tapes })); // 2. write
        setPhase("write");
      }, d),
      setTimeout(() => {
        setShown((s) => ({ ...s, heads })); // 3. move (CSS transition)
        setPhase("move");
      }, 2 * d),
      setTimeout(() => setPhase("idle"), 3 * d),
    ];
    return () => timers.forEach(clearTimeout);
  }, [tapes, heads, stepCount, speedMs]);

  if (tapes.length === 0) return null;

  const moveMs = Math.max(60, speedMs / 3 - 40);

  return (
    <Stack gap="xs">
      {shown.tapes.map((tape, tapeIndex) => {
        const head = shown.heads[tapeIndex] ?? 0;
        const lo = head - HALF - BUFFER;
        const hi = head + HALF + BUFFER;
        const cellIndices = Array.from(
          { length: hi - lo + 1 },
          (_, i) => lo + i,
        );

        return (
          <Paper key={tapeIndex} withBorder p={4}>
            <div className="flex items-center gap-1">
              <Text size="xs" c="dimmed" w={50} style={{ flexShrink: 0 }}>
                {tapes.length > 1 ? `Tape ${tapeIndex + 1}` : "Tape"}
              </Text>

              <div
                className="relative flex-1 overflow-hidden"
                style={{ height: CELL }}
              >
                {/* sliding track: head cell is always at the horizontal center */}
                <div
                  className="absolute top-0 left-1/2"
                  style={{
                    transform: `translateX(${-(head * CELL + CELL / 2)}px)`,
                    transition:
                      phase === "move"
                        ? `transform ${moveMs}ms ease-in-out`
                        : "none",
                  }}
                >
                  {cellIndices.map((i) => (
                    <div
                      key={i}
                      className={`${CELL_BASE} ${
                        i === head && phase === "write" ? CELL_FLASH : ""
                      }`}
                      style={{ left: i * CELL, width: CELL, height: CELL }}
                    >
                      {cellAt(tape, i)}
                    </div>
                  ))}
                </div>

                {/* fixed head */}
                <div
                  className={`${HEAD_BASE} ${phase === "read" ? HEAD_READ : HEAD_IDLE}`}
                  style={{
                    left: `calc(50% - ${CELL / 2}px)`,
                    width: CELL,
                    height: CELL,
                  }}
                />
              </div>
            </div>

            {editable && (
              <TextInput
                mt={4}
                size="xs"
                placeholder="initial tape content"
                defaultValue={tapes[tapeIndex].join("")}
                onBlur={(e) => onEditTape?.(tapeIndex, e.currentTarget.value)}
              />
            )}
          </Paper>
        );
      })}
    </Stack>
  );
}
