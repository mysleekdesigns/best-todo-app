import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { subDays, format } from 'date-fns'
import { useTodayFocusSessions, useFocusStats } from '@/db/hooks'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'

function formatFocusTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function FocusDashboard() {
  const todaySessions = useTodayFocusSessions()
  const stats = useFocusStats('today')

  // Weekly data: last 7 days of focus minutes
  const weekRange = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i)
      return {
        date: format(date, 'yyyy-MM-dd'),
        label: format(date, 'EEE'),
      }
    })
  }, [])

  const startDate = weekRange[0].date
  const endDate = weekRange[6].date

  const weekSessions = useLiveQuery(
    () =>
      db.focusSessions
        .filter((s) => {
          const d = s.startTime.slice(0, 10)
          return d >= startDate && d <= endDate && s.completed && s.type === 'work'
        })
        .toArray(),
    [startDate, endDate],
  )

  const weekData = useMemo(() => {
    if (!weekSessions) return weekRange.map((d) => ({ ...d, minutes: 0 }))

    const minutesByDay = new Map<string, number>()
    for (const session of weekSessions) {
      const day = session.startTime.slice(0, 10)
      minutesByDay.set(day, (minutesByDay.get(day) ?? 0) + Math.round(session.duration / 60))
    }

    return weekRange.map((d) => ({
      ...d,
      minutes: minutesByDay.get(d.date) ?? 0,
    }))
  }, [weekSessions, weekRange])

  const maxMinutes = Math.max(...weekData.map((d) => d.minutes), 1)

  const todayWorkSessions = todaySessions?.filter((s) => s.completed && s.type === 'work') ?? []

  return (
    <div className="w-full rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Focus Stats
      </h3>

      {/* Stats row */}
      <div className="mb-5 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-semibold tabular-nums text-foreground">
            {todayWorkSessions.length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Sessions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold tabular-nums text-foreground">
            {formatFocusTime(stats?.totalMinutes ?? 0)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Focus Time</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold tabular-nums text-foreground">
            {stats?.streak ?? 0}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Day Streak</p>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="flex items-end justify-between gap-2" style={{ height: 80 }}>
        {weekData.map((day) => {
          const height = maxMinutes > 0 ? (day.minutes / maxMinutes) * 64 : 0
          const isToday = day.date === format(new Date(), 'yyyy-MM-dd')

          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
              <motion.div
                className={isToday ? 'rounded-sm bg-foreground' : 'rounded-sm bg-secondary'}
                style={{ width: '100%', maxWidth: 32 }}
                initial={{ height: 0 }}
                animate={{ height: Math.max(height, 2) }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const }}
              />
              <span className={`text-[10px] ${isToday ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                {day.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
