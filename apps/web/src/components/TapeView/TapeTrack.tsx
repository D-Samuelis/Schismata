// apps/web/src/components/TapeView/TapeTrack.tsx
//
// The tape itself. Cells sit at absolute x = index * CELL on a track whose
// translateX is derived from the head index, so the head cell is always at the
// horizontal center of the viewport. Changing `head` + enabling the transition
// (phase === "move") makes the tape slide under the fixed head.

import { BUFFER, BADGE_H, CELL, HALF, cellAt, type Phase } from "./tapeConfig";
import { TapeCell } from "./TapeCell";

interface TapeTrackProps {
  tape: string[];
  head: number;
  phase: Phase;
  phaseMs: number;
  moveMs: number;
}

export function TapeTrack({
  tape,
  head,
  phase,
  phaseMs,
  moveMs,
}: TapeTrackProps) {
  const lo = head - HALF - BUFFER;
  const hi = head + HALF + BUFFER;
  const indices = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

  return (
    <div
      className="absolute left-1/2"
      style={{
        top: BADGE_H,
        transform: `translateX(${-(head * CELL + CELL / 2)}px)`,
        transition:
          phase === "move"
            ? `transform ${moveMs}ms cubic-bezier(0.45, 0.05, 0.25, 1)`
            : "none",
        willChange: "transform",
      }}
    >
      {indices.map((i) => (
        <TapeCell
          key={i}
          index={i}
          symbol={cellAt(tape, i)}
          flash={phase === "write" && i === head}
          flashMs={phaseMs}
        />
      ))}
    </div>
  );
}
