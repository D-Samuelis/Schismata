// apps/web/src/commands/commandStore.ts

import { create } from "zustand";

export interface Command {
  id: string;
  label: string;
  shortcut?: string;
  run: () => void;
  enabled?: boolean;
  checked?: boolean;
}

interface CommandStore {
  commands: Record<string, Command>;
  register: (cmds: Command[]) => void;
  unregister: (ids: string[]) => void;
}

export const useCommandStore = create<CommandStore>()((set) => ({
  commands: {},
  register: (cmds) =>
    set((s) => ({
      commands: {
        ...s.commands,
        ...Object.fromEntries(cmds.map((c) => [c.id, c])),
      },
    })),
  unregister: (ids) =>
    set((s) => {
      const next = { ...s.commands };
      ids.forEach((id) => delete next[id]);
      return { commands: next };
    }),
}));
