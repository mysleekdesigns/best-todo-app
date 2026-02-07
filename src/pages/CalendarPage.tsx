import { useState, useCallback } from 'react'
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfToday,
} from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarHeader, type CalendarView } from '@/components/calendar/CalendarHeader'
import { MonthView } from '@/components/calendar/MonthView'
import { WeekView } from '@/components/calendar/WeekView'
import { DayView } from '@/components/calendar/DayView'
import { TimelineView } from '@/components/calendar/TimelineView'
import { TimeBlockEditor } from '@/components/calendar/TimeBlockEditor'
import { useSettings } from '@/db/hooks'
import type { Task } from '@/types'

type ExtendedView = CalendarView | 'timeline'

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(startOfToday())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [activeView, setActiveView] = useState<ExtendedView>('month')
  const [timeBlockTask, setTimeBlockTask] = useState<{
    task?: Task
    date?: Date
    hour?: number
  } | null>(null)

  const settings = useSettings()
  const weekStartsOn = settings?.weekStartsOn ?? 1

  const handlePrev = useCallback(() => {
    setCurrentDate((d) => {
      switch (activeView) {
        case 'month':
          return subMonths(d, 1)
        case 'week':
          return subWeeks(d, 1)
        case 'day':
          return subDays(d, 1)
        default:
          return d
      }
    })
  }, [activeView])

  const handleNext = useCallback(() => {
    setCurrentDate((d) => {
      switch (activeView) {
        case 'month':
          return addMonths(d, 1)
        case 'week':
          return addWeeks(d, 1)
        case 'day':
          return addDays(d, 1)
        default:
          return d
      }
    })
  }, [activeView])

  const handleToday = useCallback(() => {
    setCurrentDate(startOfToday())
    setSelectedDate(startOfToday())
  }, [])

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date)
    setCurrentDate(date)
  }, [])

  const handleViewChange = useCallback((view: CalendarView) => {
    setActiveView(view)
  }, [])

  const handleTimeSlotClick = useCallback((date: Date, hour: number) => {
    setTimeBlockTask({ date, hour })
  }, [])

  const handleTaskClick = useCallback((task: Task) => {
    setTimeBlockTask({ task })
  }, [])

  return (
    <div className="flex h-full flex-col p-3 md:p-4 lg:p-6">
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
      className="flex min-h-0 flex-1 flex-col bg-card rounded-xl border border-border overflow-hidden"
    >
      {activeView !== 'timeline' && (
        <CalendarHeader
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          activeView={activeView as CalendarView}
          onViewChange={handleViewChange}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
        />
      )}

      {/* View switcher tabs */}
      <div className="flex items-center gap-1 border-b border-border px-4 py-1.5">
        {(['month', 'week', 'day', 'timeline'] as const).map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => setActiveView(view)}
            className={
              activeView === view
                ? 'rounded-md bg-accent px-3 py-1 text-xs font-medium text-foreground'
                : 'rounded-md px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/50'
            }
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* Calendar views */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] as const }}
            className="flex min-h-0 flex-1 flex-col"
          >
            {activeView === 'month' && (
              <MonthView
                currentDate={currentDate}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                weekStartsOn={weekStartsOn}
              />
            )}
            {activeView === 'week' && (
              <WeekView
                currentDate={currentDate}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                onTimeSlotClick={handleTimeSlotClick}
                onTaskClick={handleTaskClick}
                weekStartsOn={weekStartsOn}
              />
            )}
            {activeView === 'day' && (
              <DayView
                currentDate={currentDate}
                onTimeSlotClick={handleTimeSlotClick}
                onTaskClick={handleTaskClick}
              />
            )}
            {activeView === 'timeline' && <TimelineView />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Time block editor dialog */}
      {timeBlockTask && (
        <TimeBlockEditor
          task={timeBlockTask.task}
          defaultDate={timeBlockTask.date}
          defaultHour={timeBlockTask.hour}
          onClose={() => setTimeBlockTask(null)}
        />
      )}
    </motion.div>
    </div>
  )
}
