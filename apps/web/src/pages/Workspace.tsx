// apps/web/src/pages/Workspace.tsx

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Collapse } from "@mantine/core";
import {
  DockviewReact,
  type DockviewReadyEvent,
  type DockviewTheme,
  type DockviewApi,
} from "dockview-react";
import "dockview-react/dist/styles/dockview.css";

import {
  PANEL_TITLES,
  defaultPanels,
  loadLayout,
  saveLayout,
  buildDefaultLayout,
} from "../config/workspaceLayout";
import type { PanelId } from "../config/workspaceLayout";
import type { EditMode, ModeId } from "../types/automaton";
import type { AutomatonGraphHandle } from "../components/AutomatonGraph/AutomatonGraph";
import { StateContextMenu } from "../components/AutomatonGraph/StateContextMenu";
import { RegexEditor } from "../components/RegexEditor/RegexEditor";
import { SimulationControls } from "../components/SimulationControls/SimulationControls";
import { WorkspaceToolbar } from "../components/WorkspaceToolbar/WorkspaceToolbar";
import { PANEL_COMPONENTS } from "../components/WorkspacePanels/WorkspacePanels";
import { WorkspaceContext } from "../context/WorkspaceContext";
import { useDfaStore, useNfaStore, useTmStore } from "../store/stores";
import { useAutomatonTemporal } from "../hooks/useAutomatonTemporal";
import { useSashDoubleClick } from "../hooks/useSashDoubleClick";
import { useWorkspaceCommands } from "../commands/useWorkspaceCommands";
import type { AutomatonStore } from "../store/createAutomatonStore";

const schismataDockTheme: DockviewTheme = {
  name: "schismata",
  className: "dockview-theme-dark dockview-theme-schismata",
};

// Subscribing to an inactive mode's store would re-render Workspace on every
// keystroke in a page the user isn't looking at; INERT short-circuits that.
const INERT = {} as AutomatonStore;
const activeSelector = (s: AutomatonStore) => s;
const inertSelector = () => INERT;

