// apps/web/src/components/TransitionTable/TransitionTable.tsx
//
// Editable transition relation, one row per transition, with a "new transition"
// row pinned under the header. Nothing is pre-filled: the + button stays
// disabled (and says what's missing) until the whole transition is specified.
//   DFA/NFA:  From | Read | To
//   TM:       From | Read 1..k | To | Write 1..k | Move 1..k

import { useState } from "react";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type {
  AutomatonState,
  AutomatonTransition,
  ModeId,
  TapeDirection,
} from "../../types/automaton";
import { isTM } from "../../types/automaton";
import {
  CellInput,
  CellSelect,
  DraftInput,
  TABLE,
  TD,
  TH,
  TR,
  TableFrame,
} from "../ui/TableCells";
import { TableHeader } from "../ui/TableHeader";

export interface NewTransitionFields {
  reads: string[];
  writes?: string[];
  moves?: TapeDirection[];
}

interface TransitionTableProps {
  modeId: ModeId;
  tapeCount: number;
  states: AutomatonState[];
  transitions: AutomatonTransition[];
  onUpdateTransition: (id: string, patch: Partial<AutomatonTransition>) => void;
  onDeleteTransition: (id: string) => void;
  onAddTransition: (
    source: string,
    target: string,
    fields: NewTransitionFields,
  ) => void;
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

interface Draft {
  from: string;
  to: string;
  reads: string[];
  writes: string[];
  moves: string[];
}
const EMPTY_DRAFT: Draft = {
  from: "",
  to: "",
  reads: [],
  writes: [],
  moves: [],
};

const SYMBOL_COL = "w-16";
const STATE_COL = "w-24";

export function TransitionTable({
  modeId,
  tapeCount,
  states,
  transitions,
  onUpdateTransition,
  onDeleteTransition,
  onAddTransition,
}: TransitionTableProps) {
  const tm = isTM(modeId);
  const tapes = tm ? Math.max(1, tapeCount) : 1;
  const stateIds = states.map((s) => s.id);
  const indices = Array.from({ length: tapes }, (_, i) => i);
  const head = (name: string, i: number) =>
    tapes > 1 ? `${name} ${i + 1}` : name;
  const columnCount = 3 + tapes + (tm ? tapes * 2 : 0);

  // ---- "new transition" row -------------------------------------------------
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  // Derive from the draft so deleted states / changed tape counts can't leave
  // it pointing at something that no longer exists.
  const from = stateIds.includes(draft.from) ? draft.from : "";
  const to = stateIds.includes(draft.to) ? draft.to : "";
  const reads = indices.map((i) => draft.reads[i] ?? "");
  const writes = indices.map((i) => draft.writes[i] ?? "");
  const moves = indices.map((i) => draft.moves[i] ?? "");

  const setAt = (key: "reads" | "writes" | "moves", i: number, v: string) =>
    setDraft((d) => {
      const next = [...d[key]];
      next[i] = v;
      return { ...d, [key]: next };
    });

  // First thing still missing, in column order; null = complete.
  const missing: string | null =
    states.length === 0
      ? "Add a state first"
      : !from
        ? "Choose the source state"
        : reads.some((r) => r === "")
          ? tapes > 1
            ? "Fill in every read symbol"
            : "Enter the read symbol"
          : !to
            ? "Choose the target state"
            : tm && writes.some((w) => w === "")
              ? "Fill in every write symbol"
              : tm && moves.some((m) => m === "")
                ? "Choose a head move for every tape"
                : null;

  const submit = () => {
    if (missing) return;
    onAddTransition(
      from,
      to,
      tm ? { reads, writes, moves: moves as TapeDirection[] } : { reads },
    );
    // Keep the source (handy when adding several from one state), clear the rest.
    setDraft({ ...EMPTY_DRAFT, from });
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLInputElement>('[data-cell="draft-read-0"]')
        ?.focus(),
    );
  };

