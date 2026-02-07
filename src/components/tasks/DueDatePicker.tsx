import { useState, useRef, useEffect } from 'react'
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, startOfWeek, endOfWeek } from 'date-fns'
import { Calendar, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DueDatePickerProps {
  value: string | null
  onChange: (date: string | null) => void
  className?: string
}

export function DueDatePicker({ value, onChange, className }: DueDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => (value ? new Date(value) : new Date()))
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedDate = value ? new Date(value + 'T00:00:00') : null

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const handleSelect = (date: Date) => {
    onChange(format(date, 'yyyy-MM-dd'))
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setIsOpen(false)
  }

  const quickDates = [
    { label: 'Today', date: new Date() },
    { label: 'Tomorrow', date: addDays(new Date(), 1) },
    { label: 'Next Week', date: addDays(new Date(), 7) },
  ]

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors',
          value
            ? 'text-foreground hover:bg-accent'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent',
        )}
      >
        <Calendar className="h-3.5 w-3.5" />
        {selectedDate ? format(selectedDate, 'MMM d') : 'Due date'}
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            onKeyDown={(e) => { if (e.key === 'Enter') handleClear(e as unknown as React.MouseEvent) }}
            className="ml-0.5 rounded-full p-0.5 hover:bg-secondary"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-lg border border-border bg-card p-3 shadow-lg">
          {/* Quick dates */}
          <div className="mb-2 flex gap-1">
            {quickDates.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => handleSelect(q.date)}
                className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Month navigation */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              className="rounded p-1 text-muted-foreground hover:bg-accent"
            >
              &lt;
            </button>
            <span className="text-sm font-medium text-foreground">
              {format(viewDate, 'MMMM yyyy')}
            </span>
            <button
              type="button"
              onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              className="rounded p-1 text-muted-foreground hover:bg-accent"
            >
              &gt;
            </button>
          </div>

          {/* Day headers */}
          <div className="mb-1 grid grid-cols-7 text-center text-xs text-muted-foreground">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 text-center">
            {days.map((day) => {
              const inMonth = day.getMonth() === viewDate.getMonth()
              const selected = selectedDate && isSameDay(day, selectedDate)
              const today = isToday(day)

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={cn(
                    'rounded-md py-1 text-xs transition-colors',
                    !inMonth && 'text-muted-foreground/40',
                    inMonth && !selected && 'text-foreground hover:bg-accent',
                    today && !selected && 'font-bold text-blue-500',
                    selected && 'bg-blue-500 font-bold text-white',
                  )}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
