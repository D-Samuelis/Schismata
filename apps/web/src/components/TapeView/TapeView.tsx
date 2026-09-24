import { Group, Paper, Stack, Text, TextInput } from "@mantine/core";
import { BLANK_SYMBOL } from "../../types/automaton";

const WINDOW = 21;

interface TapeViewProps {
  tapes: string[][];
  heads: number[];
  /** Allow editing the initial tape content — only meaningful while status === 'idle'. */
  editable?: boolean;
  onEditTape?: (tapeIndex: number, value: string) => void;
}

function cellAt(tape: string[], index: number): string {
  return index >= 0 && index < tape.length ? tape[index] : BLANK_SYMBOL;
}

const CELL_BASE =
  "inline-flex shrink-0 items-center justify-center w-7 h-7 font-mono border";
const CELL_INACTIVE = "border-gray-300 dark:border-gray-600";
// Accent kept as an arbitrary hex to match the app's brand purple (see
// AutomatonGraph's cytoscape 'active' style) rather than the closest Tailwind swatch.
const CELL_ACTIVE =
  "border-2 border-[#aa3bff] bg-[#aa3bff]/10 dark:border-[#c084fc] dark:bg-[#c084fc]/15";

export function TapeView({
  tapes,
  heads,
  editable,
  onEditTape,
}: TapeViewProps) {
  if (tapes.length === 0) return null;

  return (
    <Stack gap="xs">
      {tapes.map((tape, tapeIndex) => {
        const head = heads[tapeIndex] ?? 0;
        const half = Math.floor(WINDOW / 2);
        const cellIndices = Array.from(
          { length: WINDOW },
          (_, i) => head - half + i,
        );

        return (
          <Paper key={tapeIndex} withBorder p={4}>
            <Group gap={2} wrap="nowrap" style={{ overflowX: "auto" }}>
              <Text size="xs" c="dimmed" w={50} style={{ flexShrink: 0 }}>
                {tapes.length > 1 ? `Tape ${tapeIndex + 1}` : "Tape"}
              </Text>
              {cellIndices.map((cellIndex) => (
                <div
                  key={cellIndex}
                  className={`${CELL_BASE} ${cellIndex === head ? CELL_ACTIVE : CELL_INACTIVE}`}
                >
                  {cellAt(tape, cellIndex)}
                </div>
              ))}
            </Group>
            {editable && (
              <TextInput
                mt={4}
                size="xs"
                placeholder="initial tape content"
                defaultValue={tape.join("")}
                onBlur={(e) => onEditTape?.(tapeIndex, e.currentTarget.value)}
              />
            )}
          </Paper>
        );
      })}
    </Stack>
  );
}
