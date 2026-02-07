export interface ShortcutDef {
  key: string
  meta?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  group: 'navigation' | 'tasks' | 'general'
  action: string
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)

export const MOD_KEY = isMac ? 'Meta' : 'Control'
export const MOD_LABEL = isMac ? '\u2318' : 'Ctrl'

export const SHORTCUTS: ShortcutDef[] = [
  // General
  { key: 'k', meta: true, description: 'Command palette', group: 'general', action: 'command-palette' },
  { key: '.', meta: true, description: 'Toggle sidebar', group: 'general', action: 'toggle-sidebar' },
  { key: 'f', meta: true, description: 'Search', group: 'general', action: 'search' },

  // Tasks
  { key: 'q', description: 'Quick add task', group: 'tasks', action: 'quick-add' },
  { key: 'n', meta: true, description: 'New task', group: 'tasks', action: 'new-task' },
  { key: 'Enter', description: 'Open selected task', group: 'tasks', action: 'open-task' },
  { key: 'Backspace', meta: true, description: 'Delete task', group: 'tasks', action: 'delete-task' },
  { key: 'ArrowUp', description: 'Previous task', group: 'tasks', action: 'prev-task' },
  { key: 'ArrowDown', description: 'Next task', group: 'tasks', action: 'next-task' },
  { key: 't', description: 'Schedule today', group: 'tasks', action: 'schedule-today' },

  // Navigation (Cmd+1-4)
  { key: '1', meta: true, description: 'Upcoming', group: 'navigation', action: 'nav-upcoming' },
  { key: '2', meta: true, description: 'Today', group: 'navigation', action: 'nav-today' },
  { key: '3', meta: true, description: 'Calendar', group: 'navigation', action: 'nav-calendar' },
  { key: '4', meta: true, description: 'Sticky Wall', group: 'navigation', action: 'nav-sticky-wall' },
]

export function matchesShortcut(
  e: KeyboardEvent,
  def: ShortcutDef,
): boolean {
  const metaPressed = isMac ? e.metaKey : e.ctrlKey
  if (def.meta && !metaPressed) return false
  if (!def.meta && metaPressed) return false
  if (def.shift && !e.shiftKey) return false
  if (def.alt && !e.altKey) return false
  return e.key === def.key
}

export function formatShortcut(def: ShortcutDef): string {
  const parts: string[] = []
  if (def.meta) parts.push(MOD_LABEL)
  if (def.shift) parts.push(isMac ? '\u21E7' : 'Shift')
  if (def.alt) parts.push(isMac ? '\u2325' : 'Alt')

  const keyLabel =
    def.key === 'ArrowUp' ? '\u2191'
    : def.key === 'ArrowDown' ? '\u2193'
    : def.key === 'Backspace' ? (isMac ? '\u232B' : 'Del')
    : def.key === 'Enter' ? '\u23CE'
    : def.key.toUpperCase()

  parts.push(keyLabel)
  return parts.join(isMac ? '' : '+')
}
