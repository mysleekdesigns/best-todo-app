import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type CalendarView = 'month' | 'week' | 'day'

interface CalendarHeaderProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  activeView: CalendarView
  onViewChange: (view: CalendarView) => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

const viewLabels: { value: CalendarView; label: string }[] = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' },
]

export function CalendarHeader({
  currentDate,
  activeView,
  onViewChange,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  const title =
    activeView === 'day'
      ? format(currentDate, 'EEEE, MMMM d, yyyy')
      : format(currentDate, 'MMMM yyyy')

  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <h2 className="ml-2 text-lg font-semibold text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>

        <div className="flex rounded-md border border-border">
          {viewLabels.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onViewChange(value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                'first:rounded-l-md last:rounded-r-md',
                activeView === value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