export default function Workspace() {
  const { mode = "dfa" } = useParams<{ mode: ModeId }>();
  const modeId = mode as ModeId;
  const navigate = useNavigate();

  const dfa = useDfaStore(modeId === "dfa" ? activeSelector : inertSelector);
  const nfa = useNfaStore(modeId === "nfa" ? activeSelector : inertSelector);
  const tm = useTmStore(modeId === "tm" ? activeSelector : inertSelector);
  const sim = modeId === "dfa" ? dfa : modeId === "nfa" ? nfa : tm;
  const activeStore =
    modeId === "dfa"
      ? useDfaStore
      : modeId === "nfa"
        ? useNfaStore
        : useTmStore;
  const { undo, redo, canUndo, canRedo } = useAutomatonTemporal(activeStore);

  const graphRef = useRef<AutomatonGraphHandle>(null);
  const [editMode, setEditMode] = useState<EditMode>("select");
  const [menu, setMenu] = useState<{
    id: string;
    kind: "node" | "edge";
    x: number;
    y: number;
  } | null>(null);
  const [regexOpen, setRegexOpen] = useState(false);
  const [regexPattern, setRegexPattern] = useState("");

  const [openPanels, setOpenPanels] = useState<PanelId[]>(() =>
    defaultPanels(modeId),
  );
  const apiRef = useRef<DockviewApi | null>(null);

  const dockHostRef = useRef<HTMLDivElement>(null);
  useSashDoubleClick(dockHostRef, apiRef);

  // The run bar lives in AppLayout. Looking it up during render returns null on
  // the first pass (the parent's DOM isn't committed yet), so resolve it in an effect.
  const [footerPortal, setFooterPortal] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setFooterPortal(document.getElementById("footer-portal"));
  }, []);

  const handleDockviewReady = (event: DockviewReadyEvent) => {
    const api = event.api;
    apiRef.current = api;

    const saved = loadLayout(modeId);
    if (saved) {
      api.fromJSON(saved as never);
    } else {
      buildDefaultLayout(api, modeId);
    }
    setOpenPanels(api.panels.map((p) => p.id as PanelId));

    api.onDidLayoutChange(() => {
      saveLayout(modeId, api.toJSON());
      setOpenPanels(api.panels.map((p) => p.id as PanelId));
    });
  };

  const togglePanel = (id: PanelId, shouldBeOpen: boolean) => {
    const api = apiRef.current;
    if (!api) return;
    const existing = api.getPanel(id);
    if (shouldBeOpen && !existing) {
      const active = api.activePanel;
      api.addPanel({
        id,
        component: id,
        title: PANEL_TITLES[id],
        position: active
          ? { referencePanel: active.id, direction: "within" }
          : undefined,
      });
    } else if (!shouldBeOpen && existing) {
      existing.api.close();
    }
  };

  const resetLayout = () => {
    const api = apiRef.current;
    if (!api) return;
    api.clear();
    buildDefaultLayout(api, modeId);
    setOpenPanels(api.panels.map((p) => p.id as PanelId));
  };

  const handleGenerateFromRegex = () => {
    // TODO: call @schismata/core's Thompson's-construction once it exists, then
    // sim.loadGraph(result) — the panel and graph are already wired for it.
  };

  const handleConvertToDfa = () => {
    useDfaStore.getState().loadGraph({
      states: nfa.states,
      transitions: nfa.transitions,
      startState: nfa.startState,
    });
    navigate("/dfa");
  };

  // Feeds the menu bar and keyboard shortcuts.
  useWorkspaceCommands({
    modeId,
    sim,
    editMode,
    setEditMode,
    canUndo,
    canRedo,
    undo,
    redo,
    openPanels,
    togglePanel,
    regexOpen,
    toggleRegex: () => setRegexOpen((v) => !v),
    resetLayout,
  });

  return (
    <WorkspaceContext.Provider
      value={{ modeId, sim, editMode, setEditMode, graphRef, setMenu }}
    >
      <div className="flex h-full min-h-0 flex-col">
        <WorkspaceToolbar
          modeId={modeId}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          regexOpen={regexOpen}
          onToggleRegex={() => setRegexOpen((v) => !v)}
          onConvertToDfa={handleConvertToDfa}
          tapeCount={sim.tapeCount}
          onTapeCountChange={sim.setTapeCount}
        />

        {modeId === "nfa" && (
          <Collapse expanded={regexOpen}>
            <RegexEditor
              pattern={regexPattern}
              onPatternChange={setRegexPattern}
              onGenerate={handleGenerateFromRegex}
            />
          </Collapse>
        )}

        <div className="workspace-dockview" ref={dockHostRef}>
          <DockviewReact
            className="workspace-dockview-inner"
            theme={schismataDockTheme}
            components={PANEL_COMPONENTS}
            onReady={handleDockviewReady}
          />
        </div>

        {menu && (
          <StateContextMenu
            {...menu}
            onClose={() => setMenu(null)}
            onSetStart={() => sim.setStartState(menu.id)}
            onToggleAccept={() => sim.toggleAccept(menu.id)}
            onAddTransitionFrom={() => {
              setEditMode("add-transition");
              // edgehandles is only enabled by an effect after this state change
              // commits; wait a frame so start() doesn't hit a disabled instance.
              requestAnimationFrame(() =>
                graphRef.current?.startTransitionFrom(menu.id),
              );
            }}
            onRename={() => {
              const next = window.prompt("New name:", menu.id);
              if (next) sim.renameState(menu.id, next);
            }}
            onDelete={() => sim.deleteElement(menu.id)}
          />
        )}

        {footerPortal &&
          createPortal(
            <SimulationControls
              status={sim.status}
              input={sim.input}
              onInputChange={sim.setInput}
              onStep={sim.step}
              onPlay={sim.play}
              onPause={sim.pause}
              onReset={sim.reset}
              speed={sim.speed}
              onSpeedChange={sim.setSpeed}
            />,
            footerPortal,
          )}
      </div>
    </WorkspaceContext.Provider>
  );
}
