// apps/web/src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyTheme, getTheme } from './theme/themes'
import { useThemeStore } from './theme/themeStore'

// Called here to apply the theme before React renders, so that the default theme does not flash on first render.
applyTheme(getTheme(useThemeStore.getState().themeId))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
