// apps/web/src/utils/stateIds.ts

/** Smallest unused `q{n}`; safe after reloads, deletions and mixed graph/table adds. */
export function nextStateId(states: { id: string }[]): string {
  const used = new Set(states.map((s) => s.id));
  let n = 0;
  while (used.has(`q${n}`)) n++;
  return `q${n}`;
}

/** Where a state added from the table lands: a loose 5-column grid. */
export function nextStatePosition(existingCount: number): {
  x: number;
  y: number;
} {
  return {
    x: 90 + (existingCount % 5) * 110,
    y: 90 + Math.floor(existingCount / 5) * 110,
  };
}
