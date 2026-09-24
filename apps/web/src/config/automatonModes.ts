import { IconGraph, IconBinaryTree, IconCpu } from "@tabler/icons-react";
import type { ModeConfig, ModeId } from "../types/automaton";

export const AUTOMATON_MODES: Record<ModeId, ModeConfig> = {
  dfa: { label: "DFA", icon: IconGraph },
  nfa: { label: "NFA", icon: IconBinaryTree },
  // Covers the classic 1-tape TM as well as multi-tape constructions (e.g. the
  // arithmetic TMs, which need extra operand/output tapes) — tape count is
  // adjustable on the page itself, see the tape-count control in Workspace.
  tm: { label: "Turing Machines", icon: IconCpu },
};

/** Default tape count when a TM page first mounts. */
export const DEFAULT_TM_TAPE_COUNT = 1;
export const MAX_TAPE_COUNT = 4;
