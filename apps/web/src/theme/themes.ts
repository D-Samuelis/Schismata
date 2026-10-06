// apps/web/src/theme/themes.ts

export type ThemeType = "dark" | "light";

export interface ThemeColors {
  // Editor / panel body, graph canvas
  background: string;
  // Tab strip, toolbars, menus, inputs, cards
  surface: string;
  foreground: string;
  mutedForeground: string;
  border: string;

  accent: string;
  // Text/icon colour on top of `accent`
  accentForeground: string;

  titleBar: string;
  titleBarForeground: string;
  activityBar: string;
  // Icon colour of the activity bar (inactive icons are dimmed from it)
  activityBarForeground: string;
  statusBar: string;
  statusBarForeground: string;

  danger: string;
  // Start-state ring
  success: string;
  // Active-state highlight during simulation
  warning: string;
}

export interface ThemeDefinition {
  id: string;
  label: string;
  // Drives `color-scheme` and Mantine's forced colour scheme
  type: ThemeType;
  colors: ThemeColors;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: "dark-plus",
    label: "Dark+",
    type: "dark",
    colors: {
      background: "#1e1e1e",
      surface: "#252526",
      foreground: "#cccccc",
      mutedForeground: "#858585",
      border: "#3c3c3c",
      accent: "#0e7ad1",
      accentForeground: "#ffffff",
      titleBar: "#3c3c3c",
      titleBarForeground: "#cccccc",
      activityBar: "#333333",
      activityBarForeground: "#ffffff",
      statusBar: "#007acc",
      statusBarForeground: "#ffffff",
      danger: "#f48771",
      success: "#89d185",
      warning: "#e5c453",
    },
  },
  {
    id: "light-plus",
    label: "Light+",
    type: "light",
    colors: {
      background: "#ffffff",
      surface: "#f3f3f3",
      foreground: "#3b3b3b",
      mutedForeground: "#717171",
      border: "#d4d4d4",
      accent: "#005fb8",
      accentForeground: "#ffffff",
      titleBar: "#dddddd",
      titleBarForeground: "#333333",
      activityBar: "#2c2c2c",
      activityBarForeground: "#ffffff",
      statusBar: "#007acc",
      statusBarForeground: "#ffffff",
      danger: "#e51400",
      success: "#2f9e44",
      warning: "#f0b429",
    },
  },
  {
    id: "schismata-violet",
    label: "Schismata Violet",
    type: "dark",
    colors: {
      background: "#14111b",
      surface: "#1b1726",
      foreground: "#e4dff0",
      mutedForeground: "#8b829d",
      border: "#2d2640",
      accent: "#aa3bff",
      accentForeground: "#ffffff",
      titleBar: "#0f0c16",
      titleBarForeground: "#cfc8e0",
      activityBar: "#0f0c16",
      activityBarForeground: "#ffffff",
      statusBar: "#7a2fc9",
      statusBarForeground: "#ffffff",
      danger: "#ff6b81",
      success: "#2ecc71",
      warning: "#f5c542",
    },
  },
  {
    id: "solarized-dark",
    label: "Solarized Dark",
    type: "dark",
    colors: {
      background: "#002b36",
      surface: "#073642",
      foreground: "#93a1a1",
      mutedForeground: "#657b83",
      border: "#0e4a58",
      accent: "#268bd2",
      accentForeground: "#fdf6e3",
      titleBar: "#00212b",
      titleBarForeground: "#93a1a1",
      activityBar: "#00212b",
      activityBarForeground: "#eee8d5",
      statusBar: "#268bd2",
      statusBarForeground: "#fdf6e3",
      danger: "#dc322f",
      success: "#859900",
      warning: "#d9a521",
    },
  },
];

export const DEFAULT_THEME_ID = "dark-plus";

export function getTheme(id: string): ThemeDefinition {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

// Writes every colour as `--sc-<kebab-name>` on <html>
export function applyTheme(theme: ThemeDefinition): void {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(`--sc-${kebab(key)}`, value);
  }
  root.style.colorScheme = theme.type;
  root.dataset.scTheme = theme.id;
}
