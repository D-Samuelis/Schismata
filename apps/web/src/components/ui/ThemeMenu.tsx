// apps/web/src/components/ui/ThemeMenu.tsx

import type { ReactNode } from "react";
import { Menu, type MenuProps } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { THEMES } from "../../theme/themes";
import { useThemeStore } from "../../theme/themeStore";

export function ThemeMenu({
  children,
  position = "top-end",
}: {
  children: ReactNode;
  position?: MenuProps["position"];
}) {
  const themeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <Menu position={position} width={230} shadow="md" withinPortal>
      <Menu.Target>{children}</Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Color Theme</Menu.Label>
        {THEMES.map((t) => (
          <Menu.Item
            key={t.id}
            onClick={() => setTheme(t.id)}
            leftSection={
              t.id === themeId ? (
                <IconCheck size={14} />
              ) : (
                <span style={{ width: 14 }} />
              )
            }
            rightSection={
              <span className="flex gap-0.5">
                {[t.colors.background, t.colors.accent].map((c) => (
                  <span
                    key={c}
                    className="h-3 w-3 rounded-full border border-[var(--sc-border)]"
                    style={{ background: c }}
                  />
                ))}
              </span>
            }
          >
            {t.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
