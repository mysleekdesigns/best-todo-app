import { useSettings } from '@/db/hooks'
import { updateSettings } from '@/db'

export function SettingsPomodoroSection() {
  const settings = useSettings()

  if (!settings) return null

  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold text-gray-900">Pomodoro Timer</h2>
      <p className="mb-3 text-xs text-gray-500">Configure your focus session durations.</p>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Work duration (minutes)</label>
          <input
            type="number"
            min={1}
            max={60}
            value={settings.pomodoroWork}
            onChange={(e) => updateSettings({ pomodoroWork: Math.min(60, Math.max(1, Number(e.target.value))) })}
            className="h-9 w-20 rounded-lg border border-gray-200 bg-white px-3 text-center text-sm text-gray-900 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Short break (minutes)</label>
          <input
            type="number"
            min={1}
            max={30}
            value={settings.pomodoroShortBreak}
            onChange={(e) => updateSettings({ pomodoroShortBreak: Math.min(30, Math.max(1, Number(e.target.value))) })}
            className="h-9 w-20 rounded-lg border border-gray-200 bg-white px-3 text-center text-sm text-gray-900 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Long break (minutes)</label>
          <input
            type="number"
            min={1}
            max={60}
            value={settings.pomodoroLongBreak}
            onChange={(e) => updateSettings({ pomodoroLongBreak: Math.min(60, Math.max(1, Number(e.target.value))) })}
            className="h-9 w-20 rounded-lg border border-gray-200 bg-white px-3 text-center text-sm text-gray-900 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Auto-start next session</label>
          <button
            onClick={() => updateSettings({ pomodoroAutoStart: !settings.pomodoroAutoStart })}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              settings.pomodoroAutoStart ? 'bg-gray-900' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={settings.pomodoroAutoStart}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm ${
                settings.pomodoroAutoStart ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
