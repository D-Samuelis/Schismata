// apps/web/src/components/TapeView/TapeCell.tsx

import { memo } from "react";
import { BLANK_SYMBOL } from "../../types/automaton";
import { CELL, INDEX_H } from "./tapeConfig";

interface TapeCellProps {
  /** Absolute cell index on the tape (also its x position on the track). */
  index: number;
  symbol: string;
  /** True while this cell is being rewritten (write phase). */
  flash: boolean;
  /** Duration of the write animation in ms. */
  flashMs: number;
}

export const TapeCell = memo(function TapeCell({
  index,
  symbol,
  flash,
  flashMs,
}: TapeCellProps) {
  const isBlank = symbol === BLANK_SYMBOL;

  return (
    <div
      className="absolute p-0.5"
      style={{ left: index * CELL, width: CELL, height: CELL + INDEX_H }}
    >
      <div
        className={`flex items-center justify-center rounded-md border border-gray-300 font-mono text-base dark:border-gray-600 ${
          flash ? "tape-cell-write" : ""
        }`}
        style={{
          width: CELL - 4,
          height: CELL - 4,
          animationDuration: `${flashMs}ms`,
        }}
      >
        <span
          className={`${isBlank ? "opacity-30" : ""} ${flash ? "tape-symbol-write" : ""}`}
          style={{ animationDuration: `${flashMs}ms` }}
        >
          {symbol}
        </span>
      </div>
      <div className="text-center text-[9px] leading-4 text-gray-400 dark:text-gray-500">
        {index}
      </div>
    </div>
  );
});
