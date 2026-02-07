import { useDroppable } from '@dnd-kit/core'
import { format, isToday, isTomorrow, isMonday } from 'date-fns'
import { cn } from '@/lib/utils'
import { WeekNumberBadge } from './WeekNumberBadge'

interface TimelineDayHeaderProps {
  date: Date
  taskCount: number
}

export function TimelineDayHeader({ date, taskCount }: TimelineDayHeaderProps) {
  const dateStr = format(date, 'yyyy-MM-dd')
  const { setNodeRef, isOver } = useDroppable({ id: `day-${dateStr}`, data: { date: dateStr } })

  const dayName = format(date, 'EEEE')
  const fullDate = format(date, 'MMM d, yyyy')
  const relativeLabel = isToday(date) ? 'Today' : isTomorrow(date) ? 'Tomorrow' : null
  const showWeekBadge = isMonday(date)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex items-center gap-3 border-b border-gray-100 px-3 py-2.5 transition-colors dark:border-gray-800',
        isOver && 'bg-blue-50 dark:bg-blue-950/30',
        isToday(date) && 'bg-amber-50/50 dark:bg-amber-950/20',
      )}
    >
      {showWeekBadge && <WeekNumberBadge date={date} />}
      <div className="flex items-baseline gap-2">
        {relativeLabel ? (
          <>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {relativeLabel}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {dayName}, {fullDate}
            </span>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {dayName}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{fullDate}</span>
          </>
        )}
      </div>
      {taskCount > 0 && (
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
          {taskCount} task{taskCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}
