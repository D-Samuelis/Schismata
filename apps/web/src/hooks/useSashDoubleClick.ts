// apps/web/src/hooks/useSashDoubleClick.ts
//
// Double-click a dockview sash (the draggable edge between two groups) and the
// two neighbouring groups split their shared space 50/50.

import { useEffect, type RefObject } from "react";
import type { DockviewApi, DockviewGroupPanel } from "dockview-react";

type Axis = "width" | "height";

const EDGE_TOLERANCE = 8; // px between a sash centre and a group edge
const MIN_SIZE = 120;

const box = (g: DockviewGroupPanel) => g.element.getBoundingClientRect();

function neighbours(api: DockviewApi, sash: DOMRect) {
  const vertical = sash.width <= sash.height; // vertical bar => resizes widths
  const cx = sash.left + sash.width / 2;
  const cy = sash.top + sash.height / 2;
  let before: DockviewGroupPanel | undefined;
  let after: DockviewGroupPanel | undefined;

  for (const g of api.groups) {
    const r = box(g);
    if (vertical) {
      const spans = r.top < sash.bottom && r.bottom > sash.top;
      if (spans && Math.abs(r.right - cx) <= EDGE_TOLERANCE) before ??= g;
      if (spans && Math.abs(r.left - cx) <= EDGE_TOLERANCE) after ??= g;
    } else {
      const spans = r.left < sash.right && r.right > sash.left;
      if (spans && Math.abs(r.bottom - cy) <= EDGE_TOLERANCE) before ??= g;
      if (spans && Math.abs(r.top - cy) <= EDGE_TOLERANCE) after ??= g;
    }
  }
  return { axis: (vertical ? "width" : "height") as Axis, before, after };
}

function splitEvenly(api: DockviewApi, sashEl: HTMLElement) {
  const { axis, before, after } = neighbours(
    api,
    sashEl.getBoundingClientRect(),
  );
  const target = before ?? after;
  if (!target) return;

  const shared =
    (before ? box(before)[axis] : 0) + (after ? box(after)[axis] : 0);
  const next = Math.max(
    MIN_SIZE,
    Math.min(Math.round(shared / 2), shared - MIN_SIZE),
  );
  target.api.setSize(axis === "width" ? { width: next } : { height: next });
}

export function useSashDoubleClick(
  hostRef: RefObject<HTMLElement | null>,
  apiRef: RefObject<DockviewApi | null>,
) {
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const onDblClick = (e: MouseEvent) => {
      const sash = (e.target as HTMLElement).closest<HTMLElement>(".dv-sash");
      const api = apiRef.current;
      if (sash && api) splitEvenly(api, sash);
    };
    host.addEventListener("dblclick", onDblClick);
    return () => host.removeEventListener("dblclick", onDblClick);
  }, [hostRef, apiRef]);
}
