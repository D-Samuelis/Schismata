// apps/web/src/pages/Workspace.tsx

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import {
  Stack,
  Group,
  ActionIcon,
  NumberInput,
  Collapse,
  Tooltip,
  Chip,
  Button,
} from "@mantine/core";
import {
  IconMathFunction,
  IconArrowRight,
  IconArrowBackUp,
  IconArrowForwardUp,
} from "@tabler/icons-react";
import {
  DockviewReact,
  type DockviewReadyEvent,
  type DockviewTheme,
  type DockviewApi,
} from "dockview-react";
import "dockview-react/dist/styles/dockview.css";

const schismataDockTheme: DockviewTheme = {
  name: "schismata",
  className: "dockview-theme-dark dockview-theme-schismata",
};
import { MAX_TAPE_COUNT } from "../config/automatonModes";
import type { EditMode, ModeId } from "../types/automaton";
import {
  AutomatonGraph,
  type AutomatonGraphHandle,
} from "../components/AutomatonGraph/AutomatonGraph";
import { StateContextMenu } from "../components/AutomatonGraph/StateContextMenu";
import { EditorToolbar } from "../components/EditorToolbar/EditorToolbar";
import { RegexEditor } from "../components/RegexEditor/RegexEditor";
import { FormalDefinition } from "../components/FormalDefinition/FormalDefinition";
import { TransitionTable } from "../components/TransitionTable/TransitionTable";
import { TapeView } from "../components/TapeView/TapeView";
import { SimulationControls } from "../components/SimulationControls/SimulationControls";
import { useDfaStore, useNfaStore, useTmStore } from "../store/stores";
import { useAutomatonTemporal } from "../hooks/useAutomatonTemporal";
import type { AutomatonStore } from "../store/createAutomatonStore";

type PanelId = "graph" | "tape" | "formalDefinition" | "transitionTable";

const PANEL_TITLES: Record<PanelId, string> = {
  graph: "Graph",
  tape: "Tape",
  formalDefinition: "Formal Definition",
  transitionTable: "Transitions",
};

interface DefaultPanelSpec {
  id: PanelId;
  relativeTo?: PanelId;
  direction?: "left" | "right" | "above" | "below" | "within";
  initialWidth?: number;
  initialHeight?: number;
}

const DEFAULT_LAYOUTS: Record<ModeId, DefaultPanelSpec[]> = {
  tm: [
    { id: "tape", initialHeight: 220 },
    { id: "formalDefinition", relativeTo: "tape", direction: "below" },
    {
      id: "transitionTable",
      relativeTo: "formalDefinition",
      direction: "right",
      initialWidth: 480,
    },
  ],
  dfa: [
    { id: "graph", initialWidth: 900 },
    { id: "formalDefinition", relativeTo: "graph", direction: "right" },
    {
      id: "transitionTable",
      relativeTo: "formalDefinition",
      direction: "below",
      initialHeight: 320,
    },
  ],
  nfa: [
    { id: "graph", initialWidth: 900 },
    { id: "formalDefinition", relativeTo: "graph", direction: "right" },
    {
      id: "transitionTable",
      relativeTo: "formalDefinition",
      direction: "below",
      initialHeight: 320,
    },
  ],
};

function defaultPanels(modeId: ModeId): PanelId[] {
  return DEFAULT_LAYOUTS[modeId].map((p) => p.id);
}

interface WorkspaceCtx {
  modeId: ModeId;
  sim: AutomatonStore;
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  // useRef<T>(null) types as RefObject<T | null> in modern React types —
  // AutomatonGraph's own ref prop already accepts this shape.
  graphRef: RefObject<AutomatonGraphHandle | null>;
  setMenu: (
    m: { id: string; kind: "node" | "edge"; x: number; y: number } | null,
  ) => void;
}
const WorkspaceContext = createContext<WorkspaceCtx | null>(null);
function useWorkspace(): WorkspaceCtx {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error(
      "Panel component rendered outside <WorkspaceContext.Provider> — dockview " +
        "must be mounted inside the Workspace component that provides it.",
    );
  }
  return ctx;
}

function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ height: "100%", overflow: "auto", padding: 8 }}>
      {children}
    </div>
  );
}

function GraphPanel() {
  const { sim, editMode, setEditMode, graphRef, setMenu } = useWorkspace();
  return (
    <Stack gap="xs" h="100%" p={8}>
      <EditorToolbar mode={editMode} onModeChange={setEditMode} />
      <AutomatonGraph
        ref={graphRef}
        states={sim.states}
        transitions={sim.transitions}
        activeState={sim.currentState}
        startState={sim.startState}
        editMode={editMode}
        onAddState={sim.addState}
        onMoveState={sim.moveState}
        onAddTransition={sim.addTransition}
        onToggleAccept={sim.toggleAccept}
        onDeleteElement={sim.deleteElement}
        onContextMenu={(id, kind, x, y) => setMenu({ id, kind, x, y })}
      />
    </Stack>
  );
}

