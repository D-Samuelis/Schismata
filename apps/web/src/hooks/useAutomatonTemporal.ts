// apps/web/src/hooks/useAutomatonTemporal.ts

import { useStore } from "zustand";
import type { TemporalState } from "zundo";
import type {
  AutomatonStore,
  AutomatonStoreHook,
} from "../store/createAutomatonStore";

export function useAutomatonTemporal(store: AutomatonStoreHook) {
  const { undo, redo, clear, pastStates, futureStates } = useStore(
    store.temporal,
    (s: TemporalState<Partial<AutomatonStore>>) => s,
  );
  return {
    undo: () => undo(),
    redo: () => redo(),
    clear,
    canUndo: pastStates.length > 0,
    canRedo: futureStates.length > 0,
  };
}
