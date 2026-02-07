import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SHORTCUTS, matchesShortcut } from '@/lib/keyboard-shortcuts'

interface ShortcutHandlers {
  onToggleSidebar?: () => void
  onQuickAdd?: () => void
  onNewTask?: () => void
  onOpenTask?: () => void
  onDeleteTask?: () => void
  onPrevTask?: () => void
  onNextTask?: () => void
  onToggleEvening?: () => void
  onScheduleToday?: () => void
  onSetSomeday?: () => void
}

function isEditableTarget(e: KeyboardEvent): boolean {
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if ((e.target as HTMLElement)?.isContentEditable) return true
  return false
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers = {}) {
  const navigate = useNavigate()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Command palette is handled by CommandPalette component itself
      // Skip single-key shortcuts when user is typing in an input
      const editing = isEditableTarget(e)

      for (const def of SHORTCUTS) {
        if (!matchesShortcut(e, def)) continue

        // Skip non-meta shortcuts when editing (single keys like q, e, t, s, arrows)
        if (!def.meta && editing) continue

        e.preventDefault()

        switch (def.action) {
          // Navigation
          case 'nav-inbox': navigate('/inbox'); break
          case 'nav-today': navigate('/today'); break
          case 'nav-upcoming': navigate('/upcoming'); break
          case 'nav-anytime': navigate('/anytime'); break
          case 'nav-someday': navigate('/someday'); break
          case 'nav-logbook': navigate('/logbook'); break

          // General
          case 'toggle-sidebar': handlers.onToggleSidebar?.(); break

          // Tasks
          case 'quick-add':
            handlers.onQuickAdd?.()
            window.dispatchEvent(new CustomEvent('zenith:quick-add'))
            break
          case 'new-task':
            handlers.onNewTask?.()
            window.dispatchEvent(new CustomEvent('zenith:quick-add'))
            break
          case 'open-task': handlers.onOpenTask?.(); break
          case 'delete-task': handlers.onDeleteTask?.(); break
          case 'prev-task': handlers.onPrevTask?.(); break
          case 'next-task': handlers.onNextTask?.(); break
          case 'toggle-evening': handlers.onToggleEvening?.(); break
          case 'schedule-today': handlers.onScheduleToday?.(); break
          case 'set-someday': handlers.onSetSomeday?.(); break
        }
        return
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate, handlers])
}
