import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { CalendarOff, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUnscheduledTasks } from '@/db/hooks'
import { completeTask } from '@/db'
import { TaskCheckbox } from '@/components/tasks/TaskCheckbox'
import type { Task } from '@/types'

function DraggableUnscheduledTask({ task }: { task: Task }) {
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
        'group flex cursor-grab items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/50',
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
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {task.title}
      </p>
    </div>
  )
}

export function UnscheduledSection() {
  const [collapsed, setCollapsed] = useState(false)
  const tasks = useUnscheduledTasks()

  if (!tasks || tasks.length === 0) return null

  return (
    <div className="border-t border-dashed border-border bg-accent/30">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-accent/50"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
        <CalendarOff className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-muted-foreground">No Date</span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {tasks.length}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] as const }}
            className="overflow-hidden"
          >
            <div className="pb-2">
              {tasks.map((task) => (
                <DraggableUnscheduledTask key={task.id} task={task} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
