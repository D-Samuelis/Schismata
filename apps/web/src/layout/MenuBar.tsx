// apps/web/src/layout/MenuBar.tsx

import { useEffect, useMemo, useState } from "react";
import { useClickOutside } from "@mantine/hooks";
import { IconCheck, IconChevronRight } from "@tabler/icons-react";
import { buildMenus, type MenuItem } from "../config/menus";
import { useCommandStore, type Command } from "../commands/commandStore";

const ROW = "flex w-full items-center gap-2 px-3 py-[5px] text-left text-[13px]";

function Panel({
  items,
  commands,
  onDone,
  nested,
}: {
  items: MenuItem[];
  commands: Record<string, Command>;
  onDone: () => void;
  nested?: boolean;
}) {
  const [openSub, setOpenSub] = useState<number | null>(null);

  return (
    <div
      role="menu"
      className={`absolute z-[400] min-w-[260px] rounded-md border border-[var(--sc-border)] bg-[var(--sc-surface)] py-1 text-[var(--sc-foreground)] shadow-[0_8px_24px_rgba(0,0,0,0.35)] ${
        nested ? "left-full top-[-5px]" : "left-0 top-full"
      }`}
    >
      {items.map((item, i) => {
        if (item.type === "separator") {
          return (
            <div key={i} className="my-1 h-px bg-[var(--sc-border)]" />
          );
        }

        if (item.type === "submenu") {
          return (
            <div
              key={i}
              className="relative"
              onMouseEnter={() => setOpenSub(i)}
            >
              <button
                type="button"
                role="menuitem"
                aria-haspopup="menu"
                className={`${ROW} ${
                  openSub === i
                    ? "bg-[var(--sc-accent)] text-[var(--sc-accent-foreground)]"
                    : ""
                }`}
              >
                <span className="w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <IconChevronRight size={14} />
              </button>
              {openSub === i && (
                <Panel
                  nested
                  items={item.items}
                  commands={commands}
                  onDone={onDone}
                />
              )}
            </div>
          );
        }

        const cmd = commands[item.id];
        const disabled = !cmd || cmd.enabled === false;
        return (
          <button
            key={i}
            type="button"
            role="menuitem"
            disabled={disabled}
            onMouseEnter={() => setOpenSub(null)}
            onClick={() => {
              cmd?.run();
              onDone();
            }}
            className={`${ROW} hover:bg-[var(--sc-accent)] hover:text-[var(--sc-accent-foreground)] disabled:pointer-events-none disabled:opacity-40`}
          >
            <span className="w-4 shrink-0">
              {cmd?.checked && <IconCheck size={14} />}
            </span>
            <span className="flex-1">{item.label ?? cmd?.label ?? item.id}</span>
            {cmd?.shortcut && (
              <span className="ml-6 text-xs opacity-60">{cmd.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function MenuBar() {
  const menus = useMemo(buildMenus, []);
  const commands = useCommandStore((s) => s.commands);
  const [open, setOpen] = useState<string | null>(null);
  const ref = useClickOutside(() => setOpen(null));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={ref} role="menubar" className="flex h-full items-stretch">
      {menus.map((menu) => (
        <div key={menu.label} className="relative flex">
          <button
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={open === menu.label}
            onClick={() => setOpen(open === menu.label ? null : menu.label)}
            onMouseEnter={() => open && setOpen(menu.label)}
            className={`px-2.5 text-[13px] transition-colors hover:bg-[var(--sc-hover-strong)] ${
              open === menu.label ? "bg-[var(--sc-hover-strong)]" : ""
            }`}
          >
            {menu.label}
          </button>
          {open === menu.label && (
            <Panel
              items={menu.items}
              commands={commands}
              onDone={() => setOpen(null)}
            />
          )}
        </div>
      ))}
    </div>
  );
}