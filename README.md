# Schismata

A sandbox and visual builder for formal language theory — construct, simulate, and transform between **Deterministic Finite Automata (DFA)**, **Nondeterministic Finite Automata (NFA)**, **Regular Expressions**, and **Turing Machines (TM)**.

Built as part of an engineering thesis, with the eventual goal of constructing Turing machines that perform basic arithmetic operations.

## What this is

Schismata lets you:

- **Build** DFAs, NFAs, regular expressions, and Turing machines through a visual editor
- **Simulate** any of them step-by-step against an input string, watching state transitions (or tape contents, for TMs) update live
- **Transform** between representations:
  - NFA → DFA (subset construction)
  - DFA minimization (Hopcroft's / Moore's algorithm)
  - Regex → NFA (Thompson's construction)
  - DFA → Regex (state elimination)
  - Set operations on automata: union, intersection, complement
  - DFA equivalence checking
- **Export/import** automata and machines as JSON for saving, sharing, or reloading

The long-term goal is to use the Turing machine builder to construct working machines for arithmetic (addition, multiplication, etc.), using the DFA/NFA/regex tooling as supporting infrastructure and teaching aids along the way.

## Repository structure

This is a **pnpm workspace monorepo** — one repo, multiple independently manageable packages.

```
schismata/
├── packages/
│   └── core/                  → @schismata/core (published npm package)
│       ├── src/
│       │   ├── models/        → data structures: DFA, NFA, TM, Regex AST
│       │   ├── algorithms/    → transformations between models
│       │   ├── simulate/      → step-by-step execution (generator-based)
│       │   └── serialize/     → JSON import/export schema
│       └── tests/
│
└── apps/
    └── web/                   → @schismata/web (the visual sandbox, not published)
        └── src/                  React + TypeScript app, built with Vite
```

### Why this split

`@schismata/core` contains **all** automata theory logic and has **zero UI dependencies** — no React, no DOM, nothing browser-specific. It's a pure TypeScript library: given a DFA, minimize it; given an NFA, simulate it; given a regex, convert it. It can be used standalone from Node.js, tested independently, and is intended to be published to npm on its own.

`@schismata/web` is the visual layer. It renders automata as interactive diagrams (via Cytoscape.js), provides editors for building them, and drives simulation playback (play/pause/step/speed) — but contains no automata theory itself. Every actual computation is delegated to `@schismata/core`.

This separation means the "hard part" (implementing correct algorithms) is decoupled from the "visual part" (making them nice to interact with), and the core logic remains reusable outside this specific app.

## Core concepts and how they map to the code

| Concept | Model | Simulated in | Transformed in |
|---|---|---|---|
| DFA | `models/dfa.ts` | `simulate/dfa-run.ts` | `algorithms/minimize-dfa.ts`, `algorithms/dfa-to-regex.ts`, etc. |
| NFA (incl. ε-transitions) | `models/nfa.ts` | `simulate/nfa-run.ts` | `algorithms/nfa-to-dfa.ts` |
| Regex | `models/regex-ast.ts` | *(simulated via conversion to NFA)* | `algorithms/regex-to-nfa.ts` |
| Turing Machine | `models/turing-machine.ts` | `simulate/tm-run.ts` | — |

Regular expressions are not simulated directly; a regex is converted to an NFA via Thompson's construction, and the existing NFA simulator runs it. This mirrors the theoretical relationship between the two (regular expressions and NFAs are equivalent in expressive power) rather than reimplementing matching logic separately.

Simulators are implemented as **generators** (`function*`), yielding one step of execution at a time. This lets the UI control playback — step forward, step back, play at a chosen speed — without any of that logic living in the simulation code itself.

## Tech stack

- **Language:** TypeScript (strict mode) throughout
- **Package management:** pnpm workspaces
- **Core library:** plain TypeScript, no runtime dependencies, tested with Vitest
- **Web app:** React + Vite
- **Diagram rendering:** Cytoscape.js (graph layout, multi-edge/self-loop handling)
- **Linting:** ESLint with `typescript-eslint`, using type-aware rules on `core` for correctness

## Getting started

```bash
pnpm install
pnpm dev          # starts the web app dev server
pnpm test         # runs tests across all packages
pnpm build        # builds all packages
```

## Status

🚧 Early development. Currently scaffolding the core DFA model, simulator, and test suite before layering NFA, regex, and Turing machine support on top.

## License

MIT
