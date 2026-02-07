import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { X, Trash2, ListChecks, StickyNote, Tag as TagIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'
import { useTask, useSubtasks } from '@/hooks/useTasks'
import { useTaskActions } from '@/hooks/useTaskActions'
import { TaskCheckbox } from './TaskCheckbox'
import { PrioritySelector } from './PrioritySelector'
import { DueDatePicker } from './DueDatePicker'
import { ChecklistEditor } from './ChecklistEditor'
import { SubtaskList } from './SubtaskList'
import { TagSelector } from './TagSelector'
import { RecurrenceSelector } from './RecurrenceSelector'

interface TaskDetailProps {
  taskId: string | null
  onClose: () => void
  onDelete: (task: Task) => void
}

export function TaskDetail({ taskId, onClose, onDelete }: TaskDetailProps) {
  const task = useTask(taskId)
  const subtasks = useSubtasks(taskId)
  const {
    toggleComplete,
    setTaskPriority,
    setTaskDueDate,
    updateTaskTitle,
    updateTaskNotes,
    addChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
    addSubtask,
    toggleTaskTag,
    setTaskRecurrence,
  } = useTaskActions()

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [notesValue, setNotesValue] = useState('')
  const titleRef = useRef<HTMLInputElement>(null)
  const notesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync local state with task data
  useEffect(() => {
    if (task) {
      setTitleValue(task.title)
      setNotesValue(task.notes)
    }
  }, [task?.id, task?.title, task?.notes])

  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus()
      titleRef.current.select()
    }
  }, [isEditingTitle])

  // Debounce notes save
  const handleNotesChange = (value: string) => {
    setNotesValue(value)
    if (notesTimerRef.current) clearTimeout(notesTimerRef.current)
    notesTimerRef.current = setTimeout(() => {
      if (task) updateTaskNotes(task.id, value)
    }, 500)
  }

  useEffect(() => {
    return () => {
      if (notesTimerRef.current) clearTimeout(notesTimerRef.current)
    }
  }, [])

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
    const trimmed = titleValue.trim()
    if (task && trimmed && trimmed !== task.title) {
      updateTaskTitle(task.id, trimmed)
    }
  }

  return (
    <AnimatePresence>
      {taskId && task && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950"
            role="dialog"
            aria-label="Task details"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <TaskCheckbox
                  checked={task.status === 'completed'}
                  priority={task.priority}
                  onToggle={() => toggleComplete(task)}
                />
                <PrioritySelector
                  value={task.priority}
                  onChange={(p) => setTaskPriority(task.id, p)}
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onDelete(task)}
                  className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                  aria-label="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {/* Title */}
              {isEditingTitle ? (
                <input
                  ref={titleRef}
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleTitleBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') titleRef.current?.blur()
                    if (e.key === 'Escape') {
                      setTitleValue(task.title)
                      setIsEditingTitle(false)
                    }
                  }}
                  className="w-full bg-transparent text-lg font-semibold text-gray-900 outline-none dark:text-gray-100"
                />
              ) : (
                <h2
                  onClick={() => setIsEditingTitle(true)}
                  className={cn(
                    'cursor-text text-lg font-semibold text-gray-900 dark:text-gray-100',
                    task.status === 'completed' && 'text-gray-400 line-through',
                  )}
                >
                  {task.title}
                </h2>
              )}

              {/* Due date */}
              <div className="mt-3">
                <DueDatePicker
                  value={task.dueDate}
                  onChange={(date) => setTaskDueDate(task.id, date)}
                />
              </div>

              {/* Recurrence */}
              <div className="mt-2">
                <RecurrenceSelector
                  value={task.recurringRule}
                  onChange={(rule) => setTaskRecurrence(task.id, rule)}
                />
              </div>

              {/* Tags */}
              <div className="mt-4">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-400">
                  <TagIcon className="h-3.5 w-3.5" />
                  Tags
                </div>
                <TagSelector
                  selectedTagIds={task.tags}
                  onToggleTag={(tagId) => toggleTaskTag(task.id, tagId, task.tags)}
                />
              </div>

              {/* Notes */}
              <div className="mt-6">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-400">
                  <StickyNote className="h-3.5 w-3.5" />
                  Notes
                </div>
                <textarea
                  value={notesValue}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Add notes (supports markdown)..."
                  rows={4}
                  className="w-full resize-none rounded-md border border-gray-100 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 placeholder-gray-300 outline-none transition-colors focus:border-gray-200 focus:bg-white dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-300 dark:placeholder-gray-600 dark:focus:border-gray-700 dark:focus:bg-gray-900"
                />
              </div>

              {/* Checklist */}
              <div className="mt-6">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-400">
                  <ListChecks className="h-3.5 w-3.5" />
                  Checklist
                </div>
                <ChecklistEditor
                  items={task.checklist}
                  onToggle={(itemId) => toggleChecklistItem(task.id, itemId, task.checklist)}
                  onAdd={(text) => addChecklistItem(task.id, text, task.checklist)}
                  onRemove={(itemId) => removeChecklistItem(task.id, itemId, task.checklist)}
                />
              </div>

              {/* Subtasks */}
              <div className="mt-6">
                <SubtaskList
                  parentId={task.id}
                  subtasks={subtasks ?? []}
                  onAddSubtask={(title) => addSubtask(task.id, title)}
                />
              </div>

              {/* Metadata */}
              <div className="mt-8 space-y-1 text-xs text-gray-300 dark:text-gray-600">
                <p>Created {format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}</p>
                <p>Updated {format(new Date(task.updatedAt), 'MMM d, yyyy h:mm a')}</p>
                {task.completedAt && (
                  <p>Completed {format(new Date(task.completedAt), 'MMM d, yyyy h:mm a')}</p>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
