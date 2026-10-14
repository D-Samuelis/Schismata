// apps/web/src/commands/useWorkspaceCommands.ts

import { useEffect, useRef } from "react";
import { PANEL_TITLES } from "../config/workspaceLayout";
import type { PanelId } from "../config/workspaceLayout";
import type { AutomatonStore } from "../store/createAutomatonStore";
import type { EditMode, ModeId } from "../types/automaton";
import { useCommandStore, type Command } from "./commandStore";

export interface WorkspaceCommandContext {
  modeId: ModeId;
  sim: AutomatonStore;
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  openPanels: PanelId[];
  togglePanel: (id: PanelId, shouldBeOpen: boolean) => void;
  regexOpen: boolean;
  toggleRegex: () => void;
  resetLayout: () => void;
}

const PANEL_IDS: PanelId[] = [
  "graph",
  "tape",
  "formalDefinition",
  "transitionTable",
  "states",
];

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Registers workspace commands in the global command store. Commands are looked up by id in the menu bar, toolbar, and keyboard shortcut handler.
 * @param ctx The current workspace state and actions.
 */
export function useWorkspaceCommands(ctx: WorkspaceCommandContext): void {
  const live = useRef(ctx);
  live.current = ctx;

  const register = useCommandStore((s) => s.register);
  const unregister = useCommandStore((s) => s.unregister);

  const { modeId, editMode, canUndo, canRedo, openPanels, regexOpen } = ctx;
  const status = ctx.sim.status;

  useEffect(() => {
    const L = () => live.current;
    type LoadArg = Parameters<AutomatonStore["loadGraph"]>[0];

    const tool = (
      id: string,
      label: string,
      mode: EditMode,
      key: string,
    ): Command => ({
      id: `tool.${id}`,
      label,
      shortcut: key,
      checked: editMode === mode,
      run: () => L().setEditMode(mode),
    });

    const panel = (id: PanelId): Command => ({
      id: `view.panel.${id}`,
      label: PANEL_TITLES[id],
      enabled: id !== "tape" || modeId === "tm",
      checked: openPanels.includes(id),
      run: () => L().togglePanel(id, !L().openPanels.includes(id)),
    });

    const cmds: Command[] = [
      {
        id: "file.new",
        label: "New Automaton",
        shortcut: "Alt+N",
        run: () => {
          if (!window.confirm("Clear the current automaton?")) return;
          L().sim.loadGraph({
            states: [],
            transitions: [],
            startState: undefined,
          } as unknown as LoadArg);
        },
      },
      {
        id: "file.import",
        label: "Open from JSON…",
        shortcut: "Ctrl+O",
        run: () => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".json,application/json";
          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            try {
              const data = JSON.parse(await file.text());
              if (
                !Array.isArray(data.states) ||
                !Array.isArray(data.transitions)
              )
                throw new Error("missing states/transitions");
              L().sim.loadGraph({
                states: data.states,
                transitions: data.transitions,
                startState: data.startState,
              } as LoadArg);
            } catch {
              window.alert("That file is not a valid Schismata automaton.");
            }
          };
          input.click();
        },
      },
      {
        id: "file.export",
        label: "Save as JSON…",
        shortcut: "Ctrl+S",
        run: () => {
          const { modeId: m, sim } = L();
          downloadJson(`${m}-automaton.json`, {
            format: "schismata",
            version: 1,
            mode: m,
            states: sim.states,
            transitions: sim.transitions,
            startState: sim.startState,
          });
        },
      },
      {
        id: "file.convertToDfa",
        label: "Convert NFA to DFA",
        // Mirrors the disabled toolbar button until @schismata/core.
        enabled: false,
        run: () => {},
      },

      {
        id: "edit.undo",
        label: "Undo",
        shortcut: "Ctrl+Z",
        enabled: canUndo,
        run: () => L().undo(),
      },
      {
        id: "edit.redo",
        label: "Redo",
        shortcut: "Ctrl+Shift+Z",
        enabled: canRedo,
        run: () => L().redo(),
      },

      tool("select", "Select", "select", "V"),
      tool("addState", "Add State", "add-state", "S"),
      tool("addTransition", "Add Transition", "add-transition", "T"),
      tool("delete", "Delete", "delete", "D"),

      ...PANEL_IDS.map(panel),
      {
        id: "view.regex",
        label: "Regular Expression Panel",
        enabled: modeId === "nfa",
        checked: regexOpen,
        run: () => L().toggleRegex(),
      },
      {
        id: "view.resetLayout",
        label: "Reset Layout",
        run: () => L().resetLayout(),
      },

      {
        id: "run.step",
        label: "Step",
        shortcut: "F10",
        enabled: status !== "running",
        run: () => L().sim.step(),
      },
      {
        id: "run.play",
        label: "Play",
        shortcut: "F5",
        enabled: status !== "running",
        run: () => L().sim.play(),
      },
      {
        id: "run.pause",
        label: "Pause",
        shortcut: "F6",
        enabled: status === "running",
        run: () => L().sim.pause(),
      },
      {
        id: "run.reset",
        label: "Reset",
        shortcut: "Shift+F5",
        run: () => L().sim.reset(),
      },
    ];

    register(cmds);
    return () => unregister(cmds.map((c) => c.id));
  }, [
    modeId,
    editMode,
    canUndo,
    canRedo,
    openPanels,
    regexOpen,
    status,
    register,
    unregister,
  ]);
}
