import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Stack,
  ScrollArea,
  Group,
  ActionIcon,
  NumberInput,
  Collapse,
  Tooltip,
  Chip,
  Button,
} from "@mantine/core";
import { IconMathFunction, IconArrowRight } from "@tabler/icons-react";
import { MAX_TAPE_COUNT } from "../config/automatonModes";
import type {
  AutomatonState,
  AutomatonTransition,
  EditMode,
  ModeId,
} from "../types/automaton";
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
import { useSimulation } from "../hooks/useSimulation";

type PanelId = "graph" | "tape" | "formalDefinition" | "transitionTable";

/** TM's primary view is the tape(s), so its graph starts collapsed — everything
 *  else defaults visible. Each mode gets a fresh instance of this (see the
 *  key={mode} on AppLayout's Outlet), so this only ever runs once per mode. */
function defaultPanels(modeId: ModeId): PanelId[] {
  return modeId === "tm"
    ? ["tape", "formalDefinition", "transitionTable"]
    : ["graph", "formalDefinition", "transitionTable"];
}

interface GraphHandoff {
  states: AutomatonState[];
  transitions: AutomatonTransition[];
  startState?: string;
}

export default function Workspace() {
  const { mode = "dfa" } = useParams<{ mode: ModeId }>();
  const modeId = mode as ModeId;
  const sim = useSimulation(modeId);
  const navigate = useNavigate();
  const location = useLocation();

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
  const [visiblePanels, setVisiblePanels] = useState<PanelId[]>(() =>
    defaultPanels(modeId),
  );

  const [asidePortal, setAsidePortal] = useState<HTMLElement | null>(null);
  const [footerPortal, setFooterPortal] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setAsidePortal(document.getElementById("aside-portal"));
    setFooterPortal(document.getElementById("footer-portal"));
  }, []);

  // Picks up a graph handed off by a cross-mode conversion (see handleConvertToDfa
  // below), loads it once, then clears the handoff so refreshing this page or
  // navigating away and back doesn't reapply stale state.
  useEffect(() => {
    const incoming = (location.state as { graph?: GraphHandoff } | null)?.graph;
    if (incoming) {
      sim.loadGraph(incoming);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, []);

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

  const handleGenerateFromRegex = () => {
    // TODO: call @schismata/core's Thompson's-construction once it exists, then
    // sim.loadGraph(result).
  };

  const handleConvertToDfa = () => {
    // TODO: run @schismata/core's subset construction on { sim.states,
    // sim.transitions, sim.startState } and pass *that* result below — this
    // stays disabled until then rather than navigating with the raw NFA graph,
    // which would land on /dfa still nondeterministic and look done when it isn't.
    navigate("/dfa", {
      state: {
        graph: {
          states: sim.states,
          transitions: sim.transitions,
          startState: sim.startState,
        },
      },
    });
  };

  return (
    <Stack h="100%" gap="xs">
      <Group gap="xs" wrap="wrap" justify="space-between">
        <Chip.Group
          multiple
          value={visiblePanels}
          onChange={(v) => setVisiblePanels(v as PanelId[])}
        >
          <Group gap={6}>
            {panelOptions.map((o) => (
              <Chip key={o.value} value={o.value} size="xs">
                {o.label}
              </Chip>
            ))}
          </Group>
        </Chip.Group>

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
              onChange={(v) => sim.setTapeCount(typeof v === "number" ? v : 1)}
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

      {visiblePanels.includes("graph") && (
        <>
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
        </>
      )}

      {modeId === "tm" && visiblePanels.includes("tape") && (
        <TapeView
          tapes={sim.tapes}
          heads={sim.heads}
          editable={sim.status === "idle"}
          onEditTape={sim.setTapeContent}
        />
      )}

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

      {asidePortal &&
        createPortal(
          <ScrollArea h="100%">
            <Stack gap="lg">
              {visiblePanels.includes("formalDefinition") && (
                <FormalDefinition
                  modeId={modeId}
                  tapeCount={sim.tapeCount}
                  states={sim.states}
                  transitions={sim.transitions}
                  startState={sim.startState}
                />
              )}
              {visiblePanels.includes("transitionTable") && (
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
              )}
            </Stack>
          </ScrollArea>,
          asidePortal,
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
  );
}
