// apps/web/src/theme/mantineTheme.ts

/** 
 * Mantine theme builder for Schismata.
 * Bridges the gap between Mantine's theme system and the custom ThemeDefinition --sc-* CSS variable system.
*/

import {
  createTheme,
  type CSSVariablesResolver,
  type MantineColorsTuple,
  type MantineThemeOverride,
} from "@mantine/core";
import type { ThemeDefinition } from "./themes";

const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const mix = (a: string, b: string, t: number): string => {
  const [ar, ag, ab] = rgb(a);
  const [br, bg, bb] = rgb(b);
  const ch = (x: number, y: number) =>
    Math.round(x + (y - x) * t)
      .toString(16)
      .padStart(2, "0");
  return `#${ch(ar, br)}${ch(ag, bg)}${ch(ab, bb)}`;
};

/** 10 shades; index 5 is exactly the accent (matches primaryShade below). */
function paletteFrom(accent: string): MantineColorsTuple {
  const shades = Array.from({ length: 10 }, (_, i) =>
    i < 5
      ? mix(accent, "#ffffff", ((5 - i) / 5) * 0.9)
      : mix(accent, "#000000", ((i - 5) / 4) * 0.55),
  );
  return shades as unknown as MantineColorsTuple;
}

export function buildMantineTheme(t: ThemeDefinition): MantineThemeOverride {
  return createTheme({
    primaryColor: "sc",
    primaryShade: 5,
    colors: { sc: paletteFrom(t.colors.accent) },
    autoContrast: true,
    defaultRadius: "sm",
    cursorType: "pointer",
    fontFamily:
      '"Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
    fontFamilyMonospace:
      '"Cascadia Code", "JetBrains Mono", Consolas, "SF Mono", Menlo, monospace',
    fontSizes: { xs: "11px", sm: "12px", md: "13px", lg: "15px", xl: "18px" },
  });
}

const tokenMap = {
  "--mantine-color-body": "var(--sc-background)",
  "--mantine-color-text": "var(--sc-foreground)",
  "--mantine-color-dimmed": "var(--sc-muted-foreground)",
  "--mantine-color-placeholder": "var(--sc-muted-foreground)",
  "--mantine-color-default": "var(--sc-surface)",
  "--mantine-color-default-hover": "var(--sc-hover)",
  "--mantine-color-default-color": "var(--sc-foreground)",
  "--mantine-color-default-border": "var(--sc-border)",
  "--mantine-color-error": "var(--sc-danger)",
};

// Static: the values are var() references, so switching theme never needs a
// new resolver — only the --sc-* variables on <html> change.
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: tokenMap,
  dark: tokenMap,
});
