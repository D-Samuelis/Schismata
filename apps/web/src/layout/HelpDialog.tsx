// apps/web/src/layout/HelpDialog.tsx

import { Modal, Text } from "@mantine/core";
import { useCommandStore } from "../commands/commandStore";

export type HelpView = "about" | "shortcuts";

export function HelpDialog({
  view,
  onClose,
}: {
  view: HelpView | null;
  onClose: () => void;
}) {
  const commands = useCommandStore((s) => s.commands);
  const withShortcut = Object.values(commands).filter((c) => c.shortcut);

  return (
    <Modal
      opened={view !== null}
      onClose={onClose}
      title={view === "shortcuts" ? "Keyboard Shortcuts" : "About Schismata"}
      centered
    >
      {view === "about" && (
        <Text size="sm">
          Schismata is a visual sandbox for formal language theory: build and
          simulate DFAs, NFAs and Turing machines step by step.
        </Text>
      )}
      {view === "shortcuts" && (
        <table className="w-full text-sm">
          <tbody>
            {withShortcut.map((c) => (
              <tr key={c.id} className="border-b border-[var(--sc-border)]">
                <td className="py-1.5">{c.label}</td>
                <td className="py-1.5 text-right font-mono text-xs text-[var(--sc-muted-foreground)]">
                  {c.shortcut}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
}
