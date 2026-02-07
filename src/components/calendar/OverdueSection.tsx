import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useOverdueTasks } from '@/db/hooks'
import { completeTask } from '@/db'
import { TaskCheckbox } from '@/components/tasks/TaskCheckbox'
import type { Task } from '@/types'

function DraggableOverdueTask({ task }: { task: Task }) {
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
        'group flex cursor-grab items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-red-50/50 dark:hover:bg-red-950/20',
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
        <p className="truncate text-sm font-medium text-foreground">
          {task.title}
        </p>
        {task.dueDate && (
          <p className="text-xs text-red-500 dark:text-red-400">
            Due {format(new Date(task.dueDate + 'T00:00:00'), 'MMM d')}
          </p>
        )}
      </div>
    </div>
  )
}

export function OverdueSection() {
  const [collapsed, setCollapsed] = useState(false)
  const tasks = useOverdueTasks()

  if (!tasks || tasks.length === 0) return null

  return (
    <div className="border-l-2 border-red-400 bg-red-50/30 dark:border-red-500 dark:bg-red-950/10">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-red-50/50 dark:hover:bg-red-950/20"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-red-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-red-500" />
        )}
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <span className="text-sm font-semibold text-red-700 dark:text-red-400">Overdue</span>
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/50 dark:text-red-300">
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
                <DraggableOverdueTask key={task.id} task={task} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
