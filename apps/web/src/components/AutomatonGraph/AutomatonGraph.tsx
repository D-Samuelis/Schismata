import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import cytoscape, { type Core, type EventObject } from "cytoscape";
// @ts-expect-error cytoscape-edgehandles ships no TS declarations
import edgehandles from "cytoscape-edgehandles";
import type {
  AutomatonState,
  AutomatonTransition,
  EditMode,
} from "../../types/automaton";

interface EdgeHandlesInstance {
  start: (node: cytoscape.NodeSingular) => void;
  // NOTE: enable/disable are part of cytoscape-edgehandles' public API but, like
  // `start` above, aren't in any .d.ts here — double check these against the
  // installed version if edge-drawing behaves oddly.
  enable: () => void;
  disable: () => void;
}

cytoscape.use(edgehandles);

interface AutomatonGraphProps {
  states: AutomatonState[];
  transitions: AutomatonTransition[];
  activeState?: string;
  startState?: string;
  editMode: EditMode;
  onAddState: (id: string, position: { x: number; y: number }) => void;
  onMoveState: (id: string, position: { x: number; y: number }) => void;
  onAddTransition: (source: string, target: string) => void;
  onToggleAccept: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onContextMenu: (
    id: string,
    kind: "node" | "edge",
    x: number,
    y: number,
  ) => void;
}

export interface AutomatonGraphHandle {
  /** Starts an edge drag from an existing node — wires up StateContextMenu's
   *  "Add Transition from here", which previously called nothing. */
  startTransitionFrom: (stateId: string) => void;
}

function edgeLabel(t: AutomatonTransition): string {
  const read = t.reads.join(",");
  if (!t.writes || !t.moves) return read;
  return `${read} / ${t.writes.join(",")}, ${t.moves.join(",")}`;
}

export const AutomatonGraph = forwardRef<
  AutomatonGraphHandle,
  AutomatonGraphProps
>(function AutomatonGraph(
  {
    states,
    transitions,
    activeState,
    startState,
    editMode,
    onAddState,
    onMoveState,
    onAddTransition,
    onToggleAccept,
    onDeleteElement,
    onContextMenu,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const ehRef = useRef<EdgeHandlesInstance | null>(null);
  const stateCounter = useRef(0);

  // stash latest props so the one-time listeners below never close over stale values
  const cb = useRef({
    editMode,
    onAddState,
    onMoveState,
    onAddTransition,
    onToggleAccept,
    onDeleteElement,
    onContextMenu,
  });
  useEffect(() => {
    cb.current = {
      editMode,
      onAddState,
      onMoveState,
      onAddTransition,
      onToggleAccept,
      onDeleteElement,
      onContextMenu,
    };
  });

  useImperativeHandle(ref, () => ({
    startTransitionFrom: (stateId: string) => {
      const node = cyRef.current?.getElementById(stateId);
      if (node && node.length > 0) ehRef.current?.start(node);
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;
    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: [
        {
          selector: "node",
          style: { label: "data(id)", "background-color": "#aa3bff" },
        },
        {
          selector: "node.accept",
          style: { "border-width": 3, "border-color": "#08060d" },
        },
        {
          selector: "node.start",
          style: { "border-width": 3, "border-color": "#2ecc71" },
        },
        { selector: "node.active", style: { "background-color": "#08060d" } },
        {
          selector: "edge",
          style: {
            label: "data(label)",
            "curve-style": "bezier",
            "target-arrow-shape": "triangle",
          },
        },
      ],
    });
    cyRef.current = cy;
    ehRef.current = (
      cy as Core & { edgehandles: (o: object) => EdgeHandlesInstance }
    ).edgehandles({});

    // Background tap only adds a state in 'add-state' mode — previously this fired
    // unconditionally, so a plain click-to-pan in 'select' mode silently created states.
    cy.on("tap", (evt) => {
      if (evt.target !== cy) return;
      if (cb.current.editMode !== "add-state") return;
      const id = `q${stateCounter.current++}`;
      cb.current.onAddState(id, evt.position);
    });

    // 'delete' mode: a single tap on a state/transition removes it directly, no
    // context menu round-trip.
    cy.on("tap", "node, edge", (evt) => {
      if (cb.current.editMode !== "delete") return;
      cb.current.onDeleteElement(evt.target.id());
    });

    cy.on("dbltap", "node", (evt) =>
      cb.current.onToggleAccept(evt.target.id()),
    );

    cy.on("cxttap", "node, edge", (evt) => {
      evt.preventDefault?.();
      const oe = evt.originalEvent as MouseEvent;
      cb.current.onContextMenu(
        evt.target.id(),
        evt.target.isNode() ? "node" : "edge",
        oe.clientX,
        oe.clientY,
      );
    });

    cy.on("dragfree", "node", (evt) => {
      const p = evt.target.position();
      cb.current.onMoveState(evt.target.id(), { x: p.x, y: p.y });
    });

    // cytoscape-edgehandles calls this with (event, sourceNode, targetNode, addedEdge) —
    // NOT with the edge as evt.target (evt.target here is just the cy core). Reading
    // evt.target.source() was throwing on every completed drag, which is why edge
    // creation silently did nothing.
    cy.on(
      "ehcomplete",
      (
        _evt: EventObject,
        sourceNode: cytoscape.NodeSingular,
        targetNode: cytoscape.NodeSingular,
        addedEdge: cytoscape.EdgeSingular,
      ) => {
        cb.current.onAddTransition(sourceNode.id(), targetNode.id());
        addedEdge.remove(); // real edge re-added once parent state updates and the sync effect below runs
      },
    );

    return () => cy.destroy();
  }, []);

  // hover-handle edge drawing only live while the toolbar is in 'add-transition' mode
  useEffect(() => {
    const eh = ehRef.current;
    if (!eh) return;
    if (editMode === "add-transition") eh.enable();
    else eh.disable();
  }, [editMode]);

  // states/transitions are the single source of truth; re-sync on every change
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().remove();
    cy.add(
      states.map((s) => ({
        data: { id: s.id },
        position: { x: s.x, y: s.y },
        classes: [s.accept ? "accept" : "", s.id === startState ? "start" : ""]
          .filter(Boolean)
          .join(" "),
      })),
    );
    cy.add(
      transitions.map((t) => ({
        data: {
          id: t.id,
          source: t.source,
          target: t.target,
          label: edgeLabel(t),
        },
      })),
    );
  }, [states, transitions, startState]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.nodes().removeClass("active");
    if (activeState) cy.getElementById(activeState).addClass("active");
  }, [activeState]);

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[500px] w-full border border-gray-300 dark:border-gray-700"
    />
  );
});
