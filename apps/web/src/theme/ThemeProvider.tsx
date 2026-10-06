// apps/web/src/theme/ThemeProvider.tsx

import { useLayoutEffect, useMemo, type ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { applyTheme } from "./themes";
import { useActiveTheme } from "./themeStore";
import { buildMantineTheme, cssVariablesResolver } from "./mantineTheme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useActiveTheme();

  useLayoutEffect(() => applyTheme(theme), [theme]);

  const mantineTheme = useMemo(() => buildMantineTheme(theme), [theme]);

  return (
    <MantineProvider
      theme={mantineTheme}
      forceColorScheme={theme.type}
      cssVariablesResolver={cssVariablesResolver}
    >
      {children}
    </MantineProvider>
  );
}
