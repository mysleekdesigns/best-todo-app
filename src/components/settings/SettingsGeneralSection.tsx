import { useSettings } from '@/db/hooks'
import { updateSettings } from '@/db'
import { cn } from '@/lib/utils'

const viewOptions = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'today', label: 'Today' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'sticky-wall', label: 'Sticky Wall' },
]

export function SettingsGeneralSection() {
  const settings = useSettings()

  if (!settings) return null

  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold text-foreground">General</h2>
      <p className="mb-3 text-xs text-muted-foreground">Customize your default experience.</p>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm text-foreground">Default view</label>
          <select
            value={settings.defaultView}
            onChange={(e) => updateSettings({ defaultView: e.target.value })}
            className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
          >
            {viewOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-foreground">Week starts on</label>
          <div className="flex gap-2">
            {([0, 1] as const).map((day) => (
              <button
                key={day}
                onClick={() => updateSettings({ weekStartsOn: day })}
                className={cn(
                  'flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                  settings.weekStartsOn === day
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-card text-foreground hover:bg-accent',
                )}
              >
                {day === 0 ? 'Sunday' : 'Monday'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
