// apps/web/src/components/TapeView/TapeViewDemo.tsx
//
// Fake Turing machine (binary increment)
// read -> write -> move animation and the state badge
//
//   q0: scan right over the digits; on blank step back left   -> q1
//   q1: 1 -> write 0, move left (carry), stay q1
//       0 or blank -> write 1, stay in place                  -> qAccept
//
// Example: 1011 -> 1100

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Group, Slider, Stack, Text, TextInput } from "@mantine/core";
import { BLANK_SYMBOL } from "../../types/automaton";
import { TapeView } from "./TapeView";
import { cellAt } from "./tapeConfig";

// ---- fake machine (REMOVE) -------------------------------------------------

type DemoState = "q0" | "q1" | "qAccept";

interface DemoConfig {
  tape: string[];
  head: number;
  state: DemoState;
}

interface DemoRun {
  cfg: DemoConfig;
  stepCount: number;
}

function initialRun(input: string): DemoRun {
  const digits = input.replace(/[^01]/g, "") || "1011";
  // One leading blank so a carry out of the top digit (111 -> 1000) has a cell to land in.
  return {
    cfg: { tape: [BLANK_SYMBOL, ...digits.split("")], head: 1, state: "q0" },
    stepCount: 0,
  };
}

/** One transition. Returns null when the machine has halted. */
function demoStep(c: DemoConfig): DemoConfig | null {
  if (c.state === "qAccept") return null;

  const read = cellAt(c.tape, c.head);
  const tape = [...c.tape]; // always a NEW array: the animation relies on identity changes
  const write = (symbol: string) => {
    while (tape.length <= c.head) tape.push(BLANK_SYMBOL);
    tape[c.head] = symbol;
  };

  if (c.state === "q0") {
    if (read === BLANK_SYMBOL) {
      write(BLANK_SYMBOL);
      return { tape, head: c.head - 1, state: "q1" };
    }
    write(read);
    return { tape, head: c.head + 1, state: "q0" };
  }

  // q1: propagate the carry
  if (read === "1") {
    write("0");
    return { tape, head: c.head - 1, state: "q1" };
  }
  write("1");
  return { tape, head: c.head, state: "qAccept" };
}

// ---- demo UI (REMOVE) ------------------------------------------------------

export function TapeViewDemo() {
  const [input, setInput] = useState("1011");
  const [run, setRun] = useState<DemoRun>(() => initialRun("1011"));
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(600);

  const done = run.cfg.state === "qAccept";

  // TapeView needs stable array identities between renders, so memoize them.
  const tapes = useMemo(() => [run.cfg.tape], [run.cfg]);
  const heads = useMemo(() => [run.cfg.head], [run.cfg]);

  const step = useCallback(() => {
    setRun((r) => {
      const next = demoStep(r.cfg);
      return next ? { cfg: next, stepCount: r.stepCount + 1 } : r;
    });
  }, []);

  const reset = useCallback(() => {
    setPlaying(false);
    setRun(initialRun(input));
  }, [input]);

  // auto-play: wait for the animation to finish (+ a small pause), then step again
  useEffect(() => {
    if (!playing) return;
    if (done) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(step, speedMs + 150);
    return () => clearTimeout(id);
  }, [playing, done, run, speedMs, step]);

  return (
    <Stack gap="sm">
      <TapeView
        tapes={tapes}
        heads={heads}
        state={run.cfg.state}
        status={done ? "accept" : "running"}
        stepCount={run.stepCount}
        speedMs={speedMs}
      />

      <Group gap="xs">
        <Button size="xs" onClick={() => setPlaying((p) => !p)} disabled={done}>
          {playing ? "Pause" : "Play"}
        </Button>
        <Button
          size="xs"
          variant="default"
          onClick={step}
          disabled={done || playing}
        >
          Step
        </Button>
        <Button size="xs" variant="default" onClick={reset}>
          Reset
        </Button>
        <TextInput
          size="xs"
          w={110}
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="binary input"
          aria-label="Binary input"
        />
      </Group>

      <div>
        <Text size="xs" c="dimmed">
          Step duration: {speedMs} ms (below 120 ms the tape just snaps)
        </Text>
        <Slider
          min={60}
          max={1500}
          step={10}
          value={speedMs}
          onChange={setSpeedMs}
          label={(v) => `${v} ms`}
        />
      </div>
    </Stack>
  );
}
