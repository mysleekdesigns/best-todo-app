import { useMemo, useState } from 'react'
import { DndContext, DragOverlay, type DragStartEvent, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { addDays, format, startOfDay } from 'date-fns'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTasksByDateRange } from '@/db/hooks'
import { updateTask, completeTask } from '@/db'
import { TaskCheckbox } from '@/components/tasks/TaskCheckbox'
import { TimelineDayHeader } from './TimelineDayHeader'
import { OverdueSection } from './OverdueSection'
import { UnscheduledSection } from './UnscheduledSection'
import type { Task } from '@/types'

const TIMELINE_DAYS = 30

function DraggableTimelineTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { task },
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'group flex cursor-grab items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50',
        isDragging && 'opacity-50',
      )}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <TaskCheckbox
          checked={task.status === 'completed'}
          priority={task.priority}
          onToggle={() => completeTask(task.id)}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {task.title}
        </p>
        {task.dueTime && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            {task.dueTime}
            {task.duration && ` (${task.duration}m)`}
          </span>
        )}
      </div>
    </div>
  )
}

function DragGhost({ task }: { task: Task }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-white px-3 py-2.5 shadow-lg dark:border-blue-800 dark:bg-gray-900">
      <div className="h-5 w-5 shrink-0 rounded-full border-2 border-blue-400" />
      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
        {task.title}
      </p>
    </div>
  )
}

export function TimelineView() {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const today = startOfDay(new Date())
  const startDate = format(today, 'yyyy-MM-dd')
  const endDate = format(addDays(today, TIMELINE_DAYS), 'yyyy-MM-dd')

  const tasks = useTasksByDateRange(startDate, endDate)

  const dayGroups = useMemo(() => {
    const groups: Array<{ date: Date; dateStr: string; tasks: Task[] }> = []
    for (let i = 0; i < TIMELINE_DAYS; i++) {
      const date = addDays(today, i)
      const dateStr = format(date, 'yyyy-MM-dd')
      groups.push({ date, dateStr, tasks: [] })
    }

    if (tasks) {
      for (const task of tasks) {
        const taskDate = task.scheduledDate ?? task.dueDate
        if (!taskDate) continue
        const group = groups.find((g) => g.dateStr === taskDate)
        if (group) group.tasks.push(task)
      }
    }

    return groups
  }, [tasks, startDate])

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
    await updateTask(task.id, { scheduledDate: targetDate })
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="mx-auto max-w-2xl">
        {/* Overdue section */}
        <OverdueSection />

        {/* Scheduled days */}
        {tasks === undefined ? (
          <div className="space-y-3 px-6 py-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : (
          <div>
            {dayGroups.map(({ date, dateStr, tasks: dayTasks }) => (
              <div key={dateStr}>
                <TimelineDayHeader date={date} taskCount={dayTasks.length} />
                <AnimatePresence mode="popLayout">
                  {dayTasks.length > 0 ? (
                    dayTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <DraggableTimelineTask task={task} />
                      </motion.div>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-center text-xs text-gray-300 dark:text-gray-600">
                      No tasks
                    </div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        {/* Unscheduled section */}
        <UnscheduledSection />
      </div>

      <DragOverlay>
        {activeTask ? <DragGhost task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
