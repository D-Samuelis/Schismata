// apps/web/src/components/TapeView/TapeView.tsx

import { Paper, Stack, Text, TextInput } from "@mantine/core";
import "./TapeView.css";
import { TapeHead } from "./TapeHead";
import { TapeTrack } from "./TapeTrack";
import { TAPE_HEIGHT, type MachineStatus } from "./tapeConfig";
import { useTapeAnimation } from "./useTapeAnimation";

// Fades the left/right edges so the tape reads as "continues forever".
const EDGE_FADE =
  "linear-gradient(to right, transparent, black 10%, black 90%, transparent)";

interface TapeViewProps {
  tapes: string[][];
  heads: number[];
  /** Current machine state, shown in the head's badge. */
  state?: string;
  /** Tints the head: running (accent), accept (green), reject (red). */
  status?: MachineStatus;
  /** Simulation step counter. Optional extra guard: animate only when it grows by exactly 1. */
  stepCount?: number;
  /** Duration of one animated step in ms (below ~120 the tape just snaps). */
  speedMs?: number;
  editable?: boolean;
  onEditTape?: (tapeIndex: number, value: string) => void;
}

export function TapeView({
  tapes,
  heads,
  state,
  status = "running",
  stepCount,
  speedMs = 450,
  editable,
  onEditTape,
}: TapeViewProps) {
  const { shown, phase, directions, phaseMs, moveMs } = useTapeAnimation({
    tapes,
    heads,
    state,
    stepCount,
    speedMs,
  });

  if (tapes.length === 0) return null;

  return (
    <Stack gap="xs">
      {shown.tapes.map((tape, tapeIndex) => (
        <Paper key={tapeIndex} withBorder p={6}>
          <div className="flex items-center gap-2">
            <Text size="xs" c="dimmed" w={50} style={{ flexShrink: 0 }}>
              {tapes.length > 1 ? `Tape ${tapeIndex + 1}` : "Tape"}
            </Text>

            <div
              className="relative flex-1 overflow-hidden"
              style={{
                height: TAPE_HEIGHT,
                maskImage: EDGE_FADE,
                WebkitMaskImage: EDGE_FADE,
              }}
            >
              <TapeTrack
                tape={tape}
                head={shown.heads[tapeIndex] ?? 0}
                phase={phase}
                phaseMs={phaseMs}
                moveMs={moveMs}
              />
              <TapeHead
                state={shown.state}
                status={status}
                phase={phase}
                direction={directions[tapeIndex] ?? 0}
                phaseMs={phaseMs}
                moveMs={moveMs}
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
      ))}
    </Stack>
  );
}
