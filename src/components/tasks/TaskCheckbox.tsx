import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Priority } from '@/types'

const priorityColors: Record<Priority, string> = {
  0: 'border-gray-300 dark:border-gray-600',
  1: 'border-blue-400',
  2: 'border-yellow-400',
  3: 'border-red-400',
}

const priorityBg: Record<Priority, string> = {
  0: 'bg-gray-300 dark:bg-gray-600',
  1: 'bg-blue-400',
  2: 'bg-yellow-400',
  3: 'bg-red-400',
}

interface TaskCheckboxProps {
  checked: boolean
  priority: Priority
  onToggle: () => void
  className?: string
}

export function TaskCheckbox({ checked, priority, onToggle, className }: TaskCheckboxProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = () => {
    if (!checked) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 600)
    }
    onToggle()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200',
        checked
          ? `${priorityBg[priority]} border-transparent`
          : `${priorityColors[priority]} hover:bg-gray-100 dark:hover:bg-gray-800`,
        className,
      )}
      aria-label={checked ? 'Mark task as incomplete' : 'Mark task as complete'}
      aria-pressed={checked}
    >
      <AnimatePresence>
        {(checked || isAnimating) && (
          <motion.svg
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="h-3 w-3 text-white"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M2 6l3 3 5-5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  )
}
