const shortcuts = [
  { keys: ['Cmd', 'K'], description: 'Open search / command palette' },
  { keys: ['Cmd', 'N'], description: 'Create new task' },
  { keys: ['Cmd', '/'], description: 'Toggle sidebar' },
]

export function SettingsKeyboardSection() {
  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold text-foreground">Keyboard Shortcuts</h2>
      <p className="mb-3 text-xs text-muted-foreground">Quick reference for keyboard navigation.</p>

      <div className="rounded-lg border border-border bg-secondary divide-y divide-border">
        {shortcuts.map((shortcut) => (
          <div key={shortcut.description} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-foreground">{shortcut.description}</span>
            <div className="flex items-center gap-1">
              {shortcut.keys.map((key, i) => (
                <span key={i}>
                  <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-border bg-card px-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                    {key}
                  </kbd>
                  {i < shortcut.keys.length - 1 && (
                    <span className="mx-0.5 text-xs text-muted-foreground">+</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
