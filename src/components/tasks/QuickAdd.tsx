import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTaskActions } from '@/hooks/useTaskActions'

interface QuickAddProps {
  projectId?: string | null
  className?: string
}

export function QuickAdd({ projectId, className }: QuickAddProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { addTask } = useTaskActions()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Q or Cmd+N to open quick add
      if (
        (e.key === 'q' && !e.metaKey && !e.ctrlKey && !e.altKey && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) ||
        ((e.metaKey || e.ctrlKey) && e.key === 'n')
      ) {
        e.preventDefault()
        setIsOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = async () => {
    const trimmed = value.trim()
    if (!trimmed) return

    await addTask(trimmed, {
      projectId: projectId ?? null,
      status: 'inbox',
    })

    setValue('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      setValue('')
      setIsOpen(false)
    }
  }

  return (
    <div className={cn('', className)}>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <Plus className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (!value.trim()) setIsOpen(false)
                }}
                placeholder='Add a task... (try "Buy milk tomorrow !2")'
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-gray-100 dark:placeholder-gray-500"
              />
              <span className="text-xs text-gray-300">Enter</span>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-900/50 dark:hover:text-gray-300"
          >
            <Plus className="h-4 w-4" />
            Add Task
            <span className="ml-auto text-xs text-gray-300">Q</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
