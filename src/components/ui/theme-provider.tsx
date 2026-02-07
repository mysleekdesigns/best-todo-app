import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ThemeMode } from '@/types'
import { applyTheme, resolveTheme, watchSystemTheme } from '@/lib/theme'
import { getSettings, updateSettings } from '@/db'

interface ThemeContextValue {
  mode: ThemeMode
  resolved: 'light' | 'dark'
  setTheme: (mode: ThemeMode) => void
  cycleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  resolved: 'light',
  setTheme: () => {},
  cycleTheme: () => {},
})

const CYCLE: ThemeMode[] = ['light', 'dark', 'system']

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system')
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => resolveTheme('system'))

  // Load saved theme from DB on mount
  useEffect(() => {
    getSettings().then((settings) => {
      setModeState(settings.theme)
      applyTheme(settings.theme)
      setResolved(resolveTheme(settings.theme))
    })
  }, [])

  // Watch for system theme changes
  useEffect(() => {
    if (mode !== 'system') return
    return watchSystemTheme(() => {
      applyTheme('system')
      setResolved(resolveTheme('system'))
    })
  }, [mode])

  const setTheme = useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
    applyTheme(newMode)
    setResolved(resolveTheme(newMode))
    updateSettings({ theme: newMode })
  }, [])

  const cycleTheme = useCallback(() => {
    setModeState((prev) => {
      const nextIndex = (CYCLE.indexOf(prev) + 1) % CYCLE.length
      const next = CYCLE[nextIndex]
      applyTheme(next)
      setResolved(resolveTheme(next))
      updateSettings({ theme: next })
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ mode, resolved, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
