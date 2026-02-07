import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Calendar, ChevronRight, ListChecks, Repeat } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'
import { TaskCheckbox } from './TaskCheckbox'
import { TagBadge } from './TagBadge'
import { useSubtasks } from '@/db/hooks'
import { useTags, useLists } from '@/db/hooks'

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

  const allTags = useTags()
  const allLists = useLists()
  const taskTags = (allTags ?? []).filter((t) => task.tags.includes(t.id))
  const taskList = task.listId ? (allLists ?? []).find((l) => l.id === task.listId) : null
  const checklistDone = task.checklist.filter((c) => c.done).length
  const checklistTotal = task.checklist.length
  const subtaskCount = subtasks?.length ?? 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: isCompleted ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, x: 40, scale: 0.95, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onClick}
      className={cn(
        'group flex cursor-pointer items-start gap-3 px-4 py-3.5 border-b border-gray-100 last:border-b-0 transition-colors',
        isSelected
          ? 'bg-gray-100 ring-1 ring-gray-300'
          : 'hover:bg-gray-50',
      )}
      style={{ paddingLeft: `${1 + depth * 1.5}rem` }}
      role="listitem"
    >
      <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
        <TaskCheckbox
          checked={isCompleted}
          priority={task.priority}
          onToggle={onToggle}
          className="h-5 w-5"
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
            className="w-full bg-transparent text-sm font-medium leading-snug text-gray-900 outline-none"
          />
        ) : (
          <p
            onDoubleClick={handleDoubleClick}
            className={cn(
              'text-sm font-medium leading-snug text-gray-900',
              isCompleted && 'text-gray-400 line-through',
            )}
          >
            {task.title}
          </p>
        )}

        {/* Metadata row */}
        <div className="mt-0.5 flex items-center gap-3">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(task.dueDate + 'T00:00:00'), 'MMM d')}
              {task.dueTime && ` ${task.dueTime}`}
            </span>
          )}
          {checklistTotal > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <ListChecks className="h-3.5 w-3.5" />
              {checklistDone}/{checklistTotal}
            </span>
          )}
          {subtaskCount > 0 && (
            <span className="text-xs text-gray-500">
              {subtaskCount} subtask{subtaskCount !== 1 && 's'}
            </span>
          )}
          {task.recurringRule && (
            <span className="flex items-center text-xs text-gray-500" title="Recurring task">
              <Repeat className="h-3.5 w-3.5" />
            </span>
          )}
          {taskList && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: taskList.color }}
              />
              {taskList.name}
            </span>
          )}
        </div>
        {taskTags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {taskTags.map((tag) => (
              <TagBadge key={tag.id} name={tag.name} color={tag.color} />
            ))}
          </div>
        )}
      </div>

      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-gray-500" />
    </motion.div>
  )
}
