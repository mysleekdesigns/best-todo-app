import { useSettings } from '@/db/hooks'
import { updateSettings } from '@/db'
import type { ThemeMode } from '@/types'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
}

export function SettingsThemeSection() {
  const settings = useSettings()
  const currentTheme = settings?.theme ?? 'system'

  useEffect(() => {
    applyTheme(currentTheme)
  }, [currentTheme])

  useEffect(() => {
    if (currentTheme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [currentTheme])

  async function handleChange(theme: ThemeMode) {
    await updateSettings({ theme })
  }

  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold text-gray-900">Theme</h2>
      <p className="mb-3 text-xs text-gray-500">Choose how Zenith looks on your device.</p>
      <div className="flex gap-2">
        {themeOptions.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => handleChange(value)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
              currentTheme === value
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
