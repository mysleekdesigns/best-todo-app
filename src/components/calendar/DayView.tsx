import { useMemo } from 'react'
import { format, isToday } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { useTasksForDate, useTasksWithTimeBlocks } from '@/db/hooks'
import { TimeBlock } from './TimeBlock'
import { CurrentTimeLine } from './CurrentTimeLine'
import type { Task } from '@/types'

const START_HOUR = 6
const END_HOUR = 22
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

interface DayViewProps {
  currentDate: Date
  onTimeSlotClick?: (date: Date, hour: number) => void
  onTaskClick?: (task: Task) => void
}

export function DayView({ currentDate, onTimeSlotClick, onTaskClick }: DayViewProps) {
  const dateStr = format(currentDate, 'yyyy-MM-dd')
  const allTasks = useTasksForDate(dateStr)
  const timedTasks = useTasksWithTimeBlocks(dateStr)
  const today = isToday(currentDate)

  const allDayTasks = useMemo(() => {
    if (!allTasks) return []
    return allTasks.filter((t) => !t.dueTime || !t.duration)
  }, [allTasks])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={dateStr}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="flex flex-1 flex-col overflow-hidden"
      >
        {/* All-day section */}
        {allDayTasks.length > 0 && (
          <div className="border-b border-border px-4 py-2">
            <span className="mb-1 block text-[10px] font-medium text-muted-foreground">
              All Day
            </span>
            <div className="space-y-0.5">
              {allDayTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onTaskClick?.(task)}
                  className="w-full truncate rounded px-2 py-1 text-left text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  {task.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="relative grid grid-cols-[4rem_1fr]">
            {/* Hour labels */}
            <div className="relative">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex h-14 items-start justify-end pr-3 text-xs text-muted-foreground"
                >
                  {format(new Date(2000, 0, 1, hour), 'h a')}
                </div>
              ))}
            </div>

            {/* Main column */}
            <div className="relative border-l border-border">
              {/* Hour rows */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  role="button"
                  tabIndex={-1}
                  onClick={() => onTimeSlotClick?.(currentDate, hour)}
                  className="h-14 border-b border-border/50 transition-colors hover:bg-accent/30"
                />
              ))}

              {/* Timed task blocks */}
              {timedTasks?.map((task) => (
                <TimeBlock key={task.id} task={task} onClick={onTaskClick} />
              ))}

              {/* Current time indicator */}
              {today && <CurrentTimeLine />}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
