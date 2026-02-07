import { useMemo } from 'react'
import { format, subDays, startOfWeek, addDays } from 'date-fns'
import type { HabitEntry } from '@/types'
import { cn } from '@/lib/utils'

interface HabitCalendarHeatmapProps {
  entries: HabitEntry[]
  color: string
  weeks?: number
}

export function HabitCalendarHeatmap({
  entries,
  color,
  weeks = 12,
}: HabitCalendarHeatmapProps) {
  const { grid, dayLabels } = useMemo(() => {
    const today = new Date()
    const totalDays = weeks * 7
    const completedDates = new Set(
      entries.filter((e) => e.completed).map((e) => e.date),
    )

    // Start from the beginning of the week, `weeks` weeks ago
    const gridStart = startOfWeek(subDays(today, totalDays - 1), {
      weekStartsOn: 1,
    })

    // Build columns (weeks) × rows (days of week)
    const columns: { date: Date; dateStr: string; completed: boolean }[][] = []
    let current = gridStart
    for (let w = 0; w < weeks; w++) {
      const week: { date: Date; dateStr: string; completed: boolean }[] = []
      for (let d = 0; d < 7; d++) {
        const dateStr = format(current, 'yyyy-MM-dd')
        week.push({
          date: current,
          dateStr,
          completed: completedDates.has(dateStr),
        })
        current = addDays(current, 1)
      }
      columns.push(week)
    }

    const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun']

    return { grid: columns, dayLabels }
  }, [entries, weeks])

  return (
    <div className="flex gap-1">
      {/* Day labels */}
      <div className="flex flex-col gap-[3px] pr-1">
        {dayLabels.map((label, i) => (
          <div
            key={i}
            className="h-3 w-6 text-[10px] leading-3 text-gray-400 text-right"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex gap-[3px]">
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day) => {
              const isToday = day.dateStr === format(new Date(), 'yyyy-MM-dd')
              return (
                <div
                  key={day.dateStr}
                  title={`${format(day.date, 'MMM d, yyyy')} - ${day.completed ? 'Done' : 'Not done'}`}
                  className={cn(
                    'h-3 w-3 rounded-sm transition-colors',
                    isToday && 'ring-1 ring-gray-400',
                  )}
                  style={{
                    backgroundColor: day.completed ? color : '#f3f4f6',
                    opacity: day.completed ? 0.85 : 1,
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
