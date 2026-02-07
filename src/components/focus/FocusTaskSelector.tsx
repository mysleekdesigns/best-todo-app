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
          'flex w-full items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:border-ring',
          open && 'border-ring ring-1 ring-ring',
        )}
      >
        <span className={cn('flex-1 truncate text-sm', selectedTask ? 'text-foreground' : 'text-muted-foreground')}>
          {selectedTask ? selectedTask.title : 'Select a task to focus on...'}
        </span>
        {selectedTask && (
          <button
            onClick={handleClear}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
        <ChevronDown size={16} className={cn('text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-border bg-card shadow-lg"
          >
            {/* Search */}
            <div className="border-b border-border p-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tasks..."
                  className="h-8 w-full rounded-md border-0 bg-accent pl-8 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
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
                  'flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent/50',
                  !selectedTaskId ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground',
                )}
              >
                No task (free focus)
              </button>

              {filtered?.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleSelect(task)}
                  className={cn(
                    'flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent/50',
                    task.id === selectedTaskId ? 'bg-accent font-medium text-foreground' : 'text-foreground/80',
                  )}
                >
                  <span className="truncate">{task.title}</span>
                </button>
              ))}

              {filtered?.length === 0 && (
                <p className="px-3 py-4 text-center text-sm text-muted-foreground">No tasks found</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
