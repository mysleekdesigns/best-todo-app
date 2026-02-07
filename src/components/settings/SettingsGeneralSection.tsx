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
      <h2 className="mb-1 text-sm font-semibold text-gray-900">General</h2>
      <p className="mb-3 text-xs text-gray-500">Customize your default experience.</p>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm text-gray-700">Default view</label>
          <select
            value={settings.defaultView}
            onChange={(e) => updateSettings({ defaultView: e.target.value })}
            className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
          >
            {viewOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-700">Week starts on</label>
          <div className="flex gap-2">
            {([0, 1] as const).map((day) => (
              <button
                key={day}
                onClick={() => updateSettings({ weekStartsOn: day })}
                className={cn(
                  'flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                  settings.weekStartsOn === day
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
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
