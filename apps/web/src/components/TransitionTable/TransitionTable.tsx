import {
  Paper,
  Stack,
  Title,
  TextInput,
  Text,
  Group,
  ActionIcon,
  Divider,
  Select,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import type {
  AutomatonState,
  AutomatonTransition,
  ModeId,
  TapeDirection,
} from "../../types/automaton";
import { isTM } from "../../types/automaton";

interface TransitionTableProps {
  modeId: ModeId;
  tapeCount: number;
  states: AutomatonState[];
  transitions: AutomatonTransition[];
  onRenameState: (oldId: string, newId: string) => void;
  onDeleteState: (id: string) => void;
  onUpdateTransition: (id: string, patch: Partial<AutomatonTransition>) => void;
  onDeleteTransition: (id: string) => void;
}

function withReadAt(reads: string[], i: number, v: string) {
  const next = [...reads];
  next[i] = v;
  return next;
}
function withWriteAt(
  writes: string[] | undefined,
  tapeCount: number,
  i: number,
  v: string,
) {
  const next = writes ? [...writes] : Array(tapeCount).fill("");
  next[i] = v;
  return next;
}
function withMoveAt(
  moves: TapeDirection[] | undefined,
  tapeCount: number,
  i: number,
  v: TapeDirection,
) {
  const next: TapeDirection[] = moves ? [...moves] : Array(tapeCount).fill("R");
  next[i] = v;
  return next;
}

/** One symbol slot, sized for its content instead of a generic full-width box —
 *  these sit inline with the surrounding formal notation, not as separate fields. */
function SymbolInput({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (v: string) => void;
}) {
  return (
    <TextInput
      ff="monospace"
      size="xs"
      w={36}
      styles={{ input: { textAlign: "center", paddingInline: 4 } }}
      defaultValue={value}
      onBlur={(e) => e.target.value !== value && onCommit(e.target.value)}
    />
  );
}

/** Re-points a transition's source/target. A dropdown of existing states rather
 *  than free text, since a transition endpoint has to name a real state — typing
 *  an arbitrary id here would leave it dangling until you separately created a
 *  matching state. */
function StateSelect({
  value,
  states,
  onCommit,
}: {
  value: string;
  states: AutomatonState[];
  onCommit: (v: string) => void;
}) {
  return (
    <Select
      ff="monospace"
      size="xs"
      w={72}
      allowDeselect={false}
      styles={{ input: { textAlign: "center", paddingInline: 4 } }}
      data={states.map((s) => s.id)}
      value={value}
      onChange={(v) => v && v !== value && onCommit(v)}
    />
  );
}

export function TransitionTable({
  modeId,
  tapeCount,
  states,
  transitions,
  onRenameState,
  onDeleteState,
  onUpdateTransition,
  onDeleteTransition,
}: TransitionTableProps) {
  const tm = isTM(modeId);

  return (
    <Paper withBorder p="md">
      <Title order={5} mb="sm">
        States
      </Title>
      <Stack gap={6}>
        {states.map((s) => (
          <Group key={s.id} gap={6}>
            <TextInput
              size="xs"
              defaultValue={s.id}
              onBlur={(e) =>
                e.target.value !== s.id && onRenameState(s.id, e.target.value)
              }
            />
            <ActionIcon
              size="sm"
              color="red"
              variant="subtle"
              onClick={() => onDeleteState(s.id)}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        ))}
      </Stack>
      <Divider my="md" />
      <Title order={5} mb="sm">
        Transition Function δ
      </Title>
      <Stack gap={4}>
        {transitions.map((t) => (
          <Group
            key={t.id}
            gap={4}
            wrap="nowrap"
            className="rounded-md border border-gray-200 px-2 py-1 dark:border-gray-700"
          >
            <Text ff="monospace" size="sm">
              δ(
            </Text>
            <StateSelect
              value={t.source}
              states={states}
              onCommit={(v) => onUpdateTransition(t.id, { source: v })}
            />
            <Text ff="monospace" size="sm">
              ,
            </Text>

            {t.reads.map((r, i) => (
              <Group key={`read-${i}`} gap={2} wrap="nowrap">
                {i > 0 && (
                  <Text ff="monospace" size="sm">
                    ,
                  </Text>
                )}
                <SymbolInput
                  value={r}
                  onCommit={(v) =>
                    onUpdateTransition(t.id, {
                      reads: withReadAt(t.reads, i, v),
                    })
                  }
                />
              </Group>
            ))}

            <Text ff="monospace" size="sm">
              ) →
            </Text>
            <StateSelect
              value={t.target}
              states={states}
              onCommit={(v) => onUpdateTransition(t.id, { target: v })}
            />

            {tm && (
              <>
                <Text ff="monospace" size="sm">
                  /
                </Text>
                {Array.from({ length: tapeCount }, (_, i) => (
                  <Group key={`write-${i}`} gap={2} wrap="nowrap">
                    {i > 0 && (
                      <Text ff="monospace" size="sm">
                        ,
                      </Text>
                    )}
                    <SymbolInput
                      value={t.writes?.[i] ?? ""}
                      onCommit={(v) =>
                        onUpdateTransition(t.id, {
                          writes: withWriteAt(t.writes, tapeCount, i, v),
                        })
                      }
                    />
                  </Group>
                ))}
                <Text ff="monospace" size="sm">
                  ,
                </Text>
                {Array.from({ length: tapeCount }, (_, i) => (
                  <Select
                    key={`move-${i}`}
                    size="xs"
                    w={56}
                    data={["L", "R", "S"]}
                    value={t.moves?.[i] ?? "R"}
                    onChange={(v) =>
                      v &&
                      onUpdateTransition(t.id, {
                        moves: withMoveAt(
                          t.moves,
                          tapeCount,
                          i,
                          v as TapeDirection,
                        ),
                      })
                    }
                  />
                ))}
              </>
            )}

            <div style={{ flex: 1 }} />
            <ActionIcon
              size="sm"
              color="red"
              variant="subtle"
              onClick={() => onDeleteTransition(t.id)}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
}
