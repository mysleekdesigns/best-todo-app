import type { ThemeMode } from '@/types'
import { Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/ui/theme-provider'

const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function SettingsThemeSection() {
  const { mode, setTheme } = useTheme()

  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold text-foreground">Theme</h2>
      <p className="mb-3 text-xs text-muted-foreground">Choose how Zenith looks on your device.</p>
      <div className="flex gap-2">
        {themeOptions.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
              mode === value
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-card text-foreground hover:bg-accent',
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
