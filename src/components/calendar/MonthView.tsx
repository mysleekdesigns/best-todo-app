import { useMemo, useState } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTasksByDateRange } from '@/db/hooks'
import { updateTask } from '@/db'
import { CalendarTaskDot } from './CalendarTaskDot'
import type { Task, Priority } from '@/types'

interface MonthViewProps {
  currentDate: Date
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  weekStartsOn?: 0 | 1
}

const weekDays0: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const weekDays1: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function DraggableTaskDot({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `month-task-${task.id}`,
    data: { task },
  })

  return (
    <span
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn('cursor-grab touch-none', isDragging && 'opacity-30')}
    >
      <CalendarTaskDot priority={task.priority as Priority} />
    </span>
  )
}

function DroppableDayCell({
  day,
  currentDate,
  selectedDate,
  dayTasks,
  onSelectDate,
}: {
  day: Date
  currentDate: Date
  selectedDate: Date | null
  dayTasks: Task[]
  onSelectDate: (date: Date) => void
}) {
  const dateStr = format(day, 'yyyy-MM-dd')
  const { setNodeRef, isOver } = useDroppable({ id: `day-${dateStr}` })
  const inMonth = isSameMonth(day, currentDate)
  const today = isToday(day)
  const selected = selectedDate ? isSameDay(day, selectedDate) : false

  return (
    <div
      ref={setNodeRef}
      onClick={() => onSelectDate(day)}
      className={cn(
        'flex flex-col items-center gap-1 border-b border-r border-border p-2 text-sm transition-colors cursor-pointer',
        'hover:bg-accent/50',
        !inMonth && 'text-muted-foreground/40',
        selected && 'bg-accent',
        isOver && 'bg-primary/10 ring-2 ring-primary/30',
      )}
    >
      <span
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
          today && 'bg-primary text-primary-foreground',
        )}
      >
        {format(day, 'd')}
      </span>

      {dayTasks.length > 0 && (
        <div className="flex gap-0.5">
          {dayTasks.slice(0, 3).map((task) => (
            <DraggableTaskDot key={task.id} task={task} />
          ))}
          {dayTasks.length > 3 && (
            <span className="text-[10px] leading-none text-muted-foreground">
              +{dayTasks.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function MonthView({
  currentDate,
  selectedDate,
  onSelectDate,
  weekStartsOn = 1,
}: MonthViewProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn })

  const days = useMemo(
    () => eachDayOfInterval({ start: gridStart, end: gridEnd }),
    [gridStart.getTime(), gridEnd.getTime()],
  )

  const rangeStartStr = format(gridStart, 'yyyy-MM-dd')
  const rangeEndStr = format(gridEnd, 'yyyy-MM-dd')
  const tasks = useTasksByDateRange(rangeStartStr, rangeEndStr)

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>()
    if (!tasks) return map
    for (const task of tasks) {
      const key = task.dueDate ?? task.scheduledDate
      if (!key) continue
      const existing = map.get(key)
      if (existing) {
        existing.push(task)
      } else {
        map.set(key, [task])
      }
    }
    return map
  }, [tasks])

  const dayHeaders = weekStartsOn === 0 ? weekDays0 : weekDays1

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as Task | undefined
    if (task) setActiveTask(task)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const task = active.data.current?.task as Task | undefined
    if (!task) return

    const overId = String(over.id)
    if (!overId.startsWith('day-')) return

    const targetDate = overId.replace('day-', '')
    const currentTaskDate = task.dueDate ?? task.scheduledDate
    if (targetDate === currentTaskDate) return

    if (task.dueDate) {
      await updateTask(task.id, { dueDate: targetDate })
    } else {
      await updateTask(task.id, { scheduledDate: targetDate })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={format(currentDate, 'yyyy-MM')}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex flex-1 flex-col"
        >
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {dayHeaders.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid flex-1 grid-cols-7">
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const dayTasks = tasksByDate.get(dateStr) ?? []

              return (
                <DroppableDayCell
                  key={dateStr}
                  day={day}
                  currentDate={currentDate}
                  selectedDate={selectedDate}
                  dayTasks={dayTasks}
                  onSelectDate={onSelectDate}
                />
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <DragOverlay>
        {activeTask ? (
          <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-background px-2 py-1 shadow-lg">
            <CalendarTaskDot priority={activeTask.priority as Priority} />
            <span className="text-xs font-medium">{activeTask.title}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
