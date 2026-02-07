const shortcuts = [
  { keys: ['Cmd', 'K'], description: 'Open search / command palette' },
  { keys: ['Cmd', 'N'], description: 'Create new task' },
  { keys: ['Cmd', '/'], description: 'Toggle sidebar' },
]

export function SettingsKeyboardSection() {
  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold text-gray-900">Keyboard Shortcuts</h2>
      <p className="mb-3 text-xs text-gray-500">Quick reference for keyboard navigation.</p>

      <div className="rounded-lg border border-gray-200 bg-gray-50 divide-y divide-gray-200">
        {shortcuts.map((shortcut) => (
          <div key={shortcut.description} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-700">{shortcut.description}</span>
            <div className="flex items-center gap-1">
              {shortcut.keys.map((key, i) => (
                <span key={i}>
                  <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-gray-300 bg-white px-1.5 text-xs font-medium text-gray-600 shadow-sm">
                    {key}
                  </kbd>
                  {i < shortcut.keys.length - 1 && (
                    <span className="mx-0.5 text-xs text-gray-400">+</span>
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
