import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X, Search } from 'lucide-react'
import { useTasks } from '@/db/hooks'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'

interface FocusTaskSelectorProps {
  selectedTaskId: string | null
  onSelectTask: (id: string | null) => void
}

export function FocusTaskSelector({ selectedTaskId, onSelectTask }: FocusTaskSelectorProps) {
  const tasks = useTasks('active')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedTask = tasks?.find((t) => t.id === selectedTaskId)

  const filtered = tasks?.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()),
  )

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  function handleSelect(task: Task) {
    onSelectTask(task.id)
    setOpen(false)
    setSearch('')
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onSelectTask(null)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Selected task display / trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-gray-300',
          open && 'border-gray-300 ring-1 ring-gray-300',
        )}
      >
        <span className={cn('flex-1 truncate text-sm', selectedTask ? 'text-gray-900' : 'text-gray-400')}>
          {selectedTask ? selectedTask.title : 'Select a task to focus on...'}
        </span>
        {selectedTask && (
          <button
            onClick={handleClear}
            className="rounded p-0.5 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
        <ChevronDown size={16} className={cn('text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            {/* Search */}
            <div className="border-b border-gray-100 p-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tasks..."
                  className="h-8 w-full rounded-md border-0 bg-gray-50 pl-8 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Task list */}
            <div className="max-h-60 overflow-y-auto p-1">
              {/* Taskless option */}
              <button
                onClick={() => {
                  onSelectTask(null)
                  setOpen(false)
                  setSearch('')
                }}
                className={cn(
                  'flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-50',
                  !selectedTaskId ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-500',
                )}
              >
                No task (free focus)
              </button>

              {filtered?.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleSelect(task)}
                  className={cn(
                    'flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-50',
                    task.id === selectedTaskId ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-700',
                  )}
                >
                  <span className="truncate">{task.title}</span>
                </button>
              ))}

              {filtered?.length === 0 && (
                <p className="px-3 py-4 text-center text-sm text-gray-400">No tasks found</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
