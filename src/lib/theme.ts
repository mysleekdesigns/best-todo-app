import type { ThemeMode } from '@/types'

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? getSystemTheme() : mode
}

export function applyTheme(mode: ThemeMode): void {
  const resolved = resolveTheme(mode)
  const root = document.documentElement

  // Enable smooth transition for theme changes
  root.classList.add('theme-transitioning')

  if (resolved === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  // Remove transition class after animation completes
  setTimeout(() => {
    root.classList.remove('theme-transitioning')
  }, 300)
}

export function watchSystemTheme(callback: () => void): () => void {
  const mql = window.matchMedia('(prefers-color-scheme: dark)')
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}
