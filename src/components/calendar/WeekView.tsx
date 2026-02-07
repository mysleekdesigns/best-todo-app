import { useMemo } from 'react'
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  isSameDay,
} from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTasksByDateRange } from '@/db/hooks'
import { TimeBlock } from './TimeBlock'
import { CurrentTimeLine } from './CurrentTimeLine'
import type { Task } from '@/types'

const START_HOUR = 6
const END_HOUR = 22
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

interface WeekViewProps {
  currentDate: Date
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  onTimeSlotClick?: (date: Date, hour: number) => void
  onTaskClick?: (task: Task) => void
  weekStartsOn?: 0 | 1
}

export function WeekView({
  currentDate,
  selectedDate,
  onSelectDate,
  onTimeSlotClick,
  onTaskClick,
  weekStartsOn = 1,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn })
  const days = useMemo(
    () => eachDayOfInterval({ start: weekStart, end: weekEnd }),
    [weekStart.getTime(), weekEnd.getTime()],
  )

  const rangeStartStr = format(weekStart, 'yyyy-MM-dd')
  const rangeEndStr = format(weekEnd, 'yyyy-MM-dd')
  const tasks = useTasksByDateRange(rangeStartStr, rangeEndStr)

  const { allDayByDate, timedByDate } = useMemo(() => {
    const allDay = new Map<string, Task[]>()
    const timed = new Map<string, Task[]>()
    if (!tasks) return { allDayByDate: allDay, timedByDate: timed }

    for (const task of tasks) {
      const key = task.dueDate ?? task.scheduledDate
      if (!key) continue

      if (task.dueTime && task.duration) {
        const existing = timed.get(key)
        if (existing) existing.push(task)
        else timed.set(key, [task])
      } else {
        const existing = allDay.get(key)
        if (existing) existing.push(task)
        else allDay.set(key, [task])
      }
    }
    return { allDayByDate: allDay, timedByDate: timed }
  }, [tasks])

  const showCurrentTime = days.some((d) => isToday(d))

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={rangeStartStr}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="flex flex-1 flex-col overflow-hidden"
      >
        {/* Day column headers */}
        <div className="grid grid-cols-[4rem_repeat(7,1fr)] border-b border-border">
          <div />
          {days.map((day) => {
            const today = isToday(day)
            const selected = selectedDate ? isSameDay(day, selectedDate) : false
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => onSelectDate(day)}
                className={cn(
                  'flex flex-col items-center py-2 transition-colors',
                  'hover:bg-accent/50',
                  selected && 'bg-accent',
                )}
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {format(day, 'EEE')}
                </span>
                <span
                  className={cn(
                    'mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                    today && 'bg-primary text-primary-foreground',
                  )}
                >
                  {format(day, 'd')}
                </span>
              </button>
            )
          })}
        </div>

        {/* All-day tasks row */}
        <div className="grid grid-cols-[4rem_repeat(7,1fr)] border-b border-border">
          <div className="flex items-center justify-end pr-2 text-[10px] text-muted-foreground">
            all-day
          </div>
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayAllDay = allDayByDate.get(dateStr) ?? []
            return (
              <div
                key={dateStr}
                className="min-h-[2rem] border-l border-border p-0.5"
              >
                {dayAllDay.slice(0, 2).map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onTaskClick?.(task)}
                    className="mb-0.5 w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    {task.title}
                  </button>
                ))}
                {dayAllDay.length > 2 && (
                  <span className="px-1 text-[10px] text-muted-foreground">
                    +{dayAllDay.length - 2} more
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Time grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="relative grid grid-cols-[4rem_repeat(7,1fr)]">
            {/* Hour labels */}
            <div className="relative">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex h-14 items-start justify-end pr-2 text-[10px] text-muted-foreground"
                >
                  {format(new Date(2000, 0, 1, hour), 'h a')}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const dayTimed = timedByDate.get(dateStr) ?? []
              const today = isToday(day)

              return (
                <div key={dateStr} className="relative border-l border-border">
                  {/* Hour grid lines */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      role="button"
                      tabIndex={-1}
                      onClick={() => onTimeSlotClick?.(day, hour)}
                      className="h-14 border-b border-border/50 transition-colors hover:bg-accent/30"
                    />
                  ))}

                  {/* Time blocks */}
                  {dayTimed.map((task) => (
                    <TimeBlock
                      key={task.id}
                      task={task}
                      onClick={onTaskClick}
                    />
                  ))}

                  {/* Current time line */}
                  {today && showCurrentTime && <CurrentTimeLine />}
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
