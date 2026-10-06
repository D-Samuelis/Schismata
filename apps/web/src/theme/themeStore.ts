// apps/web/src/theme/themeStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_THEME_ID, getTheme, type ThemeDefinition } from "./themes";

interface ThemeState {
  themeId: string;
  setTheme: (id: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeId: DEFAULT_THEME_ID,
      setTheme: (themeId) => set({ themeId }),
    }),
    { name: "schismata-theme", partialize: (s) => ({ themeId: s.themeId }) },
  ),
);

export function useActiveTheme(): ThemeDefinition {
  return getTheme(useThemeStore((s) => s.themeId));
}
