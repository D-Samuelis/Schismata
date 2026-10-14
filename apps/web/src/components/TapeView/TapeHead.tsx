// apps/web/src/components/TapeView/TapeHead.tsx

import type { CSSProperties } from "react";
import { BADGE_H, CELL, type MachineStatus, type Phase } from "./tapeConfig";

interface Tone {
  ink: string; // text colour: LED, needle, corners, beam, chevron
  edge: string; // housing underline
  tint: string; // faint fill inside the corners
}

const TONES: Record<MachineStatus, Tone> = {
  running: {
    ink: "text-[#aa3bff] dark:text-[#c084fc]",
    edge: "border-[#aa3bff] dark:border-[#c084fc]",
    tint: "bg-[#aa3bff]/10 dark:bg-[#c084fc]/10",
  },
  accept: {
    ink: "text-emerald-500",
    edge: "border-emerald-500",
    tint: "bg-emerald-500/10",
  },
  reject: {
    ink: "text-rose-500",
    edge: "border-rose-500",
    tint: "bg-rose-500/10",
  },
};

const READ_TONE: Tone = {
  ink: "text-amber-400",
  edge: "border-amber-400",
  tint: "bg-amber-400/10",
};

const CORNER = "absolute h-2.5 w-2.5 border-current";

interface TapeHeadProps {
  /** Current machine state; shown in the housing. */
  state?: string;
  status: MachineStatus;
  phase: Phase;
  /** -1 / 0 / 1: where the head is travelling during the move phase. */
  direction: number;
  phaseMs: number;
  moveMs: number;
}

export function TapeHead({
  state,
  status,
  phase,
  direction,
  phaseMs,
  moveMs,
}: TapeHeadProps) {
  const tone = phase === "read" ? READ_TONE : TONES[status];

  return (
    <div
      className="pointer-events-none absolute top-0"
      style={{
        left: `calc(50% - ${CELL / 2}px)`,
        width: CELL,
        height: BADGE_H + CELL,
      }}
    >
      {/* housing + needle */}
      <div
        className="flex flex-col items-center justify-end"
        style={{ height: BADGE_H }}
      >
        <div
          className={`flex h-6 items-center gap-1.5 whitespace-nowrap rounded-md border-b-2 bg-gray-800 px-2.5 font-mono text-[11px] text-gray-100 shadow-md transition-colors duration-150 dark:bg-gray-200 dark:text-gray-900 ${tone.edge}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_6px_1px_currentColor] ${tone.ink} ${
              phase === "read" ? "tape-led-blink" : ""
            }`}
            style={{ animationDuration: `${phaseMs}ms` }}
          />
          {state !== undefined && (
            <span key={state} className="tape-badge-pop">
              {state}
            </span>
          )}
        </div>
        <svg
          width="16"
          height="14"
          viewBox="0 0 16 14"
          className={`transition-colors duration-150 ${tone.ink}`}
          aria-hidden="true"
        >
          <path d="M2 0 H14 L9.2 11.5 Q8 14 6.8 11.5 Z" fill="currentColor" />
        </svg>
      </div>

      {/* viewfinder around the cell under the head */}
      <div
        className={`absolute transition-colors duration-150 ${tone.ink}`}
        style={{ top: BADGE_H, left: 0, width: CELL, height: CELL }}
      >
        <div
          className={`absolute inset-0.5 rounded-md transition-colors duration-150 ${tone.tint}`}
        />
        <div
          className={`absolute inset-0 ${phase === "read" ? "tape-head-focus" : ""}`}
          style={{ animationDuration: `${phaseMs}ms` }}
        >
          <span
            className={`${CORNER} left-0 top-0 rounded-tl-lg border-l-2 border-t-2`}
          />
          <span
            className={`${CORNER} right-0 top-0 rounded-tr-lg border-r-2 border-t-2`}
          />
          <span
            className={`${CORNER} bottom-0 left-0 rounded-bl-lg border-b-2 border-l-2`}
          />
          <span
            className={`${CORNER} bottom-0 right-0 rounded-br-lg border-b-2 border-r-2`}
          />
        </div>

        {/* write beam */}
        {phase === "write" && (
          <span
            className="tape-head-scan absolute left-1 right-1 top-0.5 h-0.5 rounded-full bg-current shadow-[0_0_8px_1px_currentColor]"
            style={
              {
                animationDuration: `${phaseMs}ms`,
                "--tape-scan": `${CELL - 6}px`,
              } as CSSProperties
            }
          />
        )}
      </div>

      {/* direction hint while the tape slides */}
      {phase === "move" && direction !== 0 && (
        <span
          className={`absolute font-mono text-xl leading-none ${tone.ink} ${
            direction > 0 ? "tape-head-nudge-right" : "tape-head-nudge-left"
          }`}
          style={{
            top: BADGE_H + CELL / 2 - 12,
            ...(direction > 0 ? { left: CELL + 4 } : { right: CELL + 4 }),
            animationDuration: `${moveMs}ms`,
          }}
        >
          {direction > 0 ? "›" : "‹"}
        </span>
      )}
    </div>
  );
}
