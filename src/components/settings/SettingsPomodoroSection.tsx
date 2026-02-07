import { useSettings } from '@/db/hooks'
import { updateSettings } from '@/db'

export function SettingsPomodoroSection() {
  const settings = useSettings()

  if (!settings) return null

  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold text-foreground">Pomodoro Timer</h2>
      <p className="mb-3 text-xs text-muted-foreground">Configure your focus session durations.</p>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-foreground">Work duration (minutes)</label>
          <input
            type="number"
            min={1}
            max={60}
            value={settings.pomodoroWork}
            onChange={(e) => updateSettings({ pomodoroWork: Math.min(60, Math.max(1, Number(e.target.value))) })}
            className="h-9 w-20 rounded-lg border border-border bg-card px-3 text-center text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-foreground">Short break (minutes)</label>
          <input
            type="number"
            min={1}
            max={30}
            value={settings.pomodoroShortBreak}
            onChange={(e) => updateSettings({ pomodoroShortBreak: Math.min(30, Math.max(1, Number(e.target.value))) })}
            className="h-9 w-20 rounded-lg border border-border bg-card px-3 text-center text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-foreground">Long break (minutes)</label>
          <input
            type="number"
            min={1}
            max={60}
            value={settings.pomodoroLongBreak}
            onChange={(e) => updateSettings({ pomodoroLongBreak: Math.min(60, Math.max(1, Number(e.target.value))) })}
            className="h-9 w-20 rounded-lg border border-border bg-card px-3 text-center text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-foreground">Auto-start next session</label>
          <button
            onClick={() => updateSettings({ pomodoroAutoStart: !settings.pomodoroAutoStart })}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              settings.pomodoroAutoStart ? 'bg-foreground' : 'bg-muted'
            }`}
            role="switch"
            aria-checked={settings.pomodoroAutoStart}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card transition-transform shadow-sm ${
                settings.pomodoroAutoStart ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
