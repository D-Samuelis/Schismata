// apps/web/src/config/automatonModes.ts

import { IconGraph, IconBinaryTree, IconCpu } from "@tabler/icons-react";
import type { ModeConfig, ModeId } from "../types/automaton";

export const AUTOMATON_MODES: Record<ModeId, ModeConfig> = {
  dfa: { label: "DFA", icon: IconGraph },
  nfa: { label: "NFA", icon: IconBinaryTree },
  tm: { label: "Turing Machines", icon: IconCpu },
};

// Default tape count when a TM page first mounts.
export const DEFAULT_TM_TAPE_COUNT = 1;
export const MAX_TAPE_COUNT = 4;
