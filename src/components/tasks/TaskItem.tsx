import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Calendar, ChevronRight, ListChecks } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'
import { TaskCheckbox } from './TaskCheckbox'
import { useSubtasks } from '@/hooks/useTasks'

const priorityDot: Record<number, string> = {
  0: '',
  1: 'bg-blue-400',
  2: 'bg-yellow-400',
  3: 'bg-red-400',
}

interface TaskItemProps {
  task: Task
  onToggle: () => void
  onClick: () => void
  onTitleChange: (title: string) => void
  isSelected?: boolean
  depth?: number
}

export function TaskItem({
  task,
  onToggle,
  onClick,
  onTitleChange,
  isSelected = false,
  depth = 0,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)
  const subtasks = useSubtasks(task.id)
  const isCompleted = task.status === 'completed'

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditValue(task.title)
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== task.title) {
      onTitleChange(trimmed)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur()
    } else if (e.key === 'Escape') {
      setEditValue(task.title)
      setIsEditing(false)
    }
  }

  const checklistDone = task.checklist.filter((c) => c.done).length
  const checklistTotal = task.checklist.length
  const subtaskCount = subtasks?.length ?? 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: isCompleted ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, x: 20, transition: { duration: 0.3 } }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'group flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition-colors',
        isSelected
          ? 'bg-blue-50 dark:bg-blue-950/30'
          : 'hover:bg-gray-50 dark:hover:bg-gray-900/50',
      )}
      style={{ paddingLeft: `${0.75 + depth * 1.5}rem` }}
      role="listitem"
    >
      <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
        <TaskCheckbox
          checked={isCompleted}
          priority={task.priority}
          onToggle={onToggle}
        />
      </div>

      <div className="min-w-0 flex-1">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none dark:text-gray-100"
          />
        ) : (
          <p
            onDoubleClick={handleDoubleClick}
            className={cn(
              'text-sm font-medium text-gray-900 dark:text-gray-100',
              isCompleted && 'text-gray-400 line-through dark:text-gray-500',
            )}
          >
            {task.priority > 0 && (
              <span className={cn('mr-1.5 inline-block h-2 w-2 rounded-full', priorityDot[task.priority])} />
            )}
            {task.title}
          </p>
        )}

        {/* Metadata row */}
        <div className="mt-0.5 flex items-center gap-2">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="h-3 w-3" />
              {format(new Date(task.dueDate + 'T00:00:00'), 'MMM d')}
              {task.dueTime && ` ${task.dueTime}`}
            </span>
          )}
          {checklistTotal > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <ListChecks className="h-3 w-3" />
              {checklistDone}/{checklistTotal}
            </span>
          )}
          {subtaskCount > 0 && (
            <span className="text-xs text-gray-400">
              {subtaskCount} subtask{subtaskCount !== 1 && 's'}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.div>
  )
}