  return (
    <div>
      <TableHeader
        title="Transition function δ"
        count={transitions.length}
        noun="transition"
      />

      <TableFrame>
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={`${TH} ${STATE_COL}`}>From</th>
              {indices.map((i) => (
                <th key={`h-read-${i}`} className={`${TH} ${SYMBOL_COL}`}>
                  {head("Read", i)}
                </th>
              ))}
              <th className={`${TH} ${STATE_COL}`}>To</th>
              {tm &&
                indices.map((i) => (
                  <th key={`h-write-${i}`} className={`${TH} ${SYMBOL_COL}`}>
                    {head("Write", i)}
                  </th>
                ))}
              {tm &&
                indices.map((i) => (
                  <th key={`h-move-${i}`} className={`${TH} ${SYMBOL_COL}`}>
                    {head("Move", i)}
                  </th>
                ))}
              <th className={`${TH} w-8`} aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {/* New transition */}
            <tr className="bg-[var(--sc-accent-soft)] [&>td]:border-b-[var(--sc-accent)]">
              <td className={TD}>
                <CellSelect
                  label="New transition: source state"
                  placeholder="From…"
                  value={from}
                  options={stateIds}
                  onCommit={(v) => setDraft((d) => ({ ...d, from: v }))}
                />
              </td>
              {indices.map((i) => (
                <td key={`new-read-${i}`} className={TD}>
                  <DraftInput
                    label={head("New transition: read symbol", i)}
                    placeholder="read"
                    dataKey={`draft-read-${i}`}
                    value={reads[i]}
                    onChange={(v) => setAt("reads", i, v)}
                    onEnter={submit}
                  />
                </td>
              ))}
              <td className={TD}>
                <CellSelect
                  label="New transition: target state"
                  placeholder="To…"
                  value={to}
                  options={stateIds}
                  onCommit={(v) => setDraft((d) => ({ ...d, to: v }))}
                />
              </td>
              {tm &&
                indices.map((i) => (
                  <td key={`new-write-${i}`} className={TD}>
                    <DraftInput
                      label={head("New transition: write symbol", i)}
                      placeholder="write"
                      value={writes[i]}
                      onChange={(v) => setAt("writes", i, v)}
                      onEnter={submit}
                    />
                  </td>
                ))}
              {tm &&
                indices.map((i) => (
                  <td key={`new-move-${i}`} className={TD}>
                    <CellSelect
                      label={head("New transition: head move", i)}
                      placeholder="Move"
                      value={moves[i]}
                      options={["L", "R", "S"]}
                      onCommit={(v) => setAt("moves", i, v)}
                    />
                  </td>
                ))}
              <td className={`${TD} text-center`}>
                <span title={missing ?? "Add transition"}>
                  <button
                    type="button"
                    aria-label="Add transition"
                    disabled={missing !== null}
                    onClick={submit}
                    className="inline-flex h-7 w-7 items-center justify-center rounded text-[var(--sc-accent)] transition-colors hover:bg-[var(--sc-accent)] hover:text-[var(--sc-accent-foreground)] disabled:pointer-events-none disabled:text-[var(--sc-muted-foreground)] disabled:opacity-50"
                  >
                    <IconPlus size={16} />
                  </button>
                </span>
              </td>
            </tr>

            {transitions.length === 0 && (
              <tr>
                <td
                  colSpan={columnCount}
                  className="px-3 py-4 text-center text-xs text-[var(--sc-muted-foreground)]"
                >
                  No transitions yet. Fill in the row above, or draw one on the
                  graph.
                </td>
              </tr>
            )}

            {transitions.map((t) => (
              <tr key={t.id} className={TR}>
                <td className={TD}>
                  <CellSelect
                    label="Source state"
                    value={t.source}
                    options={stateIds}
                    onCommit={(v) => onUpdateTransition(t.id, { source: v })}
                  />
                </td>
                {indices.map((i) => (
                  <td key={`read-${i}`} className={TD}>
                    <CellInput
                      label={head("Read symbol", i)}
                      value={t.reads[i] ?? ""}
                      onCommit={(v) =>
                        onUpdateTransition(t.id, {
                          reads: withReadAt(t.reads, i, v),
                        })
                      }
                    />
                  </td>
                ))}
                <td className={TD}>
                  <CellSelect
                    label="Target state"
                    value={t.target}
                    options={stateIds}
                    onCommit={(v) => onUpdateTransition(t.id, { target: v })}
                  />
                </td>
                {tm &&
                  indices.map((i) => (
                    <td key={`write-${i}`} className={TD}>
                      <CellInput
                        label={head("Write symbol", i)}
                        value={t.writes?.[i] ?? ""}
                        onCommit={(v) =>
                          onUpdateTransition(t.id, {
                            writes: withWriteAt(t.writes, tapeCount, i, v),
                          })
                        }
                      />
                    </td>
                  ))}
                {tm &&
                  indices.map((i) => (
                    <td key={`move-${i}`} className={TD}>
                      <CellSelect
                        label={head("Head move", i)}
                        value={t.moves?.[i] ?? "R"}
                        options={["L", "R", "S"]}
                        onCommit={(v) =>
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
                    </td>
                  ))}
                <td className={`${TD} text-center`}>
                  <button
                    type="button"
                    aria-label="Delete transition"
                    onClick={() => onDeleteTransition(t.id)}
                    className="inline-flex h-7 w-7 items-center justify-center text-[var(--sc-muted-foreground)] transition-colors hover:text-[var(--sc-danger)]"
                  >
                    <IconTrash size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableFrame>
    </div>
  );
}
