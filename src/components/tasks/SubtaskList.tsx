import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Plus, GitBranch } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'
import { TaskCheckbox } from './TaskCheckbox'
import { useTaskActions } from '@/hooks/useTaskActions'

interface SubtaskListProps {
  parentId: string
  subtasks: Task[]
  onAddSubtask: (title: string) => void
  className?: string
}

export function SubtaskList({ subtasks, onAddSubtask, className }: SubtaskListProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { toggleComplete } = useTaskActions()

  const handleAdd = () => {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    onAddSubtask(trimmed)
    setNewTitle('')
    inputRef.current?.focus()
  }

  const completedCount = subtasks.filter((s) => s.status === 'completed').length

  return (
    <div className={cn('', className)}>
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-400"
      >
        <GitBranch className="h-3.5 w-3.5" />
        Subtasks
        {subtasks.length > 0 && (
          <span className="text-gray-300">
            ({completedCount}/{subtasks.length})
          </span>
        )}
        {subtasks.length > 0 && (
          <ChevronDown
            className={cn(
              'h-3 w-3 transition-transform',
              isCollapsed && '-rotate-90',
            )}
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-0.5 overflow-hidden"
          >
            {subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center gap-2 rounded-md px-1 py-1.5"
              >
                <TaskCheckbox
                  checked={subtask.status === 'completed'}
                  priority={subtask.priority}
                  onToggle={() => toggleComplete(subtask)}
                />
                <span
                  className={cn(
                    'flex-1 text-sm text-gray-700 dark:text-gray-300',
                    subtask.status === 'completed' && 'text-gray-400 line-through',
                  )}
                >
                  {subtask.title}
                </span>
              </div>
            ))}

            {/* Add subtask input */}
            <div className="flex items-center gap-2 px-1 py-1">
              <Plus className="h-4 w-4 text-gray-300" />
              <input
                ref={inputRef}
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAdd()
                  }
                }}
                placeholder="Add subtask..."
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-300 outline-none dark:text-gray-300 dark:placeholder-gray-600"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
