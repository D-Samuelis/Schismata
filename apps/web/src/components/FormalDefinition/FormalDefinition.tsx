import { Paper, Stack, Text, Title } from "@mantine/core";
import type {
  AutomatonState,
  AutomatonTransition,
  ModeId,
} from "../../types/automaton";
import { isTM, BLANK_SYMBOL } from "../../types/automaton";

interface FormalDefinitionProps {
  modeId: ModeId;
  tapeCount: number;
  states: AutomatonState[];
  transitions: AutomatonTransition[];
  startState?: string;
}

export function FormalDefinition({
  modeId,
  tapeCount,
  states,
  transitions,
  startState,
}: FormalDefinitionProps) {
  const Q = states.map((s) => s.id).join(", ") || "∅";
  const F =
    states
      .filter((s) => s.accept)
      .map((s) => s.id)
      .join(", ") || "∅";
  const tm = isTM(modeId);

  // Simplification: Σ is every read symbol across every tape. For a TM whose
  // input really only lives on tape 1, you may want to narrow this to
  // transitions.map(t => t.reads[0]) instead — left broad for now since the
  // arithmetic TM's tape layout isn't locked in yet.
  const inputSymbols = new Set<string>();
  transitions.forEach((t) =>
    t.reads.forEach((r) => r !== BLANK_SYMBOL && inputSymbols.add(r)),
  );
  const sigma = [...inputSymbols].join(", ") || "∅";

  if (!tm) {
    return (
      <Paper withBorder p="md">
        <Title order={5} mb="sm">
          Formal Definition
        </Title>
        <Stack gap={4} ff="monospace">
          <Text size="sm">M = (Q, Σ, δ, q₀, F)</Text>
          <Text size="sm">
            Q = {"{"}
            {Q}
            {"}"}
          </Text>
          <Text size="sm">
            Σ = {"{"}
            {sigma}
            {"}"}
          </Text>
          <Text size="sm">q₀ = {startState ?? "—"}</Text>
          <Text size="sm">
            F = {"{"}
            {F}
            {"}"}
          </Text>
        </Stack>
      </Paper>
    );
  }

  // Tape alphabet Γ ⊇ Σ, plus every written symbol, plus the blank.
  const tapeSymbols = new Set(inputSymbols);
  transitions.forEach((t) => t.writes?.forEach((w) => tapeSymbols.add(w)));
  tapeSymbols.add(BLANK_SYMBOL);
  const gamma = [...tapeSymbols].join(", ");

  return (
    <Paper withBorder p="md">
      <Title order={5} mb="sm">
        Formal Definition
      </Title>
      <Stack gap={4} ff="monospace">
        <Text size="sm">
          M = (Q, Σ, Γ, δ, q₀, {BLANK_SYMBOL}, F)
          {tapeCount > 1 ? `   [k = ${tapeCount} tapes]` : ""}
        </Text>
        <Text size="sm">
          Q = {"{"}
          {Q}
          {"}"}
        </Text>
        <Text size="sm">
          Σ = {"{"}
          {sigma}
          {"}"}
        </Text>
        <Text size="sm">
          Γ = {"{"}
          {gamma}
          {"}"}
        </Text>
        <Text size="sm">q₀ = {startState ?? "—"}</Text>
        <Text size="sm">
          F = {"{"}
          {F}
          {"}"}
        </Text>
      </Stack>
    </Paper>
  );
}
