// apps/web/src/context/WorkspaceContext.tsx

import {
  createContext,
  useContext,
  type ReactNode,
  type RefObject,
} from "react";
import type { EditMode, ModeId } from "../types/automaton";
import type { AutomatonGraphHandle } from "../components/AutomatonGraph/AutomatonGraph";
import type { AutomatonStore } from "../store/createAutomatonStore";

export interface WorkspaceCtx {
  modeId: ModeId;
  sim: AutomatonStore;
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  graphRef: RefObject<AutomatonGraphHandle | null>;
  setMenu: (
    m: { id: string; kind: "node" | "edge"; x: number; y: number } | null,
  ) => void;
}

export const WorkspaceContext = createContext<WorkspaceCtx | null>(null);

export function useWorkspace(): WorkspaceCtx {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error(
      "Panel component rendered outside <WorkspaceContext.Provider> — dockview " +
        "must be mounted inside the Workspace component that provides it.",
    );
  }
  return ctx;
}

// Scroll + padding wrapper for panels that don't bring their own chrome.
export function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ height: "100%", overflow: "auto", padding: 8 }}>
      {children}
    </div>
  );
}
