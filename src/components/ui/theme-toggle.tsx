import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/ui/theme-provider'

const ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const

const LABELS = {
  light: 'Switch to dark theme',
  dark: 'Switch to system theme',
  system: 'Switch to light theme',
} as const

export function ThemeToggle() {
  const { mode, cycleTheme } = useTheme()
  const Icon = ICONS[mode]

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label={LABELS[mode]}
      title={LABELS[mode]}
    >
      <Icon className="size-4" />
    </Button>
  )
}
