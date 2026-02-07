import { motion, AnimatePresence } from 'framer-motion'
import { CircleCheckBig } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'
import { TaskItem } from './TaskItem'
import { useTaskActions } from '@/hooks/useTaskActions'

interface TaskListProps {
  tasks: Task[] | undefined
  selectedTaskId: string | null
  onSelectTask: (id: string) => void
  emptyMessage?: string
  className?: string
}

export function TaskList({
  tasks,
  selectedTaskId,
  onSelectTask,
  emptyMessage = 'No tasks',
  className,
}: TaskListProps) {
  const { toggleComplete, updateTaskTitle } = useTaskActions()

  if (!tasks) {
    return (
      <div className={cn('space-y-2 p-4', className)}>
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3 px-4 py-3.5"
          >
            <div className="h-5 w-5 shrink-0 animate-pulse rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded-md bg-gray-200" />
              <div className="h-3 w-1/3 animate-pulse rounded-md bg-gray-200" />
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <CircleCheckBig className="mb-3 h-8 w-8 text-gray-300" />
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  const topLevelTasks = tasks.filter((t) => !t.parentId)

  return (
    <div className={cn('', className)} role="list" aria-label="Task list">
      <AnimatePresence initial={false}>
        {topLevelTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isSelected={selectedTaskId === task.id}
            onToggle={() => toggleComplete(task)}
            onClick={() => onSelectTask(task.id)}
            onTitleChange={(title) => updateTaskTitle(task.id, title)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
