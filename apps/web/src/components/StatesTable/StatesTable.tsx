// apps/web/src/components/StatesTable/StatesTable.tsx
//
// Editable list of states: Start (radio) | Accepting (checkbox) | Name | delete.

import { IconPlus, IconTrash } from "@tabler/icons-react";
import type { AutomatonState } from "../../types/automaton";
import { nextStateId, nextStatePosition } from "../../utils/stateIds";
import {
  CellInput,
  TABLE,
  TABLE_ACTION,
  TD,
  TH,
  TR,
  TableFrame,
} from "../ui/TableCells";
import { TableHeader } from "../ui/TableHeader";

interface StatesTableProps {
  states: AutomatonState[];
  startState?: string;
  onAddState: (id: string, position: { x: number; y: number }) => void;
  onRename: (oldId: string, newId: string) => void;
  onDelete: (id: string) => void;
  onSetStart: (id: string) => void;
  onToggleAccept: (id: string) => void;
}

export function StatesTable({
  states,
  startState,
  onAddState,
  onRename,
  onDelete,
  onSetStart,
  onToggleAccept,
}: StatesTableProps) {
  // Two states with the same id would corrupt every transition that references them.
  const rename = (oldId: string, raw: string): boolean => {
    const next = raw.trim();
    if (!next || states.some((s) => s.id === next)) return false;
    onRename(oldId, next);
    return true;
  };

  const add = () => {
    const id = nextStateId(states);
    onAddState(id, nextStatePosition(states.length));
    // Jump straight into renaming the new row once it has rendered.
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLInputElement>(
        `[data-cell="${CSS.escape(`state-name-${id}`)}"]`,
      );
      el?.scrollIntoView({ block: "nearest" });
      el?.focus();
      el?.select();
    });
  };

  return (
    <div>
      <TableHeader
        title="States Q"
        count={states.length}
        noun="state"
        action={
          <button type="button" onClick={add} className={TABLE_ACTION}>
            <IconPlus size={14} /> Add state
          </button>
        }
      />

      <TableFrame>
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={`${TH} w-14 text-center`}>Start</th>
              <th className={`${TH} w-20 text-center`}>Accepting</th>
              <th className={TH}>Name</th>
              <th className={`${TH} w-8`} aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {states.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-4 text-center text-xs text-[var(--sc-muted-foreground)]"
                >
                  No states yet. Use “Add state” or the Add State tool on the
                  graph.
                </td>
              </tr>
            )}
            {states.map((s) => (
              <tr key={s.id} className={TR}>
                <td className={`${TD} text-center`}>
                  <input
                    type="radio"
                    name="start-state"
                    aria-label={`${s.id} is the start state`}
                    checked={startState === s.id}
                    onChange={() => onSetStart(s.id)}
                    className="cursor-pointer accent-[var(--sc-accent)]"
                  />
                </td>
                <td className={`${TD} text-center`}>
                  <input
                    type="checkbox"
                    aria-label={`${s.id} is accepting`}
                    checked={!!s.accept}
                    onChange={() => onToggleAccept(s.id)}
                    className="cursor-pointer accent-[var(--sc-accent)]"
                  />
                </td>
                <td className={TD}>
                  <CellInput
                    label="State name"
                    align="left"
                    dataKey={`state-name-${s.id}`}
                    value={s.id}
                    onCommit={(v) => rename(s.id, v)}
                  />
                </td>
                <td className={`${TD} text-center`}>
                  <button
                    type="button"
                    aria-label={`Delete state ${s.id}`}
                    onClick={() => onDelete(s.id)}
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
