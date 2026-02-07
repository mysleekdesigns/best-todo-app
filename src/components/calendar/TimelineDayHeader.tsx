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
        'flex items-center gap-3 border-b border-border px-3 py-2.5 transition-colors',
        isOver && 'bg-primary/5',
        isToday(date) && 'bg-accent',
      )}
    >
      {showWeekBadge && <WeekNumberBadge date={date} />}
      <div className="flex items-baseline gap-2">
        {relativeLabel ? (
          <>
            <span className="text-sm font-bold text-foreground">
              {relativeLabel}
            </span>
            <span className="text-xs text-muted-foreground">
              {dayName}, {fullDate}
            </span>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-foreground/80">
              {dayName}
            </span>
            <span className="text-xs text-muted-foreground">{fullDate}</span>
          </>
        )}
      </div>
      {taskCount > 0 && (
        <span className="ml-auto text-xs text-muted-foreground">
          {taskCount} task{taskCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}
