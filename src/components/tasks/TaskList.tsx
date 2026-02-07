import { AnimatePresence } from 'framer-motion'
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
      <div className={cn('space-y-2 px-2', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16 text-gray-400', className)}>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  // Separate top-level tasks from subtasks
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
