// apps/web/src/components/WorkspacePanels/WorkspacePanels.tsx

import type { PanelId } from "../../config/workspaceLayout";
import type { EditMode } from "../../types/automaton";
import { useWorkspace, PanelShell } from "../../context/WorkspaceContext";
import { AutomatonGraph } from "../AutomatonGraph/AutomatonGraph";
import { EditorToolbar } from "../EditorToolbar/EditorToolbar";
import { FormalDefinition } from "../FormalDefinition/FormalDefinition";
import { TransitionTable } from "../TransitionTable/TransitionTable";
import { TapeView } from "../TapeView/TapeView";

const MODE_HINT: Record<EditMode, string> = {
  select:
    "Drag states to move them. Double-click a state to toggle accepting. Right-click for more.",
  "add-state": "Click on the canvas to place a state.",
  "add-transition":
    "Drag from a state's handle onto another state (or itself) to add a transition.",
  delete: "Click a state or transition to delete it.",
};

function GraphPanel() {
  const { sim, editMode, setEditMode, graphRef, setMenu } = useWorkspace();
  return (
    <div className="relative h-full w-full">
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
      <div className="absolute left-3 top-3 z-10">
        <EditorToolbar mode={editMode} onModeChange={setEditMode} />
      </div>
      <div className="pointer-events-none absolute bottom-2 left-3 right-3 z-10 text-xs text-[var(--sc-muted-foreground)]">
        {MODE_HINT[editMode]}
      </div>
    </div>
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

export const PANEL_COMPONENTS: Record<PanelId, React.FC> = {
  graph: GraphPanel,
  tape: TapePanel,
  formalDefinition: FormalDefinitionPanel,
  transitionTable: TransitionTablePanel,
};
