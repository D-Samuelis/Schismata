// apps/web/src/components/FormalDefinition/FormalDefinition.tsx

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