function TapePanel() {
  const { sim } = useWorkspace();
  return (
    <PanelShell>
      <TapeView
        tapes={sim.tapes}
        heads={sim.heads}
        editable={sim.status === "idle"}
        onEditTape={sim.setTapeContent}
      />
    </PanelShell>
  );
}

function FormalDefinitionPanel() {
  const { modeId, sim } = useWorkspace();
  return (
    <PanelShell>
      <FormalDefinition
        modeId={modeId}
        tapeCount={sim.tapeCount}
        states={sim.states}
        transitions={sim.transitions}
        startState={sim.startState}
      />
    </PanelShell>
  );
}

function TransitionTablePanel() {
  const { modeId, sim } = useWorkspace();
  return (
    <PanelShell>
      <TransitionTable
        modeId={modeId}
        tapeCount={sim.tapeCount}
        states={sim.states}
        transitions={sim.transitions}
        onRenameState={sim.renameState}
        onDeleteState={sim.deleteElement}
        onUpdateTransition={sim.updateTransition}
        onDeleteTransition={sim.deleteElement}
      />
    </PanelShell>
  );
}

const PANEL_COMPONENTS: Record<PanelId, React.FC> = {
  graph: GraphPanel,
  tape: TapePanel,
  formalDefinition: FormalDefinitionPanel,
  transitionTable: TransitionTablePanel,
};

function layoutStorageKey(modeId: ModeId) {
  return `schismata-layout-${modeId}`;
}

function loadLayout(modeId: ModeId): unknown | null {
  try {
    const raw = localStorage.getItem(layoutStorageKey(modeId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLayout(modeId: ModeId, layout: unknown) {
  try {
    localStorage.setItem(layoutStorageKey(modeId), JSON.stringify(layout));
  } catch {
    // localStorage full/unavailable — layout just won't persist this session,
    // nothing else depends on this write succeeding.
  }
}

function buildDefaultLayout(api: DockviewApi, modeId: ModeId) {
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

  for (const spec of specs) {
    if (spec.initialWidth == null && spec.initialHeight == null) continue;
    api.getPanel(spec.id)?.api.setSize({
      width: spec.initialWidth,
      height: spec.initialHeight,
    });
  }
}

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

  const footerPortal = document.getElementById("footer-portal");

  const panelOptions: { value: PanelId; label: string }[] =
    modeId === "tm"
      ? [
          { value: "graph", label: "Graph" },
          { value: "tape", label: "Tape" },
          { value: "formalDefinition", label: "Formal Definition" },
          { value: "transitionTable", label: "Transitions" },
        ]
      : [
          { value: "graph", label: "Graph" },
          { value: "formalDefinition", label: "Formal Definition" },
          { value: "transitionTable", label: "Transitions" },
        ];

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

  return (
    <WorkspaceContext.Provider
      value={{ modeId, sim, editMode, setEditMode, graphRef, setMenu }}
    >
      <Stack h="100%" gap="xs">
        <Group gap="xs" wrap="wrap" justify="space-between">
          <Group gap="xs">
            <Chip.Group
              multiple
              value={openPanels}
              onChange={(v) => {
                const next = v as PanelId[];
                panelOptions.forEach((o) =>
                  togglePanel(o.value, next.includes(o.value)),
                );
              }}
            >
              <Group gap={6}>
                {panelOptions.map((o) => (
                  <Chip key={o.value} value={o.value} size="xs">
                    {o.label}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>
            <Tooltip label="Undo">
              <ActionIcon
                variant="default"
                size="lg"
                disabled={!canUndo}
                onClick={() => undo()}
              >
                <IconArrowBackUp size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Redo">
              <ActionIcon
                variant="default"
                size="lg"
                disabled={!canRedo}
                onClick={() => redo()}
              >
                <IconArrowForwardUp size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <Group gap="xs">
            {modeId === "nfa" && (
              <>
                <Tooltip label="Generate from regular expression">
                  <ActionIcon
                    variant={regexOpen ? "filled" : "default"}
                    size="lg"
                    onClick={() => setRegexOpen((v) => !v)}
                  >
                    <IconMathFunction size={18} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Needs @schismata/core's subset construction — not implemented yet">
                  <Button
                    variant="light"
                    rightSection={<IconArrowRight size={16} />}
                    disabled
                    onClick={handleConvertToDfa}
                  >
                    Convert to DFA
                  </Button>
                </Tooltip>
              </>
            )}
            {modeId === "tm" && (
              <NumberInput
                label="Tapes"
                value={sim.tapeCount}
                onChange={(v) =>
                  sim.setTapeCount(typeof v === "number" ? v : 1)
                }
                min={1}
                max={MAX_TAPE_COUNT}
                w={90}
              />
            )}
          </Group>
        </Group>

        {modeId === "nfa" && (
          <Collapse expanded={regexOpen}>
            <RegexEditor
              pattern={regexPattern}
              onPatternChange={setRegexPattern}
              onGenerate={handleGenerateFromRegex}
            />
          </Collapse>
        )}

        <div className="workspace-dockview">
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
              graphRef.current?.startTransitionFrom(menu.id);
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
      </Stack>
    </WorkspaceContext.Provider>
  );
}
