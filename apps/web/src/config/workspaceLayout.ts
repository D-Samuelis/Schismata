// apps/web/src/config/workspaceLayout.ts

import type { DockviewApi } from "dockview-react";
import type { ModeId } from "../types/automaton";

export type PanelId =
  | "graph"
  | "tape"
  | "formalDefinition"
  | "transitionTable"
  | "states";

export const PANEL_TITLES: Record<PanelId, string> = {
  graph: "Graph",
  tape: "Tape",
  formalDefinition: "Formal Definition",
  transitionTable: "Transitions",
  states: "States",
};

interface DefaultPanelSpec {
  id: PanelId;
  relativeTo?: PanelId;
  direction?: "left" | "right" | "above" | "below" | "within";
  initialWidth?: number;
  initialHeight?: number;
}

// Default panel layouts for each mode. The "graph" panel is always the root, and other panels are positioned relative to it or to each other.
export const DEFAULT_LAYOUTS: Record<ModeId, DefaultPanelSpec[]> = {
  dfa: [
    // Left half: no initialWidth, so the first split below shares the space evenly.
    { id: "graph" },
    // Right column, top.
    { id: "formalDefinition", relativeTo: "graph", direction: "right" },
    // Right column, bottom: splits the right column vertically.
    {
      id: "transitionTable",
      relativeTo: "formalDefinition",
      direction: "below",
      initialHeight: 320,
    },
    // Splits the bottom cell horizontally: transitions | states, half each.
    { id: "states", relativeTo: "transitionTable", direction: "right" },
  ],

  nfa: [
    { id: "graph" },
    { id: "formalDefinition", relativeTo: "graph", direction: "right" },
    {
      id: "transitionTable",
      relativeTo: "formalDefinition",
      direction: "below",
      initialHeight: 320,
    },
    { id: "states", relativeTo: "transitionTable", direction: "right" },
  ],

  tm: [
    { id: "graph" },
    { id: "formalDefinition", relativeTo: "graph", direction: "right" },
    {
      id: "transitionTable",
      relativeTo: "formalDefinition",
      direction: "below",
      initialHeight: 320,
    },
    { id: "states", relativeTo: "transitionTable", direction: "right" },
    // Added last on purpose: it splits only the graph's cell, so the right
    // column keeps its full height and the tape sits under the graph.
    { id: "tape", relativeTo: "graph", direction: "below", initialHeight: 320 },
  ],
};

export function defaultPanels(modeId: ModeId): PanelId[] {
  return DEFAULT_LAYOUTS[modeId].map((p) => p.id);
}

function layoutStorageKey(modeId: ModeId) {
  return `schismata-layout-${modeId}`;
}

// Independent of the Zustand stores' own persist middleware — this is dockview's
// panel geometry, keyed per mode, not automaton state.
export function loadLayout(modeId: ModeId): unknown | null {
  try {
    const raw = localStorage.getItem(layoutStorageKey(modeId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLayout(modeId: ModeId, layout: unknown) {
  try {
    localStorage.setItem(layoutStorageKey(modeId), JSON.stringify(layout));
  } catch {
    // storage full/unavailable — layout just won't persist this session
  }
}

export function buildDefaultLayout(api: DockviewApi, modeId: ModeId) {
  const specs = DEFAULT_LAYOUTS[modeId];

  for (const spec of specs) {
    api.addPanel({
      id: spec.id,
      component: spec.id,
      title: PANEL_TITLES[spec.id],
      position: spec.relativeTo
        ? {
            referencePanel: spec.relativeTo,
            direction: spec.direction ?? "right",
          }
        : undefined,
    });
  }

  // Sizes have to be applied after every panel exists, or dockview has nothing
  // to split against yet.
  for (const spec of specs) {
    if (spec.initialWidth == null && spec.initialHeight == null) continue;
    api.getPanel(spec.id)?.api.setSize({
      width: spec.initialWidth,
      height: spec.initialHeight,
    });
  }
}
