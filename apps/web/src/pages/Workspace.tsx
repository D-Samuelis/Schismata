import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import { Stack, ScrollArea } from "@mantine/core";
import { AUTOMATON_MODES } from "../config/automatonModes";
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
import { useSimulation } from "../hooks/useSimulation";

export default function Workspace() {
  const { mode = "dfa" } = useParams<{ mode: ModeId }>();
  const modeId = mode as ModeId;
  const config = AUTOMATON_MODES[modeId];
  const sim = useSimulation(modeId);

  const graphRef = useRef<AutomatonGraphHandle>(null);
  const [editMode, setEditMode] = useState<EditMode>("select");
  const [menu, setMenu] = useState<{
    id: string;
    kind: "node" | "edge";
    x: number;
    y: number;
  } | null>(null);
  const [regexPattern, setRegexPattern] = useState("");

  const asidePortal = document.getElementById("aside-portal");
  const footerPortal = document.getElementById("footer-portal");

  return (
    <Stack h="100%" gap="xs">
      {config.editorKind === "graph" ? (
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
      ) : (
        <>
          <RegexEditor
            pattern={regexPattern}
            onPatternChange={setRegexPattern}
          />
          <AutomatonGraph
            ref={graphRef}
            states={sim.states}
            transitions={sim.transitions}
            activeState={sim.currentState}
            startState={sim.startState}
            editMode="select"
            onAddState={() => {}}
            onMoveState={sim.moveState}
            onAddTransition={() => {}}
            onToggleAccept={() => {}}
            onDeleteElement={() => {}}
            onContextMenu={() => {}}
          />
        </>
      )}

      {config.tapeCount > 0 && (
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
              <FormalDefinition
                config={config}
                states={sim.states}
                transitions={sim.transitions}
                startState={sim.startState}
              />
              <TransitionTable
                config={config}
                states={sim.states}
                transitions={sim.transitions}
                onRenameState={sim.renameState}
                onDeleteState={sim.deleteElement}
                onUpdateTransition={sim.updateTransition}
                onDeleteTransition={sim.deleteElement}
              />
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
